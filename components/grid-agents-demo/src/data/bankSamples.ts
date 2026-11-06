// The bank form's prefilled values, from grid-wallet-demo's money sheet (src/apps/shared/wallet/moneySheet.ts):
// the spec's example for each field (or a country override), digits shuffled so each link looks like its own account.

import { BANK_ACCOUNT_SCHEMAS } from './bankAccountFields.generated';
import { BANK_COUNTRIES, type BankCountry } from './bankCountries';

function randomizeDigits(value: string): string {
  return value.replace(/\d/g, () => String(Math.floor(Math.random() * 10)));
}

export function sampleValuesFor(country: BankCountry): Record<string, string> {
  const values: Record<string, string> = {};
  for (const f of BANK_ACCOUNT_SCHEMAS[country.accountType].fields) {
    const base = country.sampleOverrides?.[f.key] ?? f.example ?? '';
    values[f.key] = f.enum ? base : randomizeDigits(base);
  }
  if (country.region) values.region = country.region;
  return values;
}

/** The last four digits of the account's main identifier. */
export function accountLast4(values: Record<string, string>): string {
  const main = values.accountNumber ?? values.iban ?? values.clabeNumber ?? values.pixKey ?? values.vpa ?? Object.values(values).join('');
  const digits = main.replace(/\D/g, '');
  return digits.slice(-4) || main.slice(-4);
}

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

/** Funding's picker leads with the US, then the busiest corridors (grid-wallet-demo's popularRank). */
export const FUNDING_POPULAR: BankCountry[] = [
  ...BANK_COUNTRIES.filter((c) => c.code === 'us'),
  ...BANK_COUNTRIES.filter((c) => c.popularRank).sort((a, b) => (a.popularRank ?? 0) - (b.popularRank ?? 0)),
];
