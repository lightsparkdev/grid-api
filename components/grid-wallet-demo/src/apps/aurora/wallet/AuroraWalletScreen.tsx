'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { AuroraBackground } from '@/apps/shared/AuroraBackground';
import { GlassSymbolButton, headerGlassBrightness } from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import { useThemeMode } from '@/hooks/useThemeMode';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import { BalanceHero } from './BalanceHero';
import { CardHomeContent } from './CardHomeContent';
import { CreatingCaption, IntroContent, ReadyContent } from './CardIssuanceContent';
import { DebitCard } from './DebitCard';
import { WalletActions } from './WalletActions';
import { WalletCardDetailHeader } from './WalletCardDetailHeader';
import { WalletInsightCards, type WalletInsightCardsProps } from './WalletInsightCards';
import { WalletListSection } from './WalletListSection';
import { WalletSheet } from './WalletSheet';
import styles from './AuroraWalletScreen.module.scss';

type CardView = 'closed' | 'intro' | 'creating' | 'ready' | 'home';

const SHEET_DURATION = 0.35;
const HEADER_DURATION = 0.2;
const CREATING_MS = 2200;
/** Issuance card is the home card scaled to Figma 338 / 370. */
const CARD_ISSUANCE_SCALE = 338 / 370;

const HEADER_TRANSITION = motionTransition(easeOutQuick, HEADER_DURATION);
const SHEET_SLIDE_OUT = motionTransition(easeOutQuick, SHEET_DURATION);
const SHEET_SLIDE_IN = motionTransition(easeOutSnappy, SHEET_DURATION);
const OVERLAY_TRANSITION = motionTransition(easeOutSnappy, 0.4);
const CARD_TRANSITION = motionTransition(easeOutSnappy, 0.45);
const CONTENT_TRANSITION = motionTransition(easeOutQuick, 0.3);

const HEADER_HIDDEN = { opacity: 0, filter: 'blur(10px)' };
const HEADER_VISIBLE = { opacity: 1, filter: 'blur(0px)' };
const CONTENT_HIDDEN = { opacity: 0, y: 12, filter: 'blur(8px)' };
const CONTENT_VISIBLE = { opacity: 1, y: 0, filter: 'blur(0px)' };

interface AuroraWalletScreenProps extends WalletInsightCardsProps {
  /** Formatted balance from demo state, e.g. "$0.00". */
  balance?: string;
  onAdd?: () => void;
  onWithdraw?: () => void;
  onSend?: () => void;
}

