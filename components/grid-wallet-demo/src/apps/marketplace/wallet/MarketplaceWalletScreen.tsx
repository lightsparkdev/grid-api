'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { SkinWalletScreenProps } from '@/apps/types';
import { easeOutSnappy, motionTransition } from '@/lib/easing';
import { MarketplaceHomeContent } from './HomeBlocks';
import { AddMoneyPage } from './AddMoneyPage';
import { MarketplaceTabBar } from '../blocks/MarketplaceTabBar';
import { MARKETPLACE_PUSH_DURATION, MARKETPLACE_PUSH_PARALLAX } from '../config';
import styles from './MarketplaceWalletScreen.module.scss';

const PUSH_TRANSITION = motionTransition(easeOutSnappy, MARKETPLACE_PUSH_DURATION);

/** Marketplace Wallet home (Figma 2610:11075) — Airbnb-style, flat. All values
 *  come from the shared wallet brain (`home`); the layout blocks live in
 *  HomeBlocks so the auth screen can reuse them zeroed. Deposit pushes the
 *  AddMoneyPage in from the right, iOS-nav style, while the home parallax-
 *  shifts left beneath it. Withdraw/Send stay decorative this pass.
 *
 *  No entrance stagger: the sign-in sheet dismisses OVER this exact layout
 *  (the auth screen's zeroed backdrop), so the reveal choreography already
 *  happened — re-staggering the items here would double it. */
export function MarketplaceWalletScreen(props: SkinWalletScreenProps) {
  const { home, money } = props;
  const reduceMotion = useReducedMotion();
  const pageOpen = home.sheetOpen;

  return (
    <div className={styles.root}>
      {/* iOS nav-stack parallax: the home shifts left behind the pushed page,
          in lockstep with the page's slide. */}
      <motion.div
        className={styles.underlay}
        initial={false}
        animate={{ x: pageOpen && !reduceMotion ? -MARKETPLACE_PUSH_PARALLAX : 0 }}
        transition={PUSH_TRANSITION}
      >
        <MarketplaceHomeContent
          balanceCents={home.availableCents}
          apyPercent={home.apyPercent}
          rewardsMonthCents={Math.round(home.earningsTodayCents * 30)}
          showActivity
          animatedBalance
          onDeposit={() => home.openSheet('add')}
        />
        <MarketplaceTabBar />
      </motion.div>

      {/* Dim over the receding wallet — fades in with the page's slide. */}
      <AnimatePresence initial={false}>
        {pageOpen && (
          <motion.div
            key="push-scrim"
            className={styles.pushScrim}
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={PUSH_TRANSITION}
          />
        )}
      </AnimatePresence>

      <AddMoneyPage m={money} open={pageOpen} onDismiss={money.dismiss} />
    </div>
  );
}
