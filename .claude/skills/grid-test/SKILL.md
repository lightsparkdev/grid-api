---
name: grid-test
description: >
  This skill should be used when the user asks to "test Grid", "run USDC tests", "run USDT tests",
  "test deposits", "test withdrawals", "test Solana flows", "test Base flows", "test Polygon flows",
  "test Ethereum flows", "test ETH L1", "test Tron flows", "test USDT on Tron", "run e2e tests",
  "test sandbox", "test USDC to USD", "test USDT to USD", "test USDC to MXN", "run all Grid tests",
  "test transfer out", "test realtime funding", "test quote flows", "test deposits and withdrawals",
  "run sandbox tests", "test USDC sandbox", "test USDT sandbox", "test Grid API", "run e2e USDC test",
  "run e2e USDT test", "test USDC on [chain]", "test USDT on [chain]", or wants to verify Grid's
  stablecoin deposit/withdrawal/quote pipeline (USDC on Solana/Base/Polygon/Ethereum, USDT on Tron).
  Even if the user mentions just one chain, one test, or one corridor, this skill applies.
  This replaces both grid-solana-usdc-sandbox and grid-base-usdc-test.
allowed-tools:
  - Bash
  - Read
  - Grep
  - Glob
  - WebFetch
---

# Grid API Test Suite

End-to-end tests for stablecoin flows: USDC on Solana, Base, Polygon, and Ethereum L1, and USDT on Tron. Covers deposits, withdrawals, and cross-currency quotes using real testnet (or mainnet) funds.

Each chain has a single supported stablecoin (`STABLE_ASSET` / `STABLE_CURRENCY` in the catalog). For Solana/Base/Polygon/Ethereum this is USDC; for Tron it is USDT. The tests themselves are asset-agnostic and parameterized over the chain's stablecoin.

## Step 1: Parse the User's Prompt

Determine what to run from the user's request:

**Chains** (default: all available — see step 3 for which have keys):
- `solana`, `base`, `polygon`, `ethereum`, `tron`, or `all`
- Multiple chains: "test solana and base", "run base and polygon tests", "test tron"

**Tests** (default: all):
- By number: "run test 4 on solana"
- By name: "test deposits on base", "test USDC to MXN", "test transfer out"
- By category: "test all quote flows", "test RT funded flows", "test account-funded flows"

**Test name → number mapping:**

| # | Short Name | Keywords |
|---|-----------|----------|
| 1 | account-creation | customer, account, setup |
| 2 | deposit | deposit, fund, send USDC to Grid |
| 3 | transfer-out | withdraw, transfer out, send to wallet |
| 4 | usdc-to-usd-internal-rt | USDC→USD internal, RT funded internal |
| 5 | usdc-to-usd-bank-rt | USDC→USD bank, RT funded ACH, external bank |
| 6 | usdc-to-mxn-rt | USDC→MXN RT, SPEI, CLABE, Mexico RT |
| 7 | usd-to-usdc | USD→USDC, buy USDC, account funded wallet |
| 8 | usdc-to-usd-internal-acct | USDC→USD account funded, convert USDC balance |
| 9 | usdc-to-mxn-acct | USDC→MXN account funded, SPEI account funded |
| 10 | usdc-to-uma-rt | USDC→UMA RT, UMA realtime, send to UMA |
| 11 | usd-to-uma-acct | USD→UMA account funded, UMA payout |

**Category shortcuts:**
- "quote flows" or "quotes" → tests 4-11
- "RT funded" or "realtime" → tests 4-6, 10
- "account funded" → tests 7-9, 11
- "transfers" → tests 2-3
- "UMA" → tests 10-11

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
- Response contains `"not found"` or other non-platform error → `IS_SANDBOX=true`

Use `amount: 1` (not 0) — a zero amount returns a validation error on both sandbox and non-sandbox, masking the real detection.

Report the detected mode to the user.

### Testnet vs mainnet

