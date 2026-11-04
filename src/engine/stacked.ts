import { SCENES } from '../scenes/registry';

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Stacked mode (reduced motion, narrow screens, no pinning): acts sit one after another
 * and crossfade in (300 ms, in CSS) as they enter. Returns a function that maps the scroll
 * position to the equivalent vh of the descent, so the gauge and markers still work.
 */
export function initStacked(acts: readonly HTMLElement[]): () => number {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) if (entry.isIntersecting) entry.target.classList.add('is-in');
    },
    { threshold: 0.05 },
  );
  for (const act of acts) {
    // Whatever is on screen at load shows at once; only acts scrolled to later fade in.
    const { top, bottom } = act.getBoundingClientRect();
    if (top < window.innerHeight && bottom > 0) act.classList.add('is-in');
    observer.observe(act);
  }

  return () => {
    const line = window.innerHeight * 0.4;
    let current = acts[0];
    for (const act of acts) if (act.getBoundingClientRect().top <= line) current = act;
    const scene = SCENES.find((s) => s.id === current?.dataset.scene) ?? SCENES[0]!;
    const rect = current!.getBoundingClientRect();
    return scene.from + clamp01((line - rect.top) / rect.height) * (scene.to - scene.from);
  };
}
