// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.transferin

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class BaseTransactionDestinationTest {

    @Test
    fun create() {
        val baseTransactionDestination =
            BaseTransactionDestination.builder().currency("EUR").build()

        assertThat(baseTransactionDestination.currency()).isEqualTo("EUR")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val baseTransactionDestination =
            BaseTransactionDestination.builder().currency("EUR").build()

        val roundtrippedBaseTransactionDestination =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(baseTransactionDestination),
                jacksonTypeRef<BaseTransactionDestination>(),
            )

        assertThat(roundtrippedBaseTransactionDestination).isEqualTo(baseTransactionDestination)
    }
}
