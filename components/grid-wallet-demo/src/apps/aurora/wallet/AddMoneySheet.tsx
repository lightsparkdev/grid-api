'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion, useAnimate, useReducedMotion } from 'motion/react';
import { IconLoadingCircle } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLoadingCircle';
import { TextMorph } from 'torph/react';
import { BottomSheet } from '@/apps/shared/BottomSheet';
import { PHONE_SHELL_GLASS } from '@/components/liquid-glass';
import { GlassSymbolButton, GlassTextButton, headerGlassBrightness } from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import { useThemeMode } from '@/hooks/useThemeMode';
import { cubicBezierCss, easeOutSnappy, easeOutSwift, motionTransition } from '@/lib/easing';
import styles from './AddMoneySheet.module.scss';

type Step = 'source' | 'amount' | 'confirm';

/** Demo FX — matches the Figma copy (1 MXN = 0.06 USD ⇒ 1 USD ≈ 17.9074 MXN). */
const USD_TO_MXN = 17.9074;

const STEP_TRANSITION = motionTransition(easeOutSnappy, 0.28);
// Card heights/positions re-flow as the keypad leaves (amount ⇄ confirm).
const LAYOUT_TRANSITION = motionTransition(easeOutSnappy, 0.4);
// Keypad ⇄ details swap + CTA crossfade inside the persistent transfer layout.
const SWAP_IN = { opacity: 1, y: 0 };
const SWAP_OUT = { opacity: 0, y: 24 };
const SWAP_TRANSITION = motionTransition(easeOutSnappy, 0.35);
const MORPH_MS = 280;

const STEP_TITLES: Record<Step, string> = {
  source: 'Add money from',
  amount: 'Add money',
  confirm: 'Add money',
};

const SOURCES = [
  {
    id: 'bank',
    icon: '/assets/add-money/IconBank.svg',
    title: 'Bank account',
    sub: 'Local transfer in 65+ countries',
    speed: 'Instant',
  },
  {
    id: 'crypto',
    icon: '/assets/add-money/IconWallet2.svg',
    title: 'Crypto wallet',
    sub: 'Spark, Solana, Base address',
    speed: 'Instant',
  },
  {
    id: 'cashapp',
    icon: '/assets/add-money/IconCash.svg',
    title: 'Cash App',
    sub: 'Use your Cash App balance',
    speed: 'Instant',
  },
  {
    id: 'applepay',
    icon: '/assets/add-money/IconApple.svg',
    title: 'Apple Pay',
    sub: 'Use Apple Wallet',
    speed: 'Instant',
  },
];

const KEYPAD: Array<Array<string>> = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'del'],
];

/**
 * Mirrors the Swift KeypadInputModel.amountDisplay: typed text in primary plus
 * the REMAINING cent placeholders as a dim suffix — "1500." → "$1,500." + "00",
 * "1500.5" → "$1,500.5" + "0". "$0" before typing starts.
 */
function formatTypedParts(raw: string, started: boolean): { primary: string; suffix: string } {
  if (!started || !raw) return { primary: '$0', suffix: '' };
  const [whole, frac] = raw.split('.');
  const grouped = Number(whole || '0').toLocaleString('en-US');
  if (frac !== undefined) {
    return { primary: `$${grouped}.${frac}`, suffix: '0'.repeat(Math.max(0, 2 - frac.length)) };
  }
  return { primary: `$${grouped}`, suffix: '' };
}

