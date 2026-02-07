// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers

import com.grid.api.core.http.QueryParams
import java.time.OffsetDateTime
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class CustomerListParamsTest {

    @Test
    fun create() {
        CustomerListParams.builder()
            .createdAfter(OffsetDateTime.parse("2019-12-27T18:11:19.117Z"))
            .createdBefore(OffsetDateTime.parse("2019-12-27T18:11:19.117Z"))
            .cursor("cursor")
            .customerType(CustomerListParams.CustomerType.INDIVIDUAL)
            .isIncludingDeleted(true)
            .limit(1L)
            .platformCustomerId("platformCustomerId")
            .umaAddress("umaAddress")
            .updatedAfter(OffsetDateTime.parse("2019-12-27T18:11:19.117Z"))
            .updatedBefore(OffsetDateTime.parse("2019-12-27T18:11:19.117Z"))
            .build()
    }

    @Test
    fun queryParams() {
        val params =
            CustomerListParams.builder()
                .createdAfter(OffsetDateTime.parse("2019-12-27T18:11:19.117Z"))
                .createdBefore(OffsetDateTime.parse("2019-12-27T18:11:19.117Z"))
                .cursor("cursor")
                .customerType(CustomerListParams.CustomerType.INDIVIDUAL)
                .isIncludingDeleted(true)
                .limit(1L)
                .platformCustomerId("platformCustomerId")
                .umaAddress("umaAddress")
                .updatedAfter(OffsetDateTime.parse("2019-12-27T18:11:19.117Z"))
                .updatedBefore(OffsetDateTime.parse("2019-12-27T18:11:19.117Z"))
                .build()

        val queryParams = params._queryParams()

        assertThat(queryParams)
            .isEqualTo(
                QueryParams.builder()
                    .put("createdAfter", "2019-12-27T18:11:19.117Z")
                    .put("createdBefore", "2019-12-27T18:11:19.117Z")
                    .put("cursor", "cursor")
                    .put("customerType", "INDIVIDUAL")
                    .put("isIncludingDeleted", "true")
                    .put("limit", "1")
                    .put("platformCustomerId", "platformCustomerId")
                    .put("umaAddress", "umaAddress")
                    .put("updatedAfter", "2019-12-27T18:11:19.117Z")
                    .put("updatedBefore", "2019-12-27T18:11:19.117Z")
                    .build()
            )
    }

    @Test
    fun queryParamsWithoutOptionalFields() {
        val params = CustomerListParams.builder().build()

        val queryParams = params._queryParams()

        assertThat(queryParams).isEqualTo(QueryParams.builder().build())
    }
}
