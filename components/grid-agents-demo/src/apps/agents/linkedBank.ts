import { BANK_COUNTRIES, currencyFor, type BankCountry } from '@/data/bankCountries';
import { accountLast4, sampleValuesFor } from '@/data/bankSamples';
import { PERSON } from './story';

/** The bank the person linked: picked in the bank flow, then read by the agent's lines and the API panel. */
export interface LinkedBank {
  country: BankCountry;
  bankName: string;
  holder: string;
  values: Record<string, string>;
  last4: string;
  currency: string;
}

/** As the Global Accounts playground fills it in (useMoneySheet): the spec's sample fields, the country's own bank name. */
export function bankFor(country: BankCountry): LinkedBank {
  const values = sampleValuesFor(country);
  if ('bankName' in values) values.bankName = country.bankName;
  return {
    country,
    bankName: country.bankName,
    holder: PERSON.full,
    values,
    last4: accountLast4(values),
    currency: currencyFor(country),
  };
}

let linked = bankFor(BANK_COUNTRIES.find((c) => c.code === 'us')!);
let linkedYet = false;

export const linkedBank = () => linked;
/** Whether the person has linked one this visit (the default above only stands in for the agent's lines). */
export const hasLinkedBank = () => linkedYet;

export function linkBank(bank: LinkedBank) {
  linked = bank;
  linkedYet = true;
}

/** A USD amount (in cents) in the bank's own currency, at the demo rate. */
export function localAmount(cents: number, bank: LinkedBank): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: bank.currency, maximumFractionDigits: 0 }).format((cents / 100) * bank.country.usdToLocal);
}

/** How long a top-up over the bank's rail takes to land, in the agent's words. */
export function railTiming(bank: LinkedBank): string {
  switch (bank.country.rail) {
    case 'ACH':
      return 'Bank transfers take 1–3 business days.';
    case 'Bank Transfer':
      return 'It usually lands within a business day.';
    default:
      return `${bank.country.rail} usually lands in seconds.`;
  }
}
