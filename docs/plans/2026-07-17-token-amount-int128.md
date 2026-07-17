# TokenAmount: int128 support for Spark-token amounts

## Context

The Grid OpenAPI spec narrows every amount to `format: int64`, but Spark token
amounts (USDB in Embedded Wallets, USDB card settlements, delegated-key
spending limits) are natively `uint128` in the Spark protocol. Underneath the
API, sparkcore already stores/carries these as 16-byte big-endian bytes and
`Decimal`/`NUMERIC(39,0)` — the narrowing happens exactly at the OpenAPI
boundary in this repo.

Peter asked for PRs to fix this (Slack thread `C0BDHBY545Q/1784305080.325469`).
He also confirmed:

- The GraphQL `CurrencyAmount { value: Long! }` in sparkcore is off-limits
  (large blast radius) — this plan does **not** touch that.
- The OpenAPI `CurrencyAmount { amount: int64 }` in this repo is fair game.
- The broader team int64→int128 audit does not cover this spec, so we own it.

Follow-up plan PRs are chained:

1. **This PR (`grid-api`)** — canonical spec change.
2. **webdev** — regenerate the vendored `webdev/grid-api/` Python client from
   the new spec (via `sparkcore/grid-api/update_schema.sh`), plus any
   webdev-side consumers of the changed fields (sparkcore REST handlers that
   serialize CardTransaction, InternalAccount, Quote, etc.).
3. **observatory** — consume the new client types (widen
   `amount_minor_units: int` handling, migrate frontend `number` → `bigint`).

## Approach

**Surgical + typed** — introduce a dedicated `TokenAmount` scalar and a
matching `TokenCurrencyAmount` object; use them **only** on fields that
carry Spark-token amounts. Fiat-only fields stay `format: int64`.

Two new schemas:

```yaml
# openapi/components/schemas/common/TokenAmount.yaml
type: string
pattern: '^[0-9]+$'
description: >-
  A `uint128` base-unit amount encoded as a decimal string. Used for values
  that can exceed the `int64` maximum (9,223,372,036,854,775,807) — most
  commonly Spark-token amounts in Embedded Wallets, where an on-chain
  `uint128` amount is expressed in the token's smallest base unit. Consumers
  MUST parse this as an arbitrary-precision integer (e.g. `bigint` in
  TypeScript, `int` in Python, `BigInteger` in Java/Kotlin, `Decimal` /
  `NUMERIC(39,0)` in SQL) — parsing as a JS `number` will silently truncate
  above 2^53. The value never carries a decimal separator or sign.
example: "123010000000000000"
```

```yaml
# openapi/components/schemas/common/TokenCurrencyAmount.yaml
type: object
description: >-
  A currency-tagged amount that can hold values larger than `int64`. Mirrors
  `CurrencyAmount` but with the value encoded as a `TokenAmount` (uint128
  decimal string). Used wherever an amount may be denominated in a
  Spark-token currency (e.g. USDB) whose smallest-unit value may exceed
  `int64`.
required:
  - amount
  - currency
properties:
  amount:
    $ref: ./TokenAmount.yaml
  currency:
    $ref: ./Currency.yaml
```

For fields that today carry a `$ref: CurrencyAmount.yaml` and may denominate
in a Spark token, we swap the ref for a discriminated union:

```yaml
oneOf:
  - $ref: ../common/CurrencyAmount.yaml       # fiat / sats (int64)
  - $ref: ../common/TokenCurrencyAmount.yaml  # Spark token (uint128 string)
```

For scalar `type: integer, format: int64` fields on the same objects (e.g.
`Quote.totalSendingAmount`, `ExchangeRate.sendingAmount`) we widen to a
scalar `oneOf`:

```yaml
oneOf:
  - type: integer
    format: int64
    minimum: 0
  - $ref: ../common/TokenAmount.yaml
```

For fields that are **only ever** Spark-token amounts (currently the card
summaries and the delegated-key spending limit — all denominated in USDB in
v1), we swap directly to `TokenAmount` — no `oneOf` needed.

Rejected alternatives (documented briefly for the reviewer):

- **Option 1 — widen `CurrencyAmount.amount` to `string`**: uniform, but
  breaks every fiat client that decodes into an int typed field (Kotlin
  `Long`, Swift `Int64`, Go `int64`). Not surgical enough for the scope Peter
  authorized.
- **Option 3 — sibling `fiatAmount` / `tokenAmount` fields**: cleanest for
  strict-JSON consumers but requires renaming `amount` on 20+ objects and
  every existing example — a much larger diff for no schema clarity gain
  over `oneOf`. And `openapi-generator` still emits an anyOf-style
  Python union for it anyway.
