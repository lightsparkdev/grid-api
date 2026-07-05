'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type UIEvent,
} from 'react';
import { AnimatePresence, motion, useAnimate, useReducedMotion } from 'motion/react';
import { TextMorph } from 'torph/react';
import {
  accountLast4,
  DEPOSIT_CHAINS,
  formatUsdCents,
  KEYPAD,
  truncateAddress,
  type MoneySheet,
  type MoneySheetMode,
  type ReceivedPayment,
  type SavedBank,
  type TransferActivity,
} from '@/apps/shared/wallet';
import { randomNetworkAddress } from '@/lib/cryptoAddresses';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { SquircleFocusHalo } from '@/apps/shared/SquircleFocusHalo';
import { SfSymbol } from '@/apps/shared/icons';
import NumericText from '@/components/NumericText';
import {
  cubicBezierCss,
  easeOutQuick,
  easeOutSnappy,
  easeOutSwift,
  motionTransition,
} from '@/lib/easing';
import {
  IconArrowLeft,
  IconCrossMedium,
  IconChevronRightMedium,
  IconBank,
  IconWallet2,
  IconCash,
  IconApple,
  IconLoadingCircle,
  IconSquareBehindSquare6,
  IconCheckmark2Small,
  IconQrCode,
  type MarketplaceIcon,
} from '../icons';
import {
  MARKETPLACE_PUSH_DURATION,
  MARKETPLACE_PUSH_PARALLAX,
  MARKETPLACE_SHEET_DURATION,
} from '../config';
import { FlagTile, StickerTile } from '../blocks/FlagTile';
import styles from './AddMoneyPage.module.scss';

const PUSH_TRANSITION = motionTransition(easeOutSnappy, MARKETPLACE_PUSH_DURATION);
const STEP_TRANSITION = PUSH_TRANSITION;
const BAR_TITLE_TRANSITION = motionTransition(easeOutQuick, 0.2);

// The left-edge drop shadow rides the slide as an ANIMATED value: a static CSS
// shadow still casts onto the screen when the page sits just off the right
// edge, then pops when the exit unmounts — fading it with the travel instead
// makes it arrive and leave with the page.
const EDGE_SHADOW_ON = '-16px 0 48px rgba(0, 0, 0, 0.2)';
const EDGE_SHADOW_OFF = '-16px 0 48px rgba(0, 0, 0, 0)';

/** Scroll distance (px) after which the large title is fully under the header
 *  bar — the hairline shows and the 14px bar title slides in. */
const TITLE_COLLAPSE_AT = 46;

// In-page step navigation — the SAME layered push as wallet home → this page:
// the deeper screen slides in ON TOP (edge shadow riding the travel) while the
// one underneath parallax-shifts back behind a scrim. Each layer's z is FIXED
// by step depth (source 10 < banks 20 < amount 30, dim layers between) — z
// never follows nav direction (that flipped a settled layer below its scrim
// when the brain walked "back" onto it). Every layer only ever travels one
// way (parallax / full width) — banks stays mounted beneath the amount
// screen rather than exiting forward.
type NavDir = { back: boolean; reduceMotion: boolean };
const underStepVariants = {
  enter: ({ reduceMotion }: NavDir) =>
    reduceMotion ? { x: 0, opacity: 1 } : { x: -MARKETPLACE_PUSH_PARALLAX, opacity: 1 },
  center: { x: 0, opacity: 1 },
  exit: ({ reduceMotion }: NavDir) =>
    reduceMotion ? { opacity: 0 } : { x: -MARKETPLACE_PUSH_PARALLAX, opacity: 1 },
};
const midStepVariants = {
  // Only ever enters forward (pushing over the source list) and exits back
  // (popping to source) — while the amount screen is up it stays MOUNTED
  // underneath, dimmed by the scrim, so there's no forward exit.
  enter: ({ reduceMotion }: NavDir) =>
    reduceMotion ? { x: 0, opacity: 1 } : { x: '100%', boxShadow: EDGE_SHADOW_OFF, opacity: 1 },
  center: { x: 0, boxShadow: EDGE_SHADOW_ON, opacity: 1 },
  exit: ({ reduceMotion }: NavDir) =>
    reduceMotion ? { opacity: 0 } : { x: '100%', boxShadow: EDGE_SHADOW_OFF, opacity: 1 },
};
// Send mode's middle layer (the Add-recipient chooser) is a FULL nav layer —
// it pushes over the recipient list AND gets pushed over by the address step —
// so both moves need the direction (travel only; z stays fixed at 20).
const navMidVariants = {
  enter: ({ back, reduceMotion }: NavDir) =>
    reduceMotion
      ? { x: 0, opacity: 1 }
      : back
        ? { x: -MARKETPLACE_PUSH_PARALLAX, boxShadow: EDGE_SHADOW_ON, opacity: 1 }
        : { x: '100%', boxShadow: EDGE_SHADOW_OFF, opacity: 1 },
  center: { x: 0, boxShadow: EDGE_SHADOW_ON, opacity: 1 },
  exit: ({ back, reduceMotion }: NavDir) =>
    reduceMotion
      ? { opacity: 0 }
      : back
        ? { x: '100%', boxShadow: EDGE_SHADOW_OFF, opacity: 1 }
        : // Forward exit = a save popped the stack to the list: this layer sits
          // BENEATH the top layer's slide-off, so it just fades — the reveal
          // beat belongs to the top layer alone.
          { opacity: 0 },
};
// The TOP nav layer (enter address): pops off to the right in BOTH directions —
// back is the nav pop, and a save's "dismiss the flow, then rise" sequence
// opens with the same slide-off revealing the list beneath.
const navTopVariants = {
  enter: ({ reduceMotion }: NavDir) =>
    reduceMotion ? { x: 0, opacity: 1 } : { x: '100%', boxShadow: EDGE_SHADOW_OFF, opacity: 1 },
  center: { x: 0, boxShadow: EDGE_SHADOW_ON, opacity: 1 },
  exit: ({ reduceMotion }: NavDir) =>
    reduceMotion ? { opacity: 0 } : { x: '100%', boxShadow: EDGE_SHADOW_OFF, opacity: 1 },
};

