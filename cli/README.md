# Grid CLI

A command-line interface for the Grid API, enabling global payments across fiat, stablecoins, and Bitcoin.

## Installation

```bash
cd cli
npm install
npm run build
```

## Quick Start

Configure your credentials interactively:

```bash
node cli/dist/index.js configure
```

This will prompt for your API Token ID and Client Secret, validate them, and save to `~/.grid-credentials`.

Alternatively, set environment variables:

```bash
export GRID_API_TOKEN_ID="your-token-id"
export GRID_API_CLIENT_SECRET="your-client-secret"
```

## Usage

Run commands from the repository root:

```bash
node cli/dist/index.js <command> [options]
```

### Global Options

| Option | Description |
|--------|-------------|
| `-c, --config <path>` | Path to credentials file |
| `-u, --base-url <url>` | Override API base URL |
| `-f, --format <format>` | Output format: `json` (default) or `table` |
| `--no-color` | Disable colored output |
| `-V, --version` | Show version |
| `-h, --help` | Show help |

### Command Aliases

For convenience, common commands have short aliases:

| Alias | Command |
|-------|---------|
| `cust` | `customers` |
| `tx` | `transactions` |
| `acct` | `accounts` |

Example: `grid tx list` is equivalent to `grid transactions list`

## Commands

### Setup

```bash
# Interactive configuration
node cli/dist/index.js configure

# Non-interactive configuration
node cli/dist/index.js configure --token-id <id> --client-secret <secret>

# Skip credential verification
node cli/dist/index.js configure --no-verify
```

### Platform Configuration

```bash
# Get platform config (currencies, limits, webhook)
node cli/dist/index.js config get

# Update webhook endpoint
node cli/dist/index.js config update --webhook-endpoint https://example.com/webhooks
```

### Customers

```bash
# List customers
node cli/dist/index.js customers list [--limit 20] [--type INDIVIDUAL|BUSINESS]

# Get customer details
node cli/dist/index.js customers get <customerId>

# Create individual customer
node cli/dist/index.js customers create \
  --platform-id "your-id" \
  --type INDIVIDUAL \
  --full-name "John Doe" \
  --birth-date "1990-01-15" \
  --address-line1 "123 Main St" \
  --address-city "Seattle" \
  --address-state "WA" \
  --address-postal "98101" \
  --address-country "US"

# Create business customer
node cli/dist/index.js customers create \
  --platform-id "biz-123" \
  --type BUSINESS \
  --legal-name "Acme Inc" \
  --tax-id "12-3456789"

# Generate KYC link
node cli/dist/index.js customers kyc-link \
  --customer-id <id> \
  --redirect-url https://example.com/kyc-complete

# Update customer
node cli/dist/index.js customers update <customerId> --full-name "Jane Doe"

# Delete customer (prompts for confirmation)
node cli/dist/index.js customers delete <customerId>

# Delete customer without confirmation
node cli/dist/index.js customers delete <customerId> --yes
```

### Accounts

#### Internal Accounts (Grid-managed balances)

```bash
# List customer internal accounts
node cli/dist/index.js accounts internal list [--customer-id <id>] [--currency USD]

# List platform internal accounts
node cli/dist/index.js accounts internal list --platform
```

#### External Accounts (Bank accounts, wallets)

```bash
# List external accounts
node cli/dist/index.js accounts external list [--customer-id <id>]

# Create US bank account
node cli/dist/index.js accounts external create \
  --customer-id <id> \
  --currency USD \
  --account-type US_ACCOUNT \
  --account-number "123456789" \
  --routing-number "021000021" \
  --account-category CHECKING \
  --beneficiary-type INDIVIDUAL \
  --beneficiary-name "John Doe"

# Create Mexico CLABE account
node cli/dist/index.js accounts external create \
  --customer-id <id> \
  --currency MXN \
  --account-type CLABE \
  --clabe "012345678901234567" \
  --beneficiary-type INDIVIDUAL \
  --beneficiary-name "Carlos Garcia" \
  --beneficiary-birth-date "1988-03-20" \
  --beneficiary-nationality MX

# Create India UPI account
node cli/dist/index.js accounts external create \
  --customer-id <id> \
  --currency INR \
  --account-type UPI \
  --upi-id "name@okaxis" \
  --beneficiary-type INDIVIDUAL \
  --beneficiary-name "Rajesh Kumar" \
  --beneficiary-birth-date "1985-06-15" \
  --beneficiary-nationality IN

# Create Brazil PIX account
node cli/dist/index.js accounts external create \
  --customer-id <id> \
  --currency BRL \
  --account-type PIX \
  --pix-key "12345678901" \
  --beneficiary-type INDIVIDUAL \
  --beneficiary-name "Maria Silva" \
  --beneficiary-birth-date "1990-05-10" \
  --beneficiary-nationality BR

# Create Nigeria account
node cli/dist/index.js accounts external create \
  --customer-id <id> \
  --currency NGN \
  --account-type NGN_ACCOUNT \
  --account-number "1234567890" \
  --bank-name "First Bank" \
  --purpose GOODS_OR_SERVICES \
  --beneficiary-type INDIVIDUAL \
  --beneficiary-name "Chidi Okonkwo" \
  --beneficiary-birth-date "1992-08-20" \
  --beneficiary-nationality NG

# Create Europe IBAN account
node cli/dist/index.js accounts external create \
  --customer-id <id> \
  --currency EUR \
  --account-type IBAN \
  --iban "DE89370400440532013000" \
  --beneficiary-type INDIVIDUAL \
  --beneficiary-name "Hans Mueller"

# Create crypto wallet (Solana USDC)
node cli/dist/index.js accounts external create \
  --customer-id <id> \
  --currency USDC \
  --account-type SOLANA_WALLET \
  --address "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
```

