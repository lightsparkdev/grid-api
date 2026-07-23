import { describe, it, expect } from 'vitest';
import { transactionToTx, type RawTransaction } from './gridReads';

const usdb = (amount: number) => ({ amount, currency: { code: 'USDB', decimals: 6 } });

describe('transactionToTx', () => {
  it('maps an incoming CREDIT to a positive row', () => {
    const t: RawTransaction = {
      id: 'Transaction:1', type: 'INCOMING', direction: 'CREDIT', status: 'COMPLETED',
      receivedAmount: usdb(2_000_000), counterpartyInformation: { FULL_NAME: 'Pat' },
    };
    const row = transactionToTx(t);
    expect(row.positive).toBe(true);
    expect(row.amount).toBe('+$2.00');
    expect(row.name).toBe('Pat');
    expect(row.sub).toBe('Completed');
  });
  it('maps an outgoing DEBIT to a negative row', () => {
    const t: RawTransaction = {
      id: 'Transaction:2', type: 'OUTGOING', direction: 'DEBIT', status: 'PROCESSING',
      sentAmount: usdb(1_500_000),
    };
    const row = transactionToTx(t);
    expect(row.positive).toBe(false);
    expect(row.amount).toBe('-$1.50');
    expect(row.sub).toBe('PROCESSING');
  });
  it('falls back to type when direction is absent', () => {
    const t: RawTransaction = { id: 'Transaction:3', type: 'INCOMING', status: 'COMPLETED', receivedAmount: usdb(0) };
    expect(transactionToTx(t).positive).toBe(true);
  });
});
