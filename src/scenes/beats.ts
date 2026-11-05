import { gsap } from 'gsap';
import { TOTAL_VH } from './registry';
import type { SceneContext } from './types';

/** vh over which a beat fades in or out when it has room to. */
const FADE = 6;

/** A scene timeline that always spans the whole scene: positions are vh from its start. */
export function sceneTimeline({ scene }: SceneContext): gsap.core.Timeline {
  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  tl.set({}, {}, scene.to - scene.from);
  return tl;
}

/**
 * Fades every beat that has an element (`[data-beat]`) in and out around its vh range: fully
 * visible by its rest point and still fully visible at it, so nothing is read mid-effect.
 */
export function addBeatFades(tl: gsap.core.Timeline, { layer, scene }: SceneContext): void {
  for (const beat of scene.beats) {
    const el = layer.querySelector(`[data-beat="${beat.id}"]`);
    if (!el) continue;
    const start = beat.from - scene.from;
    const end = beat.to - scene.from;
    const rest = beat.rest === undefined ? undefined : beat.rest - scene.from;
    const inEnd = rest === undefined ? start + FADE : Math.min(rest, start + FADE);
    const outStart = rest === undefined ? end - FADE : Math.max(rest, end - FADE);
    tl.fromTo(
      el,
      { autoAlpha: beat.from === 0 ? 1 : 0 },
      { autoAlpha: 1, duration: Math.max(0.01, inEnd - start) },
      start,
    );
    if (beat.to < TOTAL_VH) {
      tl.to(el, { autoAlpha: 0, duration: Math.max(0.01, end - outStart) }, outStart);
    }
  }
}
