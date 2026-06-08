'use client';

import type { PhoneProps } from '@/components/Phone';
import type { GlassConfig } from '@/components/liquid-glass';
import { AppShell } from '@/apps/shared/AppShell';
import { AuroraBackground } from '@/apps/shared/AuroraBackground';
import { getAppSkin, type AppSkin } from '@/apps/skins';

interface PhoneSwagProps extends PhoneProps {
  glassConfig?: GlassConfig;
  showGlassOutline?: boolean;
  glassDemoBg?: boolean;
  externalGlass?: boolean;
  bezelOverlay?: { src: string; opacity: number } | null;
}

function SwagScreen(props: PhoneProps, skin: AppSkin) {
  if (skin.id === 'aurora' && props.phone.screen === 'auth') {
    return <AuroraBackground />;
  }

  return null;
}

/** Swag phone — per-use-case screens inside the glass shell. */
export function PhoneSwag({
  glassConfig,
  showGlassOutline,
  glassDemoBg,
  externalGlass,
  bezelOverlay,
  ...phoneProps
}: PhoneSwagProps) {
  const skin = getAppSkin(phoneProps.persona);
  const screen = SwagScreen(phoneProps, skin);
  const screenTone =
    phoneProps.phone.screen === 'auth' && skin.authScreenTone
      ? skin.authScreenTone
      : 'default';

  return (
    <AppShell
      glassConfig={glassConfig}
      showGlassOutline={showGlassOutline}
      glassDemoBg={glassDemoBg}
      externalGlass={externalGlass}
      bezelOverlay={bezelOverlay}
      screenTone={screenTone}
      appSkin={skin.id}
    >
      {screen}
    </AppShell>
  );
}
