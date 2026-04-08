---
name: grid-base-usdc-sandbox
description: >
  End-to-end Base USDC sandbox flow tests using real Base Sepolia testnet funds. Use when the user asks to
  "test Base USDC flows", "run Base sandbox tests", "test Base deposits and withdrawals", "test Base USDC sandbox",
  "run e2e Base USDC test", "test Base realtime funding", "test Base USDC to USD", "test Base USDC to MXN",
  or wants to verify Grid's USDC deposit/withdrawal/quote pipeline on Base testnet.
allowed-tools:
  - Bash
  - Read
  - Grep
  - Glob
  - WebFetch
---

# Grid Base USDC Sandbox Flow Test

End-to-end test of USDC sandbox flows on Base Sepolia: deposits, withdrawals, and cross-currency quotes using real Base testnet funds.

## Prerequisites

Run these steps before any tests. Stop and report if any step fails.

### 1. Load Grid API credentials

```bash
export GRID_API_TOKEN_ID=$(jq -r .apiTokenId ~/.grid-credentials)
export GRID_API_CLIENT_SECRET=$(jq -r .apiClientSecret ~/.grid-credentials)
export GRID_BASE_URL=$(jq -r '.baseUrl // "https://api.lightspark.com/grid/2025-10-13"' ~/.grid-credentials)
```

### 1b. Detect sandbox vs non-sandbox platform

Try a sandbox endpoint to determine platform type. Save the result for use in tests that have sandbox-specific behavior.

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{"amount": 0}' \
  "$GRID_BASE_URL/sandbox/internal-accounts/dummy/fund"
```

- If the response contains `"not a sandbox platform"`, set `IS_SANDBOX=false`
- Otherwise (any other error like "not found", or success), set `IS_SANDBOX=true`

Report the detected mode to the user (e.g., "Detected non-sandbox platform" or "Detected sandbox platform").

### 2. Verify Base testnet key exists

```bash
jq -r '.baseTestnetPrivateKey // empty' ~/.grid-credentials
```

If empty, stop and tell the user to add `baseTestnetPrivateKey` (hex-encoded Ethereum private key, with or without `0x` prefix) to `~/.grid-credentials`.

### 3. Install Python dependencies

```bash
pip3 install web3 2>&1 | tail -5
```

### 4. Set helper alias

```bash
BASE_HELPER="python3 $(pwd)/.claude/skills/grid-base-usdc-sandbox/base_helper.py"
```

### 5. Check ETH balance (gas)

```bash
$BASE_HELPER eth-balance
```

If `eth` < 0.001, warn the user that they need Base Sepolia ETH for gas. They can obtain it from:
- https://www.alchemy.com/faucets/base-sepolia
- https://faucet.quicknode.com/base/sepolia

### 6. Check USDC balance

```bash
$BASE_HELPER usdc-balance
```

If `amount` < 1.0 USDC, warn the user that some tests may fail due to insufficient testnet USDC. The Base Sepolia USDC contract is `0x036CbD53842c5426634e7929541eC2318f3dCF7e` — they can obtain testnet USDC from Circle's testnet faucet at https://faucet.circle.com/ (select Base Sepolia).

### 7. Print wallet address

```bash
$BASE_HELPER wallet-address
```

Save the address as `$WALLET_ADDRESS` for use in test cases.

---

## Test Cases

Run tests sequentially. Each test may depend on state created by prior tests. Track results for the final summary table.

---

### Test 1: Customer + USDC Account Creation

**Goal:** Create a customer and verify USDC internal account with Base wallet funding instructions.

**Steps:**

1. Create a customer with a unique `platformCustomerId`:

```bash
PLATFORM_CUSTOMER_ID="base-usdc-test-$(date +%s)"
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{
    \"customerType\": \"INDIVIDUAL\",
    \"platformCustomerId\": \"$PLATFORM_CUSTOMER_ID\",
    \"fullName\": \"Base USDC Test User\",
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
   - `DEPOSIT_ADDRESS`: from the USDC account's `fundingPaymentInstructions` array, find the entry where `accountOrWalletInfo.accountType` is `BASE_WALLET` and extract `accountOrWalletInfo.address`

4. **PASS criteria:**
   - Customer created successfully
   - USDC internal account exists
   - `fundingPaymentInstructions` contains a `BASE_WALLET` entry with a non-empty `address`

---

### Test 2: Fund Internal Account with Real Testnet USDC

**Goal:** Send real USDC on Base Sepolia and verify Grid detects the deposit.

**Steps:**

1. Record initial USDC balance from internal account:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers/internal-accounts?customerId=$CUSTOMER_ID&currency=USDC"
```

Save initial `balance.amount` as `INITIAL_USDC_BALANCE`.

2. Send 0.50 USDC to the deposit address:

```bash
$BASE_HELPER send-usdc --to $DEPOSIT_ADDRESS --amount 500000
```

Verify the send was confirmed (status = "confirmed").

3. Poll for balance update every 5 seconds, up to 120 seconds:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers/internal-accounts?customerId=$CUSTOMER_ID&currency=USDC"
```

4. **PASS criteria:** USDC internal account `balance.amount` increases above `INITIAL_USDC_BALANCE`.

---

### Test 3: Transfer Out (USDC internal → external Base wallet)

**Goal:** Withdraw USDC from internal account to an external Base Sepolia wallet.

**Steps:**

1. Create an external account for our wallet:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{
    \"customerId\": \"$CUSTOMER_ID\",
    \"currency\": \"USDC\",
    \"cryptoNetwork\": \"BASE_TESTNET\",
    \"accountInfo\": {
      \"accountType\": \"BASE_WALLET\",
      \"address\": \"$WALLET_ADDRESS\"
    }
  }" \
  "$GRID_BASE_URL/customers/external-accounts"
