/* Action-driven playground model. The user freely triggers actions on the
   card; each produces a short on-phone sequence + Grid API calls. */

/** The demo's mirror of the cardholder's state (the phone brain owns the live
 *  UI state; this gates the sidebar). */
export interface WalletState {
  hasCard: boolean;
  balanceCents: number;
}

/** Opening balance of the card's funding source (Checking •••• 2502), cents. */
export const FUNDING_SOURCE_CENTS = 500_000;

export const initialWallet: WalletState = {
  hasCard: false,
  balanceCents: FUNDING_SOURCE_CENTS,
};

/** Sticky "done at least once" markers for the sidebar flow checkmarks. Kept
 *  separate from WalletState (the live-session mirror); only Reset clears them. */
export interface CompletedFlows {
  card: boolean;
  tap: boolean;
  reveal: boolean;
  wallet: boolean;
  freeze: boolean;
  limits: boolean;
  refund: boolean;
  close: boolean;
}

export const initialCompleted: CompletedFlows = {
  card: false,
  tap: false,
  reveal: false,
  wallet: false,
  freeze: false,
  limits: false,
  refund: false,
  close: false,
};

export type ActionId =
  | 'card'
  | 'tap'
  | 'reveal'
  | 'wallet'
  | 'freeze'
  | 'limits'
  | 'refund'
  | 'close';

export interface ActionDef {
  id: ActionId;
  label: string;
  desc: string;
  icon: string; // resolved to a central-icons component in the Sidebar
  available: (s: WalletState) => boolean;
  done?: (c: CompletedFlows) => boolean;
}

export const ACTIONS: ActionDef[] = [
  // Every flow is always reachable — clicking one fast-forwards a card if
  // needed, so the demo isn't a linear track.
  {
    id: 'card',
    label: 'Issue a card',
    desc: 'Virtual card for the balance',
    icon: 'card',
    available: () => true,
    done: (c) => c.card,
  },
  {
    id: 'tap',
    label: 'Tap to pay',
    desc: 'Spend at a store',
    icon: 'tap',
    available: () => true,
    done: (c) => c.tap,
  },
  {
    id: 'reveal',
    label: 'Reveal details',
    desc: 'Show the card number, expiry, and CVV',
    icon: 'reveal',
    available: () => true,
    done: (c) => c.reveal,
  },
  {
    id: 'wallet',
    label: 'Add to wallet',
    desc: 'Provision to Apple Wallet',
    icon: 'wallet',
    available: () => true,
    done: (c) => c.wallet,
  },
  {
    id: 'freeze',
    label: 'Freeze',
    desc: 'Pause the card',
    icon: 'freeze',
    available: () => true,
    done: (c) => c.freeze,
  },
  {
    id: 'limits',
    label: 'Limits',
    desc: 'Set per-transaction and daily caps',
    icon: 'limits',
    available: () => true,
    done: (c) => c.limits,
  },
  {
    id: 'refund',
    label: 'Refund',
    desc: 'Merchant returns a purchase',
    icon: 'refund',
    available: () => true,
    done: (c) => c.refund,
  },
  {
    id: 'close',
    label: 'Close',
    desc: 'Close the card',
    icon: 'close',
    available: () => true,
    done: (c) => c.close,
  },
];
