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
  // Tuned by eye against refs/bezel-compare.png. The AppShell drives both the
  // shell and the inner screen from this (screen = radius - 16px inset) so they
  // stay concentric: shell corner 89, screen corner 73.
  radius: 89,
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
  // Tuned by eye against refs/bezel-compare.png. Mirrored onto the DOM as
  // corner-shape: superellipse(1 + smoothing*2) so the shell shadow, inner screen,
  // and refracted bezel all trace the same curve.
  cornerSmoothing: 0.12,
  // Grounding shadow (offset down, spread ~= -blur) so it pools under the phone with
  // no outward halo at the corners. Swag builds its box-shadow from these tunable
  // components; edgeShadow is the slop (SVG) equivalent.
  shadowOffsetY: 30,
  shadowBlur: 40,
  shadowSpread: -40,
  shadowOpacity: 0.3,
  edgeShadow: '0 30px 40px -40px rgba(0, 0, 0, 0.3)',
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
