// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.JsonValue
import com.grid.api.core.jsonMapper
import com.grid.api.errors.GridInvalidDataException
import com.grid.api.models.customers.Address
import java.time.LocalDate
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.EnumSource

internal class BeneficiaryOneOfTest {

    @Test
    fun ofIndividualBeneficiary() {
        val individualBeneficiary =
            IndividualBeneficiary.builder()
                .beneficiaryType(BaseBeneficiary.BeneficiaryType.INDIVIDUAL)
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

        val beneficiaryOneOf = BeneficiaryOneOf.ofIndividualBeneficiary(individualBeneficiary)

        assertThat(beneficiaryOneOf.individualBeneficiary()).isEqualTo(individualBeneficiary)
        assertThat(beneficiaryOneOf.businessBeneficiary()).isNull()
    }

    @Test
    fun ofIndividualBeneficiaryRoundtrip() {
        val jsonMapper = jsonMapper()
        val beneficiaryOneOf =
            BeneficiaryOneOf.ofIndividualBeneficiary(
                IndividualBeneficiary.builder()
                    .beneficiaryType(BaseBeneficiary.BeneficiaryType.INDIVIDUAL)
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

        val roundtrippedBeneficiaryOneOf =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(beneficiaryOneOf),
                jacksonTypeRef<BeneficiaryOneOf>(),
            )

        assertThat(roundtrippedBeneficiaryOneOf).isEqualTo(beneficiaryOneOf)
    }

    @Test
    fun ofBusinessBeneficiary() {
        val businessBeneficiary =
            BusinessBeneficiary.builder()
                .beneficiaryType(BaseBeneficiary.BeneficiaryType.BUSINESS)
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
                .legalName("Acme Corporation, Inc.")
                .registrationNumber("BRN-123456789")
                .taxId("EIN-987654321")
                .build()

        val beneficiaryOneOf = BeneficiaryOneOf.ofBusinessBeneficiary(businessBeneficiary)

        assertThat(beneficiaryOneOf.individualBeneficiary()).isNull()
        assertThat(beneficiaryOneOf.businessBeneficiary()).isEqualTo(businessBeneficiary)
    }

    @Test
    fun ofBusinessBeneficiaryRoundtrip() {
        val jsonMapper = jsonMapper()
        val beneficiaryOneOf =
            BeneficiaryOneOf.ofBusinessBeneficiary(
                BusinessBeneficiary.builder()
                    .beneficiaryType(BaseBeneficiary.BeneficiaryType.BUSINESS)
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
                    .legalName("Acme Corporation, Inc.")
                    .registrationNumber("BRN-123456789")
                    .taxId("EIN-987654321")
                    .build()
            )

        val roundtrippedBeneficiaryOneOf =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(beneficiaryOneOf),
                jacksonTypeRef<BeneficiaryOneOf>(),
            )

        assertThat(roundtrippedBeneficiaryOneOf).isEqualTo(beneficiaryOneOf)
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
        val beneficiaryOneOf =
            jsonMapper().convertValue(testCase.value, jacksonTypeRef<BeneficiaryOneOf>())

        val e = assertThrows<GridInvalidDataException> { beneficiaryOneOf.validate() }
        assertThat(e).hasMessageStartingWith("Unknown ")
    }
}
