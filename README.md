# FAMILIAR

**Looks Familiar. Sounds Familiar. Feels Familiar.**

FAMILIAR is a phone companion for smart glasses. The phone is where the wearer chooses context and saves detail; the glasses are intended to show one short, glanceable cue at the right moment.

## Social features

- **Conversation Starter:** save, search, edit, and delete notes about people you choose to remember. The app turns those notes into short cards for reconnecting.
- **Social Navigator:** choose from eight situations — meeting someone, joining a group, networking, dating / a first date, a job interview, continuing a conversation, reconnecting, or wrapping up — and browse concise, optional prompts.
- **Phone-first design:** large touch targets, a mobile bottom feature switcher, compact forms, responsive layouts, and a one-card glasses preview.
- **Privacy:** profiles are manually entered and stored in this browser only. There is no face recognition, camera capture, automatic listening, cloud sync, or account system.

## Run the phone/browser prototype

From the project folder:

~~~powershell
py -m http.server 8000
~~~

Open **http://localhost:8000/social.html** for Conversation Starter and Social Navigator. The page is responsive and can be opened in a phone browser on the same local network if the computer firewall permits it.

Run the logic tests (Node.js required):

~~~powershell
npm test
~~~

## How this fits the Worn brief

The Worn 2026 theme is **Second Nature**. FAMILIAR is primarily aimed at:

- **Seamless Handoff:** use the phone to choose a person or social moment, then send a concise cue through a hardware-independent display message.
- **Natural Interaction:** keep the glasses output to one short card at a time, with simple next / previous / dismiss actions.
- **Personal Insight:** use only context the wearer intentionally saves, rather than silently identifying or profiling other people.

The event brief calls for a live on-device demo. The current social app is still a browser prototype: the glasses preview and display events are not a physical device connection. A hardware teammate must connect the display contract to the official SDK and verify it on the exact event glasses before claiming on-device integration.

## Display handoff contract

The app publishes **FAMILIAR Display Contract v1** through the event name familiar:display-message:

- **schema:** contract version
- **feature:** conversation or navigator
- **visible:** show a card or clear the display
- **title and body:** short display text
- **cardIndex and cardCount:** current position
- **actions:** logical previous, next, and dismiss actions

A verified hardware adapter can subscribe with onDisplayMessage(handler). The reverse direction is prepared through publishDisplayAction(action) and onDisplayAction(handler). These events are local to the same JavaScript runtime; they do not provide a phone-to-glasses network connection by themselves. The real adapter must use only documented SDK methods.

## Privacy and safety

Use fictional sample data or information a person has agreed you can save. Do not commit personal profiles or photos to GitHub. The app does not use face recognition or record conversations. Social prompts are optional suggestions, not scripts or claims about what another person is thinking.
