/**
 * Money-sheet BRAIN data: the skin-blind types, flow config, and pure helpers the
 * add/withdraw/send/receive flow runs on. No JSX. Paired with `useMoneySheet`
 * (the stateful hook) so every skin's sheet FACE shares one source of truth for
 * steps, FX data, networks, and field handling.
 */
import { IconWallet1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconWallet1';
import { BANK_COUNTRIES, currencyFor, type BankCountry } from '@/data/bankCountries';
import { BANK_ACCOUNT_SCHEMAS } from '@/data/bankAccountFields.generated';
import type { MoneySheetMode } from './types';

export { BANK_COUNTRIES };

// The bank flow adds three steps between source and amount: a saved-banks list
// (empty first), a country picker, and a pre-filled account form.
export type Step =
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
  /** Brand logo for the recipient avatar / address tile. */
  logo: string;
  /** Settlement currency (USDC/USDB/USDT/BTC) — drives the amount label + quote. */
  currency: string;
  /** ExternalAccount accountType for the linked-account call. */
  accountType: string;
}

/** A send recipient: someone else's bank account OR a crypto address.
 *  Discriminate with `'address' in r` (only the crypto variant has it). */
export type SavedRecipient = SavedBank | CryptoRecipient;

export const DEMO_BENEFICIARY = 'Pat Teehantri';

/** "Carlos Herrera" → "Carlos H." — the Receive payer label (fiat). */
export function firstNameLastInitial(name: string): string {
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
 *  (country override > spec field example), with the fixed CFA region applied. */
export function sampleValuesFor(country: BankCountry): Record<string, string> {
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
export function accountLast4(values: Record<string, string>): string {
  const raw = Object.values(values).join('');
  const digits = raw.replace(/\D/g, '');
  return digits.slice(-4) || raw.slice(-4);
}

/** Compact rate for "1 USD = X" — fewer decimals as the magnitude grows. */
export function formatRate(rate: number): string {
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

export function fieldLabel(key: string): string {
  return FIELD_LABELS[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
}

/** Demo FX — matches the Figma copy (1 MXN = 0.06 USD ⇒ 1 USD ≈ 17.9074 MXN). */
export const USD_TO_MXN = 17.9074;
/** Fake quote-creation beat: Continue spins this long before the confirm step. */
export const QUOTE_MS = 750;
/** Validate+save beat: the add bank/recipient CTA spins this long before amount. */
export const SAVE_MS = 500;

export interface SourceRow {
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
export const MODES: Record<
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
export interface DepositChain {
  id: string;
  name: string;
  address: string;
  logo: string;
  /** Typical arrival time once sent — the row's third line. */
  time: string;
}

export const DEPOSIT_CHAINS: DepositChain[] = [
  { id: 'spark', name: 'Spark', address: 'spark1pgssymd2tclhssydekkfgcj6ldu4d7z0pprcw7nxfng9hktmk7tpmekd4v202u', logo: '/assets/networks/icon-network-spark.svg', time: 'Instant' },
  { id: 'ethereum', name: 'Ethereum', address: '0x7c22793FDae21bBB841B7E25594939Bfdf77c6Cb', logo: '/assets/networks/icon-network-ethereum.svg', time: '1 min' },
  { id: 'solana', name: 'Solana', address: '3JZ4hmYF6u5es6ZtfpuvXxqFZdVVixFZwYrGKuWtHJ5G', logo: '/assets/networks/icon-network-solana.svg', time: 'Instant' },
  { id: 'base', name: 'Base', address: '0x35e6Ea58548aA9Af6b9b059d565888507FeD8C1e', logo: '/assets/networks/icon-network-base.svg', time: 'Instant' },
  { id: 'tron', name: 'Tron', address: 'TF3YB383dJFpxvezNwFVKMEQhSeJ5JTerq', logo: '/assets/networks/icon-network-tron.svg', time: 'Instant' },
  { id: 'btc', name: 'Bitcoin', address: 'bc1qsu2qrhp5vq5csy97qv3w8eku8wrh2l7dtenv7p', logo: '/assets/networks/icon-network-bitcoin.svg', time: '10 min' },
];

/** Static demo BTC price — an L1 Bitcoin send shows the amount in BTC and this
 *  rate on confirm (the real quote settles in BTC). */
export const BTC_USD = 65000;

/** On-chain Bitcoin network fee estimate for the L1 send — a ~150 vByte
 *  native-segwit (P2WPKH) transaction at ~40 sat/vByte. Flat: network fees track
 *  the transaction's size, not the amount sent. */
const BTC_TX_VBYTES = 150;
const BTC_FEE_SAT_PER_VBYTE = 40;
export const BTC_NETWORK_FEE_USD = ((BTC_TX_VBYTES * BTC_FEE_SAT_PER_VBYTE) / 1e8) * BTC_USD;

/** A pickable crypto destination (Send / Withdraw-to-crypto). Reuses the Receive
 *  chains' addresses + brand logos, plus the ExternalAccount `accountType` and
 *  settlement `currency` each maps to. */
export interface SendNetwork extends DepositChain {
  accountType: string;
  currency: string;
}
const SEND_NETWORK_META: Record<string, { accountType: string; currency: string }> = {
  spark: { accountType: 'SPARK_WALLET', currency: 'USDB' },
  ethereum: { accountType: 'ETHEREUM_WALLET', currency: 'USDC' },
  solana: { accountType: 'SOLANA_WALLET', currency: 'USDC' },
  base: { accountType: 'BASE_WALLET', currency: 'USDC' },
  tron: { accountType: 'TRON_WALLET', currency: 'USDT' },
  btc: { accountType: 'BITCOIN_WALLET', currency: 'BTC' },
};
export const SEND_NETWORKS: SendNetwork[] = DEPOSIT_CHAINS.map((c) => ({
  ...c,
  ...SEND_NETWORK_META[c.id],
}));
export const DEFAULT_SEND_NETWORK = SEND_NETWORKS.find((n) => n.id === 'solana') ?? SEND_NETWORKS[0];

/** The instant rail an inbound transfer arrives on, by corridor (PaymentRail
 *  enum) — shown in the received-payment webhook's REALTIME_FUNDING source. */
export const RECEIVE_RAIL: Record<string, string> = {
  USD_ACCOUNT: 'RTP',
  EUR_ACCOUNT: 'SEPA_INSTANT',
  MXN_ACCOUNT: 'SPEI',
  GBP_ACCOUNT: 'FASTER_PAYMENTS',
  BRL_ACCOUNT: 'PIX',
  INR_ACCOUNT: 'UPI',
};

/** Realistic inbound funding instructions per rail (Receive → bank): the payee
 *  name, the account identifier(s), and the reference that credits the deposit. */
export function receiveFields(country: BankCountry, beneficiary: string): Array<[string, string]> {
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

export const KEYPAD: Array<Array<string>> = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'del'],
];
