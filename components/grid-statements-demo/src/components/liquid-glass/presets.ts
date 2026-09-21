import type { GlassConfig } from './index';

export const PHONE_SHELL_GLASS: GlassConfig = {
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
  cornerSmoothing: 0.12,
  shadowOffsetY: 8,
  shadowBlur: 24,
  shadowSpread: 0,
  shadowOpacity: 0.12,
  edgeShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  mapSize: 512,
};

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
  cornerSmoothing: 0,
  mapSize: 128,
};

export const TEXT_GLASS_BACKDROP =
  'linear-gradient(180deg, #ffffff 0%, #ebebef 100%)';
