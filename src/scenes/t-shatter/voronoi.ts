/**
 * The shatter's shard map (Transition A): a Voronoi diagram in the unit square, so the glass
 * breaks along believable seams. Pure geometry, computed once per visit.
 */
export type Pt = readonly [number, number];

/** Keeps the part of a convex polygon closer to `a` than to `b` (Sutherland–Hodgman). */
function clipTowards(poly: Pt[], a: Pt, b: Pt): Pt[] {
  const nx = b[0] - a[0];
  const ny = b[1] - a[1];
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const side = (p: Pt) => (p[0] - mx) * nx + (p[1] - my) * ny; // ≤ 0: on a's side
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]!;
    const q = poly[(i + 1) % poly.length]!;
    const sp = side(p);
    const sq = side(q);
    if (sp <= 0) out.push(p);
    if (sp <= 0 !== sq <= 0) {
      const t = sp / (sp - sq);
      out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
    }
  }
  return out;
}

/** One convex cell per seed, covering the unit square between them. */
export function voronoi(seeds: readonly Pt[]): Pt[][] {
  const square: Pt[] = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ];
  return seeds.map((seed, i) =>
    seeds.reduce((cell, other, j) => (i === j ? cell : clipTowards(cell, seed, other)), square),
  );
}

export function centroid(poly: readonly Pt[]): Pt {
  const n = poly.length || 1;
  return [poly.reduce((s, p) => s + p[0], 0) / n, poly.reduce((s, p) => s + p[1], 0) / n];
}

/** The cells' shared edges, each once, nearest to `origin` first: the order the cracks spread. */
export function seams(cells: readonly Pt[][], origin: Pt): { a: Pt; b: Pt; d: number }[] {
  const key = (p: Pt) => `${p[0].toFixed(4)},${p[1].toFixed(4)}`;
  const seen = new Set<string>();
  const edges: { a: Pt; b: Pt; d: number }[] = [];
  for (const cell of cells) {
    for (let i = 0; i < cell.length; i++) {
      const a = cell[i]!;
      const b = cell[(i + 1) % cell.length]!;
      const onBorder =
        (a[0] === b[0] && (a[0] <= 0 || a[0] >= 1)) || (a[1] === b[1] && (a[1] <= 0 || a[1] >= 1));
      if (onBorder) continue;
      const id = [key(a), key(b)].sort().join('|');
      if (seen.has(id)) continue;
      seen.add(id);
      const d = Math.min(
        Math.hypot(a[0] - origin[0], a[1] - origin[1]),
        Math.hypot(b[0] - origin[0], b[1] - origin[1]),
      );
      edges.push({ a, b, d });
    }
  }
  return edges.sort((x, y) => x.d - y.d);
}
