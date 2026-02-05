// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class SolanaWalletInfoTest {

    @Test
    fun create() {
        val solanaWalletInfo =
            SolanaWalletInfo.builder()
                .accountType(SolanaWalletInfo.AccountType.SOLANA_WALLET)
                .address("4Nd1m6Qkq7RfKuE5vQ9qP9Tn6H94Ueqb4xXHzsAbd8Wg")
                .build()

        assertThat(solanaWalletInfo.accountType())
            .isEqualTo(SolanaWalletInfo.AccountType.SOLANA_WALLET)
        assertThat(solanaWalletInfo.address())
            .isEqualTo("4Nd1m6Qkq7RfKuE5vQ9qP9Tn6H94Ueqb4xXHzsAbd8Wg")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val solanaWalletInfo =
            SolanaWalletInfo.builder()
                .accountType(SolanaWalletInfo.AccountType.SOLANA_WALLET)
                .address("4Nd1m6Qkq7RfKuE5vQ9qP9Tn6H94Ueqb4xXHzsAbd8Wg")
                .build()

        val roundtrippedSolanaWalletInfo =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(solanaWalletInfo),
                jacksonTypeRef<SolanaWalletInfo>(),
            )

        assertThat(roundtrippedSolanaWalletInfo).isEqualTo(solanaWalletInfo)
    }
}
