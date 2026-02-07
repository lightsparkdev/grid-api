// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.bulk

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.JsonValue
import com.grid.api.core.jsonMapper
import java.time.OffsetDateTime
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class BulkGetJobStatusResponseTest {

    @Test
    fun create() {
        val bulkGetJobStatusResponse =
            BulkGetJobStatusResponse.builder()
                .jobId("Job:019542f5-b3e7-1d02-0000-000000000006")
                .progress(
                    BulkGetJobStatusResponse.Progress.builder()
                        .failed(50L)
                        .processed(2500L)
                        .successful(2450L)
                        .total(5000L)
                        .build()
                )
                .status(BulkGetJobStatusResponse.Status.PROCESSING)
                .completedAt(OffsetDateTime.parse("2025-08-15T14:32:00Z"))
                .addError(
                    BulkGetJobStatusResponse.Error.builder()
                        .correlationId("biz456")
                        .code("code")
                        .details(
                            BulkGetJobStatusResponse.Error.Details.builder()
                                .putAdditionalProperty("foo", JsonValue.from("bar"))
                                .build()
                        )
                        .message("message")
                        .build()
                )
                .build()

        assertThat(bulkGetJobStatusResponse.jobId())
            .isEqualTo("Job:019542f5-b3e7-1d02-0000-000000000006")
        assertThat(bulkGetJobStatusResponse.progress())
            .isEqualTo(
                BulkGetJobStatusResponse.Progress.builder()
                    .failed(50L)
                    .processed(2500L)
                    .successful(2450L)
                    .total(5000L)
                    .build()
            )
        assertThat(bulkGetJobStatusResponse.status())
            .isEqualTo(BulkGetJobStatusResponse.Status.PROCESSING)
        assertThat(bulkGetJobStatusResponse.completedAt())
            .isEqualTo(OffsetDateTime.parse("2025-08-15T14:32:00Z"))
        assertThat(bulkGetJobStatusResponse.errors())
            .containsExactly(
                BulkGetJobStatusResponse.Error.builder()
                    .correlationId("biz456")
                    .code("code")
                    .details(
                        BulkGetJobStatusResponse.Error.Details.builder()
                            .putAdditionalProperty("foo", JsonValue.from("bar"))
                            .build()
                    )
                    .message("message")
                    .build()
            )
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val bulkGetJobStatusResponse =
            BulkGetJobStatusResponse.builder()
                .jobId("Job:019542f5-b3e7-1d02-0000-000000000006")
                .progress(
                    BulkGetJobStatusResponse.Progress.builder()
                        .failed(50L)
                        .processed(2500L)
                        .successful(2450L)
                        .total(5000L)
                        .build()
                )
                .status(BulkGetJobStatusResponse.Status.PROCESSING)
                .completedAt(OffsetDateTime.parse("2025-08-15T14:32:00Z"))
                .addError(
                    BulkGetJobStatusResponse.Error.builder()
                        .correlationId("biz456")
                        .code("code")
                        .details(
                            BulkGetJobStatusResponse.Error.Details.builder()
                                .putAdditionalProperty("foo", JsonValue.from("bar"))
                                .build()
                        )
                        .message("message")
                        .build()
                )
                .build()

        val roundtrippedBulkGetJobStatusResponse =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(bulkGetJobStatusResponse),
                jacksonTypeRef<BulkGetJobStatusResponse>(),
            )

        assertThat(roundtrippedBulkGetJobStatusResponse).isEqualTo(bulkGetJobStatusResponse)
    }
}
