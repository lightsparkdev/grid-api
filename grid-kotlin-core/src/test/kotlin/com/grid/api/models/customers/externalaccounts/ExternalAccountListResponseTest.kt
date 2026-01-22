// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import com.grid.api.models.customers.Address
import java.time.LocalDate
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class ExternalAccountListResponseTest {

    @Test
    fun create() {
        val externalAccountListResponse =
            ExternalAccountListResponse.builder()
                .addData(
                    ExternalAccount.builder()
                        .id("ExternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                        .accountInfo(
                            ExternalAccountInfo.UsAccount.builder()
                                .accountCategory(UsAccountInfo.AccountCategory.CHECKING)
                                .accountNumber("123456789")
                                .routingNumber("987654321")
                                .bankName("Chase Bank")
                                .beneficiary(
                                    IndividualBeneficiary.builder()
                                        .birthDate(LocalDate.parse("1990-01-15"))
                                        .fullName("John Michael Doe")
                                        .nationality("US")
                                        .address(
                                            Address.builder()
                                                .country("US")
                                                .line1("123 Main Street")
                                                .postalCode("94105")
                                                .city("San Francisco")
                                                .line2("Apt 4B")
                                                .state("CA")
                                                .build()
                                        )
                                        .build()
                                )
                                .build()
                        )
                        .currency("USD")
                        .status(ExternalAccount.Status.ACTIVE)
                        .customerId("Customer:da459a29-1fb7-41ce-a4cb-eb3a3c9fd7a7")
                        .defaultUmaDepositAccount(false)
                        .platformAccountId("acc_123456789")
                        .build()
                )
                .hasMore(true)
                .nextCursor("nextCursor")
                .totalCount(0L)
                .build()

        assertThat(externalAccountListResponse.data())
            .containsExactly(
                ExternalAccount.builder()
                    .id("ExternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                    .accountInfo(
                        ExternalAccountInfo.UsAccount.builder()
                            .accountCategory(UsAccountInfo.AccountCategory.CHECKING)
                            .accountNumber("123456789")
                            .routingNumber("987654321")
                            .bankName("Chase Bank")
                            .beneficiary(
                                IndividualBeneficiary.builder()
                                    .birthDate(LocalDate.parse("1990-01-15"))
                                    .fullName("John Michael Doe")
                                    .nationality("US")
                                    .address(
                                        Address.builder()
                                            .country("US")
                                            .line1("123 Main Street")
                                            .postalCode("94105")
                                            .city("San Francisco")
                                            .line2("Apt 4B")
                                            .state("CA")
                                            .build()
                                    )
                                    .build()
                            )
                            .build()
                    )
                    .currency("USD")
                    .status(ExternalAccount.Status.ACTIVE)
                    .customerId("Customer:da459a29-1fb7-41ce-a4cb-eb3a3c9fd7a7")
                    .defaultUmaDepositAccount(false)
                    .platformAccountId("acc_123456789")
                    .build()
            )
        assertThat(externalAccountListResponse.hasMore()).isEqualTo(true)
        assertThat(externalAccountListResponse.nextCursor()).isEqualTo("nextCursor")
        assertThat(externalAccountListResponse.totalCount()).isEqualTo(0L)
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountListResponse =
            ExternalAccountListResponse.builder()
                .addData(
                    ExternalAccount.builder()
                        .id("ExternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                        .accountInfo(
                            ExternalAccountInfo.UsAccount.builder()
                                .accountCategory(UsAccountInfo.AccountCategory.CHECKING)
                                .accountNumber("123456789")
                                .routingNumber("987654321")
                                .bankName("Chase Bank")
                                .beneficiary(
                                    IndividualBeneficiary.builder()
                                        .birthDate(LocalDate.parse("1990-01-15"))
                                        .fullName("John Michael Doe")
                                        .nationality("US")
                                        .address(
                                            Address.builder()
                                                .country("US")
                                                .line1("123 Main Street")
                                                .postalCode("94105")
                                                .city("San Francisco")
                                                .line2("Apt 4B")
                                                .state("CA")
                                                .build()
                                        )
                                        .build()
                                )
                                .build()
                        )
                        .currency("USD")
                        .status(ExternalAccount.Status.ACTIVE)
                        .customerId("Customer:da459a29-1fb7-41ce-a4cb-eb3a3c9fd7a7")
                        .defaultUmaDepositAccount(false)
                        .platformAccountId("acc_123456789")
                        .build()
                )
                .hasMore(true)
                .nextCursor("nextCursor")
                .totalCount(0L)
                .build()

        val roundtrippedExternalAccountListResponse =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountListResponse),
                jacksonTypeRef<ExternalAccountListResponse>(),
            )

        assertThat(roundtrippedExternalAccountListResponse).isEqualTo(externalAccountListResponse)
    }
}
