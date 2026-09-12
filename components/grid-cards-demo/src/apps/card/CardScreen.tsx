'use client';

import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { createPortal } from 'react-dom';
import { AnimatePresence, animate, motion, useReducedMotion } from 'motion/react';
import { IconLoadingCircle } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLoadingCircle';
import { useScreenOverlay } from '@/apps/shared/AppShell/ScreenOverlayContext';
import { FaceIdAuth } from '@/apps/shared/FaceIdAuth';
import { GlassNotification } from '@/apps/shared/GlassNotification';
import { Toast } from '@/apps/shared/Toast';
import { GlassSymbolButton, GlassWindowButtonGroup, headerGlassBrightness } from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import { TapToPayStatus } from '@/apps/shared/TapToPayStatus';
import { useBrand } from '@/apps/shared/brand/BrandContext';
import { brandColorOf } from '@/data/design';
import { useThemeMode } from '@/hooks/useThemeMode';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import { canScrollBy } from '@/lib/scroll';
import type { CardScreenProps } from '@/apps/types';
import { ApplePayAddCard } from './AddToWalletFlow';
import { CardHomeContent } from './CardHomeContent';
import { CardNumbersContent } from './CardNumbersContent';
import { CloseCardSheet, FreezeSheet, TransactionSheet, WalletAgainSheet } from './CardSheets';
import { LimitsContent } from './LimitsContent';
import styles from './CardScreen.module.scss';

const TAP_LIFT = -56; // Lift the body by the header height so the card sits under the status bar.
/** Aurora's issuance slot shows the card a touch smaller than the home's. */
const CARD_ISSUANCE_SCALE = 338 / 370;

const BODY_TRANSITION = motionTransition(easeOutSnappy, 0.5);
/** The page scroll's return to the top ahead of tap-to-pay or a page. */
const SCROLL_HOME = motionTransition(easeOutSnappy, 0.4);
/** The scroll edge strip is fully in after this much scroll. */
const EDGE_FADE_IN_PX = 40;
const CONTENT_IN = motionTransition(easeOutQuick, 0.4, { delay: 0.2 });
const CONTENT_OUT = motionTransition(easeOutQuick, 0.2);
const CONTENT_HIDDEN = { opacity: 0, filter: 'blur(8px)' };
const CONTENT_VISIBLE = { opacity: 1, filter: 'blur(0px)' };
/** Card numbers arrives with a short rise under the turning card. */
const NUMBERS_HIDDEN = { opacity: 0, filter: 'blur(8px)', y: 16 };
const NUMBERS_VISIBLE = { opacity: 1, filter: 'blur(0px)', y: 0 };
/** iOS push (Spending limits): the new page slides in from the right; the
 *  body under it slides a third of the way out. Pop runs it backwards. */
const PUSH = motionTransition(easeOutSnappy, 0.45);
const PAGE_RIGHT = { x: '100%', opacity: 1 };
const PAGE_REST = { x: 0, opacity: 1 };
/** The pushed pages' header titles. */
const PAGE_TITLE = { numbers: 'Card numbers', limits: 'Spending limits' } as const;
/** The navigation bar's title on a push (+1) or a pop (−1): in from the
 *  side the page comes from, out toward the side it goes. */
const TITLE_TRAVEL = 64;
const TITLE_VARIANTS = {
  enter: (dir: number) => ({ x: dir * TITLE_TRAVEL, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: -dir * TITLE_TRAVEL, opacity: 0 }),
};

/**
 * The card hub — the whole app. Header (back, card numbers, limits and lock),
 * the card, its actions, and transactions; the Card Numbers page pushes over
 * the content below the card; tap-to-pay lifts the card under the status bar;
 * Apple's add-card flow covers the screen. The brain arrives as a prop.
 */
