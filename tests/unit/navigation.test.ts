import { describe, expect, it } from 'vitest';
import {
  anchorToVh,
  lastRest,
  nextRest,
  prevRest,
  travelSeconds,
  vhToY,
  yToVh,
} from '../../src/engine/navigation';

describe('keyboard paging', () => {
  it('steps forward through rest points', () => {
    expect(nextRest(0)).toBe(30);
    expect(nextRest(30)).toBe(100);
    expect(nextRest(100)).toBe(300);
    expect(nextRest(455)).toBe(640);
  });

  it('moves on even when sitting a hair before a rest point', () => {
    expect(nextRest(299.8)).toBe(340);
  });

  it('stops after the contact portal', () => {
    expect(lastRest()).toBe(1080);
    expect(nextRest(1080)).toBeUndefined();
  });

  it('steps back, and from the first rest returns to the top', () => {
    expect(prevRest(340)).toBe(300);
    expect(prevRest(250)).toBe(100);
    expect(prevRest(30)).toBe(0);
    expect(prevRest(0)).toBe(0);
  });
});

describe('deep links', () => {
  it('resolves known anchors and ignores the rest', () => {
    expect(anchorToVh('#works')).toBe(300);
    expect(anchorToVh('#contact')).toBe(1080);
    expect(anchorToVh('#nope')).toBeUndefined();
    expect(anchorToVh('#constructor')).toBeUndefined();
    expect(anchorToVh('')).toBeUndefined();
  });
});

describe('scroll conversions and travel', () => {
  it('converts between vh and pixels', () => {
    expect(vhToY(250, 1000)).toBe(2500);
    expect(yToVh(2500, 1000)).toBe(250);
  });

  it('travels quickly between neighbours and caps long jumps', () => {
    expect(travelSeconds(300, 300)).toBe(0);
    expect(travelSeconds(300, 340)).toBeLessThan(0.5);
    expect(travelSeconds(0, 1100)).toBeCloseTo(1.6);
    expect(travelSeconds(0, 5000)).toBe(1.6);
  });
});
