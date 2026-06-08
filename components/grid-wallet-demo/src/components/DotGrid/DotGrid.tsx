'use client';

import { useEffect, useRef } from 'react';
import { observeTheme, readDotGridPalette } from '@/lib/dotGridColors';

/**
 * Animated dot grid with a ripple-out effect, ported from grid-visualizer's
 * DotGrid (Canvas 2D). Same wave math/constants — a radial wave packet that
 * displaces, grows, and darkens dots behind an expanding wavefront, fading over
 * time — adapted for the phone backdrop (screen-space, tap to ripple; the
 * pan/zoom transform and intro-reveal from the original aren't needed here).
 *
 * Slop-mode backdrop only — swag ships on StageGL. Keep this for screen
 * design previews, not for new visual/interaction work.
 */

// Match grid-visualizer's SVG tile: 20×20 repeat, 2.5px dot at (8.75, 8.75), bg offset 8px.
const DOT_SPACING = 20;
const DOT_SIZE = 2.5;
const DOT_PADDING = 18; // 8px offset + 10px dot center within tile

const WAVE_SPEED = 1400; // px/s (the original's "tab" tap speed)
const WAVELENGTH = 800;
const AMPLITUDE = 18;
const RAMP_DIST = 120;
const TIME_DECAY = 0.25;

/**
 * Even, centred grid: the outer dots sit exactly DOT_PADDING from each edge and
 * the rest are distributed evenly. The count is picked near DOT_SPACING, then the
 * step is normalised so padding stays equal on all sides at any canvas size.
 */
function dotLayout(w: number, h: number) {
  const availW = Math.max(0, w - 2 * DOT_PADDING);
  const availH = Math.max(0, h - 2 * DOT_PADDING);
  const cols = Math.max(1, Math.round(availW / DOT_SPACING) + 1);
  const rows = Math.max(1, Math.round(availH / DOT_SPACING) + 1);
  return {
    cols,
    rows,
    startX: cols > 1 ? DOT_PADDING : w / 2,
    startY: rows > 1 ? DOT_PADDING : h / 2,
    stepX: cols > 1 ? availW / (cols - 1) : 0,
    stepY: rows > 1 ? availH / (rows - 1) : 0,
  };
}

export interface DotGridProps {
  className?: string;
  /** Background fill override. Defaults to the themed `--dot-grid-bg` token. */
  bg?: string;
  /** Fire a ripple from the pointer on press. */
  rippleOnClick?: boolean;
}

export function DotGrid({ className, bg, rippleOnClick = true }: DotGridProps) {
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

    // Themed colors, re-read whenever the document theme flips (see observeTheme
    // below) so the backdrop changes in the same frame as the CSS.
    let palette = readDotGridPalette(ctx);
    const lastBlend = palette.blended.length - 1;

    const drawDots = (rp: { x: number; y: number; t0: number } | null, now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = bg ?? palette.bg;
      ctx.fillRect(0, 0, w, h);

      const { cols, rows, startX, startY, stepX, stepY } = dotLayout(w, h);

      let tSec = 0;
      let timeFade = 0;
      let wavefront = 0;
      if (rp) {
        tSec = (now - rp.t0) / 1000;
        timeFade = Math.exp(-TIME_DECAY * tSec);
        wavefront = WAVE_SPEED * tSec;
      }

      let lastFill = '';
      ctx.fillStyle = palette.dot;
      for (let n = 0; n < cols; n++) {
        const midX = startX + n * stepX;
        for (let m = 0; m < rows; m++) {
          const midY = startY + m * stepY;

          let dx = 0;
          let dy = 0;
          let sz = DOT_SIZE;
          let fill = palette.dot;

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
              fill = palette.blended[Math.round(Math.abs(strength) * 0.3 * lastBlend)];
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

    // Re-read themed colors and repaint immediately on theme flip. A resting
    // backdrop won't redraw on its own, so paint it here; an active ripple
    // already redraws each frame and picks up the new palette automatically.
    const stopTheme = observeTheme(() => {
      palette = readDotGridPalette(ctx);
      if (!animating) drawDots(ripple.current, performance.now());
    });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      cvs.removeEventListener('pointerdown', onDown);
      stopTheme();
    };
  }, [bg, rippleOnClick]);

  return <canvas ref={canvasRef} className={className} style={{ display: 'block', width: '100%', height: '100%' }} />;
}

export default DotGrid;
