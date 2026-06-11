import type { ReactNode } from 'react';
import clsx from 'clsx';
import { AuroraCanvas } from './AuroraCanvas';
import { AuroraCssField } from './AuroraCssField';
import styles from './AuroraBackground.module.scss';

interface AuroraBackgroundProps {
  children?: ReactNode;
  className?: string;
  showRadialGradient?: boolean;
  /** Fade aurora into `--app-bg` at the bottom (auth hero). */
  fadeBottom?: boolean;
  /** Tag the GPU field so the close-button lens can find + refract this instance. */
  fieldId?: string;
  /** Render the LIVE field as plain CSS (AuroraCssField) instead of the WebGL
   *  canvas — required inside SVG-filtered glass copies (Safari won't filter
   *  accelerated surfaces and drops the whole filter chain when one is present).
   *  Same math, LUTs and clock as the GPU, so it drifts in lockstep. */
  cssReplica?: boolean;
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
  cssReplica = false,
}: AuroraBackgroundProps) {
  return (
    <div className={clsx(styles.root, className)} data-fade-bottom={fadeBottom ? 'true' : 'false'}>
      <div className={styles.backdrop} aria-hidden>
        {cssReplica ? (
          <AuroraCssField className={styles.canvas} />
        ) : (
          <AuroraCanvas
            className={styles.canvas}
            showRadialGradient={showRadialGradient}
            fieldId={fieldId}
          />
        )}
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
