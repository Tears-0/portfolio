import { describe, expect, it } from 'vitest';
import {
  FULL_THROTTLE,
  activeValve,
  ease,
  flywheelTurn,
  throttleAngle,
} from '../../src/scenes/act-1888/scene';
import { SCENES } from '../../src/scenes/registry';
import { pipeProgress } from '../../src/scenes/t-power-loss/scene';

const act = SCENES.find((s) => s.id === 'act-1888')!;
const rest = (id: string) => act.beats.find((b) => b.id === id)!.rest!;

describe('Act III · 1888', () => {
  it('has every valve shut at the overview and at the architecture plate', () => {
    expect(activeValve(rest('overview'), act.beats)).toBe(0);
    expect(activeValve(rest('plate'), act.beats)).toBe(0);
  });

  it('has each valve open at its own rest point', () => {
    for (const n of [1, 2, 3, 4]) expect(activeValve(rest(`valve-${n}`), act.beats)).toBe(n);
  });

  it('spins the flywheel up smoothly, then runs it at one degree per vh', () => {
    expect(flywheelTurn(0)).toBe(0);
    const step = 0.001;
    // No jolt where the spin-up ends: the speed is continuous there.
    expect((flywheelTurn(40 + step) - flywheelTurn(40)) / step).toBeCloseTo(1, 2);
    expect((flywheelTurn(40) - flywheelTurn(40 - step)) / step).toBeCloseTo(1, 2);
    expect(flywheelTurn(120) - flywheelTurn(100)).toBeCloseTo(20);
  });
});

describe('the throttle lever', () => {
  it('rests at idle when nothing moves and reaches full at a brisk scroll, either way', () => {
    expect(throttleAngle(0)).toBe(-40);
    expect(throttleAngle(FULL_THROTTLE)).toBe(40);
    expect(throttleAngle(-FULL_THROTTLE)).toBe(40);
    expect(throttleAngle(FULL_THROTTLE * 5)).toBe(40);
    expect(throttleAngle(FULL_THROTTLE / 2)).toBeCloseTo(0);
  });

  it('moves with weight: part of the way each frame, never past its target', () => {
    let lever = -40;
    for (let frame = 0; frame < 30; frame++) {
      const next = ease(lever, 40, 1 / 60, 5);
      expect(next).toBeGreaterThan(lever);
      expect(next).toBeLessThanOrEqual(40);
      lever = next;
    }
    expect(lever).toBeLessThan(40); // half a second in, still on its way
    expect(ease(0, 10, 10, 5)).toBe(10); // a long pause lands it exactly
  });
});

describe('Transition B · power loss', () => {
  it('keeps the grid lines straight until the dark, and fully piped before the steam', () => {
    expect(pipeProgress(0)).toBe(0);
    expect(pipeProgress(58)).toBe(0);
    expect(pipeProgress(84)).toBe(1);
    expect(pipeProgress(100)).toBe(1);
    expect(pipeProgress(72)).toBeGreaterThan(0);
    expect(pipeProgress(72)).toBeLessThan(1);
  });
});
