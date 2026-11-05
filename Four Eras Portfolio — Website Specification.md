# Four Eras Portfolio — Website Specification

Oct 24, 2026 · @cy

## Overview

**Version 2 (3 Nov 2026): the site is now an animation-first showcase. One long desktop scroll descends from 2099 to 1350 through four "retro-futures", and the resume lives at the bottom in the contact portal.** Version 1 (a resume-first site with an era dial) is in this doc's history. The prologue and loading screen were refined in the storyboard on 4 Nov 2026.

Each era is what people of that time imagined the ultimate future would be. Scrolling down peels those futures back one by one: clean digital glass decays into a 1999 cyber grid, hardens into 1888 brass machinery, then dissolves into 1350 alchemy. The transitions between eras are the centrepiece.

| Area | Decision | Why |
| --- | --- | --- |
| Purpose | Showcase motion design and front-end craft first; resume second | The site itself is the strongest portfolio piece |
| Structure | One continuous page in four acts joined by three scroll-scrubbed transitions | The descent reads as one story |
| Order | 2099 → 1999 → 1888 → 1350 (scrolling down travels back in time) | Matches the lore; the alchemical ending suits a contact "portal" |
| Content per act | 2099 identity · 1999 projects · 1888 skills · 1350 philosophy, contact, resume | Each era carries the content it suits best |
| Continuity | A timeline gauge on the right edge that changes form in every era | One thread tying the four worlds together |
| Devices | Desktop and laptop only; phones get a short static page with the essentials and the resume | Long pinned scroll scenes do not work well on phones |
| Planning | Storyboard and a grey-box scroll prototype before any art or code polish | Motion has to be designed in time, not in static screens |
| Stack | Astro 6, TypeScript, GSAP with ScrollTrigger, CSS, WebGL only where it earns its cost | Proven tools for scroll storytelling |
| Hosting | Cloudflare Workers static assets on cccy.im | Unchanged from v1 |
| Music | Still parked | Visuals first |

## Goals, audience and success criteria

**The site has to make a visitor scroll to the end, and give a recruiter a way out to the resume at any point.**

### Goals

1. **Show craft.** Choreographed, scroll-scrubbed motion at 60 fps proves front-end and creative-coding skill better than any bullet point.
2. **Be memorable.** "The portfolio that travels back in time" is the line people should repeat.
3. **Still get interviews.** A resume link is reachable from every act through the timeline gauge, and the full resume waits in the 1350 portal.
4. **Stay maintainable.** Content still lives in data files; the animation code reads from them.

### Audience

| Reader | What they want | Design consequence |
| --- | --- | --- |
| Creative and front-end teams, studios | Motion quality, polish, originality | The transitions get most of the effort |
| Technical interviewers (AI and data roles) | Real projects and how you think | Projects in Act II stay substantive, not just decorative |
| Recruiters in a hurry | Name, role, resume | A "Skip to resume" control on the gauge in every act; `/resume` as a plain page |

### Success criteria

- [ ] The full descent plays smoothly at 60 fps on a mid-range laptop (for example integrated graphics, 1080p).
- [ ] Every act's content can be read when scrolling stops; no text is only visible mid-animation.
- [ ] The resume is reachable in one click from any scroll position.
- [ ] With reduced motion on, every act is complete and every transition becomes a simple crossfade.
- [ ] Phones see a clean static page with the essentials and the resume, never a broken animation.
- [ ] First visible frame of Act I in under 2 seconds; heavier assets for later acts load while the visitor reads Act I.

### Out of scope for v1

Full mobile version, blog, multilingual pages, music (parked).

## The lore: retro-futures of tomorrow

**Every era shows not the past as it was, but the future its people dreamed of.** Starting in 2099 turns the scroll into an archaeological descent through human ambition: the clean digital present decays backwards into physical mechanism, and then into pure mystical intent.

| Act | Year | Era title | The dream | The future people imagined | Carries |
| --- | --- | --- | --- | --- | --- |
| I | 2099 | The Ethereal Singularity | Zero friction | Form dissolves into thought; interfaces become invisible, anticipatory, ambient | Hero and identity: who you are, current status, focus, short summary |
| II | 1999 | The Cybernet Grid | Cyberspace | Humanity leaves meatspace and merges with the Web along neon data highways | Featured projects |
| III | 1888 | The Engine of Tomorrow | Perpetual motion | Steam and analytical engines grow into towering brass thinking machines | Skills, tools and system architecture |
| IV | 1350 | The Grand Magisterium | The philosopher's stone | The cosmos mastered through celestial geometry and transmutation | Philosophy, origin, contact and resume |

### The descent in one line

```
[ 2099 Hero ] ──shatter──▶ [ 1999 Works ] ──power loss──▶ [ 1888 Engine ] ──rust to gold──▶ [ 1350 Origin ]
 Ethereal future           Digital frontier                Clockwork industry               Cosmic magic
```

### Rules of the world

1. **Decay is the motion language.** Each transition breaks the newer world down into the material of the older one: glass into phosphor, phosphor into wire, metal into gold leaf.
2. **One persistent thread.** The timeline gauge on the right edge is always present and morphs with the era (see the scroll engine section).
3. **Read when still.** Motion happens between reading positions; when scrolling stops inside an act, everything is legible.
4. **Each act has one hero interaction.** HUD ring, CLI console, valve-and-gear selector, transmutation circle. Everything else supports it.
5. **Original art only.** No franchise imagery, operating-system branding or borrowed sounds.
6. **Reduced motion is a first-class version**, not a broken one: same acts, crossfades instead of transformations.

## The descent: page structure and scroll map

**The home page is one pinned, scrubbed scroll of about 1,100 viewport-heights (vh): four acts of 150–250 vh each, joined by three transitions of about 100 vh.** Scrolling back up plays everything in reverse, so the descent can be rewound.

### Scroll map (first draft, to be tuned in the prototype)

| Scroll range | Beat | On screen | What moves | Rests at |
| --- | --- | --- | --- | --- |
| 0–150 vh | Act I · 2099 | Obsidian canvas, greeting, identity cards, HUD ring | Type fades in; cards drift magnetically; light follows the cursor | Greeting (0 vh), identity cards (100 vh) |
| 150–250 vh | Transition A · Shatter | Glass fractures into RGB phosphor dots | Cracks spread from the HUD ring; shards fall away; a green scanline rolls down; CRT curvature forms | — |
| 250–500 vh | Act II · 1999 | Cyber deck: grid horizon, cartridge rack, terminal windows | Cartridges slide out one per project; windows open; the console types | One rest per featured project, plus the console |
| 500–600 vh | Transition B · Power loss | Screen flickers, collapses to a line | The neon grid's lines thicken into brass wire and copper pipe; a gear meshes in | — |
| 600–800 vh | Act III · 1888 | Engine room: cast-iron plates, gear trains, gauges | Gears turn with scroll; steam clears; gauges settle on their readings | Engine overview, then each skill category |
| 800–900 vh | Transition C · Rust to gold | Metal rusts, glows amber, becomes gold leaf and parchment | Rust spreads; plates flatten into illuminated pages; gears become astrolabe rings | — |
| 900–1,100 vh | Act IV · 1350 | Celestial indigo, constellations, parchment, transmutation circle | Stars connect; the circle draws itself; runes light on hover | Philosophy, then the contact portal |

### Routes

| Route | Holds |
| --- | --- |
| `/` | The descent (desktop) or the static summary page (phones and small screens) |
| `/projects/<slug>` | A case study per featured project, opened from Act II; styled as a 1999 window but readable |
| `/resume` | Plain, printable resume; source of `resume.pdf` and `resume.json` |
| `/colophon` | How it was built, credits and licences |
| `/404` | A "lost in time" page |

### Ways out of the scroll

- **Timeline gauge:** clicking a year jumps (with a fast scrubbed travel) to that act; a small "Resume" item sits at its base in every era.
- **Keyboard:** Page Down and Space step to the next rest point; Home and End jump to 2099 and 1350.
- **Deep links:** `#works`, `#engine`, `#origin` and `#contact` land on the right rest point with the scene already built.
- **Skip link:** the first focusable element is "Skip the journey: go to resume".

## Prologue: the time machine

