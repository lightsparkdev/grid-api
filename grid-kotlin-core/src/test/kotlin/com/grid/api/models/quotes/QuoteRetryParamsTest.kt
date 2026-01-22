// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.quotes

import com.grid.api.core.JsonValue
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class QuoteRetryParamsTest {

    @Test
    fun create() {
        QuoteRetryParams.builder()
            .quoteId("quoteId")
            .lookupId("Lookup:019542f5-b3e7-1d02-0000-000000000009")
            .senderCustomerInfo(
                QuoteRetryParams.SenderCustomerInfo.builder()
                    .putAdditionalProperty("FULL_NAME", JsonValue.from("bar"))
                    .putAdditionalProperty("NATIONALITY", JsonValue.from("bar"))
                    .build()
            )
            .build()
    }

    @Test
    fun pathParams() {
        val params =
            QuoteRetryParams.builder()
                .quoteId("quoteId")
                .lookupId("Lookup:019542f5-b3e7-1d02-0000-000000000009")
                .build()

        assertThat(params._pathParam(0)).isEqualTo("quoteId")
        // out-of-bound path param
        assertThat(params._pathParam(1)).isEqualTo("")
    }

    @Test
    fun body() {
        val params =
            QuoteRetryParams.builder()
                .quoteId("quoteId")
                .lookupId("Lookup:019542f5-b3e7-1d02-0000-000000000009")
                .senderCustomerInfo(
                    QuoteRetryParams.SenderCustomerInfo.builder()
                        .putAdditionalProperty("FULL_NAME", JsonValue.from("bar"))
                        .putAdditionalProperty("NATIONALITY", JsonValue.from("bar"))
                        .build()
                )
                .build()

        val body = params._body()

        assertThat(body.lookupId()).isEqualTo("Lookup:019542f5-b3e7-1d02-0000-000000000009")
        assertThat(body.senderCustomerInfo())
            .isEqualTo(
                QuoteRetryParams.SenderCustomerInfo.builder()
                    .putAdditionalProperty("FULL_NAME", JsonValue.from("bar"))
                    .putAdditionalProperty("NATIONALITY", JsonValue.from("bar"))
                    .build()
            )
    }

    @Test
    fun bodyWithoutOptionalFields() {
        val params =
            QuoteRetryParams.builder()
                .quoteId("quoteId")
                .lookupId("Lookup:019542f5-b3e7-1d02-0000-000000000009")
                .build()

        val body = params._body()

        assertThat(body.lookupId()).isEqualTo("Lookup:019542f5-b3e7-1d02-0000-000000000009")
    }
}
