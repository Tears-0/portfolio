import { REST_POINTS, TOTAL_VH, beatAt, sceneAt } from '../scenes/registry';
import { nextRest } from './navigation';
import { isTyping } from './keys';

const STORAGE_KEY = 'four-eras:markers';

export interface Markers {
  update(vh: number): void;
}

/** On-screen scroll markers for tuning pacing. Toggle with the ` key; the choice is remembered. */
export function createMarkers(panel: HTMLElement): Markers {
  const readout = panel.querySelector<HTMLElement>('[data-markers-readout]');
  const now = panel.querySelector<HTMLElement>('[data-markers-now]');
  for (const mark of panel.querySelectorAll<HTMLElement>('[data-top]')) {
    mark.style.top = mark.dataset.top ?? '0';
    if (mark.dataset.height) mark.style.height = mark.dataset.height;
  }

  const read = () => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  };
  const write = (value: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Private windows can refuse storage; the toggle still works for this visit.
    }
  };

  panel.hidden = read() === 'off';
  window.addEventListener('keydown', (e) => {
    if (e.key !== '`' || e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
    panel.hidden = !panel.hidden;
    write(panel.hidden ? 'off' : 'on');
  });

  return {
    update(vh) {
      if (now) now.style.setProperty('--at', String(Math.min(1, Math.max(0, vh / TOTAL_VH))));
      if (!readout || panel.hidden) return;
      const scene = sceneAt(vh);
      const beat = beatAt(vh);
      const atRest = REST_POINTS.find((r) => Math.abs(r.vh - vh) < 0.75);
      const next = nextRest(vh);
      readout.textContent = [
        `vh ${vh.toFixed(1)} / ${TOTAL_VH}`,
        `${scene.id}  ${scene.from}–${scene.to}`,
        beat ? `${beat.frames}  ${beat.label}` : '—',
        atRest
          ? `● at rest ${atRest.vh}`
          : `next rest ${next ?? '—'}${next === undefined ? '' : ` (${Math.round(next - vh)} vh)`}`,
      ].join('\n');
    },
  };
}
