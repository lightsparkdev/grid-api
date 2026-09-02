/* Derive the aurora field's five-stop palette from the brand color, so the
   customizable skin keeps Aurora's animated field but in the brand's hue. */

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

/** Custom properties auroraField.ts reads (`--aurora-base`, `--aurora-stripe-1..5`),
 *  scoped under `--brand-aurora-*` so the skin stylesheet can apply them only
 *  inside the aurora root. Returns an empty object for unparseable colors. */
export function brandAuroraVars(color: string, colorEnd?: string): CSSProperties {
  const a = hexToHsl(color);
  if (!a) return {};
  const b = (colorEnd && hexToHsl(colorEnd)) || a;
  // Near-grey brands (Ink, Sand) get a hint of saturation so the stripes read.
  const sat = Math.max(a.s, 0.12);
  const light = b.l > a.l ? b : a;
  const dark = b.l > a.l ? a : b;
  return {
    '--brand-aurora-base': hsl(a.h, sat, dark.l),
    '--brand-aurora-stripe-1': hsl(a.h, sat, Math.max(0.06, dark.l - 0.14)),
    '--brand-aurora-stripe-2': hsl(b.h, Math.max(b.s, 0.12), light.l + 0.08),
    '--brand-aurora-stripe-3': hsl(a.h, sat * 0.6, Math.min(0.9, light.l + 0.38)),
    '--brand-aurora-stripe-4': hsl(b.h, Math.max(b.s, 0.12), light.l + 0.08),
    '--brand-aurora-stripe-5': hsl(a.h, sat, Math.min(0.85, light.l + 0.22)),
  } as CSSProperties;
}

/** Fired on `document` when the brand palette changes so live aurora canvases
 *  re-read their custom properties (they otherwise only re-read on theme flip). */
export const AURORA_PALETTE_EVENT = 'aurora-palette-change';
