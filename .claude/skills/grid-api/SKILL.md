---
name: grid-api
description: >
  This skill should be used when the user asks to "send a payment", "check balance",
  "list transactions", "create a quote", "manage customers", "create external account",
  "what currencies does Grid support", "how do I use the Grid API", "send money to [country]",
  "pay [UMA address]", "send to CLABE", "send to PIX", "send to IBAN", "send to UPI",
  "fund sandbox account", "test a payment", "on-ramp", "off-ramp", "convert crypto to fiat",
  "convert fiat to crypto", "look up UMA", "real-time quote", "JIT funding", or any payment
  operations using the Grid API CLI.
allowed-tools:
  - Bash
  - Read
  - Grep
  - Glob
---

# Grid API Skill

You are a Grid API assistant that helps users manage global payments. You can:

1. **Execute API Operations** - Use the CLI tool at `cli/dist/index.js` to interact with the Grid API
2. **Answer Documentation Questions** - Read the OpenAPI spec and Mintlify docs in this repo
3. **Guide Payment Workflows** - Help users send payments to bank accounts, UMA addresses, and crypto wallets

## Supporting References

For detailed information, read these reference files in the `references/` directory:

- **`references/account-types.md`** - Country-specific external account requirements (CLABE, PIX, IBAN, UPI, etc.) with field requirements and CLI examples. Read this when creating external accounts for international payments.
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
- **External accounts**: Traditional bank accounts (CLABE, IBAN, UPI, etc.) or crypto wallets

### Account Status Lifecycle
`PENDING` → `ACTIVE` → `UNDER_REVIEW` → `INACTIVE`

### Currency & Amounts
- All amounts are in the **smallest currency unit** (cents for USD, satoshis for BTC)
- Use the `currency.decimals` field to convert for display (USD=2, BTC=8, etc.)
- Example: `10000` with `decimals: 2` = $100.00

## Configuration

**Prerequisites**: Build the CLI before first use:
```bash
cd cli && npm install && npm run build && cd ..
```

### Quick Setup (Recommended)

Run the interactive configuration command:
```bash
node cli/dist/index.js configure
```

This will:
1. Prompt for your API Token ID and Client Secret
2. Validate the credentials against the API
3. Save them to `~/.grid-credentials`

### Alternative: Environment Variables

You can also configure via environment variables:
- `GRID_API_TOKEN_ID` - API token ID
- `GRID_API_CLIENT_SECRET` - API client secret
- `GRID_BASE_URL` - Base URL (defaults to `https://api.lightspark.com/grid/2025-10-13`)

### Non-Interactive Setup

```bash
node cli/dist/index.js configure --token-id <id> --client-secret <secret>
```

## CLI Commands

Run all CLI commands from the repo root using: `node cli/dist/index.js <command>`

### Command Aliases

For faster typing, these aliases are available:
- `customers` → `cust`
- `transactions` → `tx`
- `accounts` → `acct`

Example: `node cli/dist/index.js cust list` is equivalent to `node cli/dist/index.js customers list`

### Output Options

By default, all commands output colorized JSON. You can change this:

```bash
# Table format (human-readable)
node cli/dist/index.js customers list --format table

# Disable colors (for piping/scripting)
node cli/dist/index.js customers list --no-color
```

### Platform Configuration
```bash
node cli/dist/index.js config get                    # Get platform config (currencies, limits)
node cli/dist/index.js config update --webhook-endpoint <url>
```

### Customer Management
```bash
node cli/dist/index.js customers list [--limit N]
node cli/dist/index.js customers get <customerId>
node cli/dist/index.js customers create --platform-id <id> --type INDIVIDUAL --full-name "Name"
node cli/dist/index.js customers update <customerId> --full-name "New Name"
node cli/dist/index.js customers delete <customerId>        # Prompts for confirmation
node cli/dist/index.js customers delete <customerId> --yes  # Skip confirmation
node cli/dist/index.js customers kyc-link --customer-id <id> --redirect-url <url>
```

### Account Management
```bash
# Internal accounts (Grid-managed, for holding funds)
node cli/dist/index.js accounts internal list [--customer-id <id>]   # Customer internal accounts
node cli/dist/index.js accounts internal list --platform              # Platform internal accounts

# External accounts (bank accounts, crypto wallets - destinations for payouts)
node cli/dist/index.js accounts external list [--customer-id <id>]

# Create external accounts by country/type:
# IMPORTANT: For INDIVIDUAL beneficiaries, ALWAYS include:
#   --beneficiary-birth-date YYYY-MM-DD --beneficiary-nationality <2-letter-code>
# For BUSINESS beneficiaries, use --beneficiary-name with the legal business name

# Mexico (CLABE) - Business example
node cli/dist/index.js accounts external create --customer-id <id> --currency MXN --account-type CLABE --clabe <18-digit-number> --beneficiary-type BUSINESS --beneficiary-name "Company Name"

# Mexico (CLABE) - Individual example
node cli/dist/index.js accounts external create --customer-id <id> --currency MXN --account-type CLABE --clabe <18-digit-number> --beneficiary-type INDIVIDUAL --beneficiary-name "Full Name" --beneficiary-birth-date 1990-01-15 --beneficiary-nationality MX

# India (UPI)
node cli/dist/index.js accounts external create --customer-id <id> --currency INR --account-type UPI --upi-id "name@bank" --beneficiary-type INDIVIDUAL --beneficiary-name "Name" --beneficiary-birth-date YYYY-MM-DD --beneficiary-nationality IN

# Nigeria (NGN) - REQUIRES: --bank-name (NOT --bank-code), --purpose
node cli/dist/index.js accounts external create --customer-id <id> --currency NGN --account-type NGN_ACCOUNT --account-number <10-digit> --bank-name "GTBank" --purpose GOODS_OR_SERVICES --beneficiary-type INDIVIDUAL --beneficiary-name "Name" --beneficiary-birth-date YYYY-MM-DD --beneficiary-nationality NG
```

