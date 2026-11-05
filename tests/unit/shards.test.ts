import { describe, expect, it } from 'vitest';
import {
  CRACK_TO,
  FALL_FROM,
  crackDrawn,
  crackReach,
  shardMap,
  shardPose,
} from '../../src/scenes/t-shatter/shards';

const impact = [0.05, 0.08] as const;
const map = shardMap(impact);

describe('the shatter', () => {
  it('breaks the same way on every visit', () => {
    expect(shardMap(impact)).toEqual(map);
    expect(map.shards.length).toBeGreaterThan(20);
  });

  it('cracks spread from the impact and have reached every seam by the end of A-1', () => {
    expect(crackReach(0, map.reach)).toBe(0);
    expect(crackReach(CRACK_TO, map.reach)).toBeCloseTo(map.reach);
    for (const crack of map.cracks) {
      expect(crackDrawn(crack, 0)).toBe(0);
      expect(crackDrawn(crack, crackReach(CRACK_TO, map.reach))).toBe(1);
    }
  });

  it('keeps every shard in place until the cracks are done, then lets the nearest go first', () => {
    for (const shard of map.shards) {
      expect(shardPose(shard, FALL_FROM).fallen).toBe(0);
      expect(shard.start).toBeGreaterThanOrEqual(FALL_FROM);
    }
    const byStart = [...map.shards].sort((a, b) => a.start - b.start);
    const d = (s: (typeof map.shards)[number]) =>
      Math.hypot(s.centre[0] - impact[0], s.centre[1] - impact[1]);
    expect(d(byStart[0]!)).toBeLessThan(d(byStart.at(-1)!));
  });

  it('has every shard gone by the end of A-2 (70 vh)', () => {
    for (const shard of map.shards) {
      const pose = shardPose(shard, 70);
      expect(pose.fallen).toBe(1);
      expect(pose.alpha).toBe(0);
    }
  });
});
