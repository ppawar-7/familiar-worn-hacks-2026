# FAMILIAR

**Looks Familiar. Sounds Familiar. Feels Familiar.**

We are building **three features** for our smart-glasses hackathon project—nothing else:

| Feature | What it does | Demo status |
|---|---|---|
| **1. Proximity Alerts** | A short look-up alert when phone distraction and closeness to a staged object occur together. | **Simulated** distance/attention in browser. Teammate is working on real glasses. |
| **2. Conversation Starter** | Pick someone you have met, view short memory cards about them, and get ideas for what to say. | Manual browser demo. **No face recognition** yet. |
| **3. Social Navigator** | Choose a social situation and step through short, helpful conversation cues. | Manual browser demo. **No live listening** yet. |

## Run it

1. Download or clone this repository.
2. In the project folder, run `py -m http.server 8000` (Windows) or `python3 -m http.server 8000`.
3. Open **http://localhost:8000**. Choose one of the three features at the top.

Optional: run `npm test` if Node.js is installed.

## What's real, and what's a demo?

- Browser buttons, profile notes, social cue navigation, and simulated alerts work without the glasses.
- **The code is not connected to the glasses**, and it does not identify faces or measure real distance.
- The glasses hardware teammate will connect verified text-display functions when an official SDK example works on the actual device.
- **Proximity Alerts is not a safety device.** Never test it around real traffic, roads, tracks, platform edges, or drop-offs.
- Use only fictional examples or details the person has agreed you can store. Browser notes stay local; do not commit personal profiles or photos.

## Team split

One teammate can continue Proximity Alerts and hardware testing. Another can build Conversation Starter and Social Navigator without the glasses. Keep new changes separate so they can be merged without overwriting each other's work.