export function CardScreen({ home }: CardScreenProps) {
  const reduceMotion = useReducedMotion();
  const theme = useThemeMode();
  const overlayEl = useScreenOverlay();
  const design = useBrand();
  const brightness = headerGlassBrightness(theme);

  const {
    issuing,
    tapPhase,
    activity,
    toast,
    setToast,
    isTap,
    card,
    revealPending,
    finishRevealAuth,
    finishTapAuth,
    notice,
    dismissNotice,
    startReveal,
    toggleFreeze,
    startAddToWallet,
    startTapToPay,
  } = home;
  const onPage = card.page !== 'home';
  // Card numbers is not a push: the header swaps as it always does, the
  // content under the card blur-fades out, and the numbers blur-fade in with
  // a short rise, while the card stays and turns over. Spending limits is a
  // push over the whole body, card included (the page paints over the card,
  // as all the screen's content does), with the home staying put underneath.
  const onNumbers = card.page === 'numbers';
  // The navigation bar's direction: a page coming in is a push, home is a pop.
  const pushDir = onPage ? 1 : -1;
  // POST /cards is PROCESSING: Aurora's creating screen. No header, the card
  // alone near the center of the screen, "Creating your card…" under it; the
  // home comes in when the card goes ACTIVE.
  const creating = issuing;

  // Aurora's home scroll: once the card is issued the stack (the card and the
  // content under it) page-scrolls, the card riding up under the header with
  // the rest. Tap-to-pay and the pages hold the scroll where
  // it is; leaving the home for them (not the limits push, which keeps its
  // place under the page) brings it back to the top first.
  const stackRef = useRef<HTMLDivElement>(null);
  const canScroll = !creating && !isTap && card.page === 'home';
  const canScrollRef = useRef(canScroll);
  canScrollRef.current = canScroll;

  // The card is drawn by the stage from the slot's rect each frame, on the
  // main thread. Native wheel scrolling happens on the compositor thread ahead
  // of any script, so the content would move a frame before the card did and
  // the card would trail it. The wheel is taken here instead and the scroll
  // applied synchronously: the content and the card then move in the same
  // frame. (The stage forwards the wheel over the card the same way.)
  // The scroll edge strip comes in with the first few px of scroll (nothing
  // is under the header until then) and holds; the stage reads the same
  // factor off the strip for the card.
  const fadeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = stackRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!canScrollRef.current || e.ctrlKey) return;
      const unit =
        e.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : e.deltaMode === WheelEvent.DOM_DELTA_PAGE ? el.clientHeight : 1;
      const dy = e.deltaY * unit;
      // At the end of the home in the wheel's direction, the wheel is not
      // ours: it goes on to scroll the page around the phone, as it would
      // over anything else on it.
      if (!canScrollBy(el, dy)) return;
      e.preventDefault();
      el.scrollTop += dy;
    };
    const onScroll = () => {
      fadeRef.current?.style.setProperty('--edge-fade', Math.min(1, el.scrollTop / EDGE_FADE_IN_PX).toFixed(3));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Back to the top before tap-to-pay or a page: driven from here, frame by
  // frame, for the same reason (a native smooth scroll runs off the main
  // thread and the card would lag it).
  useEffect(() => {
    const el = stackRef.current;
    if (!el || canScroll || card.page === 'limits' || el.scrollTop === 0) return;
    if (reduceMotion) {
      el.scrollTop = 0;
      return;
    }
    const controls = animate(el.scrollTop, 0, { ...SCROLL_HOME, onUpdate: (v) => (el.scrollTop = v) });
    return () => controls.stop();
  }, [canScroll, card.page, reduceMotion]);

  // App icon for push notifications — a brand-tinted rounded square.
  const brandColor = brandColorOf(design);
  const appIcon = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76 76"><rect width="76" height="76" rx="17" fill="${brandColor}"/><rect x="18" y="26" width="40" height="26" rx="5" fill="rgba(255,255,255,0.92)"/><rect x="18" y="33" width="40" height="5" fill="${brandColor}" opacity="0.55"/></svg>`,
  )}`;

  // Face ID, the toast, and the notification render in AppShell's overlay
  // layer above the stage, so they paint over the card in the slot. Face ID
  // gates tap-to-pay and the reveal.
  const overlayContent = (
    <>
      <FaceIdAuth
        active={tapPhase === 'auth' || revealPending}
        onDone={() => {
          if (revealPending) finishRevealAuth();
          else finishTapAuth();
        }}
      />
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      <GlassNotification
        show={notice !== null}
        id={notice?.id}
        icon={appIcon}
        title={notice?.title ?? ''}
        body={notice?.body ?? ''}
        bodyLines={2}
        onDismiss={dismissNotice}
      />
    </>
  );
  const screenOverlay = overlayEl ? (
    createPortal(overlayContent, overlayEl)
  ) : (
    <div className={styles.faceIdLayer}>{overlayContent}</div>
  );

  return (
    <div className={styles.root}>
      {/* Scroll edge: content riding up under the status bar and header is
          progressively blurred and faded into the surface. Before the header
          in the DOM so the header's buttons paint over it. The stage reads
          this strip (data-card-fade) to fade the card, which is out of the
          blur's reach in its own layer, over the same band. */}
      {!creating && (
        <div ref={fadeRef} className={styles.topFade} data-card-fade aria-hidden>
          <div className={clsx(styles.fadeBlur, styles.fadeBlurStrong)} />
          <div className={clsx(styles.fadeBlur, styles.fadeBlurMid)} />
          <div className={clsx(styles.fadeBlur, styles.fadeBlurSoft)} />
          <div className={styles.fadeTint} />
        </div>
      )}

      {/* Header. Home: back (the app's, a no-op here), card numbers, and the
          limits + lock pill. A pushed page: back, and its title. The page
          change is iOS's navigation bar push: the title slides in from the
          right (out to the left; the reverse on pop) while the right-side
          items crossfade; the back button stays. The whole bar blur-fades
          away for tap-to-pay and the creating screen. */}
      <header className={styles.header}>
        <AnimatePresence initial={false} mode="popLayout">
          {!isTap && !creating && (
            <motion.div
              key="header"
              className={styles.headerInner}
              initial={reduceMotion ? false : CONTENT_HIDDEN}
              animate={reduceMotion ? CONTENT_VISIBLE : { ...CONTENT_VISIBLE, transition: CONTENT_IN }}
              exit={reduceMotion ? { opacity: 0 } : { ...CONTENT_HIDDEN, transition: CONTENT_OUT }}
            >
              <GlassSymbolButton
                aria-label="Back"
                size={40}
                type="button"
                glass={{ brightness }}
                onClick={onPage ? card.popPage : undefined}
              >
                <SfSymbol name="chevron.left" size={17} />
              </GlassSymbolButton>
              <AnimatePresence initial={false} custom={pushDir}>
                {card.page !== 'home' && (
                  <motion.h1
                    key={card.page}
                    className={styles.title}
                    custom={pushDir}
                    variants={reduceMotion ? undefined : TITLE_VARIANTS}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={PUSH}
                  >
                    {PAGE_TITLE[card.page]}
                  </motion.h1>
                )}
              </AnimatePresence>
              <AnimatePresence initial={false}>
                {!onPage && (
                  <motion.div
                    key="actions"
                    className={styles.headerActions}
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={PUSH}
                  >
                    <GlassSymbolButton
                      aria-label="Card numbers"
                      size={40}
                      type="button"
                      glass={{ brightness }}
                      onClick={startReveal}
                      disabled={card.closed}
                    >
                      <SfSymbol name="creditcard.and.numbers" size={24} />
                    </GlassSymbolButton>
                    <GlassWindowButtonGroup
                      glass={{ brightness }}
                      symbols={[
                        {
                          name: 'gauge.with.dots.needle.bottom.50percent',
                          size: 22,
                          label: 'Spending limits',
                          onClick: card.openLimits,
                          disabled: card.closed,
                        },
                        {
                          // The lock shows what the tap does: lock a live card, unlock a locked one.
                          name: card.frozen ? 'lock.open.fill' : 'lock.fill',
                          size: 20,
                          label: card.frozen ? 'Unlock card' : 'Lock card',
                          onClick: () => card.setSheet('freeze'),
                          disabled: card.closed,
                        },
                      ]}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* The whole body lifts as one transform during tap-to-pay (card + content
          together) so nothing desyncs. */}
      <motion.div
        className={clsx(styles.body, !creating && styles.bodyHome, isTap && styles.bodyTap)}
        initial={false}
        animate={{ y: isTap ? TAP_LIFT : 0 }}
        transition={BODY_TRANSITION}
      >
        {/* The card and everything under it: the page scroll once issued (the
            stage forwards the wheel over the card to it, see data-card-scroller).
            Spending limits pushes it: it slides a third of the way out to the
            left as the page comes in from the right, iOS's push. The stage
            follows the slot's live rect, so the card rides along; the page's
            leading edge then covers it. */}
        <motion.div
          ref={stackRef}
          data-card-scroller
          className={clsx(styles.stack, !creating && styles.stackScroll, !canScroll && styles.stackLocked)}
          initial={false}
          animate={{ x: card.page === 'limits' ? '-30%' : '0%' }}
          transition={reduceMotion ? { duration: 0 } : PUSH}
        >
          <div className={clsx(styles.cardArea, creating && styles.cardAreaCreating)}>
            {/* An empty slot: THE card (the one on the stage, never a copy) flies
                in and parks exactly here. CardStage measures this box and fits
                the card to it, so an upright card gets a tall slot. While the
                card is being created the slot carries to the center (Aurora's
                issuance slot, a touch smaller) and back; the stage follows. */}
            <motion.div
              layout={!reduceMotion && !isTap}
              className={styles.cardCarry}
              initial={false}
              animate={{ scale: creating ? CARD_ISSUANCE_SCALE : 1 }}
              transition={BODY_TRANSITION}
            >
              <div
                data-card-slot
                className={clsx(styles.cardSlot, design.orientation === 'portrait' && styles.cardSlotPortrait)}
              />
            </motion.div>
            <AnimatePresence>
              {creating && (
                <motion.div
                  key="creating"
                  className={styles.creating}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: motionTransition(easeOutQuick, 0.3, { delay: 0.2 }) }}
                  exit={{ opacity: 0, transition: CONTENT_OUT }}
                >
                  <span className={styles.spinner} aria-hidden>
                    <IconLoadingCircle size={16} />
                  </span>
                  <span className={styles.creatingText}>Creating your card…</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Below the card: the home (actions, transactions), Card numbers in
            its place, or the tap-to-pay reader status. Each blur-fades out
            and the next blur-fades in. popLayout so an exiting block leaves
            the flex flow immediately. */}
          <AnimatePresence mode="popLayout" initial={false}>
            {!isTap && !onNumbers && !creating && (
              <motion.div
                key="home"
                className={clsx(styles.homeContent, styles.homeFlow)}
                initial={reduceMotion ? false : CONTENT_HIDDEN}
                animate={reduceMotion ? CONTENT_VISIBLE : { ...CONTENT_VISIBLE, transition: CONTENT_IN }}
                exit={reduceMotion ? { opacity: 0 } : { ...CONTENT_HIDDEN, transition: CONTENT_OUT }}
              >
                <CardHomeContent
                  activity={activity}
                  card={card}
                  onTapToPay={startTapToPay}
                  onAddToWallet={startAddToWallet}
                />
              </motion.div>
            )}
            {!isTap && onNumbers && (
              <motion.div
                key="numbers"
                className={styles.homeContent}
                initial={reduceMotion ? false : NUMBERS_HIDDEN}
                animate={reduceMotion ? CONTENT_VISIBLE : { ...NUMBERS_VISIBLE, transition: CONTENT_IN }}
                exit={reduceMotion ? { opacity: 0 } : { ...NUMBERS_HIDDEN, transition: CONTENT_OUT }}
              >
                <div className={styles.homeScroll}>
                  <CardNumbersContent card={card} />
                </div>
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
                <TapToPayStatus phase={tapPhase === 'idle' ? 'hold' : tapPhase} declineReason={card.lastDecline} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Spending limits: a page over the whole body, the card included; it
            covers the card as it slides in. */}
        <AnimatePresence initial={false}>
          {!isTap && card.page === 'limits' && (
            <motion.div
              key="limits"
              className={styles.pageCover}
              initial={reduceMotion ? { opacity: 0 } : PAGE_RIGHT}
              animate={reduceMotion ? { opacity: 1 } : { ...PAGE_REST, transition: PUSH }}
              exit={reduceMotion ? { opacity: 0 } : { ...PAGE_RIGHT, transition: PUSH }}
            >
              <div className={styles.homeScroll}>
                <LimitsContent card={card} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bottom sheets — freeze, transaction, close, already in Apple Wallet. */}
      <FreezeSheet card={card} onConfirm={toggleFreeze} />
      <TransactionSheet card={card} />
      <CloseCardSheet card={card} />
      <WalletAgainSheet card={card} />

      {/* Full-screen: Apple's add-card flow. */}
      <ApplePayAddCard card={card} />

      {screenOverlay}
    </div>
  );
}
