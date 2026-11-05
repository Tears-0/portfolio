import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { bestQualityPerGb, parseBenchmark } from '../../src/lib/benchmark';

const HEADER = 'format,kl_divergence,tokens_per_s,vram_gb,power_w,source';

describe('benchmark.csv', () => {
  it('parses as it stands in the repository', () => {
    expect(() => parseBenchmark(readFileSync('src/data/benchmark.csv', 'utf8'))).not.toThrow();
  });

  it('reads rows by column name', () => {
    const rows = parseBenchmark(`${HEADER}\nQ4_K_M,0.021,92,5.1,205,run 3 @ a1b2c3d\n`);
    expect(rows).toEqual([
      {
        format: 'Q4_K_M',
        klDivergence: 0.021,
        tokensPerSecond: 92,
        vramGb: 5.1,
        powerW: 205,
        source: 'run 3 @ a1b2c3d',
      },
    ]);
  });

  it('refuses rows without a source or with a broken number', () => {
    expect(() => parseBenchmark(`${HEADER}\nQ4_K_M,0.021,92,5.1,205,\n`)).toThrow(/source/);
    expect(() => parseBenchmark(`${HEADER}\nQ4_K_M,abc,92,5.1,205,run 3\n`)).toThrow(
      /kl_divergence/,
    );
    expect(() => parseBenchmark('format,source\n')).toThrow(/missing columns/);
  });

  it('picks the best quality per GB', () => {
    const rows = parseBenchmark(
      `${HEADER}\nA,0.05,90,4,200,s\nB,0.02,80,6,210,s\nC,0.01,70,16,250,s\n`,
    );
    expect(bestQualityPerGb(rows)?.format).toBe('B');
    expect(bestQualityPerGb([])).toBeUndefined();
  });
});
