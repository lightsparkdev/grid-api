# External Account Types by Country/Region

This reference maps countries/regions to their required account types and fields for sending payments via the Grid API.

## Account Type Summary

| Country/Region | Account Type | Currency | Payment Rail(s) | Primary Identifier |
|----------------|--------------|----------|-----------------|-------------------|
| Brazil | BRL_ACCOUNT | BRL | PIX | PIX key |
| Canada | CAD_ACCOUNT | CAD | BANK_TRANSFER | Bank code + Branch code + Account number |
| Denmark | DKK_ACCOUNT | DKK | SEPA, SEPA_INSTANT | IBAN |
| Europe (SEPA) | EUR_ACCOUNT | EUR | SEPA, SEPA_INSTANT | IBAN |
| Hong Kong | HKD_ACCOUNT | HKD | BANK_TRANSFER | Bank name + SWIFT + Account number |
| India | INR_ACCOUNT | INR | UPI | UPI VPA (user@bank) |
| Indonesia | IDR_ACCOUNT | IDR | BANK_TRANSFER | Bank name + SWIFT + Account number + Phone |
| Kenya | KES_ACCOUNT | KES | MOBILE_MONEY | Phone number + Provider |
| Malawi | MWK_ACCOUNT | MWK | MOBILE_MONEY | Phone number + Provider |
| Malaysia | MYR_ACCOUNT | MYR | BANK_TRANSFER | Bank name + SWIFT + Account number |
| Mexico | MXN_ACCOUNT | MXN | SPEI | 18-digit CLABE number |
| Nigeria | NGN_ACCOUNT | NGN | BANK_TRANSFER | Bank name + Account number |
| Philippines | PHP_ACCOUNT | PHP | BANK_TRANSFER | Bank name + Account number |
| Rwanda | RWF_ACCOUNT | RWF | MOBILE_MONEY | Phone number + Provider |
| Singapore | SGD_ACCOUNT | SGD | PAYNOW, FAST, BANK_TRANSFER | Bank name + SWIFT + Account number |
| South Africa | ZAR_ACCOUNT | ZAR | BANK_TRANSFER | Bank name + Account number |
| Tanzania | TZS_ACCOUNT | TZS | MOBILE_MONEY | Phone number + Provider |
| Thailand | THB_ACCOUNT | THB | BANK_TRANSFER | Bank name + SWIFT + Account number |
| Uganda | UGX_ACCOUNT | UGX | MOBILE_MONEY | Phone number + Provider |
| United Kingdom | GBP_ACCOUNT | GBP | FASTER_PAYMENTS | Sort code + Account number |
| United States | USD_ACCOUNT | USD | ACH, WIRE, RTP, FEDNOW | Routing number + Account number |
| Vietnam | VND_ACCOUNT | VND | BANK_TRANSFER | Bank name + SWIFT + Account number |
| West Africa (CFA) | XOF_ACCOUNT | XOF | MOBILE_MONEY | Phone number + Provider |
| Zambia | ZMW_ACCOUNT | ZMW | MOBILE_MONEY | Phone number + Provider |

## Crypto/Wallet Types

| Type | Currency | Primary Identifier |
|------|----------|-------------------|
| SPARK_WALLET | BTC | Spark wallet address |
| LIGHTNING | BTC | Lightning invoice, bolt12 offer, or lightning address |
| SOLANA_WALLET | USDC | Solana wallet address |
| TRON_WALLET | USDT | TRON wallet address |
| POLYGON_WALLET | USDC | Polygon wallet address (0x...) |
| BASE_WALLET | USDC | Base wallet address (0x...) |

## Detailed Field Requirements

**IMPORTANT**: All fiat account types now require a `paymentRails` field specifying the payment rail to use.

### Mexico (MXN_ACCOUNT)

