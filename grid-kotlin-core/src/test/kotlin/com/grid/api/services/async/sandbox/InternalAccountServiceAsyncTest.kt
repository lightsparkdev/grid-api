// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.async.sandbox

import com.grid.api.TestServerExtension
import com.grid.api.client.okhttp.GridOkHttpClientAsync
import com.grid.api.models.sandbox.internalaccounts.InternalAccountFundParams
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(TestServerExtension::class)
internal class InternalAccountServiceAsyncTest {

    @Disabled("Prism tests are disabled")
    @Test
    suspend fun fund() {
        val client =
            GridOkHttpClientAsync.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .webhookSignature("My Webhook Signature")
                .build()
        val internalAccountServiceAsync = client.sandbox().internalAccounts()

        val internalAccount =
            internalAccountServiceAsync.fund(
                InternalAccountFundParams.builder()
                    .accountId("InternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                    .amount(100000L)
                    .build()
            )

        internalAccount.validate()
    }
}
