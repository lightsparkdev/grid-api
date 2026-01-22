// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class UsAccountInfoTest {

    @Test
    fun create() {
        val usAccountInfo =
            UsAccountInfo.builder()
                .accountCategory(UsAccountInfo.AccountCategory.CHECKING)
                .accountNumber("123456789")
                .routingNumber("987654321")
                .bankName("Chase Bank")
                .build()

        assertThat(usAccountInfo.accountCategory())
            .isEqualTo(UsAccountInfo.AccountCategory.CHECKING)
        assertThat(usAccountInfo.accountNumber()).isEqualTo("123456789")
        assertThat(usAccountInfo.routingNumber()).isEqualTo("987654321")
        assertThat(usAccountInfo.bankName()).isEqualTo("Chase Bank")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val usAccountInfo =
            UsAccountInfo.builder()
                .accountCategory(UsAccountInfo.AccountCategory.CHECKING)
                .accountNumber("123456789")
                .routingNumber("987654321")
                .bankName("Chase Bank")
                .build()

        val roundtrippedUsAccountInfo =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(usAccountInfo),
                jacksonTypeRef<UsAccountInfo>(),
            )

        assertThat(roundtrippedUsAccountInfo).isEqualTo(usAccountInfo)
    }
}
