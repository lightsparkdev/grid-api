# Embedded Wallet Test Catalog

All tests use these variables (set in SKILL.md Step 4):
- `$TMP_DIR` — workspace for client keys and session signing key (e.g., `/tmp/grid-ew-<timestamp>`)
- `$CUSTOMER_ID` — `Customer:...` of the test customer
- `$WALLET_ID` — `InternalAccount:...` of the embedded wallet (USDB)
- `$USD_INTERNAL_ID` — `InternalAccount:...` of the customer's USD internal account
- `$AUTH_METHOD_ID` — `AuthMethod:...` of the email OTP credential
- `$SESSION_KEY_PATH` — path to the decrypted 32-byte session signing key
- `$SESSION_EXPIRES_AT` — ISO-8601 timestamp when the session expires
- `$EW_HELPER` — bash function `ew_helper` defined in SKILL.md (wraps `embedded_wallet_helper.py`)
- `$BASE_HELPER` — bash function `base_helper` (from grid-test/scripts/base_helper.py) for on-chain USDC sends

API credentials are in env vars: `$GRID_API_TOKEN_ID`, `$GRID_API_CLIENT_SECRET`, `$GRID_BASE_URL`.

`payloadToSign` strings must be signed **byte-for-byte exactly as Grid returns them**. Do not parse, re-serialize, trim, or normalize JSON — the verifier hashes the same bytes.

---

## Test 1: Customer + Embedded Wallet provisioning

**Goal:** Create a customer; verify Grid auto-provisions a USDB embedded wallet.

**Steps:**

1. Create a customer with email so we can register an OTP credential later. The `email` is required by the OTP credential check downstream — without it `POST /auth/credentials` returns `Cannot register an EMAIL_OTP credential: the customer record owning this internal account has no email on file`. `fullName` is required on most platforms (`full_name is required for this platform`). `region` requires a paired `currencies` array; if you don't need region restrictions, omit both fields:

```bash
PLATFORM_CUSTOMER_ID="ew-test-$(date +%s)"
EMAIL=$(jq -r '.otpEmail // empty' ~/.grid-credentials)
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{
    \"customerType\": \"INDIVIDUAL\",
    \"platformCustomerId\": \"$PLATFORM_CUSTOMER_ID\",
    \"email\": \"$EMAIL\",
    \"fullName\": \"EW Test User\"
  }" \
  "$GRID_BASE_URL/customers"
```

The response does NOT include `internalAccounts` — fetch them in the next step.

Save the response `id` as `CUSTOMER_ID`.

2. List internal accounts and find the embedded wallet:

```bash
ACCOUNTS=$(curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers/internal-accounts?customerId=$CUSTOMER_ID&limit=100")
WALLET_ID=$(echo "$ACCOUNTS" | jq -r '.data[] | select(.type == "EMBEDDED_WALLET") | .id')
WALLET_CURRENCY=$(echo "$ACCOUNTS" | jq -r '.data[] | select(.type == "EMBEDDED_WALLET") | .balance.currency.code')
USD_INTERNAL_ID=$(echo "$ACCOUNTS" | jq -r '.data[] | select(.balance.currency.code == "USD") | .id')
```

3. **PASS criteria:**
   - Customer created (non-empty `CUSTOMER_ID`).
   - `WALLET_ID` is non-empty (an `EMBEDDED_WALLET` was auto-provisioned).
   - `WALLET_CURRENCY` equals `"USDB"` — the wallet is denominated in the right asset.

   If no `EMBEDDED_WALLET` is found, the platform doesn't have USDB enabled — stop and warn the user.

---

## Test 2: Register email OTP credential

**Goal:** Register an `EMAIL_OTP` credential against the embedded wallet. Receives an OTP email to the customer's address.

**Steps:**

1. Create the credential:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{
    \"type\": \"EMAIL_OTP\",
    \"accountId\": \"$WALLET_ID\",
    \"email\": \"$EMAIL\"
  }" \
  "$GRID_BASE_URL/auth/credentials"
