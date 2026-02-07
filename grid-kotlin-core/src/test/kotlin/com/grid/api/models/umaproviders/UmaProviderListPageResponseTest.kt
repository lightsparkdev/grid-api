// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.umaproviders

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import com.grid.api.models.quotes.Currency
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class UmaProviderListPageResponseTest {

    @Test
    fun create() {
        val umaProviderListPageResponse =
            UmaProviderListPageResponse.builder()
                .addData(
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
                )
                .hasMore(true)
                .nextCursor("nextCursor")
                .totalCount(0L)
                .build()

        assertThat(umaProviderListPageResponse.data())
            .containsExactly(
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
            )
        assertThat(umaProviderListPageResponse.hasMore()).isEqualTo(true)
        assertThat(umaProviderListPageResponse.nextCursor()).isEqualTo("nextCursor")
        assertThat(umaProviderListPageResponse.totalCount()).isEqualTo(0L)
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val umaProviderListPageResponse =
            UmaProviderListPageResponse.builder()
                .addData(
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
                )
                .hasMore(true)
                .nextCursor("nextCursor")
                .totalCount(0L)
                .build()

        val roundtrippedUmaProviderListPageResponse =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(umaProviderListPageResponse),
                jacksonTypeRef<UmaProviderListPageResponse>(),
            )

        assertThat(roundtrippedUmaProviderListPageResponse).isEqualTo(umaProviderListPageResponse)
    }
}
