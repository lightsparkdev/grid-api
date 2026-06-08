import type { ReactNode } from 'react';
import type { GlassConfig } from '@/components/liquid-glass';
import { DotGrid } from '@/components/DotGrid/DotGrid';
import { StageGL } from '@/components/glass-gl/StageGL';
import styles from './DotGridCanvas.module.scss';

interface DotGridCanvasProps {
  children?: ReactNode;
  /** Swag mode — WebGL stage with glass lens. Slop uses canvas DotGrid. */
  glassDemoBg?: boolean;
  /** Lens tuning for the WebGL stage (swag only). */
  glassConfig?: GlassConfig;
}

export function DotGridCanvas({ children, glassDemoBg, glassConfig }: DotGridCanvasProps) {
  return (
    <div className={glassDemoBg ? styles.canvasGlassDemo : styles.canvas}>
      {glassDemoBg ? (
        <StageGL className={styles.gridLayerSwag} lens={glassConfig} />
      ) : (
        <DotGrid className={styles.gridLayer} />
      )}
      {children}
    </div>
  );
}
