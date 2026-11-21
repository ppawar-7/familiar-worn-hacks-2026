package com.familiar.glasses

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.view.KeyEvent
import android.widget.TextView
import java.lang.ref.WeakReference
import java.net.Inet4Address
import java.net.NetworkInterface

/**
 * Display and touchpad inputs for the M6 template's 640x480 layout.
 * Key mapping is sourced from the supplied template; verify on the real unit.
 */
class MainActivity : Activity() {
    companion object {
        private const val CAMERA_REQUEST = 52
        @Volatile var isVisible = false
            private set
    }
    private lateinit var titleView: TextView
    private lateinit var modeView: TextView
    private lateinit var detailsView: TextView
    private lateinit var statusView: TextView
    private lateinit var helpView: TextView

    private val modes = DemoCatalog.presets.map { it.id } + "camera"
    private var selectedMode = 0
    private var cameraStatus = "Camera test not started"
    private lateinit var camera: CameraPresence
    private val repaint: () -> Unit = { runOnUiThread { render() } }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        titleView = findViewById(R.id.title)
        modeView = findViewById(R.id.mode)
        detailsView = findViewById(R.id.details)
        statusView = findViewById(R.id.status)
        helpView = findViewById(R.id.help)
        camera = CameraPresence { message ->
            runOnUiThread { cameraStatus = message; render() }
        }
        startForegroundService(Intent(this, KeepAliveService::class.java))
    }

    override fun onResume() {
        super.onResume()
        isVisible = true
        AppLauncher.current = WeakReference(this)
        CueRuntime.observe(repaint)
        render()
    }

    override fun onPause() {
        isVisible = false
        camera.stop() // never capture while app is in background
        CueRuntime.unobserve(repaint)
        super.onPause()
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        render()
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {
        when (keyCode) {
            KeyEvent.KEYCODE_F12 -> {
                camera.stop()
                finish()
                return true
            }
            KeyEvent.KEYCODE_DPAD_LEFT, KeyEvent.KEYCODE_DPAD_RIGHT -> {
                val delta = if (keyCode == KeyEvent.KEYCODE_DPAD_RIGHT) 1 else -1
                if (camera.active) {
                    camera.stop()
                    cameraStatus = "Camera test stopped"
                }
                if (CueRuntime.running || CueRuntime.visible) {
                    CueRuntime.manualMove(delta)
                } else {
                    selectedMode = (selectedMode + delta + modes.size) % modes.size
                    if (modes[selectedMode] != "camera") CueRuntime.choosePreset(modes[selectedMode])
                }
                render()
                return true
            }
            KeyEvent.KEYCODE_ENTER, KeyEvent.KEYCODE_DPAD_CENTER -> {
                val mode = modes[selectedMode]
                if (mode == "camera") {
                    if (camera.active && camera.facePresent) {
                        // Wearer confirms the FICTIONAL example; no automated recognition.
                        camera.stop()
                        cameraStatus = "Fictional Sunny selected manually"
                        selectedMode = modes.indexOf("sunny")
                        CueRuntime.choosePreset("sunny")
                        CueRuntime.manualMove(0)
                    } else if (camera.active) {
                        camera.stop()
                        cameraStatus = "Camera test stopped"
                    } else if (checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                        requestPermissions(arrayOf(Manifest.permission.CAMERA), CAMERA_REQUEST)
                    } else {
                        cameraStatus = camera.start()
                    }
                } else {
                    if (CueRuntime.running || CueRuntime.visible) CueRuntime.stop()
                    else {
                        CueRuntime.choosePreset(mode)
                        CueRuntime.begin(30)
                    }
                }
                render()
                return true
            }
        }
        return super.onKeyDown(keyCode, event)
    }

    override fun onRequestPermissionsResult(requestCode: Int,
        permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == CAMERA_REQUEST) {
            cameraStatus = if (grantResults.firstOrNull() == PackageManager.PERMISSION_GRANTED)
                camera.start() else "Camera permission denied"
            render()
        }
    }

    private fun render() {
        if (!::titleView.isInitialized) return
        if (modes[selectedMode] == "camera") {
            modeView.text = "OPT-IN CAMERA CHECK · EXPERIMENT"
            titleView.text = if (camera.active) "FACE PRESENCE" else "CAMERA TEST"
            detailsView.text = cameraStatus + "\\n\\n" +
                if (camera.facePresent) "IDENTITY UNKNOWN. Tap ONLY if you confirm the person is fictional Sunny."
                else "A face is not an identity. No identity recognition is active."
            statusView.text = "No photos or face profiles saved"
        } else {
            modeView.text = CueRuntime.label
            val card = CueRuntime.currentCard()
            titleView.text = card?.title ?: if (CueRuntime.running) "LISTEN & CONNECT" else "READY"
            detailsView.text = card?.body ?: if (CueRuntime.running)
                "A short cue will appear soon" else
                "Tap to begin 30-second cues.\nChoose a mode with swipes."
            statusView.text = if (CueRuntime.running)
                "AUTO · " + (CueRuntime.position + 1) + "/" + CueRuntime.cards.size +
                    " · " + (CueRuntime.countdownSeconds()?.let { "next in " + it + "s" } ?: "cue visible")
            else "OFF · " + CueRuntime.cards.size + " cards available"
        }
        val ip = wifiAddress()
        helpView.text = "← / → options or cards · TAP run/stop · DOUBLE TAP exit\n" +
            if (ip != null) "Phone: http://" + ip + ":8080   Code: " + Pairing.code
            else "Phone remote: connect glasses to Wi-Fi"
    }

    private fun wifiAddress(): String? = try {
        NetworkInterface.getNetworkInterfaces().toList()
            .filter { it.isUp && !it.isLoopback }
            .flatMap { it.inetAddresses.toList() }
            .firstOrNull { it is Inet4Address }
            ?.hostAddress
    } catch (_: Exception) { null }
}