Check `GRID_BASE_URL` and credential keys to determine network:
- If `IS_SANDBOX=true` or URL contains dev/staging → testnet networks
- If production URL + `IS_SANDBOX=false` → mainnet networks

## Step 4: Set Up Each Selected Chain

For each chain the user wants to test, set the chain-specific variables and verify prerequisites.

### Chain Configuration Lookup

**Testnet (sandbox/dev):**

| Variable | Solana | Base | Polygon | Ethereum | Tron |
|---|---|---|---|---|---|
| `CRYPTO_NETWORK` | `SOLANA_DEVNET` | `BASE_TESTNET` | `POLYGON_TESTNET` | `ETHEREUM_TESTNET` | `TRON_TESTNET` |
| `WALLET_TYPE` | `SOLANA_WALLET` | `BASE_WALLET` | `POLYGON_WALLET` | `ETHEREUM_WALLET` | `TRON_WALLET` |
| `STABLE_ASSET` | `usdc` | `usdc` | `usdc` | `usdc` | `usdt` |
| `STABLE_CURRENCY` | `USDC` | `USDC` | `USDC` | `USDC` | `USDT` |
| `CRED_KEY` | `solanaDevnetPrivateKey` | `baseTestnetPrivateKey` | `polygonTestnetPrivateKey` | `ethereumTestnetPrivateKey` | `tronTestnetPrivateKey` |
| `HELPER_SCRIPT` | `scripts/solana_helper.py` | `scripts/base_helper.py` | `scripts/polygon_helper.py` | `scripts/ethereum_helper.py` | `scripts/tron_helper.py` |
| `GAS_CMD` | `sol-balance` | `eth-balance` | `pol-balance` | `eth-balance` | `trx-balance` |
| `GAS_TOKEN` | SOL | ETH | POL | ETH | TRX |
| `GAS_MIN` | 0.1 | 0.001 | 0.1 | 0.01 | 50 |
| `TRANSFER_OUT_AMT` | 100000 | 200000 | 200000 | 200000 | 200000 |
| `PIP_DEPS` | `solders solana base58` | `web3` | `web3` | `web3` | `tronpy` |

**Mainnet (non-sandbox production):**

| Variable | Solana | Base | Polygon | Ethereum | Tron |
|---|---|---|---|---|---|
| `CRYPTO_NETWORK` | `SOLANA_MAINNET` | `BASE_MAINNET` | `POLYGON_MAINNET` | `ETHEREUM_MAINNET` | `TRON_MAINNET` |
| `WALLET_TYPE` | `SOLANA_WALLET` | `BASE_WALLET` | `POLYGON_WALLET` | `ETHEREUM_WALLET` | `TRON_WALLET` |
| `CRED_KEY` | `solanaMainnetPrivateKey` | `baseMainnetPrivateKey` | `polygonMainnetPrivateKey` | `ethereumMainnetPrivateKey` | `tronMainnetPrivateKey` |
| Other vars | Same as testnet | Same as testnet | Same as testnet | Same as testnet | Same as testnet |

`STABLE_ASSET` is the lowercase asset name used in helper subcommands (`$STABLE_ASSET-balance`, `send-$STABLE_ASSET`). `STABLE_CURRENCY` is the uppercase Grid currency code used in API request bodies. Tron uses USDT; every other chain uses USDC.

### Per-chain prerequisites

For each selected chain, run these checks. Skip a chain (with a warning) if its private key is missing.

1. **Verify private key exists:**
   ```bash
   jq -r ".$CRED_KEY // empty" ~/.grid-credentials
   ```
   If empty, warn the user and skip this chain.

2. **Install dependencies:**
   ```bash
   pip3 install $PIP_DEPS 2>&1 | tail -5
   ```

3. **Define helper function** (pass `--mainnet` if running on mainnet):
   ```bash
   # Testnet:
   chain_helper() { python3 /absolute/path/to/.claude/skills/grid-test/$HELPER_SCRIPT "$@"; }
   # Mainnet:
   chain_helper() { python3 /absolute/path/to/.claude/skills/grid-test/$HELPER_SCRIPT --mainnet "$@"; }
   ```

   Use a shell function (not a variable) so that arguments are word-split correctly. Then call as `chain_helper send-usdc --to ...`. All helper scripts accept `--mainnet` to switch RPC endpoints, chain IDs, USDC contract addresses, and credential keys automatically.

