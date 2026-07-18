# Fix drift on existing Grid CLI commands

## Context
The hand-written Grid CLI (`cli/`) has drifted from the current OpenAPI spec (`2025-10-13`). This first pass fixes the commands the CLI **already has** so they produce valid requests against today's API — starting point requested in the originating Slack thread. New endpoints/domains (agents, cards, sca, auth, tokens, etc.) are explicitly **out of scope** here.

A field-by-field reconciliation of every implemented command against `openapi/components/schemas/**` surfaced five commands that build **invalid requests today** (real bugs), plus a set of missing/renamed fields and stale response types. Base URL, auth, error parsing, and pagination envelope are already correct — no change needed there.

## Approach
One PR, scoped to correctness of existing commands. Group work as:
1. **Breaking-bug fixes** — commands that currently send invalid bodies/discriminators.
2. **Field drift** — add/rename fields the current schema requires or supports on those same commands (high-value, correctness-adjacent).
3. **Stale response interfaces** — refresh the TS types the CLI declares for responses (output is JSON passthrough, so these are non-breaking but misleading and can break `table` mode / typed access).
4. **Test harness + tests** — the CLI has *no* tests today. Add `vitest` and boundary tests that mock `global.fetch` and assert the constructed request (method/path/body) for each fixed command. This is how we prove "works correctly."

Deferred to explicit follow-ups (noted in PR, not done here): expanding external-account create to all ~37 currency variants + `SWIFT/LIGHTNING/ETHEREUM`, embedded-wallet `Grid-Wallet-Signature` signing, `AgentAuth` bearer, and net-new subcommands (quotes authorize/resend, transactions confirm, customers verify/trust/bulk, accounts get/update/export). These are "new surface," not drift on existing commands.

### Test-boundary decision
The stable boundary for a CLI is: parse argv → build request → call HTTP. Tests drive `program.parseAsync(["node","grid", ...args])` with `global.fetch` stubbed and creds supplied via `GRID_API_TOKEN_ID`/`GRID_API_CLIENT_SECRET` env + `--base-url`, then assert on the captured `fetch(url, init)`. No internal/private functions touched — survives refactor.

## Changes

### 1. `cli/src/commands/customers.ts`
- **What**:
  - `update`: **send `customerType`** (required oneOf discriminator — updates are rejected without it). Add `--type` option; route individual vs business fields under the correct variant. (BUG)
  - `create` business: send required **`incorporatedOn`** (add `--incorporated-on`); currently every business create is rejected. (BUG)
  - Add missing create/update fields: top-level `email`, `phoneNumber`, `region`, `currencies`; individual `nationality`, `idType`+`identifier`; business KYB `entityType`, `businessType`, `doingBusinessAs`, `country`, `purposeOfAccount`, `naicsCode`, `sourceOfFundsCategories`, `sourceOfFunds`, `expectedCounterpartyCountries`, `expectedMonthlyTransactionCount`, `expectedMonthlyTransactionVolume`; address `line2`.
  - `list`: add `--region`, `--currency`, `--created-after/before`, `--updated-after/before`, `--include-deleted`.
  - Only emit the `address` object when required members (`line1`, `postalCode`, `country`) are present.
- **Why**: `update`/`business create` are broken; the rest are schema-supported fields with no CLI surface.
- **Code sketch**:
  ```ts
  // update: discriminator first
  const body: Record<string, unknown> = { customerType: options.type };
  if (options.type === "INDIVIDUAL") { /* fullName, birthDate, nationality, address */ }
  else if (options.type === "BUSINESS") { body.businessInfo = { legalName, taxId, incorporatedOn, ... }; }
  ```

### 2. `cli/src/commands/quotes.ts`
- **What**:
  - Move `purposeOfPayment` from `senderCustomerInfo.PURPOSE_OF_PAYMENT` to the **top-level** `purposeOfPayment` field. (BUG — currently mis-placed)
  - Add `--remittance-information` (top-level, maxLength 80).
  - Add `--payment-rail` on ACCOUNT destination; add `--source-customer` support on ACCOUNT source (`customerId`); add `--crypto-network` on REALTIME_FUNDING source (required for stablecoin funding).
  - Refresh the `Quote` response interface to current `Quote.yaml` (`totalSendingAmount`/`totalReceivingAmount`/`feesIncluded`, currency objects, `transactionId`, `PENDING_AUTHORIZATION`).
- **Why**: purposeOfPayment silently ignored today; other fields are supported and needed for common flows (remittance, stablecoin funding, rail selection).

### 3. `cli/src/commands/transfers.ts`
- **What**: add `--remittance-information` and destination `--payment-rail` to `transfers out` (both on `TransferOutRequest`/`ExternalAccountDestinationReference`). `transfers in` is already correct — no change.
- **Why**: schema-supported top-level fields with no CLI surface.

### 4. `cli/src/commands/sandbox.ts`
- **What** (BUG): `sandbox receive` — rename body fields `amount`→`receivingCurrencyAmount`, `currency`→`receivingCurrencyCode`; make `senderUmaAddress` **required** (schema requires it); add `--customer-id` as an alternative to `--uma-address` (`receiverUmaAddress`). `sandbox send`/`fund` are correct — no change.
- **Why**: `sandbox receive` currently sends two fields that don't exist in the schema and omits a required one — it cannot produce a valid request.

