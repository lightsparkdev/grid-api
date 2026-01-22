// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class CustomerDeleteParamsTest {

    @Test
    fun create() {
        CustomerDeleteParams.builder().customerId("customerId").build()
    }

    @Test
    fun pathParams() {
        val params = CustomerDeleteParams.builder().customerId("customerId").build()

        assertThat(params._pathParam(0)).isEqualTo("customerId")
        // out-of-bound path param
        assertThat(params._pathParam(1)).isEqualTo("")
    }
}
