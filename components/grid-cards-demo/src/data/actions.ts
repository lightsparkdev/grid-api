/* Action-driven playground model. The user freely triggers actions on the
   card; each produces a short on-phone sequence + Grid API calls. The wallet
   actions (add/send/receive/withdraw) stay in the model because the skins'
   shared brain still drives them; the Cards picker doesn't expose them. */

import type { PhoneState, Tx } from './flow';

export interface WalletState {
  created: boolean;
  balanceCents: number;
  hasCard: boolean;
  cardActivated: boolean;
  activity: Tx[];
}

export const initialWallet: WalletState = {
  // No sign-in in the Cards playground: the cardholder is already onboarded.
  created: true,
  balanceCents: 0,
  hasCard: false,
  cardActivated: false,
  activity: [],
};

/** Sticky "done at least once" markers for the sidebar flow checkmarks. Kept
 *  separate from WalletState (the live-session mirror); only Reset clears them. */
export interface CompletedFlows {
  add: boolean;
  send: boolean;
  receive: boolean;
  withdraw: boolean;
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
  add: false,
  send: false,
  receive: false,
  withdraw: false,
  card: false,
  tap: false,
  reveal: false,
  wallet: false,
  freeze: false,
  limits: false,
  refund: false,
  close: false,
};

export function fmt(cents: number): string {
  return (
    '$' +
    (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

export type ActionId =
  | 'add'
  | 'send'
  | 'receive'
  | 'withdraw'
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
  // Every flow is always reachable — clicking one fast-forwards whatever setup
  // it needs (funds, a card), so the demo isn't a linear track.
  {
    id: 'add',
    label: 'Add money',
    desc: 'Fund from a linked bank',
    icon: 'plus',
    available: () => true,
    done: (c) => c.add,
  },
  {
    id: 'send',
    label: 'Send payment',
    desc: 'Pay another account',
    icon: 'send',
    available: () => true,
    done: (c) => c.send,
  },
  {
    id: 'receive',
    label: 'Receive payment',
    desc: 'Get paid into your account',
    icon: 'receive',
    available: () => true,
    done: (c) => c.receive,
  },
  {
    id: 'withdraw',
    label: 'Withdraw',
    desc: 'Cash out to a bank',
    icon: 'bank',
    available: () => true,
    done: (c) => c.withdraw,
  },
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

/** Resolve the phone view for a settled wallet state. */
export function phoneFromState(s: WalletState): PhoneState {
  return {
    screen: s.hasCard ? 'card' : 'wallet',
    balance: fmt(s.balanceCents),
    hasCard: s.hasCard,
    cardActivated: s.cardActivated,
    activity: s.activity,
  };
}
