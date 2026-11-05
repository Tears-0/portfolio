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

/** Featured project slugs, in the same way: each one has a case-study page. */
const featuredSlugs = readdirSync('src/content/projects')
  .filter((f) =>
    /^featured:\s*true\s*$/m.test(readFileSync(join('src/content/projects', f), 'utf8')),
  )
  .map((f) => f.replace(/\.mdx?$/, ''));

/** Every page and data file, case studies included (dist/projects/…). */
const publicFiles = readdirSync(DIST, { recursive: true, encoding: 'utf8' })
  .map((f) => f.replaceAll('\\', '/'))
  .filter((f) => /\.(html|json)$/.test(f));

/** A case study whose body still has a gap is not ready: nothing links to it, search skips it. */
const isReady = (slug: string) => {
  const md = readFileSync(join('src/content/projects', `${slug}.md`), 'utf8');
  const body = md.replace(/^---[\s\S]*?---/, '').trim();
  return body !== '' && !/\[add\b/i.test(body);
};

describe('the built site', () => {
  it('has every page the spec lists so far', () => {
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

  it('has a case-study page for every featured project, linked only once it is written', () => {
    expect(featuredSlugs.length).toBeGreaterThanOrEqual(3);
    const linking = ['index.html', 'descent.html'].map((page) => read(page));
    for (const slug of featuredSlugs) {
      const page = `projects/${slug}.html`;
      expect(existsSync(join(DIST, page)), page).toBe(true);
      const html = read(page);
      const noindex = html.includes('<meta name="robots" content="noindex"');
      const linked = linking.some((h) => h.includes(`href="/projects/${slug}"`));
      expect(noindex, `${page} noindex`).toBe(!isReady(slug));
      expect(linked, `${page} linked`).toBe(isReady(slug));
    }
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
