---
name: partner-dev-guide
description: >-
  Use when asked to write a one-off developer guide, integration guide, or
  implementation walkthrough for a named partner from a rough funds flow,
  numbered step list, or AM notes. Triggers:
  "create a dev guide for", "write up the integration for", "turn this funds
  flow into a guide", a pasted step list with "1. 1. 2. 2. 3." numbering, or
  a request to add a section to an existing partner guide.
---

# Partner developer guide

## Overview

A partner guide turns a rough funds flow into a document a partner engineer can build from without reading the rest of the docs. Every request and response body in it is copied from the OpenAPI source, so the guide is only as good as the spec lookup behind each step.

**REQUIRED SUB-SKILL:** Use writing-style for all prose. Read it before drafting.

Output is two files: `<partner>-<flow>.md` and a rendered `.html`. Write them to the directory the user names. Partner guides are not committed to this repo, since the repo is public and each guide names a customer. If a previous partner guide is available locally, use it for structure and voice only. A request or response body in it is not a source and may be wrong. Look each one up again.

## What counts as a source

A partner-facing sentence may state only what one of these says:

1. A file under `openapi/` on `origin/main`.
2. A page or snippet under `mintlify/` on `origin/main`.
3. The AM's notes for this partner, placed in the scope section and attributed to nothing.

Run `git fetch origin main` first and read spec and snippet files with `git show origin/main:<path>` when the working tree is on a branch. The sandbox KYC snippets in particular change often, and a local checkout a few days old describes behavior that no longer exists.

Memory notes, observations from a dev environment, the behavior of a previous partner's integration, and rail timings you know from elsewhere are not sources. If one of them matters, put it in the handover message to the user as a question, not in the guide.

An HTTP status or error code goes in the guide only if the path file for that operation lists it in its `responses`. `Error403.yaml` enumerating `USER_NOT_READY` does not mean execute returns it. A `failureReason` enum value is not an error code either; it appears on the transaction after the fact. A behavior with no schema, such as which HTTP status an insufficient balance produces, is described in words or left out.

When a number is not knowable from the spec, such as Grid's fee rate for the partner, say so in the scope section and label the worked example as illustrative in the sentence that introduces it.

## Process

### 1. Turn the funds flow into a resource table

Before writing anything, map each step in the flow onto Grid resources and fill in this table. It becomes the "How Grid models this flow" section.

| Step | Source | Destination | Transaction type | Webhook family |

Rules for filling it in:

- `type` is keyed on the destination. Internal account destination is `INCOMING`, external account or UMA destination is `OUTGOING`. A pull the partner initiated is still `INCOMING`.
- Decide whether the partner holds a platform balance (FBO, no per-user customers) or per-customer balances (customers with KYC). A payouts platform paying its own recipients is the first; a remittance or wallet app onboarding end users is the second. This choice changes every account endpoint in the guide.
- Identify what each external account represents: a funding source the partner owns, a recipient, or a wallet.

Numbers in the rough flow that repeat ("1. 1. 2. 2. 3.") are phases, not steps. Each phase becomes a numbered H2.

### 2. Look up every shape in `openapi/`, not in memory

For each endpoint in the guide, read the path file and every schema it references. Read `references/lookup-map.md` for where each flow element lives. Do not write a request body from recall. Fields that are commonly gotten wrong:

- `identifier` and `idType` for tax ID on individuals. `identifier` is write-only.
- `beneficiary` shape differs per currency. Read `common/<Ccy>Beneficiary.yaml`.
- Which webhook `type` values exist. Read `webhooks/WebhookType.yaml` and never invent one (there is no `CUSTOMER.KYC_HOLD`).
- Which fields are on the transaction versus the quote. `purposeOfPayment` is on the quote request only. `paymentRail`, `fees`, and `platformFees` are on `OutgoingTransaction` only.
- `hasMore` and `nextCursor` on list responses.

### 3. Draft in the fixed section order

The order is the same for every guide. Drop a section only if the flow has no such step.

1. Title and three-sentence summary of the phases, then the credentials block.
2. Scope notes from the AM (pilot exclusions, unreleased pieces, settlement details). One bold lead-in per note. If any endpoint is not live, say so here and again at the top of the section that uses it.
3. How Grid models this flow: resource bullets and the table from step 1.
4. Prerequisites: webhook endpoint, and end user terms consent if the platform is unregulated.
5. One numbered H2 per phase. Inside each: curl, response JSON, then a short "field notes" list. Store-this-ID sentences go right after the response that returns the ID.
6. Transaction lifecycle: status table, mermaid `stateDiagram-v2`, failure reason table with recovery, refund payload, listing for reconciliation.
7. Webhooks: event table scoped to this flow, envelope, signature verification (the four steps and the JavaScript in `references/webhook-verification.md`), idempotency and retry facts from `mintlify/snippets/webhooks.mdx`.
8. Sandbox testing: credentials, what sandbox simulates, the suffix tables for each account role in this flow (KYC on the customer name, source suffixes only if an external account is a quote source, destination suffixes on the recipient), the fund endpoint, moving to production, and the service IPs from `mintlify/api-reference/environments.mdx`.
9. Reference: bulleted mintlify paths. Verify each path exists under `mintlify/`.

