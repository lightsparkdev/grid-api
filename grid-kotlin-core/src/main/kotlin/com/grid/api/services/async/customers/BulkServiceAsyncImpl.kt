// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.async.customers

import com.grid.api.core.ClientOptions
import com.grid.api.core.RequestOptions
import com.grid.api.core.checkRequired
import com.grid.api.core.handlers.errorBodyHandler
import com.grid.api.core.handlers.errorHandler
import com.grid.api.core.handlers.jsonHandler
import com.grid.api.core.http.HttpMethod
import com.grid.api.core.http.HttpRequest
import com.grid.api.core.http.HttpResponse
import com.grid.api.core.http.HttpResponse.Handler
import com.grid.api.core.http.HttpResponseFor
import com.grid.api.core.http.multipartFormData
import com.grid.api.core.http.parseable
import com.grid.api.core.prepareAsync
import com.grid.api.models.customers.bulk.BulkGetJobStatusParams
import com.grid.api.models.customers.bulk.BulkGetJobStatusResponse
import com.grid.api.models.customers.bulk.BulkUploadCsvParams
import com.grid.api.models.customers.bulk.BulkUploadCsvResponse

class BulkServiceAsyncImpl internal constructor(private val clientOptions: ClientOptions) :
    BulkServiceAsync {

    private val withRawResponse: BulkServiceAsync.WithRawResponse by lazy {
        WithRawResponseImpl(clientOptions)
    }

    override fun withRawResponse(): BulkServiceAsync.WithRawResponse = withRawResponse

    override fun withOptions(modifier: (ClientOptions.Builder) -> Unit): BulkServiceAsync =
        BulkServiceAsyncImpl(clientOptions.toBuilder().apply(modifier).build())

    override suspend fun getJobStatus(
        params: BulkGetJobStatusParams,
        requestOptions: RequestOptions,
    ): BulkGetJobStatusResponse =
        // get /customers/bulk/jobs/{jobId}
        withRawResponse().getJobStatus(params, requestOptions).parse()

    override suspend fun uploadCsv(
        params: BulkUploadCsvParams,
        requestOptions: RequestOptions,
    ): BulkUploadCsvResponse =
        // post /customers/bulk/csv
        withRawResponse().uploadCsv(params, requestOptions).parse()

    class WithRawResponseImpl internal constructor(private val clientOptions: ClientOptions) :
        BulkServiceAsync.WithRawResponse {

        private val errorHandler: Handler<HttpResponse> =
            errorHandler(errorBodyHandler(clientOptions.jsonMapper))

        override fun withOptions(
            modifier: (ClientOptions.Builder) -> Unit
        ): BulkServiceAsync.WithRawResponse =
            BulkServiceAsyncImpl.WithRawResponseImpl(
                clientOptions.toBuilder().apply(modifier).build()
            )

        private val getJobStatusHandler: Handler<BulkGetJobStatusResponse> =
            jsonHandler<BulkGetJobStatusResponse>(clientOptions.jsonMapper)

        override suspend fun getJobStatus(
            params: BulkGetJobStatusParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<BulkGetJobStatusResponse> {
            // We check here instead of in the params builder because this can be specified
            // positionally or in the params class.
            checkRequired("jobId", params.jobId())
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.GET)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("customers", "bulk", "jobs", params._pathParam(0))
                    .build()
                    .prepareAsync(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.executeAsync(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response
                    .use { getJobStatusHandler.handle(it) }
                    .also {
                        if (requestOptions.responseValidation!!) {
                            it.validate()
                        }
                    }
            }
        }

        private val uploadCsvHandler: Handler<BulkUploadCsvResponse> =
            jsonHandler<BulkUploadCsvResponse>(clientOptions.jsonMapper)

        override suspend fun uploadCsv(
            params: BulkUploadCsvParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<BulkUploadCsvResponse> {
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.POST)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("customers", "bulk", "csv")
                    .body(multipartFormData(clientOptions.jsonMapper, params._body()))
                    .build()
                    .prepareAsync(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.executeAsync(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response
                    .use { uploadCsvHandler.handle(it) }
                    .also {
                        if (requestOptions.responseValidation!!) {
                            it.validate()
                        }
                    }
            }
        }
    }
}
