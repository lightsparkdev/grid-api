import type {
  RequirementCoverage,
  StatementBrand,
  StatementModel,
  StatementPeriod,
  StatementTotals,
  StatementVariant,
} from './types';

export const LEGAL = {
  phone: '(855) 516-0103',
  address: '8605 Santa Monica Blvd, PMB 64461, West Hollywood, CA 90069',
  provider:
    'This account is held at Lead Bank, the account-holding institution. Lightspark is the program manager and is not a bank.',
  notice: [
    'Telephone us at (855) 516-0103 or Write us at 8605 Santa Monica Blvd, PMB 64461, West Hollywood, CA 90069 as soon as you can, if you think your statement or receipt is wrong or if you need more information about a transfer on the statement or receipt. We must hear from you no later than 60 days after we sent you the FIRST statement on which the error or problem appeared.',
    '(1) Tell us your name and account number (if any).',
    '(2) Describe the error or the transfer you are unsure about, and explain as clearly as you can why you believe it is an error or why you need more information.',
    '(3) Tell us the dollar amount of the suspected error.',
    'We will investigate your complaint and will correct any error promptly. If we take more than 10 business days to do this, we will credit your account for the amount you think is in error, so that you will have the use of the money during the time it takes us to complete our investigation.',
  ] as const,
} as const;

export const PERIODS: readonly StatementPeriod[] = [
  {
    id: '2026-07',
    range: '07/01/2026 – 07/31/2026',
    issued: '08/01/2026',
    transactionMonth: '07',
  },
  {
    id: '2026-08',
    range: '08/01/2026 – 08/31/2026',
    issued: '09/01/2026',
    transactionMonth: '08',
  },
  {
    id: '2026-09',
    range: '09/01/2026 – 09/30/2026',
    issued: '10/01/2026',
    transactionMonth: '09',
  },
] as const;

const consumerTransactions = [
  { id: 'c1', day: '03', type: 'ACH deposit', party: 'Acme Corp Payroll', amountCents: 185000, disputable: true },
  {
    id: 'c2',
    day: '08',
    type: 'Debit card purchase',
    party: 'Blue Bottle Coffee',
    amountCents: -1875,
    disputable: true,
    terminal: '456 S Spring St, Los Angeles, CA 90013',
  },
  { id: 'c3', day: '12', type: 'ACH debit', party: 'Pacific Gas & Electric', amountCents: -14230, disputable: true },
  { id: 'c4', day: '18', type: 'Wire transfer out', party: 'First National Escrow', amountCents: -100000, disputable: false },
  { id: 'c5', day: '18', type: 'Wire transfer fee', party: 'Lead Bank', amountCents: -1500, disputable: false, isFee: true },
  { id: 'c6', day: '24', type: 'RTP received', party: 'Sofía Herrera', amountCents: 25000, disputable: false },
] as const;

const commercialTransactions = [
  { id: 'b1', day: '02', type: 'ACH deposit', party: 'Northwind Retail Group', amountCents: 1245000 },
  { id: 'b2', day: '07', type: 'ACH debit', party: 'Cascade Bean Supply Co.', amountCents: -487550 },
  { id: 'b3', day: '11', type: 'Wire transfer out', party: 'Meridian Equipment Leasing', amountCents: -620000 },
  { id: 'b4', day: '11', type: 'Wire transfer fee', party: 'Lead Bank', amountCents: -1500, isFee: true },
  { id: 'b5', day: '15', type: 'ACH debit', party: 'Gusto Payroll', amountCents: -832000 },
  { id: 'b6', day: '22', type: 'RTP received', party: 'Harbor Café Wholesale', amountCents: 318025 },
] as const;

export const DEFAULT_BRAND: StatementBrand = {
  companyName: 'Northstar',
  logo: { kind: 'none' },
};

