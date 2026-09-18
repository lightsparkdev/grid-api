import type {
  StatementBrand,
  StatementModel,
  StatementPeriod,
  StatementRow,
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

const consumerActivities = [
  {
    id: 'c1',
    kind: 'incoming',
    rail: 'ACH',
    day: '03',
    label: 'ACH deposit',
    party: 'Acme Corp Payroll',
    receivedAmountCents: 185000,
    disputable: true,
  },
  {
    id: 'c2',
    kind: 'card',
    day: '08',
    label: 'Debit card purchase',
    party: 'Blue Bottle Coffee',
    settledAmountCents: 1875,
    disputable: true,
    terminal: '456 S Spring St, Los Angeles, CA 90013',
    merchant: {
      descriptor: 'BLUE BOTTLE COFFEE',
      mcc: '5814',
      city: 'Los Angeles',
      state: 'CA',
      country: 'US',
    },
  },
  {
    id: 'c3',
    kind: 'outgoing',
    rail: 'ACH',
    day: '12',
    label: 'ACH debit',
    party: 'Pacific Gas & Electric',
    sentAmountCents: 14230,
    feeCents: 0,
    disputable: true,
  },
  {
    id: 'c4',
    kind: 'outgoing',
    rail: 'WIRE',
    day: '18',
    label: 'Wire transfer out',
    party: 'First National Escrow',
    sentAmountCents: 100000,
    feeCents: 1500,
    disputable: false,
  },
  {
    id: 'c5',
    kind: 'incoming',
    rail: 'RTP',
    day: '24',
    label: 'RTP received',
    party: 'Sofía Herrera',
    receivedAmountCents: 25000,
    disputable: false,
  },
] as const;

const commercialActivities = [
  {
    id: 'b1',
    kind: 'incoming',
    rail: 'ACH',
    day: '02',
    label: 'ACH deposit',
    party: 'Northwind Retail Group',
    receivedAmountCents: 1245000,
  },
  {
    id: 'b2',
    kind: 'outgoing',
    rail: 'ACH',
    day: '07',
    label: 'ACH debit',
    party: 'Cascade Bean Supply Co.',
    sentAmountCents: 487550,
    feeCents: 0,
  },
  {
    id: 'b3',
    kind: 'outgoing',
    rail: 'WIRE',
    day: '11',
    label: 'Wire transfer out',
    party: 'Meridian Equipment Leasing',
    sentAmountCents: 620000,
    feeCents: 1500,
  },
  {
    id: 'b4',
    kind: 'outgoing',
    rail: 'ACH',
    day: '15',
    label: 'ACH debit',
    party: 'Gusto Payroll',
    sentAmountCents: 832000,
    feeCents: 0,
  },
  {
    id: 'b5',
    kind: 'incoming',
    rail: 'RTP',
    day: '22',
    label: 'RTP received',
    party: 'Harbor Café Wholesale',
    receivedAmountCents: 318025,
  },
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
        id: 'InternalAccount:019542f5-b3e7-1d02-0000-000000000482',
        customerId: 'Customer:019542f5-b3e7-1d02-0000-000000000421',
        platformCustomerId: 'marcus-chen-4821',
        holder: 'Marcus Chen',
        type: 'Consumer prepaid account',
        number: '****4821',
      },
      openingBalanceCents: 245000,
      activities: consumerActivities,
    };
  }

  return {
    variant,
    brand,
    period,
    account: {
      id: 'InternalAccount:019542f5-b3e7-1d02-0000-000000007305',
      customerId: 'Customer:019542f5-b3e7-1d02-0000-000000007301',
      platformCustomerId: 'meridian-coffee-7305',
      holder: 'Meridian Coffee Roasters LLC',
      type: 'Commercial account',
      number: '****7305',
    },
    openingBalanceCents: 1824000,
    activities: commercialActivities,
  };
}

export function statementRows(statement: StatementModel): StatementRow[] {
  return statement.activities.flatMap((activity) => {
    const platformFields =
      statement.variant === 'consumer'
        ? { disputable: activity.disputable, terminal: activity.terminal }
        : {};

    if (activity.kind === 'incoming') {
      return [{
        id: activity.id,
        day: activity.day,
        type: activity.label,
        party: activity.party,
        amountCents: activity.receivedAmountCents,
        isFee: false,
        ...platformFields,
      }];
    }

    const amountCents =
      activity.kind === 'card' ? -activity.settledAmountCents : -activity.sentAmountCents;
    const rows: StatementRow[] = [{
      id: activity.id,
      day: activity.day,
      type: activity.label,
      party: activity.party,
      amountCents,
      isFee: false,
      ...platformFields,
    }];

    if (activity.kind === 'outgoing' && activity.feeCents > 0) {
      rows.push({
        id: `${activity.id}-fee`,
        day: activity.day,
        type: `${activity.rail === 'WIRE' ? 'Wire transfer' : activity.label} fee`,
        party: 'Lead Bank',
        amountCents: -activity.feeCents,
        isFee: true,
        ...(statement.variant === 'consumer' ? { disputable: false } : {}),
      });
    }

    return rows;
  });
}

export function calculateTotals(statement: StatementModel): StatementTotals {
  return statementRows(statement).reduce<StatementTotals>(
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
