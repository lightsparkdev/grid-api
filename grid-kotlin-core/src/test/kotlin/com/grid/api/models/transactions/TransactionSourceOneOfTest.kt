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
    fun ofAccount() {
        val account =
            TransactionSourceOneOf.Account.builder()
                .currency("USD")
                .accountId("InternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                .sourceType(TransactionSourceOneOf.Account.SourceType.ACCOUNT)
                .build()

        val transactionSourceOneOf = TransactionSourceOneOf.ofAccount(account)

        assertThat(transactionSourceOneOf.account()).isEqualTo(account)
        assertThat(transactionSourceOneOf.umaAddress()).isNull()
    }

    @Test
    fun ofAccountRoundtrip() {
        val jsonMapper = jsonMapper()
        val transactionSourceOneOf =
            TransactionSourceOneOf.ofAccount(
                TransactionSourceOneOf.Account.builder()
                    .currency("USD")
                    .accountId("InternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                    .sourceType(TransactionSourceOneOf.Account.SourceType.ACCOUNT)
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
    fun ofUmaAddress() {
        val umaAddress =
            TransactionSourceOneOf.UmaAddress.builder()
                .currency("USD")
                .sourceType(TransactionSourceOneOf.UmaAddress.SourceType.UMA_ADDRESS)
                .umaAddress("\$sender@uma.domain.com")
                .build()

        val transactionSourceOneOf = TransactionSourceOneOf.ofUmaAddress(umaAddress)

        assertThat(transactionSourceOneOf.account()).isNull()
        assertThat(transactionSourceOneOf.umaAddress()).isEqualTo(umaAddress)
    }

    @Test
    fun ofUmaAddressRoundtrip() {
        val jsonMapper = jsonMapper()
        val transactionSourceOneOf =
            TransactionSourceOneOf.ofUmaAddress(
                TransactionSourceOneOf.UmaAddress.builder()
                    .currency("USD")
                    .sourceType(TransactionSourceOneOf.UmaAddress.SourceType.UMA_ADDRESS)
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