export function buildStatement(
  variant: StatementVariant,
  brand: StatementBrand,
  period: StatementPeriod,
): StatementModel {
  if (variant === 'consumer') {
    return {
      variant,
      brand,
      period,
      account: {
        holder: 'Marcus Chen',
        type: 'Consumer prepaid account',
        number: '****4821',
      },
      openingBalanceCents: 245000,
      transactions: consumerTransactions,
    };
  }

  return {
    variant,
    brand,
    period,
    account: {
      holder: 'Meridian Coffee Roasters LLC',
      type: 'Commercial account',
      number: '****7305',
    },
    openingBalanceCents: 1824000,
    transactions: commercialTransactions,
  };
}

export function calculateTotals(statement: StatementModel): StatementTotals {
  return statement.transactions.reduce<StatementTotals>(
    (totals, transaction) => ({
      closingBalanceCents: totals.closingBalanceCents + transaction.amountCents,
      totalFeesCents:
        totals.totalFeesCents + (transaction.isFee ? Math.abs(transaction.amountCents) : 0),
    }),
    {
      closingBalanceCents: statement.openingBalanceCents,
      totalFeesCents: 0,
    },
  );
}

export const REQUIREMENTS: readonly RequirementCoverage[] = [
  { id: 'provider', requirement: 'Lead Bank and Lightspark roles', renderedAt: 'Legal footer', source: 'Reviewed legal copy', appliesTo: 'all' },
  { id: 'holder', requirement: 'Account holder and masked number', renderedAt: 'Statement details', source: 'Platform account record', appliesTo: 'all' },
  { id: 'account-type', requirement: 'Account type', renderedAt: 'Statement details', source: 'Platform account record', appliesTo: 'all' },
  { id: 'period', requirement: 'Statement period and issue date', renderedAt: 'Statement details', source: 'Platform statement schedule', appliesTo: 'all' },
  { id: 'balances', requirement: 'Opening and closing balances', renderedAt: 'Balance summary', source: 'Derived from platform ledger snapshots', appliesTo: 'all' },
  { id: 'activity', requirement: 'Complete balance-moving activity', renderedAt: 'Transactions', source: 'Grid GET /transactions plus platform ledger', appliesTo: 'all' },
  { id: 'line-amount', requirement: 'Transaction amount', renderedAt: 'Transaction row', source: 'Grid GET /transactions', appliesTo: 'all' },
  { id: 'line-date', requirement: 'Date credited or debited', renderedAt: 'Transaction row', source: 'Grid GET /transactions', appliesTo: 'all' },
  { id: 'line-type', requirement: 'Transaction type', renderedAt: 'Transaction row', source: 'Grid GET /transactions', appliesTo: 'all' },
  { id: 'line-party', requirement: 'Third-party name', renderedAt: 'Transaction row', source: 'Grid GET /transactions', appliesTo: 'all' },
  { id: 'fees', requirement: 'Total fees for period', renderedAt: 'Transaction total', source: 'Derived from fee transactions', appliesTo: 'all' },
  { id: 'inquiries', requirement: 'Direct inquiries contact', renderedAt: 'Legal footer', source: 'Reviewed legal copy', appliesTo: 'all' },
  { id: 'terminal', requirement: 'Terminal location for covered EFTs', renderedAt: 'Transaction detail', source: 'Platform enrichment; public API has no full street address', appliesTo: 'consumer' },
  { id: 'flags', requirement: 'Covered EFT markers and key', renderedAt: 'Transactions', source: 'Platform Reg E classification', appliesTo: 'consumer' },
  { id: 'notice', requirement: 'Error-resolution notice and 60-day window', renderedAt: 'Legal footer', source: 'CFPB model language', appliesTo: 'consumer' },
] as const;

export function formatMoney(cents: number, signed = false): string {
  const amount = Math.abs(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return signed ? `${cents >= 0 ? '+' : '-'}$${amount}` : `$${amount}`;
}

export function statementFilename(statement: StatementModel): string {
  const company = statement.brand.companyName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'company';
  return `${company}-statement-${statement.period.id}.pdf`;
}
