import type { GlassConfig } from '@/components/liquid-glass';

export interface GlassCtrl {
  key: keyof GlassConfig;
  label: string;
  min: number;
  max: number;
  step: number;
}

export const GLASS_SHAPE_CTRLS: GlassCtrl[] = [
  { key: 'radius', label: 'Radius', min: 20, max: 120, step: 1 },
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
];

export const GLASS_MAP_SIZES = [64, 128, 256, 512] as const;
