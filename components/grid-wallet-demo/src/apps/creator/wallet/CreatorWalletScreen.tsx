'use client';

import clsx from 'clsx';
import { useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  IconArrowBottomTop,
  IconCreditCard2,
  IconMinusMedium,
  IconPeople2,
  IconPlusMedium,
  IconSettingsGear2,
} from '../icons';
import { useScreenOverlay } from '@/apps/shared/AppShell/ScreenOverlayContext';
import { PresentationStage, SheetPresentationProvider } from '@/apps/shared/SheetPresentation';
import { FaceIdAuth } from '@/apps/shared/FaceIdAuth';
import { useStaggerReveal } from '@/apps/shared/useStaggerReveal';
import { GlassToast } from '@/apps/shared/GlassToast';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import { formatUsdCents, useWalletHome } from '@/apps/shared/wallet';
import { AddMoneySheet } from './AddMoneySheet';
import { CardHomeContent } from './CardHomeContent';
import { CardIssuanceSheet } from './CardIssuanceSheet';
import { DebitCard } from './DebitCard';
import { SendReceiveSheet } from './SendReceiveSheet';
import { TapToPayStatus } from './TapToPayStatus';
import { WalletCardDetailHeader } from './WalletCardDetailHeader';
import { WalletListSection } from './WalletListSection';
import type { SkinWalletScreenProps } from '@/apps/types';
import { SkinTabBar } from '../blocks/SkinTabBar';
import { CREATOR_HERO_STATS, CREATOR_STACKED_SHEET_DURATION, CREATOR_TAB_BAR } from '../config';
import styles from './CreatorWalletScreen.module.scss';

const HEADER_DURATION = 0.2;
const TAP_LIFT = -56;

const HEADER_TRANSITION = motionTransition(easeOutQuick, HEADER_DURATION);
const CARD_TRANSITION = motionTransition(easeOutSnappy, CREATOR_STACKED_SHEET_DURATION);
const CONTENT_IN = motionTransition(easeOutQuick, 0.4, { delay: 0.3 });
const CONTENT_OUT = motionTransition(easeOutQuick, 0.2);
const TAB_INDICATOR = motionTransition(easeOutSnappy, 0.35);

// Issuance card: centered + scaled down, floating; morphs up to full size at the
// card-home slot on Continue. (DY is the downward offset from the home slot.)
const ISSUE_DY = 118;
const ISSUE_SCALE = 0.75;
// Entrance: delayed so it lands AFTER the sheet has risen, then a springy arc
// (overshoots up, settles down) — a bouncy spring from just-below.
const ENTRANCE_SPRING = { type: 'spring' as const, stiffness: 420, damping: 17, delay: 0.3 };
// Card 3D float (intro only): a gentle, continuous tilt + bob. Mirror-looped so the
// card eases back and forth without a seam; settles to flat (head-on) otherwise.
const CARD_SETTLE = motionTransition(easeOutSnappy, CREATOR_STACKED_SHEET_DURATION);
const FLOAT_ROTX = { duration: 6, repeat: Infinity, repeatType: 'mirror' as const, ease: 'easeInOut' as const };
const FLOAT_ROTY = { duration: 7.5, repeat: Infinity, repeatType: 'mirror' as const, ease: 'easeInOut' as const };
const FLOAT_Y = { duration: 5, repeat: Infinity, repeatType: 'mirror' as const, ease: 'easeInOut' as const };

const HEADER_HIDDEN = { opacity: 0, filter: 'blur(10px)' };
const HEADER_VISIBLE = { opacity: 1, filter: 'blur(0px)' };
const CONTENT_HIDDEN = { opacity: 0, y: 12, filter: 'blur(8px)' };
const CONTENT_VISIBLE = { opacity: 1, y: 0, filter: 'blur(0px)' };

const ACTIVITY_TABS = ['All', 'Sent', 'Received'];

