// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.blocking

import com.grid.api.TestServerExtension
import com.grid.api.client.okhttp.GridOkHttpClient
import com.grid.api.models.receiver.ReceiverLookupExternalAccountParams
import com.grid.api.models.receiver.ReceiverLookupUmaParams
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(TestServerExtension::class)
internal class ReceiverServiceTest {

    @Disabled("Prism tests are disabled")
    @Test
    fun lookupExternalAccount() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .webhookSignature("My Webhook Signature")
                .build()
        val receiverService = client.receiver()

        val response =
            receiverService.lookupExternalAccount(
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
    fun lookupUma() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .webhookSignature("My Webhook Signature")
                .build()
        val receiverService = client.receiver()

        val response =
            receiverService.lookupUma(
                ReceiverLookupUmaParams.builder()
                    .receiverUmaAddress("receiverUmaAddress")
                    .customerId("customerId")
                    .senderUmaAddress("senderUmaAddress")
                    .build()
            )

        response.validate()
    }
}
