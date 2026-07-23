import { describe, it, expect } from 'vitest';
import { fundAmountForCents } from './gridFunding';

describe('fundAmountForCents', () => {
  it('maps cents to USDB micro-units', () => {
    expect(fundAmountForCents(200)).toEqual({ amount: 2_000_000 });
    expect(fundAmountForCents(5000)).toEqual({ amount: 50_000_000 });
    expect(fundAmountForCents(0)).toEqual({ amount: 0 });
  });
});
