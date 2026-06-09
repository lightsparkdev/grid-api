import type { GlassConfig } from '@/components/liquid-glass';
import { PHONE_SHELL_GLASS } from '@/components/liquid-glass';

/** Backdrop for glass chips over the auth hero / sheet area. */
export const AUTH_GLASS_BACKDROP =
  'linear-gradient(180deg, #b8def1 0%, #ffffff 42%, #f2f2f7 100%)';

/**
 * iOS bottom sheet — Figma 2183:47617.
 *
 * The sheet renders as a non-refractive `FrostPanel` (a big displacement lens
 * re-runs its whole SVG filter every frame as the sheet slides, which tanks
 * Safari). Only the frost + shape fields below are consumed: `tint` + `tintBlur`
 * (the GPU `backdrop-filter` material), `radius`/`cornerSmoothing` (the squircle),
 * and the `--glass-sheet-edge` token (the specular rim, baked into FrostPanel).
 * The displacement fields (`scale`, `depth`, `chromaticAberration`, `glow*`,
 * `edge*`, …) are retained for type/tuning compatibility but no longer rendered.
 */
export const SHEET_GLASS: GlassConfig = {
  radius: 22,
  depth: 10,
  scale: 16,
  chromaticAberration: 0.35,
  blur: 0,
  // Milky tint + a GPU `backdrop-filter` blur = the iOS "material" frost.
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
  // Small control — a 128 map is plenty, and it halves the displacement-map
  // generation cost when the glass resolves at rest (vs 256).
  mapSize: 128,
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
  // Cheaper map (resolves at rest after the sheet settles); a pill needs no more.
  mapSize: 128,
};

export const TEXT_GLASS_BACKDROP = 'linear-gradient(180deg, #ffffff 0%, #ebebef 100%)';

export const TEXT_GLASS_PRIMARY_BACKDROP =
  'linear-gradient(180deg, #3395ff 0%, #007aff 55%, #0062d1 100%)';
