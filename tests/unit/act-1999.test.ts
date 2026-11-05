import { describe, expect, it } from 'vitest';
import { activeCartridge, gridOffset } from '../../src/scenes/act-1999/scene';
import { SCENES } from '../../src/scenes/registry';

const act = SCENES.find((s) => s.id === 'act-1999')!;
const rest = (id: string) => act.beats.find((b) => b.id === id)!.rest!;

describe('Act II · 1999', () => {
  it('has each cartridge out of the rack at its window’s rest point', () => {
    expect(activeCartridge(act.from, act.beats)).toBe(0);
    for (const n of [1, 2, 3, 4]) expect(activeCartridge(rest(`project-${n}`), act.beats)).toBe(n);
  });

  it('puts every cartridge back for the console', () => {
    expect(activeCartridge(rest('console'), act.beats)).toBe(0);
  });

  it('slides the next cartridge forward before its window opens', () => {
    const beat = act.beats.find((b) => b.id === 'project-2')!;
    expect(activeCartridge(beat.from - 1, act.beats)).toBe(2);
  });

  it('moves the grid lines within one cell, so the floor never runs out', () => {
    for (let p = 0; p <= 1; p += 0.01) {
      const y = gridOffset(p);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThan(72);
    }
    expect(gridOffset(0)).toBe(0);
  });
});
