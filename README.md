# FAMILIAR

**Looks Familiar. Sounds Familiar. Feels Familiar.**

Our team is building three features:
1. **Proximity Alerts** — our teammate's work; current browser input is simulated.
2. **Conversation Starter** — save memories about people you know and browse short reminder cards.
3. **Social Navigator** — choose a social situation and browse short conversation cues.

## Run the phone/browser prototype

From the project folder:

```powershell
py -m http.server 8000
```

Open **http://localhost:8000/social.html** for Conversation Starter and Social Navigator. The page is responsive and can be opened in a phone browser on the same local network if the computer firewall permits it.

Run the logic tests (Node.js required):

```powershell
npm test
```

## Our two social features

- Conversation Starter supports multiple manually entered profiles, local save/edit/delete, and one-card-at-a-time reminders.
- Social Navigator has five user-selected situations with three optional prompts each.
- Profiles are stored in this browser's local storage. There is no cloud sync, camera, microphone, face recognition, or account system.
- Use fictional sample data or details a person has agreed you can save. Do not commit personal profiles or photos to GitHub.

## How the glasses teammate connects this later

The social features send a small message using **FAMILIAR Display Contract v1**:
- `schema`: contract version
- `feature`: `conversation` or `navigator`
- `visible`: show a card or clear the display
- `title` and `body`: text for the display
- `cardIndex` and `cardCount`: current position
- `actions`: logical `previous`, `next`, and `dismiss` actions

The app publishes each message through `familiar:display-message`. A future adapter can subscribe with `onDisplayMessage(handler)`. The reverse direction is also prepared: a verified glasses input adapter can publish `previous`, `next`, or `dismiss` using `publishDisplayAction(action)`, and the app will respond. Both events are local to the same JavaScript runtime; they do not provide a phone-to-glasses network connection by themselves. The teammate can wrap the real SDK in `connectDisplayAdapter({ showText, clearText, subscribeControls })` from `src/hardware/display-adapter.js`. Those three functions must call real, verified SDK methods; this template does not invent them. The events are local to the same JavaScript runtime and do not provide a phone-to-glasses network connection by themselves.

This event and message format are our own handoff contract, not a device SDK. The teammate must verify the exact display API and test a message on the physical glasses before claiming integration. Display size, font, coordinates, buttons, camera, and face recognition are not assumed.

The current browser preview is not connected to the glasses. No hardware capability is claimed as verified.

## Proximity safety

The proximity feature is a software simulation, not a safety device. Do not test it around real traffic, roads, railway tracks, platform edges, or drop-offs.
