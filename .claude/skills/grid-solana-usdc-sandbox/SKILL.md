---
name: grid-usdc-sandbox
description: >
  End-to-end USDC sandbox flow tests using real Solana devnet funds. Use when the user asks to
  "test USDC flows", "run sandbox tests", "test deposits and withdrawals", "test USDC sandbox",
  "run e2e USDC test", "test realtime funding", "test USDC to USD", "test USDC to MXN",
  or wants to verify Grid's USDC deposit/withdrawal/quote pipeline on devnet.
allowed-tools:
  - Bash
  - Read
  - Grep
  - Glob
  - WebFetch
---

# Grid USDC Sandbox Flow Test

End-to-end test of USDC sandbox flows: deposits, withdrawals, and cross-currency quotes using real Solana devnet funds.

## Prerequisites

Run these steps before any tests. Stop and report if any step fails.

### 1. Load Grid API credentials

```bash
export GRID_API_TOKEN_ID=$(jq -r .apiTokenId ~/.grid-credentials)
export GRID_API_CLIENT_SECRET=$(jq -r .apiClientSecret ~/.grid-credentials)
export GRID_BASE_URL=$(jq -r '.baseUrl // "https://api.lightspark.com/grid/2025-10-13"' ~/.grid-credentials)
```

### 2. Verify Solana devnet key exists

```bash
jq -r '.solanaDevnetPrivateKey // empty' ~/.grid-credentials
```

If empty, stop and tell the user to add `solanaDevnetPrivateKey` (base58-encoded 64-byte keypair) to `~/.grid-credentials`.

### 3. Install Python dependencies

```bash
pip3 install solders solana base58 2>&1 | tail -5
```

### 4. Set helper alias

```bash
SOLANA_HELPER="python3 $(pwd)/.claude/skills/grid-usdc-sandbox/solana_helper.py"
```

### 5. Check SOL balance and airdrop if needed

```bash
$SOLANA_HELPER sol-balance
```

If `sol` < 0.1, airdrop:

```bash
$SOLANA_HELPER airdrop-sol --amount 1000000000
```

### 6. Check USDC balance

```bash
$SOLANA_HELPER usdc-balance
```

If `amount` < 1.0 USDC, warn the user that some tests may fail due to insufficient devnet USDC. Print instructions for obtaining devnet USDC (e.g., Solana devnet USDC faucet or manual transfer).

### 7. Print wallet address

```bash
$SOLANA_HELPER wallet-address
```

Save the address as `$WALLET_ADDRESS` for use in test cases.

---

## Test Cases

Run tests sequentially. Each test may depend on state created by prior tests. Track results for the final summary table.

---

### Test 1: Customer + USDC Account Creation

**Goal:** Create a customer and verify USDC internal account with funding instructions.

**Steps:**

1. Create a customer with a unique `platformCustomerId`:

```bash
PLATFORM_CUSTOMER_ID="usdc-test-$(date +%s)"
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{
    \"customerType\": \"INDIVIDUAL\",
    \"platformCustomerId\": \"$PLATFORM_CUSTOMER_ID\",
    \"fullName\": \"USDC Test User\",
    \"birthDate\": \"1990-01-15\",
    \"nationality\": \"US\"
  }" \
  "$GRID_BASE_URL/customers"
```

Extract and save `CUSTOMER_ID` from the response `id` field.

2. List internal accounts:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers/internal-accounts?customerId=$CUSTOMER_ID&limit=100"
```

3. From the response, extract:
   - `USDC_INTERNAL_ID`: the `id` of the internal account where `balance.currency` is `USDC`
   - `USD_INTERNAL_ID`: the `id` of the internal account where `balance.currency` is `USD`
   - `DEPOSIT_ADDRESS`: from the USDC account's `fundingPaymentInstructions` array, find the entry where `accountOrWalletInfo.accountType` is `SOLANA_WALLET` and extract `accountOrWalletInfo.address`

4. **PASS criteria:**
   - Customer created successfully
   - USDC internal account exists
   - `fundingPaymentInstructions` contains a `SOLANA_WALLET` entry with a non-empty `address`

---

### Test 2: Fund Internal Account with Real Devnet USDC

**Goal:** Send real USDC on devnet and verify Grid detects the deposit.

**Steps:**

1. Record initial USDC balance from internal account:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers/internal-accounts?customerId=$CUSTOMER_ID&currency=USDC"
```

