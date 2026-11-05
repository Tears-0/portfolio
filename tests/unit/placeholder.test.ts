import { describe, expect, it } from 'vitest';
import { hasPlaceholder, isPlaceholder, wordCount } from '../../src/lib/placeholder';

describe('draft placeholders', () => {
  it('recognises a value that is still a gap', () => {
    expect(isPlaceholder('[add 60–100 words]')).toBe(true);
    expect(isPlaceholder('[confirm] Solo')).toBe(true);
    expect(isPlaceholder('Solo')).toBe(false);
  });

  it('finds gaps inside longer text', () => {
    expect(hasPlaceholder('Open to graduate roles from [month]')).toBe(false);
    expect(hasPlaceholder('Graduate roles from [add month and year]')).toBe(true);
    expect(hasPlaceholder(undefined)).toBe(false);
  });

  it('counts words for the content limits', () => {
    expect(wordCount('I build systems at the edge of thought. Welcome to the quiet future.')).toBe(
      13,
    );
    expect(wordCount('  ')).toBe(0);
  });
});
