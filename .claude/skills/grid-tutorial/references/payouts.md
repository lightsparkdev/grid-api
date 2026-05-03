# Payouts walkthrough

This is the **Payouts branch** for Phase 4. Follow it sequentially. Each step:

1. Says which scaffold file wraps the API call.
2. Shows the request the SDK builds.
3. Shows what to expect back.
4. Explains *why* the step exists — the part the user is here to learn.

Do not run all 8 steps in a single tool call. The whole point of the tutorial is the
pause-and-explain rhythm. After each step, surface the response in the chat and ask if
the user wants to continue or dig in.

## Sub-routing — pick a corridor

Before step 1, ask the user (use `AskUserQuestion`):

| Customer type | Destination corridor | Required external-account fields |
| --- | --- | --- |
| `INDIVIDUAL` or `BUSINESS` | `USD → MXN` (CLABE / SPEI) | 18-digit CLABE |
| | `USD → EUR` (SEPA Instant) | IBAN |
| | `USD → INR` (UPI) | UPI VPA (e.g., `name@bank`) |
| | `USD → USD` (ACH) | routing + account |

For exact field shapes per corridor, read `references/account-type-cheatsheet.md`. For
deeper field-by-field details with all 27 supported countries, the sibling `grid-api`
skill's `references/account-types.md` is authoritative.

## Step 1 — Create the customer

**File:** `app/api/customers/route.ts`
**Endpoint:** `POST /customers`

Request body:

```json
{
  "platformCustomerId": "tutorial-<timestamp>",
  "customerType": "INDIVIDUAL",
  "region": "US",
  "email": "ada@example.com",
  "fullName": "Ada Lovelace",
  "birthDate": "1815-12-10",
  "nationality": "GB"
}
```

`region` and `email` are required for Global-Accounts-enabled platforms and are
recommended everywhere — including them keeps the same body working across both
flows. For `BUSINESS`, swap individual fields for `businessInfo` (see the cheatsheet).

**Why this step exists.** The customer is the canonical identity in Grid. Every
account, every quote, every transaction hangs off a customer. When the SDK creates
one, Grid auto-provisions internal accounts in each currency the platform supports —
that's why we don't need a separate "create account" step before funding.

**What to surface.** The response includes `id` (e.g., `Customer:0195...`) and a `status`
of `PENDING` (KYC not yet complete). Save the ID — every subsequent step needs it.

## Step 2 — Generate a hosted KYC link

**File:** `app/api/customers/kyc-link/route.ts`
**Endpoint:** `GET /customers/kyc-link?platformCustomerId=...&redirectUri=...`

The response includes a single-use URL like `https://kyc.grid.lightspark.com/start/...`.

**What the user does.** Open the URL in their browser, walk through the sandbox-flavored
KYC form (sandbox auto-approves with safe defaults). When they finish, the customer
status flips to `ACTIVE`.

