// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.async

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
import com.grid.api.core.http.json
import com.grid.api.core.http.parseable
import com.grid.api.core.prepareAsync
import com.grid.api.models.quotes.Quote
import com.grid.api.models.quotes.QuoteCreateParams
import com.grid.api.models.quotes.QuoteExecuteParams
import com.grid.api.models.quotes.QuoteListPageAsync
import com.grid.api.models.quotes.QuoteListPageResponse
import com.grid.api.models.quotes.QuoteListParams
import com.grid.api.models.quotes.QuoteRetrieveParams
import com.grid.api.models.quotes.QuoteRetryParams

class QuoteServiceAsyncImpl internal constructor(private val clientOptions: ClientOptions) :
    QuoteServiceAsync {

    private val withRawResponse: QuoteServiceAsync.WithRawResponse by lazy {
        WithRawResponseImpl(clientOptions)
    }

    override fun withRawResponse(): QuoteServiceAsync.WithRawResponse = withRawResponse

    override fun withOptions(modifier: (ClientOptions.Builder) -> Unit): QuoteServiceAsync =
        QuoteServiceAsyncImpl(clientOptions.toBuilder().apply(modifier).build())

    override suspend fun create(params: QuoteCreateParams, requestOptions: RequestOptions): Quote =
        // post /quotes
        withRawResponse().create(params, requestOptions).parse()

    override suspend fun retrieve(
        params: QuoteRetrieveParams,
        requestOptions: RequestOptions,
    ): Quote =
        // get /quotes/{quoteId}
        withRawResponse().retrieve(params, requestOptions).parse()

    override suspend fun list(
        params: QuoteListParams,
        requestOptions: RequestOptions,
    ): QuoteListPageAsync =
        // get /quotes
        withRawResponse().list(params, requestOptions).parse()

    override suspend fun execute(
        params: QuoteExecuteParams,
        requestOptions: RequestOptions,
    ): Quote =
        // post /quotes/{quoteId}/execute
        withRawResponse().execute(params, requestOptions).parse()

    override suspend fun retry(params: QuoteRetryParams, requestOptions: RequestOptions): Quote =
        // post /quotes/{quoteId}/retry
        withRawResponse().retry(params, requestOptions).parse()

    class WithRawResponseImpl internal constructor(private val clientOptions: ClientOptions) :
        QuoteServiceAsync.WithRawResponse {

        private val errorHandler: Handler<HttpResponse> =
            errorHandler(errorBodyHandler(clientOptions.jsonMapper))

        override fun withOptions(
            modifier: (ClientOptions.Builder) -> Unit
        ): QuoteServiceAsync.WithRawResponse =
            QuoteServiceAsyncImpl.WithRawResponseImpl(
                clientOptions.toBuilder().apply(modifier).build()
            )

        private val createHandler: Handler<Quote> = jsonHandler<Quote>(clientOptions.jsonMapper)

        override suspend fun create(
            params: QuoteCreateParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<Quote> {
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.POST)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("quotes")
                    .body(json(clientOptions.jsonMapper, params._body()))
                    .build()
                    .prepareAsync(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.executeAsync(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response
                    .use { createHandler.handle(it) }
                    .also {
                        if (requestOptions.responseValidation!!) {
                            it.validate()
                        }
                    }
            }
        }

        private val retrieveHandler: Handler<Quote> = jsonHandler<Quote>(clientOptions.jsonMapper)

        override suspend fun retrieve(
            params: QuoteRetrieveParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<Quote> {
            // We check here instead of in the params builder because this can be specified
            // positionally or in the params class.
            checkRequired("quoteId", params.quoteId())
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.GET)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("quotes", params._pathParam(0))
                    .build()
                    .prepareAsync(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.executeAsync(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response
                    .use { retrieveHandler.handle(it) }
                    .also {
                        if (requestOptions.responseValidation!!) {
                            it.validate()
                        }
                    }
            }
        }

        private val listHandler: Handler<QuoteListPageResponse> =
            jsonHandler<QuoteListPageResponse>(clientOptions.jsonMapper)

        override suspend fun list(
            params: QuoteListParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<QuoteListPageAsync> {
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.GET)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("quotes")
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
                    .let {
                        QuoteListPageAsync.builder()
                            .service(QuoteServiceAsyncImpl(clientOptions))
                            .params(params)
                            .response(it)
                            .build()
                    }
            }
        }

        private val executeHandler: Handler<Quote> = jsonHandler<Quote>(clientOptions.jsonMapper)

        override suspend fun execute(
            params: QuoteExecuteParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<Quote> {
            // We check here instead of in the params builder because this can be specified
            // positionally or in the params class.
            checkRequired("quoteId", params.quoteId())
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.POST)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("quotes", params._pathParam(0), "execute")
                    .apply { params._body()?.let { body(json(clientOptions.jsonMapper, it)) } }
                    .build()
                    .prepareAsync(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.executeAsync(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response
                    .use { executeHandler.handle(it) }
                    .also {
                        if (requestOptions.responseValidation!!) {
                            it.validate()
                        }
                    }
            }
        }

        private val retryHandler: Handler<Quote> = jsonHandler<Quote>(clientOptions.jsonMapper)

        override suspend fun retry(
            params: QuoteRetryParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<Quote> {
            // We check here instead of in the params builder because this can be specified
            // positionally or in the params class.
            checkRequired("quoteId", params.quoteId())
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.POST)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("quotes", params._pathParam(0), "retry")
                    .body(json(clientOptions.jsonMapper, params._body()))
                    .build()
                    .prepareAsync(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.executeAsync(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response
                    .use { retryHandler.handle(it) }
                    .also {
                        if (requestOptions.responseValidation!!) {
                            it.validate()
                        }
                    }
            }
        }
    }
}
