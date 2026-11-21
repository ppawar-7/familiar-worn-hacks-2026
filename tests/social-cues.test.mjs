import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePerson, conversationSuggestions, conversationFrame,
  navigatorFrame, NAVIGATOR_SITUATIONS, toSocialDisplayFrame,
} from '../src/core/social-cues.js';

test('empty person gives useful generic prompts without recognition', () => {
  const prompts = conversationSuggestions({});
  assert.equal(prompts.length, 3);
  assert.match(prompts[0].title, /CURIOSITY/);
});

test('manually supplied details produce personalized prompts', () => {
  const prompts = conversationSuggestions({ name: 'Alex', interest: 'astronomy', lastTopic: 'the workshop', note: 'Ask about demo' });
  assert.equal(prompts.length, 3);
  assert.match(prompts[0].subtitle, /astronomy/);
  assert.match(prompts[1].subtitle, /workshop/);
  assert.equal(prompts[2].subtitle, 'Ask about demo');
});

test('notes normalize whitespace and limit length', () => {
  const person = normalizePerson({ name: '  Pat \n Doe ', note: 'x'.repeat(300) });
  assert.equal(person.name, 'Pat Doe');
  assert.equal(person.note.length, 140);
  assert.ok(Object.isFrozen(person));
});

test('negative and wraparound cue indexes select a valid suggestion', () => {
  const first = conversationFrame({}, 0);
  assert.deepEqual(conversationFrame({}, 3), first);
  assert.equal(conversationFrame({}, -1).title, conversationSuggestions({})[2].title);
});

test('each social navigator situation has three usable cues', () => {
  for (const name of Object.keys(NAVIGATOR_SITUATIONS)) {
    for (let i = 0; i < 3; i++) {
      const frame = navigatorFrame(name, i);
      assert.equal(frame.feature, 'navigator');
      assert.ok(frame.title && frame.subtitle);
      assert.equal(frame.source, 'manual-social-demo');
    }
  }
});

test('invalid situation and noninteger cue index are rejected', () => {
  assert.throws(() => navigatorFrame('nonexistent'), /Unknown/);
  assert.throws(() => navigatorFrame('meet', 1.2), /integer/);
});

test('preview style selection travels with SDK-independent frame', () => {
  const frame = navigatorFrame('exit', 0, { textSize: 'large', placement: 'bottom' });
  assert.equal(frame.textSize, 'large');
  assert.equal(frame.placement, 'bottom');
  assert.equal(frame.font, 'mono');
  assert.ok(Object.isFrozen(frame));
});

test('unsupported style and feature fail instead of silently guessing hardware', () => {
  assert.throws(() => navigatorFrame('meet', 0, { textSize: 'giant' }), /size/);
  assert.throws(() => navigatorFrame('meet', 0, { placement: 'left' }), /placement/);
  assert.throws(() => navigatorFrame('meet', 0, { font: 'unverified-hardware-font' }), /font/);
  assert.throws(() => toSocialDisplayFrame({ feature: 'face-recognition', title: 'a', subtitle: 'b' }), /Unknown/);
});
