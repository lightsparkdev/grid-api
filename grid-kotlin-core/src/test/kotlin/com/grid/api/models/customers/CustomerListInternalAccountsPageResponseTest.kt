// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import com.grid.api.models.invitations.CurrencyAmount
import com.grid.api.models.quotes.BasePaymentAccountInfo
import com.grid.api.models.quotes.Currency
import com.grid.api.models.quotes.PaymentInstructions
import com.grid.api.models.sandbox.internalaccounts.InternalAccount
import java.time.OffsetDateTime
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class CustomerListInternalAccountsPageResponseTest {

    @Test
    fun create() {
        val customerListInternalAccountsPageResponse =
            CustomerListInternalAccountsPageResponse.builder()
                .addData(
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
                                        .accountType(BasePaymentAccountInfo.AccountType.CLABE)
                                        .clabeNumber("123456789012345678")
                                        .reference("UMA-Q12345-REF")
                                        .build()
                                )
                                .instructionsNotes(
                                    "Please ensure the reference code is included in the payment memo/description field"
                                )
                                .isPlatformAccount(true)
                                .build()
                        )
                        .updatedAt(OffsetDateTime.parse("2025-10-03T12:30:00Z"))
                        .customerId("Customer:019542f5-b3e7-1d02-0000-000000000001")
                        .build()
                )
                .hasMore(true)
                .nextCursor("nextCursor")
                .totalCount(0L)
                .build()

        assertThat(customerListInternalAccountsPageResponse.data())
            .containsExactly(
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
                                    .accountType(BasePaymentAccountInfo.AccountType.CLABE)
                                    .clabeNumber("123456789012345678")
                                    .reference("UMA-Q12345-REF")
                                    .build()
                            )
                            .instructionsNotes(
                                "Please ensure the reference code is included in the payment memo/description field"
                            )
                            .isPlatformAccount(true)
                            .build()
                    )
                    .updatedAt(OffsetDateTime.parse("2025-10-03T12:30:00Z"))
                    .customerId("Customer:019542f5-b3e7-1d02-0000-000000000001")
                    .build()
            )
        assertThat(customerListInternalAccountsPageResponse.hasMore()).isEqualTo(true)
        assertThat(customerListInternalAccountsPageResponse.nextCursor()).isEqualTo("nextCursor")
        assertThat(customerListInternalAccountsPageResponse.totalCount()).isEqualTo(0L)
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val customerListInternalAccountsPageResponse =
            CustomerListInternalAccountsPageResponse.builder()
                .addData(
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
                                        .accountType(BasePaymentAccountInfo.AccountType.CLABE)
                                        .clabeNumber("123456789012345678")
                                        .reference("UMA-Q12345-REF")
                                        .build()
                                )
                                .instructionsNotes(
                                    "Please ensure the reference code is included in the payment memo/description field"
                                )
                                .isPlatformAccount(true)
                                .build()
                        )
                        .updatedAt(OffsetDateTime.parse("2025-10-03T12:30:00Z"))
                        .customerId("Customer:019542f5-b3e7-1d02-0000-000000000001")
                        .build()
                )
                .hasMore(true)
                .nextCursor("nextCursor")
                .totalCount(0L)
                .build()

        val roundtrippedCustomerListInternalAccountsPageResponse =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(customerListInternalAccountsPageResponse),
                jacksonTypeRef<CustomerListInternalAccountsPageResponse>(),
            )

        assertThat(roundtrippedCustomerListInternalAccountsPageResponse)
            .isEqualTo(customerListInternalAccountsPageResponse)
    }
}
