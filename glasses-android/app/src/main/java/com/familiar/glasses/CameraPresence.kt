package com.familiar.glasses

import android.graphics.SurfaceTexture
import android.hardware.Camera

/**
 * OPTIONAL, wearer-started Camera1 face-presence experiment.
 * A detected face is NOT an identity; this class NEVER names the person.
 * No photographs, images, or biometric templates are saved.
 * Works only if the specific M6 firmware exposes Camera1 face detection.
 */
@Suppress("DEPRECATION")
class CameraPresence(private val onUpdate: (String) -> Unit) {
    private var camera: Camera? = null
    private var texture: SurfaceTexture? = null
    var active = false
        private set
    var facePresent = false
        private set
    private var lastCount = -1

    fun start(): String {
        if (active) return "Camera check already running"
        return try {
            val device = Camera.open() ?: return "Camera is unavailable"
            camera = device
            val supported = device.parameters.maxNumDetectedFaces
            if (supported < 1) {
                stop()
                "Camera opened, but face detection is not supported"
            } else {
                texture = SurfaceTexture(15)
                device.setPreviewTexture(texture)
                device.setFaceDetectionListener { faces, _ ->
                    facePresent = faces.isNotEmpty()
                    if (faces.size != lastCount) {
                        lastCount = faces.size
                        onUpdate(if (faces.isEmpty()) "No face detected" else
                            "Face present (" + faces.size + "); identity UNKNOWN")
                    }
                }
                device.startPreview()
                device.startFaceDetection()
                active = true
                lastCount = -1
                "Face-presence test ON. Identity not known"
            }
        } catch (error: Exception) {
            stop()
            "Camera face detection unavailable: " + error.javaClass.simpleName
        }
    }

    fun stop() {
        val device = camera
        camera = null
        active = false
        facePresent = false
        try { device?.stopFaceDetection() } catch (_: Exception) {}
        try { device?.stopPreview() } catch (_: Exception) {}
        try { device?.release() } catch (_: Exception) {}
        try { texture?.release() } catch (_: Exception) {}
        texture = null
        lastCount = -1
    }
}
