import test from 'node:test';
import assert from 'node:assert/strict';
import { createDisplayMessage } from '../src/hardware/display-contract.js';
import {
  FAMILIAR_DISPLAY_EVENT,
  publishDisplayMessage,
  onDisplayMessage,
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
