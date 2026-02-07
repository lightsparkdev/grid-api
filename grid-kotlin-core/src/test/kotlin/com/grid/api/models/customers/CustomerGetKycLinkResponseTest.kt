// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class CustomerGetKycLinkResponseTest {

    @Test
    fun create() {
        val customerGetKycLinkResponse =
            CustomerGetKycLinkResponse.builder()
                .customerId("Customer:019542f5-b3e7-1d02-0000-000000000001")
                .kycUrl("https://example.com/redirect")
                .platformCustomerId("019542f5-b3e7-1d02-0000-000000000001")
                .build()

        assertThat(customerGetKycLinkResponse.customerId())
            .isEqualTo("Customer:019542f5-b3e7-1d02-0000-000000000001")
        assertThat(customerGetKycLinkResponse.kycUrl()).isEqualTo("https://example.com/redirect")
        assertThat(customerGetKycLinkResponse.platformCustomerId())
            .isEqualTo("019542f5-b3e7-1d02-0000-000000000001")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val customerGetKycLinkResponse =
            CustomerGetKycLinkResponse.builder()
                .customerId("Customer:019542f5-b3e7-1d02-0000-000000000001")
                .kycUrl("https://example.com/redirect")
                .platformCustomerId("019542f5-b3e7-1d02-0000-000000000001")
                .build()

        val roundtrippedCustomerGetKycLinkResponse =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(customerGetKycLinkResponse),
                jacksonTypeRef<CustomerGetKycLinkResponse>(),
            )

        assertThat(roundtrippedCustomerGetKycLinkResponse).isEqualTo(customerGetKycLinkResponse)
    }
}