```

Save `id` as `AUTH_METHOD_ID`.

2. **PASS criteria:** 201 response with `type: "EMAIL_OTP"` and a valid `AuthMethod:...` id.

3. **OTP delivery:**
   - **If `IS_SANDBOX=true`:** the sandbox accepts `OTP_CODE=000000` regardless of what's emailed. Set it directly and skip the user prompt.
   - **Otherwise:** ask the user to check `$EMAIL` and provide the code as `OTP_CODE`. The next test consumes `OTP_CODE`.

   Note: only one EMAIL_OTP credential per wallet is allowed. Re-registering against the same wallet returns `NOT_IMPLEMENTED: This internal account already has an embedded wallet. Resending an OTP or adding an additional credential is not yet implemented.` If you need a fresh challenge in dev (where `POST /auth/credentials/{id}/challenge` returns 404), start over with a new customer.

---

## Test 3: Verify credential and obtain session signing key

**Goal:** Submit the OTP value plus a fresh client public key, get back a session that can sign wallet actions.

**Steps:**

1. Generate a fresh P-256 client key pair (the private key stays in `$TMP_DIR`). Even though `decrypt-session-key` is skipped in sandbox, generating + sending a real public key is still required — the verify endpoint validates it (`INTERNAL_ERROR` if malformed):

```bash
KEYS=$(ew_helper generate-client-keypair --output-dir "$TMP_DIR")
CLIENT_PUBKEY_HEX=$(echo "$KEYS" | jq -r '.public_key_hex')
CLIENT_PRIVKEY_PATH=$(echo "$KEYS" | jq -r '.private_key_path')
```

2. Verify the credential. **The `type` discriminator is required** — omitting it returns `INTERNAL_ERROR: Something went wrong`:

```bash
VERIFY_RESPONSE=$(curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{
    \"type\": \"EMAIL_OTP\",
    \"otp\": \"$OTP_CODE\",
    \"clientPublicKey\": \"$CLIENT_PUBKEY_HEX\"
  }" \
  "$GRID_BASE_URL/auth/credentials/$AUTH_METHOD_ID/verify")
ENCRYPTED_SESSION_KEY=$(echo "$VERIFY_RESPONSE" | jq -r '.encryptedSessionSigningKey')
SESSION_EXPIRES_AT=$(echo "$VERIFY_RESPONSE" | jq -r '.expiresAt')
```

3. Stash the session for later use:

   - **If `IS_SANDBOX=true`:** stop here. The `encryptedSessionSigningKey` is a stub and won't decrypt. Tests 7 & 8 will use `Grid-Wallet-Signature: sandbox-valid-signature` instead. Optionally remove the client key file — it's not needed.
   - **Otherwise:** decrypt the session signing key:

     ```bash
     SESSION_KEY_PATH=$(ew_helper decrypt-session-key \
       --encrypted-key "$ENCRYPTED_SESSION_KEY" \
       --private-key-path "$CLIENT_PRIVKEY_PATH" \
       --output-dir "$TMP_DIR" | jq -r '.session_key_path')
     ```

4. **PASS criteria:**
   - Verify returns 200 with non-empty `encryptedSessionSigningKey` and an `expiresAt` ~15 minutes out.
   - In non-sandbox: helper writes a 32-byte `session_signing_key.bin`.
   - In sandbox: just the 200 response — no decrypt expected.

---

## Test 4: Fund the wallet

**Goal:** Get USDB into the embedded wallet so subsequent withdrawal tests have a balance to draw from.

**Steps:**

1. Fund the wallet:

   **If `IS_SANDBOX=true`:** Use the sandbox fund endpoint to credit USDB directly:

   ```bash
   curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
     -X POST -H "Content-Type: application/json" \
     -d '{"amount": 100000}' \
     "$GRID_BASE_URL/sandbox/internal-accounts/$WALLET_ID/fund"
   ```

   This credits 1,000.00 USDB.

   **If `IS_SANDBOX=false`:** Skip with a note that funding requires either the sandbox endpoint or a successful incoming quote (Test 5 or 6 below). If Test 5 or 6 already deposited USDB, that satisfies this dependency.

2. Poll the wallet balance until `balance.amount > 0`:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers/internal-accounts?customerId=$CUSTOMER_ID&limit=100" \
  | jq '.data[] | select(.id == "'$WALLET_ID'") | .balance'
```

3. **PASS criteria:** Wallet `balance.amount > 0`.

---

## Test 5: Quote TO wallet from internal USD (account-funded)

**Goal:** Send USD from the customer's USD internal account into the embedded wallet. Incoming = no signature required.

**Prerequisite:** USD internal account must have a balance. If it's 0 and `IS_SANDBOX=true`, sandbox-fund it first:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{"amount": 10000}' \
  "$GRID_BASE_URL/sandbox/internal-accounts/$USD_INTERNAL_ID/fund"
```

If non-sandbox and USD internal balance is 0, skip with a note.

**Steps:**

1. Record initial wallet balance:

```bash
INITIAL_USDB=$(curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/customers/internal-accounts?customerId=$CUSTOMER_ID&limit=100" \
  | jq -r '.data[] | select(.id == "'$WALLET_ID'") | .balance.amount')
```

2. Create an account-funded quote with the embedded wallet as destination:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{
    \"source\": {\"sourceType\": \"ACCOUNT\", \"accountId\": \"$USD_INTERNAL_ID\"},
    \"destination\": {\"destinationType\": \"ACCOUNT\", \"accountId\": \"$WALLET_ID\"},
    \"lockedCurrencySide\": \"SENDING\",
    \"lockedCurrencyAmount\": 100,
    \"purposeOfPayment\": \"GOODS_OR_SERVICES\"
  }" \
  "$GRID_BASE_URL/quotes"
```

Save `id` as `QUOTE_ID` and `transactionId` as `TX_ID`.

3. Execute the quote (no signature header — incoming):

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST "$GRID_BASE_URL/quotes/$QUOTE_ID/execute"
```

4. Poll wallet balance every 5s up to 120s; check transaction status reaches `PROCESSING` or `COMPLETED`.

5. **PASS criteria:** Wallet balance increases above `INITIAL_USDB` AND transaction status is `PROCESSING` or `COMPLETED`.

---

## Test 6: Quote TO wallet from external USDC on Base (real-time funded)

**Goal:** Use real-time USDC funding from Base to credit USDB into the embedded wallet. Auto-executes when on-chain deposit detected. No signature required.

**Prerequisite:** `baseTestnetPrivateKey` (or `baseMainnetPrivateKey` for mainnet) in `~/.grid-credentials` and the `base_helper` shell function defined.

**Steps:**

1. Pick the right `cryptoNetwork` for the env: `BASE_TESTNET` if `IS_SANDBOX=true`, otherwise `BASE_MAINNET`.

   ```bash
   if [ "$IS_SANDBOX" = "true" ]; then BASE_NETWORK="BASE_TESTNET"; else BASE_NETWORK="BASE_MAINNET"; fi
   ```

2. Record initial wallet balance.

3. Create an RT-funded quote:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{
    \"source\": {
      \"sourceType\": \"REALTIME_FUNDING\",
      \"customerId\": \"$CUSTOMER_ID\",
      \"currency\": \"USDC\",
      \"cryptoNetwork\": \"$BASE_NETWORK\"
    },
    \"destination\": {\"destinationType\": \"ACCOUNT\", \"accountId\": \"$WALLET_ID\"},
    \"lockedCurrencySide\": \"RECEIVING\",
    \"lockedCurrencyAmount\": 100,
    \"purposeOfPayment\": \"GOODS_OR_SERVICES\"
  }" \
  "$GRID_BASE_URL/quotes"
```

Extract `transactionId`, `totalSendingAmount`, and the `BASE_WALLET` payment address from `paymentInstructions`.

3. Send USDC on-chain to the payment address:

```bash
base_helper send-usdc --to "$PAYMENT_ADDRESS" --amount "$TOTAL_SENDING_AMOUNT"
```

4. Poll transaction status every 5s up to 180s.

5. **PASS criteria:** Transaction status reaches `PROCESSING` or `COMPLETED` AND wallet balance increases.

---

## Test 7: Quote FROM wallet to external USD bank (signed outgoing)

**Goal:** Withdraw USDB from the embedded wallet to a USD ACH bank account. Requires signing the quote's `payloadToSign`.

**Prerequisite:** Test 4, 5, or 6 has put USDB into the wallet, AND Test 3 produced a valid session signing key.

**Steps:**

1. Create a USD external account (ACH):

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
        \"fullName\": \"EW Test User\",
        \"birthDate\": \"1990-01-15\",
        \"nationality\": \"US\"
      }
    }
  }" \
  "$GRID_BASE_URL/customers/external-accounts"
