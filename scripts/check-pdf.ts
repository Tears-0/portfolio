/**
 * Checks the resume PDF the way an applicant tracking system will read it (the spec's CI
 * checks): exactly one page, every font embedded, the owner's name on the first line,
 * sections in the standard order, and under 300 KB. Needs poppler's pdfinfo, pdffonts and
 * pdftotext; CI installs them, and locally the text checks are skipped if they are missing.
 *
 *   npm run pdf:check [path/to/resume.pdf]
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { RESUME_FILE } from '../src/lib/resume-file.ts';

const file = process.argv[2] ?? `dist/${RESUME_FILE}`;
const MAX_KB = 300;
const ORDER = ['Summary', 'Education', 'Projects', 'Research', 'Experience', 'Skills', 'Awards'];
const REQUIRED = ['Summary', 'Education', 'Projects', 'Skills'];

const failures: string[] = [];
const fail = (message: string) => failures.push(message);

if (!existsSync(file)) {
  console.error(`${file} not found: run \`npm run build && npm run pdf\` first.`);
  process.exit(1);
}

function tool(name: string, args: string[]): string | undefined {
  try {
    return execFileSync(name, args, { encoding: 'utf8' });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }
}

const kb = statSync(file).size / 1024;
if (kb >= MAX_KB) fail(`file is ${kb.toFixed(0)} KB; the limit is ${MAX_KB} KB`);

const info = tool('pdfinfo', [file]);
const fonts = tool('pdffonts', [file]);
const text = tool('pdftotext', [file, '-']);

if (info === undefined || fonts === undefined || text === undefined) {
  const message = 'poppler (pdfinfo, pdffonts, pdftotext) is not installed';
  if (process.env.CI) fail(message);
  else console.warn(`Skipping page, font and text checks: ${message}.`);
} else {
  const pages = Number(info.match(/^Pages:\s+(\d+)/m)?.[1]);
  if (pages !== 1) fail(`expected exactly 1 page, found ${pages}`);

  // Rows after the two header lines; "emb" is the fifth column from the end.
  const rows = fonts.trim().split('\n').slice(2).filter(Boolean);
  if (rows.length === 0) fail('no fonts found');
  for (const row of rows) {
    const cols = row.trim().split(/\s+/);
    if (cols[cols.length - 5] !== 'yes') fail(`font not embedded: ${cols[0]}`);
    // Type 3 fonts (what Chrome makes of variable fonts) trip up some ATS parsers.
    if (row.includes('Type 3')) fail(`Type 3 font: ${cols[0]} (use static font weights)`);
  }

  const name = readFileSync('src/content/profile.yaml', 'utf8')
    .match(/^\s+name:\s*(.+)$/m)?.[1]
    ?.trim();
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (name && lines[0] !== name) fail(`first line is "${lines[0]}", expected the name "${name}"`);

  const at = (heading: string) => lines.findIndex((l) => l.toLowerCase() === heading.toLowerCase());
  for (const heading of REQUIRED) if (at(heading) < 0) fail(`missing the ${heading} section`);
  // A heading must stand on its own line, or a parser reads it as part of the entry after it.
  for (const heading of ORDER) {
    const merged = lines.find((l) => l.toLowerCase().startsWith(`${heading.toLowerCase()} `));
    if (merged && at(heading) < 0) fail(`the ${heading} heading shares a line: "${merged}"`);
  }
  const found = ORDER.filter((h) => at(h) >= 0);
  const positions = found.map(at);
  if (positions.some((p, i) => i > 0 && p < positions[i - 1]!)) {
    fail(`sections out of order: ${found.join(' → ')}`);
  }
}

if (failures.length > 0) {
  console.error(`${file} failed its checks:\n${failures.map((f) => `  ✗ ${f}`).join('\n')}`);
  process.exit(1);
}
console.log(`${file}: OK (${kb.toFixed(0)} KB)`);
