// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.quotes

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class CurrencyTest {

    @Test
    fun create() {
        val currency =
            Currency.builder()
                .code("USD")
                .decimals(2L)
                .name("United States Dollar")
                .symbol("\$")
                .build()

        assertThat(currency.code()).isEqualTo("USD")
        assertThat(currency.decimals()).isEqualTo(2L)
        assertThat(currency.name()).isEqualTo("United States Dollar")
        assertThat(currency.symbol()).isEqualTo("\$")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val currency =
            Currency.builder()
                .code("USD")
                .decimals(2L)
                .name("United States Dollar")
                .symbol("\$")
                .build()

        val roundtrippedCurrency =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(currency),
                jacksonTypeRef<Currency>(),
            )

        assertThat(roundtrippedCurrency).isEqualTo(currency)
    }
}
