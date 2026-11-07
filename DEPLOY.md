# Deploying to cccy.im

The site is static files on **Cloudflare Workers static assets**. GitHub Actions builds and
checks every push; once the steps below are done, pushes to `main` deploy to production and
each pull request gets its own preview link. These steps need your Cloudflare and GitHub
accounts, so they are yours to do; each takes a few minutes.

## 1. A Cloudflare API token

1. Cloudflare dashboard → **My Profile → API Tokens → Create Token**.
2. Use the **Edit Cloudflare Workers** template, limited to your account and the `cccy.im` zone.
3. Copy the token, and your **Account ID** (dashboard home, right-hand column).

## 2. GitHub secrets

In the repository: **Settings → Secrets and variables → Actions**.

- Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
- Variables: `DEPLOY_ENABLED` = `true` (the deploy job stays off until this is set), and
  `TURNSTILE_SITE_KEY` from step 5 (public: it goes into the page). Without it the build uses
  Cloudflare's test key, which passes everyone.

## 3. The domain

1. In **DNS → Records**, check what is on the apex `cccy.im` today.
2. Leave the Minecraft records exactly as they are (DNS-only, plus the SRV record).
3. If the apex is free, uncomment the `routes` line in `wrangler.jsonc`. If it is taken, use a
   subdomain instead, e.g. `{ "pattern": "me.cccy.im", "custom_domain": true }`.
4. `www` → apex: **Rules → Redirect Rules → Templates → Redirect from WWW to root**, plus a
   proxied `AAAA` record for `www` pointing at `100::` so the rule has traffic to act on.

## 4. Security, email and analytics

- **HSTS**: SSL/TLS → Edge Certificates → HTTP Strict Transport Security. Start with a
  six-month max-age and no preload until you are sure.
- **Email Routing**: Email → Email Routing → route `hello@cccy.im` to your personal inbox and
  verify it. If it attracts spam, change the address without touching your real inbox. (The
  site already shows `hello@cccy.im`; change `links.email` in `src/content/profile.yaml` if you
  pick another.)
- **Web Analytics**: Analytics & Logs → Web Analytics → add `cccy.im` and turn on automatic
  setup. It is cookie-free, so no consent banner.

## 5. The contact portal

The 1350 portal posts to a small Worker (`worker/`) at `/api/contact`. It checks Turnstile,
validates every field, allows five messages a minute per visitor, forwards each message to your
inbox and stores nothing. Until the two secrets below exist it answers "closed for now".

1. **Turnstile**: dashboard → **Turnstile → Add widget**. Hostnames: `cccy.im` (and
   `localhost` if you want to test against it). Mode: **Managed**. Copy the **site key** into the
   GitHub variable `TURNSTILE_SITE_KEY` (step 2) and keep the **secret key** for the next step.
2. **Where messages go**: the address must be verified in Email Routing (step 4). Then set both
   secrets from your machine (each command asks for the value; nothing is written to the repo):

   ```bash
   npx wrangler secret put TURNSTILE_SECRET
   ```

   ```bash
   npx wrangler secret put CONTACT_TO
   ```

3. Messages are sent from `portal@cccy.im` (`CONTACT_FROM` in `wrangler.jsonc`), so Email
   Routing must be enabled on `cccy.im`. Replying in your mail app answers the visitor directly.
4. To try it locally, copy `.dev.vars.example` to `.dev.vars` (Cloudflare's published test
   keys), then `npm run build && npx wrangler dev`. Sending is simulated; each message is saved
   as an `.eml` file under `.wrangler/tmp/`.

## 6. First deploy

Merge to `main`, or deploy once from your machine:

```bash
npx wrangler login
```

```bash
npm run build && npm run pdf && npx wrangler deploy
```

Then check: <https://cccy.im>, `/resume`, `/Chong-Chi-Yang-Resume.pdf`, `/resume.json`, a page
that does not exist (the "Lost in time" page), and the response headers.

## The private resume (with your phone number)

Create `.env` in the project root (Git ignores it):

```
RESUME_PHONE=+60 …
```

```bash
npm run pdf:private
```

It writes `private/Chong-Chi-Yang-Resume-private.pdf`, which is Git-ignored and never deployed.
Attach it only to applications. A build check makes sure the number appears in no public file.
