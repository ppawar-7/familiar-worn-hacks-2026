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

## Hardware handoff — implemented only as a software contract

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

## Main limitations and next milestone

**Current limitation:** A user has to use phone/browser controls to change cards. That defeats the goal of keeping attention on the other person.

**Next milestone:** An optional timed-cue browser demo, then a real-device adapter with a verified supported background/scheduling approach. Actual autonomous prompts on the event glasses require the exact SDK and physical testing; a normal phone browser may stop running timers when locked or backgrounded.
