/**
 * FAMILIAR display contract v1.
 *
 * This is the agreed software-to-hardware boundary for the team.
 * It is NOT a glasses SDK. The hardware teammate should translate these
 * fields into the exact documented API after verifying Hello World on-device.
 *
 * Keep this contract independent of any particular glasses vendor:
 *   feature, title, body, cardIndex, cardCount, actions, visible
 *
 * Do not add guessed pixel sizes, font names, coordinates, or SDK methods here.
 */

export const DISPLAY_SCHEMA = 'familiar.display.v1';
export const DISPLAY_ACTIONS = Object.freeze(['previous', 'next', 'dismiss']);

function safeText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

export function createDisplayMessage({
  feature,
  title = '',
  body = '',
  cardIndex = 0,
  cardCount = 1,
  visible = true,
} = {}) {
  if (!['conversation', 'navigator'].includes(feature)) {
    throw new Error('Unsupported FAMILIAR display feature');
  }
  if (!Number.isInteger(cardIndex) || !Number.isInteger(cardCount) ||
      cardCount < 1 || cardIndex < 0 || cardIndex >= cardCount) {
    throw new Error('Invalid display card position');
  }
  if (typeof visible !== 'boolean') throw new TypeError('visible must be boolean');
  if (visible && (!safeText(title, 48) || !safeText(body, 120))) {
    throw new Error('Visible display messages need a title and body');
  }

  return Object.freeze({
    schema: DISPLAY_SCHEMA,
    feature,
    visible,
    title: visible ? safeText(title, 48) : '',
    body: visible ? safeText(body, 120) : '',
    cardIndex,
    cardCount,
    actions: DISPLAY_ACTIONS,
  });
}

export function isDisplayMessage(message) {
  return Boolean(
    message &&
    message.schema === DISPLAY_SCHEMA &&
    ['conversation', 'navigator'].includes(message.feature) &&
    typeof message.visible === 'boolean' &&
    typeof message.title === 'string' &&
    typeof message.body === 'string' &&
    Number.isInteger(message.cardIndex) &&
    Number.isInteger(message.cardCount) &&
    message.cardCount > 0 &&
    message.cardIndex >= 0 &&
    message.cardIndex < message.cardCount &&
    Array.isArray(message.actions) &&
    DISPLAY_ACTIONS.every((action) => message.actions.includes(action))
  );
}
