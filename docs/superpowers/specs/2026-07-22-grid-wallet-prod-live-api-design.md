# Grid Wallet Prod — Phase 2: real Grid API calls

**Date:** 2026-07-22
**Status:** Approved (env: sandbox → prod swap; browser-side signing; real passkey from day one)

## Goal

`components/grid-wallet-prod` stops faking its API panel: every wallet action drives real Grid API
calls, and the panel renders the requests/responses that actually went over the wire. Development
runs against the **public sandbox**; switching to production is an env-var change (API keys +
customer ID), after which the first-run passkey registration runs again and real transaction
history loads.

## Decisions (user-confirmed)

- **Environment:** build against the public sandbox (`https://api.lightspark.com/grid/2025-10-13`).
  The user later swaps `GRID_CLIENT_ID`/`GRID_CLIENT_SECRET`/`GRID_CUSTOMER_ID` to a production
  account. No environment-specific code paths beyond the sandbox funding affordance (below).
- **Key custody:** browser-side. The TEK/session signing key is generated in the browser and never
  sent to the server — matching Grid's documented rule ("session key never leaves the client").
  Grid's isomorphic JS libs (`@turnkey/crypto`, `@turnkey/api-key-stamper`, `@noble/*` — the same
  ones `scripts/embedded-wallet-sign.js` uses in Node) run in the client bundle.
- **Passkey:** a real Grid `PASSKEY` credential, registered on first run, used for sign-in ever
  after. The local cosmetic `navigator.credentials.create()` ceremony is replaced by the real
  Grid-challenge-driven WebAuthn flows.
- **Customer:** pre-created; `GRID_CUSTOMER_ID` in `.env.local`. The app never creates customers.

## Probed facts this design rests on (2026-07-22, dev env)

- Server auth is HTTP Basic on every endpoint → all Grid traffic goes through Next.js route
  handlers (secret + CORS); the browser talks only to `/api/grid/*`.
