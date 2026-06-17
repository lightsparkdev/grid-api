import type { Persona } from '@/data/flow';

export type AppSkinId = 'aurora' | 'pulse' | 'bazaar';

export interface AppSkin {
  id: AppSkinId;
  persona: Persona;
  label: string;
  fontFamily: string;
}

const SF_PRO = "'SF Pro', system-ui, -apple-system, BlinkMacSystemFont, sans-serif";

/** Persona → app skin. Swap fontFamily per skin; metrics stay on ios-type stack. */
export const APP_SKINS: Record<Persona, AppSkin> = {
  fintech: {
    id: 'aurora',
    persona: 'fintech',
    label: 'Aurora',
    fontFamily: SF_PRO,
  },
  social: {
    id: 'pulse',
    persona: 'social',
    label: 'Pulse',
    fontFamily: SF_PRO,
  },
  marketplace: {
    id: 'bazaar',
    persona: 'marketplace',
    label: 'Bazaar',
    fontFamily: SF_PRO,
  },
};

export function getAppSkin(persona: Persona): AppSkin {
  return APP_SKINS[persona];
}
