import type { ReactNode } from 'react';
import { DotGrid } from '@/components/DotGrid/DotGrid';
import styles from './DotGridCanvas.module.scss';

interface DotGridCanvasProps {
  children?: ReactNode;
  /** TEMP — glass refraction demo bg; remove when shell styling ships. */
  glassDemoBg?: boolean;
}

export function DotGridCanvas({ children, glassDemoBg }: DotGridCanvasProps) {
  return (
    <div className={glassDemoBg ? styles.canvasGlassDemo : styles.canvas}>
      {!glassDemoBg && <DotGrid className={styles.gridLayer} />}
      {children}
    </div>
  );
}
