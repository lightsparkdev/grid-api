'use client';

import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { PHONE_SHELL_GLASS, squirclePath } from '@/components/liquid-glass';

export interface UseSquircleClipOptions {
  /** CSS custom property holding the squircle radius (px). */
  radiusVar?: string;
  /** Squircle exponent smoothing 0..1 — matches `--corner-shape` / phone shell. */
  cornerSmoothing?: number;
  /** Per-corner radii `[tl, tr, br, bl]` in px; overrides `radiusVar`. */
  cornerRadii?: [number, number, number, number];
}

/**
 * Cross-browser superellipse corners via `clip-path: path()` — the same trick
 * FrostPanel, AppShell, and FaceIdAuth use. Safari ignores `corner-shape`, so
 * `border-radius` falls back to a circle; clip-path is the sole shaper.
 */
export function useSquircleClip<T extends HTMLElement = HTMLDivElement>({
  radiusVar = '--corner-radius-wallet-card-squircle',
  cornerSmoothing = PHONE_SHELL_GLASS.cornerSmoothing ?? 0.12,
  cornerRadii,
}: UseSquircleClipOptions = {}) {
  const ref = useRef<T>(null);
  const cornerKey = cornerRadii?.join(',');

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const apply = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (w <= 0 || h <= 0) return;

      let radius: number | [number, number, number, number];
      if (cornerRadii) {
        radius = cornerRadii;
      } else {
        const raw = getComputedStyle(el).getPropertyValue(radiusVar).trim();
        const r = raw ? Number.parseFloat(raw) : Number.NaN;
        radius = Number.isFinite(r) ? r : 38.4;
      }

      const path = `path('${squirclePath(w, h, radius, cornerSmoothing)}')`;
      el.style.clipPath = path;
      el.style.setProperty('-webkit-clip-path', path);
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    window.addEventListener('resize', apply);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', apply);
    };
  }, [radiusVar, cornerSmoothing, cornerKey]);

  const style: CSSProperties = { borderRadius: 0 };

  return { ref, style };
}
