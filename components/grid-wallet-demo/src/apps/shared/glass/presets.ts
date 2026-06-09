import type { FrostConfig, GlassConfig } from '@/components/liquid-glass';
import { PHONE_SHELL_GLASS } from '@/components/liquid-glass';

/**
 * iOS bottom sheet — Figma 2183:47617.
 *
 * A `FrostConfig` (not `GlassConfig`): the sheet is a non-refractive `FrostPanel`,
 * because a big displacement lens re-runs its whole SVG filter every frame as the
 * sheet slides, which tanks Safari. The look is a milky `tint` + a GPU
 * `backdrop-filter` `tintBlur`, the squircle shape, and the `--glass-sheet-edge`
 * specular rim (FrostPanel's `edge` default). Refraction stays on the small buttons.
 */
export const SHEET_GLASS: FrostConfig = {
  radius: 22,
  cornerSmoothing: PHONE_SHELL_GLASS.cornerSmoothing,
  tint: 'var(--glass-sheet-tint)',
  tintBlur: 12,
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
