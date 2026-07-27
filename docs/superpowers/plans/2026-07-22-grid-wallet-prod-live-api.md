# Grid Wallet Prod — Live Grid API (Phase 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `components/grid-wallet-prod` drive **real** Grid API calls against the **public sandbox** for milestones M1 (proxy + browser crypto + auth flows + live reads + sandbox funding + webhook receiver) and M2 (outbound money: external accounts + quote → stamp → execute → poll-to-`COMPLETED`). Every wallet action issues a real request through a Next.js proxy and the API panel renders the request/response that actually went over the wire. Cards (M3) stay scripted and are out of scope.

**Architecture:** Browser React talks only to same-origin `/api/grid/*` route handlers. The proxy injects HTTP Basic auth (server-only secrets), substitutes the `{customerId}` placeholder, forwards to `GRID_API_BASE_URL` (the public sandbox), and returns a `{request, response}` envelope (auth redacted) so the panel logs truth. All key material (TEK / session signing key) is generated and held in the browser and never sent to the server — matching Grid's "session key never leaves the client" rule. A browser crypto module (`src/lib/gridCrypto.ts`) reuses the exact `@turnkey/crypto` + `@turnkey/api-key-stamper` + `@noble/*` calls that `scripts/embedded-wallet-sign.js` uses in Node. A client session manager (`src/lib/gridSession.ts`) runs the EMAIL_OTP and PASSKEY ceremonies and holds the session key in module scope. A server webhook receiver (`src/app/api/webhooks/route.ts`) verifies Grid event signatures against `GRID_WEBHOOK_PUBKEY` and buffers events for the client to poll.

**Tech Stack:** Next.js 14 (App Router, route handlers), React 18, TypeScript 5.9, `@turnkey/crypto`, `@turnkey/api-key-stamper`, `@noble/curves`, `@noble/hashes`, `@scure/base`, Node `crypto` (webhook verify). Tests: Vitest (added by this plan; the app currently has no test runner).

**Gate / dependency order:** As of 2026-07-22 the sandbox platform provisions only platform-custody accounts (`INTERNAL_FIAT`/`INTERNAL_CRYPTO`) — no `EMBEDDED_WALLET`, no auth credentials (the user is enabling Global Accounts in the platform config). **Task 0 is a hard gate:** it re-probes and, if the embedded wallet still isn't provisioned, the implementer reports **BLOCKED** and stops. Tasks 5–9 (session, sign-in, reads, add money, outbound) depend on Task 0 producing a customer with an `EMBEDDED_WALLET` + `EMAIL_OTP` credential. Tasks 1–4 (deps/units, crypto, proxy, webhooks) are pure infrastructure and proceed regardless of the gate.

## Global Constraints

