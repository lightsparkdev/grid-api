/* Every card the reel shows. The playground's six presets are imported as
   they are; the new brands are designed here (see `newBrands.ts`). No card
   prints a name: the brands carry their mark and art, and the placeholder
   keeps the playground's "Your brand" wordmark. */

import { initialDesignFor, type CardDesign } from '@/data/design';
import { PRESETS } from '@/data/presets';
import type { CardCredentials } from '@/apps/shared/card/cardholder';
import type { ReelEntry } from '@reel/reel/reelTimeline';
import { NEW_BRANDS } from './newBrands';

export interface ReelBrand extends ReelEntry {
  design: CardDesign;
}

/** What every card's back prints. */
export const BACK = {
  cardholderName: 'Pat Teehantri',
  credentials: { groups: ['4242', '7715', '3306', '8972'], last4: '8972', exp: '06/30', cvv: '317' } satisfies CardCredentials,
};

const withBack = (design: Omit<CardDesign, 'cardholderName'>): CardDesign => ({
  ...design,
  cardholderName: BACK.cardholderName,
});

/** The white placeholder the reel opens and lands on. */
export const PLACEHOLDER: ReelBrand = {
  id: 'your-brand',
  orientation: 'landscape',
  design: withBack(initialDesignFor('dark')),
};

const PRESET_BRANDS: ReelBrand[] = PRESETS.map((p) => ({
  id: `preset-${p.id}`,
  orientation: p.design.orientation,
  design: withBack(p.design),
}));

/** In show order (before the portrait cards are grouped). */
export const REEL_BRANDS: ReelBrand[] = [
  ...NEW_BRANDS.map((b) => ({ id: b.id, orientation: b.design.orientation, design: withBack(b.design) })),
  ...PRESET_BRANDS,
];