### Quotes (Cross-Currency Transfers)

```bash
# List quotes
node cli/dist/index.js quotes list [--status PENDING] [--customer-id <id>]

# Get quote details
node cli/dist/index.js quotes get <quoteId>

# Create quote from internal account (prefunded)
node cli/dist/index.js quotes create \
  --source-account <internalAccountId> \
  --dest-uma '$user@domain.com' \
  --amount 10000 \
  --lock-side SENDING

# Create quote with JIT funding (real-time)
node cli/dist/index.js quotes create \
  --source-customer <customerId> \
  --source-currency USDC \
  --dest-account <externalAccountId> \
  --dest-currency MXN \
  --amount 100000 \
  --lock-side RECEIVING

# Execute a pending quote
node cli/dist/index.js quotes execute <quoteId>
```

### Same-Currency Transfers

```bash
# Transfer in (external → internal)
node cli/dist/index.js transfers in \
  --source <externalAccountId> \
  --dest <internalAccountId> \
  --amount 10000

# Transfer out (internal → external)
node cli/dist/index.js transfers out \
  --source <internalAccountId> \
  --dest <externalAccountId> \
  --amount 10000
```

### Transactions

```bash
# List transactions
node cli/dist/index.js transactions list \
  [--customer-id <id>] \
  [--status PENDING|PROCESSING|COMPLETED|FAILED] \
  [--type INCOMING|OUTGOING] \
  [--start-date 2024-01-01] \
  [--end-date 2024-12-31]

# Get transaction details
node cli/dist/index.js transactions get <transactionId>

# Approve incoming payment
node cli/dist/index.js transactions approve <transactionId>

# Reject incoming payment
node cli/dist/index.js transactions reject <transactionId> --reason "Invalid sender"
```

### Receiver Lookup

```bash
# Look up UMA address
node cli/dist/index.js receiver lookup-uma '$user@domain.com'

# Look up external account
node cli/dist/index.js receiver lookup-account <accountId>
```

### Sandbox Testing

```bash
# Fund an internal account
node cli/dist/index.js sandbox fund <internalAccountId> --amount 100000

# Simulate sending funds to a JIT quote
node cli/dist/index.js sandbox send --quote-id <quoteId> --currency USDC

# Simulate receiving an UMA payment
node cli/dist/index.js sandbox receive \
  --uma-address '$user@domain.com' \
  --amount 1000 \
  --currency USD
```

## Output Format

All commands output JSON:

```json
{
  "success": true,
  "data": { ... }
}
```

On error:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

## Common Workflows

### Send USDC to Mexico (JIT Funding)

```bash
# 1. Create external account
node cli/dist/index.js accounts external create \
  --customer-id <customerId> \
  --currency MXN \
  --account-type CLABE \
  --clabe "012345678901234567" \
  --beneficiary-type INDIVIDUAL \
  --beneficiary-name "Carlos Garcia" \
  --beneficiary-birth-date "1988-03-20" \
  --beneficiary-nationality MX

# 2. Create quote (returns payment instructions)
node cli/dist/index.js quotes create \
  --source-customer <customerId> \
  --source-currency USDC \
  --dest-account <externalAccountId> \
  --dest-currency MXN \
  --amount 100000 \
  --lock-side RECEIVING

# 3. In sandbox, simulate the USDC deposit
node cli/dist/index.js sandbox send --quote-id <quoteId> --currency USDC

# 4. Check transaction status
node cli/dist/index.js transactions get <transactionId>
```

### Send to UMA Address

```bash
# 1. Look up the receiver
node cli/dist/index.js receiver lookup-uma '$alice@example.com'

# 2. Create and execute quote
node cli/dist/index.js quotes create \
  --source-account <internalAccountId> \
  --dest-uma '$alice@example.com' \
  --amount 5000 \
  --lock-side SENDING

# 3. Execute the quote
node cli/dist/index.js quotes execute <quoteId>
```

## Output Formats

### JSON (default)

```bash
node cli/dist/index.js customers list
```

Output includes syntax highlighting when running in a terminal.

### Table

```bash
node cli/dist/index.js customers list --format table
```

Displays results in a human-readable table format.

### Disable Colors

```bash
node cli/dist/index.js customers list --no-color
```

## Notes

- All amounts are in the **smallest currency unit** (cents for USD, satoshis for BTC)
- Quotes expire in 1-5 minutes
- JIT quotes auto-execute when funds are received (no manual execute needed)
- Use `--lock-side SENDING` to fix the send amount, `RECEIVING` to fix the receive amount
- Destructive operations (like delete) require confirmation unless `--yes` is passed
- Input validation runs before API calls to catch errors early
