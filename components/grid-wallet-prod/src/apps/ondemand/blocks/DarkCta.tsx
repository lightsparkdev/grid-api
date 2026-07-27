'use client';

import type { ReactNode } from 'react';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import styles from './DarkCta.module.scss';

/** Brand-pink CTA — hugs its contents, 48px tall (the empty-state button). */
export function DarkCta({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  const clip = useSquircleClip<HTMLButtonElement>({ figmaRadii: 8 });
  return (
    <button
      type="button"
      className={styles.pinkCta}
      ref={clip.ref}
      style={clip.style}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
