// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.blocking.customers

import com.grid.api.TestServerExtension
import com.grid.api.client.okhttp.GridOkHttpClient
import com.grid.api.models.customers.bulk.BulkUploadCsvParams
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(TestServerExtension::class)
internal class BulkServiceTest {

    @Disabled("Prism tests are disabled")
    @Test
    fun getJobStatus() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .webhookSignature("My Webhook Signature")
                .build()
        val bulkService = client.customers().bulk()

        val response = bulkService.getJobStatus("jobId")

        response.validate()
    }

    @Disabled("Prism tests are disabled")
    @Test
    fun uploadCsv() {
        val client =
            GridOkHttpClient.builder()
                .baseUrl(TestServerExtension.BASE_URL)
                .username("My Username")
                .password("My Password")
                .webhookSignature("My Webhook Signature")
                .build()
        val bulkService = client.customers().bulk()

        val response =
            bulkService.uploadCsv(
                BulkUploadCsvParams.builder().file("some content".byteInputStream()).build()
            )

        response.validate()
    }
}
