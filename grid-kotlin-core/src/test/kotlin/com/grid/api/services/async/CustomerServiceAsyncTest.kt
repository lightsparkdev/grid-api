// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.async

import com.grid.api.TestServerExtension
import com.grid.api.client.okhttp.GridOkHttpClientAsync
import com.grid.api.models.customers.Address
import com.grid.api.models.customers.CustomerCreateParams
import com.grid.api.models.customers.CustomerGetKycLinkParams
import com.grid.api.models.customers.CustomerUpdateParams
import java.time.LocalDate
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(TestServerExtension::class)
internal class CustomerServiceAsyncTest {

    @Disabled("Prism tests are disabled")
    @Test
    suspend fun create() {
        val client =
            GridOkHttpClientAsync.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val customerServiceAsync = client.customers()

        val customer =
            customerServiceAsync.create(
                CustomerCreateParams.builder()
                    .createCustomerRequest(
                        CustomerCreateParams.CreateCustomerRequest.CustomersIndividualCustomerUpdate
                            .builder()
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
                            .platformCustomerId("9f84e0c2a72c4fa")
                            .umaAddress("\$john.doe@uma.domain.com")
                            .build()
                    )
                    .build()
            )

        customer.validate()
    }

    @Disabled("Prism tests are disabled")
    @Test
    suspend fun retrieve() {
        val client =
            GridOkHttpClientAsync.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val customerServiceAsync = client.customers()

        val customer = customerServiceAsync.retrieve("customerId")

        customer.validate()
    }

    @Disabled("Prism tests are disabled")
    @Test
    suspend fun update() {
        val client =
            GridOkHttpClientAsync.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val customerServiceAsync = client.customers()

        val customer =
            customerServiceAsync.update(
                CustomerUpdateParams.builder()
                    .customerId("customerId")
                    .updateCustomerRequest(
                        CustomerUpdateParams.UpdateCustomerRequest.CustomersIndividualCustomerUpdate
                            .builder()
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
                            .platformCustomerId("9f84e0c2a72c4fa")
                            .umaAddress("\$john.doe@uma.domain.com")
                            .build()
                    )
                    .build()
            )

        customer.validate()
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
        val customerServiceAsync = client.customers()

        val page = customerServiceAsync.list()

        page.response().validate()
    }

    @Disabled("Prism tests are disabled")
    @Test
    suspend fun delete() {
        val client =
            GridOkHttpClientAsync.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val customerServiceAsync = client.customers()

        val customer = customerServiceAsync.delete("customerId")

        customer.validate()
    }

    @Disabled("Prism tests are disabled")
    @Test
    suspend fun getKycLink() {
        val client =
            GridOkHttpClientAsync.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val customerServiceAsync = client.customers()

        val response =
            customerServiceAsync.getKycLink(
                CustomerGetKycLinkParams.builder()
                    .platformCustomerId("platformCustomerId")
                    .redirectUri("redirectUri")
                    .build()
            )

        response.validate()
    }

    @Disabled("Prism tests are disabled")
    @Test
    suspend fun listInternalAccounts() {
        val client =
            GridOkHttpClientAsync.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val customerServiceAsync = client.customers()

        val page = customerServiceAsync.listInternalAccounts()

        page.response().validate()
    }
}
