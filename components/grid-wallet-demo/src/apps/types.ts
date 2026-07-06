import type { ComponentType } from 'react';
import type { AuthMethod } from '@/data/flow';
import type { MoneySheet, WalletHome } from '@/apps/shared/wallet';

/** The email/phone OTP flow surface — the same conversation DemoPhone has with
 *  a skin's AuthSheet overlay, exposed as DATA for skins that render the flow
 *  INLINE inside their auth screen (registry `inlineAuthFlow`). Passing it as a
 *  prop keeps it on the same render clock as `dismissed`/`leaving`; a
 *  side-channel (store + bridge effect) lags a commit and breeds races. */
export interface SkinAuthFlow {
  method: 'email' | 'phone';
  /** The flow is live (entry armed, code being sent, or code prompt up). */
  open: boolean;
  /** The "sending you a code…" stretch between entry submit and the prompt. */
  sending: boolean;
  /** The verification-code prompt is up. */
  codeActive: boolean;
  onSubmit: (value: string) => void;
  onSubmitCode?: (code: string) => void;
  /** Code step → back to the entry step (re-prompts the entry). */
  onBack?: () => void;
  /** Abandon the whole flow. */
  onCancel?: () => void;
}

/** Contract every skin's auth screen implements, so the shared SignInFlow can
 *  drive it (the sign-in intro `dismissed`/`leaving` beats + method CTAs). */
export interface SkinAuthScreenProps {
  busy?: boolean;
  methods: AuthMethod[];
  dismissed?: boolean;
  leaving?: boolean;
  onSignIn: (method: AuthMethod) => void;
  /** The live OTP flow — ONLY for skins registered with `inlineAuthFlow`
   *  (rendered in place of an AuthSheet overlay). Undefined otherwise. */
  authFlow?: SkinAuthFlow;
}

/** Contract every skin's wallet screen implements. The wallet + money-sheet
 *  brains are hosted ABOVE the skin (SignInFlow's WalletHost) so their state
 *  survives skin switches — the view just reads them and renders. */
export interface SkinWalletScreenProps {
  /** The persistent wallet brain (balance, activity, sheets, card/tap state). */
  home: WalletHome;
  /** The persistent money-sheet brain (step machine, banks, amounts, FX). */
  money: MoneySheet;
  /** One-shot sign-in entrance stagger. */
  entrance?: boolean;
  /** This wallet view mounted because of a SKIN SWITCH, not sign-in. Skins
   *  whose sign-in reveal pre-plays the home stagger elsewhere (marketplace's
   *  auth backdrop) use this to still cascade in on a platform change. */
  switchedIn?: boolean;
  /** A virtual card finished issuing on the phone — log the issue call. */
  onCardIssued?: () => void;
}

export type SkinAuthScreen = ComponentType<SkinAuthScreenProps>;
export type SkinWalletScreen = ComponentType<SkinWalletScreenProps>;

/** Sign-in email/phone OTP overlay (rendered by DemoPhone over the auth screen). */
export type SkinAuthSheet = ComponentType<{
  method?: 'email' | 'phone';
  open: boolean;
  sending?: boolean;
  codeActive?: boolean;
  onSubmit: (value: string) => void;
  onSubmitCode?: (code: string) => void;
  onBack?: () => void;
  onCancel?: () => void;
}>;
