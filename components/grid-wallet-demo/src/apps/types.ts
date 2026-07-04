import type { ComponentType } from 'react';
import type { AuthMethod } from '@/data/flow';
import type { MoneySheet, WalletHome } from '@/apps/shared/wallet';

/** Contract every skin's auth screen implements, so the shared SignInFlow can
 *  drive it (the sign-in intro `dismissed`/`leaving` beats + method CTAs). */
export interface SkinAuthScreenProps {
  busy?: boolean;
  methods: AuthMethod[];
  dismissed?: boolean;
  leaving?: boolean;
  onSignIn: (method: AuthMethod) => void;
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
