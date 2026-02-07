// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.async.customers

import com.grid.api.TestServerExtension
import com.grid.api.client.okhttp.GridOkHttpClientAsync
import com.grid.api.models.customers.bulk.BulkUploadCsvParams
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(TestServerExtension::class)
internal class BulkServiceAsyncTest {

    @Disabled("Prism tests are disabled")
    @Test
    suspend fun getJobStatus() {
        val client =
            GridOkHttpClientAsync.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val bulkServiceAsync = client.customers().bulk()

        val response = bulkServiceAsync.getJobStatus("jobId")

        response.validate()
    }

    @Disabled("Prism tests are disabled")
    @Test
    suspend fun uploadCsv() {
        val client =
            GridOkHttpClientAsync.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .build()
        val bulkServiceAsync = client.customers().bulk()

        val response =
            bulkServiceAsync.uploadCsv(
                BulkUploadCsvParams.builder().file("some content".byteInputStream()).build()
            )

        response.validate()
    }
}
