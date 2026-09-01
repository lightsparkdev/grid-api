# Travel Rule Test Catalog

Wallet ownership verification for self-custody crypto external accounts under the
EU Travel Rule, on a Grid platform backed by the **Striga** switch.

These tests are numbered `TR1`…`TR24` rather than continuing the main catalog's
1–11. They are not chain-generic: they only run against a Striga-backed platform,
and most of them assert compliance state rather than money movement.

## What this exercises

A customer registers a self-custody wallet. Grid declares it to Striga as a
Travel Rule counterparty, which parks the account in
`PENDING_OWNERSHIP_VERIFICATION`. The customer proves control by signing a
message with the wallet's key. Striga matches the signature and the account
becomes `ACTIVE`.

Two statuses carry the "may transact below the regulatory threshold" state:

| Status | Meaning |
|---|---|
| `PENDING_OWNERSHIP_VERIFICATION` | Ownership is owed and has not been refused |
| `UNVERIFIED` | The most recent attempt was refused; start a new challenge to retry |

Four endpoints, two per ownership tree:

| Method | Endpoint |
|---|---|
| POST | `/customers/external-accounts/{externalAccountId}/challenge` |
| POST | `/customers/external-accounts/{externalAccountId}/verify` |
| POST | `/platform/external-accounts/{externalAccountId}/challenge` |
| POST | `/platform/external-accounts/{externalAccountId}/verify` |

## Targets

Striga maps only three chains (`BTC`, `ETH`, `SOL`), and only two of them have a
helper with `sign-message`:

| Target | `WALLET_TYPE` | `CRYPTO_NETWORK` | Striga asset | Signature format |
|---|---|---|---|---|
| `solana-usdc` | `SOLANA_WALLET` | `SOLANA_DEVNET` | `USDC_SOL` | base58 Ed25519 |
| `ethereum-usdc` | `ETHEREUM_WALLET` | `ETHEREUM_TESTNET` | `USDC` | EIP-191 `0x` hex |

`base-usdc`, `polygon-usdc`, `plasma-usdt` and `tron-usdt` have no Striga network
mapping — a wallet on those chains is never declared and never enters ownership
verification. Skip them for this catalog.

Bitcoin is supported by Striga and is the only chain that exercises the
`signatureScheme` field (`bip137` / `electrum`), but no `bitcoin_helper.py`
exists yet. `signatureScheme` is ignored for non-Bitcoin chains.

## Wallet roles — read before running

**Once an external account is deleted, its address can never be declared to
Striga again** (`42046`). Re-registering the same address returns that error
forever after. Wallets are therefore not interchangeable here, and a careless
delete permanently burns an address for this platform.

| Role | Which wallet | Rule |
|---|---|---|
| **Funded** | The chain's key from `~/.grid-credentials` — the one that holds testnet USDC and gas | Used by TR1–TR5 and TR18–TR24. **Never delete its external account.** |
| **Throwaway** | A fresh keypair from `chain_helper gen-keypair` | Used by every negative case. Discard after the run; never write it to `~/.grid-credentials`. |

Generate a throwaway wallet and sign with it:

```bash
chain_helper gen-keypair
# {"address": "...", "privateKey": "..."}
chain_helper sign-message --message-file msg.txt --private-key "$THROWAWAY_KEY"
```

`gen-keypair` and `sign-message --private-key` touch no RPC and need no
credentials file.

## Signing the challenge message

The message is matched **character-for-character** by Striga, which rebuilds it
server-side. Its shape:

```
I am verifying ownership of the wallet address {address} as {owner_id}. This message was signed on {DD/MM/YYYY} to confirm my control over this wallet.
```

`{owner_id}` is the **Striga** user id, not the Grid customer id, and the date is
UTC. Striga accepts yesterday, today and tomorrow, so a challenge stops being
answerable at the end of the day after it was issued.

Never retype the message. Write the `messageToSign` field straight to a file and
sign the file, so no shell quoting can alter a byte:

```bash
jq -r .messageToSign challenge.json > msg.txt
```

`jq -r` appends one newline; `sign-message --message-file` strips exactly one and
signs the rest verbatim, so the two compose safely. Prefer `--message-file` over
`--message` throughout — the message is long, contains spaces, and comes from the
API rather than from you.

## Variables

