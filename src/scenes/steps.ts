import type { Beat } from './registry';

/**
 * Which numbered step of an act is current at `vh`: the beats named `<prefix>-1`, `-2` … each
 * take over `lead` vh before they start (so a cartridge or valve moves just ahead of its
 * window), and every step ends at the beat named `until`. 0 before the first and after that.
 */
export function activeStep(
  vh: number,
  beats: readonly Beat[],
  prefix: string,
  lead: number,
  until: string,
): number {
  const pattern = new RegExp(`^${prefix}-(\\d+)$`);
  let active = 0;
  for (const beat of beats) {
    const n = Number(beat.id.match(pattern)?.[1]);
    if (n && vh >= beat.from - lead) active = n;
    if (beat.id === until && vh >= beat.from) active = 0;
  }
  return active;
}
