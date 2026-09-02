/** Tap-to-pay merchant pool + amount parsing shared by the card brain and faces. */
import type { WalletListItemData } from './types';

// Globally recognizable chains with FIXED, plausible charges (deterministic per
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
