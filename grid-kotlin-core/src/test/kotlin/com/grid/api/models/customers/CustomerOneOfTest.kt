// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.JsonValue
import com.grid.api.core.jsonMapper
import com.grid.api.errors.GridInvalidDataException
import java.time.LocalDate
import java.time.OffsetDateTime
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.EnumSource

internal class CustomerOneOfTest {

    @Test
    fun ofIndividual() {
        val individual =
            CustomerOneOf.Individual.builder()
                .platformCustomerId("9f84e0c2a72c4fa")
                .umaAddress("\$john.doe@uma.domain.com")
                .id("Customer:019542f5-b3e7-1d02-0000-000000000001")
                .createdAt(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
                .isDeleted(false)
                .kycStatus(Customer.KycStatus.APPROVED)
                .updatedAt(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
                .customerType(CustomerOneOf.Individual.CustomerType.INDIVIDUAL)
                .address(
                    CustomerOneOf.Individual.Address.builder()
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

        val customerOneOf = CustomerOneOf.ofIndividual(individual)

        assertThat(customerOneOf.individual()).isEqualTo(individual)
        assertThat(customerOneOf.business()).isNull()
    }

    @Test
    fun ofIndividualRoundtrip() {
        val jsonMapper = jsonMapper()
        val customerOneOf =
            CustomerOneOf.ofIndividual(
                CustomerOneOf.Individual.builder()
                    .platformCustomerId("9f84e0c2a72c4fa")
                    .umaAddress("\$john.doe@uma.domain.com")
                    .id("Customer:019542f5-b3e7-1d02-0000-000000000001")
                    .createdAt(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
                    .isDeleted(false)
                    .kycStatus(Customer.KycStatus.APPROVED)
                    .updatedAt(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
                    .customerType(CustomerOneOf.Individual.CustomerType.INDIVIDUAL)
                    .address(
                        CustomerOneOf.Individual.Address.builder()
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
            )

        val roundtrippedCustomerOneOf =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(customerOneOf),
                jacksonTypeRef<CustomerOneOf>(),
            )

        assertThat(roundtrippedCustomerOneOf).isEqualTo(customerOneOf)
    }

    @Test
    fun ofBusiness() {
        val business =
            CustomerOneOf.Business.builder()
                .platformCustomerId("9f84e0c2a72c4fa")
                .umaAddress("\$john.doe@uma.domain.com")
                .id("Customer:019542f5-b3e7-1d02-0000-000000000001")
                .createdAt(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
                .isDeleted(false)
                .kycStatus(Customer.KycStatus.APPROVED)
                .updatedAt(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
                .customerType(CustomerOneOf.Business.CustomerType.BUSINESS)
                .address(
                    CustomerOneOf.Business.Address.builder()
                        .country("US")
                        .line1("123 Main Street")
                        .postalCode("94105")
                        .city("San Francisco")
                        .line2("Apt 4B")
                        .state("CA")
                        .build()
                )
                .addBeneficialOwner(
                    CustomerOneOf.Business.BeneficialOwner.builder()
                        .fullName("John Michael Doe")
                        .individualType(
                            CustomerOneOf.Business.BeneficialOwner.IndividualType.DIRECTOR
                        )
                        .address(
                            CustomerOneOf.Business.BeneficialOwner.Address.builder()
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
                    CustomerOneOf.Business.BusinessInfo.builder()
                        .legalName("Acme Corporation, Inc.")
                        .registrationNumber("BRN-123456789")
                        .taxId("EIN-987654321")
                        .build()
                )
                .build()

        val customerOneOf = CustomerOneOf.ofBusiness(business)

        assertThat(customerOneOf.individual()).isNull()
        assertThat(customerOneOf.business()).isEqualTo(business)
    }

    @Test
    fun ofBusinessRoundtrip() {
        val jsonMapper = jsonMapper()
        val customerOneOf =
            CustomerOneOf.ofBusiness(
                CustomerOneOf.Business.builder()
                    .platformCustomerId("9f84e0c2a72c4fa")
                    .umaAddress("\$john.doe@uma.domain.com")
                    .id("Customer:019542f5-b3e7-1d02-0000-000000000001")
                    .createdAt(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
                    .isDeleted(false)
                    .kycStatus(Customer.KycStatus.APPROVED)
                    .updatedAt(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
                    .customerType(CustomerOneOf.Business.CustomerType.BUSINESS)
                    .address(
                        CustomerOneOf.Business.Address.builder()
                            .country("US")
                            .line1("123 Main Street")
                            .postalCode("94105")
                            .city("San Francisco")
                            .line2("Apt 4B")
                            .state("CA")
                            .build()
                    )
                    .addBeneficialOwner(
                        CustomerOneOf.Business.BeneficialOwner.builder()
                            .fullName("John Michael Doe")
                            .individualType(
                                CustomerOneOf.Business.BeneficialOwner.IndividualType.DIRECTOR
                            )
                            .address(
                                CustomerOneOf.Business.BeneficialOwner.Address.builder()
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
                        CustomerOneOf.Business.BusinessInfo.builder()
                            .legalName("Acme Corporation, Inc.")
                            .registrationNumber("BRN-123456789")
                            .taxId("EIN-987654321")
                            .build()
                    )
                    .build()
            )

        val roundtrippedCustomerOneOf =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(customerOneOf),
                jacksonTypeRef<CustomerOneOf>(),
            )

        assertThat(roundtrippedCustomerOneOf).isEqualTo(customerOneOf)
    }

    enum class IncompatibleJsonShapeTestCase(val value: JsonValue) {
        BOOLEAN(JsonValue.from(false)),
        STRING(JsonValue.from("invalid")),
        INTEGER(JsonValue.from(-1)),
        FLOAT(JsonValue.from(3.14)),
        ARRAY(JsonValue.from(listOf("invalid", "array"))),
    }

    @ParameterizedTest
    @EnumSource
    fun incompatibleJsonShapeDeserializesToUnknown(testCase: IncompatibleJsonShapeTestCase) {
        val customerOneOf =
            jsonMapper().convertValue(testCase.value, jacksonTypeRef<CustomerOneOf>())

        val e = assertThrows<GridInvalidDataException> { customerOneOf.validate() }
        assertThat(e).hasMessageStartingWith("Unknown ")
    }
}
