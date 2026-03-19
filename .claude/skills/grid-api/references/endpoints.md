# Grid API Endpoints Reference

Quick reference for all Grid API endpoints. For full request/response schemas, fetch the OpenAPI spec from `https://raw.githubusercontent.com/lightsparkdev/grid-api/refs/heads/main/openapi.yaml`.

## Base URL

Production: `https://api.lightspark.com/grid/2025-10-13`

## Authentication

HTTP Basic Auth: `Authorization: Basic base64(clientId:clientSecret)`

## Platform Configuration

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/config` | Get platform configuration |
| PATCH | `/config` | Update platform configuration |

## Exchange Rates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/exchange-rates` | Get cached FX rates for payment corridors |

Query parameters: `sourceCurrency`, `destinationCurrency` (repeatable), `sendingAmount` (default 10000).
Rates are cached ~5 minutes and include platform-specific fees.

## Crypto

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/crypto/estimate-withdrawal-fee` | Estimate network + app fees for crypto withdrawal |

## Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/customers` | Create a new customer |
| GET | `/customers` | List customers (paginated) |
| GET | `/customers/{customerId}` | Get customer details |
| PATCH | `/customers/{customerId}` | Update customer |
| DELETE | `/customers/{customerId}` | Delete customer |
| GET | `/customers/kyc-link` | Generate KYC link |
| POST | `/customers/bulk/csv` | Bulk upload customers |
| GET | `/customers/bulk/jobs/{jobId}` | Get bulk job status |

## Internal Accounts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers/internal-accounts` | List customer internal accounts |
| GET | `/platform/internal-accounts` | List platform internal accounts |

Internal accounts are auto-created when customers are created based on platform config.

## External Accounts

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/customers/external-accounts` | Create customer external account |
| GET | `/customers/external-accounts` | List customer external accounts |
| GET | `/platform/external-accounts` | List platform external accounts |

## Same-Currency Transfers

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/transfer-in` | Transfer from external to internal (same currency) |
| POST | `/transfer-out` | Transfer from internal to external (same currency) |

## Cross-Currency Transfers (Quotes)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/quotes` | Create a transfer quote |
| GET | `/quotes` | List quotes (paginated) |
| GET | `/quotes/{quoteId}` | Get quote details |
| POST | `/quotes/{quoteId}/execute` | Execute a pending quote |

### Quote Source Types (`sourceType` discriminator)

- `ACCOUNT`: Internal account funded. Fields: `accountId`
- `REALTIME_FUNDING`: Just-in-time funded. Fields: `customerId`, `currency`

### Quote Destination Types (`destinationType` discriminator)

- `ACCOUNT`: External or internal account. Fields: `accountId`, `currency`
- `UMA_ADDRESS`: UMA address. Fields: `umaAddress`, `currency`
- `EXTERNAL_ACCOUNT_DETAILS`: Inline account creation (creates external account + quote in one step). Fields: `externalAccountDetails` (same shape as external account create request)

### Quote Request Fields

- `lookupId`: Lookup ID from receiver lookup (required for UMA destinations)
- `lockedCurrencySide`: `SENDING` or `RECEIVING`
- `lockedCurrencyAmount`: Amount in smallest currency unit
- `immediatelyExecute`: Skip confirmation and execute immediately (default false)
- `purposeOfPayment`: Required for certain geographies (e.g., India). Values: `GIFT`, `SELF`, `GOODS_OR_SERVICES`, `EDUCATION`, `HEALTH_OR_MEDICAL`, `REAL_ESTATE_PURCHASE`, `TAX_PAYMENT`, `LOAN_PAYMENT`, `UTILITY_BILL`, `DONATION`, `TRAVEL`, `OTHER`
- `senderCustomerInfo`: Key-value pairs of sender info requested by destination (from receiver lookup `requiredPayerDataFields`)
- `description`: Optional memo

### Quote Response Fields

