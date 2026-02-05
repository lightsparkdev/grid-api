// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.quotes

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class BasePaymentAccountInfoTest {

    @Test
    fun create() {
        val basePaymentAccountInfo =
            BasePaymentAccountInfo.builder()
                .accountType(BasePaymentAccountInfo.AccountType.US_ACCOUNT)
                .build()

        assertThat(basePaymentAccountInfo.accountType())
            .isEqualTo(BasePaymentAccountInfo.AccountType.US_ACCOUNT)
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val basePaymentAccountInfo =
            BasePaymentAccountInfo.builder()
                .accountType(BasePaymentAccountInfo.AccountType.US_ACCOUNT)
                .build()

        val roundtrippedBasePaymentAccountInfo =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(basePaymentAccountInfo),
                jacksonTypeRef<BasePaymentAccountInfo>(),
            )

        assertThat(roundtrippedBasePaymentAccountInfo).isEqualTo(basePaymentAccountInfo)
    }
}
