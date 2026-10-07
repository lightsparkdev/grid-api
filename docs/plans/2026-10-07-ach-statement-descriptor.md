# ACH company entry description on quotes

## Context
Building on #1101 (`railDetails`, a oneOf discriminated by `paymentRail`), let platforms
set an ACH company entry description (max 10 characters) on a payout, only when the
destination rail is `ACH` or `ACH_SAME_DAY`. In NACHA terms this is the batch header's
Company Entry Description: a 10-character field the receiving bank shows on the
recipient's statement.

## Approach
`AccountDestination` on `POST /quotes` gains an optional **`railOptions`** object that
*selects* the rail. Like `railDetails`, it is a oneOf discriminated by `paymentRail`, so
`railOptions.paymentRail` is the rail choice and the ACH-only field exists only on the
ACH variant. Because the discriminator is the rail selection, a client cannot ask for one
rail and send another rail's options: no "must match" rule is needed.

Variants:
- `AchRailOptions`: `paymentRail: ACH | ACH_SAME_DAY`, optional `companyEntryDescription`.
- `BasicRailOptions`: `paymentRail` is any other `PaymentRail` value and there are no extra
  fields. This lets every rail be selected through `railOptions`. A rail that later needs
  inputs (wire OBI, RTP purpose code) moves out of it into its own variant.

The flat `destination.paymentRail` is marked `deprecated` but still accepted. A destination
carries one or the other. This is expressed in the schema as
`not: {required: [paymentRail, railOptions]}`, and the API returns `400 INVALID_INPUT` when
both are sent. Omitting both keeps automatic rail selection.

`companyEntryDescription`: `minLength: 1`, `maxLength: 10`, `pattern: '^[ -~]+$'`
(printable ASCII). It is the NACHA batch header field the receiving bank shows on the
recipient's statement. If it is omitted, Grid uses its default.

Scope: only the quote + execute surface. `POST /transfer-out` and `POST /transfer-in` are
deprecated and are not changed. Sweep-rule destinations are left for later.

Response side: `AchRailDetails` gains `companyEntryDescription`. On payouts it is the value
sent or Grid's default. On incoming ACH it is the originator's description. `Quote.destination`
echoes `railOptions` automatically because it reuses `QuoteDestinationOneOf`.

Additive only. The flat field becomes deprecated but nothing becomes required, so oasdiff
should report no breaking changes.

## Changes

### 1. `openapi/components/schemas/quotes/AchRailOptions.yaml` (new)
```yaml
title: ACH
type: object
required: [paymentRail]
properties:
  paymentRail:
    type: string
    enum: [ACH, ACH_SAME_DAY]
  companyEntryDescription:
    type: string
    minLength: 1
    maxLength: 10
    pattern: '^[ -~]+$'
    description: >-
      The ACH Company Entry Description: text the recipient's bank shows on their
      statement for this payment. Grid uses its default when omitted. Values NACHA
      reserves for system entries (`REVERSAL`, `RETURN FEE`, `AUTOENROLL`,
      `NONSETTLED`, `RECLAIM`), `MISC`, and all zeros return `400 INVALID_INPUT`.
    example: PAYROLL
```

### 2. `openapi/components/schemas/quotes/BasicRailOptions.yaml` (new)
`paymentRail` is an enum of every `PaymentRail` value except `ACH` and `ACH_SAME_DAY`.
There are no other properties.

### 3. `openapi/components/schemas/quotes/RailOptionsOneOf.yaml` (new)
A oneOf of [AchRailOptions, BasicRailOptions] with `discriminator.propertyName: paymentRail`
and an explicit mapping for every rail value.

### 4. `openapi/components/schemas/quotes/AccountDestination.yaml`
- Add `railOptions: $ref RailOptionsOneOf.yaml`.
- Mark `paymentRail` as `deprecated: true` and point it to `railOptions`.
- Add `not: {required: [paymentRail, railOptions]}`.

### 5. `openapi/components/schemas/transactions/AchRailDetails.yaml`
Add `companyEntryDescription` (string, maxLength 10).

### 6. Examples and docs
- The ACH examples in `paths/quotes/quotes.yaml` switch to
  `railOptions: {paymentRail: ACH, companyEntryDescription: ACMEPAY}`. The other examples
  move from `paymentRail` to `railOptions`.
- `webhooks/outgoing-payment.yaml`: the returned-ACH example shows `companyEntryDescription`.
- `mintlify/payouts-and-b2b/payment-flow/send-payment.mdx` and
  `mintlify/snippets/sending/accounts.mdx`: request bodies use `railOptions`, with a note on
  `companyEntryDescription`.
- A changelog entry under October 2026.

### 7. `make build`

## Verification
- [ ] `make build`, then `make lint-openapi` with 0 errors
- [ ] `oasdiff breaking` against `origin/main` reports no breaking changes
- [ ] Mintlify preview: `railOptions` renders under the destination with the ACH variant
- [ ] `bolt-adversarial-review`

## Risks
- Generated SDKs ignore `not`, so the one-or-the-other rule between `paymentRail` and
  `railOptions` is enforced only by the API at runtime. This lasts only while the
  deprecated flat field exists.
- The API must validate the description and pass it to the bank that sends the ACH entry. That work is
  tracked separately.
- Some originating banks reserve descriptions such as `REVERSAL`. The API rejects those, and the description
  documents it.
