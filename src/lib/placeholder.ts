/** Drafted text that still needs the owner's input starts with "[add" or "[confirm". */
const PLACEHOLDER = /^\[(add|confirm)\b/i;
const CONTAINS_PLACEHOLDER = /\[(add|confirm)\b/i;
const MISSING = /\[add\b/i;
const CONFIRM_MARKER = /\[confirm\b[^\]]*\]\s*/gi;

/** Drafts show (underlined) in the dev server; production pages never show a gap. */
export const SHOW_DRAFTS: boolean = import.meta.env.DEV;

export const isPlaceholder = (text: string): boolean => PLACEHOLDER.test(text.trim());

/** True when any part of the text is still a gap to fill; the page marks it as a draft. */
export const hasPlaceholder = (text: string | undefined): boolean =>
  text !== undefined && CONTAINS_PLACEHOLDER.test(text);

export const wordCount = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length;

/**
 * Text as a page may show it. With drafts on, it is returned as written. Otherwise anything
 * still missing ("[add …]") is left out, and "[confirm …]" markers are dropped from wording
 * that is already there.
 */
export function publishText(text: string | undefined, drafts = SHOW_DRAFTS): string | undefined {
  if (text === undefined || drafts) return text;
  if (MISSING.test(text)) return undefined;
  return text.replace(CONFIRM_MARKER, '').trim() || undefined;
}

/**
 * A number may only appear once it and its source are confirmed (the spec's claims audit),
 * so a metric with any gap is left out of production pages entirely.
 */
export function publishMetric<T extends { value: string; source: string }>(
  metric: T | undefined,
  drafts = SHOW_DRAFTS,
): T | undefined {
  if (!metric || drafts) return metric;
  return hasPlaceholder(metric.value) || hasPlaceholder(metric.source) ? undefined : metric;
}
