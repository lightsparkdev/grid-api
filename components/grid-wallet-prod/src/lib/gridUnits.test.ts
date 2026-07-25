import { describe, it, expect } from 'vitest';
import { amountToCents, centsToAmount, formatCents, USDB_DECIMALS } from './gridUnits';

describe('gridUnits', () => {
  it('maps USDB (6dp) micro-units to cents', () => {
    expect(amountToCents(2_000_000, USDB_DECIMALS)).toBe(200); // 2 USDB -> $2.00
    expect(amountToCents(1_500_000, USDB_DECIMALS)).toBe(150);
    expect(amountToCents(0, USDB_DECIMALS)).toBe(0);
  });
  it('maps USD (2dp) amount straight through', () => {
    expect(amountToCents(20000, 2)).toBe(20000);
  });
  it('maps BTC (8dp) down to cents', () => {
    expect(amountToCents(100_000_000, 8)).toBe(100); // 1.00000000 -> "$1.00" scale
  });
  it('round-trips cents -> USDB -> cents', () => {
    for (const c of [0, 1, 200, 99, 123456]) {
      expect(amountToCents(centsToAmount(c, USDB_DECIMALS), USDB_DECIMALS)).toBe(c);
    }
  });
  it('centsToAmount produces USDB micro-units', () => {
    expect(centsToAmount(200, USDB_DECIMALS)).toBe(2_000_000);
  });
  it('formats cents', () => {
    expect(formatCents(200)).toBe('$2.00');
    expect(formatCents(123456)).toBe('$1,234.56');
  });
});