/** Debit card presentation in the issuance sheet: a delayed, springy arc fade-in,
 *  then a continuous 3D float while `float` (intro). Goes flat/head-on otherwise
 *  (creating/ready) and as it morphs into card-home. */
function FloatingCard({ float, children }: { float: boolean; children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.2 }}>
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div
      className={styles.cardEntrance}
      initial={{ opacity: 0, y: 44 }}
      animate={{ opacity: 1, y: 0 }}
      transition={ENTRANCE_SPRING}
    >
      <motion.div
        className={styles.cardFloat}
        animate={
          float
            ? { rotateX: [4, -3], rotateY: [-6, 6], y: [-6, 6] }
            : { rotateX: 0, rotateY: 0, y: 0 }
        }
        transition={float ? { rotateX: FLOAT_ROTX, rotateY: FLOAT_ROTY, y: FLOAT_Y } : CARD_SETTLE}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Creator (creator) wallet home — Twitch-style: scrolling brand header, purple
 *  wash balance hero, Deposit/Withdraw/Send, Yield + Followers metrics, filtered
 *  activity, decorative tab bar. All app logic is the shared `useWalletHome`; the
 *  card issuance is a stacked sheet with a floating card that morphs into
 *  card-home, and tap-to-pay reuses the shared flow. */
