/** Small build-time helpers for drawing SVG paths from points (no browser code). */
export type Point = readonly [number, number];

/** Catmull–Rom through every point: smooth, organic outlines from a handful of points. */
export function smooth(points: readonly Point[], closed = true, steps = 8): Point[] {
  const out: Point[] = [];
  const n = points.length;
  const at = (i: number) =>
    closed ? points[(i + n) % n]! : points[Math.max(0, Math.min(n - 1, i))]!;
  const segments = closed ? n : n - 1;
  for (let i = 0; i < segments; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    for (let k = 0; k < steps; k++) {
      const t = k / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      const axis = (j: 0 | 1) =>
        0.5 *
        (2 * p1[j] +
          (-p0[j] + p2[j]) * t +
          (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 +
          (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3);
      out.push([axis(0), axis(1)]);
    }
  }
  if (!closed) out.push(points[n - 1]!);
  return out;
}

export function toPath(points: readonly Point[], closed = false): string {
  const d = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
  return closed ? `${d}Z` : d;
}

/** A ring whose radius ripples: r + amp·sin(waves·θ). */
export function wavyRing(cx: number, cy: number, r: number, amp: number, waves: number): string {
  const points: Point[] = Array.from({ length: 120 }, (_, i) => {
    const a = (i / 120) * Math.PI * 2;
    const rr = r + amp * Math.sin(waves * a);
    return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
  });
  return toPath(points, true);
}

/** Deterministic pseudo-random numbers, so builds are reproducible. */
export function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}
