import type { GlassConfig } from './LiquidGlass';

/**
 * Tuning presets reverse-engineered from Aave's shipped components. `scale` is
 * the peak refraction in pixels; everything else maps 1:1 onto the generator.
 */

/**
 * Neutral default — clear, elegant glass. Mirrors the character of Aave's
 * playground default (gentle bend, soft diagonal specular, subtle fringe).
 * Tuned for a lens roughly 240×180.
 */
export const DEFAULT_GLASS: GlassConfig = {
  radius: 44,
  depth: 16,
  scale: 26,
  chromaticAberration: 0.2,
  blur: 0,
  domeDepth: 40,
  splay: 1,
  specularRotation: 45,
  specularStrength: 1,
  glowStrength: 0.12,
  glowSpread: 0.5,
  glowExponent: 1.5,
  edgeStrength: 0.25,
  edgeWidth: 2,
  edgeExponent: 1.5,
  brightness: 0.05,
  cornerSmoothing: 0.6,
  mapSize: 256,
};

/** Strong, tactile bend — modelled on Aave's switch thumb (depth 2, dome 6, chroma 1). */
export const SWITCH_GLASS: GlassConfig = {
  radius: 44,
  depth: 12,
  scale: 40,
  chromaticAberration: 1,
  blur: 0,
  domeDepth: 30,
  splay: 0.4,
  specularRotation: 45,
  specularStrength: 1,
  glowStrength: 0,
  glowSpread: 0.5,
  glowExponent: 1.5,
  edgeStrength: 0.4,
  edgeWidth: 2,
  edgeExponent: 1.5,
  brightness: 0.06,
  cornerSmoothing: 0.6,
  mapSize: 256,
};

/** Gentle bend so values stay legible — modelled on Aave's slider / toggle handle. */
/** Large phone bezel — Figma phone-gga @ 2121:17475 */
export const PHONE_SHELL_GLASS: GlassConfig = {
  radius: 76,
  depth: 18,
  scale: 14,
  chromaticAberration: 0.15,
  blur: 0,
  domeDepth: 30,
  splay: 0.85,
  specularRotation: 45,
  specularStrength: 0.9,
  glowStrength: 0.1,
  glowSpread: 0.5,
  glowExponent: 1.5,
  edgeStrength: 0.2,
  edgeWidth: 2,
  edgeExponent: 1.5,
  brightness: 0.08,
  cornerSmoothing: 0.6,
  edgeShadow: '0 5.662px 45.3px rgba(0, 0, 0, 0.1)',
  mapSize: 512,
};

export const SLIDER_GLASS: GlassConfig = {
  radius: 44,
  depth: 16,
  scale: 14,
  chromaticAberration: 0.65,
  blur: 0,
  domeDepth: 26,
  splay: 0.5,
  specularRotation: 45,
  specularStrength: 1.5,
  glowStrength: 0.4,
  glowSpread: 0.5,
  glowExponent: 1.5,
  edgeStrength: 0,
  edgeWidth: 3,
  edgeExponent: 1.5,
  brightness: 0.06,
  cornerSmoothing: 0.6,
  mapSize: 256,
};
