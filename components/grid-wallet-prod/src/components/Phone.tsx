import type { AuthMethod, Persona, PhoneState } from '@/data/flow';
import type { ActionId, WalletState } from '@/data/actions';
import type { WalletEntry, WalletTransferMode } from '@/apps/aurora/wallet';
import type { SavedBank } from '@/apps/shared/wallet';
import type { ExternalAccountInput, ReceivePaymentInfo, TransferDest } from '@/data/apiCalls';
import type { DepositInstructions } from '@/lib/gridReads';

/**
 * The demo phone's prop contract (AppPanel → DemoPhone). The live UI is the
 * Aurora skin under `apps/aurora/*`; this file is just the shared type.
 */
export interface PhoneProps {
  phone: PhoneState;
  wallet: WalletState;
  persona: Persona;
  method: AuthMethod;
  /** Method chosen on swag auth buttons (falls back to `method`). */
  signInMethod?: AuthMethod;
  onAction: (id: ActionId) => void;
  /** `popup` = a real provider popup already opened inside the tap gesture
   *  (the aurora Google/Apple CTAs) — the sign-in flow awaits it. */
  onSignInWithMethod?: (method: AuthMethod, popup?: Promise<string>) => void;
  busy: boolean;
  /** A provider popup is pending — aurora suppresses its busy look so the
   *  phone stays exactly as it is while the popup is open. */
  popupWait?: boolean;
  passkey?: { active: boolean; onConfirm: () => void; onCancel: () => void };
  faceId?: { active: boolean; onDone: () => void };
  otp?: {
    active: boolean;
    onSubmit: (code: string) => void;
    onCancel?: () => void;
    onBack?: () => void;
  };
  email?: {
    active: boolean;
    /** The address the live EMAIL_OTP credential is tied to — prefills the field. */
    prefill?: string | null;
    onSubmit: (email: string) => void;
    onCancel?: () => void;
  };
  /** The account has no passkey yet + the action that adds one (wallet nudge). */
  addPasskey?: { added: boolean; onAdd: () => void };
  /** Real deposit details for the customer's fiat account (Add money). */
  depositInstructions?: DepositInstructions | null;
  /** The wallet account's total balance in cents (USDB `totalBalance`). */
  totalCents?: number;
  /** One-shot toast raised by an arrival webhook (nonce bumps per delivery). */
  walletToast?: { nonce: number; text: string } | null;
  /** Terminal outcome of the pending outbound transfer (poll or webhook). */
  transferOutcome?: { nonce: number; ok: boolean } | null;
  /** Accounts Grid already holds, seeding the saved-banks list. */
  storedBanks?: SavedBank[];
  /** A stored account was picked — quote against that ExternalAccount id. */
  onSelectStoredBank?: (externalAccountId: string | null) => void;
  /** A country's deposit details came into (or left) view. */
  onDepositView?: (view: { label: string; currency: string; cents?: number } | null) => void;
  /** Bumped by the panel's "Simulate funding" button. */
  simulateDeposit?: { nonce: number; cents: number; last4: string } | null;
  /** Phone-number entry (the SMS flow's first step) — mirrors `email`. */
  phoneEntry?: { active: boolean; onSubmit: (number: string) => void; onCancel?: () => void };
  google?: { nonce: string | null; onCredential: (idToken: string) => void };
  apple?: { nonce: string | null; onCredential: (idToken: string) => void };
  /** Auth methods selected in Configure — drives which aurora auth CTAs show. */
  methods?: AuthMethod[];
  /** Jump command for the aurora wallet (sidebar → provision + open a flow). */
  walletEntry?: WalletEntry;
  /** Skip the sign-in intro hold for fast-forward jumps. */
  skipIntro?: boolean;
  /** Aurora wallet events bubbled up so the demo logs the matching Grid calls. */
  onQuoteCreate?: (mode: WalletTransferMode, cents: number, dest?: TransferDest) => void;
  onLinkExternalAccount?: (input: ExternalAccountInput, label: string) => void;
  onTransferExecute?: (mode: WalletTransferMode, cents: number) => void;
  onCardIssued?: () => void;
  onTapToPay?: (cents: number, merchant: string) => void;
  onReceivePayment?: (info: ReceivePaymentInfo) => void;
}