- The EMAIL_OTP ceremony works programmatically end-to-end: `POST /auth/credentials/{id}/challenge`
  → HPKE-encrypt `{otp, tekPublicKey}` against the returned `otpEncryptionTargetBundle` → two-leg
  `POST /verify` (202 `payloadToSign` + `requestId` → Turnkey stamp → 200 `Session`, ~10 min TTL).
  For EMAIL_OTP the TEK private key IS the session signing key. Sandbox honors magic OTP `000000`;
  production emails a real code (the demo's OTP sheet collects it either way).
- A pre-created customer has `EMBEDDED_WALLET` (USDB, 6 decimals) + `INTERNAL_FIAT` +
  `INTERNAL_CRYPTO` accounts; balances via `GET /customers/internal-accounts`.
- `POST /sandbox/internal-accounts/{id}/fund` credits the wallet instantly (sandbox/dev keys only).
- Outbound quotes from the embedded wallet return `paymentInstructions[]` with a `payloadToSign`;
  `POST /quotes/{id}/execute` requires a `Grid-Wallet-Signature` stamp over it.
- The **dev** cluster cannot settle USDB on-chain today (`COUNTERPARTY_POST_TX_FAILED`; sandbox
  fund mints book balance only) — that's why development moves to the public sandbox, where the
  documented off-ramp completes in 60–180s.
- Card issuance is configured (validation errors, not 501) but requires the delegated-key signed
  flow — deferred to a later milestone.

## Architecture

```
Browser (React)                         Next.js route handlers            Grid API
─ WebAuthn create/get (real challenges) ─ /api/grid/[...proxy]            (sandbox or prod,
─ TEK keygen, HPKE encrypt/decrypt        adds Authorization: Basic        from env)
─ Turnkey stamps (Grid-Wallet-Signature)  never sees key material
─ API panel renders real traffic          returns {request, response} pairs
```

- **Proxy:** one catch-all route handler forwards allow-listed Grid paths, injecting Basic auth and
  `GRID_CUSTOMER_ID` where the client passes a `{customerId}` placeholder. It returns
  `{request: {method, path, headers*, body}, response: {status, body}}` (auth header redacted) so
  the panel logs truth. Client-supplied `Grid-Wallet-Signature` / `Request-Id` headers pass through.
- **Crypto module (`src/lib/gridCrypto.ts`):** browser-only wrapper over `@turnkey/crypto` +
  `@turnkey/api-key-stamper`: TEK generation, HPKE encrypt (OTP bundle), HPKE decrypt
  (`encryptedSessionSigningKey`), stamp construction. Session key held in memory (module scope);
  passkey credential id persisted in `localStorage` keyed by customer ID.
- **`useWalletDemoLogic` rewiring:** the scripted `pushCalls([staticCall])` sites become awaited
  real calls whose request/response pairs feed the same panel entries. The panel entry shape gains
  real response bodies and status codes; latency is real.

## Auth flows

**First run (no PASSKEY credential on the customer):**
1. Tap "Continue with passkey" → `GET /auth/credentials?customerId=…` → no PASSKEY found.
2. EMAIL_OTP session: challenge the auto-created EMAIL_OTP credential → phone shows the existing
   OTP sheet (user types `000000` in sandbox, the emailed code in prod) → HPKE-encrypt → two-leg
   verify with browser stamp → session.
3. Register passkey: signed-retry `POST /auth/credentials {type: PASSKEY, …}` (202 → stamp → 201)
   → real `navigator.credentials.create()` against Grid's registration challenge → activate via
   `/challenge` + `/verify` with the attestation. Persist the credential id.
4. Continue into the wallet on the live session.

**Returning run:** challenge the PASSKEY credential → `navigator.credentials.get()` with Grid's
challenge → `/verify` with the assertion → session (+ HPKE-decrypt `encryptedSessionSigningKey`
→ session signing key). On session expiry (~10 min) mid-demo, re-run silently and retry once.

## Flow map (demo action → real calls)

| Action | Calls | Notes |
|---|---|---|
| Sign in | flows above | panel logs challenge/verify truthfully |
| Balance | `GET /customers/internal-accounts` | USDB 6-dec → the app's cents model via a units layer |
| Activity | `GET /transactions?customerId` | loads REAL history on sign-in (key for the prod swap) |
| Add money | sandbox: `POST /sandbox/internal-accounts/{id}/fund`; prod: real quote path | sandbox affordance gated on a probe of the endpoint (403 on prod keys ⇒ hide/fallback) |
| Send / Cash out | `POST /customers/external-accounts` (once per dest) → `POST /quotes` → stamped `POST /quotes/{id}/execute` → poll `GET /transactions/{id}` | `Idempotency-Key` per action; fixed demo amounts stay |
| Receive | poll `GET /transactions` (no public webhook receiver) | |
| Issue card / tap to pay | **stays scripted in this phase** | real cards + delegated keys + `/sandbox/cards/{id}/simulate/*` = Phase 3 |

## Env contract (`.env.local`)

```
GRID_CLIENT_ID / GRID_CLIENT_SECRET   # server-only
GRID_API_BASE_URL                     # default https://api.lightspark.com/grid/2025-10-13
GRID_CUSTOMER_ID                      # pre-created customer driving the demo
```

Swapping all three to production values is the entire prod cutover; first tap re-runs passkey
registration (real OTP email), activity loads the production account's history.

## Error handling

Real calls fail (429 + Retry-After on OTP endpoints, 400s, expired sessions, quote expiry). The
panel renders error responses truthfully (status + body); the phone surfaces a compact failure
state on the affected action and stays usable. WebAuthn cancellation returns the user to the auth
screen silently. No retry loops beyond the single session-refresh retry.

## Milestones

1. **M1 — proxy + session + reads + funding:** route handler, crypto module, first-run/returning
   auth flows, live balance + activity, sandbox add-money, panel rendering real traffic.
2. **M2 — outbound money:** external account creation, quote → stamp → execute → poll for send and
   cash-out.
3. **M3 (separate spec) — cards:** delegated keys, real issuance, simulated authorizations.

## Out of scope

- Cards (Phase 3). Webhook receiver (polling instead). Customer creation/KYC. Multi-customer
  support. Production hardening beyond the env swap (rate-limit backoff, session persistence).

## Verification

- Sandbox: full happy path — first-run registration (OTP `000000`), returning passkey sign-in,
  balance/activity live, fund, send to a sandbox bank, transaction reaches `COMPLETED`; panel
  entries match a `mitmproxy`/route-handler log of actual traffic.
- Env-swap rehearsal: point at dev (known-broken outbound) and confirm graceful failure surfaces;
  confirm no code change is needed for the swap itself.

## Open items

- Confirm the user has/gets **public sandbox keys** (current `.env.local` holds dev-cluster keys).
- Confirm `@turnkey/crypto`/`@turnkey/api-key-stamper` browser compatibility early (M1, first task)
  — fallback is a small WebCrypto+noble implementation mirroring `scripts/embedded-wallet-sign.js`.
- Raise the dev-cluster on-chain settlement gap (`COUNTERPARTY_POST_TX_FAILED`, non-atomic debit)
  with the paycore/Spark team — independent of this work.
