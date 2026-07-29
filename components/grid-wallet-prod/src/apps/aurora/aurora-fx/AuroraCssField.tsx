'use client';

import { useEffect, useRef } from 'react';
import { observeTheme } from '@/lib/dotGridColors';
import {
  GRAD_DIR,
  LAYER_OPACITY,
  LUT_SIZE,
  auroraClock,
  auroraDrift,
  auroraPeriods,
  computeAuroraLut,
  readAuroraPalette,
  type AuroraPalette,
} from './auroraField';

/**
 * The LIVE aurora as plain CSS — for SVG-filtered glass copies.
 *
 * Safari refuses to feed accelerated surfaces (WebGL canvas) through an SVG
 * filter, but the aurora field is a 1-D function of the projection onto the
 * 100° gradient axis (auroraGroup depends on p only via dot(p, gradDir)). So
 * the exact field at time t IS a linear gradient: this paints it per frame as
 * `linear-gradient(100deg, …)` with stops sampled from the same CPU LUTs,
 * soft-light blend, drift and shared clock the GPU canvas uses — pixel-faithful
 * and in lockstep with the real card, while staying ordinary, filterable DOM.
 *
 * (On Safari the owning glass must mint fresh filter ids over time — it caches
 * filter output by id — see GlassConfig.refreshKey.)
 */

/** px between emitted gradient stops (along the gradient line). */
const STOP_STEP = 6;

/** W3C soft-light, per channel — JS twin of the GLSL softLightCh. */
function softLightCh(cb: number, cs: number): number {
  const d = cb <= 0.25 ? ((16 * cb - 12) * cb + 4) * cb : Math.sqrt(cb);
  return cs <= 0.5 ? cb - (1 - 2 * cs) * cb * (1 - cb) : cb + (2 * cs - 1) * (d - cb);
}

/** LINEAR sample of an RGBA8 LUT (repeat-wrapped), channel c, at `phase`. */
function lutSample(lut: Uint8Array, phase: number, c: number): number {
  const x = (phase - Math.floor(phase)) * LUT_SIZE - 0.5;
  let i0 = Math.floor(x);
  const f = x - i0;
  i0 = ((i0 % LUT_SIZE) + LUT_SIZE) % LUT_SIZE;
  const i1 = (i0 + 1) % LUT_SIZE;
  return (lut[i0 * 4 + c] * (1 - f) + lut[i1 * 4 + c] * f) / 255;
}

export function AuroraCssField({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const [dirX, dirY] = GRAD_DIR;
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let palette: AuroraPalette | null = null;
    let lutBase: Uint8Array | null = null;
    let lutOver: Uint8Array | null = null;
    let pBase = 1;
    let pOver = 1;
    let w = 0;
    let sMin = 0;
    let span = 0;
    let raf = 0;

    // Geometry + LUTs — rebuilt on resize/theme only (same cadence as the GPU).
    const rebuild = () => {
      w = el.offsetWidth;
      const h = el.offsetHeight;
      if (w <= 0 || h <= 0) {
        span = 0;
        return;
      }
      if (!palette) palette = readAuroraPalette(el);
      ({ pBase, pOver } = auroraPeriods(w, h));
      lutBase = computeAuroraLut(palette.stripes, pBase);
      lutOver = computeAuroraLut(palette.stripes, pOver);
      // CSS gradient-line mapping: stop q px along the line corresponds to
      // s = sMin + q, where s = dot(p, gradDir) over the element's corners.
      const dots = [0, w * dirX, el.offsetHeight * dirY, w * dirX + h * dirY];
      sMin = Math.min(...dots);
      span = Math.max(...dots) - sMin;
    };

    const paint = () => {
      if (!palette || !lutBase || !lutOver || span <= 0) return;
      const t = reduceMq.matches ? 0 : auroraClock();
      const { driftBase, driftOver } = auroraDrift(w, t);
      // Drift adds (d, 0) to p → shifts the scalar by d * dirX.
      const offBase = driftBase * dirX;
      const offOver = driftOver * dirX;
      const base = palette.base;
      const n = Math.max(2, Math.ceil(span / STOP_STEP));
      const stops: string[] = new Array(n + 1);
      for (let k = 0; k <= n; k++) {
        const q = (k / n) * span;
        const s = sMin + q;
        const phB = (s + offBase) / pBase;
        const phO = (s + offOver) / pOver;
        let css = 'rgb(';
        for (let c = 0; c < 3; c++) {
          const grp = softLightCh(lutSample(lutBase, phB, c), lutSample(lutOver, phO, c));
          const v = base[c] + (grp - base[c]) * LAYER_OPACITY;
          css += `${Math.round(v * 255)}${c < 2 ? ' ' : ''}`;
        }
        stops[k] = `${css}) ${q.toFixed(1)}px`;
      }
      el.style.backgroundImage = `linear-gradient(100deg, ${stops.join(',')})`;
    };

    const loop = () => {
      paint();
      raf = reduceMq.matches || document.hidden ? 0 : requestAnimationFrame(loop);
    };
    const wake = () => {
      if (!raf && !document.hidden) raf = requestAnimationFrame(loop);
    };
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else {
        wake();
      }
    };

    rebuild();
    paint();
    wake();

    const ro = new ResizeObserver(() => {
      rebuild();
      paint();
    });
    ro.observe(el);
    const stopTheme = observeTheme(() => {
      palette = null;
      rebuild();
      paint();
    });
    document.addEventListener('visibilitychange', onVisibility);
    reduceMq.addEventListener?.('change', wake);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      stopTheme();
      document.removeEventListener('visibilitychange', onVisibility);
      reduceMq.removeEventListener?.('change', wake);
    };
  }, []);

  return <div ref={ref} className={className} aria-hidden />;
}
