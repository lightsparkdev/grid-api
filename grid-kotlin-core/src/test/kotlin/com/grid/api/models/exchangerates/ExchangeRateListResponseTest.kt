// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.exchangerates

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import com.grid.api.models.quotes.Currency
import java.time.OffsetDateTime
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class ExchangeRateListResponseTest {

    @Test
    fun create() {
        val exchangeRateListResponse =
            ExchangeRateListResponse.builder()
                .addData(
                    ExchangeRateListResponse.Data.builder()
                        .destinationCurrency(
                            Currency.builder()
                                .code("USD")
                                .decimals(2L)
                                .name("United States Dollar")
                                .symbol("\$")
                                .build()
                        )
                        .destinationPaymentRail("UPI")
                        .exchangeRate(82.5)
                        .fees(ExchangeRateListResponse.Data.Fees.builder().fixed(100L).build())
                        .receivingAmount(1650000L)
                        .sourceCurrency(
                            Currency.builder()
                                .code("USD")
                                .decimals(2L)
                                .name("United States Dollar")
                                .symbol("\$")
                                .build()
                        )
                        .updatedAt(OffsetDateTime.parse("2025-02-05T12:00:00Z"))
                        .sendingAmount(10000L)
                        .sourcePaymentRail("ACCOUNT")
                        .build()
                )
                .build()

        assertThat(exchangeRateListResponse.data())
            .containsExactly(
                ExchangeRateListResponse.Data.builder()
                    .destinationCurrency(
                        Currency.builder()
                            .code("USD")
                            .decimals(2L)
                            .name("United States Dollar")
                            .symbol("\$")
                            .build()
                    )
                    .destinationPaymentRail("UPI")
                    .exchangeRate(82.5)
                    .fees(ExchangeRateListResponse.Data.Fees.builder().fixed(100L).build())
                    .receivingAmount(1650000L)
                    .sourceCurrency(
                        Currency.builder()
                            .code("USD")
                            .decimals(2L)
                            .name("United States Dollar")
                            .symbol("\$")
                            .build()
                    )
                    .updatedAt(OffsetDateTime.parse("2025-02-05T12:00:00Z"))
                    .sendingAmount(10000L)
                    .sourcePaymentRail("ACCOUNT")
                    .build()
            )
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val exchangeRateListResponse =
            ExchangeRateListResponse.builder()
                .addData(
                    ExchangeRateListResponse.Data.builder()
                        .destinationCurrency(
                            Currency.builder()
                                .code("USD")
                                .decimals(2L)
                                .name("United States Dollar")
                                .symbol("\$")
                                .build()
                        )
                        .destinationPaymentRail("UPI")
                        .exchangeRate(82.5)
                        .fees(ExchangeRateListResponse.Data.Fees.builder().fixed(100L).build())
                        .receivingAmount(1650000L)
                        .sourceCurrency(
                            Currency.builder()
                                .code("USD")
                                .decimals(2L)
                                .name("United States Dollar")
                                .symbol("\$")
                                .build()
                        )
                        .updatedAt(OffsetDateTime.parse("2025-02-05T12:00:00Z"))
                        .sendingAmount(10000L)
                        .sourcePaymentRail("ACCOUNT")
                        .build()
                )
                .build()

        val roundtrippedExchangeRateListResponse =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(exchangeRateListResponse),
                jacksonTypeRef<ExchangeRateListResponse>(),
            )

        assertThat(roundtrippedExchangeRateListResponse).isEqualTo(exchangeRateListResponse)
    }
}
