// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class ClabeAccountInfoTest {

    @Test
    fun create() {
        val clabeAccountInfo = ClabeAccountInfo.builder().clabeNumber("123456789012345678").build()

        assertThat(clabeAccountInfo.clabeNumber()).isEqualTo("123456789012345678")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val clabeAccountInfo = ClabeAccountInfo.builder().clabeNumber("123456789012345678").build()

        val roundtrippedClabeAccountInfo =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(clabeAccountInfo),
                jacksonTypeRef<ClabeAccountInfo>(),
            )

        assertThat(roundtrippedClabeAccountInfo).isEqualTo(clabeAccountInfo)
    }
}
