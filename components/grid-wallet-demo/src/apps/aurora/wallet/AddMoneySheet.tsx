'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion, useAnimate, useReducedMotion } from 'motion/react';
import { IconLoadingCircle } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLoadingCircle';
import { TextMorph } from 'torph/react';
import { BottomSheet } from '@/apps/shared/BottomSheet';
import NumericText from '@/components/NumericText';
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
/** Fake quote-creation beat: Continue spins this long before the confirm step. */
const QUOTE_MS = 750;
// Small element swaps (CTA glyph, etc.) inside the persistent transfer layout.
const SWAP_TRANSITION = motionTransition(easeOutSnappy, 0.35);
const MORPH_MS = 280;

// Keypad ⇄ details swap by REAL height (no transform-based layout animation):
// the leaver collapses to 0 while the arriver expands from 0, so the cards above
// grow through genuine per-frame layout — centered content SLIDES, nothing pops.
const REGION_ENTER = {
  height: 'auto' as const,
  opacity: 1,
  filter: 'blur(0px)',
  transition: {
    height: motionTransition(easeOutSnappy, 0.32),
    opacity: motionTransition(easeOutSnappy, 0.26, { delay: 0.06 }),
    filter: motionTransition(easeOutSnappy, 0.26, { delay: 0.06 }),
  },
};
const REGION_EXIT = {
  height: 0,
  opacity: 0,
  filter: 'blur(6px)',
  transition: {
    height: motionTransition(easeOutSnappy, 0.32),
    opacity: motionTransition(easeOutSnappy, 0.2),
    filter: motionTransition(easeOutSnappy, 0.2),
  },
};
const REGION_HIDDEN = { height: 0, opacity: 0, filter: 'blur(6px)' };

