'use client';

import { usePhoneFitScale } from './usePhoneFitScale';
import styles from './AppShell.module.scss';

/**
 * Shared phone bezel — Figma phone-gga (2121:17475).
 * 434×906 outer shell, 16px pad, 402×874 inner screen. Glass TBD.
 */
export function AppShell() {
  const { wrapRef, scale } = usePhoneFitScale();

  return (
    <div className={styles.stage} ref={wrapRef}>
      <div className={styles.scaled} style={{ transform: `scale(${scale})` }}>
        <div className={styles.shell}>
          <div className={styles.screen} />
        </div>
      </div>
    </div>
  );
}
