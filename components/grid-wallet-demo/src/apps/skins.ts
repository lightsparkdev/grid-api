import type { Persona } from '@/data/flow';
import { AuroraAuthScreen } from './aurora/AuroraAuthScreen';
import { AuroraWalletScreen } from './aurora/wallet';
import { WiggleAuthScreen } from './wiggle/WiggleAuthScreen';
import { WiggleWalletScreen } from './wiggle/wallet';
import { PasskeySheet as WigglePasskeySheet } from './wiggle/PasskeySheet';
import { AuthSheet as WiggleAuthSheet } from './wiggle/AuthSheet';
import type {
  SkinAuthScreen,
  SkinWalletScreen,
  SkinPasskeySheet,
  SkinAuthSheet,
} from './types';

export type AppSkinId = 'aurora' | 'wiggle' | 'pulse' | 'bazaar';

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
    id: 'wiggle',
    persona: 'creator',
    label: 'Wiggle',
    fontFamily: SF_PRO,
    AuthScreen: WiggleAuthScreen,
    WalletScreen: WiggleWalletScreen,
    PasskeySheet: WigglePasskeySheet,
    AuthSheet: WiggleAuthSheet,
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
