'use client';

import type { ReactNode } from 'react';
import { PHONE_SHELL_GLASS, type GlassConfig } from '@/components/liquid-glass';
import { CardScreen } from '@/apps/card';
import { AppShell } from '@/apps/shared/AppShell';
import { BrandProvider } from '@/apps/shared/brand/BrandContext';
import { brandVars } from '@/apps/shared/brand/brandPalette';
import type { CardHome } from '@/apps/shared/card';
import { OverlayGlassProvider, DEFAULT_OVERLAY_GLASS, type OverlayGlassPresets } from '@/apps/shared/glass';
import { brandColorOf, type CardDesign } from '@/data/design';
import styles from './DemoPhone.module.scss';

/** The shell's top-right corner is tighter than the others: it makes room in
 *  the bezel for the stage's close (AppPanel), tangent to the screen's curve. */
export const CLOSE_CORNER_RADIUS = 32;

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
  const shell = glassConfig ?? PHONE_SHELL_GLASS;
  return (
    <OverlayGlassProvider value={overlayGlass ?? DEFAULT_OVERLAY_GLASS}>
      <BrandProvider value={design}>
        <AppShell
          glassConfig={glassConfig}
          showGlassOutline={showGlassOutline}
          glassDemoBg={glassDemoBg}
          externalGlass={externalGlass}
          screenStyle={brandVars(brandColorOf(design))}
          stageChrome={stageChrome}
          shellRadii={[shell.radius, CLOSE_CORNER_RADIUS, shell.radius, shell.radius]}
        >
          <div className={styles.flow}>
            <CardScreen home={home} />
          </div>
        </AppShell>
      </BrandProvider>
    </OverlayGlassProvider>
  );
}
