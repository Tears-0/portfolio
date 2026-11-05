/** True when a key press belongs to a text field rather than to page navigation. */
export function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

/**
 * True when a text field lets PageUp and PageDown page the descent anyway (the 1999
 * console's input): a single-line field has no use for them, and the console must never trap
 * the scroll.
 */
export const allowsPaging = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement && target.closest('[data-allow-paging]') !== null;

/** True when Space or Enter would activate the focused element (a button, link, summary…). */
export function activates(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    target.closest('a[href], button, summary, [role="button"], label') !== null
  );
}
