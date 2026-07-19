# Grid API Endpoints Reference

Quick reference for all Grid API endpoints. For full request/response schemas, fetch the OpenAPI spec from `https://raw.githubusercontent.com/lightsparkdev/grid-api/refs/heads/main/openapi.yaml`.

## Base URL

Production: `https://api.lightspark.com/grid/2025-10-13`

## Authentication

- **Platform (Basic Auth):** `Authorization: Basic base64(clientId:clientSecret)` — used for most endpoints.
- **Agent (Agent Auth):** the `/agents/me/*` self-service endpoints accept an agent's own credentials.

## Platform Configuration

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/config` | Get platform configuration |
| PATCH | `/config` | Update platform configuration |

## Exchange Rates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/exchange-rates` | Get exchange rates |

Query parameters: `sourceCurrency`, `destinationCurrency` (repeatable), `sendingAmount` (default 10000).
Rates are cached ~5 minutes and include platform-specific fees.

## Crypto

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/crypto/estimate-withdrawal-fee` | Estimate crypto withdrawal fee |

## Discoveries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/discoveries` | List available receiving institution names |

## Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/customers` | Add a new customer |
| GET | `/customers` | List customers |
| GET | `/customers/{customerId}` | Get customer by ID |
| PATCH | `/customers/{customerId}` | Update customer by ID |
| DELETE | `/customers/{customerId}` | Delete customer by ID |
| POST | `/customers/{customerId}/kyc-link` | Generate a hosted KYC link for an existing customer |
| POST | `/customers/{customerId}/verify-email` | Send an email verification code to a customer |
| POST | `/customers/{customerId}/verify-email/confirm` | Confirm a customer's email verification code |
| POST | `/customers/{customerId}/verify-phone` | Send a phone verification code to a customer |
| POST | `/customers/{customerId}/verify-phone/confirm` | Confirm a customer's phone verification code |
| POST | `/customers/bulk/csv` | Upload customers via CSV file |
| GET | `/customers/bulk/jobs/{jobId}` | Get bulk import job status |

## Beneficial Owners

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/beneficial-owners` | Create a beneficial owner |
| GET | `/beneficial-owners` | List beneficial owners |
| GET | `/beneficial-owners/{beneficialOwnerId}` | Get a beneficial owner |
| PATCH | `/beneficial-owners/{beneficialOwnerId}` | Update a beneficial owner |

## Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/documents` | Upload a document |
| GET | `/documents` | List documents |
| GET | `/documents/{documentId}` | Get a document by ID |
| PUT | `/documents/{documentId}` | Replace a document |
| DELETE | `/documents/{documentId}` | Delete a document |

## Verifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/verifications` | Submit customer for verification |
| GET | `/verifications` | List verifications |
| GET | `/verifications/{verificationId}` | Get a verification |

## Internal Accounts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers/internal-accounts` | List Customer internal accounts |
| GET | `/platform/internal-accounts` | List platform internal accounts |
| PATCH | `/internal-accounts/{id}` | Update internal account |
| POST | `/internal-accounts/{id}/export` | Export internal account wallet credentials |

Internal accounts are auto-created when customers are created based on platform config.

## External Accounts (Customer)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers/external-accounts` | List Customer external accounts |
| POST | `/customers/external-accounts` | Add a new external account |
| GET | `/customers/external-accounts/{externalAccountId}` | Get customer external account by ID |
| DELETE | `/customers/external-accounts/{externalAccountId}` | Delete customer external account by ID |
| POST | `/customers/external-accounts/{externalAccountId}/trust` | Start trusting a beneficiary |
| POST | `/customers/external-accounts/{externalAccountId}/trust/confirm` | Confirm trusting a beneficiary |
| POST | `/customers/external-accounts/{externalAccountId}/untrust` | Start untrusting a beneficiary |
| POST | `/customers/external-accounts/{externalAccountId}/untrust/confirm` | Confirm untrusting a beneficiary |

## Platform External Accounts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/platform/external-accounts` | List platform external accounts |
| POST | `/platform/external-accounts` | Add a new platform external account |
| GET | `/platform/external-accounts/{externalAccountId}` | Get platform external account by ID |
| DELETE | `/platform/external-accounts/{externalAccountId}` | Delete platform external account by ID |

## Same-Currency Transfers

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/transfer-in` | Create a transfer-in request (external to internal) |
| POST | `/transfer-out` | Create a transfer-out request (internal to external) |

## Receiver Lookup

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/receiver/uma/{receiverUmaAddress}` | Look up an UMA address for payment |
| GET | `/receiver/external-account/{accountId}` | Look up an external account for payment |

Returns: supported currencies, min/max amounts, required payer data fields.

