import { describe, expect, it } from 'vitest';
import { groupApiEntries } from '../lib/groupApiEntries';
import { flowIconForLabel } from '../data/flowIcons';
import { buildApiEntries, type StatementApiEntry } from './api';
import {
  DEFAULT_BRAND,
  STATEMENT_PERIOD,
  buildStatement,
  calculateTotals,
  statementRows,
} from './fixtures';

function reconcileApiEntries(entries: StatementApiEntry[]) {
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

describe('statement API projection', () => {
  it('reconciles every consumer statement row to the API response', () => {
    const statement = buildStatement('consumer', DEFAULT_BRAND, STATEMENT_PERIOD);
    const entries = buildApiEntries(statement, 1_700_000_000_000);
    const response = entries.find((entry) => entry.operationId === 'listTransactions')?.resBody as {
      data: Array<Record<string, any>>;
    };
    const amounts = response.data.flatMap((transaction) => {
      if (transaction.type === 'INCOMING') return [transaction.receivedAmount.amount];
      if (transaction.type === 'CARD') return [-transaction.settledAmount.amount];
      return [
        -transaction.sentAmount.amount,
        ...(transaction.fees > 0 ? [-transaction.fees] : []),
      ];
    });

    expect(amounts).toEqual(statementRows(statement).map((row) => row.amountCents));
    expect(reconcileApiEntries(entries)).toEqual({
      openingBalanceCents: 245000,
      closingBalanceCents: 337395,
      totalFeesCents: 1500,
    });
  });

  it.each(['consumer', 'commercial'] as const)(
    'reconciles the %s statement to the real API response chain',
    (variant) => {
      const statement = buildStatement(variant, DEFAULT_BRAND, STATEMENT_PERIOD);
      const entries = buildApiEntries(statement, 1_700_000_000_000);

      expect(entries.map((entry) => entry.operationId)).toEqual([
        'getCustomerById',
        'listCustomerInternalAccounts',
        'listTransactions',
      ]);
      expect(reconcileApiEntries(entries)).toEqual({
        openingBalanceCents: statement.openingBalanceCents,
        ...calculateTotals(statement),
      });
    },
  );

  it.each(['consumer', 'commercial'] as const)(
    'returns the required schema fields for the %s chain',
    (variant) => {
      const statement = buildStatement(variant, DEFAULT_BRAND, STATEMENT_PERIOD);
      const entries = buildApiEntries(statement, 1_700_000_000_000);
      const customer = entries[0].resBody;
      const accountList = entries[1].resBody as { data: Array<Record<string, any>> };
      const transactionList = entries[2].resBody as { data: Array<Record<string, any>> };

      expect(customer).toMatchObject({
        id: statement.account.customerId,
        platformCustomerId: statement.account.platformCustomerId,
        customerType: variant === 'consumer' ? 'INDIVIDUAL' : 'BUSINESS',
        currencies: ['USD'],
      });
      expect(accountList).toMatchObject({
        hasMore: false,
        totalCount: 1,
        data: [{
          id: statement.account.id,
          type: 'INTERNAL_FIAT',
          status: 'ACTIVE',
          balance: { amount: calculateTotals(statement).closingBalanceCents },
          totalBalance: { amount: calculateTotals(statement).closingBalanceCents },
          fundingPaymentInstructions: [],
        }],
      });

      for (const transaction of transactionList.data) {
        expect(transaction).toMatchObject({
          id: expect.any(String),
          type: expect.stringMatching(/^(INCOMING|OUTGOING|CARD)$/),
          status: expect.any(String),
          direction: expect.stringMatching(/^(CREDIT|DEBIT)$/),
          customerId: statement.account.customerId,
          platformCustomerId: statement.account.platformCustomerId,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        });
        if (transaction.type === 'CARD') {
          expect(transaction).toMatchObject({
            description: 'BLUE BOTTLE COFFEE',
            merchant: {
              descriptor: 'BLUE BOTTLE COFFEE',
              city: 'Los Angeles',
              state: 'CA',
              country: 'US',
            },
            authorizedAmount: { amount: expect.any(Number) },
            settledAmount: { amount: expect.any(Number) },
            accountId: statement.account.id,
            authorizedAt: expect.any(String),
          });
        } else {
          expect(transaction.destination).toBeTruthy();
          if (transaction.type === 'OUTGOING') {
            expect(transaction.source).toBeTruthy();
            expect(transaction.sentAmount.amount).toEqual(expect.any(Number));
          }
        }
      }

      expect(entries.map((entry) => entry.groupLabel)).toEqual([
        'Load statement',
        'Load statement',
        'Load statement',
      ]);
      expect(new Set(entries.map((entry) => entry.groupId)).size).toBe(1);
      const groups = groupApiEntries(entries);
      expect(groups).toHaveLength(1);
      expect(groups[0].groupLabel).toBe('Load statement');
      expect(groups[0].entries).toHaveLength(3);
      expect(flowIconForLabel('Load statement')?.Icon).toBeTruthy();
      expect(JSON.stringify(entries.map((entry) => entry.resBody))).not.toMatch(
        /disputable|terminal|openingBalance|closingBalance/,
      );
    },
  );

  it('uses the fixed closed-cycle dates', () => {
    const entries = buildApiEntries(
      buildStatement('consumer', DEFAULT_BRAND, STATEMENT_PERIOD),
      1_700_000_000_000,
    );
    const transactions = (
      entries.find((entry) => entry.operationId === 'listTransactions')?.resBody as {
        data: Array<{ createdAt: string }>;
      }
    ).data;

    expect(
      transactions.every(({ createdAt }) => createdAt.startsWith('2026-09-')),
    ).toBe(true);
  });

  it('keeps API entries independent from statement branding', () => {
    const branded = buildStatement(
      'consumer',
      {
        ...DEFAULT_BRAND,
        companyName: 'Changed name',
        logo: { kind: 'image', src: 'data:image/png;base64,AAAA', alt: 'Logo' },
        colors: {
          primaryBackground: '#000000',
          primaryText: '#ffffff',
          secondaryText: '#eeeeee',
        },
      },
      STATEMENT_PERIOD,
    );

    expect(buildApiEntries(branded, 1_700_000_000_000)).toEqual(
      buildApiEntries(
        buildStatement('consumer', DEFAULT_BRAND, STATEMENT_PERIOD),
        1_700_000_000_000,
      ),
    );
  });
});
