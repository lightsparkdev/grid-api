// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import com.grid.api.models.customers.Address
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class BaseBeneficiaryTest {

    @Test
    fun create() {
        val baseBeneficiary =
            BaseBeneficiary.builder()
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
                .build()

        assertThat(baseBeneficiary.beneficiaryType())
            .isEqualTo(BaseBeneficiary.BeneficiaryType.INDIVIDUAL)
        assertThat(baseBeneficiary.address())
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
        val baseBeneficiary =
            BaseBeneficiary.builder()
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
                .build()

        val roundtrippedBaseBeneficiary =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(baseBeneficiary),
                jacksonTypeRef<BaseBeneficiary>(),
            )

        assertThat(roundtrippedBaseBeneficiary).isEqualTo(baseBeneficiary)
    }
}
