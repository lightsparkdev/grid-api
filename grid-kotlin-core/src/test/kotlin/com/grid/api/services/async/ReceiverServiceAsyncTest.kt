// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.async

import com.grid.api.TestServerExtension
import com.grid.api.client.okhttp.GridOkHttpClientAsync
import com.grid.api.models.receiver.ReceiverLookupExternalAccountParams
import com.grid.api.models.receiver.ReceiverLookupUmaParams
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(TestServerExtension::class)
internal class ReceiverServiceAsyncTest {

    @Disabled("Prism tests are disabled")
    @Test
    suspend fun lookupExternalAccount() {
        val client =
            GridOkHttpClientAsync.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val receiverServiceAsync = client.receiver()

        val response =
            receiverServiceAsync.lookupExternalAccount(
                ReceiverLookupExternalAccountParams.builder()
                    .accountId("ExternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                    .customerId("customerId")
                    .senderUmaAddress("senderUmaAddress")
                    .build()
            )

        response.validate()
    }

    @Disabled("Prism tests are disabled")
    @Test
    suspend fun lookupUma() {
        val client =
            GridOkHttpClientAsync.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val receiverServiceAsync = client.receiver()

        val response =
            receiverServiceAsync.lookupUma(
                ReceiverLookupUmaParams.builder()
                    .receiverUmaAddress("receiverUmaAddress")
                    .customerId("customerId")
                    .senderUmaAddress("senderUmaAddress")
                    .build()
            )

        response.validate()
    }
}
