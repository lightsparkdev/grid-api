import type { Persona } from '@/data/flow';
import { AuroraAuthScreen } from './aurora/AuroraAuthScreen';
import { AuroraWalletScreen } from './aurora/wallet';
import { CreatorAuthScreen } from './creator/CreatorAuthScreen';
import { CreatorWalletScreen } from './creator/wallet';
import { PasskeySheet as CreatorPasskeySheet } from './creator/PasskeySheet';
import { AuthSheet as CreatorAuthSheet } from './creator/AuthSheet';
import { BRAND } from './creator/config';
import type {
  SkinAuthScreen,
  SkinWalletScreen,
  SkinPasskeySheet,
  SkinAuthSheet,
} from './types';

export type AppSkinId = 'aurora' | 'creator' | 'social' | 'marketplace';

/** A skin = a per-persona app. `AuthScreen` + `WalletScreen` are the per-skin
 *  view (Aurora is skin zero). When both are set the persona renders the full
 *  app through the shared SignInFlow; skins still being built omit them and stay
 *  dark (the picker shows them as "coming soon"). */
export interface AppSkin {
  id: AppSkinId;
  persona: Persona;
  label: string;
  fontFamily: string;
  AuthScreen?: SkinAuthScreen;
  WalletScreen?: SkinWalletScreen;
  /** Sign-in auth overlays. Omit to fall back to Aurora's (DemoPhone default). */
  PasskeySheet?: SkinPasskeySheet;
  AuthSheet?: SkinAuthSheet;
}

const SF_PRO = "'SF Pro', system-ui, -apple-system, BlinkMacSystemFont, sans-serif";

/** Persona → app skin. Swap fontFamily per skin; metrics stay on ios-type stack. */
export const APP_SKINS: Record<Persona, AppSkin> = {
  fintech: {
    id: 'aurora',
    persona: 'fintech',
    label: 'Aurora',
    fontFamily: SF_PRO,
    AuthScreen: AuroraAuthScreen,
    WalletScreen: AuroraWalletScreen,
  },
  creator: {
    id: 'creator',
    persona: 'creator',
    label: BRAND,
    fontFamily: SF_PRO,
    AuthScreen: CreatorAuthScreen,
    WalletScreen: CreatorWalletScreen,
    PasskeySheet: CreatorPasskeySheet,
    AuthSheet: CreatorAuthSheet,
  },
  social: {
    id: 'social',
    persona: 'social',
    label: 'Pulse',
    fontFamily: SF_PRO,
  },
  marketplace: {
    id: 'marketplace',
    persona: 'marketplace',
    label: 'Bazaar',
    fontFamily: SF_PRO,
  },
};

export function getAppSkin(persona: Persona): AppSkin {
  return APP_SKINS[persona];
}
