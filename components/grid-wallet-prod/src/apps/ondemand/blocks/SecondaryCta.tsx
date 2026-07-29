'use client';

import type { ReactNode } from 'react';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import styles from './SecondaryCta.module.scss';

/** Secondary CTA — the Uber "Update" pill voice (IMG_0680): compact grey
 *  fill, black label, hugs its contents. */
export function SecondaryCta({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  const clip = useSquircleClip<HTMLButtonElement>({ figmaRadii: 8 });
  return (
    <button
      type="button"
      className={styles.cta}
      ref={clip.ref}
      style={clip.style}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
