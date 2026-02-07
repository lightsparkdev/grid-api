// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.tokens

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import java.time.OffsetDateTime
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class ApiTokenTest {

    @Test
    fun create() {
        val apiToken =
            ApiToken.builder()
                .id("Token:019542f5-b3e7-1d02-0000-000000000001")
                .clientId("01947d2284054f890000e63bca4810df")
                .createdAt(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
                .name("Sandbox read-only token")
                .addPermission(Permission.VIEW)
                .updatedAt(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
                .clientSecret("ed0ad25881e234cc28fb2dec0a4fe64e4172")
                .build()

        assertThat(apiToken.id()).isEqualTo("Token:019542f5-b3e7-1d02-0000-000000000001")
        assertThat(apiToken.clientId()).isEqualTo("01947d2284054f890000e63bca4810df")
        assertThat(apiToken.createdAt()).isEqualTo(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
        assertThat(apiToken.name()).isEqualTo("Sandbox read-only token")
        assertThat(apiToken.permissions()).containsExactly(Permission.VIEW)
        assertThat(apiToken.updatedAt()).isEqualTo(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
        assertThat(apiToken.clientSecret()).isEqualTo("ed0ad25881e234cc28fb2dec0a4fe64e4172")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val apiToken =
            ApiToken.builder()
                .id("Token:019542f5-b3e7-1d02-0000-000000000001")
                .clientId("01947d2284054f890000e63bca4810df")
                .createdAt(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
                .name("Sandbox read-only token")
                .addPermission(Permission.VIEW)
                .updatedAt(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
                .clientSecret("ed0ad25881e234cc28fb2dec0a4fe64e4172")
                .build()

        val roundtrippedApiToken =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(apiToken),
                jacksonTypeRef<ApiToken>(),
            )

        assertThat(roundtrippedApiToken).isEqualTo(apiToken)
    }
}
