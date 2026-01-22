// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.blocking

import com.grid.api.TestServerExtension
import com.grid.api.client.okhttp.GridOkHttpClient
import com.grid.api.models.platform.PlatformListInternalAccountsParams
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(TestServerExtension::class)
internal class PlatformServiceTest {

    @Disabled("Prism tests are disabled")
    @Test
    fun listInternalAccounts() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val platformService = client.platform()

        val response =
            platformService.listInternalAccounts(
                PlatformListInternalAccountsParams.builder().currency("currency").build()
            )

        response.validate()
    }
}
