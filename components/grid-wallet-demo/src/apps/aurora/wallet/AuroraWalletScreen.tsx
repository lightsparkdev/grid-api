'use client';

import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { IconBank } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconBank';
import { IconHotDrinkCup } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconHotDrinkCup';
import { useScreenOverlay } from '@/apps/shared/AppShell/ScreenOverlayContext';
import { AuroraBackground } from '@/apps/shared/AuroraBackground';
import { FaceIdAuth } from '@/apps/shared/FaceIdAuth';
import { GlassSymbolButton, headerGlassBrightness } from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import { useThemeMode } from '@/hooks/useThemeMode';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import { AddMoneySheet, formatUsdCents } from './AddMoneySheet';
import { BalanceHero } from './BalanceHero';
import { CardHomeContent } from './CardHomeContent';
import { CreatingCaption, IntroContent, ReadyContent } from './CardIssuanceContent';
import { DebitCard } from './DebitCard';
import { WalletActions } from './WalletActions';
import { WalletCardDetailHeader } from './WalletCardDetailHeader';
import { TapToPayStatus } from './TapToPayStatus';
import { WalletInsightCards, type WalletInsightCardsProps } from './WalletInsightCards';
import type { WalletListItemData } from './WalletListItem';
import { WalletListSection } from './WalletListSection';
import { WalletSheet } from './WalletSheet';
import styles from './AuroraWalletScreen.module.scss';

type CardView = 'closed' | 'intro' | 'creating' | 'ready' | 'home';
type TapPhase = 'idle' | 'hold' | 'auth' | 'done';

const SHEET_DURATION = 0.4;
const HEADER_DURATION = 0.2;
const CREATING_MS = 2200;
/** Issuance card is the home card scaled to Figma 338 / 370. */
const CARD_ISSUANCE_SCALE = 338 / 370;
const SHEET_OFFSCREEN = 'calc(100% + 224px)';
const TAP_HOLD_MS = 1200; // Hold Near Reader dwell before Face ID kicks in.
const TAP_DONE_MS = 1500; // Done-check dwell before resolving back to card-home.
// Insert the transaction AFTER card-home has re-entered (content settles ~0.7s)
// so the new row visibly grows in and pushes the list down.
const TAP_INSERT_DELAY_MS = 900;
const TAP_LIFT = -56; // Lift the body by the header height so the card sits under the status bar.

// Figma 2143:41027 — the transaction a tap-to-pay run drops into the list.
const TAP_TX: Omit<WalletListItemData, 'id' | 'timestamp'> = {
  Icon: IconHotDrinkCup,
  title: 'Blue Bottle Coffee',
  detail: 'Tap to Pay',
  amount: '$7.32',
};

// Insert the Activity row a beat after the Add money sheet has dismissed, so the
// slide-down insert is visible on the settled wallet (same beat as tap-to-pay).
const ADD_INSERT_DELAY_MS = 700;

