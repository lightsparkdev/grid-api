import { IconHomeOpen } from '@central-icons-react/round-outlined-radius-0-stroke-1.5/IconHomeOpen';
import { IconHomeOpen as IconHomeOpenFilled } from '@central-icons-react/round-filled-radius-0-stroke-1.5/IconHomeOpen';
import { IconVideoClip } from '@central-icons-react/round-outlined-radius-0-stroke-1.5/IconVideoClip';
import { IconAnalytics } from '@central-icons-react/round-outlined-radius-0-stroke-1.5/IconAnalytics';
import { IconPeople } from '@central-icons-react/round-outlined-radius-0-stroke-1.5/IconPeople';
import { IconPlusMedium } from '@central-icons-react/round-outlined-radius-0-stroke-1.5/IconPlusMedium';
import type { SkinTabBarConfig } from './types';

/** Wiggle (creator platform) — a Twitch-style live-streaming skin. Brand + auth
 *  copy live here; the home layout/visuals live in WiggleWalletScreen. */
export const WIGGLE_LOGO = '/assets/creator/logo-wiggle.svg';

/** Auth hero copy + the scrolling category marquee (Figma 2375:10338). */
export const WIGGLE_AUTH = {
  headline: 'Join Wiggle',
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

/** Decorative bottom tab bar for the Wiggle home (Figma 2375:10216). */
export const WIGGLE_TAB_BAR: SkinTabBarConfig = {
  items: [
    { Icon: IconHomeOpen, activeIcon: IconHomeOpenFilled, label: 'Home', active: true },
    { Icon: IconVideoClip, label: 'Content' },
    { Icon: IconAnalytics, label: 'Analytics' },
    { Icon: IconPeople, label: 'Channel' },
  ],
  fab: { Icon: IconPlusMedium, ariaLabel: 'Create' },
};
