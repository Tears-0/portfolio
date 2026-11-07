/**
 * The 1350 contact portal (the act's hero interaction), in both modes. It stays a normal form:
 * real labels, errors written next to their fields and announced, focus moved to the first
 * problem, and a plain confirmation line. Cloudflare Turnstile loads only once someone reaches
 * the form; the message posts to the Worker at /api/contact (worker/contact.ts).
 */

type Field = 'name' | 'email' | 'message';
const FIELDS: readonly Field[] = ['name', 'email', 'message'];

interface Turnstile {
  render(el: HTMLElement, options: Record<string, unknown>): string;
  reset(id?: string): void;
  getResponse(id?: string): string | undefined;
}
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const EMBERS = 22;

/** The browser's own checks, in the words the server would use. */
export function clientErrors(values: Record<Field, string>): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {};
  if (!values.name.trim()) errors.name = 'Please add your name.';
  if (!values.email.trim()) errors.email = 'Please add your email, so I can reply.';
  else if (!/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/.test(values.email.trim()))
    errors.email = 'That email address does not look right.';
  if (!values.message.trim()) errors.message = 'Please write a message.';
  return errors;
}

let turnstileLoading: Promise<Turnstile> | undefined;
function loadTurnstile(): Promise<Turnstile> {
  turnstileLoading ??= new Promise((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    const script = document.createElement('script');
    script.src = TURNSTILE_SRC;
    script.async = true;
    script.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error('no turnstile'));
    script.onerror = () => reject(new Error('turnstile blocked'));
    document.head.append(script);
  });
  return turnstileLoading;
}

export function mountPortal(root: HTMLElement): () => void {
  const form = root.querySelector<HTMLFormElement>('[data-portal-form]');
  const status = root.querySelector<HTMLElement>('[data-portal-status]');
  const slot = root.querySelector<HTMLElement>('[data-portal-turnstile]');
  const embers = root.querySelector<HTMLElement>('[data-portal-embers]');
  const submit = form?.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (!form || !status || !slot || !submit) return () => {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const control = (name: Field) =>
    form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement;

  let widget: string | undefined;
  let token = '';
  let tokenWaiters: ((t: string) => void)[] = [];

  const setState = (state: 'idle' | 'sending' | 'sealed' | 'error') => {
    root.dataset.state = state;
    submit.disabled = state === 'sending';
  };

  const ensureWidget = async () => {
    if (widget !== undefined) return;
    try {
      const turnstile = await loadTurnstile();
      if (widget !== undefined) return;
      widget = turnstile.render(slot, {
        sitekey: form.dataset.sitekey,
        appearance: 'interaction-only',
        theme: 'dark',
        action: 'contact',
        callback: (t: string) => {
          token = t;
          for (const resolve of tokenWaiters.splice(0)) resolve(t);
        },
        'expired-callback': () => (token = ''),
        'error-callback': () => (token = ''),
      });
    } catch {
      status.textContent =
        'The bot check could not load (an ad blocker can stop it). You can still email me instead.';
    }
  };

  /** Waits for Turnstile's token, up to a limit, so a quick submit still works. */
  const waitForToken = (ms: number) =>
    token
      ? Promise.resolve(token)
      : new Promise<string>((resolve) => {
          tokenWaiters.push(resolve);
          setTimeout(() => resolve(token), ms);
        });

  const showErrors = (errors: Partial<Record<Field | 'form', string>>) => {
    let first: HTMLElement | undefined;
    for (const name of FIELDS) {
      const input = control(name);
      const note = root.querySelector<HTMLElement>(`#portal-${name}-error`);
      const message = errors[name];
      if (note) {
        note.textContent = message ?? '';
        note.hidden = !message;
      }
      if (message) {
        input.setAttribute('aria-invalid', 'true');
        first ??= input;
      } else {
        input.removeAttribute('aria-invalid');
      }
    }
    const count = FIELDS.filter((f) => errors[f]).length;
    status.textContent =
      errors.form ??
      (count
        ? `Please check ${count === 1 ? 'the marked field' : `the ${count} marked fields`}.`
        : '');
    first?.focus();
  };

  const burst = () => {
    if (!embers || reduced) return;
    embers.replaceChildren(
      ...Array.from({ length: EMBERS }, (_, i) => {
        const ember = document.createElement('span');
        ember.className = 'a4-ember';
        const angle = (i / EMBERS) * Math.PI * 2 + Math.random() * 0.4;
        const distance = 90 + Math.random() * 110;
        ember.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
        ember.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
        ember.style.animationDelay = `${Math.random() * 120}ms`;
        return ember;
      }),
    );
    setTimeout(() => embers.replaceChildren(), 1400);
  };

  const sealed = () => {
    setState('sealed');
    burst();
    status.textContent = 'Sealed and sent. Thank you: I read every message and reply by email.';
    const again = document.createElement('button');
    again.type = 'button';
    again.className = 'a4-again';
    again.textContent = 'Write another';
    again.addEventListener('click', () => {
      again.remove();
      form.reset();
      status.textContent = '';
      setState('idle');
      control('name').focus();
    });
    status.after(again);
  };

  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (root.dataset.state === 'sending') return;
    const values = Object.fromEntries(FIELDS.map((f) => [f, control(f).value])) as Record<
      Field,
      string
    >;
    const errors = clientErrors(values);
    if (Object.keys(errors).length) return showErrors(errors);
    showErrors({});

    setState('sending');
    status.textContent = 'Sealing…';
    void ensureWidget();
    const t = await waitForToken(12_000);
    if (!t) {
      setState('error');
      status.textContent = 'The bot check has not finished. Please wait a moment and try again.';
      return;
    }
    const body = new FormData(form);
    body.set('cf-turnstile-response', t);
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body,
        headers: { accept: 'application/json' },
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        errors?: Record<string, string>;
      };
      if (res.ok && data.ok) return sealed();
      setState('error');
      showErrors(
        data.errors ?? { form: 'The message could not be sent. Please try again, or email me.' },
      );
    } catch {
      setState('error');
      showErrors({
        form: 'The message could not be sent (no connection). Please try again, or email me.',
      });
    } finally {
      // A token is good for one submit only.
      token = '';
      if (widget !== undefined) window.turnstile?.reset(widget);
    }
  };

  // Turnstile loads once the visitor shows interest: reaching the form or focusing a field. In
  // the descent every layer sits on screen at once, so the act's scene says when the circle is
  // reached ('portal:near'); stacked, the form scrolling into view says it.
  const warm = () => void ensureWidget();
  form.addEventListener('focusin', warm, { once: true });
  root.addEventListener('portal:near', warm, { once: true });
  const seen = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      warm();
      seen.disconnect();
    }
  });
  if (document.documentElement.dataset.mode !== 'descent') seen.observe(form);
  else if (root.dataset.near !== undefined) warm();
  form.addEventListener('submit', onSubmit);
  setState('idle');

  return () => {
    seen.disconnect();
    form.removeEventListener('submit', onSubmit);
    form.removeEventListener('focusin', warm);
    root.removeEventListener('portal:near', warm);
    tokenWaiters = [];
  };
}
