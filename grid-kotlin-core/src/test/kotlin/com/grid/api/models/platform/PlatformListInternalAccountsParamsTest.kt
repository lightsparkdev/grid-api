// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.platform

import com.grid.api.core.http.QueryParams
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class PlatformListInternalAccountsParamsTest {

    @Test
    fun create() {
        PlatformListInternalAccountsParams.builder().currency("currency").build()
    }

    @Test
    fun queryParams() {
        val params = PlatformListInternalAccountsParams.builder().currency("currency").build()

        val queryParams = params._queryParams()

        assertThat(queryParams).isEqualTo(QueryParams.builder().put("currency", "currency").build())
    }

    @Test
    fun queryParamsWithoutOptionalFields() {
        val params = PlatformListInternalAccountsParams.builder().build()

        val queryParams = params._queryParams()

        assertThat(queryParams).isEqualTo(QueryParams.builder().build())
    }
}
