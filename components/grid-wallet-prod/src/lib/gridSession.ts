'use client';

import { gridFetch, type GridEnvelope } from './gridClient';
import {
  genTek, compressedPubHex, encryptOtpBundle, decryptSessionKey,
  base64urlToBytes, bytesToBase64url,
} from './gridCrypto';
import { amountToCents, USDB_DECIMALS } from './gridUnits';

export type LogFn = (env: GridEnvelope) => void;

export interface AuthCallbacks {
  /** Resolves with the OTP code the user typed (sandbox magic code "000000"). */
  promptOtp: () => Promise<string>;
  /** Every real request/response is handed here so the panel can render it. */
  log: LogFn;
  /** Optional: play the Face ID animation around the WebAuthn assertion. */
  onFaceId?: () => Promise<void>;
}

export interface WalletAccount {
  customerId: string;
  accountId: string;
  emailOtpCredentialId: string;
  passkeyCredentialId: string | null;
  balanceCents: number;
}

export interface Session {
  privHex: string;
  accountId: string;
  expiresAt: number;
  via: 'passkey' | 'email_otp';
}

const CUSTOMER_PLACEHOLDER = '{customerId}';
const SESSION_SKEW_MS = 30_000; // treat as expired 30s early
const PASSKEY_LS_PREFIX = 'grid.passkey.'; // + accountId -> credentialId

let session: Session | null = null;
let account: WalletAccount | null = null;

export function getSession(): Session | null {
  return session && session.expiresAt - SESSION_SKEW_MS > Date.now() ? session : null;
}
export function clearSession(): void {
  session = null;
}

/** Pure: choose the EMAIL_OTP + first PASSKEY credential from the list. */
export function pickCredentials(
  data: { id: string; type: string }[],
): { emailOtpId: string | null; passkeyId: string | null } {
  return {
    emailOtpId: data.find((c) => c.type === 'EMAIL_OTP')?.id ?? null,
    passkeyId: data.find((c) => c.type === 'PASSKEY')?.id ?? null,
  };
}

function assertOk(env: GridEnvelope, expected: number[], where: string): void {
  if (!expected.includes(env.response.status)) {
    const body = env.response.body as { error?: { code?: string; message?: string } };
    throw new Error(
      `${where}: expected ${expected.join('/')}, got ${env.response.status} ` +
        `(${body?.error?.code ?? ''} ${body?.error?.message ?? ''})`.trim(),
    );
  }
}

export async function loadWalletAccount(log: LogFn): Promise<WalletAccount> {
  const acctEnv = await gridFetch(
    'GET',
    `/customers/internal-accounts?customerId=${CUSTOMER_PLACEHOLDER}&type=EMBEDDED_WALLET`,
  );
  log(acctEnv);
  assertOk(acctEnv, [200], 'load internal accounts');
  const acctBody = acctEnv.response.body as {
    data: { id: string; customerId?: string; balance: { amount: number; currency: { decimals: number } } }[];
  };
  const wallet = acctBody.data[0];
  if (!wallet) throw new Error('No EMBEDDED_WALLET internal account for customer');
  const accountId = wallet.id;
  const balanceCents = amountToCents(wallet.balance.amount, wallet.balance.currency.decimals);

  const credEnv = await gridFetch('GET', `/auth/credentials?accountId=${accountId}`);
  log(credEnv);
  assertOk(credEnv, [200], 'list credentials');
  const credBody = credEnv.response.body as { data: { id: string; type: string }[] };
  const { emailOtpId, passkeyId } = pickCredentials(credBody.data);
  if (!emailOtpId) throw new Error('No EMAIL_OTP credential on the wallet');

  // Trust the server list; fall back to localStorage only to disambiguate multiple passkeys.
  const stored = typeof window !== 'undefined'
    ? window.localStorage.getItem(PASSKEY_LS_PREFIX + accountId)
    : null;

  account = {
    customerId: wallet.customerId ?? '',
    accountId,
    emailOtpCredentialId: emailOtpId,
    passkeyCredentialId: passkeyId ?? stored,
    balanceCents,
  };
  return account;
}

