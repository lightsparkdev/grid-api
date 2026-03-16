# Webhook Schema Design

**Date:** 2026-02-23
**Status:** Approved

## Problem

Current webhook schemas are inconsistent:
- Payment webhooks embed full `Transaction` objects under a `transaction` key
- KYC and account webhooks use flat fields at the top level
- Bulk upload uses `bulkCustomerImportJob` as its key
- Invitation embeds full `UmaInvitation` under `invitation`
- The `type` field (e.g., `OUTGOING_PAYMENT`) doesn't distinguish between status transitions — consumers must inspect nested fields

## Design Decisions

### 1. Consistent envelope

Every webhook follows this structure:

```json
{
  "id": "Webhook:019542f5-...",
  "type": "OUTGOING_PAYMENT.COMPLETED",
  "timestamp": "2025-08-15T14:32:00Z",
  "data": { ... }
}
```

| Field | Description |
|---|---|
| `id` | Unique webhook delivery ID (for idempotency). Renamed from `webhookId`. |
| `type` | Status-specific event type in `OBJECT.EVENT` dot-notation (e.g., `OUTGOING_PAYMENT.COMPLETED`) |
| `timestamp` | ISO 8601 timestamp of when the webhook was sent |
| `data` | The resource object — always under `data`, never varying keys |

### 2. Full resource embed (Stripe-style)

`data` contains the **full resource object** as the corresponding GET endpoint would return it. This eliminates the need for consumers to make follow-up API calls.

This is viable because Grid plans to implement API versioning, which will allow resource schemas to evolve without breaking webhook consumers.

### 3. Status-specific event types

Each status transition gets its own type in `OBJECT.EVENT` dot-notation. The part before the dot identifies the resource, the part after identifies the event. This lets consumers route purely on `type` without inspecting `data.status`, and also enables wildcard subscriptions (e.g., `OUTGOING_PAYMENT.*`).

## Webhook Type Catalog

### Transaction webhooks

`data` = full transaction object (same as `GET /transactions/{id}`)

| Type | When fired | Notable fields in data |
|---|---|---|
| `OUTGOING_PAYMENT.COMPLETED` | Outgoing payment settles successfully | `sentAmount`, `receivedAmount`, `exchangeRate`, `rateDetails` |
| `OUTGOING_PAYMENT.FAILED` | Outgoing payment fails | `failureReason` |
| `OUTGOING_PAYMENT.REFUNDED` | Outgoing payment is refunded | `refund` |
| `INCOMING_PAYMENT.PENDING` | Incoming payment needs approval | `counterpartyInformation`, `requestedReceiverCustomerInfoFields`, `reconciliationInstructions` |
| `INCOMING_PAYMENT.COMPLETED` | Incoming payment settles | `receivedAmount`, `reconciliationInstructions` |
| `INCOMING_PAYMENT.FAILED` | Incoming payment fails | `failureReason` |

**Special case — `INCOMING_PAYMENT.PENDING`:** This is an approval webhook, not just a notification. The consumer must respond with:
- `200` to approve
- `202` to process asynchronously (must call approve/reject endpoint within 5s)
- `403` to reject
- `422` to request more counterparty information

`requestedReceiverCustomerInfoFields` is included inside `data` alongside the transaction fields.

### KYC webhooks

`data` = `{ customerId, platformCustomerId, kycStatus }`

| Type | When fired |
|---|---|
| `KYC.APPROVED` | Customer KYC approved |
| `KYC.REJECTED` | Customer KYC rejected |
| `KYC.EXPIRED` | KYC session expired |
| `KYC.MANUALLY_APPROVED` | Manually approved |
| `KYC.MANUALLY_REJECTED` | Manually rejected |

### Account webhooks

`data` = `{ accountId, customerId, platformCustomerId, oldBalance, newBalance }`

| Type | When fired |
|---|---|
| `ACCOUNT_BALANCE.UPDATED` | Internal account balance changes |

### Other webhooks

| Type | Data | When fired |
|---|---|---|
| `INVITATION.CLAIMED` | Full `UmaInvitation` object | Invitation is claimed |
| `BULK_UPLOAD.COMPLETED` | Full `BulkCustomerImportJob` object | Bulk upload succeeds |
| `BULK_UPLOAD.FAILED` | Full `BulkCustomerImportJob` with errors | Bulk upload fails |
| `TEST` | Minimal/empty | Connectivity test |

## Example Payloads

### Outgoing payment completed

