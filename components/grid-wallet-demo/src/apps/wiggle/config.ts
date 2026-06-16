import { IconHomeOpen } from '@central-icons-react/round-outlined-radius-0-stroke-1.5/IconHomeOpen';
import { IconHomeOpen as IconHomeOpenFilled } from '@central-icons-react/round-filled-radius-0-stroke-1.5/IconHomeOpen';
import { IconVideoClip } from '@central-icons-react/round-outlined-radius-0-stroke-1.5/IconVideoClip';
import { IconAnalytics } from '@central-icons-react/round-outlined-radius-0-stroke-1.5/IconAnalytics';
import { IconPeople } from '@central-icons-react/round-outlined-radius-0-stroke-1.5/IconPeople';
import { IconPlusMedium } from '@central-icons-react/round-outlined-radius-0-stroke-1.5/IconPlusMedium';
import { IconArrowDownLeft } from '@central-icons-react/round-outlined-radius-0-stroke-1.5/IconArrowDownLeft';
import { IconArrowBottomTop } from '@central-icons-react/round-outlined-radius-0-stroke-1.5/IconArrowBottomTop';
import { IconSettingsGear2 } from '@central-icons-react/round-outlined-radius-0-stroke-1.5/IconSettingsGear2';
import { IconCreditCard2 } from '@central-icons-react/round-outlined-radius-0-stroke-1.5/IconCreditCard2';
import { IconGrowth } from '@central-icons-react/round-outlined-radius-0-stroke-1.5/IconGrowth';
import { IconHeart } from '@central-icons-react/round-outlined-radius-0-stroke-1.5/IconHeart';
import type { SkinConfig } from '@/apps/skinned/types';

const LOGO = '/assets/creator/logo-wiggle.svg';

/** Wiggle (creator platform) — a Twitch-style live-streaming skin. */
export const WIGGLE_CONFIG: SkinConfig = {
  brand: {
    name: 'Wiggle',
    tagline: 'Watch anything live',
    logoSrc: LOGO,
  },
  auth: {
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
  },
  // Home = the reused AuroraWalletScreen, skinned (Figma 2375:10216).
  home: {
    balanceLabel: 'Available Balance',
    header: {
      avatarSrc: LOGO,
      scroll: true,
      buttons: [
        { Icon: IconSettingsGear2, ariaLabel: 'Settings', target: 'settings' },
        { Icon: IconCreditCard2, ariaLabel: 'Debit card', target: 'openCard' },
      ],
    },
    // Reuse Aurora's add / withdraw / send flows, relabeled (↑↓ = Send).
    actions: [
      { id: 'add', label: 'Deposit', Icon: IconPlusMedium },
      { id: 'withdraw', label: 'Withdraw', Icon: IconArrowDownLeft },
      { id: 'send', Icon: IconArrowBottomTop, ariaLabel: 'Send' },
    ],
    heroStyle: 'wash',
    insightCards: [
      {
        Icon: IconGrowth,
        accent: '#00c16e',
        value: '5%',
        unit: 'APY',
        // Live "+$X today" from the balance, like the Aurora earnings card.
        caption: '+$0.00 today',
        captionPositive: true,
        dynamic: 'earnings',
      },
      {
        Icon: IconHeart,
        accent: '#ff5fa2',
        value: '1345',
        captionAmount: '+56',
        caption: 'followers from last stream',
      },
    ],
    issuanceBg: 'wash',
    hideHomeCard: true,
    tabBar: {
      items: [
        { Icon: IconHomeOpen, activeIcon: IconHomeOpenFilled, label: 'Home', active: true },
        { Icon: IconVideoClip, label: 'Content' },
        { Icon: IconAnalytics, label: 'Analytics' },
        { Icon: IconPeople, label: 'Channel' },
      ],
      fab: { Icon: IconPlusMedium, ariaLabel: 'Create' },
    },
    activity: {
      tabs: ['All', 'Sent', 'Received'],
      itemCards: true,
    },
  },
};
