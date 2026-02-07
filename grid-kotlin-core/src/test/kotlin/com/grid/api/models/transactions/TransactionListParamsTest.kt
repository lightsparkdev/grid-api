// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.transactions

import com.grid.api.core.http.QueryParams
import java.time.OffsetDateTime
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class TransactionListParamsTest {

    @Test
    fun create() {
        TransactionListParams.builder()
            .cursor("cursor")
            .customerId("customerId")
            .endDate(OffsetDateTime.parse("2019-12-27T18:11:19.117Z"))
            .limit(1L)
            .platformCustomerId("platformCustomerId")
            .receiverAccountIdentifier("receiverAccountIdentifier")
            .reference("reference")
            .senderAccountIdentifier("senderAccountIdentifier")
            .sortOrder(TransactionListParams.SortOrder.ASC)
            .startDate(OffsetDateTime.parse("2019-12-27T18:11:19.117Z"))
            .status(TransactionStatus.CREATED)
            .type(TransactionType.INCOMING)
            .build()
    }

    @Test
    fun queryParams() {
        val params =
            TransactionListParams.builder()
                .cursor("cursor")
                .customerId("customerId")
                .endDate(OffsetDateTime.parse("2019-12-27T18:11:19.117Z"))
                .limit(1L)
                .platformCustomerId("platformCustomerId")
                .receiverAccountIdentifier("receiverAccountIdentifier")
                .reference("reference")
                .senderAccountIdentifier("senderAccountIdentifier")
                .sortOrder(TransactionListParams.SortOrder.ASC)
                .startDate(OffsetDateTime.parse("2019-12-27T18:11:19.117Z"))
                .status(TransactionStatus.CREATED)
                .type(TransactionType.INCOMING)
                .build()

        val queryParams = params._queryParams()

        assertThat(queryParams)
            .isEqualTo(
                QueryParams.builder()
                    .put("cursor", "cursor")
                    .put("customerId", "customerId")
                    .put("endDate", "2019-12-27T18:11:19.117Z")
                    .put("limit", "1")
                    .put("platformCustomerId", "platformCustomerId")
                    .put("receiverAccountIdentifier", "receiverAccountIdentifier")
                    .put("reference", "reference")
                    .put("senderAccountIdentifier", "senderAccountIdentifier")
                    .put("sortOrder", "asc")
                    .put("startDate", "2019-12-27T18:11:19.117Z")
                    .put("status", "CREATED")
                    .put("type", "INCOMING")
                    .build()
            )
    }

    @Test
    fun queryParamsWithoutOptionalFields() {
        val params = TransactionListParams.builder().build()

        val queryParams = params._queryParams()

        assertThat(queryParams).isEqualTo(QueryParams.builder().build())
    }
}
