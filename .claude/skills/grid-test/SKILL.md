---
name: grid-test
description: >
  This skill should be used when the user asks to "test Grid", "run USDC tests", "run USDT tests",
  "test deposits", "test withdrawals", "test Solana flows", "test Base flows", "test Polygon flows",
  "test Ethereum flows", "test ETH L1", "test Tron flows", "test USDT on Tron", "test USDT on Ethereum",
  "test USDT on eth", "test USDT on eth L1", "test USDC on Ethereum", "test Plasma flows",
  "test USDT on Plasma", "test plasma", "run e2e tests",
  "test sandbox", "test USDC to USD", "test USDT to USD", "test USDC to MXN", "test USDT to MXN",
  "run all Grid tests", "test transfer out", "test realtime funding", "test quote flows",
  "test deposits and withdrawals", "run sandbox tests", "test USDC sandbox", "test USDT sandbox",
  "test Grid API", "run e2e USDC test", "run e2e USDT test", "test USDC on [chain]",
  "test USDT on [chain]", or wants to verify Grid's stablecoin deposit/withdrawal/quote pipeline
  (USDC on Solana/Base/Polygon/Ethereum, USDT on Ethereum/Plasma/Tron).
  Also covers EU Travel Rule wallet ownership verification on Striga-backed platforms:
  "test travel rule", "test ownership verification", "verify wallet ownership", "test wallet signature",
  "test PENDING_OWNERSHIP_VERIFICATION", "test the counterparty declare", "sign an ownership challenge",
  "test self-custody wallet verification", "test Striga travel rule".
  Even if the user mentions just one chain, one asset, one test, or one corridor, this skill applies.
  This replaces both grid-solana-usdc-sandbox and grid-base-usdc-test.
allowed-tools:
  - Bash
  - Read
  - Grep
  - Glob
  - WebFetch
---

# Grid API Test Suite

End-to-end tests for stablecoin flows: USDC on Solana, Base, Polygon, and Ethereum L1, and USDT on Ethereum L1, Plasma, and Tron. Covers deposits, withdrawals, and cross-currency quotes using real testnet (or mainnet) funds.

A **target** is a chain paired with a stablecoin — `ethereum-usdc` and `ethereum-usdt` are separate targets that share a chain, helper script, private key, and wallet address. The tests themselves are asset-agnostic, parameterized over the target's `STABLE_ASSET` / `STABLE_CURRENCY`.

## Step 1: Parse the User's Prompt

Determine what to run from the user's request:

**Targets** (default: all available — see step 4 for which have keys):
- `solana-usdc`, `base-usdc`, `polygon-usdc`, `ethereum-usdc`, `ethereum-usdt`, `plasma-usdt`, `tron-usdt`, or `all`
- A bare chain name selects every target on that chain: "test ethereum" → `ethereum-usdc` + `ethereum-usdt`; "test plasma" → `plasma-usdt`
- A bare asset name selects every target for that asset: "run USDT tests" → `ethereum-usdt` + `plasma-usdt` + `tron-usdt`
- Chain + asset selects one: "test USDT on eth" → `ethereum-usdt`
- Multiple targets: "test solana and base", "test USDT on plasma and tron"

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

**Travel Rule tests** (`TR0`-`TR24`, Striga-backed platforms only) are numbered separately and
described in `references/travel-rule-catalog.md`. Select them with "test travel rule",
"test ownership verification", or by id ("run TR3"). They are not part of "all" — a
non-Striga platform cannot run them at all — so run them only when asked.

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

## Step 4: Set Up Each Selected Target

For each target the user wants to test, set the target-specific variables and verify prerequisites.

### Target Configuration Lookup

**Network-independent variables:**