Set these in addition to the main catalog's Step 2 credentials. Point
`~/.grid-credentials` `baseUrl` at the Striga-backed platform before starting —
these tests do not run on a non-Striga platform.

```bash
TR_PREFIX="travel-rule-test"          # customer id prefix
STABLE_CURRENCY="USDC"
OWNERSHIP_TREE="customers"            # or "platform" for TR11
```

---

## TR0: Preflight — is Travel Rule actually on for this platform?

**Goal:** Prove the feature is live before running 24 tests that would all
silently pass by doing nothing. If Striga's Travel Rule config is off for this
platform, or the switch has no asset mapping for the chain, wallets go straight
to `ACTIVE` and nothing below fires.

**Steps:**

1. Create a customer as in main catalog Test 1, with `TR_PREFIX`.

2. Register the funded wallet as a first-party self-custody external account:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{
    \"customerId\": \"$CUSTOMER_ID\",
    \"currency\": \"$STABLE_CURRENCY\",
    \"cryptoNetwork\": \"$CRYPTO_NETWORK\",
    \"ownershipType\": \"FIRST_PARTY\",
    \"accountInfo\": {
      \"accountType\": \"$WALLET_TYPE\",
      \"address\": \"$WALLET_ADDRESS\"
    }
  }" \
  "$GRID_BASE_URL/$OWNERSHIP_TREE/external-accounts"
```

Save `id` as `TR_ACCOUNT_ID`.

3. Read back the status:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  "$GRID_BASE_URL/$OWNERSHIP_TREE/external-accounts/$TR_ACCOUNT_ID" | jq .status
```

**Expected:** `PENDING_OWNERSHIP_VERIFICATION`.

**If it returns `ACTIVE`, stop and report.** One of these is true, and the rest
of the catalog is meaningless until it is resolved:

| Cause | How to tell |
|---|---|
| Not a Striga-backed platform | The platform's switch is something else — check the platform config |
| Chain not mapped to a Striga network | Only BTC/ETH/SOL are; see Targets above |
| `ownershipType` was omitted or `THIRD_PARTY` | Re-read the request body — this is the most common mistake |
| Striga Travel Rule config is off for this application | Ask Striga; nothing in Grid reveals it |

Note the omission case: `ownershipType` is **nullable**. A wallet created without
it is not first-party, so it can never prove ownership and is never held. Every
account-creation body in this catalog sets it explicitly.

---

## Group A — The happy path

### TR1: Register a first-party self-custody wallet

Covered by TR0 steps 2–3. Record `TR_ACCOUNT_ID` and the observed status.

**Expected:** `201`, status `PENDING_OWNERSHIP_VERIFICATION`.

### TR2: Request a wallet-signature challenge

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{"method": "WALLET_SIGNATURE"}' \
  "$GRID_BASE_URL/$OWNERSHIP_TREE/external-accounts/$TR_ACCOUNT_ID/challenge" \
  > challenge.json
cat challenge.json
```

**Expected:** `201`, body `{"method":"WALLET_SIGNATURE","messageToSign":"...","expiresAt":"..."}`.

**Assert:**
- `messageToSign` matches the template above, with the wallet address embedded verbatim.
- The `as {owner_id}` segment is a Striga user id, *not* `$CUSTOMER_ID`. Record both — a mismatch here is the single most likely cause of a signature Striga refuses.
- `expiresAt` is the end of the day *after* today, UTC.

### TR3: Sign and verify

```bash
jq -r .messageToSign challenge.json > msg.txt
SIG=$(chain_helper sign-message --message-file msg.txt | jq -r .signature)

curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d "{\"signature\": \"$SIG\"}" \
  "$GRID_BASE_URL/$OWNERSHIP_TREE/external-accounts/$TR_ACCOUNT_ID/verify"
