// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.grid.api.core.http.QueryParams
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class ExternalAccountListParamsTest {

    @Test
    fun create() {
        ExternalAccountListParams.builder()
            .currency("currency")
            .cursor("cursor")
            .customerId("customerId")
            .limit(1L)
            .build()
    }

    @Test
    fun queryParams() {
        val params =
            ExternalAccountListParams.builder()
                .currency("currency")
                .cursor("cursor")
                .customerId("customerId")
                .limit(1L)
                .build()

        val queryParams = params._queryParams()

        assertThat(queryParams)
            .isEqualTo(
                QueryParams.builder()
                    .put("currency", "currency")
                    .put("cursor", "cursor")
                    .put("customerId", "customerId")
                    .put("limit", "1")
                    .build()
            )
    }

    @Test
    fun queryParamsWithoutOptionalFields() {
        val params = ExternalAccountListParams.builder().build()

        val queryParams = params._queryParams()

        assertThat(queryParams).isEqualTo(QueryParams.builder().build())
    }
}
