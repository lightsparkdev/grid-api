'use client';

import type { PhoneProps } from '@/components/Phone';
import {
  AmountEntryScreen,
  CreatingScreen,
  CredentialScreen,
  EmailEntryScreen,
  GoogleSignInScreen,
  OtpEntryScreen,
  PhoneEntryScreen,
  PHONE_BRAND,
} from '@/components/Phone';
import type { GlassConfig } from '@/components/liquid-glass';
import { AuroraSignInFlow } from '@/apps/aurora';
import { PasskeySheet } from '@/apps/aurora/PasskeySheet';
import { AuthSheet, type AuthSheetMethod } from '@/apps/aurora/AuthSheet';
import { AppShell } from '@/apps/shared/AppShell';
import { FaceIdAuth } from '@/apps/shared/FaceIdAuth';
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

  const passkeySheet = onAuthScreen ? (
    <PasskeySheet
      open={Boolean(props.passkey?.active)}
      onConfirm={props.passkey?.onConfirm ?? (() => {})}
      onCancel={props.passkey?.onCancel ?? (() => {})}
    />
  ) : null;

  // Aurora's OTP flows (email AND phone) live in ONE floating sheet across
  // entry → the sending beat → the verification code, so the contents push
  // between steps instead of swapping screens. The demo logic flips
  // phone.screen to 'creating' between the entry and OTP prompts ("Sending
  // you a code…") and keeps it there during OTP — aurora rides that whole
  // stretch on the auth screen with the sheet held open (Continue spins
  // through the gap).
  const sheetMethod: AuthSheetMethod | null =
    authMethod === 'email_otp' ? 'email' : authMethod === 'sms' ? 'phone' : null;
  const entry = sheetMethod === 'phone' ? props.phoneEntry : props.email;
  const sheetFlow = isAurora && sheetMethod !== null;
  const sheetSending = Boolean(
    sheetFlow &&
      props.phone.screen === 'creating' &&
      !entry?.active &&
      !props.otp?.active,
  );
  const authSheet = isAurora ? (
    <AuthSheet
      method={sheetMethod ?? 'email'}
      open={Boolean(entry?.active || sheetSending || props.otp?.active)}
      sending={sheetSending}
      codeActive={Boolean(props.otp?.active)}
      onSubmit={entry?.onSubmit ?? (() => {})}
      onSubmitCode={props.otp?.onSubmit}
      // The X is BACK past the first step (code → entry re-prompt); the scrim
      // still cancels the whole flow.
      onBack={props.otp?.onBack}
      onCancel={props.otp?.active ? props.otp?.onCancel : entry?.onCancel}
    />
  ) : null;

  if (props.email?.active && !isAurora) {
    return <EmailEntryScreen brand={brand} onSubmit={props.email.onSubmit} />;
  }
  if (props.phoneEntry?.active && !isAurora) {
    return <PhoneEntryScreen brand={brand} onSubmit={props.phoneEntry.onSubmit} />;
  }
  if (props.otp?.active && !isAurora) {
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

  // Aurora's auth ⇄ wallet pair renders through ONE stable component so the
  // post-sign-in intro can hold the auth screen across the screen flip. The
  // OTP flows' 'creating' stretch (sending beat + OTP entry) stays on the
  // auth screen too — the sheet bridges it.
  // entry.active is part of the bridge too: backing out of the OTP re-arms
  // the entry prompt while the screen state is still 'creating' for a beat —
  // and without it that frame falls through to the full-screen creating view,
  // unmounting (and instantly remounting) the whole aurora flow + sheet.
  const auroraAuthBridge =
    sheetFlow &&
    props.phone.screen === 'creating' &&
    (sheetSending || Boolean(props.otp?.active) || Boolean(entry?.active));
  if (
    isAurora &&
    (props.phone.screen === 'auth' || props.phone.screen === 'wallet' || auroraAuthBridge)
  ) {
    return (
      <AuroraSignInFlow
        screen={props.phone.screen === 'wallet' ? 'wallet' : 'auth'}
        busy={props.busy}
        onSignIn={props.onSignInWithMethod ?? (() => {})}
        balance={props.phone.balance}
        onAction={props.onAction}
      >
        {passkeySheet}
        {authSheet}
      </AuroraSignInFlow>
    );
  }

  switch (props.phone.screen) {
    case 'auth':
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
        screenOverlay={
          <FaceIdAuth
            active={Boolean(phoneProps.faceId?.active)}
            onDone={phoneProps.faceId?.onDone ?? (() => {})}
          />
        }
      >
        {screen}
      </AppShell>
    </OverlayGlassProvider>
  );
}