| Target | `WALLET_TYPE` | `STABLE_ASSET` | `STABLE_CURRENCY` | `HELPER_SCRIPT` | `GAS_CMD` | `GAS_TOKEN` | `GAS_MIN` | `TRANSFER_OUT_AMT` | `PIP_DEPS` |
|---|---|---|---|---|---|---|---|---|---|
| `solana-usdc` | `SOLANA_WALLET` | `usdc` | `USDC` | `scripts/solana_helper.py` | `sol-balance` | SOL | 0.1 | 100000 | `solders solana base58` |
| `base-usdc` | `BASE_WALLET` | `usdc` | `USDC` | `scripts/base_helper.py` | `eth-balance` | ETH | 0.001 | 200000 | `web3` |
| `polygon-usdc` | `POLYGON_WALLET` | `usdc` | `USDC` | `scripts/polygon_helper.py` | `pol-balance` | POL | 0.1 | 200000 | `web3` |
| `ethereum-usdc` | `ETHEREUM_WALLET` | `usdc` | `USDC` | `scripts/ethereum_helper.py` | `eth-balance` | ETH | 0.01 | 200000 | `web3` |
| `ethereum-usdt` | `ETHEREUM_WALLET` | `usdt` | `USDT` | `scripts/ethereum_helper.py` | `eth-balance` | ETH | 0.01 | 200000 | `web3` |
| `plasma-usdt` | `PLASMA_WALLET` | `usdt` | `USDT` | `scripts/plasma_helper.py` | `xpl-balance` | XPL | 0.01 | 200000 | `web3` |
| `tron-usdt` | `TRON_WALLET` | `usdt` | `USDT` | `scripts/tron_helper.py` | `trx-balance` | TRX | 50 | 200000 | `tronpy` |

**Network-dependent variables** (pick the column pair matching the mode detected in Step 3):

| Target | `CRYPTO_NETWORK` (testnet) | `CRYPTO_NETWORK` (mainnet) | `CRED_KEY` (testnet) | `CRED_KEY` (mainnet) |
|---|---|---|---|---|
| `solana-usdc` | `SOLANA_DEVNET` | `SOLANA_MAINNET` | `solanaDevnetPrivateKey` | `solanaMainnetPrivateKey` |
| `base-usdc` | `BASE_TESTNET` | `BASE_MAINNET` | `baseTestnetPrivateKey` | `baseMainnetPrivateKey` |
| `polygon-usdc` | `POLYGON_TESTNET` | `POLYGON_MAINNET` | `polygonTestnetPrivateKey` | `polygonMainnetPrivateKey` |
| `ethereum-usdc` | `ETHEREUM_TESTNET` | `ETHEREUM_MAINNET` | `ethereumTestnetPrivateKey` | `ethereumMainnetPrivateKey` |
| `ethereum-usdt` | `ETHEREUM_TESTNET` | `ETHEREUM_MAINNET` | `ethereumTestnetPrivateKey` | `ethereumMainnetPrivateKey` |
| `plasma-usdt` | `PLASMA` | `PLASMA` | `plasmaTestnetPrivateKey` | `plasmaMainnetPrivateKey` |
| `tron-usdt` | `TRON_TESTNET` | `TRON_MAINNET` | `tronTestnetPrivateKey` | `tronMainnetPrivateKey` |

`STABLE_ASSET` is the lowercase asset name used in helper subcommands (`$STABLE_ASSET-balance`, `send-$STABLE_ASSET`). `STABLE_CURRENCY` is the uppercase Grid currency code used in API request bodies. Each helper script resolves the right token contract from its own subcommand name, so `ethereum-usdc` and `ethereum-usdt` differ only in `STABLE_ASSET` / `STABLE_CURRENCY`.

**On the `_TESTNET` / `_MAINNET` suffixes:** the spec's `CryptoNetwork` enum contains only bare names (`ETHEREUM`, `SOLANA`, `PLASMA`, …) and says the platform's environment decides testnet vs mainnet. The suffixed values above are accepted as aliases — `ETHEREUM` and `ETHEREUM_TESTNET` resolve to the same network — so they are kept for continuity with earlier runs. `plasma-usdt` uses the bare `PLASMA` in both columns because no suffixed variant has been confirmed to work.

**`plasma-usdt` readiness (as of 2026-08-03):** the backend implementation is complete on `webdev` `main` (commit `68b5932440`, 2026-07-31, "Enable USDT on Plasma customer-facing"), but production had not picked it up yet. Against a pre-Plasma build, external-account creation fails with `MISSING_MANDATORY_USER_INFO: Beneficiary information is required for fiat accounts` — `PlasmaWalletExternalAccountInfo` is absent from that build's `CryptoExternalAccountInfo` union, so the request is classified as fiat.

