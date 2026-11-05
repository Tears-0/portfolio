const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** "Oct 2026" → "2026-10" (JSON Resume dates are ISO 8601). Anything else is left out. */
export function isoMonth(text: string | undefined): string | undefined {
  const match = text?.trim().match(/^([A-Za-z]{3})[a-z]*\.?\s+(\d{4})$/);
  if (!match) return undefined;
  const month = MONTHS.indexOf(match[1]!.toLowerCase());
  return month < 0 ? undefined : `${match[2]}-${String(month + 1).padStart(2, '0')}`;
}
