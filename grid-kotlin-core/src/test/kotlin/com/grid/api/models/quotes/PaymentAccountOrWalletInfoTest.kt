// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.quotes

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class PaymentAccountOrWalletInfoTest {

    @Test
    fun create() {
        val paymentAccountOrWalletInfo =
            PaymentAccountOrWalletInfo.builder()
                .accountType(PaymentAccountOrWalletInfo.AccountType.CLABE)
                .build()

        assertThat(paymentAccountOrWalletInfo.accountType())
            .isEqualTo(PaymentAccountOrWalletInfo.AccountType.CLABE)
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val paymentAccountOrWalletInfo =
            PaymentAccountOrWalletInfo.builder()
                .accountType(PaymentAccountOrWalletInfo.AccountType.CLABE)
                .build()

        val roundtrippedPaymentAccountOrWalletInfo =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(paymentAccountOrWalletInfo),
                jacksonTypeRef<PaymentAccountOrWalletInfo>(),
            )

        assertThat(roundtrippedPaymentAccountOrWalletInfo).isEqualTo(paymentAccountOrWalletInfo)
    }
}