Save initial `balance.amount` as `INITIAL_USDC_BALANCE`.

2. Send 0.50 USDC to the deposit address:

```bash
$SOLANA_HELPER send-usdc --to $DEPOSIT_ADDRESS --amount 500000
```

Verify the send was confirmed (status = "confirmed").

3. Poll for balance update every 5 seconds, up to 120 seconds:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers/internal-accounts?customerId=$CUSTOMER_ID&currency=USDC"
```

4. **PASS criteria:** USDC internal account `balance.amount` increases above `INITIAL_USDC_BALANCE`.

---

### Test 3: Transfer Out (USDC internal → external Solana wallet)

**Goal:** Withdraw USDC from internal account to an external Solana devnet wallet.

**Steps:**

1. Create an external account for our wallet:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{
    \"customerId\": \"$CUSTOMER_ID\",
    \"currency\": \"USDC\",
    \"cryptoNetwork\": \"SOLANA_DEVNET\",
    \"accountInfo\": {
      \"accountType\": \"SOLANA_WALLET\",
      \"address\": \"$WALLET_ADDRESS\"
    }
  }" \
  "$GRID_BASE_URL/customers/external-accounts"
```

Save the `id` as `USDC_EXTERNAL_ID`.

2. Record initial on-chain USDC balance:

```bash
$SOLANA_HELPER usdc-balance
```

Save `raw` as `INITIAL_ONCHAIN_USDC`.

3. Transfer out 0.10 USDC:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{
    \"source\": {\"accountId\": \"$USDC_INTERNAL_ID\"},
    \"destination\": {\"accountId\": \"$USDC_EXTERNAL_ID\"},
    \"amount\": 100000
  }" \
  "$GRID_BASE_URL/transfer-out"
```

4. Poll on-chain USDC balance every 5 seconds, up to 120 seconds:

```bash
$SOLANA_HELPER usdc-balance
```

5. **PASS criteria:** On-chain USDC balance (`raw`) increases by approximately 100000 (0.10 USDC) from `INITIAL_ONCHAIN_USDC`.

---

### Test 4: USDC → USD Quote (Real-Time Funded → internal USD account)

**Goal:** Use real-time funding to convert USDC to USD via a JIT quote, depositing into the customer's internal USD account.

**Steps:**

1. Create a real-time funded quote:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{
    \"source\": {
      \"sourceType\": \"REALTIME_FUNDING\",
      \"customerId\": \"$CUSTOMER_ID\",
      \"currency\": \"USDC\",
      \"cryptoNetwork\": \"SOLANA_DEVNET\"
    },
    \"destination\": {
      \"destinationType\": \"ACCOUNT\",
      \"accountId\": \"$USD_INTERNAL_ID\"
    },
    \"lockedCurrencySide\": \"RECEIVING\",
    \"lockedCurrencyAmount\": 10,
    \"purposeOfPayment\": \"GOODS_OR_SERVICES\"
  }" \
  "$GRID_BASE_URL/quotes"
```

2. Extract from the response:
   - `QUOTE_ID`: the `id` field
   - `TRANSACTION_ID`: the `transactionId` field
   - `PAYMENT_ADDRESS`: from `paymentInstructions`, find the `SOLANA_WALLET` entry and extract `accountOrWalletInfo.address`
   - `TOTAL_SENDING_AMOUNT`: the `totalSendingAmount` field (this is the micro-USDC amount to send)

3. Record initial USD internal account balance:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers/internal-accounts?customerId=$CUSTOMER_ID&currency=USD"
```

Save `balance.amount` as `INITIAL_USD_BALANCE`.

4. Send USDC to the payment instructions address:

```bash
$SOLANA_HELPER send-usdc --to $PAYMENT_ADDRESS --amount $TOTAL_SENDING_AMOUNT
```

5. Poll USD internal account balance every 5 seconds, up to 120 seconds:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers/internal-accounts?customerId=$CUSTOMER_ID&currency=USD"
```

6. **PASS criteria:** USD internal account `balance.amount` increases above `INITIAL_USD_BALANCE`.

---

### Test 5: USDC → USD Quote (Real-Time Funded → external USD bank account)

