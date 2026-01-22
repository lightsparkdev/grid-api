// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.blocking

import com.grid.api.TestServerExtension
import com.grid.api.client.okhttp.GridOkHttpClient
import com.grid.api.core.JsonValue
import com.grid.api.models.transactions.TransactionApproveParams
import com.grid.api.models.transactions.TransactionListParams
import com.grid.api.models.transactions.TransactionRejectParams
import com.grid.api.models.transactions.TransactionStatus
import com.grid.api.models.transactions.TransactionType
import java.time.OffsetDateTime
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

        val transactions =
            transactionService.list(
                TransactionListParams.builder()
                    .cursor("cursor")
                    .customerId("customerId")
                    .endDate(OffsetDateTime.parse("2019-12-27T18:11:19.117Z"))
                    .limit(1L)
                    .platformCustomerId("platformCustomerId")
                    .receiverAccountIdentifier("receiverAccountIdentifier")
                    .reference("reference")
                    .senderAccountIdentifier("senderAccountIdentifier")
                    .sortOrder(TransactionListParams.SortOrder.ASC)
                    .startDate(OffsetDateTime.parse("2019-12-27T18:11:19.117Z"))
                    .status(TransactionStatus.CREATED)
                    .type(TransactionType.INCOMING)
                    .build()
            )

        transactions.validate()
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
