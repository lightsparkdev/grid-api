# Lookup map: funds flow element to spec source

Read the file in the right column before writing the example in the left column. Paths are relative to the repo root.

## Accounts and identity

| Guide element | Read |
| --- | --- |
| Platform (FBO) balance and funding instructions | `openapi/paths/platform/platform_internal_accounts.yaml`, `openapi/components/schemas/customers/InternalAccount.yaml`, `openapi/components/schemas/common/PaymentInstructions.yaml` |
| Customer balance | `openapi/paths/customers/customers_internal_accounts.yaml` (created automatically with the customer; no create call). Its `fundingPaymentInstructions` follow the same shape as the platform account |
| USD funding coordinates | `openapi/components/schemas/common/PaymentUsdAccountInfo.yaml`, `UsdAccountInfo.yaml`. `accountHolderName` exists only on `PaymentSwiftAccountInfo.yaml`, so leave it out of a USD example |
| Individual customer create | `openapi/paths/customers/customers.yaml` (examples), `openapi/components/schemas/customers/CustomerCreateRequest.yaml`, `IndividualCustomerFields.yaml`, `common/Address.yaml` |
| Business customer create | `openapi/components/schemas/customers/BusinessCustomerFields.yaml`, `BusinessInfo.yaml`, `BusinessType.yaml`, `PurposeOfAccount.yaml` |
| Beneficial owners and documents for KYB | `openapi/paths/beneficial-owners/beneficial_owners.yaml`, `beneficial_owners_{beneficialOwnerId}.yaml`, `openapi/components/schemas/customers/BeneficialOwnerCreateRequest.yaml`, `openapi/paths/documents/documents.yaml` |
| EDD fields | `openapi/components/schemas/customers/CustomerEdd.yaml` (surface as `MISSING_FIELD` on verification) |
| End user terms consent | `openapi/components/schemas/customers/EndUserTermsConsentRequest.yaml` (required on unregulated platforms before customer-scoped quotes) |
| KYC or KYB submit | `openapi/paths/verifications/verifications.yaml` (has both the `RESOLVE_ERRORS` and `IN_PROGRESS` examples) |
| KYC statuses | `openapi/components/schemas/customers/KycStatus.yaml`, `verifications/VerificationStatus.yaml`, `verifications/VerificationErrorType.yaml` |
| KYC webhooks | `openapi/webhooks/customer-update.yaml`, `openapi/webhooks/verification-update.yaml` |
| Documents | `openapi/paths/documents/documents.yaml` |

## External accounts

The create request is `openapi/components/schemas/external_accounts/ExternalAccountCreateRequest.yaml`. Customer-owned accounts post to `/customers/external-accounts`, platform-owned to `/platform/external-accounts`.

Per currency, read both files:

- `openapi/components/schemas/common/<Ccy>AccountInfoBase.yaml` for the account fields and which are required per rail.
- `openapi/components/schemas/common/<Ccy>Beneficiary.yaml` for the beneficiary fields. Required fields differ by currency; do not reuse another currency's beneficiary block.

Wallets use `external_accounts/<Chain>WalletExternalAccountInfo.yaml` and `WalletBeneficiaryFields.yaml`.

The response adds `paymentRails`, `status`, and `beneficiaryVerificationStatus`. See `external_accounts/ExternalAccount.yaml` and `ExternalAccountStatus.yaml`.

Corridor field requirements by sender and recipient type: `mintlify/snippets/corridor-required-fields.mdx`. Working curl examples per currency: `mintlify/snippets/external-accounts.mdx`.

## Quotes and rates

| Guide element | Read |
| --- | --- |
| Quote request | `openapi/components/schemas/quotes/QuoteRequest.yaml`, `AccountQuoteSource.yaml`, `RealtimeFundingQuoteSource.yaml`, `AccountDestination.yaml`, `PurposeOfPayment.yaml` |
| Quote response and expiry | `openapi/components/schemas/quotes/Quote.yaml` (`expiresAt` description gives the window per rail) |
| Execute | `openapi/paths/quotes/quotes_{quoteId}_execute.yaml`. An expired quote returns `409`. `QUOTE_EXPIRED` is a transaction `failureReason`, not an execute error code |
| Rate lookup before a recipient exists | `openapi/paths/exchange-rates/exchange_rates.yaml`, `components/schemas/exchange_rates/ExchangeRate.yaml` |
| Platform fee config and override | `mintlify/payouts-and-b2b/payment-flow/assessing-fees.mdx`, `openapi/components/schemas/quotes/PlatformFeeOverride.yaml`, `config/FeeConfig.yaml` |
| Idempotency | `Idempotency-Key` header on `openapi/paths/quotes/quotes.yaml` |
| ACH pull | Not live. Model as a quote with an external account source and `immediatelyExecute: true`, per the deprecation note in `openapi/paths/transfers/transfer_in.yaml`. Label the section as a target shape |

## Transactions and webhooks

| Guide element | Read |
| --- | --- |
| Transaction fields | `openapi/components/schemas/transactions/Transaction.yaml`, `OutgoingTransaction.yaml` (`fees`, `platformFees`, `paymentRail`, `failureReason`, `onChainTransaction`), `IncomingTransaction.yaml` |
| Outgoing statuses | `transactions/OutgoingTransactionStatus.yaml` |
| Failure reasons | `transactions/OutgoingTransactionFailureReason.yaml`, `IncomingTransactionFailureReason.yaml` |
| Refund object | `openapi/components/schemas/common/Refund.yaml` |
| Every webhook type | `openapi/components/schemas/webhooks/WebhookType.yaml` |
| Payment webhook payloads | `openapi/webhooks/outgoing-payment.yaml`, `incoming-payment.yaml` |
| Account webhooks | `openapi/webhooks/internal-account-status.yaml`, `external-account-status.yaml` |
| Retry policy and 409 behavior | `mintlify/snippets/webhooks.mdx` |
| Listing for reconciliation | `openapi/paths/transactions/transactions.yaml` |

## Sandbox

| Guide element | Read |
| --- | --- |
| KYC suffixes and the skip-paperwork switch | `mintlify/snippets/sandbox-verification.mdx`, `snippets/kyc/kyb-sandbox-suffixes.mdx` |
| Payout outcome suffixes on a destination | `mintlify/snippets/sandbox-quote-patterns.mdx` |
| Pull or transfer outcome suffixes on a source | `mintlify/snippets/sandbox-transfer-patterns.mdx`. Applies only when an external account is the quote source. A push deposit has no suffix; use the fund endpoint |
| Fund an internal account | `openapi/paths/sandbox/sandbox_internal_accounts_{accountId}_fund.yaml` |
| Service IPs to allow-list | `mintlify/api-reference/environments.mdx`, "Service IPs" section |
| Signature verification block | `references/webhook-verification.md` in this skill, derived from `mintlify/snippets/webhooks.mdx` |

## Lifecycle differences by destination

| Destination | After `COMPLETED` | Sandbox suffix to exercise it |
| --- | --- | --- |
| On-chain wallet | Final. No return path | none |
| Bank account (SPEI, UPI, NEFT, ACH, SEPA) | Can move to `FAILED` with `PAYOUT_RETURNED`, refund follows | `005` |
| UMA address | Counterparty can reject before completion | `004` |
