// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.async.sandbox

import com.grid.api.TestServerExtension
import com.grid.api.client.okhttp.GridOkHttpClientAsync
import com.grid.api.models.sandbox.uma.UmaReceivePaymentParams
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(TestServerExtension::class)
internal class UmaServiceAsyncTest {

    @Disabled("Prism tests are disabled")
    @Test
    suspend fun receivePayment() {
        val client =
            GridOkHttpClientAsync.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .webhookSignature("My Webhook Signature")
                .build()
        val umaServiceAsync = client.sandbox().uma()

        val incomingTransaction =
            umaServiceAsync.receivePayment(
                UmaReceivePaymentParams.builder()
                    .receivingCurrencyAmount(1000L)
                    .receivingCurrencyCode("USD")
                    .senderUmaAddress("\$success.usd@sandbox.grid.uma.money")
                    .customerId("Customer:019542f5-b3e7-1d02-0000-000000000001")
                    .receiverUmaAddress("\$receiver@uma.domain")
                    .build()
            )

        incomingTransaction.validate()
    }
}
