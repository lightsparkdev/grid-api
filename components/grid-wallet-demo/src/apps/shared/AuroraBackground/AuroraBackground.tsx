import type { ReactNode } from 'react';
import clsx from 'clsx';
import styles from './AuroraBackground.module.scss';

interface AuroraBackgroundProps {
  children?: ReactNode;
  className?: string;
  showRadialGradient?: boolean;
  /** Fade aurora into `--app-bg` at the bottom (auth hero). */
  fadeBottom?: boolean;
}

/** Flowing aurora backdrop — Aceternity/shadcn technique, SCSS port. */
export function AuroraBackground({
  children,
  className,
  showRadialGradient = true,
  fadeBottom = false,
}: AuroraBackgroundProps) {
  return (
    <div className={clsx(styles.root, className)} data-fade-bottom={fadeBottom ? 'true' : 'false'}>
      <div className={styles.backdrop} aria-hidden>
        <div className={styles.auroraLayer} data-radial={showRadialGradient ? 'true' : 'false'} />
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
