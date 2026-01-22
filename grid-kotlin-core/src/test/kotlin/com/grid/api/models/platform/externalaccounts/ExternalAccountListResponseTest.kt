// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.platform.externalaccounts

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import com.grid.api.models.customers.Address
import com.grid.api.models.customers.externalaccounts.ExternalAccount
import com.grid.api.models.customers.externalaccounts.ExternalAccountInfo
import com.grid.api.models.customers.externalaccounts.IndividualBeneficiary
import com.grid.api.models.customers.externalaccounts.UsAccountInfo
import java.time.LocalDate
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class ExternalAccountListResponseTest {

    @Test
    fun create() {
        val externalAccountListResponse =
            ExternalAccountListResponse.builder()
                .addAccount(
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
                                        .beneficiaryType(
                                            IndividualBeneficiary.BeneficiaryType.INDIVIDUAL
                                        )
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
                .build()

        assertThat(externalAccountListResponse.accounts())
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
                                    .beneficiaryType(
                                        IndividualBeneficiary.BeneficiaryType.INDIVIDUAL
                                    )
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
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountListResponse =
            ExternalAccountListResponse.builder()
                .addAccount(
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
                                        .beneficiaryType(
                                            IndividualBeneficiary.BeneficiaryType.INDIVIDUAL
                                        )
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
                .build()

        val roundtrippedExternalAccountListResponse =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountListResponse),
                jacksonTypeRef<ExternalAccountListResponse>(),
            )

        assertThat(roundtrippedExternalAccountListResponse).isEqualTo(externalAccountListResponse)
    }
}
