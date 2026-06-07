import type { ReactNode } from 'react';
import type { GlassConfig } from '@/components/liquid-glass';
import { DotGrid } from '@/components/DotGrid/DotGrid';
import { StageGL } from '@/components/glass-gl/StageGL';
import styles from './DotGridCanvas.module.scss';

interface DotGridCanvasProps {
  children?: ReactNode;
  /** TEMP — glass refraction demo bg; remove when shell styling ships. */
  glassDemoBg?: boolean;
  /** Lens tuning for the WebGL stage (swag mode). */
  glassConfig?: GlassConfig;
}

export function DotGridCanvas({ children, glassDemoBg, glassConfig }: DotGridCanvasProps) {
  return (
    <div className={glassDemoBg ? styles.canvasGlassDemo : styles.canvas}>
      {glassDemoBg ? (
        <StageGL className={styles.gridLayer} lens={glassConfig} />
      ) : (
        <DotGrid className={styles.gridLayer} />
      )}
      {children}
    </div>
  );
}