```

**Expected:** `200`. The response body is the **external account**, and its
`status` is `ACTIVE`. This is the endpoint's whole point — it reloads the account
after the trigger settles so the caller sees the resulting status without a
second read.

**Assert:** `.status == "ACTIVE"` in the verify response itself, not just on a
follow-up GET.

This is the test the entire feature exists for. If TR3 passes, the flow works.

### TR4: Verify again — idempotent

Re-run TR3's verify with the same signature.

**Expected:** `200`, still `ACTIVE`, and **no call to Striga**. The switch returns
early when the latest attempt is already `VERIFIED`.

### TR5: Challenge an account that is already ACTIVE

Re-run TR2 against the now-`ACTIVE` `TR_ACCOUNT_ID`.

**Expected:** `409 CONFLICT` — "This account has no open ownership question, so a
new challenge cannot be issued for it."

Challenge is gated on an allowlist of `PENDING_OWNERSHIP_VERIFICATION` and
`UNVERIFIED`. Verify deliberately is *not* gated on status.

---

## Group B — Preconditions that refuse a challenge

Each of these uses a **throwaway** wallet. None should ever reach a signature.
Create the account, then attempt TR2's challenge against it.

### TR6: Custodied wallet (`vaspName` set)

Create with `"vaspName": "Kraken"` alongside `ownershipType: FIRST_PARTY`.

**Expected on challenge:** `400 INVALID_INPUT` — "This wallet is custodied, so its
owner cannot prove control of it."

**Also assert:** the account did **not** land in `PENDING_OWNERSHIP_VERIFICATION`.
A custodied wallet is still declared to Striga as a counterparty, but its keys are
the VASP's, so it is never held for a proof it cannot produce.

### TR7: Third-party wallet

Create with `"ownershipType": "THIRD_PARTY"`, no `vaspName`.

**Expected on challenge:** `400 INVALID_INPUT` — "Ownership verification applies
only to first-party self-custody wallets."

**Also assert:** status is `ACTIVE`, not pending. A third party's key is theirs to
sign for.

### TR8: `ownershipType` omitted

Create with no `ownershipType` at all — the shape the main catalog's Test 3 uses.

**Expected:** account is `ACTIVE`; challenge returns `400 INVALID_INPUT` (the
first-party message).

This is the trap: the pre-existing Test 3 body creates wallets this way, so a
Striga platform run through the main catalog never exercises Travel Rule at all.

### TR9: Fiat external account

Create an IBAN/SEPA external account and attempt a challenge on it.

**Expected:** `400 INVALID_INPUT` — "Ownership verification applies only to crypto
wallets."

### TR10: Unknown external account id

Challenge `ExternalAccount:00000000-0000-0000-0000-000000000000`.

**Expected:** `404 ACCOUNT_NOT_FOUND`.

### TR11: Wrong ownership tree

Take the customer-owned `TR_ACCOUNT_ID` and issue the challenge against the
**platform** tree:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" -d '{"method": "WALLET_SIGNATURE"}' \
  "$GRID_BASE_URL/platform/external-accounts/$TR_ACCOUNT_ID/challenge"
```

**Expected:** `404 ACCOUNT_NOT_FOUND` — the handler checks the owner's type and
reports not-found rather than leaking that the account exists on the other tree.

Repeat in the other direction with a platform-owned wallet against
`/customers/...` if the platform has one.

---

## Group C — Failure and retry semantics

Use a fresh **throwaway** wallet registered first-party, so a burned status
costs nothing. Call it `TR_NEG_ID`.

### TR12: A signature from the wrong key

Issue a challenge for `TR_NEG_ID`, then sign its message with a *different*
throwaway key:

```bash
OTHER=$(chain_helper gen-keypair | jq -r .privateKey)
SIG=$(chain_helper sign-message --message-file msg.txt --private-key "$OTHER" | jq -r .signature)
```

Submit it to verify.

**Expected:** `400 INVALID_INPUT` — "The wallet signature is invalid or has
expired." Striga returns `42005`; the switch closes the attempt `FAILED` and the
trigger writes the account to `UNVERIFIED`.

**Assert:** a follow-up GET shows `UNVERIFIED`.

### TR13: Retry after a refusal

Issue a **new** challenge against the now-`UNVERIFIED` `TR_NEG_ID`.

**Expected:** `201` with a *new* message — the previous attempt is `FAILED`, not
pending, so a fresh row is created.

**Assert the account status, and expect the docs to be wrong here.** The
`challenge` endpoint's description and the `ExternalAccountStatus` schema both
say an `UNVERIFIED` account "returns to `PENDING_OWNERSHIP_VERIFICATION` when a
new challenge is issued". It does not. `EntGridStrigaWalletVerificationTrigger`
only writes the account on a *settled* attempt — `gen_run_on_creation` returns
the row untouched — so the account stays `UNVERIFIED` until the retry succeeds.