/** EMAIL_OTP two-leg verify -> session (TEK priv IS the session key). */
async function emailOtpAuth(acct: WalletAccount, cb: AuthCallbacks): Promise<Session> {
  const id = acct.emailOtpCredentialId;
  // Challenge: sends OTP + returns otpEncryptionTargetBundle.
  const chal = await gridFetch('POST', `/auth/credentials/${id}/challenge`, { body: {} });
  cb.log(chal);
  assertOk(chal, [200], 'email otp challenge');
  const bundle = (chal.response.body as { otpEncryptionTargetBundle: string }).otpEncryptionTargetBundle;

  const code = await cb.promptOtp();
  const tek = genTek();
  const encryptedOtpBundle = encryptOtpBundle(bundle, tek.pubHex, code);
  const verifyBody = { type: 'EMAIL_OTP', encryptedOtpBundle };

  // Leg 1: 202 payloadToSign + requestId.
  const leg1 = await gridFetch('POST', `/auth/credentials/${id}/verify`, { body: verifyBody });
  cb.log(leg1);
  assertOk(leg1, [202], 'email otp verify (leg 1)');
  const { payloadToSign, requestId } = leg1.response.body as { payloadToSign: string; requestId: string };

  // Leg 2: stamp payloadToSign with the TEK priv, retry.
  const { stamp } = await import('./gridCrypto');
  const sig = await stamp(tek.privHex, payloadToSign);
  const leg2 = await gridFetch('POST', `/auth/credentials/${id}/verify`, {
    body: verifyBody,
    headers: { 'Grid-Wallet-Signature': sig, 'Request-Id': requestId },
  });
  cb.log(leg2);
  assertOk(leg2, [200], 'email otp verify (leg 2)');
  const sess = leg2.response.body as { expiresAt: string };
  return { privHex: tek.privHex, accountId: acct.accountId, expiresAt: Date.parse(sess.expiresAt), via: 'email_otp' };
}

/** Register a NEW passkey credential (signed retry authorized by the current session). */
async function registerPasskey(acct: WalletAccount, sessionPrivHex: string, cb: AuthCallbacks): Promise<string> {
  // 1. Self-issued WebAuthn registration challenge (no integrator backend here).
  const regChallenge = crypto.getRandomValues(new Uint8Array(32));
  const regChallengeB64 = bytesToBase64url(regChallenge);
  const cred = (await navigator.credentials.create({
    publicKey: {
      challenge: regChallenge,
      rp: { id: location.hostname, name: 'Grid Wallet' },
      user: {
        id: crypto.getRandomValues(new Uint8Array(16)),
        name: 'wallet@lightspark.com',
        displayName: 'Grid Wallet',
      },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }], // ES256
      authenticatorSelection: { residentKey: 'preferred', userVerification: 'required' },
      timeout: 60_000,
    },
  })) as PublicKeyCredential;
  const att = cred.response as AuthenticatorAttestationResponse;
  const attestation = {
    credentialId: bytesToBase64url(new Uint8Array(cred.rawId)),
    clientDataJson: bytesToBase64url(new Uint8Array(att.clientDataJSON)),
    attestationObject: bytesToBase64url(new Uint8Array(att.attestationObject)),
    transports: att.getTransports?.() ?? [],
  };
  const createBody = {
    type: 'PASSKEY',
    accountId: acct.accountId,
    nickname: 'This device',
    challenge: regChallengeB64,
    attestation,
  };

  // 2. POST /auth/credentials -> 202 payloadToSign + requestId.
  const leg1 = await gridFetch('POST', '/auth/credentials', { body: createBody });
  cb.log(leg1);
  assertOk(leg1, [202], 'passkey create (leg 1)');
  const { payloadToSign, requestId } = leg1.response.body as { payloadToSign: string; requestId: string };

  // 3. Stamp with the CURRENT (email-otp) session key, retry -> 201 AuthMethod.
  const { stamp } = await import('./gridCrypto');
  const sig = await stamp(sessionPrivHex, payloadToSign);
  const leg2 = await gridFetch('POST', '/auth/credentials', {
    body: createBody,
    headers: { 'Grid-Wallet-Signature': sig, 'Request-Id': requestId },
  });
  cb.log(leg2);
  assertOk(leg2, [201], 'passkey create (leg 2)');
  const authMethod = leg2.response.body as { id: string; credentialId?: string };

  const credentialId = authMethod.credentialId ?? attestation.credentialId;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(PASSKEY_LS_PREFIX + acct.accountId, credentialId);
  }
  return authMethod.id; // AuthMethod id (used for the activation challenge/verify)
}

