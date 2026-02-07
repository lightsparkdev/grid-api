// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.quotes

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class QuoteRetrieveParamsTest {

    @Test
    fun create() {
        QuoteRetrieveParams.builder().quoteId("quoteId").build()
    }

    @Test
    fun pathParams() {
        val params = QuoteRetrieveParams.builder().quoteId("quoteId").build()

        assertThat(params._pathParam(0)).isEqualTo("quoteId")
        // out-of-bound path param
        assertThat(params._pathParam(1)).isEqualTo("")
    }
}
