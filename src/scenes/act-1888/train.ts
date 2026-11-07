import { centreDistance, gearGeometry, meshedRotation } from './gear';

/**
 * A gear train laid out from one driving gear: each other gear meshes with the one it names,
 * in the direction given, at exactly the centre distance, so the teeth always engage. The
 * markup draws the train from this layout and the scene turns it with the same numbers.
 */
export interface TrainSpec {
  module: number;
  origin: readonly [number, number];
  gears: readonly { id: string; teeth: number; from?: string; angle?: number }[];
}

export interface PlacedGear {
  id: string;
  teeth: number;
  x: number;
  y: number;
  from?: string;
  line: number; // radians, from the gear that drives it to this one
}

const RAD = Math.PI / 180;

export function layoutTrain({ module, origin, gears }: TrainSpec): PlacedGear[] {
  const placed: PlacedGear[] = [];
  for (const gear of gears) {
    const driver = gear.from ? placed.find((g) => g.id === gear.from) : undefined;
    if (gear.from && !driver) throw new Error(`Gear ${gear.id} meshes with unknown ${gear.from}`);
    if (!driver) {
      placed.push({ id: gear.id, teeth: gear.teeth, x: origin[0], y: origin[1], line: 0 });
      continue;
    }
    const line = (gear.angle ?? 0) * RAD;
    const d = centreDistance(module, driver.teeth, gear.teeth);
    placed.push({
      id: gear.id,
      teeth: gear.teeth,
      x: Math.round((driver.x + d * Math.cos(line)) * 100) / 100,
      y: Math.round((driver.y + d * Math.sin(line)) * 100) / 100,
      from: driver.id,
      line,
    });
  }
  return placed;
}

/**
 * The smallest SVG viewBox that holds every gear of a train whole (with `pad` px to spare), so
 * no wheel is ever clipped by the drawing it sits in, however the train is laid out.
 */
export function trainViewBox(train: readonly PlacedGear[], module: number, pad = 4): string {
  const tips = train.map((g) => ({ g, r: gearGeometry({ teeth: g.teeth, module }).tip + pad }));
  const left = Math.floor(Math.min(...tips.map(({ g, r }) => g.x - r)));
  const top = Math.floor(Math.min(...tips.map(({ g, r }) => g.y - r)));
  const right = Math.ceil(Math.max(...tips.map(({ g, r }) => g.x + r)));
  const bottom = Math.ceil(Math.max(...tips.map(({ g, r }) => g.y + r)));
  return `${left} ${top} ${right - left} ${bottom - top}`;
}

/** Every gear's rotation (degrees) when the first gear has turned `driver` degrees. */
export function trainRotations(train: readonly PlacedGear[], driver: number): Map<string, number> {
  const radians = new Map<string, number>();
  for (const gear of train) {
    const from = gear.from ? train.find((g) => g.id === gear.from) : undefined;
    const r = from
      ? meshedRotation(from.teeth, gear.teeth, radians.get(from.id) ?? 0, gear.line)
      : driver * RAD;
    radians.set(gear.id, r);
  }
  return new Map([...radians].map(([id, r]) => [id, Math.round((r / RAD) * 100) / 100]));
}

/** The control panel's train (the hero): valve shaft → idler → the drum's gear. */
export const PANEL_TRAIN = layoutTrain({
  module: 4,
  origin: [44, 44],
  gears: [
    { id: 'driver', teeth: 12 },
    { id: 'idler', teeth: 20, from: 'driver', angle: 55 },
    { id: 'drum', teeth: 28, from: 'idler', angle: -20 },
  ],
});

/** Transition B's pair: a pinion slides in from the right and meshes with a crown wheel. */
export const POWER_LOSS_TRAIN = layoutTrain({
  module: 7,
  origin: [190, 190],
  gears: [
    { id: 'wheel', teeth: 30 },
    { id: 'pinion', teeth: 12, from: 'wheel', angle: -18 },
  ],
});

/** The engine wall's flywheel and the pinion it drives. */
export const FLYWHEEL_TRAIN = layoutTrain({
  module: 9,
  origin: [300, 300],
  gears: [
    { id: 'flywheel', teeth: 56 },
    { id: 'pinion', teeth: 14, from: 'flywheel', angle: 200 },
  ],
});
