/**
 * The site's Worker. Static files are served straight from dist/ by Workers static assets; only
 * /api/* reaches this code (wrangler.jsonc: run_worker_first).
 */
import { EmailMessage } from 'cloudflare:email';
import { handleContact, verifyTurnstile, type ContactEnv } from './contact';

interface Env extends ContactEnv {
  ASSETS: { fetch(request: Request): Promise<Response> };
  SEND_EMAIL: { send(message: EmailMessage): Promise<void> };
  CONTACT_LIMIT?: { limit(options: { key: string }): Promise<{ success: boolean }> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/contact') {
      return handleContact(request, env, {
        verify: (token, ip) => verifyTurnstile(env.TURNSTILE_SECRET ?? '', token, ip),
        allow: async (key) =>
          env.CONTACT_LIMIT ? (await env.CONTACT_LIMIT.limit({ key })).success : true,
        send: (from, to, raw) => env.SEND_EMAIL.send(new EmailMessage(from, to, raw)),
      });
    }
    if (pathname.startsWith('/api/')) return new Response('Not found', { status: 404 });
    return env.ASSETS.fetch(request);
  },
};
