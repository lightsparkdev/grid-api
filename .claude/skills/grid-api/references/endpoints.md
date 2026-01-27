# Grid API Endpoints Reference

Quick reference for all Grid API endpoints. For full details, see `openapi/` directory.

## Base URL

Production: `https://api.lightspark.com/grid/2025-10-13`

## Authentication

HTTP Basic Auth: `Authorization: Basic base64(tokenId:clientSecret)`

## Platform Configuration

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/config` | Get platform configuration |
| PATCH | `/config` | Update platform configuration |

## Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/customers` | Create a new customer |
| GET | `/customers` | List customers (paginated) |
| GET | `/customers/{customerId}` | Get customer details |
| PATCH | `/customers/{customerId}` | Update customer |
| DELETE | `/customers/{customerId}` | Delete customer |
| POST | `/customers/kyc-link` | Generate KYC link |
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

### Quote Source Types
- `source.accountId`: Internal account ID
- `source.customerId` + `source.currency`: Customer-funded with payment instructions

### Quote Destination Types
- `destination.accountId`: External account ID
- `destination.umaAddress` + `destination.currency`: UMA address
- `destination.externalAccountDetails`: Inline account creation

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
- `PENDING`: Awaiting processing
- `PENDING_APPROVAL`: Needs approval (incoming)
- `PROCESSING`: In progress
- `COMPLETED`: Successfully completed
- `FAILED`: Failed
- `CANCELLED`: Cancelled

## Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/webhooks/test` | Send test webhook |

### Webhook Events
- `incoming-payment`: Payment received
- `outgoing-payment`: Payment status update
- `kyc-status`: KYC status change
- `account-status`: Account status change
- `bulk-upload`: Bulk job completion
- `invitation-claimed`: Invitation claimed

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
