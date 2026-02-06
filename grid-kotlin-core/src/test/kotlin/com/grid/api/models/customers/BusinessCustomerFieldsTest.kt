// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import java.time.LocalDate
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class BusinessCustomerFieldsTest {

    @Test
    fun create() {
        val businessCustomerFields =
            BusinessCustomerFields.builder()
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
                        .phoneNumber("+5555555555")
                        .taxId("EIN-987654321")
                        .title("CEO, COO, President")
                        .build()
                )
                .businessInfo(
                    BusinessCustomerFields.BusinessInfo.builder()
                        .legalName("Acme Corporation, Inc.")
                        .registrationNumber("BRN-123456789")
                        .taxId("EIN-987654321")
                        .build()
                )
                .build()

        assertThat(businessCustomerFields.address())
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
        assertThat(businessCustomerFields.beneficialOwners())
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
                    .phoneNumber("+5555555555")
                    .taxId("EIN-987654321")
                    .title("CEO, COO, President")
                    .build()
            )
        assertThat(businessCustomerFields.businessInfo())
            .isEqualTo(
                BusinessCustomerFields.BusinessInfo.builder()
                    .legalName("Acme Corporation, Inc.")
                    .registrationNumber("BRN-123456789")
                    .taxId("EIN-987654321")
                    .build()
            )
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val businessCustomerFields =
            BusinessCustomerFields.builder()
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
                        .phoneNumber("+5555555555")
                        .taxId("EIN-987654321")
                        .title("CEO, COO, President")
                        .build()
                )
                .businessInfo(
                    BusinessCustomerFields.BusinessInfo.builder()
                        .legalName("Acme Corporation, Inc.")
                        .registrationNumber("BRN-123456789")
                        .taxId("EIN-987654321")
                        .build()
                )
                .build()

        val roundtrippedBusinessCustomerFields =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(businessCustomerFields),
                jacksonTypeRef<BusinessCustomerFields>(),
            )

        assertThat(roundtrippedBusinessCustomerFields).isEqualTo(businessCustomerFields)
    }
}
