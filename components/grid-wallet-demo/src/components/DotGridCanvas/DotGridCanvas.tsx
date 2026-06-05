import type { ReactNode } from 'react';
import styles from './DotGridCanvas.module.scss';

interface DotGridCanvasProps {
  children?: ReactNode;
}

export function DotGridCanvas({ children }: DotGridCanvasProps) {
  return <div className={styles.canvas}>{children}</div>;
}
