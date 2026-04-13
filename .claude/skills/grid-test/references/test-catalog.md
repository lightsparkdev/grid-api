# Test Catalog

All tests use these chain variables (set per-chain in SKILL.md Step 4):
- `chain_helper` — shell function wrapping the chain's helper script (defined in SKILL.md Step 4)
- `$CRYPTO_NETWORK` — e.g., `SOLANA_DEVNET`, `BASE_TESTNET`, `POLYGON_TESTNET`
- `$WALLET_TYPE` — e.g., `SOLANA_WALLET`, `BASE_WALLET`, `POLYGON_WALLET`
- `$WALLET_ADDRESS` — the test wallet's on-chain address
- `$TRANSFER_OUT_AMT` — chain-specific minimum transfer-out amount
- `$IS_SANDBOX` — whether the platform is sandbox
- `$CHAIN_PREFIX` — unique prefix for this chain run (e.g., `solana-test`, `base-test`, `polygon-test`)

API credentials are in environment variables: `$GRID_API_TOKEN_ID`, `$GRID_API_CLIENT_SECRET`, `$GRID_BASE_URL`.

---

## Test 1: Customer + USDC Account Creation

**Goal:** Create a customer and verify USDC internal account with chain-specific wallet funding instructions.

**Steps:**

1. Create a customer:

```bash
PLATFORM_CUSTOMER_ID="$CHAIN_PREFIX-$(date +%s)"
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{
    \"customerType\": \"INDIVIDUAL\",
    \"platformCustomerId\": \"$PLATFORM_CUSTOMER_ID\",
    \"fullName\": \"Grid Test User\",
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
   - `DEPOSIT_ADDRESS`: from the USDC account's `fundingPaymentInstructions` array, find the entry where `accountOrWalletInfo.accountType` is `$WALLET_TYPE` and extract `accountOrWalletInfo.address`

4. **PASS criteria:**
   - Customer created successfully
   - USDC internal account exists
   - `fundingPaymentInstructions` contains a `$WALLET_TYPE` entry with a non-empty `address`

---

## Test 2: Fund Internal Account with Real Testnet USDC

**Goal:** Send real USDC on the chain's testnet and verify Grid detects the deposit.

**Steps:**

1. Record initial USDC balance from internal account:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers/internal-accounts?customerId=$CUSTOMER_ID&currency=USDC"
```

Save initial `balance.amount` as `INITIAL_USDC_BALANCE`.

2. Send 0.50 USDC to the deposit address:

```bash
chain_helper send-usdc --to $DEPOSIT_ADDRESS --amount 500000
```

Verify the send was confirmed (status = "confirmed").

3. Poll for balance update every 5 seconds, up to 120 seconds:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers/internal-accounts?customerId=$CUSTOMER_ID&currency=USDC"
```

4. **PASS criteria:** USDC internal account `balance.amount` increases above `INITIAL_USDC_BALANCE`.

---

## Test 3: Transfer Out (USDC internal -> external wallet)

**Goal:** Withdraw USDC from internal account to an external wallet on this chain.

**Steps:**

1. Create an external account for our wallet:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{
    \"customerId\": \"$CUSTOMER_ID\",
    \"currency\": \"USDC\",
    \"cryptoNetwork\": \"$CRYPTO_NETWORK\",
    \"accountInfo\": {
      \"accountType\": \"$WALLET_TYPE\",
      \"address\": \"$WALLET_ADDRESS\"
    }
  }" \
  "$GRID_BASE_URL/customers/external-accounts"
```

Save the `id` as `USDC_EXTERNAL_ID`.

2. Record initial on-chain USDC balance:

```bash
chain_helper usdc-balance
```

Save `raw` as `INITIAL_ONCHAIN_USDC`.

3. Transfer out:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{
    \"source\": {\"accountId\": \"$USDC_INTERNAL_ID\"},
    \"destination\": {\"accountId\": \"$USDC_EXTERNAL_ID\"},
    \"amount\": $TRANSFER_OUT_AMT
  }" \
  "$GRID_BASE_URL/transfer-out"
