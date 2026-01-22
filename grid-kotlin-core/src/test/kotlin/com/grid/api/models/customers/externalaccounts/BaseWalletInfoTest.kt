// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class BaseWalletInfoTest {

    @Test
    fun create() {
        val baseWalletInfo =
            BaseWalletInfo.builder().address("0xAbCDEF1234567890aBCdEf1234567890ABcDef12").build()

        assertThat(baseWalletInfo.address()).isEqualTo("0xAbCDEF1234567890aBCdEf1234567890ABcDef12")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val baseWalletInfo =
            BaseWalletInfo.builder().address("0xAbCDEF1234567890aBCdEf1234567890ABcDef12").build()

        val roundtrippedBaseWalletInfo =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(baseWalletInfo),
                jacksonTypeRef<BaseWalletInfo>(),
            )

        assertThat(roundtrippedBaseWalletInfo).isEqualTo(baseWalletInfo)
    }
}
