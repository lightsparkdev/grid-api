import type { Persona } from '@/data/flow';

/** Skin ids drive the `data-app` token scope on the phone screen + which app
 *  renders. Aurora is the fintech baseline; the rest are ports of it. */
export type AppSkinId = 'aurora' | 'wiggle';

export interface AppSkin {
  id: AppSkinId;
  persona: Persona;
  label: string;
}

/** Persona -> app skin. */
export const APP_SKINS: Record<Persona, AppSkin> = {
  fintech: { id: 'aurora', persona: 'fintech', label: 'Aurora' },
  creator: { id: 'wiggle', persona: 'creator', label: 'Wiggle' },
};

export function getAppSkin(persona: Persona): AppSkin {
  return APP_SKINS[persona];
}
