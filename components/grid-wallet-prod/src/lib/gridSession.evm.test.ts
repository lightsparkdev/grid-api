import { describe, it, expect, vi, beforeEach } from 'vitest';
import { gridFetch } from './gridClient';
import {
  signInWithEvmWallet,
  addEvmWallet,
  addEvmAdministrator,
  ensureSession,
  clearSession,
  getSession,
  signIn,
} from './gridSession';
import { EvmWalletNotOnAccountError, type CredentialRow, type EvmSigner } from './evmWallet';

// Mocked at the system boundaries only: the Grid network and the P-256 crypto
// wrapper. The stamp names the key it signed with, so a test can tell which
// key approved a request.
vi.mock('./gridClient', () => ({ gridFetch: vi.fn() }));
vi.mock('./gridCrypto', () => ({
  genTek: () => ({ privHex: 'client-priv', pubHex: '04-uncompressed' }),
  compressedPubHex: (priv: string) => `compressed(${priv})`,
  encryptOtpBundle: () => 'encrypted-otp-bundle',
  decryptSessionKey: async () => 'passkey-session-priv',
  base64urlToBytes: () => new Uint8Array([1]),
  bytesToBase64url: () => 'b64url',
  stamp: async (priv: string, payload: string) => `stamp(${priv},${payload})`,
}));

const mockedFetch = vi.mocked(gridFetch);
const ADDRESS = '0x2c7536E3605D9C16a7a3D7b1898e529396a65c23';
const FUTURE = '2099-01-01T00:00:00Z';

type Opts = { body?: Record<string, unknown>; headers?: Record<string, string> };
interface Call {
  method: string;
  path: string;
  opts: Opts;
}

function evmSigner(address = ADDRESS): EvmSigner & { signed: string[] } {
  const signed: string[] = [];
  return {
    address: address as `0x${string}`,
    signed,
    signMessage: async (message) => {
      signed.push(message);
      return `0xsig(${message})` as `0x${string}`;
    },
  };
}

/**
 * Stands in for Grid. The ownership proof returns 201 on an account with no
 * credentials (it creates the wallet) and a second 202 otherwise.
 */
function serveGrid(opts: {
  status: string;
  credentials: CredentialRow[];
  processingRetries?: number;
  sessionExpiresAt?: () => string;
}) {
  const creds = [...opts.credentials];
  const calls: Call[] = [];
  let processing = opts.processingRetries ?? 0;
  let adminLeg = 0;
  mockedFetch.mockImplementation(async (method: string, path: string, init?: unknown) => {
    const o = (init ?? {}) as Opts;
    calls.push({ method, path, opts: o });
    const h = o.headers ?? {};
    const reply = (status: number, body: unknown) => ({
      request: { method: method as 'GET', path, headers: {} },
      response: { status, body },
    });

    if (method === 'GET' && path.startsWith('/customers/internal-accounts')) {
      return reply(200, { data: [{ id: 'InternalAccount:1', status: opts.status }] });
    }
    if (method === 'GET' && path.startsWith('/auth/credentials')) return reply(200, { data: creds });
    if (method === 'POST' && path === '/auth/credentials') {
      if (h['Grid-Wallet-Ownership-Signature']) {
        if (creds.length === 0) {
          const created = { id: 'AuthMethod:evm', type: 'EVM_WALLET', nickname: ADDRESS };
          creds.push(created);
          return reply(201, created);
        }
        return reply(202, { payloadToSign: 'approve-add', requestId: 'Request:approve' });
      }
      if (h['Grid-Wallet-Signature']) {
        if (processing-- > 0) return reply(200, { status: 'PROCESSING' });
        const added = { id: 'AuthMethod:evm', type: 'EVM_WALLET', nickname: ADDRESS };
        creds.push(added);
        return reply(201, added);
      }
      return reply(202, { payloadToSign: 'link this wallet', requestId: 'Request:own' });
    }
    if (method === 'POST' && path === '/auth/admin-credentials') {
      adminLeg += 1;
      if (adminLeg === 1) return reply(202, { payloadToSign: 'create-user', requestId: 'Request:a1' });
      if (adminLeg === 2) return reply(202, { payloadToSign: 'grant-authority', requestId: 'Request:a2' });
      return reply(201, { id: 'AuthMethod:admin', type: 'EVM_WALLET', adminReference: o.body?.adminReference });
    }
    // The EMAIL_OTP legs, for a test that needs an email session live first.
    if (method === 'POST' && path.endsWith('/challenge') && !o.body?.clientPublicKey) {
      return reply(200, { otpEncryptionTargetBundle: 'target-bundle' });
    }
    if (method === 'POST' && path.endsWith('/verify') && o.body?.type === 'EMAIL_OTP') {
      return h['Grid-Wallet-Signature']
        ? reply(200, { expiresAt: FUTURE, nickname: 'pat@example.com' })
        : reply(202, { payloadToSign: 'otp-session', requestId: 'Request:otp' });
    }
    if (method === 'POST' && path.endsWith('/challenge')) {
      return reply(200, { type: 'EVM_WALLET', payloadToSign: 'session-request', requestId: 'Request:chal' });
    }
    if (method === 'POST' && path.endsWith('/verify')) {
      const cred = creds.find((c) => path.includes(c.id));
      return reply(200, {
        id: 'Session:1',
        expiresAt: opts.sessionExpiresAt?.() ?? FUTURE,
        nickname: cred?.nickname,
        adminReference: cred?.adminReference,
      });
    }
    throw new Error(`unrouted call: ${method} ${path}`);
  });
  return { calls, posts: () => calls.filter((c) => c.method === 'POST') };
}