- **Keep `int64` and use `maximum`**: silent lossy narrowing already burned
  us (see the treasury snapshot overflow memory: `A treasury snapshot int64
  overflow was traced to a ~7e32 USDB junk dev mint…`). Not viable.

**Version + servers URL**: this is a breaking wire-format change on shared
fields (`InternalAccount.balance`, `Quote.totalSendingAmount`, etc.), so
per repo `CLAUDE.md` we bump `info.version` and `servers.url` to a new
date (e.g. `2026-07-17`). Existing clients pinned to `2025-10-13` keep the
old int64 shape until they migrate. This preserves the docs.lightspark.com
compatibility contract.

## Relevant Knowledge

From `bolt-memory recall`:

- **"Spark-token amounts are stored as uint128/bigint in proto bytes,
  NumericField precision 39 scale 0 in storage, and Decimal on GraphQL read
  surfaces; Python decodes them with `int.from_bytes(..., 'big')`."** — this
  is the pattern we're aligning the OpenAPI surface with.
- **"A customer's embedded USDB Spark wallet in webdev grid is an
  `EntGridInternalAccount` with currency USDB and account_type
  `EMBEDDED_WALLET`."** — confirms `InternalAccount.balance` on an
  `EMBEDDED_WALLET` is the Spark-token amount site.
- **"A treasury snapshot int64 overflow was traced to a ~7e32 USDB junk dev
  mint…"** — demonstrates the overflow already caused a real production
  incident.
