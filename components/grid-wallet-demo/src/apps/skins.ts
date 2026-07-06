import type { Persona } from '@/data/flow';
import { AuroraAuthScreen } from './aurora/AuroraAuthScreen';
import { AuroraWalletScreen } from './aurora/wallet';
import { CreatorAuthScreen } from './creator/CreatorAuthScreen';
import { CreatorWalletScreen } from './creator/wallet';
import { AuthSheet as CreatorAuthSheet } from './creator/AuthSheet';
import { BRAND } from './creator/config';
import { SocialAuthScreen } from './social/SocialAuthScreen';
import { SocialWalletScreen } from './social/wallet';
import { AuthSheet as SocialAuthSheet } from './social/AuthSheet';
import { BRAND as SOCIAL_BRAND } from './social/config';
import { MarketplaceAuthScreen } from './marketplace/MarketplaceAuthScreen';
import { MarketplaceWalletScreen } from './marketplace/wallet';
import { BRAND as MARKETPLACE_BRAND } from './marketplace/config';
import { OndemandAuthScreen } from './ondemand/OndemandAuthScreen';
import { OndemandWalletScreen } from './ondemand/wallet';
import { BRAND as ONDEMAND_BRAND } from './ondemand/config';
import type {
  SkinAuthScreen,
  SkinWalletScreen,
  SkinAuthSheet,
} from './types';

export type AppSkinId = 'aurora' | 'creator' | 'social' | 'marketplace' | 'ondemand';

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
  /** Sign-in OTP overlay. Omit to fall back to Aurora's (DemoPhone default).
   *  (The passkey sheet is shared iOS system chrome — not skinnable.) */
  AuthSheet?: SkinAuthSheet;
  /** The skin renders the OTP flow INLINE in its auth screen: no AuthSheet
   *  overlay is mounted; the flow arrives as the auth screen's `authFlow` prop
   *  instead (same render clock as `dismissed` — see SkinAuthFlow). */
  inlineAuthFlow?: boolean;
  /** The auth ⇄ wallet reveal style. 'blur' (default) blur-dissolves the auth
   *  screen; 'fade' is a plain quick crossfade — for skins whose auth screen
   *  already ends ON the wallet layout (marketplace dismisses its sheet over a
   *  wallet backdrop, so a blur pulse there would read as a glitch). */
  authReveal?: 'blur' | 'fade';
  /** Per-skin wallet-brain options (the brain itself is hosted above the skin
   *  so its state survives skin switches — see SignInFlow's WalletHost). */
  walletOptions?: {
    /** The skin shows its own in-sheet success screen after a transfer
     *  (Done closes it) instead of auto-close + toast. */
    transferSuccessScreen?: boolean;
  };
}

const SF_PRO = "'SF Pro', system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
const GEIST = 'var(--font-family-geist), system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
const CIRCULAR = "'Circular', system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
const INTER = "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif";

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
    AuthSheet: CreatorAuthSheet,
  },
  social: {
    id: 'social',
    persona: 'social',
    label: SOCIAL_BRAND,
    fontFamily: GEIST,
    AuthScreen: SocialAuthScreen,
    WalletScreen: SocialWalletScreen,
    AuthSheet: SocialAuthSheet,
    walletOptions: { transferSuccessScreen: true },
  },
  marketplace: {
    id: 'marketplace',
    persona: 'marketplace',
    label: MARKETPLACE_BRAND,
    fontFamily: CIRCULAR,
    AuthScreen: MarketplaceAuthScreen,
    WalletScreen: MarketplaceWalletScreen,
    // The confirm screen pushes in INSIDE the permanent sign-in sheet — the
    // flow rides the auth screen's props, not a separate overlay.
    inlineAuthFlow: true,
    authReveal: 'fade',
  },
  ondemand: {
    id: 'ondemand',
    persona: 'ondemand',
    label: ONDEMAND_BRAND,
    fontFamily: INTER,
    AuthScreen: OndemandAuthScreen,
    WalletScreen: OndemandWalletScreen,
    // Auth steps push in full-screen INSIDE the auth screen — the flow rides
    // the auth screen's props, not a separate overlay.
    inlineAuthFlow: true,
    authReveal: 'fade',
  },
};

export function getAppSkin(persona: Persona): AppSkin {
  return APP_SKINS[persona];
}
