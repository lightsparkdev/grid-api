import { describe, it, expect } from 'vitest';
import { createSign, generateKeyPairSync, type KeyObject } from 'node:crypto';
import { verifyGridSignature, parseSignatureHeader } from './gridWebhook';

function sign(body: string, key: KeyObject): string {
  const s = createSign('SHA256');
  s.update(body, 'utf8');
  s.end();
  return s.sign(key).toString('base64'); // DER, matching SHA256withECDSA
}

describe('verifyGridSignature', () => {
  const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const pem = publicKey.export({ type: 'spki', format: 'pem' }).toString();
  const body = JSON.stringify({ id: 'Webhook:1', type: 'INCOMING_PAYMENT.COMPLETED', data: { amount: 1 } });

  // THE shape Grid actually sends (docs.lightspark.com/api-reference/webhooks):
  // short field names, and a STRING version. Getting this wrong 401s every real
  // delivery while a self-signed test using the wrong shape still passes.
  it('accepts Grid’s {"v","s"} header', () => {
    const h = JSON.stringify({ v: '1', s: sign(body, privateKey) });
    expect(verifyGridSignature(body, h, pem)).toBe(true);
  });

  // The docs' Python example treats the header as the base64 signature itself.
  it('accepts a bare base64 header', () => {
    expect(verifyGridSignature(body, sign(body, privateKey), pem)).toBe(true);
  });

  it('still accepts a {version, signature} header', () => {
    const h = JSON.stringify({ version: 1, signature: sign(body, privateKey) });
    expect(verifyGridSignature(body, h, pem)).toBe(true);
  });

  it('rejects a tampered body', () => {
    const h = JSON.stringify({ v: '1', s: sign(body, privateKey) });
    expect(verifyGridSignature(body + ' ', h, pem)).toBe(false);
  });

  it('rejects a corrupted signature', () => {
    const buf = Buffer.from(sign(body, privateKey), 'base64');
    buf[10] ^= 0xff;
    const h = JSON.stringify({ v: '1', s: buf.toString('base64') });
    expect(verifyGridSignature(body, h, pem)).toBe(false);
  });

  it('rejects a wrong signer', () => {
    const other = generateKeyPairSync('ec', { namedCurve: 'P-256' }).privateKey;
    const h = JSON.stringify({ v: '1', s: sign(body, other) });
    expect(verifyGridSignature(body, h, pem)).toBe(false);
  });

  it('rejects an unsupported signature version', () => {
    const h = JSON.stringify({ v: '2', s: sign(body, privateKey) });
    expect(verifyGridSignature(body, h, pem)).toBe(false);
  });

  it('rejects junk without throwing', () => {
    expect(verifyGridSignature(body, 'not-a-signature', pem)).toBe(false);
    expect(verifyGridSignature(body, '', pem)).toBe(false);
    expect(verifyGridSignature(body, JSON.stringify({ v: '1' }), pem)).toBe(false);
  });

  describe('parseSignatureHeader', () => {
    it('reads both JSON field namings', () => {
      expect(parseSignatureHeader('{"v":"1","s":"AAA"}')).toEqual({ version: '1', signature: 'AAA' });
      expect(parseSignatureHeader('{"version":1,"signature":"AAA"}')).toEqual({
        version: '1',
        signature: 'AAA',
      });
    });
    it('treats a non-JSON header as the signature itself', () => {
      expect(parseSignatureHeader('AAA')).toEqual({ version: null, signature: 'AAA' });
    });
    it('returns null when there is no signature to read', () => {
      expect(parseSignatureHeader('')).toBeNull();
      expect(parseSignatureHeader('{"v":"1"}')).toBeNull();
    });
  });
});
