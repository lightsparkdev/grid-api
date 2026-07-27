import { describe, it, expect } from 'vitest';
import { isAllowed, redactHeaders, substituteCustomerId } from './allowlist';

describe('proxy allow-list', () => {
  it('allows the M1/M2 endpoints', () => {
    expect(isAllowed('GET', '/auth/credentials')).toBe(true);
    expect(isAllowed('POST', '/auth/credentials')).toBe(true);
    expect(isAllowed('POST', '/auth/credentials/AuthMethod:abc/challenge')).toBe(true);
    expect(isAllowed('POST', '/auth/credentials/AuthMethod:abc/verify')).toBe(true);
    expect(isAllowed('GET', '/customers/internal-accounts')).toBe(true);
    expect(isAllowed('GET', '/platform/internal-accounts')).toBe(true);
    expect(isAllowed('POST', '/customers/external-accounts')).toBe(true);
    expect(isAllowed('GET', '/transactions')).toBe(true);
    expect(isAllowed('GET', '/transactions/Transaction:abc')).toBe(true);
    expect(isAllowed('POST', '/quotes')).toBe(true);
    expect(isAllowed('POST', '/quotes/Quote:abc/execute')).toBe(true);
    expect(isAllowed('POST', '/sandbox/internal-accounts/InternalAccount:abc/fund')).toBe(true);
  });
  it('rejects everything else (incl. cards + wrong method)', () => {
    expect(isAllowed('POST', '/cards')).toBe(false);
    expect(isAllowed('DELETE', '/auth/credentials')).toBe(false);
    expect(isAllowed('POST', '/transactions/Transaction:abc')).toBe(false); // GET only
    expect(isAllowed('GET', '/quotes')).toBe(false); // POST only
    expect(isAllowed('POST', '/customers')).toBe(false);
  });
  it('redacts Authorization only', () => {
    const r = redactHeaders({ Authorization: 'Basic secret', 'Request-Id': 'Request:1' });
    expect(r.Authorization).toBe('Basic ***');
    expect(r['Request-Id']).toBe('Request:1');
  });
  it('substitutes every {customerId} token', () => {
    expect(substituteCustomerId('?customerId={customerId}', 'Customer:1')).toBe('?customerId=Customer:1');
    expect(substituteCustomerId('{customerId}/{customerId}', 'C')).toBe('C/C');
    expect(substituteCustomerId('nothing', 'C')).toBe('nothing');
  });
});
