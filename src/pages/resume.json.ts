import type { APIRoute } from 'astro';
import { buildResume, toJsonResume } from '../lib/resume';

// Always public: the phone number never goes into resume.json.
export const GET: APIRoute = async () =>
  new Response(JSON.stringify(toJsonResume(await buildResume()), null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
