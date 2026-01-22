// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.async

import com.grid.api.core.ClientOptions
import com.grid.api.core.RequestOptions
import com.grid.api.core.handlers.errorBodyHandler
import com.grid.api.core.handlers.errorHandler
import com.grid.api.core.handlers.jsonHandler
import com.grid.api.core.http.HttpMethod
import com.grid.api.core.http.HttpRequest
import com.grid.api.core.http.HttpResponse
import com.grid.api.core.http.HttpResponse.Handler
import com.grid.api.core.http.HttpResponseFor
import com.grid.api.core.http.parseable
import com.grid.api.core.prepareAsync
import com.grid.api.models.umaproviders.UmaProviderListParams
import com.grid.api.models.umaproviders.UmaProviderListResponse

class UmaProviderServiceAsyncImpl internal constructor(private val clientOptions: ClientOptions) :
    UmaProviderServiceAsync {

    private val withRawResponse: UmaProviderServiceAsync.WithRawResponse by lazy {
        WithRawResponseImpl(clientOptions)
    }

    override fun withRawResponse(): UmaProviderServiceAsync.WithRawResponse = withRawResponse

    override fun withOptions(modifier: (ClientOptions.Builder) -> Unit): UmaProviderServiceAsync =
        UmaProviderServiceAsyncImpl(clientOptions.toBuilder().apply(modifier).build())

    override suspend fun list(
        params: UmaProviderListParams,
        requestOptions: RequestOptions,
    ): UmaProviderListResponse =
        // get /uma-providers
        withRawResponse().list(params, requestOptions).parse()

    class WithRawResponseImpl internal constructor(private val clientOptions: ClientOptions) :
        UmaProviderServiceAsync.WithRawResponse {

        private val errorHandler: Handler<HttpResponse> =
            errorHandler(errorBodyHandler(clientOptions.jsonMapper))

        override fun withOptions(
            modifier: (ClientOptions.Builder) -> Unit
        ): UmaProviderServiceAsync.WithRawResponse =
            UmaProviderServiceAsyncImpl.WithRawResponseImpl(
                clientOptions.toBuilder().apply(modifier).build()
            )

        private val listHandler: Handler<UmaProviderListResponse> =
            jsonHandler<UmaProviderListResponse>(clientOptions.jsonMapper)

        override suspend fun list(
            params: UmaProviderListParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<UmaProviderListResponse> {
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.GET)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("uma-providers")
                    .build()
                    .prepareAsync(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.executeAsync(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response
                    .use { listHandler.handle(it) }
                    .also {
                        if (requestOptions.responseValidation!!) {
                            it.validate()
                        }
                    }
            }
        }
    }
}
