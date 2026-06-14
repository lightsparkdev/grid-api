'use client';

import clsx from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { IconBasket1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconBasket1';
import { IconCheeseburger } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheeseburger';
import { IconCup } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCup';
import { IconDeskLamp } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconDeskLamp';
import { IconFashion } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconFashion';
import { IconHotDrinkCup } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconHotDrinkCup';
import { IconShoppingBag1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconShoppingBag1';
import { IconSofa } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSofa';
import { IconStore1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconStore1';
import { IconTag } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconTag';
import { useScreenOverlay } from '@/apps/shared/AppShell/ScreenOverlayContext';
import { AuroraBackground } from '@/apps/shared/AuroraBackground';
import { FaceIdAuth } from '@/apps/shared/FaceIdAuth';
import { useStaggerReveal } from '@/apps/shared/useStaggerReveal';
import { GlassToast, type GlassToastData } from '@/apps/shared/GlassToast';
import { GlassSymbolButton, headerGlassBrightness } from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import { useThemeMode } from '@/hooks/useThemeMode';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import {
  AddMoneySheet,
  formatUsdCents,
  SEND_DEMO_ADDRESS,
  SolanaTokenIcon,
  truncateAddress,
  type MoneySheetMode,
} from './AddMoneySheet';
import { SendReceiveSheet } from './SendReceiveSheet';
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

// Figma 2143:41027 (row shape) — the tap-to-pay merchant pool: globally
// recognizable chains with FIXED, plausible charges (deterministic per
// merchant) so repeat taps read as real purchases around town.
const TAP_MERCHANTS: Array<Omit<WalletListItemData, 'id' | 'timestamp'>> = [
  { Icon: IconHotDrinkCup, title: 'Starbucks', detail: 'Tap to Pay', amount: '$7.45' },
  { Icon: IconCheeseburger, title: "McDonald's", detail: 'Tap to Pay', amount: '$11.84' },
  { Icon: IconStore1, title: '7-Eleven', detail: 'Tap to Pay', amount: '$6.27' },
  { Icon: IconCup, title: 'Pret a Manger', detail: 'Tap to Pay', amount: '$9.15' },
  { Icon: IconFashion, title: 'Uniqlo', detail: 'Tap to Pay', amount: '$39.90' },
  { Icon: IconShoppingBag1, title: 'Zara', detail: 'Tap to Pay', amount: '$45.90' },
  { Icon: IconTag, title: 'H&M', detail: 'Tap to Pay', amount: '$34.99' },
  { Icon: IconSofa, title: 'IKEA', detail: 'Tap to Pay', amount: '$86.53' },
  { Icon: IconDeskLamp, title: 'Muji', detail: 'Tap to Pay', amount: '$28.40' },
  { Icon: IconBasket1, title: 'Carrefour', detail: 'Tap to Pay', amount: '$43.76' },
];

// Insert the Activity row a beat after the Add money / Withdraw sheet has
// dismissed, so the slide-down insert is visible on the settled wallet (same
// beat as tap-to-pay).
const SHEET_INSERT_DELAY_MS = 700;

/** "$5,000.00" → cents. */
function parseCents(formatted: string): number {
  const n = Number.parseFloat(formatted.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

/** Toast copy amount — whole dollars drop the ".00" ("$1,500"); cents keep it. */
function toastUsd(cents: number): string {
  const usd = formatUsdCents(cents);
  return cents % 100 === 0 ? usd.slice(0, -3) : usd;
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
/** A flow switch returns to home first (aurora out ≈ 0.3s) before opening the
 *  target sheet/view — long enough that home reads as the in-between beat. */
const ENTRY_HOME_SETTLE_MS = 350;

const HEADER_HIDDEN = { opacity: 0, filter: 'blur(10px)' };
const HEADER_VISIBLE = { opacity: 1, filter: 'blur(0px)' };
const CONTENT_HIDDEN = { opacity: 0, y: 12, filter: 'blur(8px)' };
const CONTENT_VISIBLE = { opacity: 1, y: 0, filter: 'blur(0px)' };

/** The money movements the wallet reports up so the demo can log API calls. */
export type WalletTransferMode = 'add' | 'withdraw' | 'send';

/** A jump command from the Configure sidebar: provision state (so flows are
 *  reachable out of order) then open the target screen/sheet. */
export type WalletEntryTarget = 'add' | 'withdraw' | 'send' | 'card' | 'tap';
export interface WalletEntry {
  /** Bumped per command so the wallet applies it exactly once. */
  nonce: number;
  /** Instant, animation-free setup so a deep flow is reachable directly. */
  provision?: { issued?: boolean; fundCents?: number };
  /** Which sheet/view to open after provisioning. */
  open?: WalletEntryTarget;
}

interface AuroraWalletScreenProps extends WalletInsightCardsProps {
  /** Formatted balance from demo state, e.g. "$0.00". */
  balance?: string;
  /** One-shot mount stagger (card, balance, actions, insights) — the sign-in
   *  intro reveal. Off = everything renders at rest, exactly as before. */
  entrance?: boolean;
  /** Jump command from the sidebar — provision + open a flow out of order. */
  entry?: WalletEntry;
  /** Amount committed in a transfer sheet — log the create-quote call. */
  onQuoteCreate?: (mode: WalletTransferMode, cents: number) => void;
  /** Transfer confirmed (Face ID) — log execute + settle and move the balance. */
  onTransferExecute?: (mode: WalletTransferMode, cents: number) => void;
  /** A virtual card finished issuing on the phone. */
  onCardIssued?: () => void;
  /** A tap-to-pay charge landed on the phone. */
  onTapToPay?: (cents: number, merchant: string) => void;
}

/** Aurora wallet home + debit card issuance flow (Figma Bitcoin 2026). */
export function AuroraWalletScreen({
  balance = '$0.00',
  entrance = false,
  entry,
  onQuoteCreate,
  onTransferExecute,
  onCardIssued,
  onTapToPay,
  ...insights
}: AuroraWalletScreenProps) {
  const reduceMotion = useReducedMotion();
  const theme = useThemeMode();
  const overlayEl = useScreenOverlay();
  const [cardView, setCardView] = useState<CardView>('closed');
  const [issued, setIssued] = useState(false);
  const [tapPhase, setTapPhase] = useState<TapPhase>('idle');
  const [transactions, setTransactions] = useState<WalletListItemData[]>([]);

  // Add money / Withdraw flow: ONE mode-switched sheet + Face ID confirm +
  // local balance/activity bookkeeping (deltaCents = net adds − withdrawals).
  const [sheetMode, setSheetMode] = useState<MoneySheetMode>('add');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetConfirming, setSheetConfirming] = useState(false);
  const [deltaCents, setDeltaCents] = useState(0);
  const [activity, setActivity] = useState<WalletListItemData[]>([]);
  const pendingCents = useRef(0);
  const availableCents = parseCents(balance) + deltaCents;

  const openSheet = (mode: MoneySheetMode) => {
    setSheetMode(mode);
    setSheetOpen(true);
  };

  // "Send or receive" chooser (Figma 109:28513). Send swaps it for the money
  // sheet in one beat: the mini sheet drops as the tall sheet rises.
  const [sendReceiveOpen, setSendReceiveOpen] = useState(false);
  const startSend = () => {
    setSendReceiveOpen(false);
    openSheet('send');
  };

  // Glass toast (overlay layer): transfer confirmations + the tap-to-pay balance
  // guard. A fresh id restarts the hold when one is already up.
  const [toast, setToast] = useState<GlassToastData | null>(null);
  const showToast = (text: string) => setToast({ id: Date.now(), text });

  // Home Activity = money movements + card transactions, newest first. Derived
  // (not double-inserted) so each WalletListCard instance keeps its own
  // fresh-row bookkeeping — the grow-in insert still runs per list.
  const homeActivity = useMemo(
    () => [...activity, ...transactions].sort((a, b) => b.timestamp - a.timestamp),
    [activity, transactions],
  );

  // Sign-in entrance: card → balance → actions → insights reveal in once on
  // mount (the issuance stagger language); the Activity card's own skeleton
  // reveal carries the list. `entrance` off spreads a no-op (rest pose).
  const reveal = useStaggerReveal({ baseDelay: 0.05, stagger: 0.07 });
  const enter = (index: number) => (entrance ? reveal(index) : { initial: false as const });

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
      const tx = pendingTapTx.current; // the merchant picked at tap start
      setTapPhase('idle');
      // The card charge comes out of the cash balance, landing with the row.
      setDeltaCents((c) => c - parseCents(tx.amount));
      onTapToPay?.(parseCents(tx.amount), tx.title);
      window.clearTimeout(insertTimer.current);
      insertTimer.current = window.setTimeout(() => {
        setTransactions((prev) => [
          { ...tx, id: `tap-${Date.now()}`, timestamp: Date.now() },
          ...prev,
        ]);
      }, TAP_INSERT_DELAY_MS);
    }, TAP_DONE_MS);
    return () => window.clearTimeout(t);
  }, [tapPhase]);
  useEffect(() => () => window.clearTimeout(insertTimer.current), []);

  const openCard = () => setCardView(issued ? 'home' : 'intro');

  // The merchant is picked when the tap STARTS — the balance guard, the charge,
  // and the inserted row all see the same one. Shuffled-deck draw: every
  // merchant appears once (random order) before any repeats; the reshuffle
  // keeps the previous deck's last card off the top so back-to-back can't
  // happen across deck boundaries. A blocked tap puts the card back.
  const merchantDeck = useRef<typeof TAP_MERCHANTS>([]);
  const pendingTapTx = useRef(TAP_MERCHANTS[0]);
  const startTapToPay = () => {
    if (merchantDeck.current.length === 0) {
      const deck = [...TAP_MERCHANTS];
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      if (deck[0] === pendingTapTx.current) deck.push(deck.shift()!);
      merchantDeck.current = deck;
    }
    const merchant = merchantDeck.current[0];
    // Not enough for THIS merchant — the flow doesn't start, a toast says why.
    if (availableCents < parseCents(merchant.amount)) {
      showToast('Not enough balance');
      return;
    }
    merchantDeck.current.shift();
    pendingTapTx.current = merchant;
    setTapPhase('hold');
  };

  // Apply a sidebar jump command exactly once (nonce-guarded so re-renders and
  // StrictMode's double-invoke don't replay it). Provision any instant setup
  // first, then open the target — works whether the wallet just mounted (cold
  // jump from the auth screen) or is already up (warm jump).
  const lastEntryNonce = useRef(0);
  useEffect(() => {
    if (!entry || entry.nonce === lastEntryNonce.current) return;
    lastEntryNonce.current = entry.nonce;

    // Re-clicking the flow you're already in is a no-op — don't reset to home
    // and replay it. ("Issue a card" only counts as "here" mid-issuance, so it
    // can still replay from the card home.)
    const alreadyHere =
      (entry.open === 'add' && sheetOpen && sheetMode === 'add') ||
      (entry.open === 'withdraw' && sheetOpen && sheetMode === 'withdraw') ||
      (entry.open === 'send' && sheetOpen && sheetMode === 'send') ||
      (entry.open === 'card' && isIssuance) ||
      (entry.open === 'tap' && cardView === 'home');
    if (alreadyHere) return;

    if (entry.provision?.issued) setIssued(true);
    if (typeof entry.provision?.fundCents === 'number') setDeltaCents(entry.provision.fundCents);

    const openTarget = () => {
      switch (entry.open) {
        case 'add':
          openSheet('add');
          break;
        case 'withdraw':
          openSheet('withdraw');
          break;
        case 'send':
          startSend();
          break;
        case 'card':
          // Flows are replayable demos: "Issue a card" always runs the full
          // issuance animation again, even if a card already exists (no
          // "unissue" — replaying is the reset; it ends back on the card home).
          setCardView('intro');
          break;
        case 'tap':
          // Land on the debit-card screen; the user taps "Tap to pay".
          setCardView('home');
          break;
      }
    };

    // Already on a clean home screen (incl. a cold jump that just mounted) — open
    // the target right away, no detour.
    const awayFromHome =
      cardView !== 'closed' ||
      sheetOpen ||
      sheetConfirming ||
      sendReceiveOpen ||
      tapPhase !== 'idle';
    if (!awayFromHome) {
      openTarget();
      return;
    }

    // Otherwise return to home FIRST, let it land, THEN open the target — so a
    // flow switch reads as "home → sheet", never the next flow rising over the
    // previous one's leftovers (e.g. the card-issuance aurora behind a sheet).
    setSheetOpen(false);
    setSheetConfirming(false);
    setSendReceiveOpen(false);
    setTapPhase('idle');
    setCardView('closed');
    const t = window.setTimeout(openTarget, ENTRY_HOME_SETTLE_MS);
    return () => window.clearTimeout(t);
  }, [entry]);

  // Add/Withdraw confirmed (Face ID done): dismiss the sheet, move the balance
  // (signed), and drop the Activity row in once the wallet has settled (visible
  // insert).
  const sheetInsertTimer = useRef(0);
  const finishTransfer = () => {
    const cents = pendingCents.current;
    const mode = sheetMode;
    onTransferExecute?.(mode, cents);
    setSheetConfirming(false);
    setSheetOpen(false);
    setDeltaCents((c) => c + (mode === 'add' ? cents : -cents));
    showToast(
      mode === 'add'
        ? `${toastUsd(cents)} added to balance`
        : mode === 'withdraw'
          ? `${toastUsd(cents)} withdrawn from balance`
          : `${toastUsd(cents)} sent to ${truncateAddress(SEND_DEMO_ADDRESS)}`,
    );
    window.clearTimeout(sheetInsertTimer.current);
    sheetInsertTimer.current = window.setTimeout(() => {
      // Figma 90:13701 — bank rows show the MX flag; sends show the Solana
      // token chip + the truncated recipient. Outgoing money shows the plain
      // amount — only incoming gets the "+".
      setActivity((prev) => [
        mode === 'send'
          ? {
              id: `send-${Date.now()}`,
              Icon: SolanaTokenIcon,
              title: truncateAddress(SEND_DEMO_ADDRESS),
              detail: 'Sent to Solana wallet',
              amount: formatUsdCents(cents),
              timestamp: Date.now(),
            }
          : {
              id: `${mode}-${Date.now()}`,
              image: '/assets/add-money/flag-mx.svg',
              title: 'Banorte (•••• 3872)',
              detail: mode === 'withdraw' ? 'Withdrawn from balance' : 'Added to balance',
              amount: mode === 'withdraw' ? formatUsdCents(cents) : `+${formatUsdCents(cents)}`,
              timestamp: Date.now(),
            },
        ...prev,
      ]);
    }, SHEET_INSERT_DELAY_MS);
  };
  useEffect(() => () => window.clearTimeout(sheetInsertTimer.current), []);

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
              <WalletInsightCards {...insights} />
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
      />

      {/* Add money / Withdraw / Send — one mode-switched sheet; Confirm hands
          off to the Face ID overlay. */}
      <AddMoneySheet
        open={sheetOpen}
        mode={sheetMode}
        availableCents={availableCents}
        confirming={sheetConfirming}
        onDismiss={() => setSheetOpen(false)}
        onQuote={(cents) => onQuoteCreate?.(sheetMode, cents)}
        onConfirm={(cents) => {
          pendingCents.current = cents;
          setSheetConfirming(true);
        }}
      />

      {screenOverlay}
    </div>
  );
}
