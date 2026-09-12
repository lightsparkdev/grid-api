'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

export type StatusBarTone = 'default' | 'light';

/** Luminance at or above this → dark status bar glyphs. */
const LIGHT_GLYPH_THRESHOLD = 0.58;
/** Luminance at or below this → white status bar glyphs. */
const DARK_GLYPH_THRESHOLD = 0.5;

let colorProbeCtx: CanvasRenderingContext2D | null = null;

function parseCssColor(input: string): { r: number; g: number; b: number; a: number } | null {
  const trimmed = input.trim();
  if (!trimmed || trimmed === 'transparent') return null;

  if (!colorProbeCtx) {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    colorProbeCtx = canvas.getContext('2d', { willReadFrequently: true });
  }
  if (!colorProbeCtx) return null;

  colorProbeCtx.clearRect(0, 0, 1, 1);
  colorProbeCtx.fillStyle = trimmed;
  colorProbeCtx.fillRect(0, 0, 1, 1);
  const data = colorProbeCtx.getImageData(0, 0, 1, 1).data;
  const r = data[0];
  const g = data[1];
  const b = data[2];
  const a = data[3];
  if (a === 0) return null;
  return { r, g, b, a: a / 255 };
}

function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(r: number, g: number, b: number): number {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/** The element's OWN background (no ancestor climb). elementsFromPoint already
 *  yields the full painted stack top-to-bottom, so the caller walks that to find
 *  the first opaque layer. Climbing ancestors instead would jump from a
 *  translucent overlay (e.g. a sheet scrim) straight to its opaque ANCESTOR
 *  (the screen's --app-bg), skipping the colored sibling actually painted behind
 *  it — which read the light app bg under an open sheet and flipped the glyphs to
 *  dark even though a colored header sits behind the bar. */
function resolveBackgroundRgb(el: Element): { r: number; g: number; b: number } | null {
  const bg = parseCssColor(getComputedStyle(el).backgroundColor);
  if (bg && bg.a >= 0.45) {
    return { r: bg.r, g: bg.g, b: bg.b };
  }
  return null;
}

function sampleLuminanceAt(
  x: number,
  y: number,
  statusBarEl: Element,
  contentRoot: Element,
  screenEl: Element,
): number | null {
  for (const el of document.elementsFromPoint(x, y)) {
    if (el === statusBarEl || statusBarEl.contains(el)) continue;
    if (el === screenEl || el === contentRoot) continue;
    if (!contentRoot.contains(el)) continue;

    const rgb = resolveBackgroundRgb(el);
    if (rgb) return relativeLuminance(rgb.r, rgb.g, rgb.b);
  }

  // Nothing in the content paints behind the bar (the app's root is
  // transparent; its surface is the screen under the stage, which hit
  // testing skips): the screen's own surface is what shows there.
  const surface = resolveBackgroundRgb(screenEl);
  return surface ? relativeLuminance(surface.r, surface.g, surface.b) : null;
}

function measureTone(
  contentRoot: HTMLElement,
  statusBarEl: HTMLElement,
  screenEl: HTMLElement,
  current: StatusBarTone,
): StatusBarTone {
  const rect = statusBarEl.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return current;

  const y = rect.top + rect.height * 0.45;
  const xs = [0.18, 0.36, 0.5, 0.64, 0.82].map((t) => rect.left + rect.width * t);
  const samples: number[] = [];

  for (const x of xs) {
    const lum = sampleLuminanceAt(x, y, statusBarEl, contentRoot, screenEl);
    if (lum != null) samples.push(lum);
  }

  if (samples.length === 0) return current;

  const avg = samples.reduce((sum, value) => sum + value, 0) / samples.length;
  if (current === 'light') {
    return avg > LIGHT_GLYPH_THRESHOLD ? 'default' : 'light';
  }
  return avg < DARK_GLYPH_THRESHOLD ? 'light' : 'default';
}

/** Pick white vs dark status bar glyphs from screen content behind the bar. */
export function useAdaptiveStatusBarTone(
  screenRef: RefObject<HTMLElement | null>,
  screenBodyRef: RefObject<HTMLElement | null>,
  statusBarRef: RefObject<HTMLElement | null>,
): StatusBarTone {
  const [tone, setTone] = useState<StatusBarTone>('default');
  const toneRef = useRef<StatusBarTone>('default');

  useEffect(() => {
    const screenEl = screenRef.current;
    const contentRoot = screenBodyRef.current;
    const statusBarEl = statusBarRef.current;
    if (!screenEl || !contentRoot || !statusBarEl) return;

    let frame = 0;

    // Read the refs each time: the elements can be replaced under a stable
    // AppShell (the body remounts with its children; fast refresh), and a
    // measurement against a detached element would hold the tone forever.
    const update = () => {
      const screen = screenRef.current;
      const content = screenBodyRef.current;
      const bar = statusBarRef.current;
      if (!screen?.isConnected || !content?.isConnected || !bar?.isConnected) return;
      const measured = measureTone(content, bar, screen, toneRef.current);
      if (measured !== toneRef.current) {
        toneRef.current = measured;
        setTone(measured);
      }
    };

    update();

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(screenEl);
    resizeObserver.observe(contentRoot);
    resizeObserver.observe(statusBarEl);

    const mutationObserver = new MutationObserver(update);
    mutationObserver.observe(contentRoot, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'data-theme'],
    });
    // The theme lands on <html>; the surface's color follows, and the bar with it.
    mutationObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // The half-second tick is the safety net for anything the observers miss
    // (a repaint with no DOM change). Always re-arm it: a measurement that
    // throws must not stop the loop.
    const tick = () => {
      frame += 1;
      rafId = requestAnimationFrame(tick);
      if (frame % 30 === 0) update();
    };
    let rafId = requestAnimationFrame(tick);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [screenRef, screenBodyRef, statusBarRef]);

  return tone;
}
