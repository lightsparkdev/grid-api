// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.blocking

import com.grid.api.TestServerExtension
import com.grid.api.client.okhttp.GridOkHttpClient
import com.grid.api.models.exchangerates.ExchangeRateListParams
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(TestServerExtension::class)
internal class ExchangeRateServiceTest {

    @Disabled("Prism tests are disabled")
    @Test
    fun list() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val exchangeRateService = client.exchangeRates()

        val exchangeRates =
            exchangeRateService.list(
                ExchangeRateListParams.builder()
                    .addDestinationCurrency("string")
                    .sendingAmount(0L)
                    .sourceCurrency("sourceCurrency")
                    .build()
            )

        exchangeRates.validate()
    }
}
