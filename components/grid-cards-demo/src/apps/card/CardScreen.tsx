'use client';

import clsx from 'clsx';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
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
import type { CardScreenProps } from '@/apps/types';
import { ApplePayAddCard } from './AddToWalletFlow';
import { CardHomeContent } from './CardHomeContent';
import { CardNumbersContent } from './CardNumbersContent';
import { CloseCardSheet, FreezeSheet, TransactionSheet, WalletAgainSheet } from './CardSheets';
import { LimitsContent } from './LimitsContent';
import styles from './CardScreen.module.scss';

const HEADER_DURATION = 0.2;
const TAP_LIFT = -56; // Lift the body by the header height so the card sits under the status bar.
/** Aurora's issuance slot shows the card a touch smaller than the home's. */
const CARD_ISSUANCE_SCALE = 338 / 370;

const HEADER_TRANSITION = motionTransition(easeOutQuick, HEADER_DURATION);
const BODY_TRANSITION = motionTransition(easeOutSnappy, 0.5);
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
  // Card numbers is not a push: the header swaps as it always does, the
  // content under the card blur-fades out, and the numbers blur-fade in with
  // a short rise, while the card stays and turns over. Spending limits is a
  // push over the whole body, card included (the stage clips the card to its
  // leading edge), with the home staying put underneath.
  const onNumbers = card.page === 'numbers';
  // POST /cards is PROCESSING: Aurora's creating screen. No header, the card
  // alone near the center of the screen, "Creating your card…" under it; the
  // home comes in when the card goes ACTIVE.
  const creating = issuing;

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
          {!isTap && !creating && (
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
                        // The lock shows what the tap does: lock a live card, unlock a frozen one.
                        name: card.frozen ? 'lock.open.fill' : 'lock.fill',
                        size: 20,
                        label: card.frozen ? 'Unfreeze card' : 'Freeze card',
                        onClick: () => card.setSheet('freeze'),
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
        {/* The card and everything under it. Spending limits pushes it: it
            slides a third of the way out to the left as the page comes in from
            the right, iOS's push. The stage follows the slot's live rect, so
            the card rides along; the page's leading edge then covers it. */}
        <motion.div
          className={styles.stack}
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
                className={styles.homeContent}
                initial={reduceMotion ? false : CONTENT_HIDDEN}
                animate={reduceMotion ? CONTENT_VISIBLE : { ...CONTENT_VISIBLE, transition: CONTENT_IN }}
                exit={reduceMotion ? { opacity: 0 } : { ...CONTENT_HIDDEN, transition: CONTENT_OUT }}
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

        {/* Spending limits: a page over the whole body, the card included. It
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
