/* Every card the reel shows. The playground's six presets are imported as
   they are, with their wordmarks hidden (no card prints a name); the new
   brands are designed in newBrands.ts. The placeholder keeps the
   playground's "Your brand" wordmark. */

import { initialDesignFor, type CardDesign } from '@/data/design';
import { PRESETS, type PresetDesign } from '@/data/presets';
import type { CardCredentials } from '@/apps/shared/card/cardholder';
import type { ReelEntry } from '@reel/reel/reelTimeline';
import { NEW_BRANDS, ORDER } from './newBrands';
import { rasterize } from './prepare';

export interface ReelBrand extends ReelEntry {
  design: CardDesign;
}

/** What every card's back prints. */
export const BACK = {
  cardholderName: 'Pat Teehantri',
  credentials: { groups: ['4242', '7715', '3306', '8972'], last4: '8972', exp: '06/30', cvv: '317' } satisfies CardCredentials,
};

const withBack = (design: PresetDesign): CardDesign => ({ ...design, cardholderName: BACK.cardholderName });

/** The white placeholder the reel opens and lands on. */
export const PLACEHOLDER: ReelBrand = {
  id: 'your-brand',
  orientation: 'landscape',
  design: withBack(initialDesignFor('dark')),
};

/** Presets whose brand is a wordmark (the program's name) go without it. */
const presetBrand = (d: PresetDesign): ReelBrand['design'] => withBack(d.logoUrl ? d : { ...d, brandHidden: true });

let loaded: Promise<ReelBrand[]> | null = null;

/** Every brand, in show order, with its art rasterized. */
export function loadReelBrands(): Promise<ReelBrand[]> {
  loaded ??= (async () => {
    const all = new Map<string, ReelBrand>();
    for (const p of PRESETS) {
      all.set(`preset-${p.id}`, { id: `preset-${p.id}`, orientation: p.design.orientation, design: presetBrand(p.design) });
    }
    await Promise.all(
      NEW_BRANDS.map(async (b) => {
        const backgroundUrl = b.art ? await rasterize(b.id, b.art(), b.design.orientation) : null;
        all.set(b.id, { id: b.id, orientation: b.design.orientation, design: withBack({ ...b.design, backgroundUrl }) });
      }),
    );
    const missing = [...all.keys()].filter((id) => !ORDER.includes(id));
    if (missing.length) console.warn('[reel] brands not in ORDER:', missing);
    return ORDER.filter((id) => all.has(id)).map((id) => all.get(id)!);
  })();
  return loaded;
}
