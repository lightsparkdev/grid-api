'use client';

import clsx from 'clsx';
import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { GlassSymbolButton } from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import { BalanceHero } from './BalanceHero';
import { DebitCard } from './DebitCard';
import { WalletActions } from './WalletActions';
import { WalletActivitySection } from './WalletActivitySection';
import { WalletCardDetailHeader } from './WalletCardDetailHeader';
import { WalletInsightCards, type WalletInsightCardsProps } from './WalletInsightCards';
import { WalletSheet } from './WalletSheet';
import styles from './AuroraWalletScreen.module.scss';

const SHEET_DURATION = 0.35;
const HEADER_TRANSITION = motionTransition(easeOutSnappy, SHEET_DURATION);
const SHEET_SLIDE_OUT = motionTransition(easeOutQuick, SHEET_DURATION);
const SHEET_SLIDE_IN = motionTransition(easeOutSnappy, SHEET_DURATION);
const HEADER_BLUR = { opacity: 0, filter: 'blur(10px)' };
const HEADER_CLEAR = { opacity: 1, filter: 'blur(0px)' };

interface AuroraWalletScreenProps extends WalletInsightCardsProps {
  /** Formatted balance from demo state, e.g. "$0.00". */
  balance?: string;
  onAdd?: () => void;
  onWithdraw?: () => void;
  onSend?: () => void;
}

/** Aurora wallet home — built piece-by-piece from Figma (Bitcoin 2026). */
export function AuroraWalletScreen({
  balance = '$0.00',
  onAdd,
  onWithdraw,
  onSend,
  ...insights
}: AuroraWalletScreenProps) {
  const reduceMotion = useReducedMotion();
  const [cardDetailOpen, setCardDetailOpen] = useState(false);

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <AnimatePresence mode="wait" initial={false}>
          {cardDetailOpen ? (
            <motion.div
              key="detail-header"
              className={styles.headerInner}
              initial={reduceMotion ? false : HEADER_BLUR}
              animate={HEADER_CLEAR}
              exit={HEADER_BLUR}
              transition={HEADER_TRANSITION}
            >
              <WalletCardDetailHeader onClose={() => setCardDetailOpen(false)} />
            </motion.div>
          ) : (
            <motion.div
              key="home-header"
              className={styles.headerInner}
              initial={reduceMotion ? false : HEADER_BLUR}
              animate={HEADER_CLEAR}
              exit={HEADER_BLUR}
              transition={HEADER_TRANSITION}
            >
              <h1 className={styles.title}>Aurora</h1>
              <GlassSymbolButton
                aria-label="Settings"
                size={40}
                type="button"
                glass={{ brightness: 1 }}
              >
                <SfSymbol name="gearshape.fill" size={17} />
              </GlassSymbolButton>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className={clsx(styles.body, cardDetailOpen && styles.bodyDetailOpen)}>
        <div className={styles.cardWrap}>
          <DebitCard
            interactive={!cardDetailOpen}
            onOpen={() => setCardDetailOpen(true)}
          />
        </div>

        <motion.div
          className={clsx(styles.sheetWrap, cardDetailOpen && styles.sheetWrapDismissed)}
          animate={{
            y: cardDetailOpen ? 'calc(100% + 224px)' : 0,
          }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : cardDetailOpen
                ? SHEET_SLIDE_OUT
                : SHEET_SLIDE_IN
          }
        >
          <WalletSheet dismissed={cardDetailOpen}>
            <BalanceHero balance={balance} />
            <WalletActions onAdd={onAdd} onWithdraw={onWithdraw} onSend={onSend} />
            <WalletInsightCards {...insights} />
            <WalletActivitySection onAdd={onAdd} />
          </WalletSheet>
        </motion.div>
      </div>
    </div>
  );
}