Record what you actually observe. The flow still recovers correctly, because
`UNVERIFIED` is itself challengeable and verify is not status-gated; only the
documented intermediate state is wrong.

Then sign this new message with the **correct** key and verify.

**Expected:** `200`, `ACTIVE`. A refusal is recoverable.

### TR14: A malformed signature payload

Submit garbage that is not a signature at all:

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{"signature": "not-a-signature"}' \
  "$GRID_BASE_URL/$OWNERSHIP_TREE/external-accounts/$TR_NEG_ID/verify"
```

**Expected — and this is the point of the test:** Striga's `42005` covers *both*
a refused signature and an invalid payload, but the switch treats `42005` as
"Striga judged the signature and refused it" (the constant is literally named
`_STRIGA_INVALID_SIGNATURE_CODE`). So a malformed request is likely to close the
attempt `FAILED` and burn the account to `UNVERIFIED`, when it should have been a
`400` that left the challenge intact.

**Record which happens.** If the account moves to `UNVERIFIED`, that confirms the
mislabel and the wallet paid for a client-side mistake. Note it and move on —
TR13 shows the state is recoverable.

### TR15: An expired challenge

Attempts are looked up with `expires_at > now`, so an expired attempt is not
found at all rather than being rejected by Striga.

Full coverage needs a challenge older than the end of the following UTC day,
which the run cannot wait for. Two options:

- **Observational:** assert `expiresAt` in TR2 is end-of-day-tomorrow UTC, and
  record that the expiry path is untested.
- **If a stale challenge exists** from a previous day's run against the same
  wallet, verify against it.

**Expected when it can be run:** `400 INVALID_INPUT` — "No wallet ownership
challenge is outstanding for this account." Not a signature error: the row is
invisible to the lookup, so it reads as "no challenge", not "bad signature".

### TR16: Re-challenge while one is still in flight

Issue a challenge for a fresh throwaway wallet, record `messageToSign`, then
**immediately issue another** without verifying.

**Expected — a second documented mismatch.** The spec says "Calling this endpoint
again abandons any in-flight challenge and issues a new one with the requested
method." The implementation does the opposite: `_gen_signature_challenge` returns
the existing `PENDING` unexpired attempt unchanged, same message, same
`expiresAt`. No new row is created.

**Assert:** the two `messageToSign` values are **identical**.

That behaviour is arguably the better one — it makes the endpoint idempotent, so
a user who reloads a signing page gets the same message rather than invalidating
the one they were about to sign. But it is not what the docs promise. Report it;
either the docs or the code should move.

Then request `LIVENESS` on the same account. Because the pending-attempt lookup
filters on `method = WALLET_SIGNATURE`, a liveness challenge is created
regardless, and a subsequent `WALLET_SIGNATURE` request still returns the
original signature message.

---

## Group D — Liveness

### TR17: Open a liveness challenge

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{"method": "LIVENESS"}' \
  "$GRID_BASE_URL/$OWNERSHIP_TREE/external-accounts/$TR_NEG_ID/challenge"
```

**Expected:** `201` with `{"method":"LIVENESS","verificationLink":"...","expiresAt":"..."}`,
and possibly a `token` for embedding Sumsub's SDK directly.

**Assert:** the account stays `PENDING_OWNERSHIP_VERIFICATION` — liveness settles
asynchronously by webhook, so nothing changes at request time.

Completing the hosted flow is a manual, browser step. If you do complete it,
poll the account or watch for `EXTERNAL_ACCOUNT.STATUS_UPDATED`. Otherwise record
TR17 as "challenge opened, completion not exercised".

---

## Group E — Money movement

These use the **funded** wallet and the account from TR3, now `ACTIVE`.

### TR18: Withdraw to a verified wallet

Run the main catalog's Test 3 (transfer-out) against `TR_ACCOUNT_ID`.

**Expected:** succeeds, funds land on chain.

### TR19: Withdraw to a wallet still owing proof

Register a second first-party wallet, leave it in
`PENDING_OWNERSHIP_VERIFICATION`, and quote/send to it.

**Expected: it works.** This is counter-intuitive and worth confirming rather
than assuming. `create_quote` resolves destinations through `gen_account_by_id`,
which rejects only `INACTIVE`; the main send path checks no status at all. There
is no general transfer gate on these two statuses — that premise was wrong, and
the finding is what reduced the "transfer gate" work to a refusal-code mapping.

