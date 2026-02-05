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
                        .accountType(BaseExternalAccountInfo.AccountType.US_ACCOUNT)
                        .accountCategory(UsAccountInfo.AccountCategory.CHECKING)
                        .accountNumber("123456789")
                        .routingNumber("987654321")
                        .bankName("Chase Bank")
                        .beneficiary(
                            IndividualBeneficiary.builder()
                                .beneficiaryType(BaseBeneficiary.BeneficiaryType.INDIVIDUAL)
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
                                .birthDate(LocalDate.parse("1990-01-15"))
                                .fullName("John Michael Doe")
                                .nationality("US")
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

        assertThat(externalAccount.id())
            .isEqualTo("ExternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
        assertThat(externalAccount.accountInfo())
            .isEqualTo(
                ExternalAccountInfoOneOf.ofUsAccountExternalAccountInfo(
                    ExternalAccountInfoOneOf.UsAccountExternalAccountInfo.builder()
                        .accountType(BaseExternalAccountInfo.AccountType.US_ACCOUNT)
                        .accountCategory(UsAccountInfo.AccountCategory.CHECKING)
                        .accountNumber("123456789")
                        .routingNumber("987654321")
                        .bankName("Chase Bank")
                        .beneficiary(
                            IndividualBeneficiary.builder()
                                .beneficiaryType(BaseBeneficiary.BeneficiaryType.INDIVIDUAL)
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
                                .birthDate(LocalDate.parse("1990-01-15"))
                                .fullName("John Michael Doe")
                                .nationality("US")
                                .build()
                        )
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
                        .accountType(BaseExternalAccountInfo.AccountType.US_ACCOUNT)
                        .accountCategory(UsAccountInfo.AccountCategory.CHECKING)
                        .accountNumber("123456789")
                        .routingNumber("987654321")
                        .bankName("Chase Bank")
                        .beneficiary(
                            IndividualBeneficiary.builder()
                                .beneficiaryType(BaseBeneficiary.BeneficiaryType.INDIVIDUAL)
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
                                .birthDate(LocalDate.parse("1990-01-15"))
                                .fullName("John Michael Doe")
                                .nationality("US")
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

        val roundtrippedExternalAccount =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccount),
                jacksonTypeRef<ExternalAccount>(),
            )

        assertThat(roundtrippedExternalAccount).isEqualTo(externalAccount)
    }
}
