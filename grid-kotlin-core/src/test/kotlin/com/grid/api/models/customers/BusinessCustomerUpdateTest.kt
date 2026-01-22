// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import java.time.LocalDate
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class BusinessCustomerUpdateTest {

    @Test
    fun create() {
        val businessCustomerUpdate =
            BusinessCustomerUpdate.builder()
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
                .addBeneficialOwner(
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
                        .phoneNumber("+46991022")
                        .taxId("EIN-987654321")
                        .title("CEO, COO, President")
                        .build()
                )
                .businessInfo(
                    BusinessCustomerUpdate.BusinessInfo.builder()
                        .legalName("Acme Corporation, Inc.")
                        .registrationNumber("BRN-123456789")
                        .taxId("EIN-987654321")
                        .build()
                )
                .umaAddress("\$acme@uma.domain.com")
                .build()

        assertThat(businessCustomerUpdate.address())
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
        assertThat(businessCustomerUpdate.beneficialOwners())
            .containsExactly(
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
                    .phoneNumber("+46991022")
                    .taxId("EIN-987654321")
                    .title("CEO, COO, President")
                    .build()
            )
        assertThat(businessCustomerUpdate.businessInfo())
            .isEqualTo(
                BusinessCustomerUpdate.BusinessInfo.builder()
                    .legalName("Acme Corporation, Inc.")
                    .registrationNumber("BRN-123456789")
                    .taxId("EIN-987654321")
                    .build()
            )
        assertThat(businessCustomerUpdate.umaAddress()).isEqualTo("\$acme@uma.domain.com")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val businessCustomerUpdate =
            BusinessCustomerUpdate.builder()
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
                .addBeneficialOwner(
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
                        .phoneNumber("+46991022")
                        .taxId("EIN-987654321")
                        .title("CEO, COO, President")
                        .build()
                )
                .businessInfo(
                    BusinessCustomerUpdate.BusinessInfo.builder()
                        .legalName("Acme Corporation, Inc.")
                        .registrationNumber("BRN-123456789")
                        .taxId("EIN-987654321")
                        .build()
                )
                .umaAddress("\$acme@uma.domain.com")
                .build()

        val roundtrippedBusinessCustomerUpdate =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(businessCustomerUpdate),
                jacksonTypeRef<BusinessCustomerUpdate>(),
            )

        assertThat(roundtrippedBusinessCustomerUpdate).isEqualTo(businessCustomerUpdate)
    }
}
