'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import { GlassOver } from '@/components/liquid-glass';
import { useOverlayGlass } from '@/apps/shared/glass';
import styles from './GlassCta.module.scss';

interface GlassCtaProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

/** ChatsApp primary CTA — Aurora's glass pill language retinted brand green.
 *  The refracted backdrop is `--msg-cta-glass` (skin.scss), so light/dark
 *  retint via tokens without touching the shared GlassTextButton. */
export function GlassCta({ children, className, type = 'button', ...rest }: GlassCtaProps) {
  const overlayGlass = useOverlayGlass();

  return (
    <button type={type} className={clsx(styles.root, className)} {...rest}>
      <GlassOver
        className={styles.glass}
        backdrop="var(--msg-cta-glass)"
        {...overlayGlass.text}
      >
        <span className={styles.label}>{children}</span>
      </GlassOver>
    </button>
  );
}
