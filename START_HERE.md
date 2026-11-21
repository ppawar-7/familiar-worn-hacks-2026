# START HERE — FAMILIAR (Worn Hacks 2026)

**Repository:** https://github.com/ppawar-7/familiar-worn-hacks-2026 (private; ask the owner to invite teammates).

## 1. Run the browser demo

On Windows, open PowerShell inside the project folder and run:

```powershell
py -m http.server 8000
```

Open http://localhost:8000 for proximity. Open http://localhost:8000/social.html for Conversation Starter and Social Navigator.

## 2. Test the code

If Node.js is installed:

```powershell
npm test
```

The current suite contains 20 automated unit tests. They test JavaScript logic, not the glasses.

## 3. Try the social features without glasses

On `social.html`, click **Use fictional example**, **Use these notes**, and **Next cue**. Then choose **Social Navigator**, select a situation, and step through its prompts. Text size, font, and position affect only the browser preview.

## 4. Hardware milestone

Ask the SDK mentor for the exact model's official Hello World and documentation. The first hardware success criterion is one verified green text message on the actual glasses. Do not assume the browser demo connects to the device.

## 5. Work with your team on GitHub

The repository already exists. Invite teammates through GitHub repository Settings → Collaborators, or have the repository owner do it. Use small feature branches and pull requests; see [CONTRIBUTING.md](CONTRIBUTING.md).

Before sharing with event organizers, confirm their access requirements. Never commit private photos, face templates, raw recordings, secrets, or sensitive profile notes.
