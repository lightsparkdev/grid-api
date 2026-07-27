// Country list for the bank picker: the US plus the euro area (20), seeded from
// the Grid docs' country-support table (mintlify/snippets/country-support.mdx).
// The production demo settles on two rails only — ACH/wire/RTP for USD and SEPA
// for EUR — so the other corridors in that table are deliberately not offered.
//
// Accuracy split:
// - `accountType` (and `region` for the CFA zones) are SPEC-BOUND: each must
//   exist in BANK_ACCOUNT_SCHEMAS (generated from openapi/), and the form fields
//   come from there. `assertBankCountries()` enforces this.
// - `usdToLocal` (demo FX) and `bankName` are ILLUSTRATIVE only - real rates are
//   runtime (GET /exchange-rates) and bank names runtime (GET /discoveries).
//
// Rail -> accountType mapping (from the docs table):
//   SEPA/SEPA Instant -> EUR_ACCOUNT (IBAN; SEPA settles in EUR, and EUR_ACCOUNT
//     is the spec's only SEPA vehicle - so non-euro SEPA countries map here too)
//   SPEI -> MXN, PIX -> BRL, UPI -> INR, Faster Payments -> GBP,
//   ACH/Wire/RTP/FedNow -> USD, PayNow/FAST -> SGD,
//   Bank Transfer -> the country's own currency account (incl. XAF/XOF + region).

import { BANK_ACCOUNT_SCHEMAS } from './bankAccountFields.generated';

export interface BankCountry {
  /** ISO 3166-1 alpha-2, lowercase - also the circle-flags asset key. */
  code: string;
  name: string;
  /** Spec accountType - must be a key of BANK_ACCOUNT_SCHEMAS. */
  accountType: string;
  /** Display label for the local rail. */
  rail: string;
  /** Illustrative demo FX: units of local currency per 1 USD (NOT spec data). */
  usdToLocal: number;
  /** Illustrative demo bank name shown in the row / pre-filled where applicable. */
  bankName: string;
  /** Required for XAF/XOF accounts (CFA franc sub-region). */
  region?: string;
  /** Top-of-picker rank (1 = highest by payment volume); unranked = "All" only. */
  popularRank?: number;
  /** Illustrative bank-name pool — repeat adds from this country cycle through
   *  these so saved banks don't look like duplicates. Falls back to [bankName].
   *  First entry should match `bankName` (the default for the first add). */
  banks?: string[];
  /** Demo sample overrides where the spec example must be made country-specific
   *  or internally consistent. Keys must be real fields; values must pass the
   *  field pattern (checked by assertBankCountries). */
  sampleOverrides?: Record<string, string>;
}

export const BANK_COUNTRIES: BankCountry[] = [] = [
  { code: 'at', name: 'Austria', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'Erste Bank' },
  { code: 'be', name: 'Belgium', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'KBC' },
  { code: 'hr', name: 'Croatia', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'Zagrebacka banka' },
  { code: 'cy', name: 'Cyprus', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'Bank of Cyprus' },
  { code: 'ee', name: 'Estonia', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'Swedbank' },
  { code: 'fi', name: 'Finland', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'Nordea' },
  { code: 'fr', name: 'France', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'BNP Paribas', popularRank: 3, banks: ['BNP Paribas', 'Crédit Agricole', 'Société Générale', 'La Banque Postale'] },
  { code: 'de', name: 'Germany', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'Deutsche Bank', banks: ['Deutsche Bank', 'Commerzbank', 'N26', 'DKB'], popularRank: 2 },
  { code: 'gr', name: 'Greece', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'Alpha Bank' },
  { code: 'ie', name: 'Ireland', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'AIB' },
  { code: 'it', name: 'Italy', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'UniCredit', popularRank: 5, banks: ['UniCredit', 'Intesa Sanpaolo', 'Banco BPM', 'BPER Banca'] },
  { code: 'lv', name: 'Latvia', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'Swedbank' },
  { code: 'lt', name: 'Lithuania', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'SEB' },
  { code: 'lu', name: 'Luxembourg', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'BIL' },
  { code: 'mt', name: 'Malta', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'Bank of Valletta' },
  { code: 'nl', name: 'Netherlands', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'ING', popularRank: 6, banks: ['ING', 'Rabobank', 'ABN AMRO', 'bunq'] },
  { code: 'pt', name: 'Portugal', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'Millennium BCP' },
  { code: 'sk', name: 'Slovakia', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'Slovenska sporitelna' },
  { code: 'si', name: 'Slovenia', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'NLB' },
  { code: 'es', name: 'Spain', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'Santander', popularRank: 4, banks: ['Santander', 'BBVA', 'CaixaBank', 'Banco Sabadell'] },
  { code: 'us', name: 'United States', accountType: 'USD_ACCOUNT', rail: 'ACH', usdToLocal: 1, bankName: 'Chase', popularRank: 1, banks: ['Chase', 'Bank of America', 'Wells Fargo', 'Citi'] },
];

