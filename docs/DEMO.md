# Familiar live demo — first module

## Goal

Show the software logic and green display design: a **simulated** distracted wearer approaching a **staged** boundary can receive a short visual cue and an optional browser sound. There is no validated proximity sensing. **Never use real roads or train platforms for testing.**

## 60-second demo

1. Open the prototype in a browser; state that inputs are manually staged.
2. Tap **1 · Idle** (staged 6 m): idle.
3. Tap **2 · Caution** (staged 2 m): green `LOOK UP: BOUNDARY` cue.
4. Click **Enable browser sound**, then tap **3 · Warning** (staged 0.8 m): `PAUSE / LOOK UP` plus an optional browser tone.
5. Tap **Reset** or manually turn phone attention OFF: idle, showing that the demo state depends on inputs.
6. If the hardware adapter has been integrated with *verified* SDK methods, demonstrate the display on the actual device. Clearly identify whether the inputs still come from a slider.

## Test cases

- No staged context always yields idle.
- Phone attention OFF yields idle.
- Phone attention ON + 6 m yields idle.
- Phone attention ON + 2 m yields caution.
- Phone attention ON + 0.8 m yields warning.
- Sound is activated by user action and plays only on transition to warning.

## Claims we must not make

- That this detects real roads, rails, distance, phone usage, people, or approaching obstacles.
- That this warns reliably enough to prevent collisions or injuries.
- That the event's actual glasses, SDK, camera, microphone, or speakers are integrated unless someone has verified them.

## Fallback demo

If real hardware output is not ready, show the browser HUD and describe the hardware integration as future work. Do not silently substitute it for a device demo.
