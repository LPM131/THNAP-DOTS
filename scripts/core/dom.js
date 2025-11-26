// dom.js — helper utilities
export const qs = (sel) => document.querySelector(sel);
export const qsa = (sel) => document.querySelectorAll(sel);

export function on(el, event, handler, opts) {
  el.addEventListener(event, handler, opts);
}
