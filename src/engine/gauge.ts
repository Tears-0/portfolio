import { TOTAL_VH, formatYear, sceneAt, type EraId, type SceneId } from '../scenes/registry';

/** Placeholder skins; the real four skins and their morphs arrive in M6. */
const SKINS: Record<EraId, string> = {
  '2099': 'laser reticle',
  '1999': 'pixel scrollbar',
  '1888': 'brass rack-and-pinion',
  '1350': 'astrolabe dial',
};

export interface Gauge {
  update(vh: number): void;
}

export function createGauge(nav: HTMLElement): Gauge {
  const year = nav.querySelector<HTMLElement>('[data-gauge-year]');
  const skin = nav.querySelector<HTMLElement>('[data-gauge-skin]');
  const links = [...nav.querySelectorAll<HTMLAnchorElement>('[data-era-link]')];
  let lastScene: SceneId | undefined;
  // Positions arrive as data: the Content-Security-Policy blocks style="…" in the markup.
  for (const stop of nav.querySelectorAll<HTMLElement>('[data-at]')) {
    stop.style.setProperty('--at', stop.dataset.at ?? '0');
  }

  return {
    update(vh) {
      nav.style.setProperty('--progress', String(Math.min(1, Math.max(0, vh / TOTAL_VH))));
      if (year) year.textContent = formatYear(vh);
      const scene = sceneAt(vh);
      if (scene.id === lastScene) return;
      lastScene = scene.id;
      nav.dataset.era = scene.era;
      if (skin) {
        skin.textContent =
          scene.kind === 'transition'
            ? `skin: ${SKINS[scene.era]}, morphing`
            : `skin: ${SKINS[scene.era]}`;
      }
      for (const link of links) {
        if (link.dataset.eraLink === scene.era) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    },
  };
}
