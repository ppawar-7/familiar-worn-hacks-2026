/**
 * FAMILIAR's browser-side handoff point.
 *
 * The social app publishes a validated display message on this event.
 * A future, verified device adapter can subscribe and translate it using
 * the official glasses SDK. No device API is called by this file.
 */
import { DISPLAY_ACTIONS, isDisplayMessage } from './display-contract.js';

export const FAMILIAR_DISPLAY_EVENT = 'familiar:display-message';

export function publishDisplayMessage(message, target = globalThis.window) {
  if (!isDisplayMessage(message)) {
    throw new TypeError('Cannot publish an invalid FAMILIAR display message');
  }
  if (!target || typeof target.dispatchEvent !== 'function' || typeof CustomEvent === 'undefined') {
    return false;
  }
  target.dispatchEvent(new CustomEvent(FAMILIAR_DISPLAY_EVENT, { detail: message }));
  return true;
}

/** Subscribe a future glasses adapter; call the returned function to detach. */
export function onDisplayMessage(handler, target = globalThis.window) {
  if (typeof handler !== 'function') throw new TypeError('A display-message handler is required');
  if (!target || typeof target.addEventListener !== 'function') {
    throw new TypeError('A compatible event target is required');
  }
  const listener = (event) => handler(event.detail);
  target.addEventListener(FAMILIAR_DISPLAY_EVENT, listener);
  return () => target.removeEventListener(FAMILIAR_DISPLAY_EVENT, listener);
}


export const FAMILIAR_DISPLAY_ACTION_EVENT = 'familiar:display-action';

/** Publish a button action from a future glasses input adapter back to the app. */
export function publishDisplayAction(action, target = globalThis.window) {
  if (!DISPLAY_ACTIONS.includes(action)) {
    throw new TypeError('Unsupported FAMILIAR display action');
  }
  if (!target || typeof target.dispatchEvent !== 'function' || typeof CustomEvent === 'undefined') {
    return false;
  }
  target.dispatchEvent(new CustomEvent(FAMILIAR_DISPLAY_ACTION_EVENT, { detail: action }));
  return true;
}

/** Subscribe the app to actions from a future, verified glasses input adapter. */
export function onDisplayAction(handler, target = globalThis.window) {
  if (typeof handler !== 'function') throw new TypeError('A display-action handler is required');
  if (!target || typeof target.addEventListener !== 'function') {
    throw new TypeError('A compatible event target is required');
  }
  const listener = (event) => handler(event.detail);
  target.addEventListener(FAMILIAR_DISPLAY_ACTION_EVENT, listener);
  return () => target.removeEventListener(FAMILIAR_DISPLAY_ACTION_EVENT, listener);
}
