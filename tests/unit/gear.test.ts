import { describe, expect, it } from 'vitest';
import {
  centreDistance,
  gearGeometry,
  gearPath,
  meshedRotation,
} from '../../src/scenes/act-1888/gear';

const numbers = (d: string) => [...d.matchAll(/-?\d+(\.\d+)?/g)].map((m) => Number(m[0]));
/** The path's vertices (M and L points), as [x, y] pairs. */
const vertices = (d: string) =>
  [...d.matchAll(/[ML] (-?[\d.]+) (-?[\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])] as const);

describe('the involute gear generator', () => {
  it('uses the standard proportions', () => {
    const g = gearGeometry({ teeth: 20, module: 4 });
    expect(g.pitch).toBe(40);
    expect(g.tip).toBe(44);
    expect(g.root).toBe(35);
    expect(g.base).toBeCloseTo(40 * Math.cos((20 * Math.PI) / 180));
  });

  it('draws one closed outline with every point between the root and the tip circles', () => {
    const spec = { teeth: 18, module: 5 };
    const d = gearPath(spec);
    const { tip, root } = gearGeometry(spec);
    expect(d.startsWith('M')).toBe(true);
    expect(d.endsWith('Z')).toBe(true);
    for (const [x, y] of vertices(d)) {
      const r = Math.hypot(x, y);
      expect(r).toBeGreaterThanOrEqual(root - 0.02);
      expect(r).toBeLessThanOrEqual(tip + 0.02);
    }
    expect(numbers(d).every(Number.isFinite)).toBe(true);
  });

  it('gives every tooth the same shape, turned by one pitch', () => {
    const spec = { teeth: 12, module: 6 };
    const v = vertices(gearPath(spec));
    const perTooth = v.length / spec.teeth;
    expect(Number.isInteger(perTooth)).toBe(true);
    const step = (2 * Math.PI) / spec.teeth;
    const [x0, y0] = v[1]!;
    const [x1, y1] = v[1 + perTooth]!;
    expect(x0 * Math.cos(step) - y0 * Math.sin(step)).toBeCloseTo(x1, 1);
    expect(x0 * Math.sin(step) + y0 * Math.cos(step)).toBeCloseTo(y1, 1);
  });

  it('is symmetric about each tooth’s centre line', () => {
    const v = vertices(gearPath({ teeth: 16, module: 5 }));
    // A point on tooth 0's leading flank, between the pitch and tip circles…
    const flank = v.find(([x, y]) => y < 0 && Math.hypot(x, y) > 41 && Math.hypot(x, y) < 44)!;
    // …has its mirror image on the trailing flank.
    const mirrored = v.some(
      ([x, y]) => Math.abs(x - flank[0]) < 0.02 && Math.abs(y + flank[1]) < 0.02,
    );
    expect(mirrored).toBe(true);
  });

  it('spaces meshing gears by the sum of their pitch radii', () => {
    expect(centreDistance(4, 12, 30)).toBe(84);
  });

  it('turns a meshed gear the other way, by the teeth ratio', () => {
    const at = (a: number) => meshedRotation(12, 30, a, 0);
    expect(at(1) - at(0)).toBeCloseTo(-12 / 30);
  });

  it('puts a gap of the driven gear wherever a tooth of the driver meets the line of centres', () => {
    for (const line of [0, 0.7, 2]) {
      // Driver tooth 0 points along the line: the driven gear's gap must point back along it.
      const b = meshedRotation(12, 30, line, line);
      const gapCentre = b + Math.PI / 30;
      const back = line + Math.PI;
      const pitch = (2 * Math.PI) / 30;
      const offset = (((gapCentre - back) % pitch) + pitch) % pitch;
      expect(Math.min(offset, pitch - offset)).toBeCloseTo(0);
    }
  });
});
