// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.quotes

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import java.time.OffsetDateTime
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class QuoteListPageResponseTest {

    @Test
    fun create() {
        val quoteListPageResponse =
            QuoteListPageResponse.builder()
                .addData(
                    Quote.builder()
                        .createdAt(OffsetDateTime.parse("2025-10-03T12:00:00Z"))
                        .destination(
                            Quote.Destination.AccountDestination.builder()
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
                )
                .hasMore(true)
                .nextCursor("nextCursor")
                .totalCount(0L)
                .build()

        assertThat(quoteListPageResponse.data())
            .containsExactly(
                Quote.builder()
                    .createdAt(OffsetDateTime.parse("2025-10-03T12:00:00Z"))
                    .destination(
                        Quote.Destination.AccountDestination.builder()
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
            )
        assertThat(quoteListPageResponse.hasMore()).isEqualTo(true)
        assertThat(quoteListPageResponse.nextCursor()).isEqualTo("nextCursor")
        assertThat(quoteListPageResponse.totalCount()).isEqualTo(0L)
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val quoteListPageResponse =
            QuoteListPageResponse.builder()
                .addData(
                    Quote.builder()
                        .createdAt(OffsetDateTime.parse("2025-10-03T12:00:00Z"))
                        .destination(
                            Quote.Destination.AccountDestination.builder()
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
                )
                .hasMore(true)
                .nextCursor("nextCursor")
                .totalCount(0L)
                .build()

        val roundtrippedQuoteListPageResponse =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(quoteListPageResponse),
                jacksonTypeRef<QuoteListPageResponse>(),
            )

        assertThat(roundtrippedQuoteListPageResponse).isEqualTo(quoteListPageResponse)
    }
}
