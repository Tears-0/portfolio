import { describe, expect, it } from 'vitest';
import { isoMonth } from '../../src/lib/dates';

describe('resume.json dates', () => {
  it('turns "Oct 2026" into an ISO month', () => {
    expect(isoMonth('Oct 2026')).toBe('2026-10');
    expect(isoMonth('February 2027')).toBe('2027-02');
    expect(isoMonth('Sept. 2025')).toBe('2025-09');
  });

  it('leaves anything else out rather than guessing', () => {
    expect(isoMonth('present')).toBeUndefined();
    expect(isoMonth('2026')).toBeUndefined();
    expect(isoMonth(undefined)).toBeUndefined();
  });
});
