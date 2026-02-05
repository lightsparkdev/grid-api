// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class BusinessInfoTest {

    @Test
    fun create() {
        val businessInfo =
            BusinessInfo.builder()
                .legalName("Acme Corporation, Inc.")
                .registrationNumber("BRN-123456789")
                .taxId("EIN-987654321")
                .build()

        assertThat(businessInfo.legalName()).isEqualTo("Acme Corporation, Inc.")
        assertThat(businessInfo.registrationNumber()).isEqualTo("BRN-123456789")
        assertThat(businessInfo.taxId()).isEqualTo("EIN-987654321")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val businessInfo =
            BusinessInfo.builder()
                .legalName("Acme Corporation, Inc.")
                .registrationNumber("BRN-123456789")
                .taxId("EIN-987654321")
                .build()

        val roundtrippedBusinessInfo =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(businessInfo),
                jacksonTypeRef<BusinessInfo>(),
            )

        assertThat(roundtrippedBusinessInfo).isEqualTo(businessInfo)
    }
}
