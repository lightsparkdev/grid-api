// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.plaid

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import java.time.OffsetDateTime
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class PlaidCreateLinkTokenResponseTest {

    @Test
    fun create() {
        val plaidCreateLinkTokenResponse =
            PlaidCreateLinkTokenResponse.builder()
                .callbackUrl(
                    "https://api.lightspark.com/grid/2025-10-13/plaid/callback/{plaid_link_token}"
                )
                .expiration(OffsetDateTime.parse("2025-10-05T18:30:00Z"))
                .linkToken("link-sandbox-af1a0311-da53-4636-b754-dd15cc058176")
                .requestId("req_abc123def456")
                .build()

        assertThat(plaidCreateLinkTokenResponse.callbackUrl())
            .isEqualTo(
                "https://api.lightspark.com/grid/2025-10-13/plaid/callback/{plaid_link_token}"
            )
        assertThat(plaidCreateLinkTokenResponse.expiration())
            .isEqualTo(OffsetDateTime.parse("2025-10-05T18:30:00Z"))
        assertThat(plaidCreateLinkTokenResponse.linkToken())
            .isEqualTo("link-sandbox-af1a0311-da53-4636-b754-dd15cc058176")
        assertThat(plaidCreateLinkTokenResponse.requestId()).isEqualTo("req_abc123def456")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val plaidCreateLinkTokenResponse =
            PlaidCreateLinkTokenResponse.builder()
                .callbackUrl(
                    "https://api.lightspark.com/grid/2025-10-13/plaid/callback/{plaid_link_token}"
                )
                .expiration(OffsetDateTime.parse("2025-10-05T18:30:00Z"))
                .linkToken("link-sandbox-af1a0311-da53-4636-b754-dd15cc058176")
                .requestId("req_abc123def456")
                .build()

        val roundtrippedPlaidCreateLinkTokenResponse =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(plaidCreateLinkTokenResponse),
                jacksonTypeRef<PlaidCreateLinkTokenResponse>(),
            )

        assertThat(roundtrippedPlaidCreateLinkTokenResponse).isEqualTo(plaidCreateLinkTokenResponse)
    }
}
