import { describe, expect, it } from 'vitest';
import { centreDistance, gearGeometry, gearPath } from '../../src/scenes/act-1888/gear';
import {
  FLYWHEEL_TRAIN,
  PANEL_TRAIN,
  POWER_LOSS_TRAIN,
  layoutTrain,
  trainRotations,
  trainViewBox,
} from '../../src/scenes/act-1888/train';

describe('gear trains', () => {
  it('places each gear at the meshing distance from the gear that drives it', () => {
    for (const gear of PANEL_TRAIN) {
      if (!gear.from) continue;
      const driver = PANEL_TRAIN.find((g) => g.id === gear.from)!;
      expect(Math.hypot(gear.x - driver.x, gear.y - driver.y)).toBeCloseTo(
        centreDistance(4, driver.teeth, gear.teeth),
        1,
      );
    }
  });

  it('turns neighbours in opposite directions, and the drum by the overall ratio', () => {
    const a = trainRotations(PANEL_TRAIN, 0);
    const b = trainRotations(PANEL_TRAIN, 60);
    const turn = (id: string) => b.get(id)! - a.get(id)!;
    expect(turn('driver')).toBeCloseTo(60);
    expect(turn('idler')).toBeCloseTo((-60 * 12) / 20, 1);
    expect(turn('drum')).toBeCloseTo((60 * 12) / 28, 1);
  });

  it('meshes without any tooth cutting into the gear that drives it, at every angle', () => {
    // The outline's vertices in order (each command's end point), as a polygon.
    const outline = (teeth: number) =>
      [...gearPath({ teeth, module: 4 }, 8).matchAll(/(-?[\d.]+) (-?[\d.]+)(?= [MLAZ])/g)].map(
        (m) => [Number(m[1]), Number(m[2])] as const,
      );
    const place = (
      pts: readonly (readonly [number, number])[],
      x: number,
      y: number,
      deg: number,
    ) => {
      const a = (deg * Math.PI) / 180;
      return pts.map(
        ([px, py]) =>
          [
            x + px * Math.cos(a) - py * Math.sin(a),
            y + px * Math.sin(a) + py * Math.cos(a),
          ] as const,
      );
    };
    const inside = (
      [x, y]: readonly [number, number],
      poly: readonly (readonly [number, number])[],
    ) => {
      let hit = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i]!;
        const [xj, yj] = poly[j]!;
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
      }
      return hit;
    };
    /** How far a point inside the polygon sits from its nearest edge. */
    const depth = (
      [x, y]: readonly [number, number],
      poly: readonly (readonly [number, number])[],
    ) =>
      Math.min(
        ...poly.map(([x1, y1], i) => {
          const [x2, y2] = poly[(i + 1) % poly.length]!;
          const [dx, dy] = [x2 - x1, y2 - y1];
          const t = Math.max(
            0,
            Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy || 1)),
          );
          return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
        }),
      );
    // Teeth in contact touch along the line of action; anything deeper than a hairline
    // (coordinates are rounded to 0.01 px) would be one tooth cutting into another.
    for (let driver = 0; driver < 360; driver += 3) {
      const turns = trainRotations(PANEL_TRAIN, driver);
      for (const gear of PANEL_TRAIN) {
        if (!gear.from) continue;
        const from = PANEL_TRAIN.find((g) => g.id === gear.from)!;
        const a = place(outline(from.teeth), from.x, from.y, turns.get(from.id)!);
        const b = place(outline(gear.teeth), gear.x, gear.y, turns.get(gear.id)!);
        const deepest = Math.max(0, ...b.filter((p) => inside(p, a)).map((p) => depth(p, a)));
        expect(deepest, `${gear.id} into ${from.id} at ${driver}°`).toBeLessThan(0.05);
      }
    }
  });

  it('sizes each drawing to hold every gear whole, so none is cut off', () => {
    const trains = [
      [PANEL_TRAIN, 4],
      [FLYWHEEL_TRAIN, 9],
      [POWER_LOSS_TRAIN, 7],
    ] as const;
    for (const [train, module] of trains) {
      const [x, y, w, h] = trainViewBox(train, module).split(' ').map(Number) as [
        number,
        number,
        number,
        number,
      ];
      for (const g of train) {
        const tip = gearGeometry({ teeth: g.teeth, module }).tip;
        expect(g.x - tip, `${g.id} left`).toBeGreaterThanOrEqual(x);
        expect(g.y - tip, `${g.id} top`).toBeGreaterThanOrEqual(y);
        expect(g.x + tip, `${g.id} right`).toBeLessThanOrEqual(x + w);
        expect(g.y + tip, `${g.id} bottom`).toBeLessThanOrEqual(y + h);
      }
    }
  });

  it('refuses a gear that meshes with one not placed yet', () => {
    expect(() =>
      layoutTrain({ module: 4, origin: [0, 0], gears: [{ id: 'a', teeth: 10, from: 'b' }] }),
    ).toThrow(/unknown b/);
  });
});
