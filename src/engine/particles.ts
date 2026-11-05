/**
 * The prologue's particle surge (storyboard P2). While the light charges, particles stream in
 * from the screen edges and accelerate toward it, denser as the charge builds. Their colour is
 * the target era's and crossfades (300 ms) at each step. One small 2D canvas, at most 200
 * particles, and nothing runs while the light is idle.
 */
export interface Particles {
  start(): void;
  setColor(hex: string): void;
  setLevel(level: number): void;
  /** Stop spawning; what is left drifts back out and fades. */
  release(): void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

const MAX = 200;
const COLOUR_FADE_MS = 300;

const rgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export function createParticles(
  canvas: HTMLCanvasElement,
  target: () => { x: number; y: number },
): Particles {
  const ctx = canvas.getContext('2d');
  let particles: Particle[] = [];
  let active = false;
  let frame = 0;
  let last = 0;
  let level = 0;
  let owed = 0;
  let width = 0;
  let height = 0;
  let centre = { x: 0, y: 0 };
  let colourFrom = rgb('#9fe7f5');
  let colourTo = colourFrom;
  let toHex = '#9fe7f5';
  let colourAt = 0;

  function measure() {
    const box = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    width = box.width;
    height = box.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    const t = target();
    centre = { x: t.x - box.left, y: t.y - box.top };
  }

  function colourNow(now: number) {
    const k = Math.min(1, (now - colourAt) / COLOUR_FADE_MS);
    return colourFrom.map((c, i) => Math.round(c + (colourTo[i]! - c) * k));
  }

  function spawn(): Particle {
    const side = Math.floor(Math.random() * 4);
    const along = Math.random();
    const x = side === 0 ? 0 : side === 1 ? width : along * width;
    const y = side === 2 ? 0 : side === 3 ? height : along * height;
    return { x, y, vx: 0, vy: 0, life: 1 };
  }

  function step(now: number) {
    if (!ctx) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (active) {
      owed += dt * (90 + level * 80);
      while (owed >= 1 && particles.length < MAX) {
        particles.push(spawn());
        owed -= 1;
      }
    }
    ctx.clearRect(0, 0, width, height);
    const [r, g, b] = colourNow(now);
    ctx.lineCap = 'round';
    ctx.lineWidth = 1.6;
    for (const p of particles) {
      const dx = centre.x - p.x;
      const dy = centre.y - p.y;
      const d = Math.hypot(dx, dy) || 1;
      const pull = active ? 900 + level * 550 : -500;
      p.vx = (p.vx + (dx / d) * pull * dt) * 0.985;
      p.vy = (p.vy + (dy / d) * pull * dt) * 0.985;
      const fromX = p.x;
      const fromY = p.y;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (active && d < 22) p.life = 0; // absorbed by the light
      if (!active) p.life -= dt * 1.7;
      const alpha = Math.max(0, Math.min(1, p.life)) * Math.min(1, 0.3 + 120 / d);
      ctx.strokeStyle = `rgb(${r} ${g} ${b} / ${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(p.x + 0.01, p.y);
      ctx.stroke();
    }
    particles = particles.filter((p) => p.life > 0);
    if (active || particles.length > 0) {
      frame = requestAnimationFrame(step);
    } else {
      ctx.clearRect(0, 0, width, height);
      frame = 0;
    }
  }

  return {
    start() {
      measure();
      active = true;
      level = 0;
      if (!frame) {
        last = performance.now();
        frame = requestAnimationFrame(step);
      }
    },
    setColor(hex) {
      if (hex === toHex) return;
      const now = performance.now();
      colourFrom = colourNow(now) as [number, number, number];
      colourTo = rgb(hex);
      toHex = hex;
      colourAt = now;
    },
    setLevel(next) {
      level = next;
    },
    release() {
      active = false;
    },
  };
}
