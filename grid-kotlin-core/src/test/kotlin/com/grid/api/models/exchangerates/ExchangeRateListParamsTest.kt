// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.exchangerates

import com.grid.api.core.http.QueryParams
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class ExchangeRateListParamsTest {

    @Test
    fun create() {
        ExchangeRateListParams.builder()
            .addDestinationCurrency("string")
            .sendingAmount(0L)
            .sourceCurrency("sourceCurrency")
            .build()
    }

    @Test
    fun queryParams() {
        val params =
            ExchangeRateListParams.builder()
                .addDestinationCurrency("string")
                .sendingAmount(0L)
                .sourceCurrency("sourceCurrency")
                .build()

        val queryParams = params._queryParams()

        assertThat(queryParams)
            .isEqualTo(
                QueryParams.builder()
                    .put("destinationCurrency", listOf("string").joinToString(","))
                    .put("sendingAmount", "0")
                    .put("sourceCurrency", "sourceCurrency")
                    .build()
            )
    }

    @Test
    fun queryParamsWithoutOptionalFields() {
        val params = ExchangeRateListParams.builder().build()

        val queryParams = params._queryParams()

        assertThat(queryParams).isEqualTo(QueryParams.builder().build())
    }
}