/** Aurora wallet home + debit card issuance flow (Figma Bitcoin 2026). */
export function AuroraWalletScreen({
  balance = '$0.00',
  onAdd,
  onWithdraw,
  onSend,
  ...insights
}: AuroraWalletScreenProps) {
  const reduceMotion = useReducedMotion();
  const theme = useThemeMode();
  const [cardView, setCardView] = useState<CardView>('closed');
  const [issued, setIssued] = useState(false);

  const isOpen = cardView !== 'closed';
  const isIssuance = cardView === 'intro' || cardView === 'creating' || cardView === 'ready';
  const showFullAurora = cardView === 'intro' || cardView === 'creating';

  // Simulated card creation: auto-advance creating -> ready (and mark issued).
  useEffect(() => {
    if (cardView !== 'creating') return;
    const t = window.setTimeout(() => {
      setIssued(true);
      setCardView('ready');
    }, CREATING_MS);
    return () => window.clearTimeout(t);
  }, [cardView]);

  const openCard = () => setCardView(issued ? 'home' : 'intro');

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <AnimatePresence initial={false}>
          {isOpen ? (
            <motion.div
              key="detail-header"
              className={styles.headerInner}
              initial={reduceMotion ? false : HEADER_HIDDEN}
              animate={HEADER_VISIBLE}
              exit={HEADER_HIDDEN}
              transition={HEADER_TRANSITION}
            >
              <WalletCardDetailHeader
                onClose={() => setCardView('closed')}
                showActions={cardView === 'home'}
              />
            </motion.div>
          ) : (
            <motion.div
              key="home-header"
              className={styles.headerInner}
              initial={reduceMotion ? false : HEADER_HIDDEN}
              animate={HEADER_VISIBLE}
              exit={HEADER_HIDDEN}
              transition={HEADER_TRANSITION}
            >
              <h1 className={styles.title}>Aurora</h1>
              <GlassSymbolButton
                aria-label="Settings"
                size={40}
                type="button"
                glass={{ brightness: headerGlassBrightness(theme) }}
              >
                <SfSymbol name="gearshape.fill" size={17} />
              </GlassSymbolButton>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Wallet home — stays mounted under the issuance overlay. */}
      <div className={styles.body}>
        <div className={styles.cardWrap}>
          <DebitCard interactive={!isOpen} onOpen={openCard} />
        </div>

        <motion.div
          className={styles.sheetWrap}
          animate={{ y: isOpen ? 'calc(100% + 224px)' : 0 }}
          transition={
            reduceMotion ? { duration: 0 } : isOpen ? SHEET_SLIDE_OUT : SHEET_SLIDE_IN
          }
        >
          <WalletSheet dismissed={isOpen}>
            <BalanceHero balance={balance} />
            <WalletActions onAdd={onAdd} onWithdraw={onWithdraw} onSend={onSend} />
            <WalletInsightCards {...insights} />
            <WalletListSection
              title="Activity"
              emptyTitle="Nothing here, yet"
              emptySub={
                <>
                  Fund your account to start
                  <br />
                  using your wallet
                </>
              }
              cta={{ label: 'Add money', onClick: onAdd }}
              concentricBottom
            />
          </WalletSheet>
        </motion.div>
      </div>

      {/* Issuance / card-detail overlay. */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="card-overlay"
            className={styles.overlay}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={OVERLAY_TRANSITION}
          >
            <AnimatePresence>
              {showFullAurora && (
                <motion.div
                  key="full-aurora"
                  className={styles.fullAurora}
                  initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                  transition={OVERLAY_TRANSITION}
                >
                  <AuroraBackground
                    fadeBottom
                    showRadialGradient={false}
                    className={styles.fullAuroraBg}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className={styles.overlayBody}>
              <motion.div
                layout={!reduceMotion}
                className={clsx(
                  styles.cardArea,
                  isIssuance ? styles.cardAreaCentered : styles.cardAreaTop,
                  cardView === 'creating' && styles.cardAreaCreating,
                )}
                transition={CARD_TRANSITION}
              >
                <motion.div
                  className={styles.cardScale}
                  animate={{ scale: isIssuance ? CARD_ISSUANCE_SCALE : 1 }}
                  transition={CARD_TRANSITION}
                >
                  <DebitCard
                    interactive={false}
                    bordered={showFullAurora}
                    showNumber={cardView === 'home'}
                  />
                </motion.div>
                {cardView === 'creating' && <CreatingCaption />}
              </motion.div>

              <AnimatePresence mode="wait" initial={false}>
                {cardView === 'intro' && (
                  <motion.div
                    key="intro"
                    className={styles.bottomContent}
                    initial={reduceMotion ? false : CONTENT_HIDDEN}
                    animate={CONTENT_VISIBLE}
                    exit={reduceMotion ? { opacity: 0 } : CONTENT_HIDDEN}
                    transition={CONTENT_TRANSITION}
                  >
                    <IntroContent onCreate={() => setCardView('creating')} />
                  </motion.div>
                )}
                {cardView === 'ready' && (
                  <motion.div
                    key="ready"
                    className={styles.bottomContent}
                    initial={reduceMotion ? false : CONTENT_HIDDEN}
                    animate={CONTENT_VISIBLE}
                    exit={reduceMotion ? { opacity: 0 } : CONTENT_HIDDEN}
                    transition={CONTENT_TRANSITION}
                  >
                    <ReadyContent onContinue={() => setCardView('home')} />
                  </motion.div>
                )}
                {cardView === 'home' && (
                  <motion.div
                    key="home"
                    className={styles.homeContent}
                    initial={reduceMotion ? false : CONTENT_HIDDEN}
                    animate={CONTENT_VISIBLE}
                    exit={reduceMotion ? { opacity: 0 } : CONTENT_HIDDEN}
                    transition={CONTENT_TRANSITION}
                  >
                    <CardHomeContent />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