```json
{
  "id": "Webhook:019542f5-b3e7-1d02-0000-000000000007",
  "type": "OUTGOING_PAYMENT.COMPLETED",
  "timestamp": "2025-08-15T14:32:00Z",
  "data": {
    "id": "Transaction:019542f5-b3e7-1d02-0000-000000000005",
    "status": "COMPLETED",
    "type": "OUTGOING",
    "customerId": "Customer:019542f5-b3e7-1d02-0000-000000000001",
    "platformCustomerId": "18d3e5f7b4a9c2",
    "destination": {},
    "sentAmount": { "amount": 10550, "currency": { "code": "USD", "name": "United States Dollar", "symbol": "$", "decimals": 2 } },
    "receivedAmount": { "amount": 9706, "currency": { "code": "EUR", "name": "Euro", "symbol": "€", "decimals": 2 } },
    "exchangeRate": 0.92,
    "quoteId": "Quote:019542f5-b3e7-1d02-0000-000000000006",
    "settledAt": "2025-08-15T14:30:00Z",
    "createdAt": "2025-08-15T14:25:18Z",
    "description": "Payment for invoice #1234",
    "paymentInstructions": [],
    "rateDetails": {}
  }
}
```

### Incoming payment pending (approval)

```json
{
  "id": "Webhook:019542f5-b3e7-1d02-0000-000000000007",
  "type": "INCOMING_PAYMENT.PENDING",
  "timestamp": "2025-08-15T14:32:00Z",
  "data": {
    "id": "Transaction:019542f5-b3e7-1d02-0000-000000000005",
    "status": "PENDING",
    "type": "INCOMING",
    "customerId": "Customer:019542f5-b3e7-1d02-0000-000000000001",
    "platformCustomerId": "18d3e5f7b4a9c2",
    "destination": {},
    "receivedAmount": { "amount": 50000, "currency": { "code": "USD", "name": "United States Dollar", "symbol": "$", "decimals": 2 } },
    "counterpartyInformation": {
      "FULL_NAME": "John Sender",
      "BIRTH_DATE": "1985-06-15",
      "NATIONALITY": "US"
    },
    "reconciliationInstructions": { "reference": "REF-123456789" },
    "requestedReceiverCustomerInfoFields": [
      { "name": "NATIONALITY", "mandatory": true },
      { "name": "ADDRESS", "mandatory": false }
    ]
  }
}
```

### KYC approved

```json
{
  "id": "Webhook:019542f5-b3e7-1d02-0000-000000000007",
  "type": "KYC.APPROVED",
  "timestamp": "2025-08-15T14:32:00Z",
  "data": {
    "customerId": "Customer:019542f5-b3e7-1d02-0000-000000000001",
    "platformCustomerId": "...",
    "kycStatus": "APPROVED"
  }
}
```

### Account balance updated

```json
{
  "id": "Webhook:019542f5-b3e7-1d02-0000-000000000007",
  "type": "ACCOUNT_BALANCE.UPDATED",
  "timestamp": "2025-08-15T14:32:00Z",
  "data": {
    "accountId": "Account:019542f5-...",
    "customerId": "Customer:019542f5-...",
    "platformCustomerId": "...",
    "oldBalance": { "amount": 50000, "currency": { "code": "USD", "name": "United States Dollar", "symbol": "$", "decimals": 2 } },
    "newBalance": { "amount": 10000, "currency": { "code": "USD", "name": "United States Dollar", "symbol": "$", "decimals": 2 } }
  }
}
```

## Migration Notes

### Breaking changes from current schema
1. `webhookId` → `id` (field rename)
2. Resource keys (`transaction`, `account`, `invitation`, `bulkCustomerImportJob`) → `data` (unified key)
3. `type` values change: `OUTGOING_PAYMENT` → `OUTGOING_PAYMENT.COMPLETED` / `OUTGOING_PAYMENT.FAILED` etc.
4. KYC type splits: `KYC_STATUS` → `KYC.APPROVED`, `KYC.REJECTED`, etc.
5. Account type rename: `ACCOUNT_STATUS` → `ACCOUNT_BALANCE.UPDATED`

### What stays the same
- Signature verification (`X-Grid-Signature` header)
- Response codes and their semantics (200, 202, 400, 401, 403, 409, 422)
- The incoming payment approval flow (unchanged behavior, just restructured payload)
- All shared component schemas (`CurrencyAmount`, `CounterpartyFieldDefinition`, etc.)

## Industry Context

This design follows the Stripe pattern (full resource embed, consistent envelope, event ID for idempotency) adapted for Grid's conventions:
- `OBJECT.EVENT` dot-notation with `UPPER_SNAKE_CASE` segments (e.g., `OUTGOING_PAYMENT.COMPLETED`)
- Status-specific types for routing without inspecting data
- Grid's existing signature verification mechanism

Stripe makes this work through API versioning — Grid plans to do the same, which will allow resource schemas to evolve without breaking webhook consumers.