**Why this step exists.** Real money requires real identity verification. Grid offers
two KYC paths: hosted (a Lightspark-rendered form, what we're using) and API-based
(upload documents yourself via `POST /verifications` + `POST /documents`). For a
tutorial, hosted is *much* faster.

**Pacing tip.** Wait for the user to confirm they finished the KYC flow before
moving on. You can poll `GET /customers/{id}` until `status === "ACTIVE"`, but in
sandbox the flip is usually within a few seconds.

## Step 3 — Inspect the auto-provisioned internal account

**File:** `app/api/internal-accounts/route.ts`
**Endpoint:** `GET /customers/internal-accounts?customerId=...`

The response is a `data` array of accounts, one per currency. For our tutorial we want
the `USD` one. Save its `id` (e.g., `InternalAccount:0195...`).

**Why this step exists.** This is the moment to clear up a confusion that trips up
nearly every new Grid integrator: *internal accounts hold balances; external accounts
are destinations*. They are different objects with different schemas. We're going to
fund this internal account, then send out to an external account in step 5.

The response also includes `fundingPaymentInstructions` — bank wire details, ACH info,
crypto deposit addresses. In production, you'd display these to the customer so they
can fund the account from their own bank. In sandbox, we'll skip ahead with a faucet.

## Step 4 — Fund the internal account (sandbox only)

**File:** `app/api/sandbox-fund/route.ts`
**Endpoint:** `POST /sandbox/internal-accounts/{accountId}/fund`

Request body:

```json
{ "amount": 100000 }
```

That's `$1,000` in cents. Grid's amount fields are always in the smallest currency
unit (cents for USD, satoshis for BTC, etc.).

**Why this step exists.** Without funds, the next step (`POST /quotes`) fails with
`INSUFFICIENT_BALANCE`. The faucet is sandbox-only — in production this is real money
arriving via ACH/wire/crypto deposit, with a webhook (`INCOMING_PAYMENT`) signalling
the deposit cleared.

**What to surface.** Re-trigger Step 3 (the same "list internal accounts" button on
the page) to refresh the balance — there's no separate "show balance" UI. This makes
the cause-and-effect concrete: I called the faucet, the balance went up.

## Step 5 — Register the external destination account

**File:** `app/api/external-accounts/route.ts`
**Endpoint:** `POST /customers/external-accounts`

Body for USD → MXN (CLABE):

```json
{
  "customerId": "<customerId>",
  "currency": "MXN",
  "accountInfo": {
    "accountType": "MXN_ACCOUNT",
    "paymentRails": ["SPEI"],
    "clabeNumber": "002010000000000001",
    "beneficiary": {
      "beneficiaryType": "INDIVIDUAL",
      "fullName": "Beneficiary Name",
      "birthDate": "1990-01-15",
      "nationality": "MX"
    }
  }
}
```

For other corridors, swap `accountType` / `paymentRails` / the rail-specific field
(`iban` for SEPA, `vpa` for UPI, `routingNumber` + `accountNumber` for ACH). See
`references/account-type-cheatsheet.md`.

**Sandbox tip.** The CLABE number's last digit triggers a deterministic outcome:
`...001` succeeds, `...002` fails for insufficient funds, `...003` fails for closed
account. See <https://grid.lightspark.com/api-reference/sandbox-testing> for the
full table (append `.md` for an LLM-friendly version). Use a "good" suffix during
the tutorial; come back later to demo failures.

**Why this step exists.** Grid keeps a registry of beneficiaries per customer. This is
where rail-specific fields (CLABE, IBAN, etc.) get validated. Storing them once makes
subsequent payments much simpler — quotes just reference the external account ID.

## Step 6 — Create the quote

**File:** `app/api/quotes/route.ts`
**Endpoint:** `POST /quotes`

Body:

```json
{
  "source": {
    "sourceType": "ACCOUNT",
    "accountId": "<internalAccountId from step 3>"
  },
  "destination": {
    "destinationType": "ACCOUNT",
    "accountId": "<externalAccountId from step 5>",
    "currency": "MXN"
  },
  "lockedCurrencyAmount": 50000,
  "lockedCurrencySide": "SENDING"
}
```

`50000` cents = $500.00 sending. Grid replies with the receiving amount in MXN, the FX
rate, and the fees. The quote is valid for ~5 minutes — the response includes
`expiresAt`. **Always include `currency` in the destination object even though the
external account already has one** — this is the most common 400 error in the
tutorial.

**Why this step exists.** A quote is a *priced commitment*. It locks the FX rate and
fees so the user can confirm the trade before money moves. Without quotes, you'd be
guessing what the recipient receives.

**What to surface.** Show the rate breakdown:
- `sentAmount` — the source-currency amount that leaves the internal account.
- `receivedAmount` — what lands in the destination, in destination currency units.
- `exchangeRate` — units of destination per unit of source.
- `fees.fixed` + any percentage fees.
- `expiresAt` — emphasize the 5-minute window before step 7.

## Step 7 — Execute the quote

**File:** `app/api/quotes/execute/route.ts`
**Endpoint:** `POST /quotes/{quoteId}/execute`

No body required.

**Why this step exists.** The quote was a commitment; execute kicks off the actual
transfer. Grid debits the internal account, talks to the destination rail, and returns
a `Transaction` object with `status: PROCESSING`. The transfer settles asynchronously.

**What can go wrong here.** `QUOTE_EXPIRED` is the #1 error — if it's been more than 5
minutes since step 6, repeat step 6. Other failures show up later via `Transaction.status`.

## Step 8 — Poll the transaction to completion

**File:** `app/api/transactions/route.ts`
**Endpoint:** `GET /transactions/{transactionId}`

Poll every 2 seconds until `status` is `COMPLETED` or `FAILED`. In sandbox this is
usually within 5-10 seconds.

**Why polling instead of webhooks.** In production you'd handle this with a webhook
(`OUTGOING_PAYMENT` event) — the demo skips that for v1 to avoid needing a tunnel.
If the user wants to add webhooks at the wrap-up, load `references/webhooks-followup.md`.

**What to surface.** Final transaction object with `sentAmount`, `receivedAmount`,
the exchange rate that actually applied, and any per-step trace info. This is the
"you just sent money" moment — celebrate it, then recap what they built.

## After step 8 — recap script

Suggested 5-line wrap-up to deliver in chat:

> You just (1) created a Grid customer, (2) walked through hosted KYC, (3) viewed the
> auto-provisioned internal account, (4) funded it via the sandbox faucet, (5) added a
> beneficiary external account, (6) priced a quote with a locked FX rate, (7) executed
> the transfer, and (8) saw it land. Eight API calls, ~3 minutes of real time. The same
> code works in production with a real-money credential.

Then jump to the wrap-up follow-ups in `SKILL.md`.

## Authoritative deeper docs

- <https://grid.lightspark.com/payouts-and-b2b/quickstart> — narrative version of this flow.
- <https://grid.lightspark.com/api-reference/sandbox-testing> — sandbox magic suffix table.
- Sibling [`grid-api`](https://github.com/lightsparkdev/grid-api/tree/main/.claude/skills/grid-api) skill — for one-off API calls and per-corridor field reference.

Append `.md` to either URL for an LLM-friendly version.
