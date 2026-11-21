package com.familiar.glasses

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import org.json.JSONArray
import org.json.JSONObject
import java.io.InputStream
import java.net.InetSocketAddress
import java.net.ServerSocket
import java.net.Socket
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

/**
 * Same-origin HTTP remote to use on a TRUSTED PRIVATE HOTSPOT WITH DEMO DATA.
 *
 * This is intentionally NOT wired to the public HTTPS Vercel app, and it does
 * NOT use wildcard CORS. HTTP is unencrypted; no real personal/biometric data
 * should be sent until an authenticated encrypted transport is implemented.
 */
class ControlServer(private val context: Context, private val port: Int) : Thread("FamiliarRemote") {
    private var serverSocket: ServerSocket? = null
    private val ui = Handler(Looper.getMainLooper())
    private var failed = 0
    private var failureWindow = System.currentTimeMillis()

    data class Reply(val code: Int, val body: String, val type: String = "application/json; charset=utf-8")

    override fun run() {
        try {
            val socket = ServerSocket().apply {
                reuseAddress = true
                bind(InetSocketAddress(port))
                soTimeout = 0
            }
            serverSocket = socket
            Log.i("FAMILIAR", "Optional demo remote listening (auth required)")
            while (!isInterrupted) {
                val client = socket.accept()
                client.use { handle(it) }
            }
        } catch (error: Exception) {
            Log.w("FAMILIAR", "Remote closed: " + error.javaClass.simpleName)
        }
    }

    private fun readLine(stream: InputStream): String? {
        val out = StringBuilder()
        while (out.length < 4096) {
            val b = stream.read()
            if (b == -1) return if (out.isEmpty()) null else out.toString()
            if (b == 10) return out.toString().trimEnd('\r')
            if (b !in 0..127) throw IllegalArgumentException("Non-ASCII header")
            out.append(b.toChar())
        }
        throw IllegalArgumentException("Header too long")
    }

    private fun handle(client: Socket) {
        try {
            client.soTimeout = 4000
            val input = client.getInputStream()
            val request = readLine(input) ?: return
            val parts = request.split(" ")
            if (parts.size < 2) return
            val method = parts[0]
            val path = parts[1].substringBefore('?')
            val headers = mutableMapOf<String, String>()
            var endedHeaders = false
            for (i in 0 until 40) {
                val header = readLine(input) ?: throw IllegalArgumentException("Bad request")
                if (header.isEmpty()) {
                    endedHeaders = true
                    break
                }
                val colon = header.indexOf(':')
                if (colon > 0) headers[header.substring(0,colon).trim().lowercase()] =
                    header.substring(colon+1).trim()
            }
            if (!endedHeaders) throw IllegalArgumentException("Too many headers")
            val length = headers["content-length"]?.toIntOrNull() ?: 0
            if (length !in 0..8192) {
                write(client, Reply(413, "{\"ok\":false,\"error\":\"request too large\"}"))
                return
            }
            val payload = ByteArray(length)
            var count = 0
            while (count < length) {
                val got = input.read(payload, count, length - count)
                if (got < 0) throw IllegalArgumentException("Truncated request")
                count += got
            }
            write(client, route(method,path,headers,String(payload, Charsets.UTF_8)))
        } catch (error: Exception) {
            try { write(client, Reply(400, "{\"ok\":false,\"error\":\"invalid request\"}")) } catch (_: Exception) {}
        }
    }

