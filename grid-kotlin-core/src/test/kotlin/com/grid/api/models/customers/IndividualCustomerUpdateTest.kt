// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import java.time.LocalDate
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class IndividualCustomerUpdateTest {

    @Test
    fun create() {
        val individualCustomerUpdate =
            IndividualCustomerUpdate.builder()
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
                .platformCustomerId("9f84e0c2a72c4fa")
                .umaAddress("\$john.doe@uma.domain.com")
                .build()

        assertThat(individualCustomerUpdate.address())
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
        assertThat(individualCustomerUpdate.birthDate()).isEqualTo(LocalDate.parse("1990-01-15"))
        assertThat(individualCustomerUpdate.fullName()).isEqualTo("John Michael Doe")
        assertThat(individualCustomerUpdate.nationality()).isEqualTo("US")
        assertThat(individualCustomerUpdate.platformCustomerId()).isEqualTo("9f84e0c2a72c4fa")
        assertThat(individualCustomerUpdate.umaAddress()).isEqualTo("\$john.doe@uma.domain.com")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val individualCustomerUpdate =
            IndividualCustomerUpdate.builder()
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
                .platformCustomerId("9f84e0c2a72c4fa")
                .umaAddress("\$john.doe@uma.domain.com")
                .build()

        val roundtrippedIndividualCustomerUpdate =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(individualCustomerUpdate),
                jacksonTypeRef<IndividualCustomerUpdate>(),
            )

        assertThat(roundtrippedIndividualCustomerUpdate).isEqualTo(individualCustomerUpdate)
    }
}
