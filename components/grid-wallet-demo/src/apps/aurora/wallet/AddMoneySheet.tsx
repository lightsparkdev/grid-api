'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion, useAnimate, useReducedMotion } from 'motion/react';
import { IconLoadingCircle } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLoadingCircle';
import { IconWallet1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconWallet1';
import { IconMagnifyingGlass } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconMagnifyingGlass';
// QR uses the radius-1 (tight-corner) variant so the code squares read crisp.
import { IconQrCode } from '@central-icons-react/round-outlined-radius-1-stroke-1.5/IconQrCode';
import { IconSquareBehindSquare6 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSquareBehindSquare6';
import { IconCheckmark2Small } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark2Small';
import { IconArrowOutOfBox } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowOutOfBox';
import { TextMorph } from 'torph/react';
import { BottomSheet } from '@/apps/shared/BottomSheet';
import { ContentAreaButton } from '@/apps/shared/ContentAreaButton';
import NumericText from '@/components/NumericText';
import { FrostPanel, PHONE_SHELL_GLASS } from '@/components/liquid-glass';
import { GlassSymbolButton, GlassTextButton, headerGlassBrightness } from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import { useThemeMode } from '@/hooks/useThemeMode';
import { cubicBezierCss, easeOutSnappy, easeOutSwift, motionTransition } from '@/lib/easing';
import { randomNetworkAddress, randomSolanaAddress } from '@/lib/cryptoAddresses';
import { BANK_COUNTRIES, currencyFor, recipientNamesFor, type BankCountry } from '@/data/bankCountries';
import type { ExternalAccountInput, TransferDest } from '@/data/apiCalls';
import { BANK_ACCOUNT_SCHEMAS } from '@/data/bankAccountFields.generated';
import { useUsdRates } from '@/hooks/useUsdRates';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { readCssVarPx } from '@/apps/shared/figmaSquircleRadius';
import { WalletListSection } from './WalletListSection';
import { Flag } from './Flag';
import styles from './AddMoneySheet.module.scss';

// The bank flow adds three steps between source and amount: a saved-banks list
// (empty first), a country picker, and a pre-filled account form.
type Step =
  | 'source'
  | 'banks'
  | 'country'
  | 'bankForm'
  | 'recipient'
  | 'amount'
  | 'confirm'
  // Receive (deposit) flow: the address list is the entry; the bank row drills
  // into the shared country picker → the picked country's funding instructions.
  | 'deposit'
  | 'fundingDetails';

/** A bank the user has "added" this session (persists until Reset). */
export interface SavedBank {
  id: string;
  country: BankCountry;
  /** Display name for THIS account — cycled from the country's bank pool so
   *  repeat adds from the same country don't look like duplicates. */
  bankName: string;
  /** field key -> value, seeded from the spec example + country overrides. */
  values: Record<string, string>;
  beneficiary: string;
}

/** A saved crypto recipient — just the pasted address (+ network). The send flow
 *  saves these so they read as recipients alongside bank accounts. */
export interface CryptoRecipient {
  id: string;
  address: string;
  network: string;
}

/** A send recipient: someone else's bank account OR a crypto address.
 *  Discriminate with `'address' in r` (only the crypto variant has it). */
export type SavedRecipient = SavedBank | CryptoRecipient;

const DEMO_BENEFICIARY = 'Pat Teehantri';

/** "Carlos Herrera" → "Carlos H." — the Receive payer label (fiat). */
function firstNameLastInitial(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? name;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

/** Randomize the digits of a sample value so each added account looks distinct
 *  (keeps length, letters + formatting — a plausible demo number, not a real
 *  checksum; nothing is submitted to a live API). */
function randomizeDigits(value: string): string {
  return value.replace(/\d/g, () => String(Math.floor(Math.random() * 10)));
}

/** Pre-fill the account form for a country from the spec's sample values
 *  (country override > spec field example), with the fixed CFA region applied.
 *  Account identifiers get fresh digits each call so two banks from the same
 *  country don't share a number; enum fields (e.g. pixKeyType) stay intact. */
function sampleValuesFor(country: BankCountry): Record<string, string> {
  const schema = BANK_ACCOUNT_SCHEMAS[country.accountType];
  const values: Record<string, string> = {};
  for (const f of schema.fields) {
    const base = country.sampleOverrides?.[f.key] ?? f.example ?? '';
    values[f.key] = f.enum ? base : randomizeDigits(base);
  }
  if (country.region) values.region = country.region;
  return values;
}

/** "Banco ... 1234" style trailing digits from the main account identifier. */
function accountLast4(values: Record<string, string>): string {
  const raw = Object.values(values).join('');
  const digits = raw.replace(/\D/g, '');
  return digits.slice(-4) || raw.slice(-4);
}

/** First + last initial for a recipient avatar ("Carlos Herrera" → "CH"). */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (parts[0][0] + last).toUpperCase();
}

/** Compact rate for "1 USD = X" — fewer decimals as the magnitude grows. */
function formatRate(rate: number): string {
  const max = rate >= 100 ? 0 : rate >= 1 ? 2 : 4;
  return rate.toLocaleString('en-US', { maximumFractionDigits: max });
}

/** Human labels for the spec field keys (fallback: de-camelCase the key). */
const FIELD_LABELS: Record<string, string> = {
  accountNumber: 'Account number',
  routingNumber: 'Routing number',
  iban: 'IBAN',
  clabeNumber: 'CLABE',
  pixKey: 'PIX key',
  pixKeyType: 'PIX key type',
  taxId: 'Tax ID',
  vpa: 'UPI ID',
  sortCode: 'Sort code',
  swiftCode: 'SWIFT / BIC',
  bankName: 'Bank name',
  phoneNumber: 'Phone number',
  provider: 'Provider',
  bankCode: 'Bank code',
  branchCode: 'Branch code',
  bankAccountType: 'Account type',
};

function fieldLabel(key: string): string {
  return FIELD_LABELS[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
}

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

/** Progressive top blur — the list scrolls UP under it, frosting toward the
 *  pinned title + glass search pill. Pairs with the alpha-dissolve on the
 *  scroll content. */
function TopFade() {
  return (
    <div className={styles.topFade} aria-hidden>
      <div className={clsx(styles.fadeBlur, styles.fadeBlurStrong)} />
      <div className={clsx(styles.fadeBlur, styles.fadeBlurMid)} />
      <div className={clsx(styles.fadeBlur, styles.fadeBlurSoft)} />
    </div>
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
        <Flag code={country.code} size={20} />
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

/** A picker card whose BOTTOM corners go concentric with the phone screen
 *  (bottom radius = screen corner − 16px inset) — the same hug WalletListCard's
 *  concentricBottom uses — so the bottom-most country card nests into the
 *  sheet's bottom corners instead of floating above them. Top keeps the
 *  wallet-card radius, so it reads like the round 32 of the other picker cards. */
function ConcentricBottomCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const [cornerRadii, setCornerRadii] = useState<[number, number, number, number]>();
  const clip = useSquircleClip<HTMLDivElement>({ cornerRadii });
  useLayoutEffect(() => {
    const el = clip.ref.current;
    if (!el) return;
    const measure = () => {
      const topR = readCssVarPx(el, '--corner-radius-wallet-card-squircle');
      if (!Number.isFinite(topR)) return;
      const screenR = Number.parseFloat(
        getComputedStyle(el).getPropertyValue('--screen-corner-radius').trim(),
      );
      const bottom = Number.isFinite(screenR) ? Math.max(0, screenR - 16) : topR;
      setCornerRadii([topR, topR, bottom, bottom]);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [clip.ref]);
  return (
    <div ref={clip.ref} style={clip.style} className={className}>
      {children}
    </div>
  );
}

/** Demo FX — matches the Figma copy (1 MXN = 0.06 USD ⇒ 1 USD ≈ 17.9074 MXN). */
const USD_TO_MXN = 17.9074;

const STEP_TRANSITION = motionTransition(easeOutSnappy, 0.28);
/** Fake quote-creation beat: Continue spins this long before the confirm step. */
const QUOTE_MS = 750;
/** Validate+save beat: the add bank/recipient CTA spins this long before amount. */
const SAVE_MS = 500;
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

export type MoneySheetMode = 'add' | 'withdraw' | 'send' | 'receive';

/** A simulated inbound payment fired from the Receive flow (Share/Copy). Carries
 *  just enough for the wallet to render the toast + Activity row + webhook log:
 *  a crypto deposit (sender address + network) or a fiat one (payer + country). */
export type ReceivedPayment =
  | { via: 'crypto'; network: string; logo: string; address: string }
  | {
      via: 'bank';
      countryCode: string;
      countryName: string;
      payer: string;
      payerFull: string;
      /** The rail the funds arrived on (PaymentRail enum), by corridor. */
      rail: string;
    };

/** Figma 109:29332 — the demo Solana address Paste drops into the send flow. */
export const SEND_DEMO_ADDRESS = 'DQLoc5rpDPz9vtUv9TxApy3z8HWPB3XCTwdSmDCRn9JT';

/** Middle-truncate an address to first/last 6 around an ellipsis, e.g.
 *  "53am6G…sNkNV7" (only when it'd actually shorten). Used everywhere an
 *  address is shown: send/recipient rows, deposit list, activity, toasts. */
export function truncateAddress(addr: string): string {
  return addr.length > 13 ? `${addr.slice(0, 6)}…${addr.slice(-6)}` : addr;
}

/** Solana token chip (Figma 109:29428) for WalletListItem's Icon slot — rendered
 *  as the rounded-square asset instead of the circular `image` crop. */
export function SolanaTokenIcon({ className }: { className?: string }) {
  return (
    <img
      className={className}
      src="/assets/send/icon-token-sol.svg"
      alt=""
      width={20}
      height={20}
      draggable={false}
    />
  );
}

interface SourceRow {
  id: string;
  /** SVG asset graphic — most rows. */
  icon?: string;
  /** central-icons glyph (e.g. IconWallet1) — wins over `icon` when set. */
  Icon?: typeof IconWallet1;
  title: string;
  sub: string;
  speed: string;
}

const BANK_SOURCE: SourceRow = {
  id: 'bank',
  icon: '/assets/add-money/IconBank.svg',
  title: 'Bank account',
  sub: 'Local transfer in 65+ countries',
  speed: 'Instant',
};

/** The crypto-wallet source row — inactive in withdraw, the live path in send. */
const CRYPTO_SOURCE: SourceRow = {
  id: 'crypto',
  Icon: IconWallet1,
  title: 'Crypto wallet',
  sub: 'Spark, Solana, Base address',
  speed: 'Instant',
};

/** Per-mode copy + source rows; everything else in the flow is shared. */
const MODES: Record<
  MoneySheetMode,
  {
    /** `recipient` only renders in send mode — '' elsewhere (step unreachable). */
    titles: Record<Step, string>;
    sources: SourceRow[];
    /** The tappable source rows + the step each pushes to (send has two: bank
     *  and crypto). */
    activeSources: { id: string; next: Step }[];
    /** Confirm-step details card rows (label, value). */
    details: Array<[string, string]>;
  }
> = {
  add: {
    titles: {
      source: 'Add money from',
      banks: 'Select bank',
      country: 'Select country',
      bankForm: 'Enter bank details',
      recipient: '',
      amount: 'Enter amount',
      confirm: 'Confirm add',
      deposit: 'Add from crypto',
      fundingDetails: '',
    },
    // Bank → saved-banks list; Crypto → the deposit-address list (send crypto in
    // to top up). Cash App / Apple Pay stay inactive (no demo path yet).
    activeSources: [
      { id: 'bank', next: 'banks' },
      { id: 'crypto', next: 'deposit' },
    ],
    sources: [
      BANK_SOURCE,
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
    ],
    details: [
      ['Fee', '$0.60'],
      ['Conversion rate', '1 MXN = 0.06 USD'],
      ['Arrives', 'Instantly'],
    ],
  },
  withdraw: {
    titles: {
      source: 'Withdraw to',
      banks: 'Select bank',
      country: 'Select country',
      bankForm: 'Enter bank details',
      recipient: 'Enter address',
      amount: 'Enter amount',
      confirm: 'Confirm withdrawal',
      deposit: '',
      fundingDetails: '',
    },
    sources: [BANK_SOURCE, CRYPTO_SOURCE],
    activeSources: [
      { id: 'bank', next: 'banks' },
      { id: 'crypto', next: 'recipient' },
    ],
    details: [
      ['Fee', '$0.60'],
      ['Conversion rate', '1 USD = 17.91 MXN'],
      ['Arrives in bank', 'Instantly'],
    ],
  },
  send: {
    // Recipient-first: the list (banks) is the entry ("Send to"); "Add recipient"
    // opens the chooser (source); crypto enters an address (recipient).
    titles: {
      source: 'Add recipient',
      banks: 'Send to',
      country: 'Select country',
      bankForm: 'Enter bank details',
      recipient: 'Enter address',
      amount: 'Enter amount',
      confirm: 'Confirm send',
      deposit: '',
      fundingDetails: '',
    },
    sources: [BANK_SOURCE, CRYPTO_SOURCE],
    // The "Add recipient" chooser (the recipient list is the entry): Bank → add a
    // bank recipient (country picker); Crypto → enter an address.
    activeSources: [
      { id: 'bank', next: 'country' },
      { id: 'crypto', next: 'recipient' },
    ],
    details: [
      ['Fee', '$0.60'],
      ['Conversion rate', '1 USD = 1 USDC'],
      ['Arrives', 'Instantly'],
    ],
  },
  receive: {
    // Deposit-first: the address list is the entry; only the shared country
    // picker and the picked country's funding-details screen are reachable.
    // No amount / confirm (receiving is share-and-go).
    titles: {
      source: '',
      banks: '',
      country: 'Select country',
      bankForm: '',
      recipient: '',
      amount: '',
      confirm: '',
      deposit: 'Receive via',
      fundingDetails: 'Receive',
    },
    sources: [],
    activeSources: [],
    details: [],
  },
};

/** A receivable chain in the deposit list (Receive flow). The logo is a
 *  self-contained brand tile (rounded bg + mark); addresses are representative. */
interface DepositChain {
  id: string;
  name: string;
  address: string;
  logo: string;
  /** Typical arrival time once sent — the row's third line. */
  time: string;
}

const DEPOSIT_CHAINS: DepositChain[] = [
  { id: 'spark', name: 'Spark', address: 'spark1pgssymd2tclhssydekkfgcj6ldu4d7z0pprcw7nxfng9hktmk7tpmekd4v202u', logo: '/assets/networks/icon-network-spark.svg', time: 'Instant' },
  { id: 'ethereum', name: 'Ethereum', address: '0x7c22793FDae21bBB841B7E25594939Bfdf77c6Cb', logo: '/assets/networks/icon-network-ethereum.svg', time: '1 min' },
  { id: 'solana', name: 'Solana', address: '3JZ4hmYF6u5es6ZtfpuvXxqFZdVVixFZwYrGKuWtHJ5G', logo: '/assets/networks/icon-network-solana.svg', time: 'Instant' },
  { id: 'base', name: 'Base', address: '0x35e6Ea58548aA9Af6b9b059d565888507FeD8C1e', logo: '/assets/networks/icon-network-base.svg', time: 'Instant' },
  { id: 'tron', name: 'Tron', address: 'TF3YB383dJFpxvezNwFVKMEQhSeJ5JTerq', logo: '/assets/networks/icon-network-tron.svg', time: 'Instant' },
  { id: 'btc', name: 'Bitcoin', address: 'bc1qsu2qrhp5vq5csy97qv3w8eku8wrh2l7dtenv7p', logo: '/assets/networks/icon-network-bitcoin.svg', time: '10 min' },
];

/** The instant rail an inbound transfer arrives on, by corridor (PaymentRail
 *  enum) — shown in the received-payment webhook's REALTIME_FUNDING source. */
const RECEIVE_RAIL: Record<string, string> = {
  USD_ACCOUNT: 'RTP',
  EUR_ACCOUNT: 'SEPA_INSTANT',
  MXN_ACCOUNT: 'SPEI',
  GBP_ACCOUNT: 'FASTER_PAYMENTS',
  BRL_ACCOUNT: 'PIX',
  INR_ACCOUNT: 'UPI',
};

/** Realistic inbound funding instructions per rail (Receive → bank). Just what a
 *  sender needs to push a domestic transfer (RTP / ACH / SPEI / SEPA / PIX / …):
 *  the payee name, the account identifier(s) — which already encode the bank
 *  (routing / CLABE / IBAN / sort code / IFSC), so there's no separate bank name
 *  and no SWIFT — and the reference that credits the deposit. Values are
 *  illustrative; the real ones come from GET /customers/internal-accounts. */
function receiveFields(country: BankCountry, beneficiary: string): Array<[string, string]> {
  const ref = `GGA-${country.code.toUpperCase()}-7Q4K2X`;
  const payee: [string, string] = ['Beneficiary', `Lightspark Payments FBO ${beneficiary}`];
  switch (country.accountType) {
    case 'USD_ACCOUNT':
      return [payee, ['Account number', '9876543210'], ['Routing number', '021000021'], ['Reference', ref]];
    case 'EUR_ACCOUNT':
      return [payee, ['IBAN', 'DE89 3704 0044 0532 0130 00'], ['Reference', ref]];
    case 'MXN_ACCOUNT':
      return [payee, ['CLABE', '012180001234567895'], ['Reference', ref]];
    case 'GBP_ACCOUNT':
      return [payee, ['Account number', '12345678'], ['Sort code', '20-00-00'], ['Reference', ref]];
    case 'BRL_ACCOUNT':
      return [payee, ['PIX key', `gga.${country.code}@lightspark.com`], ['Reference', ref]];
    case 'INR_ACCOUNT':
      return [payee, ['Account number', '50100123456789'], ['IFSC', 'HDFC0001234'], ['Reference', ref]];
    default:
      return [payee, ['Account number', '000123456789'], ['Reference', ref]];
  }
}

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


/** What the just-confirmed transfer is going to — lets the wallet's Activity row
 *  and toast reflect the real bank/recipient instead of a placeholder. */
export type TransferActivity =
  | { kind: 'bank'; countryCode: string; bankName: string; last4: string; recipientName: string }
  | { kind: 'crypto'; address: string; network: string };

interface AddMoneySheetProps {
  open: boolean;
  /** Direction of the flow — flips titles, source rows, card order, and copy. */
  mode: MoneySheetMode;
  /** Live cash balance (cents) — displayed, and the withdraw over-balance cap. */
  availableCents: number;
  /** Face ID running — Confirm shows a spinner and input locks. */
  confirming: boolean;
  onDismiss: () => void;
  /** Confirm tapped with the typed amount (cents). Parent runs Face ID.
   *  `activity` carries the real destination for the Activity row + toast. */
  onConfirm: (cents: number, activity: TransferActivity) => void;
  /** Amount committed (the quote beat) — parent logs the create-quote call.
   *  `dest` lets a send reference the recipient's bank/crypto wallet. */
  onQuote?: (cents: number, dest?: TransferDest) => void;
  /** A bank/crypto recipient was added — parent logs POST /customers/external-accounts. */
  onLinkExternalAccount?: (input: ExternalAccountInput, label: string) => void;
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
  open,
  mode,
  availableCents,
  confirming,
  onDismiss,
  onConfirm,
  onQuote,
  onLinkExternalAccount,
  onReceive,
}: AddMoneySheetProps) {
  const reduceMotion = useReducedMotion();
  const theme = useThemeMode();
  const brightness = headerGlassBrightness(theme);
  const { titles, sources, activeSources, details } = MODES[mode];
  const balance = formatUsdCents(availableCents);
  const [step, setStep] = useState<Step>(
    mode === 'send' ? 'banks' : mode === 'receive' ? 'deposit' : 'source',
  );
  const [back, setBack] = useState(false); // direction of the last nav
  // Bumps on every open so the step stack remounts fresh — a flow opened from
  // another flow appears in place, not sliding in like a forward step nav.
  const [openKey, setOpenKey] = useState(0);
  const [raw, setRaw] = useState(''); // typed amount, e.g. "1500.5"
  const [started, setStarted] = useState(false); // Swift's hasStartedTyping
  const [quoting, setQuoting] = useState(false); // fake quote beat on Continue
  const [saving, setSaving] = useState(false); // 500ms validate+save beat on add
  const [pasted, setPasted] = useState(false); // send: address card filled
  const [pastedAddress, setPastedAddress] = useState(''); // the entered crypto address
  // Withdraw-to-crypto destination — a one-off wallet (not a saved list, unlike
  // send recipients). Set when the address is confirmed; feeds selectedCrypto.
  const [cryptoDest, setCryptoDest] = useState<CryptoRecipient | null>(null);
  const quoteTimer = useRef(0);
  const saveTimer = useRef(0);
  const [amountScope, animateAmount] = useAnimate<HTMLParagraphElement>();

  // Bank picker state. savedBanks/savedRecipients persist across sheet opens (the
  // content unmounts on close but this component's state survives) and clear on
  // Reset (the whole wallet remounts). Send picks a RECIPIENT's bank (someone
  // else's), so it keeps a SEPARATE list from your own add/withdraw accounts; the
  // flow + selection always operate on whichever list the current mode is on.
  const isSend = mode === 'send';
  const [savedBanks, setSavedBanks] = useState<SavedBank[]>([]);
  const [savedRecipients, setSavedRecipients] = useState<SavedRecipient[]>([]);
  // The active list for the current mode: send = recipients (a bank OR a crypto
  // address); add/withdraw = your own bank accounts.
  const banks: SavedRecipient[] = isSend ? savedRecipients : savedBanks;
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [pickedCountry, setPickedCountry] = useState<BankCountry | null>(null);
  const [countryQuery, setCountryQuery] = useState('');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formBeneficiary, setFormBeneficiary] = useState(DEMO_BENEFICIARY);
  // Deposit (Receive) list — per-row copy feedback (copy works; QR is a no-op).
  const [copiedChainId, setCopiedChainId] = useState<string | null>(null);
  const copyTimer = useRef(0);
  // Live mid-market rates (Coinbase, cached) with the baked-in usdToLocal as a
  // silent fallback. Display-only; the spread shows as a fee on confirm.
  const { rateFor } = useUsdRates();
  // The selected recipient splits into bank vs crypto so the existing bank logic
  // (FX, rows) stays untouched and crypto keys off its own branch.
  const selected = banks.find((b) => b.id === selectedBankId) ?? null;
  const selectedBank = selected && !('address' in selected) ? selected : null;
  // Send picks crypto from the saved list; withdraw uses a one-off cryptoDest.
  const selectedCrypto = cryptoDest ?? (selected && 'address' in selected ? selected : null);
  // Amount-step currency/FX follow the selected bank — including a send to a
  // recipient's bank (USD → their local currency). Only a crypto send (no bank
  // selected) stays 1:1 USDC.
  const localCurrency = selectedBank ? currencyFor(selectedBank.country) : 'MXN';
  // A crypto destination (a crypto send, or a withdraw to a wallet) stays 1:1
  // USDC; a send with no bank yet is also USDC. Everything else follows the bank.
  const stablecoinDest = !selectedBank && (selectedCrypto != null || mode === 'send');
  const fxRate = selectedBank
    ? rateFor(currencyFor(selectedBank.country), selectedBank.country.usdToLocal)
    : stablecoinDest
      ? 1
      : USD_TO_MXN;
  const fxLabel = stablecoinDest ? 'USDC' : localCurrency;

  // Country picker lists: Popular (by volume) on top, then All (alphabetical);
  // a non-empty query collapses to one name/currency/code match list.
  const countryQ = countryQuery.trim().toLowerCase();
  const allCountries = [...BANK_COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));
  const popularCountries = BANK_COUNTRIES.filter((c) => c.popularRank).sort(
    (a, b) => (a.popularRank ?? 0) - (b.popularRank ?? 0),
  );
  const filteredCountries = allCountries.filter(
    (c) =>
      c.name.toLowerCase().includes(countryQ) ||
      currencyFor(c).toLowerCase().includes(countryQ) ||
      c.code.includes(countryQ),
  );

  // Fresh flow every open — reset DURING render (derive-state-on-prop-change),
  // not in an effect: BottomSheet unmounts the content when closed but this
  // component's state survives, so an effect reset lands a frame AFTER the
  // reopened sheet paints with the stale step — and that deferred confirm →
  // source change played its horizontal push while the sheet rose.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      // Send opens on the recipient list (recipient-first); add/withdraw on the
      // source picker.
      setOpenKey((k) => k + 1);
      setStep(mode === 'receive' ? 'deposit' : isSend ? 'banks' : 'source');
      setBack(false);
      setRaw('');
      setStarted(false);
      setQuoting(false);
      setSaving(false);
      setPasted(false);
      setPastedAddress('');
      setCryptoDest(null);
      setSelectedBankId(null);
      setPickedCountry(null);
      setCountryQuery('');
    }
  }
  // Timer cleanup stays in effects (clearing during render isn't render-pure).
  useEffect(() => {
    if (open) window.clearTimeout(quoteTimer.current);
  }, [open]);
  useEffect(
    () => () => {
      window.clearTimeout(quoteTimer.current);
      window.clearTimeout(copyTimer.current);
      window.clearTimeout(saveTimer.current);
    },
    [],
  );

  const go = (next: Step, isBack = false) => {
    setBack(isBack);
    setStep(next);
  };

  // Copy a value to the clipboard (Receive deposit addresses + funding-detail
  // rows); the tapped control flips to a checkmark for a beat, keyed by `id`.
  // QR stays a no-op visual.
  const copyValue = (id: string, text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedChainId(id);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopiedChainId(null), 1400);
  };

  // Share the funding instructions (native share sheet; clipboard fallback).
  const shareFunding = () => {
    if (!pickedCountry) return;
    const text = receiveFields(pickedCountry, formBeneficiary)
      .map(([label, value]) => `${label}: ${value}`)
      .join('\n');
    if (navigator.share) {
      navigator.share({ title: `Receive from ${pickedCountry.name}`, text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text).catch(() => {});
    }
  };

  // Share the bank details, then fire the (simulated) inbound payment from a
  // random payer in the country's name pool — name + last initial for display,
  // full name for the webhook's counterpartyInformation.
  const shareFundingAndReceive = () => {
    shareFunding();
    if (!pickedCountry) return;
    const pool = recipientNamesFor(pickedCountry);
    const full = pool[Math.floor(Math.random() * pool.length)];
    onReceive?.({
      via: 'bank',
      countryCode: pickedCountry.code,
      countryName: pickedCountry.name,
      payer: firstNameLastInitial(full),
      payerFull: full,
      rail: RECEIVE_RAIL[pickedCountry.accountType] ?? 'BANK_TRANSFER',
    });
  };

  // Bank flow handlers.
  const openAddBank = () => {
    setPickedCountry(null);
    setCountryQuery('');
    // Send: choose Bank or Crypto first (the recipient list is the entry).
    // Add/withdraw: straight to the country picker (source is the entry).
    go(isSend ? 'source' : 'country');
  };
  const pickCountry = (country: BankCountry) => {
    setPickedCountry(country);
    setFormValues(sampleValuesFor(country));
    // Send is to someone else: cycle the country's recipient-name pool by how many
    // recipients from it are already saved, so repeats aren't the same person.
    // Add/withdraw are your own accounts, so it's you.
    if (isSend) {
      const pool = recipientNamesFor(country);
      const count = banks.filter(
        (b) => !('address' in b) && b.country.code === country.code,
      ).length;
      setFormBeneficiary(pool[count % pool.length]);
    } else {
      setFormBeneficiary(DEMO_BENEFICIARY);
    }
    // Receive shows the picked country's funding instructions; add/withdraw/send
    // collect the external-account fields.
    go(mode === 'receive' ? 'fundingDetails' : 'bankForm');
  };
  const updateField = (key: string, value: string) =>
    setFormValues((v) => ({ ...v, [key]: value }));
  const addBank = () => {
    if (!pickedCountry || saving) return;
    const country = pickedCountry;
    // Cycle the country's bank pool by how many of it are already saved, so a
    // second add from the same country shows a different bank (not a clone).
    const pool = country.banks ?? [country.bankName];
    const sameCountry = banks.filter(
      (b) => !('address' in b) && b.country.code === country.code,
    ).length;
    const bank: SavedBank = {
      id: `${country.accountType}-${Date.now()}`,
      country,
      bankName: pool[sameCountry % pool.length],
      values: formValues,
      beneficiary: formBeneficiary,
    };
    // Brief validate+save beat (spinner in the CTA) before landing on amount, so
    // the save reads as real; the external-account call + toast fire on completion.
    // Intent is clear (you just added it), so we then skip the list and go to
    // amount; Back from there returns to the list (backFrom['amount'] → 'banks').
    setSaving(true);
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      if (isSend) setSavedRecipients((r) => [...r, bank]);
      else setSavedBanks((r) => [...r, bank]);
      onLinkExternalAccount?.(
        {
          kind: 'bank',
          accountType: country.accountType,
          currency: currencyFor(country),
          bankName: bank.bankName,
          fields: formValues,
          beneficiary: formBeneficiary,
        },
        isSend ? 'Add recipient' : 'Add bank account',
      );
      setSelectedBankId(bank.id);
      setSaving(false);
      go('amount');
    }, SAVE_MS);
  };

  // Save the pasted crypto address as a recipient (after a validate+save beat),
  // then go straight to amount (Back returns to the recipient list).
  const addCryptoRecipient = () => {
    if (saving) return;
    const recipient: CryptoRecipient = {
      id: `crypto-${Date.now()}`,
      address: pastedAddress || randomSolanaAddress(),
      network: 'Solana',
    };
    setSaving(true);
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      setSavedRecipients((r) => [...r, recipient]);
      onLinkExternalAccount?.(
        { kind: 'crypto', address: recipient.address, network: recipient.network },
        'Add recipient',
      );
      setSelectedBankId(recipient.id);
      setPasted(false);
      setPastedAddress('');
      setSaving(false);
      go('amount');
    }, SAVE_MS);
  };
  const selectBank = (id: string) => {
    setSelectedBankId(id);
    go('amount');
  };

  // Withdraw-to-crypto: confirm the typed wallet as a one-off destination (after a
  // validate+save beat), link it as an external account, then go to amount.
  const useCryptoWithdraw = () => {
    if (saving) return;
    const dest: CryptoRecipient = {
      id: `crypto-${Date.now()}`,
      address: pastedAddress || randomSolanaAddress(),
      network: 'Solana',
    };
    setSaving(true);
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      setCryptoDest(dest);
      onLinkExternalAccount?.(
        { kind: 'crypto', address: dest.address, network: dest.network },
        'Add crypto wallet',
      );
      setSaving(false);
      go('amount');
    }, SAVE_MS);
  };

  // The just-confirmed destination — drives the wallet's Activity row + toast so
  // they mirror the real bank/recipient (not a placeholder).
  const activityForConfirm = (): TransferActivity =>
    selectedCrypto
      ? { kind: 'crypto', address: selectedCrypto.address, network: selectedCrypto.network }
      : {
          kind: 'bank',
          countryCode: selectedBank?.country.code ?? 'mx',
          bankName: selectedBank?.bankName ?? 'Bank account',
          last4: selectedBank ? accountLast4(selectedBank.values) : '0000',
          recipientName: selectedBank?.beneficiary ?? '',
        };

  // Back walks the mode's own path: the bank flow detours through banks/country;
  // send detours through the recipient step.
  // Back paths differ by mode. Send is recipient-first: the list (banks) is the
  // entry (no back → close), Add opens the Bank/Crypto chooser (source). Add/
  // withdraw are source-first: source is the entry.
  const backFrom: Partial<Record<Step, Step>> =
    mode === 'receive'
      ? {
          // Deposit is the entry (→ close); the picker and details walk back up.
          country: 'deposit',
          fundingDetails: 'country',
        }
      : isSend
        ? {
            confirm: 'amount',
            amount: 'banks',
            bankForm: 'country',
            country: 'source',
            recipient: 'source',
            source: 'banks',
          }
        : {
            confirm: 'amount',
            // Crypto withdraw reaches amount via the address step; bank via the list.
            amount: selectedCrypto ? 'recipient' : 'banks',
            bankForm: 'country',
            country: 'banks',
            recipient: 'source',
            banks: 'source',
            // Add-from-crypto: the deposit-address list drills off the source list.
            deposit: 'source',
          };
  // The entry step shows the X (close); every other step shows the back arrow.
  const isEntryStep =
    mode === 'receive' ? step === 'deposit' : isSend ? step === 'banks' : step === 'source';

  // Swift's ShakeEffect (8px x sin, three half-cycles), tightened to 0.28s —
  // invalid amount on Continue, or a keypress past the cap.
  const shakeAmount = () => {
    if (reduceMotion || !amountScope.current) return;
    animateAmount(
      amountScope.current,
      { x: [0, 8, -8, 8, 0] },
      { duration: 0.28, ease: 'linear' },
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

  // Confirm details: mid-market rate + a 0.30% spread fee (the real FX model).
  // Any selected bank (incl. a send to a recipient's bank); a crypto send (no
  // bank) keeps the static 1:1 USDC details.
  const FEE_BPS = 30;
  const feeCents = Math.round((cents * FEE_BPS) / 10000);
  // A crypto destination (send or withdraw) settles 1:1 in USDC — no FX row.
  const cryptoDetails: Array<[string, string]> = [
    ['Fee', '$0.60'],
    ['Conversion rate', '1 USD = 1 USDC'],
    [mode === 'withdraw' ? 'Arrives in wallet' : 'Arrives', 'Instantly'],
  ];
  const confirmDetails: Array<[string, string]> = selectedBank
    ? [
        ['Exchange rate', `1 USD = ${formatRate(fxRate)} ${localCurrency}`],
        ['Fee (0.30%)', formatUsdCents(feeCents)],
        [mode === 'add' ? 'Arrives' : 'Arrives in bank', 'Instantly'],
      ]
    : selectedCrypto
      ? cryptoDetails
      : details;

  // "Use max" (withdraw) — fill the typed amount with the exact balance. The
  // forced ".00" renders as typed (solid) cents, same as keying them in.
  const useMax = () => {
    if (confirming) return;
    setStarted(true);
    setRaw((availableCents / 100).toFixed(2));
  };

  // Continue is always active (Swift parity): an invalid amount errors out with
  // a shake on the amount instead of a disabled button. A valid amount "creates
  // a quote": the CTA spins for a beat before the confirm step. Withdrawals
  // also can't exceed the cash balance — over-balance shakes (typing doesn't).
  const tryContinue = () => {
    if (confirming || quoting) return;
    if (cents > 0 && (mode === 'add' || cents <= availableCents)) {
      // Reference the picked destination: a crypto wallet, or a bank (the
      // recipient's for a send, the off-ramp bank for a withdraw).
      const dest: TransferDest | undefined = selectedCrypto
        ? { kind: 'crypto' }
        : selectedBank
          ? { kind: 'bank', currency: localCurrency }
          : undefined;
      onQuote?.(cents, dest);
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

  // Amount-step cards: bank ⇄ cash balance. The TOP card is the money's source
  // (bank when adding, balance when withdrawing) and carries the amount input;
  // the bottom card is the destination — so the rows swap slots with the mode.
  const bankRow = (
    <div className={styles.sourceRowStatic}>
      <span className={styles.tile} aria-hidden>
        {selectedBank ? (
          <Flag code={selectedBank.country.code} size={20} />
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
          className={styles.tokenIconSm}
          src="/assets/send/icon-token-sol.svg"
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
  // The funding-details step titles itself with the picked country's name (e.g.
  // "Mexico"); every other step uses the mode's static step title.
  const displayTitle =
    step === 'fundingDetails' && pickedCountry
      ? `Receive from ${pickedCountry.name}`
      : titles[step];
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
            {isEntryStep ? (
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
                onClick={() => go(backFrom[step] ?? 'source', true)}
                disabled={confirming}
              >
                <SfSymbol name="chevron.left" size={15} />
              </GlassSymbolButton>
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
                  <GlassSymbolButton
                    aria-label="Scan QR code"
                    size={40}
                    type="button"
                    glass={{ brightness }}
                  >
                    <SfSymbol name="viewfinder" size={17} />
                  </GlassSymbolButton>
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
                  <GlassSymbolButton
                    aria-label={isSend ? 'Add recipient' : 'Add bank account'}
                    size={40}
                    type="button"
                    glass={{ brightness }}
                    onClick={openAddBank}
                  >
                    <SfSymbol name="plus" size={15} />
                  </GlassSymbolButton>
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
                          <img
                            className={styles.tileIcon}
                            src="/assets/add-money/IconBank.svg"
                            alt=""
                            draggable={false}
                          />
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
                              styles.fundingRow,
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
                  <GlassTextButton variant="primary" onClick={shareFundingAndReceive}>
                    <span className={styles.shareCta}>
                      <IconArrowOutOfBox size={20} className={styles.shareCtaIcon} />
                      Share
                    </span>
                  </GlassTextButton>
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
                    {sources.map((s, i) => {
                      const active = activeSources.find((a) => a.id === s.id);
                      return (
                      <button
                        key={s.id}
                        type="button"
                        className={styles.sourceRow}
                        disabled={!active}
                        onClick={() => {
                          if (!active) return;
                          // Crypto path starts a fresh address; bank path drops any
                          // crypto destination so the two never bleed together.
                          if (s.id === 'crypto') {
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
                          {s.Icon ? (
                            <s.Icon size={24} className={styles.tileGlyph} />
                          ) : (
                            <img className={styles.tileIcon} src={s.icon} alt="" draggable={false} />
                          )}
                        </span>
                        <span
                          className={clsx(
                            styles.sourceContent,
                            i < sources.length - 1 && styles.sourceContentBordered,
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
                                src="/assets/send/icon-token-sol.svg"
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
                      <ConcentricBottomCard
                        className={clsx(styles.card, styles.cardFlush, styles.pickerCard)}
                      >
                        {allCountries.map((c, i, arr) => (
                          <CountryPickRow
                            key={c.code}
                            country={c}
                            bordered={i < arr.length - 1}
                            onSelect={pickCountry}
                          />
                        ))}
                      </ConcentricBottomCard>
                    </>
                  )}
                </div>
                <TopFade />
                {/* Pinned frosted-glass search pill — the list scrolls behind it
                    and frosts through (FrostPanel: backdrop-filter + specular
                    rim). Refraction over scrolling DOM isn't possible, so frost. */}
                <div className={styles.searchPill}>
                  <FrostPanel
                    radius={22}
                    cornerSmoothing={0}
                    tint="var(--search-pill-tint)"
                    tintBlur={4}
                    // The geometry-aware specular IS the rim now (the buttons'
                    // SYMBOL_GLASS highlight, minus refraction), so drop the flat
                    // edge stroke that doubled it.
                    edge="none"
                    specular={{
                      rotation: 45,
                      glowStrength: 0.06,
                      glowSpread: 0.5,
                      glowExponent: 1.5,
                      edgeStrength: 1,
                      // Dark: 1px reads like the button's delicate glint. Light: a
                      // white rim barely shows on the near-white pill, so thicken it.
                      edgeWidth: theme === 'dark' ? 1 : 2,
                      edgeExponent: 1.5,
                      // Dark matches the button (1); light pushes the gain harder so
                      // the edge reads against the bright fill.
                      strength: theme === 'dark' ? 1 : 1.6,
                    }}
                  >
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
                  </FrostPanel>
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
                  <GlassTextButton variant="primary" onClick={addBank}>
                    {saving ? (
                      <span className={styles.spinner} aria-label="Saving">
                        <IconLoadingCircle size={20} />
                      </span>
                    ) : isSend ? (
                      'Add recipient'
                    ) : (
                      'Add bank account'
                    )}
                  </GlassTextButton>
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
                                <p className={styles.addressSub}>Solana</p>
                              </div>
                              <span className={clsx(styles.tile, styles.addressTile)} aria-hidden>
                                <img
                                  className={styles.tokenIcon}
                                  src="/assets/send/icon-token-sol.svg"
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
                              setPastedAddress(randomSolanaAddress());
                              setPasted(true);
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
                            format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
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
                    <GlassTextButton
                      variant="primary"
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
