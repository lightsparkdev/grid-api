// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.blocking

import com.grid.api.TestServerExtension
import com.grid.api.client.okhttp.GridOkHttpClient
import com.grid.api.core.JsonValue
import com.grid.api.models.customers.Address
import com.grid.api.models.customers.CustomerCreateParams
import com.grid.api.models.customers.CustomerGetKycLinkParams
import com.grid.api.models.customers.CustomerType
import com.grid.api.models.customers.CustomerUpdateParams
import java.time.LocalDate
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(TestServerExtension::class)
internal class CustomerServiceTest {

    @Disabled("Prism tests are disabled")
    @Test
    fun create() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val customerService = client.customers()

        val customerOneOf =
            customerService.create(
                CustomerCreateParams.builder()
                    .createCustomerRequest(
                        CustomerCreateParams.CreateCustomerRequest.IndividualCustomerCreateRequest
                            .builder()
                            .customerType(CustomerType.INDIVIDUAL)
                            .platformCustomerId("9f84e0c2a72c4fa")
                            .umaAddress(JsonValue.from("\$john.doe@uma.domain.com"))
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

        customerOneOf.validate()
    }

    @Disabled("Prism tests are disabled")
    @Test
    fun retrieve() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val customerService = client.customers()

        val customer = customerService.retrieve("customerId")

        customer.validate()
    }

    @Disabled("Prism tests are disabled")
    @Test
    fun update() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val customerService = client.customers()

        val customer =
            customerService.update(
                CustomerUpdateParams.builder()
                    .customerId("customerId")
                    .updateCustomerRequest(
                        CustomerUpdateParams.UpdateCustomerRequest.IndividualCustomerUpdateRequest
                            .builder()
                            .customerType(CustomerType.INDIVIDUAL)
                            .umaAddress("\$john.doe@uma.domain.com")
                            .address(
                                Address.builder()
                                    .country("US")
                                    .line1("456 Market St")
                                    .postalCode("94103")
                                    .city("San Francisco")
                                    .line2("Apt 4B")
                                    .state("CA")
                                    .build()
                            )
                            .birthDate(LocalDate.parse("1985-06-15"))
                            .fullName("John Smith")
                            .nationality("US")
                            .build()
                    )
                    .build()
            )

        customer.validate()
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
        val customerService = client.customers()

        val page = customerService.list()

        page.response().validate()
    }

    @Disabled("Prism tests are disabled")
    @Test
    fun delete() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val customerService = client.customers()

        val customer = customerService.delete("customerId")

        customer.validate()
    }

    @Disabled("Prism tests are disabled")
    @Test
    fun getKycLink() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val customerService = client.customers()

        val response =
            customerService.getKycLink(
                CustomerGetKycLinkParams.builder()
                    .platformCustomerId("platformCustomerId")
                    .redirectUri("redirectUri")
                    .build()
            )

        response.validate()
    }

    @Disabled("Prism tests are disabled")
    @Test
    fun listInternalAccounts() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val customerService = client.customers()

        val page = customerService.listInternalAccounts()

        page.response().validate()
    }
}
