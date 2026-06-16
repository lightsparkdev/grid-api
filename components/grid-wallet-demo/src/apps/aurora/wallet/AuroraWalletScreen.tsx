'use client';

import clsx from 'clsx';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useScreenOverlay } from '@/apps/shared/AppShell/ScreenOverlayContext';
import { AuroraBackground } from '@/apps/shared/AuroraBackground';
import { FaceIdAuth } from '@/apps/shared/FaceIdAuth';
import { useStaggerReveal } from '@/apps/shared/useStaggerReveal';
import { GlassToast } from '@/apps/shared/GlassToast';
import { GlassSymbolButton, headerGlassBrightness } from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import { useThemeMode } from '@/hooks/useThemeMode';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import type { ExternalAccountInput, ReceivePaymentInfo, TransferDest } from '@/data/apiCalls';
import { useWalletHome } from '@/apps/shared/wallet';
import type { WalletEntry, WalletTransferMode } from '@/apps/shared/wallet';
import {
  AddMoneySheet,
  CardHomeContent,
  CreatingCaption,
  DebitCard,
  IntroContent,
  ReadyContent,
  SendReceiveSheet,
  TapToPayStatus,
  WalletCardDetailHeader,
  WalletListSection,
  formatUsdCents,
} from '@/apps/shared/wallet-flows';
import { BalanceHero } from './BalanceHero';
import { WalletActions } from './WalletActions';
import { WalletInsightCards } from './WalletInsightCards';
import { WalletSheet } from './WalletSheet';
import styles from './AuroraWalletScreen.module.scss';

// Re-exported for back-compat: these types now live with the headless logic.
export type { WalletEntry, WalletEntryTarget, WalletTransferMode } from '@/apps/shared/wallet';

const SHEET_DURATION = 0.4;
const HEADER_DURATION = 0.2;
/** Issuance card is the home card scaled to Figma 338 / 370. */
const CARD_ISSUANCE_SCALE = 338 / 370;
const SHEET_OFFSCREEN = 'calc(100% + 224px)';
const TAP_LIFT = -56; // Lift the body by the header height so the card sits under the status bar.

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

interface AuroraWalletScreenProps {
  /** Formatted balance from demo state, e.g. "$0.00". */
  balance?: string;
  /** One-shot mount stagger (card, balance, actions, insights) — the sign-in
   *  intro reveal. Off = everything renders at rest, exactly as before. */
  entrance?: boolean;
  /** Jump command from the sidebar — provision + open a flow out of order. */
  entry?: WalletEntry;
  /** Amount committed in a transfer sheet — log the create-quote call. `dest`
   *  lets a send reference the recipient's bank/crypto wallet. */
  onQuoteCreate?: (mode: WalletTransferMode, cents: number, dest?: TransferDest) => void;
  /** A bank/crypto recipient was added — log POST /customers/external-accounts. */
  onLinkExternalAccount?: (input: ExternalAccountInput, label: string) => void;
  /** Transfer confirmed (Face ID) — log execute + settle and move the balance. */
  onTransferExecute?: (mode: WalletTransferMode, cents: number) => void;
  /** A virtual card finished issuing on the phone. */
  onCardIssued?: () => void;
  /** A tap-to-pay charge landed on the phone. */
  onTapToPay?: (cents: number, merchant: string) => void;
  /** A payment was received (Receive flow) — log the inbound webhook + settle. */
  onReceivePayment?: (info: ReceivePaymentInfo) => void;
}

/** Aurora wallet home + debit card issuance flow (Figma Bitcoin 2026). The
 *  view layer — all state/effects/handlers live in the shared `useWalletHome`. */
