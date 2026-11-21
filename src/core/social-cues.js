/**
 * FAMILIAR's social suggestion logic.
 * Input is manually saved by the wearer. This module does not identify faces,
 * listen to conversations, infer emotions, or access glasses hardware.
 */

export const NAVIGATOR_SITUATIONS = Object.freeze({
  meet: Object.freeze({
    label: 'Meeting someone new',
    cues: Object.freeze([
      ['START SIMPLE', 'What brought you here?'],
      ['FOLLOW THEIR LEAD', 'Ask about something they mention'],
      ['SHARE A LITTLE', 'Offer one related detail about you'],
    ]),
  }),
  join: Object.freeze({
    label: 'Joining a group',
    cues: Object.freeze([
      ['LISTEN FIRST', 'Notice the topic before joining'],
      ['FIND AN OPENING', 'Try: "Mind if I join?"'],
      ['BRING SOMEONE IN', 'Ask another person what they think'],
    ]),
  }),
  continue: Object.freeze({
    label: 'Keeping a conversation going',
    cues: Object.freeze([
      ['PICK UP A DETAIL', 'Ask them to tell you a little more'],
      ['BE CURIOUS', 'What got you interested in that?'],
      ['SHARE THE MOMENT', 'Connect it to something you have experienced'],
    ]),
  }),
  reconnect: Object.freeze({
    label: 'Reconnecting with someone',
    cues: Object.freeze([
      ['SAY HELLO', 'Good to see you again'],
      ['REMEMBER A THREAD', 'Ask what has happened since you last met'],
      ['MAKE SPACE', 'Give them time to catch you up'],
    ]),
  }),
  exit: Object.freeze({
    label: 'Leaving politely',
    cues: Object.freeze([
      ['WRAP UP', 'Mention something you enjoyed'],
      ['THANK THEM', 'It was great talking with you'],
      ['EXIT KINDLY', 'I am going to say hi to a few others'],
    ]),
  }),
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
  return Object.freeze({
    id: cleanText(person.id, 80),
    name: cleanText(person.name, 40),
    metAt: cleanText(person.metAt, 90),
    background: cleanText(person.background, 100),
    interest: cleanText(person.interest ?? person.interests, 100),
    lastTopic: cleanText(person.lastTopic, 100),
    note: cleanText(person.note, 160),
  });
}

/** Return short, ordered memory cards. Empty fields do not create empty cards. */
export function conversationSuggestions(person = {}) {
  const p = normalizePerson(person);
  const cards = [];

  if (p.name) {
    cards.push({
      title: p.name.toUpperCase(),
      subtitle: p.metAt ? `You met at ${p.metAt}` : 'Someone you chose to remember',
    });
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
  const cards = NAVIGATOR_SITUATIONS[situation].cues;
  const cardIndex = ((index % cards.length) + cards.length) % cards.length;
  const [title, body] = cards[cardIndex];
  return Object.freeze({
    feature: 'navigator',
    title,
    body,
    cardIndex,
    cardCount: cards.length,
  });
}
