import { ANCHORS, REST_POINTS, SCROLL_PACE } from '../scenes/registry';

/** Rest points closer than this (vh) count as "here", so paging always moves on. */
const HERE = 0.5;

/** Map vh ↔ pixels of scroll: each map vh is SCROLL_PACE viewport heights long. */
export const vhToY = (vh: number, viewportHeight: number, pace = SCROLL_PACE): number =>
  (vh / 100) * viewportHeight * pace;
export const yToVh = (y: number, viewportHeight: number, pace = SCROLL_PACE): number =>
  (y / viewportHeight / pace) * 100;

/** Page Down / Space: the next rest point, or undefined past the last one. */
export function nextRest(vh: number): number | undefined {
  return REST_POINTS.find((r) => r.vh > vh + HERE)?.vh;
}

/** Page Up / Shift+Space: the previous rest point, or the very top. */
export function prevRest(vh: number): number {
  return REST_POINTS.findLast((r) => r.vh < vh - HERE)?.vh ?? 0;
}

export const firstRest = (): number => REST_POINTS[0]?.vh ?? 0;
export const lastRest = (): number => REST_POINTS[REST_POINTS.length - 1]?.vh ?? 0;

/** "#works" → 300. Unknown hashes return undefined so the browser handles them. */
export function anchorToVh(hash: string): number | undefined {
  const id = decodeURIComponent(hash.replace(/^#/, ''));
  return Object.hasOwn(ANCHORS, id) ? ANCHORS[id] : undefined;
}

/** Scrubbed travel between rest points: quick for neighbours, capped for the whole descent. */
export function travelSeconds(fromVh: number, toVh: number): number {
  const distance = Math.abs(toVh - fromVh);
  return distance === 0 ? 0 : Math.min(1.6, 0.35 + distance / 880);
}
