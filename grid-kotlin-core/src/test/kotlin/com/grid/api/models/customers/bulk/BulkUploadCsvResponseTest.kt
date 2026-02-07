// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.bulk

import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.jsonMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class BulkUploadCsvResponseTest {

    @Test
    fun create() {
        val bulkUploadCsvResponse =
            BulkUploadCsvResponse.builder()
                .jobId("Job:019542f5-b3e7-1d02-0000-000000000006")
                .status(BulkUploadCsvResponse.Status.PENDING)
                .build()

        assertThat(bulkUploadCsvResponse.jobId())
            .isEqualTo("Job:019542f5-b3e7-1d02-0000-000000000006")
        assertThat(bulkUploadCsvResponse.status()).isEqualTo(BulkUploadCsvResponse.Status.PENDING)
    }

    @Test
    fun roundtrip() {
        val jsonMapper = jsonMapper()
        val bulkUploadCsvResponse =
            BulkUploadCsvResponse.builder()
                .jobId("Job:019542f5-b3e7-1d02-0000-000000000006")
                .status(BulkUploadCsvResponse.Status.PENDING)
                .build()

        val roundtrippedBulkUploadCsvResponse =
            jsonMapper.readValue(
                jsonMapper.writeValueAsString(bulkUploadCsvResponse),
                jacksonTypeRef<BulkUploadCsvResponse>(),
            )

        assertThat(roundtrippedBulkUploadCsvResponse).isEqualTo(bulkUploadCsvResponse)
    }
}