- `totalSendingAmount` / `totalReceivingAmount`: Amounts in smallest currency units
- `sendingCurrency` / `receivingCurrency`: Currency objects with code, decimals, name, symbol
- `exchangeRate`: Units of sending currency per receiving currency unit
- `feesIncluded`: Fees in smallest unit of sending currency
- `paymentInstructions`: Funding options (for REALTIME_FUNDING sources)
- `expiresAt`: Quote expiration timestamp
- `transactionId`: Associated transaction ID
- `rateDetails`: Detailed rate and fee breakdown

### Quote Statuses

- `PENDING`: Awaiting execution
- `PROCESSING`: Being executed
- `COMPLETED`: Successfully completed
- `FAILED`: Execution failed
- `EXPIRED`: Quote expired before execution

## Receiver Lookup

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/receiver/uma/{receiverUmaAddress}` | Look up UMA address capabilities |
| GET | `/receiver/external-account/{accountId}` | Look up external account capabilities |

Returns: supported currencies, min/max amounts, required payer data fields.

## Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/transactions` | List transactions (paginated) |
| GET | `/transactions/{transactionId}` | Get transaction details |
| POST | `/transactions/{transactionId}/approve` | Approve incoming payment |
| POST | `/transactions/{transactionId}/reject` | Reject incoming payment |

### Transaction Types

- `INCOMING`: Payment received
- `OUTGOING`: Payment sent

### Transaction Statuses

- `CREATED`: Initial lookup has been created
- `PENDING`: Quote has been created
- `PROCESSING`: Funding received, payment initiated
- `COMPLETED`: Payment sent to destination network
- `REJECTED`: Receiving institution rejected payment, refunded
- `FAILED`: An error occurred during payment
- `REFUNDED`: Payment unable to complete, refunded
- `EXPIRED`: Quote expired

## Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sandbox/webhooks/test` | Send test webhook (sandbox only) |

### Webhook Events

- `incoming-payment`: Payment received
- `outgoing-payment`: Payment status update
- `customer-update`: Customer information or KYC status change
- `internal-account-status`: Internal account status change
- `bulk-upload`: Bulk job completion
- `invitation-claimed`: Invitation claimed
- `test-webhook`: Test event (sandbox only)

## Invitations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/invitations` | Create invitation |
| GET | `/invitations` | List invitations |
| GET | `/invitations/{invitationCode}` | Get invitation |
| POST | `/invitations/{invitationCode}/claim` | Claim invitation |
| POST | `/invitations/{invitationCode}/cancel` | Cancel invitation |

## Sandbox Testing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sandbox/send` | Simulate sending payment |
| POST | `/sandbox/uma/receive` | Simulate receiving UMA payment |
| POST | `/sandbox/internal-accounts/{accountId}/fund` | Fund account in sandbox |

### Sandbox Account Patterns

Use these account number endings for testing:

- `002`: Insufficient funds
- `003`: Account closed/invalid
- `004`: Transfer rejected
- `005`: Timeout (pending ~30s, then fails)
- Other: Success

## API Tokens

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tokens` | Create API token |
| GET | `/tokens` | List API tokens |
| GET | `/tokens/{tokenId}` | Get token details |
| DELETE | `/tokens/{tokenId}` | Delete token |

## UMA Providers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/uma-providers` | List UMA provider domains |

## Plaid Integration

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/plaid/link-tokens` | Create Plaid Link token |
| POST | `/plaid/callback/{plaid_link_token}` | Plaid Link callback |

## Pagination

List endpoints support cursor-based pagination:

- `limit`: Max results (default 20, max 100)
- `cursor`: Pagination cursor from previous response
- Response includes `hasMore`, `nextCursor`, `totalCount`

## Common Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (invalid parameters) |
| 401 | Unauthorized (invalid credentials) |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 412 | Precondition failed (UMA version) |
| 424 | Counterparty issue |
| 500 | Internal server error |
| 501 | Not implemented |
