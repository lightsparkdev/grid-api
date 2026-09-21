import type { CSSProperties, ReactNode } from 'react';
import { PHONE_SHELL_GLASS, TEXT_GLASS } from './presets';
import { squirclePath } from './squircle';

export interface GlassConfig {
  radius: number;
  depth: number;
  scale: number;
  chromaticAberration: number;
  blur: number;
  domeDepth: number;
  splay: number;
  specularRotation: number;
  specularStrength: number;
  glowStrength: number;
  glowSpread: number;
  glowExponent: number;
  edgeStrength: number;
  edgeWidth: number;
  edgeExponent: number;
  brightness: number;
  cornerSmoothing: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
  shadowSpread?: number;
  shadowOpacity?: number;
  edgeShadow?: string;
  mapSize: number;
}

export function Glass({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  showOutline?: boolean;
} & Partial<GlassConfig>) {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

export { PHONE_SHELL_GLASS, TEXT_GLASS, squirclePath };
