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
import com.grid.api.models.quotes.QuoteCreateParams
import com.grid.api.models.quotes.QuoteSourceOneOf
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
    fun quotesCreate400() {
        val quoteService = client.quotes()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(400).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<BadRequestException> {
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
                        .build()
                )
            }

        assertThat(e.statusCode()).isEqualTo(400)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun quotesCreate400WithRawResponse() {
        val quoteService = client.quotes().withRawResponse()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(400).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<BadRequestException> {
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
                        .build()
                )
            }

        assertThat(e.statusCode()).isEqualTo(400)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun quotesCreate401() {
        val quoteService = client.quotes()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(401).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<UnauthorizedException> {
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
                        .build()
                )
            }

        assertThat(e.statusCode()).isEqualTo(401)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun quotesCreate401WithRawResponse() {
        val quoteService = client.quotes().withRawResponse()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(401).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<UnauthorizedException> {
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
                        .build()
                )
            }

        assertThat(e.statusCode()).isEqualTo(401)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun quotesCreate403() {
        val quoteService = client.quotes()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(403).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<PermissionDeniedException> {
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
                        .build()
                )
            }

        assertThat(e.statusCode()).isEqualTo(403)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun quotesCreate403WithRawResponse() {
        val quoteService = client.quotes().withRawResponse()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(403).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<PermissionDeniedException> {
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
                        .build()
                )
            }

        assertThat(e.statusCode()).isEqualTo(403)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun quotesCreate404() {
        val quoteService = client.quotes()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(404).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<NotFoundException> {
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
                        .build()
                )
            }

        assertThat(e.statusCode()).isEqualTo(404)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun quotesCreate404WithRawResponse() {
        val quoteService = client.quotes().withRawResponse()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(404).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<NotFoundException> {
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
                        .build()
                )
            }

        assertThat(e.statusCode()).isEqualTo(404)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun quotesCreate422() {
        val quoteService = client.quotes()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(422).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<UnprocessableEntityException> {
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
                        .build()
                )
            }

        assertThat(e.statusCode()).isEqualTo(422)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun quotesCreate422WithRawResponse() {
        val quoteService = client.quotes().withRawResponse()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(422).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<UnprocessableEntityException> {
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
                        .build()
                )
            }

        assertThat(e.statusCode()).isEqualTo(422)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun quotesCreate429() {
        val quoteService = client.quotes()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(429).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<RateLimitException> {
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
                        .build()
                )
            }

        assertThat(e.statusCode()).isEqualTo(429)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun quotesCreate429WithRawResponse() {
        val quoteService = client.quotes().withRawResponse()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(429).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<RateLimitException> {
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
                        .build()
                )
            }

        assertThat(e.statusCode()).isEqualTo(429)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun quotesCreate500() {
        val quoteService = client.quotes()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(500).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<InternalServerException> {
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
                        .build()
                )
            }

        assertThat(e.statusCode()).isEqualTo(500)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun quotesCreate500WithRawResponse() {
        val quoteService = client.quotes().withRawResponse()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(500).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<InternalServerException> {
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
                        .build()
                )
            }

        assertThat(e.statusCode()).isEqualTo(500)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun quotesCreate999() {
        val quoteService = client.quotes()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(999).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<UnexpectedStatusCodeException> {
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
                        .build()
                )
            }

        assertThat(e.statusCode()).isEqualTo(999)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun quotesCreate999WithRawResponse() {
        val quoteService = client.quotes().withRawResponse()
        stubFor(
            post(anyUrl())
                .willReturn(
                    status(999).withHeader(HEADER_NAME, HEADER_VALUE).withBody(ERROR_JSON_BYTES)
                )
        )

        val e =
            assertThrows<UnexpectedStatusCodeException> {
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
                        .build()
                )
            }

        assertThat(e.statusCode()).isEqualTo(999)
        assertThat(e.headers().toMap()).contains(entry(HEADER_NAME, listOf(HEADER_VALUE)))
        assertThat(e.body()).isEqualTo(ERROR_JSON)
    }

    @Test
    fun quotesCreateInvalidJsonBody() {
        val quoteService = client.quotes()
        stubFor(
            post(anyUrl())
                .willReturn(status(200).withHeader(HEADER_NAME, HEADER_VALUE).withBody(NOT_JSON))
        )

        val e =
            assertThrows<GridException> {
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
