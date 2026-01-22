// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.blocking.platform

import com.grid.api.TestServerExtension
import com.grid.api.client.okhttp.GridOkHttpClient
import com.grid.api.models.customers.Address
import com.grid.api.models.customers.externalaccounts.ExternalAccountCreate
import com.grid.api.models.customers.externalaccounts.ExternalAccountInfo
import com.grid.api.models.customers.externalaccounts.IndividualBeneficiary
import com.grid.api.models.customers.externalaccounts.UsAccountInfo
import com.grid.api.models.platform.externalaccounts.ExternalAccountListParams
import java.time.LocalDate
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(TestServerExtension::class)
internal class ExternalAccountServiceTest {

    @Disabled("Prism tests are disabled")
    @Test
    fun create() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val externalAccountService = client.platform().externalAccounts()

        val externalAccount =
            externalAccountService.create(
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

        externalAccount.validate()
    }

    @Disabled("Prism tests are disabled")
    @Test
    fun list() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val externalAccountService = client.platform().externalAccounts()

        val externalAccounts =
            externalAccountService.list(
                ExternalAccountListParams.builder().currency("currency").build()
            )

        externalAccounts.validate()
    }
}