**Individual beneficiary:**

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "MXN",
    "accountInfo": {
      "accountType": "MXN_ACCOUNT",
      "paymentRails": ["SPEI"],
      "clabeNumber": "<18-digit-clabe>",
      "beneficiary": {
        "beneficiaryType": "INDIVIDUAL",
        "fullName": "Full Name",
        "birthDate": "1990-01-15",
        "nationality": "MX"
      }
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

**Business beneficiary:**

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "MXN",
    "accountInfo": {
      "accountType": "MXN_ACCOUNT",
      "paymentRails": ["SPEI"],
      "clabeNumber": "<18-digit-clabe>",
      "beneficiary": {
        "beneficiaryType": "BUSINESS",
        "legalName": "Company Legal Name"
      }
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

Required fields:

- `clabeNumber`: 18-digit CLABE number (validates with check digit)
- For individuals: `fullName` (required), `birthDate`, `nationality` (optional but recommended)
- For businesses: `legalName`

### Brazil (BRL_ACCOUNT)

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "BRL",
    "accountInfo": {
      "accountType": "BRL_ACCOUNT",
      "paymentRails": ["PIX"],
      "pixKey": "12345678901",
      "pixKeyType": "CPF",
      "taxId": "12345678901",
      "beneficiary": {
        "beneficiaryType": "INDIVIDUAL",
        "fullName": "Full Name"
      }
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

Required fields:

- `paymentRails`: `PIX`
- `pixKey`: The PIX key value
- `pixKeyType`: One of `CPF`, `CNPJ`, `EMAIL`, `PHONE`, `RANDOM`
- `taxId`: Tax ID of the account holder

PIX key formats:

- CPF: 11 digits (e.g., `12345678901`)
- CNPJ: 14 digits (e.g., `12345678901234`)
- Email: valid email address
- Phone: +55 followed by number
- Random: 32-character alphanumeric EVP key

### Europe (EUR_ACCOUNT)

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "EUR",
    "accountInfo": {
      "accountType": "EUR_ACCOUNT",
      "paymentRails": ["SEPA_INSTANT"],
      "iban": "DE89370400440532013000",
      "swiftBic": "COBADEFFXXX",
      "beneficiary": {
        "beneficiaryType": "INDIVIDUAL",
        "fullName": "Full Name",
        "birthDate": "1990-01-15",
        "nationality": "DE",
        "address": {
          "line1": "123 Street",
          "city": "Berlin",
          "postalCode": "10115",
          "country": "DE"
        }
      }
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

Required fields:

- `paymentRails`: `SEPA` or `SEPA_INSTANT`
- `iban`: International Bank Account Number (15-34 characters)
- `swiftBic`: SWIFT/BIC code (8 or 11 characters, pattern: `^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$`) — optional

### Denmark (DKK_ACCOUNT)

Same structure as EUR_ACCOUNT but with currency `DKK`:

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "DKK",
    "accountInfo": {
      "accountType": "DKK_ACCOUNT",
      "paymentRails": ["SEPA"],
      "iban": "DK5000400440116243",
      "beneficiary": {
        "beneficiaryType": "INDIVIDUAL",
        "fullName": "Full Name",
        "birthDate": "1990-01-15",
        "nationality": "DK"
      }
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

Required fields:

- `paymentRails`: `SEPA` or `SEPA_INSTANT`
- `iban`: IBAN number
- `swiftBic`: optional

### United States (USD_ACCOUNT)

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "USD",
    "accountInfo": {
      "accountType": "USD_ACCOUNT",
      "paymentRails": ["ACH"],
      "routingNumber": "123456789",
      "accountNumber": "12345678901",
      "beneficiary": {
        "beneficiaryType": "INDIVIDUAL",
        "fullName": "Full Name",
        "birthDate": "1990-01-15",
        "nationality": "US",
        "address": {
          "line1": "123 Main St",
          "city": "San Francisco",
          "state": "CA",
          "postalCode": "94105",
          "country": "US"
        }
      }
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

Required fields:

- `paymentRails`: `ACH`, `WIRE`, `RTP`, or `FEDNOW`
- `routingNumber`: 9-digit ABA routing number
- `accountNumber`: Bank account number

### India (INR_ACCOUNT)

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "INR",
    "accountInfo": {
      "accountType": "INR_ACCOUNT",
      "paymentRails": ["UPI"],
      "vpa": "user@okbank",
      "beneficiary": {
        "beneficiaryType": "INDIVIDUAL",
        "fullName": "Full Name",
        "birthDate": "1990-01-15",
        "nationality": "IN"
      }
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

UPI VPA format: `username@bankhandle` (e.g., `john@okaxis`, `jane@ybl`)

### United Kingdom (GBP_ACCOUNT)

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "GBP",
    "accountInfo": {
      "accountType": "GBP_ACCOUNT",
      "paymentRails": ["FASTER_PAYMENTS"],
      "sortCode": "12-34-56",
      "accountNumber": "12345678",
      "beneficiary": {
        "beneficiaryType": "INDIVIDUAL",
        "fullName": "Full Name",
        "birthDate": "1990-01-15",
        "nationality": "GB"
      }
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

Required fields:

- `paymentRails`: `FASTER_PAYMENTS`
- `sortCode`: 6-digit sort code (pattern: `^[0-9]{2}-?[0-9]{2}-?[0-9]{2}$`)
- `accountNumber`: 8-digit account number (pattern: `^[0-9]{8}$`)

### Nigeria (NGN_ACCOUNT)

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "NGN",
    "accountInfo": {
      "accountType": "NGN_ACCOUNT",
      "paymentRails": ["BANK_TRANSFER"],
      "accountNumber": "1234567890",
      "bankName": "GTBank",
      "beneficiary": {
        "beneficiaryType": "INDIVIDUAL",
        "fullName": "Full Name",
        "birthDate": "1990-05-15",
        "nationality": "NG"
      }
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

Required fields:

- `paymentRails`: `BANK_TRANSFER`
- `accountNumber`: 10-digit account number (pattern: `^[0-9]{10}$`)
- `bankName`: Bank name (e.g., "GTBank", "Zenith Bank", "Access Bank")
- For individuals: `fullName`, `birthDate`, `nationality`
- For businesses: `legalName`

**IMPORTANT**: Use `bankName` (NOT `bankCode`). Use the bank's display name.

### Canada (CAD_ACCOUNT)

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "CAD",
    "accountInfo": {
      "accountType": "CAD_ACCOUNT",
      "paymentRails": ["BANK_TRANSFER"],
      "bankCode": "001",
      "branchCode": "00012",
      "accountNumber": "1234567",
      "beneficiary": {
        "beneficiaryType": "INDIVIDUAL",
        "fullName": "Full Name",
        "birthDate": "1990-01-15",
        "nationality": "CA"
      }
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

Required fields:

- `paymentRails`: `BANK_TRANSFER`
- `bankCode`: 3-digit financial institution number (pattern: `^[0-9]{3}$`)
- `branchCode`: 5-digit transit number (pattern: `^[0-9]{5}$`)
- `accountNumber`: 7-12 digit account number (pattern: `^[0-9]{7,12}$`)

### Philippines (PHP_ACCOUNT)

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "PHP",
    "accountInfo": {
      "accountType": "PHP_ACCOUNT",
      "paymentRails": ["BANK_TRANSFER"],
      "bankName": "BDO Unibank",
      "accountNumber": "1234567890",
      "beneficiary": {
        "beneficiaryType": "INDIVIDUAL",
        "fullName": "Full Name",
        "birthDate": "1990-01-15",
        "nationality": "PH"
      }
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

Required fields:

- `paymentRails`: `BANK_TRANSFER`
- `bankName`: Name of the bank
- `accountNumber`: Bank account number

### Singapore (SGD_ACCOUNT)

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "SGD",
    "accountInfo": {
      "accountType": "SGD_ACCOUNT",
      "paymentRails": ["FAST"],
      "bankName": "DBS Bank",
      "swiftCode": "DBSSSGSG",
      "accountNumber": "1234567890",
      "beneficiary": {
        "beneficiaryType": "INDIVIDUAL",
        "fullName": "Full Name",
        "birthDate": "1990-01-15",
        "nationality": "SG"
      }
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

Required fields:

- `paymentRails`: `PAYNOW`, `FAST`, or `BANK_TRANSFER`
- `bankName`: Name of the bank
- `swiftCode`: SWIFT/BIC code (8 or 11 characters)
- `accountNumber`: Bank account number

### Hong Kong (HKD_ACCOUNT)

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "HKD",
    "accountInfo": {
      "accountType": "HKD_ACCOUNT",
      "paymentRails": ["BANK_TRANSFER"],
      "bankName": "HSBC",
      "swiftCode": "HSBCHKHH",
      "accountNumber": "123456789012",
      "beneficiary": {
        "beneficiaryType": "INDIVIDUAL",
        "fullName": "Full Name",
        "birthDate": "1990-01-15",
        "nationality": "HK"
      }
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

Required fields:

- `paymentRails`: `BANK_TRANSFER`
- `bankName`: Name of the bank
- `swiftCode`: SWIFT/BIC code (8 or 11 characters)
- `accountNumber`: Bank account number

### Indonesia (IDR_ACCOUNT)

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "IDR",
    "accountInfo": {
      "accountType": "IDR_ACCOUNT",
      "paymentRails": ["BANK_TRANSFER"],
      "bankName": "Bank Central Asia",
      "swiftCode": "CENAIDJA",
      "accountNumber": "1234567890",
      "phoneNumber": "+628123456789",
      "beneficiary": {
        "beneficiaryType": "INDIVIDUAL",
        "fullName": "Full Name",
        "birthDate": "1990-01-15",
        "nationality": "ID"
      }
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

Required fields:

- `paymentRails`: `BANK_TRANSFER`
- `bankName`: Name of the bank
- `swiftCode`: SWIFT/BIC code
- `accountNumber`: Bank account number
- `phoneNumber`: Indonesian phone number (pattern: `^\+62[0-9]{9,12}$`)

### Malaysia (MYR_ACCOUNT)

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "MYR",
    "accountInfo": {
      "accountType": "MYR_ACCOUNT",
      "paymentRails": ["BANK_TRANSFER"],
      "bankName": "Maybank",
      "swiftCode": "MABORJMJXXX",
      "accountNumber": "1234567890",
      "beneficiary": {
        "beneficiaryType": "INDIVIDUAL",
        "fullName": "Full Name",
        "birthDate": "1990-01-15",
        "nationality": "MY"
      }
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

Required fields:

- `paymentRails`: `BANK_TRANSFER`
- `bankName`, `swiftCode`, `accountNumber`

### Thailand (THB_ACCOUNT)

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "THB",
    "accountInfo": {
      "accountType": "THB_ACCOUNT",
      "paymentRails": ["BANK_TRANSFER"],
      "bankName": "Bangkok Bank",
      "swiftCode": "BKKBTHBK",
      "accountNumber": "1234567890",
      "beneficiary": {
        "beneficiaryType": "INDIVIDUAL",
        "fullName": "Full Name",
        "birthDate": "1990-01-15",
        "nationality": "TH"
      }
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

Required fields:

- `paymentRails`: `BANK_TRANSFER`
- `bankName`, `swiftCode`, `accountNumber`

### Vietnam (VND_ACCOUNT)

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "VND",
    "accountInfo": {
      "accountType": "VND_ACCOUNT",
      "paymentRails": ["BANK_TRANSFER"],
      "bankName": "Vietcombank",
      "swiftCode": "BFTVVNVX",
      "accountNumber": "1234567890",
      "beneficiary": {
        "beneficiaryType": "INDIVIDUAL",
        "fullName": "Full Name",
        "birthDate": "1990-01-15",
        "nationality": "VN"
      }
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

Required fields:

- `paymentRails`: `BANK_TRANSFER`
- `bankName`, `swiftCode`, `accountNumber`

### South Africa (ZAR_ACCOUNT)

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "ZAR",
    "accountInfo": {
      "accountType": "ZAR_ACCOUNT",
      "paymentRails": ["BANK_TRANSFER"],
      "bankName": "Standard Bank",
      "accountNumber": "1234567890",
      "beneficiary": {
        "beneficiaryType": "INDIVIDUAL",
        "fullName": "Full Name",
        "birthDate": "1990-01-15",
        "nationality": "ZA"
      }
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

Required fields:

- `paymentRails`: `BANK_TRANSFER`
- `bankName`: Name of the bank
- `accountNumber`: 9-13 digit account number (pattern: `^[0-9]{9,13}$`)

### Mobile Money Accounts (Africa)

Several African countries use mobile money. They all share a similar structure with `phoneNumber` and `provider`.

#### Kenya (KES_ACCOUNT)

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "KES",
    "accountInfo": {
      "accountType": "KES_ACCOUNT",
      "paymentRails": ["MOBILE_MONEY"],
      "phoneNumber": "+254712345678",
      "provider": "M-Pesa",
      "beneficiary": {
        "beneficiaryType": "INDIVIDUAL",
        "fullName": "Full Name",
        "birthDate": "1990-01-15",
        "nationality": "KE"
      }
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

#### Rwanda (RWF_ACCOUNT)

Phone pattern: `^\+250[0-9]{9}$`

#### Tanzania (TZS_ACCOUNT)

Phone pattern: `^\+255[0-9]{9}$`

#### Uganda (UGX_ACCOUNT)

Phone pattern: `^\+256[0-9]{9}$`

#### Malawi (MWK_ACCOUNT)

Phone pattern: `^\+265[0-9]{9}$`

#### Zambia (ZMW_ACCOUNT)

Phone pattern: `^\+260[0-9]{9}$`

#### West Africa CFA (XOF_ACCOUNT)

Supports Senegal (+221), Ivory Coast (+225), and Benin (+229):

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "XOF",
    "accountInfo": {
      "accountType": "XOF_ACCOUNT",
      "paymentRails": ["MOBILE_MONEY"],
      "countries": ["SN"],
      "phoneNumber": "+221771234567",
      "provider": "Orange Money",
      "beneficiary": {
        "beneficiaryType": "INDIVIDUAL",
        "fullName": "Full Name",
        "birthDate": "1990-01-15",
        "nationality": "SN"
      }
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

Mobile money required fields:

- `paymentRails`: `MOBILE_MONEY`
- `phoneNumber`: Country-specific format (see patterns above)
- `provider`: Mobile money provider name
- `countries`: Required for XOF_ACCOUNT (enum: `SN`, `BJ`, `CI`), MWK_ACCOUNT (`MW`), UGX_ACCOUNT (`UG`)

### Crypto Wallets

#### Spark Wallet (Bitcoin)

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "BTC",
    "accountInfo": {
      "accountType": "SPARK_WALLET",
      "address": "spark1..."
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

#### Lightning (Bitcoin)

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "BTC",
    "accountInfo": {
      "accountType": "LIGHTNING",
      "lightningAddress": "user@domain.com"
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

Lightning supports one of: `invoice` (bolt11), `bolt12` (bolt12 offer), or `lightningAddress` (user@domain format).

#### Solana Wallet (USDC)

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "USDC",
    "accountInfo": {
      "accountType": "SOLANA_WALLET",
      "address": "..."
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

#### Other Crypto Wallets

- **TRON_WALLET**: USDT, requires `address`
- **POLYGON_WALLET**: USDC, requires `address` (0x format)
- **BASE_WALLET**: USDC, requires `address` (0x format)

**Note:** Crypto wallets do NOT require beneficiary information.

## Beneficiary Information

**CRITICAL**: All fiat external accounts require beneficiary information. The required fields depend on the beneficiary type.

### For Individuals (beneficiaryType: "INDIVIDUAL")

**`fullName` is REQUIRED in the `beneficiary` object. Other fields are optional but recommended:**

- `fullName`: Full legal name (REQUIRED)
- `birthDate`: Date of birth (YYYY-MM-DD format)
- `nationality`: 2-letter ISO country code (e.g., NG, MX, IN, US)
- `address`: Object with `line1`, `city`, `state`, `postalCode`, `country`

### For Businesses (beneficiaryType: "BUSINESS")

- `legalName`: Registered business/legal name (REQUIRED)
- `address`: Business address (optional)

## Sandbox Testing

For sandbox account number patterns, see `references/endpoints.md` under "Sandbox Testing".
