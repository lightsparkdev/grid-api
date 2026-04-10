---
name: grid-api
description: >
  This skill should be used when the user asks to "send a payment", "check balance",
  "list transactions", "create a quote", "manage customers", "create external account",
  "what currencies does Grid support", "how do I use the Grid API", "send money to [country]",
  "pay [UMA address]", "send to CLABE", "send to PIX", "send to IBAN", "send to UPI",
  "fund sandbox account", "test a payment", "on-ramp", "off-ramp", "convert crypto to fiat",
  "convert fiat to crypto", "look up UMA", "real-time quote", "JIT funding", "check exchange rate",
  "FX rate", "payment corridor", "what rate will I get", "estimate withdrawal fee",
  "crypto withdrawal fee", or any payment operations using the Grid API CLI.
allowed-tools:
  - Bash
  - Read
  - Grep
  - Glob
  - WebFetch
---

# Grid API Skill

Assist users with global payment operations via the Grid API. Core capabilities:

1. **Execute API Operations** - Use `curl` to interact with the Grid API directly
2. **Answer Documentation Questions** - Fetch docs from <https://grid.lightspark.com/llms.txt> or the OpenAPI spec (<https://raw.githubusercontent.com/lightsparkdev/grid-api/refs/heads/main/openapi.yaml>)
3. **Guide Payment Workflows** - Help users send payments to bank accounts, UMA addresses, and crypto wallets

## Supporting References

For detailed information, read these reference files in the `references/` directory:

- **`references/account-types.md`** - Country-specific external account requirements (MXN, BRL, EUR, INR, GBP, NGN, and 18 more) with field requirements and curl examples. Read this when creating external accounts for international payments.
- **`references/endpoints.md`** - Complete API endpoint reference with methods, paths, and response codes. Read this when answering questions about specific API capabilities.
- **`references/workflows.md`** - Step-by-step payment workflow guides for common scenarios (UMA payments, international transfers, on-ramp, off-ramp). Read this when guiding users through multi-step payment flows.

## Key Concepts

### Entities

