// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.blocking

import com.grid.api.TestServerExtension
import com.grid.api.client.okhttp.GridOkHttpClient
import com.grid.api.core.JsonValue
import com.grid.api.models.transactions.TransactionApproveParams
import com.grid.api.models.transactions.TransactionRejectParams
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(TestServerExtension::class)
internal class TransactionServiceTest {

    @Disabled("Prism tests are disabled")
    @Test
    fun retrieve() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val transactionService = client.transactions()

        val transaction = transactionService.retrieve("transactionId")

        transaction.validate()
    }

    @Disabled("Prism tests are disabled")
    @Test
    fun list() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val transactionService = client.transactions()

        val page = transactionService.list()

        page.response().validate()
    }

    @Disabled("Prism tests are disabled")
    @Test
    fun approve() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val transactionService = client.transactions()

        val incomingTransaction =
            transactionService.approve(
                TransactionApproveParams.builder()
                    .transactionId("transactionId")
                    .receiverCustomerInfo(
                        TransactionApproveParams.ReceiverCustomerInfo.builder()
                            .putAdditionalProperty("foo", JsonValue.from("bar"))
                            .build()
                    )
                    .build()
            )

        incomingTransaction.validate()
    }

    @Disabled("Prism tests are disabled")
    @Test
    fun reject() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val transactionService = client.transactions()

        val incomingTransaction =
            transactionService.reject(
                TransactionRejectParams.builder()
                    .transactionId("transactionId")
                    .reason("RESTRICTED_JURISDICTION")
                    .build()
            )

        incomingTransaction.validate()
    }
}
