/**
 * The quantization benchmark's results (src/data/benchmark.csv): one row per format, with
 * KL divergence against the FP16 reference, speed, VRAM, power and the source of each row.
 * The CLI's `stats quantization` and the chart in the benchmark's window read it; until the
 * results are added, both say the results are pending.
 */
export interface BenchmarkRow {
  format: string;
  klDivergence: number;
  tokensPerSecond: number;
  vramGb: number;
  powerW: number;
  source: string;
}

const COLUMNS = ['format', 'kl_divergence', 'tokens_per_s', 'vram_gb', 'power_w', 'source'];

export function parseBenchmark(csv: string): BenchmarkRow[] {
  const [header, ...lines] = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!header) return [];
  const names = header.split(',').map((h) => h.trim());
  const missing = COLUMNS.filter((c) => !names.includes(c));
  if (missing.length > 0)
    throw new Error(`benchmark.csv is missing columns: ${missing.join(', ')}`);
  return lines.map((line, i) => {
    const cells = line.split(',').map((c) => c.trim());
    const get = (name: string) => cells[names.indexOf(name)] ?? '';
    const num = (name: string) => {
      const value = Number(get(name));
      if (!Number.isFinite(value))
        throw new Error(`benchmark.csv row ${i + 2}: ${name} is not a number`);
      return value;
    };
    if (!get('source')) throw new Error(`benchmark.csv row ${i + 2}: every row names its source`);
    return {
      format: get('format'),
      klDivergence: num('kl_divergence'),
      tokensPerSecond: num('tokens_per_s'),
      vramGb: num('vram_gb'),
      powerW: num('power_w'),
      source: get('source'),
    };
  });
}

/** Quality per GB: lower KL divergence and less VRAM are both better. */
export function bestQualityPerGb(rows: readonly BenchmarkRow[]): BenchmarkRow | undefined {
  return [...rows].sort((a, b) => a.klDivergence * a.vramGb - b.klDivergence * b.vramGb)[0];
}
