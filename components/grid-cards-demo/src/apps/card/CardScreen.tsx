'use client';

import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
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
import type { CardScreenProps } from '@/apps/types';
import { ApplePayAddCard, WalletAddedScreen } from './AddToWalletFlow';
import { CardHomeContent } from './CardHomeContent';
import { CardNumbersContent } from './CardNumbersContent';
import { CloseCardSheet, TransactionSheet, WalletAgainSheet } from './CardSheets';
import { LimitsContent } from './LimitsContent';
import styles from './CardScreen.module.scss';

const HEADER_DURATION = 0.2;
const TAP_LIFT = -56; // Lift the body by the header height so the card sits under the status bar.

const HEADER_TRANSITION = motionTransition(easeOutQuick, HEADER_DURATION);
const BODY_TRANSITION = motionTransition(easeOutSnappy, 0.5);
const CONTENT_IN = motionTransition(easeOutQuick, 0.4, { delay: 0.2 });
const CONTENT_OUT = motionTransition(easeOutQuick, 0.2);
const CONTENT_HIDDEN = { opacity: 0, filter: 'blur(8px)' };
const CONTENT_VISIBLE = { opacity: 1, filter: 'blur(0px)' };
/** iOS push: the new page slides in from the right; the one under it slides
 *  a third of the way out and dims. Pop runs it backwards. */
const PUSH = motionTransition(easeOutSnappy, 0.45);
const PAGE_RIGHT = { x: '100%', opacity: 1 };
const PAGE_LEFT = { x: '-30%', opacity: 0.4 };
const PAGE_REST = { x: 0, opacity: 1 };
/** The pushed pages' header titles. */
const PAGE_TITLE = { numbers: 'Card Numbers', limits: 'Spending Limits' } as const;

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
    tapPhase,
    transactions,
    toast,
    setToast,
    isTap,
    card,
    revealPending,
    finishRevealAuth,
    finishTapAuth,
    notice,
    startReveal,
    toggleFreeze,
    startAddToWallet,
    startTapToPay,
  } = home;
  const onPage = card.page !== 'home';
  // Card Numbers pushes over the content below the card (the card stays,
  // turned over); Spending Limits pushes over the whole body, card included
  // (the stage clips the card to its leading edge), and the home stays put
  // underneath.
  const onNumbers = card.page === 'numbers';
  // The home comes back from under the Card Numbers page (a pop, sliding in
  // from the left) or after tap-to-pay (the blur-in), depending on where it was.
  const prevPage = useRef(card.page);
  const fromNumbers = prevPage.current === 'numbers' && !onNumbers;
  useEffect(() => {
    prevPage.current = card.page;
  }, [card.page]);

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
        icon={appIcon}
        title={notice?.title ?? ''}
        body={notice?.body ?? ''}
        bodyLines={2}
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
      {/* Header. Home: back (the app's, a no-op here), card numbers, and the
          limits + lock pill. A pushed page: back, and its title. Hidden
          during tap-to-pay. */}
      <header className={styles.header}>
        <AnimatePresence initial={false} mode="popLayout">
          {!isTap && (
            <motion.div
              key={card.page}
              className={styles.headerInner}
              initial={reduceMotion ? false : CONTENT_HIDDEN}
              animate={CONTENT_VISIBLE}
              exit={CONTENT_HIDDEN}
              transition={HEADER_TRANSITION}
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
              {card.page !== 'home' ? (
                <h1 className={styles.title}>{PAGE_TITLE[card.page]}</h1>
              ) : (
                <div className={styles.headerActions}>
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
                        name: card.frozen ? 'lock.fill' : 'lock.open.fill',
                        size: 20,
                        label: card.frozen ? 'Unfreeze card' : 'Freeze card',
                        onClick: toggleFreeze,
                        disabled: card.closed,
                      },
                    ]}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* The whole body lifts as one transform during tap-to-pay (card + content
          together) so nothing desyncs. */}
      <motion.div
        className={clsx(styles.body, isTap && styles.bodyTap)}
        initial={false}
        animate={{ y: isTap ? TAP_LIFT : 0 }}
        transition={BODY_TRANSITION}
      >
        <div className={styles.cardArea}>
          {/* An empty slot: THE card (the one on the stage, never a copy) flies
              in and parks exactly here. CardStage measures this box and fits
              the card to it, so an upright card gets a tall slot. */}
          <div
            data-card-slot
            className={clsx(styles.cardSlot, design.orientation === 'portrait' && styles.cardSlotPortrait)}
          />
        </div>

        {/* Below the card: the home (actions, transactions), Card Numbers
            pushed over it, or the tap-to-pay reader status. popLayout so an
            exiting block leaves the flex flow immediately. */}
        <AnimatePresence mode="popLayout" initial={false}>
          {!isTap && !onNumbers && (
            <motion.div
              key="home"
              className={styles.homeContent}
              initial={reduceMotion ? false : fromNumbers ? PAGE_LEFT : CONTENT_HIDDEN}
              animate={
                reduceMotion
                  ? PAGE_REST
                  : { ...PAGE_REST, filter: 'blur(0px)', transition: fromNumbers ? PUSH : CONTENT_IN }
              }
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : onNumbers
                    ? { ...PAGE_LEFT, transition: PUSH }
                    : { ...CONTENT_HIDDEN, transition: CONTENT_OUT }
              }
            >
              <div className={styles.homeScroll}>
                <CardHomeContent
                  transactions={transactions}
                  card={card}
                  onTapToPay={startTapToPay}
                  onAddToWallet={startAddToWallet}
                />
              </div>
            </motion.div>
          )}
          {!isTap && onNumbers && (
            <motion.div
              key="numbers"
              className={styles.homeContent}
              initial={reduceMotion ? false : PAGE_RIGHT}
              animate={reduceMotion ? PAGE_REST : { ...PAGE_REST, transition: PUSH }}
              exit={reduceMotion ? { opacity: 0 } : { ...PAGE_RIGHT, transition: PUSH }}
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
              <TapToPayStatus
                phase={tapPhase === 'idle' ? 'hold' : tapPhase}
                declineReason={card.lastDecline}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spending Limits: a page over the whole body, the card included. It
            carries data-covers-card="left" so the stage clips the card to its
            leading edge as it slides. */}
        <AnimatePresence initial={false}>
          {!isTap && card.page === 'limits' && (
            <motion.div
              key="limits"
              className={styles.pageCover}
              data-covers-card="left"
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

      {/* Bottom sheets — transaction, close, already in Apple Wallet. */}
      <TransactionSheet card={card} />
      <CloseCardSheet card={card} />
      <WalletAgainSheet card={card} />

      {/* Full-screen: the app's "added" screen under Apple's add-card flow. */}
      <WalletAddedScreen card={card} />
      <ApplePayAddCard card={card} />

      {screenOverlay}
    </div>
  );
}
