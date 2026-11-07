import { gsap } from 'gsap';
import { addBeatFades, sceneTimeline } from '../beats';
import type { Beat } from '../registry';
import { activeStep } from '../steps';
import type { SceneContext, SceneModule } from '../types';
import { FLYWHEEL_TRAIN, PANEL_TRAIN, trainRotations, type PlacedGear } from './train';

/** Positions within Act III, in vh from its start (scroll map and storyboard III-1 to III-4). */
const STEAM_TO = 30; // III-1: the steam has cleared off the engine wall
const PANEL_FROM = 12; // the control panel swings in as the steam clears…
const PANEL_TO = 30;
const SPIN_UP = 40; // the flywheel reaches its running speed here
const DRUM_TURN = 8; // vh the drum takes to turn a face into view (or out of it)
const VALVE_LEAD = 4; // a valve opens just before its drum face turns in
const SETTLE_LEAD = 3; // gauges settle as the face reaches its rest point
const RUST_FROM = 180; // III-4 (780 vh): rust creeps in from the rivets

/** Degrees the panel's driving gear turns per vh, and how fast it idles at rest (per second). */
const DRIVE_PER_VH = 3;
const IDLE_PER_S = 9;

/** The throttle reads idle at rest and full at this scroll speed (vh per second) or faster. */
const FULL_THROTTLE = 140;
const THROTTLE_IDLE = -40; // degrees: the lever's two ends on its quadrant
const THROTTLE_FULL = 40;

/** The valve (1–4) open at `vh`, or 0 at the overview and the architecture plate. */
export const activeValve = (vh: number, beats: readonly Beat[]): number =>
  activeStep(vh, beats, 'valve', VALVE_LEAD, 'plate');

/** The flywheel's turn (degrees) at `local` vh: it spins up through the arrival, then runs. */
export const flywheelTurn = (local: number): number =>
  local < SPIN_UP ? (local * local) / (2 * SPIN_UP) : local - SPIN_UP / 2;

/** The throttle lever's angle (degrees) for a scroll speed in vh per second, either way. */
export const throttleAngle = (vhPerSecond: number): number =>
  THROTTLE_IDLE +
  (THROTTLE_FULL - THROTTLE_IDLE) * Math.min(1, Math.abs(vhPerSecond) / FULL_THROTTLE);

/** Moves `current` toward `target`, a little more each frame: levers have weight. */
export const ease = (current: number, target: number, seconds: number, rate: number): number =>
  current + (target - current) * Math.min(1, seconds * rate);

function turnGears(svg: Element | null, train: readonly PlacedGear[], degrees: number) {
  if (!svg) return;
  for (const [id, deg] of trainRotations(train, degrees)) {
    svg.querySelector(`[data-gear="${id}"]`)?.setAttribute('transform', `rotate(${deg})`);
  }
}

/**
 * Act III · 1888. Steam clears off the engine wall and the flywheel spins up with the scroll.
 * Each valve on the control panel opens as its rest point nears: the gear train turns, the
 * drum turns its face into view and the gauges' needles jitter, then settle on their tiers.
 * The last plate is the architecture schematic; rust creeps in toward the next transition.
 */
