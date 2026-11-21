# FAMILIAR — fastest truthful hardware integration checklist

**Target:** One real message shown on the event's exact *green-display* glasses. No road/platform hazard tests. The current browser adapter is NOT an SDK implementation.

## 0. Ask for source of truth

Get the actual unit model/version, official SDK download/repository, Hello World app, setup documentation, cable/transport information, and any user permissions. Start with `@dean_ml261120` in Worn Discord `#ask-for-help` or a green-lanyard volunteer.

## 1. Verify basic connection (on a safe indoor table)

- [ ] Glasses model and green-display variant physically identified: __________
- [ ] SDK name and version/link: __________
- [ ] Development computer OS: __________
- [ ] Connection method and cable verified: __________
- [ ] Official Hello World built/launched on actual glasses: YES / NO
- [ ] A single green message visibly displayed on glasses: YES / NO
- [ ] Photo/video proof recorded *with consent*, if permitted by organizers: __________

## 2. Display integration — the smallest possible win

- [ ] Determine exact SDK display APIs (do not guess method names)
- [ ] Supported text length, refresh rate, available colors and resolution confirmed
- [ ] Show `FAMILIAR` and then `LOOK UP` as two **manual** messages
- [ ] Show idle → caution → warning while inputs still come from staged controls
- [ ] Record precisely whether each cue actually appeared on glasses

## 3. Optional APIs, only if time permits

- [ ] Programmatic camera image retrieval confirmed on this exact unit
- [ ] Microphone access confirmed
- [ ] Glasses speaker or permitted output route confirmed
- [ ] Touch/button/glance interface confirmed
- [ ] Actual proximity/depth sensor exposed with units, range and limits: __________

**Do not treat an image or model guess as trustworthy distance.** If no validated distance signal exists, keep the slider and clearly label it simulated. Never build or test safety/road/rail avoidance on live hazards.

## Current code boundary

- `src/core/decision.js`: deterministic demo logic, no hardware knowledge.
- `src/core/demo-presets.js`: staged fixed inputs.
- `src/hardware/glasses-adapter.js`: **browser preview only**. Its `toDisplayFrame()` returns a JSON structure with `source: "simulated-demo"`; that structure is our design, **not** a MicroLumin API schema.
- `src/app.js`: browser controls and browser audio.

Once a mentor provides the real SDK, make a separate integration (e.g. `src/hardware/<official-device-adapter>`) **using the documented API** and check every claimed capability on the actual pair. Do not replace the simulation until it works and has been verified.

## Technician handoff (say this)

> We're building FAMILIAR. We have a browser simulator whose output is a tiny text message and state. Can you point us to the official green-display M6 Hello World, supported display API, and the development connection instructions? Our goal today is to display just one verified message. We are not attempting real road or railway sensing.
