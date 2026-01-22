// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class PolygonWalletInfoTest {

    @Test
    fun create() {
        val polygonWalletInfo =
            PolygonWalletInfo.builder()
                .accountType(PolygonWalletInfo.AccountType.POLYGON_WALLET)
                .address("0xAbCDEF1234567890aBCdEf1234567890ABcDef12")
                .build()

        assertThat(polygonWalletInfo.accountType())
            .isEqualTo(PolygonWalletInfo.AccountType.POLYGON_WALLET)
        assertThat(polygonWalletInfo.address())
            .isEqualTo("0xAbCDEF1234567890aBCdEf1234567890ABcDef12")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val polygonWalletInfo =
            PolygonWalletInfo.builder()
                .accountType(PolygonWalletInfo.AccountType.POLYGON_WALLET)
                .address("0xAbCDEF1234567890aBCdEf1234567890ABcDef12")
                .build()

        val roundtrippedPolygonWalletInfo =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(polygonWalletInfo),
                jacksonTypeRef<PolygonWalletInfo>(),
            )

        assertThat(roundtrippedPolygonWalletInfo).isEqualTo(polygonWalletInfo)
    }
}
