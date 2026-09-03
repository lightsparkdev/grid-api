'use client';

import clsx from 'clsx';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useScreenOverlay } from '@/apps/shared/AppShell/ScreenOverlayContext';
import { FaceIdAuth } from '@/apps/shared/FaceIdAuth';
import { GlassNotification } from '@/apps/shared/GlassNotification';
import { Toast } from '@/apps/shared/Toast';
import { GlassSymbolButton, headerGlassBrightness } from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import { TapToPayStatus } from '@/apps/shared/TapToPayStatus';
import { programNameOf, useBrand } from '@/apps/shared/brand/BrandContext';
import { useThemeMode } from '@/hooks/useThemeMode';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import type { CardScreenProps } from '@/apps/types';
import { CardHomeContent } from './CardHomeContent';
import {
  CardDetailsSheet,
  CloseCardSheet,
  LimitsSheet,
  TransactionSheet,
  WalletAddSheet,
} from './CardSheets';
import styles from './CardScreen.module.scss';

const HEADER_DURATION = 0.2;
const TAP_LIFT = -56; // Lift the body by the header height so the card sits under the status bar.

const HEADER_TRANSITION = motionTransition(easeOutQuick, HEADER_DURATION);
const BODY_TRANSITION = motionTransition(easeOutSnappy, 0.5);
const CONTENT_IN = motionTransition(easeOutQuick, 0.4, { delay: 0.2 });
const CONTENT_OUT = motionTransition(easeOutQuick, 0.2);
const CONTENT_HIDDEN = { opacity: 0, filter: 'blur(8px)' };
const CONTENT_VISIBLE = { opacity: 1, filter: 'blur(0px)' };

/**
 * The card hub — the whole app. Header (program name + settings), the card,
 * the funding line, actions, controls, and transactions; tap-to-pay lifts the
 * card under the status bar. The brain arrives as a prop (hosted above).
 */
export function CardScreen({ home, cardOnPhone = false }: CardScreenProps) {
  const reduceMotion = useReducedMotion();
  const theme = useThemeMode();
  const overlayEl = useScreenOverlay();
  const design = useBrand();
  const appName = programNameOf(design);

  const {
    issued,
    tapPhase,
    transactions,
    toast,
    setToast,
    availableCents,
    isTap,
    card,
    revealPending,
    finishRevealAuth,
    finishTapAuth,
    notice,
  } = home;

  // App icon for push notifications — a brand-tinted rounded square.
  const appIcon = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76 76"><rect width="76" height="76" rx="17" fill="${design.color}"/><rect x="18" y="26" width="40" height="26" rx="5" fill="rgba(255,255,255,0.92)"/><rect x="18" y="33" width="40" height="5" fill="${design.color}" opacity="0.55"/></svg>`,
  )}`;

  // Face ID + the glass toast render in AppShell's overlay layer (above the
  // status bar) so the blur frosts the status bar. Face ID gates tap-to-pay
  // and the details reveal.
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
      {/* App header: program name + settings. Hidden during tap-to-pay. */}
      <header className={styles.header}>
        <AnimatePresence initial={false}>
          {!isTap && (
            <motion.div
              key="header"
              className={styles.headerInner}
              initial={reduceMotion ? false : CONTENT_HIDDEN}
              animate={CONTENT_VISIBLE}
              exit={CONTENT_HIDDEN}
              transition={HEADER_TRANSITION}
            >
              <h1 className={styles.title}>{appName}</h1>
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

      {/* The whole body lifts as one transform during tap-to-pay (card + content
          together) so nothing desyncs. */}
      <motion.div
        className={clsx(styles.body, isTap && styles.bodyTap)}
        initial={false}
        animate={{ y: isTap ? TAP_LIFT : 0 }}
        transition={BODY_TRANSITION}
      >
        {cardOnPhone ? (
          <div className={styles.cardArea}>
            {/* An empty slot: THE card (the one on the stage, never a copy) flies
                in and parks exactly here. CardStage measures this box. */}
            <div data-card-slot className={styles.cardSlot} />
          </div>
        ) : (
          /* The card itself is on the stage; the phone just names it. */
          <div className={styles.cardSummary}>
            <span className={styles.cardSummaryTitle}>{appName} debit</span>
            <span className={styles.cardSummarySub}>
              {issued ? '•••• 8972' : 'Not issued'}
              {card.closed ? ' · Closed' : card.frozen ? ' · Frozen' : card.inWallet ? ' · In Apple Wallet' : ''}
            </span>
          </div>
        )}

        {/* Hub content below the card, or the tap-to-pay reader status. popLayout
            so an exiting block leaves the flex flow immediately. */}
        <AnimatePresence mode="popLayout" initial={false}>
          {!isTap && (
            <motion.div
              key="home"
              className={styles.homeContent}
              initial={reduceMotion ? false : CONTENT_HIDDEN}
              animate={reduceMotion ? CONTENT_VISIBLE : { ...CONTENT_VISIBLE, transition: CONTENT_IN }}
              exit={reduceMotion ? { opacity: 0 } : { ...CONTENT_HIDDEN, transition: CONTENT_OUT }}
            >
              <div className={styles.homeScroll}>
                <CardHomeContent transactions={transactions} card={card} availableCents={availableCents} />
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
      </motion.div>

      {/* Card hub sheets — details, Apple Wallet, limits, transaction, close. */}
      <CardDetailsSheet card={card} />
      <WalletAddSheet card={card} />
      <LimitsSheet card={card} />
      <TransactionSheet card={card} />
      <CloseCardSheet card={card} />

      {screenOverlay}
    </div>
  );
}
