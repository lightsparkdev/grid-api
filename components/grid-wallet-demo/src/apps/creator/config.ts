import type { SkinTabBarConfig } from './types';
import {
  IconAnalytics,
  IconHomeOpen,
  IconPlusMedium,
  IconVideoClip,
  IconWallet1,
  IconWallet1Filled,
} from './icons';

/** Creator (creator platform) — a Twitch-style live-streaming skin. Brand + auth
 *  copy live here; the home layout/visuals live in CreatorWalletScreen. */
/** Brand name shown in user-facing copy. To re-brand this skin, change this one
 *  value — code identifiers stay category-named (creator). */
export const BRAND = 'Glitch';

export const CREATOR_LOGO = '/assets/creator/logo-creator-platform.svg';
/** Purple logo — wallet header avatar on the dark home. */
export const CREATOR_LOGO_PURPLE = '/assets/creator/logo-creator-platform-color.svg';

/** Auth hero copy + the scrolling category marquee (Figma 2375:10338). */
export const CREATOR_AUTH = {
  headline: BRAND,
  subhead: 'Watch anything live',
  marquee: [
    [
      'Just Chatting',
      'Fortnite',
      'League of Legends',
      'Music',
      'Valorant',
      'Grand Theft Auto V',
      'IRL',
      'Minecraft',
    ],
    [
      'Counter-Strike 2',
      'Art',
      'Call of Duty',
      'Sports',
      'Dota 2',
      'Apex Legends',
      'Cooking',
      'Overwatch 2',
    ],
    [
      'Elden Ring',
      'Travel',
      'Rocket League',
      'Chess',
      'World of Warcraft',
      'EA Sports FC 25',
      'Pools & Hot Tubs',
      'Roblox',
    ],
  ],
};

/** Decorative bottom tab bar for the Creator home (Figma 2375:10216). */
export const CREATOR_TAB_BAR: SkinTabBarConfig = {
  items: [
    { Icon: IconHomeOpen, label: 'Home' },
    { Icon: IconVideoClip, label: 'Content' },
    { Icon: IconAnalytics, label: 'Analytics' },
    { Icon: IconWallet1, activeIcon: IconWallet1Filled, label: 'Wallet', active: true },
  ],
  fab: { Icon: IconPlusMedium, ariaLabel: 'Create' },
};
