'use client';

import clsx from 'clsx';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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

const TAP_LIFT = -56;

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
// Created (ready) screen: the title + value-prop list anchor lower in the sheet, so
// the card recenters in the open space between the X header and the title (it sits a
// touch higher than the intro slot). Title stays in ReadyContent, above the list.
const READY_DY = 82;
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
// Issuance OPEN: staggered cascade — sheet slides in, THEN the card rises up from
// below (fade + de-blur) as the next beat, then the speed lines fade in (deferred in
// CardIssuanceSheet), then the sparkle stream last. A modest lift so it travels up
// without overshooting its slot.
const CARD_REVEAL = motionTransition(easeOutQuick, 0.5, { delay: 0.3 });
const CARD_REVEAL_LIFT = 32; // px the card travels up from below as it reveals in
// Sparkles join the same lockstep beat — a touch after the card so it's present to
// emit them, but part of the group rather than a late afterthought.
const SPARKLE_START_DELAY = 0.6;
// Issuance CLOSE: the card rides back down WITH the sheet. The sheet slides 110% of
// its own height (`.flow` = --app-screen-height − 72) ≈ 1.1 × (874 − 72) ≈ 882px, so
// matching that (same easing/duration via CARD_TRANSITION) keeps them glued on exit.
const SHEET_TOP_INSET = 72;
const SCREEN_HEIGHT = 874; // --app-screen-height (globals.scss)
const CARD_EXIT_TO = 1.1 * (SCREEN_HEIGHT - SHEET_TOP_INSET);
// Card view = a flat full-page sheet that slides up from the bottom (under the status
// bar) when opened from the wallet home. Opened from issuance (Continue) it mounts in
// place (no slide) so the existing card morph + issuance sheet-down reads as before.
const CARD_SHEET_DURATION = CREATOR_STACKED_SHEET_DURATION;
const CARD_SHEET_T = motionTransition(easeOutSnappy, CARD_SHEET_DURATION);

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
  sparkleDelay = 0,
  children,
}: {
  phase: 'intro' | 'creating' | 'settled';
  sparkleMode?: 'rise' | 'twinkle';
  sparkleEmit?: boolean;
  sparkleDelay?: number;
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
          // Only the flip (creating) uses the longer anticipate; ready/home settle
          // on the same transition the move-to-centre uses, so scale + translate
          // stay in sync (no "translate, then scale" two-stage).
          transition={creating ? CARD_FLIP_T : CARD_SETTLE}
        >
          {children}
        </motion.div>
        {/* Sparkles around the card: a rising stream on intro that STOPS emitting on
            create (existing ones finish), and twinkling in place on ready. Keyed by
            mode so the rise layer persists intro→creating. */}
        {sparkleMode && (
          <CardSparkles key={sparkleMode} mode={sparkleMode} emit={sparkleEmit} startDelay={sparkleDelay} />
        )}
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

  // The wallet home is the persistent base layer: it renders behind the rising
  // issuance sheet (recedes via the stacked effect) AND behind the card-view sheet, so
  // the card view can slide up over it.
  const showCard = isIssuance || cardView === 'home';
  // The card view is its own full-page sheet (cardView 'home', incl. tap-to-pay).
  const cardOpen = cardView === 'home';
  // Slide up only when opened from the wallet home; mounting from issuance (ready ->
  // home) stays in place so the card morph + issuance sheet-down reads as before.
  const prevCardViewRef = useRef(cardView);
  useEffect(() => {
    prevCardViewRef.current = cardView;
  }, [cardView]);
  const cardSheetSlideUp = cardOpen && prevCardViewRef.current !== 'ready';

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
      {/* Wallet home base — always mounted; the issuance + card-view sheets overlay it. */}
      <header className={styles.brandHeader}>
        <button type="button" className={styles.brandHeaderButton} aria-label="Community">
          <IconPeople2 size={24} />
        </button>
        <span className={styles.brandHeaderTitle}>Wallet</span>
        <button type="button" className={styles.brandHeaderButton} aria-label="Settings">
          <IconSettingsGear2 size={24} />
        </button>
      </header>

      <div className={clsx(styles.body, styles.bodyHome)}>
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
      </div>

      <SkinTabBar {...CREATOR_TAB_BAR} />
      </PresentationStage>

      {/* Card view — flat full-page sheet, split into two slide layers so the card's
          drop shadow shows on the bg but does NOT fall on the content: the BG sits
          BEHIND the floating card (z 14), the content (header/CTA/list) sits ABOVE it
          (z 31). Slides up from the wallet home; mounts in place from issuance. */}
      <AnimatePresence>
        {cardOpen && (
          <motion.div
            key="card-sheet-bg"
            className={styles.cardSheetBg}
            aria-hidden
            initial={{ y: cardSheetSlideUp ? '100%' : 0 }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={CARD_SHEET_T}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {cardOpen && (
          <motion.div
            key="card-sheet"
            className={styles.cardSheet}
            initial={{ y: cardSheetSlideUp ? '100%' : 0 }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={CARD_SHEET_T}
          >
            {!isTap && (
              <header className={styles.cardSheetHeader}>
                <WalletCardDetailHeader onClose={() => setCardView('closed')} showActions />
              </header>
            )}
            <motion.div
              className={styles.cardSheetBody}
              initial={false}
              animate={{ y: isTap ? TAP_LIFT : 0 }}
              transition={CARD_TRANSITION}
            >
              {/* No `initial={false}` here — it would suppress the card-home subtree's
                  entry animations on mount, killing the CTA/list stagger. */}
              <AnimatePresence mode="popLayout">
                {!isTap ? (
                  <motion.div
                    key="card-home"
                    className={styles.cardHomeBody}
                    // No block fade — the inner items (CTA/list) stagger themselves
                    // (CardHomeContent); just animate the exit when swapping to tap.
                    initial={false}
                    exit={reduceMotion ? { opacity: 0 } : { ...CONTENT_HIDDEN, transition: CONTENT_OUT }}
                  >
                    <CardHomeContent transactions={transactions} onTapToPay={startTapToPay} />
                  </motion.div>
                ) : (
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
          </motion.div>
        )}
      </AnimatePresence>

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
            // Issuance OPEN: stagger-reveal like the copy — a small lift + fade +
            // de-blur, a beat behind the slide. CLOSE: ride back down WITH the sheet
            // (exit carries its own glued transition). A direct card-home open just
            // fades in at the slot (no lift/blur).
            initial={{
              // View-card: start a full screen-height below so it RIDES UP in lockstep
              // with the sheet (same transition). Issuance: already mounted (morphs),
              // so this initial is unused there.
              y: cardView === 'home' ? (cardSheetSlideUp ? SCREEN_HEIGHT : 0) : CARD_REVEAL_LIFT,
              opacity: cardView === 'home' && cardSheetSlideUp ? 1 : 0,
              filter: cardView === 'home' ? 'blur(0px)' : 'blur(10px)',
            }}
            animate={{ y: isTap ? TAP_LIFT : 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{ y: CARD_EXIT_TO, opacity: 0, transition: CARD_TRANSITION }}
            // Card-home rides up with the sheet (CARD_TRANSITION == the sheet's slide);
            // issuance keeps the reveal.
            transition={cardView === 'home' ? CARD_TRANSITION : CARD_REVEAL}
          >
            <motion.div
              className={styles.cardMorph}
              initial={false}
              // Creating drops the card to the sheet's vertical center (copy/CTA are
              // gone); intro/ready hold the upper issuance slot; home morphs to top.
              animate={{
                y:
                  cardView === 'home'
                    ? 0
                    : cardView === 'creating'
                      ? CREATING_DY
                      : cardView === 'ready'
                        ? READY_DY
                        : ISSUE_DY,
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
                sparkleDelay={cardView === 'intro' ? SPARKLE_START_DELAY : 0}
              >
                <DebitCard
                  issued={issued}
                  shimmer={cardView === 'creating'}
                  shimmerLoop={cardView === 'ready' || cardView === 'home'}
                />
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
