# Refund destination as a source external account

## Context

PR #736 (Bitcoin L1 payment instruction, merged 2026-07-30) originally added a free-text
`refundAddress` to `RealtimeFundingQuoteSource` and `AccountDestination`. Both were pulled
before merge and deferred to a follow-up. This is that follow-up.

@jklein24's review, [thread `r3686228352`](https://github.com/lightsparkdev/grid-api/pull/736#discussion_r3686228352):

> I'm wondering if it might be good to use an external account here for whitelisting and
> compliance reasons. We have a status field on external accounts that lets us approve
> things ahead of time, etc.

and later in that thread, per the linked Slack discussion: *"frame this as a source external
account… we'll need to validate that these are 1P wallets in some cases."* @peterrojs chose
option (b) — hold the raw field, model it properly in a follow-up.

The destination-side field is *not* coming back. [Thread `r3670181155`](https://github.com/lightsparkdev/grid-api/pull/736#discussion_r3670181155)
settled that: a failed crypto payout refunds to a Grid-controlled address Grid already knows,
and `AccountDestination` also covers fiat accounts where a refund *address* is meaningless.
@jklein24: *"Why is this inside of the destination object?"*

## Approach

Add `refundAccountId` to `RealtimeFundingQuoteSource` — a reference to an existing
`ExternalAccount`, not an address string. The refund target then inherits everything an
external account carries: `status` (`PENDING`/`ACTIVE`/`UNDER_REVIEW`/`INACTIVE`) for
pre-approval, the trust/untrust confirm flow under
`/customers/external-accounts/{id}/trust|untrust`, and beneficiary verification
(`beneficiaryVerificationStatus`) for the 1P-wallet checks Jeremy flagged. A free-text
address bypasses all of it.

Rationale for the specific shape:

- **A plain `accountId` string, not a `$ref` to a reference object.** `AccountQuoteSource`
  and `AccountDestination` both take a bare `accountId: string`. Matching that keeps the
  quote schemas uniform. `transfers/ExternalAccountReference.yaml` exists but is a
  request-body *root* schema for `/transfer-in`, not an embedded field idiom.
- **Named `refundAccountId`, not `refundAddress` or `refundExternalAccountId`.** The `-AccountId`
  suffix matches `accountId`/`customerId` elsewhere, and the name no longer implies a raw
  address. Alternative considered: keep `refundAddress` as a deprecated alias — rejected,
  nothing shipped it, so there is nothing to alias.
- **Optional, with a documented fallback chain.** Grid falls back to the customer's internal
  account for that asset. When there is neither a refund account nor an internal account to
  fall back on — the no-custody passthrough case — quote creation is rejected rather than
  accepting a deposit it cannot unwind. That rejection is currently undocumented behavior;
  this plan surfaces it as a real `400` code.
- **`BITCOIN_L1` external-account type.** Without it a BTC L1 refund target cannot be
  expressed at all. Every other crypto corridor (`BASE_WALLET`, `ETHEREUM_WALLET`,
  `PLASMA_WALLET`, `POLYGON_WALLET`, `SOLANA_WALLET`, `SPARK_WALLET`, `TRON_WALLET`) already
  has a member, so this is the only new type needed.

Not doing: any `AccountDestination` field (settled), and no change to how refunds are
*derived* when no refund account is given — "in most cases we can get that from the
transaction" stays true and stays server-side.

## Relevant Knowledge

- Bundle conflicts resolve by `make build` — never hand-merge `openapi.yaml` /
  `mintlify/openapi.yaml`.
- **Adding a component schema requires a matching `.stainless/stainless.yml` model entry**,
  or the `preview` SDK-build check fails.
- `Detect breaking changes` (oasdiff) will flag `request-property-added` /
  `response-property-one-of-added` here. Adding an enum value to a shared type propagates to
  every member inheriting it: `ExternalAccountType` is referenced through
  `BaseExternalAccountInfo`, so the blast radius is every external-account member's
  `accountType`. #736 already took the equivalent hit on `PaymentAccountType` (`BITCOIN_L1`
  landed there, `common/PaymentAccountType.yaml:30`), so this is a known-shape finding.
- `common/*WalletInfo.yaml` schemas are **not** registered in `.stainless/stainless.yml`
  (neither `EthereumWalletInfo` nor `SparkWalletInfo` appears there) — they are hoisted into
  the bundle by redocly and consumed through `allOf`, so only the
  `*ExternalAccountInfo` wrapper needs a model entry.