- **Platform**: The top-level entity (the API user's business)
- **Customer**: End users of the platform who send/receive payments
- **Internal Account**: Grid-managed account for holding funds (can be platform-owned or customer-owned)
- **External Account**: Bank account or crypto wallet outside Grid (destination for payouts)
- **UMA Address**: Universal Money Address (e.g., `$user@domain.com`) for receiving payments

### Account Types

- **Platform internal accounts**: For pooled funds, rewards distribution, treasury
- **Customer internal accounts**: Per-currency holding accounts created automatically for each customer
- **External accounts**: Traditional bank accounts (MXN_ACCOUNT, EUR_ACCOUNT, USD_ACCOUNT, etc.) or crypto wallets

### Account Status Lifecycle

`PENDING` → `ACTIVE` → `UNDER_REVIEW` → `INACTIVE`

### Currency & Amounts

- All amounts are in the **smallest currency unit** (cents for USD, satoshis for BTC)
- Use the `currency.decimals` field to convert for display (USD=2, BTC=8, etc.)
- Example: `10000` with `decimals: 2` = $100.00

## Configuration

The Grid API uses HTTP Basic Auth. Before making any API calls, ensure credentials and base URL are set as environment variables:

- `GRID_CLIENT_ID` - API client ID
- `GRID_CLIENT_SECRET` - API client secret
- `GRID_BASE_URL` - API base URL

If not set, load them from `~/.grid-credentials`:

```bash
export GRID_CLIENT_ID=$(jq -r '.clientId // .apiTokenId' ~/.grid-credentials)
export GRID_CLIENT_SECRET=$(jq -r '.clientSecret // .apiClientSecret' ~/.grid-credentials)
export GRID_BASE_URL=$(jq -r '.baseUrl // "https://api.lightspark.com/grid/2025-10-13"' ~/.grid-credentials)
```

**Always load credentials from `~/.grid-credentials` before making API calls if the environment variables are not already set.**

### Base URL

- **Production**: `https://api.lightspark.com/grid/2025-10-13`
- **Dev or local**: May use a different base URL — check `~/.grid-credentials` for the `baseUrl` field

### Documentation Resources

For questions not covered by this skill's reference files, fetch additional information from the web:

- **LLM-optimized docs**: Fetch `https://grid.lightspark.com/llms.txt` for a concise overview of the Grid API, or `https://grid.lightspark.com/llms-full.txt` for comprehensive documentation
- **OpenAPI Spec**: Fetch `https://raw.githubusercontent.com/lightsparkdev/grid-api/refs/heads/main/openapi.yaml` for the full API schema with request/response definitions
- **Published docs**: Browse `https://grid.lightspark.com` for guides, tutorials, and API reference. Any page can use the `.md` suffix for a more agent-readable format.

## Making API Calls

All API calls use HTTP Basic Auth via `curl -u`:

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  "$GRID_BASE_URL/<endpoint>"
```

For POST/PATCH requests, add the JSON body:

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '<json-body>' \
  "$GRID_BASE_URL/<endpoint>"
```

Pipe through `jq` for readable output: `| jq .`

## API Operations

### Platform Configuration

```bash
# Get platform config (currencies, limits)
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  "$GRID_BASE_URL/config" | jq .

# Update platform config (e.g., set webhook endpoint)
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X PATCH -H "Content-Type: application/json" \
  -d '{"webhookEndpoint": "https://example.com/webhooks"}' \
  "$GRID_BASE_URL/config" | jq .
```

### Customer Management

```bash
# List customers
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers?limit=20" | jq .

# Get customer details
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers/<customerId>" | jq .

# Create customer
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "platformCustomerId": "<platform-id>",
    "customerType": "INDIVIDUAL",
    "fullName": "Name"
  }' \
  "$GRID_BASE_URL/customers" | jq .

# Update customer (customerType is required)
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X PATCH -H "Content-Type: application/json" \
  -d '{"customerType": "INDIVIDUAL", "fullName": "New Name"}' \
  "$GRID_BASE_URL/customers/<customerId>" | jq .

# Delete customer
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X DELETE \
  "$GRID_BASE_URL/customers/<customerId>" | jq .

# Generate KYC link (GET with query params)
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers/kyc-link?platformCustomerId=<platformCustomerId>&redirectUri=https://example.com/callback" | jq .
```

### Account Management

```bash
# List customer internal accounts
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers/internal-accounts?customerId=<customerId>" | jq .

# List platform internal accounts
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  "$GRID_BASE_URL/platform/internal-accounts" | jq .

# List customer external accounts
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers/external-accounts?customerId=<customerId>" | jq .

# Create external account (example: Mexico MXN_ACCOUNT - Individual)
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "MXN",
    "accountInfo": {
      "accountType": "MXN_ACCOUNT",
      "paymentRails": ["SPEI"],
      "clabeNumber": "<18-digit-number>",
      "beneficiary": {
        "beneficiaryType": "INDIVIDUAL",
        "fullName": "Full Name",
        "birthDate": "1990-01-15",
        "nationality": "MX"
      }
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

For all 27 supported fiat account types and 7 crypto wallet types with their field requirements, read `references/account-types.md`.

### Exchange Rates (Pre-Quote FX Rates)

Use this to check indicative FX rates for a payment corridor **before** creating a receiving account or a quote. Rates are cached ~5 minutes and include platform-specific fees.

```bash
# Get all available corridors from USD
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  "$GRID_BASE_URL/exchange-rates?sourceCurrency=USD" | jq .

# Get rate for a specific corridor (USD → INR)
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  "$GRID_BASE_URL/exchange-rates?sourceCurrency=USD&destinationCurrency=INR" | jq .

# Get rate with a specific sending amount (10000 = $100.00 in cents)
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  "$GRID_BASE_URL/exchange-rates?sourceCurrency=USD&destinationCurrency=INR&sendingAmount=10000" | jq .

# Get rates for multiple destination currencies
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  "$GRID_BASE_URL/exchange-rates?sourceCurrency=USD&destinationCurrency=INR&destinationCurrency=EUR" | jq .
```

The response includes per-corridor:
- `sourceCurrency` / `destinationCurrency` with code, decimals, name, symbol
- `destinationPaymentRail` (e.g., UPI, SEPA_INSTANT, MOBILE_MONEY, FASTER_PAYMENTS)
- `sendingAmount` / `receivingAmount` in smallest currency units
- `minSendingAmount` / `maxSendingAmount` — corridor limits
- `exchangeRate` — units of destination per unit of source
- `fees.fixed` — fixed fee in smallest unit of sending currency
- `updatedAt` — when the rate was last refreshed

**Note:** These are indicative cached rates. For a locked, executable rate, create a quote via `POST /quotes`.

### Crypto Withdrawal Fee Estimation

Estimate network and application fees before a crypto withdrawal:

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "internalAccountId": "<internalAccountId>",
    "currency": "USDC",
    "cryptoNetwork": "SOLANA_MAINNET",
    "amount": 1000000,
    "destinationAddress": "<blockchain-address>"
  }' \
  "$GRID_BASE_URL/crypto/estimate-withdrawal-fee" | jq .
```

Returns:
- `networkFee` — gas fee in `networkFeeAsset` units (e.g., lamports for SOL)
- `networkFeeAsset` — asset used for network fee (e.g., SOL)
- `applicationFee` — platform fee in withdrawal currency units
- `totalFee` — total cost in withdrawal currency (network fee converted + application fee)
- `netAmount` — amount recipient receives after all fees

Supported networks: `SOLANA_MAINNET`, `SOLANA_DEVNET`, `ETHEREUM_MAINNET`, `POLYGON_MAINNET`, `BASE_MAINNET`, `TRON_MAINNET`

### Quotes (Cross-Currency Transfers)

```bash
# Account-funded to UMA: Use when funds are already in an internal account
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "source": {
      "sourceType": "ACCOUNT",
      "accountId": "<internalAccountId>"
    },
    "destination": {
      "destinationType": "UMA_ADDRESS",
      "umaAddress": "<address>",
      "currency": "USD"
    },
    "lockedCurrencyAmount": 10000,
    "lockedCurrencySide": "SENDING"
  }' \
  "$GRID_BASE_URL/quotes" | jq .

# Account-funded to external account: IMPORTANT - always include destination currency
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "source": {
      "sourceType": "ACCOUNT",
      "accountId": "<internalAccountId>"
    },
    "destination": {
      "destinationType": "ACCOUNT",
      "accountId": "<externalAccountId>",
      "currency": "<currency>"
    },
    "lockedCurrencyAmount": 10000,
    "lockedCurrencySide": "SENDING"
  }' \
  "$GRID_BASE_URL/quotes" | jq .

# Real-time/JIT funded: Returns paymentInstructions for funding
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "source": {
      "sourceType": "REALTIME_FUNDING",
      "customerId": "<customerId>",
      "currency": "<sourceCurrency>"
    },
    "destination": {
      "destinationType": "ACCOUNT",
      "accountId": "<accountId>",
      "currency": "<destCurrency>"
    },
    "lockedCurrencyAmount": 100000,
    "lockedCurrencySide": "RECEIVING"
  }' \
  "$GRID_BASE_URL/quotes" | jq .

# Execute a quote
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST \
  "$GRID_BASE_URL/quotes/<quoteId>/execute" | jq .

# List quotes
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  "$GRID_BASE_URL/quotes?status=PENDING" | jq .

# Get quote details
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  "$GRID_BASE_URL/quotes/<quoteId>" | jq .
```

### Same-Currency Transfers

```bash
# Transfer in (external → internal, same currency)
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "source": {"accountId": "<externalAccountId>"},
    "destination": {"accountId": "<internalAccountId>"},
    "amount": 10000
  }' \
  "$GRID_BASE_URL/transfer-in" | jq .

# Transfer out (internal → external, same currency)
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "source": {"accountId": "<internalAccountId>"},
    "destination": {"accountId": "<externalAccountId>"},
    "amount": 10000
  }' \
  "$GRID_BASE_URL/transfer-out" | jq .
```

### Transactions

```bash
# List transactions
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  "$GRID_BASE_URL/transactions?status=PENDING" | jq .

# Get transaction details
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  "$GRID_BASE_URL/transactions/<transactionId>" | jq .

# Approve incoming payment
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST \
  "$GRID_BASE_URL/transactions/<transactionId>/approve" | jq .

# Reject incoming payment
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{"reason": "Reason for rejection"}' \
  "$GRID_BASE_URL/transactions/<transactionId>/reject" | jq .
```

### Receiver Lookup

```bash
# Look up UMA address capabilities
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  "$GRID_BASE_URL/receiver/uma/%24alice%40example.com" | jq .

# Look up external account capabilities
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  "$GRID_BASE_URL/receiver/external-account/<accountId>" | jq .
```

**Note:** UMA addresses contain `$` which must be URL-encoded as `%24` in the path.

### Sandbox Testing

```bash
# Fund an internal account in sandbox
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{"amount": 100000}' \
  "$GRID_BASE_URL/sandbox/internal-accounts/<internalAccountId>/fund" | jq .

# Simulate sending funds to a real-time quote
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{"quoteId": "<quoteId>", "currencyCode": "<code>"}' \
  "$GRID_BASE_URL/sandbox/send" | jq .

# Simulate receiving a UMA payment
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "senderUmaAddress": "$sender@sandbox.grid.uma.money",
    "receiverUmaAddress": "<receiverAddress>",
    "receivingCurrencyCode": "USD",
    "receivingCurrencyAmount": 1000
  }' \
  "$GRID_BASE_URL/sandbox/uma/receive" | jq .
```

## Payment Flow Patterns

Grid supports three main payment patterns:

### 1. Prefunded (Account-Funded)

Funds are already in an internal account. Quote executes immediately from existing balance.

```
Internal Account (USD) → Quote → External Account/UMA (EUR)
```

Use `sourceType: "ACCOUNT"` with an internal account ID.

### 2. Just-in-Time (Real-Time Funded)

Funds will be provided at execution time. Quote returns `paymentInstructions` with multiple funding options. Grid auto-executes when deposit is received.

```
Customer sends crypto/fiat → Grid detects deposit → Auto-executes at locked rate
```

Use `sourceType: "REALTIME_FUNDING"` with customer ID and currency. Only works with instant settlement methods.

### 3. Same-Currency Transfers

Direct transfers between accounts without currency conversion. No quote needed.

```
External Account (USD) → Internal Account (USD)  [transfer-in]
Internal Account (USD) → External Account (USD)  [transfer-out]
```

## Interactive Payment Workflows

For step-by-step payment workflows, read `references/workflows.md`. Common workflows:

- **Check FX Rate (Pre-Quote)**: Query `GET /exchange-rates` for indicative rates before setting up accounts or quotes
- **UMA Payment**: Receiver lookup -> Quote -> Confirm -> Execute
- **International Bank Transfer**: Create external account -> Receiver lookup -> Quote -> Confirm -> Execute
- **On-Ramp (Fiat to Crypto)**: Verify KYC -> Deposit fiat -> Create crypto external account -> Quote with `immediatelyExecute`
- **Off-Ramp (Crypto to Fiat)**: Create fiat external account -> Deposit crypto -> Quote -> Execute
- **Incoming Payment Handling**: List pending approvals -> Review -> Approve/Reject

### Real-Time / Just-in-Time Funded Transfers

Use this flow when the user asks for a "realtime quote" or "just in time" funded transfer. Only use with instant settlement methods — do not use with slow methods like ACH since quotes expire quickly.

**Compatible instant methods:**

- **Crypto:** BTC (Lightning, Spark), USDC (Solana, Base, Polygon, Ethereum), USDT (Tron)
- **Fiat:** RTP, SEPA Instant, and other instant payment rails

**Flow:**

1. Create a quote with `sourceType: "REALTIME_FUNDING"`. Destination can be an internal account, external account, or UMA address.
2. The response includes `paymentInstructions` with **multiple funding options simultaneously** (e.g., Lightning + Spark for BTC, Solana + Base + Polygon for USDC). Show all options to the user.
3. **Auto-execution**: Once the user sends funds to ANY of the provided addresses, Grid automatically detects the deposit and executes at the locked rate. Do NOT call the execute endpoint for JIT quotes. Webhooks sent: `internal-account-status` on deposit, `outgoing-payment` on completion.
4. **Quote expiration**: Quotes expire in 1-5 minutes. If expired, create a new quote.

## Best Practices and Common Pitfalls

1. **Check platform config first**: Call `GET /config` to see supported currencies and required fields
2. **Use smallest currency units**: All amounts are in cents/satoshis - use `decimals` field for display
3. **Handle quote expiration**: Quotes expire in 1-5 minutes; be prepared to create new quotes
4. **Choose the right flow**: Use prefunded for immediate execution, JIT for crypto/instant rails
5. **Pipe through jq**: Always append `| jq .` for readable output, or `| jq -r .field` to extract specific values
6. **URL-encode special characters**: UMA addresses contain `$` — encode as `%24` in URL paths
7. **Always include destination currency in quotes**: When specifying a destination account, you MUST include `currency` in the destination object even though the external account already has a currency
8. **Individual beneficiary requires fullName**: For `beneficiaryType: "INDIVIDUAL"`, `fullName` is required. `birthDate` (YYYY-MM-DD) and `nationality` (2-letter code) are optional but recommended
9. **Use correct Nigerian field names**: Use `bankName` (NOT `bankCode`) and include `purposeOfPayment`
10. **Don't forget country-specific required fields**: Brazil (BRL_ACCOUNT) requires `pixKey`, `pixKeyType`, and `taxId`; Europe (EUR_ACCOUNT) requires `iban`; all fiat accounts require `paymentRails`

## Error Handling

Single-resource responses:

```json
{
  "id": "...",
  "status": "...",
  ...
}
```

List responses return results in a `data` array with pagination fields:

```json
{
  "data": [ ... ],
  "hasMore": true,
  "nextCursor": "...",
  "totalCount": 42
}
```

Use `jq '.data[]'` to iterate results or `jq '[.data[] | select(.currency == "NGN")]'` to filter.

On error:

```json
{
  "code": "ERROR_CODE",
  "message": "Human readable message"
}
```

The HTTP status code indicates the error category (400 for bad input, 401 for auth issues, 404 for not found, etc.).

### Common Error Codes

**Quote/Transfer Errors:**

- `QUOTE_EXPIRED` - Quote timed out; create a new quote
- `INSUFFICIENT_BALANCE` - Check internal account balance before transfer
- `INVALID_BANK_ACCOUNT` - Validate field formats per country requirements
- `QUOTE_EXECUTION_FAILED` - Transient error; retry with exponential backoff

**Incoming Payment Errors:**

- `PAYMENT_APPROVAL_TIMED_OUT` - Webhook approval not received within 5 seconds
- `PAYMENT_APPROVAL_WEBHOOK_ERROR` - Webhook returned error

**Validation Errors:**

- `INVALID_INPUT` - Check required fields; the `reason` field has details
- `MISSING_MANDATORY_USER_INFO` - Customer or sender info missing required fields

Always check the HTTP status code and report errors clearly to the user.
