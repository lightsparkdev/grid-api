import { describe, it, expect } from 'vitest';
import { accountLabel } from './moneySheet';

describe('accountLabel', () => {
  // A masked tail only means something for a number.
  it('masks a numeric account', () => {
    expect(accountLabel({ accountNumber: '3095972310', routingNumber: '758139375' })).toBe(
      '•••• 9375',
    );
  });
  it('masks an IBAN', () => {
    expect(accountLabel({ iban: 'DE89370400440532013000' })).toBe('•••• 3000');
  });

  // The bug this fixes: a UPI id rendered as "•••• @upi".
  it('shows a UPI handle whole', () => {
    expect(accountLabel({ vpa: 'pat@upi', bankName: 'HDFC Bank' })).toBe('pat@upi');
  });
  it('shows a PIX key whole', () => {
    expect(accountLabel({ pixKey: 'pat@example.com', taxId: '12345678901' })).toBe(
      'pat@example.com',
    );
  });
  // A numeric PIX key (CPF) is a number, so it masks like one.
  it('masks a numeric PIX key', () => {
    expect(accountLabel({ pixKey: '12345678901', pixKeyType: 'CPF' })).toBe('•••• 8901');
  });
  it('falls back when there is nothing to show', () => {
    expect(accountLabel({})).toBe('account');
  });
});