Plasma is additionally gated behind `GK.USDT_PLASMA_ENABLED`, per platform. Use the error to tell the three states apart:

| Response | Meaning |
|---|---|
| `MISSING_MANDATORY_USER_INFO: Beneficiary information is required for fiat accounts` | Deployed build predates Plasma support |
| `INVALID_INPUT: USDT on Plasma is not enabled for this platform.` (external-account create) or `INVALID_INPUT: USDT on Plasma is not enabled.` (quotes) | Build is current; gatekeeper is off for this platform |
| `201` with an account id | Ready — run the target |

Note that Plasma carries USDT only; a USDC Plasma account is rejected by design. Probe before running:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{\"customerId\":\"$CUSTOMER_ID\",\"currency\":\"USDT\",\"cryptoNetwork\":\"PLASMA\",\"accountInfo\":{\"accountType\":\"PLASMA_WALLET\",\"address\":\"$WALLET_ADDRESS\"}}" \
  "$GRID_BASE_URL/customers/external-accounts"
```

Skip the target on either error, reporting which of the two states above it matched. Everything else about the target is wired and runs unchanged once the deploy lands and the gatekeeper is on.

### Per-target prerequisites

For each selected target, run these checks. Skip a target (with a warning) if its private key is missing.

1. **Verify private key exists:**
   ```bash
   jq -r ".$CRED_KEY // empty" ~/.grid-credentials
   ```
   If empty, warn the user and skip this target. Targets sharing a chain share a key — a missing `ethereumTestnetPrivateKey` skips both `ethereum-usdc` and `ethereum-usdt`.

2. **Install dependencies:**
   ```bash
   pip3 install $PIP_DEPS 2>&1 | tail -5
   ```

   For `solana-usdc`, pin solana-py below 0.40 — 0.40.x ships no `solana.rpc.api`, so the
   on-chain subcommands fail to import against a default `pip3 install solana`:
   ```bash
   pip3 install solders 'solana<0.40' base58 2>&1 | tail -5
   ```
   `sign-message`, `gen-keypair` and `wallet-address` are unaffected either way.

3. **Define helper function** (pass `--mainnet` if running on mainnet):
   ```bash
   # Testnet:
   chain_helper() { python3 /absolute/path/to/.claude/skills/grid-test/$HELPER_SCRIPT "$@"; }
   # Mainnet:
   chain_helper() { python3 /absolute/path/to/.claude/skills/grid-test/$HELPER_SCRIPT --mainnet "$@"; }
   ```

   Use a shell function (not a variable) so that arguments are word-split correctly. Then call as `chain_helper send-$STABLE_ASSET --to ...`. All helper scripts accept `--mainnet` to switch RPC endpoints, chain IDs, token contract addresses, and credential keys automatically.

   **Key-only subcommands.** `solana_helper.py` and `ethereum_helper.py` also expose two subcommands that touch no RPC and need no `~/.grid-credentials`, used by the Travel Rule catalog:

   | Subcommand | Purpose |
   |---|---|
   | `sign-message --message-file FILE [--private-key KEY]` | Sign a message with the wallet key. Ed25519/base58 on Solana, EIP-191/`0x`-hex on Ethereum. `--message-file` strips one trailing newline and signs the rest verbatim, so a `jq -r` pipe is safe. |
   | `gen-keypair` | Print a fresh throwaway keypair (`address`, `privateKey`) for negative tests. |

   `--private-key` signs with a supplied key instead of the funded wallet — needed for the wrong-key case, and so throwaway keys never have to be written into `~/.grid-credentials`.

   **solana-py version note.** `solana_helper.py` imports its RPC client lazily, so `sign-message`, `gen-keypair` and `wallet-address` work even when solana-py is missing or incompatible. The on-chain subcommands need `solana.rpc.api`, which **0.40.x does not ship** — install `'solana<0.40'` if `sol-balance` reports an incompatible install.

4. **Check gas balance:**
   ```bash
   chain_helper $GAS_CMD
   ```
   If below `GAS_MIN`, warn the user with instructions for obtaining testnet gas:
   - Solana: `chain_helper airdrop-sol --amount 1000000000`
   - Base: https://www.alchemy.com/faucets/base-sepolia
   - Polygon: https://faucet.polygon.technology/
   - Ethereum: https://www.alchemy.com/faucets/ethereum-sepolia
   - Plasma: https://faucet.plasma.to/ (Plasma testnet XPL faucet)
   - Tron: https://shasta.tronex.io/ (Shasta testnet TRX faucet)

5. **Check stablecoin balance:**
   ```bash
   chain_helper $STABLE_ASSET-balance
   ```
   If `amount` < 1.0, warn the user. Testnet stablecoin sources:
   - `solana-usdc`: Solana devnet USDC faucet
   - `base-usdc`: https://faucet.circle.com/ (select Base Sepolia)
   - `polygon-usdc`: https://faucet.circle.com/ (select Polygon Amoy)
   - `ethereum-usdc`: https://faucet.circle.com/ (select Ethereum Sepolia)
   - `ethereum-usdt`: no public faucet. Acquire Sepolia USDT (ERC-20 contract `0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0`, 6 decimals) by transferring from an existing test wallet or swapping on a Sepolia DEX.
   - `plasma-usdt`: https://faucet.plasma.to/ (Plasma testnet faucet — dispenses XPL; for testnet USDT0, contract `0x502012b361AebCE43b26Ec812B74D9a51dB4D412`, transfer from an existing test wallet if the faucet does not dispense it)
   - `tron-usdt`: https://shasta.tronex.io/ (Shasta testnet faucet — request TRX, then swap or fund via the TRC-20 USDT contract `TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs`)

6. **Get wallet address:**
   ```bash
   chain_helper wallet-address
   ```
   Save as `WALLET_ADDRESS` for this target. Targets sharing a chain also share a wallet address.

## Step 5: Run Tests

Read `references/test-catalog.md` for detailed test steps, or `references/travel-rule-catalog.md` when running `TR*` tests. Each test is parameterized by target variables set in Step 4. Run tests sequentially within each target (later tests depend on state from earlier ones).

**Dependency note:** If the user requests a specific test (e.g., test 4), also run its dependencies:
- Tests 2-11 depend on Test 1 (customer + account creation)
- Tests 3, 8, 9 depend on Test 2 (needs the target's stablecoin in the internal account)
- Tests 7, 11 need USD balance — either sandbox fund endpoint or a prior stablecoin→USD conversion (Test 4 or 8)
- Tests 10-11 need a valid UMA receiver address (defaults to `$test@sandbox.grid.uma.money`, overridable via `UMA_RECEIVER` env var)

If running a subset, create the customer (Test 1) silently as setup, then run only the requested tests.

**Multi-target execution:** Run each target fully before moving to the next. Set `CHAIN_PREFIX` per target for unique customer IDs:
- `solana-usdc`: `CHAIN_PREFIX="solana-usdc-test"`
- `base-usdc`: `CHAIN_PREFIX="base-usdc-test"`
- `polygon-usdc`: `CHAIN_PREFIX="polygon-usdc-test"`
- `ethereum-usdc`: `CHAIN_PREFIX="ethereum-usdc-test"`
- `ethereum-usdt`: `CHAIN_PREFIX="ethereum-usdt-test"`
- `plasma-usdt`: `CHAIN_PREFIX="plasma-usdt-test"`
- `tron-usdt`: `CHAIN_PREFIX="tron-usdt-test"`

Each target gets its own customer, so `ethereum-usdc` and `ethereum-usdt` never share internal-account state. They do share one on-chain wallet, so run them sequentially — concurrent sends from the same address collide on the nonce.

## Step 6: Results Summary

After all tests complete, print a results table per target:

```
## solana-usdc Results
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

("Stablecoin" is the target's `STABLE_CURRENCY` — substitute USDC or USDT in the actual output.)

## ethereum-usdt Results
...

## tron-usdt Results
...
```

Include in Details: amounts, transaction IDs, error messages, or timing.

If multiple targets were tested, add an aggregate summary:

```
## Summary
| Target        | Passed | Failed | Skipped |
|---------------|--------|--------|---------|
| solana-usdc   | 11/11  | 0      | 0       |
| base-usdc     | 10/11  | 1      | 0       |
| polygon-usdc  | 0/11   | 0      | 11      |
| ethereum-usdc | 11/11  | 0      | 0       |
| ethereum-usdt | 11/11  | 0      | 0       |
| plasma-usdt   | 11/11  | 0      | 0       |
| tron-usdt     | 11/11  | 0      | 0       |
```

## Error Handling

- If a test fails, record the failure and continue to the next test.
- If a polling loop times out, record FAIL with "timeout after 120s" and the last observed state.
- If `send-$STABLE_ASSET` fails, check gas balance (may need airdrop/faucet) and the target's stablecoin balance.
- If a quote returns an error about `totalSendingAmount` being too small or too large, adjust `lockedCurrencyAmount` and retry once.
- Common API errors:
  - `USER_NOT_FOUND`: sandbox VASP may not have the required user
  - `INSUFFICIENT_BALANCE`: internal account doesn't have enough funds
  - `QUOTE_EXPIRED`: quote expired before funding — retry with faster execution

## Amounts Reference

All tests use small amounts to conserve testnet funds. Amounts are denominated in the target's stablecoin at 6 decimals — every supported stablecoin uses 6 decimals on every supported chain, so the raw numbers below hold for all targets.

| Test | Amount | Notes |
|------|--------|-------|
| 2 (deposit) | 0.50 stablecoin (500000) | |
| 3 (transfer-out) | `solana-usdc`: 0.10 (100000), all others: 0.20 (200000) | EVM chains must exceed ~100100 custody fee; Tron mirrors the EVM minimum |
| 4-5 (Stablecoin→USD RT) | $0.10 locked receiving (10 cents) | |
| 6 (Stablecoin→MXN RT) | 11.00 MXN locked receiving (1100 centavos, ~$0.55) | Some envs enforce 1100 minimum |
| 7 (USD→Stablecoin) | $0.50 sending (50 cents) | Requires sandbox or prior USD balance |
| 8 (Stablecoin→USD acct) | 0.05 stablecoin sending (50000) | Requires stablecoin from test 2 |
| 9 (Stablecoin→MXN acct) | 0.05 stablecoin sending (50000) | Requires stablecoin from test 2 |
| 10 (Stablecoin→UMA RT) | $0.10 locked receiving (10 cents) | Requires valid UMA receiver |
| 11 (USD→UMA acct) | $0.10 sending (10 cents) | Requires USD balance + valid UMA receiver |

**Total per target: ~1.3-1.5 stablecoin units + gas fees.** Running `ethereum-usdc` and `ethereum-usdt` together therefore needs ~1.5 USDC *and* ~1.5 USDT in the same wallet, plus enough ETH for both runs.

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
  "plasmaTestnetPrivateKey": "hex-private-key-with-or-without-0x",
  "plasmaMainnetPrivateKey": "hex-private-key-with-or-without-0x",
  "tronTestnetPrivateKey": "hex-private-key-with-or-without-0x",
  "tronMainnetPrivateKey": "hex-private-key-with-or-without-0x"
}
```

Only the keys for targets you want to test are required. The skill auto-skips targets without keys. One key covers every target on its chain — `ethereumTestnetPrivateKey` serves both `ethereum-usdc` and `ethereum-usdt`.

## Token Contracts

Each helper hardcodes the token contracts it sends and reads. For reference:

| Target | Testnet contract | Mainnet contract |
|---|---|---|
| `ethereum-usdc` | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` (Sepolia) | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` |
| `ethereum-usdt` | `0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0` (Sepolia) | `0xdAC17F958D2ee523a2206206994597C13D831ec7` |
| `plasma-usdt` | `0x502012b361AebCE43b26Ec812B74D9a51dB4D412` | `0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb` |
| `tron-usdt` | `TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs` (Shasta) | `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t` |

Both Plasma contracts report `symbol()` as `USDT0` (Plasma's USD₮0 branding) with 6 decimals. Grid treats them as `USDT` — `STABLE_CURRENCY` stays `USDT` in all API bodies.

If a deposit never lands despite a confirmed on-chain send, the most likely cause is a contract mismatch — Grid indexes a different token contract than the helper sent to. Verify against Grid's configured contract for that network before debugging further.
