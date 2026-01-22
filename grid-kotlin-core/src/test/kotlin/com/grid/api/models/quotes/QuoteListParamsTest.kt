// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.quotes

import com.grid.api.core.http.QueryParams
import java.time.OffsetDateTime
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class QuoteListParamsTest {

    @Test
    fun create() {
        QuoteListParams.builder()
            .createdAfter(OffsetDateTime.parse("2019-12-27T18:11:19.117Z"))
            .createdBefore(OffsetDateTime.parse("2019-12-27T18:11:19.117Z"))
            .cursor("cursor")
            .customerId("customerId")
            .limit(1L)
            .receivingAccountId("receivingAccountId")
            .receivingUmaAddress("receivingUmaAddress")
            .sendingAccountId("sendingAccountId")
            .sendingUmaAddress("sendingUmaAddress")
            .status(QuoteListParams.Status.PENDING)
            .build()
    }

    @Test
    fun queryParams() {
        val params =
            QuoteListParams.builder()
                .createdAfter(OffsetDateTime.parse("2019-12-27T18:11:19.117Z"))
                .createdBefore(OffsetDateTime.parse("2019-12-27T18:11:19.117Z"))
                .cursor("cursor")
                .customerId("customerId")
                .limit(1L)
                .receivingAccountId("receivingAccountId")
                .receivingUmaAddress("receivingUmaAddress")
                .sendingAccountId("sendingAccountId")
                .sendingUmaAddress("sendingUmaAddress")
                .status(QuoteListParams.Status.PENDING)
                .build()

        val queryParams = params._queryParams()

        assertThat(queryParams)
            .isEqualTo(
                QueryParams.builder()
                    .put("createdAfter", "2019-12-27T18:11:19.117Z")
                    .put("createdBefore", "2019-12-27T18:11:19.117Z")
                    .put("cursor", "cursor")
                    .put("customerId", "customerId")
                    .put("limit", "1")
                    .put("receivingAccountId", "receivingAccountId")
                    .put("receivingUmaAddress", "receivingUmaAddress")
                    .put("sendingAccountId", "sendingAccountId")
                    .put("sendingUmaAddress", "sendingUmaAddress")
                    .put("status", "PENDING")
                    .build()
            )
    }

    @Test
    fun queryParamsWithoutOptionalFields() {
        val params = QuoteListParams.builder().build()

        val queryParams = params._queryParams()

        assertThat(queryParams).isEqualTo(QueryParams.builder().build())
    }
}
