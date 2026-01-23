// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services

import com.github.tomakehurst.wiremock.client.WireMock.anyUrl
import com.github.tomakehurst.wiremock.client.WireMock.equalTo
import com.github.tomakehurst.wiremock.client.WireMock.get
import com.github.tomakehurst.wiremock.client.WireMock.getRequestedFor
import com.github.tomakehurst.wiremock.client.WireMock.ok
import com.github.tomakehurst.wiremock.client.WireMock.post
import com.github.tomakehurst.wiremock.client.WireMock.postRequestedFor
import com.github.tomakehurst.wiremock.client.WireMock.stubFor
import com.github.tomakehurst.wiremock.client.WireMock.verify
import com.github.tomakehurst.wiremock.junit5.WireMockRuntimeInfo
import com.github.tomakehurst.wiremock.junit5.WireMockTest
import com.grid.api.client.GridClient
import com.grid.api.client.okhttp.GridOkHttpClient
import com.grid.api.models.customers.Address
import com.grid.api.models.customers.CustomerCreateParams
import com.grid.api.models.customers.CustomerListParams
import java.time.LocalDate
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.parallel.ResourceLock

@WireMockTest
@ResourceLock("https://github.com/wiremock/wiremock/issues/169")
internal class ServiceParamsTest {

    private lateinit var client: GridClient

    @BeforeEach
    fun beforeEach(wmRuntimeInfo: WireMockRuntimeInfo) {
        client =
            GridOkHttpClient.builder()
                .baseUrl(wmRuntimeInfo.httpBaseUrl)
                .username("My Username")
                .password("My Password")
                .build()
    }

    @Disabled("Prism tests are disabled")
    @Test
    fun create() {
        val customerService = client.customers()
        stubFor(post(anyUrl()).willReturn(ok("{}")))

        customerService.create(
            CustomerCreateParams.builder()
                .createCustomerRequest(
                    CustomerCreateParams.CreateCustomerRequest.CustomersIndividualCustomerUpdate
                        .builder()
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
                .putAdditionalHeader("Secret-Header", "42")
                .putAdditionalQueryParam("secret_query_param", "42")
                .build()
        )

        verify(
            postRequestedFor(anyUrl())
                .withHeader("Secret-Header", equalTo("42"))
                .withQueryParam("secret_query_param", equalTo("42"))
        )
    }

    @Disabled("Prism tests are disabled")
    @Test
    fun list() {
        val customerService = client.customers()
        stubFor(get(anyUrl()).willReturn(ok("{}")))

        customerService.list(
            CustomerListParams.builder()
                .putAdditionalHeader("Secret-Header", "42")
                .putAdditionalQueryParam("secret_query_param", "42")
                .build()
        )

        verify(
            getRequestedFor(anyUrl())
                .withHeader("Secret-Header", equalTo("42"))
                .withQueryParam("secret_query_param", equalTo("42"))
        )
    }
}
