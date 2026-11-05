import { describe, expect, it } from 'vitest';
import {
  hasPlaceholder,
  isPlaceholder,
  publishMetric,
  publishText,
  wordCount,
} from '../../src/lib/placeholder';

describe('draft placeholders', () => {
  it('recognises a value that is still a gap', () => {
    expect(isPlaceholder('[add 60–100 words]')).toBe(true);
    expect(isPlaceholder('[confirm] Solo')).toBe(true);
    expect(isPlaceholder('Solo')).toBe(false);
  });

  it('finds gaps inside longer text', () => {
    expect(hasPlaceholder('Open to graduate roles from [month]')).toBe(false);
    expect(hasPlaceholder('Graduate roles from [add month and year]')).toBe(true);
    expect(hasPlaceholder(undefined)).toBe(false);
  });

  it('counts words for the content limits', () => {
    expect(wordCount('I build systems at the edge of thought. Welcome to the quiet future.')).toBe(
      13,
    );
    expect(wordCount('  ')).toBe(0);
  });
});

describe('what production pages show', () => {
  it('shows drafts as written while drafting', () => {
    expect(publishText('[add start]', true)).toBe('[add start]');
  });

  it('leaves out anything still missing', () => {
    expect(publishText('[add start]', false)).toBeUndefined();
    expect(publishText('Graduate roles from [add month and year]', false)).toBeUndefined();
  });

  it('drops confirm markers from wording that is already there', () => {
    expect(publishText('[confirm] Solo', false)).toBe('Solo');
    expect(publishText('[confirm final title] Multimodal deep learning', false)).toBe(
      'Multimodal deep learning',
    );
    expect(publishText('Solo', false)).toBe('Solo');
  });

  it('only publishes numbers whose value and source are both confirmed', () => {
    const metric = { value: '0.0012', label: 'NRMSE', source: 'results.csv @ a1b2c3d' };
    expect(publishMetric(metric, false)).toBe(metric);
    expect(publishMetric({ ...metric, source: '[confirm] re-run' }, false)).toBeUndefined();
    expect(publishMetric({ ...metric, value: '[add]' }, false)).toBeUndefined();
    expect(publishMetric({ ...metric, value: '[add]' }, true)?.value).toBe('[add]');
  });
});