**Goal:** Convert USDC to USD and send to an external bank account via ACH.

**Steps:**

1. Create an external USD bank account:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{
    \"customerId\": \"$CUSTOMER_ID\",
    \"currency\": \"USD\",
    \"accountInfo\": {
      \"accountType\": \"USD_ACCOUNT\",
      \"paymentRails\": [\"ACH\"],
      \"routingNumber\": \"021000021\",
      \"accountNumber\": \"123456789012\",
      \"accountCategory\": \"CHECKING\",
      \"beneficiary\": {
        \"beneficiaryType\": \"INDIVIDUAL\",
        \"fullName\": \"USDC Test User\",
        \"birthDate\": \"1990-01-15\",
        \"nationality\": \"US\"
      }
    }
  }" \
  "$GRID_BASE_URL/customers/external-accounts"
```

Save the `id` as `USD_EXTERNAL_ID`.

2. Create a real-time funded quote:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{
    \"source\": {
      \"sourceType\": \"REALTIME_FUNDING\",
      \"customerId\": \"$CUSTOMER_ID\",
      \"currency\": \"USDC\",
      \"cryptoNetwork\": \"SOLANA_DEVNET\"
    },
    \"destination\": {
      \"destinationType\": \"ACCOUNT\",
      \"accountId\": \"$USD_EXTERNAL_ID\",
      \"paymentRail\": \"ACH\"
    },
    \"lockedCurrencySide\": \"RECEIVING\",
    \"lockedCurrencyAmount\": 10,
    \"purposeOfPayment\": \"GOODS_OR_SERVICES\"
  }" \
  "$GRID_BASE_URL/quotes"
```

3. Extract `QUOTE_ID`, `TRANSACTION_ID`, `PAYMENT_ADDRESS`, and `TOTAL_SENDING_AMOUNT` as in Test 4.

4. Send USDC to the payment instructions address:

```bash
$SOLANA_HELPER send-usdc --to $PAYMENT_ADDRESS --amount $TOTAL_SENDING_AMOUNT
```

5. Poll transaction status every 5 seconds, up to 120 seconds:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/transactions/$TRANSACTION_ID"
```

6. **PASS criteria:** Transaction status reaches `PROCESSING` or `COMPLETED`.

---

### Test 6: USDC → MXN Quote (Real-Time Funded → external MXN CLABE account)

**Goal:** Convert USDC to MXN and send to a Mexican bank account via SPEI.

**Steps:**

1. Create an external MXN account:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{
    \"customerId\": \"$CUSTOMER_ID\",
    \"currency\": \"MXN\",
    \"accountInfo\": {
      \"accountType\": \"MXN_ACCOUNT\",
      \"paymentRails\": [\"SPEI\"],
      \"clabeNumber\": \"032180000118359719\",
      \"beneficiary\": {
        \"beneficiaryType\": \"INDIVIDUAL\",
        \"fullName\": \"USDC Test User\",
        \"birthDate\": \"1990-01-15\",
        \"nationality\": \"MX\"
      }
    }
  }" \
  "$GRID_BASE_URL/customers/external-accounts"
```

Save the `id` as `MXN_EXTERNAL_ID`.

2. Create a real-time funded quote:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{
    \"source\": {
      \"sourceType\": \"REALTIME_FUNDING\",
      \"customerId\": \"$CUSTOMER_ID\",
      \"currency\": \"USDC\",
      \"cryptoNetwork\": \"SOLANA_DEVNET\"
    },
    \"destination\": {
      \"destinationType\": \"ACCOUNT\",
      \"accountId\": \"$MXN_EXTERNAL_ID\",
      \"paymentRail\": \"SPEI\"
    },
    \"lockedCurrencySide\": \"RECEIVING\",
    \"lockedCurrencyAmount\": 200,
    \"purposeOfPayment\": \"GOODS_OR_SERVICES\"
  }" \
  "$GRID_BASE_URL/quotes"
```

Note: `lockedCurrencyAmount: 200` = 2.00 MXN (smallest unit = centavos), roughly ~$0.10 USD.

3. Extract `QUOTE_ID`, `TRANSACTION_ID`, `PAYMENT_ADDRESS`, and `TOTAL_SENDING_AMOUNT`.

4. Send USDC:

```bash
$SOLANA_HELPER send-usdc --to $PAYMENT_ADDRESS --amount $TOTAL_SENDING_AMOUNT
```

5. Poll transaction status every 5 seconds, up to 120 seconds:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/transactions/$TRANSACTION_ID"
```