## Cross-Currency Transfers (Quotes)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/quotes` | Create a transfer quote |
| GET | `/quotes/{quoteId}` | Get quote by ID |
| POST | `/quotes/{quoteId}/authorize` | Authorize a quote's SCA challenge |
| POST | `/quotes/{quoteId}/authorize/resend` | Resend a quote's SCA challenge code |
| POST | `/quotes/{quoteId}/execute` | Execute a quote |

Quotes are created individually and fetched by ID; there is no list endpoint.

### Quote Source Types (`sourceType` discriminator)

- `ACCOUNT`: Internal account funded. Fields: `accountId`
- `REALTIME_FUNDING`: Just-in-time funded. Fields: `customerId`, `currency`

### Quote Destination Types (`destinationType` discriminator)

- `ACCOUNT`: External or internal account. Fields: `accountId`, `currency`
- `UMA_ADDRESS`: UMA address. Fields: `umaAddress`, `currency`

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
- `scaChallenge`: Present while `status` is `PENDING_AUTHORIZATION` — the SCA challenge to authorize
- `expiresAt`: Quote expiration timestamp
- `transactionId`: Associated transaction ID
- `rateDetails`: Detailed rate and fee breakdown

### Quote Statuses

- `PENDING`: Awaiting execution
- `PENDING_AUTHORIZATION`: Awaiting Strong Customer Authentication. Occurs only for customers in an SCA-required region (e.g. EU); the quote carries an `scaChallenge` that must be authorized via `POST /quotes/{quoteId}/authorize` before execution. For realtime-funding sources, `paymentInstructions` are withheld until the challenge is satisfied. Authorization can be multi-step: if the quote is still `PENDING_AUTHORIZATION` after authorizing, authorize the next `scaChallenge` and repeat.
- `PROCESSING`: Being executed
- `COMPLETED`: Successfully completed
- `FAILED`: Execution failed
- `EXPIRED`: Quote expired before execution

## Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/transactions` | List transactions |
| GET | `/transactions/{transactionId}` | Get transaction by ID |
| POST | `/transactions/{transactionId}/confirm` | Confirm receipt delivery |
| POST | `/transactions/{transactionId}/approve` | Approve a pending incoming payment |
| POST | `/transactions/{transactionId}/reject` | Reject a pending incoming payment |

### Transaction Types

- `INCOMING`: Payment received
- `OUTGOING`: Payment sent

### Transaction Statuses

- `CREATED`: Initial lookup has been created
- `PENDING`: Quote has been created
- `PENDING_AUTHORIZATION`: Awaiting Strong Customer Authentication (SCA-required regions only)
- `PROCESSING`: Funding received, payment initiated
- `COMPLETED`: Payment sent to destination network
- `REJECTED`: Receiving institution rejected payment, refunded
- `FAILED`: An error occurred during payment
- `REFUNDED`: Payment unable to complete, refunded
- `EXPIRED`: Quote expired

## Auth (Embedded Wallet)

Credentials, sessions, and delegated signing keys for embedded-wallet customers.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/credentials` | Create an authentication credential |
| GET | `/auth/credentials` | List authentication credentials |
| DELETE | `/auth/credentials/{id}` | Revoke an authentication credential |
| POST | `/auth/credentials/{id}/verify` | Verify an authentication credential |
| POST | `/auth/credentials/{id}/challenge` | Re-issue an authentication credential challenge |
| GET | `/auth/sessions` | List active sessions |
| DELETE | `/auth/sessions/{id}` | Revoke an authentication session |
| POST | `/auth/sessions/{id}/refresh` | Refresh an authentication session |
| POST | `/auth/delegated-keys` | Create a delegated signing key |
| GET | `/auth/delegated-keys` | List delegated signing keys |
| GET | `/auth/delegated-keys/{id}` | Get a delegated signing key |
| DELETE | `/auth/delegated-keys/{id}` | Revoke a delegated signing key |

## SCA & 2FA

Strong Customer Authentication factor enrollment, login, and two-factor reset.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sca/factors` | List enrolled SCA factors |
| POST | `/sca/factors` | Start SCA factor enrollment |
| POST | `/sca/factors/confirm` | Confirm SCA factor enrollment |
| DELETE | `/sca/factors/{credentialId}` | Delete an enrolled SCA factor |
| POST | `/sca/login/start` | Start an SCA login |
| POST | `/sca/login/complete` | Complete an SCA login |
| POST | `/sca/record-event` | Record a security event |
| POST | `/sca/factors/reset` | Start a 2FA reset |
| GET | `/sca/factors/reset/{resetId}` | Get 2FA reset status |
| POST | `/sca/factors/reset/{resetId}/complete` | Complete a 2FA reset |

## Agents (Admin)