    private fun route(method: String, path: String, headers: Map<String,String>, body: String): Reply {
        if (method == "GET" && path == "/") {
            val html = context.assets.open("remote.html").bufferedReader().use { it.readText() }
            return Reply(200, html, "text/html; charset=utf-8")
        }
        if (method == "GET" && path == "/ping") return ok(JSONObject().put("ok",true).put("name","FAMILIAR M6 demo"))
        if (method == "OPTIONS") return Reply(403, "{\"ok\":false}")
        if (method != "GET" && method != "POST") return Reply(405,"{\"ok\":false}")
        if (path !in listOf("/api/status","/api/start","/api/session","/api/stop",
                "/api/next","/api/previous","/api/clear")) return Reply(404,"{\"ok\":false}")

        val now = System.currentTimeMillis()
        if (now - failureWindow > 60_000) { failed = 0; failureWindow = now }
        if (failed >= 5) return Reply(429, "{\"ok\":false,\"error\":\"try again in a minute\"}")
        val secret = headers["x-familiar-key"]
        if (secret != Pairing.code) {
            failed++
            return Reply(401, "{\"ok\":false,\"error\":\"check code on glasses\"}")
        }
        if (method == "POST" && !headers.getOrDefault("content-type","").startsWith("application/json"))
            return Reply(415, "{\"ok\":false,\"error\":\"JSON required\"}")

        // Reject cross-origin POST. All phone controls are served from this device.
        val origin = headers["origin"]
        val host = headers["host"] ?: ""
        if (origin != null && origin != "http://" + host)
            return Reply(403, "{\"ok\":false,\"error\":\"origin denied\"}")

        return try {
            when (path) {
                "/api/status" -> {
                    if (method != "GET") Reply(405, "{\"ok\":false}") else {
                        val state = JSONObject()
                            .put("ok",true).put("label", CueRuntime.label)
                            .put("running", CueRuntime.running).put("visible", CueRuntime.visible)
                            .put("index", CueRuntime.position).put("count", CueRuntime.cards.size)
                        ok(state)
                    }
                }
                "/api/start" -> {
                    val obj = JSONObject(body)
                    val id = obj.optString("id","sunny")
                    val seconds = obj.optInt("seconds",30)
                    val success = onUi {
                        CueRuntime.choosePreset(id) && CueRuntime.begin(seconds)
                    }
                    if (success) {
                        onUi { AppLauncher.open(context, id); true }
                        ok(JSONObject().put("ok",true))
                    } else Reply(422, "{\"ok\":false,\"error\":\"invalid preset or interval\"}")
                }
                "/api/session" -> {
                    val obj = JSONObject(body)
                    val seconds = obj.optInt("seconds",30)
                    val cardsJson = obj.optJSONArray("cards") ?: JSONArray()
                    if (cardsJson.length() !in 1..12 || seconds !in listOf(10,30,60,120))
                        return Reply(422, "{\"ok\":false,\"error\":\"invalid cards or interval\"}")
                    val cards = (0 until cardsJson.length()).map {
                        val item = cardsJson.getJSONObject(it)
                        CueCard(item.optString("title","").trim(),item.optString("body","").trim())
                    }
                    val success = onUi {
                        CueRuntime.setCustomCards(cards,"Phone-selected DEMO") && CueRuntime.begin(seconds)
                    }
                    if (success) {
                        onUi { AppLauncher.open(context, "sunny"); true }
                        ok(JSONObject().put("ok",true))
                    } else Reply(422, "{\"ok\":false,\"error\":\"invalid demo card\"}")
                }
                "/api/stop", "/api/clear" -> { onUi { CueRuntime.stop(); true }; ok(JSONObject().put("ok",true)) }
                "/api/next" -> { onUi { CueRuntime.manualMove(1); true }; ok(JSONObject().put("ok",true)) }
                "/api/previous" -> { onUi { CueRuntime.manualMove(-1); true }; ok(JSONObject().put("ok",true)) }
                else -> Reply(404,"{\"ok\":false}")
            }
        } catch (_: Exception) {
            Reply(400, "{\"ok\":false,\"error\":\"invalid JSON\"}")
        }
    }

    private fun onUi(action: () -> Boolean): Boolean {
        var answer = false
        val done = CountDownLatch(1)
        ui.post {
            try { answer = action() } finally { done.countDown() }
        }
        if (!done.await(3,TimeUnit.SECONDS)) throw IllegalStateException("UI busy")
        return answer
    }

    private fun ok(json: JSONObject) = Reply(200,json.toString())
    private fun write(client: Socket, reply: Reply) {
        val data = reply.body.toByteArray(Charsets.UTF_8)
        val reason = when (reply.code) {
            200 -> "OK"; 400 -> "Bad Request"; 401 -> "Unauthorized"; 403 -> "Forbidden"
            404 -> "Not Found"; 405 -> "Method Not Allowed"; 413 -> "Payload Too Large"
            415 -> "Unsupported Media Type"; 422 -> "Unprocessable Entity"
            429 -> "Too Many Requests"; else -> "Error"
        }
        val header = "HTTP/1.1 " + reply.code + " " + reason + "\r\n" +
            "Content-Type: " + reply.type + "\r\n" +
            "Content-Length: " + data.size + "\r\n" +
            "Cache-Control: no-store\r\n" +
            "X-Content-Type-Options: nosniff\r\n" +
            "Referrer-Policy: no-referrer\r\n" +
            "X-Frame-Options: DENY\r\n" +
            "Connection: close\r\n\r\n"
        client.getOutputStream().apply {
            write(header.toByteArray(Charsets.US_ASCII)); write(data); flush()
        }
    }
    fun shutdown() { interrupt(); try { serverSocket?.close() } catch (_: Exception) {} }
}
