/**
 * The engine room's pipework, shared by Transition B and Act III so one becomes the other:
 * each pipe starts as a line of the 1999 grid horizon (a floor row or a line converging on the
 * vanishing point) and bends into copper pipe on the 1888 wall. Coordinates are in a
 * 1600 × 900 box that both scenes draw with the same viewBox and "slice" fit. Every pipe runs
 * off an edge of the box or into another pipe: "slice" crops the box's sides on tall screens,
 * so an end left on the open wall would show as a pipe cut off mid-air.
 */
export type Pt = readonly [number, number];

export const PIPE_BOX = { width: 1600, height: 900 } as const;

/** The horizon of the 1999 grid sits 52% down the screen (grid.css). */
const HORIZON = 0.52 * PIPE_BOX.height;
const VANISH: Pt = [PIPE_BOX.width / 2, HORIZON];

const row = (y: number): Pt[] => [
  [0, y],
  [533, y],
  [1066, y],
  [1600, y],
];
const toward = (x: number): Pt[] =>
  [0, 1 / 3, 2 / 3, 1].map((t) => [VANISH[0] + (x - VANISH[0]) * t, HORIZON + (900 - HORIZON) * t]);

export interface Pipe {
  id: string;
  grid: Pt[];
  pipe: Pt[];
  /** Pipe bore in px at full size (the grid line is 2 px). */
  bore: number;
}

export const PIPES: readonly Pipe[] = [
  // A branch: it leaves the right-hand riser and climbs into the top main. Drawn first, so
  // the larger pipes cover its ends at both junctions.
  {
    id: 'mid',
    grid: row(600),
    pipe: [
      [1540, 300],
      [1290, 300],
      [1290, 180],
      [1290, 62],
    ],
    bore: 12,
  },
  {
    id: 'top',
    grid: row(520),
    pipe: [
      [0, 118],
      [640, 118],
      [640, 62],
      [1600, 62],
    ],
    bore: 18,
  },
  {
    id: 'floor',
    grid: row(760),
    pipe: [
      [0, 824],
      [300, 824],
      [300, 864],
      [1600, 864],
    ],
    bore: 22,
  },
  {
    id: 'left',
    grid: toward(150),
    pipe: [
      [92, 0],
      [92, 600],
      [150, 600],
      [150, 900],
    ],
    bore: 16,
  },
  {
    id: 'right',
    grid: toward(1480),
    pipe: [
      [1540, 0],
      [1540, 520],
      [1480, 520],
      [1480, 900],
    ],
    bore: 16,
  },
  {
    id: 'drop',
    grid: toward(700),
    pipe: [
      [700, 900],
      [700, 780],
      [1100, 780],
      [1100, 900],
    ],
    bore: 14,
  },
];

/**
 * Steam vents: nozzles mounted on the pipework that puff now and then. Each sits on a straight
 * run of its pipe and points `angle` degrees (0 = right, -90 = up, 180 = left), away from the
 * plates in the middle of the screen.
 */
export interface Vent {
  id: string;
  pipe: string;
  at: Pt;
  angle: number;
}

export const VENTS: readonly Vent[] = [
  { id: 'top', pipe: 'top', at: [980, 62], angle: -90 },
  { id: 'floor', pipe: 'floor', at: [460, 864], angle: -90 },
  { id: 'branch', pipe: 'mid', at: [1290, 236], angle: 180 },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** A pipe part-way from grid line (0) to pipe (1). */
export const pipeAt = (pipe: Pipe, t: number): Pt[] =>
  pipe.grid.map((g, i) => {
    const p = pipe.pipe[i]!;
    return [lerp(g[0], p[0], t), lerp(g[1], p[1], t)];
  });

export const toD = (points: readonly Pt[]): string =>
  points
    .map(([x, y], i) => `${i ? 'L' : 'M'} ${Math.round(x * 10) / 10} ${Math.round(y * 10) / 10}`)
    .join(' ');

/** Mixes two #rrggbb colours. */
export function mix(a: string, b: string, t: number): string {
  const channel = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  const out = [0, 1, 2].map((i) =>
    Math.round(lerp(channel(a, i), channel(b, i), t))
      .toString(16)
      .padStart(2, '0'),
  );
  return `#${out.join('')}`;
}
