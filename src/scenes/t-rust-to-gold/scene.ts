import { PIPES, PIPE_BOX } from '../act-1888/pipes';
import { FLYWHEEL_TRAIN, trainRotations } from '../act-1888/train';
import { addBeatFades, sceneTimeline } from '../beats';
import type { SceneContext, SceneModule } from '../types';
import { noiseField, pixel, stageWeights, type RGB, type Weights } from './material';

/** Positions within the transition, in map vh (storyboard C-1 to C-3, and the spec's stage 4). */
const GEARS_OUT = [70, 86] as const; // the flywheel's teeth fade…
const RINGS_IN = [74, 96] as const; // …as its rim unrolls into astrolabe rings
const STARS_IN = [88, 100] as const; // the first stars ignite over the burnt-away wall

/** The wall's canvas: 400 × 225, the 1600 × 900 pipe box at a quarter scale. */
const W = 400;
const H = 225;
const K = W / PIPE_BOX.width;
const PLATE = { w: 320 * K, h: 240 * K }; // Act III's plate seams (act-1888.css)

/** Act III's wall as this canvas sees it: soot, plate seams, rivets and the copper pipes. */
function paintWall(ctx: CanvasRenderingContext2D) {
  const sky = ctx.createLinearGradient(0, 0, W * 0.4, H);
  sky.addColorStop(0, '#241a14');
  sky.addColorStop(0.6, '#1c1410');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#120c09';
  for (let x = 0; x < W; x += PLATE.w) ctx.fillRect(Math.round(x), 0, 1, H);
  for (let y = 0; y < H; y += PLATE.h) ctx.fillRect(0, Math.round(y), W, 1);
  ctx.lineJoin = 'round';
  for (const pipe of PIPES) {
    ctx.beginPath();
    pipe.pipe.forEach(([x, y], i) => (i ? ctx.lineTo(x * K, y * K) : ctx.moveTo(x * K, y * K)));
    ctx.strokeStyle = '#c2703d';
    ctx.lineWidth = Math.max(1.5, pipe.bore * K);
    ctx.stroke();
  }
}

/**
 * Transition C · Rust to gold (1888 → 1350). The engine wall rusts outward from its rivets,
 * glows amber as if heated, cools into parchment with gold-leaf seams, then burns away along a
 * gold edge to the night sky. The flywheel's teeth fall away and its rim settles into the
 * astrolabe's rings while the first stars ignite. Everything is a function of the scroll.
 */
function rustToGold(): SceneModule {
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let base: Uint8ClampedArray | null = null;
  let noise: Float32Array | null = null;
  let rivet: Float32Array | null = null;
  let seam: Uint8Array | null = null;
  let out: ImageData | null = null;
  let lastKey = '';

  function prepare() {
    if (!canvas || base) return;
    ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    paintWall(ctx);
    base = ctx.getImageData(0, 0, W, H).data.slice();
    out = ctx.createImageData(W, H);
    noise = noiseField(W, H);
    rivet = new Float32Array(W * H);
    seam = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const px = x % PLATE.w;
        const py = y % PLATE.h;
        const dx = Math.min(px, PLATE.w - px);
        const dy = Math.min(py, PLATE.h - py);
        rivet[y * W + x] = Math.max(0, 1 - Math.hypot(dx, dy) / 28);
        seam[y * W + x] = dx < 1 || dy < 1 ? 1 : 0;
      }
    }
  }

  function draw(w: Weights) {
    prepare();
    if (!ctx || !base || !noise || !rivet || !seam || !out) return;
    const key = `${w.rust.toFixed(3)}|${w.glow.toFixed(3)}|${w.parchment.toFixed(3)}|${w.burn.toFixed(3)}`;
    if (key === lastKey) return;
    lastKey = key;
    const data = out.data;
    for (let i = 0, p = 0; i < noise.length; i++, p += 4) {
      const c = pixel(
        [base[p]!, base[p + 1]!, base[p + 2]!] as RGB,
        noise[i]!,
        rivet[i]!,
        seam[i] === 1,
        w,
      );
      data[p] = c[0];
      data[p + 1] = c[1];
      data[p + 2] = c[2];
      data[p + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  }

  return {
    mount({ layer }: SceneContext) {
      canvas = layer.querySelector<HTMLCanvasElement>('[data-tc-wall]');
    },

    timeline(ctxScene: SceneContext) {
      const { layer } = ctxScene;
      const q = (selector: string) => layer.querySelector<HTMLElement>(selector);
      const tl = sceneTimeline(ctxScene);
      addBeatFades(tl, ctxScene);

      tl.fromTo(
        q('[data-tc-gears]'),
        { opacity: 1 },
        { opacity: 0, duration: GEARS_OUT[1] - GEARS_OUT[0] },
        GEARS_OUT[0],
      );
      layer.querySelectorAll<SVGCircleElement>('[data-tc-ring]').forEach((ring, i) => {
        const r = Number(ring.dataset.tcRing);
        const start = RINGS_IN[0] + i * 3;
        const length = RINGS_IN[1] - RINGS_IN[0] - 6;
        tl.fromTo(
          ring,
          { attr: { r: r * 1.0 + 30 }, opacity: 0 },
          { attr: { r }, opacity: 0.9, duration: length, ease: 'power2.out' },
          start,
        );
        tl.to(ring, { opacity: 0.35, duration: 100 - start - length }, start + length);
      });
      tl.fromTo(
        q('[data-tc-stars]'),
        { opacity: 0 },
        { opacity: 0.6, duration: STARS_IN[1] - STARS_IN[0] },
        STARS_IN[0],
      );

      // The flywheel keeps turning as its teeth fade, slower and slower.
      const gears = q('[data-tc-gears]');
      tl.eventCallback('onUpdate', () => {
        const t = tl.time();
        draw(stageWeights(t));
        const turn = 140 + t * 1.6 * (1 - t / 220);
        for (const [id, deg] of trainRotations(FLYWHEEL_TRAIN, turn)) {
          gears?.querySelector(`[data-gear="${id}"]`)?.setAttribute('transform', `rotate(${deg})`);
        }
      });
      return tl;
    },

    unmount() {
      canvas = null;
      ctx = null;
      base = null;
      noise = null;
      rivet = null;
      seam = null;
      out = null;
      lastKey = '';
    },
  };
}

export default rustToGold();
