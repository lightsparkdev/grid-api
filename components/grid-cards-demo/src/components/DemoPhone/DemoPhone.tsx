'use client';

import type { CSSProperties } from 'react';
import type { PhoneProps } from '@/components/Phone';
import type { GlassConfig } from '@/components/liquid-glass';
import { WalletHost } from '@/apps/WalletHost';
import { AppShell } from '@/apps/shared/AppShell';
import { BrandProvider } from '@/apps/shared/brand/BrandContext';
import { OverlayGlassProvider, DEFAULT_OVERLAY_GLASS, type OverlayGlassPresets } from '@/apps/shared/glass';
import { getAppSkin } from '@/apps/skins';

interface DemoPhoneProps extends PhoneProps {
  glassConfig?: GlassConfig;
  overlayGlass?: OverlayGlassPresets;
  showGlassOutline?: boolean;
  glassDemoBg?: boolean;
  externalGlass?: boolean;
}

/** Demo phone — routes persona → skin UI inside the shared glass shell. */
export function DemoPhone({
  glassConfig,
  overlayGlass,
  showGlassOutline,
  glassDemoBg,
  externalGlass,
  ...phoneProps
}: DemoPhoneProps) {
  const skin = getAppSkin(phoneProps.persona);
  const customizable = skin.id === 'custom';
  const { design } = phoneProps;
  // The customizable skin reads its tint from these tokens (custom/skin.scss).
  const screenStyle = customizable
    ? ({
        '--brand-color': design.color,
        '--brand-color-end': design.colorEnd ?? design.color,
      } as CSSProperties)
    : undefined;

  return (
    <OverlayGlassProvider value={overlayGlass ?? DEFAULT_OVERLAY_GLASS}>
      <BrandProvider value={{ design, customizable }}>
        <AppShell
          glassConfig={glassConfig}
          showGlassOutline={showGlassOutline}
          glassDemoBg={glassDemoBg}
          externalGlass={externalGlass}
          appSkin={skin.id}
          screenStyle={screenStyle}
        >
          <WalletHost
            key={phoneProps.session}
            WalletScreen={skin.WalletScreen}
            skinId={skin.id}
            entry={phoneProps.walletEntry}
            walletOptions={skin.walletOptions}
            onCardIssued={phoneProps.onCardIssued}
            onTapToPay={phoneProps.onTapToPay}
          />
        </AppShell>
      </BrandProvider>
    </OverlayGlassProvider>
  );
}
