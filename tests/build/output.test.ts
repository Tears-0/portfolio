import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const DIST = 'dist';
const read = (file: string) => readFileSync(join(DIST, file), 'utf8');
const decode = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&#x27;', "'")
    .replaceAll('&amp;', '&');

/** Featured project titles, read straight from the content files. */
const featuredTitles = readdirSync('src/content/projects')
  .map((f) => readFileSync(join('src/content/projects', f), 'utf8'))
  .filter((md) => /^featured:\s*true\s*$/m.test(md))
  .map((md) =>
    md
      .match(/^title:\s*(.+)$/m)![1]!
      .replace(/^'(.*)'$/, '$1')
      .trim(),
  );

const publicFiles = readdirSync(DIST).filter((f) => /\.(html|json)$/.test(f));

describe('the built site', () => {
  it('has every page the spec lists for M2', () => {
    for (const page of ['index.html', 'resume.html', 'resume.json', '404.html', 'descent.html']) {
      expect(existsSync(join(DIST, page)), page).toBe(true);
    }
  });

  it('shows every featured project on the static page, the descent and the resume', () => {
    expect(featuredTitles.length).toBeGreaterThanOrEqual(3);
    for (const page of ['index.html', 'descent.html', 'resume.html']) {
      const text = decode(read(page));
      for (const title of featuredTitles) expect(text, `${title} on ${page}`).toContain(title);
    }
  });

  it('never publishes a draft gap or a confirm marker', () => {
    for (const file of publicFiles) {
      expect(read(file), file).not.toMatch(/\[(add|confirm)\b/i);
    }
  });

  it('keeps the phone number out of every public file', () => {
    let phone: string | undefined;
    try {
      phone = readFileSync('.env', 'utf8')
        .match(/^RESUME_PHONE=(.+)$/m)?.[1]
        ?.trim();
    } catch {
      phone = undefined;
    }
    for (const file of publicFiles) {
      const content = read(file);
      expect(content, file).not.toMatch(/href="tel:/);
      if (phone) expect(content.includes(phone), `phone in ${file}`).toBe(false);
    }
  });

  it('serialises the resume in the JSON Resume schema', () => {
    const json = JSON.parse(read('resume.json'));
    expect(json.basics.name).toBe('Chong Chi Yang');
    expect(json.projects.length).toBeGreaterThan(0);
    expect(json.skills.length).toBeGreaterThan(0);
  });

  it('keeps the descent out of search results until launch', () => {
    expect(read('descent.html')).toContain('<meta name="robots" content="noindex"');
  });

  it('keeps the static page light: no animation runtime', () => {
    const scripts = [...read('index.html').matchAll(/<script[^>]*src="([^"]+)"/g)].map(
      (m) => m[1]!,
    );
    for (const src of scripts) {
      expect(readFileSync(join(DIST, src), 'utf8')).not.toMatch(/ScrollTrigger/);
    }
  });
});