Platform-managed agents and their approval workflow.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/agents` | Create an agent |
| GET | `/agents` | List agents |
| GET | `/agents/approvals` | List agent transaction approval requests |
| GET | `/agents/{agentId}` | Get agent by ID |
| PATCH | `/agents/{agentId}` | Update agent |
| DELETE | `/agents/{agentId}` | Delete agent |
| PATCH | `/agents/{agentId}/policy` | Update agent policy |
| POST | `/agents/{agentId}/device-codes` | Regenerate a device code |
| POST | `/agents/{agentId}/actions/{actionId}/approve` | Approve an agent action |
| POST | `/agents/{agentId}/actions/{actionId}/reject` | Reject an agent action |
| GET | `/agents/device-codes/{code}/status` | Get device code status |
| POST | `/agents/device-codes/{code}/redeem` | Redeem device code |

## Agents (Self-Service)

The `/agents/me/*` endpoints are called by an agent using its own credentials (Agent Auth).

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/agents/me` | Get current agent |
| GET | `/agents/me/transactions` | List agent transactions |
| GET | `/agents/me/transactions/{transactionId}` | Get agent transaction by ID |
| POST | `/agents/me/quotes` | Create a transfer quote |
| GET | `/agents/me/quotes/{quoteId}` | Get agent quote by ID |
| POST | `/agents/me/quotes/{quoteId}/execute` | Execute a quote |
| GET | `/agents/me/actions` | List agent's own actions |
| GET | `/agents/me/actions/{actionId}` | Get an agent action |
| POST | `/agents/me/transfer-in` | Create a transfer-in |
| POST | `/agents/me/transfer-out` | Create a transfer-out |
| GET | `/agents/me/internal-accounts` | List agent's internal accounts |
| GET | `/agents/me/external-accounts` | List agent external accounts |
| POST | `/agents/me/external-accounts` | Add an external account |
| GET | `/agents/me/external-accounts/{externalAccountId}` | Get agent external account by ID |
| DELETE | `/agents/me/external-accounts/{externalAccountId}` | Delete agent external account |

## Cards

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/cards` | Issue a card |
| GET | `/cards` | List cards |
| GET | `/cards/{id}` | Get a card |
| PATCH | `/cards/{id}` | Update a card (freeze/unfreeze, rebind funding sources, close) |
| POST | `/cards/{id}/reveal` | Reveal card details |

### Sandbox Card Simulation

Drive card lifecycle events in sandbox to test authorization, clearing, and returns.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sandbox/cards/{id}/simulate/authorization` | Simulate a card authorization |
| POST | `/sandbox/cards/{id}/simulate/clearing` | Simulate a card clearing |
| POST | `/sandbox/cards/{id}/simulate/return` | Simulate a card return |

## Stablecoin Provider Accounts

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/stablecoin-provider-accounts` | Link a stablecoin provider account |
| GET | `/stablecoin-provider-accounts` | List stablecoin provider account links |
| GET | `/stablecoin-provider-accounts/{stablecoinProviderAccountId}` | Get a stablecoin provider account link |

## Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sandbox/webhooks/test` | Send a test webhook (sandbox only) |

### Webhook Events

- `incoming-payment`: Payment received
- `outgoing-payment`: Payment status update
- `customer-update`: Customer information or KYC status change
- `internal-account-status`: Internal account status change
- `verification-update`: Verification status change
- `agent-action`: Agent action requires approval or changed status
- `card-state-change`: Card state changed
- `card-funding-source-change`: Card funding source changed
- `card-transaction`: Card transaction event
- `bulk-upload`: Bulk job completion
- `invitation-claimed`: Invitation claimed
- `test-webhook`: Test event (sandbox only)

## Invitations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/invitations` | Create an UMA invitation |
| GET | `/invitations/{invitationCode}` | Get an UMA invitation by code |
| POST | `/invitations/{invitationCode}/claim` | Claim an UMA invitation |
| POST | `/invitations/{invitationCode}/cancel` | Cancel an UMA invitation |

## Sandbox Testing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sandbox/send` | Simulate sending funds |
| POST | `/sandbox/uma/receive` | Simulate payment send to test receiving an UMA payment |
| POST | `/sandbox/internal-accounts/{accountId}/fund` | Simulate funding an internal account |

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
| POST | `/tokens` | Create a new API token |
| GET | `/tokens` | List tokens |
| GET | `/tokens/{tokenId}` | Get API token by ID |
| DELETE | `/tokens/{tokenId}` | Delete API token by ID |

## UMA Providers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/uma-providers` | List available Counterparty Providers |

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
| 202 | Accepted (signed-retry challenge — resubmit with the returned proof) |
| 204 | No Content |
| 400 | Bad request (invalid parameters) |
| 401 | Unauthorized (invalid credentials) |
| 403 | Forbidden |
| 404 | Not found |
| 405 | Method not allowed |
| 409 | Conflict (duplicate) |
| 410 | Gone |
| 412 | Precondition failed (UMA version) |
| 423 | Locked |
| 424 | Counterparty issue |
| 429 | Too many requests (rate limited) |
| 500 | Internal server error |
| 501 | Not implemented |
