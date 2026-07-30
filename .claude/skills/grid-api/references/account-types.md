# External Account Types by Country/Region

This reference maps countries/regions to their required account types and fields for sending payments via the Grid API.

## Account Type Summary

The **Available Rails** column lists the payment rails Grid may use for the created account. The rail is chosen by Grid and returned on the created account (the response `paymentRails` field) — it is not a request input.

| Country/Region | Account Type | Currency | Available Rails | Primary Identifier |
|----------------|--------------|----------|-----------------|-------------------|
| Bangladesh | BDT_ACCOUNT | BDT | BANK_TRANSFER, MOBILE_MONEY | Bank name + Account number |
| Botswana | BWP_ACCOUNT | BWP | MOBILE_MONEY | Phone number + Provider |
| Brazil | BRL_ACCOUNT | BRL | PIX | PIX key |
| Canada | CAD_ACCOUNT | CAD | BANK_TRANSFER | Bank code + Branch code + Account number |
| Central Africa (CFA) | XAF_ACCOUNT | XAF | MOBILE_MONEY | Phone number + Provider + Region |
| China | CNY_ACCOUNT | CNY | BANK_TRANSFER, MOBILE_MONEY | Bank name + Account number |
| Colombia | COP_ACCOUNT | COP | BANK_TRANSFER, MOBILE_MONEY | Bank name + Account number + Account type |
| Denmark | DKK_ACCOUNT | DKK | SEPA, SEPA_INSTANT | IBAN |
| Egypt | EGP_ACCOUNT | EGP | BANK_TRANSFER, MOBILE_MONEY | Bank name + IBAN |
| El Salvador | SLV_ACCOUNT | SLV | BANK_TRANSFER, MOBILE_MONEY | Account number or Phone number |
| Europe (SEPA) | EUR_ACCOUNT | EUR | SEPA, SEPA_INSTANT | IBAN |
| Ghana | GHS_ACCOUNT | GHS | BANK_TRANSFER, MOBILE_MONEY | Bank name + Account number |
| Guatemala | GTQ_ACCOUNT | GTQ | BANK_TRANSFER | Bank name + Account number + Account type |
| Haiti | HTG_ACCOUNT | HTG | MOBILE_MONEY | Phone number |
| Hong Kong | HKD_ACCOUNT | HKD | BANK_TRANSFER | Bank name + SWIFT + Account number |
| India | INR_ACCOUNT | INR | UPI, NEFT, RTGS | UPI VPA, or Account number + IFSC |
| Indonesia | IDR_ACCOUNT | IDR | BANK_TRANSFER | Bank name + SWIFT + Account number + Phone |
| International (SWIFT) | SWIFT_ACCOUNT | Multiple | SWIFT | SWIFT code + Bank name + Account number/IBAN |
| Jamaica | JMD_ACCOUNT | JMD | BANK_TRANSFER | Bank name + Account number + Branch code |
| Kenya | KES_ACCOUNT | KES | MOBILE_MONEY | Phone number + Provider |
| Malawi | MWK_ACCOUNT | MWK | MOBILE_MONEY | Phone number + Provider |
| Malaysia | MYR_ACCOUNT | MYR | BANK_TRANSFER | Bank name + SWIFT + Account number |
| Mexico | MXN_ACCOUNT | MXN | SPEI | 18-digit CLABE number |
| Nigeria | NGN_ACCOUNT | NGN | BANK_TRANSFER | Bank name + Account number |
| Pakistan | PKR_ACCOUNT | PKR | BANK_TRANSFER, MOBILE_MONEY | Bank name + Account number/IBAN |
| Philippines | PHP_ACCOUNT | PHP | BANK_TRANSFER | Bank name + Account number |
| Rwanda | RWF_ACCOUNT | RWF | MOBILE_MONEY | Phone number + Provider |
| Singapore | SGD_ACCOUNT | SGD | PAYNOW, FAST, BANK_TRANSFER | SWIFT + Account number |
| South Africa | ZAR_ACCOUNT | ZAR | BANK_TRANSFER | Bank name + Account number |
| Tanzania | TZS_ACCOUNT | TZS | MOBILE_MONEY | Phone number + Provider |
| Thailand | THB_ACCOUNT | THB | BANK_TRANSFER | Bank name + SWIFT + Account number |
| UAE | AED_ACCOUNT | AED | BANK_TRANSFER | IBAN |
| Uganda | UGX_ACCOUNT | UGX | MOBILE_MONEY | Phone number + Provider |
| United Kingdom | GBP_ACCOUNT | GBP | FASTER_PAYMENTS | Sort code + Account number |
| United States | USD_ACCOUNT | USD | ACH, WIRE, RTP, FEDNOW | Routing number + Account number |
| Vietnam | VND_ACCOUNT | VND | BANK_TRANSFER | Bank name + SWIFT + Account number |
| West Africa (CFA) | XOF_ACCOUNT | XOF | MOBILE_MONEY | Phone number + Provider + Region |
| Zambia | ZMW_ACCOUNT | ZMW | MOBILE_MONEY | Phone number + Provider |

