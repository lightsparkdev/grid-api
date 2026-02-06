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
import com.grid.api.models.exchangerates.ExchangeRateListParams
import com.grid.api.models.exchangerates.ExchangeRateListResponse

class ExchangeRateServiceImpl internal constructor(private val clientOptions: ClientOptions) :
    ExchangeRateService {

    private val withRawResponse: ExchangeRateService.WithRawResponse by lazy {
        WithRawResponseImpl(clientOptions)
    }

    override fun withRawResponse(): ExchangeRateService.WithRawResponse = withRawResponse

    override fun withOptions(modifier: (ClientOptions.Builder) -> Unit): ExchangeRateService =
        ExchangeRateServiceImpl(clientOptions.toBuilder().apply(modifier).build())

    override fun list(
        params: ExchangeRateListParams,
        requestOptions: RequestOptions,
    ): ExchangeRateListResponse =
        // get /exchange-rates
        withRawResponse().list(params, requestOptions).parse()

    class WithRawResponseImpl internal constructor(private val clientOptions: ClientOptions) :
        ExchangeRateService.WithRawResponse {

        private val errorHandler: Handler<HttpResponse> =
            errorHandler(errorBodyHandler(clientOptions.jsonMapper))

        override fun withOptions(
            modifier: (ClientOptions.Builder) -> Unit
        ): ExchangeRateService.WithRawResponse =
            ExchangeRateServiceImpl.WithRawResponseImpl(
                clientOptions.toBuilder().apply(modifier).build()
            )

        private val listHandler: Handler<ExchangeRateListResponse> =
            jsonHandler<ExchangeRateListResponse>(clientOptions.jsonMapper)

        override fun list(
            params: ExchangeRateListParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<ExchangeRateListResponse> {
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.GET)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("exchange-rates")
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
            }
        }
    }
}
