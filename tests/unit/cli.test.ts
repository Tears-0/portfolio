import { describe, expect, it } from 'vitest';
import { SUGGESTED, runCommand, type CliData } from '../../src/scenes/act-1999/cli';

const data: CliData = {
  name: 'ccy',
  headline: 'Final-year Computer Science student',
  projects: [
    {
      cartridge: 'cartridge_01.exe',
      label: 'FYP · PROTEOMICS',
      slug: 'small-sample-multimodal',
      title: 'Small-sample multimodal deep learning',
      summary: 'A PyTorch model…',
      stack: ['PyTorch', 'ESM-2'],
      status: 'In progress',
      facts: ['samples: N = 9'],
    },
    {
      cartridge: 'cartridge_02.exe',
      label: 'QUANT BENCH',
      slug: 'quantization-benchmark',
      title: 'LLM quantization and inference benchmark',
      summary: 'What GGUF…',
      stack: ['GGUF', 'AWQ'],
      status: 'In progress',
      highlight: { value: 'Q5_K_M', label: 'best quality per GB', source: 'results.csv @ abc123' },
      facts: [],
    },
  ],
  benchmark: [],
};

describe('the 1999 console', () => {
  it('lists the cartridges from the data', () => {
    const { lines } = runCommand('ls projects', data);
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain('cartridge_02.exe');
    expect(lines[1]).toContain('LLM quantization and inference benchmark');
  });

  it('runs a cartridge by file name, number or slug', () => {
    for (const command of [
      'run cartridge_02.exe',
      'RUN cartridge_2',
      'run 2',
      'run quantization-benchmark',
    ]) {
      const out = runCommand(command, data).lines.join('\n');
      expect(out, command).toContain('LLM quantization and inference benchmark');
      expect(out, command).toContain('GGUF · AWQ');
      expect(out, command).toContain('source: results.csv @ abc123');
    }
  });

  it('prints the facts with each project and says when a cartridge does not exist', () => {
    expect(runCommand('run 1', data).lines.join('\n')).toContain('samples: N = 9');
    expect(runCommand('run cartridge_09.exe', data).lines[0]).toContain('no cartridge');
  });

  it('says the benchmark results are pending until the CSV has rows', () => {
    expect(runCommand('stats quantization', data).lines[0]).toContain('results pending');
    const withRows = {
      ...data,
      benchmark: [
        {
          format: 'Q4_K_M',
          klDivergence: 0.02,
          tokensPerSecond: 90,
          vramGb: 5,
          powerW: 210,
          source: 'run 3',
        },
      ],
    };
    const out = runCommand('stats quantization', withRows).lines;
    expect(out.join('\n')).toContain('Q4_K_M');
    expect(out.at(-1)).toBe('source: run 3');
  });

  it('answers help, whoami, clear and unknown commands', () => {
    expect(runCommand('help', data).lines.join('\n')).toContain('stats quantization');
    expect(runCommand('whoami', data).lines[0]).toBe('ccy');
    expect(runCommand('clear', data)).toEqual({ lines: [], clear: true });
    expect(runCommand('rm -rf /', data).lines[0]).toBe('command not found: rm (type help)');
    expect(runCommand('   ', data).lines).toEqual([]);
  });

  it('only suggests commands that do something', () => {
    for (const command of SUGGESTED) {
      expect(runCommand(command, data).lines.join(' '), command).not.toContain('command not found');
    }
  });
});
