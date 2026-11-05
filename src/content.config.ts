import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { isPlaceholder, wordCount } from './lib/placeholder';

// Text limits from the spec ("Content per act"). A drafted "[add …]" or "[confirm …]"
// value passes so the build stays green while the gap is still open.
const maxWords = (max: number) =>
  z.string().refine((s) => isPlaceholder(s) || wordCount(s) <= max, `At most ${max} words`);
const wordRange = (min: number, max: number) =>
  z.string().refine((s) => {
    const n = wordCount(s);
    return isPlaceholder(s) || (n >= min && n <= max);
  }, `Between ${min} and ${max} words`);

const metric = z.object({
  value: z.string(), // '0.0012'
  label: z.string(), // 'teacher-forced NRMSE, ESN'
  source: z.string().min(1), // every number names its source
});

const quote = z.object({ text: z.string(), by: z.string(), source: z.string().min(1) });

const eras = defineCollection({
  loader: file('src/content/eras.yaml'),
  schema: z.object({
    year: z.number().int(),
    act: z.enum(['I', 'II', 'III', 'IV']),
    title: z.string(),
    dream: z.string(),
    anchor: z.string(),
    /** Prologue charge colour: particles, light and palms while this era is the target. */
    charge: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    sign: z.enum(['circuit', 'gear', 'astrolabe']).optional(),
    quote: quote.optional(),
  }),
});

const profile = defineCollection({
  loader: file('src/content/profile.yaml'),
  schema: z.object({
    name: z.string(),
    displayName: z.string(),
    greeting: maxWords(14),
    headline: z.string(),
    pitch: z.string(),
    location: z.string(),
    availability: z.string(),
    targetRoles: z.array(z.string()),
    cards: z
      .array(z.object({ label: z.string(), value: maxWords(8) }))
      .min(3)
      .max(4),
    links: z.object({
      email: z.string().optional(),
      github: z.url().optional(),
      linkedin: z.url().optional(),
    }),
  }),
});

const skills = defineCollection({
  loader: file('src/content/skills.yaml'),
  schema: z.object({
    name: z.string(),
    order: z.number(),
    tools: z
      .array(
        // Strict: a stray key usually means a YAML slip (an unquoted comma splits a name).
        z.strictObject({
          name: z.string(),
          tier: z.enum(['Daily', 'Comfortable', 'Familiar']),
          evidence: z.array(reference('projects')).default([]),
        }),
      )
      .max(8),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(60),
      cartridge: z.string().max(18),
      summary: z.string().max(140),
      role: z.string(),
      period: z.object({ start: z.string(), end: z.string().optional() }),
      status: z.enum(['completed', 'in-progress', 'under-review', 'archived']),
      featured: z.boolean().default(false),
      order: z.number(),
      tags: z.array(z.string()).max(6),
      skills: z.array(reference('skills')),
      highlight: metric.optional(),
      links: z
        .object({ repo: z.url().optional(), paper: z.url().optional(), demo: z.url().optional() })
        .default({}),
      cli: z.array(z.string()).max(10).default([]),
      cover: image().optional(),
      resume: z.object({ include: z.boolean(), bullets: z.array(z.string().max(160)).max(3) }),
    }),
});

const philosophy = defineCollection({
  loader: file('src/content/philosophy.yaml'),
  schema: z.object({
    closingLine: z.string(),
    body: wordRange(60, 100),
    origin: maxWords(60),
  }),
});

export const collections = { eras, profile, skills, projects, philosophy };
