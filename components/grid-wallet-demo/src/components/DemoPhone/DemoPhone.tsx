'use client';

import { useEffect } from 'react';
import type { AuthMethod } from '@/data/flow';
import type { PhoneProps } from '@/components/Phone';
import {
  AppleSignInScreen,
  CreatingScreen,
  CredentialScreen,
  EmailEntryScreen,
  GoogleSignInScreen,
  OtpEntryScreen,
  PhoneEntryScreen,
  PHONE_BRAND,
} from '@/components/Phone';
import { applePopup, googleTokenPopup, preloadOauthPopups } from '@/lib/auth';
import type { GlassConfig } from '@/components/liquid-glass';
import { AuroraSignInFlow } from '@/apps/aurora';
import { PasskeySheet } from '@/apps/aurora/PasskeySheet';
import { AuthSheet, type AuthSheetMethod } from '@/apps/aurora/AuthSheet';
import { SkinnedSignInFlow } from '@/apps/skinned/SkinnedSignInFlow';
import { SKINS } from '@/apps/skinned/registry';
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
  const brand = PHONE_BRAND[props.persona];
  const authMethod = props.signInMethod ?? props.method;
  const isAurora = skin.id === 'aurora';
  // Ported skins render through the shared SkinnedSignInFlow; Aurora keeps its own.
  const skinEntry = isAurora ? undefined : SKINS[props.persona];
  const flowActive = isAurora || Boolean(skinEntry);
  const brandName = skinEntry?.config.brand.name ?? brand.name;
  const SkinNotifField = skinEntry?.NotifField;
  const onAuthScreen = flowActive && props.phone.screen === 'auth';

  const passkeySheet = onAuthScreen ? (
    <PasskeySheet
      open={Boolean(props.passkey?.active)}
      onConfirm={props.passkey?.onConfirm ?? (() => {})}
      onCancel={props.passkey?.onCancel ?? (() => {})}
      brand={brandName}
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
      brand={brandName}
      notifField={SkinNotifField ? <SkinNotifField /> : undefined}
      notifFieldStatic={Boolean(skinEntry)}
    />
  ) : null;

  if (props.email?.active && !flowActive) {
    return <EmailEntryScreen brand={brand} onSubmit={props.email.onSubmit} />;
  }
  if (props.phoneEntry?.active && !flowActive) {
    return <PhoneEntryScreen brand={brand} onSubmit={props.phoneEntry.onSubmit} />;
  }
  if (props.otp?.active && !flowActive) {
    return <OtpEntryScreen onSubmit={props.otp.onSubmit} />;
  }
  if (props.google?.nonce) {
    return (
      <GoogleSignInScreen nonce={props.google.nonce} onCredential={props.google.onCredential} />
    );
  }
  if (props.apple?.nonce) {
    return (
      <AppleSignInScreen nonce={props.apple.nonce} onCredential={props.apple.onCredential} />
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
  const authBridge =
    sheetFlow &&
    props.phone.screen === 'creating' &&
    (sheetSending || Boolean(props.otp?.active) || Boolean(entry?.active));
  // Airbnb-model OAuth: OUR CTA opens the REAL provider popup synchronously
  // inside the tap gesture (any await first would trip popup blockers), and
  // hands the pending promise to the sign-in loop. While the popup is open
  // the phone stays exactly as it is — `popupWait` suppresses the busy look
  // below, while the RAW busy still guards double-fire (a second tap is
  // swallowed before a second window can open).
  const signIn = (m: AuthMethod) => {
    if (m === 'oauth' || m === 'apple') {
      if (props.busy) return;
      props.onSignInWithMethod?.(m, m === 'oauth' ? googleTokenPopup() : applePopup());
      return;
    }
    props.onSignInWithMethod?.(m);
  };
  if (
    flowActive &&
    (props.phone.screen === 'auth' ||
      props.phone.screen === 'wallet' ||
      props.phone.screen === 'card' ||
      authBridge)
  ) {
    const flowScreen: 'auth' | 'wallet' =
      props.phone.screen === 'wallet' || props.phone.screen === 'card' ? 'wallet' : 'auth';
    const flowProps = {
      screen: flowScreen,
      busy: props.busy && !props.popupWait,
      methods: props.methods ?? [props.method],
      onSignIn: signIn,
      skipIntro: props.skipIntro,
      entry: props.walletEntry,
      onQuoteCreate: props.onQuoteCreate,
      onLinkExternalAccount: props.onLinkExternalAccount,
      onTransferExecute: props.onTransferExecute,
      onCardIssued: props.onCardIssued,
      onTapToPay: props.onTapToPay,
      onReceivePayment: props.onReceivePayment,
    };
    // Aurora keeps its own flow; ported skins render via the shared one.
    if (skinEntry) {
      return (
        <SkinnedSignInFlow skin={skinEntry} {...flowProps}>
          {passkeySheet}
          {authSheet}
        </SkinnedSignInFlow>
      );
    }
    return (
      <AuroraSignInFlow {...flowProps}>
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