```

Save `id` as `USD_EXTERNAL_ID`.

2. Create the outgoing quote (source = embedded wallet, destination = USD ACH). Capture the full response so we can extract `payloadToSign` byte-exact:

```bash
QUOTE_RESPONSE=$(curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{
    \"source\": {\"sourceType\": \"ACCOUNT\", \"accountId\": \"$WALLET_ID\"},
    \"destination\": {\"destinationType\": \"ACCOUNT\", \"accountId\": \"$USD_EXTERNAL_ID\", \"paymentRail\": \"ACH\"},
    \"lockedCurrencySide\": \"SENDING\",
    \"lockedCurrencyAmount\": 10000,
    \"purposeOfPayment\": \"GOODS_OR_SERVICES\"
  }" \
  "$GRID_BASE_URL/quotes")
QUOTE_ID=$(echo "$QUOTE_RESPONSE" | jq -r '.id')
TX_ID=$(echo "$QUOTE_RESPONSE" | jq -r '.transactionId')
```

Amount note: source is the **wallet** (USDB, 6 decimals), so `10000` = $0.01 USDB. Smaller values (e.g. `100` = $0.0001) get the post-fee receiving zeroed out and Grid returns `INVALID_INPUT: total_receiving_amount: Input should be greater than 0`. If a real corridor minimum kicks in (`AMOUNT_OUT_OF_RANGE`), bump to whatever it reports.

3. Produce the signature.

   - **If `IS_SANDBOX=true`:** `SIG="sandbox-valid-signature"`. Skip the payload extraction and signing entirely — the sandbox verifier accepts the literal string for any payload. The `paymentInstructions[*].accountOrWalletInfo.payloadToSign` block in the response is informational only.
   - **Otherwise:** extract the payload byte-for-byte (`jq -j` matters — any whitespace change breaks the signature) and sign with the session key:

     ```bash
     PAYLOAD_FILE="$TMP_DIR/payload-test7.txt"
     echo "$QUOTE_RESPONSE" | jq -j '.paymentInstructions[0].accountOrWalletInfo.payloadToSign' > "$PAYLOAD_FILE"
     SIG=$(ew_helper sign-payload --payload-file "$PAYLOAD_FILE" --session-key-path "$SESSION_KEY_PATH" | jq -r '.signature')
     ```

4. Execute the quote with the signature header:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Grid-Wallet-Signature: $SIG" \
  "$GRID_BASE_URL/quotes/$QUOTE_ID/execute"
```

5. Poll transaction status every 5s up to 180s.

6. **PASS criteria:** Execute returns 2xx; transaction status reaches `PROCESSING` or `COMPLETED` (sandbox tends to land on `COMPLETED` immediately).

---

## Test 8: Quote FROM wallet to external USDC wallet (signed outgoing)

**Goal:** Withdraw USDB from the embedded wallet to an external USDC wallet on Base. Same signed-execute pattern as Test 7.

**Prerequisite:** Wallet has USDB; valid session signing key.

**Steps:**

1. Get the test EVM wallet address:

```bash
WALLET_ADDRESS=$(base_helper wallet-address | jq -r '.address')
```

2. Create the USDC external account on Base. Use `$BASE_NETWORK` set in Test 6 (or set it now: `BASE_TESTNET` for sandbox, `BASE_MAINNET` otherwise):

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{
    \"customerId\": \"$CUSTOMER_ID\",
    \"currency\": \"USDC\",
    \"cryptoNetwork\": \"$BASE_NETWORK\",
    \"accountInfo\": {
      \"accountType\": \"BASE_WALLET\",
      \"address\": \"$WALLET_ADDRESS\"
    }
  }" \
  "$GRID_BASE_URL/customers/external-accounts"
