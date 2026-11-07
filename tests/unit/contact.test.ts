import { describe, expect, it, vi } from 'vitest';
import {
  LIMITS,
  buildEmail,
  encodeHeader,
  handleContact,
  validate,
  verifyTurnstile,
  type ContactDeps,
} from '../../worker/contact';

const env = {
  TURNSTILE_SECRET: 'secret',
  CONTACT_TO: 'owner@example.com',
  CONTACT_FROM: 'portal@cccy.im',
};
const good = { name: 'Ada Lovelace', email: 'ada@example.org', message: 'Hello from 1843.' };

/** Test doubles for the Worker's outside world; any of them can be swapped for one test. */
function deps(over: Partial<ContactDeps> = {}) {
  const d = {
    verify: vi.fn<ContactDeps['verify']>(async () => true),
    allow: vi.fn<ContactDeps['allow']>(async () => true),
    send: vi.fn<ContactDeps['send']>(async () => {}),
  };
  return Object.assign(d, over) as typeof d;
}

function post(fields: Record<string, string>, headers: Record<string, string> = {}) {
  const body = new FormData();
  for (const [k, v] of Object.entries({ 'cf-turnstile-response': 'token', ...fields }))
    body.append(k, v);
  return new Request('https://cccy.im/api/contact', {
    method: 'POST',
    body,
    headers: {
      origin: 'https://cccy.im',
      accept: 'application/json',
      'cf-connecting-ip': '203.0.113.7',
      ...headers,
    },
  });
}

describe('validating a message', () => {
  it('accepts a normal message and trims it', () => {
    const { fields, errors } = validate({
      name: '  Ada ',
      email: ' ada@example.org ',
      message: ' Hi \r\n there ',
    });
    expect(errors).toEqual({});
    expect(fields).toEqual({ name: 'Ada', email: 'ada@example.org', message: 'Hi \n there' });
  });

  it('explains every missing or malformed field in words', () => {
    const { errors } = validate({ name: '', email: 'not-an-email', message: '' });
    expect(errors.name).toMatch(/name/);
    expect(errors.email).toMatch(/email/);
    expect(errors.message).toMatch(/message/);
  });

  it('refuses header injection through the name or the email', () => {
    expect(validate({ ...good, name: 'Ada\r\nBcc: victim@example.com' }).errors.name).toBeDefined();
    expect(validate({ ...good, email: 'ada@example.org\nBcc: x@y.z' }).errors.email).toBeDefined();
  });

  it('caps the length of every field', () => {
    const long = (n: number) => 'x'.repeat(n + 1);
    expect(validate({ ...good, name: long(LIMITS.name) }).errors.name).toBeDefined();
    expect(validate({ ...good, message: long(LIMITS.message) }).errors.message).toBeDefined();
  });

  it('ignores anything that is not text', () => {
    expect(validate({ name: 42, email: null, message: {} }).errors).toHaveProperty('name');
  });
});

describe('the email that arrives', () => {
  it('replies to the visitor and keeps every header on one line', () => {
    const raw = buildEmail(good, 'portal@cccy.im', 'owner@example.com', new Date(0), 'id');
    expect(raw).toContain('Reply-To: "Ada Lovelace" <ada@example.org>');
    expect(raw).toContain('Subject: Portal message from Ada Lovelace');
    expect(raw).toContain('Message-ID: <id@cccy.im>');
    const headers = raw.split('\r\n\r\n')[0]!.split('\r\n');
    for (const h of headers) expect(h).toMatch(/^[A-Za-z-]+: /);
    expect(raw.endsWith('Hello from 1843.\r\n')).toBe(true);
  });

  it('encodes names that are not plain ASCII', () => {
    expect(encodeHeader('張其陽')).toMatch(/^=\?utf-8\?B\?[A-Za-z0-9+/=]+\?=$/);
    expect(encodeHeader('Plain "quoted" name')).toBe('Plain quoted name');
  });
});

