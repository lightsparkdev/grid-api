/* Derive the card face's gradient stops from the brand color. */

import type { CSSProperties } from 'react';

type HSL = { h: number; s: number; l: number };

function hexToHsl(hex: string): HSL | null {
  const m = hex.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h6 = m[1];
  if (h6.length === 3) h6 = h6.split('').map((c) => c + c).join('');
  const n = parseInt(h6, 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return { h, s, l };
}

function hsl(h: number, s: number, l: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  return `hsl(${Math.round(h)} ${Math.round(clamp(s) * 100)}% ${Math.round(clamp(l) * 100)}%)`;
}

/** The brand color with a lighter and a deeper stop for the card face
 *  gradient. Falls back to the color itself for an unparseable value. */
export function brandStops(color: string): { color: string; light: string; deep: string } {
  const a = hexToHsl(color);
  if (!a) return { color, light: color, deep: color };
  return {
    color,
    light: hsl(a.h, a.s, Math.min(0.92, a.l + 0.18)),
    deep: hsl(a.h, Math.min(1, a.s * 1.05), Math.max(0.06, a.l - 0.2)),
  };
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h6 = m[1];
  if (h6.length === 3) h6 = h6.split('').map((c) => c + c).join('');
  const n = parseInt(h6, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
function relativeLuminance([r, g, b]: [number, number, number]): number {
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** The ink over a fill of the brand color: white on a dark brand, black on a
 *  light one (whichever contrasts more). White for an unparseable value. */
export function brandInk(color: string): string {
  const rgb = hexToRgb(color);
  if (!rgb) return '#ffffff';
  return inkFor(relativeLuminance(rgb));
}

function inkFor(luminance: number): string {
  // Contrast against white is (1.05 / (l + 0.05)); against black, (l + 0.05) / 0.05.
  return 1.05 / (luminance + 0.05) >= (luminance + 0.05) / 0.05 ? '#ffffff' : '#000000';
}

/** Where a brand fill's luminance is held to so it still reads as a shape on
 *  the sheet's surface: no lighter than this on the light surface (a white
 *  card's tile went white on white), no darker than this on the dark one. */
const FILL_MAX_L_ON_LIGHT = 0.36;
const FILL_MIN_L_ON_DARK = 0.07;

function toHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`;
}

/** The brand color mixed toward `toward` just far enough for its luminance
 *  to reach `target`, keeping its hue. */
function clampLuminance(rgb: [number, number, number], toward: number, target: number): [number, number, number] {
  let lo = 0;
  let hi = 1;
  const mix = (f: number): [number, number, number] => [
    rgb[0] + (toward - rgb[0]) * f,
    rgb[1] + (toward - rgb[1]) * f,
    rgb[2] + (toward - rgb[2]) * f,
  ];
  for (let i = 0; i < 16; i++) {
    const mid = (lo + hi) / 2;
    const l = relativeLuminance(mix(mid));
    const short = toward === 0 ? l > target : l < target;
    if (short) lo = mid;
    else hi = mid;
  }
  return mix(hi);
}

/** A fill of the brand color for a tile on a sheet: the color itself when it
 *  reads against the sheet's surface, otherwise pulled toward the surface's
 *  opposite until it does. With the ink that reads over the result. */
export function brandFill(color: string, surface: 'light' | 'dark'): { fill: string; ink: string } {
  const rgb = hexToRgb(color);
  if (!rgb) return { fill: color, ink: '#ffffff' };
  const l = relativeLuminance(rgb);
  let fill = rgb;
  if (surface === 'light' && l > FILL_MAX_L_ON_LIGHT) fill = clampLuminance(rgb, 0, FILL_MAX_L_ON_LIGHT);
  if (surface === 'dark' && l < FILL_MIN_L_ON_DARK) fill = clampLuminance(rgb, 255, FILL_MIN_L_ON_DARK);
  return { fill: toHex(fill), ink: inkFor(relativeLuminance(fill)) };
}

/** `--brand-color` plus the light and deep stops, and the sheet-tile fills
 *  (with their inks) for either surface, for the phone chrome. */
export function brandVars(color: string): CSSProperties {
  const s = brandStops(color);
  const onLight = brandFill(color, 'light');
  const onDark = brandFill(color, 'dark');
  return {
    '--brand-color': color,
    '--brand-color-light': s.light,
    '--brand-color-deep': s.deep,
    '--brand-fill-on-light': onLight.fill,
    '--brand-fill-on-light-ink': onLight.ink,
    '--brand-fill-on-dark': onDark.fill,
    '--brand-fill-on-dark-ink': onDark.ink,
  } as CSSProperties;
}
