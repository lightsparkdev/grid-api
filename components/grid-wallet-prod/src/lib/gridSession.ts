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
  /**
   * Optional email-entry step shown BEFORE the OTP is sent. Receives the
   * address the EMAIL_OTP credential is actually tied to (the credential's
   * nickname) so the field can be prefilled truthfully — Grid mails the code to
   * the address on file regardless of what's typed here, so the prefill is what
   * makes the step honest.
   */
  promptEmail?: (emailOnFile: string | null) => Promise<string>;
}

export interface WalletAccount {
  customerId: string;
  accountId: string;
  emailOtpCredentialId: string;
  /** Address the EMAIL_OTP credential is tied to (its `nickname`). */
  email: string | null;
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

/** Pure: choose the EMAIL_OTP + first PASSKEY credential from the list. The
 *  EMAIL_OTP credential's `nickname` IS the email address it's tied to. */
export function pickCredentials(
  data: { id: string; type: string; nickname?: string }[],
): { emailOtpId: string | null; emailOtpNickname: string | null; passkeyId: string | null } {
  const emailOtp = data.find((c) => c.type === 'EMAIL_OTP');
  return {
    emailOtpId: emailOtp?.id ?? null,
    emailOtpNickname: emailOtp?.nickname ?? null,
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
  const credBody = credEnv.response.body as {
    data: { id: string; type: string; nickname?: string; credentialId?: string }[];
  };
  const { emailOtpId, emailOtpNickname } = pickCredentials(credBody.data);
  if (!emailOtpId) throw new Error('No EMAIL_OTP credential on the wallet');

  const stored = typeof window !== 'undefined'
    ? window.localStorage.getItem(PASSKEY_LS_PREFIX + accountId)
    : null;

  account = {
    customerId: wallet.customerId ?? '',
    accountId,
    emailOtpCredentialId: emailOtpId,
    email: emailOtpNickname,
    passkeyCredentialId: thisDevicePasskey(stored, credBody.data),
    balanceCents,
  };
  return account;
}

/**
 * Which passkey can THIS browser actually sign in with. Passkeys are
 * device-bound: the account may list one registered on another device, and
 * `navigator.credentials.get` here would never find it — so only a credential
 * this device registered (localStorage) counts, and only while the account still
 * lists it. Anything else means "new device": sign in with the email OTP and add
 * a passkey from the wallet.
 */
export function thisDevicePasskey(
  stored: string | null,
  credentials: { type: string; credentialId?: string }[],
): string | null {
  if (!stored) return null;
  const onAccount = credentials.some((c) => c.type === 'PASSKEY' && c.credentialId === stored);
  return onAccount ? stored : null;
}

/**
 * Entry step (when the skin has one) → challenge → code. The code step can go
 * BACK to the entry step: promptOtp rejects with 'back', and the next pass
 * issues a FRESH challenge, so a new code genuinely goes out. Each iteration's
 * bundle belongs to that iteration's challenge — they can't be split apart.
 */
async function collectOtp(
  acct: WalletAccount,
  cb: AuthCallbacks,
): Promise<{ bundle: string; code: string }> {
  const id = acct.emailOtpCredentialId;
  for (;;) {
    // The code only goes out once the user commits to the address (prefilled
    // with the one the credential is actually tied to).
    if (cb.promptEmail) await cb.promptEmail(acct.email);
    const chal = await gridFetch('POST', `/auth/credentials/${id}/challenge`, { body: {} });
    cb.log(chal);
    assertOk(chal, [200], 'email otp challenge');
    const bundle = (chal.response.body as { otpEncryptionTargetBundle: string })
      .otpEncryptionTargetBundle;
    try {
      return { bundle, code: await cb.promptOtp() };
    } catch (e) {
      // 'back' only has somewhere to go when there IS an entry step.
      if ((e as Error)?.message !== 'back' || !cb.promptEmail) throw e;
    }
  }
}

/** EMAIL_OTP two-leg verify -> session (TEK priv IS the session key). */
async function emailOtpAuth(acct: WalletAccount, cb: AuthCallbacks): Promise<Session> {
  const id = acct.emailOtpCredentialId;
  const { bundle, code } = await collectOtp(acct, cb);
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

interface NewCredential {
  challenge: string;
  attestation: {
    credentialId: string;
    clientDataJson: string;
    attestationObject: string;
    transports: string[];
  };
}

/**
 * The WebAuthn half of registration — ONE device ceremony (Touch ID / Face ID),
 * no network. Split out and called FIRST so it runs inside the tap that started
 * it: browsers require `credentials.create` to happen under a live user
 * activation, and an intervening re-auth round-trip would spend it.
 */
async function createPasskeyCredential(): Promise<NewCredential> {
  // Self-issued WebAuthn registration challenge (no integrator backend here).
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
  return { challenge: regChallengeB64, attestation };
}

/**
 * The network half: POST the new credential, then repeat it signed by the
 * session key that authorizes the change (the email-OTP one on a first run).
 */
async function registerPasskey(
  acct: WalletAccount,
  created: NewCredential,
  sessionPrivHex: string,
  cb: AuthCallbacks,
): Promise<string> {
  const { challenge, attestation } = created;
  const createBody = {
    type: 'PASSKEY',
    accountId: acct.accountId,
    nickname: 'This device',
    challenge,
    attestation,
  };

  // POST /auth/credentials -> 202 payloadToSign + requestId.
  const leg1 = await gridFetch('POST', '/auth/credentials', { body: createBody });
  cb.log(leg1);
  assertOk(leg1, [202], 'passkey create (leg 1)');
  const { payloadToSign, requestId } = leg1.response.body as { payloadToSign: string; requestId: string };

  // Stamp with the CURRENT session key, retry -> 201 AuthMethod.
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
  // The account now HAS a passkey — reflected in place so hasPasskey() and the
  // next signIn() take the passkey path without a reload.
  acct.passkeyCredentialId = credentialId;
  return authMethod.id;
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

/** Resolve the AuthMethod id of the account's passkey (needed for challenge/verify). */
async function findPasskeyAuthMethodId(acct: WalletAccount, cb: AuthCallbacks): Promise<string> {
  // GET /auth/credentials returned AuthMethod ids AND passkey credentialIds;
  // re-list to resolve the AuthMethod id for the stored/discovered passkey.
  const credEnv = await gridFetch('GET', `/auth/credentials?accountId=${acct.accountId}`);
  cb.log(credEnv);
  const list = (credEnv.response.body as { data: { id: string; type: string; credentialId?: string }[] }).data;
  const passkey =
    list.find(
      (c) => c.type === 'PASSKEY' && (c.credentialId === acct.passkeyCredentialId || !acct.passkeyCredentialId),
    ) ?? list.find((c) => c.type === 'PASSKEY');
  if (!passkey) throw new Error('Passkey credential vanished; clear localStorage and retry');
  return passkey.id;
}

/**
 * Sign in with whatever the account already has. Global Accounts are born with
 * only an EMAIL_OTP credential, so the FIRST sign-in is always email OTP — that
 * session is what later authorizes adding a passkey (see addPasskey). Once a
 * passkey exists, it takes over as the sign-in path.
 */
export async function signIn(cb: AuthCallbacks): Promise<Session> {
  const acct = await loadWalletAccount(cb.log);
  if (acct.passkeyCredentialId) {
    session = await passkeyAuth(acct, await findPasskeyAuthMethodId(acct, cb), cb);
    return session;
  }
  session = await emailOtpAuth(acct, cb);
  return session;
}

/**
 * Add a passkey to the account, later, as its own action — the docs' bootstrap
 * order: "you can add passkeys or OAuth credentials later, but adding
 * credentials is itself a signed action". The signature comes from the session
 * you're ALREADY in (the email-OTP one on a first run), so this is exactly one
 * device ceremony: register the credential and stop. It is not authenticated
 * here — no challenge/verify, no second prompt — the passkey gets exercised at
 * the next sign-in, and the current session stays as it is.
 *
 * Returns the new credential's AuthMethod id.
 */
export async function addPasskey(cb: AuthCallbacks): Promise<string> {
  // The device ceremony goes FIRST, while the user activation from the tap is
  // still live — a re-auth round-trip in front of it would invalidate it.
  const created = await createPasskeyCredential();
  // A live session is the authorization; only re-auth when it has lapsed.
  const live = getSession();
  const privHex = live ? live.privHex : (await signIn(cb)).privHex;
  const acct = account ?? (await loadWalletAccount(cb.log));
  return registerPasskey(acct, created, privHex, cb);
}

/** Has this account got a passkey yet? Drives the wallet's "add a passkey" nudge. */
export function hasPasskey(): boolean {
  return Boolean(account?.passkeyCredentialId);
}

/**
 * Did THIS browser register a passkey (for any account)? Answered from
 * localStorage alone, with no network call, so the sign-in screen can label its
 * button for the credential `signIn` will actually use before anything is
 * fetched. Optimistic by design: if the credential has since been revoked
 * server-side, `loadWalletAccount` discovers that mid-flow and the email OTP
 * takes over (see thisDevicePasskey).
 */
export function deviceHasPasskey(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(PASSKEY_LS_PREFIX) && window.localStorage.getItem(key)) return true;
    }
  } catch {
    // Storage blocked (private mode / embed) — treat as a fresh device.
  }
  return false;
}

export async function ensureSession(cb: AuthCallbacks): Promise<string> {
  const live = getSession();
  if (live) return live.privHex;
  // Silent single re-auth on whatever credential the account has (passkey once
  // one has been added; the email OTP prompt before that).
  const s = await signIn(cb);
  return s.privHex;
}

export function getAccount(): WalletAccount | null {
  return account;
}
