import type { ReactNode } from 'react';
import clsx from 'clsx';
import { AuroraCanvas } from './AuroraCanvas';
import styles from './AuroraBackground.module.scss';

interface AuroraBackgroundProps {
  children?: ReactNode;
  className?: string;
  showRadialGradient?: boolean;
  /** Fade aurora into `--app-bg` at the bottom (auth hero). */
  fadeBottom?: boolean;
  /** Tag the GPU field so the close-button lens can find + refract this instance. */
  fieldId?: string;
}

/**
 * Flowing aurora backdrop. The drifting, blurred stripe field is rendered on the
 * GPU (AuroraCanvas / auroraField.ts) instead of full-screen `filter: blur(24px)`
 * CSS layers, which fixes Safari's frame budget on the issuance screen. The
 * public API (`fadeBottom`, `showRadialGradient`, `className`) and the look are
 * unchanged.
 */
export function AuroraBackground({
  children,
  className,
  showRadialGradient = true,
  fadeBottom = false,
  fieldId,
}: AuroraBackgroundProps) {
  return (
    <div
      className={clsx(styles.root, className)}
      data-fade-bottom={fadeBottom ? 'true' : 'false'}
      data-aurora-root
    >
      <div className={styles.backdrop} aria-hidden>
        <AuroraCanvas
          className={styles.canvas}
          showRadialGradient={showRadialGradient}
          fieldId={fieldId}
        />
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
