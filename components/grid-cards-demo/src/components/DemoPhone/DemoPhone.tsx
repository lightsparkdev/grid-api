'use client';

import type { PhoneProps } from '@/components/Phone';
import type { GlassConfig } from '@/components/liquid-glass';
import { CardHost } from '@/apps/CardHost';
import { AppShell } from '@/apps/shared/AppShell';
import { BrandProvider } from '@/apps/shared/brand/BrandContext';
import { brandVars } from '@/apps/shared/brand/brandPalette';
import { OverlayGlassProvider, DEFAULT_OVERLAY_GLASS, type OverlayGlassPresets } from '@/apps/shared/glass';

interface DemoPhoneProps extends PhoneProps {
  glassConfig?: GlassConfig;
  overlayGlass?: OverlayGlassPresets;
  showGlassOutline?: boolean;
  glassDemoBg?: boolean;
  externalGlass?: boolean;
}

/** Demo phone — the card app inside the shared glass shell, tinted by the design. */
export function DemoPhone({
  glassConfig,
  overlayGlass,
  showGlassOutline,
  glassDemoBg,
  externalGlass,
  ...phoneProps
}: DemoPhoneProps) {
  const { design } = phoneProps;

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
          <CardHost
            key={phoneProps.session}
            entry={phoneProps.walletEntry}
            onCardIssued={phoneProps.onCardIssued}
            onTapToPay={phoneProps.onTapToPay}
            onTapDeclined={phoneProps.onTapDeclined}
            cardOptions={phoneProps.cardOptions}
          />
        </AppShell>
      </BrandProvider>
    </OverlayGlassProvider>
  );
}
