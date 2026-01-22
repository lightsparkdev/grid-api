// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import java.time.OffsetDateTime
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class CustomerTest {

    @Test
    fun create() {
        val customer =
            Customer.builder()
                .customerType(CustomerType.INDIVIDUAL)
                .platformCustomerId("9f84e0c2a72c4fa")
                .umaAddress("\$john.doe@uma.domain.com")
                .id("Customer:019542f5-b3e7-1d02-0000-000000000001")
                .createdAt(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
                .isDeleted(false)
                .kycStatus(Customer.KycStatus.APPROVED)
                .updatedAt(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
                .build()

        assertThat(customer.customerType()).isEqualTo(CustomerType.INDIVIDUAL)
        assertThat(customer.platformCustomerId()).isEqualTo("9f84e0c2a72c4fa")
        assertThat(customer.umaAddress()).isEqualTo("\$john.doe@uma.domain.com")
        assertThat(customer.id()).isEqualTo("Customer:019542f5-b3e7-1d02-0000-000000000001")
        assertThat(customer.createdAt()).isEqualTo(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
        assertThat(customer.isDeleted()).isEqualTo(false)
        assertThat(customer.kycStatus()).isEqualTo(Customer.KycStatus.APPROVED)
        assertThat(customer.updatedAt()).isEqualTo(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val customer =
            Customer.builder()
                .customerType(CustomerType.INDIVIDUAL)
                .platformCustomerId("9f84e0c2a72c4fa")
                .umaAddress("\$john.doe@uma.domain.com")
                .id("Customer:019542f5-b3e7-1d02-0000-000000000001")
                .createdAt(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
                .isDeleted(false)
                .kycStatus(Customer.KycStatus.APPROVED)
                .updatedAt(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
                .build()

        val roundtrippedCustomer =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(customer),
                jacksonTypeRef<Customer>(),
            )

        assertThat(roundtrippedCustomer).isEqualTo(customer)
    }
}
