// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.transactions

import com.grid.api.core.JsonValue
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class TransactionApproveParamsTest {

    @Test
    fun create() {
        TransactionApproveParams.builder()
            .transactionId("transactionId")
            .receiverCustomerInfo(
                TransactionApproveParams.ReceiverCustomerInfo.builder()
                    .putAdditionalProperty("foo", JsonValue.from("bar"))
                    .build()
            )
            .build()
    }

    @Test
    fun pathParams() {
        val params = TransactionApproveParams.builder().transactionId("transactionId").build()

        assertThat(params._pathParam(0)).isEqualTo("transactionId")
        // out-of-bound path param
        assertThat(params._pathParam(1)).isEqualTo("")
    }

    @Test
    fun body() {
        val params =
            TransactionApproveParams.builder()
                .transactionId("transactionId")
                .receiverCustomerInfo(
                    TransactionApproveParams.ReceiverCustomerInfo.builder()
                        .putAdditionalProperty("foo", JsonValue.from("bar"))
                        .build()
                )
                .build()

        val body = params._body()

        assertThat(body.receiverCustomerInfo())
            .isEqualTo(
                TransactionApproveParams.ReceiverCustomerInfo.builder()
                    .putAdditionalProperty("foo", JsonValue.from("bar"))
                    .build()
            )
    }

    @Test
    fun bodyWithoutOptionalFields() {
        val params = TransactionApproveParams.builder().transactionId("transactionId").build()

        val body = params._body()
    }
}
