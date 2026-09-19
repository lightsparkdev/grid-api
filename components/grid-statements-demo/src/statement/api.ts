import { calculateTotals } from './fixtures';
import type { Entry } from '@/components/ApiPanel/types';
import type { StatementModel } from './types';

export type StatementOperationId =
  | 'getCustomerById'
  | 'listCustomerInternalAccounts'
  | 'listTransactions';

export interface StatementApiEntry extends Entry {
  operationId: StatementOperationId;
}

function currencyAmount(amount: number) {
  return {
    amount,
    currency: {
      code: 'USD',
      name: 'United States Dollar',
      symbol: '$',
      decimals: 2,
    },
  };
}

function periodBounds(periodId: string) {
  const [year, month] = periodId.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return {
    startDate: `${periodId}-01T00:00:00Z`,
    endDate: `${periodId}-${String(lastDay).padStart(2, '0')}T23:59:59Z`,
  };
}

function timestamp(statement: StatementModel, day: string) {
  return `${statement.period.id}-${day}T12:00:00Z`;
}

function apiTransaction(statement: StatementModel, activity: StatementModel['activities'][number]) {
  const transactionId = `${statement.period.id.replace('-', '')}-${activity.id}`;
  const common = {
    id: `Transaction:${transactionId.padStart(36, '0')}`,
    status: 'COMPLETED',
    customerId: statement.account.customerId,
    platformCustomerId: statement.account.platformCustomerId,
    createdAt: timestamp(statement, activity.day),
    updatedAt: timestamp(statement, activity.day),
  };

  if (activity.kind === 'incoming') {
    return {
      ...common,
      type: 'INCOMING',
      direction: 'CREDIT',
      description: activity.party,
      destination: {
        destinationType: 'ACCOUNT',
        accountId: statement.account.id,
      },
      receivedAmount: currencyAmount(activity.receivedAmountCents),
      settledAt: timestamp(statement, activity.day),
      fees: 0,
    };
  }

  if (activity.kind === 'card') {
    return {
      type: 'CARD',
      id: common.id,
      status: 'SETTLED',
      direction: 'DEBIT',
      description: activity.merchant.descriptor,
      merchant: activity.merchant,
      authorizedAmount: currencyAmount(activity.settledAmountCents),
      settledAmount: currencyAmount(activity.settledAmountCents),
      accountId: statement.account.id,
      customerId: statement.account.customerId,
      platformCustomerId: statement.account.platformCustomerId,
      authorizedAt: timestamp(statement, activity.day),
      createdAt: timestamp(statement, activity.day),
      updatedAt: timestamp(statement, activity.day),
    };
  }

  return {
    ...common,
    type: 'OUTGOING',
    direction: 'DEBIT',
    description: activity.party,
    destination: {
      destinationType: 'ACCOUNT',
      accountId: `ExternalAccount:${transactionId.padStart(36, '0')}`,
    },
    source: {
      sourceType: 'ACCOUNT',
      accountId: statement.account.id,
    },
    sentAmount: currencyAmount(activity.sentAmountCents),
    receivedAmount: currencyAmount(activity.sentAmountCents),
    settledAt: timestamp(statement, activity.day),
    fees: activity.feeCents,
    platformFees: 0,
    paymentRail: activity.rail,
  };
}

