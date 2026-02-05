// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.JsonValue
import com.grid.api.core.jsonMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class CustomerCreateTest {

    @Test
    fun create() {
        val customerCreate =
            CustomerCreate.builder()
                .customerType(CustomerType.INDIVIDUAL)
                .platformCustomerId("9f84e0c2a72c4fa")
                .umaAddress(JsonValue.from("\$john.doe@uma.domain.com"))
                .build()

        assertThat(customerCreate.customerType()).isEqualTo(CustomerType.INDIVIDUAL)
        assertThat(customerCreate.platformCustomerId()).isEqualTo("9f84e0c2a72c4fa")
        assertThat(customerCreate._umaAddress())
            .isEqualTo(JsonValue.from("\$john.doe@uma.domain.com"))
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val customerCreate =
            CustomerCreate.builder()
                .customerType(CustomerType.INDIVIDUAL)
                .platformCustomerId("9f84e0c2a72c4fa")
                .umaAddress(JsonValue.from("\$john.doe@uma.domain.com"))
                .build()

        val roundtrippedCustomerCreate =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(customerCreate),
                jacksonTypeRef<CustomerCreate>(),
            )

        assertThat(roundtrippedCustomerCreate).isEqualTo(customerCreate)
    }
}
