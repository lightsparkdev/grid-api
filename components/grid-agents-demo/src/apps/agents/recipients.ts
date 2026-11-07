import { BANK_COUNTRIES, type BankCountry } from '@/data/bankCountries';
import type { Payee } from '@/data/agentEvents';
import { bankFor, formatMoney, type LinkedBank } from './linkedBank';

/*
 * The people the agent can pay. Sofia is already saved (the Pay someone tile pays her); anyone the visitor names
 * in the chat gets a bank sheet once, filled in with their country's fields, and is remembered for the visit.
 */

export interface Recipient {
  name: string;
  first: string;
  bank: LinkedBank;
}

const countryOf = (code: string): BankCountry | undefined => BANK_COUNTRIES.find((c) => c.code === code.toLowerCase());

const titleCase = (name: string) =>
  name
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((w) => (w ? w[0].toLocaleUpperCase() + w.slice(1) : w))
    .join(' ');

function make(name: string, country: BankCountry): Recipient {
  const full = titleCase(name);
  return { name: full, first: full.split(' ')[0], bank: bankFor(country, full) };
}

const SOFIA = make('Sofia Almeida', countryOf('br')!);

let saved: Recipient[] = [SOFIA];

export const savedRecipients = () => saved;

/** Someone saved this visit, by first or full name. */
export function recipientNamed(name: string): Recipient | undefined {
  const q = name.trim().toLowerCase();
  if (!q) return undefined;
  return saved.find((r) => r.name.toLowerCase() === q) ?? saved.find((r) => r.first.toLowerCase() === q.split(' ')[0]);
}

/** A new person in a country, with that country's account fields filled in, not saved yet. */
export function draftRecipient(name: string, countryCode: string): Recipient | undefined {
  const country = countryOf(countryCode);
  return country ? make(name, country) : undefined;
}

export function saveRecipient(r: Recipient) {
  saved = [...saved.filter((s) => s.name.toLowerCase() !== r.name.toLowerCase()), r];
}

export function resetRecipients() {
  saved = [SOFIA];
}

/** What a payment to them comes to: the amount in either currency, converted at the demo rate. */
export function payeeFor(r: Recipient, amount: number, currency: string): Payee & { local: string } {
  const local = r.bank.currency;
  const rate = r.bank.country.usdToLocal;
  const inLocal = currency.toUpperCase() === local;
  const localMinor = Math.round((inLocal ? amount : amount * rate) * 100);
  const usd = Math.round((inLocal ? amount / rate : amount) * 100);
  return {
    name: r.name,
    currency: local,
    amount: localMinor,
    usd,
    rail: r.bank.country.rail.toUpperCase().replace(/ /g, '_'),
    bank: r.bank.bankName,
    local: formatMoney(localMinor, local),
  };
}
