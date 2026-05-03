# Global Accounts walkthrough

This is the **Global Accounts branch** for Phase 4. Global Accounts is Grid's
embedded-wallet flow: customer-controlled accounts authenticated by passkey, OTP, or
external wallet signature, with end-to-end-encrypted session data.

For a tutorial, the goal is to get a working withdrawal flow end-to-end without
making the user implement WebAuthn, HPKE, or session signing themselves. We use the
**sandbox magic values** documented at
<https://grid.lightspark.com/global-accounts/implementation-overview> and
<https://grid.lightspark.com/api-reference/sandbox-testing> (append `.md` to either
URL for an LLM-friendly version) to short-circuit those complex steps.

Same pacing rules as `payouts.md`: one step at a time, surface response, explain why,
ask before continuing.

## Sandbox magic values you'll use

| Step | Field | Sandbox value | What it bypasses |
| --- | --- | --- | --- |
| Email OTP | `otp` | `"000000"` | Sending a real email |
| Passkey signature | `signature` | `"sandbox-valid-passkey-signature"` | Real WebAuthn ceremony |
| OAuth/OIDC | `oidcToken` | `"sandbox-valid-oidc-token"` | Real OIDC provider round-trip |
| Wallet signature | `Grid-Wallet-Signature` header | `"sandbox-valid-signature"` | Real on-chain signature |

In production these are replaced by actual cryptographic verifications. Make this clear
to the user — we are demoing the *flow*, not the security primitives.

## Step 1 — Create the customer

**File:** `app/api/customers/route.ts`
**Endpoint:** `POST /customers`

Same as the Payouts branch (Phase 4 step 1). Save the customer ID.

**Why this step exists.** Global Accounts attaches to a customer just like payout
accounts do. The customer is still the canonical identity.

## Step 2 — Inspect the auto-provisioned Global Account

**File:** `app/api/internal-accounts/route.ts`
**Endpoint:** `GET /internal-accounts?customerId=...&type=EMBEDDED_WALLET`

When the request includes `type=EMBEDDED_WALLET`, the route forwards to the
Global-Accounts-specific `/internal-accounts` endpoint instead of `/customers/internal-accounts`.
Always include the `type` filter for Global Accounts — without it, the route returns
the Payouts-style internal accounts and the Global Account is missing from the result.

For Global Accounts customers the internal account also exposes embedded-wallet
metadata: `accountStatus`, supported auth methods, the encryption public key for
session payloads, etc.

**Why this step exists.** Unlike payouts, the customer (not the platform) is the
beneficial owner of these funds. The auth metadata is what your frontend uses to drive
the passkey/OTP/wallet UI.

## Step 3 — Register a passkey (sandbox-shortcut)

In production this is a full WebAuthn registration. In sandbox we POST a synthesized
attestation with the magic signature. The exact endpoint depends on the auth flow,
but for the tutorial use the registration endpoint documented at
<https://grid.lightspark.com/global-accounts/implementation-overview>.

**Why this step exists.** Without a registered authenticator, the customer can't
authorize withdrawals. Real WebAuthn ties the keypair to the device's secure enclave;
we're skipping that ceremony.

**Pacing tip.** This is a good moment to point at the existing snippet — the user can
read the production version once they finish the happy path.

## Step 4 — Fund the Global Account

**File:** `app/api/sandbox-fund/route.ts`
**Endpoint:** `POST /sandbox/internal-accounts/{accountId}/fund`

Body: `{ "amount": 100000 }` (= $1,000).

**Why this step exists.** Same as payouts step 4 — without funds the withdrawal in
step 7 fails. In production this would be a real deposit (ACH, wire, or crypto deposit
to the auto-provisioned funding instructions).

## Step 5 — Add an external destination account

**File:** `app/api/external-accounts/route.ts`
**Endpoint:** `POST /customers/external-accounts`

Same pattern as payouts step 5. Pick any corridor — for Global Accounts demos USD→USD
ACH is the simplest because there's no FX to explain.

**Why this step exists.** Global Accounts customers withdraw to their own external
bank or wallet. The external account record stores the rail-specific fields so future
withdrawals only need the account ID.

## Step 6 — Create a withdrawal quote

**File:** `app/api/quotes/route.ts`
**Endpoint:** `POST /quotes`

Body shape is identical to payouts step 6. The customer's internal account is the
source; the external account from step 5 is the destination.

**Why this step exists.** Even for same-currency withdrawals, the quote captures fees
and creates a stable reference for the executor — and is what the customer signs in
step 7.

## Step 7 — Sign the session and execute

In production: the frontend bundles the quote details, encrypts a session token with
the customer's authenticator, and submits the signed request. In sandbox: we send the
quote ID + magic wallet signature and Grid accepts it.

**File:** `app/api/quotes/execute/route.ts`
**Endpoint:** `POST /quotes/{quoteId}/execute`

The route's POST body accepts `walletSignature` (forwarded as the
`Grid-Wallet-Signature` header) and an optional `idempotencyKey`. For sandbox, send:

```json
{
  "quoteId": "<quoteId>",
  "walletSignature": "sandbox-valid-signature"
}
```

In production, replace `walletSignature` with the actual ECDSA signature over the
quote's `payloadToSign` (see the embedded-wallet walkthrough snippet for HPKE +
P-256 details).

**Why this step exists.** The customer — not the platform — must authorize the move.
This is the critical Global Accounts security property: the platform can never spend
the customer's funds without an authenticated request from the customer's authenticator.

## Step 8 — Poll the transaction

**File:** `app/api/transactions/route.ts`
**Endpoint:** `GET /transactions/{transactionId}`

Same as payouts step 8.

## After step 8 — recap script

Suggested recap:

> You just walked through a Global Accounts withdrawal: created a customer-controlled
> account, registered a passkey (sandbox-mocked), funded it, added an external
> destination, priced a quote, signed it with the customer's authenticator, and saw
> the transfer settle. The single biggest difference from Payouts: the *customer*
> authorized the move, not your platform — that's the embedded-wallet model.

Then offer the wrap-up follow-ups from `SKILL.md`.

## Authoritative deeper docs

- <https://grid.lightspark.com/global-accounts/implementation-overview> — full production walkthrough including HPKE encryption, real WebAuthn flow, OAuth/OIDC variants.
- <https://grid.lightspark.com/api-reference/sandbox-testing> — sandbox magic values reference.
- <https://grid.lightspark.com/global-accounts> — Global Accounts docs section index.

Append `.md` to any of these URLs for an LLM-friendly version. If you're inside a
clone of the [grid-api](https://github.com/lightsparkdev/grid-api) repo, the same
content is in `mintlify/global-accounts/` and `mintlify/snippets/global-accounts/`.