```

Save the `id` as `USDC_EXTERNAL_ID`.

2. Record initial on-chain USDC balance:

```bash
$BASE_HELPER usdc-balance
```

Save `raw` as `INITIAL_ONCHAIN_USDC`.

3. Transfer out 0.20 USDC:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{
    \"source\": {\"accountId\": \"$USDC_INTERNAL_ID\"},
    \"destination\": {\"accountId\": \"$USDC_EXTERNAL_ID\"},
    \"amount\": 200000
  }" \
  "$GRID_BASE_URL/transfer-out"
```

Note: the amount must exceed the custody provider fee (~100100 micro-USDC), so 200000 is the minimum safe amount.

4. Poll on-chain USDC balance every 5 seconds, up to 120 seconds:

```bash
$BASE_HELPER usdc-balance
```

5. **PASS criteria:** On-chain USDC balance (`raw`) increases above `INITIAL_ONCHAIN_USDC` (net amount will be ~99900 after fees).

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
      \"cryptoNetwork\": \"BASE_TESTNET\"
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
   - `PAYMENT_ADDRESS`: from `paymentInstructions`, find the `BASE_WALLET` entry and extract `accountOrWalletInfo.address`
   - `TOTAL_SENDING_AMOUNT`: the `totalSendingAmount` field (this is the micro-USDC amount to send)

3. Record initial USD internal account balance:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers/internal-accounts?customerId=$CUSTOMER_ID&currency=USD"
```

Save `balance.amount` as `INITIAL_USD_BALANCE`.

4. Send USDC to the payment instructions address:

```bash
$BASE_HELPER send-usdc --to $PAYMENT_ADDRESS --amount $TOTAL_SENDING_AMOUNT
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
        \"fullName\": \"Base USDC Test User\",
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
      \"cryptoNetwork\": \"BASE_TESTNET\"
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
$BASE_HELPER send-usdc --to $PAYMENT_ADDRESS --amount $TOTAL_SENDING_AMOUNT
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
        \"fullName\": \"Base USDC Test User\",
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
      \"cryptoNetwork\": \"BASE_TESTNET\"
    },
    \"destination\": {
      \"destinationType\": \"ACCOUNT\",
      \"accountId\": \"$MXN_EXTERNAL_ID\"
    },
    \"lockedCurrencySide\": \"RECEIVING\",
    \"lockedCurrencyAmount\": 200,
    \"purposeOfPayment\": \"GOODS_OR_SERVICES\"
  }" \
  "$GRID_BASE_URL/quotes"
