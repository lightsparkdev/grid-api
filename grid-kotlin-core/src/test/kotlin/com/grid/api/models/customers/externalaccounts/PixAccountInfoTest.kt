// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class PixAccountInfoTest {

    @Test
    fun create() {
        val pixAccountInfo =
            PixAccountInfo.builder()
                .accountType(PixAccountInfo.AccountType.PIX)
                .pixKey("55119876543210")
                .pixKeyType(PixAccountInfo.PixKeyType.PHONE)
                .taxId("1234567890")
                .build()

        assertThat(pixAccountInfo.accountType()).isEqualTo(PixAccountInfo.AccountType.PIX)
        assertThat(pixAccountInfo.pixKey()).isEqualTo("55119876543210")
        assertThat(pixAccountInfo.pixKeyType()).isEqualTo(PixAccountInfo.PixKeyType.PHONE)
        assertThat(pixAccountInfo.taxId()).isEqualTo("1234567890")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val pixAccountInfo =
            PixAccountInfo.builder()
                .accountType(PixAccountInfo.AccountType.PIX)
                .pixKey("55119876543210")
                .pixKeyType(PixAccountInfo.PixKeyType.PHONE)
                .taxId("1234567890")
                .build()

        val roundtrippedPixAccountInfo =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(pixAccountInfo),
                jacksonTypeRef<PixAccountInfo>(),
            )

        assertThat(roundtrippedPixAccountInfo).isEqualTo(pixAccountInfo)
    }
}
