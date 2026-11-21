import test from 'node:test';
import assert from 'node:assert/strict';
import { createDisplayMessage } from '../src/hardware/display-contract.js';
import {
  FAMILIAR_DISPLAY_EVENT,
  FAMILIAR_DISPLAY_ACTION_EVENT,
  publishDisplayMessage,
  onDisplayMessage,
  publishDisplayAction,
  onDisplayAction,
} from '../src/hardware/display-events.js';

test('social display message can be published for a future hardware adapter', () => {
  const target = new EventTarget();
  const message = createDisplayMessage({
    feature: 'conversation', title: 'SUNNY', body: 'You met at Worn Hacks',
    cardIndex: 0, cardCount: 2,
  });
  let received;
  const unsubscribe = onDisplayMessage((value) => { received = value; }, target);
  assert.equal(publishDisplayMessage(message, target), true);
  assert.equal(received, message);
  unsubscribe();
  assert.equal(target.dispatchEvent(new Event(FAMILIAR_DISPLAY_EVENT)), true);
  assert.equal(received, message);
});

test('invalid messages are not published', () => {
  const target = new EventTarget();
  assert.throws(() => publishDisplayMessage({ title: 'guess' }, target), /invalid/i);
});


test('future glasses buttons can send next, previous, and dismiss actions to the app', () => {
  const target = new EventTarget();
  const received = [];
  const unsubscribe = onDisplayAction((action) => received.push(action), target);
  for (const action of ['previous', 'next', 'dismiss']) {
    assert.equal(publishDisplayAction(action, target), true);
  }
  assert.deepEqual(received, ['previous', 'next', 'dismiss']);
  unsubscribe();
  target.dispatchEvent(new Event(FAMILIAR_DISPLAY_ACTION_EVENT));
  assert.deepEqual(received, ['previous', 'next', 'dismiss']);
});

test('unknown hardware actions are rejected', () => {
  assert.throws(() => publishDisplayAction('guess', new EventTarget()), /Unsupported/);
});