4. **Check gas balance:**
   ```bash
   chain_helper $GAS_CMD
   ```
   If below `GAS_MIN`, warn the user with instructions for obtaining testnet gas:
   - Solana: `chain_helper airdrop-sol --amount 1000000000`
   - Base: https://www.alchemy.com/faucets/base-sepolia
   - Polygon: https://faucet.polygon.technology/
   - Ethereum: https://www.alchemy.com/faucets/ethereum-sepolia
   - Tron: https://shasta.tronex.io/ (Shasta testnet TRX faucet)

5. **Check stablecoin balance:**
   ```bash
   chain_helper $STABLE_ASSET-balance
   ```
   If `amount` < 1.0, warn the user. Testnet stablecoin sources:
   - Solana (USDC): Solana devnet USDC faucet
   - Base (USDC): https://faucet.circle.com/ (select Base Sepolia)
   - Polygon (USDC): https://faucet.circle.com/ (select Polygon Amoy)
   - Ethereum (USDC): https://faucet.circle.com/ (select Ethereum Sepolia)
   - Tron (USDT): https://shasta.tronex.io/ (Shasta testnet faucet — request TRX, then swap or fund via the TRC-20 USDT contract `TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs`)

6. **Get wallet address:**
   ```bash
   $CHAIN_HELPER wallet-address
   ```
   Save as `WALLET_ADDRESS` for this chain.

## Step 5: Run Tests

Read `references/test-catalog.md` for detailed test steps. Each test is parameterized by chain variables set in Step 4. Run tests sequentially within each chain (later tests depend on state from earlier ones).

**Dependency note:** If the user requests a specific test (e.g., test 4), also run its dependencies:
- Tests 2-11 depend on Test 1 (customer + account creation)
- Tests 3, 8, 9 depend on Test 2 (needs USDC in internal account)
- Tests 7, 11 need USD balance — either sandbox fund endpoint or a prior USDC→USD conversion (Test 4 or 8)
- Tests 10-11 need a valid UMA receiver address (defaults to `$test@sandbox.grid.uma.money`, overridable via `UMA_RECEIVER` env var)

If running a subset, create the customer (Test 1) silently as setup, then run only the requested tests.

**Multi-chain execution:** Run each chain fully before moving to the next. Set `CHAIN_PREFIX` per chain for unique customer IDs:
- Solana: `CHAIN_PREFIX="solana-test"`
- Base: `CHAIN_PREFIX="base-test"`
- Polygon: `CHAIN_PREFIX="polygon-test"`
- Ethereum: `CHAIN_PREFIX="ethereum-test"`
- Tron: `CHAIN_PREFIX="tron-test"`

## Step 6: Results Summary

After all tests complete, print a results table per chain:

```
## Solana Results
| # | Test Case                                         | Status | Details |
|---|---------------------------------------------------|--------|---------|
| 1  | Customer + Stablecoin Account Creation            | PASS   | ...     |
| 2  | Fund Internal Account (deposit)                   | PASS   | ...     |
| 3  | Transfer Out (→ wallet)                           | PASS   | ...     |
| 4  | Stablecoin → USD (RT funded → internal)           | PASS   | ...     |
| 5  | Stablecoin → USD (RT funded → external bank)      | PASS   | ...     |
| 6  | Stablecoin → MXN (RT funded → CLABE)              | PASS   | ...     |
| 7  | USD → Stablecoin (Account funded → wallet)        | PASS   | ...     |
| 8  | Stablecoin → USD (Account funded → internal)      | PASS   | ...     |
| 9  | Stablecoin → MXN (Account funded → CLABE)         | PASS   | ...     |
| 10 | Stablecoin → USD (RT funded → UMA)                | PASS   | ...     |
| 11 | USD → USD (Account funded → UMA)                  | PASS   | ...     |

(For USDC chains, "Stablecoin" = USDC. For Tron, "Stablecoin" = USDT.)

## Base Results
...

## Tron Results
...
```

