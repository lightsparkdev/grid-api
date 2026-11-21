# Close the individual tax-identification docs gap (Grid mintlify docs)

## Context

A partner integration review found that the public individual-onboarding walkthrough's
`POST /customers` examples omit the individual's tax identification fields, and the
bulk-import CSV column list has no tax-identifier column. An integrator following either
gets a clean `200` on create and then a verification failure they can't predict from the
docs. Asked to fix both in `grid-api` under `mintlify/`. The Sales Enablement FAQ item from
the same report is explicitly out of scope.

## Approach

Document the fields on the **individual** onboarding paths using their real API names, and
add a short up-front requirements block so the permissive-create / strict-verify split is
stated rather than discovered.

Two corrections to the gap report itself, both verified on checkout — worth stating because
they change what we write:

1. **The field names in the report are wrong.** There is no `taxIdType` / `taxIdentifier`.
   The API fields are `idType` and `identifier` on the individual customer
   (`openapi/components/schemas/customers/IndividualCustomerFields.yaml`), and
   `verification_validator.py:438-439` emits `MISSING_FIELD` on the paths `identifier` and
   `idType`. Writing the reported names into the docs would have created a second, worse
   gap. `identifier` is `writeOnly`.

2. **Individuals accept only SSN or ITIN**, and only as a pair.
   `validate_individual_tax_id` (`sparkcore/grid/utils/customer.py:899-924`) raises
   `INVALID_INPUT` when only one of the two is sent, and when `idType` is anything other
   than `SSN` / `ITIN` — even though the shared `IdentificationType` enum also carries `EIN`
   and `NON_US_TAX_ID`. Beneficial owners *do* accept `NON_US_TAX_ID`, so the asymmetry has
   to be explicit or it reads as a doc error.

For the CSV: the honest fix is to add the columns to the documented format. Note the
endpoint is currently a `501 NOT_IMPLEMENTED` stub in sparkcore
(`sparkcore/grid/api_handlers/bulk_customers.py`) — there is no live importer whose column
parsing could be treated as the source of truth, so the documented format is authoritative
and we make it consistent with the single-customer path rather than inventing new names.
Columns are named after the API fields (`idType`, `identifier`) for exactly that reason.

Alternative considered and rejected: adding the fields only to the OpenAPI schema
descriptions and letting the walkthroughs stay thin. Rejected because the gap is
specifically that an integrator reading the *walkthrough* gets a clean 200 and no warning —
the schema already describes the fields correctly today.

## Relevant Knowledge

Nothing in hindsight recall touched Grid onboarding docs. Verified everything directly
against `webdev@1fe4fb6373` and `grid-api@80ed2f36`.

## Changes

### 1. `mintlify/snippets/kyc/kyc-unregulated.mdx`

The primary fix — this snippet is imported by all four `configuring-customers` pages
(global-p2p, payouts-and-b2b, ramps, rewards), so one edit covers every product surface.

- **What**:
  - In the **Direct API Onboarding → KYC (individual)** tab, step "Create the customer with
    personal information": add `idType` / `identifier` to the curl body, and add a `<Note>`
    stating the SSN-or-ITIN-only rule and the must-be-sent-together rule.
  - Add a short **What individual verification requires** block at the top of that tab
    listing the fields the completeness check enforces, so the requirements are readable
    before the four-step walkthrough rather than inferred from it.
  - In the **Hosted flow → 1. Create the customer → Individual (KYC)** tab: leave the
    minimal example minimal (that path is genuinely permissive — the applicant supplies the
    rest inside the hosted flow) but add one line pointing at the direct-API requirements
    so the reader knows the two paths differ.
- **Why**: This is the page an integrator building programmatic individual onboarding reads.
  It currently documents the identity *document* requirement but not the identity *number*.
