import { addBeatFades, sceneTimeline } from '../beats';
import { formatYear } from '../registry';
import type { SceneContext, SceneModule } from '../types';
import { CRACK_TO, crackDrawn, crackReach, shardMap, shardPose, type ShardMap } from './shards';
import type { Pt } from './voronoi';

/** Positions within the transition, in vh (storyboard A-1 to A-3). */
const PHOSPHOR_FROM = 28; // A-2: phosphor dots glow up behind the falling glass…
const PHOSPHOR_TO = 58;
const SCAN_FROM = 56; // a green scanline rolls down the screen
const SCAN_TO = 96;
const CRT_FROM = 70; // A-3: the screen bulges into CRT curvature…
const CRT_TO = 92;
const GRID_FROM = 78; // …and the grid horizon fades in, ready for Act II
const GRID_TO = 100;

/** Where Act I's HUD ring sits (its centre) when the page cannot measure it. */
const HUD_FALLBACK = { x: 70, y: 66 };

/** Act I as it looks at its last frame, painted once: the glass that is about to break. */
function paintGlass(ctx: CanvasRenderingContext2D, w: number, h: number, hud: DOMRect | null) {
  ctx.fillStyle = '#07090d';
  ctx.fillRect(0, 0, w, h);
  const glow = (x: number, y: number, rx: number, ry: number, colour: string) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(rx, ry);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, colour);
    g.addColorStop(0.7, 'rgb(0 0 0 / 0%)');
    ctx.fillStyle = g;
    ctx.fillRect(-1, -1, 2, 2);
    ctx.restore();
  };
  glow(w * 0.5, h * 0.58, w * 0.55, h * 0.5, 'rgb(159 231 245 / 9%)');
  glow(w * 0.28, h * 0.3, w * 0.35, h * 0.3, 'rgb(185 166 245 / 5%)');
  // Act I's decay: faint scanlines already bleeding into the glass.
  ctx.fillStyle = 'rgb(255 255 255 / 2.5%)';
  for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);

  // The HUD ring, with the gap the decay opened, and its year.
  const box = hud && hud.width > 0 ? hud : null;
  const cx = box ? box.left + box.width / 2 : HUD_FALLBACK.x;
  const cy = box ? box.top + box.height / 2 : HUD_FALLBACK.y;
  const r = ((box?.width ?? 76) / 2) * (28 / 32);
  ctx.strokeStyle = 'rgb(154 163 181 / 90%)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.88);
  ctx.stroke();
  ctx.fillStyle = '#eceff5';
  ctx.font = "10.5px 'JetBrains Mono Variable', ui-monospace, monospace";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(formatYear(150), cx, cy);
}

/**
 * Transition A · Shatter (2099 → 1999). Act I's glass cracks from the HUD ring along Voronoi
 * seams, breaks into shards that fall and spin away, and behind it RGB phosphor dots glow up;
 * a green scanline rolls down, the screen bulges into a CRT and the grid horizon fades in.
 * The glass is a 2D canvas redrawn from the scroll position; everything else is CSS.
 */
