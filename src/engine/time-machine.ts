import type { EraId } from '../scenes/registry';
import { isTyping } from './keys';

export interface EraData {
  id: EraId;
  year: number;
  title: string;
  anchor: string;
  charge: string;
  sign?: 'circuit' | 'gear' | 'astrolabe';
  quote?: { text: string; by: string; source: string };
}

export interface TimeMachineOptions {
  /** True while the prologue is on screen; the digit keys only pick eras then. */
  isActive(): boolean;
  /** Loads what the destination needs. */
  preload(era: EraData): Promise<void>;
  /** Jumps to the era's first rest point and returns the heading to focus there. */
  travelTo(era: EraData): Promise<HTMLElement | null>;
}

/** Holding the light skips one era every 1.5 s. */
export const STEP_MS = 1500;
/** The loading screen always plays its full sequence, even when nothing is left to load. */
export const MIN_LOADING_MS = 5000;

/**
 * How many eras back a hold of `elapsed` ms reaches, up to `jumps`. The machine only travels
 * back in time: 2099 is where the visitor already is, so 0 means "not far enough" and the
 * release cancels.
 */
export function erasBack(elapsed: number, jumps: number): number {
  return Math.min(jumps, Math.max(0, Math.floor(elapsed / STEP_MS)));
}

const PHASES: readonly (readonly [number, string])[] = [
  [500, 'stars gather'],
  [3000, 'rotate and link into the sign'],
  [4600, 'hold'],
  [5000, 'land'],
];

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * The prologue's time machine: press and hold the light to charge, release to travel.
 * Grey box for M1: the ring, readout and loading screen work; hands, particles and
 * constellations are drawn in M2.
 */
export function initTimeMachine(
  root: HTMLElement,
  overlay: HTMLElement,
  eras: readonly EraData[],
  opts: TimeMachineOptions,
): void {
  const light = root.querySelector<HTMLButtonElement>('[data-tm-light]')!;
  const segments = [...root.querySelectorAll<SVGElement>('[data-tm-segment]')];
  const yearEl = root.querySelector<HTMLElement>('[data-tm-year]')!;
  const titleEl = root.querySelector<HTMLElement>('[data-tm-title]')!;
  const loadingTitle = overlay.querySelector<HTMLElement>('[data-tm-loading-title]')!;
  const quoteText = overlay.querySelector<HTMLElement>('[data-tm-quote]')!;
  const quoteBy = overlay.querySelector<HTMLElement>('[data-tm-by]')!;
  const signEl = overlay.querySelector<HTMLElement>('[data-tm-sign]')!;
  const phaseEl = overlay.querySelector<HTMLElement>('[data-tm-phase]')!;
  const inertWhileTravelling = [
    ...document.querySelectorAll<HTMLElement>('[data-inert-while-travelling]'),
  ];

  const now = eras[0]!; // 2099: its colour while charging, never a destination
  const destinations = eras.slice(1);

  let charging = false;
  let pressedAt = 0;
  let frame = 0;
  let loading: { cancel(): void } | null = null;

  function render(elapsed: number) {
    // From the clock, not from the last frame drawn: frames stall in background tabs.
    const back = erasBack(elapsed, destinations.length);
    segments.forEach((seg, i) =>
      seg.style.setProperty('--fill', String(clamp01(elapsed / STEP_MS - i))),
    );
    const target = back === 0 ? undefined : destinations[back - 1];
    root.style.setProperty('--charge', (target ?? now).charge);
    root.dataset.level = String(back);
    yearEl.textContent = charging && target ? String(target.year) : '';
    titleEl.textContent = !charging
      ? ''
      : target
        ? `${target.title} · release to travel · Esc cancels`
        : 'Keep holding: 1.5 s per era';
  }

  function tick() {
    render(performance.now() - pressedAt);
    frame = requestAnimationFrame(tick);
  }

  function press() {
    if (charging || loading) return;
    charging = true;
    pressedAt = performance.now();
    root.dataset.state = 'charging';
    tick();
  }

  /** Stops charging and returns how many eras back the hold reached. */
  function stop(): number {
    const back = erasBack(performance.now() - pressedAt, destinations.length);
    charging = false;
    cancelAnimationFrame(frame);
    root.dataset.state = 'idle';
    render(0);
    return back;
  }

  function release() {
    if (!charging) return;
    const back = stop();
    if (back > 0) void travel(destinations[back - 1]!);
  }

  const cancel = () => {
    if (charging) stop();
  };

  async function travel(era: EraData) {
    loadingTitle.textContent = `${era.year} · ${era.title}`;
    quoteText.textContent = era.quote ? `“${era.quote.text}”` : '';
    quoteBy.textContent = era.quote ? `${era.quote.by}, ${era.quote.source}` : '';
    signEl.textContent = era.sign ?? '';
    overlay.style.setProperty('--charge', era.charge);
    overlay.dataset.slow = 'false';
    overlay.hidden = false;
    overlay.classList.remove('is-open');
    void overlay.offsetWidth; // restart the 5 s CSS sequence
    overlay.classList.add('is-open');
    for (const el of inertWhileTravelling) el.inert = true;
    loadingTitle.focus();

    const opened = performance.now();
    let phaseFrame = 0;
    const showPhase = () => {
      const t = performance.now() - opened;
      phaseEl.textContent =
        PHASES.find(([until]) => t < until)?.[1] ??
        (overlay.dataset.slow === 'true' ? 'still loading' : 'land');
      phaseFrame = requestAnimationFrame(showPhase);
    };
    showPhase();
    const slowTimer = setTimeout(() => (overlay.dataset.slow = 'true'), MIN_LOADING_MS);

    let cancelled = false;
    const close = () => {
      cancelAnimationFrame(phaseFrame);
      clearTimeout(slowTimer);
      overlay.classList.remove('is-open');
      overlay.hidden = true;
      for (const el of inertWhileTravelling) el.inert = false;
      loading = null;
    };
    loading = {
      cancel() {
        cancelled = true;
        close();
        light.focus();
      },
    };

    await Promise.all([opts.preload(era), delay(MIN_LOADING_MS)]);
    if (cancelled) return;
    const heading = await opts.travelTo(era);
    close();
    heading?.focus({ preventScroll: true });
  }

  light.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    light.setPointerCapture(e.pointerId);
    light.focus({ preventScroll: true });
    press();
  });
  light.addEventListener('pointerup', release);
  light.addEventListener('pointercancel', cancel);
  light.addEventListener('contextmenu', (e) => e.preventDefault());
  light.addEventListener('keydown', (e) => {
    if (e.key !== ' ' && e.key !== 'Enter') return;
    e.preventDefault();
    e.stopPropagation();
    if (!e.repeat) press();
  });
  light.addEventListener('keyup', (e) => {
    if (e.key !== ' ' && e.key !== 'Enter') return;
    e.preventDefault();
    release();
  });
  light.addEventListener('blur', cancel);
  // Scrolling during a hold cancels it; the scroll itself starts the descent.
  window.addEventListener('wheel', cancel, { passive: true });

  // Keys 2–4 jump straight to 1999, 1888 and 1350: their places on the timeline.
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (loading) loading.cancel();
      else cancel();
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target) || loading || charging) return;
    if (!/^[2-4]$/.test(e.key) || !opts.isActive()) return;
    e.preventDefault();
    void travel(destinations[Number(e.key) - 2]!);
  });
}
