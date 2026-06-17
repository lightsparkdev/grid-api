import type { ComponentType } from 'react';
import type { AuthMethod } from '@/data/flow';
import type { ExternalAccountInput, ReceivePaymentInfo, TransferDest } from '@/data/apiCalls';
import type { WalletEntry, WalletTransferMode } from '@/apps/shared/wallet';

/** Contract every skin's auth screen implements, so the shared SignInFlow can
 *  drive it (the sign-in intro `dismissed`/`leaving` beats + method CTAs). */
export interface SkinAuthScreenProps {
  busy?: boolean;
  methods: AuthMethod[];
  dismissed?: boolean;
  leaving?: boolean;
  onSignIn: (method: AuthMethod) => void;
}

/** Contract every skin's wallet screen implements. All app logic lives in the
 *  shared `useWalletHome`; these are the demo wiring + sign-in entrance. */
export interface SkinWalletScreenProps {
  balance?: string;
  entrance?: boolean;
  entry?: WalletEntry;
  onQuoteCreate?: (mode: WalletTransferMode, cents: number, dest?: TransferDest) => void;
  onLinkExternalAccount?: (input: ExternalAccountInput, label: string) => void;
  onTransferExecute?: (mode: WalletTransferMode, cents: number) => void;
  onCardIssued?: () => void;
  onTapToPay?: (cents: number, merchant: string) => void;
  onReceivePayment?: (info: ReceivePaymentInfo) => void;
}

export type SkinAuthScreen = ComponentType<SkinAuthScreenProps>;
export type SkinWalletScreen = ComponentType<SkinWalletScreenProps>;

/** Sign-in passkey-save overlay (rendered by DemoPhone over the auth screen). */
export type SkinPasskeySheet = ComponentType<{
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}>;

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
