// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.tokens

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import java.time.OffsetDateTime
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class TokenListPageResponseTest {

    @Test
    fun create() {
        val tokenListPageResponse =
            TokenListPageResponse.builder()
                .addData(
                    ApiToken.builder()
                        .id("Token:019542f5-b3e7-1d02-0000-000000000001")
                        .clientId("01947d2284054f890000e63bca4810df")
                        .createdAt(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
                        .name("Sandbox read-only token")
                        .addPermission(Permission.VIEW)
                        .updatedAt(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
                        .clientSecret("ed0ad25881e234cc28fb2dec0a4fe64e4172")
                        .build()
                )
                .hasMore(true)
                .nextCursor("nextCursor")
                .totalCount(0L)
                .build()

        assertThat(tokenListPageResponse.data())
            .containsExactly(
                ApiToken.builder()
                    .id("Token:019542f5-b3e7-1d02-0000-000000000001")
                    .clientId("01947d2284054f890000e63bca4810df")
                    .createdAt(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
                    .name("Sandbox read-only token")
                    .addPermission(Permission.VIEW)
                    .updatedAt(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
                    .clientSecret("ed0ad25881e234cc28fb2dec0a4fe64e4172")
                    .build()
            )
        assertThat(tokenListPageResponse.hasMore()).isEqualTo(true)
        assertThat(tokenListPageResponse.nextCursor()).isEqualTo("nextCursor")
        assertThat(tokenListPageResponse.totalCount()).isEqualTo(0L)
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val tokenListPageResponse =
            TokenListPageResponse.builder()
                .addData(
                    ApiToken.builder()
                        .id("Token:019542f5-b3e7-1d02-0000-000000000001")
                        .clientId("01947d2284054f890000e63bca4810df")
                        .createdAt(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
                        .name("Sandbox read-only token")
                        .addPermission(Permission.VIEW)
                        .updatedAt(OffsetDateTime.parse("2025-07-21T17:32:28Z"))
                        .clientSecret("ed0ad25881e234cc28fb2dec0a4fe64e4172")
                        .build()
                )
                .hasMore(true)
                .nextCursor("nextCursor")
                .totalCount(0L)
                .build()

        val roundtrippedTokenListPageResponse =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(tokenListPageResponse),
                jacksonTypeRef<TokenListPageResponse>(),
            )

        assertThat(roundtrippedTokenListPageResponse).isEqualTo(tokenListPageResponse)
    }
}
