// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.receiver

import com.grid.api.core.http.QueryParams
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class ReceiverLookupUmaParamsTest {

    @Test
    fun create() {
        ReceiverLookupUmaParams.builder()
            .receiverUmaAddress("receiverUmaAddress")
            .customerId("customerId")
            .senderUmaAddress("senderUmaAddress")
            .build()
    }

    @Test
    fun pathParams() {
        val params =
            ReceiverLookupUmaParams.builder().receiverUmaAddress("receiverUmaAddress").build()

        assertThat(params._pathParam(0)).isEqualTo("receiverUmaAddress")
        // out-of-bound path param
        assertThat(params._pathParam(1)).isEqualTo("")
    }

    @Test
    fun queryParams() {
        val params =
            ReceiverLookupUmaParams.builder()
                .receiverUmaAddress("receiverUmaAddress")
                .customerId("customerId")
                .senderUmaAddress("senderUmaAddress")
                .build()

        val queryParams = params._queryParams()

        assertThat(queryParams)
            .isEqualTo(
                QueryParams.builder()
                    .put("customerId", "customerId")
                    .put("senderUmaAddress", "senderUmaAddress")
                    .build()
            )
    }

    @Test
    fun queryParamsWithoutOptionalFields() {
        val params =
            ReceiverLookupUmaParams.builder().receiverUmaAddress("receiverUmaAddress").build()

        val queryParams = params._queryParams()

        assertThat(queryParams).isEqualTo(QueryParams.builder().build())
    }
}
