// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class BaseExternalAccountInfoTest {

    @Test
    fun create() {
        val baseExternalAccountInfo =
            BaseExternalAccountInfo.builder()
                .accountType(BaseExternalAccountInfo.AccountType.US_ACCOUNT)
                .build()

        assertThat(baseExternalAccountInfo.accountType())
            .isEqualTo(BaseExternalAccountInfo.AccountType.US_ACCOUNT)
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val baseExternalAccountInfo =
            BaseExternalAccountInfo.builder()
                .accountType(BaseExternalAccountInfo.AccountType.US_ACCOUNT)
                .build()

        val roundtrippedBaseExternalAccountInfo =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(baseExternalAccountInfo),
                jacksonTypeRef<BaseExternalAccountInfo>(),
            )

        assertThat(roundtrippedBaseExternalAccountInfo).isEqualTo(baseExternalAccountInfo)
    }
}
