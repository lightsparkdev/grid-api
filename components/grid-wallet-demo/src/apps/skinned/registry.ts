import type { Persona } from '@/data/flow';
import { WiggleAuthScreen } from '@/apps/wiggle/WiggleAuthScreen';
import { WIGGLE_CONFIG } from '@/apps/wiggle/config';
import type { SkinEntry } from './types';

/** Ported (non-Aurora) skins, keyed by persona. Aurora renders via its own
 *  AuroraSignInFlow; everything here renders via SkinnedSignInFlow, so adding a
 *  skin is a registry entry — never a router edit. */
export const SKINS: Partial<Record<Persona, SkinEntry>> = {
  creator: {
    id: 'wiggle',
    persona: 'creator',
    config: WIGGLE_CONFIG,
    AuthScreen: WiggleAuthScreen,
  },
};
