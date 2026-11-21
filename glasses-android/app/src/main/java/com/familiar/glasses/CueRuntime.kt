package com.familiar.glasses

import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import java.util.concurrent.CopyOnWriteArraySet

/**
 * On-device session scheduler. Cards are held only in memory and are never uploaded.
 * Foreground service helps Android keep working; actual timing with device sleeping
 * remains an on-device validation item.
 */
object CueRuntime {
    private val main = Handler(Looper.getMainLooper())
    private val observers = CopyOnWriteArraySet<() -> Unit>()
    private var generation = 0
    private var nextTask: Runnable? = null
    private var hideTask: Runnable? = null
    private var tickTask: Runnable? = null

    var label: String = "Sunny (fictional)"
        private set
    var cards: List<CueCard> = DemoCatalog.get("sunny")!!.cards
        private set
    var position: Int = 0
        private set
    var running: Boolean = false
        private set
    var visible: Boolean = false
        private set
    var intervalSeconds: Int = 30
        private set
    private var nextAtMs = 0L

    fun observe(observer: () -> Unit) {
        observers.add(observer)
        notifyObservers()
    }
    fun unobserve(observer: () -> Unit) { observers.remove(observer) }
    private fun notifyObservers() { observers.forEach { it.invoke() } }

    private fun cancelPending() {
        generation++
        nextTask?.let(main::removeCallbacks)
        hideTask?.let(main::removeCallbacks)
        tickTask?.let(main::removeCallbacks)
        nextTask = null
        hideTask = null
        tickTask = null
    }

    fun choosePreset(id: String): Boolean {
        val preset = DemoCatalog.get(id) ?: return false
        cancelPending()
        running = false
        visible = false
        cards = preset.cards
        label = preset.label
        position = 0
        notifyObservers()
        return true
    }

    fun setCustomCards(items: List<CueCard>, name: String = "Phone-selected demo"): Boolean {
        if (items.isEmpty() || items.size > 12 || items.any { !valid(it) }) return false
        cancelPending()
        running = false
        visible = false
        cards = items.toList()
        label = name.take(45)
        position = 0
        notifyObservers()
        return true
    }

    private fun valid(card: CueCard) =
        card.title.isNotBlank() && card.title.length <= 48 &&
        card.body.isNotBlank() && card.body.length <= 120

    fun begin(seconds: Int): Boolean {
        if (seconds !in listOf(10, 30, 60, 120) || cards.isEmpty()) return false
        cancelPending()
        intervalSeconds = seconds
        position = 0
        running = true
        visible = false
        val token = generation
        scheduleShow(token, seconds * 1000L)
        startTick(token)
        notifyObservers()
        return true
    }

    private fun scheduleShow(token: Int, delayMs: Long) {
        nextAtMs = SystemClock.uptimeMillis() + delayMs
        nextTask = Runnable {
            if (token != generation || !running) return@Runnable
            visible = true
            notifyObservers()
            hideTask = Runnable {
                if (token != generation || !running) return@Runnable
                visible = false
                notifyObservers()
                if (position + 1 >= cards.size) {
                    running = false
                    nextAtMs = 0
                    tickTask?.let(main::removeCallbacks)
                    notifyObservers()
                }
            }
            main.postDelayed(hideTask!!, 7000L)
            if (position + 1 < cards.size) {
                nextTask = Runnable {
                    if (token != generation || !running) return@Runnable
                    position++
                    scheduleShow(token, 0L)
                }
                nextAtMs = SystemClock.uptimeMillis() + intervalSeconds * 1000L
                main.postDelayed(nextTask!!, intervalSeconds * 1000L)
            }
        }
        main.postDelayed(nextTask!!, delayMs)
    }

    private fun startTick(token: Int) {
        tickTask = object : Runnable {
            override fun run() {
                if (token != generation || !running) return
                notifyObservers()
                main.postDelayed(this, 1000L)
            }
        }
        main.postDelayed(tickTask!!, 1000L)
    }

    fun stop() {
        cancelPending()
        running = false
        visible = false
        nextAtMs = 0L
        notifyObservers()
    }

    /** Manual touchpad navigation pauses automatic scheduling. */
    fun manualMove(delta: Int) {
        cancelPending()
        running = false
        nextAtMs = 0L
        position = (position + delta + cards.size) % cards.size
        visible = true
        notifyObservers()
    }

    fun clear() {
        stop()
    }

    fun countdownSeconds(): Int? {
        if (!running || nextAtMs == 0L || visible) return null
        return ((nextAtMs - SystemClock.uptimeMillis()).coerceAtLeast(0) + 999L).div(1000L).toInt()
    }

    fun currentCard(): CueCard? = if (visible) cards.getOrNull(position) else null
}
