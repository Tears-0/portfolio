import { describe, expect, it } from 'vitest';
import { centroid, seams, voronoi, type Pt } from '../../src/scenes/t-shatter/voronoi';

const area = (poly: readonly Pt[]) =>
  Math.abs(
    poly.reduce(
      (s, p, i) =>
        s + p[0] * poly[(i + 1) % poly.length]![1] - poly[(i + 1) % poly.length]![0] * p[1],
      0,
    ),
  ) / 2;

const seeds: Pt[] = [
  [0.2, 0.2],
  [0.8, 0.25],
  [0.5, 0.6],
  [0.15, 0.85],
  [0.85, 0.8],
];

describe('the shatter shard map', () => {
  it('splits the whole sheet of glass between the shards, with no gaps or overlaps', () => {
    const cells = voronoi(seeds);
    expect(cells).toHaveLength(seeds.length);
    expect(cells.reduce((s, c) => s + area(c), 0)).toBeCloseTo(1, 6);
  });

  it('keeps each shard around its own seed', () => {
    voronoi(seeds).forEach((cell, i) => {
      const [cx, cy] = centroid(cell);
      const nearest = seeds
        .map((s, j) => [j, Math.hypot(s[0] - cx, s[1] - cy)] as const)
        .sort((a, b) => a[1] - b[1])[0]![0];
      expect(nearest).toBe(i);
    });
  });

  it('lists each inner seam once, nearest to the crack origin first', () => {
    const edges = seams(voronoi(seeds), [0, 0]);
    expect(edges.length).toBeGreaterThan(0);
    for (let i = 1; i < edges.length; i++)
      expect(edges[i]!.d).toBeGreaterThanOrEqual(edges[i - 1]!.d);
    const ids = edges.map((e) =>
      [e.a, e.b]
        .map((p) => p.map((v) => v.toFixed(4)).join(','))
        .sort()
        .join('|'),
    );
    expect(new Set(ids).size).toBe(ids.length);
  });
});
