/* Action-driven playground model. The user freely triggers actions on the
   Global Account; each produces a short on-phone sequence + Grid API calls. */

import type { PhoneState, Tx } from './flow';

export interface WalletState {
  created: boolean;
  balanceCents: number;
  hasCard: boolean;
  cardActivated: boolean;
  activity: Tx[];
}

export const initialWallet: WalletState = {
  created: false,
  balanceCents: 0,
  hasCard: false,
  cardActivated: false,
  activity: [],
};

/** Sticky "done at least once" markers for the sidebar flow checkmarks. Kept
 *  separate from WalletState (the live-session mirror, which resets when you
 *  replay "Sign in") so the checks survive that replay — only Reset clears them. */
export interface CompletedFlows {
  signIn: boolean;
  add: boolean;
  send: boolean;
  receive: boolean;
  withdraw: boolean;
  card: boolean;
  tap: boolean;
}

export const initialCompleted: CompletedFlows = {
  signIn: false,
  add: false,
  send: false,
  receive: false,
  withdraw: false,
  card: false,
  tap: false,
};

export function fmt(cents: number): string {
  return (
    '$' +
    (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

export type ActionId = 'create' | 'add' | 'send' | 'receive' | 'withdraw' | 'card' | 'tap';

export interface ActionDef {
  id: ActionId;
  label: string;
  desc: string;
  icon: string; // resolved to a central-icons component in the Sidebar
  available: (s: WalletState) => boolean;
  done?: (c: CompletedFlows) => boolean;
}

export const ACTIONS: ActionDef[] = [
  {
    id: 'create',
    label: 'Sign in',
    desc: 'Log in to your Global Account',
    icon: 'wallet',
    // Always available — re-running it replays the sign-in flow.
    available: () => true,
    done: (c) => c.signIn,
  },
  // Every flow is always reachable — clicking one fast-forwards whatever setup
  // it needs (sign in, funds, a card), so the demo isn't a linear track.
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
];

/** Resolve the phone view for a settled wallet state. */
export function phoneFromState(s: WalletState): PhoneState {
  if (!s.created) {
    return { screen: 'auth', balance: '$0.00', hasCard: false, cardActivated: false, activity: [] };
  }
  return {
    screen: s.hasCard ? 'card' : 'wallet',
    balance: fmt(s.balanceCents),
    hasCard: s.hasCard,
    cardActivated: s.cardActivated,
    activity: s.activity,
  };
}
