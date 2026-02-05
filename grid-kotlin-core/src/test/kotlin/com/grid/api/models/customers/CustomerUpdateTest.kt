// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class CustomerUpdateTest {

    @Test
    fun create() {
        val customerUpdate =
            CustomerUpdate.builder()
                .customerType(CustomerType.INDIVIDUAL)
                .umaAddress("\$john.doe@uma.domain.com")
                .build()

        assertThat(customerUpdate.customerType()).isEqualTo(CustomerType.INDIVIDUAL)
        assertThat(customerUpdate.umaAddress()).isEqualTo("\$john.doe@uma.domain.com")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val customerUpdate =
            CustomerUpdate.builder()
                .customerType(CustomerType.INDIVIDUAL)
                .umaAddress("\$john.doe@uma.domain.com")
                .build()

        val roundtrippedCustomerUpdate =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(customerUpdate),
                jacksonTypeRef<CustomerUpdate>(),
            )

        assertThat(roundtrippedCustomerUpdate).isEqualTo(customerUpdate)
    }
}
