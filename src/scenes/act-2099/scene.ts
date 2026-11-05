import { gsap } from 'gsap';
import { addBeatFades, sceneTimeline } from '../beats';
import { formatYear } from '../registry';
import type { SceneContext, SceneModule } from '../types';

/** Positions within Act I, in vh (scroll map and storyboard frames I-1 to I-4). */
const SPREAD_END = 20; // I-1: the light has spread into the canvas
const REVEAL_AT = 20; // I-2: the greeting reveals, once per visit
const CARDS_FROM = 62; // I-3: cards rise into place…
const CARDS_TO = 98; // …and have settled before their rest point (100)
const MAGNET_FROM = 66; // cards lean toward the cursor from here…
const MAGNET_TO = 140; // …until the glass starts to decay
const DECAY_FROM = 120; // I-4: pixel artefacts and scanlines creep in
const LEAN = 8; // px: the most a card leans toward the cursor

/** Which way each card drifts as the glass decays (in card order). */
const DRIFT: readonly (readonly [number, number])[] = [
  [-18, -10],
  [16, -12],
  [-14, 12],
  [18, 10],
];

/**
 * Act I · 2099. The light spreads into an ambient glow that trails the cursor, the HUD ring
 * ticks the year down, the greeting arrives word by word, glass cards rise and lean toward
 * the cursor, and at the end the glass starts to decay toward 1999.
 */
function actOne(): SceneModule {
  let local = 0;
  const cleanups: (() => void)[] = [];

  return {
    mount({ layer }: SceneContext) {
      const greeting = layer.querySelector<HTMLElement>('[data-a1-greeting]');
      if (greeting) {
        const words = greeting.querySelectorAll<HTMLElement>('.word');
        words.forEach((word, i) => word.style.setProperty('--n', String(i)));
        greeting.style.setProperty('--words', String(words.length));
        if (!greeting.classList.contains('is-revealed')) greeting.classList.add('is-armed');
      }

      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const glow = layer.querySelector<HTMLElement>('[data-a1-cursor]');
      const glowTo = glow && {
        x: gsap.quickTo(glow, 'x', { duration: 0.6, ease: 'power3.out' }),
        y: gsap.quickTo(glow, 'y', { duration: 0.6, ease: 'power3.out' }),
      };
      const cards = [...layer.querySelectorAll<HTMLElement>('.a1-card')].map((card) => {
        const inner = card.querySelector<HTMLElement>('.a1-card-inner')!;
        const spring = { duration: 0.9, ease: 'elastic.out(1, 0.55)' };
        return { card, x: gsap.quickTo(inner, 'x', spring), y: gsap.quickTo(inner, 'y', spring) };
      });

      // Pointer moves are only recorded; the lean is worked out once per frame.
      let pointer: { x: number; y: number } | undefined;
      const onMove = (e: PointerEvent) => {
        pointer = { x: e.clientX, y: e.clientY };
      };
      const onTick = () => {
        if (!pointer) return;
        const { x, y } = pointer;
        pointer = undefined;
        glowTo?.x(x);
        glowTo?.y(y);
        const magnetic = local > MAGNET_FROM && local < MAGNET_TO;
        for (const c of cards) {
          if (!magnetic) {
            c.x(0);
            c.y(0);
            continue;
          }
          const box = c.card.getBoundingClientRect();
          const dx = x - (box.left + box.width / 2);
          const dy = y - (box.top + box.height / 2);
          const distance = Math.hypot(dx, dy) || 1;
          const pull = Math.max(0, 1 - distance / 520);
          c.x((dx / distance) * LEAN * pull);
          c.y((dy / distance) * LEAN * pull);
        }
      };
      window.addEventListener('pointermove', onMove, { passive: true });
      gsap.ticker.add(onTick);
      cleanups.push(() => {
        window.removeEventListener('pointermove', onMove);
        gsap.ticker.remove(onTick);
      });
    },

    timeline(ctx: SceneContext) {
      const { layer } = ctx;
      const q = (selector: string) => layer.querySelector<HTMLElement>(selector);
      const tl = sceneTimeline(ctx);
      addBeatFades(tl, ctx);

      // I-1: the light spreads into the canvas; the hands fade; the HUD ring draws in.
      tl.fromTo(
        q('.a1-ambient'),
        { opacity: 0, scale: 0.3 },
        { opacity: 1, scale: 1, duration: SPREAD_END },
        0,
      );
      tl.fromTo(q('.tm-hands'), { opacity: 1 }, { opacity: 0, duration: 14 }, 0);
      tl.fromTo(q('[data-a1-cursor]'), { opacity: 0 }, { opacity: 1, duration: 6 }, 14);
      tl.fromTo(q('[data-a1-hud]'), { opacity: 0 }, { opacity: 1, duration: 3 }, 2);
      tl.fromTo(
        q('.a1-hud-ring'),
        { strokeDasharray: '0 100' },
        { strokeDasharray: '100 0', duration: 6 },
        2,
      );

      // I-3: cards rise into place, the far ones moving less. I-4: they drift apart.
      layer.querySelectorAll<HTMLElement>('.a1-card').forEach((card, i) => {
        const depth = Number(card.dataset.depth ?? 0.7);
        tl.fromTo(
          card,
          { y: 140 * depth },
          { y: 0, duration: CARDS_TO - CARDS_FROM, ease: 'power2.out' },
          CARDS_FROM,
        );
        const [dx, dy] = DRIFT[i % DRIFT.length]!;
        tl.to(card, { x: dx, y: dy, duration: 30 }, DECAY_FROM);
      });

      // I-4: pixel artefacts and scanlines creep in; the HUD ring opens a gap.
      tl.fromTo(q('[data-a1-decay]'), { opacity: 0 }, { opacity: 0.7, duration: 30 }, DECAY_FROM);
      tl.to(q('.a1-hud-ring'), { strokeDasharray: '88 12', duration: 30 }, DECAY_FROM);

      // Every render, including a jump straight past a position, comes through here: the HUD
      // follows the year, and the greeting (I-2) arrives word by word, once per visit.
      const hudYear = q('[data-a1-hud-year]');
      const greeting = q('[data-a1-greeting]');
      tl.eventCallback('onUpdate', () => {
        local = tl.time();
        if (hudYear) hudYear.textContent = formatYear(local);
        if (local >= REVEAL_AT) greeting?.classList.add('is-revealed');
      });
      return tl;
    },

    unmount({ layer }: SceneContext) {
      for (const cleanup of cleanups.splice(0)) cleanup();
      layer.querySelector('[data-a1-greeting]')?.classList.remove('is-armed');
    },
  };
}

export default actOne();
