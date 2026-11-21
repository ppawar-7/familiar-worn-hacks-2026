import test from 'node:test';
import assert from 'node:assert/strict';
import { createDisplayMessage } from '../src/hardware/display-contract.js';
import { publishDisplayMessage, onDisplayAction } from '../src/hardware/display-events.js';
import { connectDisplayAdapter } from '../src/hardware/display-adapter.js';

test('generic adapter forwards visible cards and clear requests to supplied device functions', async () => {
  const target = new EventTarget();
  const shown = [];
  let cleared = 0;
  const disconnect = connectDisplayAdapter({
    eventTarget: target,
    showText: async (message) => shown.push(message),
    clearText: async () => { cleared += 1; },
  });
  publishDisplayMessage(createDisplayMessage({
    feature: 'conversation', title: 'SUNNY', body: 'You met at Worn Hacks',
    cardIndex: 0, cardCount: 2,
  }), target);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(shown.length, 1);
  assert.equal(shown[0].title, 'SUNNY');
  publishDisplayMessage(createDisplayMessage({
    feature: 'conversation', title: 'SUNNY', body: 'You met at Worn Hacks',
    cardIndex: 0, cardCount: 2, visible: false,
  }), target);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(cleared, 1);
  disconnect();
});

test('generic adapter sends hardware button actions back to the app', () => {
  const target = new EventTarget();
  let emitButton;
  const received = [];
  const stop = onDisplayAction((action) => received.push(action), target);
  const disconnect = connectDisplayAdapter({
    eventTarget: target,
    showText: async () => {},
    clearText: async () => {},
    subscribeControls: (emit) => { emitButton = emit; return () => { emitButton = null; }; },
  });
  emitButton('next');
  emitButton('dismiss');
  assert.deepEqual(received, ['next', 'dismiss']);
  disconnect();
  stop();
  assert.equal(emitButton, null);
});
