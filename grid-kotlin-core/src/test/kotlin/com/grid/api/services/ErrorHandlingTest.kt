// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services

import com.github.tomakehurst.wiremock.client.WireMock.anyUrl
import com.github.tomakehurst.wiremock.client.WireMock.post
import com.github.tomakehurst.wiremock.client.WireMock.status
import com.github.tomakehurst.wiremock.client.WireMock.stubFor
import com.github.tomakehurst.wiremock.junit5.WireMockRuntimeInfo
import com.github.tomakehurst.wiremock.junit5.WireMockTest
import com.grid.api.client.GridClient
import com.grid.api.client.okhttp.GridOkHttpClient
import com.grid.api.core.JsonValue
import com.grid.api.core.http.Headers
import com.grid.api.core.jsonMapper
import com.grid.api.errors.BadRequestException
import com.grid.api.errors.GridException
import com.grid.api.errors.InternalServerException
import com.grid.api.errors.NotFoundException
import com.grid.api.errors.PermissionDeniedException
import com.grid.api.errors.RateLimitException
import com.grid.api.errors.UnauthorizedException
import com.grid.api.errors.UnexpectedStatusCodeException
import com.grid.api.errors.UnprocessableEntityException
import com.grid.api.models.customers.CustomerCreateParams
import java.time.LocalDate
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.entry
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.parallel.ResourceLock

@WireMockTest
@ResourceLock("https://github.com/wiremock/wiremock/issues/169")
internal class ErrorHandlingTest {

    companion object {

        private val ERROR_JSON: JsonValue = JsonValue.from(mapOf("errorProperty" to "42"))

        private val ERROR_JSON_BYTES: ByteArray = jsonMapper().writeValueAsBytes(ERROR_JSON)

        private const val HEADER_NAME: String = "Error-Header"

        private const val HEADER_VALUE: String = "42"

        private const val NOT_JSON: String = "Not JSON"
    }

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

