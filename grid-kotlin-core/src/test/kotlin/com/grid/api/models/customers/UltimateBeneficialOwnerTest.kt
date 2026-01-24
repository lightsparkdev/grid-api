// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import java.time.LocalDate
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class UltimateBeneficialOwnerTest {

    @Test
    fun create() {
        val ultimateBeneficialOwner =
            UltimateBeneficialOwner.builder()
                .fullName("John Michael Doe")
                .individualType(UltimateBeneficialOwner.IndividualType.DIRECTOR)
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
                .emailAddress("example@test.com")
                .nationality("US")
                .percentageOwnership(25.0)
                .phoneNumber("+5555555555")
                .taxId("EIN-987654321")
                .title("CEO, COO, President")
                .build()

        assertThat(ultimateBeneficialOwner.fullName()).isEqualTo("John Michael Doe")
        assertThat(ultimateBeneficialOwner.individualType())
            .isEqualTo(UltimateBeneficialOwner.IndividualType.DIRECTOR)
        assertThat(ultimateBeneficialOwner.address())
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
        assertThat(ultimateBeneficialOwner.birthDate()).isEqualTo(LocalDate.parse("1990-01-15"))
        assertThat(ultimateBeneficialOwner.emailAddress()).isEqualTo("example@test.com")
        assertThat(ultimateBeneficialOwner.nationality()).isEqualTo("US")
        assertThat(ultimateBeneficialOwner.percentageOwnership()).isEqualTo(25.0)
        assertThat(ultimateBeneficialOwner.phoneNumber()).isEqualTo("+5555555555")
        assertThat(ultimateBeneficialOwner.taxId()).isEqualTo("EIN-987654321")
        assertThat(ultimateBeneficialOwner.title()).isEqualTo("CEO, COO, President")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val ultimateBeneficialOwner =
            UltimateBeneficialOwner.builder()
                .fullName("John Michael Doe")
                .individualType(UltimateBeneficialOwner.IndividualType.DIRECTOR)
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
                .emailAddress("example@test.com")
                .nationality("US")
                .percentageOwnership(25.0)
                .phoneNumber("+5555555555")
                .taxId("EIN-987654321")
                .title("CEO, COO, President")
                .build()

        val roundtrippedUltimateBeneficialOwner =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(ultimateBeneficialOwner),
                jacksonTypeRef<UltimateBeneficialOwner>(),
            )

        assertThat(roundtrippedUltimateBeneficialOwner).isEqualTo(ultimateBeneficialOwner)
    }
}
