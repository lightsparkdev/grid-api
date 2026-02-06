// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import com.grid.api.models.customers.Address
import java.time.LocalDate
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class ExternalAccountTest {

    @Test
    fun create() {
        val externalAccount =
            ExternalAccount.builder()
                .id("ExternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                .accountInfo(
                    ExternalAccountInfoOneOf.UsAccountExternalAccountInfo.builder()
                        .accountCategory(
                            ExternalAccountInfoOneOf.UsAccountExternalAccountInfo.AccountCategory
                                .CHECKING
                        )
                        .accountNumber("123456789")
                        .accountType(
                            ExternalAccountInfoOneOf.UsAccountExternalAccountInfo.AccountType
                                .US_ACCOUNT
                        )
                        .beneficiary(
                            BeneficiaryOneOf.IndividualBeneficiary.builder()
                                .beneficiaryType(
                                    BeneficiaryOneOf.IndividualBeneficiary.BeneficiaryType
                                        .INDIVIDUAL
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
                        .routingNumber("987654321")
                        .bankName("Chase Bank")
                        .build()
                )
                .currency("USD")
                .status(ExternalAccount.Status.ACTIVE)
                .customerId("Customer:da459a29-1fb7-41ce-a4cb-eb3a3c9fd7a7")
                .defaultUmaDepositAccount(false)
                .platformAccountId("acc_123456789")
                .build()

        assertThat(externalAccount.id())
            .isEqualTo("ExternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
        assertThat(externalAccount.accountInfo())
            .isEqualTo(
                ExternalAccountInfoOneOf.ofUsAccountExternalAccountInfo(
                    ExternalAccountInfoOneOf.UsAccountExternalAccountInfo.builder()
                        .accountCategory(
                            ExternalAccountInfoOneOf.UsAccountExternalAccountInfo.AccountCategory
                                .CHECKING
                        )
                        .accountNumber("123456789")
                        .accountType(
                            ExternalAccountInfoOneOf.UsAccountExternalAccountInfo.AccountType
                                .US_ACCOUNT
                        )
                        .beneficiary(
                            BeneficiaryOneOf.IndividualBeneficiary.builder()
                                .beneficiaryType(
                                    BeneficiaryOneOf.IndividualBeneficiary.BeneficiaryType
                                        .INDIVIDUAL
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
                        .routingNumber("987654321")
                        .bankName("Chase Bank")
                        .build()
                )
            )
        assertThat(externalAccount.currency()).isEqualTo("USD")
        assertThat(externalAccount.status()).isEqualTo(ExternalAccount.Status.ACTIVE)
        assertThat(externalAccount.customerId())
            .isEqualTo("Customer:da459a29-1fb7-41ce-a4cb-eb3a3c9fd7a7")
        assertThat(externalAccount.defaultUmaDepositAccount()).isEqualTo(false)
        assertThat(externalAccount.platformAccountId()).isEqualTo("acc_123456789")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccount =
            ExternalAccount.builder()
                .id("ExternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                .accountInfo(
                    ExternalAccountInfoOneOf.UsAccountExternalAccountInfo.builder()
                        .accountCategory(
                            ExternalAccountInfoOneOf.UsAccountExternalAccountInfo.AccountCategory
                                .CHECKING
                        )
                        .accountNumber("123456789")
                        .accountType(
                            ExternalAccountInfoOneOf.UsAccountExternalAccountInfo.AccountType
                                .US_ACCOUNT
                        )
                        .beneficiary(
                            BeneficiaryOneOf.IndividualBeneficiary.builder()
                                .beneficiaryType(
                                    BeneficiaryOneOf.IndividualBeneficiary.BeneficiaryType
                                        .INDIVIDUAL
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
                        .routingNumber("987654321")
                        .bankName("Chase Bank")
                        .build()
                )
                .currency("USD")
                .status(ExternalAccount.Status.ACTIVE)
                .customerId("Customer:da459a29-1fb7-41ce-a4cb-eb3a3c9fd7a7")
                .defaultUmaDepositAccount(false)
                .platformAccountId("acc_123456789")
                .build()

        val roundtrippedExternalAccount =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccount),
                jacksonTypeRef<ExternalAccount>(),
            )

        assertThat(roundtrippedExternalAccount).isEqualTo(externalAccount)
    }
}