```

4. Poll on-chain USDC balance every 5 seconds, up to 120 seconds:

```bash
chain_helper usdc-balance
```

5. **PASS criteria:** On-chain USDC balance (`raw`) increases above `INITIAL_ONCHAIN_USDC`.

---

## Test 4: USDC -> USD Quote (Real-Time Funded -> internal USD account)

**Goal:** Use real-time funding to convert USDC to USD, depositing into the customer's internal USD account.

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
      \"cryptoNetwork\": \"$CRYPTO_NETWORK\"
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
   - `PAYMENT_ADDRESS`: from `paymentInstructions`, find the `$WALLET_TYPE` entry and extract `accountOrWalletInfo.address`
   - `TOTAL_SENDING_AMOUNT`: the `totalSendingAmount` field (micro-USDC amount to send)

3. Record initial USD internal account balance:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers/internal-accounts?customerId=$CUSTOMER_ID&currency=USD"
```

Save `balance.amount` as `INITIAL_USD_BALANCE`.

4. Send USDC to the payment instructions address:

```bash
chain_helper send-usdc --to $PAYMENT_ADDRESS --amount $TOTAL_SENDING_AMOUNT
```

5. Poll USD internal account balance every 5 seconds, up to 120 seconds:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers/internal-accounts?customerId=$CUSTOMER_ID&currency=USD"
```

6. **PASS criteria:** USD internal account `balance.amount` increases above `INITIAL_USD_BALANCE`.

---

## Test 5: USDC -> USD Quote (Real-Time Funded -> external USD bank account)

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
        \"fullName\": \"Grid Test User\",
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
      \"cryptoNetwork\": \"$CRYPTO_NETWORK\"
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
chain_helper send-usdc --to $PAYMENT_ADDRESS --amount $TOTAL_SENDING_AMOUNT
```

5. Poll transaction status every 5 seconds, up to 120 seconds:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/transactions/$TRANSACTION_ID"
```

6. **PASS criteria:** Transaction status reaches `PROCESSING` or `COMPLETED`.

---

## Test 6: USDC -> MXN Quote (Real-Time Funded -> external MXN CLABE account)

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
        \"fullName\": \"Grid Test User\",
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
      \"cryptoNetwork\": \"$CRYPTO_NETWORK\"
    },
    \"destination\": {
      \"destinationType\": \"ACCOUNT\",
      \"accountId\": \"$MXN_EXTERNAL_ID\"
    },
    \"lockedCurrencySide\": \"RECEIVING\",
    \"lockedCurrencyAmount\": 1100,
    \"purposeOfPayment\": \"GOODS_OR_SERVICES\"
  }" \
  "$GRID_BASE_URL/quotes"
```

Note: `lockedCurrencyAmount: 1100` = 11.00 MXN (centavos), roughly ~$0.55 USD. Some environments enforce a minimum of 1100 centavos. If the quote returns `AMOUNT_OUT_OF_RANGE`, increase the amount to the specified minimum. Do not include `paymentRail` — the API infers it from the external account.

3. Extract `QUOTE_ID`, `TRANSACTION_ID`, `PAYMENT_ADDRESS`, and `TOTAL_SENDING_AMOUNT`.

4. Send USDC:

```bash
chain_helper send-usdc --to $PAYMENT_ADDRESS --amount $TOTAL_SENDING_AMOUNT
```

5. Poll transaction status every 5 seconds, up to 120 seconds:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/transactions/$TRANSACTION_ID"
```

6. **PASS criteria:** Transaction status reaches `PROCESSING` or `COMPLETED`.

---

## Test 7: USD -> USDC Quote (Account-Funded -> external wallet)

**Goal:** Convert USD from internal account to USDC delivered to our external wallet on this chain.

**Steps:**

1. Fund the USD internal account:

   **If `IS_SANDBOX=true`:** Use the sandbox fund endpoint:

   ```bash
   curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
     -X POST -H "Content-Type: application/json" \
     -d '{"amount": 100}' \
     "$GRID_BASE_URL/sandbox/internal-accounts/$USD_INTERNAL_ID/fund"
   ```

   Verify the balance increased.

   **If `IS_SANDBOX=false`:** Check the current USD internal account balance. If balance is 0, skip this test with: "SKIP: Non-sandbox platform with no USD balance. Requires a prior USDC->USD conversion (Test 4) or manual funding." If balance > 0, proceed.

2. Record initial on-chain USDC balance:

```bash
chain_helper usdc-balance
```

Save `raw` as `INITIAL_ONCHAIN_USDC_T7`.

3. Ensure USDC external account exists (reuse `$USDC_EXTERNAL_ID` from Test 3). If Test 3 was skipped, create it now using the same pattern as Test 3 step 1.

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
chain_helper usdc-balance
```

