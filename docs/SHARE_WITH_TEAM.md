# Share FAMILIAR code with a teammate

## Repository

The private team repository is https://github.com/ppawar-7/familiar-worn-hacks-2026. The owner can invite teammates under **Settings → Collaborators**. Ask the owner to invite you before cloning.

## Quick start

```powershell
git clone https://github.com/ppawar-7/familiar-worn-hacks-2026.git
cd familiar-worn-hacks-2026
py -m http.server 8000
```

Open http://localhost:8000 for the proximity simulation or http://localhost:8000/social.html for Conversation Starter and Social Navigator. Run `npm test` if Node.js is installed.

## If your teammate already has proximity changes

Do **not** overwrite their `src/app.js`, `src/core/decision.js`, `src/hardware/glasses-adapter.js`, or `index.html` without comparing changes first.

The social feature files are:

- `social.html`
- `src/social-app.js`
- `src/social.css`
- `src/core/social-cues.js`
- `tests/social-cues.test.mjs`

The social page also loads the shared `src/styles.css`; keep that file in place. The social code does not import or alter proximity logic. If your teammate has uncommitted local changes, make a separate branch and merge carefully rather than replacing their folder.

## Suggested teammate message

> I worked on FAMILIAR's Conversation Starter and Social Navigator while you were testing proximity on the glasses. The private team repo now has a separate `social.html` browser demo with independent logic in `src/core/social-cues.js`. It doesn't use hardware or face recognition yet. Please keep your proximity changes on their own branch; after we verify the SDK's text display, we can feed the social display frames to your verified adapter.

## Git workflow

Use a branch such as `feature/social-cues`, commit the change, and open a pull request. Run `npm test` before merging. Never push private participant data, photos, face templates, recordings, secrets, or access tokens.
