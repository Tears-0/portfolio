import type { SceneModule } from './types';

/**
 * The scroll map: every act and transition at its vh range, with the beats drawn in the
 * storyboard (frame codes in `frames`). Tune pacing here; the engine, the gauge, keyboard
 * paging, deep links and the scroll markers all read from it.
 *
 * 1 vh of the map = one viewport height of scrolling.
 */
export type SceneId =
  'act-2099' | 'shatter' | 'act-1999' | 'power-loss' | 'act-1888' | 'rust-to-gold' | 'act-1350';
export type EraId = '2099' | '1999' | '1888' | '1350';

export interface Beat {
  /** Matches `data-beat` inside the scene's layer; beats without an element get a grey box. */
  id: string;
  frames: string;
  label: string;
  from: number;
  to: number;
  /** Where everything is still and readable. Keyboard paging stops here. */
  rest?: number;
  /** Deep link (#works …) that lands on this rest point. */
  anchor?: string;
}

export interface SceneDef {
  id: SceneId;
  kind: 'act' | 'transition';
  era: EraId;
  title: string;
  from: number;
  to: number;
  beats: readonly Beat[];
  load: () => Promise<{ default: SceneModule }>;
}

export const SCENES: readonly SceneDef[] = [
  {
    id: 'act-2099',
    kind: 'act',
    era: '2099',
    title: 'Act I · 2099 · The Ethereal Singularity',
    from: 0,
    to: 150,
    load: () => import('./act-2099/scene'),
    beats: [
      {
        id: 'prologue',
        frames: 'P1–P4 · I-1',
        label: 'Prologue: light held in the palms',
        from: 0,
        to: 22,
        rest: 0,
        anchor: 'top',
      },
      { id: 'greeting', frames: 'I-2', label: 'Greeting resolved', from: 18, to: 70, rest: 30 },
      {
        id: 'identity',
        frames: 'I-3',
        label: 'Identity cards floating',
        from: 62,
        to: 138,
        rest: 100,
      },
      {
        id: 'decay',
        frames: 'I-4',
        label: 'First scanline bleeds into the glass',
        from: 120,
        to: 150,
      },
    ],
  },
  {
    id: 'shatter',
    kind: 'transition',
    era: '2099',
    title: 'Transition A · Shatter (2099 → 1999)',
    from: 150,
    to: 250,
    load: () => import('./t-shatter/scene'),
    beats: [
      { id: 'crack', frames: 'A-1', label: 'First crack from the HUD ring', from: 150, to: 175 },
      {
        id: 'shards',
        frames: 'A-2',
        label: 'Shards fall, phosphor glows through',
        from: 175,
        to: 220,
      },
      {
        id: 'crt',
        frames: 'A-3',
        label: 'CRT bulge and green scanline settling',
        from: 220,
        to: 250,
      },
    ],
  },
  {
    id: 'act-1999',
    kind: 'act',
    era: '1999',
    title: 'Act II · 1999 · The Cybernet Grid',
    from: 250,
    to: 500,
    load: () => import('./act-1999/scene'),
    beats: [
      {
        id: 'arrival',
        frames: 'II-1 · II-2',
        label: 'Grid horizon, rack, cartridge 01 slides out',
        from: 250,
        to: 292,
      },
      {
        id: 'project-1',
        frames: 'II-3',
        label: 'Project window: cartridge 01',
        from: 288,
        to: 320,
        rest: 300,
        anchor: 'works',
      },
      {
        id: 'project-2',
        frames: 'II-3',
        label: 'Project window: cartridge 02',
        from: 328,
        to: 360,
        rest: 340,
      },
      {
        id: 'project-3',
        frames: 'II-3',
        label: 'Project window: cartridge 03',
        from: 368,
        to: 400,
        rest: 380,
      },
      {
        id: 'project-4',
        frames: 'II-3',
        label: 'Project window: cartridge 04',
        from: 408,
        to: 440,
        rest: 420,
      },
      { id: 'console', frames: 'II-4', label: 'CLI console', from: 442, to: 472, rest: 455 },
      {
        id: 'exit',
        frames: 'II-5',
        label: 'Last window closing, picture flickers',
        from: 470,
        to: 500,
      },
    ],
  },
  {
    id: 'power-loss',
    kind: 'transition',
    era: '1999',
    title: 'Transition B · Power loss (1999 → 1888)',
    from: 500,
    to: 600,
    load: () => import('./t-power-loss/scene'),
    beats: [
      { id: 'flicker', frames: 'B-1', label: 'Flicker, colour drains', from: 500, to: 530 },
      {
        id: 'collapse',
        frames: 'B-2',
        label: 'Collapse to a line, then a dot',
        from: 530,
        to: 560,
      },
      {
        id: 'pipes',
        frames: 'B-3',
        label: 'Grid lines thicken into brass pipe',
        from: 560,
        to: 600,
      },
    ],
  },
  {
    id: 'act-1888',
    kind: 'act',
    era: '1888',
    title: 'Act III · 1888 · The Engine of Tomorrow',
    from: 600,
    to: 800,
    load: () => import('./act-1888/scene'),
    beats: [
      { id: 'arrival', frames: 'III-1', label: 'Steam clears over the engine', from: 600, to: 632 },
      {
        id: 'overview',
        frames: 'III-2',
        label: 'Engine overview, gauges settling',
        from: 628,
        to: 656,
        rest: 640,
        anchor: 'engine',
      },
      { id: 'valve-1', frames: 'III-3', label: 'Valve 1 turned', from: 660, to: 682, rest: 670 },
      { id: 'valve-2', frames: 'III-3', label: 'Valve 2 turned', from: 685, to: 707, rest: 695 },
      { id: 'valve-3', frames: 'III-3', label: 'Valve 3 turned', from: 710, to: 732, rest: 720 },
      { id: 'valve-4', frames: 'III-3', label: 'Valve 4 turned', from: 735, to: 757, rest: 745 },
      {
        id: 'plate',
        frames: 'III-4',
        label: 'Architecture plate, rust creeps in',
        from: 760,
        to: 800,
        rest: 770,
      },
    ],
  },
  {
    id: 'rust-to-gold',
    kind: 'transition',
    era: '1888',
    title: 'Transition C · Rust to gold (1888 → 1350)',
    from: 800,
    to: 900,
    load: () => import('./t-rust-to-gold/scene'),
    beats: [
      { id: 'rust', frames: 'C-1', label: 'Rust blooms across the plates', from: 800, to: 830 },
      { id: 'glow', frames: 'C-2', label: 'Metal glows amber', from: 830, to: 860 },
      {
        id: 'parchment',
        frames: 'C-3',
        label: 'Plates flatten into gold-leaf parchment',
        from: 860,
        to: 900,
      },
    ],
  },
  {
    id: 'act-1350',
    kind: 'act',
    era: '1350',
    title: 'Act IV · 1350 · The Grand Magisterium',
    from: 900,
    to: 1100,
    load: () => import('./act-1350/scene'),
    beats: [
      { id: 'arrival', frames: 'IV-1', label: 'Constellations drawing', from: 900, to: 942 },
      {
        id: 'philosophy',
        frames: 'IV-2',
        label: 'Philosophy leaf',
        from: 940,
        to: 1000,
        rest: 960,
        anchor: 'origin',
      },
      {
        id: 'contact',
        frames: 'IV-3 · IV-4',
        label: 'Transmutation circle (contact portal)',
        from: 992,
        to: 1100,
        rest: 1080,
        anchor: 'contact',
      },
    ],
  },
];

