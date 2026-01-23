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

internal class QuoteSourceTest {

    @Test
    fun ofAccount() {
        val account =
            QuoteSource.Account.builder()
                .accountId("InternalAccount:85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                .build()

        val quoteSource = QuoteSource.ofAccount(account)

        assertThat(quoteSource.account()).isEqualTo(account)
        assertThat(quoteSource.realtimeFunding()).isNull()
    }

    @Test
    fun ofAccountRoundtrip() {
        val jsonMapper = jsonMapper()
        val quoteSource =
            QuoteSource.ofAccount(
                QuoteSource.Account.builder()
                    .accountId("InternalAccount:85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                    .build()
            )

        val roundtrippedQuoteSource =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(quoteSource),
                jacksonTypeRef<QuoteSource>(),
            )

        assertThat(roundtrippedQuoteSource).isEqualTo(quoteSource)
    }

    @Test
    fun ofRealtimeFunding() {
        val realtimeFunding =
            QuoteSource.RealtimeFunding.builder()
                .currency("USD")
                .customerId("Customer:019542f5-b3e7-1d02-0000-000000000009")
                .build()

        val quoteSource = QuoteSource.ofRealtimeFunding(realtimeFunding)

        assertThat(quoteSource.account()).isNull()
        assertThat(quoteSource.realtimeFunding()).isEqualTo(realtimeFunding)
    }

    @Test
    fun ofRealtimeFundingRoundtrip() {
        val jsonMapper = jsonMapper()
        val quoteSource =
            QuoteSource.ofRealtimeFunding(
                QuoteSource.RealtimeFunding.builder()
                    .currency("USD")
                    .customerId("Customer:019542f5-b3e7-1d02-0000-000000000009")
                    .build()
            )

        val roundtrippedQuoteSource =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(quoteSource),
                jacksonTypeRef<QuoteSource>(),
            )

        assertThat(roundtrippedQuoteSource).isEqualTo(quoteSource)
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
        val quoteSource = jsonMapper().convertValue(testCase.value, jacksonTypeRef<QuoteSource>())

        val e = assertThrows<GridInvalidDataException> { quoteSource.validate() }
        assertThat(e).hasMessageStartingWith("Unknown ")
    }
}