## Crypto/Wallet Types

| Type | Currency | Primary Identifier |
|------|----------|-------------------|
| SPARK_WALLET | BTC | Spark wallet address |
| LIGHTNING | BTC | Lightning invoice, bolt12 offer, or lightning address |
| ETHEREUM_WALLET | USDC | Ethereum L1 wallet address (0x...) |
| SOLANA_WALLET | USDC | Solana wallet address |
| TRON_WALLET | USDT | TRON wallet address |
| POLYGON_WALLET | USDC | Polygon wallet address (0x...) |
| BASE_WALLET | USDC | Base wallet address (0x...) |

## Detailed Field Requirements

**Note on payment rails:** You do not supply a payment rail when creating a fiat account. Grid selects the appropriate rail (or set of rails) for the account and returns it on the created account's `paymentRails` field in the response. The **Available Rails** column above is informational.

**Optional top-level create fields** (alongside `customerId`, `currency`, and `accountInfo` on the create request):

- `platformAccountId`: Your platform's own identifier for the account in your system (e.g. `ext_acc_123456`). Echoed back so you can reference the account by your identifier.
- `defaultUmaDepositAccount`: Boolean, defaults to `false`. When `true`, incoming payments to this customer's UMA address are automatically deposited into this account. Only one account per customer can be the default; setting a new one overrides any existing default.

