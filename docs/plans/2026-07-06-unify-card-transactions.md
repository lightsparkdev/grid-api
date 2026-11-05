# Unify card transactions under Incoming/Outgoing (prototype)

## Context

Card transactions were added as a third `TransactionOneOf` variant (`type: CARD`, #622), which surfaced as a third top-level transaction shape in the docs. The team wants to eventually unify every transaction into one structure, so instead of a third type, card activity should be represented with the existing `IncomingTransaction` / `OutgoingTransaction` types. This PR is a **docs/spec prototype** of that shape.

## Approach

Use the extension points the Transaction model already has — the discriminated `source` / `destination` unions — instead of the top-level `type` discriminator:

- A **card purchase** is an `OutgoingTransaction` (`type: OUTGOING`, `direction: DEBIT`) whose `destination` is a new **`CardTransactionDestination`** (`destinationType: CARD`). The merchant *is* the destination of a card payment; all card-specific fields (cardId, merchant, auth/clearing lifecycle, reconciliation aggregates) live there.
- A **standalone merchant credit / return** is an `IncomingTransaction` (`type: INCOMING`, `direction: CREDIT`) whose `source` is a new **`CardTransactionSource`** (`sourceType: CARD`). Ordinary refunds that net against the original purchase stay on the parent outgoing transaction (existing `refund` field + `refundSummary` aggregate).
- `TransactionOneOf` returns to two variants. Top-level `status` uses the existing unified enums; the finer-grained card lifecycle (`AUTHORIZED` / `PARTIALLY_SETTLED` / `SETTLED` / `REFUNDED` / `EXCEPTION`) is preserved as `cardStatus` on the destination, with a documented mapping (AUTHORIZED, PARTIALLY_SETTLED → PROCESSING; SETTLED → COMPLETED; REFUNDED → COMPLETED + refund populated; EXCEPTION → FAILED).
- The standalone `CardTransaction` schema **stays** for the card-scoped endpoints (`/cards/...`, sandbox simulators) — this prototype only removes it from the generic transaction surface. Its `type: CARD` discriminator property and "appears in the Transaction list" language are removed.

**Alternative considered**: an optional `cardDetails` object directly on `OutgoingTransaction`. Simpler, but it adds a nullable side-car field to every transaction and doesn't use the existing source/destination discriminator pattern; the destination approach keeps one structure with pluggable endpoints, which matches the unification goal. Easy to pivot if reviewers prefer it.

## Changes

### 1. `openapi/components/schemas/transactions/TransactionOneOf.yaml`
- **What**: Remove the `CardTransaction` variant and `CARD` mapping — back to `IncomingTransaction` | `OutgoingTransaction`.

### 2. `openapi/components/schemas/transactions/TransactionDestinationType.yaml`
- **What**: Add `CARD` to the enum (`ACCOUNT`, `UMA_ADDRESS`, `CARD`).

### 3. `openapi/components/schemas/transactions/CardTransactionDestination.yaml` (new)
- **What**: `destinationType: CARD` destination following the `AccountTransactionDestination` pattern (`allOf` over `BaseTransactionDestination`).
- **Code sketch**:
  ```yaml
  title: Card Destination
  allOf:
    - $ref: ./BaseTransactionDestination.yaml
    - type: object
      required: [destinationType, cardId, merchant, cardStatus, authorizedAt]
      properties:
        destinationType: {type: string, enum: [CARD]}
        cardId: {type: string}                  # Card:...
        merchant: {$ref: ../cards/CardMerchant.yaml}
        cardStatus: {$ref: ../cards/CardTransactionStatus.yaml}  # fine-grained lifecycle
        issuerTransactionToken: {type: string}
        authorizedAt / lastEventAt: date-time
        settledAmount / refundedAmount: {$ref: ../common/CurrencyAmount.yaml}
        pullSummary / refundSummary / settlementSummary: {$ref: ../cards/Card*Summary.yaml}
      description: documents the cardStatus → top-level status mapping
  ```
  Top-level `OutgoingTransaction.sentAmount` carries the authorized amount; `source` is the funding `AccountTransactionSource` (the account Authorization Decisioning selected).

### 4. `openapi/components/schemas/transactions/TransactionDestinationOneOf.yaml`
- **What**: Add `CardTransactionDestination` + `CARD` mapping.

### 5. `openapi/components/schemas/transactions/TransactionSourceType.yaml`
- **What**: Add `CARD` to the enum.

### 6. `openapi/components/schemas/transactions/CardTransactionSource.yaml` (new)
- **What**: `sourceType: CARD` source for standalone merchant credits/returns; mirrors the destination (cardId, merchant, issuerTransactionToken).

### 7. `openapi/components/schemas/transactions/TransactionSourceOneOf.yaml`
- **What**: Add `CardTransactionSource` + `CARD` mapping.

### 8. `openapi/components/schemas/cards/CardTransaction.yaml`
- **What**: Remove the `type: CARD` discriminator property and the "in the Transaction list" wording; description now says card transactions surface in the generic list as `OUTGOING` with a `CARD` destination, and this shape remains the card-scoped detail view.

### 9. `openapi/paths/transactions/transactions.yaml`
- **What**: Update the list description — card transactions are identified by `destination.destinationType: CARD` on `OUTGOING` transactions (Sandbox discovery flow wording updated to match).

### 10. Regenerate bundles
- **What**: `npm run build:openapi` → `openapi.yaml`, `mintlify/openapi.yaml`.

## Verification
- [ ] `npm run lint:openapi` passes (Redocly bundle + lint, Spectral)
- [ ] Bundled `openapi.yaml` shows `TransactionOneOf` with two variants and `CARD` in both source/destination unions
- [ ] No dangling `type: CARD` discriminator references in the bundle

## Risks
- **This is a docs-only prototype** — the live API still serves `type: CARD` objects (webdev serializer from #622's companion change). Merging this before the backend moves would make the docs wrong; the PR stays draft/prototype until the unified shape is agreed and the backend follows.
- Status-enum coarsening loses `AUTHORIZED` vs `PARTIALLY_SETTLED` distinction at the top level (preserved in `cardStatus`); consumers filtering by card lifecycle must look at the destination.
- Card-scoped endpoints (`/cards/{id}/transactions`, sandbox sims) intentionally keep the richer `CardTransaction` shape — full unification of those is a follow-up.
