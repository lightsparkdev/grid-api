// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.blocking

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
import com.grid.api.core.prepare
import com.grid.api.models.umaproviders.UmaProviderListPage
import com.grid.api.models.umaproviders.UmaProviderListPageResponse
import com.grid.api.models.umaproviders.UmaProviderListParams

class UmaProviderServiceImpl internal constructor(private val clientOptions: ClientOptions) :
    UmaProviderService {

    private val withRawResponse: UmaProviderService.WithRawResponse by lazy {
        WithRawResponseImpl(clientOptions)
    }

    override fun withRawResponse(): UmaProviderService.WithRawResponse = withRawResponse

    override fun withOptions(modifier: (ClientOptions.Builder) -> Unit): UmaProviderService =
        UmaProviderServiceImpl(clientOptions.toBuilder().apply(modifier).build())

    override fun list(
        params: UmaProviderListParams,
        requestOptions: RequestOptions,
    ): UmaProviderListPage =
        // get /uma-providers
        withRawResponse().list(params, requestOptions).parse()

    class WithRawResponseImpl internal constructor(private val clientOptions: ClientOptions) :
        UmaProviderService.WithRawResponse {

        private val errorHandler: Handler<HttpResponse> =
            errorHandler(errorBodyHandler(clientOptions.jsonMapper))

        override fun withOptions(
            modifier: (ClientOptions.Builder) -> Unit
        ): UmaProviderService.WithRawResponse =
            UmaProviderServiceImpl.WithRawResponseImpl(
                clientOptions.toBuilder().apply(modifier).build()
            )

        private val listHandler: Handler<UmaProviderListPageResponse> =
            jsonHandler<UmaProviderListPageResponse>(clientOptions.jsonMapper)

        override fun list(
            params: UmaProviderListParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<UmaProviderListPage> {
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.GET)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("uma-providers")
                    .build()
                    .prepare(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.execute(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response
                    .use { listHandler.handle(it) }
                    .also {
                        if (requestOptions.responseValidation!!) {
                            it.validate()
                        }
                    }
                    .let {
                        UmaProviderListPage.builder()
                            .service(UmaProviderServiceImpl(clientOptions))
                            .params(params)
                            .response(it)
                            .build()
                    }
            }
        }
    }
}
