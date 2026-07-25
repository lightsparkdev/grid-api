import { createVerify } from 'node:crypto';

export interface GridSignatureHeader {
  /** Present as a string in Grid's own format ("1"); absent for a bare header. */
  version: string | null;
  signature: string; // base64 DER-encoded ECDSA
}

/**
 * `X-Grid-Signature` comes in two shapes, both documented at
 * docs.lightspark.com/api-reference/webhooks:
 *
 *   {"v": "1", "s": "<base64>"}   ← what Grid sends
 *   <base64>                      ← bare, per the Python example
 *
 * `v` is a STRING, and the fields are `v`/`s` — not `version`/`signature`. An
 * earlier version of this parser required the long names and a numeric version,
 * which rejected every real delivery before verification ran (401 on all of
 * them). `{version, signature}` is still accepted so nothing that already
 * signs that way breaks.
 */
export function parseSignatureHeader(headerValue: string): GridSignatureHeader | null {
  const raw = headerValue.trim();
  if (!raw) return null;
  try {
    const h = JSON.parse(raw) as Record<string, unknown>;
    const signature = typeof h.s === 'string' ? h.s : typeof h.signature === 'string' ? h.signature : null;
    if (!signature) return null;
    const v = h.v ?? h.version;
    return { version: v === undefined || v === null ? null : String(v), signature };
  } catch {
    // Not JSON — the header is the base64 signature itself.
    return { version: null, signature: raw };
  }
}

/** Only v1 signatures are understood; an unlabelled header is treated as v1. */
function versionSupported(version: string | null): boolean {
  return version === null || version === '1';
}

/**
 * Verify a Grid webhook signature: SHA256withECDSA over the RAW body, base64
 * DER signature, P-256 X.509 (SPKI) PEM public key.
 */
export function verifyGridSignature(
  rawBody: string,
  signatureHeader: string,
  publicKeyPem: string,
): boolean {
  const parsed = parseSignatureHeader(signatureHeader);
  if (!parsed || !versionSupported(parsed.version) || !publicKeyPem) return false;
  try {
    const verify = createVerify('SHA256');
    verify.update(rawBody, 'utf8');
    verify.end();
    return verify.verify(publicKeyPem, Buffer.from(parsed.signature, 'base64')); // DER by default
  } catch {
    return false;
  }
}
