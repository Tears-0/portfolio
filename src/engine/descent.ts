import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ANCHORS, SCENES, sceneAt } from '../scenes/registry';
import { createGauge, type Gauge } from './gauge';
import { activates, allowsPaging, isTyping } from './keys';
import { createMarkers, type Markers } from './markers';
import { createMaster } from './master';
import {
  anchorToVh,
  lastRest,
  nextRest,
  prevRest,
  travelSeconds,
  vhToY,
  yToVh,
} from './navigation';
import { createParticles, type Particles } from './particles';
import { initStacked } from './stacked';
import { initTimeMachine, type EraData } from './time-machine';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

interface Shared {
  eras: EraData[];
  gauge: Gauge;
  markers: Markers;
  reduced: boolean;
}

/** The prologue owns the top of Act I; the digit keys pick eras only while it shows. */
const PROLOGUE_END_VH = 22;

const headingFor = (anchor: string) => document.getElementById(`${anchor}-title`);

/**
 * Where a hash lands in the descent: an act anchor (#works …) goes to its rest point, and so
 * does any element that names its own (`data-rest`), such as a 1999 project window.
 */
function hashTarget(hash: string): { vh: number; focus: HTMLElement | null } | undefined {
  const id = decodeURIComponent(hash.slice(1));
  const anchor = anchorToVh(hash);
  if (anchor !== undefined) return { vh: anchor, focus: headingFor(id) };
  const el = id ? document.getElementById(id) : null;
  const rest = Number(el?.dataset.rest);
  return el && el.dataset.rest && Number.isFinite(rest) ? { vh: rest, focus: el } : undefined;
}

/** What takes focus on arriving at a rest point: its window, or its act's heading. */
function focusAt(vh: number): HTMLElement | null {
  const own = document.querySelector<HTMLElement>(`[data-rest="${vh}"]`);
  if (own) return own;
  const anchor = Object.entries(ANCHORS).find(([, at]) => at === vh)?.[0];
  return anchor ? headingFor(anchor) : null;
}

/** Stacked mode's "next": the following window in the same act, or else the next act. */
function nextStacked(from: Element): HTMLElement | null {
  let beat = from.closest('.beat')?.nextElementSibling;
  while (beat) {
    const own = beat.querySelector<HTMLElement>('[data-rest]');
    if (own) return own;
    beat = beat.nextElementSibling;
  }
  const acts = [...document.querySelectorAll<HTMLElement>('[data-scene][data-kind="act"]')];
  const next = acts[acts.findIndex((act) => act.contains(from)) + 1];
  return next?.querySelector<HTMLElement>('.act-title') ?? next ?? null;
}

const clickedNext = (e: MouseEvent): Element | null =>
  e.button === 0 ? ((e.target as Element | null)?.closest?.('[data-next]') ?? null) : null;

/** The prologue's particle surge, aimed at the centre of the light. None with reduced motion. */
function prologueParticles(reduced: boolean): Particles | undefined {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-tm-particles]');
  const light = document.querySelector<HTMLElement>('[data-tm-light]');
  if (reduced || !canvas || !light) return undefined;
  return createParticles(canvas, () => {
    const box = light.getBoundingClientRect();
    return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  });
}

/**
 * Entry point. The inline script in the layout picks the mode before first paint:
 * "descent" (pinned, scrubbed) on desktop with motion allowed, "stacked" otherwise.
 */
