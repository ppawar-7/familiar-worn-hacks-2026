# FAMILIAR — native M6 glasses demo

This is the **Android glasses app source**, built from the provided `GlassesAppTemplate.zip` structure for the team's reported **M6 / Android 9** glasses. The project is separate from the hosted phone/browser demo. It has **not been installed or tested on your actual glasses yet**.

## What is implemented in code

- **Green-on-black glasses UI** based on the template's 640×480 screen layout.
- **Conversation Starter:** fictional Sunny memory cards. Five fields, including where you met, interests and what to ask next.
- **Social Navigator:** nine self-contained modes (meeting, joining, networking, dating, interview, reconnect, continuing, leaving).
- **Automatic cue sessions on the glasses:** every 10, 30, 60 or 120 seconds. Each card is visible for seven seconds before clearing. The default touchpad-initiated session uses 30 seconds.
- **Touchpad:** left/right to choose modes or browse cards; tap to start/stop; double tap to exit. This follows the supplied template's claimed key events. Test on the actual unit.
- **Phone remote:** an HTTP page hosted **on the glasses**, on the same Wi-Fi/hotspot. Start a preset or send a few fictional memory cards. This is not the Vercel web app.
- **Pairing code:** random 12-character code shown on the glasses; required for all remote commands. No wildcard CORS, request size limits and basic failed-attempt throttling.
- **Optional camera experiment:** manually initiated Camera1 face-presence detection. Only reports face count when the firmware exposes the feature. **It does not identify a person or recognize Sunny.** No photos are saved.
- **Optional background service / boot helper** derived from the provided template. It must be explicitly enabled by the team and verified on-device.

## Get the APK — no local build required

1. Go to the [GitHub Actions tab](https://github.com/ppawar-7/familiar-worn-hacks-2026/actions).
2. Open a successful **Build FAMILIAR M6 Android APK** run.
3. Download the **FAMILIAR-M6-debug-apk** artifact. It contains the `app-debug.apk` file.
4. The teammate with the one pair of glasses must install the APK using MLDemo/ADB, then test text display and touchpad input.

**Important:** If this GitHub Actions build fails, no APK is available yet. A successful compile also **does not prove** the app works on the actual M6 device.

## First physical test checklist

- Confirm glasses are actually Android 9 and support sideloading/debugging with MLDemo.
- Confirm the app launches and displays green text on a black/transparent background.
- Test right/left swipe, tap and double tap. Record the true key codes via ADB if different.
- Start the Sunny timed session. Confirm the first card appears, disappears after seven seconds and the next card appears later. Test with the glasses display awake and then with the app backgrounded.
- Verify whether the foreground service and optional accessibility boot helper are allowed on the firmware. **Do not enable accessibility or battery-exemption settings without the device owner's approval.**
- Optional camera check: explicitly grant camera permission, start the presence test and verify whether the firmware actually supports Android's face detection callbacks.
- Use a **private phone hotspot** for the phone remote; some venue Wi-Fi networks block peer connections.

## Try the phone remote

With the glasses installed, running, and on the same **private hotspot** as your phone:

1. Read the `http://<glasses-ip>:8080` address from the glasses.
2. Type that **HTTP** address into the phone browser. Do **not** use the public Vercel site for hardware commands.
3. Enter the 12-character code displayed on the glasses.
4. Choose Sunny, Networking, or Dating; choose a timer; press **Start on glasses**.
5. You can use the fictional memory editor to send temporary custom cards. They are **not saved**, and no photos or face data are transmitted.

**Security boundary:** The remote uses **HTTP, not HTTPS**. A pairing code restricts requests but **does not encrypt traffic**. Use only fictional/test data on a private hotspot. Never send real private profile details over this connection. A production system needs HTTPS or a properly authenticated encrypted transport.

## About camera recognition

The native code includes a **face presence** experiment, not identity recognition. Android's `Camera.FaceDetectionListener` reports face rectangles/count, not names. Treating any face as Sunny would be wrong.

For **opt-in person recognition** in a later revision, we would need:
- A verified camera API on the M6 unit;
- Consent-based enrollment of known people and a local encrypted gallery of face embeddings;
- A tested recognition model with calibrated confidence thresholds, plus an **unknown person** default;
- Explicit user controls and deletion, with a strong opt-in disclosure;
- Privacy testing and a clear policy for where recognition is allowed.

Until then, the wearer selects Sunny or another *fictional* profile manually. No automatic identity is claimed.

## Source overview

- `DemoCatalog.kt` — fictional memory cards and social scenarios.
- `CueRuntime.kt` — glasses-side timed card scheduler.
- `MainActivity.kt`, `res/layout/activity_main.xml` — green display and touchpad controls.
- `CameraPresence.kt` — opt-in face presence probe only.
- `ControlServer.kt`, `Pairing.kt`, `assets/remote.html` — same-origin phone remote.
- `KeepAliveService.kt`, `OpenService.kt` — foreground/background hooks from the M6 template.

The same profile/prompt *concept* exists in `src/core/social-cues.js` for the hosted phone app, but there is **no automatic cloud sync**. The on-glasses presets are deliberately duplicated to work entirely offline.

## Build locally only if your glasses teammate wants to

In Android Studio, open `glasses-android` and build/run the `app` module using Android SDK 34, JDK 21 and Gradle 9.8.2. No npm/API keys or paid services are required. The APK package is `com.familiar.glasses`.

The supplied M6 template's advanced boot setup modifies secure accessibility settings and battery saving exemptions. Those operations have **not been run** here. Do not run the template setup script blindly; review its effects first.
