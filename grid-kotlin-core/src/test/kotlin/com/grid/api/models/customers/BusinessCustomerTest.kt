// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import java.time.LocalDate
import java.time.OffsetDateTime
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class BusinessCustomerTest {

    @Test
    fun create() {
        val businessCustomer =
            BusinessCustomer.builder()
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

        assertThat(businessCustomer.customerType()).isEqualTo(CustomerType.INDIVIDUAL)
        assertThat(businessCustomer.platformCustomerId()).isEqualTo("9f84e0c2a72c4fa")
        assertThat(businessCustomer.umaAddress()).isEqualTo("\$john.doe@uma.domain.com")
        assertThat(businessCustomer.id()).isEqualTo("Customer:019542f5-b3e7-1d02-0000-000000000001")
        assertThat(businessCustomer.createdAt())
            .isEqualTo(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
        assertThat(businessCustomer.isDeleted()).isEqualTo(false)
        assertThat(businessCustomer.kycStatus()).isEqualTo(Customer.KycStatus.APPROVED)
        assertThat(businessCustomer.updatedAt())
            .isEqualTo(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
        assertThat(businessCustomer.address())
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
        assertThat(businessCustomer.beneficialOwners())
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
        assertThat(businessCustomer.businessInfo())
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
        val businessCustomer =
            BusinessCustomer.builder()
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

        val roundtrippedBusinessCustomer =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(businessCustomer),
                jacksonTypeRef<BusinessCustomer>(),
            )

        assertThat(roundtrippedBusinessCustomer).isEqualTo(businessCustomer)
    }
}