**Every visit starts in dark space with one floating light held in two cupped palms: hold to travel straight to an era, or scroll to take the full descent.** It replaces the static opening of Act I and adds no scroll length. Storyboard frames P1–P4 show it.

### How it works

1. **Landing (0 vh):** black space and two hands held out toward the viewer, palms up and cupped together, carefully holding one floating light just above them. Only the palms catch its light; the wrists and arms fall away into darkness. A soft wavy ring circles the light, and one quiet two-line hint sits below the hands: "Hold to travel · Scroll to descend".
2. **Hold:** pressing and holding the light charges the machine. A three-segment ring around the light fills one segment every 1.5 s, and a readout above the hands shows the destination as it changes: 1.5 s → 1999, 3 s → 1888, 4.5 s or more → 1350. Particles stream in from the screen edges and accelerate toward the light, denser as the charge builds. The particles, the light and the palms take the destination era's accent colour and crossfade (300 ms) at each step: iris (2099) → phosphor (1999) → copper (1888) → rune gold (1350). 1888 uses copper rather than brass because brass is too close to 1350's gold to read as a change. The particles run on a small 2D canvas (about 200 particles), not WebGL.
3. **Release:** under 1.5 s cancels and the particles drift back out. The machine only travels back in time: 2099 is where the visitor already is, so it is never a destination, and the readout stays blank until 1999 is reached. Otherwise the loading screen plays while the destination scene preloads, then the visitor lands at that act's first rest point. The gauge and normal scrolling work from there, in both directions.
4. **Refuse:** scrolling instead dismisses the machine. The light spreads into Act I's ambient glow and the descent begins as planned.

The prologue keeps Act I's calm rhythm, with no exception: the light breathes on an 8 s loop and the light on the palms breathes with it; a slow wave travels round the hint ring, which sends one soft ripple outward every 8 s. On hover or focus, the ring tightens toward the light and brightens (300 ms), inviting the press.

### The loading screen

Shown only for time-machine jumps. The style is **constellation shift** (chosen in the storyboard on 4 Nov 2026): the prologue light scatters into stars, the field rotates about 30° and the stars link into the destination's sign (a circuit for 1999, a gear for 1888, an astrolabe for 1350), with the era title and that era's quote beneath it.

- **Always at least 5 s,** even when the destination has already loaded, so the whole sequence plays: 0–0.5 s the stars gather; 0.5–3.0 s they rotate and link into the sign; the quote fades in at 1.0 s and holds; 4.6–5.0 s the sign flares and the scene fades into the act's first rest point.
- **Still loading at 5 s:** the sign keeps turning slowly and a plain progress line appears until the scene is ready.
- **No skip to the destination,** by design. Escape cancels the jump and returns to the prologue, and the skip-to-resume link still works.
- **A full hold to 1350** takes 4.5 s plus the 5 s loading screen, about 9.5 s. That is fine for a deliberate jump, because the skip link and the gauge's Resume stay one click away.

Quotes live in the era records with their sources (drafts, easy to change later):

| Destination | Quote | Source |
| --- | --- | --- |
| 1999 | "We will create a civilization of the Mind in Cyberspace." | John Perry Barlow, *A Declaration of the Independence of Cyberspace* (1996) |
| 1888 | "The Analytical Engine weaves algebraical patterns just as the Jacquard-loom weaves flowers and leaves." | Ada Lovelace, *Notes on the Analytical Engine* (1843) |
| 1350 | "That which is below is like that which is above." | *The Emerald Tablet*, translated by Isaac Newton |

### Rules

- **Keyboard:** hold Space or Enter on the focused light, or press 2, 3 or 4 to jump straight to 1999, 1888 or 1350 (their places on the timeline); Escape cancels.
- **Discoverable but optional:** the text hint fades after 6 s while the ring keeps its slow 8 s ripple; the machine never blocks scrolling.
- **Reduced motion:** the hold still works: the ring segments fill and the light and palms tint on the same 1.5 s steps, with no particles, breathing, wave or ripple. The loading screen shows the finished sign, title and quote without rotation, holds for the same 5 s, then crossfades to the destination.
- **Return visits:** the same prologue; no forced replay of anything already seen.
- **Mobile (under consideration):** the time machine could become the main way to move between eras on phones, landing in a lighter, touch-friendly version of each act after the loading screen.

## Storyboard plan

**Before any build, the motion is designed in three passes: a beat sheet (the scroll map above), about 30 storyboard frames (including the time-machine prologue), and a grey-box scroll prototype you can actually scroll.** Each pass is cheap to change; code and art come only after the prototype feels right.

### The frames

| Block | Frames | Key moments to draw |
| --- | --- | --- |
| Act I · 2099 | 4 + 4 prologue | Prologue: palms holding the light at rest · charging with the particle surge and year readout · the loading screen · each destination's sign and quote · then light spreading into the canvas when the visitor scrolls · greeting resolved · identity cards floating · first scanline bleeding into the glass edge |
| Transition A · Shatter | 3 | First crack from the HUD ring · shards mid-fall revealing phosphor · CRT bulge and green scanline settling |
| Act II · 1999 | 5 | Grid horizon and cartridge rack · cartridge sliding out · project window open · CLI console mid-query · last window closing |
| Transition B · Power loss | 3 | Flicker · collapse to a single line · grid lines thickening into brass pipe |
| Act III · 1888 | 4 | Steam clearing over the engine · gauges settling · valve turned, gear train revealing a toolkit · machine at full motion |
| Transition C · Rust to gold | 3 | Rust spreading · amber glow · plates flattening into gold-leaf parchment |
| Act IV · 1350 | 4 | Constellations drawing · philosophy line · transmutation circle complete · golden-ember submit |

The gauge appears in every frame, so its morph can be checked across the whole board.

### What every frame records

- Scroll position (vh) and the act or transition it belongs to.
- Layout sketch: what is where, rough sizes.
- Motion notes: what moves, from where to where, easing, and whether it is scrubbed (tied to scroll) or triggered (plays once).
- Content shown: which data record, if any.
- Interaction: what the cursor or keyboard can do here.
- Reduced-motion version: what the visitor sees instead.

### Tools

