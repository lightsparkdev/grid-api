# Common Payment Workflows

This reference describes common payment workflows using the Grid API.

**Tip:** Pipe all curl output through `jq .` for readable JSON, or `jq -r .field` to extract specific values.

## Workflow 1: Send Payment to UMA Address

Use this when the user wants to send money to a UMA address like `$alice@example.com`.

### Steps

1. **Look up the receiver**

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/receiver/uma/%24alice%40example.com" | jq .
```

This returns:

- Supported currencies
- Min/max amounts per currency
- Required payer data fields

2. **Check sender's balance**

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers/internal-accounts?customerId=<customerId>" | jq .
```

Identify the internal account with sufficient balance.

3. **Create a quote**

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "source": {
      "sourceType": "ACCOUNT",
      "accountId": "InternalAccount:xxx"
    },
    "destination": {
      "destinationType": "UMA_ADDRESS",
      "umaAddress": "$alice@example.com",
      "currency": "USD"
    },
    "lockedCurrencyAmount": 10000,
    "lockedCurrencySide": "SENDING",
    "description": "Payment for services"
  }' \
  "$GRID_BASE_URL/quotes" | jq .
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
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST \
  "$GRID_BASE_URL/quotes/Quote:xxx/execute" | jq .
```

6. **Monitor the transaction**

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/transactions?status=PROCESSING" | jq .
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
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "Customer:xxx",
    "currency": "MXN",
    "accountInfo": {
      "accountType": "CLABE",
      "clabeNumber": "012345678901234567",
      "beneficiary": {
        "beneficiaryType": "INDIVIDUAL",
        "fullName": "Juan Garcia",
        "birthDate": "1985-03-15",
        "nationality": "MX"
      }
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

4. **Look up the account to get payment capabilities**

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/receiver/external-account/ExternalAccount:xxx" | jq .
```

5. **Create a quote**

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "source": {
      "sourceType": "ACCOUNT",
      "accountId": "InternalAccount:xxx"
    },
    "destination": {
      "destinationType": "ACCOUNT",
      "accountId": "ExternalAccount:xxx",
      "currency": "MXN"
    },
    "lockedCurrencyAmount": 100000,
    "lockedCurrencySide": "RECEIVING"
  }' \
  "$GRID_BASE_URL/quotes" | jq .
```

Note: `lockedCurrencySide: "RECEIVING"` means the recipient gets exactly this amount.

6. **Show exchange details and confirm**

7. **Execute the quote**

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST \
  "$GRID_BASE_URL/quotes/Quote:xxx/execute" | jq .
```

## Workflow 3: On-Ramp (Fiat to Crypto)

Use this when a customer wants to convert fiat to cryptocurrency.

### Steps

1. **Ensure customer has completed KYC**

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers/Customer:xxx" | jq .
```

Check `kycStatus` is `APPROVED`.

2. **Customer deposits fiat to their internal account**

Show customer the `paymentInstructions` from their internal account:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers/internal-accounts?customerId=Customer:xxx" | jq .
```

3. **Create external account for crypto destination**

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "Customer:xxx",
    "currency": "BTC",
    "accountInfo": {
      "accountType": "SPARK_WALLET",
      "address": "spark1..."
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

4. **Create and execute quote for conversion**

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "source": {
      "sourceType": "ACCOUNT",
      "accountId": "InternalAccount:xxx"
    },
    "destination": {
      "destinationType": "ACCOUNT",
      "accountId": "ExternalAccount:xxx",
      "currency": "BTC"
    },
    "lockedCurrencyAmount": 10000000,
    "lockedCurrencySide": "SENDING",
    "immediatelyExecute": true
  }' \
  "$GRID_BASE_URL/quotes" | jq .
```

The `immediatelyExecute: true` flag executes the quote instantly.

## Workflow 4: Off-Ramp (Crypto to Fiat)

Use this when a customer wants to convert cryptocurrency to fiat.

### Steps

1. **Create fiat external account for payout**

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "Customer:xxx",
    "currency": "USD",
    "accountInfo": {
      "accountType": "US_ACCOUNT",
      "routingNumber": "123456789",
      "accountNumber": "12345678901",
      "accountCategory": "CHECKING",
      "beneficiary": {
        "beneficiaryType": "INDIVIDUAL",
        "fullName": "John Doe",
        "birthDate": "1990-01-15",
        "nationality": "US"
      }
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

2. **Customer sends crypto to their internal account**

Provide the deposit address from their BTC internal account.

3. **Create and execute quote for conversion**

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "source": {
      "sourceType": "ACCOUNT",
      "accountId": "InternalAccount:xxx"
    },
    "destination": {
      "destinationType": "ACCOUNT",
      "accountId": "ExternalAccount:xxx",
      "currency": "USD"
    },
    "lockedCurrencyAmount": 50000,
    "lockedCurrencySide": "RECEIVING"
  }' \
  "$GRID_BASE_URL/quotes" | jq .
```

## Workflow 5: Handle Incoming Payment

Use this when your platform receives an incoming payment that needs approval.

### Steps

1. **List pending incoming transactions**

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/transactions?type=INCOMING&status=PENDING_APPROVAL" | jq .
```

2. **Review transaction details**

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/transactions/Transaction:xxx" | jq .
```

3. **Approve or reject**

```bash
# Approve
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST \
  "$GRID_BASE_URL/transactions/Transaction:xxx/approve" | jq .

# Or reject
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{"reason": "Suspicious activity"}' \
  "$GRID_BASE_URL/transactions/Transaction:xxx/reject" | jq .
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

2. **Upload CSV**

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST \
  -F "file=@customers.csv" \
  "$GRID_BASE_URL/customers/bulk/csv" | jq .
```

3. **Check job status**

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers/bulk/jobs/<jobId>" | jq .
```

## Error Recovery

### Quote Expired

If a quote expires before execution:

1. Create a new quote with the same parameters
2. Note: Exchange rates may have changed

### Transaction Failed

Check transaction status for failure reason:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/transactions/Transaction:xxx" | jq .
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