```

Note: `lockedCurrencyAmount: 200` = 2.00 MXN (smallest unit = centavos), roughly ~$0.10 USD. Do not include `paymentRail` — the API infers it from the external account.

3. Extract `QUOTE_ID`, `TRANSACTION_ID`, `PAYMENT_ADDRESS`, and `TOTAL_SENDING_AMOUNT`.

4. Send USDC:

```bash
$BASE_HELPER send-usdc --to $PAYMENT_ADDRESS --amount $TOTAL_SENDING_AMOUNT
```

5. Poll transaction status every 5 seconds, up to 120 seconds:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/transactions/$TRANSACTION_ID"
```

6. **PASS criteria:** Transaction status reaches `PROCESSING` or `COMPLETED`.

---

### Test 7: USD → USDC Quote (Account-Funded → external Base wallet)

**Goal:** Convert USD from internal account to USDC delivered to our external Base Sepolia wallet.

**Steps:**

1. Fund the USD internal account:

**If `IS_SANDBOX=true`:** Use the sandbox fund endpoint:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{"amount": 100}' \
  "$GRID_BASE_URL/sandbox/internal-accounts/$USD_INTERNAL_ID/fund"
```

Verify the balance increased (response contains updated account).

**If `IS_SANDBOX=false`:** Check the current USD internal account balance. If balance is 0, skip this test with a note: "SKIP: Non-sandbox platform — USD internal account has no balance. Requires a prior successful USDC→USD conversion (Test 4) or manual funding." If balance > 0, proceed.

2. Record initial on-chain USDC balance:

```bash
$BASE_HELPER usdc-balance
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
$BASE_HELPER usdc-balance
```

7. **PASS criteria:** On-chain USDC balance (`raw`) increases above `INITIAL_ONCHAIN_USDC_T7`.

---

## Results Summary

After all tests complete, print a final results table:

```
| # | Test Case                              | Status | Details |
|---|----------------------------------------|--------|---------|
| 1 | Customer + USDC Account Creation       | PASS/FAIL | ... |
| 2 | Fund Internal Account (Base USDC)      | PASS/FAIL | ... |
| 3 | Transfer Out (USDC → Base wallet)      | PASS/FAIL | ... |
| 4 | USDC → USD (RT funded → internal)      | PASS/FAIL | ... |
| 5 | USDC → USD (RT funded → external bank) | PASS/FAIL | ... |
| 6 | USDC → MXN (RT funded → CLABE)         | PASS/FAIL | ... |
| 7 | USD → USDC (Account funded → wallet)   | PASS/FAIL | ... |
```

Include in Details: relevant amounts, transaction IDs, error messages, or timing info.

## Error Handling

- If a test fails, record the failure and continue to the next test (do not abort the entire suite).
- If a polling loop times out, record FAIL with "timeout after 120s" and the last observed state.
- If the `send-usdc` command fails, check ETH balance (may need testnet ETH for gas) and USDC balance (may be insufficient).
- If a quote returns an error about `totalSendingAmount` being too small or too large, adjust the `lockedCurrencyAmount` and retry once.
- Common API errors:
  - `USER_NOT_FOUND`: sandbox VASP may not have the required user — note in results
  - `INSUFFICIENT_BALANCE`: the internal account doesn't have enough funds — note in results
  - `QUOTE_EXPIRED`: quote expired before funding — retry with faster execution

## Amounts Reference

All tests use small amounts to conserve testnet funds:
- Test 2: 0.50 USDC deposit (500000 micro-USDC)
- Test 3: 0.20 USDC transfer-out (200000 micro-USDC) — must exceed ~100100 custody fee
- Tests 4-5: ~$0.10 USD locked on receiving side (10 cents)
- Test 6: ~2.00 MXN locked on receiving side (~$0.10 USD)
- Test 7: $0.50 USD → USDC (50 cents) — requires sandbox or prior USD balance
- **Total USDC needed: ~1.2 USDC + gas (~0.001 ETH on Base Sepolia)**
