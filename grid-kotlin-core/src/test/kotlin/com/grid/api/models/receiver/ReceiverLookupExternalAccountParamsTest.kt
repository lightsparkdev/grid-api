// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.receiver

import com.grid.api.core.http.QueryParams
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class ReceiverLookupExternalAccountParamsTest {

    @Test
    fun create() {
        ReceiverLookupExternalAccountParams.builder()
            .accountId("ExternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
            .customerId("customerId")
            .senderUmaAddress("senderUmaAddress")
            .build()
    }

    @Test
    fun pathParams() {
        val params =
            ReceiverLookupExternalAccountParams.builder()
                .accountId("ExternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                .build()

        assertThat(params._pathParam(0))
            .isEqualTo("ExternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
        // out-of-bound path param
        assertThat(params._pathParam(1)).isEqualTo("")
    }

    @Test
    fun queryParams() {
        val params =
            ReceiverLookupExternalAccountParams.builder()
                .accountId("ExternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
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
            ReceiverLookupExternalAccountParams.builder()
                .accountId("ExternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                .build()

        val queryParams = params._queryParams()

        assertThat(queryParams).isEqualTo(QueryParams.builder().build())
    }
}
