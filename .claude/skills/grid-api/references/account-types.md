# External Account Types by Country/Region

This reference maps countries/regions to their required account types and fields for sending payments via the Grid API.

## Account Type Summary

| Country/Region | Account Type | Currency | Primary Identifier |
|----------------|--------------|----------|-------------------|
| Mexico | CLABE | MXN | 18-digit CLABE number |
| Brazil | PIX | BRL | PIX key (CPF/CNPJ/email/phone/random) |
| Europe (SEPA) | IBAN | EUR | IBAN number |
| United States | US_ACCOUNT | USD | Account + Routing number |
| India | UPI | INR | UPI ID (user@bank) |
| Nigeria | NGN_ACCOUNT | NGN | Account number + Bank code |
| Canada | CAD_ACCOUNT | CAD | Bank code + Branch code + Account number |
| United Kingdom | GBP_ACCOUNT | GBP | Sort code + Account number |
| Philippines | PHP_ACCOUNT | PHP | Bank name + Account number |
| Singapore | SGD_ACCOUNT | SGD | SWIFT code + Account number |

## Crypto/Wallet Types

| Type | Currency | Primary Identifier |
|------|----------|-------------------|
| SPARK_WALLET | BTC | Spark wallet address |
| LIGHTNING | BTC | Lightning invoice or address |
| SOLANA_WALLET | USDC | Solana wallet address |
| TRON_WALLET | USDT | Tron wallet address |
| POLYGON_WALLET | USDC | Polygon wallet address |
| BASE_WALLET | USDC | Base wallet address |

## Detailed Field Requirements

### Mexico (CLABE)

**Individual beneficiary:**

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "MXN",
    "accountInfo": {
      "accountType": "CLABE",
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
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "MXN",
    "accountInfo": {
      "accountType": "CLABE",
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
- For individuals: `fullName`, `birthDate`, `nationality` (ALL THREE REQUIRED)
- For businesses: `legalName`

### Brazil (PIX)

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "BRL",
    "accountInfo": {
      "accountType": "PIX",
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

### Europe (IBAN)

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "EUR",
    "accountInfo": {
      "accountType": "IBAN",
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

- `iban`: International Bank Account Number (15-34 characters)
- `swiftBic`: SWIFT/BIC code (8 or 11 characters, pattern: `^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$`)

IBAN format: Country code (2) + Check digits (2) + BBAN (up to 30)

### United States (US_ACCOUNT)

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "USD",
    "accountInfo": {
      "accountType": "US_ACCOUNT",
      "routingNumber": "123456789",
      "accountNumber": "12345678901",
      "accountCategory": "CHECKING",
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
- `accountCategory`: CHECKING or SAVINGS

### India (UPI)

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "INR",
    "accountInfo": {
      "accountType": "UPI",
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

UPI ID format: `username@bankhandle` (e.g., `john@okaxis`, `jane@ybl`)

### Nigeria (NGN_ACCOUNT)

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "NGN",
    "accountInfo": {
      "accountType": "NGN_ACCOUNT",
      "accountNumber": "1234567890",
      "bankName": "GTBank",
      "purposeOfPayment": "GOODS_OR_SERVICES",
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

- `accountNumber`: 10-digit account number
- `bankName`: Bank name (e.g., "GTBank", "Zenith Bank", "Access Bank")
- `purposeOfPayment`: Purpose code (e.g., `GOODS_OR_SERVICES`)
- For individuals: `fullName`, `birthDate`, `nationality`
- For businesses: `legalName`

**IMPORTANT**: Use `bankName` (NOT `bankCode`). Use the bank's display name.

Common Nigerian banks:

- GTBank
- Zenith Bank
- United Bank for Africa
- Access Bank
- First Bank of Nigeria

### Canada (CAD_ACCOUNT)

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
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

- `bankCode`: 3-digit financial institution number
- `branchCode`: 5-digit transit number
- `accountNumber`: 7-12 digit account number

### United Kingdom (GBP_ACCOUNT)

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "customerId": "<customerId>",
    "currency": "GBP",
    "accountInfo": {
      "accountType": "GBP_ACCOUNT",
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

- `sortCode`: 6-digit sort code (may include hyphens, e.g., `12-34-56`)
- `accountNumber`: 8-digit account number

### Philippines (PHP_ACCOUNT)

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
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
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
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

- `bankName`: Name of the bank
- `swiftCode`: SWIFT/BIC code (8 or 11 characters)
- `accountNumber`: Bank account number

### Crypto Wallets

#### Spark Wallet (Bitcoin)

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
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

#### Solana Wallet (USDC)

```bash
curl -s -u "$GRID_API_TOKEN_ID:$GRID_API_CLIENT_SECRET" \
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

## Beneficiary Information

**CRITICAL**: All external accounts require beneficiary information. The required fields depend on the beneficiary type.

### For Individuals (beneficiaryType: "INDIVIDUAL")

**All three fields are REQUIRED in the `beneficiary` object:**

- `fullName`: Full legal name
- `birthDate`: Date of birth (YYYY-MM-DD format)
- `nationality`: 2-letter ISO country code (e.g., NG, MX, IN, US)
- `address`: Optional but recommended (object with `line1`, `city`, `state`, `postalCode`, `country`)

### For Businesses (beneficiaryType: "BUSINESS")

- `legalName`: Registered business/legal name (REQUIRED)
- `address`: Business address (optional)

## Sandbox Testing

For sandbox account number patterns, see `references/endpoints.md` under "Sandbox Testing".