// Enter amount — a Z-style vertical presentation: the screen (own header, X
// top left) RISES from the bottom over the bank list, shadow riding the lift.
const RISE_SHADOW_ON = '0 -16px 48px rgba(0, 0, 0, 0.2)';
const RISE_SHADOW_OFF = '0 -16px 48px rgba(0, 0, 0, 0)';
const RISE_TRANSITION = motionTransition(easeOutSnappy, MARKETPLACE_SHEET_DURATION);
const riseStepVariants = {
  enter: ({ reduceMotion }: NavDir) =>
    reduceMotion ? { y: 0, opacity: 1 } : { y: '100%', boxShadow: RISE_SHADOW_OFF, opacity: 1 },
  center: { y: 0, boxShadow: RISE_SHADOW_ON, opacity: 1 },
  exit: ({ reduceMotion }: NavDir) =>
    reduceMotion ? { opacity: 0 } : { y: '100%', boxShadow: RISE_SHADOW_OFF, opacity: 1 },
};

/** NumericText needs vertical blur room; the default padding inflates the
 *  line, so pad a hair instead (Z's constant). */
const NUMERIC_PAD = { padding: '0.08em 0' };

// Amount → Review — the SAME layered iOS push as everywhere else in the app:
// the review slides in ON TOP from the right (edge shadow riding the travel)
// while the amount screen parallax-shifts back behind a scrim. The amount
// layer reuses underStepVariants; the review only ever travels one way.
const innerOverVariants = {
  enter: ({ reduceMotion }: NavDir) =>
    reduceMotion ? { x: 0, opacity: 1 } : { x: '100%', boxShadow: EDGE_SHADOW_OFF, opacity: 1 },
  center: { x: 0, boxShadow: EDGE_SHADOW_ON, opacity: 1 },
  exit: ({ reduceMotion }: NavDir) =>
    reduceMotion ? { opacity: 0 } : { x: '100%', boxShadow: EDGE_SHADOW_OFF, opacity: 1 },
};
const FADE_SWAP = motionTransition(easeOutQuick, 0.2);
const MORPH_MS = 280;
const REVIEW_TITLE = 'Review deposit';

// Empty-state reveal (the Z/Aurora WalletListCard choreography): skeleton rows
// hold, a cover fades them down, then the message + CTA blur/slide in.
const EMPTY_INITIAL_DELAY_S = 1.2;
const EMPTY_REVEAL_DURATION_S = 0.55;
const EMPTY_CONTENT_STAGGER_S = 0.2;
const MESSAGE_HIDDEN = { opacity: 0, y: 24, filter: 'blur(10px)' };
const MESSAGE_VISIBLE = { opacity: 1, y: 0, filter: 'blur(0px)' };

/** Source visuals — the FACE owns icon + copy per source id; the brain supplies
 *  only the ordered ids + routing (same split as Aurora's SOURCE_COPY). */
const SOURCE_COPY: Record<string, { Icon: MarketplaceIcon; title: string; sub: string }> = {
  bank: { Icon: IconBank, title: 'Bank account', sub: 'Local transfer in 65+ countries' },
  crypto: { Icon: IconWallet2, title: 'Crypto wallet', sub: 'Spark, Solana, Base address' },
  cashapp: { Icon: IconCash, title: 'Cash App', sub: 'Use your Cash App balance' },
  applepay: { Icon: IconApple, title: 'Apple Pay', sub: 'Use Apple Wallet' },
};

/** Send mode's "Add recipient" chooser reframes the same two rows. */
const SEND_SOURCE_COPY: Record<string, { Icon: MarketplaceIcon; title: string; sub: string }> = {
  bank: { Icon: IconBank, title: 'Bank account', sub: 'Send to 65+ countries' },
  crypto: { Icon: IconWallet2, title: 'Crypto wallet', sub: 'Spark, Solana, Base address' },
};

const PAGE_TITLE = 'Deposit';

/** Steps that have a marketplace face so far — a source row only navigates when
 *  its target is built (the rest stay press-feel no-ops until designed). */
const BUILT_STEPS = new Set(['banks', 'deposit', 'country', 'recipient']);

interface AddMoneyPageProps {
  /** The shared money-sheet brain (step machine, sources, banks, routing). */
  m: MoneySheet;
  /** Flow direction — reframes the same page: add (Deposit), send, receive. */
  mode: MoneySheetMode;
  open: boolean;
  onDismiss: () => void;
  /** Face ID running — the confirm CTA spins and input locks. */
  confirming: boolean;
  /** Confirm tapped — the parent runs Face ID then settles the transfer. */
  onConfirm: (cents: number, activity: TransferActivity) => void;
  /** Copying a crypto deposit address simulates funds landing a beat later —
   *  the wallet brain closes the page and settles the top-up. */
  onReceive?: (payment: ReceivedPayment) => void;
}

/**
 * Marketplace deposit flow — an iOS navigation PUSH, not a sheet: the page
 * slides in from the right over the wallet (left-edge drop shadow riding the
 * slide) while the wallet parallax-shifts behind it (see MarketplaceWalletScreen).
 * In-page steps (source list → select bank) push with the same mechanism.
 * Header echoes the wallet home's bar; on scroll the large title tucks under
 * the bar, which then gains its hairline + a 14px centered bar title.
 */
