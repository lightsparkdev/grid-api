# Common Payment Workflows

This reference describes common payment workflows using the Grid API CLI.

**Tip:** Use command aliases for faster typing: `cust` (customers), `tx` (transactions), `acct` (accounts).

**Tip:** Add `--format table` to any list command for human-readable output.

## Workflow 1: Send Payment to UMA Address

Use this when the user wants to send money to an UMA address like `$alice@example.com`.

### Steps

1. **Look up the receiver**
```bash
node cli/dist/index.js receiver lookup-uma "\$alice@example.com"
```

This returns:
- Supported currencies
- Min/max amounts per currency
- Required payer data fields

2. **Check sender's balance**
```bash
node cli/dist/index.js acct internal list --customer-id <customerId> --format table
```

Identify the internal account with sufficient balance.

3. **Create a quote**
```bash
node cli/dist/index.js quotes create \
  --source-account InternalAccount:xxx \
  --dest-uma "\$alice@example.com" \
  --dest-currency USD \
  --amount 10000 \
  --lock-side SENDING \
  --description "Payment for services"
```

The response includes:
- `sendingAmount` and `sendingCurrency`
- `receivingAmount` and `receivingCurrency`
- `exchangeRate`
- `fees` array
- `expiresAt` (quote validity)

4. **Show the user the exchange details and get confirmation**

Example: "You're sending $100.00 USD. The recipient will receive €92.15 EUR (rate: 0.9215). Fee: $1.50. Confirm?"

5. **Execute the quote**
```bash
node cli/dist/index.js quotes execute Quote:xxx
```

6. **Monitor the transaction**
```bash
node cli/dist/index.js tx list --status PROCESSING --format table
```

## Workflow 2: Send Payment to International Bank Account

Use this when the user wants to send money to a bank account in another country.

### Steps

1. **Determine destination country and account type**

Ask the user: "Which country is the bank account in?"

Refer to `account-types.md` for:
- Required account type (CLABE, PIX, IBAN, etc.)
- Required fields

2. **Collect account details interactively**

For Mexico (CLABE):
- Ask for 18-digit CLABE number
- Ask for beneficiary name
- Ask for beneficiary birth date
- Ask for beneficiary nationality

3. **Create the external account**
```bash
node cli/dist/index.js accounts external create \
  --customer-id Customer:xxx \
  --currency MXN \
  --account-type CLABE \
  --clabe 012345678901234567 \
  --beneficiary-type INDIVIDUAL \
  --beneficiary-name "Juan Garcia" \
  --beneficiary-birth-date "1985-03-15" \
  --beneficiary-nationality MX
```

4. **Look up the account to get payment capabilities**
```bash
node cli/dist/index.js receiver lookup-account ExternalAccount:xxx
```

5. **Create a quote**
```bash
node cli/dist/index.js quotes create \
  --source-account InternalAccount:xxx \
  --dest-account ExternalAccount:xxx \
  --dest-currency MXN \
  --amount 100000 \
  --lock-side RECEIVING
```

Note: `--lock-side RECEIVING` means the recipient gets exactly this amount.

6. **Show exchange details and confirm**

7. **Execute the quote**
```bash
node cli/dist/index.js quotes execute Quote:xxx
```

## Workflow 3: On-Ramp (Fiat to Crypto)

Use this when a customer wants to convert fiat to cryptocurrency.

### Steps

1. **Ensure customer has completed KYC**
```bash
node cli/dist/index.js customers get Customer:xxx
```

Check `kycStatus` is `APPROVED`.

2. **Customer deposits fiat to their internal account**

Show customer the `paymentInstructions` from their internal account:
```bash
node cli/dist/index.js accounts internal list --customer-id Customer:xxx
```

3. **Create external account for crypto destination**
```bash
node cli/dist/index.js accounts external create \
  --customer-id Customer:xxx \
  --currency BTC \
  --account-type SPARK_WALLET \
  --address "spark1..."
```

4. **Create and execute quote for conversion**
```bash
node cli/dist/index.js quotes create \
  --source-account InternalAccount:xxx \
  --dest-account ExternalAccount:xxx \
  --dest-currency BTC \
  --amount 10000000 \
  --lock-side SENDING \
  --immediate
```

The `--immediate` flag executes the quote instantly.

## Workflow 4: Off-Ramp (Crypto to Fiat)

Use this when a customer wants to convert cryptocurrency to fiat.

### Steps

1. **Create fiat external account for payout**
```bash
node cli/dist/index.js accounts external create \
  --customer-id Customer:xxx \
  --currency USD \
  --account-type US_ACCOUNT \
  --routing-number "123456789" \
  --account-number "12345678901" \
  --account-category CHECKING \
  --beneficiary-type INDIVIDUAL \
  --beneficiary-name "John Doe"
```

2. **Customer sends crypto to their internal account**

Provide the deposit address from their BTC internal account.

3. **Create and execute quote for conversion**
```bash
node cli/dist/index.js quotes create \
  --source-account InternalAccount:xxx \
  --dest-account ExternalAccount:xxx \
  --dest-currency USD \
  --amount 50000 \
  --lock-side RECEIVING
```

## Workflow 5: Handle Incoming Payment

Use this when your platform receives an incoming payment that needs approval.

### Steps

1. **List pending incoming transactions**
```bash
node cli/dist/index.js transactions list --type INCOMING --status PENDING_APPROVAL
```

2. **Review transaction details**
```bash
node cli/dist/index.js transactions get Transaction:xxx
```

3. **Approve or reject**
```bash
# Approve
node cli/dist/index.js transactions approve Transaction:xxx

# Or reject
node cli/dist/index.js transactions reject Transaction:xxx --reason "Suspicious activity"
```

## Workflow 6: Bulk Customer Onboarding

The API supports bulk customer creation via CSV upload.

### Steps

1. **Prepare CSV file** with columns:
   - platformCustomerId
   - customerType
   - fullName (for individuals)
   - birthDate
   - address fields

2. **Upload CSV** (this endpoint isn't in the CLI, use curl):
```bash
curl -X POST https://api.lightspark.com/grid/2025-10-13/customers/bulk/csv \
  -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -F "file=@customers.csv"
```

3. **Check job status**
```bash
node cli/dist/index.js customers bulk-status <jobId>
```

## Error Recovery

### Quote Expired

If a quote expires before execution:
1. Create a new quote with the same parameters
2. Note: Exchange rates may have changed

### Transaction Failed

Check transaction status for failure reason:
```bash
node cli/dist/index.js transactions get Transaction:xxx
```

Common failure reasons:
- Insufficient funds
- Invalid account details
- Compliance rejection
- Bank rejection

### Retry with Different Account

If a bank account is rejected, try:
1. Verify account details are correct
2. Create a new external account with corrected details
3. Create new quote with the new account
