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
import { CreatingCaption } from './CardIssuanceContent';
import { CardSparkles } from './CardSparkles';
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
const ISSUE_DY = 158;
const ISSUE_SCALE = 0.75;
// While creating, the copy/CTA clear out so the card (+ caption) drop so the
// card-plus-caption GROUP sits at the sheet's vertical center.
const CREATING_DY = 200;
// Intro float: a TRUE isometric hover (orthographic — no perspective). The card
// sits at the textbook isometric angle and gently bobs up/down, like a floating
// game item. Settles flat/head-on for creating (shrunk a touch), ready, and morph.
const ISO_ROTX = 54.736; // textbook isometric: arccos(1/√3) ≈ 54.736°
const ISO_ROTZ = 45; // + the 45° spin = the standard isometric projection
const FLOAT_BOB = 9; // hover amplitude (px)
const FLOAT_BOB_T = {
  duration: 3.4,
  repeat: Infinity,
  repeatType: 'mirror' as const,
  ease: 'easeInOut' as const,
  delay: CREATOR_STACKED_SHEET_DURATION,
};
const CREATING_SCALE = 0.9; // shrink a touch while creating
const CARD_SETTLE = motionTransition(easeOutSnappy, CREATOR_STACKED_SHEET_DURATION);
// Flip (intro → creating): ONE continuous roll from the isometric pose to head-on
// — all axes (untilt rotateX/rotateZ + a 180° rotateY roll) move together. Uses the
// "anticipate" easing (easing.dev) which winds back before flipping, over a longer
// beat. 180 (not 360) lands on the card's duplicated back = the same face.
const ANTICIPATE: [number, number, number, number] = [1, -0.4, 0.35, 0.95];
const CARD_FLIP_DURATION = 1;
const CARD_FLIP_T = motionTransition(ANTICIPATE, CARD_FLIP_DURATION);
const CARD_FLIP_ROLL = 180;
// "Creating your card" fades in 150ms before the flip lands.
const CREATE_CAPTION_DELAY = CARD_FLIP_DURATION - 0.15;
// Issuance entrance: the card rides up from below in lockstep with the sheet (same
// easing/duration, no delay) instead of the old decoupled fade. Tuned so it starts
// just off the bottom and arrives as the sheet settles.
const CARD_ENTER_FROM = 520;

const HEADER_HIDDEN = { opacity: 0, filter: 'blur(10px)' };
const HEADER_VISIBLE = { opacity: 1, filter: 'blur(0px)' };
const CONTENT_HIDDEN = { opacity: 0, y: 12, filter: 'blur(8px)' };
const CONTENT_VISIBLE = { opacity: 1, y: 0, filter: 'blur(0px)' };

const ACTIVITY_TABS = ['All', 'Sent', 'Received'];

/** Debit card presentation in the issuance sheet: fades in, then hovers like a
 *  floating video-game item — a super-isometric tilt + a gentle up/down bob and
 *  slow tilt drift (intro). Settles flat/head-on for creating (shrunk a touch),
 *  ready, and the morph into card-home. */
function FloatingCard({
  phase,
  sparkleMode,
  sparkleEmit = true,
  children,
}: {
  phase: 'intro' | 'creating' | 'settled';
  sparkleMode?: 'rise' | 'twinkle';
  sparkleEmit?: boolean;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const intro = phase === 'intro';
  const creating = phase === 'creating';
  return (
    <div className={styles.cardStack}>
      {/* Subtle vertical hover (intro) — holds the isometric card + rising sparkles. */}
      <motion.div
        className={styles.cardFloat}
        initial={{ y: 0 }}
        animate={!reduceMotion && intro ? { y: [-FLOAT_BOB, FLOAT_BOB] } : { y: 0 }}
        transition={!reduceMotion && intro ? FLOAT_BOB_T : CARD_SETTLE}
      >
        <motion.div
          className={styles.cardIso}
          initial={false}
          animate={
            reduceMotion
              ? { rotateX: 0, rotateZ: 0, rotateY: 0, scale: 1 }
              : intro
                ? { rotateX: ISO_ROTX, rotateZ: ISO_ROTZ, rotateY: 0, scale: 1 }
                : // Leaving intro: one continuous roll to head-on (iso untilt + 180°
                  // flip together). Held at 180 after so it never re-rolls.
                  { rotateX: 0, rotateZ: 0, rotateY: CARD_FLIP_ROLL, scale: creating ? CREATING_SCALE : 1 }
          }
          transition={intro ? CARD_SETTLE : CARD_FLIP_T}
        >
          {children}
        </motion.div>
        {/* Sparkles around the card: a rising stream on intro that STOPS emitting on
            create (existing ones finish), and twinkling in place on ready. Keyed by
            mode so the rise layer persists intro→creating. */}
        {sparkleMode && <CardSparkles key={sparkleMode} mode={sparkleMode} emit={sparkleEmit} />}
      </motion.div>
    </div>
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
            // Ride up with the sheet on issuance (start below, no delay, sheet
            // easing); a direct card-home open (already issued) fades in at the slot.
            initial={{ y: cardView === 'home' ? 0 : CARD_ENTER_FROM, opacity: cardView === 'home' ? 0 : 1 }}
            animate={{ y: isTap ? TAP_LIFT : 0, opacity: 1 }}
            exit={{ y: CARD_ENTER_FROM, opacity: 0 }}
            transition={CARD_TRANSITION}
          >
            <motion.div
              className={styles.cardMorph}
              initial={false}
              // Creating drops the card to the sheet's vertical center (copy/CTA are
              // gone); intro/ready hold the upper issuance slot; home morphs to top.
              animate={{
                y: cardView === 'home' ? 0 : cardView === 'creating' ? CREATING_DY : ISSUE_DY,
                scale: isIssuance ? ISSUE_SCALE : 1,
              }}
              transition={cardView === 'creating' ? CARD_FLIP_T : CARD_TRANSITION}
            >
              <FloatingCard
                phase={cardView === 'intro' ? 'intro' : cardView === 'creating' ? 'creating' : 'settled'}
                sparkleMode={
                  cardView === 'intro' || cardView === 'creating'
                    ? 'rise'
                    : cardView === 'ready'
                      ? 'twinkle'
                      : undefined
                }
                sparkleEmit={cardView !== 'creating'}
              >
                <DebitCard issued={issued} shimmer={cardView === 'creating'} />
              </FloatingCard>
            </motion.div>
            {/* "Creating…" rides the foreground, pinned just under the scaled card
                (the card's visual bottom + a small gap). */}
            {cardView === 'creating' && (
              <div
                className={styles.creatingUnderCard}
                style={{ top: CREATING_DY + 116 + 116 * ISSUE_SCALE + 12 }}
              >
                <CreatingCaption delay={CREATE_CAPTION_DELAY} />
              </div>
            )}
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
