import type { SkinTabBarConfig } from './types';
import { ZLogo } from './ZLogo';
import { IconHome, IconHomeFilled, IconMagnifyingGlass, IconBell, IconBubble2 } from './icons';

/** Z (social platform) — an X-style skin. Brand + copy live here; the auth and
 *  Money-home layouts live in SocialAuthScreen / SocialWalletScreen. Re-brand by
 *  changing BRAND alone; code identifiers stay category-named (social). */
export const BRAND = 'Z';

/** Auth hero copy — the "See what's going on" sign-in screen. */
export const SOCIAL_AUTH = {
  headline: 'See what\u2019s going on',
  legalPrefix: 'By continuing, you agree to our ',
  legalLinks: ['Terms', 'Privacy Policy', 'Cookie Use'] as const,
  usernameCta: 'Login with username',
  signingIn: 'Signing you in\u2026',
};

/** Money home chrome copy. */
export const SOCIAL_MONEY = {
  title: 'Money',
  balanceLabel: 'Total Balance',
  balanceCaption: 'Your assets are safe',
  rewardsLabel: 'Rewards',
  cardLabel: `${BRAND} Card`,
};

/** Decorative bottom tab bar for the Money home (Home active). */
export const SOCIAL_TAB_BAR: SkinTabBarConfig = {
  items: [
    { Icon: IconHome, activeIcon: IconHomeFilled, label: 'Home', active: true },
    { Icon: IconMagnifyingGlass, label: 'Search' },
    { Icon: ZLogo, label: 'Z' },
    { Icon: IconBell, label: 'Notifications' },
    { Icon: IconBubble2, label: 'Messages' },
  ],
};
