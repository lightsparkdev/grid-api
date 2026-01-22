// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.grid.api.models.customers.Address
import java.time.LocalDate
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class ExternalAccountCreateParamsTest {

    @Test
    fun create() {
        ExternalAccountCreateParams.builder()
            .externalAccountCreate(
                ExternalAccountCreate.builder()
                    .accountInfo(
                        ExternalAccountInfo.UsAccount.builder()
                            .accountCategory(UsAccountInfo.AccountCategory.CHECKING)
                            .accountNumber("12345678901")
                            .routingNumber("123456789")
                            .bankName("Chase Bank")
                            .beneficiary(
                                IndividualBeneficiary.builder()
                                    .birthDate(LocalDate.parse("1990-01-15"))
                                    .fullName("John Doe")
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
                    .customerId("Customer:019542f5-b3e7-1d02-0000-000000000001")
                    .defaultUmaDepositAccount(true)
                    .platformAccountId("ext_acc_123456")
                    .build()
            )
            .build()
    }

    @Test
    fun body() {
        val params =
            ExternalAccountCreateParams.builder()
                .externalAccountCreate(
                    ExternalAccountCreate.builder()
                        .accountInfo(
                            ExternalAccountInfo.UsAccount.builder()
                                .accountCategory(UsAccountInfo.AccountCategory.CHECKING)
                                .accountNumber("12345678901")
                                .routingNumber("123456789")
                                .bankName("Chase Bank")
                                .beneficiary(
                                    IndividualBeneficiary.builder()
                                        .birthDate(LocalDate.parse("1990-01-15"))
                                        .fullName("John Doe")
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
                        .customerId("Customer:019542f5-b3e7-1d02-0000-000000000001")
                        .defaultUmaDepositAccount(true)
                        .platformAccountId("ext_acc_123456")
                        .build()
                )
                .build()

        val body = params._body()

        assertThat(body)
            .isEqualTo(
                ExternalAccountCreate.builder()
                    .accountInfo(
                        ExternalAccountInfo.UsAccount.builder()
                            .accountCategory(UsAccountInfo.AccountCategory.CHECKING)
                            .accountNumber("12345678901")
                            .routingNumber("123456789")
                            .bankName("Chase Bank")
                            .beneficiary(
                                IndividualBeneficiary.builder()
                                    .birthDate(LocalDate.parse("1990-01-15"))
                                    .fullName("John Doe")
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
                    .customerId("Customer:019542f5-b3e7-1d02-0000-000000000001")
                    .defaultUmaDepositAccount(true)
                    .platformAccountId("ext_acc_123456")
                    .build()
            )
    }

    @Test
    fun bodyWithoutOptionalFields() {
        val params =
            ExternalAccountCreateParams.builder()
                .externalAccountCreate(
                    ExternalAccountCreate.builder()
                        .accountInfo(
                            ExternalAccountInfo.UsAccount.builder()
                                .accountCategory(UsAccountInfo.AccountCategory.CHECKING)
                                .accountNumber("12345678901")
                                .routingNumber("123456789")
                                .beneficiary(
                                    IndividualBeneficiary.builder()
                                        .birthDate(LocalDate.parse("1990-01-15"))
                                        .fullName("John Doe")
                                        .nationality("US")
                                        .build()
                                )
                                .build()
                        )
                        .currency("USD")
                        .build()
                )
                .build()

        val body = params._body()

        assertThat(body)
            .isEqualTo(
                ExternalAccountCreate.builder()
                    .accountInfo(
                        ExternalAccountInfo.UsAccount.builder()
                            .accountCategory(UsAccountInfo.AccountCategory.CHECKING)
                            .accountNumber("12345678901")
                            .routingNumber("123456789")
                            .beneficiary(
                                IndividualBeneficiary.builder()
                                    .birthDate(LocalDate.parse("1990-01-15"))
                                    .fullName("John Doe")
                                    .nationality("US")
                                    .build()
                            )
                            .build()
                    )
                    .currency("USD")
                    .build()
            )
    }
}
