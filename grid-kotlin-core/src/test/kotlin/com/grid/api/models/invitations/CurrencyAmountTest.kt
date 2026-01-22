// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.invitations

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import com.grid.api.models.quotes.Currency
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class CurrencyAmountTest {

    @Test
    fun create() {
        val currencyAmount =
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

        assertThat(currencyAmount.amount()).isEqualTo(12550L)
        assertThat(currencyAmount.currency())
            .isEqualTo(
                Currency.builder()
                    .code("USD")
                    .decimals(2L)
                    .name("United States Dollar")
                    .symbol("\$")
                    .build()
            )
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val currencyAmount =
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

        val roundtrippedCurrencyAmount =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(currencyAmount),
                jacksonTypeRef<CurrencyAmount>(),
            )

        assertThat(roundtrippedCurrencyAmount).isEqualTo(currencyAmount)
    }
}
