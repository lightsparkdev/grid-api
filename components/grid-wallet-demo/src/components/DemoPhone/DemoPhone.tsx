'use client';

import { useEffect } from 'react';
import type { AuthMethod } from '@/data/flow';
import type { PhoneProps } from '@/components/Phone';
import { applePopup, googleTokenPopup, preloadOauthPopups } from '@/lib/auth';
import type { GlassConfig } from '@/components/liquid-glass';
import { SignInFlow } from '@/apps/SignInFlow';
import { PasskeySheet } from '@/apps/shared/PasskeySheet';
import { AuthSheet as AuroraAuthSheet, type AuthSheetMethod } from '@/apps/aurora/AuthSheet';
import { AppShell } from '@/apps/shared/AppShell';
import { FaceIdAuth } from '@/apps/shared/FaceIdAuth';
import { OverlayGlassProvider, DEFAULT_OVERLAY_GLASS, type OverlayGlassPresets } from '@/apps/shared/glass';
import { getAppSkin, type AppSkin } from '@/apps/skins';

interface DemoPhoneProps extends PhoneProps {
  glassConfig?: GlassConfig;
  overlayGlass?: OverlayGlassPresets;
  showGlassOutline?: boolean;
  glassDemoBg?: boolean;
  externalGlass?: boolean;
}

function DemoScreen(props: PhoneProps, skin: AppSkin) {
  const authMethod = props.signInMethod ?? props.method;
  const flowActive = Boolean(skin.AuthScreen && skin.WalletScreen);
  // AuthSheet (branded OTP UI) is per-skin — fall back to Aurora's when a skin
  // omits it. PasskeySheet is shared iOS system chrome (apps/shared/PasskeySheet).
  const AuthSheet = skin.AuthSheet ?? AuroraAuthSheet;
  const onAuthScreen = flowActive && props.phone.screen === 'auth';

  const passkeySheet = onAuthScreen ? (
    <PasskeySheet
      open={Boolean(props.passkey?.active)}
      appName={skin.label}
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
  const sheetFlow = flowActive && sheetMethod !== null;
  const sheetSending = Boolean(
    sheetFlow &&
      props.phone.screen === 'creating' &&
      !entry?.active &&
      !props.otp?.active,
  );
  const authSheet = flowActive ? (
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

  // Airbnb-model OAuth: OUR CTA opens the REAL provider popup synchronously
  // inside the tap gesture (any await first would trip popup blockers), and
  // hands the pending promise to the sign-in loop. While the popup is open the
  // phone stays exactly as it is — `popupWait` suppresses the busy look.
  const signIn = (m: AuthMethod) => {
    if (m === 'oauth' || m === 'apple') {
      if (props.busy) return;
      props.onSignInWithMethod?.(m, m === 'oauth' ? googleTokenPopup() : applePopup());
      return;
    }
    props.onSignInWithMethod?.(m);
  };

  // Aurora is the only built skin; its auth ⇄ wallet pair renders through ONE
  // stable component so the post-sign-in intro can hold the auth screen across
  // the flip — including the OTP 'creating' stretch, which the sheet bridges.
  if (!flowActive) return null;
  return (
    <SignInFlow
      AuthScreen={skin.AuthScreen!}
      WalletScreen={skin.WalletScreen!}
      screen={
        props.phone.screen === 'wallet' || props.phone.screen === 'card' ? 'wallet' : 'auth'
      }
      busy={props.busy && !props.popupWait}
      methods={props.methods ?? [props.method]}
      onSignIn={signIn}
      skipIntro={props.skipIntro}
      entry={props.walletEntry}
      onQuoteCreate={props.onQuoteCreate}
      onLinkExternalAccount={props.onLinkExternalAccount}
      onTransferExecute={props.onTransferExecute}
      onCardIssued={props.onCardIssued}
      onTapToPay={props.onTapToPay}
      onReceivePayment={props.onReceivePayment}
    >
      {passkeySheet}
      {authSheet}
    </SignInFlow>
  );
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
  const screen = DemoScreen(phoneProps, skin);

  // Warm the GIS / Apple JS scripts so a Google/Apple CTA tap can open its
  // popup synchronously inside the gesture (popup blockers).
  useEffect(() => {
    preloadOauthPopups();
  }, []);

  return (
    <OverlayGlassProvider value={overlayGlass ?? DEFAULT_OVERLAY_GLASS}>
      <AppShell
        glassConfig={glassConfig}
        showGlassOutline={showGlassOutline}
        glassDemoBg={glassDemoBg}
        externalGlass={externalGlass}
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
