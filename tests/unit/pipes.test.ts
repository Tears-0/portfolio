import { describe, expect, it } from 'vitest';
import { PIPES, PIPE_BOX, VENTS, mix, pipeAt, toD, type Pt } from '../../src/scenes/act-1888/pipes';

describe('the pipework that the 1999 grid becomes', () => {
  it('pairs every grid line with a pipe of the same number of points', () => {
    for (const pipe of PIPES) expect(pipe.grid.length).toBe(pipe.pipe.length);
  });

  it('starts as the grid line and ends as the pipe', () => {
    for (const pipe of PIPES) {
      expect(pipeAt(pipe, 0)).toEqual(pipe.grid);
      expect(pipeAt(pipe, 1)).toEqual(pipe.pipe);
    }
  });

  it('starts every grid line on or below the horizon, inside the frame', () => {
    for (const pipe of PIPES) {
      for (const [x, y] of pipe.grid) {
        expect(y).toBeGreaterThanOrEqual(0.52 * PIPE_BOX.height - 0.001);
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(PIPE_BOX.width);
      }
    }
  });

  it('never leaves a pipe end on the open wall: each runs off an edge or into another pipe', () => {
    const onEdge = ([x, y]: Pt) => x <= 0 || y <= 0 || x >= PIPE_BOX.width || y >= PIPE_BOX.height;
    const onPipe = ([x, y]: Pt, self: string) =>
      PIPES.some(
        (other) =>
          other.id !== self &&
          other.pipe.slice(1).some((b, i) => {
            const a = other.pipe[i]!;
            const within = (v: number, p: number, q: number) =>
              v >= Math.min(p, q) && v <= Math.max(p, q);
            return within(x, a[0], b[0]) && within(y, a[1], b[1]);
          }),
      );
    for (const pipe of PIPES) {
      for (const end of [pipe.pipe[0]!, pipe.pipe.at(-1)!]) {
        expect(onEdge(end) || onPipe(end, pipe.id), `${pipe.id} ends at ${end.join(',')}`).toBe(
          true,
        );
      }
    }
  });

  it('draws a branch before the pipes it joins, so their bodies cover the joints', () => {
    const order = PIPES.map((p) => p.id);
    expect(order.indexOf('mid')).toBeLessThan(order.indexOf('top'));
    expect(order.indexOf('mid')).toBeLessThan(order.indexOf('right'));
  });

  it('mounts every steam vent on a straight run of its own pipe, pointing across it', () => {
    for (const vent of VENTS) {
      const pipe = PIPES.find((p) => p.id === vent.pipe)!;
      expect(pipe, vent.id).toBeDefined();
      const run = pipe.pipe.slice(1).find((b, i) => {
        const a = pipe.pipe[i]!;
        const [x, y] = vent.at;
        const between = (v: number, p: number, q: number) =>
          v > Math.min(p, q) && v < Math.max(p, q);
        return (
          (a[1] === b[1] && y === a[1] && between(x, a[0], b[0])) ||
          (a[0] === b[0] && x === a[0] && between(y, a[1], b[1]))
        );
      });
      expect(run, `${vent.id} sits on ${vent.pipe}`).toBeDefined();
      // A horizontal run vents up or down; a vertical one, left or right.
      const horizontal = pipe.pipe.some((a, i) => {
        const b = pipe.pipe[i + 1];
        return b && a[1] === b[1] && a[1] === vent.at[1];
      });
      expect(Math.abs(Math.cos((vent.angle * Math.PI) / 180)), vent.id).toBeCloseTo(
        horizontal ? 0 : 1,
      );
    }
  });

  it('bends every pipe at right angles', () => {
    for (const { pipe } of PIPES) {
      for (let i = 1; i < pipe.length; i++) {
        const [a, b] = [pipe[i - 1]!, pipe[i]!];
        expect(a[0] === b[0] || a[1] === b[1]).toBe(true);
      }
    }
  });

  it('writes paths and colours the browser can read', () => {
    expect(
      toD([
        [0, 0],
        [10.04, 5],
      ]),
    ).toBe('M 0 0 L 10 5');
    expect(mix('#39ff7a', '#c2703d', 0)).toBe('#39ff7a');
    expect(mix('#39ff7a', '#c2703d', 1)).toBe('#c2703d');
    expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080');
  });
});
