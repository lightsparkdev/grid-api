'use client';

import { useEffect, useRef } from 'react';

/**
 * Animated dot grid with a ripple-out effect, ported from grid-visualizer's
 * DotGrid (Canvas 2D). Same wave math/constants — a radial wave packet that
 * displaces, grows, and darkens dots behind an expanding wavefront, fading over
 * time — adapted for the phone backdrop (screen-space, tap to ripple; the
 * pan/zoom transform and intro-reveal from the original aren't needed here).
 *
 * Rendered on its own canvas so the glass shader can later sample it as a
 * texture (the article's pattern for refracting animated, non-DOM content).
 */

const DOT_SPACING = 25;
const DOT_SIZE = 3.125;
const DOT_ORIGIN = 20.9375;
const DOT_COLOR = '#DEDED9';

const WAVE_SPEED = 1400; // px/s (the original's "tab" tap speed)
const WAVELENGTH = 800;
const AMPLITUDE = 18;
const RAMP_DIST = 120;
const TIME_DECAY = 0.25;

const DOT_BASE = [222, 222, 217] as const;
const DOT_DARK = [160, 160, 152] as const;
const BLEND_COUNT = 16;
const BLENDED: string[] = [];
for (let i = 0; i <= BLEND_COUNT; i++) {
  const t = i / BLEND_COUNT;
  BLENDED.push(
    `rgb(${Math.round(DOT_BASE[0] + (DOT_DARK[0] - DOT_BASE[0]) * t)},${Math.round(
      DOT_BASE[1] + (DOT_DARK[1] - DOT_BASE[1]) * t,
    )},${Math.round(DOT_BASE[2] + (DOT_DARK[2] - DOT_BASE[2]) * t)})`,
  );
}

export interface DotGridProps {
  className?: string;
  /** Background fill (kept in the canvas so it can be sampled as a texture). */
  bg?: string;
  /** Fire a ripple from the pointer on press. */
  rippleOnClick?: boolean;
}

export function DotGrid({ className, bg = '#F4F4F3', rippleOnClick = true }: DotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripple = useRef<{ x: number; y: number; t0: number } | null>(null);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    const k = (2 * Math.PI) / WAVELENGTH;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let animating = false;

    const drawDots = (rp: { x: number; y: number; t0: number } | null, now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const nMax = Math.ceil((w - DOT_ORIGIN) / DOT_SPACING) + 1;
      const mMax = Math.ceil((h - DOT_ORIGIN) / DOT_SPACING) + 1;

      let tSec = 0;
      let timeFade = 0;
      let wavefront = 0;
      if (rp) {
        tSec = (now - rp.t0) / 1000;
        timeFade = Math.exp(-TIME_DECAY * tSec);
        wavefront = WAVE_SPEED * tSec;
      }

      let lastFill = '';
      ctx.fillStyle = DOT_COLOR;
      for (let n = -1; n <= nMax; n++) {
        const baseX = DOT_ORIGIN + n * DOT_SPACING;
        for (let m = -1; m <= mMax; m++) {
          const baseY = DOT_ORIGIN + m * DOT_SPACING;
          const midX = baseX + DOT_SIZE / 2;
          const midY = baseY + DOT_SIZE / 2;

          let dx = 0;
          let dy = 0;
          let sz = DOT_SIZE;
          let fill = DOT_COLOR;

          if (rp && timeFade > 0.001) {
            const distX = midX - rp.x;
            const distY = midY - rp.y;
            const d = Math.sqrt(distX * distX + distY * distY);
            if (d > 0 && d < wavefront) {
              const behind = wavefront - d;
              const ramp = Math.min(1, d / RAMP_DIST);
              const trail = Math.exp(-(behind * behind) / (WAVELENGTH * WAVELENGTH * 0.3));
              const edge = Math.min(1, behind / RAMP_DIST);
              const wave = Math.sin(k * d - WAVE_SPEED * k * tSec);
              const strength = wave * ramp * edge * trail * timeFade;
              const height = AMPLITUDE * strength;
              dx = (distX / d) * height;
              dy = (distY / d) * height;
              sz = DOT_SIZE * (1 + Math.abs(strength) * 0.4);
              fill = BLENDED[Math.round(Math.abs(strength) * 0.3 * BLEND_COUNT)];
            }
          }

          if (fill !== lastFill) {
            ctx.fillStyle = fill;
            lastFill = fill;
          }
          ctx.fillRect(midX + dx - sz / 2, midY + dy - sz / 2, sz, sz);
        }
      }
    };

    const frame = (now: number) => {
      const rp = ripple.current;
      if (!rp) {
        animating = false;
        return;
      }
      const tSec = (now - rp.t0) / 1000;
      const timeFade = Math.exp(-TIME_DECAY * tSec);
      const wavefront = WAVE_SPEED * tSec;
      const maxDist =
        Math.max(
          Math.hypot(rp.x, rp.y),
          Math.hypot(w - rp.x, rp.y),
          Math.hypot(rp.x, h - rp.y),
          Math.hypot(w - rp.x, h - rp.y),
        ) +
        RAMP_DIST * 2 +
        100;

      drawDots(rp, now);

      if (wavefront >= maxDist && timeFade < 0.02) {
        ripple.current = null;
        drawDots(null, now);
        animating = false;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const startAnim = () => {
      if (animating) return;
      animating = true;
      raf = requestAnimationFrame(frame);
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cvs.clientWidth;
      h = cvs.clientHeight;
      cvs.width = Math.max(1, Math.round(w * dpr));
      cvs.height = Math.max(1, Math.round(h * dpr));
      if (!animating) drawDots(ripple.current, performance.now());
    };

    const onDown = (e: PointerEvent) => {
      if (!rippleOnClick) return;
      const r = cvs.getBoundingClientRect();
      ripple.current = { x: e.clientX - r.left, y: e.clientY - r.top, t0: performance.now() };
      startAnim();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cvs);
    cvs.addEventListener('pointerdown', onDown);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      cvs.removeEventListener('pointerdown', onDown);
    };
  }, [bg, rippleOnClick]);

  return <canvas ref={canvasRef} className={className} style={{ display: 'block', width: '100%', height: '100%' }} />;
}

export default DotGrid;
