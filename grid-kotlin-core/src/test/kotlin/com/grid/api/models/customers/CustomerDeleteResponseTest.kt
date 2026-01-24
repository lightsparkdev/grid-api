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

internal class CustomerDeleteResponseTest {

    @Test
    fun ofIndividualCustomer() {
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

        val customerDeleteResponse = CustomerDeleteResponse.ofIndividualCustomer(individualCustomer)

        assertThat(customerDeleteResponse.individualCustomer()).isEqualTo(individualCustomer)
        assertThat(customerDeleteResponse.businessCustomer()).isNull()
    }

    @Test
    fun ofIndividualCustomerRoundtrip() {
        val jsonMapper = jsonMapper()
        val customerDeleteResponse =
            CustomerDeleteResponse.ofIndividualCustomer(
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
            )

        val roundtrippedCustomerDeleteResponse =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(customerDeleteResponse),
                jacksonTypeRef<CustomerDeleteResponse>(),
            )

        assertThat(roundtrippedCustomerDeleteResponse).isEqualTo(customerDeleteResponse)
    }

    @Test
    fun ofBusinessCustomer() {
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
                    BusinessCustomer.BusinessInfo.builder()
                        .legalName("Acme Corporation, Inc.")
                        .registrationNumber("BRN-123456789")
                        .taxId("EIN-987654321")
                        .build()
                )
                .build()

        val customerDeleteResponse = CustomerDeleteResponse.ofBusinessCustomer(businessCustomer)

        assertThat(customerDeleteResponse.individualCustomer()).isNull()
        assertThat(customerDeleteResponse.businessCustomer()).isEqualTo(businessCustomer)
    }

    @Test
    fun ofBusinessCustomerRoundtrip() {
        val jsonMapper = jsonMapper()
        val customerDeleteResponse =
            CustomerDeleteResponse.ofBusinessCustomer(
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
                        BusinessCustomer.BusinessInfo.builder()
                            .legalName("Acme Corporation, Inc.")
                            .registrationNumber("BRN-123456789")
                            .taxId("EIN-987654321")
                            .build()
                    )
                    .build()
            )

        val roundtrippedCustomerDeleteResponse =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(customerDeleteResponse),
                jacksonTypeRef<CustomerDeleteResponse>(),
            )

        assertThat(roundtrippedCustomerDeleteResponse).isEqualTo(customerDeleteResponse)
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
        val customerDeleteResponse =
            jsonMapper().convertValue(testCase.value, jacksonTypeRef<CustomerDeleteResponse>())

        val e = assertThrows<GridInvalidDataException> { customerDeleteResponse.validate() }
        assertThat(e).hasMessageStartingWith("Unknown ")
    }
}
