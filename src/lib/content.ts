import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { publishText } from './placeholder';
import { RESUME_FILE } from './resume-file';

/**
 * One place to read the content records, so the static page, /resume, resume.json and the
 * descent always render the same data (the spec's parity rule).
 */
const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;

export async function getProfile(): Promise<CollectionEntry<'profile'>['data']> {
  const entry = await getEntry('profile', 'ccy');
  if (!entry) throw new Error('Missing profile record (src/content/profile.yaml)');
  return entry.data;
}

export async function getPhilosophy(): Promise<CollectionEntry<'philosophy'>['data']> {
  const entry = await getEntry('philosophy', 'main');
  if (!entry) throw new Error('Missing philosophy record (src/content/philosophy.yaml)');
  return entry.data;
}

export const getProjects = async () => (await getCollection('projects')).sort(byOrder);
export const getFeaturedProjects = async () => (await getProjects()).filter((p) => p.data.featured);
export const getLabProjects = async () => (await getProjects()).filter((p) => !p.data.featured);
export const getSkills = async () => (await getCollection('skills')).sort(byOrder);
export const getEducation = async () => getCollection('education');
export const getPublications = async () => getCollection('publications');

export async function getEras() {
  return (await getCollection('eras'))
    .map((era) => ({ id: era.id as '2099' | '1999' | '1888' | '1350', ...era.data }))
    .sort((a, b) => b.year - a.year);
}

export const STATUS_LABEL: Record<CollectionEntry<'projects'>['data']['status'], string> = {
  completed: 'Completed',
  'in-progress': 'In progress',
  'under-review': 'Under review',
  archived: 'Archived',
};

/** "Oct 2026 – present", or undefined while the start date is still a gap. */
export function formatPeriod(period: { start: string; end?: string }): string | undefined {
  const start = publishText(period.start);
  if (!start) return undefined;
  const end = period.end === undefined ? 'present' : publishText(period.end);
  return end ? `${start} – ${end}` : start;
}

/** "hello@cccy.im" → parts for the obfuscated email (built by JavaScript on the page). */
export function splitEmail(email: string | undefined) {
  if (!email?.includes('@')) return undefined;
  const [user, domain] = email.split('@') as [string, string];
  return { user, domain };
}

/** A profile URL as short readable text: "github.com/name", never "click here". */
export const shortUrl = (url: string): string =>
  url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

export const SITE_URL = 'https://cccy.im';
export const RESUME_PDF = `/${RESUME_FILE}`;
