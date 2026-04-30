# Grid offramp scripts

Step-by-step guide for the **USDB embedded wallet → USD bank** offramp flow,
plus onboarding and the on-ramp (USD → USDB) for completeness. Most steps
are plain HTTP calls; the only operations that aren't expressible in curl
are HPKE bundle decrypt and Turnkey API stamp construction, which live in
[`embedded-wallet-sign.js`](./embedded-wallet-sign.js) (using
`@turnkey/crypto` and `@turnkey/api-key-stamper`).

## Prereqs

Install once:

```bash
cd scripts && npm install
```

Then set credentials:

```bash
export GRID_BASE_URL="https://api.lightspark.com/grid/2025-10-13"
export GRID_CLIENT_ID="<your client id>"
export GRID_CLIENT_SECRET="<your client secret>"

SIGN="node $(pwd)/scripts/embedded-wallet-sign.js"
g() { curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" "$@"; }
```

`$SIGN --help` lists the three subcommands. `g` is a shorthand for
authenticated curl used throughout the snippets below.

## 1. Onboarding

### 1.1 Create a customer

```bash
g -X POST -H 'Content-Type: application/json' \
  -d '{
    "customerType": "INDIVIDUAL",
    "platformCustomerId": "your-id-here",
    "umaAddress": "$alice@yourplatform.example",
    "email": "alice@example.com",
    "fullName": "Alice Example",
    "birthDate": "1990-01-15",
    "nationality": "US"
  }' "$GRID_BASE_URL/customers" | jq .
```

Capture the returned `id` (e.g. `Customer:01...`) into `$CUSTOMER_ID`.

### 1.2 Wait for KYB / KYC approval

Customer creation returns `kybStatus: "UNVERIFIED"`. Internal accounts
auto-provision **after** approval. Poll:

```bash
g "$GRID_BASE_URL/customers/$CUSTOMER_ID" | jq '{kybStatus}'
```

### 1.3 Find the embedded-wallet accounts

After approval, two internal accounts appear (USDB embedded wallet + USD):

```bash
g "$GRID_BASE_URL/customers/internal-accounts?customerId=$CUSTOMER_ID" \
  | jq '.data[] | {id, currency: .balance.currency.code, type}'
```

Capture the **USDB account id** into `$USDB_ACCT`.

### 1.4 Bootstrap the embedded wallet (register an EMAIL_OTP credential)

> **Required before the first quote.** The USDB embedded wallet's Turnkey
> sub-org and Spark network wallet aren't fully provisioned at customer
> creation time. Registering an auth credential triggers that bootstrap.
> Skipping causes the first on-ramp quote to fail with
> `to_network INTERNAL_FUNDED_FIAT does not support USDB`.

```bash
CRED=$(g -X POST -H 'Content-Type: application/json' \
  -d '{"type": "EMAIL_OTP", "accountId": "'$USDB_ACCT'"}' \
  "$GRID_BASE_URL/auth/credentials")
CRED_ID=$(echo "$CRED" | jq -r .id)
```

This also sends an OTP email to the address on the customer record. Keep
the code handy; you'll use it for the offramp signing step (3.3) within
the OTP TTL (~5 min). If it expires, re-issue via `/challenge` (3.2).

### 1.5 Add a destination bank (USD external account)

```bash
g -X POST -H 'Content-Type: application/json' \
  -d '{
    "customerId": "'$CUSTOMER_ID'",
    "currency": "USD",
    "accountInfo": {
      "accountType": "USD_ACCOUNT",
      "paymentRails": ["RTP"],
      "routingNumber": "121042882",
      "accountNumber": "0000000000",
      "beneficiary": {
        "beneficiaryType": "INDIVIDUAL",
        "fullName": "Alice Example",
        "birthDate": "1990-01-15",
        "nationality": "US"
      }
    }
  }' "$GRID_BASE_URL/customers/external-accounts" | jq .
```

Capture the returned `id` (e.g. `ExternalAccount:01...`) into `$BANK_ID`.

## 2. On-ramp ($1 USD → 1 USDB)

The platform funds USD into its own internal USD account first (real wire /
ACH / RTP — out of scope for this script). Once the platform USD account
has a balance, drive a quote from platform USD → customer USDB. No signing
needed.

```bash
PLATFORM_USD=$(g "$GRID_BASE_URL/platform/internal-accounts?currency=USD" \
  | jq -r '.data[0].id')

QUOTE=$(g -X POST -H 'Content-Type: application/json' \
  -d '{
    "source":      {"sourceType": "ACCOUNT", "accountId": "'$PLATFORM_USD'"},
    "destination": {"destinationType": "ACCOUNT", "accountId": "'$USDB_ACCT'", "currency": "USDB"},
    "lockedCurrencySide": "SENDING",
    "lockedCurrencyAmount": 100
  }' "$GRID_BASE_URL/quotes")
QUOTE_ID=$(echo "$QUOTE" | jq -r .id)
TXN_ID=$(echo "$QUOTE" | jq -r .transactionId)

g -X POST -H 'Content-Type: application/json' -d '{}' \
  "$GRID_BASE_URL/quotes/$QUOTE_ID/execute" | jq '.status'

while :; do
  S=$(g "$GRID_BASE_URL/transactions/$TXN_ID" | jq -r .status)
  echo "$S"
  [ "$S" = "COMPLETED" ] || [ "$S" = "FAILED" ] && break
  sleep 2
done
```