const cb = () => ({ log: vi.fn(), promptOtp: vi.fn(async () => '000000') });

beforeEach(() => {
  mockedFetch.mockReset();
  clearSession();
  Object.defineProperty(globalThis, 'window', {
    value: { localStorage: { getItem: () => null, setItem: () => {} } },
    configurable: true,
    writable: true,
  });
});

describe('EVM wallet sign-in', () => {
  it('creates the wallet on a PENDING account with the ownership proof alone', async () => {
    const grid = serveGrid({ status: 'PENDING', credentials: [] });
    const signer = evmSigner();
    const s = await signInWithEvmWallet(signer, cb());

    const [create, proof, challenge, verify] = grid.posts();
    expect(create.opts.headers).toBeUndefined();
    expect(proof.opts.headers).toEqual({
      'Grid-Wallet-Ownership-Signature': '0xsig(link this wallet)',
      'Request-Id': 'Request:own',
    });
    expect(challenge.opts.body).toEqual({ clientPublicKey: 'compressed(client-priv)' });
    expect(verify.opts.body).toEqual({ type: 'EVM_WALLET', signature: '0xsig(session-request)' });
    expect(verify.opts.headers).toEqual({ 'Request-Id': 'Request:chal' });
    expect(signer.signed).toEqual(['link this wallet', 'session-request']);
    expect(s).toMatchObject({ via: 'evm_wallet', privHex: 'client-priv', nickname: ADDRESS });
  });

  it('only signs in when the account already lists this wallet', async () => {
    const grid = serveGrid({
      status: 'ACTIVE',
      credentials: [{ id: 'AuthMethod:evm', type: 'EVM_WALLET', nickname: ADDRESS.toLowerCase() }],
    });
    await signInWithEvmWallet(evmSigner(), cb());
    expect(grid.posts().map((c) => c.path)).toEqual([
      '/auth/credentials/AuthMethod:evm/challenge',
      '/auth/credentials/AuthMethod:evm/verify',
    ]);
  });

  it('refuses a wallet the account does not list, adding nothing', async () => {
    const grid = serveGrid({
      status: 'ACTIVE',
      credentials: [{ id: 'AuthMethod:email', type: 'EMAIL_OTP', nickname: 'pat@example.com' }],
    });
    await expect(signInWithEvmWallet(evmSigner(), cb())).rejects.toBeInstanceOf(EvmWalletNotOnAccountError);
    expect(grid.posts()).toEqual([]);
  });

  it('reads an administrator’s reference off the session', async () => {
    serveGrid({
      status: 'ACTIVE',
      credentials: [
        { id: 'AuthMethod:email', type: 'EMAIL_OTP', nickname: 'pat@example.com' },
        { id: 'AuthMethod:admin', type: 'EVM_WALLET', nickname: ADDRESS, adminReference: 'member_2c7536e3' },
      ],
    });
    const s = await signInWithEvmWallet(evmSigner(), cb());
    expect(s.adminReference).toBe('member_2c7536e3');
  });

  it('re-authenticates a lapsed EVM session with the wallet, not an email code', async () => {
    let first = true;
    const grid = serveGrid({
      status: 'ACTIVE',
      credentials: [
        { id: 'AuthMethod:email', type: 'EMAIL_OTP', nickname: 'pat@example.com' },
        { id: 'AuthMethod:evm', type: 'EVM_WALLET', nickname: ADDRESS },
      ],
      // Inside the 30s skew, so the first session already counts as lapsed.
      sessionExpiresAt: () => (first ? ((first = false), new Date(Date.now() + 5_000).toISOString()) : FUTURE),
    });
    const callbacks = cb();
    await signInWithEvmWallet(evmSigner(), callbacks);
    expect(getSession()).toBeNull();
    await ensureSession(callbacks);
    expect(callbacks.promptOtp).not.toHaveBeenCalled();
    expect(grid.posts().filter((c) => c.path.endsWith('/verify')).map((c) => c.path)).toEqual([
      '/auth/credentials/AuthMethod:evm/verify',
      '/auth/credentials/AuthMethod:evm/verify',
    ]);
  });
});

