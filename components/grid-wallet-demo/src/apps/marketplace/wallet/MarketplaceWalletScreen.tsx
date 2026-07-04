'use client';

import type { SkinWalletScreenProps } from '@/apps/types';
import { MarketplaceHomeContent } from './HomeBlocks';
import { MarketplaceTabBar } from '../blocks/MarketplaceTabBar';
import styles from './MarketplaceWalletScreen.module.scss';

/** Marketplace Wallet home (Figma 2610:11075) — Airbnb-style, flat. All values
 *  come from the shared wallet brain (`home`); the layout blocks live in
 *  HomeBlocks so the auth screen can reuse them zeroed. Deposit/Withdraw/Send
 *  are decorative this pass (money-sheet faces come later).
 *
 *  No entrance stagger: the sign-in sheet dismisses OVER this exact layout
 *  (the auth screen's zeroed backdrop), so the reveal choreography already
 *  happened — re-staggering the items here would double it. */
export function MarketplaceWalletScreen(props: SkinWalletScreenProps) {
  const { home } = props;

  return (
    <div className={styles.root}>
      <MarketplaceHomeContent
        balanceCents={home.availableCents}
        apyPercent={home.apyPercent}
        rewardsMonthCents={Math.round(home.earningsTodayCents * 30)}
        showActivity
        animatedBalance
      />
      <MarketplaceTabBar />
    </div>
  );
}
