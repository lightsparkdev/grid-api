import type { SkinConfig } from '@/apps/skinned/types';

/** Wiggle (creator platform) — a Twitch-style live-streaming skin. */
export const WIGGLE_CONFIG: SkinConfig = {
  brand: {
    name: 'Wiggle',
    tagline: 'Watch anything live',
    logoSrc: '/assets/creator/logo-wiggle.svg',
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
};