export function start(): void {
  const html = document.documentElement;
  const shared: Shared = {
    eras: JSON.parse(document.getElementById('era-data')?.textContent ?? '[]') as EraData[],
    gauge: createGauge(document.querySelector<HTMLElement>('[data-gauge]')!),
    markers: createMarkers(document.querySelector<HTMLElement>('[data-markers]')!),
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
  if (html.dataset.mode === 'descent') startDescent(shared);
  else startStacked(shared);
}

function startDescent({ eras, gauge, markers, reduced }: Shared) {
  history.scrollRestoration = 'manual';
  const track = document.querySelector<HTMLElement>('[data-track]')!;
  const stage = document.querySelector<HTMLElement>('[data-stage]')!;
  const master = createMaster(track, stage);
  const vhNow = () => yToVh(window.scrollY, window.innerHeight);

  async function goTo(vh: number, { instant = false, focus = null as HTMLElement | null } = {}) {
    await master.ensureLoaded(sceneAt(vh).id);
    const y = vhToY(vh, window.innerHeight);
    // Render the destination first: focus cannot land on a layer that is still hidden.
    const land = () => {
      ScrollTrigger.update();
      focus?.focus({ preventScroll: true });
    };
    if (instant || reduced) {
      gsap.killTweensOf(window);
      window.scrollTo(0, y);
      land();
      return;
    }
    gsap.to(window, {
      scrollTo: { y, autoKill: true },
      duration: travelSeconds(vhNow(), vh),
      ease: 'power2.inOut',
      overwrite: true,
      onComplete: land,
    });
  }

  // Keyboard paging between rest points. Arrow keys keep native scrolling. In a text field
  // only PageUp and PageDown page, and only where the field allows it (the 1999 console).
  window.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    if (isTyping(e.target)) {
      const pages = e.key === 'PageDown' || e.key === 'PageUp';
      if (!pages || !allowsPaging(e.target)) return;
    }
    const vh = vhNow();
    let target: number | undefined;
    switch (e.key) {
      case 'PageDown':
        target = nextRest(vh);
        break;
      case 'PageUp':
        target = prevRest(vh);
        break;
      case ' ':
        if (activates(e.target)) return;
        target = e.shiftKey ? prevRest(vh) : nextRest(vh);
        break;
      case 'Home':
        target = 0;
        break;
      case 'End':
        target = lastRest();
        break;
      default:
        return;
    }
    if (target === undefined) return;
    e.preventDefault();
    void goTo(target);
  });

  // Deep links (#works, #engine, #origin, #contact, a cartridge's #project-…) land on their
  // rest point. A window's close button, and the console's Skip, move on to the next one.
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
      return;
    if (clickedNext(e)) {
      const vh = nextRest(vhNow()) ?? lastRest();
      void goTo(vh, { focus: focusAt(vh) });
      return;
    }
    const link = (e.target as Element | null)?.closest?.('a[href^="#"]');
    if (!(link instanceof HTMLAnchorElement)) return;
    const target = hashTarget(link.hash);
    if (!target) return;
    e.preventDefault();
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    void goTo(target.vh, { focus: target.focus });
  });
  window.addEventListener('hashchange', () => {
    const target = hashTarget(location.hash);
    if (target) void goTo(target.vh, { focus: target.focus });
  });

  // Keep the gauge and markers in step, and load the scenes around the visitor.
  const neighbours = (vh: number) => {
    const i = SCENES.indexOf(sceneAt(vh));
    return SCENES.slice(Math.max(0, i - 1), i + 2);
  };
  const onScroll = () => {
    const vh = vhNow();
    gauge.update(vh);
    markers.update(vh);
    for (const scene of neighbours(vh)) void master.ensureLoaded(scene.id);
  };
  ScrollTrigger.create({
    trigger: track,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: onScroll,
  });

  initTimeMachine(
    document.querySelector<HTMLElement>('[data-time-machine]')!,
    document.querySelector<HTMLElement>('[data-tm-loading]')!,
    eras,
    {
      isActive: () => vhNow() < PROLOGUE_END_VH,
      preload: async (era) => {
        const vh = ANCHORS[era.anchor] ?? 0;
        await Promise.all(neighbours(vh).map((s) => master.ensureLoaded(s.id)));
      },
      // The jump lands behind the loading screen, which hands focus over as it closes.
      travelTo: async (era) => {
        await goTo(ANCHORS[era.anchor] ?? 0, { instant: true });
        return headingFor(era.anchor);
      },
      particles: prologueParticles(reduced),
    },
  );

  // A deep link, or ?at=<vh> to open anywhere in the descent while reviewing pacing.
  const initial = hashTarget(location.hash);
  const at = Number(new URLSearchParams(location.search).get('at'));
  void goTo(initial?.vh ?? (Number.isFinite(at) ? at : 0), {
    instant: true,
    focus: initial?.focus ?? null,
  }).then(onScroll);
  // Everything else loads while the visitor reads Act I.
  setTimeout(() => void master.loadAll(vhNow()), 1200);
}

function startStacked({ eras, gauge, markers, reduced }: Shared) {
  const acts = [...document.querySelectorAll<HTMLElement>('[data-scene][data-kind="act"]')];
  const vhNow = initStacked(acts);
  let queued = false;
  const onScroll = () => {
    queued = false;
    const vh = vhNow();
    gauge.update(vh);
    markers.update(vh);
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true },
  );
  onScroll();

  // A window's close button, and the console's Skip: on to the next window, or the next act.
  document.addEventListener('click', (e) => {
    const from = clickedNext(e);
    const next = from && nextStacked(from);
    if (!next) return;
    next.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
    next.focus({ preventScroll: true });
  });

  initTimeMachine(
    document.querySelector<HTMLElement>('[data-time-machine]')!,
    document.querySelector<HTMLElement>('[data-tm-loading]')!,
    eras,
    {
      isActive: () => window.scrollY < window.innerHeight * 0.5,
      preload: async () => {},
      travelTo: async (era) => {
        document.getElementById(era.anchor)?.scrollIntoView({ block: 'start' });
        return headingFor(era.anchor);
      },
      particles: prologueParticles(reduced),
    },
  );
}
