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

/** Back to the default with nothing linked, as a Reset leaves the account. */
export function resetLinkedBank() {
  linked = bankFor(BANK_COUNTRIES.find((c) => c.code === 'us')!);
  linkedYet = false;
}

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

/** What a real-time funded BRL quote returns to pay with: a PIX copy-and-paste code. COP returns a payment page. */
const PIX_CODE = '00020126580014br.gov.bcb.pix0136a3f1c2e4-7b9d-4e21-9c6a-2d8f5b1e0a475204000053039865802BR6304A1B2';
const COP_LINK = 'https://pagos.example.co/t/7Q4K2X';

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
        rows: [['PIX code', PIX_CODE]],
        info: { accountType: 'BRL_ACCOUNT', qrCode: PIX_CODE },
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
        rows: [['Payment link', COP_LINK]],
        info: { accountType: 'COP_ACCOUNT', paymentUrl: COP_LINK },
      };
    default:
      return {
        currency: 'USD',
        rail: 'international wire',
        amount: usdCents,
        reference,
        rows: [['Account number', '000123456789'], ['SWIFT', 'CHASUS33']],
        info: {
          accountType: 'SWIFT_ACCOUNT',
          paymentRails: ['SWIFT'],
          accountHolderName: PERSON.full,
          bankName: 'JPMorgan Chase Bank',
          swiftCode: 'CHASUS33',
          accountNumber: '000123456789',
          country: 'US',
          reference,
        },
      };
  }
}
