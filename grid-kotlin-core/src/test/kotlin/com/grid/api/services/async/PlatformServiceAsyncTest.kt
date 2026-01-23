// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.async

import com.grid.api.TestServerExtension
import com.grid.api.client.okhttp.GridOkHttpClientAsync
import com.grid.api.models.platform.PlatformListInternalAccountsParams
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(TestServerExtension::class)
internal class PlatformServiceAsyncTest {

    @Disabled("Prism tests are disabled")
    @Test
    suspend fun listInternalAccounts() {
        val client =
            GridOkHttpClientAsync.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val platformServiceAsync = client.platform()

        val response =
            platformServiceAsync.listInternalAccounts(
                PlatformListInternalAccountsParams.builder().currency("currency").build()
            )

        response.validate()
    }
}
