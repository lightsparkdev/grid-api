import { describe, expect, it } from 'vitest';
import {
  buildStatement,
  calculateTotals,
  DEFAULT_BRAND,
  LEGAL,
  PERIODS,
  statementRows,
  statementFilename,
} from './fixtures';
import { buildApiEntries, reconcileApiEntries } from './api';

describe('statement fixtures', () => {
  it('reconciles the consumer statement and fee total', () => {
    const statement = buildStatement('consumer', DEFAULT_BRAND, PERIODS[0]);

    expect(calculateTotals(statement)).toEqual({
      closingBalanceCents: 337395,
      totalFeesCents: 1500,
    });
    expect(statementRows(statement).filter((transaction) => transaction.disputable)).toHaveLength(3);
  });

  it('reconciles the commercial statement without a Reg E overlay', () => {
    const statement = buildStatement('commercial', DEFAULT_BRAND, PERIODS[0]);

    expect(calculateTotals(statement)).toEqual({
      closingBalanceCents: 1445975,
      totalFeesCents: 1500,
    });
    expect(statementRows(statement).every((transaction) => transaction.disputable === undefined)).toBe(true);
  });

  it('pins reviewed legal roles and notice language', () => {
    expect(LEGAL.provider).toBe(
      'This account is held at Lead Bank, the account-holding institution. Lightspark is the program manager and is not a bank.',
    );
    expect(LEGAL.notice.join('\n')).toBe(
      [
        'Telephone us at (855) 516-0103 or Write us at 8605 Santa Monica Blvd, PMB 64461, West Hollywood, CA 90069 as soon as you can, if you think your statement or receipt is wrong or if you need more information about a transfer on the statement or receipt. We must hear from you no later than 60 days after we sent you the FIRST statement on which the error or problem appeared.',
        '(1) Tell us your name and account number (if any).',
        '(2) Describe the error or the transfer you are unsure about, and explain as clearly as you can why you believe it is an error or why you need more information.',
        '(3) Tell us the dollar amount of the suspected error.',
        'We will investigate your complaint and will correct any error promptly. If we take more than 10 business days to do this, we will credit your account for the amount you think is in error, so that you will have the use of the money during the time it takes us to complete our investigation.',
      ].join('\n'),
    );
  });

  it.each(['consumer', 'commercial'] as const)(
    'reconciles the %s statement to the real API response chain',
    (variant) => {
      const statement = buildStatement(variant, DEFAULT_BRAND, PERIODS[0]);
      const entries = buildApiEntries(statement, 1_700_000_000_000);

      expect(entries.map((entry) => entry.operationId)).toEqual([
        'getCustomerById',
        'listCustomerInternalAccounts',
        'listTransactions',
      ]);
      expect(reconcileApiEntries(statement, entries)).toEqual({
        openingBalanceCents: statement.openingBalanceCents,
        ...calculateTotals(statement),
      });
    },
  );

  it('projects one wire transaction into principal and fee rows', () => {
    const statement = buildStatement('consumer', DEFAULT_BRAND, PERIODS[0]);

    expect(statementRows(statement).slice(3, 5)).toEqual([
      {
        id: 'c4',
        day: '18',
        type: 'Wire transfer out',
        party: 'First National Escrow',
        amountCents: -100000,
        isFee: false,
        disputable: false,
        terminal: undefined,
      },
      {
        id: 'c4-fee',
        day: '18',
        type: 'Wire transfer fee',
        party: 'Lead Bank',
        amountCents: -1500,
        isFee: true,
        disputable: false,
      },
    ]);
  });

  it('creates the requested PDF filename', () => {
    const statement = buildStatement(
      'consumer',
      { companyName: 'Northstar Money, Inc.', logo: { kind: 'none' } },
      PERIODS[1],
    );

    expect(statementFilename(statement)).toBe('northstar-money-inc-statement-2026-08.pdf');
  });
});
