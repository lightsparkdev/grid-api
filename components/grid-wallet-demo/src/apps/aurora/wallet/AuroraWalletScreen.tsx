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

const SHEET_DURATION = 0.4;
const HEADER_DURATION = 0.2;
const CREATING_MS = 2200;
/** Issuance card is the home card scaled to Figma 338 / 370. */
const CARD_ISSUANCE_SCALE = 338 / 370;
const SHEET_OFFSCREEN = 'calc(100% + 224px)';

const HEADER_TRANSITION = motionTransition(easeOutQuick, HEADER_DURATION);
/* The transition is staggered so it doesn't all fire at once: the card carries +
   the sheet slides away first, the aurora fades in just behind them, and the copy
   resolves last. */
const SHEET_SLIDE = motionTransition(easeOutSnappy, SHEET_DURATION);
const CARD_TRANSITION = motionTransition(easeOutSnappy, 0.5);
const AURORA_IN = motionTransition(easeOutQuick, 0.5, { delay: 0.15 });
const AURORA_OUT = motionTransition(easeOutQuick, 0.3);
const CONTENT_IN = motionTransition(easeOutQuick, 0.4, { delay: 0.3 });
const CONTENT_OUT = motionTransition(easeOutQuick, 0.2);

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
  const cardCentered = isIssuance; // centered for intro/creating/ready; top for closed/home

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
      {/* Full-screen aurora behind everything (incl. the header) during issuance.
          It simply fades in / out (no scale), with a tall auth-style fade so the
          bottom content reads on the solid wallet background. */}
      <AnimatePresence>
        {showFullAurora && (
          <motion.div
            key="full-aurora"
            className={styles.fullAurora}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, transition: AURORA_IN }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transition: AURORA_OUT }}
          >
            <AuroraBackground
              showRadialGradient={false}
              className={styles.fullAuroraBg}
              fieldId="issuance"
            />
            <div
              className={clsx(
                styles.auroraFade,
                cardView === 'creating' && styles.auroraFadeHidden,
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
                closeOnAurora={showFullAurora}
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

      <div className={clsx(styles.body, isOpen && styles.bodyOpen)}>
        {/* The card is a single element that carries through every state — it
            layout-animates between the top slot and the centered issuance slot. */}
        <div
          className={clsx(
            styles.cardArea,
            cardCentered ? styles.cardAreaCentered : styles.cardAreaTop,
            cardView === 'creating' && styles.cardAreaCreating,
          )}
        >
          <motion.div layout={!reduceMotion} className={styles.cardCarry} transition={CARD_TRANSITION}>
            <motion.div
              className={styles.cardScale}
              initial={false}
              animate={{ scale: isIssuance ? CARD_ISSUANCE_SCALE : 1 }}
              transition={CARD_TRANSITION}
            >
              <DebitCard
                interactive={!isOpen}
                onOpen={openCard}
                bordered={showFullAurora}
                showNumber={!showFullAurora}
                issued={issued}
              />
            </motion.div>
          </motion.div>
          {cardView === 'creating' && <CreatingCaption />}
        </div>

        {/* Wallet sheet — always mounted; translates straight down out of the way
            when the card opens (no fade). It drops out of the flex flow while open
            so the card can carry to the centered slot without the sheet competing
            for height (which made the card jump when it un-mounted). */}
        <motion.div
          className={clsx(styles.sheetWrap, isOpen && styles.sheetWrapOpen)}
          initial={false}
          animate={{ y: isOpen ? SHEET_OFFSCREEN : 0 }}
          transition={SHEET_SLIDE}
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

        {/* Issuance / card-home content below the card. popLayout (not "wait") so an
            exiting block leaves the flex flow immediately instead of holding its
            height for the 0.2s exit — otherwise its delayed unmount snaps the
            centered card down (the intro → creating "jump"). */}
        <AnimatePresence mode="popLayout" initial={false}>
          {cardView === 'intro' && (
            <motion.div
              key="intro"
              className={styles.bottomContent}
              initial={reduceMotion ? false : CONTENT_HIDDEN}
              animate={reduceMotion ? CONTENT_VISIBLE : { ...CONTENT_VISIBLE, transition: CONTENT_IN }}
              exit={reduceMotion ? { opacity: 0 } : { ...CONTENT_HIDDEN, transition: CONTENT_OUT }}
            >
              <IntroContent onCreate={() => setCardView('creating')} />
            </motion.div>
          )}
          {cardView === 'ready' && (
            <motion.div
              key="ready"
              className={styles.bottomContent}
              initial={reduceMotion ? false : CONTENT_HIDDEN}
              animate={reduceMotion ? CONTENT_VISIBLE : { ...CONTENT_VISIBLE, transition: CONTENT_IN }}
              exit={reduceMotion ? { opacity: 0 } : { ...CONTENT_HIDDEN, transition: CONTENT_OUT }}
            >
              <ReadyContent onContinue={() => setCardView('home')} />
            </motion.div>
          )}
          {cardView === 'home' && (
            <motion.div
              key="home"
              className={styles.homeContent}
              initial={reduceMotion ? false : CONTENT_HIDDEN}
              animate={reduceMotion ? CONTENT_VISIBLE : { ...CONTENT_VISIBLE, transition: CONTENT_IN }}
              exit={reduceMotion ? { opacity: 0 } : { ...CONTENT_HIDDEN, transition: CONTENT_OUT }}
            >
              <CardHomeContent />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
