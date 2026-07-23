/**
 * Headless wallet data + activity-row builders shared by every skin. Pure logic
 * (no JSX): turns confirmed transfers / received payments / card charges into the
 * `WalletListItemData` rows the views render. Skins consume these, never re-author.
 */
import { formatUsdCents, truncateAddress } from './format';
import type {
  ReceivedPayment,
  TransferActivity,
  WalletListItemData,
  WalletTransferMode,
} from './types';

/** Yield rate shown on the Earnings card; today's accrual = balance × this ÷ 365. */
export const EARNINGS_APY_PERCENT = 3;
/** Bars in the Weekly activity chart — one per recent card charge. */
export const WEEKLY_BAR_COUNT = 14;

// Figma 2143:41027 (row shape) — the tap-to-pay merchant pool: globally
// recognizable chains with FIXED, plausible charges (deterministic per
// merchant) so repeat taps read as real purchases around town.
export const TAP_MERCHANTS: Array<Omit<WalletListItemData, 'id' | 'timestamp'>> = [
  { category: 'coffee', title: 'Starbucks', detail: 'Tap to Pay', amount: '$7.45' },
  { category: 'fast-food', title: 'McDonald’s', detail: 'Tap to Pay', amount: '$11.84' },
  { category: 'convenience', title: '7-Eleven', detail: 'Tap to Pay', amount: '$6.27' },
  { category: 'cafe', title: 'Pret a Manger', detail: 'Tap to Pay', amount: '$9.15' },
  { category: 'fashion', title: 'Uniqlo', detail: 'Tap to Pay', amount: '$39.90' },
  { category: 'apparel', title: 'Zara', detail: 'Tap to Pay', amount: '$45.90' },
  { category: 'accessories', title: 'H&M', detail: 'Tap to Pay', amount: '$34.99' },
  { category: 'furniture', title: 'IKEA', detail: 'Tap to Pay', amount: '$86.53' },
  { category: 'homeware', title: 'Muji', detail: 'Tap to Pay', amount: '$28.40' },
  { category: 'grocery', title: 'Carrefour', detail: 'Tap to Pay', amount: '$43.76' },
];

/** "$5,000.00" → cents. */
export function parseCents(formatted: string): number {
  const n = Number.parseFloat(formatted.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

/** Toast copy amount — whole dollars drop the ".00" ("$1,500"); cents keep it. */
export function toastUsd(cents: number): string {
  const usd = formatUsdCents(cents);
  return cents % 100 === 0 ? usd.slice(0, -3) : usd;
}

/** First + last initial for a contact avatar ("Carlos Herrera" → "CH"). */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (parts[0][0] + last).toUpperCase();
}

/** Build an Activity row from the confirmed transfer's real destination: a
 *  crypto payment shows the token chip in a circular tile; a person (bank) shows
 *  a contact avatar (initials + flag); your own bank keeps the flag tile.
 *  Outgoing shows the plain amount — only incoming (add) gets the "+". */
export function makeTransferRow(
  mode: WalletTransferMode,
  cents: number,
  dest: TransferActivity | null,
): WalletListItemData {
  const ts = Date.now();
  if (dest?.kind === 'crypto') {
    return {
      id: `${mode}-${ts}`,
      image: dest.logo,
      imageSquare: true,
      tileCircle: true,
      title: truncateAddress(dest.address),
      detail:
        mode === 'withdraw'
          ? `Withdrawn to ${dest.network} wallet`
          : `Sent to ${dest.network} wallet`,
      amount: formatUsdCents(cents),
      timestamp: ts,
    };
  }
  const flag = dest ? `/assets/flags/${dest.countryCode}.svg` : '/assets/add-money/flag-mx.svg';
  const bankLabel = dest ? `${dest.bankName} (•••• ${dest.last4})` : 'Bank account';
  if (mode === 'send') {
    // Sent to a person → contact avatar (initials + flag); only a destination-less
    // edge case falls back to the flag tile.
    return {
      id: `send-${ts}`,
      avatar: dest ? { initials: initials(dest.recipientName || dest.bankName), code: dest.countryCode } : undefined,
      image: dest ? undefined : flag,
      title: dest?.recipientName || bankLabel,
      detail: dest ? `Sent to ${dest.bankName}` : 'Sent from balance',
      amount: formatUsdCents(cents),
      timestamp: ts,
    };
  }
  return {
    id: `${mode}-${ts}`,
    image: flag,
    title: bankLabel,
    detail: mode === 'withdraw' ? 'Withdrawn from balance' : 'Added to balance',
    amount: mode === 'withdraw' ? formatUsdCents(cents) : `+${formatUsdCents(cents)}`,
    timestamp: ts,
  };
}

/** A believable inbound amount — low hundreds with cents (demo "bullshit mode"). */
export function randomReceiveCents(): number {
  const dollars = 120 + Math.floor(Math.random() * 760); // $120–$879
  return dollars * 100 + Math.floor(Math.random() * 100);
}

/** Activity row for a received payment (always inbound, "+"): crypto shows the
 *  sender's truncated address + network logo; fiat shows the payer (name + last
 *  initial) + country flag. */
export function makeReceiveRow(p: ReceivedPayment, cents: number, asAdd = false): WalletListItemData {
  const ts = Date.now();
  const amount = `+${formatUsdCents(cents)}`;
  if (p.via === 'crypto') {
    return {
      id: `receive-${ts}`,
      image: p.logo,
      imageSquare: true,
      // Payments (receive) get the circular coin tile; an add is a funding source,
      // not a contact, so it keeps the square tile like the bank add.
      tileCircle: !asAdd,
      title: truncateAddress(p.address),
      detail: asAdd ? `Added from ${p.network} wallet` : `From ${p.network} wallet`,
      amount,
      timestamp: ts,
    };
  }
  return {
    id: `receive-${ts}`,
    avatar: { initials: initials(p.payerFull), code: p.countryCode },
    title: p.payer,
    detail: 'Payment received',
    amount,
    timestamp: ts,
  };
}
