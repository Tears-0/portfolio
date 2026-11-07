import { gsap } from 'gsap';
import { addBeatFades, sceneTimeline } from '../beats';
import type { SceneContext, SceneModule } from '../types';

/** Positions within Act IV, in map vh from its start (scroll map and storyboard IV-1 to IV-4). */
const IGNITE = [0, 6, 12, 18]; // IV-1: the four groups of stars ignite in turn…
const IGNITE_FOR = 12;
const DRAW_FROM = 8; // …and the constellations draw themselves
const DRAW_FOR = 22;
const UNROLL_FROM = 40; // IV-2: the parchment leaf unrolls…
const UNROLL_TO = 52;
const INK_FROM = 46; // …and the closing line is inked, letter by letter
const INK_TO = 58;
const CIRCLE_FROM = 92; // IV-3: the transmutation circle draws itself…
const CIRCLE_TO = 150;
const FORM_FROM = 140; // …then the form and the outer ring appear
const FORM_TO = 162;
const LEAN = 14; // px: how far the constellations bend toward the cursor

/** How many letters of the closing line are inked at `local` vh. */
export const inkedLetters = (local: number, total: number): number =>
  Math.round(Math.min(1, Math.max(0, (local - INK_FROM) / (INK_TO - INK_FROM))) * total);

/**
 * Act IV · 1350. Stars ignite across the indigo and the three era signs draw themselves as
 * constellations that lean toward the cursor; the parchment leaf unrolls and its closing line
 * is inked letter by letter; the transmutation circle draws itself around the contact form.
 */
function actFour(): SceneModule {
  const cleanups: (() => void)[] = [];

  return {
    mount({ layer }: SceneContext) {
      layer.classList.add('is-live');
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const groups = [...layer.querySelectorAll<SVGGElement>('[data-a4-constellation]')].map(
        (g) => ({
          x: gsap.quickTo(g, 'x', { duration: 1.4, ease: 'power3.out' }),
          y: gsap.quickTo(g, 'y', { duration: 1.4, ease: 'power3.out' }),
        }),
      );
      const onMove = (e: PointerEvent) => {
        const dx = (e.clientX / window.innerWidth - 0.5) * 2;
        const dy = (e.clientY / window.innerHeight - 0.5) * 2;
        for (const g of groups) {
          g.x(dx * LEAN);
          g.y(dy * LEAN);
        }
      };
      window.addEventListener('pointermove', onMove, { passive: true });
      cleanups.push(() => window.removeEventListener('pointermove', onMove));
    },

    timeline(ctx: SceneContext) {
      const { layer } = ctx;
      const q = (selector: string) => layer.querySelector<HTMLElement>(selector);
      const qa = (selector: string) => [...layer.querySelectorAll<HTMLElement>(selector)];
      const tl = sceneTimeline(ctx);
      addBeatFades(tl, ctx);

      // IV-1: stars ignite in four waves; the constellations draw, then name themselves.
      qa('[data-a4-stars]').forEach((group, i) => {
        tl.fromTo(group, { opacity: 0 }, { opacity: 1, duration: IGNITE_FOR }, IGNITE[i] ?? 0);
      });
      qa('[data-a4-constellation]').forEach((c, i) => {
        const start = DRAW_FROM + i * 5;
        tl.fromTo(
          c.querySelectorAll('.a4-line'),
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: DRAW_FOR, ease: 'power1.inOut' },
          start,
        );
        tl.fromTo(
          c.querySelectorAll('.a4-node, .a4-name'),
          { opacity: 0 },
          { opacity: 1, duration: 8 },
          start + DRAW_FOR - 6,
        );
      });

      // IV-2: the leaf unrolls from the top.
      tl.fromTo(
        q('[data-a4-leaf]'),
        { clipPath: 'inset(0% 0% 100% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: UNROLL_TO - UNROLL_FROM, ease: 'power2.out' },
        UNROLL_FROM,
      );

      // IV-3: the circle's rings draw one after another; the form and the outer ring follow.
      qa('[data-a4-circle] .a4-ring').forEach((ring, i, all) => {
        const span = (CIRCLE_TO - CIRCLE_FROM) / (all.length + 1);
        tl.fromTo(
          ring,
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: span * 2, ease: 'power1.inOut' },
          CIRCLE_FROM + i * span,
        );
      });
      tl.fromTo(
        qa('[data-a4-circle] .a4-tick, [data-a4-circle] .a4-mark'),
        { opacity: 0 },
        { opacity: 0.75, duration: 18 },
        CIRCLE_FROM + 24,
      );
      tl.fromTo(
        qa('.a4-form, .a4-outer'),
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: FORM_TO - FORM_FROM },
        FORM_FROM,
      );

      // The closing line inks letter by letter; the portal hears when the circle is near.
      const letters = qa('[data-a4-ink] .c');
      const portal = q('[data-portal]');
      let inked = -1;
      let near = false;
      tl.eventCallback('onUpdate', () => {
        const local = tl.time();
        const n = inkedLetters(local, letters.length);
        if (n !== inked) {
          letters.forEach((letter, i) => letter.classList.toggle('is-inked', i < n));
          inked = n;
        }
        if (!near && local >= CIRCLE_FROM) {
          near = true;
          // A flag as well as an event: the portal's controller may load after this moment.
          if (portal) portal.dataset.near = '';
          portal?.dispatchEvent(new CustomEvent('portal:near'));
        }
      });
      return tl;
    },

    unmount({ layer }: SceneContext) {
      for (const cleanup of cleanups.splice(0)) cleanup();
      layer.classList.remove('is-live');
    },
  };
}

export default actFour();
