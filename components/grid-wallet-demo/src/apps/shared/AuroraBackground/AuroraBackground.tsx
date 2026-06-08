import type { ReactNode } from 'react';
import clsx from 'clsx';
import styles from './AuroraBackground.module.scss';

interface AuroraBackgroundProps {
  children?: ReactNode;
  className?: string;
  showRadialGradient?: boolean;
}

/** Flowing aurora backdrop — Aceternity/shadcn technique, SCSS port. */
export function AuroraBackground({
  children,
  className,
  showRadialGradient = true,
}: AuroraBackgroundProps) {
  return (
    <div className={clsx(styles.root, className)}>
      <div className={styles.backdrop} aria-hidden>
        <div className={styles.auroraLayer} data-radial={showRadialGradient ? 'true' : 'false'} />
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