export function CreatorWalletScreen(props: SkinWalletScreenProps) {
  const { entrance = false, onQuoteCreate, onLinkExternalAccount, onCardIssued } = props;
  const reduceMotion = useReducedMotion();
  const overlayEl = useScreenOverlay();

  const {
    cardView,
    setCardView,
    issued,
    tapPhase,
    setTapPhase,
    transactions,
    sheetMode,
    sheetOpen,
    setSheetOpen,
    sheetConfirming,
    sendReceiveOpen,
    setSendReceiveOpen,
    toast,
    setToast,
    showToast,
    availableCents,
    apyPercent,
    homeActivity,
    isIssuance,
    isTap,
    openSheet,
    startSend,
    startReceive,
    openCard,
    startTapToPay,
    finishTransfer,
    confirmTransfer,
    handleReceivePayment,
  } = useWalletHome(props);

  const reveal = useStaggerReveal({ baseDelay: 0.05, stagger: 0.07 });
  const enter = (index: number) => (entrance ? reveal(index) : { initial: false as const });

  const [activityTab, setActivityTab] = useState(0);
  const filteredActivity = useMemo(() => {
    const tab = ACTIVITY_TABS[activityTab];
    if (tab === 'Sent') return homeActivity.filter((r) => !r.amount.includes('+'));
    if (tab === 'Received') return homeActivity.filter((r) => r.amount.includes('+'));
    return homeActivity;
  }, [activityTab, homeActivity]);

  // Wallet home shows for the closed state AND behind the rising issuance sheet
  // (it recedes via the stacked effect). Card-home replaces it; tap-to-pay too.
  const onWalletHome = cardView !== 'home' && !isTap;
  const showCard = isIssuance || cardView === 'home';

  const overlayContent = (
    <>
      <FaceIdAuth
        active={tapPhase === 'auth' || sheetConfirming}
        onDone={() => {
          if (sheetConfirming) finishTransfer();
          else setTapPhase('done');
        }}
      />
      <GlassToast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
  const screenOverlay = overlayEl ? (
    createPortal(overlayContent, overlayEl)
  ) : (
    <div className={styles.faceIdLayer}>{overlayContent}</div>
  );

  return (
    <SheetPresentationProvider>
    <div className={styles.root}>
      {/* The presenting "card" surface — scales back behind a rising sheet (iOS
          stacked-sheet effect). The issuance sheet + floating card + overlay stay
          siblings, above the stage. offset 62 pairs with the sheet's .flow top
          (72) for a 10px peek; duration matches the slide for lockstep. */}
      <PresentationStage
        className={styles.stageSkin}
        offset={62}
        duration={CREATOR_STACKED_SHEET_DURATION}
      >
      {/* Card-detail header (card-home only — issuance's close X lives in the sheet). */}
      {cardView === 'home' && !isTap && (
        <header className={styles.header}>
          <AnimatePresence initial={false}>
            <motion.div
              key="detail-header"
              className={styles.headerInner}
              initial={reduceMotion ? false : HEADER_HIDDEN}
              animate={HEADER_VISIBLE}
              exit={HEADER_HIDDEN}
              transition={HEADER_TRANSITION}
            >
              <WalletCardDetailHeader onClose={() => setCardView('closed')} showActions />
            </motion.div>
          </AnimatePresence>
        </header>
      )}

      {onWalletHome && (
        <header className={styles.brandHeader}>
          <button type="button" className={styles.brandHeaderButton} aria-label="Community">
            <IconPeople2 size={24} />
          </button>
          <span className={styles.brandHeaderTitle}>Wallet</span>
          <button type="button" className={styles.brandHeaderButton} aria-label="Settings">
            <IconSettingsGear2 size={24} />
          </button>
        </header>
      )}

      <motion.div
        className={clsx(
          styles.body,
          onWalletHome && styles.bodyHome,
          cardView === 'home' && styles.bodyOpen,
          isTap && styles.bodyTap,
        )}
        initial={false}
        animate={{ y: isTap ? TAP_LIFT : 0 }}
        transition={CARD_TRANSITION}
      >
        {onWalletHome && (
          <>
            <motion.div {...enter(1)} className={styles.hero}>
              <div className={styles.heroTop}>
                <div className={styles.balanceRow}>
                  <span className={styles.balanceLabel}>Balance</span>
                  <span className={styles.apyPill}>{apyPercent.toFixed(2)}% APY</span>
                </div>
                <span className={styles.balanceAmount}>{formatUsdCents(availableCents)}</span>
              </div>
              <div className={styles.heroStats}>
                {CREATOR_HERO_STATS.map((stat) => (
                  <p key={stat.label} className={styles.heroStat}>
                    <span className={styles.heroStatAmount}>{stat.amount}</span> {stat.label}
                  </p>
                ))}
              </div>
            </motion.div>

            <motion.div {...enter(2)} className={styles.actionBlock}>
              <div className={styles.actionRow}>
                <button
                  type="button"
                  className={styles.actionPill}
                  onClick={() => openSheet('add')}
                >
                  <IconPlusMedium size={20} />
                  <span>Deposit</span>
                </button>
                <button
                  type="button"
                  className={styles.actionPill}
                  onClick={() => openSheet('withdraw')}
                >
                  <IconMinusMedium size={20} />
                  <span>Withdraw</span>
                </button>
                <button
                  type="button"
                  className={styles.actionPill}
                  onClick={() => setSendReceiveOpen(true)}
                >
                  <IconArrowBottomTop size={20} />
                  <span>Transfer</span>
                </button>
              </div>
              <div className={styles.cardRow}>
                <button type="button" className={styles.cardButton} onClick={openCard}>
                  <IconCreditCard2 size={20} />
                  <span>{issued ? 'View card' : 'Get a free debit card'}</span>
                </button>
              </div>
            </motion.div>

            <motion.div
              {...enter(3)}
              className={styles.activityTabs}
              role="tablist"
              aria-label="Activity filter"
            >
              {ACTIVITY_TABS.map((t, i) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={i === activityTab}
                  className={clsx(styles.activityTab, i === activityTab && styles.activityTabActive)}
                  onClick={() => setActivityTab(i)}
                >
                  {t}
                  {i === activityTab && (
                    <motion.span
                      layoutId="creatorTabIndicator"
                      className={styles.activityIndicator}
                      transition={reduceMotion ? { duration: 0 } : TAB_INDICATOR}
                    />
                  )}
                </button>
              ))}
            </motion.div>

            <WalletListSection
              title="Activity"
              hideTitle
              emptyTitle="Nothing here, yet"
              emptySub={
                <>
                  Fund your account to start
                  <br />
                  using your wallet
                </>
              }
              cta={{ label: 'Add money', onClick: () => openSheet('add') }}
              items={filteredActivity}
              concentricBottom
              grow
            />
          </>
        )}

        <AnimatePresence mode="popLayout" initial={false}>
          {cardView === 'home' && !isTap && (
            <motion.div
              key="card-home"
              className={styles.cardHomeBody}
              initial={reduceMotion ? false : CONTENT_HIDDEN}
              animate={reduceMotion ? CONTENT_VISIBLE : { ...CONTENT_VISIBLE, transition: CONTENT_IN }}
              exit={reduceMotion ? { opacity: 0 } : { ...CONTENT_HIDDEN, transition: CONTENT_OUT }}
            >
              <CardHomeContent transactions={transactions} onTapToPay={startTapToPay} />
            </motion.div>
          )}
          {isTap && (
            <motion.div
              key="tap"
              className={styles.tapStatus}
              initial={reduceMotion ? false : CONTENT_HIDDEN}
              animate={reduceMotion ? CONTENT_VISIBLE : { ...CONTENT_VISIBLE, transition: CONTENT_IN }}
              exit={reduceMotion ? { opacity: 0 } : { ...CONTENT_HIDDEN, transition: CONTENT_OUT }}
            >
              <TapToPayStatus phase={tapPhase === 'idle' ? 'hold' : tapPhase} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {onWalletHome ? <SkinTabBar {...CREATOR_TAB_BAR} /> : null}
      </PresentationStage>

      {/* Floating debit card — a single persistent element in an un-scaled
          foreground layer so it morphs cleanly from the issuance sheet into
          card-home (its target isn't inside the scaling stage). During issuance it
          sits centered + scaled down; on Continue it morphs up to the full-size
          card-home slot. Lifts during tap. */}
      <AnimatePresence>
        {showCard && (
          <motion.div
            key="card-foreground"
            className={styles.cardForeground}
            aria-hidden
            initial={false}
            animate={{ y: isTap ? TAP_LIFT : 0 }}
            exit={{ opacity: 0 }}
            transition={CARD_TRANSITION}
          >
            <motion.div
              className={styles.cardMorph}
              initial={false}
              animate={{ y: isIssuance ? ISSUE_DY : 0, scale: isIssuance ? ISSUE_SCALE : 1 }}
              transition={CARD_TRANSITION}
            >
              <FloatingCard float={cardView === 'intro'}>
                <DebitCard issued={issued} shimmer={cardView === 'creating'} />
              </FloatingCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CardIssuanceSheet
        open={isIssuance}
        cardView={cardView}
        onClose={() => setCardView('closed')}
        onCreate={() => {
          setCardView('creating');
          onCardIssued?.();
        }}
        onContinue={() => setCardView('home')}
      />

      <SendReceiveSheet
        open={sendReceiveOpen}
        onDismiss={() => setSendReceiveOpen(false)}
        onSend={startSend}
        onReceive={startReceive}
      />

      <AddMoneySheet
        open={sheetOpen}
        mode={sheetMode}
        availableCents={availableCents}
        confirming={sheetConfirming}
        onDismiss={() => setSheetOpen(false)}
        onQuote={(cents, dest) => {
          if (sheetMode !== 'receive') onQuoteCreate?.(sheetMode, cents, dest);
        }}
        onLinkExternalAccount={(input, label) => {
          onLinkExternalAccount?.(input, label);
          showToast(
            label === 'Add bank account'
              ? 'Bank account saved'
              : label === 'Add crypto wallet'
                ? 'Wallet added'
                : 'Recipient saved',
          );
        }}
        onReceive={handleReceivePayment}
        onConfirm={confirmTransfer}
      />

      {screenOverlay}
    </div>
    </SheetPresentationProvider>
  );
}
