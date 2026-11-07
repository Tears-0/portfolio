import { addBeatFades, sceneTimeline } from '../beats';
import { PIPES, mix, pipeAt, toD } from '../act-1888/pipes';
import { POWER_LOSS_TRAIN, trainRotations } from '../act-1888/train';
import type { SceneContext, SceneModule } from '../types';

/** Positions within the transition, in vh (storyboard B-1 to B-3). */
const FLICKER_TO = 30; // B-1: the picture flickers and drains of colour
const COLLAPSE_FROM = 30; // B-2: it squashes to a bright line…
const LINE_AT = 40;
const DOT_FROM = 44; // …then to a dot…
const DOT_TO = 52;
const DOT_GONE = 58; // …which fades
const ROOM_FROM = 56; // B-3: the engine room's dark wall comes up
const PIPES_FROM = 60; // the grid's lines return, thick and solid, and bend into pipe
const PIPES_TO = 84;
const GEAR_FROM = 72; // a gear slides in and meshes
const GEAR_TO = 88;
const STEAM_FROM = 86; // steam vents over the cut, ready for Act III to clear

const GREEN = '#39ff7a';
const COPPER = '#c2703d';
const SHELL = '#3b2112';
const SHINE = '#ffcda0';
const SLIDE = 320; // px the pinion travels in along its line of centres

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const easeOut = (t: number) => 1 - (1 - t) ** 3;

/** How far (0–1) the grid lines have become pipe at `local` vh. */
export const pipeProgress = (local: number): number =>
  easeInOut(clamp01((local - PIPES_FROM) / (PIPES_TO - PIPES_FROM)));

/**
 * Transition B · Power loss (1999 → 1888). The 1999 picture flickers and loses its colour,
 * collapses to a line and a dot like a CRT switched off; out of the dark its grid lines return
 * thick and solid and bend into copper pipe, a gear slides in and meshes, and steam vents over
 * the cut. Scrubbed both ways; the pipes and gears are redrawn from the scroll position.
 */
function powerLoss(): SceneModule {
  return {
    mount() {},

    timeline(ctx: SceneContext) {
      const { layer, scene } = ctx;
      const q = (selector: string) => layer.querySelector<HTMLElement>(selector);
      const length = scene.to - scene.from;
      const tl = sceneTimeline(ctx);
      addBeatFades(tl, ctx);

      // B-1: the picture drains of colour and dims further.
      tl.fromTo(
        q('[data-tb-picture]'),
        { filter: 'saturate(1)' },
        { filter: 'saturate(0.1)', duration: FLICKER_TO },
        0,
      );
      tl.fromTo(q('[data-tb-dim]'), { opacity: 0.22 }, { opacity: 0.45, duration: FLICKER_TO }, 0);

      // B-2: a CRT switched off: squash to a line, the line to a dot, the dot fades.
      tl.fromTo(
        q('[data-tb-picture]'),
        { scaleY: 1, autoAlpha: 1 },
        { scaleY: 0.004, duration: DOT_FROM - COLLAPSE_FROM, ease: 'power3.in' },
        COLLAPSE_FROM,
      );
      tl.set(q('[data-tb-picture]'), { autoAlpha: 0 }, DOT_FROM);
      tl.fromTo(
        q('[data-tb-line]'),
        { autoAlpha: 0, scaleX: 1 },
        { autoAlpha: 1, duration: DOT_FROM - LINE_AT },
        LINE_AT,
      );
      tl.to(
        q('[data-tb-line]'),
        { scaleX: 0.006, duration: DOT_TO - DOT_FROM, ease: 'power2.in' },
        DOT_FROM,
      );
      tl.to(q('[data-tb-line]'), { autoAlpha: 0, duration: DOT_GONE - DOT_TO }, DOT_TO);

      // B-3: the engine room's wall, the pipes' return, the steam.
      tl.fromTo(q('[data-tb-room]'), { opacity: 0 }, { opacity: 1, duration: 10 }, ROOM_FROM);
      tl.fromTo(q('[data-tb-pipes]'), { opacity: 0 }, { opacity: 1, duration: 4 }, PIPES_FROM - 2);
      tl.fromTo(
        q('[data-steam="tb"]'),
        { opacity: 0, scale: 0.6 },
        { opacity: 1, scale: 1, duration: length - STEAM_FROM, ease: 'power1.out' },
        STEAM_FROM,
      );

      tl.fromTo(q('[data-tb-gears]'), { opacity: 0 }, { opacity: 1, duration: 6 }, GEAR_FROM - 4);

      const pipes = PIPES.map((pipe) => {
        const g = layer.querySelector(`[data-pipe="${pipe.id}"]`);
        return {
          pipe,
          shell: g?.querySelector('.tb-shell'),
          core: g?.querySelector('.tb-core'),
          shine: g?.querySelector('.tb-shine'),
        };
      });
      const gearsSvg = q('[data-tb-gears]');
      const pinion = POWER_LOSS_TRAIN.find((g) => g.id === 'pinion')!;
      let drawn = -1;

      tl.eventCallback('onUpdate', () => {
        const local = tl.time();
        layer.classList.toggle('is-flickering', local > 0 && local < FLICKER_TO);
        if (local < PIPES_FROM - 2 || local === drawn) return;
        drawn = local;

        // The grid lines thicken, take on copper and bend into the wall's pipework.
        const p = pipeProgress(local);
        for (const { pipe, shell, core, shine } of pipes) {
          const d = toD(pipeAt(pipe, p));
          const width = 2 + (pipe.bore - 2) * p;
          shell?.setAttribute('d', d);
          shell?.setAttribute('stroke', mix(GREEN, SHELL, p));
          shell?.setAttribute('stroke-width', String(width + 4 * p));
          core?.setAttribute('d', d);
          core?.setAttribute('stroke', mix(GREEN, COPPER, p));
          core?.setAttribute('stroke-width', String(width));
          shine?.setAttribute('d', d);
          shine?.setAttribute('stroke', SHINE);
          shine?.setAttribute('stroke-opacity', String(0.4 * p));
          shine?.setAttribute('stroke-width', String(Math.max(0.5, pipe.bore * 0.22 * p)));
        }

        // The pinion slides in along its line of centres and meshes; both turn as one.
        const slide = (1 - easeOut(clamp01((local - GEAR_FROM) / (GEAR_TO - GEAR_FROM)))) * SLIDE;
        const turns = trainRotations(POWER_LOSS_TRAIN, local * 3);
        for (const gear of POWER_LOSS_TRAIN) {
          const holder = gearsSvg?.querySelector(`[data-tb-gear="${gear.id}"]`);
          holder
            ?.querySelector('.gear-turn')
            ?.setAttribute('transform', `rotate(${turns.get(gear.id)})`);
        }
        const dx = Math.cos(pinion.line) * slide;
        const dy = Math.sin(pinion.line) * slide;
        gearsSvg
          ?.querySelector('[data-tb-gear="pinion"]')
          ?.setAttribute('transform', `translate(${dx.toFixed(1)} ${dy.toFixed(1)})`);
      });
      return tl;
    },

    unmount({ layer }: SceneContext) {
      layer.classList.remove('is-flickering');
    },
  };
}

export default powerLoss();
