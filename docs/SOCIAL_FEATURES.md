# Conversation Starter + Social Navigator — team handoff

**Team:** FAMILIAR  
**Theme:** Looks Familiar. Sounds Familiar. Feels Familiar.  
**Current milestone:** Working **phone/browser prototype**, deployed to Vercel. **Not yet verified on the event glasses.**

This document describes code that is already in the repository, and makes the work easy for teammates to reuse.

## Conversation Starter — implemented

- Create, edit, delete, select, and search profiles saved **manually** by the wearer.
- Store each person's **name/nickname, relationship, where you met, background, interests, last topic, and a reminder for next time**.
- Choose a relationship type: new connection, friend, colleague, mentor, date, or other.
- Save profiles in **browser localStorage**, with migration from the earlier v1 single-person and v2 multiple-person records. There is **no shared database, login, cross-device sync, or cloud backup**.
- Try a clearly **fictional Sunny example**: Worn Hacks, computer-science graduate student, interested in AI and smart glasses.
- Turn saved details into short ordered reminder cards. Leave out empty fields; show general conversation prompts when no profile is selected.
- Preview a card with previous / next / hide controls. A user chooses the person; the app **does not recognize faces or identify people**.

**Code:** `social.html` (UI), `src/social-app.js` (profile storage and interactions), `src/core/social-cues.js` (memory-card logic).

## Social Navigator — implemented

Eight manually selected social moments with short, optional prompts:

1. Meeting someone new
2. Joining a group
3. Networking event — genuine introductions, shared interests, and permission before follow-up
4. Dating / first date — curiosity, mutual conversation, comfort, boundaries, and clear communication
5. Job interview
6. Keeping a conversation going
7. Reconnecting with someone
8. Leaving politely

Each situation has multiple short prompts, shown **one card at a time**. The browser does **not** listen to conversations, read emotions, or choose situations automatically.

**Code:** `src/core/social-cues.js` and `src/social-app.js`.

## Mobile interface — implemented

- Responsive phone-first layout, mobile bottom feature navigation, large touch targets.
- Searchable profile list and mobile form.
- Green monochrome **simulation** of one glasses text card.
- Browser preview preferences for text size, position, and font. **These do not represent verified glasses display capabilities.**
- No API keys, paid services, face recognition, microphone, camera, or model calls required.

**Code:** `social.html`, `src/social.css`.

## Browser display handoff — implemented as a software contract

- `src/hardware/display-contract.js` formats a validated packet: `feature`, `title`, `body`, `visible`, `cardIndex`, `cardCount`, and `actions`.
- `src/hardware/display-events.js` publishes local messages to the browser and accepts `previous`, `next`, `dismiss` events.
- `src/hardware/display-adapter.js` provides generic callback hooks for a future **verified official SDK**.
- **No physical glasses display, transport, buttons, camera, microphone, or recognition flow has been verified for these modules.**
- Browser events are limited to the current page/runtime; they are **not** a remote phone-to-glasses connection.

**Tests:** `tests/social-cues.test.mjs`, `tests/display-events.test.mjs`, and `tests/display-adapter.test.mjs` cover the logic and contract.

## Where the prototype lives

- GitHub: https://github.com/ppawar-7/familiar-worn-hacks-2026
- Vercel (team-login protected): https://familiar-familiar6.vercel.app/social.html
- The repository is **public** by team choice. **Never commit real personal profiles or photographs.** Saved browser profiles do not get added to GitHub.

## Automatic cue preview — implemented in browser, not yet on glasses

- Select a person in Conversation Starter or a situation in Social Navigator.
- Choose an interval of **10 seconds (quick demo), 30 seconds, 1 minute, or 2 minutes**.
- Press **Start automatic preview** once. The browser preview clears, then shows each saved card at the selected interval for **7 seconds**, then clears it again.
- The finite sequence ends after each card has been shown once. Users can stop early, or use manual Back / Next / Hide controls.
- Changing the selected person, feature, or situation stops the old sequence.
- Hiding/locking the browser page stops the demo rather than implying a background service. Timed cards are **not automatically projected to the glasses**.
- The display packet format is unchanged, so the teammate can eventually connect the same show and clear events to a **verified on-device SDK**.

**Code:** `src/core/cue-timing.js` (pure schedule), `src/social-app.js` (browser scheduling), `social.html` and `src/social.css` (controls), `tests/cue-timing.test.mjs` (schedule tests).

## Native M6 Android app — built and APK compiled, physical testing pending

The new `glasses-android/` directory contains actual native Android code adapted from the supplied M6 / Android 9 app template:

- Green monochrome text layout for the template's 640×480 display.
- Device-side cue timer; intervals of 10/30/60/120 seconds, seven-second card visibility.
- Fictional Sunny cards and Social Navigator situations, including networking and dating, usable without keeping the phone browser open.
- M6-template touchpad key handlers for swipe / tap / double-tap, **not yet verified on the physical glasses**.
- Foreground service and optional accessibility boot helper; no device settings changed by the team-building tools.
- Optional same-origin phone remote served by the glasses at `http://<glasses-ip>:8081`, protected by a random code displayed on the glasses. **HTTP is not encrypted: use fictional/test data on a trusted private hotspot only.** The hosted HTTPS Vercel app does not connect directly to this remote.
- Optional opt-in Android camera face-presence experiment. A face callback indicates only that a face is in view, **not who it is**. Showing fictional Sunny's memory after detection requires **explicit wearer confirmation**. Automatic face identification is NOT implemented.
- GitHub Actions workflow builds an APK; a successful run provides the downloadable `FAMILIAR-M6-debug-apk` artifact.

**Code and team installation checklist:** [glasses-android/README.md](../glasses-android/README.md).

**Android build verified in GitHub Actions:** [successful APK build](https://github.com/ppawar-7/familiar-worn-hacks-2026/actions/runs/44933633472).

## Remaining physical-device milestones

- Install the Android APK on the team's single M6 pair via the confirmed MLDemo/ADB method.
- Verify text legibility, actual touchpad key codes, on-glasses timer continuity and app foreground behavior.
- Verify Camera1 preview / face-presence callback support. **Do not imply person recognition** from generic face detection.
- If automatic person identity is truly needed, implement a separate consent-based enrollment + reliable on-device matching pipeline with an unknown-person fallback and encrypted data storage, after verifying camera access and getting participants' consent.
- Replace demo HTTP with a genuinely encrypted/authenticated transport before any real private profiles are transferred.

**Current status: native code built and APK compiled; no on-device installation or hardware functionality has been independently verified.**