const STEP_TITLES: Record<Step, string> = {
  source: 'Add money from',
  amount: 'Enter amount',
  confirm: 'Confirm add',
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

/** NumericText needs vertical blur room, but the iOS default (0.35em) inflates
 *  the line box; the wallet doesn't clip, so a slim pad keeps layout tight. */
const NUMERIC_PAD = { padding: '0.08em 0' };

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
  const [quoting, setQuoting] = useState(false); // fake quote beat on Continue
  const quoteTimer = useRef(0);
  const [amountScope, animateAmount] = useAnimate<HTMLParagraphElement>();

  // Fresh flow every open.
  useEffect(() => {
    if (open) {
      setStep('source');
      setBack(false);
      setRaw('');
      setStarted(false);
      setQuoting(false);
      window.clearTimeout(quoteTimer.current);
    }
  }, [open]);
  useEffect(() => () => window.clearTimeout(quoteTimer.current), []);

  const go = (next: Step, isBack = false) => {
    setBack(isBack);
    setStep(next);
  };

  // Swift's ShakeEffect (8px x sin over 0.4s linear, three half-cycles) —
  // invalid amount on Continue, or a keypress past the cap.
  const shakeAmount = () => {
    if (reduceMotion || !amountScope.current) return;
    animateAmount(
      amountScope.current,
      { x: [0, 8, -8, 8, 0] },
      { duration: 0.4, ease: 'linear' },
    );
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
    const frac = raw.split('.')[1];
    if (frac !== undefined && frac.length >= 2) return;
    const next = `${raw}${key}`;
    // Cap below $1M (6 whole digits) — reject with the error shake.
    if (next.split('.')[0].length > 6) {
      shakeAmount();
      return;
    }
    setRaw(next);
  };

  const cents = typedToCents(raw);

  // Continue is always active (Swift parity): an invalid amount errors out with
  // a shake on the amount instead of a disabled button. A valid amount "creates
  // a quote": the CTA spins for a beat before the confirm step.
  const tryContinue = () => {
    if (confirming || quoting) return;
    if (cents > 0) {
      setQuoting(true);
      window.clearTimeout(quoteTimer.current);
      quoteTimer.current = window.setTimeout(() => {
        setQuoting(false);
        go('confirm');
      }, QUOTE_MS);
      return;
    }
    shakeAmount();
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
      // Typing consumes the key globally — drop any stale click-focus so the
      // keystroke doesn't promote a :focus-visible ring on the last-clicked
      // control. Real Tab navigation is untouched (Tab falls through above).
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step, raw, started, confirming]);

  const dismiss = () => {
    if (!confirming) onDismiss();
  };

  // Swift's lineLimit(1).minimumScaleFactor(0.5): shrink the big amount to fit
  // its row instead of bleeding off the card. scrollWidth ignores the transform,
  // so the measurement is always the natural (unscaled) width. A ResizeObserver
  // (not a keypress effect) drives it: NumericText animates each new digit's
  // column width in, so the natural width only settles after the keypress.
  const fitRef = useRef<HTMLSpanElement>(null);
  const [fit, setFit] = useState(1);
  useLayoutEffect(() => {
    const el = fitRef.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    const measure = () => {
      const natural = el.scrollWidth;
      const avail = parent.clientWidth - 32; // breathing room off the card edges
      setFit(natural > avail ? Math.max(0.5, avail / natural) : 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [step]);

  // Amount-entry decimals for NumericText: hidden until the user types the dot
  // ("1500" → "$1,500"); then typed digits solid + remaining placeholders dim
  // ("1500." → "$1,500." + ghost "00"). Confirm renders the full cents solid —
  // ghosts ink in via color; a missing ".00" slides in numericText-style.
  const hasDot = raw.includes('.');
  const fracTyped = raw.split('.')[1] ?? '';
  const amountFraction =
    step === 'confirm'
      ? { hasDot: true, typed: String(cents % 100).padStart(2, '0'), ghost: '' }
      : {
          hasDot,
          typed: fracTyped,
          ghost: hasDot ? '0'.repeat(Math.max(0, 2 - fracTyped.length)) : '',
        };

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
      // Flat solid sheet per Figma (no frost, no glassy glint — glass stays on
      // the toolbar buttons only). Top radius straight from Figma (38, no 1.2x);
      // shell smoothing so the bottom corners nest concentrically in the screen
      // squircle. The uniform hairline edge (themed: transparent on light, white
      // 10% on dark) rides FrostPanel's squircle path so corners match exactly.
      glass={{
        radius: 38,
        cornerSmoothing: PHONE_SHELL_GLASS.cornerSmoothing,
        tint: 'var(--wallet-bg)',
        edge: 'var(--sheet-flat-edge)',
        edgeGlint: false,
        edgeWidth: 0.5,
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
              {/* Slides only across the source ⇄ transfer boundary (shared key
                  inside transfer); amount ⇄ confirm torph-morphs in place. */}
              <AnimatePresence mode="popLayout" initial={false} custom={navDir}>
                <motion.span
                  key={step === 'source' ? 'source' : 'transfer'}
                  custom={navDir}
                  variants={titleVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={STEP_TRANSITION}
                >
                  {step === 'source' ? (
                    STEP_TITLES.source
                  ) : (
                    <TextMorph
                      as="span"
                      duration={MORPH_MS}
                      ease={cubicBezierCss(easeOutSwift)}
                    >
                      {STEP_TITLES[step]}
                    </TextMorph>
                  )}
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
                    <div className={clsx(styles.card, styles.amountCard)}>
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
                          <span
                            ref={fitRef}
                            className={styles.amountFit}
                            style={{ transform: `scale(${fit})` }}
                          >
                            <NumericText
                              value={cents / 100}
                              format={{ style: 'currency', currency: 'USD' }}
                              fraction={amountFraction}
                              ghostClassName={styles.amountGhost}
                              style={NUMERIC_PAD}
                            />
                          </span>
                        </p>
                        <p className={styles.amountSub}>
                          <NumericText
                            value={(cents / 100) * USD_TO_MXN}
                            format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                            style={NUMERIC_PAD}
                          />
                          {'\u00A0MXN'}
                          {step === 'amount' && (
                            <SfSymbol name="arrow.up.arrow.down" size={11} />
                          )}
                        </p>
                      </div>
                    </div>
                    <span className={styles.chevronDisc} aria-hidden>
                      <SfSymbol name="chevron.down" size={14} />
                    </span>
                    <div className={styles.card}>
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
                    </div>
                  </div>

                  {/* Keypad ⇄ details card swap — REAL height animation (see
                      REGION_* above): both stay in flow, the leaver collapses
                      while the arriver expands, and the cards above grow through
                      genuine layout so their content slides instead of popping. */}
                  <AnimatePresence initial={false}>
                    {step === 'amount' ? (
                      <motion.div
                        key="keypad"
                        className={styles.swapRegion}
                        initial={reduceMotion ? false : REGION_HIDDEN}
                        animate={REGION_ENTER}
                        exit={reduceMotion ? { height: 0, opacity: 0 } : REGION_EXIT}
                      >
                        <div className={styles.keypad} role="group" aria-label="Amount keypad">
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
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="details"
                        className={styles.swapRegion}
                        initial={reduceMotion ? false : REGION_HIDDEN}
                        animate={REGION_ENTER}
                        exit={reduceMotion ? { height: 0, opacity: 0 } : REGION_EXIT}
                      >
                        <div className={clsx(styles.card, styles.detailsCard)}>
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
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Persistent CTA — ONE button across both steps; the label
                      morphs and the Face ID glyph fades in on confirm. It rides
                      the real layout as the region above changes height. */}
                  <div className={styles.ctaWrap}>
                    <GlassTextButton
                      variant="primary"
                      onClick={() =>
                        step === 'amount' ? tryContinue() : !confirming && onConfirm(cents)
                      }
                    >
                      {confirming || quoting ? (
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
                                // Width + spacing animate too — otherwise the
                                // unmount frees the icon's space in one frame
                                // and the label snaps left on the last frame.
                                initial={
                                  reduceMotion
                                    ? false
                                    : { opacity: 0, scale: 0.6, width: 0, marginRight: 0 }
                                }
                                animate={{ opacity: 1, scale: 1, width: 18, marginRight: 6 }}
                                exit={{ opacity: 0, scale: 0.6, width: 0, marginRight: 0 }}
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
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </BottomSheet>
  );
}
