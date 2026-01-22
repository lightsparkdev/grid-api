// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.transactions

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class TransactionRetrieveParamsTest {

    @Test
    fun create() {
        TransactionRetrieveParams.builder().transactionId("transactionId").build()
    }

    @Test
    fun pathParams() {
        val params = TransactionRetrieveParams.builder().transactionId("transactionId").build()

        assertThat(params._pathParam(0)).isEqualTo("transactionId")
        // out-of-bound path param
        assertThat(params._pathParam(1)).isEqualTo("")
    }
}
