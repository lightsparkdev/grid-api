// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.async

import com.grid.api.TestServerExtension
import com.grid.api.client.okhttp.GridOkHttpClientAsync
import com.grid.api.core.JsonValue
import com.grid.api.models.quotes.QuoteCreateParams
import com.grid.api.models.quotes.QuoteRetryParams
import com.grid.api.models.quotes.QuoteSource
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(TestServerExtension::class)
internal class QuoteServiceAsyncTest {

    @Disabled("Prism tests are disabled")
    @Test
    suspend fun create() {
        val client =
            GridOkHttpClientAsync.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val quoteServiceAsync = client.quotes()

        val quote =
            quoteServiceAsync.create(
                QuoteCreateParams.builder()
                    .destination(
                        QuoteCreateParams.Destination.Account.builder()
                            .accountId("ExternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                            .currency("EUR")
                            .build()
                    )
                    .lockedCurrencyAmount(10000L)
                    .lockedCurrencySide(QuoteCreateParams.LockedCurrencySide.SENDING)
                    .source(
                        QuoteSource.Account.builder()
                            .accountId("InternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                            .currency("USD")
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

        quote.validate()
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
        val quoteServiceAsync = client.quotes()

        val quote = quoteServiceAsync.retrieve("quoteId")

        quote.validate()
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
        val quoteServiceAsync = client.quotes()

        val page = quoteServiceAsync.list()

        page.response().validate()
    }

    @Disabled("Prism tests are disabled")
    @Test
    suspend fun execute() {
        val client =
            GridOkHttpClientAsync.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val quoteServiceAsync = client.quotes()

        val quote = quoteServiceAsync.execute("Quote:019542f5-b3e7-1d02-0000-000000000001")

        quote.validate()
    }

    @Disabled("Prism tests are disabled")
    @Test
    suspend fun retry() {
        val client =
            GridOkHttpClientAsync.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val quoteServiceAsync = client.quotes()

        val quote =
            quoteServiceAsync.retry(
                QuoteRetryParams.builder()
                    .quoteId("quoteId")
                    .lookupId("Lookup:019542f5-b3e7-1d02-0000-000000000009")
                    .senderCustomerInfo(
                        QuoteRetryParams.SenderCustomerInfo.builder()
                            .putAdditionalProperty("FULL_NAME", JsonValue.from("bar"))
                            .putAdditionalProperty("NATIONALITY", JsonValue.from("bar"))
                            .build()
                    )
                    .build()
            )

        quote.validate()
    }
}