7. **PASS criteria:** On-chain USDC balance (`raw`) increases above `INITIAL_ONCHAIN_USDC_T7`.

---

## Test 8: USDC -> USD Quote (Account-Funded -> internal USD account)

**Goal:** Convert USDC from internal account to USD in the customer's internal USD account, using existing USDC balance (no real-time funding).

**Steps:**

1. Check USDC internal account balance:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers/internal-accounts?customerId=$CUSTOMER_ID&currency=USDC"
```

If `balance.amount` is 0, skip this test with: "SKIP: No USDC in internal account. Requires a prior deposit (Test 2)."

2. Record initial USD internal account balance:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers/internal-accounts?customerId=$CUSTOMER_ID&currency=USD"
```

Save `balance.amount` as `INITIAL_USD_BALANCE_T8`.

3. Create an account-funded quote:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{
    \"source\": {
      \"sourceType\": \"ACCOUNT\",
      \"accountId\": \"$USDC_INTERNAL_ID\"
    },
    \"destination\": {
      \"destinationType\": \"ACCOUNT\",
      \"accountId\": \"$USD_INTERNAL_ID\"
    },
    \"lockedCurrencySide\": \"SENDING\",
    \"lockedCurrencyAmount\": 50000,
    \"purposeOfPayment\": \"GOODS_OR_SERVICES\"
  }" \
  "$GRID_BASE_URL/quotes"
```

Save `QUOTE_ID` and `TRANSACTION_ID`.

4. Execute the quote:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST \
  "$GRID_BASE_URL/quotes/$QUOTE_ID/execute"
```

5. Poll USD internal account balance every 5 seconds, up to 120 seconds:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers/internal-accounts?customerId=$CUSTOMER_ID&currency=USD"
```

6. **PASS criteria:** USD internal account `balance.amount` increases above `INITIAL_USD_BALANCE_T8`.

---

## Test 9: USDC -> MXN Quote (Account-Funded -> external MXN CLABE account)

**Goal:** Convert USDC from internal account to MXN and send to a Mexican bank account, using existing USDC balance.

**Steps:**

1. Check USDC internal account balance:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers/internal-accounts?customerId=$CUSTOMER_ID&currency=USDC"
```

If `balance.amount` is 0, skip this test with: "SKIP: No USDC in internal account. Requires a prior deposit (Test 2)."

2. Ensure MXN external account exists (reuse `$MXN_EXTERNAL_ID` from Test 6). If Test 6 was skipped, create it now:

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
        \"fullName\": \"Grid Test User\",
        \"birthDate\": \"1990-01-15\",
        \"nationality\": \"MX\"
      }
    }
  }" \
  "$GRID_BASE_URL/customers/external-accounts"
```

Save `id` as `MXN_EXTERNAL_ID`.

3. Create an account-funded quote:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{
    \"source\": {
      \"sourceType\": \"ACCOUNT\",
      \"accountId\": \"$USDC_INTERNAL_ID\"
    },
    \"destination\": {
      \"destinationType\": \"ACCOUNT\",
      \"accountId\": \"$MXN_EXTERNAL_ID\"
    },
    \"lockedCurrencySide\": \"SENDING\",
    \"lockedCurrencyAmount\": 50000,
    \"purposeOfPayment\": \"GOODS_OR_SERVICES\"
  }" \
  "$GRID_BASE_URL/quotes"
```

Save `QUOTE_ID` and `TRANSACTION_ID`.

4. Execute the quote:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST \
  "$GRID_BASE_URL/quotes/$QUOTE_ID/execute"
```

5. Poll transaction status every 5 seconds, up to 120 seconds:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/transactions/$TRANSACTION_ID"
```

6. **PASS criteria:** Transaction status reaches `PROCESSING` or `COMPLETED`.

---

## Test 10: USDC -> USD Quote (Real-Time Funded -> UMA address)

**Goal:** Use real-time USDC funding to send USD to a UMA address.

**Steps:**

