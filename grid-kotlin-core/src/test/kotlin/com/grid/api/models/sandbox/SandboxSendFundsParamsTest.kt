// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.sandbox

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class SandboxSendFundsParamsTest {

    @Test
    fun create() {
        SandboxSendFundsParams.builder()
            .currencyCode("USD")
            .quoteId("Quote:019542f5-b3e7-1d02-0000-000000000006")
            .currencyAmount(1000L)
            .build()
    }

    @Test
    fun body() {
        val params =
            SandboxSendFundsParams.builder()
                .currencyCode("USD")
                .quoteId("Quote:019542f5-b3e7-1d02-0000-000000000006")
                .currencyAmount(1000L)
                .build()

        val body = params._body()

        assertThat(body.currencyCode()).isEqualTo("USD")
        assertThat(body.quoteId()).isEqualTo("Quote:019542f5-b3e7-1d02-0000-000000000006")
        assertThat(body.currencyAmount()).isEqualTo(1000L)
    }

    @Test
    fun bodyWithoutOptionalFields() {
        val params =
            SandboxSendFundsParams.builder()
                .currencyCode("USD")
                .quoteId("Quote:019542f5-b3e7-1d02-0000-000000000006")
                .build()

        val body = params._body()

        assertThat(body.currencyCode()).isEqualTo("USD")
        assertThat(body.quoteId()).isEqualTo("Quote:019542f5-b3e7-1d02-0000-000000000006")
    }
}
