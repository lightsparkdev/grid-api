import type { ReactNode } from 'react';
import type { GlassConfig } from '@/components/liquid-glass';
import { StageGL } from '@/components/glass-gl/StageGL';
import styles from './DotGridCanvas.module.scss';

interface DotGridCanvasProps {
  children?: ReactNode;
  /** Lens config for the WebGL glass stage behind the phone. */
  glassConfig?: GlassConfig;
}

export function DotGridCanvas({ children, glassConfig }: DotGridCanvasProps) {
  return (
    <div className={styles.canvasGlassDemo}>
      <StageGL className={styles.gridLayerSwag} lens={glassConfig} />
      {children}
    </div>
  );
}