### 4. Make the worked numbers agree

Pick one amount and one rate and carry them through every example: the exchange-rate lookup, the quote, the display table, the webhook, and the refund. Compute the receiving amount as `(sending - feesIncluded) / exchangeRate`, floored to the smallest unit, and check it with a one-line script before writing it down. Fee components round half up per the assessing-fees page. If the guide has a platform fee section, the fee in every example must come from the configured fee, and `platformFeesIncluded` must be inside `feesIncluded`.

### 5. Render and check

Build the HTML with `node scripts/render-guide.js <file>.md <file>.html` (run `cd scripts && npm install` once). The output inlines mermaid, so it opens offline. Serve the output directory on a local port and open it in the browser. Confirm the mermaid diagram rendered as an SVG and the tables scroll rather than overflow. Stop the server and delete any screenshots or `.playwright-mcp/` directories the browser check left in the repo.

Run the style scan before handing over:

```bash
grep -n "—\|simply\|\bjust\b\|seamless\|robust\|leverage\|end-to-end\|please note\|keep in mind" <file>.md
```

It must return nothing.

### 6. Hand over

The closing message lists, as bullets: the two file paths, any step documented as a target shape rather than live behavior, and every claim you could not source from `openapi/` or `mintlify/` on `origin/main`. The user decides whether those go in.

## Quick reference

| Flow element | Where the truth is |
| --- | --- |
| Customer create fields | `openapi/components/schemas/customers/IndividualCustomerFields.yaml`, `BusinessCustomerFields.yaml` |
| KYC submit and errors | `openapi/paths/verifications/verifications.yaml`, `webhooks/verification-update.yaml`, `webhooks/customer-update.yaml` |
| External account per currency | `openapi/components/schemas/common/<Ccy>AccountInfoBase.yaml` and `<Ccy>Beneficiary.yaml` |
| Quote request and response | `openapi/components/schemas/quotes/QuoteRequest.yaml`, `Quote.yaml` |
| Exchange rate lookup | `openapi/paths/exchange-rates/exchange_rates.yaml` |
| Platform fees | `mintlify/payouts-and-b2b/payment-flow/assessing-fees.mdx` |
| Statuses and failure reasons | `openapi/components/schemas/transactions/OutgoingTransactionStatus.yaml`, `OutgoingTransactionFailureReason.yaml`, `IncomingTransactionFailureReason.yaml` |
| Webhook types | `openapi/components/schemas/webhooks/WebhookType.yaml` |
| Sandbox suffixes | `mintlify/snippets/sandbox-verification.mdx`, `sandbox-quote-patterns.mdx`, `sandbox-transfer-patterns.mdx` |
| Retry and IP facts | `mintlify/snippets/webhooks.mdx`, `mintlify/api-reference/environments.mdx` |

## Common mistakes

| Mistake | Fix |
| --- | --- |
| Writing a request body from memory, then finding the field is named differently | Open the schema file before every curl block |
| Fee, rate, and receiving amounts that don't reconcile across examples | Fix one amount and one rate in step 4 and script the arithmetic |
| Inventing a webhook type or status | Only values in `WebhookType.yaml` and the status enums |
| Documenting a step the API can't do yet as if it were live | Put it in the scope notes and label the section "target shape" |
| Reusing wallet-payout text (on-chain hash, "COMPLETED is final") in a bank-rail flow | Bank payouts can be returned after `COMPLETED`. Add the `COMPLETED` to `FAILED` edge and the `005` sandbox suffix |
| Referencing mintlify pages that don't exist | `test -f mintlify/<path>.mdx` for each reference bullet |
| Reformatting the guide as Mintlify MDX | Partner guides are plain markdown handed to one partner, not site pages |
| Committing a partner guide, or naming a partner in this skill or the repo | The repo is public. Guides stay local or go to the partner directly |
| Stating a gotcha from a memory note or a dev-environment observation as API behavior | Ask the user about it in the handover. Only `openapi/` and `mintlify/` on `origin/main` go in the guide |
| Listing an error code because it exists in `Error4xx.yaml` | Only codes the operation's path file names. Otherwise describe the failure in words |
| Reading sandbox snippets from a stale local branch | `git show origin/main:mintlify/snippets/...` |
