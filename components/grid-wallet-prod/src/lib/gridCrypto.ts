'use client';

/**
 * Browser wrapper over the exact primitives scripts/embedded-wallet-sign.js
 * uses in Node. Runs in the client bundle (Turnkey libs are isomorphic).
 * Private keys are generated and kept here; they never reach the server.
 */

import { p256 } from '@noble/curves/nist.js';
import { bytesToHex as nobleBytesToHex, hexToBytes as nobleHexToBytes } from '@noble/hashes/utils.js';
import { base64urlnopad } from '@scure/base';
import { hpkeEncrypt, formatHpkeBuf, decryptCredentialBundle } from '@turnkey/crypto';
import { ApiKeyStamper } from '@turnkey/api-key-stamper';

export function bytesToHex(b: Uint8Array): string {
  return nobleBytesToHex(b);
}
export function hexToBytes(hex: string): Uint8Array {
  return nobleHexToBytes(hex);
}
export function base64urlToBytes(s: string): Uint8Array {
  // Accept padded or unpadded base64url (WebAuthn ids are unpadded).
  return base64urlnopad.decode(s.replace(/=+$/, ''));
}
export function bytesToBase64url(b: Uint8Array): string {
  return base64urlnopad.encode(b);
}

/** Ephemeral P-256 TEK. pubHex = uncompressed SEC1 (04||X||Y), privHex = d. */
export function genTek(): { privHex: string; pubHex: string } {
  const priv = p256.utils.randomSecretKey();
  return {
    privHex: bytesToHex(priv),
    pubHex: bytesToHex(p256.getPublicKey(priv, false)), // 04 + 64 bytes
  };
}

/** Compressed SEC1 public key hex — the form the Grid wallet signature expects. */
export function compressedPubHex(privHex: string): string {
  return bytesToHex(p256.getPublicKey(hexToBytes(privHex), true));
}

/**
 * HPKE-encrypt {otp_code, public_key} against the target key inside
 * otpEncryptionTargetBundle. Returns the encryptedOtpBundle JSON string.
 * (Mirrors scripts encrypt-otp exactly.)
 */
export function encryptOtpBundle(
  otpEncryptionTargetBundle: string,
  tekPubHex: string,
  otpCode: string,
): string {
  const clean = otpEncryptionTargetBundle.trim().replace(/^'/, '').replace(/'$/, '');
  const { data } = JSON.parse(clean) as { data: string };
  const dataJson = new TextDecoder().decode(hexToBytes(data));
  const { targetPublic } = JSON.parse(dataJson) as { targetPublic: string };

  const plainText = JSON.stringify({ otp_code: otpCode, public_key: tekPubHex });
  const plainTextBuf = new TextEncoder().encode(plainText);
  const targetKeyBuf = hexToBytes(targetPublic);

  const encryptedBuf = hpkeEncrypt({ plainTextBuf, targetKeyBuf });
  // formatHpkeBuf already returns JSON.stringify({ encappedPublic, ciphertext })
  // (confirmed by reading @turnkey/crypto's crypto.js) — this IS the
  // encryptedOtpBundle string value per the OpenAPI schema's example
  // ('{"encappedPublic":"...","ciphertext":"..."}'). Wrapping it in another
  // JSON.stringify (as scripts/embedded-wallet-sign.js's CLI does, purely to
  // print a shell-splice-safe literal) would double-encode it here, where the
  // caller assigns this directly into a request body object it JSON.stringifies
  // once itself.
  return formatHpkeBuf(encryptedBuf);
}

/** HPKE-open the session signing key (PASSKEY/OAUTH). Returns session priv hex. */
export async function decryptSessionKey(
  encryptedSessionSigningKey: string,
  clientPrivHex: string,
): Promise<string> {
  return await decryptCredentialBundle(encryptedSessionSigningKey, clientPrivHex);
}

/** Build the Grid-Wallet-Signature stamp over `payload` (byte-for-byte). */
export async function stamp(sessionPrivHex: string, payload: string): Promise<string> {
  const stamper = new ApiKeyStamper({
    apiPublicKey: compressedPubHex(sessionPrivHex),
    apiPrivateKey: sessionPrivHex,
  });
  const { stampHeaderValue } = await stamper.stamp(payload);
  return stampHeaderValue;
}

/** Test/inspection helper: parse a stampHeaderValue into its JSON object. */
export function parseStamp(stampHeaderValue: string): {
  publicKey: string;
  scheme: string;
  signature: string;
} {
  return JSON.parse(new TextDecoder().decode(base64urlToBytes(stampHeaderValue)));
}

/**
 * Test helper: verify a stamp's ECDSA signature over `payload`.
 * @noble/curves v2's `verify(signature, message, publicKey, opts)` accepts the
 * raw DER-encoded signature bytes directly (format: 'der') and hashes
 * `message` internally with the curve's bound hash (sha256 for p256) when
 * `prehash` is true (the default) — so no manual sha256/Signature.fromDER
 * step is needed here, unlike the v1 API scripts/embedded-wallet-sign.js
 * was written against.
 * `lowS: false` because Node's `crypto.sign()` (used by both the script's
 * `stamp` command and ApiKeyStamper's node runtime) does not canonicalize
 * signatures to low-S; @noble/curves v2 defaults `lowS: true` and would
 * reject ~50% of otherwise-valid signatures.
 */
export function verifyStamp(stampHeaderValue: string, payload: string): boolean {
  const { publicKey, signature } = parseStamp(stampHeaderValue);
  const sigBytes = hexToBytes(signature);
  const message = new TextEncoder().encode(payload);
  return p256.verify(sigBytes, message, hexToBytes(publicKey), { format: 'der', lowS: false });
}