### 5. `cli/src/commands/config.ts`
- **What**: `config update` — add `--supported-currencies` (JSON array of `PlatformCurrencyConfig`) and `--embedded-wallet-config` (JSON object) inputs (accept JSON strings; validate parse). Refresh the `PlatformConfig` interface to match `PlatformConfig.yaml`.
- **Why**: the two core mutable config surfaces (per-currency limits/txn types, embedded-wallet branding/OTP) have no CLI flag today.

### 6. `cli/src/commands/accounts.ts`
- **What**:
  - `external create` (BUG): replace legacy `--account-type` discriminator values with the current currency-suffixed enum — `US_ACCOUNT→USD_ACCOUNT`, `CLABE→MXN_ACCOUNT`, `PIX→BRL_ACCOUNT`, `IBAN→EUR_ACCOUNT`, `UPI→INR_ACCOUNT` (wallet types already correct). Drop the nonexistent NGN `purposeOfPayment` field; fix US `accountCategory`→`bankAccountType` (`CHECKING`/`SAVINGS`). Make `beneficiary` **required** for fiat create; add beneficiary `email`/`phoneNumber`/`countryOfResidence`, business `registrationNumber`/`taxId`, and address `line2`. Add `--swift-code` (EUR), INR non-UPI (`accountNumber`/`ifsc`/`rail`/`bankName`), and top-level `--platform-account-id`/`--default-uma-deposit-account`.
  - `internal list`: add `--type` (`InternalAccountType`); for `--platform`, send only `currency`+`type` (stop sending `limit`/`cursor`/`customerId`, unsupported there).
  - `external list`: for `--platform`, stop sending `customerId` (unsupported).
  - Refresh `InternalAccount`/`ExternalAccount` interfaces to current schema.
- **Why**: 5 of the advertised fiat account types are outright rejected today (dead discriminators); fiat create omits a required `beneficiary`; platform list sends unsupported params.

### 7. `cli/src/commands/transactions.ts` + `cli/src/commands/receiver.ts`
- **What**:
  - `transactions list`: add `--account-identifier`. `approve`: add optional `--receiver-customer-info` (JSON). Refresh the `Transaction` interface (drop `amount`/`currency`/`sender…`/`receiver…`/`reference`; model `source`/`destination` incl. `onChainTransaction`, `receivedAmount`/`sentAmount`, `direction`, `CARD` variant).
  - `receiver lookup-account`: add `--sender-uma`/`--customer-id` query params. Refresh `ReceiverLookup` interface (`lookupId`, `receiverUmaAddress`/`accountId`, `supportedCurrencies` with nested `currency`+`estimatedExchangeRate`+`min`/`max`, `requiredPayerDataFields`).
- **Why**: missing supported params; response interfaces are badly stale (wrong field names + currency shape), which misleads and drops fields in `table` mode.

### 8. `cli/src/validation.ts`
- **What**: remove the hardcoded 13-currency `VALID_CURRENCIES` allowlist (rejects ~24 currencies the API now supports); let the API validate currency codes, keeping only format checks. Remove now-dead `validateCustomerType` if unused after wiring, else keep.
- **Why**: client-side allowlist silently rejects valid, currently-supported currencies — a drift trap.

### 9. `cli/src/client.ts`
- **What**: map `error.details` to the schema's inner `details` object rather than the whole response body.
- **Why**: faithful mapping of the error schema (`{status, code, message, details}`).

### 10. Test harness — `cli/package.json`, `cli/vitest.config.ts` (new), `cli/test/**` (new)
- **What**: add `vitest` devDep + `"test": "vitest run"` script. Add a `runCli(args)` helper that stubs `global.fetch`, sets creds via env, runs `program.parseAsync`, and returns the captured request. One test file per fixed command asserting method/path/body — explicitly covering each BUG fix (customerType on update, incorporatedOn, purposeOfPayment placement, sandbox-receive field names, account-type discriminators, beneficiary required).
- **Why**: no tests exist; TDD requires a failing test first, and these lock the drift fixes.

## Verification
- [ ] `cd cli && npm install && npm run build` — clean TypeScript compile (strict mode).
- [ ] `npm test` — all new boundary tests pass; each BUG fix has a red→green test.
- [ ] Spot-check a captured request body for `quotes create`, `customers update`, `sandbox receive`, `accounts external create` matches the corresponding `openapi/components/schemas/**` request schema.
- [ ] `grid --help` and per-command `--help` render (help text updated for renamed options).

## Risks
- **Renamed options are user-facing breaking changes** (e.g. `--account-type US_ACCOUNT`→`USD_ACCOUNT`). Given these values are *already broken* against the API, changing them is a fix, not a regression — will call out in the PR/README and CLI version bump.
- Scope: exhaustive currency coverage and net-new subcommands are deferred; if the reviewer wants them folded in, that expands the PR substantially.
- `config update`/`approve` taking JSON-string inputs for nested objects is a pragmatic choice for a flag-based CLI; alternative is many granular flags. Noted for redirect.
