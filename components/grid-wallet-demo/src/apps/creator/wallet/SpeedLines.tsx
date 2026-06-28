'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import styles from './SpeedLines.module.scss';

/** Tiny deterministic PRNG (seeded) so the ray field is identical every time. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard-normal sample (Box–Muller) for a bell-curve thickness. */
function gaussian(rnd: () => number) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rnd();
  while (v === 0) v = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

interface Ray {
  a: number;
  aRad: number;
  len: number;
  w: number;
  r0: number;
  op: number;
  tier: number;
  tw: number;
  td: number;
}

const RAY_COUNT = 180;
const DEAD_ZONE = 88;
const BLUR_STD = [1.6, 3.5, 6.5, 11, 17];
const CHROMA = 0.038;
const RGB = { r: [255, 47, 34], g: [29, 255, 88], b: [53, 107, 255] } as const;
const ROT_DEG_PER_MS = 360 / 160000; // one slow turn / 160s
const BREATHE_MS = 5500;
// Burst origin in the layer: 50% across, 32% down + 72px (behind the card slot).
const ORIGIN_X = 0.5;
const ORIGIN_Y = 0.32;
const ORIGIN_Y_PX = 72;
// Build a few sprites per frame. The component is only mounted AFTER the card settles
// (CardIssuanceSheet), so this runs on calm frames and never competes with the open.
const BUILD_PER_FRAME = 8;

function buildRays(): Ray[] {
  const rnd = mulberry32(0x5eed1);
  return Array.from({ length: RAY_COUNT }, () => {
    const a = rnd() * 360;
    const r0 = DEAD_ZONE + rnd() * 110;
    const len = 90 + Math.pow(rnd(), 1.6) * 560;
    const w = clamp(2.8 + gaussian(rnd) * 1.4, 1.2, 8.5);
    const op = 0.1 + Math.pow(rnd(), 1.2) * 0.78;
    let tier = Math.floor(Math.pow(rnd(), 0.6) * BLUR_STD.length);
    if (w < 2) tier = Math.max(tier, 2);
    const tw = 0.55 + rnd() * 0.4;
    const td = -rnd() * 2;
    return { a, aRad: (a * Math.PI) / 180, len, w, r0, op, tier, tw, td };
  });
}

const rgba = (c: readonly number[], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

interface Sprite {
  canvas: HTMLCanvasElement;
  sw: number;
  sh: number;
  pad: number;
  off: number;
}

function drawColumn(
  g: CanvasRenderingContext2D,
  cx: number,
  tipY: number,
  baseY: number,
  w: number,
  color: readonly number[],
) {
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

/** Render one ray to an offscreen canvas with its blur + chroma baked in. */
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
  drawColumn(g, cx, tipY, baseY, ray.w, RGB.g);
  drawColumn(g, cx, tipY - off, baseY - off, ray.w, RGB.r);
  drawColumn(g, cx, tipY + off, baseY + off, ray.w, RGB.b);
  return { canvas, sw, sh, pad, off };
}

interface RayWithSprite extends Ray {
  sprite: Sprite | null;
}

// Built ONCE and cached at module scope (a few sprites per frame). Once built, every
// later open reuses the cache instantly.
let rayCache: RayWithSprite[] | null = null;
let builtCount = 0;
function getRays(): RayWithSprite[] {
  if (!rayCache) rayCache = buildRays().map((r) => ({ ...r, sprite: null }));
  return rayCache;
}
function buildSome(rays: RayWithSprite[], n: number) {
  let i = 0;
  while (builtCount < rays.length && i < n) {
    rays[builtCount].sprite = buildSprite(rays[builtCount]);
    builtCount += 1;
    i += 1;
  }
}

const smoothstep = (x: number) => x * x * (3 - 2 * x);

// While "speeding" (card creating) each ray twinkles this many times faster, so the
// field reads as a fast warp flicker instead of a gentle shimmer.
const SPEED_TW_MULT = 4;

function twinkle(t: number, r: Ray, factor: number): number {
  const u = ((t - r.td) * factor) / r.tw;
  const tri = 1 - Math.abs((u % 2) - 1);
  return smoothstep(tri);
}

/**
 * Procedural radial speed-line burst on a single <canvas>: blur + chroma are baked
 * into per-ray sprites (built a few per frame, cached), then the loop blits them with a
 * per-frame twinkle + slow rotate/breathe. One composited layer, no live SVG filters.
 * Mounted only after the card settles, so the build runs on calm frames.
 */
export function SpeedRays({
  active = true,
  speeding = false,
  originShift = 0,
}: {
  active?: boolean;
  speeding?: boolean;
  /** Push the burst's ORIGIN down by this many px (keeps the canvas full-bleed, so the
   *  rays still reach the top — unlike translating the whole layer). Eased in. */
  originShift?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduce = useReducedMotion();
  // Read live in the loop so toggling these doesn't restart (and jump) the burst.
  const speedingRef = useRef(speeding);
  speedingRef.current = speeding;
  const shiftRef = useRef(originShift);
  shiftRef.current = originShift;

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rays = getRays();

    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0; // base origin y; the live origin = cy + curShift (eased)
    let curShift = 0;
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
      curShift += (shiftRef.current - curShift) * 0.12; // ease origin toward target
      const t = elapsedMs / 1000;
      const rot = elapsedMs * ROT_DEG_PER_MS * (Math.PI / 180);
      const bp = (elapsedMs / BREATHE_MS) * Math.PI * 2;
      const breatheS = 1.03 - 0.03 * Math.cos(bp);
      const breatheA = 0.86 - 0.14 * Math.cos(bp);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.translate(cx, cy + curShift);
      ctx.scale(breatheS, breatheS);
      ctx.rotate(rot);
      ctx.globalCompositeOperation = 'lighter';

      const factor = speedingRef.current ? SPEED_TW_MULT : 1;
      for (const r of rays) {
        const sp = r.sprite;
        if (!sp) continue;
        const tw = reduce ? 1 : twinkle(t, r, factor);
        if (tw <= 0.002) continue;
        ctx.save();
        ctx.rotate(r.aRad);
        ctx.globalAlpha = r.op * tw * breatheA;
        ctx.drawImage(sp.canvas, -sp.sw / 2, -(r.r0 + r.len) - sp.pad - sp.off, sp.sw, sp.sh);
        ctx.restore();
      }
    };

    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      if (builtCount < rays.length) buildSome(rays, BUILD_PER_FRAME);
      drawFrame(reduce || !active ? 0 : now - start);
      const animating = active && !reduce;
      const building = builtCount < rays.length;
      if (animating || building) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reduce, active]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden />;
}