```

Save `id` as `USDC_EXTERNAL_ID`.

3. Record initial on-chain USDC balance:

```bash
INITIAL_ONCHAIN=$(base_helper usdc-balance | jq -r '.raw')
```

4. Create the outgoing quote (USDB → USDC):

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{
    \"source\": {\"sourceType\": \"ACCOUNT\", \"accountId\": \"$WALLET_ID\"},
    \"destination\": {\"destinationType\": \"ACCOUNT\", \"accountId\": \"$USDC_EXTERNAL_ID\"},
    \"lockedCurrencySide\": \"SENDING\",
    \"lockedCurrencyAmount\": 200,
    \"purposeOfPayment\": \"GOODS_OR_SERVICES\"
  }" \
  "$GRID_BASE_URL/quotes"
```

5. Sign and execute. **Sandbox shortcut:** `SIG="sandbox-valid-signature"`, then `curl ... -H "Grid-Wallet-Signature: $SIG" .../execute`. **Non-sandbox:** extract the payload via `jq -j`, sign with `ew_helper sign-payload --payload-file ... --session-key-path "$SESSION_KEY_PATH"`, then execute (same pattern as Test 7 steps 3-4).

6. Poll on-chain USDC balance every 5s up to 180s, looking for an increase above `INITIAL_ONCHAIN`.

