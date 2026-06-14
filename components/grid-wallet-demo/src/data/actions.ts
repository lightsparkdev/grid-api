/* Action-driven playground model. The user freely triggers actions on the
   Global Account; each produces a short on-phone sequence + Grid API calls. */

import {
  credentialCalls,
  CUSTOMER,
  type ApiCall,
  type AuthMethod,
  type PhoneState,
  type ScreenId,
  type Tx,
} from './flow';

export interface WalletState {
  created: boolean;
  balanceCents: number;
  hasCard: boolean;
  cardActivated: boolean;
  activity: Tx[];
  /** Sticky "done at least once" flags for the sidebar flow checkmarks. */
  hasAdded: boolean;
  hasSent: boolean;
  hasWithdrawn: boolean;
  hasTapped: boolean;
}

export const initialWallet: WalletState = {
  created: false,
  balanceCents: 0,
  hasCard: false,
  cardActivated: false,
  activity: [],
  hasAdded: false,
  hasSent: false,
  hasWithdrawn: false,
  hasTapped: false,
};

export function fmt(cents: number): string {
  return (
    '$' +
    (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

export type ActionId = 'create' | 'add' | 'send' | 'withdraw' | 'card' | 'tap';

export interface ActionDef {
  id: ActionId;
  label: string;
  desc: string;
  icon: string; // resolved to a central-icons component in the Sidebar
  available: (s: WalletState) => boolean;
  done?: (s: WalletState) => boolean;
}

export const ACTIONS: ActionDef[] = [
  {
    id: 'create',
    label: 'Sign in',
    desc: 'Log in to your Global Account',
    icon: 'wallet',
    // Always available — re-running it replays the sign-in flow.
    available: () => true,
    done: (s) => s.created,
  },
  // Every flow is always reachable — clicking one fast-forwards whatever setup
  // it needs (sign in, funds, a card), so the demo isn't a linear track.
  {
    id: 'add',
    label: 'Add money',
    desc: 'Fund from a linked bank',
    icon: 'plus',
    available: () => true,
    done: (s) => s.hasAdded,
  },
  {
    id: 'send',
    label: 'Send payment',
    desc: 'Pay another account',
    icon: 'send',
    available: () => true,
    done: (s) => s.hasSent,
  },
  {
    id: 'withdraw',
    label: 'Withdraw',
    desc: 'Cash out to a bank',
    icon: 'bank',
    available: () => true,
    done: (s) => s.hasWithdrawn,
  },
  {
    id: 'card',
    label: 'Issue a card',
    desc: 'Virtual card for the balance',
    icon: 'card',
    available: () => true,
    done: (s) => s.hasCard,
  },
  {
    id: 'tap',
    label: 'Tap to pay',
    desc: 'Spend at a store',
    icon: 'tap',
    available: () => true,
    done: (s) => s.hasTapped,
  },
];

export interface Frame {
  screen: ScreenId;
  note?: string;
  activated?: boolean;
  ms: number;
}

export interface ActionResult {
  calls: ApiCall[];
  frames: Frame[];
  next: WalletState;
}

const ADD = 500000;
const SEND = 25000;
const WITHDRAW = 20000;
const COFFEE = 732;

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

export function runAction(id: ActionId, s: WalletState, method: AuthMethod): ActionResult {
  switch (id) {
    case 'create':
      return {
        calls: [
          {
            method: 'POST',
            path: `/customers`,
            title: 'Create customer',
            reqBody: { fullName: 'Ava Martínez', email: 'ava@example.com', country: 'US' },
            status: '201 Created',
            note: 'Returns a customer with an embedded Global Account.',
          },
          ...credentialCalls(method),
          {
            method: 'GET',
            path: `/internal-accounts?customerId=${CUSTOMER.split(':')[1].slice(0, 8)}…&type=EMBEDDED_WALLET`,
            title: 'List internal accounts',
            status: '200 OK',
            note: 'The auto-provisioned Global Account, balance 0.',
          },
        ],
        frames: [
          { screen: 'creating', note: 'Creating your account…', ms: 1000 },
          { screen: 'credential', ms: 1100 },
        ],
        next: { ...s, created: true, balanceCents: 0 },
      };

    case 'add':
      return {
        calls: [
          {
            method: 'POST',
            path: `/quotes`,
            title: 'Create quote',
            reqBody: {
              source: { sourceType: 'ACCOUNT', accountType: 'US_ACCOUNT' },
              destination: { destinationType: 'ACCOUNT' },
              lockedCurrencySide: 'SENDING',
              lockedCurrencyAmount: ADD,
            },
            status: '201 Created',
            note: 'Locked quote, $5,000.00.',
          },
          {
            method: 'POST',
            path: `/transfer-in`,
            title: 'Transfer in',
            reqBody: { quoteId: 'Quote:01954…' },
            status: '202 Accepted',
            note: 'Funds settle to the balance.',
          },
        ],
        frames: [{ screen: 'addmoney', note: 'Adding $5,000.00', ms: 1300 }],
        next: {
          ...s,
          balanceCents: s.balanceCents + ADD,
          activity: [
            { kind: 'bank', name: 'Bank account (•••• 3872)', sub: 'Added · Just now', amount: '+$5,000.00', positive: true },
            ...s.activity,
          ],
        },
      };

    case 'send':
      return {
        calls: [
          {
            method: 'POST',
            path: `/quotes`,
            title: 'Create quote',
            reqBody: {
              source: { sourceType: 'ACCOUNT' },
              destination: { destinationType: 'UMA_ADDRESS', umaAddress: '$leo@grid.app' },
              lockedCurrencySide: 'SENDING',
              lockedCurrencyAmount: SEND,
            },
            status: '201 Created',
          },
          {
            method: 'POST',
            path: `/transfer-out`,
            title: 'Transfer out',
            reqBody: { quoteId: 'Quote:01955…' },
            status: '202 Accepted',
            note: 'Requires Grid-Wallet-Signature from the customer credential.',
          },
        ],
        frames: [{ screen: 'send', note: 'Sending $250.00', ms: 1300 }],
        next: {
          ...s,
          balanceCents: s.balanceCents - SEND,
          activity: [
            { kind: 'send', name: 'Sent to $leo@grid.app', sub: 'Payment · Just now', amount: '-$250.00' },
            ...s.activity,
          ],
        },
      };

    case 'withdraw':
      return {
        calls: [
          {
            method: 'POST',
            path: `/quotes`,
            title: 'Create quote',
            reqBody: {
              source: { sourceType: 'ACCOUNT' },
              destination: { destinationType: 'ACCOUNT', accountType: 'US_ACCOUNT' },
              lockedCurrencySide: 'SENDING',
              lockedCurrencyAmount: WITHDRAW,
            },
            status: '201 Created',
          },
          {
            method: 'POST',
            path: `/transfer-out`,
            title: 'Transfer out',
            reqBody: { quoteId: 'Quote:01956…' },
            status: '202 Accepted',
            note: 'Signed withdrawal to the linked bank.',
          },
        ],
        frames: [{ screen: 'withdraw', note: 'Withdraw $200.00', ms: 1300 }],
        next: {
          ...s,
          balanceCents: s.balanceCents - WITHDRAW,
          activity: [
            { kind: 'bank', name: 'Bank account (•••• 3872)', sub: 'Withdrawal · Just now', amount: '-$200.00' },
            ...s.activity,
          ],
        },
      };

    case 'card':
      return {
        calls: [
          {
            method: 'POST',
            path: `/cards`,
            title: 'Create card',
            reqBody: { customerId: `${CUSTOMER.split(':')[1].slice(0, 8)}…`, type: 'VIRTUAL' },
            status: '201 Created',
            note: 'Card provisionable to Apple/Google Wallet.',
          },
        ],
        frames: [{ screen: 'card-reveal', ms: 2400 }],
        next: { ...s, hasCard: true },
      };

    case 'tap':
      return {
        calls: [
          {
            method: 'GET',
            path: `/transactions?accountId=01954…&limit=1`,
            title: 'List transactions',
            status: '200 OK',
            note: 'transaction.authorized — $7.32 at Blue Bottle Coffee.',
          },
        ],
        frames: [
          { screen: 'tap', note: 'Hold near reader', activated: false, ms: 1100 },
          { screen: 'tap', note: 'Done', activated: true, ms: 900 },
        ],
        next: {
          ...s,
          cardActivated: true,
          balanceCents: s.balanceCents - COFFEE,
          activity: [
            { kind: 'coffee', name: 'Blue Bottle Coffee', sub: 'Card · Just now', amount: '-$7.32' },
            ...s.activity,
          ],
        },
      };
  }
}
