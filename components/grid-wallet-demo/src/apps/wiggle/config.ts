import { IconHomeOpen } from '@central-icons-react/round-outlined-radius-0-stroke-1.5/IconHomeOpen';
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

/** Twitch-style chat colors for activity counterparty handles. */
const HANDLE = {
  purple: '#a970ff',
  green: '#2ee6a0',
  blue: '#4f9cf0',
  pink: '#ff5fa2',
} as const;

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
        value: '6%',
        unit: 'APY',
        caption: '+$25.00 this month',
        captionPositive: true,
      },
      {
        Icon: IconHeart,
        accent: '#ff5fa2',
        value: '1345',
        caption: '+56 followers from last stream',
      },
    ],
    issuanceBg: 'wash',
    hideHomeCard: true,
    tabBar: {
      items: [
        { Icon: IconHomeOpen, label: 'Home', active: true },
        { Icon: IconVideoClip, label: 'Content' },
        { Icon: IconAnalytics, label: 'Analytics' },
        { Icon: IconPeople, label: 'Channel' },
      ],
      fab: { Icon: IconPlusMedium, ariaLabel: 'Create' },
    },
    activity: {
      tabs: ['All', 'Sent', 'Received'],
      fixtures: [
        {
          id: 'fx-received',
          Icon: IconPeople,
          tileCircle: true,
          title: 'Received',
          detail: 'from',
          handle: 'JRandall1017',
          handleColor: HANDLE.green,
          amount: '+ $5.00',
          agoMinutes: 2,
        },
        {
          id: 'fx-payout',
          image: LOGO,
          imageSquare: true,
          title: 'Creator Payout',
          detail: 'from',
          handle: 'Wiggle',
          handleColor: HANDLE.purple,
          amount: '+ $10.00',
          agoMinutes: 18,
        },
        {
          id: 'fx-deposit',
          Icon: IconCreditCard2,
          title: 'Deposit',
          detail: 'from',
          handle: 'Chase (1234)',
          handleColor: HANDLE.blue,
          amount: '+ $100.00',
          agoMinutes: 65,
        },
        {
          id: 'fx-sent',
          Icon: IconPeople,
          tileCircle: true,
          title: 'Sent',
          detail: 'to',
          handle: 'caseoh_',
          handleColor: HANDLE.pink,
          amount: '- $100.00',
          agoMinutes: 140,
        },
      ],
    },
  },
};