/** Typed amount → cents (for the parent's balance/activity bookkeeping). */
export function typedToCents(raw: string): number {
  const n = Number.parseFloat(raw || '0');
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

/** "1500.5" → "$1,500.50" — final formatted USD. */
export function formatUsdCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatMxn(raw: string): string {
  const usd = Number.parseFloat(raw || '0') || 0;
  return `${(usd * USD_TO_MXN).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} MXN`;
}

interface AddMoneySheetProps {
  open: boolean;
  /** Formatted current cash balance, e.g. "$0.00". */
  balance: string;
  /** Face ID running — Confirm shows a spinner and input locks. */
  confirming: boolean;
  onDismiss: () => void;
  /** Confirm tapped with the typed amount (cents). Parent runs Face ID. */
  onConfirm: (cents: number) => void;
}

/**
 * Figma 109:29870 / 2143:39402 / 2143:38851 — the three-step "Add money" sheet:
 * source list → amount entry (custom keypad, typeable) → confirm + Face ID.
 * Solid (non-frosted) near-full-height sheet; steps push right-to-left.
 */
export function AddMoneySheet({
  open,
  balance,
  confirming,
  onDismiss,
  onConfirm,
}: AddMoneySheetProps) {
  const reduceMotion = useReducedMotion();
  const theme = useThemeMode();
  const brightness = headerGlassBrightness(theme);
  const [step, setStep] = useState<Step>('source');
  const [back, setBack] = useState(false); // direction of the last nav
  const [raw, setRaw] = useState(''); // typed amount, e.g. "1500.5"
  const [started, setStarted] = useState(false); // Swift's hasStartedTyping
  const [amountScope, animateAmount] = useAnimate<HTMLParagraphElement>();

  // Fresh flow every open.
  useEffect(() => {
    if (open) {
      setStep('source');
      setBack(false);
      setRaw('');
      setStarted(false);
    }
  }, [open]);

  const go = (next: Step, isBack = false) => {
    setBack(isBack);
    setStep(next);
  };

  // Mirrors the Swift KeypadInputModel.handleKey.
  const press = (key: string) => {
    if (confirming) return;
    if (key === 'del') {
      if (!started) {
        setStarted(true);
        setRaw('');
        return;
      }
      setRaw((r) => r.slice(0, -1));
      return;
    }
    if (key === '.') {
      if (!started) {
        setStarted(true);
        setRaw('0.');
        return;
      }
      setRaw((r) => (r.includes('.') ? r : r === '' ? '0.' : `${r}.`));
      return;
    }
    if (!started) {
      setStarted(true);
      setRaw(key);
      return;
    }
    setRaw((r) => {
      const frac = r.split('.')[1];
      if (frac !== undefined && frac.length >= 2) return r;
      return `${r}${key}`;
    });
  };

  const cents = typedToCents(raw);

  // Continue is always active (Swift parity): an invalid amount errors out with
  // a shake on the amount instead of a disabled button. Curve matches the Swift
  // ShakeEffect (8px x sin over 0.4s linear, three half-cycles).
  const tryContinue = () => {
    if (confirming) return;
    if (cents > 0) {
      go('confirm');
      return;
    }
    if (!reduceMotion && amountScope.current) {
      animateAmount(
        amountScope.current,
        { x: [0, 8, -8, 8, 0] },
        { duration: 0.4, ease: 'linear' },
      );
    }
  };

  // Hardware keyboard drives the keypad while the amount step is up.
  useEffect(() => {
    if (!open || step !== 'amount') return;
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === '.') press('.');
      else if (e.key === 'Backspace') press('del');
      else if (e.key === 'Enter') tryContinue();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step, raw, started, confirming]);

  const dismiss = () => {
    if (!confirming) onDismiss();
  };
  const typedParts = formatTypedParts(raw, started);

  // iOS push: forward = in from the right / out to the left; back = reverse.
  // Variants + `custom` (not inline objects): an EXITING screen never re-renders,
  // so an inline `exit` keeps the stale direction from the previous nav — the
  // AnimatePresence `custom` prop is re-resolved for exiting children instead.
  type NavDir = { back: boolean; reduceMotion: boolean };
  const navDir: NavDir = { back, reduceMotion: !!reduceMotion };
  // TRUE push: the incoming screen shares an edge with the outgoing one (full
  // ±100% travel, simultaneous), and the leaver fades as it exits. The entering
  // screen arrives at full opacity — it's a push, not a crossfade.
  const stepVariants = {
    enter: ({ back: b, reduceMotion: rm }: NavDir) =>
      rm ? { x: 0, opacity: 1 } : { x: b ? '-100%' : '100%', opacity: 1 },
    center: { x: 0, opacity: 1 },
    exit: ({ back: b, reduceMotion: rm }: NavDir) =>
      rm ? { opacity: 0 } : { x: b ? '100%' : '-100%', opacity: 0 },
  };
  // The title is ANCHORED to the content push: same travel (the full screen
  // width, matching the steps' ±100%) and the same transition clock, so title
  // and screen move as one surface. The strip's gradient mask dissolves the
  // text before it reaches the X/back controls.
  const SCREEN_W = 402; // --app-screen-width
  const titleVariants = {
    enter: ({ back: b, reduceMotion: rm }: NavDir) =>
      rm ? { x: 0, opacity: 1 } : { x: b ? -SCREEN_W : SCREEN_W, opacity: 1 },
    center: { x: 0, opacity: 1 },
    exit: ({ back: b, reduceMotion: rm }: NavDir) =>
      rm ? { opacity: 0 } : { x: b ? SCREEN_W : -SCREEN_W, opacity: 0 },
  };

  return (
    <BottomSheet
      open={open}
      onDismiss={dismiss}
      // Flat solid sheet per Figma (no frost, no specular rim — glass stays on
      // the toolbar buttons only). Top radius straight from Figma (38, no 1.2x);
      // shell smoothing so the bottom corners nest concentrically in the screen
      // squircle instead of reading as over-round circles.
      glass={{
        radius: 38,
        cornerSmoothing: PHONE_SHELL_GLASS.cornerSmoothing,
        tint: 'var(--wallet-bg)',
        edge: 'none',
        shadow: '0 15px 37.5px rgba(0, 0, 0, 0.18)',
      }}
    >
      <div className={styles.flow}>
        <div className={styles.toolbar}>
          <div className={styles.toolbarRow}>
            {step === 'source' ? (
              <GlassSymbolButton
                aria-label="Close"
                size={40}
                type="button"
                glass={{ brightness }}
                onClick={dismiss}
              >
                <SfSymbol name="xmark" size={14} />
              </GlassSymbolButton>
            ) : (
              <GlassSymbolButton
                aria-label="Back"
                size={40}
                type="button"
                glass={{ brightness }}
                onClick={() => go(step === 'confirm' ? 'amount' : 'source', true)}
                disabled={confirming}
              >
                <SfSymbol name="chevron.left" size={15} />
              </GlassSymbolButton>
            )}
            <h2 className={styles.title}>
              <AnimatePresence mode="popLayout" initial={false} custom={navDir}>
                <motion.span
                  key={STEP_TITLES[step]}
                  custom={navDir}
                  variants={titleVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={STEP_TRANSITION}
                >
                  {STEP_TITLES[step]}
                </motion.span>
              </AnimatePresence>
            </h2>
          </div>
        </div>

        <div className={styles.steps}>
          <AnimatePresence mode="popLayout" initial={false} custom={navDir}>
            {step === 'source' && (
              <motion.div
                key="source"
                className={styles.step}
                custom={navDir}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={STEP_TRANSITION}
              >
                <div className={styles.sourceWrap}>
                  <div className={clsx(styles.card, styles.cardFlush)}>
                    {SOURCES.map((s, i) => (
                      <button
                        key={s.id}
                        type="button"
                        className={styles.sourceRow}
                        onClick={() => s.id === 'bank' && go('amount')}
                      >
                        <span className={styles.tile} aria-hidden>
                          <img className={styles.tileIcon} src={s.icon} alt="" draggable={false} />
                        </span>
                        <span
                          className={clsx(
                            styles.sourceContent,
                            i < SOURCES.length - 1 && styles.sourceContentBordered,
                          )}
                        >
                          <span className={styles.sourceLabels}>
                            <span className={styles.rowTitle}>{s.title}</span>
                            <span className={styles.rowSub}>{s.sub}</span>
                            <span className={styles.rowSub}>{s.speed}</span>
                          </span>
                          <SfSymbol name="chevron.right" size={14} className={styles.chevron} />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step !== 'source' && (
              <motion.div
                key="transfer"
                className={styles.step}
                custom={navDir}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={STEP_TRANSITION}
              >
                {/* amount ⇄ confirm is ONE persistent layout: the cards and the
                    CTA slot stay mounted (layout-animating as heights re-flow);
                    only the keypad ⇄ details region and the CTA contents swap. */}
                <div className={styles.amountLayout}>
                  <div className={styles.cardStack}>
                    <motion.div
                      layout={!reduceMotion}
                      transition={LAYOUT_TRANSITION}
                      className={clsx(styles.card, styles.amountCard)}
                    >
                      <div className={styles.sourceRowStatic}>
                        <span className={styles.tile} aria-hidden>
                          <img
                            className={styles.flagIcon}
                            src="/assets/add-money/flag-mx.svg"
                            alt=""
                            draggable={false}
                          />
                        </span>
                        <span className={styles.sourceLabels}>
                          <span className={styles.rowTitle}>Banorte (•••• 3872)</span>
                          <span className={styles.rowSub}>MXN bank account</span>
                        </span>
                      </div>
                      <div className={styles.amountInput}>
                        <p ref={amountScope} className={styles.amountValue}>
                          {step === 'amount' ? (
                            <>
                              {typedParts.primary}
                              {typedParts.suffix && (
                                <span className={styles.amountGhost}>{typedParts.suffix}</span>
                              )}
                            </>
                          ) : (
                            formatUsdCents(cents)
                          )}
                        </p>
                        <p className={styles.amountSub}>
                          {formatMxn(raw)}
                          {step === 'amount' && (
                            <SfSymbol name="arrow.up.arrow.down" size={11} />
                          )}
                        </p>
                      </div>
                    </motion.div>
                    <motion.span
                      layout={!reduceMotion}
                      transition={LAYOUT_TRANSITION}
                      className={styles.chevronDisc}
                      aria-hidden
                    >
                      <SfSymbol name="chevron.down" size={14} />
                    </motion.span>
                    <motion.div
                      layout={!reduceMotion}
                      transition={LAYOUT_TRANSITION}
                      className={styles.card}
                    >
                      <div className={styles.sourceRowStatic}>
                        <span className={styles.tile} aria-hidden>
                          <img
                            className={styles.tileIcon}
                            src="/assets/add-money/IconDollar.svg"
                            alt=""
                            draggable={false}
                          />
                        </span>
                        <span className={styles.sourceLabels}>
                          <span className={styles.rowTitle}>Cash balance</span>
                          <span className={styles.rowSub}>{balance}</span>
                        </span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Keypad ⇄ details card swap (popLayout so the leaver doesn't
                      hold its space while the cards re-flow). */}
                  <AnimatePresence mode="popLayout" initial={false}>
                    {step === 'amount' ? (
                      <motion.div
                        key="keypad"
                        layout={!reduceMotion}
                        className={styles.keypad}
                        role="group"
                        aria-label="Amount keypad"
                        initial={reduceMotion ? false : SWAP_OUT}
                        animate={SWAP_IN}
                        exit={reduceMotion ? { opacity: 0 } : SWAP_OUT}
                        transition={SWAP_TRANSITION}
                      >
                        {KEYPAD.flat().map((key) => (
                          <button
                            key={key}
                            type="button"
                            className={styles.key}
                            aria-label={key === 'del' ? 'Delete' : key}
                            onClick={() => press(key)}
                          >
                            {key === 'del' ? <SfSymbol name="delete.left" size={24} /> : key}
                          </button>
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="details"
                        layout={!reduceMotion}
                        className={clsx(styles.card, styles.detailsCard)}
                        initial={reduceMotion ? false : SWAP_OUT}
                        animate={SWAP_IN}
                        exit={reduceMotion ? { opacity: 0 } : SWAP_OUT}
                        transition={SWAP_TRANSITION}
                      >
                        <div className={styles.detailRows}>
                          <div className={clsx(styles.detailRow, styles.detailRowBordered)}>
                            <span className={styles.detailLabel}>Fee</span>
                            <span className={styles.detailValue}>$0.60</span>
                          </div>
                          <div className={clsx(styles.detailRow, styles.detailRowBordered)}>
                            <span className={styles.detailLabel}>Conversion rate</span>
                            <span className={styles.detailValue}>1 MXN = 0.06 USD</span>
                          </div>
                          <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Arrives</span>
                            <span className={styles.detailValue}>Instantly</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Persistent CTA — ONE button across both steps (same dark
                      pill style); the label morphs and the Face ID glyph fades
                      in on confirm. */}
                  <motion.div
                    layout={!reduceMotion}
                    transition={LAYOUT_TRANSITION}
                    className={styles.ctaWrap}
                  >
                    <GlassTextButton
                      variant="primary"
                      onClick={() =>
                        step === 'amount' ? tryContinue() : !confirming && onConfirm(cents)
                      }
                    >
                      {confirming ? (
                        <span className={styles.spinner} aria-label="Confirming">
                          <IconLoadingCircle size={20} />
                        </span>
                      ) : (
                        <span className={styles.ctaInner}>
                          <AnimatePresence initial={false}>
                            {step === 'confirm' && (
                              <motion.span
                                key="faceid"
                                className={styles.ctaIcon}
                                initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.6 }}
                                transition={SWAP_TRANSITION}
                              >
                                <SfSymbol name="faceid" size={18} />
                              </motion.span>
                            )}
                          </AnimatePresence>
                          <TextMorph
                            as="span"
                            duration={MORPH_MS}
                            ease={cubicBezierCss(easeOutSwift)}
                          >
                            {step === 'amount' ? 'Continue' : 'Confirm'}
                          </TextMorph>
                        </span>
                      )}
                    </GlassTextButton>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </BottomSheet>
  );
}
