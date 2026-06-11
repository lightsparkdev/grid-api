'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
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

const STEP_TRANSITION = motionTransition(easeOutSnappy, 0.35);

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

/** "1500.5" → "$1,500.5" (keeps the user's partial decimals while typing). */
function formatTyped(raw: string): string {
  if (!raw) return '$0';
  const [whole, frac] = raw.split('.');
  const grouped = Number(whole || '0').toLocaleString('en-US');
  return frac !== undefined ? `$${grouped}.${frac}` : `$${grouped}`;
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

  // Fresh flow every open.
  useEffect(() => {
    if (open) {
      setStep('source');
      setBack(false);
      setRaw('');
    }
  }, [open]);

  const go = (next: Step, isBack = false) => {
    setBack(isBack);
    setStep(next);
  };

  const press = (key: string) => {
    if (confirming) return;
    if (key === 'del') {
      setRaw((r) => r.slice(0, -1));
      return;
    }
    setRaw((r) => {
      if (key === '.') return r.includes('.') ? r : r === '' ? '0.' : `${r}.`;
      const [whole = '', frac] = r.split('.');
      if (frac !== undefined) return frac.length >= 2 ? r : `${r}${key}`;
      if (whole.length >= 6) return r;
      return `${r}${key}`;
    });
  };

  // Hardware keyboard drives the keypad while the amount step is up.
  useEffect(() => {
    if (!open || step !== 'amount') return;
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === '.') press('.');
      else if (e.key === 'Backspace') press('del');
      else if (e.key === 'Enter' && typedToCents(raw) > 0) go('confirm');
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step, raw, confirming]);

  const cents = typedToCents(raw);
  const canContinue = cents > 0;
  const dismiss = () => {
    if (!confirming) onDismiss();
  };

  // iOS push: forward = in from the right / out to the left; back = reverse.
  const stepIn = back ? { x: -64, opacity: 0 } : { x: 64, opacity: 0 };
  const stepOut = back ? { x: 64, opacity: 0 } : { x: -64, opacity: 0 };

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
              <TextMorph as="span" duration={280} ease={cubicBezierCss(easeOutSwift)}>
                {STEP_TITLES[step]}
              </TextMorph>
            </h2>
          </div>
        </div>

        <div className={styles.steps}>
          <AnimatePresence mode="popLayout" initial={false} custom={back}>
            {step === 'source' && (
              <motion.div
                key="source"
                className={styles.step}
                initial={reduceMotion ? false : stepIn}
                animate={{ x: 0, opacity: 1 }}
                exit={reduceMotion ? { opacity: 0 } : stepOut}
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

            {step === 'amount' && (
              <motion.div
                key="amount"
                className={styles.step}
                initial={reduceMotion ? false : stepIn}
                animate={{ x: 0, opacity: 1 }}
                exit={reduceMotion ? { opacity: 0 } : stepOut}
                transition={STEP_TRANSITION}
              >
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
                        <p className={styles.amountValue}>{formatTyped(raw)}</p>
                        <p className={styles.amountSub}>
                          {formatMxn(raw)}{' '}
                          <SfSymbol name="arrow.up.arrow.down" size={11} />
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

                  <div className={styles.keypad} role="group" aria-label="Amount keypad">
                    {KEYPAD.flat().map((key) => (
                      <button
                        key={key}
                        type="button"
                        className={styles.key}
                        aria-label={key === 'del' ? 'Delete' : key}
                        onClick={() => press(key)}
                      >
                        {key === 'del' ? <SfSymbol name="delete.left" size={22} /> : key}
                      </button>
                    ))}
                  </div>

                  <div className={styles.ctaWrap}>
                    <GlassTextButton
                      variant="primary"
                      onClick={() => canContinue && go('confirm')}
                      className={clsx(!canContinue && styles.ctaDisabled)}
                    >
                      Continue
                    </GlassTextButton>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'confirm' && (
              <motion.div
                key="confirm"
                className={styles.step}
                initial={reduceMotion ? false : stepIn}
                animate={{ x: 0, opacity: 1 }}
                exit={reduceMotion ? { opacity: 0 } : stepOut}
                transition={STEP_TRANSITION}
              >
                <div className={styles.amountLayout}>
                  <div className={styles.cardStack}>
                    <div className={clsx(styles.card, styles.amountCard)}>
                      <div className={styles.sourceRowStatic}>
                        <span className={styles.tile} aria-hidden>
                          <img
                            className={styles.tileIcon}
                            src="/assets/add-money/IconBank.svg"
                            alt=""
                            draggable={false}
                          />
                        </span>
                        <span className={styles.sourceLabels}>
                          <span className={styles.rowTitle}>Banorte</span>
                          <span className={styles.rowSub}>•••• 3872</span>
                        </span>
                      </div>
                      <div className={styles.amountInput}>
                        <p className={styles.amountValue}>{formatUsdCents(cents)}</p>
                        <p className={styles.amountSub}>{formatMxn(raw)}</p>
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

                  <div className={styles.card}>
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

                  <div className={styles.confirmWrap}>
                    <button
                      type="button"
                      className={styles.confirmBtn}
                      onClick={() => !confirming && onConfirm(cents)}
                    >
                      {confirming ? (
                        <span className={styles.spinner} aria-label="Confirming">
                          <IconLoadingCircle size={20} />
                        </span>
                      ) : (
                        <>
                          <SfSymbol name="faceid" size={18} />
                          <span className={styles.confirmLabel}>Confirm</span>
                        </>
                      )}
                    </button>
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
