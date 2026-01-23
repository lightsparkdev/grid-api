// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.quotes

import com.grid.api.core.JsonValue
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class QuoteCreateParamsTest {

    @Test
    fun create() {
        QuoteCreateParams.builder()
            .destination(
                QuoteCreateParams.Destination.Account.builder()
                    .accountId("ExternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                    .currency("EUR")
                    .build()
            )
            .lockedCurrencyAmount(10000L)
            .lockedCurrencySide(QuoteCreateParams.LockedCurrencySide.SENDING)
            .accountSource("InternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
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
    }

    @Test
    fun body() {
        val params =
            QuoteCreateParams.builder()
                .destination(
                    QuoteCreateParams.Destination.Account.builder()
                        .accountId("ExternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                        .currency("EUR")
                        .build()
                )
                .lockedCurrencyAmount(10000L)
                .lockedCurrencySide(QuoteCreateParams.LockedCurrencySide.SENDING)
                .accountSource("InternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
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

        val body = params._body()

        assertThat(body.destination())
            .isEqualTo(
                QuoteCreateParams.Destination.ofAccount(
                    QuoteCreateParams.Destination.Account.builder()
                        .accountId("ExternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                        .currency("EUR")
                        .build()
                )
            )
        assertThat(body.lockedCurrencyAmount()).isEqualTo(10000L)
        assertThat(body.lockedCurrencySide())
            .isEqualTo(QuoteCreateParams.LockedCurrencySide.SENDING)
        assertThat(body.source())
            .isEqualTo(
                QuoteSource.ofAccount(
                    QuoteSource.Account.builder()
                        .accountId("InternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                        .build()
                )
            )
        assertThat(body.description())
            .isEqualTo("Transfer between accounts, either internal or external.")
        assertThat(body.immediatelyExecute()).isEqualTo(false)
        assertThat(body.lookupId()).isEqualTo("Lookup:019542f5-b3e7-1d02-0000-000000000009")
        assertThat(body.senderCustomerInfo())
            .isEqualTo(
                QuoteCreateParams.SenderCustomerInfo.builder()
                    .putAdditionalProperty("FULL_NAME", JsonValue.from("bar"))
                    .putAdditionalProperty("NATIONALITY", JsonValue.from("bar"))
                    .build()
            )
    }

    @Test
    fun bodyWithoutOptionalFields() {
        val params =
            QuoteCreateParams.builder()
                .destination(
                    QuoteCreateParams.Destination.Account.builder()
                        .accountId("ExternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                        .currency("EUR")
                        .build()
                )
                .lockedCurrencyAmount(10000L)
                .lockedCurrencySide(QuoteCreateParams.LockedCurrencySide.SENDING)
                .accountSource("InternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                .build()

        val body = params._body()

        assertThat(body.destination())
            .isEqualTo(
                QuoteCreateParams.Destination.ofAccount(
                    QuoteCreateParams.Destination.Account.builder()
                        .accountId("ExternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                        .currency("EUR")
                        .build()
                )
            )
        assertThat(body.lockedCurrencyAmount()).isEqualTo(10000L)
        assertThat(body.lockedCurrencySide())
            .isEqualTo(QuoteCreateParams.LockedCurrencySide.SENDING)
        assertThat(body.source())
            .isEqualTo(
                QuoteSource.ofAccount(
                    QuoteSource.Account.builder()
                        .accountId("InternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                        .build()
                )
            )
    }
}
