// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.transactions

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.JsonValue
import com.grid.api.core.jsonMapper
import com.grid.api.errors.GridInvalidDataException
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.EnumSource

internal class TransactionSourceOneOfTest {

    @Test
    fun ofAccountTransactionSource() {
        val accountTransactionSource =
            TransactionSourceOneOf.AccountTransactionSource.builder()
                .sourceType(BaseTransactionSource.SourceType.ACCOUNT)
                .currency("USD")
                .accountId("InternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                .build()

        val transactionSourceOneOf =
            TransactionSourceOneOf.ofAccountTransactionSource(accountTransactionSource)

        assertThat(transactionSourceOneOf.accountTransactionSource())
            .isEqualTo(accountTransactionSource)
        assertThat(transactionSourceOneOf.umaAddressTransactionSource()).isNull()
    }

    @Test
    fun ofAccountTransactionSourceRoundtrip() {
        val jsonMapper = jsonMapper()
        val transactionSourceOneOf =
            TransactionSourceOneOf.ofAccountTransactionSource(
                TransactionSourceOneOf.AccountTransactionSource.builder()
                    .sourceType(BaseTransactionSource.SourceType.ACCOUNT)
                    .currency("USD")
                    .accountId("InternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                    .build()
            )

        val roundtrippedTransactionSourceOneOf =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(transactionSourceOneOf),
                jacksonTypeRef<TransactionSourceOneOf>(),
            )

        assertThat(roundtrippedTransactionSourceOneOf).isEqualTo(transactionSourceOneOf)
    }

    @Test
    fun ofUmaAddressTransactionSource() {
        val umaAddressTransactionSource =
            TransactionSourceOneOf.UmaAddressTransactionSource.builder()
                .sourceType(BaseTransactionSource.SourceType.ACCOUNT)
                .currency("USD")
                .umaAddress("\$sender@uma.domain.com")
                .build()

        val transactionSourceOneOf =
            TransactionSourceOneOf.ofUmaAddressTransactionSource(umaAddressTransactionSource)

        assertThat(transactionSourceOneOf.accountTransactionSource()).isNull()
        assertThat(transactionSourceOneOf.umaAddressTransactionSource())
            .isEqualTo(umaAddressTransactionSource)
    }

    @Test
    fun ofUmaAddressTransactionSourceRoundtrip() {
        val jsonMapper = jsonMapper()
        val transactionSourceOneOf =
            TransactionSourceOneOf.ofUmaAddressTransactionSource(
                TransactionSourceOneOf.UmaAddressTransactionSource.builder()
                    .sourceType(BaseTransactionSource.SourceType.ACCOUNT)
                    .currency("USD")
                    .umaAddress("\$sender@uma.domain.com")
                    .build()
            )

        val roundtrippedTransactionSourceOneOf =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(transactionSourceOneOf),
                jacksonTypeRef<TransactionSourceOneOf>(),
            )

        assertThat(roundtrippedTransactionSourceOneOf).isEqualTo(transactionSourceOneOf)
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
        val transactionSourceOneOf =
            jsonMapper().convertValue(testCase.value, jacksonTypeRef<TransactionSourceOneOf>())

        val e = assertThrows<GridInvalidDataException> { transactionSourceOneOf.validate() }
        assertThat(e).hasMessageStartingWith("Unknown ")
    }
}
