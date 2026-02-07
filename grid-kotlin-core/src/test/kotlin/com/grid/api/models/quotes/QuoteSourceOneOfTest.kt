// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.quotes

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.JsonValue
import com.grid.api.core.jsonMapper
import com.grid.api.errors.GridInvalidDataException
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.EnumSource

internal class QuoteSourceOneOfTest {

    @Test
    fun ofAccount() {
        val account =
            QuoteSourceOneOf.Account.builder()
                .accountId("InternalAccount:85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                .sourceType(QuoteSourceOneOf.Account.SourceType.ACCOUNT)
                .customerId("Customer:019542f5-b3e7-1d02-0000-000000000001")
                .build()

        val quoteSourceOneOf = QuoteSourceOneOf.ofAccount(account)

        assertThat(quoteSourceOneOf.account()).isEqualTo(account)
        assertThat(quoteSourceOneOf.realtimeFunding()).isNull()
    }

    @Test
    fun ofAccountRoundtrip() {
        val jsonMapper = jsonMapper()
        val quoteSourceOneOf =
            QuoteSourceOneOf.ofAccount(
                QuoteSourceOneOf.Account.builder()
                    .accountId("InternalAccount:85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                    .sourceType(QuoteSourceOneOf.Account.SourceType.ACCOUNT)
                    .customerId("Customer:019542f5-b3e7-1d02-0000-000000000001")
                    .build()
            )

        val roundtrippedQuoteSourceOneOf =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(quoteSourceOneOf),
                jacksonTypeRef<QuoteSourceOneOf>(),
            )

        assertThat(roundtrippedQuoteSourceOneOf).isEqualTo(quoteSourceOneOf)
    }

    @Test
    fun ofRealtimeFunding() {
        val realtimeFunding =
            QuoteSourceOneOf.RealtimeFunding.builder()
                .currency("USD")
                .sourceType(QuoteSourceOneOf.RealtimeFunding.SourceType.REALTIME_FUNDING)
                .customerId("Customer:019542f5-b3e7-1d02-0000-000000000009")
                .build()

        val quoteSourceOneOf = QuoteSourceOneOf.ofRealtimeFunding(realtimeFunding)

        assertThat(quoteSourceOneOf.account()).isNull()
        assertThat(quoteSourceOneOf.realtimeFunding()).isEqualTo(realtimeFunding)
    }

    @Test
    fun ofRealtimeFundingRoundtrip() {
        val jsonMapper = jsonMapper()
        val quoteSourceOneOf =
            QuoteSourceOneOf.ofRealtimeFunding(
                QuoteSourceOneOf.RealtimeFunding.builder()
                    .currency("USD")
                    .sourceType(QuoteSourceOneOf.RealtimeFunding.SourceType.REALTIME_FUNDING)
                    .customerId("Customer:019542f5-b3e7-1d02-0000-000000000009")
                    .build()
            )

        val roundtrippedQuoteSourceOneOf =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(quoteSourceOneOf),
                jacksonTypeRef<QuoteSourceOneOf>(),
            )

        assertThat(roundtrippedQuoteSourceOneOf).isEqualTo(quoteSourceOneOf)
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
        val quoteSourceOneOf =
            jsonMapper().convertValue(testCase.value, jacksonTypeRef<QuoteSourceOneOf>())

        val e = assertThrows<GridInvalidDataException> { quoteSourceOneOf.validate() }
        assertThat(e).hasMessageStartingWith("Unknown ")
    }
}
