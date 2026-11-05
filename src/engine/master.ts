import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SCENES, TOTAL_VH, type SceneDef, type SceneId } from '../scenes/registry';
import type { SceneContext } from '../scenes/types';

gsap.registerPlugin(ScrollTrigger);

/** vh over which neighbouring scene layers crossfade at their boundary. */
const LAYER_FADE = 2;

export interface Master {
  /** Loads, mounts and wires a scene's module (once). */
  ensureLoaded(id: SceneId): Promise<void>;
  /** Loads every scene, nearest to `vh` first. */
  loadAll(vh: number): Promise<void>;
}

/**
 * One master timeline drives the whole descent: 1 second of timeline = 1 vh of scroll.
 * Each scene gets a slot at its vh range; the slot fades the scene's layer in and out,
 * and the scene's own timeline is added to the slot once its module has loaded.
 */
export function createMaster(track: HTMLElement, stage: HTMLElement): Master {
  const master = gsap.timeline({ defaults: { ease: 'none' } });
  const slots = new Map<SceneId, { slot: gsap.core.Timeline; ctx: SceneContext }>();
  const loading = new Map<SceneId, Promise<void>>();

  SCENES.forEach((scene, i) => {
    const layer = stage.querySelector<HTMLElement>(`[data-scene="${scene.id}"]`);
    if (!layer) throw new Error(`No layer for scene ${scene.id}`);
    const length = scene.to - scene.from;
    const slot = gsap.timeline({ defaults: { ease: 'none' } });
    slot.set({}, {}, length);
    const first = i === 0;
    const last = i === SCENES.length - 1;
    slot.fromTo(
      layer,
      { autoAlpha: first ? 1 : 0 },
      { autoAlpha: 1, duration: first ? 0.01 : LAYER_FADE },
      0,
    );
    if (!last) slot.to(layer, { autoAlpha: 0, duration: LAYER_FADE }, length - LAYER_FADE);
    master.add(slot, scene.from);
    slots.set(scene.id, { slot, ctx: { layer, scene } });
  });
  master.set({}, {}, TOTAL_VH);

  ScrollTrigger.create({
    trigger: track,
    start: 'top top',
    end: 'bottom bottom',
    animation: master,
    scrub: true,
  });

  /** Re-render the master at its current time, so a newly added scene shows its state. */
  const refresh = () => {
    const t = master.time();
    master.time(t + 0.001, true).time(t, true);
  };

  function ensureLoaded(id: SceneId): Promise<void> {
    let pending = loading.get(id);
    if (!pending) {
      const entry = slots.get(id)!;
      pending = entry.ctx.scene.load().then(({ default: mod }) => {
        mod.mount(entry.ctx);
        entry.slot.add(mod.timeline(entry.ctx), 0);
        refresh();
      });
      loading.set(id, pending);
    }
    return pending;
  }

  async function loadAll(vh: number) {
    const byDistance = [...SCENES].sort(
      (a: SceneDef, b: SceneDef) => distance(a, vh) - distance(b, vh),
    );
    for (const scene of byDistance) await ensureLoaded(scene.id);
  }

  return { ensureLoaded, loadAll };
}

const distance = (scene: SceneDef, vh: number) =>
  vh < scene.from ? scene.from - vh : vh > scene.to ? vh - scene.to : 0;
