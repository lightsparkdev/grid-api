// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.transactions

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class UmaAddressSourceTest {

    @Test
    fun create() {
        val umaAddressSource =
            UmaAddressSource.builder().umaAddress("\$sender@uma.domain.com").currency("USD").build()

        assertThat(umaAddressSource.umaAddress()).isEqualTo("\$sender@uma.domain.com")
        assertThat(umaAddressSource.currency()).isEqualTo("USD")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val umaAddressSource =
            UmaAddressSource.builder().umaAddress("\$sender@uma.domain.com").currency("USD").build()

        val roundtrippedUmaAddressSource =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(umaAddressSource),
                jacksonTypeRef<UmaAddressSource>(),
            )

        assertThat(roundtrippedUmaAddressSource).isEqualTo(umaAddressSource)
    }
}
