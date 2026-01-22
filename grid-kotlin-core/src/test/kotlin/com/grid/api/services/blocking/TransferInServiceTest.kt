// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.blocking

import com.grid.api.TestServerExtension
import com.grid.api.client.okhttp.GridOkHttpClient
import com.grid.api.models.transferin.TransferInCreateParams
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(TestServerExtension::class)
internal class TransferInServiceTest {

    @Disabled("Prism tests are disabled")
    @Test
    fun create() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .webhookSignature("My Webhook Signature")
                .build()
        val transferInService = client.transferIn()

        val transaction =
            transferInService.create(
                TransferInCreateParams.builder()
                    .destination(
                        TransferInCreateParams.Destination.builder()
                            .accountId("InternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                            .build()
                    )
                    .source(
                        TransferInCreateParams.Source.builder()
                            .accountId("ExternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                            .build()
                    )
                    .amount(12550L)
                    .build()
            )

        transaction.validate()
    }
}