- Work **ONLY** in `components/grid-wallet-prod`. Never touch `components/grid-wallet-demo`. Never commit `.env` — `.env.local` is git-ignored and already populated with **public-sandbox** values: `GRID_CLIENT_ID`, `GRID_CLIENT_SECRET` (sandbox keys), `GRID_API_BASE_URL=https://api.lightspark.com/grid/2025-10-13`, `GRID_WEBHOOK_PUBKEY` (P-256 PEM), `GRID_CUSTOMER_ID` (currently `Customer:019f8c91-0da8-938e-0000-0c413a275fce` — a pre-enablement customer with **no** embedded wallet; Task 0 replaces it). The only `.env.local` value this plan writes is `GRID_CUSTOMER_ID` (Task 0).
- Dev server runs on **port 4001** (`npm run dev`). Node **20 or 22** (`nvm use 22`).
- **Graphite commits.** First task: `gt create -m "..."` (new stacked branch). Every later task: `git add <specific files> && gt modify --commit -m "..."`. **Never** `git commit`, **never** `git add -A`, **never** `gt submit`.
- Commit messages end with a trailing line: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`
- Secrets never appear in client code or logs. Server-only env vars have **no** `NEXT_PUBLIC_` prefix (`GRID_CLIENT_ID`, `GRID_CLIENT_SECRET`, `GRID_API_BASE_URL`, `GRID_CUSTOMER_ID` are all server-only — the browser reaches them only through the proxy).
- Session/TEK **private** keys never leave the browser. The proxy must never receive, log, or return them.
- `npx tsc --noEmit` has **5 known pre-existing errors** — the bar is **no NEW errors** (compare counts before/after).
- `npm run build` must pass at the end of **every** task.

---

## Task 0 — Platform gate + demo customer (HARD GATE)

**Files**
- Modify: `components/grid-wallet-prod/.env.local` (only `GRID_CUSTOMER_ID`; never committed)

**Interfaces**
- Produces: a `GRID_CUSTOMER_ID` in `.env.local` for a customer that has an `EMBEDDED_WALLET` internal account **and** an auto-created `EMAIL_OTP` credential — the precondition for Tasks 5–9. If that cannot be achieved, the outcome is a **BLOCKED** report.
- Consumes: nothing (curl only; no app code).

**Grounding:** `GET /customers/internal-accounts` filter `type=EMBEDDED_WALLET` (openapi/paths/customers/customers_internal_accounts.yaml, `InternalAccountType` enum). `POST /customers` requires `customerType`, `externalId`, `email`, and — **on this platform** — `fullName` (NOT `firstName`/`lastName`; empirically verified 2026-07-22) (openapi/paths/customers/customers.yaml). `GET /auth/credentials?accountId=` lists the auto-created `EMAIL_OTP` credential (openapi/paths/auth/auth_credentials.yaml). Magic OTP `000000` is documented sandbox behavior (openapi/paths/auth/auth_credentials_{id}_verify.yaml).

**Steps**

- [ ] Load the sandbox env and probe the current customer for an embedded wallet (run from `components/grid-wallet-prod`, `set -a; source .env.local; set +a`):
  ```bash
  AUTH=$(printf '%s:%s' "$GRID_CLIENT_ID" "$GRID_CLIENT_SECRET" | base64)
  BASE="$GRID_API_BASE_URL"   # https://api.lightspark.com/grid/2025-10-13
  curl -s -H "Authorization: Basic $AUTH" \
    "$BASE/customers/internal-accounts?customerId=$GRID_CUSTOMER_ID" \
    | jq '.data[] | {id, type}'
  ```
- [ ] If the current customer has **no** `EMBEDDED_WALLET` account, create a FRESH customer (note `fullName`, not first/last):
  ```bash
  curl -s -H "Authorization: Basic $AUTH" -H "Content-Type: application/json" \
    -X POST "$BASE/customers" \
    -d '{"customerType":"INDIVIDUAL","externalId":"grid-wallet-prod-demo-2","fullName":"Pat Teehantri","email":"peng+grid-wallet-prod@lightspark.com"}' \
    | jq '{id, customerType, kycStatus}'
  ```
  Capture the returned `id` as `NEW_CUSTOMER`.
- [ ] Re-probe the new customer for an `EMBEDDED_WALLET` account and its `EMAIL_OTP` credential:
  ```bash
  WALLET=$(curl -s -H "Authorization: Basic $AUTH" \
    "$BASE/customers/internal-accounts?customerId=$NEW_CUSTOMER&type=EMBEDDED_WALLET" \
    | jq -r '.data[0].id')
  echo "wallet=$WALLET"
  curl -s -H "Authorization: Basic $AUTH" \
    "$BASE/auth/credentials?accountId=$WALLET" | jq '.data[] | {id, type}'
  ```
- [ ] **Decision:**
  - If `WALLET` is a real `InternalAccount:...` **and** the credential list contains an `EMAIL_OTP`: update `GRID_CUSTOMER_ID` in `.env.local` to `NEW_CUSTOMER` (edit the file in place; do not commit it). Record `WALLET` (the `EMBEDDED_WALLET` id) and the `EMAIL_OTP` `AuthMethod` id in the task notes — later tasks discover them at runtime via the proxy, but the curl verifications in Tasks 3/5 reference them as `$ACCT`/`$CRED`.
  - If `WALLET` is `null`/empty (or no `EMAIL_OTP` credential): **STOP and report BLOCKED** — "Global Accounts not yet enabled on the sandbox platform; embedded wallet not provisioned. Tasks 5–9 cannot proceed. Tasks 1–4 (infra) may continue." Do not fabricate a wallet.
- [ ] **Verify:** the probe prints an `EMBEDDED_WALLET` line and an `EMAIL_OTP` credential; `.env.local` `GRID_CUSTOMER_ID` points at the customer that owns them. (No build/test step — this is a data/config gate, no source changes.)
- [ ] **Commit:** none for this task (only the git-ignored `.env.local` changed). Begin the Graphite stack in Task 1.

> **If BLOCKED:** an implementer using subagent-driven-development may still land Tasks 1–4 (they don't touch the wallet), then pause Tasks 5–9 until enablement. Re-run Task 0 once the platform config is live.

---

## Task 1 — Deps, Vitest, and `gridUnits.ts` (USDB ↔ cents)

**Files**
- Modify: `components/grid-wallet-prod/package.json`
- Create: `components/grid-wallet-prod/vitest.config.ts`
- Create: `components/grid-wallet-prod/src/lib/gridUnits.ts`
- Test: `components/grid-wallet-prod/src/lib/gridUnits.test.ts`

**Interfaces**
- Produces: `amountToCents(amount: number, decimals: number): number`, `centsToAmount(cents: number, decimals: number): number`, `USDB_DECIMALS = 6`, `formatCents(cents: number): string`.
- Consumes: nothing.

**Steps**

- [ ] Add dependencies to `package.json`. In `"dependencies"` add (versions pinned to what `scripts/package.json` uses):
  ```json
  "@turnkey/api-key-stamper": "^0.6.5",
  "@turnkey/crypto": "^2.8.14",
  ```
  In `"devDependencies"` add:
  ```json
  "vitest": "^2.1.9",
  ```
  Add a test script to `"scripts"`:
  ```json
  "test": "vitest run",
  ```
- [ ] Run `nvm use 22 && npm install` in `components/grid-wallet-prod`. Confirm `node_modules/@turnkey/crypto` and `node_modules/@turnkey/api-key-stamper` now exist (they are absent today; `@noble/curves`, `@noble/hashes`, `@scure/base` are already present).
- [ ] Create `vitest.config.ts` (node environment; `@/` alias mirrors `tsconfig.json` `paths`):
  ```ts
  import { defineConfig } from 'vitest/config';
  import path from 'node:path';

  export default defineConfig({
    resolve: {
      alias: { '@': path.resolve(__dirname, 'src') },
    },
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts'],
    },
  });
  ```
- [ ] Create `src/lib/gridUnits.ts` with COMPLETE code:
  ```ts
  /**
   * Grid `CurrencyAmount.amount` is an integer in the currency's smallest unit
   * (openapi/components/schemas/common/CurrencyAmount.yaml). USDB has 6 decimals
   * (openapi .../PaymentEmbeddedWalletInfo + currencyResponse in apiCodeFormat).
   * The wallet UI models money as integer "cents" (2 decimals). This layer maps
   * between a Grid amount at any decimals and the app's cents.
   */

  export const USDB_DECIMALS = 6;

  /** Grid smallest-unit amount -> app cents (2 dp). e.g. 2_000_000 USDB micro -> 200. */
  export function amountToCents(amount: number, decimals: number): number {
    if (!Number.isFinite(amount)) return 0;
    if (decimals <= 2) return Math.round(amount * Math.pow(10, 2 - decimals));
    return Math.round(amount / Math.pow(10, decimals - 2));
  }

  /** App cents (2 dp) -> Grid smallest-unit amount at `decimals`. e.g. 200 -> 2_000_000 USDB micro. */
  export function centsToAmount(cents: number, decimals: number): number {
    if (!Number.isFinite(cents)) return 0;
    if (decimals <= 2) return Math.round(cents / Math.pow(10, 2 - decimals));
    return Math.round(cents * Math.pow(10, decimals - 2));
  }

  /** "$1,234.50" style — mirrors the app's existing fmt() in src/data/actions.ts. */
  export function formatCents(cents: number): string {
    return `$${(cents / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  ```
- [ ] Create `src/lib/gridUnits.test.ts` with real assertions:
  ```ts
  import { describe, it, expect } from 'vitest';
  import { amountToCents, centsToAmount, formatCents, USDB_DECIMALS } from './gridUnits';

  describe('gridUnits', () => {
    it('maps USDB (6dp) micro-units to cents', () => {
      expect(amountToCents(2_000_000, USDB_DECIMALS)).toBe(200); // 2 USDB -> $2.00
      expect(amountToCents(1_500_000, USDB_DECIMALS)).toBe(150);
      expect(amountToCents(0, USDB_DECIMALS)).toBe(0);
    });
    it('maps USD (2dp) amount straight through', () => {
      expect(amountToCents(20000, 2)).toBe(20000);
    });
    it('maps BTC (8dp) down to cents', () => {
      expect(amountToCents(100_000_000, 8)).toBe(100); // 1.00000000 -> "$1.00" scale
    });
    it('round-trips cents -> USDB -> cents', () => {
      for (const c of [0, 1, 200, 99, 123456]) {
        expect(amountToCents(centsToAmount(c, USDB_DECIMALS), USDB_DECIMALS)).toBe(c);
      }
    });
    it('centsToAmount produces USDB micro-units', () => {
      expect(centsToAmount(200, USDB_DECIMALS)).toBe(2_000_000);
    });
    it('formats cents', () => {
      expect(formatCents(200)).toBe('$2.00');
      expect(formatCents(123456)).toBe('$1,234.56');
    });
  });
  ```
- [ ] **Verify:** `npm test` → all `gridUnits` tests pass. `npx tsc --noEmit` → no NEW errors (still 5). `npm run build` → succeeds.
- [ ] **Commit:** `gt create -m "feat(grid-wallet-prod): add vitest + gridUnits (USDB<->cents)"` (include the trailing `Co-Authored-By` line). Stage only: `package.json`, `package-lock.json`, `vitest.config.ts`, `src/lib/gridUnits.ts`, `src/lib/gridUnits.test.ts`.

---

## Task 2 — `gridCrypto.ts` (TEK gen, HPKE, stamp) + cross-check test

**Files**
- Create: `components/grid-wallet-prod/src/lib/gridCrypto.ts`
- Test: `components/grid-wallet-prod/src/lib/gridCrypto.test.ts`

**Interfaces**
- Produces:
  - `genTek(): { privHex: string; pubHex: string }` — ephemeral P-256 TEK; `pubHex` is uncompressed SEC1 (`04`+X+Y, 130 hex).
  - `compressedPubHex(privHex: string): string` — compressed SEC1 (66 hex).
  - `encryptOtpBundle(otpEncryptionTargetBundle: string, tekPubHex: string, otpCode: string): string` — HPKE-sealed `{otp_code, public_key}`; returns the `encryptedOtpBundle` JSON string for `POST /auth/credentials/{id}/verify`.
  - `decryptSessionKey(encryptedSessionSigningKey: string, clientPrivHex: string): Promise<string>` — HPKE-opens the `AuthSession.encryptedSessionSigningKey` (PASSKEY/OAUTH); returns session priv hex.
  - `stamp(sessionPrivHex: string, payload: string): Promise<string>` — Grid wallet signature (`Grid-Wallet-Signature` header value) over `payload`.
  - `bytesToHex`, `hexToBytes`, `base64urlToBytes(s: string): Uint8Array`, `bytesToBase64url(b: Uint8Array): string`.
- Consumes: `@turnkey/crypto` (`hpkeEncrypt`, `formatHpkeBuf`, `decryptCredentialBundle`), `@turnkey/api-key-stamper` (`ApiKeyStamper`), `@noble/curves/p256`, `@noble/hashes/utils`, `@scure/base`.

**Grounding:** every call mirrors `scripts/embedded-wallet-sign.js` (`gen-keypair`, `encrypt-otp`, `decrypt-bundle`, `stamp`). Grid field/format facts: `AuthMethodResponse.otpEncryptionTargetBundle` (openapi/components/schemas/auth/AuthMethodResponse.yaml), `EmailOtpCredentialVerifyRequestFields.encryptedOtpBundle` (…/EmailOtpCredentialVerifyRequestFields.yaml), `AuthSession.encryptedSessionSigningKey` base58check (…/AuthSession.yaml), `Grid-Wallet-Signature` stamp shape (openapi/paths/auth/auth_credentials.yaml example).

**Steps**

- [ ] Create `src/lib/gridCrypto.ts` with COMPLETE code:
  ```ts
  'use client';

  /**
   * Browser wrapper over the exact primitives scripts/embedded-wallet-sign.js
   * uses in Node. Runs in the client bundle (Turnkey libs are isomorphic).
   * Private keys are generated and kept here; they never reach the server.
   */

  import { p256 } from '@noble/curves/p256';
  import { sha256 } from '@noble/hashes/sha2';
  import { bytesToHex as nobleBytesToHex, hexToBytes as nobleHexToBytes } from '@noble/hashes/utils';
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
    const priv = p256.utils.randomPrivateKey();
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
    return JSON.stringify(formatHpkeBuf(encryptedBuf));
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

  /** Test helper: verify a stamp's ECDSA signature over `payload`. */
  export function verifyStamp(stampHeaderValue: string, payload: string): boolean {
    const { publicKey, signature } = parseStamp(stampHeaderValue);
    const digest = sha256(new TextEncoder().encode(payload));
    const sig = p256.Signature.fromDER(hexToBytes(signature));
    return p256.verify(sig, digest, hexToBytes(publicKey));
  }
  ```
  > Note: `@noble/hashes` v2 exposes sha256 at `@noble/hashes/sha2`. If the import fails to resolve during build, fall back to `@noble/hashes/sha256`.
- [ ] Create `src/lib/gridCrypto.test.ts`. It (a) checks TEK/format invariants, (b) runs the required **cross-check** against the scripts helper:
  ```ts
  import { describe, it, expect } from 'vitest';
  import { execFileSync } from 'node:child_process';
  import path from 'node:path';
  import { p256 } from '@noble/curves/p256';
  import {
    genTek, compressedPubHex, stamp, parseStamp, verifyStamp,
    bytesToHex, hexToBytes, base64urlToBytes, bytesToBase64url,
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
  ```
  > `SCRIPT` path: this test file is `components/grid-wallet-prod/src/lib/gridCrypto.test.ts`; four `..` reach the repo root, then `scripts/embedded-wallet-sign.js`. Verify the resolved path exists before finalizing.
- [ ] **Verify:** `npm test` → all pass (including the two cross-check cases). `npx tsc --noEmit` → no NEW errors. `npm run build` → succeeds (confirms the Turnkey libs bundle for the browser — the spec's "confirm browser compatibility early" open item; if the client build breaks on a Turnkey import, the fallback is a WebCrypto+noble reimplementation of `encryptOtpBundle`/`decryptSessionKey`/`stamp` mirroring the script, kept behind the same exported signatures).
- [ ] **Commit:** `git add src/lib/gridCrypto.ts src/lib/gridCrypto.test.ts && gt modify --commit -m "feat(grid-wallet-prod): browser gridCrypto (TEK/HPKE/stamp) + scripts cross-check"` (+ trailing `Co-Authored-By`).

---

## Task 3 — Proxy route handler + pure allow-list/redaction helpers

**Files**
- Create: `components/grid-wallet-prod/src/app/api/grid/allowlist.ts` (pure, testable)
- Create: `components/grid-wallet-prod/src/app/api/grid/[...path]/route.ts` (Next runtime)
- Create: `components/grid-wallet-prod/src/lib/gridClient.ts` (browser fetch wrapper + shared types)
- Test: `components/grid-wallet-prod/src/app/api/grid/allowlist.test.ts`

**Interfaces**
- Produces (allowlist.ts): `isAllowed(method: string, pathname: string): boolean`, `redactHeaders(h: Record<string,string>): Record<string,string>`, `substituteCustomerId(text: string, customerId: string): string`, `GRID_ALLOWLIST: { method: string; pattern: RegExp }[]`.
- Produces (gridClient.ts): `type GridEnvelope = { request: { method: string; path: string; headers: Record<string,string>; body?: unknown }; response: { status: number; body: unknown; headers?: Record<string,string> } }`; `gridFetch(method, path, opts?): Promise<GridEnvelope>`.
- Consumes: `GRID_ALLOWLIST` etc. in route.ts; `GridEnvelope` consumed by Tasks 5–9.

**Grounding (every allow-listed endpoint cites its openapi source):**
- `GET /auth/credentials` and `POST /auth/credentials` — openapi/paths/auth/auth_credentials.yaml
- `POST /auth/credentials/{id}/challenge` — …/auth_credentials_{id}_challenge.yaml
- `POST /auth/credentials/{id}/verify` — …/auth_credentials_{id}_verify.yaml
- `GET /customers/internal-accounts` — openapi/paths/customers/customers_internal_accounts.yaml
- `GET /customers/external-accounts` and `POST /customers/external-accounts` — …/customers_external_accounts.yaml
- `GET /transactions` — openapi/paths/transactions/transactions.yaml; `GET /transactions/{id}` — …/transactions_{transactionId}.yaml
- `POST /quotes` — openapi/paths/quotes/quotes.yaml; `POST /quotes/{id}/execute` — …/quotes_{quoteId}_execute.yaml
- `POST /sandbox/internal-accounts/{id}/fund` — openapi/paths/sandbox/sandbox_internal_accounts_{accountId}_fund.yaml

**Steps**

- [ ] Create `src/app/api/grid/allowlist.ts` with COMPLETE code:
  ```ts
  /** Pure helpers for the Grid proxy — no Next runtime, unit-tested directly. */

  const ID = '[^/?]+'; // a path segment (e.g. AuthMethod:..., Quote:..., InternalAccount:...)

  export const GRID_ALLOWLIST: { method: string; pattern: RegExp }[] = [
    { method: 'GET', pattern: new RegExp('^/auth/credentials$') },
    { method: 'POST', pattern: new RegExp('^/auth/credentials$') },
    { method: 'POST', pattern: new RegExp(`^/auth/credentials/${ID}/challenge$`) },
    { method: 'POST', pattern: new RegExp(`^/auth/credentials/${ID}/verify$`) },
    { method: 'GET', pattern: new RegExp('^/customers/internal-accounts$') },
    { method: 'GET', pattern: new RegExp('^/customers/external-accounts$') },
    { method: 'POST', pattern: new RegExp('^/customers/external-accounts$') },
    { method: 'GET', pattern: new RegExp('^/transactions$') },
    { method: 'GET', pattern: new RegExp(`^/transactions/${ID}$`) },
    { method: 'POST', pattern: new RegExp('^/quotes$') },
    { method: 'POST', pattern: new RegExp(`^/quotes/${ID}/execute$`) },
    { method: 'POST', pattern: new RegExp(`^/sandbox/internal-accounts/${ID}/fund$`) },
  ];

  /** `pathname` is the Grid path WITHOUT query string (e.g. "/quotes"). */
  export function isAllowed(method: string, pathname: string): boolean {
    return GRID_ALLOWLIST.some(
      (r) => r.method === method.toUpperCase() && r.pattern.test(pathname),
    );
  }

  /** Redact the injected Basic auth so it can be echoed to the panel safely. */
  export function redactHeaders(h: Record<string, string>): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(h)) {
      out[k] = k.toLowerCase() === 'authorization' ? 'Basic ***' : v;
    }
    return out;
  }

  /** Replace every {customerId} placeholder token with the real id. */
  export function substituteCustomerId(text: string, customerId: string): string {
    return text.split('{customerId}').join(customerId);
  }
  ```
- [ ] Create `src/app/api/grid/[...path]/route.ts` with COMPLETE code:
  ```ts
  import { NextRequest, NextResponse } from 'next/server';
  import {
    isAllowed,
    redactHeaders,
    substituteCustomerId,
  } from '../allowlist';

  export const runtime = 'nodejs';
  export const dynamic = 'force-dynamic';

  const BASE = process.env.GRID_API_BASE_URL ?? 'https://api.lightspark.com/grid/2025-10-13';
  const CUSTOMER_ID = process.env.GRID_CUSTOMER_ID ?? '';

  // Client-supplied headers that must reach Grid verbatim.
  const PASS_THROUGH = ['grid-wallet-signature', 'request-id', 'idempotency-key'];
  // Grid response headers worth surfacing to the client/panel.
  const ECHO_RESPONSE = ['retry-after', 'content-type'];

  function basicAuth(): string {
    const id = process.env.GRID_CLIENT_ID ?? '';
    const secret = process.env.GRID_CLIENT_SECRET ?? '';
    return 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64');
  }

  async function handle(req: NextRequest, method: string): Promise<NextResponse> {
    const url = new URL(req.url);
    const pathname = url.pathname.replace(/^\/api\/grid/, ''); // e.g. "/quotes"
    if (!isAllowed(method, pathname)) {
      return NextResponse.json(
        {
          request: { method, path: pathname, headers: {} },
          response: { status: 403, body: { error: { code: 'PROXY_NOT_ALLOWED', message: `${method} ${pathname} is not proxied` } } },
        },
        { status: 403 },
      );
    }

    // Build target URL: substitute {customerId} in path + query.
    const query = substituteCustomerId(url.search, CUSTOMER_ID);
    const target = BASE + pathname + query;

    // Body: read raw, substitute {customerId}, forward as-is (byte stable for stamps).
    const rawBody = method === 'GET' ? undefined : await req.text();
    const body = rawBody ? substituteCustomerId(rawBody, CUSTOMER_ID) : undefined;

    const outHeaders: Record<string, string> = { Authorization: basicAuth() };
    if (body) outHeaders['Content-Type'] = 'application/json';
    for (const name of PASS_THROUGH) {
      const v = req.headers.get(name);
      if (v) outHeaders[name] = v;
    }

    let gridStatus = 502;
    let gridBody: unknown = { error: { code: 'PROXY_UPSTREAM_ERROR', message: 'No response from Grid' } };
    const echoed: Record<string, string> = {};
    try {
      const res = await fetch(target, { method, headers: outHeaders, body });
      gridStatus = res.status;
      const text = await res.text();
      try {
        gridBody = text ? JSON.parse(text) : {};
      } catch {
        gridBody = { raw: text };
      }
      for (const name of ECHO_RESPONSE) {
        const v = res.headers.get(name);
        if (v) echoed[name] = v;
      }
    } catch (e) {
      gridBody = { error: { code: 'PROXY_UPSTREAM_ERROR', message: String(e) } };
    }

    const envelope = {
      request: {
        method,
        path: pathname + query,
        headers: redactHeaders(outHeaders),
        body: body ? safeJson(body) : undefined,
      },
      response: { status: gridStatus, body: gridBody, headers: echoed },
    };
    // Mirror Grid's status as the proxy status so fetch semantics stay truthful.
    return NextResponse.json(envelope, { status: gridStatus >= 200 && gridStatus < 600 ? gridStatus : 502 });
  }

  function safeJson(s: string): unknown {
    try {
      return JSON.parse(s);
    } catch {
      return s;
    }
  }

  export async function GET(req: NextRequest) {
    return handle(req, 'GET');
  }
  export async function POST(req: NextRequest) {
    return handle(req, 'POST');
  }
  ```
- [ ] Create `src/lib/gridClient.ts` with COMPLETE code:
  ```ts
  'use client';

  export interface GridEnvelope {
    request: {
      method: string;
      path: string;
      headers: Record<string, string>;
      body?: unknown;
    };
    response: {
      status: number;
      body: unknown;
      headers?: Record<string, string>;
    };
  }

  export interface GridFetchOpts {
    body?: unknown;
    /** Extra headers forwarded verbatim (Grid-Wallet-Signature, Request-Id, Idempotency-Key). */
    headers?: Record<string, string>;
  }

  /**
   * Call the same-origin proxy. `path` is the Grid path (may contain the
   * {customerId} placeholder), e.g. "/customers/internal-accounts?customerId={customerId}".
   * Returns the {request, response} envelope; response.status mirrors Grid.
   */
  export async function gridFetch(
    method: 'GET' | 'POST',
    path: string,
    opts: GridFetchOpts = {},
  ): Promise<GridEnvelope> {
    const res = await fetch(`/api/grid${path}`, {
      method,
      headers: {
        ...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(opts.headers ?? {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
    return (await res.json()) as GridEnvelope;
  }
  ```
- [ ] Create `src/app/api/grid/allowlist.test.ts`:
  ```ts
  import { describe, it, expect } from 'vitest';
  import { isAllowed, redactHeaders, substituteCustomerId } from './allowlist';

  describe('proxy allow-list', () => {
    it('allows the M1/M2 endpoints', () => {
      expect(isAllowed('GET', '/auth/credentials')).toBe(true);
      expect(isAllowed('POST', '/auth/credentials')).toBe(true);
      expect(isAllowed('POST', '/auth/credentials/AuthMethod:abc/challenge')).toBe(true);
      expect(isAllowed('POST', '/auth/credentials/AuthMethod:abc/verify')).toBe(true);
      expect(isAllowed('GET', '/customers/internal-accounts')).toBe(true);
      expect(isAllowed('POST', '/customers/external-accounts')).toBe(true);
      expect(isAllowed('GET', '/transactions')).toBe(true);
      expect(isAllowed('GET', '/transactions/Transaction:abc')).toBe(true);
      expect(isAllowed('POST', '/quotes')).toBe(true);
      expect(isAllowed('POST', '/quotes/Quote:abc/execute')).toBe(true);
      expect(isAllowed('POST', '/sandbox/internal-accounts/InternalAccount:abc/fund')).toBe(true);
    });
    it('rejects everything else (incl. cards + wrong method)', () => {
      expect(isAllowed('POST', '/cards')).toBe(false);
      expect(isAllowed('DELETE', '/auth/credentials')).toBe(false);
      expect(isAllowed('POST', '/transactions/Transaction:abc')).toBe(false); // GET only
      expect(isAllowed('GET', '/quotes')).toBe(false); // POST only
      expect(isAllowed('POST', '/customers')).toBe(false);
    });
    it('redacts Authorization only', () => {
      const r = redactHeaders({ Authorization: 'Basic secret', 'Request-Id': 'Request:1' });
      expect(r.Authorization).toBe('Basic ***');
      expect(r['Request-Id']).toBe('Request:1');
    });
    it('substitutes every {customerId} token', () => {
      expect(substituteCustomerId('?customerId={customerId}', 'Customer:1')).toBe('?customerId=Customer:1');
      expect(substituteCustomerId('{customerId}/{customerId}', 'C')).toBe('C/C');
      expect(substituteCustomerId('nothing', 'C')).toBe('nothing');
    });
  });
  ```
- [ ] **Verify (unit):** `npm test` → allow-list tests pass.
- [ ] **Verify (live curl against the sandbox):** start dev (`npm run dev`, port 4001). Use `$ACCT` = the `EMBEDDED_WALLET` id recorded in Task 0. Then in another shell:
  ```bash
  ACCT=<EMBEDDED_WALLET id from Task 0>
  # Reads (should mirror Grid 200 with data arrays):
  curl -s 'http://localhost:4001/api/grid/customers/internal-accounts?customerId={customerId}&type=EMBEDDED_WALLET' | jq '.response.status, (.response.body.data[0].id), (.response.body.data[0].balance)'
  curl -s "http://localhost:4001/api/grid/auth/credentials?accountId=$ACCT" | jq '.response.status, (.response.body.data[].type)'
  # Disallowed path (should be 403 envelope, never forwarded):
  curl -s -o /dev/null -w '%{http_code}\n' -X POST 'http://localhost:4001/api/grid/cards'
  # Redaction: Authorization must read "Basic ***", never the real secret:
  curl -s 'http://localhost:4001/api/grid/transactions?customerId={customerId}' | jq '.request.headers.Authorization'
  ```
  Expected: internal-accounts `.response.status` = 200 and an `EMBEDDED_WALLET` account with `balance.amount`/`balance.currency.decimals`; auth/credentials lists `EMAIL_OTP`; the `/cards` call returns `403`; `Authorization` reads `"Basic ***"`.
- [ ] `npx tsc --noEmit` → no NEW errors. `npm run build` → succeeds.
- [ ] **Commit:** `git add src/app/api/grid/allowlist.ts src/app/api/grid/allowlist.test.ts 'src/app/api/grid/[...path]/route.ts' src/lib/gridClient.ts && gt modify --commit -m "feat(grid-wallet-prod): Grid proxy route + allow-list + gridFetch client"` (+ `Co-Authored-By`).

---

## Task 4 — Webhook receiver + signature verification

**Files**
- Create: `components/grid-wallet-prod/src/lib/gridWebhook.ts` (pure verify/parse)
- Create: `components/grid-wallet-prod/src/lib/webhookEvents.ts` (in-memory ring buffer)
- Create: `components/grid-wallet-prod/src/app/api/webhooks/route.ts` (POST receiver)
- Create: `components/grid-wallet-prod/src/app/api/webhooks/events/route.ts` (GET poll)
- Test: `components/grid-wallet-prod/src/lib/gridWebhook.test.ts`

**Interfaces**
- Produces (`gridWebhook.ts`): `verifyGridSignature(rawBody: string, signatureHeader: string, publicKeyPem: string): boolean`; `parseSignatureHeader(headerValue: string): { version: number; signature: string } | null`.
- Produces (`webhookEvents.ts`): `pushEvent(raw: unknown): void`, `listEvents(): WebhookEvent[]`, `clearEvents(): void`, `interface WebhookEvent { id?: string; type?: string; timestamp?: string; data?: unknown; receivedAt: number }`.
- Consumes: Node `crypto` (`createVerify`); `GRID_WEBHOOK_PUBKEY` (server env).

**Grounding (exact scheme, verified 2026-07-22):** header is **`X-Grid-Signature`**; its value is a JSON object `{ version, signature }` where `version` must equal `1` and `signature` is a **base64 DER-encoded ECDSA** signature; the algorithm is **`SHA256withECDSA`** over the **raw request body**; the public key is a P-256 X.509 (SPKI) PEM. Sources: `samples/kotlin/src/main/kotlin/com/grid/sample/routes/Webhooks.kt` (reads `X-Grid-Signature`, calls `WebhookUtils.verifyWebhookSignature(rawBody, signature)`); the SDK `com.lightspark.grid.utils.WebhookUtils` (constants disassembled: `SignatureHeader{version, signature}`, `Invalid signature version … expected: 1`, `Signature.getInstance("SHA256withECDSA")`, `X509EncodedKeySpec`, `java.util.Base64`); and `openapi/webhooks/incoming-payment.yaml` (`X-Grid-Signature`, base64 signature, SHA-256 of body). Event body shape `{ id, type, timestamp, data }` per `openapi/webhooks/*.yaml`. Node's `createVerify('SHA256').verify(pem, sig)` defaults to DER `dsaEncoding`, matching Java's `SHA256withECDSA`.

**Steps**

- [ ] Create `src/lib/gridWebhook.ts`:
  ```ts
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
  ```
- [ ] Create `src/lib/webhookEvents.ts`:
  ```ts
  export interface WebhookEvent {
    id?: string;
    type?: string;
    timestamp?: string;
    data?: unknown;
    receivedAt: number;
  }

  const RING = 50;
  let events: WebhookEvent[] = [];

  export function pushEvent(raw: unknown): void {
    const e = raw as { id?: string; type?: string; timestamp?: string; data?: unknown };
    events.push({ id: e.id, type: e.type, timestamp: e.timestamp, data: e.data, receivedAt: Date.now() });
    if (events.length > RING) events = events.slice(-RING);
  }
  export function listEvents(): WebhookEvent[] {
    return events;
  }
  export function clearEvents(): void {
    events = [];
  }
  ```
- [ ] Create `src/app/api/webhooks/route.ts`:
  ```ts
  import { NextRequest, NextResponse } from 'next/server';
  import { verifyGridSignature } from '@/lib/gridWebhook';
  import { pushEvent } from '@/lib/webhookEvents';

  export const runtime = 'nodejs';
  export const dynamic = 'force-dynamic';

  export async function POST(req: NextRequest) {
    const raw = await req.text(); // RAW body, exactly as received (used for signature)
    const sig = req.headers.get('x-grid-signature') ?? '';
    const pubkey = process.env.GRID_WEBHOOK_PUBKEY ?? '';
    if (!verifyGridSignature(raw, sig, pubkey)) {
      return NextResponse.json({ error: { code: 'INVALID_SIGNATURE' } }, { status: 401 });
    }
    try {
      pushEvent(JSON.parse(raw));
    } catch {
      // Signature already passed; a non-JSON body is unexpected but non-fatal.
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  }
  ```
- [ ] Create `src/app/api/webhooks/events/route.ts`:
  ```ts
  import { NextResponse } from 'next/server';
  import { listEvents } from '@/lib/webhookEvents';

  export const runtime = 'nodejs';
  export const dynamic = 'force-dynamic';

  export async function GET() {
    return NextResponse.json({ events: listEvents() });
  }
  ```
- [ ] Create `src/lib/gridWebhook.test.ts` (throwaway P-256 keypair — never the real pubkey):
  ```ts
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
  ```
- [ ] **Verify (unit):** `npm test` → all `gridWebhook` cases pass. **Verify (live, local):** with the dev server running, `curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:4001/api/webhooks -H 'X-Grid-Signature: {"version":1,"signature":"AA=="}' -d '{"id":"x"}'` → `401` (bad signature rejected); `curl -s http://localhost:4001/api/webhooks/events | jq '.events | length'` → `0`. (Grid cannot reach `localhost`, so real signed delivery is verified only once the app is deployed and the webhook URL registered; local flows poll `GET /transactions`.)
- [ ] `npx tsc --noEmit` → no NEW errors. `npm run build` → succeeds.
- [ ] **Commit:** `git add src/lib/gridWebhook.ts src/lib/gridWebhook.test.ts src/lib/webhookEvents.ts src/app/api/webhooks/route.ts src/app/api/webhooks/events/route.ts && gt modify --commit -m "feat(grid-wallet-prod): webhook receiver + P-256 signature verification"` (+ `Co-Authored-By`).

---

## Task 5 — `gridSession.ts` client session manager

**Files**
- Create: `components/grid-wallet-prod/src/lib/gridSession.ts`
- Test: `components/grid-wallet-prod/src/lib/gridSession.test.ts` (pure helpers only)

**Interfaces**
- Produces:
  - `type LogFn = (env: GridEnvelope) => void;`
  - `interface AuthCallbacks { promptOtp: () => Promise<string>; log: LogFn; onFaceId?: () => Promise<void>; }`
  - `interface WalletAccount { customerId: string; accountId: string; emailOtpCredentialId: string; passkeyCredentialId: string | null; balanceCents: number; }`
  - `interface Session { privHex: string; accountId: string; expiresAt: number; via: 'passkey' | 'email_otp'; }`
  - `loadWalletAccount(log: LogFn): Promise<WalletAccount>` — `GET /customers/internal-accounts?customerId={customerId}&type=EMBEDDED_WALLET` then `GET /auth/credentials?accountId=<accountId>`.
  - `signIn(cb: AuthCallbacks): Promise<Session>` — first-run vs returning detection; sets module session.
  - `ensureSession(cb: AuthCallbacks): Promise<string>` — returns a valid session priv hex, silently re-authing once (returning path) if expired.
  - `getSession(): Session | null`, `clearSession(): void`.
  - Pure helper (exported for tests): `pickCredentials(data: { id: string; type: string }[]): { emailOtpId: string | null; passkeyId: string | null }`.
- Consumes: `gridFetch`, `GridEnvelope` (Task 3); `genTek`, `compressedPubHex`, `encryptOtpBundle`, `decryptSessionKey`, `base64urlToBytes`, `bytesToBase64url` (Task 2); `amountToCents`, `USDB_DECIMALS` (Task 1).

**Grounding (flow order):** matches `mintlify/snippets/global-accounts/authentication.mdx` "Registration vs. verification" + the passkey sequence diagram, and the probed two-leg EMAIL_OTP verify. Field names from `AuthMethod.credentialId` (base64url), `PasskeyAuthChallenge.challenge` (lowercase hex, UTF-8 encode as WebAuthn challenge), `AuthCredentialChallengeRequest.clientPublicKey` (uncompressed hex 130), `PasskeyCredentialCreateRequestFields` (`type/nickname/challenge/attestation`), `PasskeyAssertion` (`credentialId/clientDataJson/authenticatorData/signature/userHandle`), `AuthSession.encryptedSessionSigningKey`.

**Steps**

- [ ] Create `src/lib/gridSession.ts` with COMPLETE code:
  ```ts
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
        allowCredentials: [{ type: 'public-key', id: base64urlToBytes(pk.credentialId) }],
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
  ```
  > Design notes for the implementer: (1) `session`/`account` are module-scope (survive component re-renders, cleared on reset). (2) The `payloadToSign` from OTP verify leg 1 is stamped **byte-for-byte** — do not re-serialize it. (3) WebKit-in-iframe cannot run `navigator.credentials.create()`; the demo runs top-level on port 4001, so real passkeys work — but keep the existing `passkeyCreateBlocked()` awareness from `src/lib/auth.ts` in mind for the embed (out of scope here). (4) `location.hostname` is the WebAuthn `rp.id` — must match between create and get.
- [ ] Create `src/lib/gridSession.test.ts` (only the pure helper — WebAuthn/`navigator` are unavailable in node, so the ceremonies are verified in-browser in later tasks):
  ```ts
  import { describe, it, expect } from 'vitest';
  import { pickCredentials } from './gridSession';

  describe('pickCredentials', () => {
    it('finds EMAIL_OTP and first PASSKEY', () => {
      const r = pickCredentials([
        { id: 'AuthMethod:1', type: 'EMAIL_OTP' },
        { id: 'AuthMethod:2', type: 'PASSKEY' },
        { id: 'AuthMethod:3', type: 'PASSKEY' },
      ]);
      expect(r.emailOtpId).toBe('AuthMethod:1');
      expect(r.passkeyId).toBe('AuthMethod:2');
    });
    it('returns nulls when absent', () => {
      const r = pickCredentials([{ id: 'AuthMethod:9', type: 'OAUTH' }]);
      expect(r.emailOtpId).toBeNull();
      expect(r.passkeyId).toBeNull();
    });
  });
  ```
- [ ] **Verify (unit):** `npm test` → `pickCredentials` tests pass.
- [ ] **Verify (scripted curl, EMAIL_OTP end-to-end against the sandbox):** with the dev server running, exercise the same call sequence the module performs, using `scripts/embedded-wallet-sign.js` for the crypto (proves the module's request shapes are correct before UI wiring). This mirrors `scripts/README.md`. Use the `EMBEDDED_WALLET` id and `EMAIL_OTP` `AuthMethod` id recorded in Task 0:
  ```bash
  ACCT=<EMBEDDED_WALLET id from Task 0>
  CRED=<EMAIL_OTP AuthMethod id from Task 0>
  # 1. challenge -> otpEncryptionTargetBundle
  BUNDLE=$(curl -s -X POST "http://localhost:4001/api/grid/auth/credentials/$CRED/challenge" -d '{}' | jq -r '.response.body.otpEncryptionTargetBundle')
  # 2. TEK + encrypt magic OTP 000000
  KP=$(node ../../scripts/embedded-wallet-sign.js gen-keypair); PUB=$(echo "$KP" | jq -r .pubHex); PRIV=$(echo "$KP" | jq -r .privHex)
  ENC=$(node ../../scripts/embedded-wallet-sign.js encrypt-otp "$BUNDLE" "$PUB" 000000)
  # 3. verify leg 1 -> payloadToSign + requestId
  L1=$(curl -s -X POST "http://localhost:4001/api/grid/auth/credentials/$CRED/verify" -d "{\"type\":\"EMAIL_OTP\",\"encryptedOtpBundle\":$ENC}")
  PAYLOAD=$(echo "$L1" | jq -r '.response.body.payloadToSign'); REQ=$(echo "$L1" | jq -r '.response.body.requestId')
  # 4. stamp + verify leg 2 -> 200 session
  SIG=$(node ../../scripts/embedded-wallet-sign.js stamp "$PRIV" "$PAYLOAD")
  curl -s -X POST "http://localhost:4001/api/grid/auth/credentials/$CRED/verify" \
    -H "Grid-Wallet-Signature: $SIG" -H "Request-Id: $REQ" \
    -d "{\"type\":\"EMAIL_OTP\",\"encryptedOtpBundle\":$ENC}" | jq '.response.status, (.response.body.id)'
  ```
  Expected: step 1 returns a bundle; step 3 `.response.body.payloadToSign` present with `.response.status` 202; step 4 prints `200` and a `Session:...` id. (This confirms the proxy + request shapes; the browser module runs the identical sequence with `gridCrypto`.)
- [ ] `npx tsc --noEmit` → no NEW errors. `npm run build` → succeeds.
- [ ] **Commit:** `git add src/lib/gridSession.ts src/lib/gridSession.test.ts && gt modify --commit -m "feat(grid-wallet-prod): client gridSession (EMAIL_OTP + passkey register/sign-in)"` (+ `Co-Authored-By`).

---

## Task 6 — Rewire `authenticate` + OTP sheet to live sessions; panel logs real traffic

**Files**
- Modify: `components/grid-wallet-prod/src/data/flow.ts` (extend `ApiCall`)
- Modify: `components/grid-wallet-prod/src/lib/apiCodeFormat.tsx` (prefer real bodies)
- Create: `components/grid-wallet-prod/src/lib/gridEntry.ts` (envelope → panel Entry)
- Modify: `components/grid-wallet-prod/src/hooks/useWalletDemoLogic.ts` (real passkey + OTP)
- Modify: `components/grid-wallet-prod/src/apps/aurora/AuthSheet.tsx` (sandbox magic OTP code)

**Interfaces**
- Produces (`ApiCall` gains): `resBody?: unknown;` and `realStatus?: number;` (optional — legacy scripted calls keep `status: string` and the stub synthesizer).
- Produces (`gridEntry.ts`): `envelopeToApiCall(env: GridEnvelope): ApiCall` — maps a real `{request, response}` to the panel's `ApiCall` shape (method, path with base stripped, headers minus auth, reqBody, `resBody`, `status: "<code> <text>"`, `realStatus`).
- Consumes: `GridEnvelope` (Task 3); `signIn`, `ensureSession`, `getSession`, `AuthCallbacks` (Task 5).

**Steps**

- [ ] In `src/data/flow.ts`, extend the `ApiCall` interface (append two optional fields; do not remove `status`):
  ```ts
  export interface ApiCall {
    method: 'GET' | 'POST';
    path: string;
    title?: string;
    headers?: Record<string, string>;
    reqBody?: Record<string, unknown>;
    status: string;
    note?: string;
    inbound?: boolean;
    /** Real Grid response body (Phase 2). When set, the panel renders THIS
     *  instead of the synthesized stub. */
    resBody?: unknown;
    /** Real HTTP status code (Phase 2), used to tint error responses. */
    realStatus?: number;
  }
  ```
- [ ] In `src/lib/apiCodeFormat.tsx`, make `formatResponseString` prefer a real body. Replace the function body:
  ```tsx
  export function formatResponseString(entry: ApiCall): string {
    if (entry.resBody !== undefined) return JSON.stringify(entry.resBody, null, 2);
    return JSON.stringify(stubResponseBody(entry), null, 2);
  }
  ```
  (Leave `stubResponseBody` intact — the seeded/historical scripted entries still use it.)
- [ ] Create `src/lib/gridEntry.ts`:
  ```ts
  import type { ApiCall } from '@/data/flow';
  import type { GridEnvelope } from './gridClient';

  const STATUS_TEXT: Record<number, string> = {
    200: 'OK', 201: 'Created', 202: 'Accepted', 400: 'Bad Request',
    401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 409: 'Conflict',
    429: 'Too Many Requests', 500: 'Internal Server Error', 502: 'Bad Gateway',
  };

  /** Map a proxy {request,response} envelope to the panel's ApiCall shape. */
  export function envelopeToApiCall(env: GridEnvelope, title?: string): ApiCall {
    const method = env.request.method === 'GET' ? 'GET' : 'POST';
    const path = env.request.path.split('?')[0]; // panel shows the clean path
    const code = env.response.status;
    // Drop the redacted Authorization; the curl formatter re-adds "Basic $GRID_KEY".
    const headers = { ...env.request.headers };
    delete headers.Authorization;
    delete (headers as Record<string, string>).authorization;
    return {
      method,
      path,
      title,
      headers: Object.keys(headers).length ? headers : undefined,
      reqBody: (env.request.body as Record<string, unknown> | undefined) ?? undefined,
      resBody: env.response.body,
      realStatus: code,
      status: `${code} ${STATUS_TEXT[code] ?? ''}`.trim(),
    };
  }
  ```
- [ ] In `src/hooks/useWalletDemoLogic.ts`, wire the real session. At the top, add imports:
  ```ts
  import { signIn as gridSignIn, ensureSession, clearSession, getAccount } from '@/lib/gridSession';
  import { envelopeToApiCall } from '@/lib/gridEntry';
  ```
- [ ] Add a logging bridge that turns each real envelope into a panel entry within a named group. Inside `useWalletDemoLogic`, near `pushCalls`, add:
  ```ts
  const logEnvelope = useCallback(
    (groupLabel: string, groupId: string) => (env: import('@/lib/gridClient').GridEnvelope) => {
      pushCalls([envelopeToApiCall(env)], groupLabel, groupId);
    },
    [pushCalls],
  );
  ```
- [ ] Replace the OTP branch and the passkey branch of `authenticate`. The OTP `promptOtp()` already returns the typed code — thread it into the live flow. Rewrite the `authenticate` callback body so that, for the passkey method (the only PROD method, `PROD_AUTH_METHODS = ['passkey']`), it calls `gridSignIn`:
  ```ts
  } else if (m === 'passkey') {
    const gid = newGroupId();
    // Real Grid sign-in: first run bootstraps via EMAIL_OTP + registers a passkey;
    // returning runs the passkey challenge/verify. Every call is logged truthfully.
    await gridSignIn({
      log: logEnvelope('Sign in', gid),
      // The aurora OTP sheet collects the code; sandbox magic code is 000000.
      promptOtp,
      // Play the iOS Face ID animation around the WebAuthn assertion.
      onFaceId: () => playFaceId(),
    });
  }
  ```
  > The first-run passkey path drives BOTH the OTP sheet (bootstrapping) and the system passkey dialog. `promptOtp()` triggers the aurora `AuthSheet` code step via `otpActive`; the WebAuthn `create()`/`get()` fire inside the tap's activation chain (keep the call awaited directly in `authenticate`, which is invoked from the tap handler through `signInWithMethod`). Add `logEnvelope`, `gridSignIn`, `promptOtp`, `playFaceId` to the `authenticate` `useCallback` deps.
- [ ] Update `returnToSignIn` and `reset` to also `clearSession()` so a fresh sign-in re-runs the ceremony. Add `clearSession();` right after each sets `session.current = {}`.
- [ ] In `src/apps/aurora/AuthSheet.tsx`, change the demo code so the notification autofill and prefilled path submit the **sandbox magic OTP** `000000` (documented in openapi/paths/auth/auth_credentials_{id}_verify.yaml; the module HPKE-encrypts whatever code arrives, and `123456` would fail against the sandbox enclave). Change `const DEMO_CODE = '123456';` to `const DEMO_CODE = '000000';` and adjust the email notification body preview accordingly (`Your one-time code is 00-0000` → keep the split logic, which now renders `000-000`). The SMS body template already interpolates `DEMO_CODE`.
  > This is a demo-affordance change, not a security one: in production the OTP sheet still accepts a manually typed emailed code; only the autofill convenience uses the sandbox magic code.
- [ ] **Verify (browser, port 4001, top-level tab — not the docs iframe):**
  1. Fresh customer state (no passkey yet): tap "Continue with passkey" → the OTP sheet appears → autofill `000000` → the system passkey dialog appears → Face ID animation → lands on the wallet. The API panel's "Sign in" group shows, in order, the REAL calls: `GET /customers/internal-accounts`, `GET /auth/credentials`, `POST /auth/credentials/{id}/challenge` (200), `POST /auth/credentials/{id}/verify` (202 then 200), `POST /auth/credentials` (202 then 201), `POST /auth/credentials/{id}/challenge` (200), `POST /auth/credentials/{id}/verify` (200 with `encryptedSessionSigningKey`). Each Response tab shows the real body.
  2. Tap "Sign in again" → returning path: only the passkey `GET /auth/credentials` + `challenge` + `verify` calls fire (no OTP sheet, no `POST /auth/credentials` create).
  3. Confirm no private key or Basic secret appears anywhere in the panel (Authorization reads `Basic $GRID_KEY` in the curl; request bodies never contain `privHex`).
- [ ] `npx tsc --noEmit` → no NEW errors. `npm run build` → succeeds.
- [ ] **Commit:** `git add src/data/flow.ts src/lib/apiCodeFormat.tsx src/lib/gridEntry.ts src/hooks/useWalletDemoLogic.ts src/apps/aurora/AuthSheet.tsx && gt modify --commit -m "feat(grid-wallet-prod): live passkey/OTP sign-in wired to panel"` (+ `Co-Authored-By`).

---

## Task 7 — Live balance + activity reads

**Files**
- Create: `components/grid-wallet-prod/src/lib/gridReads.ts`
- Test: `components/grid-wallet-prod/src/lib/gridReads.test.ts`
- Modify: `components/grid-wallet-prod/src/hooks/useWalletDemoLogic.ts`

**Interfaces**
- Produces (`gridReads.ts`):
  - `fetchBalanceCents(log: LogFn): Promise<number>` — `GET /customers/internal-accounts?customerId={customerId}&type=EMBEDDED_WALLET` → `amountToCents(balance.amount, balance.currency.decimals)`.
  - `fetchActivity(log: LogFn): Promise<Tx[]>` — `GET /transactions?customerId={customerId}&limit=20` → mapped `Tx[]`.
  - Pure: `transactionToTx(t: RawTransaction): Tx` and `type RawTransaction`.
- Consumes: `gridFetch`, `GridEnvelope`, `amountToCents`/`USDB_DECIMALS`, `Tx` (from `@/data/flow`).

**Grounding:** `GET /transactions` list + `customerId` filter (openapi/paths/transactions/transactions.yaml); `Transaction.direction` = `CREDIT|DEBIT` (…/TransactionDirection.yaml), `Transaction.type` = `INCOMING|OUTGOING` (…/TransactionType.yaml), `Transaction.status` (…/TransactionStatus.yaml), `createdAt`; amount fields live on the `TransactionOneOf` variants (`sentAmount`/`receivedAmount`, each a `CurrencyAmount` — the same fields `apiCodeFormat.tsx` and `apiCalls.ts` already reference). `Tx` shape: `{ kind, name, sub, amount, positive? }` (src/data/flow.ts).

**Steps**

- [ ] Create `src/lib/gridReads.ts`:
  ```ts
  'use client';

  import type { Tx } from '@/data/flow';
  import { gridFetch } from './gridClient';
  import type { LogFn } from './gridSession';
  import { amountToCents } from './gridUnits';
  import { formatCents } from './gridUnits';

  const CUSTOMER = '{customerId}';

  export interface RawCurrencyAmount {
    amount: number;
    currency: { code: string; decimals: number };
  }
  export interface RawTransaction {
    id: string;
    type: 'INCOMING' | 'OUTGOING';
    direction?: 'CREDIT' | 'DEBIT';
    status: string;
    createdAt?: string;
    sentAmount?: RawCurrencyAmount;
    receivedAmount?: RawCurrencyAmount;
    counterpartyInformation?: { name?: string };
  }

  export async function fetchBalanceCents(log: LogFn): Promise<number> {
    const env = await gridFetch(
      'GET',
      `/customers/internal-accounts?customerId=${CUSTOMER}&type=EMBEDDED_WALLET`,
    );
    log(env);
    if (env.response.status !== 200) return 0;
    const body = env.response.body as {
      data: { balance: { amount: number; currency: { decimals: number } } }[];
    };
    const b = body.data[0]?.balance;
    return b ? amountToCents(b.amount, b.currency.decimals) : 0;
  }

  /** Pure: one Grid transaction -> a panel Tx row. */
  export function transactionToTx(t: RawTransaction): Tx {
    const credit = t.direction ? t.direction === 'CREDIT' : t.type === 'INCOMING';
    const money = credit ? t.receivedAmount : t.sentAmount;
    const cents = money ? amountToCents(money.amount, money.currency.decimals) : 0;
    const name = t.counterpartyInformation?.name ?? (credit ? 'Received' : 'Sent');
    return {
      kind: credit ? 'bank' : 'send',
      name,
      sub: t.status === 'COMPLETED' ? 'Completed' : t.status,
      amount: `${credit ? '+' : '-'}${formatCents(cents)}`,
      positive: credit,
    };
  }

  export async function fetchActivity(log: LogFn): Promise<Tx[]> {
    const env = await gridFetch('GET', `/transactions?customerId=${CUSTOMER}&limit=20`);
    log(env);
    if (env.response.status !== 200) return [];
    const body = env.response.body as { data: RawTransaction[] };
    return (body.data ?? []).map(transactionToTx);
  }
  ```
- [ ] Create `src/lib/gridReads.test.ts`:
  ```ts
  import { describe, it, expect } from 'vitest';
  import { transactionToTx, type RawTransaction } from './gridReads';

  const usdb = (amount: number) => ({ amount, currency: { code: 'USDB', decimals: 6 } });

  describe('transactionToTx', () => {
    it('maps an incoming CREDIT to a positive row', () => {
      const t: RawTransaction = {
        id: 'Transaction:1', type: 'INCOMING', direction: 'CREDIT', status: 'COMPLETED',
        receivedAmount: usdb(2_000_000), counterpartyInformation: { name: 'Pat' },
      };
      const row = transactionToTx(t);
      expect(row.positive).toBe(true);
      expect(row.amount).toBe('+$2.00');
      expect(row.name).toBe('Pat');
      expect(row.sub).toBe('Completed');
    });
    it('maps an outgoing DEBIT to a negative row', () => {
      const t: RawTransaction = {
        id: 'Transaction:2', type: 'OUTGOING', direction: 'DEBIT', status: 'PROCESSING',
        sentAmount: usdb(1_500_000),
      };
      const row = transactionToTx(t);
      expect(row.positive).toBe(false);
      expect(row.amount).toBe('-$1.50');
      expect(row.sub).toBe('PROCESSING');
    });
    it('falls back to type when direction is absent', () => {
      const t: RawTransaction = { id: 'Transaction:3', type: 'INCOMING', status: 'COMPLETED', receivedAmount: usdb(0) };
      expect(transactionToTx(t).positive).toBe(true);
    });
  });
  ```
- [ ] In `useWalletDemoLogic.ts`, after a successful `gridSignIn`, load real balance + activity and seed `wallet`. In the passkey branch of `authenticate`, immediately after `await gridSignIn(...)` add:
  ```ts
  const [balanceCents, activity] = await Promise.all([
    fetchBalanceCents(logEnvelope('Sign in', gid)),
    fetchActivity(logEnvelope('Sign in', gid)),
  ]);
  session.current.loadedBalanceCents = balanceCents;
  session.current.loadedActivity = activity;
  ```
  Extend the `Session` interface with `loadedBalanceCents?: number; loadedActivity?: Tx[];`. Import `fetchBalanceCents`, `fetchActivity` and `type Tx`.
- [ ] In `signInWithMethod`, replace `setWallet((w) => ({ ...w, created: true, balanceCents: 0 }));` with a version that applies the loaded values:
  ```ts
  setWallet((w) => ({
    ...w,
    created: true,
    balanceCents: session.current.loadedBalanceCents ?? 0,
    activity: session.current.loadedActivity ?? [],
  }));
  ```
- [ ] Add a `refreshBalance` helper (used by Tasks 7–8 after money movement) and expose it from the hook:
  ```ts
  const refreshBalance = useCallback(async (groupLabel: string, groupId: string) => {
    const cents = await fetchBalanceCents(logEnvelope(groupLabel, groupId));
    setWallet((w) => ({ ...w, balanceCents: cents }));
  }, [logEnvelope]);
  ```
  Return `refreshBalance` from the hook (add to the returned object and wire through `page.tsx`/`DemoPhone` only if a later task needs it in the UI; internal calls suffice for Tasks 7–8).
- [ ] **Verify (browser):** sign in → the wallet balance matches the account's real book balance (a freshly created sandbox wallet starts at `$0.00` until funded in Task 8) and the activity list shows the customer's real transactions (or empty state if none). The panel's "Sign in" group includes the `GET /customers/internal-accounts` and `GET /transactions` calls with real bodies. **Verify (unit):** `npm test` → `transactionToTx` tests pass.
- [ ] `npx tsc --noEmit` → no NEW errors. `npm run build` → succeeds.
- [ ] **Commit:** `git add src/lib/gridReads.ts src/lib/gridReads.test.ts src/hooks/useWalletDemoLogic.ts && gt modify --commit -m "feat(grid-wallet-prod): live balance + activity reads on sign-in"` (+ `Co-Authored-By`).

---

## Task 8 — Add money via sandbox fund (with prod probe/fallback)

**Files**
- Modify: `components/grid-wallet-prod/src/lib/gridReads.ts` (add fund helper) OR create `src/lib/gridFunding.ts`
- Modify: `components/grid-wallet-prod/src/hooks/useWalletDemoLogic.ts`
- Test: `components/grid-wallet-prod/src/lib/gridFunding.test.ts`

**Interfaces**
- Produces (`gridFunding.ts`):
  - `sandboxFund(accountId: string, cents: number, log: LogFn): Promise<{ ok: boolean; status: number }>` — `POST /sandbox/internal-accounts/{accountId}/fund` with `{ amount: centsToAmount(cents, USDB_DECIMALS) }`.
  - Pure: `fundAmountForCents(cents: number): { amount: number }`.
- Consumes: `gridFetch`, `centsToAmount`/`USDB_DECIMALS`, `getAccount` (Task 5).

**Grounding:** `POST /sandbox/internal-accounts/{accountId}/fund` body `{ amount }` in smallest unit; returns `200 InternalAccount`; returns **403** on production keys (openapi/paths/sandbox/sandbox_internal_accounts_{accountId}_fund.yaml + …/SandboxFundRequest.yaml). Amount is USDB micro-units (6 dp).

**Steps**

- [ ] Create `src/lib/gridFunding.ts`:
  ```ts
  'use client';

  import { gridFetch } from './gridClient';
  import type { LogFn } from './gridSession';
  import { centsToAmount, USDB_DECIMALS } from './gridUnits';

  /** Sandbox fund body: cents -> USDB micro-units. */
  export function fundAmountForCents(cents: number): { amount: number } {
    return { amount: centsToAmount(cents, USDB_DECIMALS) };
  }

  export async function sandboxFund(
    accountId: string,
    cents: number,
    log: LogFn,
  ): Promise<{ ok: boolean; status: number }> {
    const env = await gridFetch('POST', `/sandbox/internal-accounts/${accountId}/fund`, {
      body: fundAmountForCents(cents),
    });
    log(env);
    return { ok: env.response.status === 200, status: env.response.status };
  }
  ```
- [ ] Create `src/lib/gridFunding.test.ts`:
  ```ts
  import { describe, it, expect } from 'vitest';
  import { fundAmountForCents } from './gridFunding';

  describe('fundAmountForCents', () => {
    it('maps cents to USDB micro-units', () => {
      expect(fundAmountForCents(200)).toEqual({ amount: 2_000_000 });
      expect(fundAmountForCents(5000)).toEqual({ amount: 50_000_000 });
      expect(fundAmountForCents(0)).toEqual({ amount: 0 });
    });
  });
  ```
- [ ] In `useWalletDemoLogic.ts`, rewrite the `add` branch of `onTransferExecute` to call the real sandbox fund, then refresh the balance from Grid (source of truth), and log the real calls into the transfer group. Replace the `if (mode === 'add') { ... return; }` block:
  ```ts
  if (mode === 'add') {
    transferFundingCurrency.current = null;
    const acct = getAccount();
    if (acct) {
      void (async () => {
        const res = await sandboxFund(acct.accountId, cents, logEnvelope(TRANSFER_LABEL[mode], gid));
        if (res.ok) {
          await refreshBalance(TRANSFER_LABEL[mode], gid); // real GET /customers/internal-accounts
          setCompleted((c) => ({ ...c, add: true }));
        } else if (res.status === 403) {
          // Production keys: sandbox fund is forbidden. Keep the panel truthful;
          // do NOT fake a balance bump. (Prod add-money is the real quote path — future work.)
          setCompleted((c) => ({ ...c, add: true }));
        }
      })();
    }
    return;
  }
  ```
  Import `sandboxFund` and `getAccount`. Remove the `addMoneySettlementCalls` optimistic push for `add` (the real fund + balance refresh replace it). Keep the phone's fixed dollar amounts (the sheet still passes `cents`; `fundAmountForCents` maps them).
  > Optional polish (spec's "sandbox affordance gated on a probe"): on first sign-in, issue one `sandboxFund(accountId, 0, …)`-style probe is NOT valid (amount 0 may no-op); instead gate on the first real fund's 403 — if it returns 403, set a module flag `sandboxAvailable = false` and hide the "Add money" affordance on subsequent opens. Implement the flag in `gridFunding.ts` (`let sandboxAvailable: boolean | null`) and expose `isSandboxAvailable()`. This is a nice-to-have; the 403-tolerant branch above already keeps the demo truthful.
- [ ] **Verify (browser):** tap "Add money" → choose a fixed amount → confirm. The panel's "Add money" group shows a real `POST /sandbox/internal-accounts/{id}/fund` (200 InternalAccount) followed by a real `GET /customers/internal-accounts`; the wallet balance increases by the funded amount (mapped via `gridUnits`). **Verify (unit):** `npm test` → `fundAmountForCents` passes.
- [ ] `npx tsc --noEmit` → no NEW errors. `npm run build` → succeeds.
- [ ] **Commit:** `git add src/lib/gridFunding.ts src/lib/gridFunding.test.ts src/hooks/useWalletDemoLogic.ts && gt modify --commit -m "feat(grid-wallet-prod): add money via sandbox fund + balance refresh"` (+ `Co-Authored-By`).

---

## Task 9 — Send / Cash out: external account → quote → stamp → execute → poll to COMPLETED

**Files**
- Create: `components/grid-wallet-prod/src/lib/gridTransfer.ts`
- Test: `components/grid-wallet-prod/src/lib/gridTransfer.test.ts`
- Modify: `components/grid-wallet-prod/src/hooks/useWalletDemoLogic.ts`

**Interfaces**
- Produces (`gridTransfer.ts`):
  - `type OutboundMode = 'withdraw' | 'send';`
  - `ensureExternalAccount(input: ExternalAccountInput, log: LogFn): Promise<string>` — reuse a cached ExternalAccount id per destination signature, else `POST /customers/external-accounts` (returns `id`).
  - `createQuote(body: QuoteBody, log: LogFn, idempotencyKey: string): Promise<{ quoteId: string; payloadToSign: string | null; env: GridEnvelope }>` — `POST /quotes`, reads `paymentInstructions[].accountOrWalletInfo` for the `EMBEDDED_WALLET` `payloadToSign`.
  - `executeQuote(quoteId: string, payloadToSign: string, sessionPrivHex: string, log: LogFn, idempotencyKey: string): Promise<GridEnvelope>` — stamps `payloadToSign`, `POST /quotes/{quoteId}/execute` with `Grid-Wallet-Signature`.
  - `pollTransaction(txnId: string, log: LogFn, opts?: { timeoutMs?: number; intervalMs?: number }): Promise<string>` — polls `GET /transactions/{id}` until the status is terminal (`COMPLETED`/`FAILED`/`REJECTED`/`REFUNDED`/`EXPIRED`) or the timeout elapses. Default `timeoutMs` 180_000, `intervalMs` 4_000 (sandbox off-ramp completes in 60–180s). Each poll is logged. This is a status-polling loop, distinct from the single auth session-refresh retry.
  - Pure: `findEmbeddedWalletPayload(quote: RawQuote): string | null`, `destSignature(input: ExternalAccountInput): string`, `quoteBodyFor(mode, accountId, externalAccountId, cents, currency): QuoteBody`, `isTerminalStatus(status: string): boolean`.
- Consumes: `gridFetch`, `GridEnvelope`, `stamp` (Task 2), `ensureSession`/`getAccount` (Task 5), `ExternalAccountInput`/`TransferDest` (`@/data/apiCalls`).

**Grounding:** `POST /customers/external-accounts` body `{ customerId, currency, accountInfo }` (openapi/paths/customers/customers_external_accounts.yaml, examples `usBankAccount`/`sparkWallet`; also matches `externalAccountCreateCall` in src/data/apiCalls.ts). `POST /quotes` body `{ source, destination, lockedCurrencySide, lockedCurrencyAmount }` (…/quotes.yaml + QuoteRequest); `Idempotency-Key` header supported. Quote response `paymentInstructions[].accountOrWalletInfo` with `accountType: EMBEDDED_WALLET` + `payloadToSign` (…/PaymentEmbeddedWalletInfo.yaml). `POST /quotes/{quoteId}/execute` requires `Grid-Wallet-Signature` over that `payloadToSign` when the source is an `EMBEDDED_WALLET` (…/quotes_{quoteId}_execute.yaml). `GET /transactions/{id}` (…/transactions_{transactionId}.yaml); `TransactionStatus` terminal values from …/TransactionStatus.yaml. **Sandbox happy path:** with a funded wallet, execute returns 200 (`PROCESSING`) and the documented off-ramp settles to `COMPLETED` in 60–180s.

**Steps**

- [ ] Create `src/lib/gridTransfer.ts`:
  ```ts
  'use client';

  import { gridFetch, type GridEnvelope } from './gridClient';
  import type { ExternalAccountInput } from '@/data/apiCalls';
  import type { LogFn } from './gridSession';
  import { stamp } from './gridCrypto';
  import { centsToAmount, USDB_DECIMALS } from './gridUnits';

  export type OutboundMode = 'withdraw' | 'send';

  export interface RawQuote {
    id: string;
    status: string;
    transactionId?: string;
    paymentInstructions?: { accountOrWalletInfo?: { accountType?: string; payloadToSign?: string } }[];
  }

  const CUSTOMER = '{customerId}';
  const externalAccountCache = new Map<string, string>(); // destSignature -> ExternalAccount id

  /** Stable signature for a destination so we create it at most once per session. */
  export function destSignature(input: ExternalAccountInput): string {
    return input.kind === 'crypto'
      ? `crypto:${input.network}:${input.currency}:${input.address}`
      : `bank:${input.currency}:${input.bankName}:${JSON.stringify(input.fields)}`;
  }

  function externalAccountBody(input: ExternalAccountInput): Record<string, unknown> {
    if (input.kind === 'crypto') {
      return {
        customerId: CUSTOMER,
        currency: input.currency,
        accountInfo: { accountType: input.accountType, address: input.address },
      };
    }
    return {
      customerId: CUSTOMER,
      currency: input.currency,
      accountInfo: {
        accountType: input.accountType,
        ...input.fields,
        beneficiary: { beneficiaryType: 'INDIVIDUAL', fullName: input.beneficiary },
      },
    };
  }

  export async function ensureExternalAccount(input: ExternalAccountInput, log: LogFn): Promise<string> {
    const sig = destSignature(input);
    const cached = externalAccountCache.get(sig);
    if (cached) return cached;
    const env = await gridFetch('POST', '/customers/external-accounts', { body: externalAccountBody(input) });
    log(env);
    if (env.response.status !== 201) {
      const b = env.response.body as { error?: { message?: string } };
      throw new Error(`create external account: ${env.response.status} ${b?.error?.message ?? ''}`);
    }
    const id = (env.response.body as { id: string }).id;
    externalAccountCache.set(sig, id);
    return id;
  }

  export interface QuoteBody {
    source: Record<string, unknown>;
    destination: Record<string, unknown>;
    lockedCurrencySide: 'SENDING' | 'RECEIVING';
    lockedCurrencyAmount: number;
  }

  /** Outbound (embedded-wallet source) quote body. USDB source, external destination. */
  export function quoteBodyFor(
    accountId: string,
    externalAccountId: string,
    cents: number,
    destCurrency: string,
  ): QuoteBody {
    return {
      source: { sourceType: 'ACCOUNT', accountId },
      destination: { destinationType: 'ACCOUNT', accountId: externalAccountId, currency: destCurrency },
      lockedCurrencySide: 'SENDING',
      lockedCurrencyAmount: centsToAmount(cents, USDB_DECIMALS),
    };
  }

  export function findEmbeddedWalletPayload(quote: RawQuote): string | null {
    const inst = (quote.paymentInstructions ?? []).find(
      (p) => p.accountOrWalletInfo?.accountType === 'EMBEDDED_WALLET',
    );
    return inst?.accountOrWalletInfo?.payloadToSign ?? null;
  }

  export async function createQuote(
    body: QuoteBody,
    log: LogFn,
    idempotencyKey: string,
  ): Promise<{ quoteId: string; transactionId: string | null; payloadToSign: string | null; env: GridEnvelope }> {
    const env = await gridFetch('POST', '/quotes', { body, headers: { 'Idempotency-Key': idempotencyKey } });
    log(env);
    if (env.response.status !== 201) {
      const b = env.response.body as { error?: { message?: string } };
      throw new Error(`create quote: ${env.response.status} ${b?.error?.message ?? ''}`);
    }
    const q = env.response.body as RawQuote;
    return { quoteId: q.id, transactionId: q.transactionId ?? null, payloadToSign: findEmbeddedWalletPayload(q), env };
  }

  export async function executeQuote(
    quoteId: string,
    payloadToSign: string,
    sessionPrivHex: string,
    log: LogFn,
    idempotencyKey: string,
  ): Promise<GridEnvelope> {
    const sig = await stamp(sessionPrivHex, payloadToSign); // byte-for-byte over payloadToSign
    const env = await gridFetch('POST', `/quotes/${quoteId}/execute`, {
      body: {},
      headers: { 'Grid-Wallet-Signature': sig, 'Idempotency-Key': idempotencyKey },
    });
    log(env);
    return env; // caller inspects status: 200 = PROCESSING; 4xx = truthful error rendered in the panel
  }

  const TERMINAL = new Set(['COMPLETED', 'FAILED', 'REJECTED', 'REFUNDED', 'EXPIRED']);
  export function isTerminalStatus(status: string): boolean {
    return TERMINAL.has(status);
  }

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  /** Poll GET /transactions/{id} until terminal or timeout. Sandbox off-ramp settles in 60–180s. */
  export async function pollTransaction(
    txnId: string,
    log: LogFn,
    opts: { timeoutMs?: number; intervalMs?: number } = {},
  ): Promise<string> {
    const timeoutMs = opts.timeoutMs ?? 180_000;
    const intervalMs = opts.intervalMs ?? 4_000;
    const deadline = Date.now() + timeoutMs;
    let status = 'UNKNOWN';
    for (;;) {
      const env = await gridFetch('GET', `/transactions/${txnId}`);
      log(env);
      if (env.response.status === 200) {
        status = (env.response.body as { status: string }).status;
        if (isTerminalStatus(status)) return status;
      }
      if (Date.now() >= deadline) return status; // give up; caller renders the last-seen status
      await sleep(intervalMs);
    }
  }
  ```
- [ ] Create `src/lib/gridTransfer.test.ts` (pure helpers):
  ```ts
  import { describe, it, expect } from 'vitest';
  import { findEmbeddedWalletPayload, destSignature, quoteBodyFor, isTerminalStatus } from './gridTransfer';

  describe('gridTransfer pure helpers', () => {
    it('isTerminalStatus recognizes terminal vs in-flight states', () => {
      expect(isTerminalStatus('COMPLETED')).toBe(true);
      expect(isTerminalStatus('FAILED')).toBe(true);
      expect(isTerminalStatus('PROCESSING')).toBe(false);
      expect(isTerminalStatus('PENDING')).toBe(false);
    });
    it('finds the EMBEDDED_WALLET payloadToSign', () => {
      const q = {
        id: 'Quote:1', status: 'PENDING',
        paymentInstructions: [
          { accountOrWalletInfo: { accountType: 'USD_ACCOUNT' } },
          { accountOrWalletInfo: { accountType: 'EMBEDDED_WALLET', payloadToSign: '{"x":1}' } },
        ],
      };
      expect(findEmbeddedWalletPayload(q)).toBe('{"x":1}');
    });
    it('returns null when there is no embedded-wallet instruction', () => {
      expect(findEmbeddedWalletPayload({ id: 'Quote:2', status: 'PENDING', paymentInstructions: [] })).toBeNull();
    });
    it('destSignature dedupes identical destinations', () => {
      const a = { kind: 'crypto', address: 'x', network: 'SPARK', accountType: 'SPARK_WALLET', currency: 'BTC' } as const;
      expect(destSignature(a)).toBe(destSignature({ ...a }));
    });
    it('quoteBodyFor locks USDB sending in micro-units', () => {
      const b = quoteBodyFor('InternalAccount:1', 'ExternalAccount:2', 200, 'USD');
      expect(b.lockedCurrencySide).toBe('SENDING');
      expect(b.lockedCurrencyAmount).toBe(2_000_000);
      expect(b.source).toEqual({ sourceType: 'ACCOUNT', accountId: 'InternalAccount:1' });
      expect(b.destination).toEqual({ destinationType: 'ACCOUNT', accountId: 'ExternalAccount:2', currency: 'USD' });
    });
  });
  ```
- [ ] In `useWalletDemoLogic.ts`, wire the outbound flow. Rewrite `onLinkExternalAccount` to create the real external account and cache its id, logging the real call:
  ```ts
  const onLinkExternalAccount = useCallback(
    (input: ExternalAccountInput, label: string) => {
      const gid = newGroupId();
      void ensureExternalAccount(input, logEnvelope(label, gid)).catch((e) =>
        console.error('[grid-demo] link external account', e),
      );
    },
    [logEnvelope],
  );
  ```
  Store the pending destination for the next quote (the sheet reports `dest` on quote create). Rewrite `onQuoteCreate` for outbound modes to build+send a real quote and stash the `quoteId`/`payloadToSign`:
  ```ts
  const onQuoteCreate = useCallback(
    (mode: WalletTransferMode, cents: number, dest?: TransferDest) => {
      const gid = newGroupId();
      transferGroup.current = gid;
      if (mode === 'add') { transferFundingCurrency.current = null; return; } // add uses sandbox fund (Task 7)
      const acct = getAccount();
      if (!acct) return;
      void (async () => {
        const destCurrency = dest?.currency ?? 'USD';
        // The external account was created on link; resolve its id from the cache
        // via the same destination signature the sheet used, or create on demand.
        const externalAccountId = pendingExternalAccountId.current;
        if (!externalAccountId) return;
        const idem = crypto.randomUUID();
        const quote = await createQuote(
          quoteBodyFor(acct.accountId, externalAccountId, cents, destCurrency),
          logEnvelope(TRANSFER_LABEL[mode], gid),
          idem,
        );
        pendingQuote.current = { quoteId: quote.quoteId, payloadToSign: quote.payloadToSign, transactionId: quote.transactionId, idem };
      })().catch((e) => console.error('[grid-demo] create quote', e));
    },
    [logEnvelope],
  );
  ```
  Add refs `pendingExternalAccountId` (set inside `onLinkExternalAccount` once `ensureExternalAccount` resolves) and `pendingQuote`. Rewrite the outbound branch of `onTransferExecute` to stamp+execute+poll and render the truthful result:
  ```ts
  // outbound (withdraw | send)
  const gid = transferGroup.current ?? newGroupId();
  transferGroup.current = null;
  const acct = getAccount();
  const pq = pendingQuote.current;
  pendingQuote.current = null;
  if (acct && pq?.payloadToSign) {
    void (async () => {
      const priv = await ensureSession({ log: logEnvelope(TRANSFER_LABEL[mode], gid), promptOtp, onFaceId: () => playFaceId() });
      const execEnv = await executeQuote(pq.quoteId, pq.payloadToSign!, priv, logEnvelope(TRANSFER_LABEL[mode], gid), pq.idem);
      if (execEnv.response.status === 200) {
        if (pq.transactionId) await pollTransaction(pq.transactionId, logEnvelope(TRANSFER_LABEL[mode], gid)); // polls to COMPLETED (60–180s)
        await refreshBalance(TRANSFER_LABEL[mode], gid); // real balance from Grid
        setCompleted((c) => ({ ...c, [mode]: true }));
      } else {
        // Real error (e.g. insufficient funds if the wallet wasn't funded first,
        // 409 expired quote). The panel already logged the truthful error via
        // logEnvelope; the phone recovers (no balance change).
        console.warn('[grid-demo] execute failed', execEnv.response.status);
      }
    })().catch((e) => console.error('[grid-demo] execute', e));
  }
  ```
  Import `ensureExternalAccount`, `createQuote`, `executeQuote`, `pollTransaction`, `quoteBodyFor`, `ensureSession`. Remove the optimistic `setWallet(balanceCents - cents)` for outbound modes — the real `refreshBalance` after settlement is the source of truth.
- [ ] **Verify (browser, sandbox happy path):** first fund the wallet (Task 8) so there's a spendable USDB balance, then open Send (or Cash out) → pick/create a recipient (bank or crypto) → confirm amount → Face ID. The panel's group shows, truthfully: `POST /customers/external-accounts` (201, once per destination), `POST /quotes` (201 with `paymentInstructions[].accountOrWalletInfo.payloadToSign`), `POST /quotes/{id}/execute` with a `Grid-Wallet-Signature` header (200 → `PROCESSING`), then the `GET /transactions/{id}` poll advancing to **`COMPLETED`** within 60–180s. Assert: (a) each response body is visible on its Response tab; (b) after `COMPLETED`, `refreshBalance` shows the debit; (c) re-running does not double-create the external account (cache hit). **Verify (unit):** `npm test` → `gridTransfer` pure-helper tests pass. **Verify (error path is still truthful):** attempt a send that exceeds the balance → the execute response renders the real error (e.g. insufficient funds) and the phone recovers.
- [ ] `npx tsc --noEmit` → no NEW errors. `npm run build` → succeeds. `npm test` → the full suite passes.
- [ ] **Commit:** `git add src/lib/gridTransfer.ts src/lib/gridTransfer.test.ts src/hooks/useWalletDemoLogic.ts && gt modify --commit -m "feat(grid-wallet-prod): outbound quote/stamp/execute/poll to COMPLETED"` (+ `Co-Authored-By`).

---

## Verification (mirrors the spec)

Run against the **public sandbox** (`GRID_API_BASE_URL=https://api.lightspark.com/grid/2025-10-13`, sandbox credentials in `.env.local`), dev server on **port 4001**, in a **top-level browser tab** (not the docs iframe — WebAuthn `create()` needs top-level). Task 0's gate must have passed (customer with an `EMBEDDED_WALLET` + `EMAIL_OTP`).

**M1 — proxy + session + reads + funding + webhooks**
- [ ] First-run registration: tap "Continue with passkey" → OTP sheet → sandbox magic code `000000` → system passkey dialog → Face ID → wallet. Panel "Sign in" group shows every real call (internal-accounts, credentials list, EMAIL_OTP challenge + two-leg verify, passkey create 202→201, passkey challenge + verify 200 with `encryptedSessionSigningKey`).
- [ ] Returning passkey sign-in: "Sign in again" → only the passkey challenge/verify calls (no OTP, no create). Session key decrypted client-side.
- [ ] Live balance + activity: balance equals the account's real book balance ($0.00 for a fresh wallet); activity lists the customer's real transactions.
- [ ] Sandbox fund: "Add money" → real `POST /sandbox/internal-accounts/{id}/fund` (200) + `GET /customers/internal-accounts` → balance rises by the funded amount.
- [ ] Webhook receiver: unit tests pass (valid signature accepted; tampered body, corrupted signature, wrong signer, bad version all rejected). Local live check: a bogus `X-Grid-Signature` POST to `/api/webhooks` → 401; `/api/webhooks/events` → empty. (Real signed delivery is verified once deployed and the webhook URL is registered.)
- [ ] Panel truth: every entry's Request/Response tabs match the proxy's real traffic; `Authorization` is never exposed (curl shows `Basic $GRID_KEY`); no private key appears in any body.

**M2 — outbound money (full sandbox settlement)**
- [ ] Send + Cash out (wallet funded first): external-account creation (201, reuse-not-recreate on repeat), quote (201 with `payloadToSign`), stamped execute (200 → `PROCESSING`), `GET /transactions/{id}` poll advancing to **`COMPLETED`** in 60–180s; balance reflects the debit afterward. An over-balance send still renders its real error truthfully and the phone recovers.

**Cross-cutting**
- [ ] `npm test` — all Vitest suites pass (gridUnits, gridCrypto incl. scripts cross-check, allowlist, gridWebhook, gridSession pickCredentials, gridReads, gridFunding, gridTransfer).
- [ ] `npx tsc --noEmit` — no NEW errors beyond the 5 pre-existing.
- [ ] `npm run build` — succeeds.
- [ ] **Prod-swap smoke (manual, when the user swaps `GRID_CLIENT_ID`/`GRID_CLIENT_SECRET`/`GRID_CUSTOMER_ID` + retargets `GRID_API_BASE_URL`):** first tap re-runs passkey registration against the real OTP email; activity loads the production account's history; sandbox fund returns 403 (add-money affordance tolerates it); send/cash-out completes to `COMPLETED`; the deployed `/api/webhooks` receiver verifies real Grid signatures.