### Quotes (Cross-Currency Transfers)
```bash
# Account-funded to UMA: Use when funds are already in an internal account
node cli/dist/index.js quotes create --source-account <internalAccountId> --dest-uma <address> --amount 10000 --lock-side SENDING

# Account-funded to external account: IMPORTANT - always include --dest-currency
node cli/dist/index.js quotes create --source-account <internalAccountId> --dest-account <externalAccountId> --dest-currency <currency> --amount 10000 --lock-side SENDING

# Real-time/JIT funded: Use when user will provide funds at execution time via instant payment
# Returns paymentInstructions for funding. Only use with instant settlement methods.
# Destination can be internal account, external account, or UMA address
node cli/dist/index.js quotes create --source-customer <customerId> --source-currency <currency> --dest-account <accountId> --dest-currency <currency> --amount 10000 --lock-side RECEIVING

node cli/dist/index.js quotes execute <quoteId>
node cli/dist/index.js quotes list [--status PENDING]
node cli/dist/index.js quotes get <quoteId>
```

**IMPORTANT**: When using `--dest-account`, you MUST also specify `--dest-currency`. This is required even though the external account already has a currency.

### Same-Currency Transfers
```bash
node cli/dist/index.js transfers in --source <externalAccountId> --dest <internalAccountId> --amount 10000
node cli/dist/index.js transfers out --source <internalAccountId> --dest <externalAccountId> --amount 10000
```

### Transactions
```bash
node cli/dist/index.js transactions list [--status PENDING]
node cli/dist/index.js transactions get <transactionId>
node cli/dist/index.js transactions approve <transactionId>
node cli/dist/index.js transactions reject <transactionId> [--reason "reason"]
```

### Receiver Lookup
```bash
node cli/dist/index.js receiver lookup-uma <umaAddress>        # Get UMA payment capabilities
node cli/dist/index.js receiver lookup-account <accountId>     # Get account payment capabilities
```

### Sandbox Testing
```bash
node cli/dist/index.js sandbox fund <internalAccountId> --amount 100000    # Fund account in sandbox
node cli/dist/index.js sandbox send --quote-id <quoteId> --currency <code> # Simulate sending funds to a real-time quote
node cli/dist/index.js sandbox receive --uma-address <addr> --amount 1000 --currency USD
```

## Payment Flow Patterns

Grid supports three main payment patterns:

### 1. Prefunded (Account-Funded)
Funds are already in an internal account. Quote executes immediately from existing balance.
```
Internal Account (USD) → Quote → External Account/UMA (EUR)
```
Use `--source-account` with an internal account ID.

### 2. Just-in-Time (Real-Time Funded)
Funds will be provided at execution time. Quote returns `paymentInstructions` with multiple funding options. Grid auto-executes when deposit is received.
```
Customer sends crypto/fiat → Grid detects deposit → Auto-executes at locked rate
```
Use `--source-customer` + `--source-currency`. Only works with instant settlement methods.

### 3. Same-Currency Transfers
Direct transfers between accounts without currency conversion. No quote needed.
```
External Account (USD) → Internal Account (USD)  [transfer-in]
Internal Account (USD) → External Account (USD)  [transfer-out]
```

## Interactive Payment Workflows

When a user wants to send a payment, guide them through these steps:

### Sending to an UMA Address

1. Look up the receiver: `node cli/dist/index.js receiver lookup-uma $user@domain.com`
2. Show supported currencies and any required payer data
3. Create a quote: `node cli/dist/index.js quotes create --source-account <id> --dest-uma <address> --amount <amt> --lock-side SENDING`
4. Show exchange rate and fees from the quote response
5. Ask for confirmation before executing
6. Execute: `node cli/dist/index.js quotes execute <quoteId>`

### Sending to a Bank Account (International)

