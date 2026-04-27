---
name: grid-embedded-wallet-test
description: >
  This skill should be used when the user asks to "test embedded wallets",
  "test embedded wallet flows", "test USDB wallet", "run embedded wallet tests",
  "test signed quotes", "test wallet auth", "test wallet signing", "test passkey
  flow", "test email OTP", "test session signing key", "test Grid-Wallet-Signature",
  "test withdrawal from embedded wallet", "test deposit to embedded wallet",
  "send USDB", "withdraw USDB", "test embedded wallet quotes", or wants to
  verify Grid's Embedded Wallet (self-custodial Spark wallet) auth, signing,
  and quote-in / quote-out flows. Even if the user mentions just one path
  (incoming or outgoing), this skill applies. Complements grid-test by
  covering the embedded-wallet-specific HPKE + ECDSA signing layer.
allowed-tools:
  - Bash
  - Read
  - Grep
  - Glob
  - WebFetch
---

# Grid Embedded Wallet Test Suite

End-to-end tests for Grid's Embedded Wallet flows: customer + wallet auto-provisioning, email OTP credential registration, session signing key issuance (HPKE-encrypted, decrypted on-device), incoming USDB quotes, and signed outgoing USDB → fiat / crypto withdrawals.

This skill complements `grid-test` (which covers chain-specific USDC flows). It depends on `grid-test/scripts/base_helper.py` for on-chain USDC operations.

## Step 1: Parse the User's Prompt

Determine what to run:

**Test selection** (default: all tests):
- "test setup only" / "run setup": tests 1-3 (account creation through session)
- "test incoming" / "test fund wallet": tests 1-3 plus 5 and 6 (quotes TO the wallet)
- "test outgoing" / "test withdraw": tests 1-3 plus 7 and 8 (signed quotes FROM the wallet)
- "run all" / no qualifier: all tests 1-8

**Test name → number mapping:**

| # | Short Name | Description |
|---|-----------|-------------|
| 1 | account-creation | Create customer; verify auto-provisioned EMBEDDED_WALLET |
| 2 | otp-register | Register EMAIL_OTP credential |
| 3 | otp-verify | Verify OTP, decrypt session signing key |
| 4 | fund-wallet | Sandbox-fund (or rely on tests 5-6) |
| 5 | quote-in-from-usd | Account-funded USD → wallet (no signature) |
| 6 | quote-in-from-usdc-base | RT-funded USDC on Base → wallet (no signature) |
| 7 | quote-out-to-usd-bank | Wallet → USD ACH (signed) |
| 8 | quote-out-to-usdc-base | Wallet → USDC on Base (signed) |

## Step 2: Load Credentials

```bash
export GRID_API_TOKEN_ID=$(jq -r .apiTokenId ~/.grid-credentials)
export GRID_API_CLIENT_SECRET=$(jq -r .apiClientSecret ~/.grid-credentials)
export GRID_BASE_URL=$(jq -r '.baseUrl // "https://api.lightspark.com/grid/2025-10-13"' ~/.grid-credentials)
```

## Step 3: Detect Environment

### Sandbox vs non-sandbox

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{"amount": 1}' \
  "$GRID_BASE_URL/sandbox/internal-accounts/dummy/fund"
```

- Response contains `"not a sandbox platform"` → `IS_SANDBOX=false`
- Other (e.g., not-found error) → `IS_SANDBOX=true`

### Confirm USDB is a supported currency

Embedded wallets only auto-provision on platforms with USDB enabled:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" "$GRID_BASE_URL/config" \
  | jq -r '.supportedCurrencies // .currencies // [] | map(.code // .) | join(",")'
```

If `USDB` isn't present, stop and tell the user — embedded wallets require it.

## Step 4: Set Up

1. **Workspace for keys.** Create a temp dir to hold the client private key and decrypted session signing key:

   ```bash
   TMP_DIR="/tmp/grid-ew-$(date +%s)"
   mkdir -p "$TMP_DIR"
   ```

   The session signing key is sensitive (it can authorize wallet actions for 15 minutes). Don't commit it; clean up `$TMP_DIR` when done.

2. **Install Python deps.** `cryptography` + `base58` are required for the embedded wallet helper; `web3` is required only for tests 6 and 8 (on-chain USDC):

   ```bash
   pip3 install cryptography base58 web3 2>&1 | tail -5
   ```

