// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.quotes

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class BaseQuoteSourceTest {

    @Test
    fun create() {
        val baseQuoteSource = BaseQuoteSource.builder().build()
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val baseQuoteSource = BaseQuoteSource.builder().build()

        val roundtrippedBaseQuoteSource =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(baseQuoteSource),
                jacksonTypeRef<BaseQuoteSource>(),
            )

        assertThat(roundtrippedBaseQuoteSource).isEqualTo(baseQuoteSource)
    }
}
