package com.familiar.glasses

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.util.Log

/** Foreground service keeps an optional local phone remote available. */
class KeepAliveService : Service() {
    private var server: ControlServer? = null

    override fun onCreate() {
        super.onCreate()
        val manager = getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(NotificationChannel(
            "familiar_session", "FAMILIAR session", NotificationManager.IMPORTANCE_MIN))
        val notification = Notification.Builder(this, "familiar_session")
            .setContentTitle("FAMILIAR demo ready")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .build()
        startForeground(1, notification)
        server = ControlServer(applicationContext, Config.REMOTE_PORT).also { it.start() }
        Log.i("FAMILIAR", "Foreground service started (no profile data in logs)")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int) = START_STICKY
    override fun onDestroy() {
        server?.shutdown()
        CueRuntime.stop()
        super.onDestroy()
    }
    override fun onBind(intent: Intent?): IBinder? = null
}