3. **Define helper functions.** Use shell *functions* (not variables) so arguments word-split correctly. The skills live in the repo, so `$(pwd)` resolves correctly when run from the grid-api root:

   ```bash
   ew_helper() { python3 "$(pwd)/.claude/skills/grid-embedded-wallet-test/scripts/embedded_wallet_helper.py" "$@"; }
   base_helper() { python3 "$(pwd)/.claude/skills/grid-test/scripts/base_helper.py" "$@"; }
   ```

   For mainnet runs, redefine `base_helper` to pass `--mainnet`:

   ```bash
   base_helper() { python3 "$(pwd)/.claude/skills/grid-test/scripts/base_helper.py" --mainnet "$@"; }
   ```

   Tests 6 and 8 will use `BASE_TESTNET` or `BASE_MAINNET` for `cryptoNetwork` based on whether `IS_SANDBOX=true` (testnet) or `false` (mainnet).

4. **Email for OTP.** Read `otpEmail` from `~/.grid-credentials`. The user must have access to that inbox to read the OTP code in Test 3.

   ```bash
   OTP_EMAIL=$(jq -r '.otpEmail // empty' ~/.grid-credentials)
   ```

   If empty, stop and tell the user to add `otpEmail` to `~/.grid-credentials`.

5. **Set chain prefix:** `CHAIN_PREFIX="ew-test"`

## Step 5: Run Tests

Read `references/test-catalog.md` for detailed steps. Tests run sequentially — each assumes state from earlier ones:

- Tests 2-8 depend on Test 1 (customer + wallet)
- Test 3 depends on Test 2 (auth method id) and on the user providing the OTP code (env var `OTP_CODE`)
- Tests 4-8 depend on Test 3 (session signing key — required for outgoing tests, harmless for incoming)
- Tests 7-8 depend on having USDB in the wallet (Test 4, 5, or 6)

**OTP flow.** When you reach Test 2:
- Trigger the OTP email by registering the credential.
- If `IS_SANDBOX=true`, set `OTP_CODE=000000` automatically — sandbox always accepts that as the OTP, no need to pause.
- Otherwise, **pause and ask the user** to check their email and provide the OTP code, e.g., "Email OTP sent to `<email>`. Paste the code or set `OTP_CODE=<code>` and continue."
- Once the user provides the code, proceed to Test 3.

**Signing payloadToSign correctly.** The single biggest pitfall: any whitespace change to the payload string breaks the signature. Always:
- Extract the payload with `jq -j` (no trailing newline) into a file: `... | jq -j '.paymentInstructions[0].accountOrWalletInfo.payloadToSign' > "$PAYLOAD_FILE"`.
- Sign via `ew_helper sign-payload --payload-file "$PAYLOAD_FILE" --session-key-path "$SESSION_KEY_PATH"`.
- Pass the resulting base64 signature unchanged as `Grid-Wallet-Signature: <sig>` on the execute call.

**Sandbox shortcut for Test 3 / signing.** When `IS_SANDBOX=true`, Grid emits a *fake* `encryptedSessionSigningKey` (random bytes wrapped in base58check — `\x02 + secrets.token_bytes(32) + secrets.token_bytes(48)`). It will not decrypt with HPKE on any curve / KEM ID. Don't try.

The verifier on the execute side accepts the literal string `sandbox-valid-signature` for any wallet payload, so:
- In sandbox: skip `decrypt-session-key` and `sign-payload` entirely. Send `Grid-Wallet-Signature: sandbox-valid-signature` on every signed-execute.
- In non-sandbox: do the real HPKE decrypt + ECDSA sign flow.

Use `IS_SANDBOX` (set in Step 3) to branch.

## Step 6: Results Summary

After all tests, print a table:

```
| # | Test Case                                   | Status | Details |
|---|---------------------------------------------|--------|---------|
| 1 | Customer + Embedded Wallet provisioning     | PASS   | ...     |
| 2 | Register email OTP credential               | PASS   | ...     |
| 3 | Verify OTP → session signing key            | PASS   | ...     |
| 4 | Fund wallet                                 | PASS   | ...     |
| 5 | Quote in: USD internal → wallet             | PASS   | ...     |
| 6 | Quote in: USDC Base RT → wallet             | PASS   | ...     |
| 7 | Quote out: wallet → USD ACH (signed)        | PASS   | ...     |
| 8 | Quote out: wallet → USDC Base (signed)      | PASS   | ...     |
```

