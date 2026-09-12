/** Headless card types shared by the phone faces. No JSX, no UI. */

/** Tap-to-pay sub-flow phase over the card-home screen. */
export type TapPhase = 'idle' | 'hold' | 'auth' | 'done' | 'declined';

/** A jump command from the Configure sidebar: provision state (so flows are
 *  reachable out of order) then open the target screen/sheet. */
export type WalletEntryTarget =
  | 'card'
  | 'tap'
  | 'reveal'
  | 'wallet'
  | 'freeze'
  | 'limits'
  | 'refund'
  | 'close';

export interface WalletEntry {
  /** Bumped per command so the wallet applies it exactly once. */
  nonce: number;
  /** Instant, animation-free setup so a deep flow is reachable directly. */
  provision?: { issued?: boolean };
  /** Which sheet/view to open after provisioning. */
  open?: WalletEntryTarget;
  /** The phone is already on stage from an earlier flow: start at once
   *  instead of waiting for it to land. */
  phoneUp?: boolean;
}

/** Merchant category for a tap-to-pay / transaction row. WalletListItem maps it to an icon. */
export type MerchantCategory =
  | 'coffee'
  | 'fast-food'
  | 'convenience'
  | 'cafe'
  | 'fashion'
  | 'apparel'
  | 'accessories'
  | 'furniture'
  | 'homeware'
  | 'grocery';

/** A card event in the Activity list, beside the purchases. */
export type ActivityKind = 'issued' | 'frozen' | 'unfrozen' | 'wallet' | 'limits' | 'closed';

/** One Activity row's data: a purchase, or a card event. */
export interface WalletListItemData {
  id: string;
  /** Merchant category, or the card event — WalletListItem maps it to an icon. */
  category?: MerchantCategory | ActivityKind;
  title: string;
  /** Merchant detail line, e.g. "Tap to Pay". */
  detail: string;
  /** Epoch ms — rendered as a live relative label ("Just now", "2m ago"…). */
  timestamp: number;
  /** Formatted amount, e.g. "$7.32". */
  amount: string;
}
