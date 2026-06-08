'use client';

import type { PhoneProps } from '@/components/Phone';
import {
  AmountEntryScreen,
  CreatingScreen,
  CredentialScreen,
  EmailEntryScreen,
  GoogleSignInScreen,
  OtpEntryScreen,
  PHONE_BRAND,
} from '@/components/Phone';
import type { GlassConfig } from '@/components/liquid-glass';
import { AuroraAuthScreen } from '@/apps/aurora';
import { AppShell } from '@/apps/shared/AppShell';
import { getAppSkin, type AppSkin } from '@/apps/skins';

interface PhoneSwagProps extends PhoneProps {
  glassConfig?: GlassConfig;
  showGlassOutline?: boolean;
  glassDemoBg?: boolean;
  externalGlass?: boolean;
  bezelOverlay?: { src: string; opacity: number } | null;
}

function SwagScreen(props: PhoneProps, skin: AppSkin) {
  const brand = PHONE_BRAND[props.persona];
  const authMethod = props.signInMethod ?? props.method;

  if (props.email?.active) {
    return <EmailEntryScreen brand={brand} onSubmit={props.email.onSubmit} />;
  }
  if (props.otp?.active) {
    return <OtpEntryScreen onSubmit={props.otp.onSubmit} />;
  }
  if (props.google?.nonce) {
    return (
      <GoogleSignInScreen nonce={props.google.nonce} onCredential={props.google.onCredential} />
    );
  }
  if (props.amount?.config) {
    return (
      <AmountEntryScreen
        config={props.amount.config}
        onSubmit={props.amount.onSubmit}
        onCancel={props.amount.onCancel}
      />
    );
  }

  switch (props.phone.screen) {
    case 'auth':
      if (skin.id === 'aurora') {
        return (
          <AuroraAuthScreen
            busy={props.busy}
            onSignIn={props.onSignInWithMethod ?? (() => {})}
          />
        );
      }
      return null;
    case 'creating':
      return <CreatingScreen brand={brand} note={props.phone.note} />;
    case 'credential':
      return <CredentialScreen method={authMethod} />;
    default:
      return null;
  }
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

  return (
    <AppShell
      glassConfig={glassConfig}
      showGlassOutline={showGlassOutline}
      glassDemoBg={glassDemoBg}
      externalGlass={externalGlass}
      bezelOverlay={bezelOverlay}
      appSkin={skin.id}
    >
      {screen}
    </AppShell>
  );
}