/** Passkey authenticate: /challenge (clientPublicKey) -> get() -> /verify -> session. */
async function passkeyAuth(acct: WalletAccount, credentialAuthMethodId: string, cb: AuthCallbacks): Promise<Session> {
  const tek = genTek(); // ephemeral client key sealed into the session
  const chal = await gridFetch('POST', `/auth/credentials/${credentialAuthMethodId}/challenge`, {
    body: { clientPublicKey: tek.pubHex },
  });
  cb.log(chal);
  assertOk(chal, [200], 'passkey challenge');
  const pk = chal.response.body as { credentialId: string; challenge: string; requestId: string };

  if (cb.onFaceId) await cb.onFaceId();
  const assertionCred = (await navigator.credentials.get({
    publicKey: {
      challenge: new TextEncoder().encode(pk.challenge), // hex string -> UTF-8 bytes (per PasskeyAuthChallenge)
      rpId: location.hostname,
      userVerification: 'required',
      // TS 5.9's DOM lib types BufferSource as ArrayBufferView<ArrayBuffer>; the
      // decoded id is a plain Uint8Array<ArrayBufferLike> (base64urlnopad has no
      // narrower typing) — cast, no runtime behavior change.
      allowCredentials: [{ type: 'public-key', id: base64urlToBytes(pk.credentialId) as BufferSource }],
      timeout: 60_000,
    },
  })) as PublicKeyCredential;
  const asr = assertionCred.response as AuthenticatorAssertionResponse;
  const assertion = {
    credentialId: bytesToBase64url(new Uint8Array(assertionCred.rawId)),
    clientDataJson: bytesToBase64url(new Uint8Array(asr.clientDataJSON)),
    authenticatorData: bytesToBase64url(new Uint8Array(asr.authenticatorData)),
    signature: bytesToBase64url(new Uint8Array(asr.signature)),
    ...(asr.userHandle ? { userHandle: bytesToBase64url(new Uint8Array(asr.userHandle)) } : {}),
  };

  const verify = await gridFetch('POST', `/auth/credentials/${credentialAuthMethodId}/verify`, {
    body: { type: 'PASSKEY', assertion },
    headers: { 'Request-Id': pk.requestId },
  });
  cb.log(verify);
  assertOk(verify, [200], 'passkey verify');
  const sess = verify.response.body as { encryptedSessionSigningKey: string; expiresAt: string };
  const privHex = await decryptSessionKey(sess.encryptedSessionSigningKey, tek.privHex);
  return { privHex, accountId: acct.accountId, expiresAt: Date.parse(sess.expiresAt), via: 'passkey' };
}

export async function signIn(cb: AuthCallbacks): Promise<Session> {
  const acct = await loadWalletAccount(cb.log);
  if (acct.passkeyCredentialId) {
    // Returning: authenticate the existing passkey. We need its AuthMethod id.
    // GET /auth/credentials returned AuthMethod ids AND passkey credentialIds;
    // re-list to resolve the AuthMethod id for the stored/ discovered passkey.
    const credEnv = await gridFetch('GET', `/auth/credentials?accountId=${acct.accountId}`);
    cb.log(credEnv);
    const list = (credEnv.response.body as { data: { id: string; type: string; credentialId?: string }[] }).data;
    const passkey = list.find(
      (c) => c.type === 'PASSKEY' && (c.credentialId === acct.passkeyCredentialId || !acct.passkeyCredentialId),
    ) ?? list.find((c) => c.type === 'PASSKEY');
    if (!passkey) throw new Error('Passkey credential vanished; clear localStorage and retry');
    session = await passkeyAuth(acct, passkey.id, cb);
    return session;
  }
  // First run: EMAIL_OTP session -> register passkey -> passkey session.
  const otpSession = await emailOtpAuth(acct, cb);
  const passkeyAuthMethodId = await registerPasskey(acct, otpSession.privHex, cb);
  session = await passkeyAuth(acct, passkeyAuthMethodId, cb);
  return session;
}

export async function ensureSession(cb: AuthCallbacks): Promise<string> {
  const live = getSession();
  if (live) return live.privHex;
  // Silent single re-auth via the returning (passkey) path.
  const s = await signIn(cb);
  return s.privHex;
}

export function getAccount(): WalletAccount | null {
  return account;
}
