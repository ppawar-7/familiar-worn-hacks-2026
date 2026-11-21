/**
 * Reproducible, manually staged demo presets. These are not sensor readings.
 * Numeric thresholds here are never real-world safety guidance.
 */
export const DEMO_PRESETS = Object.freeze({
  idle: Object.freeze({ context: 'road', lookingAtPhone: true, meters: 6 }),
  caution: Object.freeze({ context: 'road', lookingAtPhone: true, meters: 2 }),
  warning: Object.freeze({ context: 'road', lookingAtPhone: true, meters: 0.8 }),
  reset: Object.freeze({ context: 'none', lookingAtPhone: false, meters: 6 }),
});

export function getDemoPreset(name) {
  if (!Object.hasOwn(DEMO_PRESETS, name)) throw new Error('Unknown demo preset');
  return { ...DEMO_PRESETS[name] };
}
