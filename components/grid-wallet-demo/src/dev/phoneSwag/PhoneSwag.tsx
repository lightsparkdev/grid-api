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
import { AuroraSignInFlow } from '@/apps/aurora';
import { PasskeySheet } from '@/apps/aurora/PasskeySheet';
import { EmailSheet } from '@/apps/aurora/EmailSheet';
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

  // Aurora's email flow lives in ONE floating sheet across email entry → the
  // sending beat → the verification code, so the contents push between steps
  // instead of swapping screens. The demo logic flips phone.screen to
  // 'creating' between the email and OTP prompts ("Sending you a code…") and
  // keeps it there during OTP — aurora rides that whole stretch on the auth
  // screen with the sheet held open (Continue spins through the gap).
  const emailOtpFlow = isAurora && authMethod === 'email_otp';
  const emailSending = Boolean(
    emailOtpFlow &&
      props.phone.screen === 'creating' &&
      !props.email?.active &&
      !props.otp?.active,
  );
  const emailSheet = isAurora ? (
    <EmailSheet
      open={Boolean(props.email?.active || emailSending || props.otp?.active)}
      sending={emailSending}
      codeActive={Boolean(props.otp?.active)}
      onSubmit={props.email?.onSubmit ?? (() => {})}
      onSubmitCode={props.otp?.onSubmit}
      // The X is BACK past the first step (code → email re-prompt); the scrim
      // still cancels the whole flow.
      onBack={props.otp?.onBack}
      onCancel={props.otp?.active ? props.otp?.onCancel : props.email?.onCancel}
    />
  ) : null;

  if (props.email?.active && !isAurora) {
    return <EmailEntryScreen brand={brand} onSubmit={props.email.onSubmit} />;
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
  // email flow's 'creating' stretch (sending beat + OTP entry) stays on the
  // auth screen too — the sheet bridges it.
  const auroraEmailBridge =
    emailOtpFlow &&
    props.phone.screen === 'creating' &&
    (emailSending || Boolean(props.otp?.active));
  if (
    isAurora &&
    (props.phone.screen === 'auth' || props.phone.screen === 'wallet' || auroraEmailBridge)
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
        {emailSheet}
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
