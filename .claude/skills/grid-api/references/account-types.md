# External Account Types by Country/Region

This reference maps countries/regions to their required account types and fields for sending payments via the Grid API.

**Note:** The CLI validates date formats (YYYY-MM-DD) and currency codes before making API calls. Invalid input will return a clear error message without hitting the API.

## Account Type Summary

| Country/Region | Account Type | Currency | Primary Identifier |
|----------------|--------------|----------|-------------------|
| Mexico | CLABE | MXN | 18-digit CLABE number |
| Brazil | PIX | BRL | PIX key (CPF/CNPJ/email/phone/random) |
| Europe (SEPA) | IBAN | EUR | IBAN number |
| United States | US_ACCOUNT | USD | Account + Routing number |
| India | UPI | INR | UPI ID (user@bank) |
| Nigeria | NGN_ACCOUNT | NGN | Account number + Bank code |

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
node cli/dist/index.js accounts external create \
  --customer-id <id> \
  --currency MXN \
  --account-type CLABE \
  --clabe <18-digit-clabe> \
  --beneficiary-type INDIVIDUAL \
  --beneficiary-name "Full Name" \
  --beneficiary-birth-date "1990-01-15" \
  --beneficiary-nationality MX
```

**Business beneficiary:**
```bash
node cli/dist/index.js accounts external create \
  --customer-id <id> \
  --currency MXN \
  --account-type CLABE \
  --clabe <18-digit-clabe> \
  --beneficiary-type BUSINESS \
  --beneficiary-name "Company Legal Name"
```

Required fields:
- `clabeNumber`: 18-digit CLABE number (validates with check digit)
- For individuals: `fullName`, `birthDate`, `nationality` (ALL THREE REQUIRED)
- For businesses: `legalName`

### Brazil (PIX)

```bash
node cli/dist/index.js accounts external create \
  --customer-id <id> \
  --currency BRL \
  --account-type PIX \
  --pix-key "cpf:12345678901" \
  --beneficiary-type INDIVIDUAL \
  --beneficiary-name "Full Name"
```

PIX key formats:
- CPF: 11 digits (e.g., `12345678901`)
- CNPJ: 14 digits (e.g., `12345678901234`)
- Email: valid email address
- Phone: +55 followed by number
- Random: 32-character alphanumeric EVP key

### Europe (IBAN)

```bash
node cli/dist/index.js accounts external create \
  --customer-id <id> \
  --currency EUR \
  --account-type IBAN \
  --iban "DE89370400440532013000" \
  --beneficiary-type INDIVIDUAL \
  --beneficiary-name "Full Name" \
  --beneficiary-address-line1 "123 Street" \
  --beneficiary-address-city "Berlin" \
  --beneficiary-address-country DE
```

IBAN format: Country code (2) + Check digits (2) + BBAN (up to 30)

### United States (US_ACCOUNT)

```bash
node cli/dist/index.js accounts external create \
  --customer-id <id> \
  --currency USD \
  --account-type US_ACCOUNT \
  --routing-number "123456789" \
  --account-number "12345678901" \
  --account-category CHECKING \
  --beneficiary-type INDIVIDUAL \
  --beneficiary-name "Full Name" \
  --beneficiary-address-line1 "123 Main St" \
  --beneficiary-address-city "San Francisco" \
  --beneficiary-address-state CA \
  --beneficiary-address-postal "94105" \
  --beneficiary-address-country US
```

Required fields:
- `routingNumber`: 9-digit ABA routing number
- `accountNumber`: Bank account number
- `accountCategory`: CHECKING or SAVINGS

### India (UPI)

```bash
node cli/dist/index.js accounts external create \
  --customer-id <id> \
  --currency INR \
  --account-type UPI \
  --upi-id "user@okbank" \
  --beneficiary-type INDIVIDUAL \
  --beneficiary-name "Full Name"
```

UPI ID format: `username@bankhandle` (e.g., `john@okaxis`, `jane@ybl`)

### Nigeria (NGN_ACCOUNT)

```bash
node cli/dist/index.js accounts external create \
  --customer-id <id> \
  --currency NGN \
  --account-type NGN_ACCOUNT \
  --account-number "1234567890" \
  --bank-name "GTBank" \
  --purpose GOODS_OR_SERVICES \
  --beneficiary-type INDIVIDUAL \
  --beneficiary-name "Full Name" \
  --beneficiary-birth-date "1990-05-15" \
  --beneficiary-nationality NG
```

Required fields:
- `accountNumber`: 10-digit account number
- `bankName`: Bank name (e.g., "GTBank", "Zenith Bank", "Access Bank")
- `purposeOfPayment`: Purpose code (e.g., `GOODS_OR_SERVICES`)
- For individuals: `fullName`, `birthDate`, `nationality`
- For businesses: `legalName`

**IMPORTANT**: Use `--bank-name` (NOT `--bank-code`). Use the bank's display name.

Common Nigerian banks:
- GTBank
- Zenith Bank
- United Bank for Africa
- Access Bank
- First Bank of Nigeria

### Crypto Wallets

#### Spark Wallet (Bitcoin)
```bash
node cli/dist/index.js accounts external create \
  --customer-id <id> \
  --currency BTC \
  --account-type SPARK_WALLET \
  --address "spark1..."
```

#### Solana Wallet (USDC)
```bash
node cli/dist/index.js accounts external create \
  --customer-id <id> \
  --currency USDC \
  --account-type SOLANA_WALLET \
  --address "..."
```

## Beneficiary Information

**CRITICAL**: All external accounts require beneficiary information. The required fields depend on the beneficiary type.

### For Individuals (--beneficiary-type INDIVIDUAL)
**All three fields are REQUIRED:**
- `--beneficiary-name`: Full legal name
- `--beneficiary-birth-date`: Date of birth (YYYY-MM-DD format)
- `--beneficiary-nationality`: 2-letter ISO country code (e.g., NG, MX, IN, US)
- `--beneficiary-address-*`: Optional but recommended

### For Businesses (--beneficiary-type BUSINESS)
- `--beneficiary-name`: Registered business/legal name (REQUIRED)
- `--beneficiary-address-*`: Business address (optional)

## Sandbox Testing

In sandbox mode, use these account number patterns to test scenarios:
- Numbers ending in **002**: Insufficient funds
- Numbers ending in **003**: Account closed/invalid
- Numbers ending in **004**: Transfer rejected
- Numbers ending in **005**: Timeout/delayed failure
- Any other number: Success
