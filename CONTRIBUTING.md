# Contributing to Familiar

## Quick start

```bash
git clone https://github.com/ppawar-7/familiar-worn-hacks-2026.git
cd familiar-worn-hacks-2026
python -m http.server 8000
```

Visit http://localhost:8000. Open `social.html` for Conversation Starter and Social Navigator.

## Team collaboration

1. `git switch -c feature/short-description` to create your feature branch.
2. Make one small change. Test it with `npm test` if Node.js is installed.
3. Commit your changes and push your branch.
4. Open a pull request; explain what works and whether any inputs are simulated.
5. Get a teammate to verify before merging into `main`.

For beginners, editing files on GitHub and opening pull requests is fine too.

## Safe defaults

- Do not push secrets, access tokens, private photos, raw bystander audio, or user records.
- Only label a feature as **real-device integration** when it has actually worked on the glasses.
- Do not do live hazard experiments near roads, subway tracks, or ledges.
- Use fake/demo inputs for any safety-adjacent scenarios until a validated device exists.

## Proposed branch areas

`feature/glasses-display`, `feature/camera-input`, `feature/proximity-demo`, `feature/audio`, `feature/social`, `feature/demo`.
