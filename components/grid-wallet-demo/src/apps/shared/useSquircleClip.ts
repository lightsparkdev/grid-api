'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { PHONE_SHELL_GLASS, squirclePath } from '@/components/liquid-glass';
import { figmaSquircleRadii, figmaSquircleRadius, readCssVarPx } from './figmaSquircleRadius';

export interface UseSquircleClipOptions {
  /** CSS custom property holding the squircle radius (px). */
  radiusVar?: string;
  /** Squircle exponent smoothing 0..1 — matches `--corner-shape` / phone shell. */
  cornerSmoothing?: number;
  /** Per-corner radii `[tl, tr, br, bl]` in px; overrides `radiusVar`. */
  cornerRadii?: [number, number, number, number];
  /** Figma corner radius — auto-scaled by {@link CORNER_SUPERELLIPSE_SCALE}. */
  figmaRadii?: number | [number, number, number, number];
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
  figmaRadii,
}: UseSquircleClipOptions = {}) {
  const ref = useRef<T>(null);
  /** The raw squircle path `d` + the measured size — so callers can stroke the
   *  exact same shape as the clip (e.g. a border), instead of an approximate
   *  CSS `corner-shape` that drifts from the path at the corners. */
  const [shape, setShape] = useState<{ d: string; width: number; height: number }>({
    d: '',
    width: 0,
    height: 0,
  });
  const resolvedCornerRadii =
    cornerRadii ?? (figmaRadii !== undefined ? figmaSquircleRadii(figmaRadii) : undefined);
  const cornerKey =
    typeof resolvedCornerRadii === 'number'
      ? String(resolvedCornerRadii)
      : resolvedCornerRadii?.join(',');

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const apply = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (w <= 0 || h <= 0) return;

      let radius: number | [number, number, number, number];
      if (resolvedCornerRadii !== undefined) {
        radius = resolvedCornerRadii;
      } else {
        const r = readCssVarPx(el, radiusVar);
        radius = Number.isFinite(r) ? r : figmaSquircleRadius(32);
      }

      const d = squirclePath(w, h, radius, cornerSmoothing);
      const path = `path('${d}')`;
      el.style.clipPath = path;
      el.style.setProperty('-webkit-clip-path', path);
      setShape((prev) =>
        prev.d === d && prev.width === w && prev.height === h
          ? prev
          : { d, width: w, height: h },
      );
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

  return { ref, style, path: shape.d, width: shape.width, height: shape.height };
}
