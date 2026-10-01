'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { GlassConfig } from '@/components/liquid-glass';
import { CardScreen } from '@/apps/card';
import { AppShell } from '@/apps/shared/AppShell';
import { BrandProvider } from '@/apps/shared/brand/BrandContext';
import { brandVars } from '@/apps/shared/brand/brandPalette';
import type { CardHome } from '@/apps/shared/card';
import { OverlayGlassProvider, DEFAULT_OVERLAY_GLASS, type OverlayGlassPresets } from '@/apps/shared/glass';
import { brandColorOf, type CardDesign } from '@/data/design';
import { useThemeMode } from '@/hooks/useThemeMode';
import styles from './DemoPhone.module.scss';

interface DemoPhoneProps {
  design: CardDesign;
  /** The card brain, hosted above so the stage card renders from the same state. */
  home: CardHome;
  glassConfig?: GlassConfig;
  overlayGlass?: OverlayGlassPresets;
  showGlassOutline?: boolean;
  glassDemoBg?: boolean;
  externalGlass?: boolean;
  /** Stage controls against the phone's outer box (see AppShell). */
  stageChrome?: ReactNode;
}

/** The cardholder's phone — the card app inside the shared glass shell, tinted by the design. */
export function DemoPhone({
  design,
  home,
  glassConfig,
  overlayGlass,
  showGlassOutline,
  glassDemoBg,
  externalGlass,
  stageChrome,
}: DemoPhoneProps) {
  const dark = useThemeMode() === 'dark';
  // The screen's surface is the app's background (Figma DS.screenBackground:
  // off-white a hair below the #fff cards; its off-black mirror in dark). It
  // is painted by the screen under the stage's canvas, so the card shows
  // through the app's empty slot; the app's own root is transparent.
  const screenStyle: CSSProperties = {
    ...brandVars(brandColorOf(design)),
    ['--wallet-bg' as string]: dark ? '#111111' : '#f9f9f9',
    ['--screen-surface' as string]: 'var(--wallet-bg)',
  };
  return (
    <OverlayGlassProvider value={overlayGlass ?? DEFAULT_OVERLAY_GLASS}>
      <BrandProvider value={design}>
        <AppShell
          glassConfig={glassConfig}
          showGlassOutline={showGlassOutline}
          glassDemoBg={glassDemoBg}
          externalGlass={externalGlass}
          screenStyle={screenStyle}
          stageChrome={stageChrome}
        >
          <div className={styles.flow}>
            <CardScreen home={home} />
          </div>
        </AppShell>
      </BrandProvider>
    </OverlayGlassProvider>
  );
}
