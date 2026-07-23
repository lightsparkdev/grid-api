import { describe, it, expect } from 'vitest';
import { pickCredentials } from './gridSession';

describe('pickCredentials', () => {
  it('finds EMAIL_OTP and first PASSKEY', () => {
    const r = pickCredentials([
      { id: 'AuthMethod:1', type: 'EMAIL_OTP' },
      { id: 'AuthMethod:2', type: 'PASSKEY' },
      { id: 'AuthMethod:3', type: 'PASSKEY' },
    ]);
    expect(r.emailOtpId).toBe('AuthMethod:1');
    expect(r.passkeyId).toBe('AuthMethod:2');
  });
  it('returns nulls when absent', () => {
    const r = pickCredentials([{ id: 'AuthMethod:9', type: 'OAUTH' }]);
    expect(r.emailOtpId).toBeNull();
    expect(r.passkeyId).toBeNull();
  });
});
