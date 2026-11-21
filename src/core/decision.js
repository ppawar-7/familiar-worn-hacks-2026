/**
 * Familiar: SIMULATED attention/proximity demo.
 * Inputs `meters`, `context`, and `lookingAtPhone` are manually staged.
 * Neither context nor distance is inferred from real sensors.
 * Thresholds are arbitrary DEMO numbers, not safe distances.
 */
export const CONTEXTS = Object.freeze({
  none: { label: 'No staged boundary', cue: '' },
  object: { label: 'Staged object', cue: 'LOOK UP: OBJECT' },
  road: { label: 'Mock road boundary', cue: 'LOOK UP: BOUNDARY' },
  rail: { label: 'Mock platform boundary', cue: 'LOOK UP: BOUNDARY' },
});

export function decideAlert({ context = 'none', meters = 8, lookingAtPhone = false } = {}) {
  if (!(context in CONTEXTS)) throw new Error('Unknown simulated scenario');
  if (!Number.isFinite(meters) || meters < 0) throw new Error('Invalid simulated distance');
  if (typeof lookingAtPhone !== 'boolean') throw new Error('Invalid simulated attention flag');

  if (context === 'none' || !lookingAtPhone || meters > 3) {
    return {
      level: 'idle', headline: 'NO SIMULATED ALERT',
      detail: !lookingAtPhone ? 'Phone attention: OFF' : 'Waiting for staged event',
      playTone: false,
    };
  }
  if (meters > 1.2) {
    return {
      level: 'caution', headline: CONTEXTS[context].cue,
      detail: 'SIMULATED APPROACH — PAY ATTENTION', playTone: false,
    };
  }
  return {
    level: 'warning', headline: 'PAUSE / LOOK UP',
    detail: `${CONTEXTS[context].label.toUpperCase()} · DEMO ONLY`, playTone: true,
  };
}
