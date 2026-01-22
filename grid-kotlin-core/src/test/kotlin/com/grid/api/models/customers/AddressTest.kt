// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class AddressTest {

    @Test
    fun create() {
        val address =
            Address.builder()
                .country("US")
                .line1("123 Main Street")
                .postalCode("94105")
                .city("San Francisco")
                .line2("Apt 4B")
                .state("CA")
                .build()

        assertThat(address.country()).isEqualTo("US")
        assertThat(address.line1()).isEqualTo("123 Main Street")
        assertThat(address.postalCode()).isEqualTo("94105")
        assertThat(address.city()).isEqualTo("San Francisco")
        assertThat(address.line2()).isEqualTo("Apt 4B")
        assertThat(address.state()).isEqualTo("CA")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val address =
            Address.builder()
                .country("US")
                .line1("123 Main Street")
                .postalCode("94105")
                .city("San Francisco")
                .line2("Apt 4B")
                .state("CA")
                .build()

        val roundtrippedAddress =
            jsonMapper.readValue(jsonMapper.writeValueAsString(address), jacksonTypeRef<Address>())

        assertThat(roundtrippedAddress).isEqualTo(address)
    }
}