/** "$5,000.00" → cents. */
function parseCents(formatted: string): number {
  const n = Number.parseFloat(formatted.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

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

interface AuroraWalletScreenProps extends WalletInsightCardsProps {
  /** Formatted balance from demo state, e.g. "$0.00". */
  balance?: string;
  onAdd?: () => void;
  onWithdraw?: () => void;
  onSend?: () => void;
}

/** Aurora wallet home + debit card issuance flow (Figma Bitcoin 2026). */
export function AuroraWalletScreen({
  balance = '$0.00',
  onAdd,
  onWithdraw,
  onSend,
  ...insights
}: AuroraWalletScreenProps) {
  const reduceMotion = useReducedMotion();
  const theme = useThemeMode();
  const overlayEl = useScreenOverlay();
  const [cardView, setCardView] = useState<CardView>('closed');
  const [issued, setIssued] = useState(false);
  const [tapPhase, setTapPhase] = useState<TapPhase>('idle');
  const [transactions, setTransactions] = useState<WalletListItemData[]>([]);

  // Add money flow: sheet + Face ID confirm + local balance/activity bookkeeping.
  const [addOpen, setAddOpen] = useState(false);
  const [addConfirming, setAddConfirming] = useState(false);
  const [addedCents, setAddedCents] = useState(0);
  const [activity, setActivity] = useState<WalletListItemData[]>([]);
  const pendingAddCents = useRef(0);
  const displayBalance = formatUsdCents(parseCents(balance) + addedCents);

  const isOpen = cardView !== 'closed';
  const isIssuance = cardView === 'intro' || cardView === 'creating' || cardView === 'ready';
  const showFullAurora = cardView === 'intro' || cardView === 'creating';
  const cardCentered = isIssuance; // centered for intro/creating/ready; top for closed/home
  const isTap = tapPhase !== 'idle'; // tap-to-pay sub-flow over the card-home screen

  // Simulated card creation: auto-advance creating -> ready (and mark issued).
  useEffect(() => {
    if (cardView !== 'creating') return;
    const t = window.setTimeout(() => {
      setIssued(true);
      setCardView('ready');
    }, CREATING_MS);
    return () => window.clearTimeout(t);
  }, [cardView]);

  // Tap-to-pay: Hold Near Reader dwells, then Face ID runs.
  useEffect(() => {
    if (tapPhase !== 'hold') return;
    const t = window.setTimeout(() => setTapPhase('auth'), TAP_HOLD_MS);
    return () => window.clearTimeout(t);
  }, [tapPhase]);

  // Tap-to-pay: once the Done check lands, resolve back to card-home, THEN drop
  // the transaction in once the screen has settled — so the new row pushes the
  // list down instead of already being there. The insert timer lives in a ref:
  // the effect re-runs on the idle flip, and a cleanup there would kill it.
  const insertTimer = useRef(0);
  useEffect(() => {
    if (tapPhase !== 'done') return;
    const t = window.setTimeout(() => {
      setTapPhase('idle');
      window.clearTimeout(insertTimer.current);
      insertTimer.current = window.setTimeout(() => {
        setTransactions((prev) => [
          { ...TAP_TX, id: `tap-${Date.now()}`, timestamp: Date.now() },
          ...prev,
        ]);
      }, TAP_INSERT_DELAY_MS);
    }, TAP_DONE_MS);
    return () => window.clearTimeout(t);
  }, [tapPhase]);
  useEffect(() => () => window.clearTimeout(insertTimer.current), []);

  const openCard = () => setCardView(issued ? 'home' : 'intro');

  // Add money confirmed (Face ID done): dismiss the sheet, bump the balance, and
  // drop the Activity row in once the wallet has settled (visible insert).
  const addInsertTimer = useRef(0);
  const finishAdd = () => {
    const cents = pendingAddCents.current;
    setAddConfirming(false);
    setAddOpen(false);
    setAddedCents((c) => c + cents);
    window.clearTimeout(addInsertTimer.current);
    addInsertTimer.current = window.setTimeout(() => {
      setActivity((prev) => [
        {
          id: `add-${Date.now()}`,
          Icon: IconBank,
          title: 'Added money',
          detail: 'Banorte •••• 3872',
          amount: formatUsdCents(cents),
          timestamp: Date.now(),
        },
        ...prev,
      ]);
    }, ADD_INSERT_DELAY_MS);
  };
  useEffect(() => () => window.clearTimeout(addInsertTimer.current), []);

  // Face ID renders in AppShell's overlay layer (above the status bar) so its
  // progressive blur frosts the status bar too; falls back to an in-screen layer
  // when rendered outside an AppShell. Shared by tap-to-pay and Add money.
  const faceIdAuth = (
    <FaceIdAuth
      active={tapPhase === 'auth' || addConfirming}
      onDone={() => {
        if (addConfirming) finishAdd();
        else setTapPhase('done');
      }}
    />
  );
  const faceIdOverlay = overlayEl ? (
    createPortal(faceIdAuth, overlayEl)
  ) : (
    <div className={styles.faceIdLayer}>{faceIdAuth}</div>
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

      <header className={styles.header}>
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

      {/* The whole body lifts as one transform during tap-to-pay (card + content
          together) so nothing desyncs — collapsing the header instead reflowed
          everything up while only the card animated, which read as a jump. */}
      <motion.div
        className={clsx(styles.body, isOpen && styles.bodyOpen, isTap && styles.bodyTap)}
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
              <DebitCard
                interactive={!isOpen}
                onOpen={openCard}
                bordered={showFullAurora}
                showNumber={!showFullAurora}
                issued={issued}
              />
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
            <BalanceHero balance={displayBalance} />
            <WalletActions
              onAdd={() => setAddOpen(true)}
              onWithdraw={onWithdraw}
              onSend={onSend}
            />
            <WalletInsightCards {...insights} />
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
              cta={{ label: 'Add money', onClick: () => setAddOpen(true) }}
              items={activity}
              concentricBottom
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
              <IntroContent onCreate={() => setCardView('creating')} />
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
                onTapToPay={() => setTapPhase('hold')}
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

      {/* Add money — three-step sheet; Confirm hands off to the Face ID overlay. */}
      <AddMoneySheet
        open={addOpen}
        balance={displayBalance}
        confirming={addConfirming}
        onDismiss={() => setAddOpen(false)}
        onConfirm={(cents) => {
          pendingAddCents.current = cents;
          setAddConfirming(true);
        }}
      />

      {faceIdOverlay}
    </div>
  );
}