7. **PASS criteria:** On-chain USDC balance increases above `INITIAL_ONCHAIN`.

---

## Sandbox shortcut

In sandbox, Grid intentionally returns a fake `encryptedSessionSigningKey` (random `\x02 || secrets.token_bytes(32) || secrets.token_bytes(48)` wrapped in base58check). It will **not** decrypt with HPKE — don't try, no curve / KEM ID combination will work. Tests 7 and 8 still need a `Grid-Wallet-Signature` header on execute, but the sandbox verifier accepts the literal string `sandbox-valid-signature` for any payload. So:

- Test 3 in sandbox: stop after the `verify` call returns 200. The `encryptedSessionSigningKey` response field is opaque; do not try to decrypt it.
- Tests 7 & 8 in sandbox: `curl -H "Grid-Wallet-Signature: sandbox-valid-signature" .../execute`.

In non-sandbox, do the real HPKE decrypt + ECDSA sign flow per the original step-by-step.

## Known issues / observations

- **ACH minimum.** `lockedCurrencyAmount: 100` (1¢ in USDB) on Test 7 returns `INVALID_INPUT: total_receiving_amount: Input should be greater than 0` because custody/FX fees zero out the receiving side. Use `lockedCurrencyAmount: 10000` (1¢ USDB at 6 decimals = $0.01) or higher in dev sandbox; for true ACH minimums in non-sandbox, follow the validator's `AMOUNT_OUT_OF_RANGE` reply.
- **Wallet → USD INTERNAL.** Returns `NOT_IMPLEMENTED: Crypto internal accounts are not yet supported` in dev. Use a USD external account (ACH) for outgoing fiat tests instead.
