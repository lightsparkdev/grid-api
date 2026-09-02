'use client';

import clsx from 'clsx';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useScreenOverlay } from '@/apps/shared/AppShell/ScreenOverlayContext';
import { AuroraBackground } from '@/apps/aurora/aurora-fx';
import { FaceIdAuth } from '@/apps/shared/FaceIdAuth';
import { useStaggerReveal } from '@/apps/shared/useStaggerReveal';
import { Toast } from '@/apps/shared/Toast';
import { GlassSymbolButton, headerGlassBrightness } from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import { TapToPayStatus } from '@/apps/shared/TapToPayStatus';
import { useBrand } from '@/apps/shared/brand/BrandContext';
import { useThemeMode } from '@/hooks/useThemeMode';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import type { SkinWalletScreenProps } from '@/apps/types';
import { CardHomeContent } from './CardHomeContent';
import { CreatingCaption, IntroContent, ReadyContent } from './CardIssuanceContent';
import {
  CardDetailsSheet,
  CloseCardSheet,
  LimitsSheet,
  TransactionSheet,
  WalletAddSheet,
} from './CardSheets';
import { DebitCard } from './DebitCard';
import styles from './AuroraWalletScreen.module.scss';

// Re-exported for back-compat: these types now live with the headless logic.
export type { WalletEntry, WalletEntryTarget, WalletTransferMode } from '@/apps/shared/wallet';

const HEADER_DURATION = 0.2;
/** Issuance card is the home card scaled to Figma 338 / 370. */
const CARD_ISSUANCE_SCALE = 338 / 370;
const TAP_LIFT = -56; // Lift the body by the header height so the card sits under the status bar.

const HEADER_TRANSITION = motionTransition(easeOutQuick, HEADER_DURATION);
const CARD_TRANSITION = motionTransition(easeOutSnappy, 0.5);
const AURORA_IN = motionTransition(easeOutQuick, 0.5, { delay: 0.15 });
const AURORA_OUT = motionTransition(easeOutQuick, 0.3);
const CONTENT_IN = motionTransition(easeOutQuick, 0.4, { delay: 0.2 });
const CONTENT_OUT = motionTransition(easeOutQuick, 0.2);
const CONTENT_HIDDEN = { opacity: 0, filter: 'blur(8px)' };
const CONTENT_VISIBLE = { opacity: 1, filter: 'blur(0px)' };
const HEADER_HIDDEN = { opacity: 0, filter: 'blur(8px)' };
const HEADER_VISIBLE = { opacity: 1, filter: 'blur(0px)' };

/**
 * Aurora card screen — the root of the app. There is no wallet home around it:
 * the phone boots to the issuance intro when no card exists and to the card hub
 * once one does. The wallet brain arrives as a prop (hosted above the skin so
 * its state survives skin switches).
 */
export function AuroraWalletScreen(props: SkinWalletScreenProps) {
  const { entrance = false, home, onCardIssued } = props;
  const reduceMotion = useReducedMotion();
  const theme = useThemeMode();
  const overlayEl = useScreenOverlay();
  const brand = useBrand();
  const appName = brand.customizable ? brand.design.programName.trim() || 'Your brand' : 'Aurora';

  const {
    cardView,
    setCardView,
    issued,
    tapPhase,
    transactions,
    toast,
    setToast,
    availableCents,
    isIssuance,
    showFullAurora,
    cardCentered,
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

  const showHeader = !showFullAurora && !isTap;

  return (
    <div className={styles.root}>
      {/* Full-screen aurora behind everything (incl. the header) during issuance. */}
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

      {/* App header: brand title + settings. Hidden over the issuance aurora
          and during tap-to-pay. */}
      <header className={clsx(styles.header, styles.headerHome)}>
        <AnimatePresence initial={false}>
          {showHeader && (
            <motion.div
              key="home-header"
              className={styles.headerInner}
              initial={reduceMotion ? false : HEADER_HIDDEN}
              animate={HEADER_VISIBLE}
              exit={HEADER_HIDDEN}
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
        className={clsx(styles.body, styles.bodyOpen, isTap && styles.bodyTap)}
        initial={false}
        animate={{ y: isTap ? TAP_LIFT : 0 }}
        transition={CARD_TRANSITION}
      >
        {/* The card is a single element that carries through every state — it
            layout-animates between the top slot and the centered issuance slot. */}
        <div
          className={clsx(
            styles.cardArea,
            cardCentered ? styles.cardAreaCentered : styles.cardAreaTop,
            cardView === 'creating' && styles.cardAreaCreating,
          )}
        >
          <motion.div
            layout={!reduceMotion && !isTap}
            className={styles.cardCarry}
            transition={CARD_TRANSITION}
          >
            <motion.div
              className={styles.cardScale}
              initial={false}
              animate={{ scale: isIssuance ? CARD_ISSUANCE_SCALE : 1 }}
              transition={CARD_TRANSITION}
            >
              <motion.div {...enter(0)}>
                <DebitCard
                  interactive={false}
                  bordered={showFullAurora}
                  showNumber={!showFullAurora}
                  issued={issued}
                  frozen={card.frozen}
                  closed={card.closed}
                  inWallet={card.inWallet}
                  declined={isDeclined}
                />
              </motion.div>
            </motion.div>
          </motion.div>
          {cardView === 'creating' && <CreatingCaption />}
        </div>

        {/* Issuance / card-hub content below the card. popLayout so an exiting
            block leaves the flex flow immediately. */}
        <AnimatePresence mode="popLayout" initial={false}>
          {cardView === 'intro' && (
            <motion.div
              key="intro"
              className={styles.bottomContent}
              initial={reduceMotion ? false : CONTENT_HIDDEN}
              animate={reduceMotion ? CONTENT_VISIBLE : { ...CONTENT_VISIBLE, transition: CONTENT_IN }}
              exit={reduceMotion ? { opacity: 0 } : { ...CONTENT_HIDDEN, transition: CONTENT_OUT }}
            >
              <IntroContent
                onCreate={() => {
                  // POST /cards fires when you tap Create; the reveal that
                  // follows is just provisioning.
                  setCardView('creating');
                  onCardIssued?.();
                }}
              />
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
          {cardView === 'home' && !isTap && (
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