function shatter(): SceneModule {
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let glass: HTMLCanvasElement | null = null; // the painted Act I frame, at canvas resolution
  let map: ShardMap | null = null;
  let size = { w: 0, h: 0, dpr: 1 };
  let local = -1;
  let stale = true;
  const onResize = () => {
    stale = true;
    if (local >= 0) draw(local);
  };

  /** Measures the screen and the HUD ring, then paints the glass and maps its shards. */
  function prepare() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = window.innerWidth;
    const h = window.innerHeight;
    size = { w, h, dpr };
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    glass ??= document.createElement('canvas');
    glass.width = canvas.width;
    glass.height = canvas.height;
    const g = glass.getContext('2d')!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const hud = document.querySelector('[data-a1-hud]')?.getBoundingClientRect() ?? null;
    paintGlass(g, w, h, hud);
    const hx = hud && hud.width > 0 ? hud.left + hud.width / 2 : HUD_FALLBACK.x;
    const hy = hud && hud.height > 0 ? hud.top + hud.height / 2 : HUD_FALLBACK.y;
    const impact: Pt = [hx / w, hy / h];
    map = shardMap(impact);
    stale = false;
  }

  function draw(t: number) {
    if (!canvas || !ctx) return;
    if (stale) prepare();
    if (!map || !glass) return;
    const { w, h, dpr } = size;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const spread = crackReach(t, map.reach);
    const crackAlpha = t < CRACK_TO ? 0.85 : 0.6;
    const line = (a: Pt, b: Pt) => {
      ctx!.moveTo(a[0] * w, a[1] * h);
      ctx!.lineTo(b[0] * w, b[1] * h);
    };

    for (const shard of map.shards) {
      const pose = shardPose(shard, t);
      if (pose.alpha <= 0) continue;
      const [cx, cy] = [shard.centre[0] * w, shard.centre[1] * h];
      ctx.save();
      ctx.globalAlpha = pose.alpha;
      ctx.translate(cx + pose.dx * w, cy + pose.dy * h);
      ctx.rotate(pose.rotate);
      ctx.scale(pose.scale, pose.scale);
      ctx.translate(-cx, -cy);
      ctx.beginPath();
      shard.poly.forEach(([x, y], i) =>
        i ? ctx!.lineTo(x * w, y * h) : ctx!.moveTo(x * w, y * h),
      );
      ctx.closePath();
      ctx.save();
      ctx.clip();
      ctx.drawImage(glass, 0, 0, w, h);
      // Once loose, each piece catches the light at its own angle.
      if (pose.fallen > 0) {
        ctx.fillStyle = `rgb(236 239 245 / ${(0.03 + shard.sheen * 0.09) * Math.min(1, pose.fallen * 4)})`;
        ctx.fill();
      }
      ctx.restore();
      if (pose.fallen > 0) {
        ctx.strokeStyle = `rgb(236 239 245 / ${0.45 * pose.alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    }

    // A-1: hairline cracks, each drawn outward from its end nearer the impact.
    if (t < CRACK_TO + 6) {
      ctx.save();
      ctx.globalAlpha = t < CRACK_TO ? 1 : 1 - (t - CRACK_TO) / 6;
      ctx.beginPath();
      for (const crack of map.cracks) {
        const part = crackDrawn(crack, spread);
        if (part <= 0) continue;
        const end: Pt = [
          crack.a[0] + (crack.b[0] - crack.a[0]) * part,
          crack.a[1] + (crack.b[1] - crack.a[1]) * part,
        ];
        line(crack.a, end);
      }
      ctx.strokeStyle = `rgb(236 239 245 / ${crackAlpha})`;
      ctx.lineWidth = 1;
      ctx.shadowColor = 'rgb(159 231 245 / 60%)';
      ctx.shadowBlur = 4;
      ctx.stroke();
      ctx.restore();
    }
  }

  return {
    mount({ layer }: SceneContext) {
      canvas = layer.querySelector<HTMLCanvasElement>('[data-ts-glass]');
      ctx = canvas?.getContext('2d') ?? null;
      stale = true;
      window.addEventListener('resize', onResize, { passive: true });
    },

    timeline(context: SceneContext) {
      const { layer, scene } = context;
      const q = (selector: string) => layer.querySelector<HTMLElement>(selector);
      const length = scene.to - scene.from;
      const tl = sceneTimeline(context);
      addBeatFades(tl, context);

      // A-2: phosphor dots glow up behind the glass, then fade as the CRT picture forms.
      tl.fromTo(
        q('[data-ts-phosphor]'),
        { opacity: 0 },
        { opacity: 1, duration: PHOSPHOR_TO - PHOSPHOR_FROM },
        PHOSPHOR_FROM,
      );
      tl.to(q('[data-ts-phosphor]'), { opacity: 0, duration: GRID_TO - CRT_FROM }, CRT_FROM);
      tl.fromTo(
        q('[data-ts-scanline]'),
        { yPercent: -100, autoAlpha: 1 },
        { yPercent: 520, duration: SCAN_TO - SCAN_FROM },
        SCAN_FROM,
      );
      tl.set(q('[data-ts-scanline]'), { autoAlpha: 0 }, SCAN_TO);

      // A-3: the screen bulges into CRT curvature and settles; the grid horizon fades in.
      tl.fromTo(
        q('[data-ts-crt]'),
        { opacity: 0, scale: 1.14 },
        { opacity: 1, scale: 1, duration: CRT_TO - CRT_FROM, ease: 'back.out(1.6)' },
        CRT_FROM,
      );
      tl.fromTo(
        q('[data-grid]'),
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: GRID_TO - GRID_FROM, ease: 'power2.out' },
        GRID_FROM,
      );

      // The glass redraws from the scroll position on every render, both directions.
      tl.eventCallback('onUpdate', () => {
        const t = tl.time();
        if (t === local) return;
        local = t;
        if (t < length) draw(t);
      });
      return tl;
    },

    unmount() {
      window.removeEventListener('resize', onResize);
      canvas = null;
      ctx = null;
      glass = null;
      map = null;
    },
  };
}

export default shatter();
