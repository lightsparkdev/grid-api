// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.async

import com.grid.api.TestServerExtension
import com.grid.api.client.okhttp.GridOkHttpClientAsync
import com.grid.api.models.exchangerates.ExchangeRateListParams
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(TestServerExtension::class)
internal class ExchangeRateServiceAsyncTest {

    @Disabled("Prism tests are disabled")
    @Test
    suspend fun list() {
        val client =
            GridOkHttpClientAsync.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val exchangeRateServiceAsync = client.exchangeRates()

        val exchangeRates =
            exchangeRateServiceAsync.list(
                ExchangeRateListParams.builder()
                    .addDestinationCurrency("string")
                    .sendingAmount(0L)
                    .sourceCurrency("sourceCurrency")
                    .build()
            )

        exchangeRates.validate()
    }
}