1. Look up a UMA receiver. Use `$UMA_RECEIVER` if set, otherwise default to `$test@sandbox.grid.uma.money`:

```bash
UMA_RECEIVER="${UMA_RECEIVER:-\$test@sandbox.grid.uma.money}"
UMA_ENCODED=$(echo "$UMA_RECEIVER" | sed 's/\$/%24/g; s/@/%40/g')
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/receiver/uma/$UMA_ENCODED"
```

If the lookup fails or returns an error, skip this test with: "SKIP: UMA receiver lookup failed. Set `UMA_RECEIVER` in environment or ensure sandbox UMA is available."

Save the `id` as `LOOKUP_ID`. Note the supported receiving currencies from the response.

2. Create a real-time funded quote:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{
    \"lookupId\": \"$LOOKUP_ID\",
    \"source\": {
      \"sourceType\": \"REALTIME_FUNDING\",
      \"customerId\": \"$CUSTOMER_ID\",
      \"currency\": \"USDC\",
      \"cryptoNetwork\": \"$CRYPTO_NETWORK\"
    },
    \"destination\": {
      \"destinationType\": \"UMA_ADDRESS\",
      \"umaAddress\": \"$UMA_RECEIVER\",
      \"currency\": \"USD\"
    },
    \"lockedCurrencySide\": \"RECEIVING\",
    \"lockedCurrencyAmount\": 10,
    \"purposeOfPayment\": \"GOODS_OR_SERVICES\"
  }" \
  "$GRID_BASE_URL/quotes"
```

3. Extract from the response:
   - `QUOTE_ID`: the `id` field
   - `TRANSACTION_ID`: the `transactionId` field
   - `PAYMENT_ADDRESS`: from `paymentInstructions`, find the `$WALLET_TYPE` entry and extract `accountOrWalletInfo.address`
   - `TOTAL_SENDING_AMOUNT`: the `totalSendingAmount` field

4. Send USDC to the payment instructions address:

```bash
chain_helper send-usdc --to $PAYMENT_ADDRESS --amount $TOTAL_SENDING_AMOUNT
```

5. Poll transaction status every 5 seconds, up to 120 seconds:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/transactions/$TRANSACTION_ID"
```

6. **PASS criteria:** Transaction status reaches `PROCESSING` or `COMPLETED`.

---

## Test 11: USD -> USD Quote (Account-Funded -> UMA address)

**Goal:** Send USD from internal account to a UMA address.

**Steps:**

1. Check USD internal account balance:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers/internal-accounts?customerId=$CUSTOMER_ID&currency=USD"
```

If `balance.amount` is 0:
- If `IS_SANDBOX=true`, fund it first:
  ```bash
  curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
    -X POST -H "Content-Type: application/json" \
    -d '{"amount": 100}' \
    "$GRID_BASE_URL/sandbox/internal-accounts/$USD_INTERNAL_ID/fund"
  ```
- If `IS_SANDBOX=false`, skip this test with: "SKIP: Non-sandbox platform with no USD balance."

2. Look up a UMA receiver (reuse `$LOOKUP_ID` and `$UMA_RECEIVER` from Test 10). If Test 10 was skipped, perform the lookup now using the same pattern as Test 10 step 1. If lookup fails, skip this test.

3. Create an account-funded quote:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{
    \"lookupId\": \"$LOOKUP_ID\",
    \"source\": {
      \"sourceType\": \"ACCOUNT\",
      \"accountId\": \"$USD_INTERNAL_ID\"
    },
    \"destination\": {
      \"destinationType\": \"UMA_ADDRESS\",
      \"umaAddress\": \"$UMA_RECEIVER\",
      \"currency\": \"USD\"
    },
    \"lockedCurrencySide\": \"SENDING\",
    \"lockedCurrencyAmount\": 10,
    \"purposeOfPayment\": \"GOODS_OR_SERVICES\"
  }" \
  "$GRID_BASE_URL/quotes"
```

Save `QUOTE_ID` and `TRANSACTION_ID`.

4. Execute the quote:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST \
  "$GRID_BASE_URL/quotes/$QUOTE_ID/execute"
```

5. Poll transaction status every 5 seconds, up to 120 seconds:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/transactions/$TRANSACTION_ID"
```

6. **PASS criteria:** Transaction status reaches `PROCESSING` or `COMPLETED`.
