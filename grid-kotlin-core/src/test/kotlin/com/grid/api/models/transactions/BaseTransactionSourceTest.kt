// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.transactions

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class BaseTransactionSourceTest {

    @Test
    fun create() {
        val baseTransactionSource = BaseTransactionSource.builder().currency("USD").build()

        assertThat(baseTransactionSource.currency()).isEqualTo("USD")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val baseTransactionSource = BaseTransactionSource.builder().currency("USD").build()

        val roundtrippedBaseTransactionSource =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(baseTransactionSource),
                jacksonTypeRef<BaseTransactionSource>(),
            )

        assertThat(roundtrippedBaseTransactionSource).isEqualTo(baseTransactionSource)
    }
}