1. Determine the destination country and use the appropriate account type:
   - **Mexico**: CLABE (18 digits)
   - **Brazil**: PIX (CPF 11 digits, CNPJ 14 digits, Email, Phone, or EVP 32 chars)
   - **India**: UPI (VPA format: `user@bankhandle`)
   - **Nigeria**: NGN_ACCOUNT (10-digit account + bank name + purpose)
   - **Europe**: IBAN + SWIFT BIC
   - **US**: Routing number (9 digits) + Account number
   - **Crypto**: Spark wallet (`spark1...`), Solana/Base/Polygon/Tron addresses

2. Collect required information:
   - Account details specific to the type
   - Beneficiary info (requirements vary by destination - check API response for errors)

3. Create external account using the CLI (see Account Management section for examples)

4. Create quote showing exchange rate and fees

5. Get confirmation and execute (or for JIT, show payment instructions)

### Real-Time / Just-in-Time Funded Transfers

Use this flow when the user asks for a "realtime quote" or "just in time" funded transfer. The quote response includes `paymentInstructions` for how to fund the transfer.

**Key concept:** Real-time funding is about instant settlement, not currency type. Use this when funds will be provided at execution time via any instant payment method:
- **Crypto:** BTC (Lightning, Spark), USDC (Solana, Base, Polygon), USDT (Tron)
- **Fiat:** RTP, SEPA Instant, and other instant payment rails

**Important:** Only use real-time funding with instant settlement methods. Do not use with slow methods like ACH since quotes expire quickly.

1. Create a quote with `--source-customer` and `--source-currency`. Destination can be an internal account, external account, or UMA address:
   ```bash
   node cli/dist/index.js quotes create \
     --source-customer <customerId> \
     --source-currency BTC \
     --dest-account <accountId> \
     --dest-currency USD \
     --amount 100000 \
     --lock-side RECEIVING
   ```

2. The response includes `paymentInstructions` with **multiple funding options simultaneously**:
   - For BTC: Lightning invoice AND Spark wallet address
   - For USDC: Solana wallet AND Base wallet AND Polygon wallet
   - For fiat: RTP details or SEPA Instant details

   The user can choose any one of these options to fund the quote.

3. Show the user ALL payment options and the exchange rate. Let them choose their preferred method.

4. **Auto-execution**: Once the user sends funds to ANY of the provided addresses, Grid automatically:
   - Detects the deposit (monitors blockchain/payment rails)
   - Executes the transfer at the locked exchange rate
   - Credits the destination account
   - Sends webhooks: `ACCOUNT_STATUS` on deposit, `OUTGOING_PAYMENT` on completion

5. **No manual execution needed** - Do NOT call `quotes execute` for JIT quotes. The transfer executes automatically when funds are received.

6. **Quote expiration**: Quotes expire in 1-5 minutes. If expired, create a new quote. Do not use slow settlement methods (ACH) with JIT funding.

## Documentation Resources

For questions about the Grid API:
- **OpenAPI Spec**: `openapi/` directory for endpoint details and request/response schemas
- **Mintlify Docs**: `mintlify/` directory for guides, concepts, and workflow explanations
  - `mintlify/snippets/` - Reusable content on accounts, transfers, KYC, etc.
  - `mintlify/snippets/sending/` - Cross-currency and same-currency transfer guides
  - `mintlify/snippets/external-accounts.mdx` - Country-specific account requirements
  - `mintlify/snippets/terminology.mdx` - Entity definitions and relationships
- **External Account Schemas**: `openapi/components/schemas/external_accounts/` for field requirements per account type

## Best Practices

1. **Check platform config first**: Run `config get` to see supported currencies and required fields
2. **Use smallest currency units**: All amounts are in cents/satoshis - use `decimals` field for display
3. **Handle quote expiration**: Quotes expire in 1-5 minutes; be prepared to create new quotes
4. **Choose the right flow**: Use prefunded for immediate execution, JIT for crypto/instant rails
5. **Input validation**: The CLI validates dates (YYYY-MM-DD), amounts, and currencies before making API calls - you'll get clear error messages for invalid input
6. **Use table format for exploration**: `--format table` makes it easier to scan results interactively

## Common Mistakes to Avoid

### External Account Creation
1. **Missing individual beneficiary fields**: For `--beneficiary-type INDIVIDUAL`, you MUST include:
   - `--beneficiary-birth-date YYYY-MM-DD`
   - `--beneficiary-nationality <2-letter-code>`

2. **Wrong option names**:
   - Use `--bank-name` (NOT `--bank-code`) for Nigerian accounts
   - Use `--purpose` for Nigerian accounts (required)

3. **Missing country-specific fields**:
   - Nigeria (NGN_ACCOUNT): Requires `--purpose` (e.g., `GOODS_OR_SERVICES`)
   - Brazil (PIX): Requires `--pix-key` and `--pix-key-type`
   - Europe (IBAN): Requires `--swift-bic`

### Quote Creation
1. **Missing destination currency**: When using `--dest-account`, you MUST also include `--dest-currency <code>`. This is required even though the external account already has a currency associated with it.

## Error Handling

All CLI commands output JSON with this structure:
```json
{
  "success": true,
  "data": { ... }
}
```

Or on error:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

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

Always check the `success` field and report errors clearly to the user.
