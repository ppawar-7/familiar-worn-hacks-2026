/**
 * FAMILIAR social cue logic.
 * All context is selected or entered by the wearer. This module never
 * identifies people, listens to conversations, infers emotions, or accesses
 * glasses hardware.
 */

const freezeCues = (cues) => Object.freeze(cues.map((cue) => Object.freeze(cue)));

export const NAVIGATOR_SITUATIONS = Object.freeze({
  meet: Object.freeze({
    label: 'Meeting someone new',
    shortLabel: 'Meet someone',
    description: 'A relaxed way to open a conversation and find common ground.',
    cues: freezeCues([
      ['OPEN NATURALLY', 'What brought you here?'],
      ['FOLLOW THEIR LEAD', 'Ask about a detail they mention.'],
      ['SHARE A LITTLE', 'Offer one related detail about yourself.'],
      ['KEEP IT EASY', 'Leave space for the conversation to flow.'],
    ]),
  }),
  join: Object.freeze({
    label: 'Joining a group',
    shortLabel: 'Join a group',
    description: 'Find a natural opening without interrupting the group.',
    cues: freezeCues([
      ['LISTEN FIRST', 'Notice the topic before jumping in.'],
      ['FIND AN OPENING', 'Try: “Mind if I join you?”'],
      ['ADD ONE THOUGHT', 'Connect to something the group said.'],
      ['BRING SOMEONE IN', 'Ask another person what they think.'],
    ]),
  }),
  continue: Object.freeze({
    label: 'Keeping a conversation going',
    shortLabel: 'Keep it going',
    description: 'Build on what is already being shared instead of searching for a perfect line.',
    cues: freezeCues([
      ['PICK UP A DETAIL', 'Ask them to tell you a little more.'],
      ['BE CURIOUS', 'What got you interested in that?'],
      ['SHARE THE MOMENT', 'Offer a short story of your own.'],
      ['CHECK THE FLOW', 'Let the topic change naturally.'],
    ]),
  }),
  reconnect: Object.freeze({
    label: 'Reconnecting with someone',
    shortLabel: 'Reconnect',
    description: 'Pick up a shared thread and make room for what has changed.',
    cues: freezeCues([
      ['START WARM', 'Good to see you again.'],
      ['REMEMBER A THREAD', 'Ask how something they mentioned turned out.'],
      ['CATCH UP', 'What has changed since we last talked?'],
      ['MAKE A PLAN', 'Suggest a simple way to stay in touch.'],
    ]),
  }),
  networking: Object.freeze({
    label: 'Networking event',
    shortLabel: 'Networking',
    description: 'Make a genuine connection first; exchange details only when it feels useful to both people.',
    cues: freezeCues([
      ['START WITH CONTEXT', 'What brought you to this event?'],
      ['FIND COMMON GROUND', 'What are you working on lately?'],
      ['ASK ONE FOLLOW-UP', 'Which part of that has been most interesting?'],
      ['OFFER SOMETHING USEFUL', 'Share a resource or introduction if it fits.'],
      ['FOLLOW UP WITH PERMISSION', 'Would you like to connect on LinkedIn?'],
    ]),
  }),
  dating: Object.freeze({
    label: 'Dating / first date',
    shortLabel: 'Dating',
    description: 'Stay present, share naturally, and respect each person’s comfort and boundaries.',
    cues: freezeCues([
      ['START WITH CURIOSITY7, 'What has been the highlight of your week?'],
      ['ASK, THEN SHARE', 'Follow their answer with a story of your own.'],
      ['NOTICE COMFORT', 'Give space; let the conversation breathe.'],
      ['BE PRESENT', 'You do not need a perfect line.'],
      ['CLOSE CLEARLY', 'I enjoyed meeting you. Would you like to meet again?'],
    ]),
  }),
  interview: Object.freeze({
    label: 'Job interview',
    shortLabel: 'Interview',
    description: 'Keep answers clear and grounded in a real example.',
    cues: freezeCues([
      ['TAKE A BEAT', 'A short pause is okay.'],
      ['ANSWER THE QUESTION', 'Start with the main point, then one example.'],
      ['MAKE IT SPECIFIC', 'What did you do, and what changed?'],
      ['ASK THEM SOMETHING', 'What would success look like in this role?'],
    ]),
  }),
  exit: Object.freeze({
    label: 'Leaving politely',
    shortLabel: 'Wrap up',
    description: 'End warmly and confidently without needing an elaborate excuse.',
    cues: freezeCues([
      ['WRAP UP', 'Mention something you enjoyed.'],
      ['THANK THEM', 'It was great talking with you.'],
      ['EXIT KINDLY', 'I’m going to say hi to a few others.'],
      ['KEEP THE DOOR OPEN', 'Hope we get to continue this another time.'],
    ]),
  }),
});

const RELATIONSHIP_LABELS = Object.freeze({
  friend: 'Friend',
  colleague: 'Colleague',
  mentor: 'Mentor',
  connection: 'New connection',
  date: 'Date',
  other: 'Someone I know',
});

function cleanText(value, maxLength = 120) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

/** Normalize user-entered profile data before storing or displaying it. */
export function normalizePerson(person = {}) {
  if (!person || typeof person !== 'object' || Array.isArray(person)) {
    throw new TypeError('Person must be an object');
  }
  const rawRelationship = cleanText(person.relationship ?? person.connectionType, 24).toLowerCase();
  const relationship = rawRelationship
    ? (Object.hasOwn(RELATIONSHIP_LABELS, rawRelationship) ? rawRelationship : 'other')
    : 'connection';
  return Object.freeze({
    id: cleanText(person.id, 80),
    name: cleanText(person.name, 40),
    relationship: Object.hasOwn(RELATIONSHIP_LABELS, relationship) ? relationship : 'other',
    metAt: cleanText(person.metAt, 90),
    background: cleanText(person.background, 100),
    interest: cleanText(person.interest ?? person.interests, 100),
    lastTopic: cleanText(person.lastTopic, 100),
    note: cleanText(person.note, 160),
  });
}

/** Return concise memory cards. Empty fields never create blank cards. */
export function conversationSuggestions(person = {}) {
  const p = normalizePerson(person);
  const cards = [];

  if (p.name) {
    const relationship = RELATIONSHIP_LABELS[p.relationship] || RELATIONSHIP_LABELS.other;
    const context = [relationship, p.metAt ? `Met at ${p.metAt}` : ''].filter(Boolean).join(' · ');
    cards.push({ title: p.name.toUpperCase(), subtitle: context || 'Someone you chose to remember' });
  }
  if (p.background) cards.push({ title: 'A LITTLE CONTEXT', subtitle: p.background });
  if (p.interest) cards.push({ title: 'INTERESTS', subtitle: p.interest });
  if (p.lastTopic) cards.push({ title: 'LAST TIME', subtitle: p.lastTopic });
  if (p.note) cards.push({ title: 'NEXT TIME', subtitle: p.note });

  if (!cards.length) {
    cards.push(
      { title: 'START WITH CURIOSITY', subtitle: 'What has been exciting lately?' },
      { title: 'FIND COMMON GROUND', subtitle: 'What brought you here?' },
      { title: 'ASK A FOLLOW-UP', subtitle: 'What was that like for you?' },
    );
  }
  return Object.freeze(cards.map((card) => Object.freeze(card)));
}

export function conversationFrame(person = {}, index = 0) {
  const cards = conversationSuggestions(person);
  if (!Number.isInteger(index)) throw new TypeError('Card index must be an integer');
  const cardIndex = ((index % cards.length) + cards.length) % cards.length;
  const card = cards[cardIndex];
  return Object.freeze({
    feature: 'conversation',
    title: card.title,
    body: card.subtitle,
    cardIndex,
    cardCount: cards.length,
  });
}

export function navigatorFrame(situation = 'meet', index = 0) {
  if (!Object.hasOwn(NAVIGATOR_SITUATIONS, situation)) {
    throw new Error('Unknown social situation');
  }
  if (!Number.isInteger(index)) throw new TypeError('Card index must be an integer');
  const situationData = NAVIGATOR_SITUATIONS[situation];
  const cards = situationData.cues;
  const cardIndex = ((index % cards.length) + cards.length) % cards.length;
  const [title, body] = cards[cardIndex];
  return Object.freeze({
    feature: 'navigator',
    situation,
    situationLabel: situationData.label,
    title,
    body,
    cardIndex,
    cardCount: cards.length,
  });
}
