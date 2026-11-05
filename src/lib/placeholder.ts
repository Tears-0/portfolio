/** Drafted text that still needs the owner's input starts with "[add" or "[confirm". */
const PLACEHOLDER = /^\[(add|confirm)\b/i;
const CONTAINS_PLACEHOLDER = /\[(add|confirm)\b/i;

export const isPlaceholder = (text: string): boolean => PLACEHOLDER.test(text.trim());

/** True when any part of the text is still a gap to fill; the page marks it as a draft. */
export const hasPlaceholder = (text: string | undefined): boolean =>
  text !== undefined && CONTAINS_PLACEHOLDER.test(text);

export const wordCount = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length;
