# Per-corridor external account cheatsheet

The minimum fields to register an external account for the four corridors the
tutorial covers. Use these exact shapes — the SDK will reject extra/missing fields.

For all 27 supported countries with their full schemas, the sibling `grid-api` skill's
`references/account-types.md` is authoritative. This file is a focused subset.

## USD → MXN (CLABE / SPEI)

```json
{
  "customerId": "<customerId>",
  "currency": "MXN",
  "accountInfo": {
    "accountType": "MXN_ACCOUNT",
    "paymentRails": ["SPEI"],
    "clabeNumber": "002010000000000001",
    "beneficiary": {
      "beneficiaryType": "INDIVIDUAL",
      "fullName": "Beneficiary Name",
      "birthDate": "1990-01-15",
      "nationality": "MX"
    }
  }
}
```

CLABE is exactly **18 digits**. The last digits act as a sandbox magic suffix:

| Last 3 digits | Behavior |
| --- | --- |
| `001` (or other) | Success |
| `002` | Fails — insufficient funds |
| `003` | Fails — account closed |
| `004` | Fails — bank rejects |
| `005` | Delays ~30s then fails |
| `1xx` | Triggers beneficiary name verification scenarios |

For a tutorial happy path, use a CLABE ending in `001`.

## USD → EUR (SEPA Instant)

```json
{
  "customerId": "<customerId>",
  "currency": "EUR",
  "accountInfo": {
    "accountType": "EUR_ACCOUNT",
    "paymentRails": ["SEPA_INSTANT"],
    "iban": "DE89370400440532013000",
    "beneficiary": {
      "beneficiaryType": "INDIVIDUAL",
      "fullName": "Beneficiary Name",
      "birthDate": "1990-01-15",
      "nationality": "DE"
    }
  }
}
```

`bic` is optional for SEPA Instant — Grid derives it from the IBAN.

## USD → INR (UPI)

```json
{
  "customerId": "<customerId>",
  "currency": "INR",
  "accountInfo": {
    "accountType": "INR_ACCOUNT",
    "paymentRails": ["UPI"],
    "vpa": "beneficiary@bank",
    "beneficiary": {
      "beneficiaryType": "INDIVIDUAL",
      "fullName": "Beneficiary Name",
      "birthDate": "1990-01-15",
      "nationality": "IN"
    }
  }
}
```

UPI VPA looks like an email. Standard sandbox values work; use `success@razorpay`
for a deterministic-success path.

## USD → USD (ACH)

```json
{
  "customerId": "<customerId>",
  "currency": "USD",
  "accountInfo": {
    "accountType": "USD_ACCOUNT",
    "paymentRails": ["ACH"],
    "routingNumber": "021000021",
    "accountNumber": "000123456789",
    "accountSubtype": "CHECKING",
    "beneficiary": {
      "beneficiaryType": "INDIVIDUAL",
      "fullName": "Beneficiary Name",
      "birthDate": "1990-01-15",
      "nationality": "US"
    }
  }
}
```

ACH is "instant" in sandbox but in production settles next business day. If your
tutorial user wants to demo a faster real rail, swap to RTP / FedNow once those are
in their platform config.

## Business beneficiary variant

For a `BUSINESS` customer or a business beneficiary, replace the `beneficiary` block
with:

```json
{
  "beneficiaryType": "BUSINESS",
  "businessInfo": {
    "legalName": "Acme Corp",
    "entityType": "LLC",
    "taxId": "12-3456789",
    "registrationCountry": "US"
  }
}
```

Country-specific tax-ID formats apply (RFC for Mexico, CNPJ for Brazil, etc.). The
`grid-api` skill's `references/account-types.md` has the full matrix.

## Common pitfalls

1. **Always include `currency`** in the top-level body. Even though `accountType`
   implies it, omitting it is the most common 400.
2. **`paymentRails` is an array.** Pass `["SPEI"]` not `"SPEI"`.
3. **`beneficiary.fullName` is required** for INDIVIDUAL beneficiaries. `birthDate`
   and `nationality` are optional but strongly recommended (some corridors require
   them — Brazil / Nigeria).
4. **CLABE is 18 digits, not 16 or 20.** Pad-left with `0`s if the user's input is
   shorter (and double-check before sending).
