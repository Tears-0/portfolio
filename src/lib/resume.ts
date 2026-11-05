import {
  SITE_URL,
  formatPeriod,
  getEducation,
  getProfile,
  getProjects,
  getPublications,
  getSkills,
  shortUrl,
} from './content';
import { isoMonth } from './dates';
import { publishText } from './placeholder';

/**
 * The resume, built from the same records as the site. /resume renders it, CI prints that
 * page to resume.pdf, and resume.json serialises it in the JSON Resume schema.
 */
export interface Resume {
  name: string;
  label: string;
  location: string;
  place: { region: string; countryCode: string };
  email?: string;
  phone?: string;
  url: string;
  profiles: { network: string; url: string; text: string }[];
  summary: string;
  education: {
    institution: string;
    location: string;
    degree?: string;
    start?: string;
    end?: string;
    project?: string;
    grade?: string;
    units: string[];
  }[];
  projects: {
    title: string;
    period?: string;
    start?: string;
    end?: string;
    role?: string;
    link?: { href: string; text: string };
    bullets: string[];
    tags: string[];
  }[];
  research: { title: string; status: string; url?: string }[];
  experience: { title: string }[];
  awards: { title: string }[];
  skills: { name: string; keywords: string[] }[];
}

/**
 * The phone number goes only into the private PDF: `PRIVATE=1 npm run pdf` with
 * RESUME_PHONE in a Git-ignored .env. Every public build leaves it out.
 */
export function privatePhone(): string | undefined {
  return process.env.PRIVATE === '1' ? process.env.RESUME_PHONE?.trim() || undefined : undefined;
}

export async function buildResume({ phone }: { phone?: string } = {}): Promise<Resume> {
  const [profile, education, projects, publications, skills] = await Promise.all([
    getProfile(),
    getEducation(),
    getProjects(),
    getPublications(),
    getSkills(),
  ]);
  const availability = publishText(profile.availability);
  const profiles = [
    profile.links.github && { network: 'GitHub', url: profile.links.github },
    profile.links.linkedin && { network: 'LinkedIn', url: profile.links.linkedin },
  ]
    .filter((p): p is { network: string; url: string } => Boolean(p))
    .map((p) => ({ ...p, text: shortUrl(p.url) }));

  return {
    name: profile.name,
    label: profile.headline,
    location: profile.location.replace(/\s*\(.*\)$/, ''),
    place: profile.place,
    email: profile.links.email,
    phone,
    url: SITE_URL,
    profiles,
    summary: [profile.pitch, availability && `${availability}.`].filter(Boolean).join(' '),
    education: education.map(({ data }) => ({
      institution: data.institution,
      location: data.location,
      degree: publishText(data.degree),
      start: publishText(data.start),
      end: publishText(data.end),
      project: data.project && publishText(data.project),
      grade: data.grade && publishText(data.grade),
      units: data.units.flatMap((u) => publishText(u) ?? []),
    })),
    projects: projects
      .filter((p) => p.data.resume.include)
      .map(({ data }) => {
        const href = data.links.repo ?? data.links.paper ?? data.links.demo;
        return {
          title: data.title,
          period: formatPeriod(data.period),
          start: publishText(data.period.start),
          end: data.period.end === undefined ? undefined : publishText(data.period.end),
          role: publishText(data.role),
          link: href ? { href, text: shortUrl(href) } : undefined,
          bullets: data.resume.bullets.length > 0 ? data.resume.bullets : [data.summary],
          tags: data.tags,
        };
      }),
    research: publications.flatMap(({ data }) => {
      const title = publishText(data.title);
      return title ? [{ title, status: data.status, url: data.url }] : [];
    }),
    experience: [],
    awards: [],
    skills: skills.map(({ data }) => ({
      name: data.name,
      keywords: data.tools.map((t) => t.name),
    })),
  };
}

/** The same resume in the JSON Resume schema (https://jsonresume.org/schema). */
export function toJsonResume(resume: Resume) {
  return {
    $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
    basics: {
      name: resume.name,
      label: resume.label,
      ...(resume.email && { email: resume.email }),
      url: resume.url,
      summary: resume.summary,
      location: { region: resume.place.region, countryCode: resume.place.countryCode },
      profiles: resume.profiles.map((p) => ({
        network: p.network,
        url: p.url,
        username: p.url.split('/').filter(Boolean).pop(),
      })),
    },
    education: resume.education.map((e) => ({
      institution: e.institution,
      area: 'Computer Science',
      ...(e.degree && { studyType: e.degree }),
      ...(isoMonth(e.start) && { startDate: isoMonth(e.start) }),
      ...(isoMonth(e.end) && { endDate: isoMonth(e.end) }),
      ...(e.grade && { score: e.grade }),
      courses: e.units,
    })),
    projects: resume.projects.map((p) => ({
      name: p.title,
      highlights: p.bullets,
      keywords: p.tags,
      ...(p.role && { roles: [p.role] }),
      ...(isoMonth(p.start) && { startDate: isoMonth(p.start) }),
      ...(isoMonth(p.end) && { endDate: isoMonth(p.end) }),
      ...(p.link && { url: p.link.href }),
    })),
    publications: resume.research.map((r) => ({
      name: r.title,
      summary: r.status,
      ...(r.url && { url: r.url }),
    })),
    work: [],
    awards: [],
    skills: resume.skills,
  };
}
