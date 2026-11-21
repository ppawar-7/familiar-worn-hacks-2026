import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCueTimeline,
  secondsUntilNextCue,
  CUE_INTERVAL_SECONDS,
  CUE_VISIBLE_MS,
} from '../src/core/cue-timing.js';

test('timed preview shows one cue after each interval, then clears after seven seconds', () => {
  const timeline = createCueTimeline(3, 30);
  assert.deepEqual(timeline, [
    { cardIndex: 0, showAtMs: 30000, hideAtMs: 37000 },
    { cardIndex: 1, showAtMs: 60000, hideAtMs: 67000 },
    { cardIndex: 2, showAtMs: 90000, hideAtMs: 97000 },
  ]);
  assert.ok(Object.isFrozen(timeline));
  assert.ok(Object.isFrozen(timeline[0]));
});

test('all time intervals work for the demo', () => {
  assert.deepEqual(CUE_INTERVAL_SECONDS, [10, 30, 60, 120]);
  for (const seconds of CUE_INTERVAL_SECONDS) {
    const timeline = createCueTimeline(2, seconds);
    assert.equal(timeline[0].showAtMs, seconds * 1000);
    assert.equal(timeline[1].showAtMs, seconds * 2000);
    assert.equal(timeline[1].hideAtMs - timeline[1].showAtMs, CUE_VISIBLE_MS);
  }
});

test('countdown finds next cue and stops after the last one', () => {
  const timeline = createCueTimeline(2, 10);
  assert.equal(secondsUntilNextCue(timeline, 0), 10);
  assert.equal(secondsUntilNextCue(timeline, 9100), 1);
  assert.equal(secondsUntilNextCue(timeline, 10000), 10);
  assert.equal(secondsUntilNextCue(timeline, 19001), 1);
  assert.equal(secondsUntilNextCue(timeline, 20000), null);
});

test('invalid schedule values are rejected', () => {
  assert.throws(() => createCueTimeline(0), /Card count/);
  assert.throws(() => createCueTimeline(21), /Card count/);
  assert.throws(() => createCueTimeline(1.2), /Card count/);
  assert.throws(() => createCueTimeline(2, 1), /interval/);
  assert.throws(() => createCueTimeline(2, 10, 10000), /Visible time/);
  assert.throws(() => createCueTimeline(2, 10, 0), /Visible time/);
  assert.throws(() => secondsUntilNextCue(null, 1000), /Invalid/);
  assert.throws(() => secondsUntilNextCue([], -1), /Invalid/);
});
