'use client';

import type { PhoneProps } from '@/components/Phone';
import type { GlassConfig } from '@/components/liquid-glass';
import { AppShell } from '@/apps/shared/AppShell';
import { AuroraBackground } from '@/apps/shared/AuroraBackground';

interface PhoneSwagProps extends PhoneProps {
  glassConfig?: GlassConfig;
  showGlassOutline?: boolean;
  glassDemoBg?: boolean;
  externalGlass?: boolean;
  bezelOverlay?: { src: string; opacity: number } | null;
}

function SwagScreen(props: PhoneProps) {
  if (props.persona === 'fintech' && props.phone.screen === 'auth') {
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
  const screen = SwagScreen(phoneProps);
  const screenTone =
    phoneProps.persona === 'fintech' && phoneProps.phone.screen === 'auth' ? 'light' : 'default';

  return (
    <AppShell
      glassConfig={glassConfig}
      showGlassOutline={showGlassOutline}
      glassDemoBg={glassDemoBg}
      externalGlass={externalGlass}
      bezelOverlay={bezelOverlay}
      screenTone={screenTone}
    >
      {screen}
    </AppShell>
  );
}
