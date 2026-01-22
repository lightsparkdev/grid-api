// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.transactions

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class TransactionRejectParamsTest {

    @Test
    fun create() {
        TransactionRejectParams.builder()
            .transactionId("transactionId")
            .reason("RESTRICTED_JURISDICTION")
            .build()
    }

    @Test
    fun pathParams() {
        val params = TransactionRejectParams.builder().transactionId("transactionId").build()

        assertThat(params._pathParam(0)).isEqualTo("transactionId")
        // out-of-bound path param
        assertThat(params._pathParam(1)).isEqualTo("")
    }

    @Test
    fun body() {
        val params =
            TransactionRejectParams.builder()
                .transactionId("transactionId")
                .reason("RESTRICTED_JURISDICTION")
                .build()

        val body = params._body()

        assertThat(body.reason()).isEqualTo("RESTRICTED_JURISDICTION")
    }

    @Test
    fun bodyWithoutOptionalFields() {
        val params = TransactionRejectParams.builder().transactionId("transactionId").build()

        val body = params._body()
    }
}
