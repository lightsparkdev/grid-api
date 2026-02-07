// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.quotes

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class BaseDestinationTest {

    @Test
    fun create() {
        val baseDestination = BaseDestination.builder().build()
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val baseDestination = BaseDestination.builder().build()

        val roundtrippedBaseDestination =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(baseDestination),
                jacksonTypeRef<BaseDestination>(),
            )

        assertThat(roundtrippedBaseDestination).isEqualTo(baseDestination)
    }
}
