import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { p256 } from '@noble/curves/nist.js';
import { generateP256KeyPair, hpkeDecrypt } from '@turnkey/crypto';
import {
  genTek, compressedPubHex, stamp, parseStamp, verifyStamp,
  encryptOtpBundle, bytesToHex, hexToBytes, base64urlToBytes, bytesToBase64url,
} from './gridCrypto';

// Fixed key so the browser module and the node script sign the SAME payload.
const PRIV = 'a3f1c2d4e5b6978012345678909876543210fedcba0011223344556677889900';
const PAYLOAD = '{"type":"ACTIVITY_TYPE_SIGN_TRANSACTION_V2","timestampMs":"1770408000000"}';
const SCRIPT = path.resolve(__dirname, '../../../../scripts/embedded-wallet-sign.js');

describe('gridCrypto TEK + encoding', () => {
  it('genTek yields uncompressed pub (04 + 128 hex) and 64-hex priv', () => {
    const { privHex, pubHex } = genTek();
    expect(privHex).toMatch(/^[0-9a-f]{64}$/);
    expect(pubHex).toMatch(/^04[0-9a-f]{128}$/);
  });
  it('compressedPubHex yields compressed SEC1 (02/03 + 64 hex)', () => {
    expect(compressedPubHex(PRIV)).toMatch(/^0[23][0-9a-f]{64}$/);
  });
  it('base64url round-trips', () => {
    const b = new Uint8Array([1, 2, 3, 250, 251, 252]);
    expect(Array.from(base64urlToBytes(bytesToBase64url(b)))).toEqual(Array.from(b));
  });
});

describe('stamp cross-check (browser module vs scripts helper)', () => {
  it('browser stamp is structurally valid and verifies', async () => {
    const s = await stamp(PRIV, PAYLOAD);
    const parsed = parseStamp(s);
    expect(parsed.scheme).toBe('SIGNATURE_SCHEME_TK_API_P256');
    expect(parsed.publicKey).toMatch(/^0[23][0-9a-f]{64}$/);
    expect(parsed.signature).toMatch(/^[0-9a-f]+$/);
    expect(verifyStamp(s, PAYLOAD)).toBe(true);
  });

  it('scripts helper stamp has identical structure and verifies against the same payload', () => {
    // Requires: cd ../../scripts && npm install (deps confirmed present 2026-07-22).
    const out = execFileSync('node', [SCRIPT, 'stamp', PRIV, PAYLOAD], {
      encoding: 'utf8',
    }).trim();
    const parsed = parseStamp(out);
    expect(parsed.scheme).toBe('SIGNATURE_SCHEME_TK_API_P256');
    expect(parsed.publicKey).toBe(compressedPubHex(PRIV)); // same key -> same pub
    // ECDSA is randomized, so signatures differ byte-wise; assert it verifies.
    expect(verifyStamp(out, PAYLOAD)).toBe(true);
  });
});

describe('encryptOtpBundle (HPKE round-trip + single-encoding)', () => {
  it('produces a single-encoded {encappedPublic,ciphertext} envelope that HPKE-decrypts to the exact otp_code/public_key pair', () => {
    // Throwaway "target" keypair standing in for the server-held key behind
    // otpEncryptionTargetBundle. @turnkey/crypto's own generateP256KeyPair
    // gives us privateKey + publicKeyUncompressed hex directly, so we can
    // build a synthetic bundle without needing a real Grid API call.
    const target = generateP256KeyPair();

    // Shape mirrors what encryptOtpBundle parses: { data: hex(JSON({targetPublic})) }
    const innerJson = JSON.stringify({ targetPublic: target.publicKeyUncompressed });
    const dataHex = bytesToHex(new TextEncoder().encode(innerJson));
    const otpEncryptionTargetBundle = JSON.stringify({ data: dataHex });

    const tekPubHex = genTek().pubHex;
    const otpCode = '000000';

    const result = encryptOtpBundle(otpEncryptionTargetBundle, tekPubHex, otpCode);

    // Single-encoding: the returned value IS the raw {encappedPublic,ciphertext}
    // JSON text (per EmailOtpCredentialVerifyRequestFields.encryptedOtpBundle's
    // example in the OpenAPI spec), not a re-quoted/escaped JSON string.
    // A double-encoded value would start with `"{\"` (a JSON string literal
    // wrapping the object), not `{"`.
    expect(result.startsWith('{"')).toBe(true);
    const envelope = JSON.parse(result);
    expect(typeof envelope.encappedPublic).toBe('string');
    expect(typeof envelope.ciphertext).toBe('string');

    // Round-trip: HPKE-decrypt with the throwaway target's private key and
    // confirm the recovered plaintext is exactly {otp_code, public_key}.
    const decrypted = hpkeDecrypt({
      ciphertextBuf: hexToBytes(envelope.ciphertext),
      encappedKeyBuf: hexToBytes(envelope.encappedPublic),
      receiverPriv: target.privateKey,
    });
    const plaintext = JSON.parse(new TextDecoder().decode(decrypted));
    expect(plaintext).toEqual({ otp_code: otpCode, public_key: tekPubHex });
  });
});
