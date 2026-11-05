import { seeded } from '../geometry';
import { centroid, seams, voronoi, type Pt } from './voronoi';

/**
 * Transition A's choreography as pure functions of the scroll position (vh from the start of
 * the transition), so every frame is the same in both directions and is tested without a
 * browser. Geometry is in the unit square; the renderer scales it to the screen.
 */

/** A-1 (0–25 vh): cracks spread from the HUD ring. A-2 (25–70 vh): shards fall. */
export const CRACK_TO = 25;
export const FALL_FROM = 25;
export const FALL_SPREAD = 18; // the farthest shard lets go this much after the nearest
export const FALL_FOR = 23; // vh a shard takes to fall out of view (±3): all gone by 70 vh

export interface Shard {
  poly: Pt[];
  centre: Pt;
  start: number; // vh it lets go
  duration: number; // vh it takes to fall
  drift: number; // sideways travel, in screen widths
  drop: number; // fall, in screen heights
  spin: number; // radians by the end of the fall
  sheen: number; // 0–1: how much light this piece catches
}

export interface Crack {
  a: Pt; // the end nearer the impact
  b: Pt;
  d: number; // distance of `a` from the impact
  e: number; // distance of `b` from the impact
}

export interface ShardMap {
  shards: Shard[];
  cracks: Crack[];
  reach: number; // distance of the farthest crack end from the impact
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const dist = (p: Pt, q: Pt) => Math.hypot(p[0] - q[0], p[1] - q[1]);

/**
 * The glass breaks around an impact point: small shards near it, larger ones farther out
 * (seeds bunch toward the impact). Deterministic for a given seed.
 */
export function shardMap(impact: Pt, count = 34, seed = 2099): ShardMap {
  const rand = seeded(seed);
  const seeds: Pt[] = [];
  const near = Math.round(count * 0.3);
  for (let i = 0; i < count; i++) {
    if (i < near) {
      const r = 0.03 + rand() * 0.16;
      const a = rand() * Math.PI * 2;
      seeds.push([
        clamp01(impact[0] + Math.cos(a) * r * 0.62),
        clamp01(impact[1] + Math.sin(a) * r),
      ]);
    } else {
      seeds.push([0.02 + rand() * 0.96, 0.02 + rand() * 0.96]);
    }
  }
  const cells = voronoi(seeds).filter((cell) => cell.length >= 3);
  const far = Math.max(...cells.map((cell) => dist(centroid(cell), impact)), 0.0001);

  const shards = cells.map((poly): Shard => {
    const centre = centroid(poly);
    const away = centre[0] - impact[0];
    return {
      poly,
      centre,
      start: FALL_FROM + (dist(centre, impact) / far) * FALL_SPREAD,
      duration: FALL_FOR - 3 + rand() * 6,
      drift: Math.sign(away || 1) * (0.03 + rand() * 0.09),
      drop: 1.15 + rand() * 0.45,
      spin: (rand() - 0.5) * 1.8,
      sheen: rand(),
    };
  });

  const cracks = seams(cells, impact).map(({ a, b }): Crack => {
    const [p, q] = dist(a, impact) <= dist(b, impact) ? [a, b] : [b, a];
    return { a: p, b: q, d: dist(p, impact), e: dist(q, impact) };
  });
  const reach = Math.max(...cracks.map((c) => c.e), 0.0001);
  return { shards, cracks, reach };
}

/** How far the cracks have spread at `t`, as a distance from the impact (a quick start). */
export function crackReach(t: number, reach: number): number {
  const p = clamp01(t / CRACK_TO);
  return reach * p ** 0.8;
}

/** The part (0–1) of a crack drawn once the cracks have spread `spread` from the impact. */
export function crackDrawn(crack: Crack, spread: number): number {
  if (spread <= crack.d) return 0;
  const span = crack.e - crack.d;
  return span < 1e-6 ? 1 : clamp01((spread - crack.d) / span);
}

export interface Pose {
  /** 0 while still in place, 1 once fallen out of view. */
  fallen: number;
  dx: number; // screen widths
  dy: number; // screen heights
  rotate: number; // radians
  scale: number;
  alpha: number;
}

/** Where a shard is at `t`: it lets go, then falls under gravity, turning and receding. */
export function shardPose(shard: Shard, t: number): Pose {
  const p = clamp01((t - shard.start) / shard.duration);
  return {
    fallen: p,
    dx: shard.drift * p,
    dy: shard.drop * p * p,
    rotate: shard.spin * p,
    scale: 1 - 0.18 * p,
    alpha: clamp01((1 - p) / 0.3),
  };
}
