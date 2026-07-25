import { describe, it, expect, vi, beforeEach } from 'vitest';
import { gridFetch } from './gridClient';
import { pickCredentials, signIn, addPasskey, clearSession, getSession } from './gridSession';

// Mocked at the system boundaries only: the Grid network (gridClient) and the
// HPKE/Turnkey crypto wrapper (gridCrypto). Everything in between is the real
// sign-in flow.
vi.mock('./gridClient', () => ({ gridFetch: vi.fn() }));
vi.mock('./gridCrypto', () => ({
  genTek: () => ({ privHex: 'tek-priv', pubHex: 'tek-pub' }),
  compressedPubHex: () => 'tek-pub',
  encryptOtpBundle: () => 'encrypted-otp-bundle',
  decryptSessionKey: async () => 'passkey-session-priv',
  base64urlToBytes: () => new Uint8Array([1, 2, 3]),
  bytesToBase64url: () => 'b64url',
  stamp: async () => 'stamp-signature',
}));

const mockedFetch = vi.mocked(gridFetch);
const FUTURE = '2099-01-01T00:00:00Z';

type Cred = { id: string; type: string; nickname?: string; credentialId?: string };

const EMAIL_CRED: Cred = {
  id: 'AuthMethod:email',
  type: 'EMAIL_OTP',
  nickname: 'pat@example.com',
};
const PASSKEY_CRED: Cred = {
  id: 'AuthMethod:passkey',
  type: 'PASSKEY',
  credentialId: 'b64url',
};

function envelope(method: string, path: string, status: number, body: unknown) {
  return { request: { method: method as 'GET', path, headers: {} }, response: { status, body } };
}

/** Stands in for Grid: routes each call to a canned response. */
function serveGrid(credentials: Cred[]) {
  const creds = [...credentials];
  mockedFetch.mockImplementation(async (method: string, path: string, init?: unknown) => {
    const opts = (init ?? {}) as { body?: Record<string, unknown>; headers?: Record<string, string> };
    const signed = Boolean(opts.headers?.['Grid-Wallet-Signature']);
    const reply = (status: number, body: unknown) => envelope(method, path, status, body);

    if (method === 'GET' && path.startsWith('/customers/internal-accounts')) {
      return reply(200, {
        data: [
          {
            id: 'InternalAccount:1',
            customerId: 'Customer:1',
            balance: { amount: 1_500_000, currency: { decimals: 6 } },
          },
        ],
      });
    }
    if (method === 'GET' && path.startsWith('/auth/credentials')) {
      return reply(200, { data: creds });
    }
    // Register a new credential: 202 challenge, then 201 once signed.
    if (method === 'POST' && path === '/auth/credentials') {
      if (!signed) return reply(202, { payloadToSign: 'payload', requestId: 'req-create' });
      creds.push(PASSKEY_CRED);
      return reply(201, { id: PASSKEY_CRED.id, credentialId: PASSKEY_CRED.credentialId });
    }
    if (method === 'POST' && path.endsWith('/challenge')) {
      // The passkey challenge seals a client key; the email one mails a code.
      return opts.body && 'clientPublicKey' in opts.body
        ? reply(200, { credentialId: 'b64url', challenge: 'abc123', requestId: 'req-passkey' })
        : reply(200, { otpEncryptionTargetBundle: 'target-bundle' });
    }
    if (method === 'POST' && path.endsWith('/verify')) {
      if (opts.body?.type === 'PASSKEY') {
        return reply(200, { encryptedSessionSigningKey: 'sealed', expiresAt: FUTURE });
      }
      // EMAIL_OTP verify is two legs: 202 payloadToSign, then 200 once stamped.
      return signed
        ? reply(200, { expiresAt: FUTURE })
        : reply(202, { payloadToSign: 'payload', requestId: 'req-verify' });
    }
    throw new Error(`unrouted call: ${method} ${path}`);
  });
}

/** A browser with (or without) a passkey previously registered on THIS device. */
function stubDevice(storedPasskey?: string) {
  const store = new Map<string, string>();
  if (storedPasskey) store.set('grid.passkey.InternalAccount:1', storedPasskey);
  Object.defineProperty(globalThis, 'window', {
    value: {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
      },
    },
    configurable: true,
    writable: true,
  });
  return store;
}

/** WebAuthn + rp-id stubs (the platform boundary registerPasskey/passkeyAuth sit on). */
function stubWebAuthn() {
  const buf = () => new ArrayBuffer(8);
  const create = vi.fn(async () => ({
    rawId: buf(),
    response: { clientDataJSON: buf(), attestationObject: buf(), getTransports: () => ['internal'] },
  }));
  const get = vi.fn(async () => ({
    rawId: buf(),
    response: { clientDataJSON: buf(), authenticatorData: buf(), signature: buf(), userHandle: null },
  }));
  Object.defineProperty(globalThis, 'navigator', {
    value: { credentials: { create, get } },
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, 'location', {
    value: { hostname: 'localhost' },
    configurable: true,
    writable: true,
  });
  return { create, get };
}

function callsTo(method: string, match: (path: string) => boolean): number {
  return mockedFetch.mock.calls.filter(
    (c) => c[0] === method && match(String(c[1])),
  ).length;
}

function callbacks(overrides: Partial<Parameters<typeof signIn>[0]> = {}) {
  return {
    log: () => {},
    promptOtp: async () => '000000',
    ...overrides,
  } as Parameters<typeof signIn>[0];
}

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
    expect(r.emailOtpNickname).toBeNull();
  });
  it('reads the email on file from the EMAIL_OTP nickname', () => {
    const r = pickCredentials([
      { id: 'AuthMethod:1', type: 'EMAIL_OTP', nickname: 'pat@example.com' },
    ]);
    expect(r.emailOtpNickname).toBe('pat@example.com');
  });
});

