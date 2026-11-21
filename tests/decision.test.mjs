import test from 'node:test';
import assert from 'node:assert/strict';
import { decideAlert } from '../src/core/decision.js';

const distracted = { lookingAtPhone: true };
test('no staged context never alerts, even close', () => {
  assert.equal(decideAlert({ context: 'none', meters: 0.5, ...distracted }).level, 'idle');
});
test('no phone attention => no alert in the staged demo', () => {
  assert.equal(decideAlert({ context: 'rail', meters: 0.5, lookingAtPhone: false }).level, 'idle');
});
test('staged person looking at phone, far boundary => idle', () => {
  assert.equal(decideAlert({ context: 'road', meters: 6, ...distracted }).level, 'idle');
});
test('staged person looking at phone, intermediate => caution', () => {
  const a = decideAlert({ context: 'object', meters: 2, ...distracted });
  assert.equal(a.level, 'caution');
  assert.equal(a.playTone, false);
});
test('staged person looking at phone, close => warning and tone', () => {
  const a = decideAlert({ context: 'rail', meters: 0.8, ...distracted });
  assert.equal(a.level, 'warning');
  assert.equal(a.playTone, true);
});
test('boundary values are deterministic', () => {
  assert.equal(decideAlert({ context: 'object', meters: 3, ...distracted }).level, 'caution');
  assert.equal(decideAlert({ context: 'object', meters: 1.2, ...distracted }).level, 'warning');
});
test('invalid simulated inputs rejected', () => {
  assert.throws(() => decideAlert({ context: 'object', meters: -1, ...distracted }));
  assert.throws(() => decideAlert({ context: 'unknown', meters: 2, ...distracted }));
  assert.throws(() => decideAlert({ context: 'object', meters: Infinity, ...distracted }));
  assert.throws(() => decideAlert({ context: 'object', meters: 2, lookingAtPhone: 'yes' }));
});
