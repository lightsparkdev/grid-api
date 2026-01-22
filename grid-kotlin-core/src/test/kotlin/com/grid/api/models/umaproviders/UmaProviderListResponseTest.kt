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
                .addData(
                    UmaProviderListResponse.Data.builder()
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
                )
                .hasMore(true)
                .nextCursor("nextCursor")
                .totalCount(0L)
                .build()

        assertThat(umaProviderListResponse.data())
            .containsExactly(
                UmaProviderListResponse.Data.builder()
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
            )
        assertThat(umaProviderListResponse.hasMore()).isEqualTo(true)
        assertThat(umaProviderListResponse.nextCursor()).isEqualTo("nextCursor")
        assertThat(umaProviderListResponse.totalCount()).isEqualTo(0L)
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val umaProviderListResponse =
            UmaProviderListResponse.builder()
                .addData(
                    UmaProviderListResponse.Data.builder()
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
                )
                .hasMore(true)
                .nextCursor("nextCursor")
                .totalCount(0L)
                .build()

        val roundtrippedUmaProviderListResponse =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(umaProviderListResponse),
                jacksonTypeRef<UmaProviderListResponse>(),
            )

        assertThat(roundtrippedUmaProviderListResponse).isEqualTo(umaProviderListResponse)
    }
}
