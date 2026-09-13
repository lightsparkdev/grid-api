# Move API-input field validations into the OpenAPI spec

## Context

The API's storage layer enforces field-level validations (string length caps, numeric ranges, list cardinality) on many fields that arrive from the public API, but the OpenAPI spec doesn't express most of them. When a caller exceeds one, the failure surfaces deep in request processing as an unhelpful generic error instead of a field-specific 400. Expressing the constraints in the spec lets request validation (pydantic models generated from this spec, plus generated SDKs) reject bad input early with the field name and the limit.

## Audit (how this list was built)

1. Inventoried every caller-supplied field with a backend storage validation (string lengths, numeric ranges, list validators).
2. Mapped all 92 write endpoints (76 JSON, 2 multipart, 14 path-only) to the fields their request data flows into.
3. Diffed each constraint against the bundled `openapi.yaml` (script-checked every schema defining each property, `allOf`-resolved).

### Already covered (no change)

- `EmbeddedWalletConfig` (appName/sendFrom/replyTo/logoUrl), `CardTokenization2FAConfig.displayName`/`logoUrl`, `EndUserTermsConsentRequest.ipAddress` (45), `DelegatedKeyCreateRequest.nickname` (256), `CardCreateRequest` spend-limit minimums, `StablecoinMint/BurnRequest.description`, customer `phoneNumber` (strict E.164 pattern — tighter than the storage cap)
- Idempotency-Key headers on `/cards`, `/stablecoins*` — already `maxLength: 255`

### Deliberately excluded

- `remittanceInformation` (spec 80 < storage cap), mobile-money account-info `phoneNumber` (15), `BrlAccountInfo.taxId` (14) — tighter rail-specific limits, keep
- Response schemas (`Customer`, `Document`, `Card`, …) — constraints target request validation
- `fileName` on document upload — lives in the multipart part's Content-Disposition, not expressible in the schema; stays enforced by the API backend
- `CardTokenization2FAConfig` email/twilio/sms fields and `braleProviderTokenIdentifier` — not exposed in the spec at all

## Changes

All edits under `openapi/`; then `npm run build:openapi` to regenerate the bundled `openapi.yaml` + `mintlify/openapi.yaml`.

### 1. Customers (party + business info)

- `components/schemas/customers/CustomerCreateRequest.yaml`, `CustomerUpdateRequest.yaml` — `email`: add `maxLength: 255`
- `components/schemas/customers/IndividualCustomerFields.yaml` — `fullName`: 250; `identifier`: 100
- `components/schemas/customers/BusinessInfo.yaml`, `BusinessInfoUpdate.yaml` — `legalName`: 250, `registrationNumber`: 100, `doingBusinessAs`: 250, `taxId`: 100, `sourceOfFunds`: 500, `naicsCode`: `maxLength: 6` + `pattern: '^[0-9]{2,6}$'`
- `components/schemas/customers/CustomerEdd.yaml` — `sourceOfFundsOtherDescription`: 500, `purposeOfAccountOtherDescription`: 500, `sourceOfFundsCategories`/`sourceOfWealthCategories`: `minItems: 1`
- `components/schemas/customers/BeneficialOwnerPersonalInfo.yaml`, `BeneficialOwnerPersonalInfoUpdate.yaml` — `firstName`/`lastName`/`middleName`: 250, `email`: 255, `identifier`: 100
- `components/schemas/customers/BeneficialOwnerCreateRequest.yaml`, `BeneficialOwnerUpdateRequest.yaml` — `roles`: `minItems: 1`
- `components/schemas/customers/EndUserTermsConsentRequest.yaml` — `termsVersion`: 64

### 2. Documents

- `components/schemas/documents/BaseDocumentRequest.yaml` — `documentNumber`: 100, `issuingAuthority`: 255
  (Document upload is multipart and its form fields are parsed outside the generated models, so this documents the limits and enforces them in generated SDKs; the API backend keeps its own checks.)

### 3. Quotes / transfers

- `components/schemas/quotes/QuoteRequest.yaml` — `description`: 1024
- `components/schemas/quotes/UmaAddressDestination.yaml` (and the source-side equivalent if present) — `umaAddress`: 200

### 4. Cards

- `components/schemas/cards/CardUpdateRequest.yaml` — `maxSpendPerTransaction`, `maxSpendPerDay`, `maxTransactionsPerDay`: add `minimum: 1` (create already has it)
- `components/schemas/config/CardConfig.yaml` (platform-config `cardConfigs`) — same three `minimum: 1`

### 5. Stablecoins

- `components/schemas/stablecoins/StablecoinRegisterRequest.yaml` — `networkTokenIdentifier`: 255

### 6. External accounts

- `components/schemas/external_accounts/ExternalAccountCreateRequest.yaml`, `PlatformExternalAccountCreateRequest.yaml` — `platformAccountId`: 255

### 7. Beneficiaries (~40 per-rail files, mechanical)

`components/schemas/common/*Beneficiary.yaml` — each defines these inline (no shared base):
- Individual (`AedBeneficiary`, `BdtBeneficiary`, …): `fullName`: 250, `email`: 320, `phoneNumber`: 50, plus `documentType`: 32 / `documentNumber`: 50 where present
- Business (`*BusinessBeneficiary.yaml`): `legalName`: 250, `registrationNumber`: 100, `taxId`: 100, `email`: 320, `phoneNumber`: 50
- Where a field already has a tighter limit (e.g. `CopBeneficiary.documentNumber` = 50), leave it.

### 8. Idempotency-Key headers

Add `maxLength: 255` to the header parameter where missing: `paths/` definitions for `POST /customers/{customerId}/kyc-link`, `POST /internal-accounts`, `POST /transfer-in`, `POST /transfer-out`, `POST /quotes`, `POST /quotes/{quoteId}/execute`, `POST /agents/me/quotes`, `POST /agents/me/quotes/{quoteId}/execute` (matches the backend's storage limit; other operations already declare it).

## Verification

- [ ] `npm run lint:openapi` (redocly bundle + redocly lint + spectral, fail-severity=error)
- [ ] `git diff openapi.yaml` shows only the added constraints (spot-check ~10 fields)
- [ ] Regenerate the Python models from the bundled spec in a scratch checkout: confirm `Field(max_length=...)`, `ge=1`, `min_length` on lists appear for a sample of edited fields

## Follow-ups (not this PR)

1. Regenerate the API backend's client models from the merged spec so request parsing enforces the new constraints, and remove backend checks that become redundant.
2. Optional: structured per-field error metadata (`details.errors[]` with field + constraint) on more endpoints.

## Risks

- Inputs that previously failed late with a generic error now fail fast with a field-specific 400 — the rejected input set is unchanged, only error quality changes.
- This PR alone changes no runtime behavior until the backend regenerates its models, so the two roll out independently.
- Codegen support for `minItems` → list `min_length` is unverified until Verification step 3; if unsupported, `minItems` stays spec-only documentation (harmless).