export const TOTAL_VH = SCENES[SCENES.length - 1]!.to;

export interface RestPoint {
  vh: number;
  scene: SceneId;
  beat: string;
  label: string;
  anchor?: string;
}

export const REST_POINTS: readonly RestPoint[] = SCENES.flatMap((scene) =>
  scene.beats.flatMap((beat) =>
    beat.rest === undefined
      ? []
      : [{ vh: beat.rest, scene: scene.id, beat: beat.id, label: beat.label, anchor: beat.anchor }],
  ),
).sort((a, b) => a.vh - b.vh);

/** Deep links: #top, #works, #engine, #origin, #contact → the vh of their rest point. */
export const ANCHORS: Readonly<Record<string, number>> = Object.fromEntries(
  REST_POINTS.flatMap((r) => (r.anchor ? [[r.anchor, r.vh]] : [])),
);

export function sceneAt(vh: number): SceneDef {
  return SCENES.find((s) => vh >= s.from && vh < s.to) ?? SCENES[SCENES.length - 1]!;
}

export function beatAt(vh: number): Beat | undefined {
  const scene = sceneAt(vh);
  const live = scene.beats.filter((b) => vh >= b.from && vh <= b.to);
  // Where beats overlap, prefer the one whose rest point is nearest.
  return live.sort(
    (a, b) => Math.abs((a.rest ?? a.from) - vh) - Math.abs((b.rest ?? b.from) - vh),
  )[0];
}

/** The first act of each era: where the time machine and the gauge's year links land. */
export function eraStart(era: EraId): SceneDef {
  return SCENES.find((s) => s.kind === 'act' && s.era === era)!;
}

/**
 * Gauge year readout (storyboard proposal): years drift slowly inside acts and sweep the
 * century during transitions. Pairs of [vh, year], linearly interpolated.
 */
const YEAR_STOPS: readonly (readonly [number, number])[] = [
  [0, 2099],
  [150, 2098.5],
  [250, 1999],
  [500, 1995],
  [600, 1888],
  [800, 1885],
  [900, 1350],
  [TOTAL_VH, 1350],
];

export function yearAt(vh: number): number {
  const v = Math.min(Math.max(vh, 0), TOTAL_VH);
  for (let i = 1; i < YEAR_STOPS.length; i++) {
    const [v1, y1] = YEAR_STOPS[i]!;
    const [v0, y0] = YEAR_STOPS[i - 1]!;
    if (v <= v1) return v1 === v0 ? y1 : y0 + ((y1 - y0) * (v - v0)) / (v1 - v0);
  }
  return YEAR_STOPS[YEAR_STOPS.length - 1]![1];
}

/** 2099 shows hundredths (2099.00 → 2098.97 as scrolling begins); older eras show whole years. */
export function formatYear(vh: number): string {
  const year = yearAt(vh);
  return vh < 150 ? year.toFixed(2) : String(Math.round(year));
}
