# FAMILIAR — Conversation Starter + Social Navigator

**Implementation:** Two independent, browser-only prototypes. No glasses, camera, microphone, face recognition, or detection SDK has been verified or used.

## Why these two features?

The team's green whiteboard columns describe **Conversation Starter** and **Social Navigator**, with rough notes about teaching one face and printing text with adjustable size/position. We interpret that as a *future interaction concept* and implement a safe manual stand-in: the wearer chooses a fictional or user-entered person and/or social situation. We **do not** claim face detection or identity matching.

## Start (Windows, with Python 3 installed)

1. Clone or download the project repository.
2. Open a terminal in the `familiar-worn-hacks-2026` folder.
3. Run `py -m http.server 8000` (or `python -m http.server 8000`).
4. In a browser open **http://localhost:8000/social.html**.
5. No hardware or paid API required.

## Feature A — Conversation Starter

- Type a nickname, interest, previous conversation topic, and an optional private note, then click **Use these notes**.
- Or click **Use fictional example** (Alex, a made-up character).
- **Next cue** cycles through short optional prompts generated from that handwritten information. Without notes, generic prompts are available.
- **Save on this browser** stores only these manually entered text fields in that browser's `localStorage`. **Clear saved notes** deletes the entry.
- No photos, face templates, audio, or remote sync. Do not enter sensitive information or private participant details.

## Feature B — Social Navigator

- Switch to **Social Navigator** tab.
- Manually choose *Meeting someone new*, *Joining a group*, *Reconnecting*, or *Leaving politely*.
- Use **Next cue**, **Previous**, or **Dismiss** to control each three-step sequence.
- No conversation listening or interpretation of another person's expression is implemented.

## HUD and integration boundary

Both features use the pure module `src/core/social-cues.js`. It returns plain objects such as:

```json
{
  "source": "manual-social-demo",
  "feature": "navigator",
  "title": "START SIMPLE",
  "subtitle": "Try: \"What brought you here?\"",
  "textSize": "medium",
  "placement": "center",
  "font": "mono"
}
```

These are **proposed display frames**, not valid MicroLumin SDK requests. They can be inspected in the browser's **Proposed SDK-independent display message** box. Text size, font, and placement only affect the browser preview; actual glasses fonts, coordinates, available API methods, and screen size are unknown.

### Teammate hardware integration — after verifying Hello World

1. Verify exact model, official SDK, and one successful green text message **on the actual pair**.
2. Have hardware teammate create a new adapter that receives a `{title,subtitle}` frame and translates it to verified SDK commands.
3. Start with `navigatorFrame('meet', 0)`—no person data or sensing required.
4. Confirm what physically appears on the display. If only one text line is supported, show `title` alone.
5. Record photos/test results only with relevant permissions. Keep social profiles off camera and out of source control.
6. Never use this demo to claim that faces or social situations are automatically identified.

## Relevant files

- `social.html` — independent browser UI
- `src/social-app.js` — tab controls, manual note storage, cue navigation
- `src/core/social-cues.js` — pure prompts and SDK-independent frame construction
- `src/social.css` — preview styling only
- `tests/social-cues.test.mjs` — automated tests

## Test

Run `npm test` if Node.js is installed. This suite includes the original proximity tests and social cue tests. Testing pure JavaScript functions is not the same as testing the real glasses.
