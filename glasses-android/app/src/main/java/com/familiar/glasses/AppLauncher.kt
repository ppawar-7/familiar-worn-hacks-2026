package com.familiar.glasses

import android.content.Context
import android.content.Intent
import java.lang.ref.WeakReference

object AppLauncher {
    var current: WeakReference<MainActivity>? = null
    fun open(context: Context, modeId: String = "sunny") {
        context.startActivity(Intent(context, MainActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            .putExtra("familiar_mode", modeId))
    }
    fun close() { current?.get()?.runOnUiThread { current?.get()?.finish() } }
}
