import { describe, expect, it } from 'vitest';
import { STEP_MS, erasBack } from '../../src/engine/time-machine';

const JUMPS = 3; // 1999, 1888, 1350

describe('holding the time machine', () => {
  it('reaches no era before 1.5 s, so releasing cancels', () => {
    expect(erasBack(0, JUMPS)).toBe(0);
    expect(erasBack(STEP_MS - 1, JUMPS)).toBe(0);
  });

  it('travels one era further back every 1.5 s', () => {
    expect(erasBack(1500, JUMPS)).toBe(1);
    expect(erasBack(3000, JUMPS)).toBe(2);
    expect(erasBack(4500, JUMPS)).toBe(3);
  });

  it('stops at 1350 however long the hold', () => {
    expect(erasBack(20_000, JUMPS)).toBe(3);
  });
});
