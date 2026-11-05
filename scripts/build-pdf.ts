/**
 * Prints /resume to an A4 PDF with Playwright's Chromium.
 *
 *   npm run build && npm run pdf   → dist/Chong-Chi-Yang-Resume.pdf (deployed with the site)
 *   npm run pdf:private            → private/Chong-Chi-Yang-Resume-private.pdf, with the
 *                                    RESUME_PHONE from .env; Git-ignored and never deployed
 */
import { spawnSync } from 'node:child_process';
import { createReadStream, existsSync, mkdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { extname, join, resolve, sep } from 'node:path';
import { chromium } from 'playwright';
import { PRIVATE_RESUME_FILE, RESUME_FILE } from '../src/lib/resume-file.ts';

const isPrivate = process.env.PRIVATE === '1' || process.argv.includes('--private');
const root = resolve(isPrivate ? 'private/dist' : 'dist');
const outFile = isPrivate ? resolve('private', PRIVATE_RESUME_FILE) : join(root, RESUME_FILE);

if (isPrivate) {
  try {
    process.loadEnvFile('.env');
  } catch {
    // No .env: the build below stops with a clear message.
  }
  if (!process.env.RESUME_PHONE) {
    console.error('Set RESUME_PHONE in .env (Git-ignored) to build the private resume.');
    process.exit(1);
  }
  mkdirSync('private', { recursive: true });
  const build = spawnSync('npx', ['astro', 'build', '--outDir', root], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PRIVATE: '1' },
  });
  if (build.status !== 0) process.exit(build.status ?? 1);
} else if (!existsSync(join(root, 'resume.html'))) {
  console.error('dist/resume.html is missing: run `npm run build` first.');
  process.exit(1);
}

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

/** Just enough of a static server to print from: /resume → resume.html. */
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
  let file = join(root, path);
  if (!file.startsWith(root + sep) && file !== root) return void res.writeHead(403).end();
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  else if (!extname(file)) file += '.html';
  if (!existsSync(file)) return void res.writeHead(404).end();
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
const { port } = server.address() as AddressInfo;

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/resume`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: 'print' });
  await page.pdf({
    path: outFile,
    format: 'A4',
    preferCSSPageSize: true,
    printBackground: false,
    tagged: true,
  });
  console.log(`Wrote ${outFile} (${Math.round(statSync(outFile).size / 1024)} KB)`);
} finally {
  await browser.close();
  server.close();
}
