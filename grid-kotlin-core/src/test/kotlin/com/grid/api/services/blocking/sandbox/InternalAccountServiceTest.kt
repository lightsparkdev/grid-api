// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.blocking.sandbox

import com.grid.api.TestServerExtension
import com.grid.api.client.okhttp.GridOkHttpClient
import com.grid.api.models.sandbox.internalaccounts.InternalAccountFundParams
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(TestServerExtension::class)
internal class InternalAccountServiceTest {

    @Disabled("Prism tests are disabled")
    @Test
    fun fund() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val internalAccountService = client.sandbox().internalAccounts()

        val internalAccount =
            internalAccountService.fund(
                InternalAccountFundParams.builder()
                    .accountId("InternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                    .amount(100000L)
                    .build()
            )

        internalAccount.validate()
    }
}