- oasdiff against a stale base produces bogus breaking findings — rebase before trusting it.
- Bolt pushes do not always trigger this repo's `pull_request` OpenAPI workflows; verify the
  runs are attached to the actual head commit rather than trusting a green rollup.
- Server side for context (no change here): `EntGridOrchestraSettlementInfo` already carries
  `refund_address` + `RefundAddressOwner` on the source chain, so a caller-supplied refund
  account maps onto an existing column rather than needing new provider state.

## Changes

### 1. `openapi/components/schemas/quotes/RealtimeFundingQuoteSource.yaml`

- **What**: add an optional `refundAccountId` property.
- **Why**: the one place the refund target genuinely cannot be inferred — an inbound on-chain
  deposit whose sender Grid cannot derive.
- **Code sketch**:
  ```yaml
        refundAccountId:
          type: string
          description: >-
            External account the funds are returned to if an on-chain deposit cannot be
            routed to complete the payment. Must be an existing external account belonging
            to `customerId` whose `currency` and network match the funding source, and whose
            `status` is `ACTIVE`. Only meaningful when `currency` is a crypto asset.

            If omitted, funds are returned to the customer's internal account for that
            asset. When the customer has no internal account to fall back on, quote
            creation fails with `REFUND_DESTINATION_REQUIRED` rather than accepting a
            deposit that cannot be returned.
          example: ExternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965
  ```

### 2. `openapi/components/schemas/common/BitcoinWalletInfo.yaml` (new)

- **What**: the shared BTC L1 address shape, mirroring `EthereumWalletInfo.yaml`.
- **Why**: `common/` holds the address shape so both the external-account member and any
  future payment-instruction member reuse it — the established pattern for every other chain.
- **Code sketch**:
  ```yaml
  type: object
  required:
    - address
    - accountType
  properties:
    accountType:
      type: string
      enum:
        - BITCOIN_L1
    address:
      type: string
      description: Bitcoin (L1) on-chain address
      example: bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq
  ```

### 3. `openapi/components/schemas/external_accounts/BitcoinWalletExternalAccountInfo.yaml` (new)

- **What**: the external-account oneOf member.
- **Why**: makes a BTC L1 address a first-class, whitelistable external account.
- **Code sketch**:
  ```yaml
  title: Bitcoin L1 Wallet
  allOf:
    - $ref: ./BaseExternalAccountInfo.yaml
    - $ref: ../common/BitcoinWalletInfo.yaml
  ```

### 4. `openapi/components/schemas/external_accounts/ExternalAccountType.yaml`

- **What**: add `BITCOIN_L1` to the enum.
- **Why**: the discriminator value for the new member.

### 5. `openapi/components/schemas/external_accounts/ExternalAccountInfoOneOf.yaml`

- **What**: add the `$ref` and the `BITCOIN_L1` discriminator mapping entry.
- **Code sketch**:
  ```yaml
  - $ref: ./BitcoinWalletExternalAccountInfo.yaml
  # …
      BITCOIN_L1: ./BitcoinWalletExternalAccountInfo.yaml
  ```

### 6. `openapi/components/schemas/external_accounts/ExternalAccountCreateInfoOneOf.yaml`

- **What**: same two additions on the create side.
- **Why**: the other wallet types reuse their `*ExternalAccountInfo.yaml` for create (no
  separate `*CreateInfo` file), so this member follows suit — otherwise the type exists but
  cannot be created.

### 7. `openapi/components/schemas/errors/Error400.yaml`

- **What**: add `REFUND_DESTINATION_REQUIRED` to the code table and the `enum`.
- **Why**: makes the rejection path documented API surface instead of a surprise. Both the
  markdown table and the enum list need the entry — they are maintained in parallel in this
  file.
- **Code sketch**:
  ```yaml
  | REFUND_DESTINATION_REQUIRED | The crypto funding source has no refund destination and the customer has no internal account for that asset; supply `source.refundAccountId` |
  # …and in the enum list:
      - REFUND_DESTINATION_REQUIRED
  ```

### 8. `openapi/paths/quotes/quotes.yaml`

- **What**: extend the existing `realTimeFundingToSparkWallet` request example with
  `refundAccountId`, and note the new `400` code in the `400` response description.
- **Why**: the request example is the only place a caller sees a realtime-funding source
  populated end-to-end.

