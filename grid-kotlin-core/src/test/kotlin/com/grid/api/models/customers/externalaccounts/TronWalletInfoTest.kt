// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class TronWalletInfoTest {

    @Test
    fun create() {
        val tronWalletInfo =
            TronWalletInfo.builder().address("TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL").build()

        assertThat(tronWalletInfo.address()).isEqualTo("TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val tronWalletInfo =
            TronWalletInfo.builder().address("TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL").build()

        val roundtrippedTronWalletInfo =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(tronWalletInfo),
                jacksonTypeRef<TronWalletInfo>(),
            )

        assertThat(roundtrippedTronWalletInfo).isEqualTo(tronWalletInfo)
    }
}
