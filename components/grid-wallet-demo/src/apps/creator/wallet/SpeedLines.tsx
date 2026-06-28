'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import styles from './SpeedLines.module.scss';

/** Tiny deterministic PRNG (seeded) so the ray field is identical every mount —
 *  a stable, reproducible burst. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard-normal sample (Box–Muller) for a bell-curve thickness — most rays
 *  cluster around the mean, only a few are thin (or thick). */
function gaussian(rnd: () => number) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rnd();
  while (v === 0) v = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

interface Ray {
  a: number; // angle (deg)
  aRad: number; // angle (rad), precomputed
  len: number; // streak length (px)
  w: number; // thickness (px)
  r0: number; // inner gap from the burst center (px)
  op: number; // intensity
  tier: number; // blur bucket
  tw: number; // twinkle period (s)
  td: number; // twinkle phase offset (s, negative to desync)
}

const RAY_COUNT = 180;
const DEAD_ZONE = 88; // clear middle (px radius) — rays start outside it
// Per-bucket blur (px), soft → very soft. No truly-sharp tier, so no crisp
// hairlines. Rays are biased toward the blurrier buckets (see buildRays).
const BLUR_STD = [1.6, 3.5, 6.5, 11, 17];
// Chromatic aberration: how far the R/G/B copies spread, as a fraction of the ray's
// distance from the burst centre (matches the old per-channel scale ±0.038 — the
// fringe grows toward the tips/edges).
const CHROMA = 0.038;
// R warm, G, B cool — additive ('lighter') so they sum to a white core with colored
// fringes, exactly like the old isolated screen/plus-lighter channels.
const RGB = { r: [255, 47, 34], g: [29, 255, 88], b: [53, 107, 255] } as const;
// Burst "hum": a slow full rotation + a gentle scale/opacity breathe.
const ROT_DEG_PER_MS = 360 / 160000; // one turn / 160s
const BREATHE_MS = 5500;
// Burst origin inside the layer: 50% across, 32% down + 72px (matches the sheet's
// reserved card slot, so the burst sits behind the card).
const ORIGIN_X = 0.5;
const ORIGIN_Y = 0.32;
const ORIGIN_Y_PX = 72;

function buildRays(seed: number): Ray[] {
  const rnd = mulberry32(seed);
  return Array.from({ length: RAY_COUNT }, () => {
    const a = rnd() * 360;
    // Dead zone in the middle (the card's space); rays start outside it.
    const r0 = DEAD_ZONE + rnd() * 110;
    // Mostly short with a few long streaks (pow biases the distribution).
    const len = 90 + Math.pow(rnd(), 1.6) * 560;
    // Thickness ~ normal(2.8, 1.4), min 1.2: most mid-weight, no ultra-thin.
    const w = clamp(2.8 + gaussian(rnd) * 1.4, 1.2, 8.5);
    const op = 0.1 + Math.pow(rnd(), 1.2) * 0.78;
    // Bias toward the blurrier buckets (pow < 1), and force thin rays to be soft —
    // so there are no thin, crisp lines.
    let tier = Math.floor(Math.pow(rnd(), 0.6) * BLUR_STD.length);
    if (w < 2) tier = Math.max(tier, 2);
    // Each ray fades 0→1→0 on its OWN cycle (~750ms, varied so periods drift), phase
    // spread across a full cycle — independent shimmer, no batches/waves.
    const tw = 0.55 + rnd() * 0.4;
    const td = -rnd() * 2;
    return { a, aRad: (a * Math.PI) / 180, len, w, r0, op, tier, tw, td };
  });
}

