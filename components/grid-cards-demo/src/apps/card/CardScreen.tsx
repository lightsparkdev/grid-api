'use client';

import clsx from 'clsx';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useScreenOverlay } from '@/apps/shared/AppShell/ScreenOverlayContext';
import { FaceIdAuth } from '@/apps/shared/FaceIdAuth';
import { useStaggerReveal } from '@/apps/shared/useStaggerReveal';
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
import { DebitCard } from './DebitCard';
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
export function CardScreen({ entrance = false, home }: CardScreenProps) {
  const reduceMotion = useReducedMotion();
  const theme = useThemeMode();
  const overlayEl = useScreenOverlay();
  const appName = programNameOf(useBrand());

  const {
    issued,
    issuing,
    tapPhase,
    transactions,
    toast,
    setToast,
    availableCents,
    isTap,
    isDeclined,
    card,
    revealPending,
    startReveal,
    finishRevealAuth,
    finishTapAuth,
    startTapToPay,
  } = home;

  // Entrance: the card, then the hub content reveal in once on mount.
  const reveal = useStaggerReveal({ baseDelay: 0.05, stagger: 0.07 });
  const enter = (index: number) => (entrance ? reveal(index) : { initial: false as const });

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
        <div className={styles.cardArea}>
          <motion.div {...enter(0)}>
            <DebitCard
              issued={issued}
              issuing={issuing}
              frozen={card.frozen}
              closed={card.closed}
              inWallet={card.inWallet}
              declined={isDeclined}
            />
          </motion.div>
        </div>

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
              <motion.div {...enter(1)} className={styles.homeScroll}>
                <CardHomeContent
                  transactions={transactions}
                  card={card}
                  availableCents={availableCents}
                  onTapToPay={startTapToPay}
                  onReveal={startReveal}
                />
              </motion.div>
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
