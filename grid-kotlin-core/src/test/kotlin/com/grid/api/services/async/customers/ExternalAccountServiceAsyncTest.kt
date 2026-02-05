// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.async.customers

import com.grid.api.TestServerExtension
import com.grid.api.client.okhttp.GridOkHttpClientAsync
import com.grid.api.models.customers.Address
import com.grid.api.models.customers.externalaccounts.BaseBeneficiary
import com.grid.api.models.customers.externalaccounts.BaseExternalAccountInfo
import com.grid.api.models.customers.externalaccounts.ExternalAccountCreate
import com.grid.api.models.customers.externalaccounts.ExternalAccountInfoOneOf
import com.grid.api.models.customers.externalaccounts.IndividualBeneficiary
import com.grid.api.models.customers.externalaccounts.UsAccountInfo
import java.time.LocalDate
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(TestServerExtension::class)
internal class ExternalAccountServiceAsyncTest {

    @Disabled("Prism tests are disabled")
    @Test
    suspend fun create() {
        val client =
            GridOkHttpClientAsync.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val externalAccountServiceAsync = client.customers().externalAccounts()

        val externalAccount =
            externalAccountServiceAsync.create(
                ExternalAccountCreate.builder()
                    .accountInfo(
                        ExternalAccountInfoOneOf.UsAccountExternalAccountInfo.builder()
                            .accountType(BaseExternalAccountInfo.AccountType.US_ACCOUNT)
                            .accountCategory(UsAccountInfo.AccountCategory.CHECKING)
                            .accountNumber("12345678901")
                            .routingNumber("123456789")
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
                                    .fullName("John Doe")
                                    .nationality("US")
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
    suspend fun list() {
        val client =
            GridOkHttpClientAsync.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val externalAccountServiceAsync = client.customers().externalAccounts()

        val page = externalAccountServiceAsync.list()

        page.response().validate()
    }
}
