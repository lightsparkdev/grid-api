import type { GlassConfig } from '@/components/liquid-glass';

export interface GlassCtrl {
  key: keyof GlassConfig;
  label: string;
  min: number;
  max: number;
  step: number;
}

export const GLASS_SHAPE_CTRLS: GlassCtrl[] = [
  { key: 'radius', label: 'Radius', min: 20, max: 200, step: 1 },
  { key: 'cornerSmoothing', label: 'Corner smoothing', min: 0, max: 1, step: 0.01 },
];

export const GLASS_TUNING_GROUPS: { title: string; ctrls: GlassCtrl[] }[] = [
  {
    title: 'Refraction',
    ctrls: [
      { key: 'scale', label: 'Scale', min: 0, max: 120, step: 1 },
      { key: 'depth', label: 'Depth', min: 0.5, max: 60, step: 0.5 },
      { key: 'domeDepth', label: 'Curvature', min: 0, max: 100, step: 1 },
      { key: 'splay', label: 'Splay', min: 0, max: 1, step: 0.01 },
      { key: 'chromaticAberration', label: 'Chroma', min: 0, max: 1, step: 0.01 },
      { key: 'blur', label: 'Blur', min: 0, max: 8, step: 0.1 },
    ],
  },
  {
    title: 'Light',
    ctrls: [
      { key: 'specularRotation', label: 'Specular angle', min: 0, max: 180, step: 1 },
      { key: 'specularStrength', label: 'Specular strength', min: 0, max: 2, step: 0.01 },
      { key: 'glowStrength', label: 'Glow', min: 0, max: 1, step: 0.01 },
      { key: 'edgeStrength', label: 'Edge highlight', min: 0, max: 1, step: 0.01 },
      { key: 'brightness', label: 'Brightness', min: -0.5, max: 0.5, step: 0.01 },
    ],
  },
  {
    title: 'Shadow',
    ctrls: [
      { key: 'shadowOffsetY', label: 'Shadow Y', min: -20, max: 80, step: 1 },
      { key: 'shadowBlur', label: 'Shadow blur', min: 0, max: 100, step: 1 },
      { key: 'shadowSpread', label: 'Shadow spread', min: -80, max: 20, step: 1 },
      { key: 'shadowOpacity', label: 'Shadow opacity', min: 0, max: 0.6, step: 0.01 },
    ],
  },
];

export type OverlayGlassTarget = 'sheet' | 'symbol' | 'text';

export type GlassTuningTarget = 'shell' | OverlayGlassTarget;

export const GLASS_TUNING_TARGETS: { id: GlassTuningTarget; label: string }[] = [
  { id: 'shell', label: 'Phone shell' },
  { id: 'sheet', label: 'Sheet' },
  { id: 'symbol', label: 'Symbol btn' },
  { id: 'text', label: 'Text btn' },
];

export const GLASS_MAP_SIZES = [64, 128, 256, 512] as const;

/** Dev-only reference-bezel overlay — line the swag corner up against a real iPhone. */
export interface BezelRefState {
  show: boolean;
  opacity: number;
}

export const DEFAULT_BEZEL_REF: BezelRefState = { show: false, opacity: 0.6 };
export const BEZEL_REF_SRC = '/dev/bezel-compare.png?v=3';
