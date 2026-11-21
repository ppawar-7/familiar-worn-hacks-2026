# Familiar — all modules / idea backlog

Our team identity is **Familiar**. Modules can use different sensors and interaction patterns, but share a principle: *show a small, contextually relevant cue at the right moment.*

## 1. Proximity & attention (first to prototype)

**Proposed future product:** reduce distraction by showing brief visual/audio reminders when the wearer approaches relevant objects or boundaries.  
**Current implementation:** browser-only, with manually staged phone-attention, scenario, and distance inputs.  
**Not implemented:** phone-attention sensing, accurate depth, road/platform boundary recognition, live glasses output.

## 2. Looks Familiar (visual memory)

Capture a reference object with permission, save a short note, and retrieve it when intentionally photographed again. Needs verified camera/image retrieval access.

## 3. Sounds Familiar (opt-in sound memories)

Collect user-approved examples (e.g., a device beep), compare a new recording, and surface a short label. Needs verified microphone API; do not sell as critical sound detection.

## 4. Feels Familiar (contextual routines)

User-chosen situational reminders that offer one cue at a time; do not imply emotion sensing, mind-reading, or unverified neural-input support.

## 5. Conversation Starter / Social Navigator (browser demos built)

Both are implemented in `social.html` with pure logic in `src/core/social-cues.js`. Conversation Starter uses manual, optional notes about one known contact to suggest opening questions; Social Navigator presents three prompts for a situation manually chosen by the wearer. The browser preview supports text-size and text-placement settings as a design exercise, **not verified hardware capabilities**. No face recognition, microphone, camera, automatic person identification, remote account, or glasses SDK are connected. See `docs/SOCIAL_FEATURES.md`.

## Selection criteria

- Demonstrable with **actual available hardware** before any additions.
- Clear reason to use glasses instead of a phone.
- Single-color green display: one line or one icon at a time.
- Explicit consent for cameras and microphones.
- No critical-safety promises.
