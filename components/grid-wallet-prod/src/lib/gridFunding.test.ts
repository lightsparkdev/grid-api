import { describe, it, expect } from 'vitest';
import { realtimeFundingQuoteBodyFor, SANDBOX_FUNDING_CURRENCY } from './gridFunding';
import { CUSTOMER } from './gridTransfer';

describe('realtimeFundingQuoteBodyFor', () => {
  it('builds an inbound USD -> USDB quote locked on the sending (USD) side', () => {
    expect(realtimeFundingQuoteBodyFor('InternalAccount:wallet', 2000)).toEqual({
      source: { sourceType: 'REALTIME_FUNDING', currency: 'USD', customerId: CUSTOMER },
      destination: {
        destinationType: 'ACCOUNT',
        accountId: 'InternalAccount:wallet',
        currency: 'USDB',
      },
      lockedCurrencySide: 'SENDING',
      lockedCurrencyAmount: 2000,
    });
  });

  // The amount is the SENDING currency's minor units, so cents map through
  // unchanged — no USDB 6-decimal conversion (contrast gridUnits.centsToAmount).
  it('passes cents through without converting to USDB micro-units', () => {
    expect(realtimeFundingQuoteBodyFor('InternalAccount:wallet', 1).lockedCurrencyAmount).toBe(1);
    expect(realtimeFundingQuoteBodyFor('InternalAccount:wallet', 10_000).lockedCurrencyAmount).toBe(
      10_000,
    );
  });

  // The proxy substitutes the real id; the client never sees the customer id.
  it('sources from the customer placeholder rather than a hardcoded id', () => {
    const body = realtimeFundingQuoteBodyFor('InternalAccount:wallet', 100);
    expect(body.source.customerId).toBe('{customerId}');
  });

  it('defaults to the only currency this platform funds in sandbox', () => {
    expect(SANDBOX_FUNDING_CURRENCY).toBe('USD');
    expect(realtimeFundingQuoteBodyFor('InternalAccount:wallet', 100).source.currency).toBe('USD');
  });
});
