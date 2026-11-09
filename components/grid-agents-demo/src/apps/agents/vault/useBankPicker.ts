import { useEffect, useState } from 'react';
import { BANK_ACCOUNT_SCHEMAS } from '@/data/bankAccountFields.generated';
import { BANK_COUNTRIES, currencyFor, type BankCountry } from '@/data/bankCountries';
import { FUNDING_POPULAR, fieldLabel } from '@/data/bankSamples';
import type { AgentAsk } from '../conversation';
import { bankFor, linkBank, linkedBank, type LinkedBank } from '../linkedBank';
import { draftRecipient, recipientNamed, saveRecipient } from '../recipients';

/*
 * Linking a bank to top up, as the Global Accounts playground adds one (grid-wallet-demo AddBankSheet): pick the
 * bank's country from a searchable list, each row naming its local rail, then confirm the account details, which
 * come filled in with that country's fields from the API spec. Each app draws these steps its own way.
 */

const LINK_MS = 900;
const LINKED_MS = 650;

export const BANK_ALL = [...BANK_COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));
export const BANK_POPULAR = FUNDING_POPULAR;
/** Rails that settle in seconds, for the apps that filter by them. */
export const BANK_INSTANT = BANK_ALL.filter((c) => !['ACH', 'Wire', 'Bank Transfer', 'SEPA'].includes(c.rail));

/** "SPEI · MXN" */
export const railLine = (c: BankCountry) => `${c.rail} · ${currencyFor(c)}`;

/** "SPEI in MXN, usually lands in seconds" */
export function railBlurb(c: BankCountry) {
  const cur = currencyFor(c);
  switch (c.rail) {
    case 'ACH':
      return `ACH in ${cur}`;
    case 'Bank Transfer':
      return `Bank transfer in ${cur}`;
    default:
      return `${c.rail} in ${cur}, usually lands in seconds`;
  }
}

/** "Most popular", "#3 popular", or nothing for the long tail. */
export function popularity(c: BankCountry) {
  const i = BANK_POPULAR.indexOf(c);
  if (i < 0) return null;
  return i === 0 ? 'Most popular' : `#${i + 1} popular`;
}

export const countryShort = (c: BankCountry) => (c.code === 'us' ? 'US' : c.name);

/** The account's details as the form shows them: country, bank, holder, then the country's own fields. */
export function bankFields(bank: LinkedBank): { key: string; label: string; value: string; flag?: string }[] {
  return [
    { key: 'country', label: 'Country', value: bank.country.name, flag: bank.country.code },
    { key: 'bank', label: 'Bank', value: bank.bankName },
    { key: 'holder', label: 'Account holder', value: bank.holder },
    ...BANK_ACCOUNT_SCHEMAS[bank.country.accountType].fields
      .filter((f) => f.key !== 'region' && f.key !== 'bankName')
      .map((f) => ({ key: f.key, label: fieldLabel(f.key), value: bank.values[f.key] ?? '' })),
  ];
}

export type BankStage = 'form' | 'linking' | 'linked';

type Payee = NonNullable<AgentAsk['recipient']>;

/** "Payments to Maria arrive over SPEI in MXN, usually in seconds." */
export function payeeBlurb(bank: LinkedBank, first: string) {
  const timing = bank.country.rail === 'ACH' ? 'in 1–3 business days' : bank.country.rail === 'Bank Transfer' ? 'within a business day' : 'usually in seconds';
  return `Payments to ${first} arrive over ${bank.country.rail} in ${bank.currency}, ${timing}.`;
}

/** What a bank ask says once it's done: the person's own bank linked, or someone's saved to pay. */
export function bankDoneLabel(ask: AgentAsk) {
  if (ask.recipient) {
    const r = recipientNamed(ask.recipient.name);
    return r ? `${r.first}’s ${r.bank.bankName} saved` : `${ask.recipient.first}’s bank saved`;
  }
  return `${linkedBank().bankName} •••• ${linkedBank().last4} linked`;
}

/**
 * The picker's state: the search, the country picked (with its prefilled account), and the link. For someone
 * else's bank (`payee`) it opens on their country, the account in their name, and saves them to pay; for the
 * person's own, on the country they said (`home`).
 */
export function useBankPicker(onLinked: (bank: LinkedBank) => void, payee?: Payee, home?: string) {
  const [bank, setBank] = useState<LinkedBank | null>(() => {
    if (payee) return draftRecipient(payee.name, payee.country)?.bank ?? null;
    const country = BANK_ALL.find((c) => c.code === home);
    return country ? bankFor(country) : null;
  });
  const [back, setBack] = useState(false);
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState<BankStage>('form');
  useEffect(() => {
    if (stage !== 'linking' || !bank) return;
    const t = window.setTimeout(() => setStage('linked'), LINK_MS);
    return () => window.clearTimeout(t);
  }, [stage, bank]);
  useEffect(() => {
    if (stage !== 'linked' || !bank) return;
    const t = window.setTimeout(() => onLinked(bank), LINKED_MS);
    return () => window.clearTimeout(t);
  }, [stage, bank, onLinked]);

  const q = query.trim().toLowerCase();
  const results = q
    ? BANK_ALL.filter((c) => c.name.toLowerCase().includes(q) || currencyFor(c).toLowerCase().includes(q) || c.rail.toLowerCase().includes(q))
    : null;
  return {
    bank,
    /** The last move was back, so steps slide in from the left. */
    back,
    query,
    setQuery,
    results,
    stage,
    busy: stage !== 'form',
    pick: (c: BankCountry) => {
      setBack(false);
      setBank(bankFor(c));
    },
    unpick: () => {
      setBack(true);
      setBank(null);
    },
    link: () => {
      if (!bank || stage !== 'form') return;
      if (payee) saveRecipient({ name: bank.holder, first: payee.first, bank });
      else linkBank(bank);
      setStage('linking');
    },
    /** Whose bank this is when it isn't the person's own. */
    payee: payee ?? null,
  };
}

export type BankPicker = ReturnType<typeof useBankPicker>;