function actThree(): SceneModule {
  let local = 0;
  let length = 0;
  let idle = 0;
  let layerRef: HTMLElement | null = null;
  let onTick: (() => void) | null = null;
  let lastLocal = 0;
  let speed = 0; // vh per second, smoothed
  let lever = THROTTLE_IDLE;

  const render = () => {
    if (!layerRef) return;
    turnGears(layerRef.querySelector('.a3-train'), PANEL_TRAIN, local * DRIVE_PER_VH + idle);
    turnGears(
      layerRef.querySelector('[data-a3-flywheel]'),
      FLYWHEEL_TRAIN,
      flywheelTurn(local) * 1.6 + idle * 0.25,
    );
  };

  return {
    mount({ layer }: SceneContext) {
      layerRef = layer;
      // The 1888 type swaps in now, ahead of the act.
      layer.classList.add('is-live');
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      // At rest the machine keeps idling, slowly, while the act is on screen.
      const throttle = layer.querySelector('[data-a3-throttle]');
      onTick = () => {
        const seconds = gsap.ticker.deltaRatio() / 60;
        // How fast the visitor is scrolling through the engine, read off the scroll position.
        speed = ease(speed, (local - lastLocal) / Math.max(seconds, 0.001), seconds, 6);
        lastLocal = local;
        if (local <= 0 || local >= length) return;
        idle += seconds * IDLE_PER_S;
        lever = ease(lever, throttleAngle(speed), seconds, 5);
        throttle?.setAttribute('transform', `rotate(${lever.toFixed(1)} 32 64)`);
        render();
      };
      gsap.ticker.add(onTick);
    },

    timeline(ctx: SceneContext) {
      const { layer, scene } = ctx;
      const q = (selector: string) => layer.querySelector<HTMLElement>(selector);
      length = scene.to - scene.from;
      const tl = sceneTimeline(ctx);
      addBeatFades(tl, ctx);

      // III-1: the steam the power loss vented clears off the wall; the panel swings in.
      tl.fromTo(
        q('[data-steam="a3"]'),
        { autoAlpha: 1, scale: 1, y: 0 },
        { autoAlpha: 0, scale: 1.3, y: -60, duration: STEAM_TO, ease: 'power1.in' },
        0,
      );
      tl.fromTo(
        q('[data-a3-panel]'),
        { x: -300, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: PANEL_TO - PANEL_FROM, ease: 'power2.out' },
        PANEL_FROM,
      );

      // III-3: each category's face turns into view on the drum, and away again after.
      const drums: { el: HTMLElement; settleAt: number; until: number }[] = [];
      for (const beat of scene.beats) {
        const face = layer.querySelector<HTMLElement>(`[data-beat="${beat.id}"] [data-a3-drum]`);
        if (!face || beat.rest === undefined) continue;
        const start = beat.from - scene.from;
        const rest = beat.rest - scene.from;
        const end = beat.to - scene.from;
        const turnIn = Math.min(DRUM_TURN, rest - start);
        const turnOut = Math.min(DRUM_TURN, end - rest);
        const drum = { transformPerspective: 1400, transformOrigin: '50% 50% -220px' };
        tl.fromTo(
          face,
          { ...drum, rotationX: -70 },
          { rotationX: 0, duration: turnIn, ease: 'power2.out' },
          start,
        );
        tl.to(face, { rotationX: 70, duration: turnOut, ease: 'power2.in' }, end - turnOut);
        drums.push({ el: face, settleAt: rest - SETTLE_LEAD, until: end });
      }

      // III-4: rust creeps in from the rivets.
      tl.fromTo(
        layer,
        { '--a3-rust': 0 },
        { '--a3-rust': 1, duration: length - RUST_FROM },
        RUST_FROM,
      );

      // The panel's relief valve hisses each time a valve opens.
      const relief = layer.querySelector('[data-a3-relief]');
      const hiss = () => {
        if (!relief) return;
        relief.classList.remove('is-venting');
        relief.getBoundingClientRect(); // restart the puff even mid-way through the last one
        relief.classList.add('is-venting');
      };

      // Every render, jumps included, comes through here.
      tl.eventCallback('onUpdate', () => {
        local = tl.time();
        const active = String(activeValve(scene.from + local, scene.beats));
        if (layer.dataset.active !== active) {
          layer.dataset.active = active;
          if (active !== '0') hiss();
        }
        // Gauges settle once per visit, when their face reaches its rest point.
        for (const d of drums) {
          if (local >= d.settleAt && local < d.until) d.el.classList.add('is-settled');
        }
        render();
      });
      return tl;
    },

    unmount({ layer }: SceneContext) {
      if (onTick) gsap.ticker.remove(onTick);
      onTick = null;
      layerRef = null;
      layer.classList.remove('is-live');
      delete layer.dataset.active;
      layer.querySelectorAll('.is-settled').forEach((el) => el.classList.remove('is-settled'));
    },
  };
}

export default actThree();
