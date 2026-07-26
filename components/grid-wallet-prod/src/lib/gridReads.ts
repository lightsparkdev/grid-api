'use client';

// Type-only, and from the leaf module (apps/shared/wallet/types imports nothing)
// so the wallet brain's row shape can be built here without an import cycle.
import type { WalletListItemData } from '@/apps/shared/wallet/types';
import { gridFetch } from './gridClient';
import type { LogFn } from './gridSession';
import { amountToCents, formatCents } from './gridUnits';

const CUSTOMER = '{customerId}';

export interface RawCurrencyAmount {
  amount: number;
  currency: { code: string; decimals: number };
}
export interface RawTransaction {
  id: string;
  type: 'INCOMING' | 'OUTGOING';
  direction?: 'CREDIT' | 'DEBIT';
  status: string;
  createdAt?: string;
  sentAmount?: RawCurrencyAmount;
  receivedAmount?: RawCurrencyAmount;
  source?: { accountId?: string; sourceType?: string };
  destination?: { accountId?: string; destinationType?: string };
  // Grid's CounterpartyInformation is a free-form key/value bag
  // (openapi/components/schemas/transactions/CounterpartyInformation.yaml);
  // FULL_NAME is the field the API actually populates for a person's name.
  counterpartyInformation?: { FULL_NAME?: string };
}

export interface RawFundingInstruction {
  accountOrWalletInfo?: {
    accountType?: string;
    accountNumber?: string;
    routingNumber?: string;
    iban?: string;
    reference?: string;
    paymentRails?: string[];
    beneficiaryName?: string;
    /** Crypto rails: the on-chain address funds are sent to. */
    address?: string;
    assetType?: string;
  };
  instructionsNotes?: string;
}

/** A real on-chain deposit address, one per network Grid provisioned. */
export interface DepositWallet {
  /** Network id matching the UI's chain list ('base' | 'solana' | …). */
  network: string;
  accountType: string;
  address: string;
  asset: string;
}

/** accountType → the chain id the wallet UI uses. */
const WALLET_NETWORKS: Record<string, string> = {
  SOLANA_WALLET: 'solana',
  BASE_WALLET: 'base',
  ETHEREUM_WALLET: 'ethereum',
  POLYGON_WALLET: 'polygon',
  SPARK_WALLET: 'spark',
  TRON_WALLET: 'tron',
  BITCOIN_WALLET: 'btc',
};

/** One currency's inbound details — one per fiat account Grid returns. */
export interface DepositSection {
  /** Currency code, shown above the rows when there's more than one section. */
  label: string;
  /** Label/value rows, exactly the fields Grid returned — nothing invented. */
  rows: Array<[string, string]>;
  /** Grid's own note (e.g. "include the reference in the memo"), when present. */
  note: string | null;
  /** Stand-in values, not read from Grid (see data/placeholderDeposit). */
  placeholder?: boolean;
}

/** Where money comes IN: the customer's own accounts, ready to display. */
export interface DepositInstructions {
  accountId: string;
  /** Bank details, one section per fiat account. */
  sections: DepositSection[];
  /** On-chain addresses, one per network on the crypto account. */
  wallets: DepositWallet[];
  /** Trailing digits of the account the deposit lands in (activity row label). */
  last4: string;
}

/** Pure: one fiat account's funding instruction -> display rows. */
export function fundingInstructionRows(inst: RawFundingInstruction): Array<[string, string]> {
  const info = inst.accountOrWalletInfo ?? {};
  const rows: Array<[string, string]> = [];
  if (info.beneficiaryName) rows.push(['Beneficiary', info.beneficiaryName]);
  if (info.accountNumber) rows.push(['Account number', info.accountNumber]);
  if (info.routingNumber) rows.push(['Routing number', info.routingNumber]);
  if (info.iban) rows.push(['IBAN', info.iban]);
  if (info.paymentRails?.length) rows.push(['Rails', info.paymentRails.join(' · ')]);
  if (info.reference) rows.push(['Reference', info.reference]);
  return rows;
}

/**
 * Everything the customer can be paid into: bank details per fiat account, and
 * on-chain addresses per network on the crypto account. All real values from Grid
 * — the demo displays them and invents nothing. Null when there's nothing to show.
 */
