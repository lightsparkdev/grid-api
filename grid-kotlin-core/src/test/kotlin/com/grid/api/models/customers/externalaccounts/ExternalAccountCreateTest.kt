// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import com.grid.api.models.customers.Address
import java.time.LocalDate
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class ExternalAccountCreateTest {

    @Test
    fun create() {
        val externalAccountCreate =
            ExternalAccountCreate.builder()
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
                .customerId("Customer:019542f5-b3e7-1d02-0000-000000000001")
                .defaultUmaDepositAccount(true)
                .platformAccountId("ext_acc_123456")
                .build()

        assertThat(externalAccountCreate.accountInfo())
            .isEqualTo(
                ExternalAccountInfo.ofUsAccount(
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
            )
        assertThat(externalAccountCreate.currency()).isEqualTo("USD")
        assertThat(externalAccountCreate.customerId())
            .isEqualTo("Customer:019542f5-b3e7-1d02-0000-000000000001")
        assertThat(externalAccountCreate.defaultUmaDepositAccount()).isEqualTo(true)
        assertThat(externalAccountCreate.platformAccountId()).isEqualTo("ext_acc_123456")
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val externalAccountCreate =
            ExternalAccountCreate.builder()
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
                .customerId("Customer:019542f5-b3e7-1d02-0000-000000000001")
                .defaultUmaDepositAccount(true)
                .platformAccountId("ext_acc_123456")
                .build()

        val roundtrippedExternalAccountCreate =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(externalAccountCreate),
                jacksonTypeRef<ExternalAccountCreate>(),
            )

        assertThat(roundtrippedExternalAccountCreate).isEqualTo(externalAccountCreate)
    }
}
