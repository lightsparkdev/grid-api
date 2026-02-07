// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services

import com.github.tomakehurst.wiremock.client.WireMock.anyUrl
import com.github.tomakehurst.wiremock.client.WireMock.equalTo
import com.github.tomakehurst.wiremock.client.WireMock.matchingJsonPath
import com.github.tomakehurst.wiremock.client.WireMock.ok
import com.github.tomakehurst.wiremock.client.WireMock.post
import com.github.tomakehurst.wiremock.client.WireMock.postRequestedFor
import com.github.tomakehurst.wiremock.client.WireMock.stubFor
import com.github.tomakehurst.wiremock.client.WireMock.verify
import com.github.tomakehurst.wiremock.junit5.WireMockRuntimeInfo
import com.github.tomakehurst.wiremock.junit5.WireMockTest
import com.grid.api.client.GridClient
import com.grid.api.client.okhttp.GridOkHttpClient
import com.grid.api.core.JsonValue
import com.grid.api.models.customers.CustomerCreateParams
import com.grid.api.models.quotes.QuoteCreateParams
import com.grid.api.models.quotes.QuoteSourceOneOf
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
    fun create() {
        val quoteService = client.quotes()
        stubFor(post(anyUrl()).willReturn(ok("{}")))

        quoteService.create(
            QuoteCreateParams.builder()
                .accountDestination("ExternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                .lockedCurrencyAmount(10000L)
                .lockedCurrencySide(QuoteCreateParams.LockedCurrencySide.SENDING)
                .source(
                    QuoteSourceOneOf.Account.builder()
                        .accountId("InternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                        .sourceType(QuoteSourceOneOf.Account.SourceType.ACCOUNT)
                        .customerId("Customer:019542f5-b3e7-1d02-0000-000000000001")
                        .build()
                )
                .description("Transfer between accounts, either internal or external.")
                .immediatelyExecute(false)
                .lookupId("Lookup:019542f5-b3e7-1d02-0000-000000000009")
                .senderCustomerInfo(
                    QuoteCreateParams.SenderCustomerInfo.builder()
                        .putAdditionalProperty("FULL_NAME", JsonValue.from("bar"))
                        .putAdditionalProperty("NATIONALITY", JsonValue.from("bar"))
                        .build()
                )
                .putAdditionalHeader("Secret-Header", "42")
                .putAdditionalQueryParam("secret_query_param", "42")
                .putAdditionalBodyProperty("secretProperty", JsonValue.from("42"))
                .build()
        )

        verify(
            postRequestedFor(anyUrl())
                .withHeader("Secret-Header", equalTo("42"))
                .withQueryParam("secret_query_param", equalTo("42"))
                .withRequestBody(matchingJsonPath("$.secretProperty", equalTo("42")))
        )
    }
}
