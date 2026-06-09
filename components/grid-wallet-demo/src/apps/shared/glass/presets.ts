import type { GlassConfig } from '@/components/liquid-glass';
import { PHONE_SHELL_GLASS } from '@/components/liquid-glass';

/** Backdrop for glass chips over the auth hero / sheet area. */
export const AUTH_GLASS_BACKDROP =
  'linear-gradient(180deg, #b8def1 0%, #ffffff 42%, #f2f2f7 100%)';

/** iOS bottom sheet — Figma 2183:47617. */
export const SHEET_GLASS: GlassConfig = {
  radius: 22,
  depth: 10,
  scale: 16,
  chromaticAberration: 0.35,
  // A milky tint + a GPU `backdrop-filter` blur (`tintBlur`) = the iOS "material"
  // look (you barely see the refracted screen through it). The frost is CSS, not an
  // in-filter `feGaussianBlur`, so it's cheap on WebKit and keeps the filter's
  // source graphic small. The in-filter `blur` stays off. Tint flips via the token.
  blur: 0,
  tintBlur: 12,
  domeDepth: 22,
  splay: 0.65,
  specularRotation: 45,
  specularStrength: 1,
  glowStrength: 0.08,
  glowSpread: 0.5,
  glowExponent: 1.5,
  edgeStrength: 0.3,
  edgeWidth: 2,
  edgeExponent: 1.5,
  brightness: 0.06,
  tint: 'var(--glass-sheet-tint)',
  // The frost sits over the filter's specular rim and dims it, so add a crisp
  // white edge on top of the tint (insetShadow renders after it) to bring the
  // bright glass border back. Themed token: pops in light, subtler in dark.
  insetShadow: '0 0 0 1px var(--glass-sheet-edge)',
  cornerSmoothing: PHONE_SHELL_GLASS.cornerSmoothing,
  mapSize: 256,
};

/** Circular symbol control — Figma Button - Liquid Glass - Symbol. */
export const SYMBOL_GLASS: GlassConfig = {
  radius: 22,
  depth: 0.5,
  scale: 10,
  chromaticAberration: 0.25,
  blur: 0,
  domeDepth: 14,
  splay: 0.7,
  specularRotation: 45,
  specularStrength: 1,
  glowStrength: 0.06,
  glowSpread: 0.5,
  glowExponent: 1.5,
  edgeStrength: 1,
  edgeWidth: 2,
  edgeExponent: 1.5,
  brightness: 0.05,
  cornerSmoothing: 0,
  mapSize: 256,
};

/** Pill text button — neutral glass. */
export const TEXT_GLASS: GlassConfig = {
  radius: 1000,
  depth: 0.5,
  scale: 12,
  chromaticAberration: 0.3,
  blur: 0,
  domeDepth: 18,
  splay: 0.6,
  specularRotation: 45,
  specularStrength: 1,
  glowStrength: 0.06,
  glowSpread: 0.5,
  glowExponent: 1.5,
  edgeStrength: 1,
  edgeWidth: 2,
  edgeExponent: 1.5,
  brightness: 0.05,
  // It's a full pill (radius clamps to half) — keep corners truly circular.
  // Smoothing has no flat edge to blend into here, so it'd only distort the ends.
  cornerSmoothing: 0,
  mapSize: 256,
};

export const TEXT_GLASS_BACKDROP = 'linear-gradient(180deg, #ffffff 0%, #ebebef 100%)';

export const TEXT_GLASS_PRIMARY_BACKDROP =
  'linear-gradient(180deg, #3395ff 0%, #007aff 55%, #0062d1 100%)';
