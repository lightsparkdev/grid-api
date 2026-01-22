// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.umaproviders

import com.grid.api.core.http.QueryParams
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class UmaProviderListParamsTest {

    @Test
    fun create() {
        UmaProviderListParams.builder()
            .countryCode("US")
            .currencyCode("USD")
            .cursor("cursor")
            .hasBlockedProviders(true)
            .limit(1L)
            .sortOrder(UmaProviderListParams.SortOrder.ASC)
            .build()
    }

    @Test
    fun queryParams() {
        val params =
            UmaProviderListParams.builder()
                .countryCode("US")
                .currencyCode("USD")
                .cursor("cursor")
                .hasBlockedProviders(true)
                .limit(1L)
                .sortOrder(UmaProviderListParams.SortOrder.ASC)
                .build()

        val queryParams = params._queryParams()

        assertThat(queryParams)
            .isEqualTo(
                QueryParams.builder()
                    .put("countryCode", "US")
                    .put("currencyCode", "USD")
                    .put("cursor", "cursor")
                    .put("hasBlockedProviders", "true")
                    .put("limit", "1")
                    .put("sortOrder", "asc")
                    .build()
            )
    }

    @Test
    fun queryParamsWithoutOptionalFields() {
        val params = UmaProviderListParams.builder().build()

        val queryParams = params._queryParams()

        assertThat(queryParams).isEqualTo(QueryParams.builder().build())
    }
}