- **Frames:** Figma (free education plan); rough greyscale sketches are enough. A frame template with the fields above keeps every frame comparable. The board: [Four Eras — Storyboard (M0)](https://www.figma.com/design/xIS9BkotXQYD09nHclLayh); its cover holds the scroll map and the open questions.
- **Animatic (optional):** export the frames and time them to the scroll map in a video editor, to judge pacing before coding.
- **Grey-box prototype:** a plain page of labelled boxes with the real pinning and scroll lengths in GSAP ScrollTrigger, plus on-screen scroll markers. It becomes the skeleton of the real build.

## Content per act

**Content stays in typed data files (YAML and MDX with schemas); each act's scene reads only the records it shows.** Text must survive being shown in a CRT window, on a brass plate or on parchment, so keep it short.

| Act | Shows | Fields | Limits |
| --- | --- | --- | --- |
| I · 2099 | Greeting line, name, headline, current status, primary focus, 3–4 identity cards | name, greeting, headline, status, focus, cards (label, value) | Greeting ≤ 14 words; card values ≤ 8 words |
| II · 1999 | 3–4 featured projects as cartridges and windows; CLI answers | title, cartridge label, summary, role, period, status, tags, highlight metric with source, links, CLI facts | Summary ≤ 140 characters; ≤ 6 tags; CLI facts ≤ 10 per project |
| III · 1888 | Skill categories as valves; tools per category; proficiency gauges | category, icon, tools (name, tier, evidence projects), architecture notes | 3–5 categories; ≤ 8 tools each; tiers in words |
| IV · 1350 | Philosophy text, origin note, contact portal, resume | philosophy (closing line + 60–100 words), origin (≤ 60 words), contact channels | One closing line, quotable |

### Rules

- **Gauges and dials show tiers, not fake precision.** A needle settles in a labelled zone (Daily, Comfortable, Familiar); no percentages.
- **Every number names its source**, exactly as in v1: the schema requires `source` on highlight metrics.
- **Readable at rest.** Every text block has a rest position where it is static, high-contrast and selectable.
- **The static mobile page and `/resume` render from the same records**, so nothing drifts.
- **CLI answers come from data**, not hand-typed strings: `run cartridge_02.exe` prints that project's title, stack, status and highlight.
- **Loading-screen quotes live in the era records** as `quote { text, by, source }`; like every number, every quote names its source.

## Your content inventory (draft)

**Most of the site can be drafted from work you have already done; the gaps are personal details, dates, links and confirmed numbers.** Items marked \[add\] or \[confirm\] need your input before launch.

In v2 the profile and About drafts feed Act I and the static mobile page; the projects table feeds Act II; the skills table feeds Act III; the new philosophy draft below feeds Act IV.

### Act I greeting (from your draft)

> I build systems at the edge of thought. Welcome to the quiet future.

Identity cards (draft): Now · final-year CS, Monash University Malaysia · Focus · small-data ML and efficient LLM inference · Status · open to graduate roles from \[add month\] · Based · Johor, UTC+8.

### Profile

| Field | Draft |
| --- | --- |
| Name | Chong Chi Yang ("ccy" on the site; full name on the resume and PDF) |
| Headline | Final-year Computer Science student, Monash University Malaysia · applied AI, small-data machine learning, efficient LLM inference |
| Pitch | I build ML systems that hold up under scrutiny, from small-sample biology to running LLMs on consumer GPUs. |
| Location | Johor, Malaysia (UTC+8) |
| Availability | Graduate roles from \[add month and year\] |
| Target roles | Graduate AI & Data, ML engineering, applied AI |
| Links | GitHub \[add\] · LinkedIn \[add\] · email on your own domain (see privacy) |

### About (draft, 96 words)

> I'm cy, a final-year Computer Science student at Monash University Malaysia. I like the part of machine learning that happens after the demo works: checking whether results survive proper validation, and making models cheap enough to run. My final year project fuses protein language model embeddings with mass-spectrometry data, and taught me more about data leakage and honest evaluation than any lecture. On my own RTX 5070 Ti, I benchmark how quantization trades quality for speed, memory and power. I'm looking for a graduate role in AI and data where rigour matters as much as results.

Quick facts: based in Johor (UTC+8) · BSc Computer Science, Monash University Malaysia (\[add year\]) · research on deep learning with very small proteomic datasets · runs a local AI lab on an RTX 5070 Ti · self-hosts services behind CGNAT.

### Education

| Field | Draft |
| --- | --- |
| Institution | Monash University Malaysia |
| Degree | Bachelor of Computer Science \[confirm exact title and any specialisation\] |
| Dates | \[add start\] – \[add expected graduation\] |
| Grade | WAM \[add, optional\] |
| Final year project | Multimodal deep learning for small-sample proteomics \[confirm final title\] |
| Relevant units | \[add up to 6\] |

### Projects

| # | Project | Placement | Card summary (draft) | Highlight and its source | Needed from you |
| --- | --- | --- | --- | --- | --- |
| 1 | Small-sample multimodal deep learning (final year project and paper) | Featured | A PyTorch model fusing ESM-2 protein embeddings with LC-MS abundances, and a benchmark of what helps when samples are scarce. | An ablation or permutation-test result, quoted from the current manuscript \[add number and section\] | Final title, paper status, link to the existing repository that credits both supervisors, 1–2 figures |
| 2 | LLM quantization and inference benchmark | Featured | What GGUF Q4–Q6, AWQ, GPTQ, EXL3, FP8 and NF4 cost in quality, latency, VRAM and power on an RTX 5070 Ti. | Best quality-per-GB format, using KL divergence against an FP16 reference \[add from results\] | Results CSV (it feeds the era charts), repository link, status |
| 3 | Recovery Companion | Featured \[confirm\] | A cross-platform harm-reduction app (Flutter, Firebase) that swaps gambling's reward loop for effort-based progress, then tapers itself out. | Design decisions rather than a metric: no cash-equivalent rewards; server-authoritative rewards and streaks | Implementation status, screenshots or mock-ups, repository or demo |
| 4 | This website, "Four Eras" | Featured once the era engine ships | One content model, four complete visual eras and a resume pipeline, under strict performance and accessibility budgets. | Lighthouse scores and payload sizes, taken from CI | Nothing; it documents itself |
| 5 | Self-hosting behind CGNAT | Lab entry | A public game server from a home connection behind CGNAT, through an Oracle Cloud VPS, a WireGuard tunnel and Cloudflare DNS. | Diagnosed an ISP routing detour with IPv4 and IPv6 traceroutes | A simple network diagram |
| 6 | Reservoir computing study | Lab entry | From-scratch echo state network, RNN, LSTM and spiking liquid state machine, compared on the Mackey-Glass chaotic series. | Teacher-forced NRMSE: ESN 0.0012, LSTM 0.0116, RNN 0.0369 \[re-run and confirm before publishing\] | Repository link |

### Skills (draft groups)

| Group | Skills and their evidence |
| --- | --- |
| Languages | Python (projects 1, 2, 6) · Dart (3) · TypeScript (4) · SQL \[confirm\] |
| Machine learning | PyTorch · protein language models (ESM-2) · attention and multimodal fusion · SHAP · leakage-safe cross-validation · ablations and permutation tests · transfer learning |
| LLM inference | GGUF, AWQ, GPTQ, EXL3, FP8, NF4 · inference engines \[confirm which you used\] · KL-divergence evaluation · latency and VRAM profiling · OpenVINO on an NPU (explored) |
| Apps and web | Flutter · Firebase (Firestore) · Astro |
| Infrastructure | Linux · WireGuard · Oracle Cloud · Cloudflare (DNS, proxy, Workers) · Git |
| Research | IEEE-format paper writing · responding to peer review |

Your storyboard draft names the Act III valves Frontend, Backend and Architecture. Your strongest evidence is in machine learning and inference, so valves such as **Machine Learning**, **LLM Inference**, **Apps and Web** and **Infrastructure** would let every gauge point at a real project.

### Act IV philosophy (draft)

> Before there was silicon or steam, there was only the desire to weave order from the void.

&#91;add 60–100 words in your own voice: why you build, what draws you to small-data problems and efficient systems, and what kind of work you want next.\]

Origin note (draft, ≤ 60 words): \[where you started with computing, and the moment it became more than coursework\].

### Claims audit before launch

If your current resume still carries the final-year-project paragraph drafted in September, replace its figures. The STRING enrichment p-value, the 67-biomarker list and the description of SFI-Hybrid imputation (that code path actually ran KNN imputation) do not match the rewritten paper, which makes no biology claims.

- [ ] Every number on the site appears in the current manuscript or a results file, worded the way the source words it.
- [ ] Paper status follows reality: "in preparation", then "submitted to RECOMB 2027" only once it is submitted, then "under review", then "accepted".
- [ ] The case study's limitations section states N = 9 plainly, and explains that this is why the work became a benchmark study.

## Personal details and privacy

**Publish enough to be contacted and verified, and nothing that helps someone impersonate you or find your home.** Several details that traditional Malaysian resumes include should stay off a public website.

| Detail | On the site | On the PDF you send | Why |
| --- | --- | --- | --- |
| Full name and preferred name | Yes | Yes | — |
| Email on your own domain | Yes, obfuscated | Yes | Contactable without exposing your personal inbox |
| LinkedIn, GitHub | Yes | Yes | Verification |
| Location | "Johor, Malaysia" | Same | Enough for location fit |
| Phone number | No | Private copy only | Public numbers attract scraping and scam calls |
| Street address | No | No | Not needed before an offer |
| IC (MyKad) number | No | No | Identity-theft risk; never required on a resume |
| Date of birth or age | No | No | Not job-relevant; invites age bias |
| Race, religion, marital status | No | No | Not job-relevant |
| Photo | Optional | Optional | Common in Malaysia; one professional headshot if used |
| WAM or grades | Optional | Optional | Include only if it strengthens the application |
| Salary expectation | No | Only when asked | Discuss it in conversation |
| Referees | No | "Available on request" | Their details are theirs to share |

### Setup details

- **Domain email:** route an address such as `hello@cccy.im` to your personal inbox with Cloudflare Email Routing. If it attracts spam, change the address without touching your real inbox.
- **Showing the email:** build the `mailto:` link with JavaScript and add a "Copy email" button; without JavaScript, show `hello [at] cccy.im` as text.
- **Two PDFs:** CI builds the public PDF with no phone number. A private PDF with your phone number is built locally from an environment flag, ignored by Git, and only ever attached to applications.
- **Collaborators and unpublished work:** name the lab, your supervisor and wet-lab colleagues only with their permission. Publish no raw data or figures beyond what the paper reports, and check the target venue's preprint and anonymity rules before describing unpublished results in detail.
- **Analytics:** Cloudflare Web Analytics is cookie-free, so no consent banner is needed. Collect nothing else.
- **Public repository:** keep `.env` files and the private PDF out of Git, and scan the history for secrets (for example with gitleaks) before making the repository public.
- **AI-tool disclosure (optional):** one honest line in the colophon on how AI tools helped build the site. For AI roles this tends to build trust rather than cost it.

## Scroll engine and timeline gauge

**One master scroll timeline drives everything: each act and transition is a GSAP timeline nested at its vh range, scrubbed by ScrollTrigger, and each scene loads its own assets and code just before it is needed.**

### How it works

1. **Scenes.** Every act and transition is a module exporting `mount()`, `timeline()` and `unmount()`. A registry places them on the master timeline by vh range.
2. **Pinning.** One pinned stage (a full-viewport container); scenes are layers inside it, so the page never jumps between sections.
3. **Scrub vs trigger.** Transitions and ambient motion are scrubbed (they follow the scroll, both directions). Small flourishes (a cartridge click, a gauge settle) are triggered once per visit when their rest point is reached.
4. **Rest points.** Each act defines snap-free rest positions; ScrollTrigger labels mark them, and keyboard paging moves between them.
5. **Smooth scroll.** Native scrolling by default. A smoothing library (such as Lenis) is optional and decided in the prototype; it must never break keyboard scrolling or anchors.
6. **Loading.** Act I's assets load first. Each later scene preloads when the visitor is one scene away, and unmounts heavy parts (WebGL, particles) once two scenes behind.
7. **Rendering budget per layer:** DOM and CSS for text and UI; SVG for line art, gauges and constellations; canvas or WebGL only for particles, shatter and steam.
8. **Reduced motion.** `prefers-reduced-motion` swaps the master timeline for a simple version: acts stacked vertically, transitions replaced by 300 ms crossfades, no scrubbing.

```ts
// scenes/registry.ts — vh ranges from the scroll map
export const SCENES = [
  { id: 'act-2099',     from: 0,   to: 150,  load: () => import('./act-2099') },
  { id: 'shatter',      from: 150, to: 250,  load: () => import('./t-shatter') },
  { id: 'act-1999',     from: 250, to: 500,  load: () => import('./act-1999') },
  { id: 'power-loss',   from: 500, to: 600,  load: () => import('./t-power-loss') },
  { id: 'act-1888',     from: 600, to: 800,  load: () => import('./act-1888') },
  { id: 'rust-to-gold', from: 800, to: 900,  load: () => import('./t-rust-to-gold') },
  { id: 'act-1350',     from: 900, to: 1100, load: () => import('./act-1350') },
] as const;
```

### The timeline gauge

Fixed to the right edge in every era; it shows progress through time, lets visitors jump between acts, and always offers the resume.

| Era | Form | Progress shown as | Morph out (during the next transition) |
| --- | --- | --- | --- |
| 2099 | A thin laser reticle with a year readout (2099.00) | A light point sliding down a hairline | The hairline fractures into pixels |
| 1999 | A chunky pixel scrollbar with arrow buttons | A bevelled thumb; the year counts down in a bitmap font | Pixels fuse into a toothed brass rack |
| 1888 | A vertical brass rack-and-pinion | A pinion gear rolling down the rack; a mechanical year counter | The rack curls into a ring and turns to gold |
| 1350 | An astrological astrolabe dial | The dial's pointer rotating through the zodiac; the year in illuminated numerals | — (the end) |

It is a single component with four skins; its morph is part of each transition's timeline. It is a real `<nav>` with four labelled links plus the resume link, keyboard-operable, with visible focus in every skin.

### Data and parity

All text comes from the content records. The static mobile page, `/resume` and the descent render from the same data, and a test checks that every featured record appears in each.

## Act I · 2099 · The Ethereal Singularity

**An immaculate obsidian canvas where interface has almost disappeared: frosted titanium glass, iridescent light, and motion so refined it feels anticipatory.** It is the first impression, so it must load fastest and feel calmest.

### Palette (dark only)

| Token | Hex | Used for | Contrast |
| --- | --- | --- | --- |
| `--bg` obsidian | #07090D | Canvas | — |
| `--glass` titanium | #161B24 at 70% with backdrop blur | Floating cards | — |
| `--text` | #ECEFF5 | Body and headings | 17.3:1 (15.0:1 on glass) |
| `--muted` | #9AA3B5 | Labels, metadata | 7.9:1 |
| `--iris` | #9FE7F5 | Accents, HUD, focus ring | 14.4:1 |
| Iridescence | Shifting gradient of cyan, violet and pale gold | Light refraction on glass edges only | Never behind text |

### Type

Space Grotesk for display, Inter for text, JetBrains Mono for the HUD readout (all OFL).

### Scene

- **Entry (0 vh):** the time-machine prologue (see its section). When the visitor scrolls instead of holding, the light spreads into a soft ambient gradient that follows the cursor with a slow lag (about 600 ms).
- **Greeting:** "I build systems at the edge of thought. Welcome to the quiet future." fades in word by word, crisp, no blur or bounce. Name and headline settle beneath.
- **Identity cards (100 vh rest):** 3–4 frosted glass cards (Now, Focus, Status, Based) float at different depths and lean magnetically toward the cursor (≤ 8 px, spring easing).
- **HUD ring:** a thin ring in the corner reads `2099.00` and ticks down to `2098.97` as scrolling begins, the first hint that time is moving backwards.
- **Decay hint (120–150 vh):** tiny pixel artefacts and faint scanlines bleed into the edges of the glass, foreshadowing Act II.

### Hero interaction

The magnetic cards and cursor light. Hovering a card sharpens it and dims the rest; clicking "Status" opens a small glass sheet with availability and the resume link.

### Motion

150–400 ms, `cubic-bezier(0.2, 0.8, 0.2, 1)`; springs for magnetic movement. Nothing loops faster than 8 s.

### Avoid

Text on moving gradients; generic AI-startup purple glow; heavy WebGL on first load (the light can be CSS gradients or a small canvas).

## Act II · 1999 · The Cybernet Grid

**A cyber deck jacked into a neon data frontier: phosphor green on black, CRT curvature, dithered bitmaps, bevelled windows and a glowing terminal.** This is the projects act, so it is the longest and the most substantive.

### Palette

| Token | Hex | Used for | Contrast on #05080A |
| --- | --- | --- | --- |
| `--bg` void | #05080A | Background | — |
| `--window` | #0B1410 | Window panes | — |
| `--text` | #C8FFD9 | Long text | 17.9:1 (16.7:1 on panes) |
| `--phosphor` | #39FF7A | Headings, terminal output | 15.1:1 |
| `--phosphor-dim` | #1FA855 | Grid lines, secondary text | 6.5:1 |
| `--cyan` | #38E8FF | Links, selection | 13.5:1 |
| `--magenta` | #FF3EC9 | Data-highway accents, warnings | 6.5:1 |
| `--amber` | #FFB000 | Cartridge labels, focus ring | 11.0:1 |

Long text uses `--text` on panes, never pure neon.

### Type

VT323 for the terminal, Pixelify Sans for window titles and labels, a clean sans (Verdana or Noto Sans) for project summaries (all free licences).

### Scene

- **Arrival (250 vh):** a wireframe grid horizon recedes to a vanishing point; data packets streak along neon highways.
- **Cartridge rack:** each featured project is a labelled cartridge in a rack. Scrolling slides the next cartridge forward; its rest point inserts it into the deck and opens a bevelled window (title bar with minimise, maximise and close glyphs, dithered borders).
- **Project window:** summary, role, period, status, tags, the highlight metric with its source, and buttons: Open case study, Code, Paper.
- **CLI console (rest point after the projects):** a terminal where visitors can type or click suggested commands: `ls projects`, `run cartridge_02.exe`, `stats quantization`, `help`. Output comes from the content data and types out at a readable speed.
- **Exit hint (480–500 vh):** the picture starts to flicker as if losing power.

### Hero interaction

The CLI console. It needs suggested-command chips for people who will not type, real keyboard input for people who will, and a visible "Skip" so it never traps the scroll.

### Motion

Snappy, 0–150 ms UI; `steps()` for sprite and cursor blinks (≤ 2 blinks per second); scanlines and slight RGB fringing as overlays at low opacity. Nothing flashes more than three times a second.

### Avoid

Body text in pixel fonts; neon text on neon; operating-system logos or names; constant glitch effects that make the content hard to read.

## Act III · 1888 · The Engine of Tomorrow

**A towering analytical engine: cast-iron plates, patina-bronze rivets, meshing differential gears, mercury pressure gauges and venting steam.** It carries your skills and how you build systems, so every gauge points at real evidence.

### Palette

Contrast against soot (#1C1410), with leather (#2E211A) in brackets (computed for v1, unchanged).

| Token | Hex | Used for | Contrast |
| --- | --- | --- | --- |
| `--bg` soot | #1C1410 | Engine room | — |
| `--surface` leather | #2E211A | Plates and panels | — |
| `--text` parchment | #EFE2C8 | Body text | 14.2:1 (12.1:1) |
| `--muted` aged brass | #BFA88A | Labels | 7.9:1 (6.8:1) |
| `--brass` | #D9B25F | Headings, gauge rims, primary controls | 9.1:1 (7.8:1) |
| `--verdigris` | #7FC4B0 | Links, patina accents | 9.0:1 (7.7:1) |
| `--copper` | #C2703D | Pipes, large text | 4.9:1 |
| `--gaslight` | #F2C14E | Focus ring | 10.8:1 |

### Type

Playfair Display SC for engraved headings, Old Standard TT for text, Special Elite for gauge labels and tickets (OFL or Apache 2.0).

### Scene

- **Arrival (600 vh):** a puff of particle steam clears to reveal the engine wall; a large flywheel spins up with the scroll.
- **Valves:** each skill category is a steam valve or lever on the control panel. Turning one (click or Enter) drives a linked gear train that rotates a drum, revealing that category's tools on engraved brass tags.
- **Gauges:** each tool's proficiency is a dial gauge whose needle jitters, then settles into a labelled zone (Daily, Comfortable, Familiar). Hovering a gauge vents a small steam tooltip listing the projects that prove it.
- **Architecture plate:** one engraved schematic of a system you built (for example the quantization benchmark harness or the fusion model), with pipes standing in for data flow.
- **Exit hint (780–800 vh):** rust begins to creep in from the rivets.

### Hero interaction

The valve-and-gear selector. Gears are generated as true involute profiles, so they mesh convincingly when one valve drives several wheels.

### Motion

Mechanical: 200–500 ms, `steps()` for ratchets, slight overshoot on needle settles; gear speed tied to scroll velocity while scrolling, idling slowly at rest.

### Avoid

Brown-on-brown text; gears on every element; percentage bars dressed as gauges.

## Act IV · 1350 · The Grand Magisterium

**Deep celestial indigo, hand-made parchment and gold leaf: the universe as alchemists hoped to master it.** The descent ends here, on why you build and on the portal for getting in touch.

### Palette

| Token | Hex | Used for | Contrast |
| --- | --- | --- | --- |
| `--bg` celestial indigo | #10163A | Night sky | — |
| `--star` | #E9E4D4 | Text on the sky | 13.8:1 |
| `--muted` | #A9B0D6 | Labels, constellation names | 8.2:1 |
| `--gold` | #D9B45A | Illumination, circle lines, headings | 8.9:1 |
| `--rune` | #F5D98B | Lit runes, focus ring | 12.7:1 |
| `--parchment` | #F4EAD5 | Philosophy page and resume scroll | — |
| `--ink` | #2B1D14 | Text on parchment | 13.6:1 |
| `--rubric` | #7A1F14 | Initials and headings on parchment | 8.6:1 |

### Type

Cinzel for display, EB Garamond for text, UnifrakturMaguntia once for an initial (all OFL).

### Scene

- **Arrival (900 vh):** stars ignite across the indigo; constellation lines draw themselves and bend gently toward the cursor.
- **Philosophy (rest point):** a parchment leaf with a gold-leaf illuminated border unrolls. The closing line, "Before there was silicon or steam, there was only the desire to weave order from the void.", is inked letter by letter, followed by your 60–100 words and the origin note.
- **The contact portal (final rest point):** an alchemical transmutation circle drawn in gold. Its inner rings hold the form fields (name, email, message); hovering or focusing a field lights the rune beside it. The outer ring holds email, LinkedIn, GitHub and "Unfurl the resume" (opens `/resume` and offers the PDF).
- **Submit:** the circle spins up and the message is "sealed" with a flash of golden embers and a wax-seal stamp; a plain confirmation line follows.

### Hero interaction

The transmutation circle. It must still be a normal, accessible form: real labels, clear error messages, keyboard order following the rings, and a working fallback when animation is off.

### Motion

Slow and ceremonial: 400–900 ms, ease-out; ink and line drawing via SVG stroke animation; embers as a short particle burst (≤ 1.2 s).

### Avoid

Blackletter in paragraphs; gold for body text; careless use of symbols with real religious meaning; franchise magic iconography.

## Transitions

**The three transitions are the signature of the site: each one physically breaks the newer world down into the material of the older one, scrubbed by scroll in both directions.** Each takes about 100 vh and has four stages, so it can be storyboarded in three frames and built in parts.

| Transition | Stage 1 | Stage 2 | Stage 3 | Stage 4 | Main technique |
| --- | --- | --- | --- | --- | --- |
| A · Shatter (2099 → 1999) | Hairline cracks spread from the HUD ring | Glass panes split into shards that fall and spin | Behind them, RGB phosphor dots glow up; a green scanline rolls down with a low hum | The screen bulges into CRT curvature and the grid horizon fades in | WebGL or canvas for shards (Voronoi pieces of a snapshot of Act I); CSS for scanline and curvature |
| B · Power loss (1999 → 1888) | The picture flickers and loses colour | It collapses to a bright horizontal line, then a dot | The neon grid lines reappear thick and solid, turning into brass wire and copper pipe | A gear meshes in; steam vents over the cut | SVG paths morphing from grid lines to pipe outlines; CSS for the collapse |
| C · Rust to gold (1888 → 1350) | Rust blooms from the rivets across the plates | The metal glows warm amber as if heated | Plates flatten and soften into parchment with gold-leaf edges | Gears unroll into the astrolabe rings and the stars ignite | Noise-masked dissolve (shader or SVG turbulence mask); SVG morph for gears to rings |

### Shared rules

- Scrubbed both ways: scrolling up rebuilds the newer world.
- No content is shown during a transition, so nothing has to be read mid-effect.
- The timeline gauge morphs within each transition (see the scroll engine section).
- Reduced motion: a 300 ms crossfade replaces each transition.
- Sound hooks (parked): hum, power-down, rust creak; muted by default if music is ever added.

## Resume mode

**The resume is generated, never hand-maintained: `/resume` renders the content data as a one-page, ATS-friendly layout, and CI prints it to `resume.pdf` and serialises it to `resume.json`.** Change a YAML line, push, and all three update.

In v2 the resume is reached from the 1350 contact portal ("Unfurl the resume"), from the timeline gauge's resume link in every act, from the skip link, and from the static mobile page. The pipeline below is unchanged.

### The `/resume` page

- A plain, neutral layout; it may borrow the 1350 parchment as a light frame on screen, but prints in black on white.
- One column with standard headings in this order: Summary, Education, Projects, Research, Experience, Skills, Awards. Empty sections drop out.
- A4 (the Malaysian standard), one page, 15–18 mm margins, 10–11 pt body text.
- Content is chosen by each record's `resume.include` flag and its `resume.bullets` (at most 3 lines), so the PDF can be tighter than the site.
- Links print as short readable text (`cccy.im/projects/…`, `github.com/…`), never "click here".
- Buttons: Download PDF, Print, View JSON.

### Print stylesheet for every page

`@media print` hides the gauge, scenes, decorations and backgrounds; sets black text on white; keeps entries whole with `break-inside: avoid`; and prints external URLs after their link text. Anyone pressing Ctrl+P on the resume, a case study or the mobile page gets something clean; the descent itself is not meant for printing.

### PDF pipeline

1. `astro build` produces the static `/resume` page.
2. A script serves `dist/` locally, opens `/resume` in Playwright's Chromium and prints it as A4 to `dist/resume.pdf`, with tagged-PDF output turned on if your version offers it.
3. CI checks the result: exactly one page (`pdfinfo`), fonts embedded (`pdffonts`), headings in the right order and your name on the first line (`pdftotext`), file under 300 KB.
4. `PRIVATE=1 npm run pdf` builds the private copy with your phone number into a Git-ignored folder; it is never deployed.
5. The download link sets `download="Fullname-Resume.pdf"`, so saved files carry your name.

If you later want finer typography than browser printing gives, a [Typst](https://typst.app/) template can read `resume.json` instead; the data model stays the same.

### `resume.json` and structured data

- An Astro endpoint (`src/pages/resume.json.ts`) serialises the same collections into the [JSON Resume](https://jsonresume.org/schema) schema: basics, education, projects, publications, work, skills, awards.
- The same data produces schema.org `Person` JSON-LD in the home page's `<head>` (name, job title, `alumniOf`, `sameAs` profile links) for search engines.

### ATS checklist

- [ ] Real, selectable text; nothing important inside images.
- [ ] One column; standard section names; embedded standard fonts.
- [ ] Dates written "Oct 2026" throughout.
- [ ] No layout tables; nothing essential in page headers or footers.
- [ ] Text extracted from the PDF reads top to bottom in the intended order.

## Technical architecture

**A static Astro 6 site in strict TypeScript, styled with plain modern CSS and deployed from GitHub to Cloudflare: no server, no database, no framework runtime in the browser.** Everything interactive is a small, lazily loaded island.

&#91;embedded content: build pipeline · one source, three outputs\]

A schema error or any failed check stops the deploy, so the live site, the PDF and the JSON always agree.

### Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Astro 6, static output | Content collections with schema validation, zero JavaScript by default, islands for the few interactive parts. The Astro team joined Cloudflare in January 2026, and Astro remains open source ([announcement](https://secure.businesswire.com/news/home/20260116386991/en/Cloudflare-Acquires-Astro-to-Accelerate-the-Future-of-High-Performance-Web-Development)) |
| Runtime | Node LTS as Astro's install docs require (22 or newer at the time of writing) | — |
| Language | TypeScript, strict | Typed content and era registry |
| Styling | Vanilla CSS: custom properties, cascade layers, native nesting | Four very different skins fight utility classes; tokens plus layers keep them apart |
| Interactivity | GSAP with ScrollTrigger for the master timeline; vanilla TypeScript scene modules; SVG for line art; canvas or a small WebGL layer (for example OGL or three.js) only for shatter, steam, embers and particles | GSAP is the standard for pinned, scrubbed storytelling scroll and is now free to use, plugins included; WebGL stays optional and lazily loaded |
| Content | Content collections: YAML for structured data, MDX for case studies, Zod schemas | The build fails on missing or over-long fields |
| Charts | Hand-rolled SVG or bitmap-style canvas from the benchmark CSV, inside the 1999 project windows | Full control over four looks without a heavy chart library |
| Testing | Vitest; Playwright (end-to-end, per-era screenshots, content parity); axe-core; Lighthouse CI | Each era is tested like a product |
| Code quality | ESLint, Prettier, Stylelint, `astro check` | — |
| CI/CD | GitHub Actions, deploying with Wrangler | A preview link per pull request; production from `main` |
| Hosting | Cloudflare Workers static assets on cccy.im | Cloudflare now recommends Workers static assets over Pages for new projects ([comparison](https://flaviocopes.com/cloudflare-pages-vs-workers/)); your DNS is already there |
| Analytics | Cloudflare Web Analytics | Cookie-free |
| Email | Cloudflare Email Routing | Free forwarding from your domain |

### Repository layout

```
portfolio/
├─ storyboard/                   # frame exports, scroll map, animatic (planning only)
├─ src/
│  ├─ content/                   # profile, skills, philosophy .yaml; projects/*.mdx
│  ├─ content.config.ts          # schemas for every collection
│  ├─ data/benchmark.csv         # quantization results for project visuals and the CLI
│  ├─ scenes/
│  │  ├─ registry.ts              # vh ranges from the scroll map
│  │  ├─ act-2099/ act-1999/ act-1888/ act-1350/   # scene.ts, scene.css, assets/
│  │  └─ t-shatter/ t-power-loss/ t-rust-to-gold/
│  ├─ engine/                    # master timeline, pinning, preloading, reduced-motion swap
│  ├─ components/                # TimelineGauge, ProjectWindow, Cli, Gauge, Valve, TransmutationForm …
│  ├─ layouts/                   # Descent, Mobile, CaseStudy, Resume
│  ├─ pages/                     # index, projects/[slug], resume, resume.json.ts, colophon, 404, api/contact.ts
│  └─ styles/                    # reset, tokens per act, base, print
├─ public/fonts/                 # self-hosted subset WOFF2
├─ scripts/                      # build-pdf.ts, check-pdf.ts, check-contrast.ts, gear-generator.ts
├─ tests/                        # unit/, e2e/, visual/, perf/
├─ wrangler.jsonc
└─ astro.config.mjs
```

### Content schema (excerpt)

Adjust imports to the Astro version you install; Astro 6 ships Zod 4.

```ts
// src/content.config.ts
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const metric = z.object({
  value: z.string(),               // '0.0012'
  label: z.string(),               // 'teacher-forced NRMSE, ESN'
  source: z.string(),              // 'results/mackey_glass.csv @ a1b2c3d'
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: ({ image }) => z.object({
    title: z.string().max(60),
    summary: z.string().max(140),
    role: z.string(),
    period: z.object({ start: z.string(), end: z.string().optional() }),
    status: z.enum(['completed', 'in-progress', 'under-review', 'archived']),
    featured: z.boolean().default(false),
    order: z.number(),
    tags: z.array(z.string()).max(6),
    skills: z.array(reference('skills')),
    highlight: metric.optional(),
    links: z.object({ repo: z.url().optional(), paper: z.url().optional(), demo: z.url().optional() }),
    cover: image(),
    resume: z.object({ include: z.boolean(), bullets: z.array(z.string().max(160)).max(3) }),
  }),
});
```

### Hosting and security

- Serve the portfolio on the apex `cccy.im` (or a subdomain such as `me.cccy.im` if the apex is taken), with `www` redirecting to it.
- Keep the Minecraft DNS records exactly as they are (DNS-only, plus the SRV record); the portfolio's Worker route does not touch them.
- Do not serve the site from home (behind CGNAT) or from the Oracle VPS. Cloudflare's edge is free, faster and needs no maintenance; the VPS stays dedicated to the game server.
- Headers: a strict Content-Security-Policy (Astro 6 can generate the hashes), `Referrer-Policy`, `Permissions-Policy`, and HSTS through Cloudflare.
- The 1350 contact portal posts to a Worker route (`/api/contact`) protected by Cloudflare Turnstile, which forwards the message to your inbox and stores nothing. Rate-limit it and validate every field on the server.

## Quality bar

**Heavy animation is allowed; dropped frames, unreadable text and dead ends are not.** Budgets now focus on frame rate and on loading each act just in time.

### Performance budgets (desktop)

| Measure | Budget | Checked by |
| --- | --- | --- |
| Frame rate while scrubbing any act or transition | 60 fps on the reference laptop; no frame over 33 ms in a full descent | Chrome DevTools performance trace, recorded per milestone |
| Act I visible (Largest Contentful Paint) | ≤ 2.0 s on a typical connection | Lighthouse CI |
| Cumulative Layout Shift | ≤ 0.05 | Lighthouse CI |
| Initial download before Act I is interactive | ≤ 400 KB compressed (HTML, CSS, fonts, GSAP, engine) | Size check in CI |
| Each later scene (code and assets) | ≤ 600 KB compressed, preloaded one scene ahead | Size check |
| WebGL | One shared context; nothing running for scenes two or more away; pauses when the tab is hidden | Code review, trace |
| Static mobile page | ≤ 150 KB, Lighthouse mobile ≥ 95 | Lighthouse CI |

Reference laptop: integrated graphics, 1080p, 60 Hz. Also test once on a high-refresh (120 Hz+) screen, where timing bugs show.

### Accessibility

- **Reduced motion:** a complete version with stacked acts and crossfades; tested as its own mode.
- **Readable at rest:** text ≥ 4.5:1 against what is actually behind it at each rest point (palettes list the ratios); interface parts ≥ 3:1.
- **Keyboard:** gauge, cartridges, CLI, valves and the contact form all work without a mouse, with visible focus in every act. Paging moves between rest points.
- **Screen readers:** the descent's DOM holds real headings and text in order; decorative layers are `aria-hidden`; each act is a landmark region.
- **Flashing:** nothing flashes more than three times a second, including the CRT effects and the power-loss flicker.
- **Escape hatch:** the skip-to-resume link and the gauge's resume link always work.

### Devices and browsers

| Context | Experience |
| --- | --- |
| Desktop and laptop, Chrome or Edge, last two versions | The full descent |
| Desktop Safari 18+ and Firefox, last two versions | The full descent; test each transition, since WebGL and blending differ |
| Phones and narrow windows (under about 900 px wide, or touch-only) | For now, the static page: name, greeting, project cards, skills list, contact and resume. Under consideration: a mobile version driven by the time machine and its loading screen, with a lighter version of each act |
| No WebGL | Transitions fall back to their CSS or SVG versions |

### SEO and sharing

Unique titles and descriptions, sitemap, Person structured data from the resume data, and an Open Graph image showing the four eras as a strip from 2099 to 1350.

## Development plan

**Eight milestones, about 37–55 focused days: storyboard and grey-box prototype first, a simple live page with the resume by milestone 2, then one act and its incoming transition per milestone.** At three focused days a week that is roughly 3–4 months for the full descent; the live static page covers job applications meanwhile.

&#91;embedded content: roadmap · 8 milestones, 6 gates\]

Rows read left to right; each diamond is a gate that must pass before the next milestone starts.

Working with a coding agent: hand it one milestone at a time with this spec, the storyboard frames for that milestone and its checklist. The storyboard (M0) and the content are yours.

### M0 · Content and storyboard (4–6 days)

Write the content records (including the Act I greeting and Act IV philosophy), finish the claims audit, then draw the \~30 frames on the template and tune the scroll map.

- [ ] Every content record exists and validates.
- [ ] All frames drawn, each with scroll position, motion notes and its reduced-motion version.
- [ ] Optional animatic watched end to end; pacing notes folded into the scroll map.

### M1 · Grey-box prototype (4–6 days)

Repository, Astro, CI, content schemas; the scroll engine with grey boxes for every scene at its real vh range; rest points, keyboard paging, deep links; a placeholder gauge; the reduced-motion swap; on-screen scroll markers.

- [ ] The whole descent can be scrolled with labelled boxes, forwards and backwards.
- [ ] Pacing feels right; any change goes back into the scroll map.
- [ ] **Gate: storyboard proven.** No art before this passes.

### M2 · Static page, resume and Act I (4–6 days)

The static mobile page (shown to everyone until the descent is ready), `/resume` with PDF and JSON, deployment to cccy.im, then Act I · 2099 in full.

- [ ] Static page and resume live; the link goes into applications.
- [ ] Act I at 60 fps on the reference laptop and readable at its rest points.

### M3 · Transition A and Act II · 1999 (7–10 days)

Shatter transition, the grid horizon, cartridge rack, project windows, case-study pages and the CLI.

### M4 · Transition B and Act III · 1888 (6–9 days)

Power-loss transition, engine room, valves and gear trains (with the involute gear generator), gauges, the architecture plate.

### M5 · Transition C and Act IV · 1350 (6–9 days)

Rust-to-gold transition, constellations, the philosophy parchment, the transmutation-circle form and its Worker with Turnstile.

**Gate for each of M3–M5:**

- [ ] Matches its storyboard frames (or the frames were updated on purpose).
- [ ] 60 fps scrubbing forwards and backwards; scene stays within its size budget.
- [ ] Readable at every rest point; keyboard and reduced-motion versions complete.
- [ ] No flashing above three per second.

### Hi-fi art pass (required, scheduled later)

**Everything built so far is lo-fi on purpose: vector shapes, CSS gradients and a 2D canvas, good enough to prove the motion and the pacing. Each entity must later be replaced with real textures and, wherever it is possible within the budgets, a 3D render.** Decided 5 Nov 2026; the timing is still to be set.

- **Keep the lo-fi version as the fallback.** It stays for reduced motion, devices without WebGL and slow connections, so nothing is lost where a render is not possible.
- **Same budgets.** 60 fps on the reference laptop, at most 400 KB before Act I is interactive and 600 KB per later scene, heavy assets loaded one scene ahead, one shared WebGL context.
- **Choose per entity:** a pre-rendered image sequence or video where the motion is fixed (scrubbed frames), real-time WebGL (three.js or OGL) where it must react to the cursor or the scroll.
- **The WebGL decision is reopened** for this pass (see Decisions).
- **Each milestone adds its entities to the register below** as it builds them.

| Entity | Where | Lo-fi now | Hi-fi target |
| --- | --- | --- | --- |
| Palms holding the light | Prologue (P1–P2) | SVG outline, radial-gradient light clipped to the palms | 3D-rendered hands with real skin texture, lit only by the light |
| The light and its halo | Prologue, I-1 | Layered radial gradients | Real bloom and volumetric glow |
| Particle surge | Prologue (P2) | 2D canvas streaks | Textured, depth-sorted particles in the shared WebGL context |
| Constellation loading screen | P3–P4 | SVG stars and line paths | Textured star field with depth and glow; the sign forming in 3D |
| Ambient light and cursor glow | Act I (I-1 to I-3) | CSS radial gradients | Real light falloff across the glass |
| Glass identity cards | Act I (I-3) | Backdrop blur and a gradient edge | Real frosted-glass texture with refraction and iridescent edge light |
| HUD ring | Act I | SVG strokes | Rendered holographic ring |
| Decay artefacts and scanlines | Act I (I-4) | SVG squares and a CSS gradient | Textured pixel noise and CRT scanlines |
| Glass shatter | Transition A (A-1, A-2) | A painted stand-in for Act I's last frame on a 2D canvas; straight Voronoi cracks; flat shards | A real snapshot of Act I broken into thick glass shards with refraction, edge highlights and jagged cracks |
| Phosphor dots | Transition A (A-2) | CSS radial-gradient triads | Rendered RGB phosphor mask with bloom |
| CRT bulge and scanline | Transition A (A-3), Act II | Rounded black surround, vignette and CSS scanlines | Real barrel distortion of the picture (shader), glass reflection, rolling scanline glow |
| Grid horizon and data highways | Transition A (A-3), Act II (II-1) | A flat CSS floor in perspective with gradient lines and packets | Rendered neon grid with glow, a horizon sun or skyline, light streaks along the highways |
| Cartridge rack | Act II (II-1, II-2) | CSS blocks with an amber label | 3D-rendered cartridges with plastic texture, printed labels and an insert animation into the deck |
| Bevelled windows | Act II (II-2 to II-5) | CSS bevels, a checkerboard dither border | Pixel-accurate 1999 window chrome as bitmaps, with true dithering |
| Console glow and flicker | Act II (II-4, II-5) | CSS text-shadow and an overlay | Phosphor persistence and bloom on the terminal text |

### M6 · Continuity and performance (4–6 days)

The timeline gauge's four skins and its morphs, preloading and unloading, a full-descent performance trace, the colophon and credits.

- [ ] A full descent records no frame over 33 ms on the reference laptop.
- [ ] Every third-party asset is credited with its licence.

### M7 · QA and launch (2–3 days)

Cross-browser pass, screen-reader and keyboard pass, final proofreading, then the descent replaces the static page on desktop.

- [ ] **Gate: full launch.** Every item in the launch checklist is ticked.

## Testing and launch checklist

**Automated checks run on every push; a short manual pass runs before each era goes live and once more before launch.**

### Automated, on every push

| Check | Tool | Fails the build when |
| --- | --- | --- |
| Content schema | Astro content collections | A field is missing, too long or the wrong type |
| Types and lint | `astro check`, ESLint, Stylelint | Any error |
| Unit tests | Vitest | Era state, lexicon completeness or URL parsing breaks |
| End-to-end | Playwright on Chromium, Firefox and WebKit | Rest points, keyboard paging, deep links, the gauge, the CLI, the contact form or the resume download fail |
| Visual snapshots | Playwright screenshots at every rest point (1280 and 1920 px) and of the static page (360 px) | A visual change has not been reviewed |
| Content parity | Playwright | A featured record is missing from the descent, the static page or the resume |
| Accessibility | axe-core at every rest point, in normal and reduced-motion modes | Any violation |
| Contrast | `check-contrast.ts` | Text below 4.5:1 or an interface part below 3:1 |
| Performance | Lighthouse CI and size checks | Any budget is exceeded |
| Links | lychee | A link is broken |
| PDF | `pdfinfo`, `pdffonts`, `pdftotext` | More than one page, fonts not embedded, headings out of order |

### Manual, before each era and before launch

- Real phones: an iPhone with Safari and an Android phone with Chrome.
- Screen readers: NVDA with Firefox on Windows, VoiceOver on iPhone.
- A keyboard-only run through every era.
- Reduced motion on, 200% zoom, and a throttled slow-4G connection.
- Print preview of a case study in each era.
- Read every sentence aloud once; it catches typos the eye skips.

### Launch checklist

- [ ] cccy.im serves over HTTPS and `www` redirects to it.
- [ ] The 404 page works, and phones get the static page.
- [ ] A test email to your domain address reaches your inbox.
- [ ] Web Analytics records a visit.
- [ ] The preview card looks right in LinkedIn's Post Inspector and in a messaging app.
- [ ] A test message through the contact portal arrives, and Turnstile blocks a scripted submit.
- [ ] The sitemap is submitted to Google Search Console.
- [ ] `resume.pdf` downloads with your name in the filename, and the private PDF is nowhere on the site.
- [ ] The repository is public (if you choose), its README explains how to update content, and the secrets scan is clean.
- [ ] The link is on LinkedIn, your GitHub profile README, your email signature and the PDF itself.
- [ ] A launch post is written, with a short screen recording of the full descent from 2099 to 1350.

## Risks and mitigations

**The biggest risk is still scope: three transitions and four hand-built worlds is a lot of animation for one person.** The storyboard gate, the grey-box prototype and the early static page are the main defences.

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Scope: the descent never finishes | High | High | Storyboard and prototype gates; one act per milestone; static page live from M2; each transition has a simpler CSS/SVG version to fall back on |
| Recruiters open the link on a phone and see only the static page | High | High | Make the static page genuinely good, with a short screen recording of the descent embedded; note that the full experience is on desktop |
| Frame drops on ordinary laptops | High | Medium | Reference-laptop testing every milestone; one WebGL context; unload scenes; prefer transforms and opacity |
| Content buried in effects; visitors leave before Act II | Medium | High | Rest points where everything is static and readable; skip-to-resume link; projects reachable from the gauge |
| Scroll-jacking feels sluggish or traps the user | Medium | Medium | Native scroll by default; no forced snapping; scrolling up always works; tested with trackpad, wheel and keyboard |
| Accessibility gaps in heavy scenes | Medium | Medium | Reduced-motion mode as a full version; real DOM text behind every scene; axe at every rest point |
| Contact form abuse | Low | High | Turnstile, server-side validation, rate limit, no storage |
| Asset licensing | Medium | Low | Original art; OFL or Apache fonts; MIT or similar libraries; a licence register |

## Decisions

**All v2 choices are settled (3 Nov 2026); the loading-screen style and the prologue details were settled in the storyboard on 4 Nov 2026.**

| Topic | Decision |
| --- | --- |
| Display name | **ccy** on the site (full name Chong Chi Yang on `/resume` and the PDF); online handles cccy and Axious |
| Landing | Time-machine prologue: a light held in cupped palms; hold to skip eras (1.5 s per era), scroll to descend |
| Loading screen | Constellation shift, always at least 5 s, with a quote for each destination era |
| Mobile | Static page for v1; the time-machine mobile version stays a later idea |
| Storyboard tool | Figma |
| Act III valves | Machine Learning, LLM Inference, Apps and Web, Infrastructure; revisit during development |
| Act II projects | Research paper, quantization benchmark, Recovery Companion, this site |
| CLI | Free typing plus suggested-command chips |
| Contact | Form in the transmutation circle plus links, through a Worker with Turnstile |
| Smooth scroll | Native scrolling for now |
| Visual fidelity | Lo-fi first (vector, CSS, 2D canvas); a later art pass replaces existing entities with real textures and 3D renders where possible, keeping the lo-fi art as the fallback (5 Nov 2026) |
| WebGL | Only for the shatter transition and particles, until the hi-fi art pass decides where 3D renders need it |
| Collaborators | Not named on the site; project windows link to the existing repository that credits both supervisors |

- [x] **Loading-screen style:** constellation shift (decided 4 Nov 2026 in the storyboard).

## Parked for later

**Music and a handful of extras wait until the full descent is live; the scene registry leaves room for them.**

### Background music

- Each era's registry entry has an `audio` slot, empty in v1.
- Muted by default, with one sound toggle on the dial; the choice is remembered.
- A track loads only after the visitor turns sound on: a seamless 30–90 s loop of about 1 MB (OGG or MP3).
- Switching eras crossfades the tracks (a Web Audio gain node per track, about 800 ms).
- Sources, as discussed earlier: make the 1999 chiptune yourself in BeepBox and the Flow ambient track in LMMS or BandLab; license the Magical and Steampunk tracks (CC0 from OpenGameArt, or CC BY from Incompetech with credit). Every track goes into the licence register.

### Other extras

- Per-era interface sounds (quill scratch, valve hiss, click, soft chime), under the same rules as music.
- A real visitor counter and guestbook for 1999, on a Worker with D1 or KV. A guestbook needs moderation.
- Lab notes: short MDX write-ups of experiments.
- Bahasa Melayu and Chinese versions.
- A hidden fifth era (a green-on-black terminal) unlocked by an easter egg.
- An aggregate "which era do visitors choose" chart from cookie-free analytics events.

### Asset and licence register

Start this table in M1 and keep it current; the colophon page is generated from it. Confirm each licence on the font's Google Fonts page when you download it, and keep licence files next to self-hosted fonts.

| Asset | Era | Source | Licence | Credit or notice |
| --- | --- | --- | --- | --- |
| Cinzel, EB Garamond, UnifrakturMaguntia | Act IV · 1350 | Google Fonts | SIL OFL 1.1 | Keep the licence file |
| Playfair Display SC, Old Standard TT | Act III · 1888 | Google Fonts | SIL OFL 1.1 | Keep the licence file |
| Special Elite | Act III · 1888 | Google Fonts | Apache 2.0 | Keep the licence file |
| Pixelify Sans, VT323 | Act II · 1999 | Google Fonts | SIL OFL 1.1 | Keep the licence file |
| Inter, Space Grotesk, JetBrains Mono | Act I · 2099 | Google Fonts | SIL OFL 1.1 | Keep the licence file |
| GSAP and ScrollTrigger | All | npm | GSAP's own standard licence (free, commercial use included) | Re-read the licence when installing |
| Sprites, icons, ornaments, gears | All | Original | Yours | — |

### Sources

- [Cloudflare acquires Astro](https://secure.businesswire.com/news/home/20260116386991/en/Cloudflare-Acquires-Astro-to-Accelerate-the-Future-of-High-Performance-Web-Development), Business Wire, 16 Jan 2026
- [Cloudflare Pages vs Workers: which should you choose?](https://flaviocopes.com/cloudflare-pages-vs-workers/), Flavio Copes
- [View Transitions](https://developer.chrome.com/docs/web-platform/view-transitions), Chrome for Developers
- [Scroll-driven animations video course and support table](https://developer.chrome.com/blog/scroll-driven-animations-video-course), Chrome for Developers
- [JSON Resume schema](https://jsonresume.org/schema)
- [Webflow makes GSAP 100% free](https://webflow.com/blog/gsap-becomes-free), Webflow blog
