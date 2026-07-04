'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion, useAnimate, useReducedMotion } from 'motion/react';
import { IconLoadingCircle } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLoadingCircle';
import { IconMagnifyingGlass } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconMagnifyingGlass';
// QR uses the radius-1 (tight-corner) variant so the code squares read crisp.
import { IconQrCode } from '@central-icons-react/round-outlined-radius-1-stroke-1.5/IconQrCode';
import { IconSquareBehindSquare6 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSquareBehindSquare6';
import { IconCheckmark2Small } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark2Small';
import { IconArrowOutOfBox } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowOutOfBox';
// Creator source-row icons use the 0px-corner-radius central set (sharp corners),
// unlike Aurora's rounded asset SVGs / radius-3 glyphs.
import { IconBank } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconBank';
import { IconCash } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconCash';
import { IconWallet1 } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconWallet1';
import { IconApple } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconApple';
// Sheet toolbar icon buttons — central glyphs (24px) matching the auth sheet's X.
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconCrossMedium';
import { IconChevronLeftMedium } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconChevronLeftMedium';
import { IconPlusMedium } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconPlusMedium';
import { IconArrowsAllSides2 } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconArrowsAllSides2';
import { TextMorph } from 'torph/react';
import { BottomSheet } from '@/apps/shared/BottomSheet';
import { ContentAreaButton } from '@/apps/shared/ContentAreaButton';
import NumericText from '@/components/NumericText';
import { FrostPanel, PHONE_SHELL_GLASS } from '@/components/liquid-glass';
import { PrimaryButton } from '../blocks/PrimaryButton';
import { SheetIconButton } from '../blocks/SheetIconButton';
import { CREATOR_STACKED_SHEET_DURATION } from '../config';
import { SHEET_GLASS } from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import { cubicBezierCss, easeOutSnappy, easeOutSwift, motionTransition } from '@/lib/easing';
import { randomNetworkAddress } from '@/lib/cryptoAddresses';
import { currencyFor, type BankCountry } from '@/data/bankCountries';
import { BANK_ACCOUNT_SCHEMAS } from '@/data/bankAccountFields.generated';
import {
  formatUsdCents,
  truncateAddress,
  typedToCents,
  initials,
  SEND_DEMO_ADDRESS,
  KEYPAD,
  DEPOSIT_CHAINS,
  SEND_NETWORKS,
  DEFAULT_SEND_NETWORK,
  accountLast4,
  fieldLabel,
  receiveFields,
  type MoneySheet,
  type Step,
  type SavedBank,
  type CryptoRecipient,
  type SavedRecipient,
  type SendNetwork,
  type MoneySheetMode,
  type ReceivedPayment,
  type TransferActivity,
} from '@/apps/shared/wallet';
import { WalletListSection } from './WalletListSection';
import { Flag } from '@/apps/shared/Flag';
import styles from './AddMoneySheet.module.scss';

/** Creator source-row icons by source id — the radius-0 central glyphs override
 *  the shared sheet's asset SVGs / radius-3 glyphs (this skin renders bare,
 *  secondary-toned icons rather than Aurora's filled tiles). */
// Add-money source visuals — Creator owns the icon + copy per source id; the brain
// supplies only the ordered ids + routing.
const CREATOR_SOURCE_META: Record<
  string,
  { Icon: typeof IconBank; title: string; sub: string; speed: string }
> = {
  bank: { Icon: IconBank, title: 'Bank account', sub: 'Local transfer in 65+ countries', speed: 'Instant' },
  crypto: { Icon: IconWallet1, title: 'Crypto wallet', sub: 'Spark, Solana, Base address', speed: 'Instant' },
  cashapp: { Icon: IconCash, title: 'Cash App', sub: 'Use your Cash App balance', speed: 'Instant' },
  applepay: { Icon: IconApple, title: 'Apple Pay', sub: 'Use Apple Wallet', speed: 'Instant' },
};

/** Name-led recipient avatar — first+last initials with the country flag badged
 *  in the bottom-right corner. Used by the send flow's recipient rows. */
function RecipientAvatar({ name, code }: { name: string; code: string }) {
  return (
    <span className={styles.recipientAvatar} aria-hidden>
      <span className={styles.recipientInitials}>{initials(name)}</span>
      <span className={styles.recipientFlag}>
        <Flag code={code} size={16} />
      </span>
    </span>
  );
}

/** One labeled account-form input (or a select for enum fields like pixKeyType). */
function FormField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options?: string[];
}) {
  return (
    <label className={styles.formField}>
      <span className={styles.formLabel}>{label}</span>
      {options ? (
        <select className={styles.formInput} value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          className={styles.formInput}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

/** One country row in the picker (flag tile + name + currency + chevron),
 *  shared by the Popular / All / search-result lists. */
function CountryPickRow({
  country,
  bordered,
  onSelect,
}: {
  country: BankCountry;
  bordered: boolean;
  onSelect: (c: BankCountry) => void;
}) {
  return (
    <button type="button" className={styles.sourceRow} onClick={() => onSelect(country)}>
      <span className={styles.tile} aria-hidden>
        <Flag code={country.code} size={24} />
      </span>
      <span className={clsx(styles.sourceContent, bordered && styles.sourceContentBordered)}>
        <span className={styles.sourceLabels}>
          <span className={styles.rowTitle}>{country.name}</span>
          <span className={styles.rowSub}>
            {currencyFor(country)}
          </span>
        </span>
        <SfSymbol name="chevron.right" size={14} className={styles.chevron} />
      </span>
    </button>
  );
}

const STEP_TRANSITION = motionTransition(easeOutSnappy, 0.28);
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

/** NumericText needs vertical blur room, but the iOS default (0.35em) inflates
 *  the line box; the wallet doesn't clip, so a slim pad keeps layout tight. */
const NUMERIC_PAD = { padding: '0.08em 0' };

interface AddMoneySheetProps {
  /** The money-sheet brain — hosted above the skin (survives skin switches);
   *  this face only reads it and renders. */
  m: MoneySheet;
  open: boolean;
  /** Direction of the flow — flips titles, source rows, card order, and copy. */
  mode: MoneySheetMode;
  /** Face ID running — Confirm shows a spinner and input locks. */
  confirming: boolean;
  /** Confirm tapped with the typed amount (cents). Parent runs Face ID.
   *  `activity` carries the real destination for the Activity row + toast. */
  onConfirm: (cents: number, activity: TransferActivity) => void;
  /** Receive flow: Share/Copy fired a (simulated) inbound payment. */
  onReceive?: (payment: ReceivedPayment) => void;
}

/**
 * Figma 109:29870 / 2143:39402 / 2143:38851 — the three-step "Add money" sheet:
 * source list → amount entry (custom keypad, typeable) → confirm + Face ID.
 * Solid (non-frosted) near-full-height sheet; steps push right-to-left.
 * `mode="withdraw"` reuses the whole flow in reverse: bank-only destinations,
 * balance card on top, and an over-balance check on Continue.
 * `mode="send"` (Figma 109:28547) adds a recipient step between source and
 * amount — address paste card + contacts — and runs in USDC at 1:1.
 */
export function AddMoneySheet({
  m,
  open,
  mode,
  confirming,
  onConfirm,
  onReceive,
}: AddMoneySheetProps) {
  const reduceMotion = useReducedMotion();
  // The amount paragraph animates a shake on an invalid attempt; the ref + the
  // animation stay in the view (DOM-coupled). The hook signals via shakeNonce.
  const [amountScope, animateAmount] = useAnimate<HTMLParagraphElement>();

  const {
    titles,
    sources,
    activeSources,
    details,
    isSend,
    step,
    setStep,
    back,
    openKey,
    go,
    backFrom,
    isEntryStep,
    raw,
    started,
    cents,
    balance,
    press,
    useMax,
    tryContinue,
    quoting,
    shakeNonce,
    feeCents,
    fxRate,
    fxFractionDigits,
    fxLabel,
    localCurrency,
    cryptoCurrency,
    isBtcDest,
    stablecoinDest,
    confirmDetails,
    activityForConfirm,
    banks,
    selected,
    selectedBank,
    selectedCrypto,
    setCryptoDest,
    selectedBankId,
    setSelectedBankId,
    selectBank,
    saving,
    addBank,
    addCryptoRecipient,
    useCryptoWithdraw,
    countryQuery,
    setCountryQuery,
    countryQ,
    allCountries,
    popularCountries,
    filteredCountries,
    pickedCountry,
    pickCountry,
    openAddBank,
    formValues,
    setFormValues,
    formBeneficiary,
    setFormBeneficiary,
    updateField,
    pasted,
    setPasted,
    pastedAddress,
    setPastedAddress,
    pickerOpen,
    setPickerOpen,
    pickedNetwork,
    setPickedNetwork,
    pickNetwork,
    copiedChainId,
    copyValue,
    shareFunding,
    shareFundingAndReceive,
    dismiss,
  } = m;

  // Shake the amount on an invalid attempt — the hook bumps shakeNonce.
  useEffect(() => {
    if (shakeNonce === 0 || reduceMotion || !amountScope.current) return;
    animateAmount(amountScope.current, { x: [0, 8, -8, 8, 0] }, { duration: 0.28, ease: 'linear' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shakeNonce]);

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

  // Keypad ⇄ details swap: tween each region to its MEASURED height (offsetHeight
  // + margin) instead of height:auto. Motion's auto enter measures short of the
  // content's trailing padding/margin, then settles to the true height — a snap
  // at the end of the transition. Measuring on mount (deferred one frame so
  // framer reads a target update, not an adoption) is the auth sheet's fix.
  const [keypadH, setKeypadH] = useState<number | null>(null);
  const [detailsH, setDetailsH] = useState<number | null>(null);
  const measureKeypad = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    requestAnimationFrame(() => {
      if (!el.isConnected) return;
      const mb = parseFloat(getComputedStyle(el).marginBottom) || 0;
      setKeypadH(el.offsetHeight + mb);
    });
  }, []);
  const measureDetails = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    requestAnimationFrame(() => {
      if (!el.isConnected) return;
      const mb = parseFloat(getComputedStyle(el).marginBottom) || 0;
      setDetailsH(el.offsetHeight + mb);
    });
  }, []);

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

  // Amount-step cards: bank ⇄ cash balance. The TOP card is the money's source
  // (bank when adding, balance when withdrawing) and carries the amount input;
  // the bottom card is the destination — so the rows swap slots with the mode.
  const bankRow = (
    <div className={styles.sourceRowStatic}>
      <span className={styles.tile} aria-hidden>
        {selectedBank ? (
          <Flag code={selectedBank.country.code} size={24} />
        ) : (
          <img className={styles.flagIcon} src="/assets/add-money/flag-mx.svg" alt="" draggable={false} />
        )}
      </span>
      <span className={styles.sourceLabels}>
        <span className={styles.rowTitle}>
          {selectedBank
            ? `${selectedBank.bankName} (•••• ${accountLast4(selectedBank.values)})`
            : 'Bank account'}
        </span>
        <span className={styles.rowSub}>{localCurrency} bank account</span>
      </span>
    </div>
  );
  const balanceRow = (
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
      {/* Figma 109:29074 — small "Use max" chip on balance-sourced outflows
          (withdraw/send); fades out (row persists) on the push to confirm. */}
      {mode !== 'add' && (
        <AnimatePresence initial={false}>
          {step === 'amount' && (
            <motion.span
              key="use-max"
              className={styles.useMax}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={SWAP_TRANSITION}
            >
              <ContentAreaButton variant="secondary" size="small" onClick={useMax}>
                Use max
              </ContentAreaButton>
            </motion.span>
          )}
        </AnimatePresence>
      )}
    </div>
  );

  // Figma 109:28983 — the pasted destination on the send amount step.
  const recipientRow = (
    <div className={styles.sourceRowStatic}>
      <span className={styles.tile} aria-hidden>
        <img
          className={styles.depositLogo}
          src={selectedCrypto?.logo ?? DEFAULT_SEND_NETWORK.logo}
          alt=""
          draggable={false}
        />
      </span>
      <span className={styles.sourceLabels}>
        <span className={styles.rowTitle}>
          {truncateAddress(selectedCrypto?.address ?? SEND_DEMO_ADDRESS)}
        </span>
        <span className={styles.rowSub}>{selectedCrypto?.network ?? 'Solana'} wallet</span>
      </span>
    </div>
  );
  // Send-to-bank destination: the recipient, name-led (initials avatar + their
  // bank) — distinct from withdraw's bank-led row (your own account).
  const recipientBankRow = selectedBank ? (
    <div className={styles.sourceRowStatic}>
      <RecipientAvatar name={selectedBank.beneficiary} code={selectedBank.country.code} />
      <span className={styles.sourceLabels}>
        <span className={styles.rowTitle}>{selectedBank.beneficiary}</span>
        <span className={styles.rowSub}>
          {selectedBank.bankName} •••• {accountLast4(selectedBank.values)}
        </span>
      </span>
    </div>
  ) : null;

  // Bottom card = destination: add → your balance; withdraw → your bank; send →
  // the recipient's bank (name-led) or, for a crypto send, the address.
  const bottomRow =
    mode === 'add'
      ? balanceRow
      : mode === 'withdraw'
        ? selectedCrypto
          ? recipientRow
          : bankRow
        : selectedBank
          ? recipientBankRow
          : recipientRow;

  // iOS push: forward = in from the right / out to the left; back = reverse.
  // Variants + `custom` (not inline objects): an EXITING screen never re-renders,
  // so an inline `exit` keeps the stale direction from the previous nav — the
  // AnimatePresence `custom` prop is re-resolved for exiting children instead.
  type NavDir = { back: boolean; reduceMotion: boolean };
  const navDir: NavDir = { back, reduceMotion: !!reduceMotion };
  // Creator-only title overrides matching the wallet-home buttons (Deposit /
  // Withdraw / Transfer): the source step reads "Deposit via" / "Withdraw via"
  // and the confirm step "Confirm deposit", rather than the shared "Add money
  // from" / "Withdraw to" / "Confirm add".
  const creatorTitle =
    mode === 'add'
      ? step === 'source'
        ? 'Deposit via'
        : step === 'confirm'
          ? 'Confirm deposit'
          : null
      : mode === 'withdraw' && step === 'source'
        ? 'Withdraw via'
        : null;
  // The funding-details step titles itself with the picked country's name (e.g.
  // "Mexico"); every other step uses the mode's static step title.
  const displayTitle =
    step === 'fundingDetails' && pickedCountry
      ? `Receive from ${pickedCountry.name}`
      : (creatorTitle ?? titles[step]);
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
    <>
    <BottomSheet
      open={open}
      onDismiss={dismiss}
      // Slower slide for the stacked-sheet presentation — shares one constant with
      // the PresentationStage transition so the scale recedes in lockstep.
      duration={CREATOR_STACKED_SHEET_DURATION}
      // Flat solid sheet per Figma (no frost, no glassy glint — glass stays on
      // the toolbar buttons only). 24px top corners to unify with the auth /
      // Send-Receive sheets; shell smoothing so the bottom corners nest
      // concentrically in the screen squircle. The uniform hairline edge (themed:
      // transparent on light, white 10% on dark) rides FrostPanel's squircle path.
      glass={{
        radius: 24,
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
            {isEntryStep ? (
              <SheetIconButton
                aria-label="Close"
                size={40}
                type="button"
                ghost
                onClick={dismiss}
              >
                <IconCrossMedium size={24} />
              </SheetIconButton>
            ) : (
              <SheetIconButton
                aria-label="Back"
                size={40}
                type="button"
                ghost
                onClick={() => go(backFrom[step] ?? 'source', true)}
                disabled={confirming}
              >
                <IconChevronLeftMedium size={24} />
              </SheetIconButton>
            )}
            <h2 className={styles.title}>
              {/* Slides at every screen boundary except amount ⇄ confirm, which
                  share the persistent transfer layout and torph-morph in place.
                  Default (sync) presence, NOT popLayout — the spans stack in the
                  strip's single-cell grid, and popLayout skipped the leaver's
                  exit whenever the arriving screen set state mid-mount (the
                  recipient step's card measurements; see the steps host). */}
              <AnimatePresence key={openKey} initial={false} custom={navDir}>
                <motion.span
                  // Keyed by TEXT (not step): adjacent steps sharing a title
                  // ("Send to" source → recipient) keep one span — no slide for
                  // an unchanged title. amount ⇄ confirm share 'transfer' and
                  // morph between their differing titles instead.
                  key={step === 'amount' || step === 'confirm' ? 'transfer' : displayTitle}
                  custom={navDir}
                  variants={titleVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={STEP_TRANSITION}
                >
                  {step === 'amount' || step === 'confirm' ? (
                    <TextMorph
                      as="span"
                      duration={MORPH_MS}
                      ease={cubicBezierCss(easeOutSwift)}
                    >
                      {titles[step]}
                    </TextMorph>
                  ) : (
                    displayTitle
                  )}
                </motion.span>
              </AnimatePresence>
            </h2>
            {/* Figma 109:28547 — glass QR scan button, recipient step only.
                Blur-fades between steps, the wallet home header language. */}
            <AnimatePresence initial={false}>
              {step === 'recipient' && (
                <motion.span
                  key="qr"
                  className={styles.toolbarTrailing}
                  initial={reduceMotion ? false : { opacity: 0, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(10px)' }}
                  transition={SWAP_TRANSITION}
                >
                  <SheetIconButton
                    aria-label="Scan QR code"
                    size={40}
                    type="button"
                    ghost
                  >
                    <IconArrowsAllSides2 size={24} />
                  </SheetIconButton>
                </motion.span>
              )}
              {/* Glass + on the saved-banks step — the entry point to add one. */}
              {step === 'banks' && (
                <motion.span
                  key="addbank"
                  className={styles.toolbarTrailing}
                  initial={reduceMotion ? false : { opacity: 0, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(10px)' }}
                  transition={SWAP_TRANSITION}
                >
                  <SheetIconButton
                    aria-label={isSend ? 'Add recipient' : 'Add bank account'}
                    size={40}
                    type="button"
                    ghost
                    onClick={openAddBank}
                  >
                    <IconPlusMedium size={24} />
                  </SheetIconButton>
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className={styles.steps} key={openKey}>
          {/* Default (sync) presence, NOT popLayout: the steps are absolutely
              positioned (.step), so the exit needs no layout pop — and popLayout
              skipped the outgoing screen whenever the incoming one mounted a
              component that set state in a callback ref / layout effect during
              the same commit (the recipient step's WalletListCard squircle +
              corner measurements), leaving only the enter half of the push. */}
          <AnimatePresence initial={false} custom={navDir}>
            {/* Receive — deposit list: bank drill-in first, then crypto address
                rows (copy works, QR is a no-op), grouped like the source list. */}
            {step === 'deposit' && (
              <motion.div
                key="deposit"
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
                    {/* Receive leads with the bank drill-in; add-from-crypto is
                        crypto-only (bank is its own row in the add source list). */}
                    {mode === 'receive' && (
                      <button type="button" className={styles.sourceRow} onClick={openAddBank}>
                        <span className={styles.tile} aria-hidden>
                          <IconBank size={24} className={styles.tileGlyph} />
                        </span>
                        <span className={clsx(styles.sourceContent, styles.sourceContentBordered)}>
                          <span className={styles.sourceLabels}>
                            <span className={styles.rowTitle}>Bank account</span>
                            <span className={styles.rowSub}>Local transfer in 65+ countries</span>
                            <span className={styles.rowSub}>Instant</span>
                          </span>
                          <SfSymbol name="chevron.right" size={14} className={styles.chevron} />
                        </span>
                      </button>
                    )}
                    {DEPOSIT_CHAINS.map((chain, i) => {
                      const copied = copiedChainId === chain.id;
                      return (
                        <div key={chain.id} className={styles.depositCryptoRow}>
                          <span className={styles.tile} aria-hidden>
                            <img
                              className={styles.depositLogo}
                              src={chain.logo}
                              alt=""
                              draggable={false}
                            />
                          </span>
                          <span
                            className={clsx(
                              styles.sourceContent,
                              i < DEPOSIT_CHAINS.length - 1 && styles.sourceContentBordered,
                            )}
                          >
                            <span className={styles.sourceLabels}>
                              <span className={styles.rowTitle}>{chain.name}</span>
                              <span className={styles.rowSub}>{truncateAddress(chain.address)}</span>
                              <span className={styles.rowSub}>{chain.time}</span>
                            </span>
                            {/* Copy + QR button group (replaces the chevron). */}
                            <span className={styles.depositActions}>
                              <button
                                type="button"
                                className={styles.rowIconBtn}
                                aria-label={copied ? 'Copied' : `Copy ${chain.name} address`}
                                onClick={() => {
                                  copyValue(chain.id, chain.address);
                                  // Copying a deposit address simulates funds
                                  // landing on that chain a beat later — a payment
                                  // (Receive) or a top-up (Add from crypto). The
                                  // parent frames it by the sheet's mode.
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
                              </button>
                              {/* QR is a visual affordance only (no-op) for the demo. */}
                              <button
                                type="button"
                                className={styles.rowIconBtn}
                                aria-label={`Show ${chain.name} QR code`}
                              >
                                <IconQrCode size={20} />
                              </button>
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Receive — the picked country's inbound funding instructions. */}
            {step === 'fundingDetails' && pickedCountry && (
              <motion.div
                key="fundingDetails"
                className={styles.step}
                custom={navDir}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={STEP_TRANSITION}
              >
                <div className={styles.fundingScroll}>
                  <div className={clsx(styles.card, styles.detailsCard)}>
                    <div className={styles.detailRows}>
                      {receiveFields(pickedCountry, formBeneficiary).map(([label, value], i, arr) => {
                        const id = `fd-${label}`;
                        const copied = copiedChainId === id;
                        return (
                          <div
                            key={label}
                            className={clsx(
                              styles.detailRow,
                              i < arr.length - 1 && styles.detailRowBordered,
                            )}
                          >
                            <span className={styles.detailLabel}>{label}</span>
                            <span className={styles.fundingValueWrap}>
                              <span className={styles.fundingValue}>{value}</span>
                              <button
                                type="button"
                                className={styles.rowIconBtn}
                                aria-label={copied ? 'Copied' : `Copy ${label}`}
                                onClick={() => copyValue(id, value)}
                              >
                                {copied ? (
                                  <IconCheckmark2Small size={20} />
                                ) : (
                                  <IconSquareBehindSquare6 size={20} />
                                )}
                              </button>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <p className={styles.fundingNote}>
                    Share these details with anyone paying you
                  </p>
                </div>
                <div className={styles.bottomCtaWrap}>
                  <PrimaryButton onClick={shareFundingAndReceive}>
                    <span className={styles.shareCta}>
                      <IconArrowOutOfBox size={20} className={styles.shareCtaIcon} />
                      Share
                    </span>
                  </PrimaryButton>
                </div>
              </motion.div>
            )}

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
                    {sources.map((id, i) => {
                      const active = activeSources.find((a) => a.id === id);
                      const meta = CREATOR_SOURCE_META[id];
                      const SourceIcon = meta.Icon;
                      return (
                      <button
                        key={id}
                        type="button"
                        className={styles.sourceRow}
                        disabled={!active}
                        onClick={() => {
                          if (!active) return;
                          // Crypto path starts a fresh address; bank path drops any
                          // crypto destination so the two never bleed together.
                          if (id === 'crypto') {
                            setSelectedBankId(null);
                            setCryptoDest(null);
                            setPasted(false);
                            setPastedAddress('');
                          } else {
                            setCryptoDest(null);
                          }
                          go(active.next);
                        }}
                      >
                        <span className={styles.tile} aria-hidden>
                          <SourceIcon size={24} className={styles.tileGlyph} />
                        </span>
                        <span
                          className={clsx(
                            styles.sourceContent,
                            i < sources.length - 1 && styles.sourceContentBordered,
                          )}
                        >
                          <span className={styles.sourceLabels}>
                            <span className={styles.rowTitle}>{meta.title}</span>
                            <span className={styles.rowSub}>{meta.sub}</span>
                            <span className={styles.rowSub}>{meta.speed}</span>
                          </span>
                          <SfSymbol name="chevron.right" size={14} className={styles.chevron} />
                        </span>
                      </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'banks' && (
              <motion.div
                key="banks"
                className={styles.step}
                custom={navDir}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={STEP_TRANSITION}
              >
                <div className={styles.recipientWrap}>
                  {banks.length === 0 ? (
                    <div className={styles.banksEmptyOffset}>
                      <WalletListSection
                        title={isSend ? 'Recipients' : 'Bank accounts'}
                        hideTitle
                        emptyTitle={isSend ? 'No recipients yet' : 'No bank accounts yet'}
                        emptySub={
                          isSend
                            ? 'Send to a bank account in 65+ countries or any crypto wallet'
                            : 'Add a bank account in 65+ countries to get started'
                        }
                        cta={{
                          label: isSend ? 'Add recipient' : 'Add bank',
                          onClick: openAddBank,
                        }}
                        roundGraphic={isSend}
                        concentricBottom
                      />
                    </div>
                  ) : (
                    <div className={clsx(styles.card, styles.cardFlush, styles.bankList)}>
                      {banks.map((b, i) => (
                        <button
                          key={b.id}
                          type="button"
                          className={styles.sourceRow}
                          onClick={() => selectBank(b.id)}
                        >
                          {'address' in b ? (
                            <span className={styles.recipientAvatar} aria-hidden>
                              <img
                                className={styles.tokenIconSm}
                                src={b.logo}
                                alt=""
                                draggable={false}
                              />
                            </span>
                          ) : isSend ? (
                            <RecipientAvatar name={b.beneficiary} code={b.country.code} />
                          ) : (
                            <span className={styles.tile} aria-hidden>
                              <Flag code={b.country.code} size={20} />
                            </span>
                          )}
                          <span
                            className={clsx(
                              styles.sourceContent,
                              i < banks.length - 1 && styles.sourceContentBordered,
                            )}
                          >
                            <span className={styles.sourceLabels}>
                              {'address' in b ? (
                                <>
                                  <span className={styles.rowTitle}>
                                    {truncateAddress(b.address)}
                                  </span>
                                  <span className={styles.rowSub}>{b.network} wallet</span>
                                </>
                              ) : isSend ? (
                                <>
                                  <span className={styles.rowTitle}>{b.beneficiary}</span>
                                  <span className={styles.rowSub}>
                                    {b.bankName} •••• {accountLast4(b.values)}
                                  </span>
                                  <span className={styles.rowSub}>{currencyFor(b.country)}</span>
                                </>
                              ) : (
                                <>
                                  <span className={styles.rowTitle}>
                                    {b.bankName} (•••• {accountLast4(b.values)})
                                  </span>
                                  <span className={styles.rowSub}>{b.country.name}</span>
                                  <span className={styles.rowSub}>{currencyFor(b.country)}</span>
                                </>
                              )}
                            </span>
                            <SfSymbol name="chevron.right" size={14} className={styles.chevron} />
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 'country' && (
              <motion.div
                key="country"
                className={clsx(styles.step, styles.stepFlushTop)}
                custom={navDir}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={STEP_TRANSITION}
              >
                <div className={clsx(styles.pickerScroll, styles.pickerScrollCountry)}>
                  {countryQ ? (
                    <>
                      <p className={styles.sectionLabel}>Results</p>
                      <div className={clsx(styles.card, styles.cardFlush, styles.pickerCard)}>
                        {filteredCountries.map((c, i, arr) => (
                          <CountryPickRow
                            key={c.code}
                            country={c}
                            bordered={i < arr.length - 1}
                            onSelect={pickCountry}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className={styles.sectionLabel}>Popular</p>
                      <div className={clsx(styles.card, styles.cardFlush, styles.pickerCard)}>
                        {popularCountries.map((c, i, arr) => (
                          <CountryPickRow
                            key={c.code}
                            country={c}
                            bordered={i < arr.length - 1}
                            onSelect={pickCountry}
                          />
                        ))}
                      </div>
                      <p className={styles.sectionLabel}>All countries</p>
                      <div className={clsx(styles.card, styles.cardFlush, styles.pickerCard)}>
                        {allCountries.map((c, i, arr) => (
                          <CountryPickRow
                            key={c.code}
                            country={c}
                            bordered={i < arr.length - 1}
                            onSelect={pickCountry}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {/* Flat solid header — the list scrolls UP and disappears behind
                    it (no blur/fade; this skin is flat). */}
                <div className={styles.countryHeaderBg} aria-hidden />
                <div className={styles.searchPill}>
                  <div className={styles.searchPillFlat}>
                    <div className={styles.searchRow}>
                      <IconMagnifyingGlass size={20} className={styles.searchIcon} aria-hidden />
                      <input
                        className={styles.searchInput}
                        type="text"
                        inputMode="search"
                        placeholder="Search country or currency"
                        value={countryQuery}
                        onChange={(e) => setCountryQuery(e.target.value)}
                        aria-label="Search countries"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'bankForm' && pickedCountry && (
              <motion.div
                key="bankForm"
                className={styles.step}
                custom={navDir}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={STEP_TRANSITION}
              >
                <div className={clsx(styles.pickerScroll, styles.pickerScrollForm)}>
                  <div className={clsx(styles.card, styles.formCard)}>
                    <div className={styles.formFields}>
                      {/* Read-only country row — the picked country, styled as the
                          first field row (no flag, no editing). */}
                      <div className={styles.formField}>
                        <span className={styles.formLabel}>Country</span>
                        <span className={styles.formInput}>{pickedCountry.name}</span>
                      </div>
                      <FormField
                        label="Account holder"
                        value={formBeneficiary}
                        onChange={setFormBeneficiary}
                      />
                      {BANK_ACCOUNT_SCHEMAS[pickedCountry.accountType].fields
                        .filter((f) => f.key !== 'region')
                        .map((f) => (
                          <FormField
                            key={f.key}
                            label={fieldLabel(f.key)}
                            value={formValues[f.key] ?? ''}
                            onChange={(v) => updateField(f.key, v)}
                            options={f.enum}
                          />
                        ))}
                    </div>
                  </div>
                </div>
                <div className={styles.bottomCtaWrap}>
                  <PrimaryButton onClick={addBank}>
                    {saving ? (
                      <span className={styles.spinner} aria-label="Saving">
                        <IconLoadingCircle size={20} />
                      </span>
                    ) : isSend ? (
                      'Add recipient'
                    ) : (
                      'Add bank account'
                    )}
                  </PrimaryButton>
                </div>
              </motion.div>
            )}

            {step === 'recipient' && (
              <motion.div
                key="recipient"
                className={styles.step}
                custom={navDir}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={STEP_TRANSITION}
              >
                <div className={styles.recipientWrap}>
                  <div className={styles.addressWrap}>
                    {/* Figma 109:27766 (empty) / 109:29332 (pasted) — the address
                        entry card. Paste fills it with the demo Solana address;
                        the empty ⇄ filled swap runs through real height (the
                        keypad REGION_* pattern) so the card grows, not pops. */}
                    <div className={clsx(styles.card, styles.addressCard)}>
                      <AnimatePresence initial={false}>
                        {pasted ? (
                          <motion.div
                            key="filled"
                            className={styles.addressRegion}
                            initial={reduceMotion ? false : REGION_HIDDEN}
                            animate={REGION_ENTER}
                            exit={reduceMotion ? { height: 0, opacity: 0 } : REGION_EXIT}
                          >
                            <div className={styles.addressBody}>
                              <div
                                className={clsx(styles.addressLabels, styles.addressLabelsFilled)}
                              >
                                <p className={styles.addressValue}>{pastedAddress}</p>
                                <p className={styles.addressSub}>{pickedNetwork?.name ?? ''}</p>
                              </div>
                              <span className={clsx(styles.tile, styles.addressTile)} aria-hidden>
                                <img
                                  className={styles.tokenIcon}
                                  src={pickedNetwork?.logo ?? DEFAULT_SEND_NETWORK.logo}
                                  alt=""
                                  draggable={false}
                                />
                              </span>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="empty"
                            className={styles.addressRegion}
                            initial={reduceMotion ? false : REGION_HIDDEN}
                            animate={REGION_ENTER}
                            exit={reduceMotion ? { height: 0, opacity: 0 } : REGION_EXIT}
                          >
                            <div className={styles.addressBody}>
                              <div className={styles.addressLabels}>
                                <p className={styles.addressPlaceholder}>Enter any address</p>
                                <p className={styles.addressSub}>
                                  Spark, Solana, Base, Ethereum — anything
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {/* ONE persistent button: Paste fills, then it goes
                          prominent and morphs into Continue (Figma 109:29338). */}
                      <div className={styles.addressBtnWrap}>
                        <ContentAreaButton
                          className={styles.addressBtn}
                          variant={pasted ? 'filled' : 'secondary'}
                          onClick={() => {
                            if (saving) return;
                            // Paste fills a demo address; the prominent state then
                            // saves it (send → recipient list) or carries it to the
                            // amount step (withdraw → one-off wallet).
                            if (pasted) {
                              if (isSend) addCryptoRecipient();
                              else useCryptoWithdraw();
                            } else {
                              setPickerOpen(true);
                            }
                          }}
                        >
                          {saving ? (
                            <span className={styles.spinner} aria-label="Saving">
                              <IconLoadingCircle size={20} />
                            </span>
                          ) : (
                            <TextMorph
                              as="span"
                              duration={MORPH_MS}
                              ease={cubicBezierCss(easeOutSwift)}
                            >
                              {pasted ? (isSend ? 'Add recipient' : 'Continue') : 'Paste'}
                            </TextMorph>
                          )}
                        </ContentAreaButton>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {(step === 'amount' || step === 'confirm') && (
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
                      {mode === 'add' ? bankRow : balanceRow}
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
                            value={(cents / 100) * fxRate}
                            format={{
                              minimumFractionDigits: fxFractionDigits,
                              maximumFractionDigits: fxFractionDigits,
                            }}
                            style={NUMERIC_PAD}
                          />
                          {`\u00A0${fxLabel}`}
                          {step === 'amount' && (
                            <SfSymbol name="arrow.up.arrow.down" size={11} />
                          )}
                        </p>
                      </div>
                    </div>
                    <span className={styles.chevronDisc} aria-hidden>
                      <SfSymbol name="chevron.down" size={14} />
                    </span>
                    <div className={styles.card}>{bottomRow}</div>
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
                        animate={{ ...REGION_ENTER, height: keypadH ?? 'auto' }}
                        exit={reduceMotion ? { height: 0, opacity: 0 } : REGION_EXIT}
                      >
                        <div ref={measureKeypad} className={styles.keypad} role="group" aria-label="Amount keypad">
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
                        animate={{ ...REGION_ENTER, height: detailsH ?? 'auto' }}
                        exit={reduceMotion ? { height: 0, opacity: 0 } : REGION_EXIT}
                      >
                        <div ref={measureDetails} className={clsx(styles.card, styles.detailsCard)}>
                          <div className={styles.detailRows}>
                            {confirmDetails.map(([label, value], i) => (
                              <div
                                key={label}
                                className={clsx(
                                  styles.detailRow,
                                  i < confirmDetails.length - 1 && styles.detailRowBordered,
                                )}
                              >
                                <span className={styles.detailLabel}>{label}</span>
                                <span className={styles.detailValue}>{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Persistent CTA — ONE button across both steps; the label
                      morphs and the Face ID glyph fades in on confirm. It rides
                      the real layout as the region above changes height. */}
                  <div className={styles.ctaWrap}>
                    <PrimaryButton
                      onClick={() =>
                        step === 'amount'
                          ? tryContinue()
                          : !confirming && onConfirm(cents, activityForConfirm())
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
                    </PrimaryButton>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </BottomSheet>

    {/* Secondary "Clipboard" sheet — the auth/send-receive float-sheet treatment
        (inset, gradient icon tile + glass X, left-aligned heading). Framed as a
        paste affordance: tap an address to drop it into the recipient card. Each
        row reuses a Receive chain (brand logo + address) and carries that
        network's accountType + settlement currency into the calls. */}
    <BottomSheet
      open={pickerOpen}
      onDismiss={() => setPickerOpen(false)}
      glass={{ ...SHEET_GLASS, tint: 'var(--float-sheet-tint)' }}
      // 24px top corners to match the auth / Send-Receive sheets (scoped; the
      // shared SHEET_GLASS preset is untouched).
      topRadius={24}
    >
      <div className={styles.clipboardHeader}>
        <h2 className={styles.clipboardHeading}>Paste address</h2>
        <SheetIconButton
          aria-label="Close"
          size={40}
          type="button"
          ghost
          onClick={() => setPickerOpen(false)}
        >
          <IconCrossMedium size={24} />
        </SheetIconButton>
      </div>

      <div className={styles.clipboardList}>
        <div className={clsx(styles.card, styles.cardFlush)}>
          {SEND_NETWORKS.map((net, i) => (
            <button
              key={net.id}
              type="button"
              className={styles.sourceRow}
              onClick={() => pickNetwork(net)}
            >
              <span className={styles.recipientAvatar} aria-hidden>
                <img className={styles.tokenIconSm} src={net.logo} alt="" draggable={false} />
              </span>
              <span
                className={clsx(
                  styles.sourceContent,
                  i < SEND_NETWORKS.length - 1 && styles.sourceContentBordered,
                )}
              >
                <span className={styles.sourceLabels}>
                  <span className={styles.rowTitle}>{truncateAddress(net.address)}</span>
                  <span className={styles.rowSub}>{net.name} wallet</span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </BottomSheet>
    </>
  );
}
