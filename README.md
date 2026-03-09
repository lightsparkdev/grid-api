# lspeu-eks

Microservice for integrating with Latvijas Banka's EKS (Elektroniska Kliiringa Sistema) to process SEPA Instant Credit Transfers.

## Overview

`lspeu-eks` is a standalone TypeScript/Express service that connects to Latvijas Banka's Electronic Clearing System (EKS) via IBM MQ. It handles ISO 20022 message construction, XML signing/verification, and provides an internal REST API for `lspeu-core` to initiate and receive SEPA Instant payments.

This project is part of the [Bank of Latvia LSPEU Integration](https://linear.app/lightsparkdev/project/bank-of-latvia-lspeu-integration-171c2c8b92b9) initiative under Q1'26 Atlas.

## Key Capabilities

- **ISO 20022 messaging** — Build and parse pacs.008 (credit transfer), pacs.002 (status), pacs.004 (return), pacs.028 (status request), camt.056 (cancellation), camt.029 (resolution), camt.060 (balance inquiry)
- **IBM MQ integration** — Async request/response correlation with 20s TTL for outbound instant payments
- **XML signing & verification** — Sign outbound messages and verify inbound signatures
- **IBAN generation** — Internal IBAN generation using Striga's BIC prefix with MOD-97 check digits and atomic MongoDB counters
- **Inbound payment processing** — Signature verification, core callback, AML checks, and pacs.002 response

## Architecture

```
┌─────────────┐     REST      ┌───────────┐     IBM MQ     ┌──────────────────┐
│  lspeu-core │ ────────────> │ lspeu-eks │ ─────────────> │ Latvijas Banka   │
│             │ <──────────── │           │ <───────────── │ EKS              │
└─────────────┘   webhooks    └───────────┘   ISO 20022    └──────────────────┘
```

- **lspeu-eks**: Handles MQ connection, XML signing, message building/parsing, and request/response correlation
- **lspeu-core**: Business logic — outbound payout finalization, inbound payin handling with AML checks, ledger integration via `AccountLedgerEntryBuilder`
- **Routing**: EKS webhook endpoints in `internal_router.ts`, provider selection extended with EKS branch in `wallet.service.ts`

## Infrastructure

- Kubernetes deployment via Helm chart (single replica, no HPA)
- ClusterIP service on port 27010
- ECR repository for Debian-slim Docker image with IBM MQ C client
- Doppler for config management
- NAT gateway EIP for MQ broker allowlist
- Feature-flagged off until go-live

## Project Phases

| Phase | Description | Target |
|-------|-------------|--------|
| **Phase 0** | Legal, Regulatory & Connectivity Prerequisites (SWIFT BIC, EPC scheme, IBAN range, EKS onboarding, VOP compliance) | Aug 2026 |
| **Phase 1** | lspeu-eks Service Scaffold (TypeScript/Express, IBM MQ, XML signing, REST API, Docker image) | Mar 2026 |
| **Phase 2** | ISO 20022 Message Builder (all message builders/parsers + MessageParser for routing) | Mar 2026 |
| **Phase 3** | EKS Message Flow Manager (request/response correlation, timeout handling) | Apr 2026 |
| **Phase 4** | lspeu-core EKS Banking Service (business logic, AML, ledger integration) | Apr 2026 |
| **Phase 5** | Data Model Extensions (MongoDB: EKS fields, IBAN index, SepaProvider enum, IBANCounter) | Apr 2026 |
| **Phase 6** | Routing & Router Integration (webhook endpoints, route constants, provider selection) | Apr 2026 |
| **Phase 7** | IBAN Generation & Account Provisioning (MOD-97, atomic counters, IBAN lookup) | Apr 2026 |
| **Phase 8** | Infrastructure & Helm Chart (K8s deployment, ECR, Doppler, NAT gateway) | Apr 2026 |
| **Phase 9** | Testing & Certification (unit tests, integration tests, LB certification) | Jul 2026 |
| **Go-Live** | EKS SEPA Instant Production (BIC live, production MQ, pilot then full rollout) | Aug 2026 |

## Resources

- [PRD](https://docs.google.com/document/d/15XSTU5th8bxsbGq7Q7lTNmMxDPlNC_uvH8IUGhQ0zSc/edit?tab=t.vpa12mnw14jg)
- [Context & Background](https://docs.google.com/document/d/1FH6EmRiRC7QkfoSLIrrRMU-OaLVBNfpTXownvY1_fbI/edit?tab=t.0#heading=h.u07fn3kpz1or)
- [Linear Project](https://linear.app/lightsparkdev/project/bank-of-latvia-lspeu-integration-171c2c8b92b9)

## Contributing

Please open a pull request for any changes and ensure they are reviewed before merging.