### Botswana (BWP_ACCOUNT)

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "BWP",
    "accountInfo": {
      "accountType": "BWP_ACCOUNT",
      "phoneNumber": "+2671234567",
      "provider": "Orange Money",
      "beneficiary": {
        "beneficiaryType": "INDIVIDUAL",
        "fullName": "Full Name",
        "birthDate": "1990-01-15",
        "nationality": "BW"
      }
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

Required fields:

- `phoneNumber`: International format (pattern: `^\+[0-9]{6,14}$`)
- `provider`: Mobile money provider name

### Central Africa CFA (XAF_ACCOUNT)

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "XAF",
    "accountInfo": {
      "accountType": "XAF_ACCOUNT",
      "phoneNumber": "+237612345678",
      "provider": "MTN Mobile Money",
      "region": "CM",
      "beneficiary": {
        "beneficiaryType": "INDIVIDUAL",
        "fullName": "Full Name",
        "birthDate": "1990-01-15",
        "nationality": "CM"
      }
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

Required fields:

- `phoneNumber`: International format (pattern: `^\+[0-9]{6,14}$`)
- `provider`: Mobile money provider name
- `region`: Country code in Central African CFA franc zone (enum: `CM` for Cameroon, `CG` for Congo)

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
      "iban": "DE89370400440532013000",
      "swiftCode": "COBADEFFXXX",
      "beneficiary": {
        "beneficiaryType": "INDIVIDUAL",
        "fullName": "Full Name",
        "birthDate": "1990-01-15",
        "nationality": "DE",
        "countryOfResidence": "DE",
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

- `iban`: International Bank Account Number (15-34 characters)
- `swiftCode`: SWIFT/BIC code (8 or 11 characters, pattern: `^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$`) — optional
- Beneficiary: `countryOfResidence` is required (in addition to `fullName`)

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

- `iban`: IBAN number
- `swiftCode`: optional

### United States (USD_ACCOUNT)

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "USD",
    "accountInfo": {
      "accountType": "USD_ACCOUNT",
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

- `routingNumber`: 9-digit ABA routing number
- `accountNumber`: Bank account number

### India (INR_ACCOUNT)

INR supports two payout paths: UPI, or a NEFT/RTGS bank transfer.

**UPI:**

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "INR",
    "accountInfo": {
      "accountType": "INR_ACCOUNT",
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

**NEFT/RTGS bank transfer:**

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "INR",
    "accountInfo": {
      "accountType": "INR_ACCOUNT",
      "accountNumber": "000111222333",
      "ifsc": "HDFC0001234",
      "rail": "NEFT",
      "bankName": "HDFC Bank",
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

Bank-transfer fields:

- `accountNumber`: Indian bank account number, 9–18 digits (pattern: `^[0-9]{9,18}$`)
- `ifsc`: IFSC of the beneficiary's bank branch (pattern: `^[A-Z]{4}0[A-Z0-9]{6}$`)
- `rail`: `NEFT` or `RTGS`
- `bankName`: Name of the bank (optional)

### UAE (AED_ACCOUNT)

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "AED",
    "accountInfo": {
      "accountType": "AED_ACCOUNT",
      "iban": "AE070331234567890123456",
      "swiftCode": "EBILAEAD",
      "beneficiary": {
        "beneficiaryType": "INDIVIDUAL",
        "fullName": "Full Name",
        "birthDate": "1990-01-15",
        "nationality": "AE",
        "address": {
          "line1": "123 Street",
          "city": "Dubai",
          "postalCode": "00000",
          "country": "AE"
        }
      }
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

Required fields:

- `iban`: UAE IBAN (23 characters, pattern: `^AE[0-9]{21}$`)
- `swiftCode`: SWIFT/BIC code (8 or 11 characters) — optional
- Beneficiary: `address` is required (in addition to `fullName`)

### United Kingdom (GBP_ACCOUNT)

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "GBP",
    "accountInfo": {
      "accountType": "GBP_ACCOUNT",
      "sortCode": "123456",
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

- `sortCode`: 6-digit sort code, no separators (pattern: `^[0-9]{6}$`, e.g. `123456`)
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

- `swiftCode`: SWIFT/BIC code (8 or 11 characters)
- `accountNumber`: Bank account number

Optional fields:

- `bankName`: Name of the bank. When omitted, it is resolved from `swiftCode` via the payout partner bank directory at account creation.

### Hong Kong (HKD_ACCOUNT)

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "HKD",
    "accountInfo": {
      "accountType": "HKD_ACCOUNT",
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

Phone pattern: `^\+[0-9]{6,14}$`

#### Malawi (MWK_ACCOUNT)

Phone pattern: `^\+[0-9]{6,14}$`

#### Zambia (ZMW_ACCOUNT)

Phone pattern: `^\+260[0-9]{9}$`

#### West Africa CFA (XOF_ACCOUNT)

Supports Benin (+229), Ivory Coast (+225), Senegal (+221), and Togo:

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "XOF",
    "accountInfo": {
      "accountType": "XOF_ACCOUNT",
      "region": "SN",
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

- `phoneNumber`: Country-specific format (see patterns above)
- `provider`: Mobile money provider name
- `region`: Required for XOF_ACCOUNT (single country code, enum: `BJ`, `CI`, `SN`, `TG`). XAF_ACCOUNT also requires `region` (enum: `CM`, `CG`). Other mobile-money account types (e.g. MWK_ACCOUNT, UGX_ACCOUNT) require only `phoneNumber` + `provider`.

### Additional Fiat Account Types

Each type below shares the common request envelope (`customerId`, `currency`, `accountInfo`) and beneficiary structure. Only the type-specific `accountInfo` fields are listed.

#### Bangladesh (BDT_ACCOUNT)

- `bankName`: Name of the bank (required)
- Bank transfer: `accountNumber`; optional `branchCode` (5 digits, pattern `^[0-9]{5}$`) and `swiftCode`
- Mobile money: `phoneNumber` (pattern: `^\+[0-9]{6,14}$`)

#### China (CNY_ACCOUNT)

- `bankName`: Name of the bank (required)
- Bank transfer: `accountNumber`
- Mobile money: `phoneNumber` (pattern: `^\+[0-9]{6,14}$`)

#### Colombia (COP_ACCOUNT)

- `bankName`: Name of the bank (required)
- Bank transfer: `accountNumber` + `bankAccountType` (`CHECKING` or `SAVINGS`)
- Mobile money: `phoneNumber` (pattern: `^\+[0-9]{6,14}$`)
- Beneficiary may include Colombia-specific `documentType` (`CC`, `CE`, `TI`, `NIT`, `PP`) and `documentNumber` (both optional)

#### Egypt (EGP_ACCOUNT)

- `bankName`: Name of the bank (required)
- Bank transfer: `iban` (Egyptian IBAN, 29 characters, pattern `^EG[0-9]{27}$`)
- Mobile money: `phoneNumber` (pattern: `^\+[0-9]{6,14}$`)

#### El Salvador (SLV_ACCOUNT)

- Bank transfer: `accountNumber` + `bankAccountType` (`CHECKING` or `SAVINGS`); optional `bankName`
- Mobile money: `phoneNumber` (pattern: `^\+[0-9]{6,14}$`, e.g. Tigo Money)

#### Ghana (GHS_ACCOUNT)

- `bankName`: Name of the bank (required)
- Bank transfer: `accountNumber`
- Mobile money: `phoneNumber` (pattern: `^\+[0-9]{6,14}$`)

#### Guatemala (GTQ_ACCOUNT)

- `accountNumber`, `bankAccountType` (`CHECKING` or `SAVINGS`), and `bankName` (all required)
- Beneficiary requires `countryOfResidence` and `phoneNumber` (in addition to `fullName`)

#### Haiti (HTG_ACCOUNT)

- `phoneNumber`: International format (pattern: `^\+[0-9]{6,14}$`) (required)

#### Jamaica (JMD_ACCOUNT)

- `accountNumber`, `branchCode` (5 digits, pattern `^[0-9]{5}$`), `bankAccountType` (`CHECKING` or `SAVINGS`), and `bankName` (all required)
- Beneficiary requires `address` and `phoneNumber` (in addition to `fullName`)

#### Pakistan (PKR_ACCOUNT)

- `bankName`: Name of the bank (required)
- Bank transfer: `accountNumber`, or `iban` (Pakistani IBAN, 24 characters, pattern `^PK[0-9]{2}[A-Z]{4}[0-9]{16}$`)
- Mobile money: `phoneNumber` (pattern: `^\+[0-9]{6,14}$`)

#### International (SWIFT_ACCOUNT)

Cross-border SWIFT transfer for corridors without a dedicated account type.

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "USD",
    "accountInfo": {
      "accountType": "SWIFT_ACCOUNT",
      "country": "NG",
      "swiftCode": "DEUTDEFF",
      "bankName": "Deutsche Bank",
      "accountNumber": "1234567890",
      "beneficiary": {
        "beneficiaryType": "INDIVIDUAL",
        "fullName": "Full Name",
        "birthDate": "1990-01-15",
        "nationality": "NG"
      }
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

Required fields:

- `country`: ISO 3166-1 alpha-2 country code of the bank account (pattern: `^[A-Z]{2}$`)
- `swiftCode`: SWIFT/BIC code (8 or 11 characters)
- `bankName`: Name of the bank
- Either `accountNumber` OR `iban` — use `iban` for IBAN-only corridors (e.g. GB, BR), `accountNumber` otherwise

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

#### Ethereum Wallet (USDC)

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "USDC",
    "accountInfo": {
      "accountType": "ETHEREUM_WALLET",
      "address": "0xAbCDEF1234567890aBCdEf1234567890ABcDef12"
    }
  }' \
  "$GRID_BASE_URL/customers/external-accounts" | jq .
```

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
- **ETHEREUM_WALLET**: USDC, requires `address` (0x format)

**Note:** Crypto wallets do NOT require beneficiary information.

## Beneficiary Information

**CRITICAL**: All fiat external accounts require beneficiary information. The required fields depend on the beneficiary type.

### For Individuals (beneficiaryType: "INDIVIDUAL")

**`fullName` is REQUIRED in the `beneficiary` object. Other fields are optional but recommended:**

- `fullName`: Full legal name (REQUIRED)
- `birthDate`: Date of birth (YYYY-MM-DD format)
- `nationality`: 2-letter ISO country code (e.g., NG, MX, IN, US)
- `email`: Email address of the beneficiary
- `phoneNumber`: Phone number of the beneficiary
- `countryOfResidence`: 2-letter ISO country code of residence
- `address`: Object with `line1`, `city`, `state`, `postalCode`, `country`

Some corridors promote these optional fields to required — for example EUR and GTQ require `countryOfResidence`, AED and JMD require `address`, and GTQ and JMD require `phoneNumber`. See each account type above.

### For Businesses (beneficiaryType: "BUSINESS")

- `legalName`: Registered business/legal name (REQUIRED)
- `registrationNumber`: Business registration number (optional)
- `taxId`: Business tax identification number (optional)
- `email`: Email address of the beneficiary (optional)
- `phoneNumber`: Phone number of the beneficiary (optional)
- `countryOfResidence`: 2-letter ISO country code of residence (optional)
- `address`: Business address (optional)

## Sandbox Testing

For sandbox account number patterns, see `references/endpoints.md` under "Sandbox Testing".
