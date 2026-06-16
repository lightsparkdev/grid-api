/** Headless wallet types shared by every skin's view. No JSX, no UI. */

/** Debit-card issuance + card-home view state. */
export type CardView = 'closed' | 'intro' | 'creating' | 'ready' | 'home';

/** Tap-to-pay sub-flow phase over the card-home screen. */
export type TapPhase = 'idle' | 'hold' | 'auth' | 'done';

/** The money movements the wallet reports up so the demo can log API calls. */
export type WalletTransferMode = 'add' | 'withdraw' | 'send';

/** A jump command from the Configure sidebar: provision state (so flows are
 *  reachable out of order) then open the target screen/sheet. */
export type WalletEntryTarget = 'add' | 'withdraw' | 'send' | 'receive' | 'card' | 'tap';

export interface WalletEntry {
  /** Bumped per command so the wallet applies it exactly once. */
  nonce: number;
  /** Instant, animation-free setup so a deep flow is reachable directly. */
  provision?: { issued?: boolean; fundCents?: number };
  /** Which sheet/view to open after provisioning. */
  open?: WalletEntryTarget;
}
