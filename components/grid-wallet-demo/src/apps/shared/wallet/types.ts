/** Headless wallet types shared by every skin's view. No JSX, no UI. */
import type { ComponentType } from 'react';

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

/* ── Flow data shapes (the brain builds/consumes these; skin sheet faces
 *    produce them). Pure data — kept here so every skin shares one contract. ── */

/** Direction of a money sheet — flips titles, source rows, card order, copy. */
export type MoneySheetMode = 'add' | 'withdraw' | 'send' | 'receive';

/** A simulated inbound payment fired from the Receive flow (Share/Copy):
 *  a crypto deposit (sender address + network) or a fiat one (payer + country). */
export type ReceivedPayment =
  | { via: 'crypto'; network: string; logo: string; address: string }
  | {
      via: 'bank';
      countryCode: string;
      countryName: string;
      payer: string;
      payerFull: string;
      /** The rail the funds arrived on (PaymentRail enum), by corridor. */
      rail: string;
    };

/** What a just-confirmed transfer is going to — lets the Activity row + toast
 *  reflect the real bank/recipient instead of a placeholder. */
export type TransferActivity =
  | { kind: 'bank'; countryCode: string; bankName: string; last4: string; recipientName: string }
  | { kind: 'crypto'; address: string; network: string; logo: string };

/** central-icons component shape (accepts `size`, spreads the rest onto the svg). */
type ListIcon = ComponentType<{ size?: number | string; className?: string }>;

/** Contact-style avatar for a person counterparty — initials + country flag. */
export interface WalletItemAvatar {
  initials: string;
  code: string;
}

/** One activity/transaction row's data (skin views render it however they like). */
export interface WalletListItemData {
  id: string;
  /** Glyph graphic (central-icons). */
  Icon?: ListIcon;
  /** Image graphic (e.g. a country flag) — wins over Icon when both are set. */
  image?: string;
  /** Self-contained brand tile with its own corner radius (e.g. a crypto logo). */
  imageSquare?: boolean;
  /** Round the 56px tile (crypto payments — coin-style) instead of the square. */
  tileCircle?: boolean;
  /** Person counterparty — render the initials avatar (wins over icon/image). */
  avatar?: WalletItemAvatar;
  title: string;
  /** Merchant detail line, e.g. "Tap to Pay". */
  detail: string;
  /** Epoch ms — rendered as a live relative label ("Just now", "2m ago"…). */
  timestamp: number;
  /** Formatted amount, e.g. "$7.32". */
  amount: string;
}
