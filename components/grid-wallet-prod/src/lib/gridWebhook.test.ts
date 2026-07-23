import { describe, it, expect } from 'vitest';
import { createSign, generateKeyPairSync, type KeyObject } from 'node:crypto';
import { verifyGridSignature, parseSignatureHeader } from './gridWebhook';

function header(body: string, key: KeyObject, version = 1): string {
  const sign = createSign('SHA256');
  sign.update(body, 'utf8');
  sign.end();
  const signature = sign.sign(key).toString('base64'); // DER, matching SHA256withECDSA
  return JSON.stringify({ version, signature });
}

describe('verifyGridSignature', () => {
  const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const pem = publicKey.export({ type: 'spki', format: 'pem' }).toString();
  const body = JSON.stringify({ id: 'Webhook:1', type: 'INCOMING_PAYMENT.COMPLETED', data: { amount: 1 } });

  it('accepts a valid version-1 signature over the raw body', () => {
    expect(verifyGridSignature(body, header(body, privateKey), pem)).toBe(true);
  });
  it('rejects a tampered body', () => {
    expect(verifyGridSignature(body + ' ', header(body, privateKey), pem)).toBe(false);
  });
  it('rejects a corrupted signature', () => {
    const parsed = parseSignatureHeader(header(body, privateKey))!;
    const buf = Buffer.from(parsed.signature, 'base64');
    buf[10] ^= 0xff;
    const bad = JSON.stringify({ version: 1, signature: buf.toString('base64') });
    expect(verifyGridSignature(body, bad, pem)).toBe(false);
  });
  it('rejects a wrong signer', () => {
    const other = generateKeyPairSync('ec', { namedCurve: 'P-256' }).privateKey;
    expect(verifyGridSignature(body, header(body, other), pem)).toBe(false);
  });
  it('rejects an unsupported signature version', () => {
    expect(verifyGridSignature(body, header(body, privateKey, 2), pem)).toBe(false);
  });
  it('parseSignatureHeader returns null for junk', () => {
    expect(parseSignatureHeader('not json')).toBeNull();
    expect(parseSignatureHeader('{"version":1}')).toBeNull();
  });
});