const rgba = (c: readonly number[], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

interface Sprite {
  canvas: HTMLCanvasElement;
  sw: number; // logical sprite width
  sh: number; // logical sprite height
  pad: number; // blur/chroma padding
  off: number; // chroma offset (px)
}

function drawColumn(
  g: CanvasRenderingContext2D,
  cx: number,
  tipY: number,
  baseY: number,
  w: number,
  color: readonly number[],
) {
  // Streak falloff along the length: faded at the base (near centre), brightest just
  // out, fading to nothing at the tip. (base = larger y, tip = smaller y.)
  const grad = g.createLinearGradient(0, baseY, 0, tipY);
  grad.addColorStop(0, rgba(color, 0.1));
  grad.addColorStop(0.22, rgba(color, 1));
  grad.addColorStop(0.62, rgba(color, 0.4));
  grad.addColorStop(1, rgba(color, 0));
  g.fillStyle = grad;
  g.beginPath();
  const x = cx - w / 2;
  if (g.roundRect) g.roundRect(x, tipY, w, baseY - tipY, w / 2);
  else g.rect(x, tipY, w, baseY - tipY);
  g.fill();
}

/** Pre-render one ray to an offscreen canvas with its blur + chroma baked in, so the
 *  draw loop only blits it (with a per-frame alpha for the twinkle). */
function buildSprite(ray: Ray): Sprite {
  const std = BLUR_STD[ray.tier];
  const off = CHROMA * (ray.r0 + ray.len / 2);
  const pad = Math.ceil(3 * std + off + 2);
  const sw = Math.ceil(ray.w + 2 * pad);
  const sh = Math.ceil(ray.len + 2 * pad + 2 * off);
  const canvas = document.createElement('canvas');
  canvas.width = sw;
  canvas.height = sh;
  const g = canvas.getContext('2d');
  if (!g) return { canvas, sw, sh, pad, off };
  g.globalCompositeOperation = 'lighter';
  g.filter = `blur(${std}px)`;
  const cx = sw / 2;
  const tipY = pad + off;
  const baseY = tipY + ray.len;
  // G centred; R pushed outward (toward tip), B inward (toward base) → radial chroma.
  drawColumn(g, cx, tipY, baseY, ray.w, RGB.g);
  drawColumn(g, cx, tipY - off, baseY - off, ray.w, RGB.r);
  drawColumn(g, cx, tipY + off, baseY + off, ray.w, RGB.b);
  return { canvas, sw, sh, pad, off };
}

const smoothstep = (x: number) => x * x * (3 - 2 * x);

/** Per-ray twinkle: opacity 0↔1, eased, on the ray's own period/phase (mirrors the
 *  old CSS `rayTwinkle` ease-in-out alternate). */
function twinkle(t: number, r: Ray): number {
  const u = (t - r.td) / r.tw;
  const tri = 1 - Math.abs((u % 2) - 1); // triangle 0→1→0, period 2
  return smoothstep(tri);
}

/**
 * Procedural radial speed-line burst — chroma-aberrated, blurred rays that shimmer,
 * drift (slow rotate) and breathe. Rendered on a single <canvas>: the blur + chroma
 * are baked into per-ray sprites ONCE, then the loop just blits them with a per-frame
 * alpha (the twinkle) + a global rotate/scale (drift/breathe). One composited layer,
 * no live SVG filters — the same look at a fraction of the cost.
 */
interface RayWithSprite extends Ray {
  sprite: Sprite;
}

// Sprites (blur + chroma baked) are expensive to build (540 offscreen canvases) but
// identical every time, so build them ONCE at module scope and reuse forever. This is
// the only heavy step; doing it lazily during the card's reveal caused a stutter, so
// `prewarmSpeedRays()` lets the sheet build them ahead of time (on idle) instead.
let spriteCache: RayWithSprite[] | null = null;
function getRaySprites(): RayWithSprite[] {
  if (!spriteCache) {
    spriteCache = buildRays(0x5eed1).map((r) => ({ ...r, sprite: buildSprite(r) }));
  }
  return spriteCache;
}

/** Pre-build the ray sprite cache off the critical path (call on idle before the
 *  sheet opens) so mounting the burst never stalls the entrance animation. */
export function prewarmSpeedRays() {
  if (typeof document === 'undefined') return;
  getRaySprites();
}

export function SpeedRays({ active = true }: { active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rays = getRaySprites();

    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    const resize = () => {
      const rect = parent.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      cx = w * ORIGIN_X;
      cy = h * ORIGIN_Y + ORIGIN_Y_PX;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    const drawFrame = (elapsedMs: number) => {
      if (w === 0 || h === 0) return;
      const t = elapsedMs / 1000;
      const rot = elapsedMs * ROT_DEG_PER_MS * (Math.PI / 180);
      const bp = (elapsedMs / BREATHE_MS) * Math.PI * 2;
      const breatheS = 1.03 - 0.03 * Math.cos(bp); // scale 1 ↔ 1.06
      const breatheA = 0.86 - 0.14 * Math.cos(bp); // opacity 0.72 ↔ 1

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.translate(cx, cy);
      ctx.scale(breatheS, breatheS);
      ctx.rotate(rot);
      ctx.globalCompositeOperation = 'lighter';

      for (const r of rays) {
        const tw = reduce ? 1 : twinkle(t, r);
        if (tw <= 0.002) continue;
        const sp = r.sprite;
        ctx.save();
        ctx.rotate(r.aRad);
        ctx.globalAlpha = r.op * tw * breatheA;
        ctx.drawImage(sp.canvas, -sp.sw / 2, -(r.r0 + r.len) - sp.pad - sp.off, sp.sw, sp.sh);
        ctx.restore();
      }
    };

    let raf = 0;
    let start = 0;
    if (reduce || !active) {
      // Static snapshot — no loop (reduced-motion, or the burst is faded out off the
      // intro). Keeps cost at zero while it's not the live, visible state.
      drawFrame(0);
    } else {
      const loop = (now: number) => {
        if (!start) start = now;
        drawFrame(now - start);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reduce, active]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden />;
}