describe('the contact endpoint', () => {
  it('sends a valid message once and stores nothing', async () => {
    const d = deps();
    const res = await handleContact(post(good), env, d);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(d.send).toHaveBeenCalledTimes(1);
    const [from, to, raw] = d.send.mock.calls[0]!;
    expect([from, to]).toEqual(['portal@cccy.im', 'owner@example.com']);
    expect(raw).toContain('Hello from 1843.');
    expect(d.verify).toHaveBeenCalledWith('token', '203.0.113.7');
  });

  it('is closed until its secrets are set', async () => {
    const res = await handleContact(post(good), { CONTACT_FROM: 'portal@cccy.im' }, deps());
    expect(res.status).toBe(503);
  });

  it('only accepts posts from the site itself', async () => {
    const d = deps();
    expect(
      (await handleContact(post(good, { origin: 'https://evil.example' }), env, d)).status,
    ).toBe(403);
    const noOrigin = post(good);
    const stripped = new Request(noOrigin, { headers: { accept: 'application/json' } });
    expect((await handleContact(stripped, env, d)).status).toBe(403);
    expect(d.send).not.toHaveBeenCalled();
  });

  it('turns away other methods and oversized bodies', async () => {
    expect(
      (await handleContact(new Request('https://cccy.im/api/contact'), env, deps())).status,
    ).toBe(405);
    const big = post(good, { 'content-length': String(LIMITS.body + 1) });
    expect((await handleContact(big, env, deps())).status).toBe(413);
  });

  it('rate-limits each visitor', async () => {
    const d = deps({ allow: vi.fn(async () => false) });
    const res = await handleContact(post(good), env, d);
    expect(res.status).toBe(429);
    expect(d.send).not.toHaveBeenCalled();
  });

  it('blocks a submit that Turnstile rejects, or that has no token', async () => {
    const d = deps({ verify: vi.fn(async () => false) });
    expect((await handleContact(post(good), env, d)).status).toBe(403);
    expect(
      (await handleContact(post({ ...good, 'cf-turnstile-response': '' }), env, deps())).status,
    ).toBe(403);
    expect(d.send).not.toHaveBeenCalled();
  });

  it('quietly drops what a bot puts in the honeypot', async () => {
    const d = deps();
    const res = await handleContact(post({ ...good, website: 'http://spam.example' }), env, d);
    expect(res.status).toBe(200);
    expect(d.send).not.toHaveBeenCalled();
  });

  it('returns field errors the form can show', async () => {
    const res = await handleContact(post({ ...good, email: 'nope' }), env, deps());
    expect(res.status).toBe(422);
    const body = (await res.json()) as { errors: Record<string, string> };
    expect(body.errors.email).toBeDefined();
  });

  it('answers a browser without JavaScript with a readable page', async () => {
    const res = await handleContact(post(good, { accept: 'text/html' }), env, deps());
    expect(res.headers.get('content-type')).toMatch(/text\/html/);
    expect(await res.text()).toContain('Message sealed');
  });

  it('says so when delivery fails', async () => {
    const d = deps({ send: vi.fn(async () => Promise.reject(new Error('down'))) });
    expect((await handleContact(post(good), env, d)).status).toBe(502);
  });
});

describe('asking Turnstile', () => {
  it('passes the secret, token and visitor address, and trusts only success: true', async () => {
    const fetcher = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = init?.body as FormData;
      expect(body.get('secret')).toBe('s');
      expect(body.get('response')).toBe('t');
      expect(body.get('remoteip')).toBe('1.2.3.4');
      return new Response(JSON.stringify({ success: true }));
    });
    expect(await verifyTurnstile('s', 't', '1.2.3.4', fetcher as typeof fetch)).toBe(true);
    const no = vi.fn(async () => new Response(JSON.stringify({ success: false })));
    expect(await verifyTurnstile('s', 't', null, no as typeof fetch)).toBe(false);
    const broken = vi.fn(async () => Promise.reject(new Error('offline')));
    expect(await verifyTurnstile('s', 't', null, broken as typeof fetch)).toBe(false);
  });
});
