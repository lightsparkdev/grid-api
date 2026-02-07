// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.transferin

import com.grid.api.core.http.Headers
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class TransferInCreateParamsTest {

    @Test
    fun create() {
        TransferInCreateParams.builder()
            .idempotencyKey("550e8400-e29b-41d4-a716-446655440000")
            .destination(
                TransferInCreateParams.Destination.builder()
                    .accountId("InternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                    .build()
            )
            .source(
                TransferInCreateParams.Source.builder()
                    .accountId("ExternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                    .build()
            )
            .amount(12550L)
            .build()
    }

    @Test
    fun headers() {
        val params =
            TransferInCreateParams.builder()
                .idempotencyKey("550e8400-e29b-41d4-a716-446655440000")
                .destination(
                    TransferInCreateParams.Destination.builder()
                        .accountId("InternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                        .build()
                )
                .source(
                    TransferInCreateParams.Source.builder()
                        .accountId("ExternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                        .build()
                )
                .amount(12550L)
                .build()

        val headers = params._headers()

        assertThat(headers)
            .isEqualTo(
                Headers.builder()
                    .put("Idempotency-Key", "550e8400-e29b-41d4-a716-446655440000")
                    .build()
            )
    }

    @Test
    fun headersWithoutOptionalFields() {
        val params =
            TransferInCreateParams.builder()
                .destination(
                    TransferInCreateParams.Destination.builder()
                        .accountId("InternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                        .build()
                )
                .source(
                    TransferInCreateParams.Source.builder()
                        .accountId("ExternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                        .build()
                )
                .build()

        val headers = params._headers()

        assertThat(headers).isEqualTo(Headers.builder().build())
    }

    @Test
    fun body() {
        val params =
            TransferInCreateParams.builder()
                .idempotencyKey("550e8400-e29b-41d4-a716-446655440000")
                .destination(
                    TransferInCreateParams.Destination.builder()
                        .accountId("InternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                        .build()
                )
                .source(
                    TransferInCreateParams.Source.builder()
                        .accountId("ExternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                        .build()
                )
                .amount(12550L)
                .build()

        val body = params._body()

        assertThat(body.destination())
            .isEqualTo(
                TransferInCreateParams.Destination.builder()
                    .accountId("InternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                    .build()
            )
        assertThat(body.source())
            .isEqualTo(
                TransferInCreateParams.Source.builder()
                    .accountId("ExternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                    .build()
            )
        assertThat(body.amount()).isEqualTo(12550L)
    }

    @Test
    fun bodyWithoutOptionalFields() {
        val params =
            TransferInCreateParams.builder()
                .destination(
                    TransferInCreateParams.Destination.builder()
                        .accountId("InternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                        .build()
                )
                .source(
                    TransferInCreateParams.Source.builder()
                        .accountId("ExternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                        .build()
                )
                .build()

        val body = params._body()

        assertThat(body.destination())
            .isEqualTo(
                TransferInCreateParams.Destination.builder()
                    .accountId("InternalAccount:a12dcbd6-dced-4ec4-b756-3c3a9ea3d123")
                    .build()
            )
        assertThat(body.source())
            .isEqualTo(
                TransferInCreateParams.Source.builder()
                    .accountId("ExternalAccount:e85dcbd6-dced-4ec4-b756-3c3a9ea3d965")
                    .build()
            )
    }
}
