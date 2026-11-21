import test from 'node:test';
import assert from 'node:assert/strict';
import { decideAlert } from '../src/core/decision.js';
import { getDemoPreset } from '../src/core/demo-presets.js';
import { toDisplayFrame } from '../src/hardware/glasses-adapter.js';

test('guided preset states match intended simulated progression', () => {
  assert.equal(decideAlert(getDemoPreset('idle')).level, 'idle');
  assert.equal(decideAlert(getDemoPreset('caution')).level, 'caution');
  assert.equal(decideAlert(getDemoPreset('warning')).level, 'warning');
  assert.equal(decideAlert(getDemoPreset('reset')).level, 'idle');
});

test('preset input is a copy; changes do not corrupt shared demo presets', () => {
  const original = getDemoPreset('warning');
  original.meters = 8;
  assert.equal(getDemoPreset('warning').meters, 0.8);
});

test('unknown preset is rejected', () => {
  assert.throws(() => getDemoPreset('not-an-event'));
});

test('hardware-neutral preview frame has explicit simulation source', () => {
  const result = decideAlert(getDemoPreset('warning'));
  const frame = toDisplayFrame(result);
  assert.deepEqual(frame, {
    source: 'simulated-demo',
    level: 'warning',
    title: 'PAUSE / LOOK UP',
    subtitle: 'MOCK ROAD BOUNDARY · DEMO ONLY',
  });
  assert.equal(Object.isFrozen(frame), true);
});

test('invalid frames are rejected', () => {
  assert.throws(() => toDisplayFrame({level: 'danger', headline:'a', detail:'b'}));
  assert.throws(() => toDisplayFrame({level: 'idle', headline: null, detail:'b'}));
});
