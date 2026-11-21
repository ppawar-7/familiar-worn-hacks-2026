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

The social logic is separate from hardware. Both features produce a small message object using **FAMILIAR Display Contract v1**, implemented in `src/hardware/display-contract.js`.

A message contains:
- `schema`: contract version
- `feature`: `conversation` or `navigator`
- `visible`: show a card or clear the display
- `title` and `body`: text for the display
- `cardIndex` and `cardCount`: current position
- `actions`: logical `previous`, `next`, and `dismiss` actions

The teammate can map those fields to the **actual documented glasses SDK** after getting one real text message to display on the physical glasses. The contract is not itself an SDK call. Display size, font, coordinates, buttons, camera, and face recognition are not assumed.

The current browser preview is not connected to the glasses. No hardware capability is claimed as verified.

## Proximity safety

The proximity feature is a software simulation, not a safety device. Do not test it around real traffic, roads, railway tracks, platform edges, or drop-offs.
