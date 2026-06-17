// Curated country list for the bank picker, seeded from the Grid docs'
// country-support table (mintlify/snippets/country-support.mdx - 55 countries).
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

export const BANK_COUNTRIES: BankCountry[] = [
  { code: 'at', name: 'Austria', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'Erste Bank' },
  { code: 'be', name: 'Belgium', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'KBC' },
  { code: 'bj', name: 'Benin', accountType: 'XOF_ACCOUNT', rail: 'Bank Transfer', usdToLocal: 605, bankName: 'Bank of Africa', region: 'BJ' },
  {
    code: 'br',
    name: 'Brazil',
    accountType: 'BRL_ACCOUNT',
    rail: 'PIX',
    usdToLocal: 5.4,
    bankName: 'Nubank',
    popularRank: 5,
    banks: ['Nubank', 'Itaú', 'Bradesco', 'Banco do Brasil'],
    // Spec example pairs an email pixKey with pixKeyType CPF; make it consistent.
    sampleOverrides: { pixKey: '12345678901', pixKeyType: 'CPF', taxId: '12345678901' },
  },
  { code: 'bg', name: 'Bulgaria', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'DSK Bank' },
  { code: 'cm', name: 'Cameroon', accountType: 'XAF_ACCOUNT', rail: 'Bank Transfer', usdToLocal: 605, bankName: 'Afriland First Bank', region: 'CM' },
  { code: 'hr', name: 'Croatia', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'Zagrebacka banka' },
  { code: 'cy', name: 'Cyprus', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'Bank of Cyprus' },
  { code: 'cz', name: 'Czech Republic', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'Komercni banka' },
  { code: 'dk', name: 'Denmark', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'Danske Bank' },
  { code: 'ee', name: 'Estonia', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'Swedbank' },
  { code: 'fi', name: 'Finland', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'Nordea' },
  { code: 'fr', name: 'France', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'BNP Paribas' },
  { code: 'de', name: 'Germany', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'Deutsche Bank', popularRank: 7, banks: ['Deutsche Bank', 'Commerzbank', 'N26', 'DKB'] },
  { code: 'gr', name: 'Greece', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'Alpha Bank' },
  { code: 'hu', name: 'Hungary', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'OTP Bank' },
  { code: 'is', name: 'Iceland', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'Landsbankinn' },
  { code: 'in', name: 'India', accountType: 'INR_ACCOUNT', rail: 'UPI', usdToLocal: 83.3, bankName: 'HDFC Bank', popularRank: 2, banks: ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'] },
  { code: 'id', name: 'Indonesia', accountType: 'IDR_ACCOUNT', rail: 'Bank Transfer', usdToLocal: 15800, bankName: 'Bank Mandiri' },
  { code: 'ie', name: 'Ireland', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'AIB' },
  { code: 'it', name: 'Italy', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'UniCredit' },
  { code: 'ci', name: 'Ivory Coast', accountType: 'XOF_ACCOUNT', rail: 'Bank Transfer', usdToLocal: 605, bankName: 'Societe Generale', region: 'CI' },
  { code: 'ke', name: 'Kenya', accountType: 'KES_ACCOUNT', rail: 'Bank Transfer', usdToLocal: 129, bankName: 'Equity Bank' },
  { code: 'lv', name: 'Latvia', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'Swedbank' },
  { code: 'li', name: 'Liechtenstein', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'LGT Bank' },
  { code: 'lt', name: 'Lithuania', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'SEB' },
  { code: 'lu', name: 'Luxembourg', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'BIL' },
  { code: 'mw', name: 'Malawi', accountType: 'MWK_ACCOUNT', rail: 'Bank Transfer', usdToLocal: 1730, bankName: 'National Bank of Malawi' },
  { code: 'my', name: 'Malaysia', accountType: 'MYR_ACCOUNT', rail: 'Bank Transfer', usdToLocal: 4.7, bankName: 'Maybank' },
  { code: 'mt', name: 'Malta', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'Bank of Valletta' },
  { code: 'mx', name: 'Mexico', accountType: 'MXN_ACCOUNT', rail: 'SPEI', usdToLocal: 17.9, bankName: 'Nu México', popularRank: 1, banks: ['Nu México', 'BBVA', 'Santander', 'Citibanamex'] },
  { code: 'nl', name: 'Netherlands', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'ING' },
  { code: 'ng', name: 'Nigeria', accountType: 'NGN_ACCOUNT', rail: 'Bank Transfer', usdToLocal: 1500, bankName: 'GTBank', popularRank: 4, banks: ['GTBank', 'Access Bank', 'Zenith Bank', 'First Bank'] },
  { code: 'no', name: 'Norway', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'DNB' },
  { code: 'ph', name: 'Philippines', accountType: 'PHP_ACCOUNT', rail: 'Bank Transfer', usdToLocal: 58, bankName: 'BDO', popularRank: 3, banks: ['BDO', 'BPI', 'Metrobank', 'UnionBank'] },
  { code: 'pl', name: 'Poland', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'PKO Bank Polski' },
  { code: 'pt', name: 'Portugal', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'Millennium BCP' },
  { code: 'ro', name: 'Romania', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'Banca Transilvania' },
  { code: 'rw', name: 'Rwanda', accountType: 'RWF_ACCOUNT', rail: 'Bank Transfer', usdToLocal: 1300, bankName: 'Bank of Kigali' },
  { code: 'sn', name: 'Senegal', accountType: 'XOF_ACCOUNT', rail: 'Bank Transfer', usdToLocal: 605, bankName: 'CBAO', region: 'SN' },
  { code: 'sg', name: 'Singapore', accountType: 'SGD_ACCOUNT', rail: 'PayNow', usdToLocal: 1.35, bankName: 'DBS' },
  { code: 'sk', name: 'Slovakia', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'Slovenska sporitelna' },
  { code: 'si', name: 'Slovenia', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'NLB' },
  { code: 'za', name: 'South Africa', accountType: 'ZAR_ACCOUNT', rail: 'Bank Transfer', usdToLocal: 18.5, bankName: 'Standard Bank' },
  { code: 'es', name: 'Spain', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'Santander' },
  { code: 'se', name: 'Sweden', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'SEB' },
  { code: 'ch', name: 'Switzerland', accountType: 'EUR_ACCOUNT', rail: 'SEPA Instant', usdToLocal: 0.92, bankName: 'UBS' },
  { code: 'tz', name: 'Tanzania', accountType: 'TZS_ACCOUNT', rail: 'Bank Transfer', usdToLocal: 2600, bankName: 'CRDB Bank' },
  { code: 'th', name: 'Thailand', accountType: 'THB_ACCOUNT', rail: 'Bank Transfer', usdToLocal: 36, bankName: 'Bangkok Bank' },
  { code: 'ug', name: 'Uganda', accountType: 'UGX_ACCOUNT', rail: 'Bank Transfer', usdToLocal: 3800, bankName: 'Stanbic Bank' },
  { code: 'ae', name: 'United Arab Emirates', accountType: 'AED_ACCOUNT', rail: 'Bank Transfer', usdToLocal: 3.67, bankName: 'Emirates NBD' },
  { code: 'gb', name: 'United Kingdom', accountType: 'GBP_ACCOUNT', rail: 'Faster Payments', usdToLocal: 0.79, bankName: 'Barclays', popularRank: 6, banks: ['Barclays', 'HSBC', 'Lloyds', 'Monzo'] },
  { code: 'us', name: 'United States', accountType: 'USD_ACCOUNT', rail: 'ACH', usdToLocal: 1, bankName: 'Chase' },
  { code: 'vn', name: 'Vietnam', accountType: 'VND_ACCOUNT', rail: 'Bank Transfer', usdToLocal: 25400, bankName: 'Vietcombank' },
  { code: 'zm', name: 'Zambia', accountType: 'ZMW_ACCOUNT', rail: 'Bank Transfer', usdToLocal: 26, bankName: 'Zanaco' },
];

/** ISO 4217 currency for a country, derived from the spec schema (not stored). */
export function currencyFor(country: BankCountry): string {
  return BANK_ACCOUNT_SCHEMAS[country.accountType].currency;
}

/** Illustrative demo recipient name per country for the SEND flow (name-led
 *  recipient rows). NOT spec data — purely for the demo's "send to someone
 *  else's bank" story. Falls back to a neutral name. */
const DEMO_RECIPIENTS: Record<string, string> = {
  at: 'Lukas Gruber', be: 'Lucas Peeters', bj: 'Kossi Adjavon', br: 'Lucas Silva',
  bg: 'Georgi Ivanov', cm: 'Jean Mbarga', hr: 'Ivan Horvat', cy: 'Andreas Georgiou',
  cz: 'Jan Novák', dk: 'Mads Jensen', ee: 'Kristjan Tamm', fi: 'Mikko Virtanen',
  fr: 'Lucas Martin', de: 'Anna Müller', gr: 'Giorgos Papadopoulos', hu: 'Bence Nagy',
  is: 'Jón Jónsson', in: 'Priya Sharma', id: 'Budi Santoso', ie: 'Conor Murphy',
  it: 'Giulia Rossi', ci: 'Kouadio Yao', ke: 'Wanjiru Kamau', lv: 'Jānis Bērziņš',
  li: 'Thomas Frick', lt: 'Tomas Kazlauskas', lu: 'Marc Weber', mw: 'Chimwemwe Banda',
  my: 'Nurul Abdullah', mt: 'Joseph Borg', mx: 'Carlos Herrera', nl: 'Daan de Vries',
  ng: 'Chidi Okafor', no: 'Henrik Hansen', ph: 'Maria Santos', pl: 'Jakub Kowalski',
  pt: 'João Silva', ro: 'Andrei Popescu', rw: 'Eric Mugisha', sn: 'Abdou Diop',
  sg: 'Wei Lim', sk: 'Martin Horváth', si: 'Luka Novak', za: 'Thabo Nkosi',
  es: 'Javier García', se: 'Erik Andersson', ch: 'Luca Meier', tz: 'Juma Mwita',
  th: 'Somchai Suwan', ug: 'David Okello', ae: 'Ahmed Al Mansoori', gb: 'James Smith',
  us: 'Emily Johnson', vn: 'Minh Nguyen', zm: 'Mwila Phiri',
};

/** Illustrative recipient-name POOLS for the popular corridors — repeat sends to
 *  the same country cycle through these so recipients don't duplicate (mirrors the
 *  bank-name pools). Others fall back to the single DEMO_RECIPIENTS name. */
const DEMO_RECIPIENT_POOLS: Record<string, string[]> = {
  mx: ['Carlos Herrera', 'Sofía Ramírez', 'Diego Torres', 'Valentina Cruz'],
  in: ['Priya Sharma', 'Arjun Patel', 'Ananya Iyer', 'Rohan Gupta'],
  ph: ['Maria Santos', 'Jose Reyes', 'Andrea Cruz', 'Mark Dela Rosa'],
  ng: ['Chidi Okafor', 'Aisha Bello', 'Emeka Eze', 'Ngozi Adeyemi'],
  br: ['Lucas Silva', 'Mariana Costa', 'Gabriel Souza', 'Beatriz Oliveira'],
  gb: ['James Smith', 'Olivia Brown', 'Oliver Jones', 'Emily Wilson'],
  de: ['Anna Müller', 'Lukas Schmidt', 'Lena Wagner', 'Felix Becker'],
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