**Assert:** the send is not refused by *Grid*. Striga may still refuse it above
the threshold — that is TR23/TR24.

### TR20: SCA trust-start against a pending wallet

Start beneficiary trust on the `PENDING_OWNERSHIP_VERIFICATION` wallet from TR19.

**Expected:** admitted. This was the one real block, and it now accepts `ACTIVE`,
`PENDING_OWNERSHIP_VERIFICATION` and `UNVERIFIED`.

**Also assert the refusals still hold:** `UNDER_REVIEW` (a sanction hold) and
`INACTIVE` (a deletion) are still refused `ACCOUNT_NOT_FOUND`.

### TR21: Deposit from the verified wallet

Send USDC on chain from the funded wallet — now a verified, declared
counterparty — to the customer's internal account, as in main catalog Test 2.

**Expected:** the deposit lands and is credited. Neither hold reason has anything
to ask.

### TR22: Deposit from an unregistered source

Send from an address that is **not** a registered external account.

**Expected:** held and reported, by design. For a Striga-backed EUR/USDC deposit
the source must be a registered external account that completed ownership
verification; an unregistered source goes no further.

**Open question worth answering during this run:** if the customer registers and
verifies that source *after* the deposit is held, does Striga re-evaluate and
release it? If yes the standard is self-healing. If no, someone has to unstick
funds by hand — which is a support burden worth knowing about before launch.
Ask Striga, or test it directly here.

Requires a second funded address. Do not reuse a burned one.

### TR23: The €1,000 threshold

Striga enforces the threshold; Grid does no arithmetic and only maps refusals.

- **Under €1,000:** nothing fires. An unverified or third-party destination
  transacts normally.
- **Over €1,000:** Striga refuses, and the refusal code carries the reason.

Sandbox balances make a genuine >€1,000 transfer awkward. If funds do not allow
it, record TR23 as not exercised rather than inferring the behaviour.

### TR24: Refusal-code mapping

Whatever refusals TR22/TR23 produce, record the **raw Striga code** and what Grid
returned to the caller.

| Striga code | Meaning | Intended handling |
|---|---|---|
| `42002` | Owned wallet, over threshold | Retryable — names verify-wallet as the remedy |
| `42004` | Third-party wallet | Terminal |
| `42008` | VASP counterparty user info missing | Create the counterparty and retry |
| `42046` | Address already declared | See the wallet-roles warning above |

**This mapping does not exist yet.** It needs
`EXTERNAL_ACCOUNT_VERIFICATION_REQUIRED` on sparkcore's `ErrorCode`, which
grid-api publishes but sparkcore does not define. So expect these to surface as a
generic error today.

TR24 is therefore a **documentation test**: capture exactly what a caller sees for
each code, so the mapping can be written against real responses rather than
guessed. It is the last substantive piece of work in this area.

---

## Known spec/implementation mismatches

Confirmed by reading `main`, not inferred. Assert them rather than treating them
as failures:

| # | Docs say | Implementation does | Test |
|---|---|---|---|
| 1 | Re-issuing a challenge abandons the in-flight one | Returns the same pending challenge unchanged | TR16 |
| 2 | An `UNVERIFIED` account returns to `PENDING_OWNERSHIP_VERIFICATION` on a new challenge | Stays `UNVERIFIED` until the retry settles | TR13 |
| 3 | `42005` means an invalid signature | Also fires on an invalid payload, so a malformed request burns the account to `UNVERIFIED` | TR14 |

## Results

```
## Travel Rule Results (solana-usdc)
| #    | Test Case                                   | Status | Details |
|------|---------------------------------------------|--------|---------|
| TR0  | Preflight — Travel Rule active              | PASS   | ...     |
| TR1  | Register first-party self-custody wallet    | PASS   | ...     |
| TR2  | Wallet-signature challenge                  | PASS   | ...     |
| TR3  | Sign + verify → ACTIVE                      | PASS   | ...     |
| ...  |                                             |        |         |
```

Include in Details: the account id, the observed status, the raw error code, and
for TR2 both the Striga owner id and the Grid customer id.

If TR0 fails, report every other test as SKIPPED rather than PASS. They would all
trivially pass against a platform where the feature is switched off, and that is
the single most misleading outcome this catalog can produce.
