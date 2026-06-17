'use client';

/**
 * Real, client-only auth ceremonies — purely for the demo's feel. These do NOT
 * call Grid; the API panel shows the representative calls separately. Passkey
 * uses a real WebAuthn prompt (Touch ID / Face ID); Google and Apple use their
 * real hosted popups. The results aren't persisted — only the device gesture
 * matters here.
 */

/** Checked-in public web client — local sign-in works without an env file. */
export const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '602725491872-0fqcjutt1skianiisgs0lsb62af2mero.apps.googleusercontent.com';

export const APPLE_CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || 'com.lightspark';

/** Apple requires a registered HTTPS return URL — local HTTPS dev (dev:apple)
 *  can use its own origin; plain localhost falls back to the deployed app. */
export function appleRedirectUri(): string {
  if (process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI) return process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI;
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return `${window.location.origin}/`;
  }
  return 'https://grid-wallet-demo.vercel.app/';
}

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

/** Warm both provider scripts so a CTA tap can open its popup synchronously
 *  (popup blockers only allow windows opened inside the user gesture). */
export function preloadOauthPopups(): void {
  loadGis().catch(() => {});
  loadAppleAuth().catch(() => {});
}

function toArrayBuffer(u: Uint8Array): ArrayBuffer {
  const ab = new ArrayBuffer(u.byteLength);
  new Uint8Array(ab).set(u);
  return ab;
}

function randomHex(bytes: number): string {
  const r = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(r, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** A random nonce for OAuth popups (not verified — providers just need one set). */
export async function oauthNonce(): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(randomHex(16)));
  return Array.from(new Uint8Array(d), (b) => b.toString(16).padStart(2, '0')).join('');
}

/* ── Custom-button popups (the Airbnb model) ──────────────────────────────────
   Our own CTAs open the REAL provider popups directly — no provider-drawn
   widgets, no busy state. Every failure mode (popup closed, GIS error
   callback, script load failure) rejects with 'cancelled' so callers fall
   back to the idle auth screen with no error UI; the underlying reason goes
   to console.warn for debugging. One popup at a time — a tap while one is
   open rejects immediately (no second window). */

/** Test seam: the verify harness can't drive real provider popups, so it may
 *  install a stub that resolves/rejects in place of the popup ceremony. */
type OauthPopupStub = (provider: 'google' | 'apple') => Promise<string>;

let popupInFlight = false;
const cancelled = () => new Error('cancelled');

function takePopupSlot(): boolean {
  if (popupInFlight) return false;
  popupInFlight = true;
  return true;
}

/**
 * Google sign-in from OUR button: GIS's OAuth2 token client (allowed from
 * custom buttons, unlike the ID-token flow which requires the Google-drawn
 * widget). Same client ID / authorized origins as the GIS button. If the
 * token client ever rejects the origin in practice, the fallback is the
 * transparent-GIS-button-overlay pattern over our CTA.
 */
export function googleTokenPopup(): Promise<string> {
  const stub = (window as any).__oauthPopupStub as OauthPopupStub | undefined;
  if (stub) return stub('google');
  if (!takePopupSlot()) return Promise.reject(cancelled());
  return new Promise<string>((resolve, reject) => {
    const fail = (why: unknown) => {
      popupInFlight = false;
      console.warn('[grid-demo] Google popup did not complete:', why);
      reject(cancelled());
    };
    const fire = () => {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        callback: (resp: { access_token?: string; error?: string }) => {
          if (resp?.access_token) {
            popupInFlight = false;
            resolve(resp.access_token);
          } else {
            fail(resp?.error ?? 'no access token');
          }
        },
        // Fires for popup_closed / popup_failed_to_open.
        error_callback: (err: { type?: string }) => fail(err?.type ?? err),
      });
      client.requestAccessToken();
    };
    // Synchronous when GIS is preloaded (preloadOauthPopups) — the popup
    // opens inside the tap gesture. The load path is a best-effort fallback.
    if ((window as any).google?.accounts?.oauth2) fire();
    else loadGis().then(fire, fail);
  });
}

/** Apple sign-in from OUR button: Sign in with Apple JS, popup mode. */
export function applePopup(): Promise<string> {
  const stub = (window as any).__oauthPopupStub as OauthPopupStub | undefined;
  if (stub) return stub('apple');
  if (!takePopupSlot()) return Promise.reject(cancelled());
  return new Promise<string>((resolve, reject) => {
    const fail = (why: unknown) => {
      popupInFlight = false;
      console.warn('[grid-demo] Apple popup did not complete:', why);
      reject(cancelled());
    };
    const fire = () => {
      const AppleID = (window as any).AppleID;
      // Sync nonce (no digest) — everything before signIn() must stay inside
      // the tap gesture or the popup gets blocked.
      const nonce = randomHex(32);
      try {
        AppleID.auth.init({
          clientId: APPLE_CLIENT_ID,
          scope: 'name email',
          redirectURI: appleRedirectUri(),
          state: `grid-demo-${nonce.slice(0, 16)}`,
          nonce,
          usePopup: true,
        });
      } catch (e) {
        fail(e);
        return;
      }
      AppleID.auth.signIn().then(
        (response: { authorization?: { id_token?: string } }) => {
          const idToken = response?.authorization?.id_token;
          if (idToken) {
            popupInFlight = false;
            resolve(idToken);
          } else {
            fail('no identity token');
          }
        },
        // Apple rejects with { error: 'popup_closed_by_user' } on cancel.
        (err: { error?: string }) => fail(err?.error ?? err),
      );
    };
    if ((window as any).AppleID?.auth) fire();
    else loadAppleAuth().then(fire, fail);
  });
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
      user: { id: toArrayBuffer(userId), name: 'demo@lightspark.com', displayName: 'Pat Teehantri' },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 }, // ES256
        { type: 'public-key', alg: -257 }, // RS256
      ],
      authenticatorSelection: { residentKey: 'preferred', userVerification: 'required' },
      timeout: 60000,
    },
  });
}