## 3. Off-ramp (USDB → USD bank)

The customer's embedded wallet must produce a Turnkey-stamped signature
over a `payloadToSign` returned by the quote. Step 1.4 already registered
the credential — we just need a fresh OTP and an ephemeral keypair.

### 3.1 Generate an ephemeral keypair

The verify response is HPKE-sealed to a public key you supply. Generate a
fresh P-256 pair per session:

```bash
$SIGN gen-keypair > /tmp/keys.json
PUB_HEX=$(jq -r .pubHex /tmp/keys.json)
PRIV_HEX=$(jq -r .privHex /tmp/keys.json)
```

### 3.2 (Re-)issue an OTP

To get a fresh OTP (after expiry or for a new session):

```bash
g -X POST -H 'Content-Type: application/json' -d '{}' \
  "$GRID_BASE_URL/auth/credentials/$CRED_ID/challenge"
```

Read the OTP code from the email and assign to `$OTP`.

### 3.3 Verify the OTP and decrypt the session key

```bash
VERIFY=$(g -X POST -H 'Content-Type: application/json' \
  -d '{"type": "EMAIL_OTP", "otp": "'$OTP'", "clientPublicKey": "'$PUB_HEX'"}' \
  "$GRID_BASE_URL/auth/credentials/$CRED_ID/verify")

BUNDLE=$(echo "$VERIFY" | jq -r .encryptedSessionSigningKey)
SESSION_PRIV_HEX=$($SIGN decrypt-bundle "$BUNDLE" "$PRIV_HEX")
echo "Session expires: $(echo "$VERIFY" | jq -r .expiresAt)"
```

Sessions are short-lived (~15 min). Cache `$SESSION_PRIV_HEX` and run the
remaining steps before it expires; otherwise re-run `gen-keypair` →
`/challenge` → `/verify` → `decrypt-bundle`.

### 3.4 Create the offramp quote

```bash
QUOTE=$(g -X POST -H 'Content-Type: application/json' \
  -d '{
    "source":      {"sourceType": "ACCOUNT", "accountId": "'$USDB_ACCT'"},
    "destination": {"destinationType": "ACCOUNT", "accountId": "'$BANK_ID'", "currency": "USD"},
    "lockedCurrencySide": "SENDING",
    "lockedCurrencyAmount": 1000000
  }' "$GRID_BASE_URL/quotes")

QUOTE_ID=$(echo "$QUOTE" | jq -r .id)
TXN_ID=$(echo "$QUOTE" | jq -r .transactionId)
PAYLOAD=$(echo "$QUOTE" \
  | jq -r '.paymentInstructions[].accountOrWalletInfo
           | select(.accountType=="EMBEDDED_WALLET").payloadToSign')
```

The quote response also includes a `SPARK_WALLET` invoice — that's the
alternative funding path (pay USDB into the invoice from an external Spark
wallet). The embedded-wallet path uses the existing on-chain balance and
needs a stamp.

### 3.5 Stamp the payload

```bash
STAMP=$($SIGN stamp "$SESSION_PRIV_HEX" "$PAYLOAD")
```

### 3.6 Execute

```bash
g -X POST -H 'Content-Type: application/json' \
   -H "Grid-Wallet-Signature: $STAMP" \
   -d '{}' \
   "$GRID_BASE_URL/quotes/$QUOTE_ID/execute" | jq '.status'

# Poll — typically 60–180s for the full chain to reach COMPLETED.
while :; do
  S=$(g "$GRID_BASE_URL/transactions/$TXN_ID" | jq -r .status)
  echo "$S"
  [ "$S" = "COMPLETED" ] || [ "$S" = "FAILED" ] && break
  sleep 5
done
```

On `COMPLETED`, the user's bank receives the USD via RTP.

## Troubleshooting

| Symptom | Cause |
|---|---|
| `to_network INTERNAL_FUNDED_FIAT does not support USDB` on the first on-ramp quote | Embedded wallet not bootstrapped. Register an EMAIL_OTP credential first (step 1.4). |
| `EMAIL_OTP_CREDENTIAL_ALREADY_EXISTS` on `POST /auth/credentials` | The wallet already has a credential. Use `POST /auth/credentials/{id}/challenge` to re-issue an OTP. |
| `No pending OTP for this credential` on `/verify` | OTP expired (typically ~5 min). Re-run `/challenge` and verify quickly. |
| `INSUFFICIENT_FUNDS` on offramp quote create | USDB on-chain balance at the embedded wallet's Spark address is below the requested amount. The Grid book balance can be ahead of the chain — check the on-chain side via `spark-cli` or your Spark explorer. |
| Execute returns 500 / "INTERNAL_ERROR" | Often: bad `Grid-Wallet-Signature`. Verify `$SESSION_PRIV_HEX` matches the active session and `$PAYLOAD` is the exact `payloadToSign` byte string. |
| Txn stuck in `PROCESSING` indefinitely | Grid build pre-dates the SP-2912 fix, or paycore detection of the on-chain Spark deposit hasn't fired. Check paycore worker logs. |
