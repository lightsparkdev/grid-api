// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.umaproviders

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import com.grid.api.models.quotes.Currency
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class UmaProviderListResponseTest {

    @Test
    fun create() {
        val umaProviderListResponse =
            UmaProviderListResponse.builder()
                .allowListStatus(true)
                .domain("uma.me")
                .lei("5493001KJTIIGC8Y1R12")
                .logoUrl("https://uma.me/logo.png")
                .name("Lightspark Group")
                .addSupportedCurrency(
                    Currency.builder()
                        .code("USD")
                        .decimals(2L)
                        .name("United States Dollar")
                        .symbol("\$")
                        .build()
                )
                .addSupportedRegion("US")
                .build()

        assertThat(umaProviderListResponse.allowListStatus()).isEqualTo(true)
        assertThat(umaProviderListResponse.domain()).isEqualTo("uma.me")
        assertThat(umaProviderListResponse.lei()).isEqualTo("5493001KJTIIGC8Y1R12")
        assertThat(umaProviderListResponse.logoUrl()).isEqualTo("https://uma.me/logo.png")
        assertThat(umaProviderListResponse.name()).isEqualTo("Lightspark Group")
        assertThat(umaProviderListResponse.supportedCurrencies())
            .containsExactly(
                Currency.builder()
                    .code("USD")
                    .decimals(2L)
                    .name("United States Dollar")
                    .symbol("\$")
                    .build()
            )
        assertThat(umaProviderListResponse.supportedRegions()).containsExactly("US")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val umaProviderListResponse =
            UmaProviderListResponse.builder()
                .allowListStatus(true)
                .domain("uma.me")
                .lei("5493001KJTIIGC8Y1R12")
                .logoUrl("https://uma.me/logo.png")
                .name("Lightspark Group")
                .addSupportedCurrency(
                    Currency.builder()
                        .code("USD")
                        .decimals(2L)
                        .name("United States Dollar")
                        .symbol("\$")
                        .build()
                )
                .addSupportedRegion("US")
                .build()

        val roundtrippedUmaProviderListResponse =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(umaProviderListResponse),
                jacksonTypeRef<UmaProviderListResponse>(),
            )

        assertThat(roundtrippedUmaProviderListResponse).isEqualTo(umaProviderListResponse)
    }
}