Include in Details: ids, amounts, transaction statuses, error messages.

## Step 7: Cleanup

After printing the results, delete the workspace so the session signing key doesn't linger on disk:

```bash
rm -rf "$TMP_DIR"
```

If tests failed mid-flight and the user wants to debug, mention `$TMP_DIR` in your output before deleting, or skip the cleanup until they confirm.

## Error Handling

- If a test fails, record the failure and continue.
- If the OTP `/verify` returns 401 with `OTP_INVALID`, ask the user to re-check the code. If expired, try `POST /auth/credentials/$AUTH_METHOD_ID/challenge` to issue a fresh one.
- **`/challenge` returns 404 on the dev API** (`api.dev.dev.sparkinfra.net/grid/rc`) — the endpoint isn't deployed there. And re-registering the credential against the same wallet returns `NOT_IMPLEMENTED: This internal account already has an embedded wallet. Resending an OTP or adding an additional credential is not yet implemented.` So if Test 3 fails or the session expires in dev, you need to start over with a brand-new customer (re-run Tests 1–2). On the production API, `/challenge` is the right move.
- In sandbox, the `encryptedSessionSigningKey` is a stub — never try to `decrypt-session-key`. Use `Grid-Wallet-Signature: sandbox-valid-signature` directly on execute.
- If `decrypt-session-key` fails with an HPKE error in **non-sandbox**, the most likely causes are: wrong client private key (mismatch with the `clientPublicKey` you sent), or the wire-format payload was modified. Re-run from Test 3 with a fresh keypair.
- If `Grid-Wallet-Signature` is rejected with `INVALID_SIGNATURE` in non-sandbox, the payload bytes were modified. Re-extract with `jq -j` and sign again.
- If `Quote` creation returns `INVALID_INPUT: total_receiving_amount: Input should be greater than 0`, the locked amount is below the post-fee floor for the corridor — bump the amount up. Wallet-side amounts are in USDB micro-units (6 decimals), not cents.
- `quotes` source/destination of `INTERNAL_CRYPTO` accounts (e.g., wallet → USD INTERNAL) returns `NOT_IMPLEMENTED: Crypto internal accounts are not yet supported`. Use external accounts for outgoing fiat tests.

## Amounts Reference

Watch the decimals — when the **wallet** is the source, amounts are in USDB micro-units (6 decimals). When a USD/USDC fiat or RT side is the locked side, amounts are in 2 or 6 decimals respectively.

| Test | `lockedCurrencySide` | `lockedCurrencyAmount` | Effective amount | Notes |
|------|----------------------|------------------------|------------------|-------|
| 4 (sandbox fund) | n/a | 100000 (cents) | $1,000.00 USDB | Sandbox endpoint takes amount in cents |
| 5 (USD → wallet) | SENDING | 100 (USD cents) | $1.00 USD | Needs USD internal balance (sandbox-fund USD first) |
| 6 (USDC Base → wallet) | RECEIVING | 100 (USDC, 6-dec → $0.0001) | RT-funded, see Test 6 catalog for actual workable amount | Auto-executes on on-chain deposit |
| 7 (wallet → USD ACH) | SENDING | 10000 (USDB micro = $0.01 USDB) | $0.01 USD ACH | Below this, post-fee receiving rounds to 0 in dev |
| 8 (wallet → USDC Base) | SENDING | 100000 (USDB micro = $0.10 USDB) | ~$0.0995 USDC on Base | Must exceed custody fee floor |

## Credential Schema

`~/.grid-credentials` only needs the standard Grid auth fields plus (optionally) Base private keys for tests 6 and 8:

```json
{
  "apiTokenId": "...",
  "apiClientSecret": "...",
  "baseUrl": "https://api.lightspark.com/grid/2025-10-13",
  "otpEmail": "jeremy@lightspark.com",
  "baseTestnetPrivateKey": "hex-private-key",
  "baseMainnetPrivateKey": "hex-private-key"
}
```

`otpEmail` is required for tests 2-3 (email OTP credential registration). Use an inbox you can read.

Tests 6 and 8 are skipped automatically if no Base key is present.
