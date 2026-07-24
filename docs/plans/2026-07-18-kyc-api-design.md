# API-based KYC flow — design proposal

## Context

Grid platforms can already onboard individual customers today via the direct-API flow: `POST /customers` (INDIVIDUAL) → `POST /documents` → `POST /verifications`. The verification response already carries a structured `errors[]` array with `MISSING_FIELD` / `INVALID_FIELD` / `MISSING_*_DOCUMENT` entries.

This document proposes the additions needed to make that flow production-ready for **interactive in-app onboarding** — a platform collects data over multiple rounds as the end-user fills in forms. Bulk migration of pre-verified customers is covered in **[Appendix A](#appendix-a--bulk-migration-deferred-future-work)** and is not on the current workstream.

The design is additive to Victor's existing KYB verification surface. KYC and KYB share the same `Verification` lifecycle; the changes here fill gaps in the individual-customer schema and add pieces the existing surface doesn't cover.

**Reference:** [Lead Bank KYC requirements spreadsheet](https://docs.google.com/spreadsheets/d/1pxyK7j8k865u_ZxUp1Ymjdigyo76JK7tAzsetUnP8oQ/edit?gid=1402608033#gid=1402608033) — canonical spec for individual retail KYC field requirements addressed here (Lightspark internal).

## Design goals

- One API supports both interactive and (future) bulk usage.
- Missing or invalid data is surfaced at two layers: **format-level** issues (regex, enum, length) surface as `400 INVALID_INPUT` at submit time with structured `details.constraint`, so the platform's onboarding form can pre-validate. **Verification-level** issues (missing required fields for this jurisdiction, Sumsub-side rejections, document quality) surface as `errors[]` on `POST /verifications`, categorized by the existing `VerificationErrorType` enum.
- Country / nationality / currency variations are handled via documented per-jurisdiction requirements plus reactive validation errors, not schema forks or a runtime discovery endpoint.
- Additive-only — no breaking changes to `Customer`, `Verification`, or `VerificationError`.
- **Sandbox is first-class.** Platforms can drive the full KYC lifecycle in sandbox (create → verify → APPROVED / REJECTED / PENDING / EDD-required) without hitting real vendors, using deterministic magic values that mirror the existing KYB and beneficial-owner-KYC sandbox patterns.

## Open questions for Phase 1

Design decisions that need input before/during Phase 1. Each has a proposed default so silence = proceed with the default; a redirect changes course.

1. **`/customers/edd` vs `/customers/endorsements` (Bridge-style)?** Jeremy raised this. Bridge.xyz uses an endorsement-per-rail model (`base` USD, `sepa` EUR, `spei` MXN, `pix` BRL, `faster_payments` GBP, `cop`), each with its own required fields and independent lifecycle. Stripe uses a single per-customer requirements bag with country-typed fields. This doc currently uses a single `/customers/edd` bag with Lead-HNWI-shaped fields — appropriate for the US-HNWI-only Phase 1, but likely needs reshaping when SEPA / SPEI / etc. land. See the [industry-pattern comparison from the 2026-07-18 librarian analysis](https://apidocs.bridge.xyz/platform/customers/customers/endorsements) and the active Slack discussion. **Proposed default: keep `/customers/edd` for Phase 1; pivot to endorsements pattern in a follow-up PR before we ship the second compliance regime.**
2. **`PurposeOfAccount` — need an individual variant?** The existing enum values are business-flow oriented (`CONTRACTOR_PAYOUTS`, `EMPLOYEE_PAYOUTS`, `MARKETPLACE_SELLER_PAYOUTS`, `AP_AUTOMATION`, `CROSS_BORDER_B2B`, etc.). Only `P2P_TRANSFERS`, `CHARITABLE_DONATIONS`, `OTHER` are cleanly individual-applicable. **Proposed default: add `IndividualPurposeOfAccount` alongside the business one, matching the pattern we just applied to `IndividualSourceOfFundsCategory`.**
3. **EDD backend storage: JSON blob on `EntUmaaasIndividualUserInfo` vs a dedicated `EntUmaaasCustomerEdd` ent?** Blob is a cheaper first cut (one column, no migration for schema evolution); dedicated ent is cleaner for indexing/query/audit. **Proposed default: dedicated ent — small upfront cost, better long-term shape, matches sparkcore convention of "sandbox-adjacent state is persisted, not ephemeral" (per `grid_embedded_wallet_session_sandbox_state` and siblings).**

## What exists today

**API surface:**
- `POST /customers`, `PATCH /customers/{id}` — polymorphic on `customerType` (`INDIVIDUAL` | `BUSINESS`).
- `POST /documents` — multipart upload, attached to a `Customer` or `BeneficialOwner`.
- `POST /verifications` — takes `{ customerId }`, returns a `Verification` with `errors[]`.
- `POST /customers/{id}/kyc-link` — hosted-flow link (unchanged by this proposal).
- `POST /beneficial-owners` for KYB.
- `POST /customers/bulk/csv` — **spec-only; backend handler in sparkcore raises `NOT_IMPLEMENTED`.**

**Backend behavior** (from investigation of the sparkcore handlers):
- `POST /documents` is **synchronous and direct-to-Sumsub**. The handler does `file.read()`, creates the `EntGridDocument` row, and forwards the multipart to Sumsub in the same request. No S3, no temp buffer, no async queue.
- Documents require a `document_holder_id` (Customer or BeneficialOwner) at creation. No orphan-doc concept in the current handler.
- There is no TTL on documents. Persistence ends only on explicit `DELETE`.
- Sumsub is the KYC/KYB provider. LexisNexis is used for OFAC screening on LSP switches; Striga / Bitso / Sandbox skip it.
- PII persists in Grid's DB long-term (`EntUmaaasIndividualUserInfo`, `EntGridBusinessInformation`, `EntUmaaasUser`) — this is not proxy-only.

**Sandbox surface** (existing, this proposal extends):
- The sandbox mode uses magic-value suffixes on customer/BO fields to drive deterministic KYC/KYB outcomes without hitting real vendors. Documented in [`mintlify/snippets/sandbox-verification.mdx`](../../mintlify/snippets/sandbox-verification.mdx).
- **Business KYB:** last 3 digits of `businessInfo.registrationNumber` → `001` PENDING / `002` REJECTED / anything else APPROVED (when `POST /verifications` runs).
- **Beneficial-owner KYC:** last 3 chars of `personalInfo.lastName` → same 001 / 002 / else mapping.
- Sandbox switches skip both Sumsub and LexisNexis; verification outcomes resolve entirely from the magic values.
- **Gap:** there's no analogous magic-value pattern for individual-customer KYC via `POST /customers` today. This proposal adds one (§4 below).

## Proposed changes

### 1. `taxIdentification` on `IndividualCustomerFields`

Today `IndividualCustomerFields` is `customerType`, `kycStatus`, `fullName`, `birthDate`, `nationality`, `address`. Add one optional field:

```yaml
taxIdentification:
  type: object
  required: [idType, identifier]
  properties:
    idType:            { $ref: ./IdentificationType.yaml }   # SSN | ITIN | EIN | NON_US_TAX_ID
    identifier:        { type: string }
    countryOfIssuance: { type: string, description: "ISO 3166-1 alpha-2" }
  description: >-
    Tax identifier. US persons: SSN or ITIN. Non-US persons: NON_US_TAX_ID with
    countryOfIssuance. Single object; multi-jurisdictional taxpayers are a rare
    edge case we can revisit if it becomes real demand.
```

Maps to Sumsub's `fixedInfo.tin` field internally. `IdentificationType` uses the existing enum (`SSN | ITIN | EIN | NON_US_TAX_ID`).

**Photo IDs are a separate category** and stay on the `Document` resource — `POST /documents` already carries `documentNumber` alongside the file upload. Grid never accepts a driver's license or passport *in place of* an SSN for a US person; they're additive (tax ID as the identifier, photo document as identity confirmation).

### 1a. Enhanced due diligence (EDD) — separate resource

Enhanced-due-diligence fields don't belong on `IndividualCustomerFields` — they're only required for a narrow customer segment (HNWI, higher-risk jurisdictions, certain product tiers), they may be persisted separately on the backend (separate ent), and mixing them into every customer response bloats the base shape.

Model them as a **separate linked resource**, following the "prefer flat, linked resources over deeply nested sub-resources" guidance in [`openapi/README.md`](../../openapi/README.md) (same pattern as `/customers/external-accounts?customerId=...`):

```yaml
POST /customers/edd
body:
  customerId: Customer:...                 # link to the parent customer
  sourceOfFundsCategories: [...]           # $ref IndividualSourceOfFundsCategory
  sourceOfFundsOtherDescription: <string>  # required when sourceOfFundsCategories includes OTHER
  sourceOfWealthCategories: [...]          # $ref SourceOfWealthCategory
  sourceOfWealthOtherDescription: <string> # required when sourceOfWealthCategories includes OTHER
  purposeOfAccount: <enum>
  purposeOfAccountOtherDescription: <string> # required when purposeOfAccount is OTHER
  expectedMonthlyTransactionCount: <enum>
  expectedMonthlyTransactionVolume: <enum>
  annualIncomeRange:   <enum>              # e.g. UNDER_50K | RANGE_50K_100K | RANGE_100K_250K | RANGE_250K_1M | OVER_1M
  netWorthRange:       <enum>              # e.g. UNDER_100K | RANGE_100K_500K | RANGE_500K_1M | RANGE_1M_5M | RANGE_5M_25M | OVER_25M
  pepStatus:           <enum>              # NONE | DOMESTIC | FOREIGN | HIO | FAMILY_OR_ASSOCIATE
response 200: <EDD payload echoed back>

GET /customers/edd?customerId=Customer:...    → 200 <same shape> | 404 if never set
PATCH /customers/edd?customerId=Customer:...  → partial update, same shape
```

Response envelope wraps just the EDD fields — nothing about the base customer changes on this resource.

**How the trigger works.** When Sumsub's per-country / per-flow config or a Grid-layer overlay decides EDD is required for a specific applicant, `POST /verifications` returns `MISSING_FIELD` errors pointing at the specific EDD fields (`field: "edd.sourceOfWealthCategories"`, etc.). The platform then calls `POST /customers/edd` with the customer link + missing fields and retries `POST /verifications`.

`expectedMonthlyTransactionVolume` mirrors the existing `BusinessInfo` field (single USD-equivalent bucket). Whether volume should split by fiat vs crypto is worth revisiting once we have real HNWI usage — trivially additive if needed.

### 2. Machine-readable validation on 400 responses

Submit endpoints (`POST /customers`, `PATCH /customers/{id}`, `POST /customers/edd`, `PATCH /customers/edd`) reject malformed field values with a **400 `INVALID_INPUT`**. When they do, the response populates `details.field` (dot-path to the offending field) and `details.constraint` (machine-readable format hint — regex, enum, min/max length) so the platform can render sensible client-side validation on its onboarding form:

```json
{
  "status": 400,
  "code": "INVALID_INPUT",
  "message": "The provided tax identifier is not a valid US SSN",
  "details": {
    "field": "taxIdentification.identifier",
    "constraint": {
      "pattern": "^\\d{3}-\\d{2}-\\d{4}$",
      "format": "us-ssn"
    }
  }
}
```

`FieldConstraint.yaml` defines the `details.constraint` shape (`format`, `pattern`, `enum`, `minLength`, `maxLength`) as a shared schema so SDKs and docs get a named type.

### 3. Document upload strategy

**The constraint (important design context).** `POST /documents` in the current backend forwards the multipart body directly to Sumsub in the same synchronous request. Sumsub requires the `applicant_id` at doc-upload time, and Sumsub does **not** support rebinding an uploaded document to a different applicant later. Consequence: **documents cannot be uploaded before the customer exists.** This shapes what "one-shot" can mean when documents are involved.

Two usage patterns for the singleton flow:

**Pattern A — no-doc customers.**  
For segments where no ID documents are required (some LSP configurations for basic domestic USD, for example), the platform calls `POST /customers` followed by `POST /verifications` — two round-trips, no docs.

**Pattern B — sequential create + upload (default with docs).**  
`POST /customers` → response gives `customer_id` → `POST /documents` (with `documentHolder: customer_id`) for each required document → `POST /verifications`. Three or more round-trips, but no new backend infrastructure. Matches how Sumsub actually works.

Bulk-oriented document patterns (bulk-create-then-loop; one-shot with buffered docs and Grid-side caching) are covered in [Appendix A](#appendix-a--bulk-migration-deferred-future-work).

Some platforms don't store their end-users' documents at all (they may only have identity data, not the scans). Those platforms will need to gather documents from the end-users directly during migration — which is Pattern B in a UI-driven flow.

### 4. Sandbox mode

Customers need to build and test their onboarding UX end-to-end before going to production, without hitting real vendors. Grid's sandbox already handles this for business KYB and beneficial-owner KYC via magic-value suffixes on customer fields; the new individual-customer KYC flow needs the same affordance so integrators can drive `PENDING` / `REJECTED` / `APPROVED` outcomes deterministically.

**Extension — individual-customer KYC magic values.** For `POST /customers` with `customerType: INDIVIDUAL`, the last 3 characters of `fullName` determine the KYC-verification outcome when `POST /verifications` runs. This mirrors the existing beneficial-owner KYC pattern, plus a new `003` suffix for driving the EDD flow.

| Suffix on `fullName` | Outcome on `POST /verifications` | Behavior |
|---|---|---|
| `001` | `verificationStatus: IN_PROGRESS`, `kycStatus: PENDING` | Verification submitted, held in review |
| `002` | `verificationStatus: REJECTED`, `kycStatus: REJECTED` | Verification rejected |
| `003` | `verificationStatus: RESOLVE_ERRORS` with `MISSING_FIELD` errors on `edd.*` fields | EDD required — platform calls `POST /customers/edd` (with `customerId` link + missing fields), then retries verification (with a non-`003`-suffix `fullName` on the next customer's payload, or a `fullName` PATCH, to drive APPROVED / PENDING on retry) |
| anything else | `verificationStatus: IN_PROGRESS`, `kycStatus: APPROVED` | Verification approved |

Example EDD flow:
```
POST /customers { customerType: INDIVIDUAL, fullName: "Jane Doe 003", ... }
POST /verifications { customerId }
  → verificationStatus: RESOLVE_ERRORS,
    errors: [ { field: "edd.sourceOfWealthCategories", type: MISSING_FIELD }, ... ]

POST /customers/edd
  { customerId: "Customer:...", sourceOfWealthCategories: [SALARY],
    purposeOfAccount: PERSONAL_SPEND, ... }
  → 200 { EDD fields echoed back }

# Platform PATCH fullName to strip the `003` (or the retry logic maps `003` to APPROVED
# once EDD is present) and re-verify:
POST /verifications { customerId }
  → verificationStatus: IN_PROGRESS, kycStatus: APPROVED
```

**How each new piece behaves in sandbox:**

- **`taxIdentification` (§1)** — sandbox accepts the field, persists it, but doesn't attempt any TIN-verification round-trip. No Sumsub `fixedInfo.tin` call. The value is echoed back on `GET /customers/{id}` for parity.
- **EDD endpoint (§1a)** — sandbox accepts `POST /customers/edd`, persists the fields (per backend storage choice in [Open questions](#open-questions-for-phase-1) #3), echoes them on `GET /customers/edd?customerId=...`. Does not run any Sumsub requiredIdDocs check. Absence of EDD data plus a `fullName` suffix of `003` on the customer is what drives the `MISSING_FIELD` errors in the table above.
- **400 `INVALID_INPUT` with `details.constraint` (§2)** — sandbox rejects malformed field values at submit time (`POST /customers`, `PATCH /customers/{id}`, `POST /customers/edd`, `PATCH /customers/edd`) with the same 400 shape production returns, including `details.field` and `details.constraint`. Integrators can wire their onboarding form's client-side validation against the sandbox before hitting production.

**What sandbox does NOT do:**
- No Sumsub calls (no applicant creation, no doc upload, no verification submission).
- No LexisNexis / OFAC screening (sandbox switch already returns `None` from `gen_screen_customer`).
- No real document processing — `POST /documents` succeeds and returns a fake `documentId`, no file is uploaded anywhere.

**What sandbox DOES do (beyond magic-value outcomes):**
- **Webhooks fire.** Sandbox emits `CUSTOMER.KYC_APPROVED` / `KYC_REJECTED` / `KYC_PENDING` events based on the magic-value outcome so integrators can wire and test their webhook handlers end-to-end. Same event shape as production.

**Documentation.** `mintlify/snippets/sandbox-verification.mdx` covers all three verification types (business KYB, beneficial-owner KYC, individual-customer KYC — including the `003`-suffix EDD trigger). It's imported by `mintlify/api-reference/sandbox-testing.mdx` and the per-product `sandbox-testing.mdx` pages. The Mintlify docs also publish the per-jurisdiction / per-currency requirements matrix so platforms can build their onboarding form against it up-front.

## Walkthrough: interactive singleton flow

Platforms build their onboarding form against the documented per-jurisdiction / per-currency requirements matrix (Mintlify docs), submit what they have, and iterate on `errors[]` from `POST /verifications`.

```
End-user opens the platform's onboarding form.
Platform renders form based on the docs. User fills what they can. Missing DOB.

Platform → POST /customers
             { customerType: INDIVIDUAL, fullName, address, nationality: BR,
               taxIdentification: { idType: NON_US_TAX_ID, identifier, countryOfIssuance: BR } }
        ← 201 { id, kycStatus: PENDING, ... }

Platform → POST /verifications { customerId }
        ← 200 { verificationStatus: RESOLVE_ERRORS,
                errors: [
                  { field: "birthDate", type: MISSING_FIELD,
                    constraint: { format: "date" },
                    reason: "Date of birth is required" },
                  { type: MISSING_IDENTITY_DOCUMENT,
                    acceptedDocumentTypes: [PASSPORT, DRIVERS_LICENSE, NATIONAL_ID],
                    reason: "Identity document required" }
                ] }

All currently-known requirements are surfaced at once, not staged across rounds. Platform prompts the user for the missing DOB and a passport photo, then uploads both:

Platform → POST /documents (multipart, documentHolder: customer_id,
                            documentType: PASSPORT, country: BR)
        ← 201 { id: "Document:..." }

Platform → PATCH /customers/{id} { birthDate: "1990-01-15" }
        ← 200 { customer }

Platform → POST /verifications { customerId }
        ← 200 { verificationStatus: IN_PROGRESS, errors: [] }

Terminal state via webhook CUSTOMER.KYC_APPROVED / KYC_REJECTED, or by polling.
```

For an EDD-triggered customer, the second-round `POST /verifications` returns `MISSING_FIELD` errors pointing at `edd.*` fields; the platform then posts to `POST /customers/edd` (with the customerId link + requested EDD data) and retries.

## Implementation phasing

**Strategy: ship the API surface and sandbox behavior first so customers can integrate and test end-to-end immediately; progressively fill in real production behavior behind the same API surface.** The API contract is locked once Phase 1 ships, so production wire-up in later phases doesn't change what platforms see — it just makes their existing sandbox integrations work against real vendors.

Each item below is intended to map to roughly one ticket. Sizing is rough: **S** ≈ half a day, **M** ≈ 1–2 days, **L** ≈ 3+ days.

### Phase 1 — API surface + sandbox behavior (ship ASAP)

**grid-api (OpenAPI spec + Mintlify docs):**

- **S** — §1 `taxIdentification` (single object) addition to `IndividualCustomerFields.yaml`.
- **S** — §2 New shared `FieldConstraint.yaml` schema (regex, format, enum, min/max length). Documented as the shape used inside `Error400.details.constraint` on submit endpoints.
- **M** — §1a New `POST /customers/edd` endpoint spec (customerId + EDD fields in body) + `GET /customers/edd?customerId=...` + `PATCH /customers/edd?customerId=...`. Flat linked-resource pattern per `openapi/README.md`. `CustomerEddCreateRequest.yaml` (POST body) + `CustomerEdd.yaml` (response, PATCH body), using `IndividualSourceOfFundsCategory`, `SourceOfWealthCategory`, `AnnualIncomeRange`, `NetWorthRange`, `PepStatus` enum schemas.
- **S** — Mintlify — extend `sandbox-verification.mdx` with the `003`-suffix EDD trigger row and example flow. Publish the per-jurisdiction / per-currency requirements matrix as static docs so platforms can build their onboarding form against it up-front.

**webdev/sparkcore (backend):**

- **S** — Accept + persist `taxIdentification` on `POST /customers` (INDIVIDUAL); JSON blob on `EntUmaaasIndividualUserInfo`.
- **M** — Implement `POST /customers/edd`, `GET /customers/edd?customerId=...`, `PATCH /customers/edd?customerId=...` handlers. Storage per Open Question #3.
- **S** — Populate `details.field` + `details.constraint` on 400 `INVALID_INPUT` responses from `POST/PATCH /customers` and `POST/PATCH /customers/edd` when the request contains malformed field values. Uses `FieldConstraint` for the constraint shape.
- **M** — Sandbox switch — individual-customer KYC magic values (`fullName` suffix → `001` PENDING / `002` REJECTED / `003` RESOLVE_ERRORS with `edd.*` missing-field errors / else APPROVED on `POST /verifications`).

### Phase 2 — Production wire-up (progressive, per piece, no API changes)

Fill in real vendor behavior behind the Phase 1 API surface. Each item is independent; no API changes:

- **M** — `taxIdentification` → Sumsub `fixedInfo.tin` mapping in `kyx_sumsub_manager.py` (US SSN/ITIN sent to Sumsub for TIN-based non-doc verification).
- **M** — Wire EDD-required decisions from Sumsub's `requiredIdDocs` response (or a Grid-side per-platform overlay) into the `POST /verifications` error path, so missing `edd.*` fields on real applicants surface as `MISSING_FIELD` errors pointing at the EDD endpoint.
- **M** — Extend the 400-with-constraint validation on LSP-switch customer creation / update paths to cover any additional field-format constraints we discover once we're screening real Lead Bank customers (deferred until we've seen real onboarding failures).

---

## Appendix A — Bulk migration (deferred; future work)

Kept for design continuity. Not on the current workstream; picked up only if a customer explicitly needs bulk migration.

### Endpoint sketch: `POST /customers/bulk/json`

New JSON endpoint. **The existing spec-only `POST /customers/bulk/csv` would be dropped.** CSV can't cleanly carry nested data (BOs, arrays, doc refs), and since the backend for the CSV variant was never implemented, there's no migration cost to going JSON-only from day one.

```yaml
POST /customers/bulk/json
body:
  customers:
    - platformCustomerId, customerType, ...customer_fields
    - ...   # up to 1000 entries per request
  idempotencyBehavior:  CREATE_OR_UPDATE | CREATE_ONLY

response 202:
  jobId
  status: PENDING

GET /customers/bulk/jobs/{jobId}
response 200:
  status: PENDING | PROCESSING | COMPLETED | FAILED
  progress: { total, processed, successful, failed }
  errors:
    - correlationId: <platformCustomerId>
      customerId:    <if creation succeeded>
      verificationErrors: [ VerificationError, ... ]
```

Extend `BulkCustomerImportErrorEntry` with an optional `verificationErrors[]` so a platform sees exactly which fields are missing per failed customer and can resubmit with corrections.

`idempotencyBehavior: CREATE_OR_UPDATE` + a stable `platformCustomerId` lets a platform safely re-run the same payload after a partial failure — existing customers are patched, missing ones are inserted, no duplicates.

### Bulk-oriented document patterns

**Pattern C — bulk create then loop uploads.**  
`POST /customers/bulk/json` creates N customers → response has each customer's `id` → platform uploads docs per-customer via `POST /documents` in a loop (or in parallel). Works with the existing backend today.

**Pattern D — one-shot with buffered docs (requires new capability).**  
For a truly single-round-trip create-with-documents flow, Grid would need to accept and buffer document bytes before an applicant exists and then push them to Sumsub after applicant creation. This is Grid-side document caching. Trade-offs:

- New infrastructure — blob storage, TTL enforcement, capacity planning.
- Legal and compliance — Grid becomes a temporary custodian of KYC PII; retention, residency, and access-control policies to define.
- Cost — storage plus egress on every doc upload, whether or not the customer ends up completing verification.
- Requires a TTL to bound legal exposure and cost.
- Benefit — enables genuine one-shot bulk migration flows including documents.

Pattern D is a real product / infra / compliance question, not a purely technical one. Default plan is Patterns A–C only; Pattern D would only be picked up if a customer explicitly needs true one-shot bulk migration with documents.

### Walkthrough: bulk migration

```
Platform builds JSON payload against the documented requirements matrix:

Platform → POST /customers/bulk/json
             { customers: [ ...1000 entries... ],
               idempotencyBehavior: CREATE_OR_UPDATE }
        ← 202 { jobId, status: PENDING }

Platform → GET /customers/bulk/jobs/{jobId}
        ← 200 { status: COMPLETED,
                progress: { total: 1000, processed: 1000, successful: 987, failed: 13 },
                errors: [ { correlationId, customerId, verificationErrors }, ... ] }

For customers that also need documents, the platform loops after the bulk create:

Platform → POST /documents (documentHolder: customer_id, multipart)   # per customer, per doc
Platform → POST /verifications { customerId }                          # per customer
```

### Open questions for the bulk workstream

Only relevant if / when bulk gets prioritized:

- Do we actually build Pattern D (Grid-side document caching), or default to Pattern C sequential upload after bulk create?
- Bulk endpoint per-request cap (placeholder 1000).
- Orphan doc TTL (24 h before auto-GC? longer?) — only relevant if Pattern D is built.
- `documentIds` binding mechanism for orphan docs — `documentHolder: "PENDING:<platformCustomerId>"` at upload time then rebind; or holderless upload with `documentIds` on customer creation. Only relevant if Pattern D is built.
