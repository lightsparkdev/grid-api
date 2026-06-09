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
import { PasskeySheet } from '@/apps/aurora/PasskeySheet';
import { EmailSheet } from '@/apps/aurora/EmailSheet';
import { AppShell } from '@/apps/shared/AppShell';
import { OverlayGlassProvider, DEFAULT_OVERLAY_GLASS, type OverlayGlassPresets } from '@/apps/shared/glass';
import { getAppSkin, type AppSkin } from '@/apps/skins';

interface PhoneSwagProps extends PhoneProps {
  glassConfig?: GlassConfig;
  overlayGlass?: OverlayGlassPresets;
  showGlassOutline?: boolean;
  glassDemoBg?: boolean;
  externalGlass?: boolean;
  bezelOverlay?: { src: string; opacity: number } | null;
}

function SwagScreen(props: PhoneProps, skin: AppSkin) {
  const brand = PHONE_BRAND[props.persona];
  const authMethod = props.signInMethod ?? props.method;
  const isAurora = skin.id === 'aurora';
  const onAuthScreen = isAurora && props.phone.screen === 'auth';

  // Decorative copy of the screen behind a sheet, so the glass refracts the actual
  // auth UI instead of a static gradient (BottomSheet disables pointer events, so
  // the no-op handler never fires).
  const authBehind = <AuroraAuthScreen busy={props.busy} onSignIn={() => {}} />;

  const passkeySheet = onAuthScreen ? (
    <PasskeySheet
      open={Boolean(props.passkey?.active)}
      onConfirm={props.passkey?.onConfirm ?? (() => {})}
      onCancel={props.passkey?.onCancel ?? (() => {})}
      behind={authBehind}
    />
  ) : null;

  // Aurora gets the email entry as a floating (inset) sheet over the auth screen;
  // other skins keep the full-screen entry below.
  const emailSheet = onAuthScreen ? (
    <EmailSheet
      open={Boolean(props.email?.active)}
      onSubmit={props.email?.onSubmit ?? (() => {})}
      behind={authBehind}
    />
  ) : null;

  if (props.email?.active && !isAurora) {
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
      if (isAurora) {
        return (
          <>
            <AuroraAuthScreen
              busy={props.busy}
              onSignIn={props.onSignInWithMethod ?? (() => {})}
            />
            {passkeySheet}
            {emailSheet}
          </>
        );
      }
      return passkeySheet;
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
  overlayGlass,
  showGlassOutline,
  glassDemoBg,
  externalGlass,
  bezelOverlay,
  ...phoneProps
}: PhoneSwagProps) {
  const skin = getAppSkin(phoneProps.persona);
  const screen = SwagScreen(phoneProps, skin);

  return (
    <OverlayGlassProvider value={overlayGlass ?? DEFAULT_OVERLAY_GLASS}>
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
    </OverlayGlassProvider>
  );
}
