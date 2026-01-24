// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.transactions

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class AccountSourceTest {

    @Test
    fun create() {
        val accountSource =
            AccountSource.builder()
                .accountId("InternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                .currency("USD")
                .build()

        assertThat(accountSource.accountId())
            .isEqualTo("InternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
        assertThat(accountSource.currency()).isEqualTo("USD")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val accountSource =
            AccountSource.builder()
                .accountId("InternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                .currency("USD")
                .build()

        val roundtrippedAccountSource =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(accountSource),
                jacksonTypeRef<AccountSource>(),
            )

        assertThat(roundtrippedAccountSource).isEqualTo(accountSource)
    }
}
