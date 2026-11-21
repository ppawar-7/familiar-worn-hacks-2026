/**
 * Browser-only preview adapter. NO real glasses APIs are used here.
 * Verify and document the event SDK before creating a separate hardware sink.
 *
 * `toDisplayFrame` is an intentionally small, transport-neutral shape
 * that a future SDK adapter can translate after a real Hello World test.
 */
export function toDisplayFrame({ level, headline, detail }) {
  if (!['idle', 'caution', 'warning'].includes(level)) {
    throw new Error('Invalid display level');
  }
  if (typeof headline !== 'string' || typeof detail !== 'string') {
    throw new Error('Invalid display text');
  }
  return Object.freeze({
    source: 'simulated-demo',
    level,
    title: headline,
    subtitle: detail,
  });
}

export function renderHudPreview(result) {
  const frame = toDisplayFrame(result);
  const panel = document.querySelector('#hud');
  const main = document.querySelector('#hud-main');
  const secondary = document.querySelector('#hud-detail');
  panel.dataset.level = frame.level;
  main.textContent = frame.title;
  secondary.textContent = frame.subtitle;
  return frame;
}
