// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.sandbox

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.JsonValue
import com.grid.api.core.jsonMapper
import com.grid.api.models.invitations.CurrencyAmount
import com.grid.api.models.quotes.Currency
import com.grid.api.models.quotes.OutgoingRateDetails
import com.grid.api.models.quotes.PaymentAccountOrWalletInfo
import com.grid.api.models.quotes.PaymentInstructions
import com.grid.api.models.transactions.TransactionStatus
import com.grid.api.models.transactions.TransactionType
import com.grid.api.models.transferin.Transaction
import java.time.OffsetDateTime
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class SandboxSendFundsResponseTest {

    @Test
    fun create() {
        val sandboxSendFundsResponse =
            SandboxSendFundsResponse.builder()
                .id("Transaction:019542f5-b3e7-1d02-0000-000000000004")
                .customerId("Customer:019542f5-b3e7-1d02-0000-000000000001")
                .destination(
                    Transaction.Destination.AccountDestination.builder()
                        .accountId("ExternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                        .currency("EUR")
                        .build()
                )
                .platformCustomerId("18d3e5f7b4a9c2")
                .status(TransactionStatus.CREATED)
                .type(TransactionType.INCOMING)
                .counterpartyInformation(
                    Transaction.CounterpartyInformation.builder()
                        .putAdditionalProperty("FULL_NAME", JsonValue.from("bar"))
                        .putAdditionalProperty("BIRTH_DATE", JsonValue.from("bar"))
                        .putAdditionalProperty("NATIONALITY", JsonValue.from("bar"))
                        .build()
                )
                .createdAt(OffsetDateTime.parse("2025-08-15T14:25:18Z"))
                .description("Payment for invoice #1234")
                .settledAt(OffsetDateTime.parse("2025-08-15T14:30:00Z"))
                .updatedAt(OffsetDateTime.parse("2025-08-15T14:30:00Z"))
                .addPaymentInstruction(
                    PaymentInstructions.builder()
                        .accountOrWalletInfo(
                            PaymentInstructions.AccountOrWalletInfo.PaymentClabeAccountInfo
                                .builder()
                                .accountType(PaymentAccountOrWalletInfo.AccountType.CLABE)
                                .clabeNumber("123456789012345678")
                                .reference("UMA-Q12345-REF")
                                .build()
                        )
                        .instructionsNotes(
                            "Please ensure the reference code is included in the payment memo/description field"
                        )
                        .build()
                )
                .addPaymentInstruction(
                    PaymentInstructions.builder()
                        .accountOrWalletInfo(
                            PaymentInstructions.AccountOrWalletInfo.PaymentClabeAccountInfo
                                .builder()
                                .accountType(PaymentAccountOrWalletInfo.AccountType.CLABE)
                                .clabeNumber("123456789012345678")
                                .reference("UMA-Q12345-REF")
                                .build()
                        )
                        .instructionsNotes(
                            "Please ensure the reference code is included in the payment memo/description field"
                        )
                        .build()
                )
                .sentAmount(
                    CurrencyAmount.builder()
                        .amount(12550L)
                        .currency(
                            Currency.builder()
                                .code("USD")
                                .decimals(2L)
                                .name("United States Dollar")
                                .symbol("\$")
                                .build()
                        )
                        .build()
                )
                .source(
                    SandboxSendFundsResponse.Source.AccountSource.builder()
                        .accountId("InternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                        .currency("USD")
                        .build()
                )
                .exchangeRate(1.08)
                .failureReason(SandboxSendFundsResponse.FailureReason.QUOTE_EXPIRED)
                .fees(10L)
                .originalTransactionId("Transaction:019542f5-b3e7-1d02-0000-000000000003")
                .quoteId("Quote:019542f5-b3e7-1d02-0000-000000000006")
                .rateDetails(
                    OutgoingRateDetails.builder()
                        .counterpartyFixedFee(10L)
                        .counterpartyMultiplier(1.08)
                        .gridApiFixedFee(10L)
                        .gridApiMultiplier(0.925)
                        .gridApiVariableFeeAmount(30.0)
                        .gridApiVariableFeeRate(0.003)
                        .build()
                )
                .receivedAmount(
                    CurrencyAmount.builder()
                        .amount(12550L)
                        .currency(
                            Currency.builder()
                                .code("USD")
                                .decimals(2L)
                                .name("United States Dollar")
                                .symbol("\$")
                                .build()
                        )
                        .build()
                )
                .refund(
                    SandboxSendFundsResponse.Refund.builder()
                        .initiatedAt(OffsetDateTime.parse("2025-08-15T14:30:00Z"))
                        .reference("UMA-Q12345-REFUND")
                        .settledAt(OffsetDateTime.parse("2025-08-15T14:30:00Z"))
                        .build()
                )
                .build()

        assertThat(sandboxSendFundsResponse.id())
            .isEqualTo("Transaction:019542f5-b3e7-1d02-0000-000000000004")
        assertThat(sandboxSendFundsResponse.customerId())
            .isEqualTo("Customer:019542f5-b3e7-1d02-0000-000000000001")
        assertThat(sandboxSendFundsResponse.destination())
            .isEqualTo(
                Transaction.Destination.ofAccount(
                    Transaction.Destination.AccountDestination.builder()
                        .accountId("ExternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                        .currency("EUR")
                        .build()
                )
            )
        assertThat(sandboxSendFundsResponse.platformCustomerId()).isEqualTo("18d3e5f7b4a9c2")
        assertThat(sandboxSendFundsResponse.status()).isEqualTo(TransactionStatus.CREATED)
        assertThat(sandboxSendFundsResponse.type()).isEqualTo(TransactionType.INCOMING)
        assertThat(sandboxSendFundsResponse.counterpartyInformation())
            .isEqualTo(
                Transaction.CounterpartyInformation.builder()
                    .putAdditionalProperty("FULL_NAME", JsonValue.from("bar"))
                    .putAdditionalProperty("BIRTH_DATE", JsonValue.from("bar"))
                    .putAdditionalProperty("NATIONALITY", JsonValue.from("bar"))
                    .build()
            )
        assertThat(sandboxSendFundsResponse.createdAt())
            .isEqualTo(OffsetDateTime.parse("2025-08-15T14:25:18Z"))
        assertThat(sandboxSendFundsResponse.description()).isEqualTo("Payment for invoice #1234")
        assertThat(sandboxSendFundsResponse.settledAt())
            .isEqualTo(OffsetDateTime.parse("2025-08-15T14:30:00Z"))
        assertThat(sandboxSendFundsResponse.updatedAt())
            .isEqualTo(OffsetDateTime.parse("2025-08-15T14:30:00Z"))
        assertThat(sandboxSendFundsResponse.paymentInstructions())
            .containsExactly(
                PaymentInstructions.builder()
                    .accountOrWalletInfo(
                        PaymentInstructions.AccountOrWalletInfo.PaymentClabeAccountInfo.builder()
                            .accountType(PaymentAccountOrWalletInfo.AccountType.CLABE)
                            .clabeNumber("123456789012345678")
                            .reference("UMA-Q12345-REF")
                            .build()
                    )
                    .instructionsNotes(
                        "Please ensure the reference code is included in the payment memo/description field"
                    )
                    .build(),
                PaymentInstructions.builder()
                    .accountOrWalletInfo(
                        PaymentInstructions.AccountOrWalletInfo.PaymentClabeAccountInfo.builder()
                            .accountType(PaymentAccountOrWalletInfo.AccountType.CLABE)
                            .clabeNumber("123456789012345678")
                            .reference("UMA-Q12345-REF")
                            .build()
                    )
                    .instructionsNotes(
                        "Please ensure the reference code is included in the payment memo/description field"
                    )
                    .build(),
            )
        assertThat(sandboxSendFundsResponse.sentAmount())
            .isEqualTo(
                CurrencyAmount.builder()
                    .amount(12550L)
                    .currency(
                        Currency.builder()
                            .code("USD")
                            .decimals(2L)
                            .name("United States Dollar")
                            .symbol("\$")
                            .build()
                    )
                    .build()
            )
        assertThat(sandboxSendFundsResponse.source())
            .isEqualTo(
                SandboxSendFundsResponse.Source.ofAccount(
                    SandboxSendFundsResponse.Source.AccountSource.builder()
                        .accountId("InternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                        .currency("USD")
                        .build()
                )
            )
        assertThat(sandboxSendFundsResponse.exchangeRate()).isEqualTo(1.08)
        assertThat(sandboxSendFundsResponse.failureReason())
            .isEqualTo(SandboxSendFundsResponse.FailureReason.QUOTE_EXPIRED)
        assertThat(sandboxSendFundsResponse.fees()).isEqualTo(10L)
        assertThat(sandboxSendFundsResponse.originalTransactionId())
            .isEqualTo("Transaction:019542f5-b3e7-1d02-0000-000000000003")
        assertThat(sandboxSendFundsResponse.quoteId())
            .isEqualTo("Quote:019542f5-b3e7-1d02-0000-000000000006")
        assertThat(sandboxSendFundsResponse.rateDetails())
            .isEqualTo(
                OutgoingRateDetails.builder()
                    .counterpartyFixedFee(10L)
                    .counterpartyMultiplier(1.08)
                    .gridApiFixedFee(10L)
                    .gridApiMultiplier(0.925)
                    .gridApiVariableFeeAmount(30.0)
                    .gridApiVariableFeeRate(0.003)
                    .build()
            )
        assertThat(sandboxSendFundsResponse.receivedAmount())
            .isEqualTo(
                CurrencyAmount.builder()
                    .amount(12550L)
                    .currency(
                        Currency.builder()
                            .code("USD")
                            .decimals(2L)
                            .name("United States Dollar")
                            .symbol("\$")
                            .build()
                    )
                    .build()
            )
        assertThat(sandboxSendFundsResponse.refund())
            .isEqualTo(
                SandboxSendFundsResponse.Refund.builder()
                    .initiatedAt(OffsetDateTime.parse("2025-08-15T14:30:00Z"))
                    .reference("UMA-Q12345-REFUND")
                    .settledAt(OffsetDateTime.parse("2025-08-15T14:30:00Z"))
                    .build()
            )
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val sandboxSendFundsResponse =
            SandboxSendFundsResponse.builder()
                .id("Transaction:019542f5-b3e7-1d02-0000-000000000004")
                .customerId("Customer:019542f5-b3e7-1d02-0000-000000000001")
                .destination(
                    Transaction.Destination.AccountDestination.builder()
                        .accountId("ExternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                        .currency("EUR")
                        .build()
                )
                .platformCustomerId("18d3e5f7b4a9c2")
                .status(TransactionStatus.CREATED)
                .type(TransactionType.INCOMING)
                .counterpartyInformation(
                    Transaction.CounterpartyInformation.builder()
                        .putAdditionalProperty("FULL_NAME", JsonValue.from("bar"))
                        .putAdditionalProperty("BIRTH_DATE", JsonValue.from("bar"))
                        .putAdditionalProperty("NATIONALITY", JsonValue.from("bar"))
                        .build()
                )
                .createdAt(OffsetDateTime.parse("2025-08-15T14:25:18Z"))
                .description("Payment for invoice #1234")
                .settledAt(OffsetDateTime.parse("2025-08-15T14:30:00Z"))
                .updatedAt(OffsetDateTime.parse("2025-08-15T14:30:00Z"))
                .addPaymentInstruction(
                    PaymentInstructions.builder()
                        .accountOrWalletInfo(
                            PaymentInstructions.AccountOrWalletInfo.PaymentClabeAccountInfo
                                .builder()
                                .accountType(PaymentAccountOrWalletInfo.AccountType.CLABE)
                                .clabeNumber("123456789012345678")
                                .reference("UMA-Q12345-REF")
                                .build()
                        )
                        .instructionsNotes(
                            "Please ensure the reference code is included in the payment memo/description field"
                        )
                        .build()
                )
                .addPaymentInstruction(
                    PaymentInstructions.builder()
                        .accountOrWalletInfo(
                            PaymentInstructions.AccountOrWalletInfo.PaymentClabeAccountInfo
                                .builder()
                                .accountType(PaymentAccountOrWalletInfo.AccountType.CLABE)
                                .clabeNumber("123456789012345678")
                                .reference("UMA-Q12345-REF")
                                .build()
                        )
                        .instructionsNotes(
                            "Please ensure the reference code is included in the payment memo/description field"
                        )
                        .build()
                )
                .sentAmount(
                    CurrencyAmount.builder()
                        .amount(12550L)
                        .currency(
                            Currency.builder()
                                .code("USD")
                                .decimals(2L)
                                .name("United States Dollar")
                                .symbol("\$")
                                .build()
                        )
                        .build()
                )
                .source(
                    SandboxSendFundsResponse.Source.AccountSource.builder()
                        .accountId("InternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                        .currency("USD")
                        .build()
                )
                .exchangeRate(1.08)
                .failureReason(SandboxSendFundsResponse.FailureReason.QUOTE_EXPIRED)
                .fees(10L)
                .originalTransactionId("Transaction:019542f5-b3e7-1d02-0000-000000000003")
                .quoteId("Quote:019542f5-b3e7-1d02-0000-000000000006")
                .rateDetails(
                    OutgoingRateDetails.builder()
                        .counterpartyFixedFee(10L)
                        .counterpartyMultiplier(1.08)
                        .gridApiFixedFee(10L)
                        .gridApiMultiplier(0.925)
                        .gridApiVariableFeeAmount(30.0)
                        .gridApiVariableFeeRate(0.003)
                        .build()
                )
                .receivedAmount(
                    CurrencyAmount.builder()
                        .amount(12550L)
                        .currency(
                            Currency.builder()
                                .code("USD")
                                .decimals(2L)
                                .name("United States Dollar")
                                .symbol("\$")
                                .build()
                        )
                        .build()
                )
                .refund(
                    SandboxSendFundsResponse.Refund.builder()
                        .initiatedAt(OffsetDateTime.parse("2025-08-15T14:30:00Z"))
                        .reference("UMA-Q12345-REFUND")
                        .settledAt(OffsetDateTime.parse("2025-08-15T14:30:00Z"))
                        .build()
                )
                .build()

        val roundtrippedSandboxSendFundsResponse =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(sandboxSendFundsResponse),
                jacksonTypeRef<SandboxSendFundsResponse>(),
            )

        assertThat(roundtrippedSandboxSendFundsResponse).isEqualTo(sandboxSendFundsResponse)
    }
}