6. **PASS criteria:** Transaction status reaches `PROCESSING` or `COMPLETED`.

---

### Test 7: USD → USDC Quote (Account-Funded → external Solana wallet)

**Goal:** Convert USD from internal account to USDC delivered to our external Solana devnet wallet.

**Steps:**

1. Fund the USD internal account via sandbox endpoint:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{"amount": 100}' \
  "$GRID_BASE_URL/sandbox/internal-accounts/$USD_INTERNAL_ID/fund"
```

Verify the balance increased (response contains updated account).

2. Record initial on-chain USDC balance:

```bash
$SOLANA_HELPER usdc-balance
```

Save `raw` as `INITIAL_ONCHAIN_USDC_T7`.

3. Ensure USDC external account exists (reuse `$USDC_EXTERNAL_ID` from Test 3). If Test 3 was skipped, create it now.

4. Create an account-funded quote:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{
    \"source\": {
      \"sourceType\": \"ACCOUNT\",
      \"accountId\": \"$USD_INTERNAL_ID\"
    },
    \"destination\": {
      \"destinationType\": \"ACCOUNT\",
      \"accountId\": \"$USDC_EXTERNAL_ID\"
    },
    \"lockedCurrencySide\": \"SENDING\",
    \"lockedCurrencyAmount\": 50,
    \"purposeOfPayment\": \"GOODS_OR_SERVICES\"
  }" \
  "$GRID_BASE_URL/quotes"
```

Save `QUOTE_ID` and `TRANSACTION_ID` from the response.

5. Execute the quote:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST \
  "$GRID_BASE_URL/quotes/$QUOTE_ID/execute"
```

6. Poll on-chain USDC balance every 5 seconds, up to 120 seconds:

```bash
$SOLANA_HELPER usdc-balance
```

7. **PASS criteria:** On-chain USDC balance (`raw`) increases above `INITIAL_ONCHAIN_USDC_T7`.

---

## Results Summary

After all tests complete, print a final results table:

```
| # | Test Case                              | Status | Details |
|---|----------------------------------------|--------|---------|
| 1 | Customer + USDC Account Creation       | PASS/FAIL | ... |
| 2 | Fund Internal Account (devnet USDC)    | PASS/FAIL | ... |
| 3 | Transfer Out (USDC → Solana wallet)    | PASS/FAIL | ... |
| 4 | USDC → USD (RT funded → internal)      | PASS/FAIL | ... |
| 5 | USDC → USD (RT funded → external bank) | PASS/FAIL | ... |
| 6 | USDC → MXN (RT funded → CLABE)         | PASS/FAIL | ... |
| 7 | USD → USDC (Account funded → wallet)   | PASS/FAIL | ... |
```

Include in Details: relevant amounts, transaction IDs, error messages, or timing info.

## Error Handling

- If a test fails, record the failure and continue to the next test (do not abort the entire suite).
- If a polling loop times out, record FAIL with "timeout after 120s" and the last observed state.
- If the `send-usdc` command fails, check SOL balance (may need airdrop for gas) and USDC balance (may be insufficient).
- If a quote returns an error about `totalSendingAmount` being too small or too large, adjust the `lockedCurrencyAmount` and retry once.
- Common API errors:
  - `USER_NOT_FOUND`: sandbox VASP may not have the required user — note in results
  - `INSUFFICIENT_BALANCE`: the internal account doesn't have enough funds — note in results
  - `QUOTE_EXPIRED`: quote expired before funding — retry with faster execution

## Amounts Reference

All tests use small amounts to conserve devnet funds:
- Test 2: 0.50 USDC deposit (500000 micro-USDC)
- Test 3: 0.10 USDC transfer-out (100000 micro-USDC)
- Tests 4-5: ~$0.10 USD locked on receiving side (10 cents)
- Test 6: ~2.00 MXN locked on receiving side (~$0.10 USD)
- Test 7: $0.50 USD → USDC (50 cents)
- **Total USDC needed: ~1.0 USDC + gas (~0.01 SOL)**