export function AddMoneyPage({
  m,
  mode,
  open,
  onDismiss,
  confirming,
  onConfirm,
  onReceive,
}: AddMoneyPageProps) {
  const reduceMotion = useReducedMotion();
  const navDir: NavDir = { back: m.back, reduceMotion: !!reduceMotion };
  const isSend = mode === 'send';
  const isReceive = mode === 'receive';

  // The brain steps with a marketplace face. Sheet-presented steps (country /
  // bankForm / fundingDetails ride the pageSheet) keep the view they launched
  // from beneath them; anything unbuilt falls back to the nearest built view
  // so the page never blanks.
  const viewStep: 'source' | 'banks' | 'deposit' | 'recipient' | 'amount' = isReceive
    ? 'deposit'
    : m.step === 'source'
      ? 'source'
      : m.step === 'deposit'
        ? 'deposit'
        : m.step === 'recipient'
          ? 'recipient'
          : m.step === 'amount' || m.step === 'confirm'
            ? 'amount'
            : isSend && (m.step === 'country' || m.step === 'bankForm')
              ? 'source'
              : 'banks';
  // The amount screen rises OVER the page header carrying its own chrome, so
  // the page header keeps showing the view beneath it (banks) during the lift.
  const headerView = viewStep === 'amount' ? 'banks' : viewStep;
  const stepTitle =
    headerView === 'banks'
      ? m.titles.banks
      : headerView === 'deposit'
        ? m.titles.deposit
        : headerView === 'recipient'
          ? m.titles.recipient
          : mode === 'add'
            ? PAGE_TITLE
            : m.titles.source;
  const handleBack = () => {
    const backTo = m.backFrom[m.step];
    if (m.isEntryStep || !backTo) onDismiss();
    else m.go(backTo, true);
  };

  // Graceful amount rise: saving a recipient plays as a SEQUENCE, not a pile
  // of simultaneous motions — first the covering screen dismisses (the address
  // step pops off right / the pageSheet slides down), revealing the list with
  // its new row; THEN the amount screen rises. Arriving from the list itself
  // (tapping a saved recipient) rises immediately.
  // Derived DURING render (not an effect — that commits a one-frame early
  // mount): only a save lands on amount from somewhere other than the list,
  // and that's the case that needs the dismiss beat first.
  const [prevStep, setPrevStep] = useState(m.step);
  const [riseReady, setRiseReady] = useState(true);
  if (m.step !== prevStep) {
    setPrevStep(m.step);
    if (m.step === 'amount') {
      setRiseReady(prevStep === 'banks' || prevStep === 'confirm');
    }
  }
  useEffect(() => {
    if (riseReady) return;
    const t = window.setTimeout(
      () => setRiseReady(true),
      (MARKETPLACE_SHEET_DURATION + 0.15) * 1000,
    );
    return () => window.clearTimeout(t);
  }, [riseReady]);
  const amountUp = viewStep === 'amount' && riseReady;

  // Large-title collapse tracks the CURRENT step's scroll; a push lands on a
  // fresh, un-collapsed screen. Two thresholds: the hairline lands the moment
  // you scroll; the centered bar title waits for the full title collapse.
  const [scrolled, setScrolled] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    setScrolled(false);
    setCollapsed(false);
  }, [headerView]);
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    setScrolled(top > 0);
    setCollapsed(top >= TITLE_COLLAPSE_AT);
  };

  // Saved banks only (the shared list can carry crypto recipients in send mode).
  const banks = m.banks.filter((b): b is SavedBank => !('address' in b));

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="deposit-page"
          className={styles.page}
          initial={reduceMotion ? { opacity: 0 } : { x: '100%', boxShadow: EDGE_SHADOW_OFF }}
          animate={reduceMotion ? { opacity: 1 } : { x: 0, boxShadow: EDGE_SHADOW_ON }}
          exit={reduceMotion ? { opacity: 0 } : { x: '100%', boxShadow: EDGE_SHADOW_OFF }}
          transition={PUSH_TRANSITION}
        >
          <header className={styles.headerBar} data-bordered={scrolled || undefined}>
            <button type="button" className={styles.backBtn} aria-label="Back" onClick={handleBack}>
              <IconArrowLeft size={24} />
            </button>
            <AnimatePresence initial={false}>
              {collapsed && (
                <motion.span
                  key={`bar-title-${headerView}`}
                  className={styles.barTitle}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={BAR_TITLE_TRANSITION}
                >
                  {stepTitle}
                </motion.span>
              )}
            </AnimatePresence>
            {/* "Add bank" / "Add recipient" pill (the Airbnb "Details" header
                button) — rides the list step, empty or not. */}
            <AnimatePresence initial={false}>
              {headerView === 'banks' && (
                <motion.button
                  key="add-bank-pill"
                  type="button"
                  className={styles.headerPill}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={BAR_TITLE_TRANSITION}
                  onClick={m.openAddBank}
                >
                  {isSend ? 'Add recipient' : 'Add bank'}
                </motion.button>
              )}
            </AnimatePresence>
          </header>

          <div className={styles.steps} key={m.openKey}>
            <AnimatePresence initial={false} custom={navDir}>
              {/* Source list — add mode's ENTRY (under layer); in send mode
                  it's the "Add recipient" chooser, a full nav layer pushed
                  over the recipient list and pushed over by the address step
                  (it stays mounted beneath that step). */}
              {(isSend
                ? viewStep === 'source' || viewStep === 'recipient'
                : viewStep === 'source') && (
                <motion.div
                  key="source"
                  className={styles.step}
                  style={{ zIndex: isSend ? 20 : 10 }}
                  custom={navDir}
                  variants={isSend ? navMidVariants : underStepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={STEP_TRANSITION}
                >
                  <div className={styles.scroll} onScroll={handleScroll}>
                    <h1 className={styles.title}>
                      {mode === 'add' ? PAGE_TITLE : m.titles.source}
                    </h1>
                    <div className={styles.list}>
                      {m.sources.map((id, i) => {
                        const copy = (isSend ? SEND_SOURCE_COPY : SOURCE_COPY)[id];
                        if (!copy) return null;
                        const { Icon } = copy;
                        const active = m.activeSources.find((a) => a.id === id);
                        return (
                          <SourceRow
                            key={id}
                            Icon={Icon}
                            title={copy.title}
                            sub={copy.sub}
                            disabled={!active}
                            bordered={i < m.sources.length - 1}
                            onClick={
                              active && BUILT_STEPS.has(active.next)
                                ? () => {
                                    // Crypto starts a fresh address; the bank
                                    // path drops any crypto destination so the
                                    // two never bleed together (Aurora's rule).
                                    if (id === 'crypto') {
                                      m.setSelectedBankId(null);
                                      m.setCryptoDest(null);
                                      m.setPasted(false);
                                      m.setPastedAddress('');
                                    } else {
                                      m.setCryptoDest(null);
                                    }
                                    m.go(active.next);
                                  }
                                : undefined
                            }
                          />
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* The list step — Select bank (add/withdraw) or Send to (send,
                  where it's the ENTRY under-layer: recipients of both kinds).
                  STAYS MOUNTED under the amount step: its forward "exit" is a
                  hold-still (no values change), which Framer completes
                  instantly — unmounting the list mid-rise and flashing bare
                  scrim. It only truly exits when popping (add: to source). */}
              {(viewStep === 'banks' || viewStep === 'amount') && (
                <motion.div
                  key="banks"
                  className={styles.step}
                  style={{ zIndex: isSend ? 10 : 20 }}
                  custom={navDir}
                  variants={isSend ? underStepVariants : midStepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={STEP_TRANSITION}
                >
                  <div className={styles.scroll} onScroll={handleScroll}>
                    <h1 className={styles.title}>{m.titles.banks}</h1>
                    {m.banks.length === 0 ? (
                      <BanksEmptyState
                        reduceMotion={!!reduceMotion}
                        title={isSend ? 'No recipients yet' : 'No bank accounts yet'}
                        sub={
                          isSend
                            ? 'Send to a bank account in 65+ countries or any crypto wallet'
                            : 'Add a bank account in 65+ countries to get started'
                        }
                        cta={isSend ? 'Add recipient' : 'Add bank'}
                        onAddBank={m.openAddBank}
                      />
                    ) : (
                      <div className={styles.list}>
                        {(isSend ? m.banks : banks).map((b) =>
                          'address' in b ? (
                            <button
                              key={b.id}
                              type="button"
                              className={styles.row}
                              onClick={() => m.selectBank(b.id)}
                            >
                              <StickerTile>
                                <img
                                  className={styles.netLogo}
                                  src={b.logo}
                                  alt=""
                                  draggable={false}
                                />
                              </StickerTile>
                              <span className={styles.rowLines}>
                                <span className={styles.rowTitle}>
                                  {truncateAddress(b.address)}
                                </span>
                                <span className={styles.rowSub}>{b.network} wallet</span>
                              </span>
                              <span className={styles.rowChevron} aria-hidden>
                                <IconChevronRightMedium size={20} />
                              </span>
                            </button>
                          ) : (
                            <button
                              key={b.id}
                              type="button"
                              className={styles.row}
                              onClick={() => m.selectBank(b.id)}
                            >
                              <FlagTile code={b.country.code} />
                              <span className={styles.rowLines}>
                                <span className={styles.rowTitle}>
                                  {isSend ? b.beneficiary : b.bankName}
                                </span>
                                <span className={styles.rowSub}>
                                  {/* Middle dots (U+00B7) — Circular's real bullet is huge. */}
                                  {isSend ? b.bankName : b.country.name}{' '}
                                  &middot;&middot;&middot;&middot; {accountLast4(b.values)}
                                </span>
                              </span>
                              <span className={styles.rowChevron} aria-hidden>
                                <IconChevronRightMedium size={20} />
                              </span>
                            </button>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Add from crypto — the deposit-address list. Same mid-layer
                  push as banks (they're sibling drill-ins off the source
                  list, never up at once). */}
              {viewStep === 'deposit' && (
                <motion.div
                  key="deposit"
                  className={styles.step}
                  // Receive's ENTRY layer (no push to arrive); add mode pushes
                  // it over the source list like the banks step.
                  style={{ zIndex: isReceive ? 10 : 20 }}
                  custom={navDir}
                  variants={isReceive ? underStepVariants : midStepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={STEP_TRANSITION}
                >
                  <div className={styles.scroll} onScroll={handleScroll}>
                    <h1 className={styles.title}>{m.titles.deposit}</h1>
                    <div className={styles.list}>
                      {/* Receive leads with the bank drill-in (add-from-crypto
                          is crypto-only — bank is its own source row there). */}
                      {isReceive && (
                        <button
                          type="button"
                          className={styles.row}
                          onClick={m.openAddBank}
                        >
                          <StickerTile neutral>
                            <IconBank size={22} />
                          </StickerTile>
                          <span className={styles.rowLines}>
                            <span className={styles.rowTitle}>Bank account</span>
                            <span className={styles.rowSub}>
                              Local transfer in 65+ countries &middot; Instant
                            </span>
                          </span>
                          <span className={styles.rowChevron} aria-hidden>
                            <IconChevronRightMedium size={20} />
                          </span>
                        </button>
                      )}
                      {DEPOSIT_CHAINS.map((chain) => {
                        const copied = m.copiedChainId === chain.id;
                        return (
                          <div key={chain.id} className={styles.cryptoRow}>
                            <StickerTile>
                              <img
                                className={styles.netLogo}
                                src={chain.logo}
                                alt=""
                                draggable={false}
                              />
                            </StickerTile>
                            <span className={styles.rowLines}>
                              <span className={styles.rowTitle}>{chain.name}</span>
                              <span className={styles.rowSub}>
                                {truncateAddress(chain.address)} &middot; {chain.time}
                              </span>
                            </span>
                            <span className={styles.rowActions}>
                              <RowIconBtn
                                label={copied ? 'Copied' : `Copy ${chain.name} address`}
                                onClick={() => {
                                  m.copyValue(chain.id, chain.address);
                                  // Copying an address simulates funds landing
                                  // on that chain a beat later — the brain
                                  // closes the page and settles the top-up.
                                  onReceive?.({
                                    via: 'crypto',
                                    network: chain.name,
                                    logo: chain.logo,
                                    address: randomNetworkAddress(chain.name),
                                  });
                                }}
                              >
                                {copied ? (
                                  <IconCheckmark2Small size={20} />
                                ) : (
                                  <IconSquareBehindSquare6 size={20} />
                                )}
                              </RowIconBtn>
                              {/* QR is a visual affordance only (no-op). */}
                              <RowIconBtn label={`Show ${chain.name} QR code`}>
                                <IconQrCode size={20} />
                              </RowIconBtn>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Enter address (send → crypto) — the TOP nav layer over the
                  Add-recipient chooser. Paste opens the network sheet (iOS
                  stack recede); a filled card saves + rises the amount. */}
              {viewStep === 'recipient' && (
                <motion.div
                  key="recipient"
                  className={styles.step}
                  style={{ zIndex: 30 }}
                  custom={navDir}
                  variants={navTopVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={STEP_TRANSITION}
                >
                  <RecipientStep m={m} isSend={isSend} />
                </motion.div>
              )}

              {amountUp && (
                <motion.div
                  key="amount"
                  className={styles.step}
                  // Above the page header (z 40) — the rising screen carries
                  // its own chrome, covering the whole page as it lifts.
                  style={{ zIndex: 50 }}
                  custom={navDir}
                  variants={riseStepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={RISE_TRANSITION}
                >
                  <AmountStep
                    m={m}
                    mode={mode}
                    reduceMotion={!!reduceMotion}
                    confirming={confirming}
                    onConfirm={onConfirm}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            {/* Depth scrims — one per layer boundary, z-slotted between the
                fixed-depth layers. Each fades on the push clock, exactly like
                the wallet-level pushScrim behind this page. */}
            {!reduceMotion && (
              <>
                {/* Over the z10 entry layer (add: source; send: the list). */}
                <motion.div
                  className={styles.stepScrim}
                  style={{ zIndex: 15 }}
                  initial={false}
                  animate={{
                    opacity: (
                      isSend
                        ? viewStep === 'source' || viewStep === 'recipient'
                        : !isReceive && viewStep !== 'source'
                    )
                      ? 1
                      : 0,
                  }}
                  transition={STEP_TRANSITION}
                  aria-hidden
                />
                {/* Send only: over the chooser (z20) while the address step
                    (z30) rides on top. */}
                {isSend && (
                  <motion.div
                    className={styles.stepScrim}
                    style={{ zIndex: 25 }}
                    initial={false}
                    animate={{ opacity: viewStep === 'recipient' ? 1 : 0 }}
                    transition={STEP_TRANSITION}
                    aria-hidden
                  />
                )}
                <motion.div
                  className={styles.stepScrim}
                  // Above the page header (z 40): the amount screen rises OVER
                  // the header (z 50), so its scrim must dim the header too.
                  style={{ zIndex: 45 }}
                  initial={false}
                  animate={{ opacity: amountUp ? 1 : 0 }}
                  transition={STEP_TRANSITION}
                  aria-hidden
                />
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Enter amount → Review deposit — SEPARATE screens (IMG_0631/0632's voice),
 * the review pushed in from the right over the receding amount screen (the
 * same layered iOS push as the rest of the app), inside the risen layer.
 * The shared header swaps its
 * controls (X → back + X) and text-morphs the title; Continue runs the quote
 * beat then pushes to the review, which is the Airbnb "Request to book"
 * anatomy: bordered summary box (bank header + Amount/Rate/Arrives rows with
 * a Change pill), flat Price details with a total, fine print, and the
 * pinned "Confirm deposit" CTA + terms line. Confirm runs Face ID.
 */
function AmountStep({
  m,
  mode,
  reduceMotion,
  confirming,
  onConfirm,
}: {
  m: MoneySheet;
  mode: MoneySheetMode;
  reduceMotion: boolean;
  confirming: boolean;
  onConfirm: (cents: number, activity: TransferActivity) => void;
}) {
  const isReview = m.step === 'confirm';
  const isSend = mode === 'send';
  // Outflows (withdraw / send) spend the balance — they get the Use max chip.
  const outbound = mode !== 'add';
  const reviewTitle =
    mode === 'withdraw' ? 'Review withdrawal' : isSend ? 'Review send' : REVIEW_TITLE;
  // Where the X lands: the list, except withdraw-to-crypto (its one-off
  // wallet came from the address step, so the pop returns there).
  const closeTo = m.backFrom.amount ?? 'banks';
  const navDir: NavDir = { back: m.back, reduceMotion };

  // Shake on an invalid attempt — the brain bumps shakeNonce. The nonce
  // persists across mounts (it lives in the brain), so seed the ref with the
  // mount-time value and only shake on a CHANGE — otherwise a stale nonzero
  // nonce replays the shake every time this screen rises.
  const [amountScope, animateAmount] = useAnimate<HTMLParagraphElement>();
  const seenShakeNonce = useRef(m.shakeNonce);
  useEffect(() => {
    if (m.shakeNonce === seenShakeNonce.current) return;
    seenShakeNonce.current = m.shakeNonce;
    if (reduceMotion || !amountScope.current) return;
    animateAmount(
      amountScope.current,
      { x: [0, 8, -8, 8, 0] },
      { duration: 0.28, ease: 'linear' },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m.shakeNonce]);

  // Swift's minimumScaleFactor: shrink the amount toward 0.5 instead of
  // bleeding off the screen. scrollWidth ignores the transform, so the
  // measurement is always the natural width.
  const fitRef = useRef<HTMLSpanElement>(null);
  const [fit, setFit] = useState(1);
  useLayoutEffect(() => {
    const el = fitRef.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    const measure = () => {
      const natural = el.scrollWidth;
      const avail = parent.clientWidth - 32;
      setFit(natural > avail ? Math.max(0.5, avail / natural) : 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [isReview]);

  const bank = m.selectedBank;
  const crypto = m.selectedCrypto;
  const cta = useSquircleClip<HTMLButtonElement>({ figmaRadii: 13 });
  const destClip = useSquircleClip<HTMLButtonElement>({ figmaRadii: 16 });
  const locked = confirming || m.quoting;

  return (
    <div className={styles.amountLayout}>
      {/* Shared chrome — amount: X left; review: back left + X right (the
          reference header). The title morphs between the two. */}
      <header className={styles.amountHeader}>
        <span className={styles.amountHeaderSlot}>
          <AnimatePresence initial={false} mode="popLayout">
            {isReview ? (
              <motion.button
                key="back"
                type="button"
                className={styles.backBtn}
                aria-label="Back"
                onClick={() => !locked && m.go('amount', true)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={FADE_SWAP}
              >
                <IconArrowLeft size={24} />
              </motion.button>
            ) : (
              <motion.button
                key="close"
                type="button"
                className={styles.backBtn}
                aria-label="Close"
                onClick={() => !locked && m.go(closeTo, true)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={FADE_SWAP}
              >
                <IconCrossMedium size={24} />
              </motion.button>
            )}
          </AnimatePresence>
        </span>
        <span className={styles.amountHeaderTitle}>
          {/* nbsp: spaced text makes torph segment by WORD — non-breaking
              spaces force grapheme morphing so shared letters glide. */}
          <TextMorph as="span" duration={MORPH_MS} ease={cubicBezierCss(easeOutSwift)}>
            {(isReview ? reviewTitle : m.titles.amount).replace(/ /g, '\u00a0')}
          </TextMorph>
        </span>
        <span className={styles.amountHeaderSlot}>
          <AnimatePresence initial={false}>
            {isReview && (
              <motion.button
                key="review-close"
                type="button"
                className={styles.backBtn}
                aria-label="Close"
                onClick={() => !locked && m.go(closeTo, true)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={FADE_SWAP}
              >
                <IconCrossMedium size={24} />
              </motion.button>
            )}
          </AnimatePresence>
        </span>
      </header>

      {/* Amount ⇄ Review — the layered iOS push: review rides in on top
          (z 20, edge shadow) while the amount parallax-recedes (z 10)
          behind the scrim slotted between them (z 15). */}
      <div className={styles.innerSteps}>
        <AnimatePresence initial={false} custom={navDir}>
          {!isReview && (
            <motion.div
              key="amount"
              className={`${styles.innerStep} ${styles.innerStepPad}`}
              style={{ zIndex: 10 }}
              custom={navDir}
              variants={underStepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={STEP_TRANSITION}
            >
              {/* The amount floats free, centered above the destination. */}
              <div className={styles.amountFree}>
                <p ref={amountScope} className={styles.amountValue}>
                  <span
                    ref={fitRef}
                    className={styles.amountFit}
                    style={{ transform: `scale(${fit})` }}
                  >
                    <NumericText
                      value={m.cents / 100}
                      format={{ style: 'currency', currency: 'USD' }}
                      fraction={m.amountFraction}
                      ghostClassName={styles.amountGhost}
                      style={NUMERIC_PAD}
                    />
                  </span>
                </p>
                <p className={styles.amountSub}>
                  {/* netCents: maxed pays the fee from inside, so the line
                      shows what actually lands at the destination. */}
                  <NumericText
                    value={(m.netCents / 100) * m.fxRate}
                    format={{
                      minimumFractionDigits: m.fxFractionDigits,
                      maximumFractionDigits: m.fxFractionDigits,
                    }}
                    style={NUMERIC_PAD}
                  />
                  {`\u00A0${m.fxLabel}`}
                  <SfSymbol name="arrow.up.arrow.down" size={11} />
                </p>
                {/* Balance-sourced outflows get the Use max chip (Aurora's
                    109:29074), in the header-pill voice. */}
                {outbound && (
                  <button
                    type="button"
                    className={styles.useMaxBtn}
                    disabled={locked}
                    onClick={m.useMax}
                  >
                    Use max
                  </button>
                )}
              </div>

              {/* Destination — the selected recipient in a 1px-bordered box:
                  a bank account (flag sticker) or a crypto wallet (network
                  logo sticker). */}
              {(bank || crypto) && (
                <div className={styles.destWrap}>
                  <button
                    type="button"
                    ref={destClip.ref}
                    style={destClip.style}
                    className={styles.destBox}
                    disabled={locked}
                    onClick={() => m.go(closeTo, true)}
                  >
                    {bank ? (
                      <>
                        <FlagTile code={bank.country.code} />
                        <span className={styles.rowLines}>
                          <span className={styles.rowTitle}>
                            {isSend ? bank.beneficiary : bank.bankName}
                          </span>
                          <span className={styles.rowSub}>
                            {isSend ? bank.bankName : bank.country.name}{' '}
                            &middot;&middot;&middot;&middot; {accountLast4(bank.values)}
                          </span>
                        </span>
                      </>
                    ) : (
                      crypto && (
                        <>
                          <StickerTile>
                            <img
                              className={styles.netLogo}
                              src={crypto.logo}
                              alt=""
                              draggable={false}
                            />
                          </StickerTile>
                          <span className={styles.rowLines}>
                            <span className={styles.rowTitle}>
                              {truncateAddress(crypto.address)}
                            </span>
                            <span className={styles.rowSub}>{crypto.network} wallet</span>
                          </span>
                        </>
                      )
                    )}
                    <span className={styles.rowChevron} aria-hidden>
                      <IconChevronRightMedium size={20} />
                    </span>
                  </button>
                  <SquircleFocusHalo
                    path={destClip.path}
                    width={destClip.width}
                    height={destClip.height}
                    className={styles.destHalo}
                  />
                </div>
              )}

              <div className={styles.keypad} role="group" aria-label="Amount keypad">
                {KEYPAD.flat().map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={styles.key}
                    aria-label={key === 'del' ? 'Delete' : key}
                    onClick={() => m.press(key)}
                  >
                    {key === 'del' ? <SfSymbol name="delete.left" size={24} /> : key}
                  </button>
                ))}
              </div>

              <div className={styles.amountCtaWrap}>
                <button
                  type="button"
                  className={styles.amountCta}
                  ref={cta.ref}
                  style={cta.style}
                  onClick={m.tryContinue}
                >
                  {m.quoting ? (
                    <span className={styles.ctaSpinner} aria-label="Creating quote">
                      <IconLoadingCircle size={20} />
                    </span>
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </motion.div>
          )}
          {isReview && (
            <motion.div
              key="review"
              className={styles.innerStep}
              style={{ zIndex: 20 }}
              custom={navDir}
              variants={innerOverVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={STEP_TRANSITION}
            >
              {(bank || crypto) && (
                <ReviewScreen
                  m={m}
                  mode={mode}
                  confirming={confirming}
                  onConfirm={onConfirm}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Depth scrim over the receding amount screen — same clock as the
            push, same token as every other layer boundary. */}
        {!reduceMotion && (
          <motion.div
            className={styles.stepScrim}
            style={{ zIndex: 15 }}
            initial={false}
            animate={{ opacity: isReview ? 1 : 0 }}
            transition={STEP_TRANSITION}
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}

/**
 * Review deposit (IMG_0631/0632) — bordered summary box (bank header +
 * hairline rows with a Change pill), flat 2-col Price details with a total,
 * fine print, pinned Confirm CTA over a terms line. Left-aligned throughout.
 */
function ReviewScreen({
  m,
  mode,
  confirming,
  onConfirm,
}: {
  m: MoneySheet;
  mode: MoneySheetMode;
  confirming: boolean;
  onConfirm: (cents: number, activity: TransferActivity) => void;
}) {
  const isSend = mode === 'send';
  // Outflows (withdraw / send) leave the balance: itinerary runs balance →
  // counterparty, and the totals price in USD out / settled currency in.
  const outbound = mode !== 'add';
  const bank = m.selectedBank;
  const crypto = m.selectedCrypto;
  // 18 = the wallet home card radius (MkCard), so the two card voices match.
  const boxClip = useSquircleClip<HTMLDivElement>({ figmaRadii: 18 });
  const cta = useSquircleClip<HTMLButtonElement>({ figmaRadii: 13 });
  const local = (cents: number) =>
    ((cents / 100) * m.fxRate).toLocaleString('en-US', {
      minimumFractionDigits: m.fxFractionDigits,
      maximumFractionDigits: m.fxFractionDigits,
    });

  // The itinerary endpoints: money flows INTO the wallet on add (bank →
  // balance) and OUT on send (balance → recipient).
  const balanceRow = (
    <div className={styles.routeRow}>
      <StickerTile brand>
        <CircleDollarIcon size={22} />
      </StickerTile>
      <span className={styles.rowLines}>
        <span className={styles.rowTitle}>Cash balance</span>
        <span className={styles.rowSub}>USD</span>
      </span>
    </div>
  );
  const counterpartyRow = bank ? (
    <div className={styles.routeRow}>
      <FlagTile code={bank.country.code} />
      <span className={styles.rowLines}>
        <span className={styles.rowTitle}>{isSend ? bank.beneficiary : bank.bankName}</span>
        <span className={styles.rowSub}>
          {isSend ? bank.bankName : bank.country.name} &middot;&middot;&middot;&middot;{' '}
          {accountLast4(bank.values)}
        </span>
      </span>
    </div>
  ) : crypto ? (
    <div className={styles.routeRow}>
      <StickerTile>
        <img className={styles.netLogo} src={crypto.logo} alt="" draggable={false} />
      </StickerTile>
      <span className={styles.rowLines}>
        <span className={styles.rowTitle}>{truncateAddress(crypto.address)}</span>
        <span className={styles.rowSub}>{crypto.network} wallet</span>
      </span>
    </div>
  ) : null;

  return (
    <div className={styles.review}>
      <div className={styles.reviewScroll}>
        {/* Summary box — the ROUTE (IMG_0668's itinerary): source sticker →
            connector line → destination sticker, then the amount row. */}
        <div className={styles.reviewBoxWrap}>
          <div ref={boxClip.ref} style={boxClip.style} className={styles.reviewBox}>
            <div className={styles.routeRows}>
              {outbound ? (
                <>
                  {balanceRow}
                  {counterpartyRow}
                </>
              ) : (
                <>
                  {counterpartyRow}
                  {balanceRow}
                </>
              )}
            </div>
            <div className={styles.reviewBoxRow}>
              <span className={styles.reviewRowLines}>
                <span className={styles.reviewRowLabel}>Amount</span>
                <span className={styles.reviewRowValue}>{formatUsdCents(m.cents)}</span>
              </span>
              <button
                type="button"
                className={styles.changePill}
                disabled={confirming}
                onClick={() => m.go('amount', true)}
              >
                Change
              </button>
            </div>
          </div>
          <SquircleFocusHalo
            path={boxClip.path}
            width={boxClip.width}
            height={boxClip.height}
            className={styles.destHalo}
          />
        </div>

        {/* Flexible gap — the details pack against the CTA, not the box. */}
        <div className={styles.reviewSpacer} aria-hidden />

        {/* Payment details — the supporting math (rate, fee, timing) from the
            brain, then the two bold answers: what leaves and what lands. */}
        <h2 className={styles.reviewSectionTitle}>Payment details</h2>
        <div className={styles.priceRows}>
          {m.confirmDetails.map(([label, value]) => (
            <div key={label} className={styles.priceRow}>
              <span>{label}</span>
              <span>
                {label === 'Fee' && mode === 'add' && bank ? (
                  <>
                    {value} ({local(m.feeCents)} {m.fxLabel})
                  </>
                ) : (
                  value
                )}
              </span>
            </div>
          ))}
          {outbound ? (
            <>
              {/* Outflow: you pay in USD from the balance (EXACTLY the
                  balance when maxed — the fee splits out of the inside); the
                  destination gets the settled currency — "they" for a send,
                  still you for a withdrawal. */}
              <div className={styles.priceTotalRow}>
                <span>You&rsquo;ll pay</span>
                <span>{formatUsdCents(m.payCents)}</span>
              </div>
              <div className={styles.priceTotalRow}>
                <span>{isSend ? 'They\u2019ll get' : 'You\u2019ll get'}</span>
                <span>
                  {local(m.netCents)} {m.fxLabel}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className={styles.priceTotalRow}>
                <span>You&rsquo;ll pay</span>
                <span>
                  {local(m.payCents)} {m.fxLabel}
                </span>
              </div>
              <div className={styles.priceTotalRow}>
                <span>You&rsquo;ll get</span>
                <span>{formatUsdCents(m.netCents)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className={styles.reviewCtaWrap}>
        <button
          type="button"
          className={styles.amountCta}
          ref={cta.ref}
          style={cta.style}
          onClick={() => !confirming && onConfirm(m.cents, m.activityForConfirm())}
        >
          {confirming ? (
            <span className={styles.ctaSpinner} aria-label="Confirming">
              <IconLoadingCircle size={20} />
            </span>
          ) : (
            <span className={styles.ctaInner}>
              <span className={styles.ctaFaceId} aria-hidden>
                <SfSymbol name="faceid" size={18} />
              </span>
              {mode === 'withdraw'
                ? 'Confirm withdrawal'
                : isSend
                  ? 'Confirm send'
                  : 'Confirm deposit'}
            </span>
          )}
        </button>
        <p className={styles.reviewTerms}>
          By selecting the button, I agree to the <span>transfer terms</span>.
        </p>
      </div>
    </div>
  );
}

/**
 * Enter address (send / withdraw → crypto) — the address card in the
 * destination-box voice: empty it invites a paste; Paste opens the network
 * sheet (the iOS stacked pageSheet); a pick fills the card and the CTA morphs
 * Paste → Add recipient (send saves a recipient) or Continue (withdraw uses a
 * one-off wallet), runs the save beat, and the amount screen rises.
 */
function RecipientStep({ m, isSend }: { m: MoneySheet; isSend: boolean }) {
  const boxClip = useSquircleClip<HTMLDivElement>({ figmaRadii: 16 });
  const cta = useSquircleClip<HTMLButtonElement>({ figmaRadii: 13 });
  const net = m.pickedNetwork;
  const filled = m.pasted && net;
  return (
    <div className={styles.recipientLayout}>
      <div className={styles.scroll}>
        <h1 className={styles.title}>{m.titles.recipient}</h1>
        <div className={styles.addressWrap}>
          <div ref={boxClip.ref} style={boxClip.style} className={styles.addressBox}>
            {filled ? (
              <>
                <StickerTile>
                  <img className={styles.netLogo} src={net.logo} alt="" draggable={false} />
                </StickerTile>
                <span className={styles.rowLines}>
                  <span className={styles.rowTitle}>{truncateAddress(m.pastedAddress)}</span>
                  <span className={styles.rowSub}>{net.name} wallet</span>
                </span>
              </>
            ) : (
              <span className={styles.rowLines}>
                <span className={styles.addressPlaceholder}>Enter any address</span>
                <span className={styles.rowSub}>Spark, Solana, Base, Ethereum &mdash; anything</span>
              </span>
            )}
          </div>
          <SquircleFocusHalo
            path={boxClip.path}
            width={boxClip.width}
            height={boxClip.height}
            className={styles.destHalo}
          />
        </div>
      </div>
      <div className={styles.recipientCtaWrap}>
        <button
          type="button"
          className={styles.amountCta}
          ref={cta.ref}
          style={cta.style}
          onClick={() => {
            if (m.saving) return;
            if (!m.pasted) m.setPickerOpen(true);
            else if (isSend) m.addCryptoRecipient();
            else m.useCryptoWithdraw();
          }}
        >
          {m.saving ? (
            <span className={styles.ctaSpinner} aria-label="Saving">
              <IconLoadingCircle size={20} />
            </span>
          ) : (
            <TextMorph as="span" duration={MORPH_MS} ease={cubicBezierCss(easeOutSwift)}>
              {(m.pasted ? (isSend ? 'Add recipient' : 'Continue') : 'Paste').replace(
                / /g,
                '\u00a0',
              )}
            </TextMorph>
          )}
        </button>
      </div>
    </div>
  );
}

/** The round filled dollar (Aurora's cash-balance glyph, inlined so it takes
 *  currentColor — white on the brand-pink sticker). */
function CircleDollarIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM12 5.5C12.5523 5.5 13 5.94772 13 6.5V7.12367C13.804 7.32711 14.5135 7.77457 14.9759 8.41405C15.2995 8.86159 15.199 9.48674 14.7515 9.81035C14.304 10.134 13.6788 10.0335 13.3552 9.58595C13.1379 9.28549 12.6534 9 12 9H11.7222C10.8274 9 10.5 9.54492 10.5 9.77778V9.8541C10.5 10.0514 10.6491 10.3826 11.1525 10.584L13.5902 11.5591C14.6572 11.9858 15.5 12.9386 15.5 14.1459C15.5 15.6189 14.323 16.6144 13 16.9091V17.5C13 18.0523 12.5523 18.5 12 18.5C11.4477 18.5 11 18.0523 11 17.5V16.8763C10.196 16.6729 9.4865 16.2254 9.02411 15.586C8.7005 15.1384 8.80096 14.5133 9.24851 14.1897C9.69605 13.866 10.3212 13.9665 10.6448 14.414C10.8621 14.7145 11.3466 15 12 15H12.1824C13.1298 15 13.5 14.4209 13.5 14.1459C13.5 13.9486 13.3509 13.6174 12.8475 13.416L10.4098 12.4409C9.34283 12.0142 8.5 11.0614 8.5 9.8541V9.77778C8.5 8.31377 9.68936 7.33904 11 7.07331V6.5C11 5.94772 11.4477 5.5 12 5.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Brand-pink CTA — hugs its contents, 48px tall. */
function PinkCta({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  const clip = useSquircleClip<HTMLButtonElement>({ figmaRadii: 12 });
  return (
    <button type="button" className={styles.pinkCta} ref={clip.ref} style={clip.style} onClick={onClick}>
      {children}
    </button>
  );
}

/**
 * "Select bank" empty state — the Z/Aurora reveal on marketplace chrome:
 * skeleton bank rows (40px squircle flag tile + two pills, no dividers) hold
 * for a beat, a cover gradient fades them down, and the centered message +
 * pink CTA blur/slide in.
 */
function BanksEmptyState({
  reduceMotion,
  title,
  sub,
  cta,
  onAddBank,
}: {
  reduceMotion: boolean;
  title: string;
  sub: string;
  cta: string;
  onAddBank: () => void;
}) {
  const [coverVisible, setCoverVisible] = useState(reduceMotion);
  const [contentVisible, setContentVisible] = useState(reduceMotion);

  useEffect(() => {
    if (reduceMotion) return;
    const coverTimer = window.setTimeout(
      () => setCoverVisible(true),
      EMPTY_INITIAL_DELAY_S * 1000,
    );
    const contentTimer = window.setTimeout(
      () => setContentVisible(true),
      (EMPTY_INITIAL_DELAY_S + EMPTY_CONTENT_STAGGER_S) * 1000,
    );
    return () => {
      window.clearTimeout(coverTimer);
      window.clearTimeout(contentTimer);
    };
  }, [reduceMotion]);

  return (
    <div className={styles.empty}>
      <div className={styles.skeletonList} aria-hidden>
        <SkeletonBankRow titleWidth={96} subWidth={150} />
        <SkeletonBankRow titleWidth={128} subWidth={112} />
        <div
          className={styles.skeletonCover}
          data-visible={coverVisible || undefined}
          style={{ ['--cover-duration' as string]: `${EMPTY_REVEAL_DURATION_S}s` }}
        />
      </div>

      <div className={styles.emptyMessageLayer}>
        <motion.div
          className={styles.emptyMessage}
          initial={reduceMotion ? false : MESSAGE_HIDDEN}
          animate={contentVisible ? MESSAGE_VISIBLE : MESSAGE_HIDDEN}
          transition={motionTransition(undefined, EMPTY_REVEAL_DURATION_S)}
        >
          <div className={styles.emptyText}>
            <p className={styles.emptyTitle}>{title}</p>
            <p className={styles.emptySub}>{sub}</p>
          </div>
          <PinkCta onClick={onAddBank}>{cta}</PinkCta>
        </motion.div>
      </div>
    </div>
  );
}

function SkeletonBankRow({ titleWidth, subWidth }: { titleWidth: number; subWidth: number }) {
  const clip = useSquircleClip<HTMLSpanElement>({ figmaRadii: 10 });
  return (
    <div className={styles.skeletonRow}>
      <span ref={clip.ref} style={clip.style} className={styles.skeletonTile} />
      <span className={styles.skeletonLines}>
        <span className={styles.skeletonPill} style={{ width: titleWidth, height: 14 }} />
        <span className={styles.skeletonPill} style={{ width: subWidth, height: 12 }} />
      </span>
    </div>
  );
}

/** Crypto-row action button — a 36px squircle rect on the secondary fill. */
function RowIconBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  const clip = useSquircleClip<HTMLButtonElement>({ figmaRadii: 10 });
  return (
    <button
      type="button"
      ref={clip.ref}
      style={clip.style}
      className={styles.rowIconBtn}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/** One source row — bare icon (no tile), two lines, inset divider below. */
function SourceRow({
  Icon,
  title,
  sub,
  disabled,
  bordered,
  onClick,
}: {
  Icon: MarketplaceIcon;
  title: string;
  sub: string;
  disabled: boolean;
  bordered: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={styles.row}
      disabled={disabled}
      data-bordered={bordered || undefined}
      onClick={onClick}
    >
      <span className={styles.rowIcon}>
        <Icon size={28} />
      </span>
      <span className={styles.rowLines}>
        <span className={styles.rowTitle}>{title}</span>
        <span className={styles.rowSub}>{sub}</span>
      </span>
      <span className={styles.rowChevron} aria-hidden>
        <IconChevronRightMedium size={20} />
      </span>
    </button>
  );
}
