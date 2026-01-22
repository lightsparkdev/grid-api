// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import com.grid.api.models.customers.Address
import java.time.LocalDate
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class IndividualBeneficiaryTest {

    @Test
    fun create() {
        val individualBeneficiary =
            IndividualBeneficiary.builder()
                .beneficiaryType(IndividualBeneficiary.BeneficiaryType.INDIVIDUAL)
                .birthDate(LocalDate.parse("1990-01-15"))
                .fullName("John Michael Doe")
                .nationality("US")
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
                .build()

        assertThat(individualBeneficiary.beneficiaryType())
            .isEqualTo(IndividualBeneficiary.BeneficiaryType.INDIVIDUAL)
        assertThat(individualBeneficiary.birthDate()).isEqualTo(LocalDate.parse("1990-01-15"))
        assertThat(individualBeneficiary.fullName()).isEqualTo("John Michael Doe")
        assertThat(individualBeneficiary.nationality()).isEqualTo("US")
        assertThat(individualBeneficiary.address())
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
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val individualBeneficiary =
            IndividualBeneficiary.builder()
                .beneficiaryType(IndividualBeneficiary.BeneficiaryType.INDIVIDUAL)
                .birthDate(LocalDate.parse("1990-01-15"))
                .fullName("John Michael Doe")
                .nationality("US")
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
                .build()

        val roundtrippedIndividualBeneficiary =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(individualBeneficiary),
                jacksonTypeRef<IndividualBeneficiary>(),
            )

        assertThat(roundtrippedIndividualBeneficiary).isEqualTo(individualBeneficiary)
    }
}