export function AuroraWalletScreen(props: AuroraWalletScreenProps) {
  const { entrance = false, onQuoteCreate, onLinkExternalAccount, onCardIssued } = props;
  const reduceMotion = useReducedMotion();
  const theme = useThemeMode();
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
    earningsTodayCents,
    weeklyBars,
    weeklySpentCents,
    homeActivity,
    apyPercent,
    isOpen,
    isIssuance,
    showFullAurora,
    cardCentered,
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

  // Sign-in entrance: card → balance → actions → insights reveal in once on
  // mount (the issuance stagger language); the Activity card's own skeleton
  // reveal carries the list. `entrance` off spreads a no-op (rest pose).
  const reveal = useStaggerReveal({ baseDelay: 0.05, stagger: 0.07 });
  const enter = (index: number) => (entrance ? reveal(index) : { initial: false as const });

  // Face ID + the glass toast render in AppShell's overlay layer (above the
  // status bar) so the blur frosts the status bar and the toast can slide in
  // over everything; falls back to an in-screen layer when rendered outside an
  // AppShell. Face ID is shared by tap-to-pay and the money sheet.
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

      <header className={clsx(styles.header, !isOpen && styles.headerHome)}>
        <AnimatePresence initial={false}>
          {!isOpen ? (
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
          ) : isTap ? null : (
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
          )}
        </AnimatePresence>
      </header>

      {/* Scroll-edge: content that runs under the status bar is progressively
          blurred + faded into the bg so it never clashes with the status-bar
          glyphs (and the fixed gear/title/card are covered cleanly). Three
          stacked blur layers ramp the radius from 0 (bottom) to full (top) so
          there's no hard cutoff; a bg-color tint sits on top to resolve the very
          edge into the wallet bg. */}
      {!isOpen && !isTap && (
        <div className={styles.topFade} aria-hidden>
          <div className={clsx(styles.fadeBlur, styles.fadeBlurStrong)} />
          <div className={clsx(styles.fadeBlur, styles.fadeBlurMid)} />
          <div className={clsx(styles.fadeBlur, styles.fadeBlurSoft)} />
          <div className={styles.fadeTint} />
        </div>
      )}

      {/* The whole body lifts as one transform during tap-to-pay (card + content
          together) so nothing desyncs — collapsing the header instead reflowed
          everything up while only the card animated, which read as a jump. */}
      <motion.div
        className={clsx(
          styles.body,
          !isOpen && styles.bodyHome,
          isOpen && styles.bodyOpen,
          isTap && styles.bodyTap,
        )}
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
          {/* layout is OFF during tap-to-pay: the body is transform-lifted then, and
              a re-render mid-lift (e.g. Face ID mounting at the 'auth' flip) makes
              the layout measurement see the shifted position and "correct" it — a
              visible card jump. The card never changes slots during tap anyway. */}
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
              {/* Entrance wrapper — separate from the scale wrapper so the
                  reveal never fights the issuance scale animation. */}
              <motion.div {...enter(0)}>
                <DebitCard
                  interactive={!isOpen}
                  onOpen={openCard}
                  bordered={showFullAurora}
                  showNumber={!showFullAurora}
                  issued={issued}
                />
              </motion.div>
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
            <motion.div {...enter(1)}>
              <BalanceHero balance={formatUsdCents(availableCents)} />
            </motion.div>
            <motion.div {...enter(2)}>
              <WalletActions
                onAdd={() => openSheet('add')}
                onWithdraw={() => openSheet('withdraw')}
                onSend={() => setSendReceiveOpen(true)}
              />
            </motion.div>
            <motion.div {...enter(3)}>
              <WalletInsightCards
                weeklyBars={weeklyBars}
                weeklySpentCents={weeklySpentCents}
                earningsTodayCents={earningsTodayCents}
                apyPercent={apyPercent}
              />
            </motion.div>
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
              cta={{ label: 'Add money', onClick: () => openSheet('add') }}
              items={homeActivity}
              concentricBottom
              grow
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
              <CardHomeContent
                transactions={transactions}
                onTapToPay={startTapToPay}
              />
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

      {/* Send or receive chooser — Send chains into the money sheet below
          (rendered first so the rising money sheet stacks over its exit). */}
      <SendReceiveSheet
        open={sendReceiveOpen}
        onDismiss={() => setSendReceiveOpen(false)}
        onSend={startSend}
        onReceive={startReceive}
      />

      {/* Add money / Withdraw / Send — one mode-switched sheet; Confirm hands
          off to the Face ID overlay. */}
      <AddMoneySheet
        open={sheetOpen}
        mode={sheetMode}
        availableCents={availableCents}
        confirming={sheetConfirming}
        onDismiss={() => setSheetOpen(false)}
        onQuote={(cents, dest) => {
          // Receive never reaches the amount step, so no quote fires for it.
          if (sheetMode !== 'receive') onQuoteCreate?.(sheetMode, cents, dest);
        }}
        onLinkExternalAccount={(input, label) => {
          onLinkExternalAccount?.(input, label);
          // Confirm the save (fires after the sheet's 500ms validate beat).
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
  );
}
