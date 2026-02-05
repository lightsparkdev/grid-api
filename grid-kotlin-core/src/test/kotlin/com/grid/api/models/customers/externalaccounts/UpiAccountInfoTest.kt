// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class UpiAccountInfoTest {

    @Test
    fun create() {
        val upiAccountInfo =
            UpiAccountInfo.builder()
                .accountType(UpiAccountInfo.AccountType.UPI)
                .vpa("somecustomers@okbank")
                .build()

        assertThat(upiAccountInfo.accountType()).isEqualTo(UpiAccountInfo.AccountType.UPI)
        assertThat(upiAccountInfo.vpa()).isEqualTo("somecustomers@okbank")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val upiAccountInfo =
            UpiAccountInfo.builder()
                .accountType(UpiAccountInfo.AccountType.UPI)
                .vpa("somecustomers@okbank")
                .build()

        val roundtrippedUpiAccountInfo =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(upiAccountInfo),
                jacksonTypeRef<UpiAccountInfo>(),
            )

        assertThat(roundtrippedUpiAccountInfo).isEqualTo(upiAccountInfo)
    }
}
