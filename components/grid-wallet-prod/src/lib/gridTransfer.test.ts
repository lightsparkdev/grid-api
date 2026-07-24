import { describe, it, expect } from 'vitest';
import { findEmbeddedWalletPayload, destSignature, quoteBodyFor, isTerminalStatus } from './gridTransfer';

describe('gridTransfer pure helpers', () => {
  it('isTerminalStatus recognizes terminal vs in-flight states', () => {
    expect(isTerminalStatus('COMPLETED')).toBe(true);
    expect(isTerminalStatus('FAILED')).toBe(true);
    expect(isTerminalStatus('PROCESSING')).toBe(false);
    expect(isTerminalStatus('PENDING')).toBe(false);
  });
  it('finds the EMBEDDED_WALLET payloadToSign', () => {
    const q = {
      id: 'Quote:1', status: 'PENDING',
      paymentInstructions: [
        { accountOrWalletInfo: { accountType: 'USD_ACCOUNT' } },
        { accountOrWalletInfo: { accountType: 'EMBEDDED_WALLET', payloadToSign: '{"x":1}' } },
      ],
    };
    expect(findEmbeddedWalletPayload(q)).toBe('{"x":1}');
  });
  it('returns null when there is no embedded-wallet instruction', () => {
    expect(findEmbeddedWalletPayload({ id: 'Quote:2', status: 'PENDING', paymentInstructions: [] })).toBeNull();
  });
  it('destSignature dedupes identical destinations', () => {
    const a = { kind: 'crypto', address: 'x', network: 'SPARK', accountType: 'SPARK_WALLET', currency: 'BTC' } as const;
    expect(destSignature(a)).toBe(destSignature({ ...a }));
  });
  it('quoteBodyFor locks USDB sending in micro-units', () => {
    const b = quoteBodyFor('InternalAccount:1', 'ExternalAccount:2', 200, 'USD');
    expect(b.lockedCurrencySide).toBe('SENDING');
    expect(b.lockedCurrencyAmount).toBe(2_000_000);
    expect(b.source).toEqual({ sourceType: 'ACCOUNT', accountId: 'InternalAccount:1' });
    expect(b.destination).toEqual({ destinationType: 'ACCOUNT', accountId: 'ExternalAccount:2', currency: 'USD' });
  });
});
