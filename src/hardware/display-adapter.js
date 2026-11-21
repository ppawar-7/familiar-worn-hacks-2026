/**
 * Generic bridge between FAMILIAR messages and a verified device SDK.
 *
 * This file deliberately knows nothing about a glasses vendor. The teammate
 * supplies showText/clearText/subscribeControls using the exact official SDK.
 */
import { onDisplayMessage, publishDisplayAction } from './display-events.js';

export function connectDisplayAdapter({
  showText,
  clearText,
  subscribeControls,
  eventTarget = globalThis.window,
  onError = () => {},
} = {}) {
  if (typeof showText !== 'function' || typeof clearText !== 'function') {
    throw new TypeError('Provide verified showText and clearText functions');
  }

  const stopMessages = onDisplayMessage(async (message) => {
    try {
      if (!message.visible) {
        await clearText();
        return;
      }
      await showText({
        feature: message.feature,
        title: message.title,
        body: message.body,
        cardIndex: message.cardIndex,
        cardCount: message.cardCount,
      });
    } catch (error) {
      onError(error, message);
    }
  }, eventTarget);

  const stopControls = typeof subscribeControls === 'function'
    ? (subscribeControls((action) => publishDisplayAction(action, eventTarget)) || (() => {}))
    : (() => {});

  let connected = true;
  return () => {
    if (!connected) return;
    connected = false;
    stopMessages();
    stopControls();
  };
}
