// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.async

import com.grid.api.TestServerExtension
import com.grid.api.client.okhttp.GridOkHttpClientAsync
import com.grid.api.models.umaproviders.UmaProviderListParams
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(TestServerExtension::class)
internal class UmaProviderServiceAsyncTest {

    @Disabled("Prism tests are disabled")
    @Test
    suspend fun list() {
        val client =
            GridOkHttpClientAsync.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .webhookSignature("My Webhook Signature")
                .build()
        val umaProviderServiceAsync = client.umaProviders()

        val umaProviders =
            umaProviderServiceAsync.list(
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