describe('adding an EVM wallet to an existing wallet', () => {
  it('proves ownership, then approves with the live session key, re-sending while PROCESSING', async () => {
    const grid = serveGrid({
      status: 'ACTIVE',
      credentials: [{ id: 'AuthMethod:email', type: 'EMAIL_OTP', nickname: 'pat@example.com' }],
      processingRetries: 1,
    });
    await signIn(cb());
    const before = grid.posts().length;

    await addEvmWallet(evmSigner(), cb());

    const adds = grid.posts().slice(before);
    expect(adds.map((c) => c.path)).toEqual(Array(4).fill('/auth/credentials'));
    const [, proof, approval, resend] = adds;
    expect(proof.opts.headers?.['Grid-Wallet-Ownership-Signature']).toBe('0xsig(link this wallet)');
    expect(approval.opts.headers).toEqual({
      'Grid-Wallet-Signature': 'stamp(client-priv,approve-add)',
      'Request-Id': 'Request:approve',
    });
    expect(resend.opts).toEqual(approval.opts);
  });
});

describe('adding another owner', () => {
  it('stamps both legs with the owner’s P-256 session key and sends the EVM public key', async () => {
    const grid = serveGrid({
      status: 'ACTIVE',
      credentials: [{ id: 'AuthMethod:evm', type: 'EVM_WALLET', nickname: ADDRESS }],
    });
    const owner = evmSigner();
    await signInWithEvmWallet(owner, cb());
    const before = grid.posts().length;

    const added = await addEvmAdministrator('0x02abc', 'member_1', cb());

    const legs = grid.posts().slice(before);
    expect(legs.map((c) => c.path)).toEqual(Array(3).fill('/auth/admin-credentials'));
    for (const leg of legs) {
      expect(leg.opts.body).toEqual({
        type: 'EVM_WALLET',
        accountId: 'InternalAccount:1',
        adminReference: 'member_1',
        publicKey: '0x02abc',
      });
    }
    expect(legs[0].opts.headers).toBeUndefined();
    expect(legs[1].opts.headers?.['Grid-Wallet-Signature']).toBe('stamp(client-priv,create-user)');
    expect(legs[2].opts.headers?.['Grid-Wallet-Signature']).toBe('stamp(client-priv,grant-authority)');
    // The owner's wallet signed only its own sign-in, never an approval.
    expect(owner.signed).toEqual(['session-request']);
    expect(added.adminReference).toBe('member_1');
  });
});

