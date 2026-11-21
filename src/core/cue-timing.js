/**
 * Deterministic schedule for FAMILIAR's optional timed-cue PREVIEW.
 * The timer runner is in the browser app. This is not a mobile background
 * service and does not send messages to real glasses.
 */
export const CUE_INTERVAL_SECONDS = Object.freeze([10, 30, 60, 120]);
export const CUE_VISIBLE_MS = 7000;

export function createCueTimeline(cardCount, intervalSeconds = 30, visibleMs = CUE_VISIBLE_MS) {
  if (!Number.isInteger(cardCount) || cardCount < 1 || cardCount > 20) {
    throw new RangeError('Card count must be between 1 and 20');
  }
  if (!CUE_INTERVAL_SECONDS.includes(intervalSeconds)) {
    throw new RangeError('Unsupported cue interval');
  }
  const intervalMs = intervalSeconds * 1000;
  if (!Number.isInteger(visibleMs) || visibleMs < 1000 || visibleMs >= intervalMs) {
    throw new RangeError('Visible time must be shorter than the interval');
  }
  return Object.freeze(Array.from({ length: cardCount }, (_, index) => Object.freeze({
    cardIndex: index,
    showAtMs: (index + 1) * intervalMs,
    hideAtMs: (index + 1) * intervalMs + visibleMs,
  })));
}

/** Time left until the next cue, in rounded-up whole seconds, or null when done. */
export function secondsUntilNextCue(timeline, elapsedMs) {
  if (!Array.isArray(timeline) || !Number.isFinite(elapsedMs) || elapsedMs < 0) {
    throw new TypeError('Invalid timeline or elapsed time');
  }
  const next = timeline.find((entry) => entry.showAtMs > elapsedMs);
  return next ? Math.ceil((next.showAtMs - elapsedMs) / 1000) : null;
}
