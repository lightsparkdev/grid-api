// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import java.time.LocalDate
import java.time.OffsetDateTime
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class IndividualCustomerTest {

    @Test
    fun create() {
        val individualCustomer =
            IndividualCustomer.builder()
                .customerType(CustomerType.INDIVIDUAL)
                .platformCustomerId("9f84e0c2a72c4fa")
                .umaAddress("\$john.doe@uma.domain.com")
                .id("Customer:019542f5-b3e7-1d02-0000-000000000001")
                .createdAt(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
                .isDeleted(false)
                .kycStatus(Customer.KycStatus.APPROVED)
                .updatedAt(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
                .address(
                    Address.builder()
                        .country("US")
                        .line1("123 Main Street")
                        .postalCode("94105")
                        .city("San Francisco")
                        .line2("Apt 4B")
                        .state("CA")
                        .build()
                )
                .birthDate(LocalDate.parse("1990-01-15"))
                .fullName("John Michael Doe")
                .nationality("US")
                .build()

        assertThat(individualCustomer.customerType()).isEqualTo(CustomerType.INDIVIDUAL)
        assertThat(individualCustomer.platformCustomerId()).isEqualTo("9f84e0c2a72c4fa")
        assertThat(individualCustomer.umaAddress()).isEqualTo("\$john.doe@uma.domain.com")
        assertThat(individualCustomer.id())
            .isEqualTo("Customer:019542f5-b3e7-1d02-0000-000000000001")
        assertThat(individualCustomer.createdAt())
            .isEqualTo(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
        assertThat(individualCustomer.isDeleted()).isEqualTo(false)
        assertThat(individualCustomer.kycStatus()).isEqualTo(Customer.KycStatus.APPROVED)
        assertThat(individualCustomer.updatedAt())
            .isEqualTo(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
        assertThat(individualCustomer.address())
            .isEqualTo(
                Address.builder()
                    .country("US")
                    .line1("123 Main Street")
                    .postalCode("94105")
                    .city("San Francisco")
                    .line2("Apt 4B")
                    .state("CA")
                    .build()
            )
        assertThat(individualCustomer.birthDate()).isEqualTo(LocalDate.parse("1990-01-15"))
        assertThat(individualCustomer.fullName()).isEqualTo("John Michael Doe")
        assertThat(individualCustomer.nationality()).isEqualTo("US")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val individualCustomer =
            IndividualCustomer.builder()
                .customerType(CustomerType.INDIVIDUAL)
                .platformCustomerId("9f84e0c2a72c4fa")
                .umaAddress("\$john.doe@uma.domain.com")
                .id("Customer:019542f5-b3e7-1d02-0000-000000000001")
                .createdAt(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
                .isDeleted(false)
                .kycStatus(Customer.KycStatus.APPROVED)
                .updatedAt(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
                .address(
                    Address.builder()
                        .country("US")
                        .line1("123 Main Street")
                        .postalCode("94105")
                        .city("San Francisco")
                        .line2("Apt 4B")
                        .state("CA")
                        .build()
                )
                .birthDate(LocalDate.parse("1990-01-15"))
                .fullName("John Michael Doe")
                .nationality("US")
                .build()

        val roundtrippedIndividualCustomer =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(individualCustomer),
                jacksonTypeRef<IndividualCustomer>(),
            )

        assertThat(roundtrippedIndividualCustomer).isEqualTo(individualCustomer)
    }
}
