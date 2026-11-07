/**
 * Involute spur gears for Act III (the spec: "gears are generated as true involute profiles,
 * so they mesh convincingly when one valve drives several wheels"). Pure geometry: the
 * outline is built once, at build time, as an SVG path; the scene only rotates it.
 *
 * Standard proportions: module m, z teeth, 20° pressure angle, addendum m, dedendum 1.25 m.
 * Two gears mesh when they share a module and their centres are m (z1 + z2) / 2 apart.
 */
export interface GearSpec {
  teeth: number;
  /** Tooth size: pitch diameter / teeth, in px. */
  module: number;
  /** Pressure angle in degrees (20 is the modern standard). */
  pressureAngle?: number;
}

export interface GearGeometry {
  pitch: number; // pitch radius
  base: number; // base circle radius, where the involute starts
  tip: number; // addendum (outer) radius
  root: number; // dedendum (root) radius
}

const RAD = Math.PI / 180;

export function gearGeometry({ teeth, module, pressureAngle = 20 }: GearSpec): GearGeometry {
  const pitch = (module * teeth) / 2;
  return {
    pitch,
    base: pitch * Math.cos(pressureAngle * RAD),
    tip: pitch + module,
    root: pitch - 1.25 * module,
  };
}

/** The involute function: the polar angle of the involute where its pressure angle is `a`. */
const inv = (a: number) => Math.tan(a) - a;

/** The polar angle swept by the involute (from its start on the base circle) at radius r. */
function involuteAngle(base: number, r: number): number {
  if (r <= base) return 0;
  const t = Math.sqrt((r / base) ** 2 - 1);
  return t - Math.atan(t);
}

const round = (n: number) => Math.round(n * 100) / 100;
const point = (r: number, a: number) => `${round(r * Math.cos(a))} ${round(r * Math.sin(a))}`;

/**
 * The gear's outline as an SVG path centred on 0,0, with tooth 0 centred on the +x axis.
 * `steps` points per flank; a few are plenty at the sizes the site draws.
 */
export function gearPath(spec: GearSpec, steps = 5): string {
  const { teeth, pressureAngle = 20 } = spec;
  const { base, tip, root } = gearGeometry(spec);
  // Half the tooth's angular thickness at the pitch circle (teeth and gaps are equal there),
  // moved to the base circle, where the flank starts.
  const halfAtBase = Math.PI / (2 * teeth) + inv(pressureAngle * RAD);
  const start = Math.max(root, base);
  const radii = Array.from({ length: steps + 1 }, (_, i) => start + ((tip - start) * i) / steps);
  const pitchStep = (2 * Math.PI) / teeth;

  const parts: string[] = [];
  for (let k = 0; k < teeth; k++) {
    const c = k * pitchStep;
    // Leading flank: from the root up to the tip (angles measured from the tooth's centre).
    const lower = radii.map((r) => point(r, c - halfAtBase + involuteAngle(base, r)));
    const upper = radii.map((r) => point(r, c + halfAtBase - involuteAngle(base, r))).reverse();
    const rootIn = point(root, c - halfAtBase);
    const rootOut = point(root, c + halfAtBase);
    parts.push(
      `${k === 0 ? 'M' : 'L'} ${rootIn}`,
      ...lower.map((p) => `L ${p}`),
      `A ${round(tip)} ${round(tip)} 0 0 1 ${upper[0]}`,
      ...upper.slice(1).map((p) => `L ${p}`),
      `L ${rootOut}`,
      // Across the gap along the root circle to the next tooth.
      `A ${round(root)} ${round(root)} 0 0 1 ${point(root, c + pitchStep - halfAtBase)}`,
    );
  }
  return `${parts.join(' ')} Z`;
}

/** Centre distance for two meshing gears of the same module. */
export const centreDistance = (module: number, teethA: number, teethB: number) =>
  (module * (teethA + teethB)) / 2;

/**
 * The rotation (radians) gear B must have to mesh with gear A turned by `rotationA`, where
 * `line` is the direction from A's centre to B's. B turns the other way, by the teeth ratio,
 * and is phased so a tooth of A always sits in a gap of B on the line of centres.
 */
export function meshedRotation(
  teethA: number,
  teethB: number,
  rotationA: number,
  line: number,
): number {
  return -(teethA / teethB) * (rotationA - line) + line + Math.PI - Math.PI / teethB;
}
