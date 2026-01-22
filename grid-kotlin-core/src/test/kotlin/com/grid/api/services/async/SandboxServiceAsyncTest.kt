// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.async

import com.grid.api.TestServerExtension
import com.grid.api.client.okhttp.GridOkHttpClientAsync
import com.grid.api.models.sandbox.SandboxSendFundsParams
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(TestServerExtension::class)
internal class SandboxServiceAsyncTest {

    @Disabled("Prism tests are disabled")
    @Test
    suspend fun sendFunds() {
        val client =
            GridOkHttpClientAsync.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .webhookSignature("My Webhook Signature")
                .build()
        val sandboxServiceAsync = client.sandbox()

        val response =
            sandboxServiceAsync.sendFunds(
                SandboxSendFundsParams.builder()
                    .currencyCode("USD")
                    .quoteId("Quote:019542f5-b3e7-1d02-0000-000000000006")
                    .currencyAmount(1000L)
                    .build()
            )

        response.validate()
    }
}
