# Four Eras

ccy's portfolio: one long desktop scroll that descends from 2099 to 1350 through four
retro-futures, with the resume waiting at the bottom. The full design is in
[the spec](Four%20Eras%20Portfolio%20—%20Website%20Specification.md); the motion is drawn in the
[storyboard](https://www.figma.com/design/xIS9BkotXQYD09nHclLayh).

**Status: M5 built, awaiting review.** The static page and the resume are ready to go live;
every act and transition of the descent is built, from the time-machine prologue to the 1350
contact portal and its Worker. Next: M6, continuity and performance. The art is lo-fi on
purpose (vector, CSS, 2D canvas): a later hi-fi pass replaces it with real textures and 3D
renders where possible (the spec's "Hi-fi art pass" lists every entity).

## Pages

| Route                        | What it is                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------ |
| `/`                          | The static summary everyone sees until launch (M7); phones keep it after       |
| `/descent`                   | The descent, work in progress (noindex until it replaces `/` on desktop)       |
| `/resume`                    | One A4 page, ATS-friendly; prints black on white                               |
| `/projects/<slug>`           | A case study per featured project; linked and indexed once its body is written |
| `/Chong-Chi-Yang-Resume.pdf` | Printed from `/resume` by `npm run pdf`                                        |
| `/resume.json`               | The same resume in the [JSON Resume](https://jsonresume.org/schema) schema     |
| `/404`                       | "Lost in time"                                                                 |

## Run it

Node 22.23 or newer.

```bash
npm install
npx playwright install chromium
npm run dev
```

Open <http://localhost:4321>. `npm run verify` runs everything CI runs: types and content
schemas, lint, formatting, unit tests, the build, checks on the built site, and the resume PDF
with its checks (one page, embedded fonts, standard section order, under 300 KB).

Deploying to cccy.im needs your Cloudflare account: see [DEPLOY.md](DEPLOY.md). That file also
covers the private resume with your phone number (`npm run pdf:private`).

## Trying the descent

| Control                 | What it does                                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| Scroll                  | Scrubs the descent, both ways                                                                        |
| Page Down / Space       | Next rest point (Shift+Space or Page Up: previous)                                                   |
| Home / End              | The prologue / the contact portal                                                                    |
| Hold the light          | Time machine: each 1.5 s goes one era back, through the 5 s loading screen; release sooner to cancel |
| 2–4 (in the prologue)   | Jump straight to 1999, 1888 or 1350; Esc cancels                                                     |
| Gauge links, `#works` … | Deep links: `#top`, `#works`, `#engine`, `#origin`, `#contact`, and a 1999 window: `#project-<slug>` |
| The 1888 valves         | Open a skill category (each is a deep link: `#skill-<id>`); hover or focus a gauge for its proof     |
| The 1999 console        | Type or press a chip (`help` lists commands); ↑/↓ history, Esc leaves it, Page Up/Down still page    |
| A window's ✕ or Skip    | On to the next rest point                                                                            |
| `?at=100`               | Open the descent at any map vh, for reviewing a moment                                               |
| <code>`</code>          | Show or hide the scroll markers (remembered)                                                         |
| `?mode=stacked`         | Force the stacked version (what reduced motion and phones get)                                       |

## Where things live

- `src/scenes/registry.ts`: **the scroll map.** Scenes, beats, rest points and deep links in map
  vh. `SCROLL_PACE` sets how many screen heights of scrolling each map vh takes (2 for now):
  raise it to slow the whole descent, lower it to speed it up.
  Tune pacing here; the engine, gauge, keyboard paging and markers all read from it.
- `src/scenes/<scene>/`: one module per act and transition. Built so far: `act-2099/` (scene,
  styles, the palms and constellation geometry), `t-shatter/` (the shard map and choreography)
  `act-1999/` (scene, styles, the grid horizon, the console and its commands), `t-power-loss/`,
  `act-1888/` (scene, styles, the involute gear generator and gear trains, the pipework,
  steam), `t-rust-to-gold/` (the noise material) and `act-1350/` (scene, styles, the contact
  portal's controller).
- `src/engine/`: the master timeline, keyboard and deep links, the gauge, the markers, the time
  machine, its particles and the stacked fallback.
- `src/content/`: the content records. `content.config.ts` holds their schemas and the spec's
  text limits; the build fails on a missing or over-long field.
- `src/lib/`: shared readers for the records, the resume builder and the draft rules.
- `src/pages/`: the static page, the descent, the case studies, the resume and its JSON, the 404.
- `worker/`: the one Worker, for the contact portal (`/api/contact`): Turnstile, validation, a
  rate limit and Email Routing. `contact.ts` holds the rules (unit-tested); DEPLOY.md, step 5,
  sets it up.
- `src/content/architecture.yaml`: the 1888 architecture plate (a system's stages, in order).
- `src/data/benchmark.csv`: the quantization results (one row per format, each with its source).
  The 1999 window's chart, the case study and the console's `stats quantization` read it; until
  it has rows they say the results are pending.
- `scripts/`: printing the resume PDF and checking it.

## Updating content

Edit the YAML or Markdown in `src/content/` and run `npm run check`. Values still waiting for
you start with `[add …]` or `[confirm …]`. The dev server shows them underlined in orange;
production pages leave out anything still `[add …]`, drop the `[confirm …]` markers, and
publish a number only once its value and source are both confirmed. A case study (the Markdown
body of a featured project) is linked and indexed only once it has no `[add …]` left. To list what is left:

```bash
grep -rn "\[add\|\[confirm" src/content
```