/** ISO 4217 currency for a country, derived from the spec schema (not stored). */
export function currencyFor(country: BankCountry): string {
  return BANK_ACCOUNT_SCHEMAS[country.accountType].currency;
}

/** Illustrative demo recipient name per country for the SEND flow (name-led
 *  recipient rows). NOT spec data — purely for the demo's "send to someone
 *  else's bank" story. Falls back to a neutral name. */
const DEMO_RECIPIENTS: Record<string, string> = {
  at: 'Lukas Gruber', be: 'Lucas Peeters', hr: 'Ivan Horvat', cy: 'Andreas Georgiou',
  ee: 'Kristjan Tamm', fi: 'Mikko Virtanen', fr: 'Lucas Martin', de: 'Anna Müller',
  gr: 'Giorgos Papadopoulos', ie: 'Conor Murphy', it: 'Giulia Rossi', lv: 'Jānis Bērziņš',
  lt: 'Tomas Kazlauskas', lu: 'Marc Weber', mt: 'Joseph Borg', nl: 'Daan de Vries',
  pt: 'João Silva', sk: 'Martin Horváth', si: 'Luka Novak', es: 'Javier García',
  us: 'Emily Johnson'
};

/** Illustrative recipient-name POOLS for the popular corridors — repeat sends to
 *  the same country cycle through these so recipients don't duplicate (mirrors the
 *  bank-name pools). Others fall back to the single DEMO_RECIPIENTS name. */
const DEMO_RECIPIENT_POOLS: Record<string, string[]> = {
  us: ['Emily Johnson', 'Michael Chen', 'Sarah Miller', 'David Nguyen'],
  de: ['Anna Müller', 'Lukas Schmidt', 'Lena Wagner', 'Felix Becker'],
  fr: ['Lucas Martin', 'Camille Bernard', 'Hugo Petit', 'Léa Moreau'],
  es: ['Javier García', 'Lucía Fernández', 'Pablo Ruiz', 'Marta Díaz'],
  it: ['Giulia Rossi', 'Marco Ferrari', 'Chiara Russo', 'Alessandro Conti'],
  nl: ['Daan de Vries', 'Sanne Bakker', 'Lars Visser', 'Emma Jansen'],
};

/** Demo recipient-name pool for a country's send flow — cycle by saved count so
 *  repeat recipients differ. Popular corridors have several; others fall back to
 *  the single name. Illustrative, not spec data. */
export function recipientNamesFor(country: BankCountry): string[] {
  return DEMO_RECIPIENT_POOLS[country.code] ?? [DEMO_RECIPIENTS[country.code] ?? 'Alex Rivera'];
}

/**
 * Dev-time accuracy guard: every accountType must exist in the spec-generated
 * schemas, every `region` must be one of that field's spec enum values, and any
 * sampleOverride must target a real field and satisfy its pattern. Throws so a
 * bad mapping fails the build/tests instead of shipping next to the docs.
 */
export function assertBankCountries(): void {
  for (const c of BANK_COUNTRIES) {
    const schema = BANK_ACCOUNT_SCHEMAS[c.accountType];
    if (!schema) {
      throw new Error(`bankCountries: ${c.code} -> unknown accountType ${c.accountType}`);
    }
    const regionField = schema.fields.find((f) => f.key === 'region');
    if (regionField) {
      if (!c.region) throw new Error(`bankCountries: ${c.code} (${c.accountType}) requires a region`);
      if (regionField.enum && !regionField.enum.includes(c.region)) {
        throw new Error(`bankCountries: ${c.code} region ${c.region} not in ${regionField.enum.join('/')}`);
      }
    }
    for (const [key, value] of Object.entries(c.sampleOverrides ?? {})) {
      const field = schema.fields.find((f) => f.key === key);
      if (!field) throw new Error(`bankCountries: ${c.code} override for unknown field ${key}`);
      if (field.pattern && !new RegExp(field.pattern).test(value)) {
        throw new Error(`bankCountries: ${c.code} ${key}="${value}" fails ${field.pattern}`);
      }
    }
  }
}
