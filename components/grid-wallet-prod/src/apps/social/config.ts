import type { SkinTabBarConfig } from './types';
import {
  IconHomeOpen,
  IconMagnifyingGlass2,
  IconSparkle2,
  IconBell2,
  IconDollar,
  IconDollarFilled,
} from './icons';

/** Z (social platform) — an X-style skin. Brand + copy live here; the auth and
 *  Money-home layouts live in SocialAuthScreen / SocialWalletScreen. Re-brand by
 *  changing BRAND alone; code identifiers stay category-named (social). */
export const BRAND = 'Z';

/** Auth hero copy — the "See what's going on" sign-in screen. */
export const SOCIAL_AUTH = {
  headline: 'See what\u2019s going on',
  signingIn: 'Signing you in\u2026',
};

/** Money home chrome copy. */
export const SOCIAL_MONEY = {
  title: 'Money',
  balanceLabel: 'Total Balance',
  rewardsLabel: 'Rewards',
  cardLabel: `${BRAND} Card`,
};

/** Decorative bottom tab bar for the Money home (Figma 2543:21322) — six icons,
 *  Money (Dollar) active since this is the Money screen. */
export const SOCIAL_TAB_BAR: SkinTabBarConfig = {
  items: [
    { Icon: IconHomeOpen, label: 'Home' },
    { Icon: IconMagnifyingGlass2, label: 'Search' },
    { Icon: IconSparkle2, label: 'Grok' },
    { Icon: IconBell2, label: 'Notifications' },
    { Icon: IconDollar, activeIcon: IconDollarFilled, label: 'Money', active: true },
  ],
};
