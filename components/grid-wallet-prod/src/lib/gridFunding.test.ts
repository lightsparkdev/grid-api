import { describe, it, expect } from 'vitest';
import { platformFundAmountForCents, onRampQuoteBodyFor } from './gridFunding';

describe('platformFundAmountForCents', () => {
  it('maps cents 1:1 to the USD platform account smallest unit (no 6-decimal conversion)', () => {
    expect(platformFundAmountForCents(200)).toEqual({ amount: 200 });
    expect(platformFundAmountForCents(5000)).toEqual({ amount: 5000 });
    expect(platformFundAmountForCents(0)).toEqual({ amount: 0 });
  });
});

describe('onRampQuoteBodyFor', () => {
  it('builds a platform -> customer-wallet USD->USDB quote locked on the sending (USD) side', () => {
    expect(onRampQuoteBodyFor('InternalAccount:platform', 'InternalAccount:customer', 2000)).toEqual({
      source: { sourceType: 'ACCOUNT', accountId: 'InternalAccount:platform' },
      destination: {
        destinationType: 'ACCOUNT',
        accountId: 'InternalAccount:customer',
        currency: 'USDB',
      },
      lockedCurrencySide: 'SENDING',
      lockedCurrencyAmount: 2000,
    });
  });
});
