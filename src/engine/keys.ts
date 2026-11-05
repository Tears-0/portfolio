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

/** True when Space or Enter would activate the focused element (a button, link, summary…). */
export function activates(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    target.closest('a[href], button, summary, [role="button"], label') !== null
  );
}
