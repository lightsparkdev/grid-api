/* Every card the reel shows. The playground's six presets are imported as
   they are, with their wordmarks hidden (no card prints a name on its
   front); the new brands are designed in newBrands.ts. The placeholder
   keeps the playground's "Your brand" wordmark. Each brand's back prints
   its own cardholder (holders.ts), number, and code. */

import { initialDesignFor, type CardDesign } from '@/data/design';
import { PRESETS, type PresetDesign } from '@/data/presets';
import type { CardCredentials } from '@/apps/shared/card/cardholder';
import type { ReelEntry } from '@reel/reel/reelTimeline';
import { credentialsFor, HOLDERS } from './holders';
import { BACK_ONLY, NEW_BRANDS, ORDER } from './newBrands';
import { rasterize } from './prepare';

export interface ReelBrand extends ReelEntry {
  design: CardDesign;
  credentials: CardCredentials;
  /** Where the cardholder is from. */
  country?: string;
}

/** The placeholder's back, and the expiry every card shares. */
export const BACK = {
  cardholderName: 'Pat Teehantri',
  credentials: { groups: ['4242', '7715', '3306', '8972'], last4: '8972', exp: '06/30', cvv: '317' } satisfies CardCredentials,
};

const withHolder = (design: PresetDesign, name: string): CardDesign => ({ ...design, cardholderName: name });

/** The white placeholder the reel opens and lands on. */
export const PLACEHOLDER: ReelBrand = {
  id: 'your-brand',
  orientation: 'landscape',
  design: withHolder(initialDesignFor('dark'), BACK.cardholderName),
  credentials: BACK.credentials,
};

const credentialsByDesign = new WeakMap<CardDesign, CardCredentials>([[PLACEHOLDER.design, PLACEHOLDER.credentials]]);

/** What a design's back prints: its brand's number and code. */
export function credentialsOf(design: CardDesign): CardCredentials {
  return credentialsByDesign.get(design) ?? BACK.credentials;
}

/** Presets whose brand is a wordmark (the program's name) go without it. */
const presetDesign = (d: PresetDesign): PresetDesign => (d.logoUrl ? d : { ...d, brandHidden: true });

let loaded: Promise<ReelBrand[]> | null = null;

/** Every brand, in show order, with its art rasterized. */
export function loadReelBrands(): Promise<ReelBrand[]> {
  loaded ??= (async () => {
    const designs = new Map<string, { orientation: ReelBrand['orientation']; design: PresetDesign }>();
    for (const p of PRESETS) designs.set(`preset-${p.id}`, { orientation: p.design.orientation, design: presetDesign(p.design) });
    await Promise.all(
      NEW_BRANDS.map(async (b) => {
        const backgroundUrl = b.art ? await rasterize(b.id, b.art(), b.design.orientation) : null;
        designs.set(b.id, { orientation: b.design.orientation, design: { ...b.design, backgroundUrl } });
      }),
    );
    const missing = [...designs.keys()].filter((id) => !ORDER.includes(id));
    if (missing.length) console.warn('[reel] brands not in ORDER:', missing);
    // Holders go out in show order, so the regions alternate down the cycle.
    return ORDER.filter((id) => designs.has(id)).map((id, i) => {
      const { orientation, design } = designs.get(id)!;
      const holder = HOLDERS[i % HOLDERS.length];
      const brand: ReelBrand = {
        id,
        orientation,
        backOnly: BACK_ONLY.has(id),
        design: withHolder(design, holder.name),
        credentials: credentialsFor(i + 1, BACK.credentials.exp),
        country: holder.country,
      };
      credentialsByDesign.set(brand.design, brand.credentials);
      return brand;
    });
  })();
  return loaded;
}
