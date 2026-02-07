// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.tokens

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class TokenDeleteParamsTest {

    @Test
    fun create() {
        TokenDeleteParams.builder().tokenId("tokenId").build()
    }

    @Test
    fun pathParams() {
        val params = TokenDeleteParams.builder().tokenId("tokenId").build()

        assertThat(params._pathParam(0)).isEqualTo("tokenId")
        // out-of-bound path param
        assertThat(params._pathParam(1)).isEqualTo("")
    }
}
