// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.blocking

import com.grid.api.TestServerExtension
import com.grid.api.client.okhttp.GridOkHttpClient
import com.grid.api.core.JsonValue
import com.grid.api.models.quotes.QuoteCreateParams
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(TestServerExtension::class)
internal class QuoteServiceTest {

    @Disabled("Prism tests are disabled")
    @Test
    fun create() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val quoteService = client.quotes()

        val quote =
            quoteService.create(
                QuoteCreateParams.builder()
                    .destination(
                        QuoteCreateParams.Destination.Account.builder()
                            .accountId("a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                            .currency("EUR")
                            .build()
                    )
                    .lockedCurrencyAmount(1000L)
                    .lockedCurrencySide(QuoteCreateParams.LockedCurrencySide.SENDING)
                    .accountSource("InternalAccount:85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                    .description("Invoice #1234 payment")
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
    fun retrieve() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val quoteService = client.quotes()

        val quote = quoteService.retrieve("quoteId")

        quote.validate()
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
        val quoteService = client.quotes()

        val page = quoteService.list()

        page.response().validate()
    }

    @Disabled("Prism tests are disabled")
    @Test
    fun execute() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val quoteService = client.quotes()

        val quote = quoteService.execute("Quote:019542f5-b3e7-1d02-0000-000000000001")

        quote.validate()
    }
}
