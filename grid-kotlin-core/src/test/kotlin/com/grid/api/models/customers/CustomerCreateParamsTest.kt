// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers

import java.time.LocalDate
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class CustomerCreateParamsTest {

    @Test
    fun create() {
        CustomerCreateParams.builder()
            .createCustomerRequest(
                CustomerCreateParams.CreateCustomerRequest.Individual.builder()
                    .platformCustomerId("9f84e0c2a72c4fa")
                    .umaAddress("\$john.doe@uma.domain.com")
                    .customerType(
                        CustomerCreateParams.CreateCustomerRequest.Individual.CustomerType
                            .INDIVIDUAL
                    )
                    .address(
                        CustomerCreateParams.CreateCustomerRequest.Individual.Address.builder()
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
    }

    @Test
    fun body() {
        val params =
            CustomerCreateParams.builder()
                .createCustomerRequest(
                    CustomerCreateParams.CreateCustomerRequest.Individual.builder()
                        .platformCustomerId("9f84e0c2a72c4fa")
                        .umaAddress("\$john.doe@uma.domain.com")
                        .customerType(
                            CustomerCreateParams.CreateCustomerRequest.Individual.CustomerType
                                .INDIVIDUAL
                        )
                        .address(
                            CustomerCreateParams.CreateCustomerRequest.Individual.Address.builder()
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

        val body = params._body()

        assertThat(body)
            .isEqualTo(
                CustomerCreateParams.CreateCustomerRequest.ofIndividual(
                    CustomerCreateParams.CreateCustomerRequest.Individual.builder()
                        .platformCustomerId("9f84e0c2a72c4fa")
                        .umaAddress("\$john.doe@uma.domain.com")
                        .customerType(
                            CustomerCreateParams.CreateCustomerRequest.Individual.CustomerType
                                .INDIVIDUAL
                        )
                        .address(
                            CustomerCreateParams.CreateCustomerRequest.Individual.Address.builder()
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
            )
    }

    @Test
    fun bodyWithoutOptionalFields() {
        val params =
            CustomerCreateParams.builder()
                .individualCreateCustomerRequest("9f84e0c2a72c4fa")
                .build()

        val body = params._body()

        assertThat(body)
            .isEqualTo(
                CustomerCreateParams.CreateCustomerRequest.ofIndividual(
                    CustomerCreateParams.CreateCustomerRequest.Individual.builder()
                        .platformCustomerId("9f84e0c2a72c4fa")
                        .customerType(
                            CustomerCreateParams.CreateCustomerRequest.Individual.CustomerType
                                .INDIVIDUAL
                        )
                        .build()
                )
            )
    }
}
