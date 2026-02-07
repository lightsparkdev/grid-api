// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

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
                        ExternalAccountInfoOneOf.UsAccount.builder()
                            .accountCategory(
                                ExternalAccountInfoOneOf.UsAccount.AccountCategory.CHECKING
                            )
                            .accountNumber("12345678901")
                            .beneficiary(
                                BeneficiaryOneOf.Individual.builder()
                                    .birthDate(LocalDate.parse("1990-01-15"))
                                    .fullName("John Doe")
                                    .nationality("US")
                                    .address(
                                        BeneficiaryOneOf.Individual.Address.builder()
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
                            .routingNumber("123456789")
                            .bankName("Chase Bank")
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
                            ExternalAccountInfoOneOf.UsAccount.builder()
                                .accountCategory(
                                    ExternalAccountInfoOneOf.UsAccount.AccountCategory.CHECKING
                                )
                                .accountNumber("12345678901")
                                .beneficiary(
                                    BeneficiaryOneOf.Individual.builder()
                                        .birthDate(LocalDate.parse("1990-01-15"))
                                        .fullName("John Doe")
                                        .nationality("US")
                                        .address(
                                            BeneficiaryOneOf.Individual.Address.builder()
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
                                .routingNumber("123456789")
                                .bankName("Chase Bank")
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
                        ExternalAccountInfoOneOf.UsAccount.builder()
                            .accountCategory(
                                ExternalAccountInfoOneOf.UsAccount.AccountCategory.CHECKING
                            )
                            .accountNumber("12345678901")
                            .beneficiary(
                                BeneficiaryOneOf.Individual.builder()
                                    .birthDate(LocalDate.parse("1990-01-15"))
                                    .fullName("John Doe")
                                    .nationality("US")
                                    .address(
                                        BeneficiaryOneOf.Individual.Address.builder()
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
                            .routingNumber("123456789")
                            .bankName("Chase Bank")
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
                            ExternalAccountInfoOneOf.UsAccount.builder()
                                .accountCategory(
                                    ExternalAccountInfoOneOf.UsAccount.AccountCategory.CHECKING
                                )
                                .accountNumber("12345678901")
                                .beneficiary(
                                    BeneficiaryOneOf.Individual.builder()
                                        .birthDate(LocalDate.parse("1990-01-15"))
                                        .fullName("John Doe")
                                        .nationality("US")
                                        .build()
                                )
                                .routingNumber("123456789")
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
                        ExternalAccountInfoOneOf.UsAccount.builder()
                            .accountCategory(
                                ExternalAccountInfoOneOf.UsAccount.AccountCategory.CHECKING
                            )
                            .accountNumber("12345678901")
                            .beneficiary(
                                BeneficiaryOneOf.Individual.builder()
                                    .birthDate(LocalDate.parse("1990-01-15"))
                                    .fullName("John Doe")
                                    .nationality("US")
                                    .build()
                            )
                            .routingNumber("123456789")
                            .build()
                    )
                    .currency("USD")
                    .build()
            )
    }
}
