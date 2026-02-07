// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.plaid

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class PlaidCreateLinkTokenParamsTest {

    @Test
    fun create() {
        PlaidCreateLinkTokenParams.builder()
            .customerId("Customer:019542f5-b3e7-1d02-0000-000000000001")
            .build()
    }

    @Test
    fun body() {
        val params =
            PlaidCreateLinkTokenParams.builder()
                .customerId("Customer:019542f5-b3e7-1d02-0000-000000000001")
                .build()

        val body = params._body()

        assertThat(body.customerId()).isEqualTo("Customer:019542f5-b3e7-1d02-0000-000000000001")
    }
}
