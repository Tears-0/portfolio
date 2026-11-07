import { seeded } from '../geometry';

/**
 * Transition C's material, as pure functions of the scroll position (map vh from the start of
 * the transition): the engine wall rusts from its rivets, glows amber as if heated, cools into
 * parchment with gold-leaf seams, then burns away along a gold edge to the night sky. The scene
 * runs this per pixel on a small canvas; noise decides where each change reaches first.
 */
export type RGB = readonly [number, number, number];

export const RUST: RGB = [138, 59, 18];
export const AMBER: RGB = [242, 162, 58];
export const PARCHMENT: RGB = [244, 234, 213];
export const GOLD: RGB = [217, 180, 90];
export const INDIGO: RGB = [16, 22, 58];

/** Stage windows (map vh): C-1 rust, C-2 glow, C-3 parchment, C-4 burn to the sky. */
export const STAGES = {
  rust: [0, 32],
  glow: [26, 60],
  parchment: [54, 80],
  burn: [74, 100],
} as const;

/** How wide (in noise units) the change's soft front is, and the gold edge of the burn. */
const FRONT = 0.16;
const EDGE = 0.07;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const progress = ([from, to]: readonly [number, number], t: number) =>
  clamp01((t - from) / (to - from));
const mix = (a: RGB, b: RGB, k: number): RGB => [
  a[0] + (b[0] - a[0]) * k,
  a[1] + (b[1] - a[1]) * k,
  a[2] + (b[2] - a[2]) * k,
];

/**
 * How far a change has reached a pixel whose noise key is `key` (0–1), when the change as a
 * whole is `p` of the way through: low keys go first, with a soft front, all done at p = 1.
 */
export const reached = (key: number, p: number): number =>
  p >= 1 ? 1 : clamp01((p * (1 + FRONT) - key) / FRONT);

/** Smooth value noise in 0–1, `w` × `h`, a few octaves; deterministic for a seed. */
export function noiseField(w: number, h: number, seed = 1888): Float32Array {
  const rand = seeded(seed);
  const out = new Float32Array(w * h);
  const octaves = [
    { cell: 32, weight: 0.55 },
    { cell: 12, weight: 0.3 },
    { cell: 5, weight: 0.15 },
  ];
  for (const { cell, weight } of octaves) {
    const gw = Math.ceil(w / cell) + 2;
    const gh = Math.ceil(h / cell) + 2;
    const grid = Float32Array.from({ length: gw * gh }, () => rand());
    for (let y = 0; y < h; y++) {
      const gy = y / cell;
      const y0 = Math.floor(gy);
      const fy = gy - y0;
      const sy = fy * fy * (3 - 2 * fy);
      for (let x = 0; x < w; x++) {
        const gx = x / cell;
        const x0 = Math.floor(gx);
        const fx = gx - x0;
        const sx = fx * fx * (3 - 2 * fx);
        const i = y0 * gw + x0;
        const top = grid[i]! + (grid[i + 1]! - grid[i]!) * sx;
        const bottom = grid[i + gw]! + (grid[i + gw + 1]! - grid[i + gw]!) * sx;
        out[y * w + x]! += (top + (bottom - top) * sy) * weight;
      }
    }
  }
  return out;
}

export interface Weights {
  rust: number;
  glow: number;
  parchment: number;
  burn: number;
}

/** Each stage's overall progress (0–1) at `t`. */
export const stageWeights = (t: number): Weights => ({
  rust: progress(STAGES.rust, t),
  glow: progress(STAGES.glow, t),
  parchment: progress(STAGES.parchment, t),
  burn: progress(STAGES.burn, t),
});

/**
 * One pixel's colour. `base` is the wall as Act III left it, `noise` its noise (0–1), `rivet`
 * how close it is to a rivet (1 on one, 0 far away) and `seam` whether it lies on a plate seam.
 */
export function pixel(base: RGB, noise: number, rivet: number, seam: boolean, w: Weights): RGB {
  // Rust starts at the rivets and spreads; heat and cooling follow the rust's pattern.
  const rustKey = noise * 0.65 + (1 - rivet) * 0.35;
  let c = mix(base, mix(RUST, base, noise * 0.35), reached(rustKey, w.rust));
  c = mix(c, AMBER, reached(rustKey, w.glow) * 0.85);
  const cooled = reached(1 - noise, w.parchment);
  c = mix(c, seam ? GOLD : PARCHMENT, cooled);
  // The parchment burns away to the night sky, with a gold edge along the front.
  const burnKey = noise;
  const front = w.burn * (1 + EDGE * 2) - EDGE;
  if (w.burn > 0 && burnKey < front + EDGE) {
    if (burnKey < front - EDGE) return INDIGO;
    const edge = 1 - Math.abs(burnKey - front) / EDGE;
    return mix(c, GOLD, clamp01(edge * 1.4));
  }
  return c;
}