export async function fetchDepositInstructions(log: LogFn): Promise<DepositInstructions | null> {
  const env = await gridFetch('GET', `/customers/internal-accounts?customerId=${CUSTOMER}`);
  log(env);
  if (env.response.status !== 200) return null;
  const body = env.response.body as {
    data: {
      id: string;
      balance: { currency: { code: string } };
      fundingPaymentInstructions?: RawFundingInstruction[];
    }[];
  };
  const sections: DepositSection[] = [];
  const wallets: DepositWallet[] = [];
  let accountId = '';
  let last4 = '';
  for (const account of body.data ?? []) {
    for (const inst of account.fundingPaymentInstructions ?? []) {
      const info = inst.accountOrWalletInfo ?? {};
      // Crypto rails carry an address; bank rails carry account identifiers.
      if (info.address) {
        const network = info.accountType ? WALLET_NETWORKS[info.accountType] : undefined;
        if (network) {
          wallets.push({
            network,
            accountType: info.accountType!,
            address: info.address,
            asset: info.assetType ?? account.balance.currency.code,
          });
        }
        continue;
      }
      const rows = fundingInstructionRows(inst);
      if (!rows.length) continue;
      sections.push({
        label: account.balance.currency.code,
        rows,
        note: inst.instructionsNotes ?? null,
      });
      if (!accountId) {
        accountId = account.id;
        const number = info.accountNumber ?? info.iban ?? '';
        last4 = number.replace(/\s/g, '').slice(-4);
      }
    }
  }
  return sections.length || wallets.length ? { accountId, sections, wallets, last4 } : null;
}

/**
 * The USDB embedded wallet's two figures. `balance` is spendable; `totalBalance`
 * is the book total, which in sandbox runs ahead of it because
 * `POST /sandbox/internal-accounts/{id}/fund` mints book balance that can't be
 * moved. The wallet leads with spendable so it never promises money a transfer
 * would reject, and surfaces the gap separately.
 */
export interface WalletBalance {
  spendableCents: number;
  totalCents: number;
}

/**
 * The customer's fiat account and what is sitting in it. Money pushed to the
 * deposit instructions lands here as USD, NOT in the USDB wallet the phone shows,
 * so the demo sweeps it across (see sweepUsdToWallet in the demo hook).
 */
export async function fetchFiatBalance(
  log: LogFn,
): Promise<{ accountId: string; cents: number } | null> {
  const env = await gridFetch(
    'GET',
    `/customers/internal-accounts?customerId=${CUSTOMER}&type=INTERNAL_FIAT`,
  );
  log(env);
  if (env.response.status !== 200) return null;
  const body = env.response.body as {
    data: { id: string; balance: { amount: number; currency: { decimals: number } } }[];
  };
  const account = body.data[0];
  if (!account) return null;
  return {
    accountId: account.id,
    cents: amountToCents(account.balance.amount, account.balance.currency.decimals),
  };
}

export async function fetchBalance(log: LogFn): Promise<WalletBalance> {
  const env = await gridFetch(
    'GET',
    `/customers/internal-accounts?customerId=${CUSTOMER}&type=EMBEDDED_WALLET`,
  );
  log(env);
  if (env.response.status !== 200) return { spendableCents: 0, totalCents: 0 };
  const body = env.response.body as {
    data: {
      balance: { amount: number; currency: { decimals: number } };
      totalBalance?: { amount: number; currency: { decimals: number } };
    }[];
  };
  const account = body.data[0];
  const b = account?.balance;
  const t = account?.totalBalance;
  const spendableCents = b ? amountToCents(b.amount, b.currency.decimals) : 0;
  return {
    spendableCents,
    totalCents: t ? amountToCents(t.amount, t.currency.decimals) : spendableCents,
  };
}

export async function fetchBalanceCents(log: LogFn): Promise<number> {
  return (await fetchBalance(log)).spendableCents;
}

/**
 * Which transactions belong on the phone's Activity list. EXPIRED is a quote
 * that timed out before execution — no money ever moved, and a real wallet
 * doesn't list abandoned attempts. Everything else (settled, in flight, failed)
 * is a real event the customer would expect to see.
 */
export function isDisplayableTransaction(t: RawTransaction): boolean {
  return t.status !== 'EXPIRED';
}

/** Status → the row's detail suffix. COMPLETED reads as the action itself. */
function statusLabel(status: string): string | null {
  if (status === 'COMPLETED') return null;
  if (status === 'PENDING' || status === 'PROCESSING') return 'Processing';
  // FAILED / REJECTED / REFUNDED / anything new: show it as-is, sentence case.
  return status.charAt(0) + status.slice(1).toLowerCase();
}

/**
 * Pure: one Grid transaction -> an Activity row (the shape every skin renders).
 *
 * `walletAccountId` decides the direction when given, and it has to: Grid records
 * an inbound PULL as a `DEBIT` (it debits the external source account), so keying
 * off `direction` alone labelled money arriving in the wallet as "Money sent".
 * What matters for a wallet row is which side of the transfer the WALLET is on.
 */
