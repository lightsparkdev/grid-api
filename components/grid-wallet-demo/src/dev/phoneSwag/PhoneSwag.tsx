'use client';

import type { PhoneProps } from '@/components/Phone';
import type { GlassConfig } from '@/components/liquid-glass';
import { AppShell } from '@/apps/shared/AppShell';

interface PhoneSwagProps extends PhoneProps {
  glassConfig?: GlassConfig;
  showGlassOutline?: boolean;
  glassDemoBg?: boolean;
  externalGlass?: boolean;
  bezelOverlay?: { src: string; opacity: number } | null;
}

/** Swag phone — empty shell until per-use-case screens land. */
export function PhoneSwag({
  glassConfig,
  showGlassOutline,
  glassDemoBg,
  externalGlass,
  bezelOverlay,
}: PhoneSwagProps) {
  return (
    <AppShell
      glassConfig={glassConfig}
      showGlassOutline={showGlassOutline}
      glassDemoBg={glassDemoBg}
      externalGlass={externalGlass}
      bezelOverlay={bezelOverlay}
    />
  );
}
