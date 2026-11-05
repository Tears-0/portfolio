import { seeded, toPath, type Point } from '../geometry';

/**
 * The loading screen's constellations (storyboard P3–P4): stars that link into the
 * destination's sign. Centred on 0,0; the sign spans about ±150 units.
 */
export type SignKind = 'circuit' | 'gear' | 'astrolabe';

export interface Sign {
  lines: string[];
  stars: Point[];
}

const scale =
  (k: number) =>
  (pts: readonly Point[]): Point[] =>
    pts.map(([x, y]) => [x * k, y * k]);

function circuit(): Sign {
  const traces: Point[][] = [
    [
      [-80, -10],
      [-40, -10],
      [-40, -50],
      [10, -50],
    ],
    [
      [10, -50],
      [60, -50],
      [60, -10],
      [90, -10],
    ],
    [
      [-40, -10],
      [-40, 40],
      [0, 40],
    ],
    [
      [60, -10],
      [60, 50],
      [20, 50],
    ],
  ];
  const lines = traces.map(scale(1.7));
  const stars = lines.flatMap((l) => [l[0]!, l[l.length - 1]!]);
  return { lines: lines.map((l) => toPath(l)), stars };
}

function gear(): Sign {
  const rim: Point[] = Array.from({ length: 32 }, (_, i) => {
    const a = (i / 32) * Math.PI * 2;
    const r = i % 4 < 2 ? 120 : 92;
    return [r * Math.cos(a), r * Math.sin(a)];
  });
  const spokes: Point[][] = [0, 1, 2, 3].map((i) => {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    return [
      [0, 0],
      [58 * Math.cos(a), 58 * Math.sin(a)],
    ];
  });
  return {
    lines: [toPath(rim, true), ...spokes.map((s) => toPath(s))],
    stars: [...rim.filter((_, i) => i % 2 === 0), ...spokes.map((s) => s[1]!), [0, 0]],
  };
}

function astrolabe(): Sign {
  const ring = (r: number, n: number): Point[] =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return [r * Math.cos(a), r * Math.sin(a)];
    });
  const outer = ring(120, 12);
  const inner = ring(64, 6);
  return {
    lines: [
      toPath(outer, true),
      toPath(inner, true),
      toPath([
        [-120, 0],
        [120, 0],
      ]),
      toPath([
        [0, -120],
        [0, 120],
      ]),
    ],
    stars: [...outer, ...inner, [0, 0]],
  };
}

export const SIGNS: Record<SignKind, Sign> = {
  circuit: circuit(),
  gear: gear(),
  astrolabe: astrolabe(),
};

/** The field of stars the sign forms out of: deterministic, so builds are reproducible. */
export function starField(count: number, width: number, height: number, seed = 7) {
  const random = seeded(seed);
  return Array.from({ length: count }, () => ({
    x: (random() - 0.5) * width,
    y: (random() - 0.5) * height,
    r: random() < 0.12 ? 1.6 : 0.9,
    o: 0.25 + random() * 0.6,
  }));
}
