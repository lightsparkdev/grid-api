import { createVerify } from 'node:crypto';

export interface GridSignatureHeader {
  version: number;
  signature: string; // base64 DER-encoded ECDSA
}

/** X-Grid-Signature is a JSON object {version, signature}. */
export function parseSignatureHeader(headerValue: string): GridSignatureHeader | null {
  try {
    const h = JSON.parse(headerValue) as Partial<GridSignatureHeader>;
    if (typeof h?.signature === 'string' && typeof h?.version === 'number') {
      return { version: h.version, signature: h.signature };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Verify a Grid webhook signature. SHA256withECDSA over the RAW body,
 * base64 DER signature, P-256 X.509 (SPKI) PEM public key. Version must be 1.
 */
export function verifyGridSignature(
  rawBody: string,
  signatureHeader: string,
  publicKeyPem: string,
): boolean {
  const parsed = parseSignatureHeader(signatureHeader);
  if (!parsed || parsed.version !== 1 || !publicKeyPem) return false;
  try {
    const verify = createVerify('SHA256');
    verify.update(rawBody, 'utf8');
    verify.end();
    return verify.verify(publicKeyPem, Buffer.from(parsed.signature, 'base64')); // DER by default
  } catch {
    return false;
  }
}
