# Familiar — Worn Hacks 2026

**Looks Familiar · Sounds Familiar · Feels Familiar**

Familiar is our team project for [Worn Hacks 2026](https://worn-hacks.com/): a set of experiments in contextual assistance on **single-color green smart glasses**. This repository belongs to the whole Familiar team.

**Repository:** [ppawar-7/familiar-worn-hacks-2026](https://github.com/ppawar-7/familiar-worn-hacks-2026) (currently private; share access with teammates and organizers as needed).

> **Current first feature:** a **simulated proximity-attention alert**. The browser demo uses manually staged context and distance inputs, not real hazard detection.

## Run the prototypes

From the project folder, start a local web server:

```powershell
py -m http.server 8000
```

Open http://localhost:8000 for the proximity demo, or http://localhost:8000/social.html for Conversation Starter and Social Navigator. No glasses are required for these browser prototypes.

Run the automated tests if Node.js is installed:

```powershell
npm test
```

No npm install, API keys, or paid services are needed for the current demo.

## Team modules

| Module | Goal | Status |
|---|---|---|
| **Proximity & attention** | Staged phone-attention and distance inputs produce idle/caution/warning cues | Browser simulation only; not connected to glasses |
| **Looks Familiar** | Save an object/scene note and retrieve it later | Roadmap |
| **Sounds Familiar** | Opt-in matching of saved example sounds | Roadmap |
| **Feels Familiar** | User-configured contextual reminders | Roadmap |
| **Conversation Starter** | Manual notes about a person become short optional conversation prompts | Browser prototype; no face recognition |
| **Social Navigator** | User-selected social situations become short prompts | Browser prototype; no listening or glasses connection |

The two social demos can be built without access to the team's only pair of glasses. Their entry point is `social.html`; their logic is in `src/core/social-cues.js`.

## Hardware truth

The event glasses have been reported to have a green display and photo capability, but app-level SDK access has not been verified in this project. `src/hardware/glasses-adapter.js` is browser-preview code, **not a device SDK integration**. Confirm the exact model, official SDK, supported APIs, and one successful on-device Hello World before claiming hardware functionality.

See [the hardware checklist](docs/SDK_VALIDATION.md), [social feature guide](docs/SOCIAL_FEATURES.md), and [team handoff guide](docs/SHARE_WITH_TEAM.md).

## Safety and privacy

This is a hackathon prototype, not a street-crossing, subway, collision-avoidance, or emergency warning system. Do not test near roads, tracks, moving traffic, or drop-offs. Use simulated or controlled indoor inputs only.

For social features, enter only information you have permission to keep. The current demo uses manually entered text stored locally in the browser if the user chooses Save. It does not capture photos, identify faces, listen to conversations, or sync profiles to a server. Do not commit personal profiles, participant photos, recordings, passwords, or API keys.

## Project structure

- `index.html` — proximity browser simulation
- `social.html` — Conversation Starter and Social Navigator browser demos
- `src/core/` — testable decision and social cue logic
- `src/hardware/` — browser-only adapter boundary awaiting verified SDK details
- `tests/` — automated JavaScript tests
- `docs/` — event, hardware, social, submission, and team documentation
- `.github/workflows/tests.yml` — automated test workflow for pushes and pull requests

See [START_HERE.md](START_HERE.md) for beginner setup and [CONTRIBUTING.md](CONTRIBUTING.md) for team workflow.
