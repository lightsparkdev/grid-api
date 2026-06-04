'use client';

/**
 * Real, client-only auth ceremonies — purely for the demo's feel. These do NOT
 * call Grid; the API panel shows the representative calls separately. Passkey
 * uses a real WebAuthn prompt (Touch ID / Face ID); Google and Apple use their
 * real hosted popups. The results aren't persisted — only the device gesture
 * matters here.
 */

let gisPromise: Promise<void> | null = null;
export function loadGis(): Promise<void> {
  if (gisPromise) return gisPromise;
  gisPromise = new Promise((resolve, reject) => {
    if ((window as any).google?.accounts?.id) return resolve();
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Google Identity Services.'));
    document.head.appendChild(s);
  });
  return gisPromise;
}

let applePromise: Promise<void> | null = null;
export function loadAppleAuth(): Promise<void> {
  if (applePromise) return applePromise;
  applePromise = new Promise((resolve, reject) => {
    if ((window as any).AppleID?.auth) return resolve();
    const s = document.createElement('script');
    s.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Sign in with Apple JS.'));
    document.head.appendChild(s);
  });
  return applePromise;
}

function toArrayBuffer(u: Uint8Array): ArrayBuffer {
  const ab = new ArrayBuffer(u.byteLength);
  new Uint8Array(ab).set(u);
  return ab;
}

/** A random nonce for OAuth popups (not verified — providers just need one set). */
export async function oauthNonce(): Promise<string> {
  const r = crypto.getRandomValues(new Uint8Array(16));
  const hex = Array.from(r, (b) => b.toString(16).padStart(2, '0')).join('');
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(hex));
  return Array.from(new Uint8Array(d), (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Real WebAuthn prompt (Touch ID / Face ID) so passkey sign-in feels genuine.
 * The created credential isn't kept — it's purely the device gesture.
 */
export async function passkeyCeremony(): Promise<void> {
  if (!('credentials' in navigator) || !window.PublicKeyCredential) {
    throw new Error('This browser does not support passkeys (WebAuthn).');
  }
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userId = crypto.getRandomValues(new Uint8Array(16));
  await navigator.credentials.create({
    publicKey: {
      challenge: toArrayBuffer(challenge),
      rp: { id: location.hostname, name: 'Aurora' },
      user: { id: toArrayBuffer(userId), name: 'ava@aurora.app', displayName: 'Ava Martinez' },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 }, // ES256
        { type: 'public-key', alg: -257 }, // RS256
      ],
      authenticatorSelection: { residentKey: 'preferred', userVerification: 'required' },
      timeout: 60000,
    },
  });
}
