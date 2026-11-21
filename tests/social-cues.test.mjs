import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePerson,
  conversationSuggestions,
  conversationFrame,
  navigatorFrame,
  NAVIGATOR_SITUATIONS,
} from '../src/core/social-cues.js';
import { createDisplayMessage, isDisplayMessage, DISPLAY_SCHEMA } from '../src/hardware/display-contract.js';

test('profile fields are normalized and bounded', () => {
  const person = normalizePerson({
    id: 'sunny-1', name: ' Sunny  ', metAt: ' Worn\nHacks ',
    background: 'CS graduate student', interest: 'AI, robotics',
    lastTopic: 'hackathon demo', note: 'Ask how it went',
  });
  assert.equal(person.name, 'Sunny');
  assert.equal(person.metAt, 'Worn Hacks');
  assert.equal(person.interest, 'AI, robotics');
  assert.equal(person.note, 'Ask how it went');
  assert.ok(Object.isFrozen(person));
});

test('conversation memory becomes short cards in useful order', () => {
  const person = normalizePerson({
    name: 'Sunny', metAt: 'Worn Hacks', background: 'CS graduate student',
    interest: 'AI and wearable tech', lastTopic: 'his project', note: 'Ask how the demo went',
  });
  const cards = conversationSuggestions(person);
  assert.deepEqual(cards.map((card) => card.title), [
    'SUNNY', 'A LITTLE CONTEXT', 'INTERESTS', 'LAST TIME', 'NEXT TIME',
  ]);
  assert.equal(cards[0].subtitle, 'You met at Worn Hacks');
  assert.equal(cards[1].subtitle, 'CS graduate student');
});

test('empty profile gives general prompts and no blank cards', () => {
  const cards = conversationSuggestions({});
  assert.equal(cards.length, 3);
  assert.ok(cards.every((card) => card.title && card.subtitle));
});

test('conversation frame wraps through cards and reports its position', () => {
  const person = { name: 'Sunny', metAt: 'Worn Hacks', background: 'CS grad student' };
  assert.deepEqual(conversationFrame(person, 0), {
    feature: 'conversation', title: 'SUNNY', body: 'You met at Worn Hacks',
    cardIndex: 0, cardCount: 2,
  });
  assert.equal(conversationFrame(person, 2).title, 'SUNNY');
  assert.throws(() => conversationFrame(person, 1.5), /integer/);
});

test('five social navigator situations each provide three short prompts', () => {
  assert.equal(Object.keys(NAVIGATOR_SITUATIONS).length, 5);
  for (const situation of Object.keys(NAVIGATOR_SITUATIONS)) {
    const cards = NAVIGATOR_SITUATIONS[situation].cues;
    assert.equal(cards.length, 3);
    for (let i = 0; i < cards.length; i++) {
      const frame = navigatorFrame(situation, i);
      assert.equal(frame.feature, 'navigator');
      assert.equal(frame.cardIndex, i);
      assert.equal(frame.cardCount, 3);
      assert.ok(frame.title && frame.body);
    }
  }
});

test('unknown social situation and invalid index are rejected', () => {
  assert.throws(() => navigatorFrame('unknown', 0), /Unknown/);
  assert.throws(() => navigatorFrame('meet', 1.2), /integer/);
});

test('display contract creates a compact SDK-independent packet', () => {
  const frame = conversationFrame({ name: 'Sunny', metAt: 'Worn Hacks' }, 0);
  const packet = createDisplayMessage(frame);
  assert.equal(packet.schema, DISPLAY_SCHEMA);
  assert.equal(packet.feature, 'conversation');
  assert.equal(packet.title, 'SUNNY');
  assert.equal(packet.body, 'You met at Worn Hacks');
  assert.deepEqual(packet.actions, ['previous', 'next', 'dismiss']);
  assert.equal(isDisplayMessage(packet), true);
});

test('navigator packets use the same hardware-independent contract', () => {
  const packet = createDisplayMessage(navigatorFrame('join', 1));
  assert.equal(packet.feature, 'navigator');
  assert.equal(packet.title, 'FIND AN OPENING');
  assert.equal(isDisplayMessage(packet), true);
});

test('dismiss creates a valid clear-display packet', () => {
  const packet = createDisplayMessage({
    ...navigatorFrame('meet', 0), visible: false,
  });
  assert.equal(packet.visible, false);
  assert.equal(packet.title, '');
  assert.equal(packet.body, '');
  assert.equal(isDisplayMessage(packet), true);
});

test('display contract rejects invalid features and card positions', () => {
  assert.throws(() => createDisplayMessage({ feature: 'face-recognition', title: 'a', body: 'b' }));
  assert.throws(() => createDisplayMessage({ feature: 'conversation', title: 'a', body: 'b', cardIndex: 2, cardCount: 1 }));
  assert.throws(() => createDisplayMessage({ feature: 'conversation', title: '', body: '' }));
});
