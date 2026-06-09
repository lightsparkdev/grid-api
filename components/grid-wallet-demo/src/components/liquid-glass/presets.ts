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

/** Large phone bezel — Figma phone-gga @ 2121:17475 */
export const PHONE_SHELL_GLASS: GlassConfig = {
  // Tuned by eye against refs/bezel-compare.png. The AppShell drives both the
  // shell and the inner screen from this (screen = radius - 16px inset) so they
  // stay concentric: shell corner 89, screen corner 73.
  radius: 89,
  depth: 18,
  scale: 19,
  chromaticAberration: 1,
  blur: 2.3,
  domeDepth: 30,
  splay: 0.84,
  specularRotation: 45,
  specularStrength: 1,
  glowStrength: 0.03,
  glowSpread: 0.5,
  glowExponent: 1.5,
  edgeStrength: 0.55,
  edgeWidth: 2,
  edgeExponent: 1.5,
  brightness: 0.08,
  // Tuned by eye against refs/bezel-compare.png. Mirrored onto the DOM as
  // corner-shape: superellipse(1 + smoothing*2) so the shell shadow, inner screen,
  // and refracted bezel all trace the same curve.
  cornerSmoothing: 0.12,
  // Simple all-around drop shadow (not grounded). Swag builds a single box-shadow
  // from these tunable components — dial in via the Shadow sliders; edgeShadow is
  // the slop (SVG) equivalent.
  shadowOffsetY: 8,
  shadowBlur: 24,
  shadowSpread: 0,
  shadowOpacity: 0.12,
  edgeShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  mapSize: 512,
};
