import { describe, expect, it } from 'vitest';
import {
  buildStatement,
  calculateTotals,
  DEFAULT_BRAND,
  LEGAL,
  PERIODS,
  REQUIREMENTS,
  statementFilename,
} from './fixtures';

describe('statement fixtures', () => {
  it('reconciles the consumer statement and fee total', () => {
    const statement = buildStatement('consumer', DEFAULT_BRAND, PERIODS[0]);

    expect(calculateTotals(statement)).toEqual({
      closingBalanceCents: 337395,
      totalFeesCents: 1500,
    });
    expect(statement.transactions.filter((transaction) => transaction.disputable)).toHaveLength(3);
  });

  it('reconciles the commercial statement without a Reg E overlay', () => {
    const statement = buildStatement('commercial', DEFAULT_BRAND, PERIODS[0]);

    expect(calculateTotals(statement)).toEqual({
      closingBalanceCents: 1445975,
      totalFeesCents: 1500,
    });
    expect(statement.transactions.every((transaction) => !('disputable' in transaction))).toBe(true);
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

  it('uses unique coverage identifiers and real data provenance', () => {
    expect(new Set(REQUIREMENTS.map((requirement) => requirement.id))).toHaveProperty(
      'size',
      REQUIREMENTS.length,
    );
    expect(REQUIREMENTS.map((requirement) => requirement.source).join(' ')).not.toMatch(
      /\/statements|webhook/i,
    );
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
