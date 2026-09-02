import type { Persona } from '@/data/flow';
import { AuroraWalletScreen } from './aurora/wallet';
import { CreatorWalletScreen } from './creator/wallet';
import { BRAND } from './creator/config';
import { SocialWalletScreen } from './social/wallet';
import { BRAND as SOCIAL_BRAND } from './social/config';
import { MarketplaceWalletScreen } from './marketplace/wallet';
import { BRAND as MARKETPLACE_BRAND } from './marketplace/config';
import { OndemandWalletScreen } from './ondemand/wallet';
import { BRAND as ONDEMAND_BRAND } from './ondemand/config';
import { MessagingWalletScreen } from './messaging/wallet';
import { BRAND as MESSAGING_BRAND } from './messaging/config';
import { BRAND as CUSTOM_BRAND } from './custom/config';
import type { SkinWalletScreen } from './types';

export type AppSkinId =
  | 'custom'
  | 'aurora'
  | 'creator'
  | 'social'
  | 'marketplace'
  | 'ondemand'
  | 'messaging';

/** A skin = a per-persona app. `WalletScreen` is the per-skin view (Aurora is
 *  skin zero). The wallet brain is hosted above the skin (WalletHost) so state
 *  survives skin switches. */
export interface AppSkin {
  id: AppSkinId;
  persona: Persona;
  label: string;
  fontFamily: string;
  WalletScreen: SkinWalletScreen;
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
  // "Your brand": Aurora's screens under the playground's design tokens
  // (see custom/skin.scss). The only skin the Design section edits.
  custom: {
    id: 'custom',
    persona: 'custom',
    label: CUSTOM_BRAND,
    fontFamily: SF_PRO,
    WalletScreen: AuroraWalletScreen,
  },
  fintech: {
    id: 'aurora',
    persona: 'fintech',
    label: 'Aurora',
    fontFamily: SF_PRO,
    WalletScreen: AuroraWalletScreen,
  },
  creator: {
    id: 'creator',
    persona: 'creator',
    label: BRAND,
    fontFamily: SF_PRO,
    WalletScreen: CreatorWalletScreen,
  },
  social: {
    id: 'social',
    persona: 'social',
    label: SOCIAL_BRAND,
    fontFamily: GEIST,
    WalletScreen: SocialWalletScreen,
    walletOptions: { transferSuccessScreen: true },
  },
  marketplace: {
    id: 'marketplace',
    persona: 'marketplace',
    label: MARKETPLACE_BRAND,
    fontFamily: CIRCULAR,
    WalletScreen: MarketplaceWalletScreen,
  },
  ondemand: {
    id: 'ondemand',
    persona: 'ondemand',
    label: ONDEMAND_BRAND,
    fontFamily: INTER,
    WalletScreen: OndemandWalletScreen,
  },
  messaging: {
    id: 'messaging',
    persona: 'messaging',
    label: MESSAGING_BRAND,
    fontFamily: SF_PRO,
    WalletScreen: MessagingWalletScreen,
  },
};

export function getAppSkin(persona: Persona): AppSkin {
  return APP_SKINS[persona];
}
