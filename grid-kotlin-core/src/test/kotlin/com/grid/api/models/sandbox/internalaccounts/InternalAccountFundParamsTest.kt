// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.sandbox.internalaccounts

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class InternalAccountFundParamsTest {

    @Test
    fun create() {
        InternalAccountFundParams.builder()
            .accountId("InternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
            .amount(100000L)
            .build()
    }

    @Test
    fun pathParams() {
        val params =
            InternalAccountFundParams.builder()
                .accountId("InternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                .amount(100000L)
                .build()

        assertThat(params._pathParam(0))
            .isEqualTo("InternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
        // out-of-bound path param
        assertThat(params._pathParam(1)).isEqualTo("")
    }

    @Test
    fun body() {
        val params =
            InternalAccountFundParams.builder()
                .accountId("InternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                .amount(100000L)
                .build()

        val body = params._body()

        assertThat(body.amount()).isEqualTo(100000L)
    }
}