- **"The vendored OpenAPI client should not be fully synced to spec head
  blindly because webdev's openapi.yaml can drift ahead of the generated
  client and spec head may remove endpoints still needed by sparkcore.
  The recommended approach is a surgical regen…"** — informs the webdev
  follow-up plan (splice, don't full-regen).

## Changes

### 1. `openapi/components/schemas/common/TokenAmount.yaml` (new)

- **What**: New scalar schema, string-encoded uint128, per snippet in
  Approach above.
- **Why**: Wire representation that survives the int64 ceiling. Widely
  supported (Stripe, Ethereum JSON-RPC, etc. all encode large integers
  as decimal strings).

### 2. `openapi/components/schemas/common/TokenCurrencyAmount.yaml` (new)

- **What**: Object schema mirroring `CurrencyAmount` with `amount:
  TokenAmount` and `currency: Currency`.
- **Why**: Symmetry with `CurrencyAmount` for currency-tagged spots (balance
  fields, card summaries).

### 3. `openapi/components/schemas/customers/InternalAccount.yaml`

- **What**: Change `balance` and `totalBalance` from
  `$ref: CurrencyAmount.yaml` to `oneOf: [CurrencyAmount,
  TokenCurrencyAmount]`.
- **Why**: An `EMBEDDED_WALLET` internal account's balance is a Spark-token
  amount (uint128); a fiat account's balance stays int64. The current single
  ref silently narrows Spark balances at the wire.
- **Code sketch**:
  ```yaml
  balance:
    oneOf:
      - $ref: ../common/CurrencyAmount.yaml
      - $ref: ../common/TokenCurrencyAmount.yaml
    description: >-
      The balance available to spend, excluding pending and held funds.
      `TokenCurrencyAmount` is returned when the account holds a
      Spark-token currency (e.g. USDB) whose smallest-unit value may
      exceed `int64`; `CurrencyAmount` is returned for fiat/sats
      denominations.
  totalBalance: (same treatment)
  ```

### 4. `openapi/components/schemas/quotes/Quote.yaml`

- **What**: Change three scalar amount fields from `type: integer, format:
  int64` to `oneOf: [{int64}, TokenAmount]`. Fields:
  `totalSendingAmount`, `totalReceivingAmount`, `feesIncluded`.
- **Why**: A quote sourced from or destined to an Embedded Wallet holding a
  Spark token can carry a uint128 base-unit amount. The current int64 is
  wrong for those quotes.
- **Code sketch**:
  ```yaml
  totalSendingAmount:
    oneOf:
      - type: integer
        format: int64
        exclusiveMinimum: 0
      - $ref: ../common/TokenAmount.yaml
    description: >-
      The total amount that will be sent in the smallest unit of the
      sending currency. Encoded as an int64 when the sending currency
      is fiat/sats, or as a `TokenAmount` decimal string when the
      sending currency is a Spark token whose value may exceed int64.
    example: 123010
  ```

### 5. `openapi/components/schemas/quotes/QuoteRequest.yaml`

- **What**: Change `lockedCurrencyAmount` (currently `int64, maximum:
  9000000000000000`) to the same `oneOf` as above; drop the `maximum` on
  the int64 branch — it's redundant once we allow a TokenAmount override.
- **Why**: Symmetric with `Quote`. A request to send a specific amount from
  an Embedded Wallet Spark-token account must be able to carry uint128.

### 6. `openapi/components/schemas/exchange_rates/ExchangeRate.yaml`

- **What**: Change `sendingAmount`, `minSendingAmount`, `maxSendingAmount`,
  `receivingAmount` to `oneOf: [{int64}, TokenAmount]`.
- **Why**: Rate lookups against a Spark-token corridor must produce
  uint128-safe bounds. Same rationale as Quote.

### 7. `openapi/components/schemas/exchange_rates/ExchangeRateFees.yaml`

- **What**: Change `fixed` and `total` to `oneOf: [{int64}, TokenAmount]`.
- **Why**: Fee denomination follows the sending currency; Spark-token
  corridors need uint128.

### 8. `openapi/components/schemas/transactions/IncomingTransaction.yaml`

- **What**:
  - `receivedAmount`: change from `$ref: CurrencyAmount.yaml` to `oneOf:
    [CurrencyAmount, TokenCurrencyAmount]`.
  - `fees`: change from `int64` scalar to `oneOf: [{int64}, TokenAmount]`.
- **Why**: The receiver can be a Spark-token Embedded Wallet.

### 9. `openapi/components/schemas/transactions/OutgoingTransaction.yaml`

- **What**: Same treatment as IncomingTransaction for `sentAmount`,
  `receivedAmount`, `fees`.

### 10. `openapi/components/schemas/transactions/IncomingRateDetails.yaml`

- **What**: Change `gridApiFixedFee` and `gridApiVariableFeeAmount` scalar
  int64 to `oneOf: [{int64}, TokenAmount]`. Note the existing bug on
  `gridApiVariableFeeAmount` (`type: number, format: int64` — the union
  of number+int64 is semantically wrong) — this refactor fixes it by
  using the scalar `oneOf` form.

### 11. `openapi/components/schemas/transactions/OutgoingRateDetails.yaml`

- **What**: Same treatment for `counterpartyFixedFee`, `gridApiFixedFee`,
  `gridApiVariableFeeAmount`. Same `type: number, format: int64` bug fix
  for the variable-fee field.

### 12. `openapi/components/schemas/cards/CardPullSummary.yaml`

- **What**: Change `totalAmount` from `int64` scalar to `$ref:
  ../common/TokenAmount.yaml` **directly** (no oneOf — card funding sources
  are USDB in v1 per the `DelegatedKeySpendingLimit` description and the
  `funding_sources` description on CardCreateRequest).
- **Why**: `CardPullSummary.totalAmount` is always denominated in the card's
  funding currency, and every currently supported card is Spark-token
  (USDB). Direct swap is the smallest correct change.

### 13. `openapi/components/schemas/cards/CardRefundSummary.yaml`

- **What**: Same treatment as CardPullSummary.

### 14. `openapi/components/schemas/cards/CardSettlementSummary.yaml`

- **What**: Same treatment.

### 15. `openapi/components/schemas/cards/CardTransaction.yaml`

- **What**: Change `authorizedAmount`, `settledAmount`, `refundedAmount`
  from `$ref: CurrencyAmount.yaml` to `oneOf: [CurrencyAmount,
  TokenCurrencyAmount]`. (Union rather than direct swap because
  `authorizedAmount` can be a fiat merchant amount pre-conversion in
  future non-USDB card programs; the summaries are always in the funding
  currency and stay TokenAmount-only.)

### 16. `openapi/components/schemas/auth/DelegatedKeySpendingLimit.yaml`

- **What**: Change `maxPerTransaction` from `int64` scalar to `$ref:
  ../common/TokenAmount.yaml` directly.
- **Why**: The existing description explicitly names USDB as the target
  currency: "Uppercase alphanumeric currency code the limit applies to —
  ISO 4217 for fiat (e.g. USD), or a Grid token code for stablecoins (e.g.
  USDB). Must match the card's currency…" — cards are USDB-funded in v1.

### 17. `openapi/components/schemas/agents/AgentTransferDetails.yaml`

- **What**: Change `amount` scalar int64 to `oneOf: [{int64}, TokenAmount]`.
- **Why**: Agent-driven transfers can source from Embedded Wallets holding
  Spark tokens.

### 18. `openapi/components/schemas/transfers/TransferInRequest.yaml`, `TransferOutRequest.yaml`

- **What**: Change `amount` scalar int64 to `oneOf: [{int64}, TokenAmount]`.
- **Why**: Same-currency transfers can be to/from Embedded Wallets on Spark
  tokens.

### 19. `openapi/components/schemas/sandbox/*.yaml`

- **What**: For `SandboxFundRequest.yaml`, `SandboxSendRequest.yaml`,
  `SandboxUmaReceiveRequest.yaml`, change amount fields to the same
  `oneOf: [{int64}, TokenAmount]` shape. These parallel the real
  request/response types.

### 20. `openapi/components/schemas/config/PlatformCurrencyConfig.yaml` and `invitations/UmaInvitation*.yaml`, `receiver/CurrencyPreference.yaml`

- **What**: Audit each. These reference `CurrencyAmount` but are used for
  **configuration limits** and **UMA lookup previews**, not runtime
  balances. Verify per file whether the value can denominate in a Spark
  token; only migrate the ones that can (details in the exploration
  section of this doc).
- **Why**: Config/limit fields for USDB corridors do carry Spark-token
  smallest-unit amounts and can overflow int64 in principle. UMA lookup
  previews typically hit only real currencies. Concrete decisions land
  during implementation.

### 21. `openapi/openapi.yaml` and `openapi.yaml` (bundle)

- **What**:
  - Register the two new component schemas so they appear in the bundled
    spec (top-level `components/schemas/TokenAmount` and
    `TokenCurrencyAmount`).
  - Bump `info.version` from `"2025-10-13"` to `"2026-07-17"` (or a
    reviewer-selected date).
  - Add a matching `servers.url` entry pointing at the new date-suffixed
    path if the repo uses dated server URLs (grep confirms — the current
    `2025-10-13` is embedded in the servers URL).
  - Run `make build` to regenerate the bundled root `openapi.yaml` and
    `mintlify/openapi.yaml`. Do **not** hand-edit the bundle.

### 22. Docs

- **What**: One narrative page in `mintlify/` explaining `TokenAmount`
  encoding, parsing pitfalls (JS `number` truncation above 2^53), and
  which fields switched to the `oneOf` shape. Link from the migration
  guide for `2026-07-17`.

## Verification

- [ ] `make build` runs clean; regenerated `openapi.yaml` diff is only the
      new schemas + the field-level `oneOf`/`$ref` changes + the version bump.
- [ ] `make lint` (spectral + markdown) passes with no new warnings.
      Existing operation-id/security lint budget is preserved.
- [ ] `cd mintlify && mint openapi-check openapi.yaml` returns no errors.
- [ ] For every changed field, hand-check the surrounding YAML — description
      still reads well after the `oneOf` swap; examples still valid; nested
      `allOf` in Transaction subtypes still resolves.
- [ ] Generate one language sample (Python via `openapi-generator-cli 7.22.0`)
      into `/tmp/grid_api_sample/` and confirm:
      - `InternalAccount.balance` is typed as
        `Union[CurrencyAmount, TokenCurrencyAmount]`
      - `TokenAmount` renders as `StrictStr` with the regex
      - `Quote.totalSendingAmount` accepts both `int` and `str` on
        construction and on `from_dict`.
- [ ] Confirm the `.openapi-generator-ignore` file does not gate any of
      the newly generated files out.
- [ ] Post the S3-archived plan link on the implementation PR before publish.

## Risks

- **Client-side breakage on migration**: Any client that decodes
  `InternalAccount.balance.amount` into a strictly-typed `Long` / `Int64`
  field will fail when the server returns a `TokenCurrencyAmount` string.
  Mitigation: the dated servers URL bump means clients opt in when they
  upgrade; the docs page explains the discriminator.
- **openapi-generator quirks on `oneOf` scalars**: some generators emit
  `Union[int, str]` cleanly, others degrade to `Any`. We verify the
  Python generator (the only vendored client) explicitly in Verification.
  If the Kotlin/Go generators are affected, we escalate to Peter — this
  plan does not commit to fixing every downstream generator.
- **Card-summary direct swap (not oneOf) forecloses non-USDB card
  funding**: v1 is USDB only. If the platform ever ships a fiat-funded
  card program, `CardPullSummary.totalAmount` etc. would need to move to
  the union shape. Documented in the field description as a v1 constraint.
- **`type: number, format: int64` bug on
  `gridApiVariableFeeAmount`**: fixing this while we're here is
  in-scope but is technically a separate wire-format correction —
  reviewers may want to split it into its own PR. Easy to peel out if so.
- **Docs drift**: bundled `openapi.yaml` at the repo root is generated;
  any accidental hand-edit here will be clobbered by `make build`. All
  changes go through `openapi/`.
