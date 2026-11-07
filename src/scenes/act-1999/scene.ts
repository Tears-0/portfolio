import { addBeatFades, sceneTimeline } from '../beats';
import type { Beat } from '../registry';
import { activeStep } from '../steps';
import type { SceneContext, SceneModule } from '../types';

/** Positions within Act II, in vh from its start (scroll map and storyboard II-1 to II-5). */
const RACK_FROM = 8; // II-1: the rack slides in over the grid horizon…
const RACK_TO = 30; // …in six chunky steps
const GRID_TRAVEL = 720; // px the grid flies toward the viewer over the whole act…
const GRID_CELL = 72; // …shown as an offset within one cell, since the lines repeat (grid.css)
const CART_LEAD = 8; // vh before its window opens that a cartridge slides forward
const WINDOW_OPEN = 6; // vh a window takes to open (or close), in four steps
const FLICKER_FROM = 220; // II-5 (470 vh): the picture starts to flicker, as if losing power
const FLICKER_DIM = 0.22; // how dark the picture gets by the end of the act
const RACK_OUT = 226; // the rack powers down first, gone before the power loss (500 vh)

const CLOSED = 'inset(50% 0% 50% 0%)';
const OPEN = 'inset(0% 0% 0% 0%)';

/** How far (px, 0 to one cell) the grid lines have slid toward the viewer at `progress` 0–1. */
export const gridOffset = (progress: number): number =>
  Math.round(((Math.min(1, Math.max(0, progress)) * GRID_TRAVEL) % GRID_CELL) * 100) / 100;

/** The cartridge (1–4) that is out of the rack at `vh`, or 0 before the first and at the console. */
export const activeCartridge = (vh: number, beats: readonly Beat[]): number =>
  activeStep(vh, beats, 'project', CART_LEAD, 'console');

/**
 * Act II · 1999. The grid horizon flies toward the viewer for the whole act, the cartridge
 * rack slides in, each cartridge slides forward as its window opens (in steps, like a 1999
 * window manager), the console window opens last, and at the end the picture starts to
 * flicker as if losing power. Every state comes from the scroll position, both directions.
 */
function actTwo(): SceneModule {
  return {
    mount({ layer }: SceneContext) {
      // The 1999 type swaps in now, while the visitor is still in Act I or the shatter.
      layer.classList.add('is-live');
    },

    timeline(ctx: SceneContext) {
      const { layer, scene } = ctx;
      const q = (selector: string) => layer.querySelector<HTMLElement>(selector);
      const length = scene.to - scene.from;
      const tl = sceneTimeline(ctx);
      addBeatFades(tl, ctx);

      // II-1: the rack arrives over the grid horizon.
      const lines = q('[data-grid-lines]');
      tl.fromTo(
        q('[data-a2-rack]'),
        { x: -280, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: RACK_TO - RACK_FROM, ease: 'steps(6)' },
        RACK_FROM,
      );

      // II-2/II-3: each window opens in four steps on its way to its rest point and closes the
      // same way after it. II-5: the console window is the last to close.
      for (const beat of scene.beats) {
        const win = layer.querySelector<HTMLElement>(`[data-beat="${beat.id}"] .a2-window`);
        if (!win || beat.rest === undefined) continue;
        const start = beat.from - scene.from;
        const rest = beat.rest - scene.from;
        const end = beat.to - scene.from;
        const openFor = Math.min(WINDOW_OPEN, rest - start);
        const closeFor = Math.min(WINDOW_OPEN, end - rest);
        tl.fromTo(
          win,
          { clipPath: CLOSED, scale: 0.96 },
          { clipPath: OPEN, scale: 1, duration: openFor, ease: 'steps(4)' },
          start,
        );
        tl.to(
          win,
          { clipPath: CLOSED, scale: 0.96, duration: closeFor, ease: 'steps(4)' },
          end - closeFor,
        );
      }

      tl.to(q('[data-a2-rack]'), { autoAlpha: 0, duration: 16, ease: 'steps(4)' }, RACK_OUT);

      // II-5: the picture dims toward the power loss.
      tl.fromTo(
        q('[data-a2-flicker]'),
        { opacity: 0 },
        { opacity: FLICKER_DIM, duration: length - FLICKER_FROM },
        FLICKER_FROM,
      );

      // Every render, including a jump straight past a position, comes through here.
      tl.eventCallback('onUpdate', () => {
        const local = tl.time();
        // The data frontier streams toward the viewer, a cell at a time (the lines repeat).
        lines?.style.setProperty('--grid-y', `${gridOffset(local / length)}px`);
        const active = String(activeCartridge(scene.from + local, scene.beats));
        if (layer.dataset.active !== active) layer.dataset.active = active;
        layer.classList.toggle('is-flickering', local >= FLICKER_FROM && local < length);
      });
      return tl;
    },

    unmount({ layer }: SceneContext) {
      layer.classList.remove('is-live', 'is-flickering');
      delete layer.dataset.active;
    },
  };
}

export default actTwo();
