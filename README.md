# Four Eras

ccy's portfolio: one long desktop scroll that descends from 2099 to 1350 through four
retro-futures, with the resume waiting at the bottom. The full design is in
[the spec](Four%20Eras%20Portfolio%20—%20Website%20Specification.md); the motion is drawn in the
[storyboard](https://www.figma.com/design/xIS9BkotXQYD09nHclLayh).

**Status: M1, the grey-box prototype.** Every scene is a labelled box at its real scroll range, so
the pacing can be felt before any art is made.

## Run it

Node 22.23 or newer.

```bash
npm install
npm run dev
```

Open <http://localhost:4321>. `npm run verify` runs everything CI runs: types and content schemas,
lint, formatting, unit tests and the build.

## Trying the prototype

| Control                 | What it does                                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| Scroll                  | Scrubs the descent, both ways                                                                        |
| Page Down / Space       | Next rest point (Shift+Space or Page Up: previous)                                                   |
| Home / End              | The prologue / the contact portal                                                                    |
| Hold the light          | Time machine: each 1.5 s goes one era back, through the 5 s loading screen; release sooner to cancel |
| 2–4 (in the prologue)   | Jump straight to 1999, 1888 or 1350; Esc cancels                                                     |
| Gauge links, `#works` … | Deep links: `#top`, `#works`, `#engine`, `#origin`, `#contact`                                       |
| <code>`</code>          | Show or hide the scroll markers (remembered)                                                         |
| `?mode=stacked`         | Force the stacked version (what reduced motion and phones get)                                       |

## Where things live

- `src/scenes/registry.ts`: **the scroll map.** Scenes, beats, rest points and deep links in vh.
  Tune pacing here; the engine, gauge, keyboard paging and markers all read from it.
- `src/scenes/<scene>/scene.ts`: one module per act and transition (grey boxes for now).
- `src/engine/`: the master timeline, keyboard and deep links, the gauge, the markers, the time
  machine and the stacked fallback.
- `src/content/`: the content records. `content.config.ts` holds their schemas and the spec's
  text limits; the build fails on a missing or over-long field.
- `src/components/`: the acts, the gauge and the time machine as Astro components.

## Updating content

Edit the YAML or Markdown in `src/content/` and run `npm run check`. Values still waiting for
you start with `[add …]` or `[confirm …]`; the schemas accept them so the build stays green, and
the page underlines them in orange. To list what is left:

```bash
grep -rn "\[add\|\[confirm" src/content
```