    @Test
    fun customersCreate400() {
        val customerService = client.customers()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(400).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<BadRequestException> {
                customerService.create(
                    CustomerCreateParams.builder()
                        .createCustomerRequest(
                            CustomerCreateParams.CreateCustomerRequest.Individual.builder()
                                .platformCustomerId("9f84e0c2a72c4fa")
                                .umaAddress("\$john.doe@uma.domain.com")
                                .customerType(
                                    CustomerCreateParams.CreateCustomerRequest.Individual
                                        .CustomerType
                                        .INDIVIDUAL
                                )
                                .address(
                                    CustomerCreateParams.CreateCustomerRequest.Individual.Address
                                        .builder()
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
            }

        assertThat(e.statusCode()).isEqualTo(400)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun customersCreate400WithRawResponse() {
        val customerService = client.customers().withRawResponse()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(400).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<BadRequestException> {
                customerService.create(
                    CustomerCreateParams.builder()
                        .createCustomerRequest(
                            CustomerCreateParams.CreateCustomerRequest.Individual.builder()
                                .platformCustomerId("9f84e0c2a72c4fa")
                                .umaAddress("\$john.doe@uma.domain.com")
                                .customerType(
                                    CustomerCreateParams.CreateCustomerRequest.Individual
                                        .CustomerType
                                        .INDIVIDUAL
                                )
                                .address(
                                    CustomerCreateParams.CreateCustomerRequest.Individual.Address
                                        .builder()
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
            }

        assertThat(e.statusCode()).isEqualTo(400)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun customersCreate401() {
        val customerService = client.customers()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(401).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<UnauthorizedException> {
                customerService.create(
                    CustomerCreateParams.builder()
                        .createCustomerRequest(
                            CustomerCreateParams.CreateCustomerRequest.Individual.builder()
                                .platformCustomerId("9f84e0c2a72c4fa")
                                .umaAddress("\$john.doe@uma.domain.com")
                                .customerType(
                                    CustomerCreateParams.CreateCustomerRequest.Individual
                                        .CustomerType
                                        .INDIVIDUAL
                                )
                                .address(
                                    CustomerCreateParams.CreateCustomerRequest.Individual.Address
                                        .builder()
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
            }

        assertThat(e.statusCode()).isEqualTo(401)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun customersCreate401WithRawResponse() {
        val customerService = client.customers().withRawResponse()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(401).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<UnauthorizedException> {
                customerService.create(
                    CustomerCreateParams.builder()
                        .createCustomerRequest(
                            CustomerCreateParams.CreateCustomerRequest.Individual.builder()
                                .platformCustomerId("9f84e0c2a72c4fa")
                                .umaAddress("\$john.doe@uma.domain.com")
                                .customerType(
                                    CustomerCreateParams.CreateCustomerRequest.Individual
                                        .CustomerType
                                        .INDIVIDUAL
                                )
                                .address(
                                    CustomerCreateParams.CreateCustomerRequest.Individual.Address
                                        .builder()
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
            }

        assertThat(e.statusCode()).isEqualTo(401)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun customersCreate403() {
        val customerService = client.customers()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(403).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<PermissionDeniedException> {
                customerService.create(
                    CustomerCreateParams.builder()
                        .createCustomerRequest(
                            CustomerCreateParams.CreateCustomerRequest.Individual.builder()
                                .platformCustomerId("9f84e0c2a72c4fa")
                                .umaAddress("\$john.doe@uma.domain.com")
                                .customerType(
                                    CustomerCreateParams.CreateCustomerRequest.Individual
                                        .CustomerType
                                        .INDIVIDUAL
                                )
                                .address(
                                    CustomerCreateParams.CreateCustomerRequest.Individual.Address
                                        .builder()
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
            }

        assertThat(e.statusCode()).isEqualTo(403)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun customersCreate403WithRawResponse() {
        val customerService = client.customers().withRawResponse()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(403).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<PermissionDeniedException> {
                customerService.create(
                    CustomerCreateParams.builder()
                        .createCustomerRequest(
                            CustomerCreateParams.CreateCustomerRequest.Individual.builder()
                                .platformCustomerId("9f84e0c2a72c4fa")
                                .umaAddress("\$john.doe@uma.domain.com")
                                .customerType(
                                    CustomerCreateParams.CreateCustomerRequest.Individual
                                        .CustomerType
                                        .INDIVIDUAL
                                )
                                .address(
                                    CustomerCreateParams.CreateCustomerRequest.Individual.Address
                                        .builder()
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
            }

        assertThat(e.statusCode()).isEqualTo(403)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun customersCreate404() {
        val customerService = client.customers()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(404).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<NotFoundException> {
                customerService.create(
                    CustomerCreateParams.builder()
                        .createCustomerRequest(
                            CustomerCreateParams.CreateCustomerRequest.Individual.builder()
                                .platformCustomerId("9f84e0c2a72c4fa")
                                .umaAddress("\$john.doe@uma.domain.com")
                                .customerType(
                                    CustomerCreateParams.CreateCustomerRequest.Individual
                                        .CustomerType
                                        .INDIVIDUAL
                                )
                                .address(
                                    CustomerCreateParams.CreateCustomerRequest.Individual.Address
                                        .builder()
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
            }

        assertThat(e.statusCode()).isEqualTo(404)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun customersCreate404WithRawResponse() {
        val customerService = client.customers().withRawResponse()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(404).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<NotFoundException> {
                customerService.create(
                    CustomerCreateParams.builder()
                        .createCustomerRequest(
                            CustomerCreateParams.CreateCustomerRequest.Individual.builder()
                                .platformCustomerId("9f84e0c2a72c4fa")
                                .umaAddress("\$john.doe@uma.domain.com")
                                .customerType(
                                    CustomerCreateParams.CreateCustomerRequest.Individual
                                        .CustomerType
                                        .INDIVIDUAL
                                )
                                .address(
                                    CustomerCreateParams.CreateCustomerRequest.Individual.Address
                                        .builder()
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
            }

        assertThat(e.statusCode()).isEqualTo(404)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun customersCreate422() {
        val customerService = client.customers()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(422).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<UnprocessableEntityException> {
                customerService.create(
                    CustomerCreateParams.builder()
                        .createCustomerRequest(
                            CustomerCreateParams.CreateCustomerRequest.Individual.builder()
                                .platformCustomerId("9f84e0c2a72c4fa")
                                .umaAddress("\$john.doe@uma.domain.com")
                                .customerType(
                                    CustomerCreateParams.CreateCustomerRequest.Individual
                                        .CustomerType
                                        .INDIVIDUAL
                                )
                                .address(
                                    CustomerCreateParams.CreateCustomerRequest.Individual.Address
                                        .builder()
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
            }

        assertThat(e.statusCode()).isEqualTo(422)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun customersCreate422WithRawResponse() {
        val customerService = client.customers().withRawResponse()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(422).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<UnprocessableEntityException> {
                customerService.create(
                    CustomerCreateParams.builder()
                        .createCustomerRequest(
                            CustomerCreateParams.CreateCustomerRequest.Individual.builder()
                                .platformCustomerId("9f84e0c2a72c4fa")
                                .umaAddress("\$john.doe@uma.domain.com")
                                .customerType(
                                    CustomerCreateParams.CreateCustomerRequest.Individual
                                        .CustomerType
                                        .INDIVIDUAL
                                )
                                .address(
                                    CustomerCreateParams.CreateCustomerRequest.Individual.Address
                                        .builder()
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
            }

        assertThat(e.statusCode()).isEqualTo(422)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun customersCreate429() {
        val customerService = client.customers()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(429).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<RateLimitException> {
                customerService.create(
                    CustomerCreateParams.builder()
                        .createCustomerRequest(
                            CustomerCreateParams.CreateCustomerRequest.Individual.builder()
                                .platformCustomerId("9f84e0c2a72c4fa")
                                .umaAddress("\$john.doe@uma.domain.com")
                                .customerType(
                                    CustomerCreateParams.CreateCustomerRequest.Individual
                                        .CustomerType
                                        .INDIVIDUAL
                                )
                                .address(
                                    CustomerCreateParams.CreateCustomerRequest.Individual.Address
                                        .builder()
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
            }

        assertThat(e.statusCode()).isEqualTo(429)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun customersCreate429WithRawResponse() {
        val customerService = client.customers().withRawResponse()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(429).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<RateLimitException> {
                customerService.create(
                    CustomerCreateParams.builder()
                        .createCustomerRequest(
                            CustomerCreateParams.CreateCustomerRequest.Individual.builder()
                                .platformCustomerId("9f84e0c2a72c4fa")
                                .umaAddress("\$john.doe@uma.domain.com")
                                .customerType(
                                    CustomerCreateParams.CreateCustomerRequest.Individual
                                        .CustomerType
                                        .INDIVIDUAL
                                )
                                .address(
                                    CustomerCreateParams.CreateCustomerRequest.Individual.Address
                                        .builder()
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
            }

        assertThat(e.statusCode()).isEqualTo(429)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun customersCreate500() {
        val customerService = client.customers()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(500).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<InternalServerException> {
                customerService.create(
                    CustomerCreateParams.builder()
                        .createCustomerRequest(
                            CustomerCreateParams.CreateCustomerRequest.Individual.builder()
                                .platformCustomerId("9f84e0c2a72c4fa")
                                .umaAddress("\$john.doe@uma.domain.com")
                                .customerType(
                                    CustomerCreateParams.CreateCustomerRequest.Individual
                                        .CustomerType
                                        .INDIVIDUAL
                                )
                                .address(
                                    CustomerCreateParams.CreateCustomerRequest.Individual.Address
                                        .builder()
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
            }

        assertThat(e.statusCode()).isEqualTo(500)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun customersCreate500WithRawResponse() {
        val customerService = client.customers().withRawResponse()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(500).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<InternalServerException> {
                customerService.create(
                    CustomerCreateParams.builder()
                        .createCustomerRequest(
                            CustomerCreateParams.CreateCustomerRequest.Individual.builder()
                                .platformCustomerId("9f84e0c2a72c4fa")
                                .umaAddress("\$john.doe@uma.domain.com")
                                .customerType(
                                    CustomerCreateParams.CreateCustomerRequest.Individual
                                        .CustomerType
                                        .INDIVIDUAL
                                )
                                .address(
                                    CustomerCreateParams.CreateCustomerRequest.Individual.Address
                                        .builder()
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
            }

        assertThat(e.statusCode()).isEqualTo(500)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun customersCreate999() {
        val customerService = client.customers()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(999).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<UnexpectedStatusCodeException> {
                customerService.create(
                    CustomerCreateParams.builder()
                        .createCustomerRequest(
                            CustomerCreateParams.CreateCustomerRequest.Individual.builder()
                                .platformCustomerId("9f84e0c2a72c4fa")
                                .umaAddress("\$john.doe@uma.domain.com")
                                .customerType(
                                    CustomerCreateParams.CreateCustomerRequest.Individual
                                        .CustomerType
                                        .INDIVIDUAL
                                )
                                .address(
                                    CustomerCreateParams.CreateCustomerRequest.Individual.Address
                                        .builder()
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
            }

        assertThat(e.statusCode()).isEqualTo(999)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun customersCreate999WithRawResponse() {
        val customerService = client.customers().withRawResponse()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(999).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<UnexpectedStatusCodeException> {
                customerService.create(
                    CustomerCreateParams.builder()
                        .createCustomerRequest(
                            CustomerCreateParams.CreateCustomerRequest.Individual.builder()
                                .platformCustomerId("9f84e0c2a72c4fa")
                                .umaAddress("\$john.doe@uma.domain.com")
                                .customerType(
                                    CustomerCreateParams.CreateCustomerRequest.Individual
                                        .CustomerType
                                        .INDIVIDUAL
                                )
                                .address(
                                    CustomerCreateParams.CreateCustomerRequest.Individual.Address
                                        .builder()
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
            }

        assertThat(e.statusCode()).isEqualTo(999)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun customersCreateInvalidJsonBody() {
        val customerService = client.customers()
        stubFor(
            post(anyUrl())
                .willReturn(status(200).withHeader(HEADER_NAME, HEADER_VALUE).withBody(NOT_JSON))
        )

        val e =
            assertThrows<GridException> {
                customerService.create(
                    CustomerCreateParams.builder()
                        .createCustomerRequest(
                            CustomerCreateParams.CreateCustomerRequest.Individual.builder()
                                .platformCustomerId("9f84e0c2a72c4fa")
                                .umaAddress("\$john.doe@uma.domain.com")
                                .customerType(
                                    CustomerCreateParams.CreateCustomerRequest.Individual
                                        .CustomerType
                                        .INDIVIDUAL
                                )
                                .address(
                                    CustomerCreateParams.CreateCustomerRequest.Individual.Address
                                        .builder()
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
            }

        assertThat(e).hasMessage("Error reading response")
    }

    private fun Headers.toMap(): Map<String, List<String>> =
        mutableMapOf<String, List<String>>().also { map ->
            names().forEach { map[it] = values(it) }
        }
}
