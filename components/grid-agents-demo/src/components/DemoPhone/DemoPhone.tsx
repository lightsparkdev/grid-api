'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { GlassConfig } from '@/components/liquid-glass';
import { AppShell } from '@/apps/shared/AppShell';
import { OverlayGlassProvider, DEFAULT_OVERLAY_GLASS, type OverlayGlassPresets } from '@/apps/shared/glass';
import { useThemeMode } from '@/hooks/useThemeMode';
import styles from './DemoPhone.module.scss';

interface DemoPhoneProps {
  /** The app on the screen. */
  children: ReactNode;
  glassConfig?: GlassConfig;
  overlayGlass?: OverlayGlassPresets;
  glassDemoBg?: boolean;
  externalGlass?: boolean;
}

/** The person's phone: the connected agent's app inside the shared glass shell. */
export function DemoPhone({ children, glassConfig, overlayGlass, glassDemoBg, externalGlass }: DemoPhoneProps) {
  const dark = useThemeMode() === 'dark';
  // Each agent app paints its own surface; this is what shows for the frame
  // before it mounts.
  const screenStyle: CSSProperties = {
    ['--wallet-bg' as string]: dark ? '#111111' : '#f9f9f9',
    ['--screen-surface' as string]: 'var(--wallet-bg)',
  };
  return (
    <OverlayGlassProvider value={overlayGlass ?? DEFAULT_OVERLAY_GLASS}>
      <AppShell
        glassConfig={glassConfig}
        glassDemoBg={glassDemoBg}
        externalGlass={externalGlass}
        screenStyle={screenStyle}
      >
        <div className={styles.flow}>{children}</div>
      </AppShell>
    </OverlayGlassProvider>
  );
}
