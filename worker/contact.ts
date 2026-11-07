/**
 * The 1350 contact portal's server side: POST /api/contact. It checks where the request came
 * from, its size, a honeypot field, a per-visitor rate limit and Cloudflare Turnstile, validates
 * every field, then forwards the message to the owner's inbox. Nothing is stored.
 *
 * Pure apart from the injected `deps`, so every rule is unit-tested without Cloudflare.
 */

export interface ContactEnv {
  /** Turnstile secret key (`wrangler secret put TURNSTILE_SECRET`). The form is off without it. */
  TURNSTILE_SECRET?: string;
  /** Where messages go: an address verified in Email Routing (`wrangler secret put CONTACT_TO`). */
  CONTACT_TO?: string;
  /** The sender, an address on the site's own domain (a plain var in wrangler.jsonc). */
  CONTACT_FROM?: string;
}

export interface ContactDeps {
  /** True when Turnstile accepts the token. */
  verify(token: string, ip: string | null): Promise<boolean>;
  /** True while this visitor is under the rate limit. */
  allow(key: string): Promise<boolean>;
  /** Sends one raw RFC 5322 message. */
  send(from: string, to: string, raw: string): Promise<void>;
}

export const LIMITS = { name: 100, email: 254, message: 5000, body: 32_000 } as const;

type Field = 'name' | 'email' | 'message';
export type Fields = Record<Field, string>;
export type Errors = Partial<Record<Field | 'form', string>>;

// A deliberately simple check: something@something.tld, no spaces or angle brackets.
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;
// Control characters other than tab and newline (which only the message may contain). Matching
// them is the point, so the lint rule against control characters in patterns is off here.
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

/** Trims and checks the three fields; every problem is reported in words the form can show. */
export function validate(input: Partial<Record<string, unknown>>): {
  fields: Fields;
  errors: Errors;
} {
  const text = (key: string) => (typeof input[key] === 'string' ? (input[key] as string) : '');
  const fields: Fields = {
    name: text('name').trim(),
    email: text('email').trim(),
    message: text('message').replace(/\r\n?/g, '\n').trim(),
  };
  const errors: Errors = {};
  if (!fields.name) errors.name = 'Please add your name.';
  else if (fields.name.length > LIMITS.name)
    errors.name = `Please keep your name under ${LIMITS.name} characters.`;
  else if (/[\r\n]/.test(fields.name) || CONTROL.test(fields.name))
    errors.name = 'Please use plain text for your name.';

  if (!fields.email) errors.email = 'Please add your email, so I can reply.';
  else if (
    fields.email.length > LIMITS.email ||
    !EMAIL.test(fields.email) ||
    CONTROL.test(fields.email)
  )
    errors.email = 'That email address does not look right.';

  if (!fields.message) errors.message = 'Please write a message.';
  else if (fields.message.length > LIMITS.message)
    errors.message = `Please keep the message under ${LIMITS.message} characters.`;
  else if (CONTROL.test(fields.message)) errors.message = 'Please use plain text in the message.';
  return { fields, errors };
}

/** RFC 2047: a header word that may hold any text, safely. */
export function encodeHeader(value: string): string {
  const clean = value.replace(/[\r\n]+/g, ' ');
  if (/^[\x20-\x7E]*$/.test(clean)) return clean.replace(/["\\]/g, '');
  const bytes = new TextEncoder().encode(clean);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return `=?utf-8?B?${btoa(binary)}?=`;
}

/** The message as it reaches the inbox: plain text, with Reply-To set to the visitor. */
export function buildEmail(
  fields: Fields,
  from: string,
  to: string,
  now = new Date(),
  id: string = crypto.randomUUID(),
): string {
  const domain = from.split('@')[1] ?? 'localhost';
  return [
    `From: ${encodeHeader('Four Eras portal')} <${from}>`,
    `To: <${to}>`,
    `Reply-To: "${encodeHeader(fields.name)}" <${fields.email}>`,
    `Subject: ${encodeHeader(`Portal message from ${fields.name}`)}`,
    `Date: ${now.toUTCString()}`,
    `Message-ID: <${id}@${domain}>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    `From ${fields.name} <${fields.email}>, through the contact portal:`,
    '',
    fields.message,
    '',
  ].join('\r\n');
}

/** Asks Turnstile whether a token is genuine (https://developers.cloudflare.com/turnstile/). */
export async function verifyTurnstile(
  secret: string,
  token: string,
  ip: string | null,
  fetcher: typeof fetch = fetch,
): Promise<boolean> {
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  try {
    const res = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

const json = (status: number, data: Record<string, unknown>) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

/** Without JavaScript the form cannot pass Turnstile; say so plainly and offer the email. */
const page = (status: number, title: string, text: string) =>
  new Response(
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title><body style="font:1.1rem/1.6 Georgia,serif;max-width:36rem;margin:4rem auto;padding:0 1rem;color:#2b1d14;background:#f4ead5"><h1>${title}</h1><p>${text}</p><p><a href="/#contact">Back to the site</a></p></body></html>`,
    {
      status,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'",
        'x-content-type-options': 'nosniff',
      },
    },
  );

export async function handleContact(
  request: Request,
  env: ContactEnv,
  deps: ContactDeps,
): Promise<Response> {
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  const fail = (status: number, errors: Errors) =>
    wantsJson
      ? json(status, { ok: false, errors })
      : page(
          status,
          'The message was not sent',
          `${Object.values(errors).join(' ')} You can also write to the address on the site.`,
        );

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: { allow: 'POST' } });
  }
  if (!env.TURNSTILE_SECRET || !env.CONTACT_TO || !env.CONTACT_FROM) {
    return fail(503, { form: 'The portal is closed for now. Please use email instead.' });
  }
  // Only this site's own pages may post here.
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) {
    return fail(403, { form: 'This form only accepts messages from the site itself.' });
  }
  const length = Number(request.headers.get('content-length') ?? 0);
  if (length > LIMITS.body) return fail(413, { form: 'That message is too long to send.' });

  const ip = request.headers.get('cf-connecting-ip');
  if (!(await deps.allow(ip ?? 'unknown'))) {
    return fail(429, {
      form: 'Too many messages in a short time. Please wait a minute and try again.',
    });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, { form: 'The message could not be read. Please try again.' });
  }
  const input = Object.fromEntries(
    [...form.entries()].map(([k, v]) => [k, typeof v === 'string' ? v : '']),
  );

  // Bots fill every field; people never see this one.
  if (input.website)
    return wantsJson ? json(200, { ok: true }) : page(200, 'Message sealed', 'Thank you.');

  const { fields, errors } = validate(input);
  if (Object.keys(errors).length > 0) return fail(422, errors);

  const token = input['cf-turnstile-response'] ?? '';
  if (!token || !(await deps.verify(token, ip))) {
    return fail(403, { form: 'The check that you are not a bot did not pass. Please try again.' });
  }

  try {
    await deps.send(
      env.CONTACT_FROM,
      env.CONTACT_TO,
      buildEmail(fields, env.CONTACT_FROM, env.CONTACT_TO),
    );
  } catch {
    return fail(502, {
      form: 'The message could not be delivered just now. Please try again later.',
    });
  }
  return wantsJson
    ? json(200, { ok: true })
    : page(200, 'Message sealed', 'Thank you. I read every message and will reply by email.');
}
