// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import com.grid.api.models.customers.Address
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class BusinessBeneficiaryTest {

    @Test
    fun create() {
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

        assertThat(businessBeneficiary.beneficiaryType())
            .isEqualTo(BaseBeneficiary.BeneficiaryType.BUSINESS)
        assertThat(businessBeneficiary.address())
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
        assertThat(businessBeneficiary.legalName()).isEqualTo("Acme Corporation, Inc.")
        assertThat(businessBeneficiary.registrationNumber()).isEqualTo("BRN-123456789")
        assertThat(businessBeneficiary.taxId()).isEqualTo("EIN-987654321")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
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

        val roundtrippedBusinessBeneficiary =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(businessBeneficiary),
                jacksonTypeRef<BusinessBeneficiary>(),
            )

        assertThat(roundtrippedBusinessBeneficiary).isEqualTo(businessBeneficiary)
    }
}