describe('sign-in order', () => {
  beforeEach(() => {
    mockedFetch.mockReset();
    clearSession();
    stubWebAuthn();
    stubDevice(); // a fresh browser unless a test says otherwise
  });

  // A Global Account is born with ONLY an EMAIL_OTP credential, so the first
  // sign-in has to run on that alone — no passkey, no credential registration.
  it('first sign-in uses email OTP and registers nothing', async () => {
    serveGrid([EMAIL_CRED]);
    const session = await signIn(callbacks());

    expect(session.via).toBe('email_otp');
    expect(callsTo('POST', (p) => p === '/auth/credentials')).toBe(0);
  });

  it('offers the email on file to the entry step before mailing a code', async () => {
    serveGrid([EMAIL_CRED]);
    const seen: (string | null)[] = [];
    await signIn(
      callbacks({
        promptEmail: async (onFile) => {
          // The code must not have gone out yet when the entry step is up.
          expect(callsTo('POST', (p) => p.endsWith('/challenge'))).toBe(0);
          seen.push(onFile);
          return onFile ?? '';
        },
      }),
    );

    expect(seen).toEqual(['pat@example.com']);
    expect(callsTo('POST', (p) => p.endsWith('/challenge'))).toBe(1);
  });

  it('adding a passkey is a signed action authorized by the live session', async () => {
    serveGrid([EMAIL_CRED]);
    await signIn(callbacks());
    mockedFetch.mockClear();
    const promptOtp = vi.fn(async () => 'unused');

    await addPasskey(callbacks({ promptOtp }));

    // Registered (202 → signed retry → 201) and nothing else: no re-prompt, and
    // no challenge/verify on the new credential — the session that authorized
    // the change is still the session you're in.
    expect(callsTo('POST', (p) => p === '/auth/credentials')).toBe(2);
    expect(promptOtp).not.toHaveBeenCalled();
    expect(callsTo('POST', (p) => p.endsWith('/challenge') || p.endsWith('/verify'))).toBe(0);
    expect(getSession()?.via).toBe('email_otp');
  });

  // One device ceremony per tap. Two (register + immediately authenticate) makes
  // the user approve twice for a single action.
  it('prompts the authenticator exactly once', async () => {
    serveGrid([EMAIL_CRED]);
    const webauthn = stubWebAuthn();
    await signIn(callbacks());
    await addPasskey(callbacks());

    expect(webauthn.create).toHaveBeenCalledTimes(1);
    expect(webauthn.get).not.toHaveBeenCalled();
  });

  // Browsers require credentials.create() to run under the user activation from
  // the tap, so it must not sit behind a re-auth round-trip.
  it('runs the ceremony before re-authenticating a lapsed session', async () => {
    serveGrid([EMAIL_CRED]);
    await signIn(callbacks());
    clearSession(); // 15-minute session expired while the wallet sat open
    const order: string[] = [];
    mockedFetch.mockClear();
    const webauthn = stubWebAuthn();
    webauthn.create.mockImplementation(async () => {
      order.push('ceremony');
      return {
        rawId: new ArrayBuffer(8),
        response: {
          clientDataJSON: new ArrayBuffer(8),
          attestationObject: new ArrayBuffer(8),
          getTransports: () => [],
        },
      };
    });
    const promptOtp = vi.fn(async () => {
      order.push('otp');
      return '000000';
    });

    await addPasskey(callbacks({ promptOtp }));

    expect(order).toEqual(['ceremony', 'otp']);
    expect(promptOtp).toHaveBeenCalledTimes(1); // re-auth happened, once
    expect(callsTo('POST', (p) => p === '/auth/credentials')).toBe(2);
  });

  it('signs in with the passkey once THIS device has one', async () => {
    stubDevice(PASSKEY_CRED.credentialId);
    serveGrid([EMAIL_CRED, PASSKEY_CRED]);
    const promptOtp = vi.fn(async () => '000000');
    const session = await signIn(callbacks({ promptOtp }));

    expect(session.via).toBe('passkey');
    expect(promptOtp).not.toHaveBeenCalled();
  });

  // Passkeys are device-bound: one registered on another device is listed on the
  // account but unusable here, so a new browser must fall back to the email OTP
  // rather than launching a WebAuthn assertion that can never resolve.
  it('ignores a passkey this device did not register', async () => {
    serveGrid([EMAIL_CRED, PASSKEY_CRED]);
    const session = await signIn(callbacks());

    expect(session.via).toBe('email_otp');
  });

  it('remembers the passkey it just added for the next sign-in', async () => {
    const store = stubDevice();
    serveGrid([EMAIL_CRED]);
    await signIn(callbacks());
    await addPasskey(callbacks());
    clearSession();

    expect(store.get('grid.passkey.InternalAccount:1')).toBe(PASSKEY_CRED.credentialId);
    expect((await signIn(callbacks())).via).toBe('passkey');
  });
});
