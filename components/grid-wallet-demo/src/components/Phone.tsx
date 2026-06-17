import type { AuthMethod, Persona, PhoneState } from '@/data/flow';
import type { ActionId, WalletState } from '@/data/actions';
import type { WalletEntry, WalletTransferMode } from '@/apps/aurora/wallet';
import type { ExternalAccountInput, ReceivePaymentInfo, TransferDest } from '@/data/apiCalls';

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
  email?: { active: boolean; onSubmit: (email: string) => void; onCancel?: () => void };
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
