// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.quotes

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import java.time.OffsetDateTime
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class QuoteTest {

    @Test
    fun create() {
        val quote =
            Quote.builder()
                .createdAt(OffsetDateTime.parse("2025-10-03T12:00:00Z"))
                .destination(
                    Quote.Destination.Account.builder()
                        .accountId("ExternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                        .currency("EUR")
                        .build()
                )
                .exchangeRate(1.0)
                .expiresAt(OffsetDateTime.parse("2025-10-03T12:05:00Z"))
                .feesIncluded(10L)
                .quoteId("Quote:019542f5-b3e7-1d02-0000-000000000006")
                .receivingCurrency(
                    Currency.builder()
                        .code("USD")
                        .decimals(2L)
                        .name("United States Dollar")
                        .symbol("\$")
                        .build()
                )
                .sendingCurrency(
                    Currency.builder()
                        .code("USD")
                        .decimals(2L)
                        .name("United States Dollar")
                        .symbol("\$")
                        .build()
                )
                .source(
                    QuoteSource.Account.builder()
                        .accountId("InternalAccount:85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                        .currency("USD")
                        .build()
                )
                .status(Quote.Status.PENDING)
                .totalReceivingAmount(1000L)
                .totalSendingAmount(123010L)
                .transactionId("Transaction:019542f5-b3e7-1d02-0000-000000000005")
                .originalQuoteId("Quote:019542f5-b3e7-1d02-0000-000000000001")
                .addPaymentInstruction(
                    PaymentInstructions.builder()
                        .accountOrWalletInfo(
                            PaymentInstructions.AccountOrWalletInfo.Clabe.builder()
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
                            PaymentInstructions.AccountOrWalletInfo.Clabe.builder()
                                .clabeNumber("123456789012345678")
                                .reference("UMA-Q12345-REF")
                                .build()
                        )
                        .instructionsNotes(
                            "Please ensure the reference code is included in the payment memo/description field"
                        )
                        .build()
                )
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
                .build()

        assertThat(quote.createdAt()).isEqualTo(OffsetDateTime.parse("2025-10-03T12:00:00Z"))
        assertThat(quote.destination())
            .isEqualTo(
                Quote.Destination.ofAccount(
                    Quote.Destination.Account.builder()
                        .accountId("ExternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                        .currency("EUR")
                        .build()
                )
            )
        assertThat(quote.exchangeRate()).isEqualTo(1.0)
        assertThat(quote.expiresAt()).isEqualTo(OffsetDateTime.parse("2025-10-03T12:05:00Z"))
        assertThat(quote.feesIncluded()).isEqualTo(10L)
        assertThat(quote.quoteId()).isEqualTo("Quote:019542f5-b3e7-1d02-0000-000000000006")
        assertThat(quote.receivingCurrency())
            .isEqualTo(
                Currency.builder()
                    .code("USD")
                    .decimals(2L)
                    .name("United States Dollar")
                    .symbol("\$")
                    .build()
            )
        assertThat(quote.sendingCurrency())
            .isEqualTo(
                Currency.builder()
                    .code("USD")
                    .decimals(2L)
                    .name("United States Dollar")
                    .symbol("\$")
                    .build()
            )
        assertThat(quote.source())
            .isEqualTo(
                QuoteSource.ofAccount(
                    QuoteSource.Account.builder()
                        .accountId("InternalAccount:85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                        .currency("USD")
                        .build()
                )
            )
        assertThat(quote.status()).isEqualTo(Quote.Status.PENDING)
        assertThat(quote.totalReceivingAmount()).isEqualTo(1000L)
        assertThat(quote.totalSendingAmount()).isEqualTo(123010L)
        assertThat(quote.transactionId())
            .isEqualTo("Transaction:019542f5-b3e7-1d02-0000-000000000005")
        assertThat(quote.originalQuoteId()).isEqualTo("Quote:019542f5-b3e7-1d02-0000-000000000001")
        assertThat(quote.paymentInstructions())
            .containsExactly(
                PaymentInstructions.builder()
                    .accountOrWalletInfo(
                        PaymentInstructions.AccountOrWalletInfo.Clabe.builder()
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
                        PaymentInstructions.AccountOrWalletInfo.Clabe.builder()
                            .clabeNumber("123456789012345678")
                            .reference("UMA-Q12345-REF")
                            .build()
                    )
                    .instructionsNotes(
                        "Please ensure the reference code is included in the payment memo/description field"
                    )
                    .build(),
            )
        assertThat(quote.rateDetails())
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
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val quote =
            Quote.builder()
                .createdAt(OffsetDateTime.parse("2025-10-03T12:00:00Z"))
                .destination(
                    Quote.Destination.Account.builder()
                        .accountId("ExternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                        .currency("EUR")
                        .build()
                )
                .exchangeRate(1.0)
                .expiresAt(OffsetDateTime.parse("2025-10-03T12:05:00Z"))
                .feesIncluded(10L)
                .quoteId("Quote:019542f5-b3e7-1d02-0000-000000000006")
                .receivingCurrency(
                    Currency.builder()
                        .code("USD")
                        .decimals(2L)
                        .name("United States Dollar")
                        .symbol("\$")
                        .build()
                )
                .sendingCurrency(
                    Currency.builder()
                        .code("USD")
                        .decimals(2L)
                        .name("United States Dollar")
                        .symbol("\$")
                        .build()
                )
                .source(
                    QuoteSource.Account.builder()
                        .accountId("InternalAccount:85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                        .currency("USD")
                        .build()
                )
                .status(Quote.Status.PENDING)
                .totalReceivingAmount(1000L)
                .totalSendingAmount(123010L)
                .transactionId("Transaction:019542f5-b3e7-1d02-0000-000000000005")
                .originalQuoteId("Quote:019542f5-b3e7-1d02-0000-000000000001")
                .addPaymentInstruction(
                    PaymentInstructions.builder()
                        .accountOrWalletInfo(
                            PaymentInstructions.AccountOrWalletInfo.Clabe.builder()
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
                            PaymentInstructions.AccountOrWalletInfo.Clabe.builder()
                                .clabeNumber("123456789012345678")
                                .reference("UMA-Q12345-REF")
                                .build()
                        )
                        .instructionsNotes(
                            "Please ensure the reference code is included in the payment memo/description field"
                        )
                        .build()
                )
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
                .build()

        val roundtrippedQuote =
            jsonMapper.readValue(jsonMapper.writeValueAsString(quote), jacksonTypeRef<Quote>())

        assertThat(roundtrippedQuote).isEqualTo(quote)
    }
}
