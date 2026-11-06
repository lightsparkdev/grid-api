import { useEffect, useState } from 'react';
import { BANK_ACCOUNT_SCHEMAS } from '@/data/bankAccountFields.generated';
import { BANK_COUNTRIES, currencyFor, type BankCountry } from '@/data/bankCountries';
import { FUNDING_POPULAR, fieldLabel } from '@/data/bankSamples';
import { bankFor, linkBank, type LinkedBank } from '../linkedBank';

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
      return `ACH in ${cur}, 1–3 business days`;
    case 'Bank Transfer':
      return `Bank transfer in ${cur}, within a business day`;
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

/** The picker's state: the search, the country picked (with its prefilled account), and the link. */
export function useBankPicker(onLinked: (bank: LinkedBank) => void) {
  const [bank, setBank] = useState<LinkedBank | null>(null);
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
      linkBank(bank);
      setStage('linking');
    },
  };
}

export type BankPicker = ReturnType<typeof useBankPicker>;
