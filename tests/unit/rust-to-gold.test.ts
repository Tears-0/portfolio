import { describe, expect, it } from 'vitest';
import {
  GOLD,
  INDIGO,
  PARCHMENT,
  noiseField,
  pixel,
  reached,
  stageWeights,
  type RGB,
} from '../../src/scenes/t-rust-to-gold/material';

const iron: RGB = [28, 20, 16];
const close = (a: RGB, b: RGB, tolerance = 2) =>
  a.every((v, i) => Math.abs(v - b[i]!) <= tolerance);

describe('the rust-to-gold material', () => {
  it('leaves the wall exactly as Act III left it at the start', () => {
    for (const n of [0, 0.3, 0.9]) {
      expect(close(pixel(iron, n, 0.5, false, stageWeights(0)), iron)).toBe(true);
    }
  });

  it('rusts the rivets first', () => {
    const w = stageWeights(10);
    const nearRivet = pixel(iron, 0.5, 1, false, w);
    const farAway = pixel(iron, 0.5, 0, false, w);
    expect(close(farAway, iron)).toBe(true);
    expect(close(nearRivet, iron)).toBe(false);
  });

  it('turns the plates to parchment and the seams to gold leaf before the burn', () => {
    const w = stageWeights(80);
    expect(close(pixel(iron, 0.95, 0, false, w), PARCHMENT, 4)).toBe(true);
    expect(close(pixel(iron, 0.95, 0, true, w), GOLD, 4)).toBe(true);
  });

  it('ends on the night sky everywhere, with a gold edge along the way', () => {
    const end = stageWeights(100);
    for (const n of [0, 0.4, 0.99]) expect(pixel(iron, n, 0.5, false, end)).toEqual(INDIGO);
    const mid = stageWeights(87);
    const samples = Array.from({ length: 200 }, (_, i) => pixel(iron, i / 200, 0.5, false, mid));
    expect(samples.some((c) => c === INDIGO)).toBe(true);
    expect(samples.some((c) => close(c, GOLD, 30))).toBe(true);
  });

  it('spreads each change with a soft front that finishes on time', () => {
    expect(reached(0.5, 0)).toBe(0);
    expect(reached(0, 1)).toBe(1);
    expect(reached(1, 1)).toBe(1);
    expect(reached(0.5, 0.5)).toBeGreaterThan(0);
    expect(reached(0.5, 0.5)).toBeLessThan(1);
  });

  it('makes smooth, repeatable noise in range', () => {
    const a = noiseField(64, 36);
    expect(noiseField(64, 36)).toEqual(a);
    expect(Math.min(...a)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...a)).toBeLessThanOrEqual(1);
    // Neighbours are close: smooth, not static.
    let jump = 0;
    for (let i = 1; i < 64; i++) jump = Math.max(jump, Math.abs(a[i]! - a[i - 1]!));
    expect(jump).toBeLessThan(0.2);
  });
});
