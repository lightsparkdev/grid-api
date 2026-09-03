'use client';

import type { GlassConfig } from '@/components/liquid-glass';
import { CardScreen } from '@/apps/card';
import { AppShell } from '@/apps/shared/AppShell';
import { BrandProvider } from '@/apps/shared/brand/BrandContext';
import { brandVars } from '@/apps/shared/brand/brandPalette';
import type { CardHome } from '@/apps/shared/card';
import { OverlayGlassProvider, DEFAULT_OVERLAY_GLASS, type OverlayGlassPresets } from '@/apps/shared/glass';
import type { CardDesign } from '@/data/design';
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
}: DemoPhoneProps) {
  return (
    <OverlayGlassProvider value={overlayGlass ?? DEFAULT_OVERLAY_GLASS}>
      <BrandProvider value={design}>
        <AppShell
          glassConfig={glassConfig}
          showGlassOutline={showGlassOutline}
          glassDemoBg={glassDemoBg}
          externalGlass={externalGlass}
          screenStyle={brandVars(design.color, design.colorEnd)}
        >
          <div className={styles.flow}>
            <CardScreen home={home} />
          </div>
        </AppShell>
      </BrandProvider>
    </OverlayGlassProvider>
  );
}
