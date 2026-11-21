/**
 * FAMILIAR social cues. The user manually chooses the person and social situation.
 * NO face identification, microphone, camera, AI inference, or glasses SDK access.
 * Pure functions make this module easy to unit test and integrate later.
 */

export const NAVIGATOR_SITUATIONS = Object.freeze({
  join: Object.freeze({
    label: 'Joining a group',
    cues: Object.freeze([
      ['LISTEN FIRST', 'Notice the topic before joining'],
      ['FIND AN OPENING', 'Try: "Mind if I join?"'],
      ['ASK ONE QUESTION', 'Invite someone else to speak'],
    ]),
  }),
  meet: Object.freeze({
    label: 'Meeting someone new',
    cues: Object.freeze([
      ['START SIMPLE', 'Try: "What brought you here?"'],
      ['FOLLOW THEIR LEAD', 'Ask about something they mention'],
      ['SHARE A LITTLE', 'Offer one related fact about you'],
    ]),
  }),
  reconnect: Object.freeze({
    label: 'Reconnecting',
    cues: Object.freeze([
      ['SAY HELLO', 'Try: "Good to see you again"'],
      ['FIND A THREAD', 'Ask what has been new for them'],
      ['MAKE SPACE', 'Give them time to answer'],
    ]),
  }),
  exit: Object.freeze({
    label: 'Leaving politely',
    cues: Object.freeze([
      ['WRAP UP', 'Acknowledge something you enjoyed'],
      ['THANK THEM', 'Try: "It was great talking"'],
      ['EXIT KINDLY', 'Try: "I am going to say hi to others"'],
    ]),
  }),
});

export const TEXT_SIZES = Object.freeze(['small', 'medium', 'large']);
export const PLACEMENTS = Object.freeze(['top', 'center', 'bottom']);
export const TEXT_FONTS = Object.freeze(['mono', 'sans']);

function cleanText(input, max = 80) {
  if (typeof input !== 'string') return '';
  return input.replace(/\s+/g, ' ').trim().slice(0, max);
}

/** Only user-provided, manually saved notes. Never store photos or face templates. */
export function normalizePerson(person = {}) {
  if (!person || typeof person !== 'object' || Array.isArray(person)) {
    throw new TypeError('Person must be an object');
  }
  return Object.freeze({
    name: cleanText(person.name, 40),
    metAt: cleanText(person.metAt, 90),
    background: cleanText(person.background, 100),
    interest: cleanText(person.interest, 60),
    lastTopic: cleanText(person.lastTopic, 90),
    note: cleanText(person.note, 140),
  });
}

export function conversationSuggestions(person = {}) {
  const p = normalizePerson(person);
  const list = [];
  if (p.name) list.push({ title: p.name.toUpperCase(), subtitle: p.metAt ? `You met at ${p.metAt}` : 'Someone you chose to remember' });
  if (p.background) list.push({ title: 'REMEMBER', subtitle: p.background });
  if (p.interest) list.push({ title: 'ASK ABOUT AN INTEREST', subtitle: `Ask about ${p.interest}` });
  if (p.lastTopic) list.push({ title: 'PICK UP THE THREAD', subtitle: `Follow up on ${p.lastTopic}` });
  if (p.note) list.push({ title: 'REMEMBER YOUR NOTE', subtitle: p.note });
  if (!list.length) {
    list.push({ title: 'START WITH CURIOSITY', subtitle: 'What has been exciting lately?' });
    list.push({ title: 'FIND COMMON GROUND', subtitle: 'What brought you here?' });
    list.push({ title: 'ASK A FOLLOW-UP', subtitle: 'What was that like for you?' });
  }
  return Object.freeze(list.map(({ title, subtitle }) => Object.freeze({ title, subtitle })));
}

function validateDisplayOptions({ textSize = 'medium', placement = 'center', font = 'mono' } = {}) {
  if (!TEXT_SIZES.includes(textSize)) throw new Error('Unsupported preview text size');
  if (!PLACEMENTS.includes(placement)) throw new Error('Unsupported preview placement');
  if (!TEXT_FONTS.includes(font)) throw new Error('Unsupported preview font');
  return { textSize, placement, font };
}

/** Proposed display contract only; NOT a glasses SDK call. */
export function toSocialDisplayFrame({ feature, title, subtitle, textSize = 'medium', placement = 'center', font = 'mono' }) {
  if (!['conversation', 'navigator'].includes(feature)) throw new Error('Unknown social feature');
  if (typeof title !== 'string' || typeof subtitle !== 'string') throw new Error('Display text must be strings');
  const options = validateDisplayOptions({ textSize, placement, font });
  return Object.freeze({
    source: 'manual-social-demo',
    feature,
    title: cleanText(title, 60),
    subtitle: cleanText(subtitle, 160),
    ...options,
  });
}

export function conversationFrame(person = {}, index = 0, options = {}) {
  const suggestions = conversationSuggestions(person);
  if (!Number.isInteger(index)) throw new TypeError('Cue index must be an integer');
  const cue = suggestions[((index % suggestions.length) + suggestions.length) % suggestions.length];
  return toSocialDisplayFrame({ feature: 'conversation', ...cue, ...options });
}

export function navigatorFrame(situation = 'meet', index = 0, options = {}) {
  if (!Object.hasOwn(NAVIGATOR_SITUATIONS, situation)) throw new Error('Unknown social situation');
  if (!Number.isInteger(index)) throw new TypeError('Cue index must be an integer');
  const cues = NAVIGATOR_SITUATIONS[situation].cues;
  const [title, subtitle] = cues[((index % cues.length) + cues.length) % cues.length];
  return toSocialDisplayFrame({ feature: 'navigator', title, subtitle, ...options });
}
