import { addBeatFades, sceneTimeline } from './beats';
import type { SceneContext, SceneModule } from './types';

/**
 * Stand-in for a scene that is not built yet: labelled boxes at their real vh ranges. Beats
 * that have server-rendered content (`[data-beat]`) fade in and out around their rest points;
 * beats with nothing to read get a decorative grey box naming their storyboard frames.
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

    timeline(ctx: SceneContext) {
      const tl = sceneTimeline(ctx);
      const fill = ctx.layer.querySelector('[data-progress]');
      const length = ctx.scene.to - ctx.scene.from;
      if (fill) tl.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: length }, 0);
      addBeatFades(tl, ctx);
      return tl;
    },

    unmount({ layer }: SceneContext) {
      for (const el of created.get(layer) ?? []) el.remove();
      created.delete(layer);
    },
  };
}
