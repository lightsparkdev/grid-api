# KYC Onboarding Flow for the Grid API Sample — Design

**Date:** 2026-07-21
**Status:** Approved approach (A) — hosted KYC link, new sidebar flow

## Goal

Add a "KYC Onboarding" flow to the sample app (`samples/`) demonstrating the hosted
KYC link integration: create a customer, generate a hosted verification link, and
track the customer's `kycStatus` to a terminal state via both polling and webhooks.

## Background

The sample app is a React step-wizard frontend (`samples/frontend`) backed by a
Kotlin (Ktor) proxy (`samples/kotlin`) that calls the Grid API via the Kotlin SDK
(`com.lightspark.grid:lightspark-grid-kotlin:1.7.1`). Webhook events from Grid are
already streamed to the browser via SSE and shown in the `WebhookStream` panel.

The Grid API's hosted KYC flow is two calls:

1. `POST /customers` — create the customer (`kycStatus` starts `PENDING`).
2. `POST /customers/{customerId}/kyc-link` — returns a single-use `kycUrl`,
   `expiresAt`, `provider`, and (for SUMSUB) an SDK `token`.

The customer completes verification at `kycUrl`; status changes arrive as
`CUSTOMER.KYC_PENDING` / `CUSTOMER.KYC_APPROVED` / `CUSTOMER.KYC_REJECTED` webhooks
and are readable at any time via `GET /customers/{customerId}`.

The Kotlin SDK 1.7.1 exposes both operations: `customers().getKycLink(...)` and
`customers().retrieve(...)`.

## Design

### Frontend (`samples/frontend`)

New flow `src/flows/KycOnboardingFlow.tsx`, registered in `App.tsx` (`FLOW_META`)
and `components/Sidebar.tsx` with key `kyc-onboarding`, title "KYC Onboarding",
subtitle along the lines of "Verify a customer's identity with a hosted KYC link".

Three steps, following the existing `StepWizard` pattern:

1. **Create Customer** — reuses the existing `steps/CreateCustomer.tsx` component
   unchanged.
2. **Generate KYC Link** — new `steps/CreateKycLink.tsx`. Editable JSON body
   defaulting to `{ "redirectUri": "http://localhost:5173/onboarding-complete" }`.
   Calls `POST /api/customers/{id}/kyc-link`. On success renders:
   - `kycUrl` as a clickable link (opens in a new tab),
   - `provider`, `expiresAt`, and `token` (when present) in the response panel,
   - helper text: the link is single-use; re-run the step to mint a fresh one.
3. **Track KYC Status** — new `steps/CheckKycStatus.tsx`. A "Refresh Status"
   button calls `GET /api/customers/{id}` and renders the current `kycStatus` as a
   colored badge (`PENDING` amber, `APPROVED` green, `REJECTED`/`HOLD` red,
   `UNVERIFIED` gray) plus the full customer JSON. Helper text points at the
   WebhookStream panel, where `CUSTOMER.KYC_*` events appear live. The step (and
   the flow) completes when a terminal status (`APPROVED`/`REJECTED`) is observed;
   refreshing remains available regardless.

`src/lib/api.ts` already provides `apiGet` and `apiPost`; no changes needed there.

### Backend (`samples/kotlin`)

Two new routes following the existing pattern in `routes/Customers.kt`
(receive JSON → build SDK params → log request/response → return pretty JSON):

- `POST /api/customers/{id}/kyc-link` — optional body with `redirectUri`; calls
  `customers().getKycLink(...)`; returns the SDK response (201).
- `GET /api/customers/{id}` — calls `customers().retrieve(...)`; returns the
  customer JSON (200).

Both live in `routes/Customers.kt` alongside the existing create route. Errors
follow the existing pattern: log via `Log.gridError` and return
`{"error": "..."}` with a 500 (the Grid error message passes through verbatim,
so a 409 for required contact verification is visible to the user).

### Docs

`samples/README.md` API-contract table gains:

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/customers/{id}/kyc-link` | Generate a hosted KYC link |
| GET  | `/api/customers/{id}` | Get a customer (incl. `kycStatus`) |

### Out of scope

- **Contact verification** (`verify-email` / `verify-phone`). The default sample
  customer is US-based and does not require it. If Grid returns the 409, the step
  surfaces the error message verbatim — that is the intended behavior.
- **API-driven verification** (`POST /verifications`, beneficial owners,
  documents / KYB). A candidate follow-up flow.
- **Embedding the SUMSUB SDK** via the returned `token` — the sample links out to
  the hosted URL only, but displays the token so developers can see it exists.

## Error handling

- Backend passes Grid API error messages through to the frontend (existing
  pattern); the frontend `ResponsePanel` already renders errors.
- The KYC link being single-use/expired is handled by re-running step 2.
- A missed webhook does not dead-end the flow: step 3's polling always works.

## Testing

- Manual: run the Kotlin backend + Vite frontend against sandbox, walk the flow,
  open the `kycUrl`, and confirm the status badge and webhook events update.
- The existing Playwright e2e (`e2e/payout-flow.spec.ts`) is untouched. A new e2e
  spec is not included: completing the hosted provider flow is an external
  interaction that can't be automated reliably from the sample. Step-level
  behavior (link rendered, status refresh) is verified manually.