- **Code sketch**:
  ```
      "nationality": "US",
      "idType": "SSN",
      "identifier": "123-45-6789",
      "email": "jane.doe@example.com",
  ```
  ```mdx
  <Note>
  For an individual, `idType` must be `SSN` or `ITIN` and must be sent together with
  `identifier` — sending one without the other is rejected with `INVALID_INPUT`. The wider
  `IdentificationType` enum (`EIN`, `NON_US_TAX_ID`) applies to beneficial owners, not to
  individual customers. `identifier` is write-only and never returned in customer responses.
  </Note>
  ```

### 2. `mintlify/snippets/kyc/kyc-regulated.mdx`

- **What**: Add `idType` / `identifier` to the individual curl body and the "Individual
  customer" tab JSON, with a one-line note that regulated platforms supplying the pair are
  bound by the same SSN/ITIN validation at the input boundary.
- **Why**: `validate_individual_tax_id` runs in `create_customer` for every platform — the
  input validation is not conditional on the regulated/unregulated split, so an example that
  omits the fields on one path and includes them on the other reads as a meaningful
  distinction that doesn't exist. Regulated platforms skip Grid-side *verification*, not
  input validation.

### 3. `mintlify/snippets/creating-customers/customers.mdx`

- **What**: Add `idType` / `identifier` to the individual examples; add the two new CSV
  columns to the header row and example rows; add the requirements note.
- **Why**: Same content, standalone copy. Note this snippet is currently imported by
  nothing (`grep` for `creating-customers/customers.mdx` returns no importers) — it is dead
  today, but it is the most complete individual walkthrough in the tree and will mislead
  whoever wires it back up. Fixing it is cheap; deleting it is a separate call for the docs
  owner, so leave it in place and correct.

### 4. `mintlify/global-p2p/onboarding/configuring-customers.mdx`

- **What**: In the "Bulk customer import operations" CSV example, add `idType` and
  `identifier` columns to the header and populate them on the INDIVIDUAL row (empty on the
  BUSINESS row, which uses `businessTaxId`). Add one line naming the individual tax columns
  under the example.
- **Why**: This is the CSV column list the gap report names.
- **Code sketch**:
  ```csv
  umaAddress,platformCustomerId,customerType,fullName,birthDate,idType,identifier,addressLine1,city,state,postalCode,country,businessLegalName,businessTaxId
  ```

### 5. `mintlify/payouts-and-b2b/onboarding/configuring-customers.mdx`

- **What**: Same CSV change as #4 (this page carries its own copy of the section).
- **Why**: Same gap, duplicated content.

### 6. `openapi/paths/customers/customers_bulk_csv.yaml`

- **What**: Add `idType` / `identifier` to the "Required columns for individual customers"
  list in the endpoint description, and update the embedded example CSV. Run `make build` to
  rebundle into `openapi.yaml` + `mintlify/openapi.yaml`.
- **Why**: The API reference renders this description, so leaving it stale reintroduces the
  same gap on the reference page the walkthrough links to. Repo rule: edit under `openapi/`,
  never the generated root bundle.

## Verification

- [ ] `grep -rn "taxIdType\|taxIdentifier" mintlify/ openapi/` returns nothing — the
      reported-but-nonexistent field names never enter the docs
- [ ] Every individual `POST /customers` example that claims to be verification-ready
      carries both `idType` and `identifier`, and no example pairs one without the other
- [ ] `idType` values in individual examples are only `SSN` or `ITIN`
- [ ] `make lint` passes (Redocly OpenAPI lint + markdown lint + `mint openapi-check`)
- [ ] `make build` rerun and the regenerated `openapi.yaml` / `mintlify/openapi.yaml` diffs
      contain only the CSV description change
- [ ] `git diff` contains no unrelated reflowing of neighboring prose

## Risks

- **CSV column names are a documentation decision, not an observed contract.** The importer
  is a 501 stub, so nothing validates these names today. If the importer is later built with
  different column names, this list has to move with it. Naming them after the API fields is
  the lowest-surprise choice and is called out in the PR body for the docs owner.
- **The hosted flow legitimately needs less.** Adding requirements language too broadly
  would over-restrict the hosted path, where the applicant supplies the identity number
  inside the provider flow. The edit keeps the requirement scoped to direct API onboarding
  and cross-references rather than duplicating.
