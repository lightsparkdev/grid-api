// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.blocking

import com.grid.api.TestServerExtension
import com.grid.api.client.okhttp.GridOkHttpClient
import com.grid.api.models.umaproviders.UmaProviderListParams
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(TestServerExtension::class)
internal class UmaProviderServiceTest {

    @Disabled("Prism tests are disabled")
    @Test
    fun list() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val umaProviderService = client.umaProviders()

        val umaProviders =
            umaProviderService.list(
                UmaProviderListParams.builder()
                    .countryCode("US")
                    .currencyCode("USD")
                    .cursor("cursor")
                    .hasBlockedProviders(true)
                    .limit(1L)
                    .sortOrder(UmaProviderListParams.SortOrder.ASC)
                    .build()
            )

        umaProviders.validate()
    }
}
