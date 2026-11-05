/**
 * The 1999 console's commands. Every answer comes from the content data, never from
 * hand-typed strings: `run cartridge_02.exe` prints that project's title, stack, status and
 * highlight. Pure functions, so they are tested without a browser.
 */
export interface CliProject {
  cartridge: string; // "cartridge_02.exe"
  label: string; // "QUANT BENCH"
  slug: string;
  title: string;
  summary: string;
  stack: string[];
  status: string;
  highlight?: { value: string; label: string; source: string };
  facts: string[];
}

export interface CliData {
  name: string;
  headline: string;
  projects: CliProject[];
  benchmark: {
    format: string;
    klDivergence: number;
    tokensPerSecond: number;
    vramGb: number;
    powerW: number;
    source: string;
  }[];
}

export interface CliResult {
  lines: string[];
  clear?: boolean;
}

export const SUGGESTED = ['ls projects', 'run cartridge_02.exe', 'stats quantization', 'help'];

const HELP = [
  'commands:',
  '  ls projects            list the cartridges in the rack',
  '  run cartridge_0N.exe   load a project (N = 1 to 4)',
  '  stats quantization     the benchmark results',
  '  whoami                 who built this deck',
  '  clear                  clear the screen',
];

function findProject(target: string, projects: readonly CliProject[]): CliProject | undefined {
  const t = target.replace(/^\.\//, '');
  const n = Number(t.match(/^(?:cartridge_)?0?(\d+)(?:\.exe)?$/)?.[1]);
  if (Number.isInteger(n) && n >= 1) return projects[n - 1];
  return projects.find((p) => p.slug === t);
}

function describe(p: CliProject): string[] {
  return [
    `loading ${p.cartridge} ...`,
    p.title,
    `  stack   ${p.stack.join(' · ')}`,
    `  status  ${p.status}`,
    ...(p.highlight
      ? [
          `  best    ${p.highlight.value} ${p.highlight.label}`,
          `          source: ${p.highlight.source}`,
        ]
      : []),
    ...p.facts.map((f) => `  · ${f}`),
  ];
}

function stats(data: CliData): string[] {
  if (data.benchmark.length === 0) {
    return ['stats quantization: results pending (src/data/benchmark.csv has no rows yet)'];
  }
  const pad = (s: string, n: number) => s.padEnd(n);
  return [
    `${pad('format', 10)}${pad('KL vs FP16', 12)}${pad('tok/s', 8)}${pad('VRAM GB', 9)}power W`,
    ...data.benchmark.map(
      (r) =>
        `${pad(r.format, 10)}${pad(String(r.klDivergence), 12)}${pad(String(r.tokensPerSecond), 8)}${pad(String(r.vramGb), 9)}${r.powerW}`,
    ),
    `source: ${[...new Set(data.benchmark.map((r) => r.source))].join('; ')}`,
  ];
}

export function runCommand(input: string, data: CliData): CliResult {
  const command = input.trim().replace(/\s+/g, ' ').toLowerCase();
  if (command === '') return { lines: [] };
  if (command === 'help' || command === '?') return { lines: HELP };
  if (command === 'clear' || command === 'cls') return { lines: [], clear: true };
  if (command === 'whoami') return { lines: [`${data.name}`, data.headline] };
  if (command === 'ls' || command === 'ls projects' || command === 'dir') {
    return {
      lines: data.projects.map((p) => `${p.cartridge.padEnd(18)}${p.title}`),
    };
  }
  if (command === 'stats quantization' || command === 'stats') return { lines: stats(data) };
  const run = command.match(/^(?:run|load|\.\/)\s*(.+)$/);
  if (run) {
    const project = findProject(run[1]!.trim(), data.projects);
    return project
      ? { lines: describe(project) }
      : { lines: [`run: no cartridge "${run[1]}" (try ls projects)`] };
  }
  return { lines: [`command not found: ${command.split(' ')[0]} (type help)`] };
}