### 9. `.stainless/stainless.yml`

Two edits, both for `BitcoinWalletExternalAccountInfo`. `common/BitcoinWalletInfo.yaml` gets
no entry — no `common/*WalletInfo` schema is registered.

- **9a — model entry** under `resources.customers.subresources.external_accounts.models`,
  alongside the other wallet members (`spark_wallet_info` … `base_wallet_info`, lines
  198–204):
  ```yaml
          bitcoin_wallet_info: '#/components/schemas/BitcoinWalletExternalAccountInfo'
  ```
  Not the `$shared.models` block: `ethereum_wallet_external_account_info` (line 482) sits
  there as a one-off, while every other wallet uses the `external_accounts` block. Follow the
  majority.
- **9b — `allOf[0]` strip target** in the existing *"Remove $ref to BaseExternalAccountInfo
  from external account variants"* transform (the list ending at line 937):
  ```yaml
          - "$.components.schemas.BitcoinWalletExternalAccountInfo.allOf[0]"
  ```
- **Why**: an unregistered component schema fails the `preview` SDK-build check, and a member
  left `allOf`-inheriting `BaseExternalAccountInfo` breaks the TS build once the transform
  strips `accountType` off that base, leaving it an empty object (TS2312).

### 10. `openapi.yaml` + `mintlify/openapi.yaml` (generated)

- **What**: regenerate via `make build`. Never hand-edited.

### Not changing

- `openapi/components/schemas/quotes/AccountDestination.yaml` — settled in #736.
- `info.version` — every change here is additive, so no version bump and no new
  `servers.url` path.

## Verification

- [ ] `make build` — bundles regenerate; re-run and confirm byte-identical (no drift).
- [ ] `make lint-openapi` — redocly bundle + redocly lint + spectral, 0 errors.
- [ ] `git diff --stat` on the bundles shows only the intended additions.
- [ ] Grep both bundles for `refundAccountId`, `BITCOIN_L1`, and
      `REFUND_DESTINATION_REQUIRED` — each present, and `refundAddress` absent everywhere.
- [ ] Confirm the `BITCOIN_L1` discriminator mapping resolves in the bundled
      `ExternalAccountInfoOneOf` (both the oneOf list and the mapping).
- [ ] CI: `Detect breaking changes`, both `Lint Code & Documentation` jobs, both
      `Build OpenAPI Documentation` jobs, `preview` (SDK builds), `Mintlify Deployment`.
      Verify the runs are attached to the actual head SHA — bolt pushes do not reliably
      trigger `pull_request` workflows in this repo.
- [ ] `bolt-codex-review` before opening the PR.

No tests: documentation/spec-only repo with no application code. Lint + bundle-drift +
the SDK preview build are the executable checks.

## Risks

- **`breaking-change` label expected.** `request-property-added` on the quote source and
  `response-property-one-of-added` for the new external-account member. Both additive, no
  removals — the same shape #736 shipped with, gated on API-reviewer approval.
- **`ExternalAccountType` enum growth propagates** to `accountType` on every member
  inheriting `BaseExternalAccountInfo`, so expect a wide-but-shallow oasdiff warning list —
  the same shape #736 produced when `BITCOIN_L1` landed on `PaymentAccountType`. If the
  breaking-changes comment overflows again, the fix is the comment-bounding already merged in
  #736, not a schema retreat.
- **The `preview` SDK build fails if `.stainless/stainless.yml` and the schema set disagree.**
  `BitcoinWalletExternalAccountInfo` needs both the model entry and the `allOf[0]` strip
  target; missing the latter surfaces as a TS2312 build error rather than a config error.
- **Server side does not implement this yet.** The spec would describe `refundAccountId` and
  `REFUND_DESTINATION_REQUIRED` ahead of sparkcore honoring them. Worth confirming with
  @peterrojs whether the spec should lead (it did for `BITCOIN_L1`) or land alongside the
  server change.
- **Open design questions from the #736 thread that this plan takes a position on**, and
  which reviewers may want to redirect:
  1. Whether the refund target is caller-supplied at all, versus always derived from the
     transaction. This plan makes it optional-with-fallback, which supports both.
  2. Whether an L1 address should be a first-class external account. This plan says yes, on
     the grounds that it is the only way to get whitelisting and 1P verification onto it.
  3. Which regions require 1P verification — left to `beneficiaryVerificationStatus` and
     server policy rather than encoded in the schema.
