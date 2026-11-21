# FAMILIAR

**Looks Familiar. Sounds Familiar. Feels Familiar.**

FAMILIAR is a hackathon project about staying present, remembering context, and getting discreet prompts when they're useful.

## Our three features

1. **Proximity Alerts** — teammate-led demonstration of simulated phone-distraction and distance alerts; not a real-world safety system.
2. **Conversation Starter** — search and save notes about people, then view reminders and follow-up ideas.
3. **Social Navigator** — select from eight situations, including networking and first dates, for optional conversation cues.

**[Open FAMILIAR's hosted phone demo](https://familiar-familiar6.vercel.app/social.html)** (Vercel team login may be required).

**[What we've built and how the teammate can use it](docs/SOCIAL_FEATURES.md)** — feature-by-feature status, where the code lives, browser limitations, and the hardware integration checklist.

## A new hands-free-style demo: timed cues

In Conversation Starter or Social Navigator:

1. Choose a person or a social situation.
2. Choose **10 seconds, 30 seconds, 1 minute, or 2 minutes** between cards.
3. Press **Start automatic preview**.
4. The browser shows each card for **7 seconds** and then clears it. It finishes after the last card, or you can stop it sooner.

This solves manual card switching *in the browser demo while the tab remains open and visible*. It **does not** yet solve real locked-phone hands-free delivery. Mobile browsers can suspend timers when backgrounded or the phone is locked. Real glasses delivery still requires verified official device APIs and a supported background/native runtime.

## Native M6 glasses app — source added, on-device test still required

**[Open the Android glasses code and installation checklist](glasses-android/README.md)**

The team-supplied M6 Android 9 starter template is now adapted into a separate native FAMILIAR app at `glasses-android/`. It includes a green-on-black display, Sunny demo memories, social navigator presets, an **on-glasses automatic timer**, touchpad handlers, and a separate Wi-Fi phone remote hosted on the device. GitHub Actions is configured to build a test APK.

- **Phone (hosted demo):** stores browser-local profiles and previews short cards. Not yet synced to the native app.
- **Phone (M6 local remote):** after installing the glasses APK, open `http://<glasses-ip>:8080` while both devices are on a **private hotspot**. A code displayed on the glasses authorizes demo controls. HTTP is **not encrypted**; use fictional/test details only.
- **Glasses (new native code):** schedules timed cards without asking the phone browser to stay open. Real background persistence and display behavior still require testing on the glasses.
- **Camera experiment:** opt-in Android Camera1 **face-presence** detection, followed by wearer confirmation of fictional Sunny. **It cannot recognize identities automatically.** The camera API may be unavailable on the real firmware.

**No real M6 installation, touchpad, camera, or background timing has been verified yet.**

Browser profiles are manually entered and stored only on that device. **The source repository is public; never add real private profiles or photographs to the repo.** Save only details you have permission to keep.

## For teammates

- UI: `social.html`, `src/social.css`
- Profiles, controls, timing runner: `src/social-app.js`
- Conversation and situation prompts: `src/core/social-cues.js`
- Deterministic cue schedule: `src/core/cue-timing.js`
- Generic message contract and adapter: `src/hardware/display-contract.js`, `src/hardware/display-events.js`, `src/hardware/display-adapter.js`
- Tests: `npm test` (Node.js). GitHub Actions also runs the tests when changes are pushed.

To connect real glasses, first confirm the exact model and SDK, get a simple text message onto the physical display, and only then connect the verified SDK to FAMILIAR's show/clear messages. Do not assume buttons, camera access, or reliable background delivery.