export function buildApiEntries(
  statement: StatementModel,
  createdAt = Date.now(),
): StatementApiEntry[] {
  const totals = calculateTotals(statement);
  const { startDate, endDate } = periodBounds(statement.period.id);
  const groupLabel =
    statement.variant === 'consumer'
      ? 'The app derives Reg E and terminal details from transaction data.'
      : 'The app derives statement rows from transaction data.';
  const customerPath = `/customers/${statement.account.customerId}`;
  const accountPath = `/customers/internal-accounts?customerId=${encodeURIComponent(statement.account.customerId)}&currency=USD`;
  const transactionPath =
    `/transactions?accountIdentifier=${encodeURIComponent(statement.account.id)}` +
    `&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}` +
    '&sortOrder=asc&limit=100';
  const groupId = `${statement.variant}-${statement.period.id}`;

  const customerResponse =
    statement.variant === 'consumer'
      ? {
          id: statement.account.customerId,
          platformCustomerId: statement.account.platformCustomerId,
          customerType: 'INDIVIDUAL',
          umaAddress: '$marcus.chen@example.com',
          fullName: statement.account.holder,
          region: 'US',
          currencies: ['USD'],
        }
      : {
          id: statement.account.customerId,
          platformCustomerId: statement.account.platformCustomerId,
          customerType: 'BUSINESS',
          umaAddress: '$meridian.coffee@example.com',
          region: 'US',
          currencies: ['USD'],
          businessInfo: { legalName: statement.account.holder },
        };

  const account = {
    id: statement.account.id,
    customerId: statement.account.customerId,
    type: 'INTERNAL_FIAT',
    status: 'ACTIVE',
    balance: currencyAmount(totals.closingBalanceCents),
    totalBalance: currencyAmount(totals.closingBalanceCents),
    fundingPaymentInstructions: [],
    createdAt: '2025-10-03T12:30:00Z',
    updatedAt: `${statement.period.issued.slice(6)}-${statement.period.issued.slice(0, 2)}-${statement.period.issued.slice(3, 5)}T00:00:00Z`,
  };

  return [
    {
      key: `${groupId}-customer`,
      operationId: 'getCustomerById',
      title: 'getCustomerById',
      method: 'GET',
      path: customerPath,
      status: '200 OK',
      resBody: customerResponse,
      createdAt,
      groupId,
      groupLabel,
    },
    {
      key: `${groupId}-account`,
      operationId: 'listCustomerInternalAccounts',
      title: 'listCustomerInternalAccounts',
      method: 'GET',
      path: accountPath,
      status: '200 OK',
      resBody: { data: [account], hasMore: false, totalCount: 1 },
      createdAt: createdAt + 120,
      groupId,
      groupLabel,
    },
    {
      key: `${groupId}-transactions`,
      operationId: 'listTransactions',
      title: 'listTransactions',
      method: 'GET',
      path: transactionPath,
      status: '200 OK',
      resBody: {
        data: statement.activities.map((activity) => apiTransaction(statement, activity)),
        hasMore: false,
        totalCount: statement.activities.length,
      },
      createdAt: createdAt + 240,
      groupId,
      groupLabel,
    },
  ];
}

export function reconcileApiEntries(statement: StatementModel, entries: StatementApiEntry[]) {
  const accountResponse = entries.find((entry) => entry.operationId === 'listCustomerInternalAccounts')
    ?.resBody as { data?: Array<{ balance?: { amount?: number } }> } | undefined;
  const transactionResponse = entries.find((entry) => entry.operationId === 'listTransactions')
    ?.resBody as {
      data?: Array<{
        type?: string;
        direction?: string;
        receivedAmount?: { amount?: number };
        sentAmount?: { amount?: number };
        settledAmount?: { amount?: number };
        fees?: number;
      }>;
    } | undefined;

  const closingBalanceCents = accountResponse?.data?.[0]?.balance?.amount ?? 0;
  const transactions = transactionResponse?.data ?? [];
  const movementCents = transactions.reduce((sum, transaction) => {
    const amount =
      transaction.type === 'CARD'
        ? transaction.settledAmount?.amount ?? 0
        : transaction.direction === 'CREDIT'
          ? transaction.receivedAmount?.amount ?? 0
          : transaction.sentAmount?.amount ?? 0;
    const signedAmount = transaction.direction === 'CREDIT' ? amount : -amount;
    return sum + signedAmount - (transaction.fees ?? 0);
  }, 0);
  const totalFeesCents = transactions.reduce((sum, transaction) => sum + (transaction.fees ?? 0), 0);

  return {
    openingBalanceCents: closingBalanceCents - movementCents,
    closingBalanceCents,
    totalFeesCents,
  };
}
