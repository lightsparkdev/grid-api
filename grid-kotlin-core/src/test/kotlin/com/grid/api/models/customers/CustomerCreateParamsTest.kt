// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers

import java.time.LocalDate
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class CustomerCreateParamsTest {

    @Test
    fun create() {
        CustomerCreateParams.builder()
            .body(
                CustomerCreateParams.Body.CustomersIndividualCustomerUpdate.builder()
                    .address(
                        Address.builder()
                            .country("US")
                            .line1("123 Pine Street")
                            .postalCode("98101")
                            .city("Seattle")
                            .line2("Unit 501")
                            .state("WA")
                            .build()
                    )
                    .birthDate(LocalDate.parse("1992-03-25"))
                    .fullName("Jane Doe")
                    .nationality("US")
                    .platformCustomerId("7b3c5a89d2f1e0")
                    .umaAddress("\$jane.doe@uma.domain.com")
                    .build()
            )
            .build()
    }

    @Test
    fun body() {
        val params =
            CustomerCreateParams.builder()
                .body(
                    CustomerCreateParams.Body.CustomersIndividualCustomerUpdate.builder()
                        .address(
                            Address.builder()
                                .country("US")
                                .line1("123 Pine Street")
                                .postalCode("98101")
                                .city("Seattle")
                                .line2("Unit 501")
                                .state("WA")
                                .build()
                        )
                        .birthDate(LocalDate.parse("1992-03-25"))
                        .fullName("Jane Doe")
                        .nationality("US")
                        .platformCustomerId("7b3c5a89d2f1e0")
                        .umaAddress("\$jane.doe@uma.domain.com")
                        .build()
                )
                .build()

        val body = params._body()

        assertThat(body)
            .isEqualTo(
                CustomerCreateParams.Body.ofCustomersIndividualCustomerUpdate(
                    CustomerCreateParams.Body.CustomersIndividualCustomerUpdate.builder()
                        .address(
                            Address.builder()
                                .country("US")
                                .line1("123 Pine Street")
                                .postalCode("98101")
                                .city("Seattle")
                                .line2("Unit 501")
                                .state("WA")
                                .build()
                        )
                        .birthDate(LocalDate.parse("1992-03-25"))
                        .fullName("Jane Doe")
                        .nationality("US")
                        .platformCustomerId("7b3c5a89d2f1e0")
                        .umaAddress("\$jane.doe@uma.domain.com")
                        .build()
                )
            )
    }

    @Test
    fun bodyWithoutOptionalFields() {
        val params =
            CustomerCreateParams.builder()
                .body(CustomerCreateParams.Body.CustomersIndividualCustomerUpdate.builder().build())
                .build()

        val body = params._body()

        assertThat(body)
            .isEqualTo(
                CustomerCreateParams.Body.ofCustomersIndividualCustomerUpdate(
                    CustomerCreateParams.Body.CustomersIndividualCustomerUpdate.builder().build()
                )
            )
    }
}
