// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.sandbox.internalaccounts

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import com.grid.api.models.invitations.CurrencyAmount
import com.grid.api.models.quotes.Currency
import com.grid.api.models.quotes.PaymentAccountOrWalletInfo
import com.grid.api.models.quotes.PaymentInstructions
import java.time.OffsetDateTime
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class InternalAccountTest {

    @Test
    fun create() {
        val internalAccount =
            InternalAccount.builder()
                .id("InternalAccount:12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                .balance(
                    CurrencyAmount.builder()
                        .amount(12550L)
                        .currency(
                            Currency.builder()
                                .code("USD")
                                .decimals(2L)
                                .name("United States Dollar")
                                .symbol("\$")
                                .build()
                        )
                        .build()
                )
                .createdAt(OffsetDateTime.parse("2025-10-03T12:30:00Z"))
                .addFundingPaymentInstruction(
                    PaymentInstructions.builder()
                        .accountOrWalletInfo(
                            PaymentInstructions.AccountOrWalletInfo.PaymentClabeAccountInfo
                                .builder()
                                .accountType(PaymentAccountOrWalletInfo.AccountType.CLABE)
                                .clabeNumber("123456789012345678")
                                .reference("UMA-Q12345-REF")
                                .build()
                        )
                        .instructionsNotes(
                            "Please ensure the reference code is included in the payment memo/description field"
                        )
                        .build()
                )
                .updatedAt(OffsetDateTime.parse("2025-10-03T12:30:00Z"))
                .customerId("Customer:019542f5-b3e7-1d02-0000-000000000001")
                .build()

        assertThat(internalAccount.id())
            .isEqualTo("InternalAccount:12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
        assertThat(internalAccount.balance())
            .isEqualTo(
                CurrencyAmount.builder()
                    .amount(12550L)
                    .currency(
                        Currency.builder()
                            .code("USD")
                            .decimals(2L)
                            .name("United States Dollar")
                            .symbol("\$")
                            .build()
                    )
                    .build()
            )
        assertThat(internalAccount.createdAt())
            .isEqualTo(OffsetDateTime.parse("2025-10-03T12:30:00Z"))
        assertThat(internalAccount.fundingPaymentInstructions())
            .containsExactly(
                PaymentInstructions.builder()
                    .accountOrWalletInfo(
                        PaymentInstructions.AccountOrWalletInfo.PaymentClabeAccountInfo.builder()
                            .accountType(PaymentAccountOrWalletInfo.AccountType.CLABE)
                            .clabeNumber("123456789012345678")
                            .reference("UMA-Q12345-REF")
                            .build()
                    )
                    .instructionsNotes(
                        "Please ensure the reference code is included in the payment memo/description field"
                    )
                    .build()
            )
        assertThat(internalAccount.updatedAt())
            .isEqualTo(OffsetDateTime.parse("2025-10-03T12:30:00Z"))
        assertThat(internalAccount.customerId())
            .isEqualTo("Customer:019542f5-b3e7-1d02-0000-000000000001")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val internalAccount =
            InternalAccount.builder()
                .id("InternalAccount:12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                .balance(
                    CurrencyAmount.builder()
                        .amount(12550L)
                        .currency(
                            Currency.builder()
                                .code("USD")
                                .decimals(2L)
                                .name("United States Dollar")
                                .symbol("\$")
                                .build()
                        )
                        .build()
                )
                .createdAt(OffsetDateTime.parse("2025-10-03T12:30:00Z"))
                .addFundingPaymentInstruction(
                    PaymentInstructions.builder()
                        .accountOrWalletInfo(
                            PaymentInstructions.AccountOrWalletInfo.PaymentClabeAccountInfo
                                .builder()
                                .accountType(PaymentAccountOrWalletInfo.AccountType.CLABE)
                                .clabeNumber("123456789012345678")
                                .reference("UMA-Q12345-REF")
                                .build()
                        )
                        .instructionsNotes(
                            "Please ensure the reference code is included in the payment memo/description field"
                        )
                        .build()
                )
                .updatedAt(OffsetDateTime.parse("2025-10-03T12:30:00Z"))
                .customerId("Customer:019542f5-b3e7-1d02-0000-000000000001")
                .build()

        val roundtrippedInternalAccount =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(internalAccount),
                jacksonTypeRef<InternalAccount>(),
            )

        assertThat(roundtrippedInternalAccount).isEqualTo(internalAccount)
    }
}
