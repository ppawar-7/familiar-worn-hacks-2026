# Device integration (unverified)

The team reported that the event glasses use a **monochrome green display** and can take pictures. App-level SDK access, camera retrieval, sensor capabilities, data transport, audio output, and input methods still require verification on the exact event unit.

## Critical caveat

**A standard RGB camera image is not a trustworthy distance sensor.** Inferring proximity to people, roads, subway platform edges, or moving objects from a single image is unreliable. The demo's distance slider is **SIMULATED**, not a real measurement. Do not label it as a validated detection system.

## Adapter boundary

`src/hardware/glasses-adapter.js` exports a function to send a message to the *browser preview*. Replace or extend this adapter only after inspecting the official SDK. Do not invent SDK import names or APIs.

## Supported / unverified

| Capability | Status |
|---|---|
| Green text display hardware | Reported by team; verify software access |
| Taking pictures | Reported by team; verify programmatic capture |
| Microphone/speakers | Verify specific device and SDK permissions |
| Depth or proximity sensor | **Not established** |
| Precise road or subway-edge detection | **Not established; not safe to assume** |
| Ring / neural-band controls | **Not established** |

## Implementation sequence

1. Execute the official Hello World for the display.
2. Confirm supported format, frame rate and glyph dimensions.
3. Map the browser HUD text into the actual display API.
4. Confirm how audio alerts are played, then wire optional sound output.
5. If the team has a valid device-provided distance input, add it behind a separate adapter with clear source metadata and safeguards. Otherwise demonstrate the **simulation only**.
