import { gsap } from 'gsap';
import { TOTAL_VH } from './registry';
import type { SceneContext, SceneModule } from './types';

/** vh over which a beat fades in or out when it has room to. */
const FADE = 6;

/**
 * M1 stand-in for every scene: labelled boxes at their real vh ranges. Beats that have
 * server-rendered content (`[data-beat]`) fade in and out around their rest points; beats
 * with nothing to read get a decorative grey box naming their storyboard frames.
 */
export function greyBox(): SceneModule {
  const created = new WeakMap<HTMLElement, HTMLElement[]>();

  return {
    mount({ layer, scene }: SceneContext) {
      const host = layer.querySelector('[data-beats]') ?? layer;
      const made: HTMLElement[] = [];
      for (const beat of scene.beats) {
        if (layer.querySelector(`[data-beat="${beat.id}"]`)) continue;
        const box = document.createElement('div');
        box.className = 'beat gb-decor';
        box.dataset.beat = beat.id;
        box.setAttribute('aria-hidden', 'true');
        const frames = document.createElement('p');
        frames.className = 'gb-tag';
        frames.textContent = `${beat.frames} · ${beat.from}–${beat.to} vh`;
        const label = document.createElement('p');
        label.className = 'gb-decor-label';
        label.textContent = beat.label;
        box.append(frames, label);
        host.append(box);
        made.push(box);
      }
      created.set(layer, made);
    },

    timeline({ layer, scene }: SceneContext) {
      const length = scene.to - scene.from;
      const tl = gsap.timeline({ defaults: { ease: 'none' } });
      tl.set({}, {}, length); // the timeline always spans the whole scene

      const fill = layer.querySelector('[data-progress]');
      if (fill) tl.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: length }, 0);

      for (const beat of scene.beats) {
        const el = layer.querySelector(`[data-beat="${beat.id}"]`);
        if (!el) continue;
        const start = beat.from - scene.from;
        const end = beat.to - scene.from;
        const rest = beat.rest === undefined ? undefined : beat.rest - scene.from;
        const shownAtStart = beat.from === 0;
        const shownAtEnd = beat.to >= TOTAL_VH;
        // Fully opaque by the rest point, and still fully opaque at it.
        const inEnd = rest === undefined ? start + FADE : Math.min(rest, start + FADE);
        const outStart = rest === undefined ? end - FADE : Math.max(rest, end - FADE);
        tl.fromTo(
          el,
          { autoAlpha: shownAtStart ? 1 : 0 },
          { autoAlpha: 1, duration: Math.max(0.01, inEnd - start) },
          start,
        );
        if (!shownAtEnd) {
          tl.to(el, { autoAlpha: 0, duration: Math.max(0.01, end - outStart) }, outStart);
        }
      }
      return tl;
    },

    unmount({ layer }: SceneContext) {
      for (const el of created.get(layer) ?? []) el.remove();
      created.delete(layer);
    },
  };
}
