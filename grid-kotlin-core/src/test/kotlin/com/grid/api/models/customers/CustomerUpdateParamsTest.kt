// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers

import java.time.LocalDate
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class CustomerUpdateParamsTest {

    @Test
    fun create() {
        CustomerUpdateParams.builder()
            .customerId("customerId")
            .updateCustomerRequest(
                CustomerUpdateParams.UpdateCustomerRequest.IndividualCustomerUpdateRequest.builder()
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
    }

    @Test
    fun pathParams() {
        val params =
            CustomerUpdateParams.builder()
                .customerId("customerId")
                .updateCustomerRequest(
                    CustomerUpdateParams.UpdateCustomerRequest.IndividualCustomerUpdateRequest
                        .builder()
                        .customerType(CustomerType.INDIVIDUAL)
                        .build()
                )
                .build()

        assertThat(params._pathParam(0)).isEqualTo("customerId")
        // out-of-bound path param
        assertThat(params._pathParam(1)).isEqualTo("")
    }

    @Test
    fun body() {
        val params =
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

        val body = params._body()

        assertThat(body)
            .isEqualTo(
                CustomerUpdateParams.UpdateCustomerRequest.ofIndividualCustomerUpdate(
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
            )
    }

    @Test
    fun bodyWithoutOptionalFields() {
        val params =
            CustomerUpdateParams.builder()
                .customerId("customerId")
                .updateCustomerRequest(
                    CustomerUpdateParams.UpdateCustomerRequest.IndividualCustomerUpdateRequest
                        .builder()
                        .customerType(CustomerType.INDIVIDUAL)
                        .build()
                )
                .build()

        val body = params._body()

        assertThat(body)
            .isEqualTo(
                CustomerUpdateParams.UpdateCustomerRequest.ofIndividualCustomerUpdate(
                    CustomerUpdateParams.UpdateCustomerRequest.IndividualCustomerUpdateRequest
                        .builder()
                        .customerType(CustomerType.INDIVIDUAL)
                        .build()
                )
            )
    }
}
