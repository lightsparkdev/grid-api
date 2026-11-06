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
export function bankFor(country: BankCountry, holder = PERSON.full): LinkedBank {
  const values = sampleValuesFor(country);
  if ('bankName' in values) values.bankName = country.bankName;
  return {
    country,
    bankName: country.bankName,
    holder,
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

/** Minor units of a currency as people write it: "R$250", "MX$690.50", "€12". */
export function formatMoney(minor: number, currency: string): string {
  const whole = minor % 100 === 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(minor / 100);
}

/** A US bank tops up by pull (ACH debit); everywhere else the person pushes it from their bank. */
export const pullsFrom = (bank: LinkedBank) => bank.country.code === 'us';

/** Where a pushed top-up goes: the account Grid issues on a real-time funded quote. */
export interface DepositDetails {
  /** What the person sends: their own currency on its local rail, or dollars by international wire. */
  currency: string;
  /** In the agent's words ("SPEI", "international wire"). */
  rail: string;
  /** Minor units of `currency`. */
  amount: number;
  /** Label and value, in the order a bank app asks for them; the first is the one to copy. */
  rows: [string, string][];
  reference: string;
  /** The same account as Grid's `paymentInstructions[].accountOrWalletInfo`. */
  info: Record<string, unknown>;
}

/**
 * The details to push a top-up from the linked bank to, as the Global Accounts playground shows them
 * (receiveFields). Real-time funded quotes issue local details for MXN, BRL, EUR and COP; any other bank
 * sends dollars by international wire.
 */
export function depositDetails(bank: LinkedBank, usdCents: number): DepositDetails {
  const reference = `AGT-${bank.country.code.toUpperCase()}-7Q4K2X`;
  const local = { currency: bank.currency, rail: bank.country.rail, amount: Math.round(usdCents * bank.country.usdToLocal), reference };
  const rails = [bank.country.rail.toUpperCase().replace(/ /g, '_')];
  switch (bank.country.accountType) {
    case 'MXN_ACCOUNT':
      return { ...local, rows: [['CLABE', '012180001234567895']], info: { accountType: 'MXN_ACCOUNT', paymentRails: rails, clabeNumber: '012180001234567895', reference } };
    case 'BRL_ACCOUNT':
      return {
        ...local,
        rows: [['PIX key', 'a3f1c2e4-7b9d-4e21-9c6a-2d8f5b1e0a47']],
        info: { accountType: 'BRL_ACCOUNT', paymentRails: rails, pixKey: 'a3f1c2e4-7b9d-4e21-9c6a-2d8f5b1e0a47', pixKeyType: 'RANDOM', reference },
      };
    case 'EUR_ACCOUNT':
      return {
        ...local,
        rows: [['IBAN', 'DE89 3704 0044 0532 0130 00'], ['BIC', 'COBADEFFXXX']],
        info: { accountType: 'EUR_ACCOUNT', paymentRails: rails, iban: 'DE89370400440532013000', swiftCode: 'COBADEFFXXX', reference },
      };
    case 'COP_ACCOUNT':
      return {
        ...local,
        rows: [['Account number', '00012345678'], ['Bank', 'Bancolombia']],
        info: { accountType: 'COP_ACCOUNT', paymentRails: rails, accountNumber: '00012345678', bankAccountType: 'SAVINGS', bankName: 'Bancolombia', reference },
      };
    default:
      return {
        currency: 'USD',
        rail: 'international wire',
        amount: usdCents,
        reference,
        rows: [['Account number', '000123456789'], ['SWIFT', 'CHASUS33']],
        info: { accountType: 'SWIFT_ACCOUNT', paymentRails: ['SWIFT'], accountHolderName: PERSON.full, swiftCode: 'CHASUS33', accountNumber: '000123456789', country: 'US', reference },
      };
  }
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
