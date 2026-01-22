// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class IbanAccountInfoTest {

    @Test
    fun create() {
        val ibanAccountInfo =
            IbanAccountInfo.builder().iban("DE89370400440532013000").swiftBic("DEUTDEFF").build()

        assertThat(ibanAccountInfo.iban()).isEqualTo("DE89370400440532013000")
        assertThat(ibanAccountInfo.swiftBic()).isEqualTo("DEUTDEFF")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val ibanAccountInfo =
            IbanAccountInfo.builder().iban("DE89370400440532013000").swiftBic("DEUTDEFF").build()

        val roundtrippedIbanAccountInfo =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(ibanAccountInfo),
                jacksonTypeRef<IbanAccountInfo>(),
            )

        assertThat(roundtrippedIbanAccountInfo).isEqualTo(ibanAccountInfo)
    }
}
