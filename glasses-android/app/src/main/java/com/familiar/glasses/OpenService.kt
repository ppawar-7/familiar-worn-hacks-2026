package com.familiar.glasses

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.view.accessibility.AccessibilityEvent

/**
 * Optional boot helper from the supplied M6 template. Not enabled automatically.
 * Does not inspect or act on accessibility events.
 */
class OpenService : AccessibilityService() {
    override fun onServiceConnected() {
        startForegroundService(Intent(this, KeepAliveService::class.java))
    }
    override fun onAccessibilityEvent(event: AccessibilityEvent?) {}
    override fun onInterrupt() {}
}