Include in Details: amounts, transaction IDs, error messages, or timing.

If multiple chains were tested, add an aggregate summary:

```
## Summary
| Chain   | Passed | Failed | Skipped |
|---------|--------|--------|---------|
| Solana  | 7/7    | 0      | 0       |
| Base    | 6/7    | 1      | 0       |
| Polygon | 0/7    | 0      | 7       |
| Tron    | 7/7    | 0      | 0       |
```

## Error Handling

- If a test fails, record the failure and continue to the next test.
- If a polling loop times out, record FAIL with "timeout after 120s" and the last observed state.
- If `send-usdc` fails, check gas balance (may need airdrop/faucet) and USDC balance.
- If a quote returns an error about `totalSendingAmount` being too small or too large, adjust `lockedCurrencyAmount` and retry once.
- Common API errors:
  - `USER_NOT_FOUND`: sandbox VASP may not have the required user
  - `INSUFFICIENT_BALANCE`: internal account doesn't have enough funds
  - `QUOTE_EXPIRED`: quote expired before funding — retry with faster execution

## Amounts Reference

All tests use small amounts to conserve testnet funds. Amounts are denominated in the chain's stablecoin (USDC for Solana/Base/Polygon/Ethereum, USDT for Tron) at 6 decimals.

| Test | Amount | Notes |
|------|--------|-------|
| 2 (deposit) | 0.50 stablecoin (500000) | |
| 3 (transfer-out) | Solana: 0.10 (100000), Base/Polygon/Ethereum/Tron: 0.20 (200000) | EVM chains must exceed ~100100 custody fee; Tron mirrors the EVM minimum |
| 4-5 (Stablecoin→USD RT) | $0.10 locked receiving (10 cents) | |
| 6 (Stablecoin→MXN RT) | 11.00 MXN locked receiving (1100 centavos, ~$0.55) | Some envs enforce 1100 minimum |
| 7 (USD→Stablecoin) | $0.50 sending (50 cents) | Requires sandbox or prior USD balance |
| 8 (Stablecoin→USD acct) | 0.05 stablecoin sending (50000) | Requires stablecoin from test 2 |
| 9 (Stablecoin→MXN acct) | 0.05 stablecoin sending (50000) | Requires stablecoin from test 2 |
| 10 (Stablecoin→UMA RT) | $0.10 locked receiving (10 cents) | Requires valid UMA receiver |
| 11 (USD→UMA acct) | $0.10 sending (10 cents) | Requires USD balance + valid UMA receiver |

**Total per chain: ~1.3-1.5 stablecoin units + gas fees**

## Credential Schema

`~/.grid-credentials` JSON file:

```json
{
  "apiTokenId": "...",
  "apiClientSecret": "...",
  "baseUrl": "https://api.lightspark.com/grid/2025-10-13",
  "solanaDevnetPrivateKey": "base58-encoded-64-byte-keypair",
  "solanaMainnetPrivateKey": "base58-encoded-64-byte-keypair",
  "baseTestnetPrivateKey": "hex-private-key-with-or-without-0x",
  "baseMainnetPrivateKey": "hex-private-key-with-or-without-0x",
  "polygonTestnetPrivateKey": "hex-private-key-with-or-without-0x",
  "polygonMainnetPrivateKey": "hex-private-key-with-or-without-0x",
  "ethereumTestnetPrivateKey": "hex-private-key-with-or-without-0x",
  "ethereumMainnetPrivateKey": "hex-private-key-with-or-without-0x",
  "tronTestnetPrivateKey": "hex-private-key-with-or-without-0x",
  "tronMainnetPrivateKey": "hex-private-key-with-or-without-0x"
}
```

Only the keys for chains you want to test are required. The skill auto-skips chains without keys.