export function transactionToRow(t: RawTransaction, walletAccountId?: string): WalletListItemData {
  const intoWallet = !!walletAccountId && t.destination?.accountId === walletAccountId;
  const outOfWallet = !!walletAccountId && t.source?.accountId === walletAccountId;
  const credit = intoWallet
    ? true
    : outOfWallet
      ? false
      : t.direction
        ? t.direction === 'CREDIT'
        : t.type === 'INCOMING';
  // Inbound: what landed in the wallet. Outbound: what left it (the destination
  // leg can be another currency entirely — a USDB → MXN cash-out).
  const money = credit ? t.receivedAmount : t.sentAmount;
  const cents = money ? amountToCents(money.amount, money.currency.decimals) : 0;
  const settledAs = credit ? undefined : t.receivedAmount?.currency.code;
  const converted = settledAs && settledAs !== t.sentAmount?.currency.code ? settledAs : null;

  const action = credit ? 'Added to balance' : converted ? `Sent as ${converted}` : 'Sent from balance';
  const status = statusLabel(t.status);
  return {
    id: t.id,
    // No merchant, brand or person on these — the tile shows the direction.
    flow: credit ? 'in' : 'out',
    title: t.counterpartyInformation?.FULL_NAME ?? (credit ? 'Money added' : 'Money sent'),
    detail: status ? `${action} · ${status}` : action,
    // Inbound carries the "+"; outbound shows the plain amount (makeTransferRow's
    // convention, so server rows and in-session rows read identically).
    amount: credit ? `+${formatCents(cents)}` : formatCents(cents),
    timestamp: t.createdAt ? Date.parse(t.createdAt) : 0,
  };
}

/**
 * The wallet's history. When the wallet account id is known, only transactions
 * that TOUCH it are listed: funding arrives in two legs (a credit into the fiat
 * account, then the conversion into the wallet) and listing both would show the
 * same money twice. The leg that credits the wallet is the one the balance moved
 * on, so that's the row.
 */
export async function fetchActivity(
  log: LogFn,
  walletAccountId?: string,
): Promise<WalletListItemData[]> {
  const env = await gridFetch('GET', `/transactions?customerId=${CUSTOMER}&limit=20`);
  log(env);
  if (env.response.status !== 200) return [];
  const body = env.response.body as { data: RawTransaction[] };
  const touchesWallet = (t: RawTransaction) =>
    !walletAccountId ||
    t.destination?.accountId === walletAccountId ||
    t.source?.accountId === walletAccountId;
  return (body.data ?? [])
    .filter(isDisplayableTransaction)
    .filter(touchesWallet)
    .map((t) => transactionToRow(t, walletAccountId))
    .sort((a, b) => b.timestamp - a.timestamp);
}

/** One of the customer's registered payout/funding accounts, as Grid stores it. */
export interface RawExternalAccount {
  id: string;
  currency?: string;
  status?: string;
  accountInfo?: {
    accountType?: string;
    accountNumber?: string;
    routingNumber?: string;
    iban?: string;
    beneficiary?: { fullName?: string };
  };
}

/**
 * The customer's external accounts, so the saved-banks list shows what Grid
 * actually holds instead of only what was added this session. Filtered to the
 * corridors this wallet settles (USD/EUR) and to ACTIVE accounts — the customer
 * may have older accounts on rails the app no longer offers, and a row that
 * can't be quoted is worse than no row. Newest first.
 */
/**
 * Identity of a payout account: the numbers a payment is actually addressed to.
 * Two records with the same routing + account number (or the same IBAN) are the
 * same bank account however many times they were registered, so the list shows
 * one row for them.
 */
export function externalAccountKey(account: RawExternalAccount): string {
  const info = account.accountInfo ?? {};
  const digits = (v?: string) => (v ?? '').replace(/[\s-]/g, '').toLowerCase();
  const identity = info.iban
    ? `iban:${digits(info.iban)}`
    : `acct:${digits(info.routingNumber)}/${digits(info.accountNumber)}`;
  return `${info.accountType ?? ''}|${identity}`;
}

export async function fetchExternalAccounts(log: LogFn): Promise<RawExternalAccount[]> {
  const env = await gridFetch('GET', `/customers/external-accounts?customerId=${CUSTOMER}`);
  log(env);
  if (env.response.status !== 200) return [];
  const body = env.response.body as { data: RawExternalAccount[] };
  const supported = new Set(['USD_ACCOUNT', 'EUR_ACCOUNT']);
  const seen = new Set<string>();
  return (body.data ?? [])
    .filter(
      (a) =>
        (a.status ?? 'ACTIVE') === 'ACTIVE' &&
        a.accountInfo?.accountType &&
        supported.has(a.accountInfo.accountType),
    )
    .reverse() // newest first, so a duplicate keeps the most recent registration
    .filter((a) => {
      const key = externalAccountKey(a);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
