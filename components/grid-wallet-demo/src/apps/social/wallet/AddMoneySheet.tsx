'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion, useAnimate, useReducedMotion } from 'motion/react';
import { IconLoadingCircle } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLoadingCircle';
import { IconMagnifyingGlass } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconMagnifyingGlass';
// QR uses the radius-1 (tight-corner) variant so the code squares read crisp.
import { IconQrCode } from '@central-icons-react/round-outlined-radius-1-stroke-1.5/IconQrCode';
import { IconSquareBehindSquare6 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSquareBehindSquare6';
import { IconCheckmark2Small } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark2Small';
// Success screen — outlined circle-check (Z's 2px-stroke set).
import { IconCircleCheck } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconCircleCheck';
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
import { SheetHeader } from '../blocks/SheetHeader';
import { SOCIAL_FLAT_SHEET } from '../glass-presets';
import { IconCrossMedium as IconCrossZ, IconChevronLeftMedium as IconChevronLeftZ } from '../icons';
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
        <Flag code={country.code} size={40} />
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
// Source chooser card-button press (Aurora-style grow on hover / more on press).
const CHOICE_PRESS = motionTransition(easeOutSnappy, 0.2);
// Z-local sheet slide duration (decoupled from Glitch's constant).
const SOCIAL_SHEET_DURATION = 0.5;
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

/** Headline amount — drops the ".00" on round figures ("$200", "$200.50"). */
function formatAmountShort(cents: number): string {
  const whole = cents % 100 === 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

interface AddMoneySheetProps {
  /** The money-sheet brain — hosted above the skin (survives skin switches);
   *  this face only reads it and renders. */
  m: MoneySheet;
  open: boolean;
  /** Direction of the flow — flips titles, source rows, card order, and copy. */
  mode: MoneySheetMode;
  /** Face ID running — Confirm shows a spinner and input locks. */
  confirming: boolean;
  /** Direct close (the success screen's Done — skips the brain's confirm guard). */
  onDismiss: () => void;
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
  onDismiss,
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
    isSend,
    step,
    back,
    openKey,
    go,
    backFrom,
    isEntryStep,
    raw,
    cents,
    press,
    tryContinue,
    quoting,
    shakeNonce,
    feeCents,
    payCents,
    netCents,
    fxRate,
    fxFractionDigits,
    fxLabel,
    confirmDetails,
    activityForConfirm,
    banks,
    selectedBank,
    selectedCrypto,
    setCryptoDest,
    selectedBankId,
    setSelectedBankId,
    selectBank,
    savedWallets,
    selectWallet,
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

  // Z confirm/success choreography. The confirm step is presented as a SHORT
  // bottom sheet over the amount screen (not an inline step); on Face ID done the
  // sheet dismisses, then the amount screen pushes left to a success screen.
  const [successOpen, setSuccessOpen] = useState(false);
  // Transient: force the confirm sheet closed during the success handoff so it
  // slides DOWN before the screen pushes left (rather than both at once).
  const [hideConfirm, setHideConfirm] = useState(false);
  // Fresh choreography on each open.
  const prevOpenRef = useRef(open);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setSuccessOpen(false);
      setHideConfirm(false);
    }
    prevOpenRef.current = open;
  }, [open]);

  // Face ID finished (confirming fell while on the confirm step): dismiss the
  // confirm sheet, then a beat later push to the success screen.
  const SUCCESS_HANDOFF_MS = 380; // ≈ the sheet's 0.35s slide-down + a hair
  const prevConfirming = useRef(confirming);
  const successTimer = useRef(0);
  useEffect(() => {
    const was = prevConfirming.current;
    prevConfirming.current = confirming;
    if (was && !confirming && step === 'confirm') {
      setHideConfirm(true);
      window.clearTimeout(successTimer.current);
      successTimer.current = window.setTimeout(() => setSuccessOpen(true), SUCCESS_HANDOFF_MS);
    }
  }, [confirming, step]);
  useEffect(() => () => window.clearTimeout(successTimer.current), []);

  // Amount-entry decimals for NumericText: hidden until the user types the dot
  // ("1500" → "$1,500"); then typed digits solid + remaining placeholders dim
  // ("1500." → "$1,500." + ghost "00"). The amount screen stays in entry mode even
  // while the confirm sheet is up, so we never force the trailing ".00".
  const hasDot = raw.includes('.');
  const fracTyped = raw.split('.')[1] ?? '';
  const amountFraction = {
    hasDot,
    typed: fracTyped,
    ghost: hasDot ? '0'.repeat(Math.max(0, 2 - fracTyped.length)) : '',
  };

  // ── Enter-amount From/To pills ──────────────────────────────────────────────
  // A compact pill: round avatar (flag / crypto logo / initials / $) + name, with
  // a chevron when it's tappable. The picked account (the one chosen earlier in
  // the flow) is tappable and returns to its selection step; your own balance is
  // static. `backFrom.amount` is exactly "the step the amount came from".
  const destBackStep: Step = backFrom.amount ?? 'banks';
  const goToDest = () => go(destBackStep, true);
  const pillIconFlag = (code: string) => (
    <span className={styles.pillIcon}>
      <Flag code={code} size={20} />
    </span>
  );
  const pillIconLogo = (logo: string) => (
    <span className={styles.pillIcon}>
      <img className={styles.pillImg} src={logo} alt="" draggable={false} />
    </span>
  );
  const pillIconInitials = (name: string) => (
    <span className={clsx(styles.pillIcon, styles.pillIconFill)}>
      <span className={styles.pillInitials}>{initials(name)}</span>
    </span>
  );
  const pillIconBalance = (
    <span className={styles.pillIcon}>
      <img
        className={styles.pillDollar}
        src="/assets/add-money/IconDollar.svg"
        alt=""
        draggable={false}
      />
    </span>
  );
  const renderPill = (icon: ReactNode, name: string, onTap?: () => void) =>
    onTap ? (
      <motion.button
        type="button"
        className={styles.transferPill}
        whileHover={confirming ? undefined : { scale: 1.02, transition: CHOICE_PRESS }}
        whileTap={confirming ? undefined : { scale: 1.04, transition: CHOICE_PRESS }}
        onClick={onTap}
        disabled={confirming}
      >
        {icon}
        <span className={styles.pillName}>{name}</span>
        <SfSymbol name="chevron.right" size={12} className={styles.pillChevron} />
      </motion.button>
    ) : (
      <span className={styles.transferPillStatic}>
        {icon}
        <span className={styles.pillName}>{name}</span>
        {/* Decorative chevron for visual parity with the tappable pill (no-op). */}
        <SfSymbol name="chevron.right" size={12} className={styles.pillChevron} />
      </span>
    );
  const balancePill = renderPill(pillIconBalance, 'Cash balance');
  const destPill = selectedCrypto
    ? renderPill(pillIconLogo(selectedCrypto.logo), truncateAddress(selectedCrypto.address), goToDest)
    : isSend && selectedBank
      ? renderPill(pillIconInitials(selectedBank.beneficiary), selectedBank.beneficiary, goToDest)
      : selectedBank
        ? renderPill(pillIconFlag(selectedBank.country.code), selectedBank.bankName, goToDest)
        : renderPill(
            pillIconLogo(DEFAULT_SEND_NETWORK.logo),
            truncateAddress(SEND_DEMO_ADDRESS),
            goToDest,
          );
  // add: From = your bank (tappable) → To = your balance; withdraw/send: From =
  // your balance → To = the destination (tappable).
  const fromPill =
    mode === 'add'
      ? selectedBank
        ? renderPill(pillIconFlag(selectedBank.country.code), selectedBank.bankName, goToDest)
        : renderPill(pillIconFlag('mx'), 'Bank account', goToDest)
      : balancePill;
  const toPill = mode === 'add' ? balancePill : destPill;

  // ── Confirm sheet + success copy (per mode) ─────────────────────────────────
  const ctaLabel = mode === 'add' ? 'Deposit' : mode === 'withdraw' ? 'Withdraw' : 'Send';
  const modeNoun = mode === 'add' ? 'deposit' : mode === 'withdraw' ? 'withdrawal' : 'send';
  const confirmTitle = `Confirm ${modeNoun}`;
  const successHeadline = `Your ${formatAmountShort(cents)} ${modeNoun} was successful`;
  // Confirm rows (label-over-value): the typed amount is LOCKED at the top; the fee
  // is the sender's, so "You pay" = amount + fee, anchored at the BOTTOM. Between
  // them: what the recipient gets (converted, send/withdraw only), the rate + ETA.
  const hasConversion = fxLabel !== 'USD';
  // netCents: a maxed outflow pays the fee from INSIDE the amount (pattern 3 —
  // "spend my whole balance"), so the recipient line shows the net.
  const convertedStr = `${new Intl.NumberFormat(undefined, {
    minimumFractionDigits: fxFractionDigits,
    maximumFractionDigits: fxFractionDigits,
  }).format((netCents / 100) * fxRate)} ${fxLabel}`;
  const youPayCents = payCents;
  // Deposit is funded from a foreign bank, so "You pay" shows the USD total with
  // the bank-currency charge in parens, e.g. "$50.15 (876.87 MXN)".
  const youPayLocalStr = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: fxFractionDigits,
    maximumFractionDigits: fxFractionDigits,
  }).format((youPayCents / 100) * fxRate);
  const youPayValue =
    mode === 'add' && hasConversion
      ? `${formatUsdCents(youPayCents)} (${youPayLocalStr} ${fxLabel})`
      : formatUsdCents(youPayCents);
  // Drop the brain's Fee row (we re-add it next to "You pay" so the math reads).
  const detailRowsNoFee = confirmDetails.filter(([label]) => label !== 'Fee');
  const confirmSheetRows: Array<[string, string]> = [
    ['Amount', formatUsdCents(cents)],
    ...(mode !== 'add' && hasConversion
      ? [['They receive', convertedStr] as [string, string]]
      : []),
    ...detailRowsNoFee,
    ['Fee', formatUsdCents(feeCents)],
    ['You pay', youPayValue],
  ];
  // The confirm sheet rides over the amount screen while on the confirm step
  // (hidden during the success handoff so it slides down before the push left).
  // Gated on `open` too: the brain's step only resets on the NEXT open, so a
  // closed sheet can still be parked on 'confirm' (e.g. a transfer finished in
  // another skin before switching here).
  const confirmOpen = open && step === 'confirm' && !hideConfirm && !successOpen;

  // iOS push: forward = in from the right / out to the left; back = reverse.
  // Variants + `custom` (not inline objects): an EXITING screen never re-renders,
  // so an inline `exit` keeps the stale direction from the previous nav — the
  // AnimatePresence `custom` prop is re-resolved for exiting children instead.
  type NavDir = { back: boolean; reduceMotion: boolean };
  const navDir: NavDir = { back, reduceMotion: !!reduceMotion };
  // Z title overrides matching the wallet-home buttons (Deposit / Withdraw):
  // the source step reads "Deposit via" / "Withdraw via" and the confirm step
  // "Confirm deposit", rather than the shared "Add money from" / "Withdraw to".
  const zTitle =
    mode === 'add' && step === 'source'
      ? 'Deposit via'
      : mode === 'withdraw' && step === 'source'
        ? 'Withdraw via'
        : null;
  // The confirm sheet rides OVER the amount screen, so the header keeps the amount
  // title ("Enter amount") rather than switching to the confirm title (which the
  // sheet itself already shows).
  const headerStep: Step = step === 'confirm' ? 'amount' : step;
  // The funding-details step titles itself with the picked country's name (e.g.
  // "Mexico"); every other step uses the mode's static step title.
  const displayTitle =
    headerStep === 'fundingDetails' && pickedCountry
      ? `Receive from ${pickedCountry.name}`
      : (zTitle ?? titles[headerStep]);
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
  // The sliding, gradient-masked title (Aurora/Glitch header interaction): each
  // step's title rides the content push and the strip's mask dissolves it before
  // it reaches the icons. Keyed by TEXT so adjacent steps sharing a title don't
  // slide; amount ⇄ confirm share 'transfer' and torph-morph in place. Shared by
  // both header styles (full-screen flowNav + the receive toolbar).
  const titleStrip = (
    <AnimatePresence key={openKey} initial={false} custom={navDir}>
      <motion.span
        key={step === 'amount' || step === 'confirm' ? 'transfer' : displayTitle}
        custom={navDir}
        variants={titleVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={STEP_TRANSITION}
      >
        {step === 'amount' || step === 'confirm' ? (
          <TextMorph as="span" duration={MORPH_MS} ease={cubicBezierCss(easeOutSwift)}>
            {titles[headerStep]}
          </TextMorph>
        ) : (
          displayTitle
        )}
      </motion.span>
    </AnimatePresence>
  );

  // Add / Withdraw open with a short content-hugging chooser, then the full flow
  // slides up OVER it. Send has no chooser (its entry is the recipient list) but is
  // still full-screen. Only Receive stays the elevated bottom sheet.
  const hasChooser = mode === 'add' || mode === 'withdraw';
  // Every mode is full-screen now (receive included); the elevated-sheet toolbar
  // path is no longer used.
  const isFullScreen =
    mode === 'add' || mode === 'withdraw' || mode === 'send' || mode === 'receive';

  // One source card button (icon tile + title, speed on the right). `grid` cards
  // sit two-up and drop the speed.
  const renderChoice = (id: string, grid = false) => {
    const active = activeSources.find((a) => a.id === id);
    const meta = CREATOR_SOURCE_META[id];
    const SourceIcon = meta.Icon;
    return (
      <motion.button
        key={id}
        type="button"
        className={clsx(styles.choiceCard, grid && styles.choiceCardGrid)}
        disabled={!active}
        whileHover={active ? { scale: 1.02, transition: CHOICE_PRESS } : undefined}
        whileTap={active ? { scale: 1.04, transition: CHOICE_PRESS } : undefined}
        onClick={() => {
          if (!active) return;
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
        <span className={styles.choiceTile} aria-hidden>
          <SourceIcon size={24} />
        </span>
        <span className={styles.choiceLabels}>
          <span className={styles.choiceTitle}>{meta.title}</span>
        </span>
        {!grid && <span className={styles.choiceSpeed}>{meta.speed}</span>}
      </motion.button>
    );
  };

  // Full-screen flow header: a + (add bank/recipient) on the saved-list step, a QR
  // on the crypto address step; nothing otherwise.
  const flowRight: { icon: ReactNode; onClick?: () => void; ariaLabel: string } | undefined =
    step === 'banks'
      ? {
          icon: <IconPlusMedium size={24} />,
          onClick: openAddBank,
          ariaLabel: isSend ? 'Add recipient' : 'Add bank account',
        }
      : step === 'recipient'
        ? { icon: <IconArrowsAllSides2 size={24} />, ariaLabel: 'Scan QR code' }
        : undefined;
  // The header's left control is an X (close) on the success screen, on the entry
  // step, and — for the chooser modes — on the step that returns to the short
  // chooser sheet (send returning to its 'source' STEP is a normal back arrow).
  const flowBackToChooser = hasChooser && backFrom[step] === 'source';
  const flowShowsClose = successOpen || isEntryStep || flowBackToChooser;

  return (
    <>
    {/* Source chooser — short, content-hugging (auth-sheet style). Stays mounted
        behind the flow so the full sheet slides up over it. Always rendered (gated
        by `open`, not unmounted for send) so its enter animation isn't suppressed
        by AnimatePresence's first-render `initial={false}` when it remounts. */}
    <BottomSheet
      open={hasChooser && open}
      onDismiss={dismiss}
      glass={SOCIAL_FLAT_SHEET}
      topRadius={32}
      scalesBackground={false}
    >
      {/* Fixed chooser title — NOT displayTitle, which tracks the step and would
          flip to "Select bank"/"Select country" the instant a source is picked
          (the chooser stays behind the full flow but should keep its own title). */}
      <SheetHeader
        title={mode === 'add' ? 'Deposit via' : 'Withdraw via'}
        left={{ icon: <IconCrossZ size={24} />, onClick: dismiss, ariaLabel: 'Close' }}
      />
      <div className={styles.chooserBody}>
        <div className={styles.choiceList}>
          {sources.slice(0, 2).map((id) => renderChoice(id))}
          {sources.length > 2 && (
            <div className={styles.choiceGrid}>
              {sources.slice(2).map((id) => renderChoice(id, true))}
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
    {/* The full flow — full-screen for add/withdraw/send (for add/withdraw it
        slides up OVER the chooser once a source is picked); elevated sheet for
        receive. */}
    <BottomSheet
      open={open && (!hasChooser || step !== 'source')}
      onDismiss={dismiss}
      // Slower slide for the stacked-sheet presentation — shares one constant with
      // the PresentationStage transition so the scale recedes in lockstep.
      duration={SOCIAL_SHEET_DURATION}
      // Flat solid sheet (no frost/glint). Z surface token; shell smoothing so the
      // bottom corners nest concentrically in the screen squircle.
      glass={{
        // Full-screen flows are square-top + flush behind the status bar on the
        // base bg; receive keeps the rounded elevated bottom-sheet.
        radius: isFullScreen ? 0 : 24,
        cornerSmoothing: PHONE_SHELL_GLASS.cornerSmoothing,
        tint: isFullScreen ? 'var(--app-bg)' : 'var(--z-sheet-bg)',
        edge: 'var(--sheet-flat-edge)',
        edgeGlint: false,
        edgeWidth: 0.5,
        shadow: '0 15px 37.5px rgba(0, 0, 0, 0.18)',
      }}
    >
      <div className={clsx(styles.flow, isFullScreen && styles.flowFull)}>
        {isFullScreen ? (
          /* Same header as the Z wallet home nav (plain 24px icons, centered
             title, no border): X/back left, title center, +/QR right. On the
             success screen it keeps just the X (close) — no title or right. */
          <header className={styles.flowNav}>
            <button
              type="button"
              className={styles.flowNavBtn}
              onClick={
                successOpen || isEntryStep
                  ? onDismiss
                  : () => go(backFrom[step] ?? 'source', true)
              }
              aria-label={flowShowsClose ? 'Close' : 'Back'}
              disabled={confirming}
            >
              {flowShowsClose ? <IconCrossZ size={24} /> : <IconChevronLeftZ size={24} />}
            </button>
            {!successOpen && <h2 className={styles.flowNavTitle}>{titleStrip}</h2>}
            <div className={styles.flowNavRight}>
              {!successOpen && flowRight && (
                <button
                  type="button"
                  className={styles.flowNavBtn}
                  onClick={flowRight.onClick}
                  aria-label={flowRight.ariaLabel}
                >
                  {flowRight.icon}
                </button>
              )}
            </div>
          </header>
        ) : (
        <div className={styles.toolbar}>
          <div className={styles.toolbarRow}>
            {successOpen ? (
              <SheetIconButton
                aria-label="Close"
                size={40}
                type="button"
                ghost
                onClick={onDismiss}
              >
                <IconCrossMedium size={24} />
              </SheetIconButton>
            ) : isEntryStep ? (
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
            {!successOpen && <h2 className={styles.title}>{titleStrip}</h2>}
            {/* Figma 109:28547 — glass QR scan button, recipient step only.
                Blur-fades between steps, the wallet home header language. */}
            {!successOpen && (
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
            )}
          </div>
        </div>
        )}

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
                  <div className={styles.flatList}>
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
                  <div className={styles.formCard}>
                    <div className={styles.formFields}>
                      {receiveFields(pickedCountry, formBeneficiary).map(([label, value]) => {
                        const id = `fd-${label}`;
                        const copied = copiedChainId === id;
                        return (
                          <div key={label} className={styles.formField}>
                            <span className={styles.formLabel}>{label}</span>
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
                {/* Same card buttons as the deposit/withdraw "via" chooser, but in
                    the full-screen step (tighter padding than the short sheet). */}
                <div className={clsx(styles.chooserBody, styles.chooserBodyFull)}>
                  <div className={styles.choiceList}>
                    {sources.slice(0, 2).map((id) => renderChoice(id))}
                    {sources.length > 2 && (
                      <div className={styles.choiceGrid}>
                        {sources.slice(2).map((id) => renderChoice(id, true))}
                      </div>
                    )}
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
                              <Flag code={b.country.code} size={40} />
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
                                  <span className={styles.rowSub}>
                                    {b.country.name} · {currencyFor(b.country)}
                                  </span>
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
                    <div className={styles.addressCard}>
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
                          variant="filled"
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

                  {/* The session address book (withdraw only — send's list is
                      its own entry screen): wallets saved by either flow, one
                      tap → amount. The banks-list row voice. */}
                  {!isSend && savedWallets.length > 0 && (
                    <div className={styles.walletBook}>
                      <p className={styles.sectionLabel}>Your wallets</p>
                      <div className={clsx(styles.card, styles.cardFlush, styles.bankList)}>
                        {savedWallets.map((w, i) => (
                          <button
                            key={w.id}
                            type="button"
                            className={styles.sourceRow}
                            onClick={() => selectWallet(w.id)}
                          >
                            <span className={styles.recipientAvatar} aria-hidden>
                              <img
                                className={styles.tokenIconSm}
                                src={w.logo}
                                alt=""
                                draggable={false}
                              />
                            </span>
                            <span
                              className={clsx(
                                styles.sourceContent,
                                i < savedWallets.length - 1 && styles.sourceContentBordered,
                              )}
                            >
                              <span className={styles.sourceLabels}>
                                <span className={styles.rowTitle}>
                                  {truncateAddress(w.address)}
                                </span>
                                <span className={styles.rowSub}>{w.network} wallet</span>
                              </span>
                              <SfSymbol name="chevron.right" size={14} className={styles.chevron} />
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {(step === 'amount' || step === 'confirm') && !successOpen && (
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
                <div className={styles.amountLayout}>
                  {/* From / To — the source + destination as compact pills. The
                      picked account is tappable (returns to its selection step);
                      your own balance is static. */}
                  <div className={styles.transferRows}>
                    <div className={styles.transferRow}>
                      <span className={styles.transferRowLabel}>From</span>
                      {fromPill}
                    </div>
                    <div className={styles.transferRow}>
                      <span className={styles.transferRowLabel}>To</span>
                      {toPill}
                    </div>
                  </div>

                  {/* The amount floats free (no card), centered in the gap above
                      the keypad, with the converted amount beneath it. */}
                  <div className={styles.amountFree}>
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
                      <SfSymbol name="arrow.up.arrow.down" size={11} />
                    </p>
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
                        {key === 'del' ? <SfSymbol name="delete.left" size={24} /> : key}
                      </button>
                    ))}
                  </div>

                  {/* CTA = the action (Deposit / Withdraw / Send); spins while the
                      quote is created, then the confirm sheet rises over this. */}
                  <div className={styles.ctaWrap}>
                    <PrimaryButton onClick={tryContinue} disabled={confirming}>
                      {quoting ? (
                        <span className={styles.spinner} aria-label="Creating quote">
                          <IconLoadingCircle size={20} />
                        </span>
                      ) : (
                        ctaLabel
                      )}
                    </PrimaryButton>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Success — pushes in from the right after the confirm sheet drops.
                Checkmark + headline top-aligned, Done pinned to the bottom. */}
            {successOpen && (
              <motion.div
                key="success"
                className={clsx(styles.step, styles.successStep)}
                custom={navDir}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={STEP_TRANSITION}
              >
                <div className={styles.successBody}>
                  <span className={styles.successCheck} aria-hidden>
                    <IconCircleCheck size={44} />
                  </span>
                  <h2 className={styles.successTitle}>{successHeadline}</h2>
                </div>
                <div className={styles.ctaWrap}>
                  <PrimaryButton onClick={onDismiss}>Done</PrimaryButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </BottomSheet>

    {/* Confirm — a short sheet that rises over the amount screen. Title + ETA,
        the quote breakdown (value-over-label), and a Face ID Confirm CTA that
        spins through the auth beat; on done it drops and the screen pushes to
        the success step. */}
    <BottomSheet
      open={confirmOpen}
      onDismiss={() => {
        if (!confirming) go('amount', true);
      }}
      glass={SOCIAL_FLAT_SHEET}
      topRadius={32}
      scalesBackground={false}
    >
      <div className={styles.confirmBody}>
        <div className={styles.confirmHead}>
          <h2 className={styles.confirmTitle}>{confirmTitle}</h2>
        </div>
        <div className={styles.confirmRows}>
          {confirmSheetRows.map(([label, value]) => (
            <div key={label} className={styles.confirmRow}>
              <span className={styles.confirmLabel}>{label}</span>
              <span className={styles.confirmValue}>{value}</span>
            </div>
          ))}
        </div>
        <div className={styles.confirmCtaWrap}>
          <PrimaryButton
            onClick={() => !confirming && onConfirm(cents, activityForConfirm())}
            disabled={confirming}
          >
            {confirming ? (
              <span className={styles.spinner} aria-label="Confirming">
                <IconLoadingCircle size={20} />
              </span>
            ) : (
              <span className={styles.ctaInner}>
                <span className={styles.ctaFaceId} aria-hidden>
                  <SfSymbol name="faceid" size={18} />
                </span>
                Confirm
              </span>
            )}
          </PrimaryButton>
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
      glass={SOCIAL_FLAT_SHEET}
      topRadius={32}
      scalesBackground={false}
    >
      <SheetHeader
        title="Paste address"
        left={{
          icon: <IconCrossZ size={24} />,
          onClick: () => setPickerOpen(false),
          ariaLabel: 'Close',
        }}
      />
      <div className={clsx(styles.sourceWrap, styles.pasteWrap)}>
        <div className={styles.flatList}>
          {SEND_NETWORKS.map((net, i) => (
            <button
              key={net.id}
              type="button"
              className={styles.sourceRow}
              onClick={() => pickNetwork(net)}
            >
              <span className={styles.tile} aria-hidden>
                <img className={styles.depositLogo} src={net.logo} alt="" draggable={false} />
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
