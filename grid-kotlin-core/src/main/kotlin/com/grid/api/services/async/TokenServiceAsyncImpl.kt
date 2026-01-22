// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.async

import com.grid.api.core.ClientOptions
import com.grid.api.core.RequestOptions
import com.grid.api.core.checkRequired
import com.grid.api.core.handlers.emptyHandler
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
import com.grid.api.models.tokens.ApiToken
import com.grid.api.models.tokens.TokenCreateParams
import com.grid.api.models.tokens.TokenDeleteParams
import com.grid.api.models.tokens.TokenListParams
import com.grid.api.models.tokens.TokenListResponse
import com.grid.api.models.tokens.TokenRetrieveParams

class TokenServiceAsyncImpl internal constructor(private val clientOptions: ClientOptions) :
    TokenServiceAsync {

    private val withRawResponse: TokenServiceAsync.WithRawResponse by lazy {
        WithRawResponseImpl(clientOptions)
    }

    override fun withRawResponse(): TokenServiceAsync.WithRawResponse = withRawResponse

    override fun withOptions(modifier: (ClientOptions.Builder) -> Unit): TokenServiceAsync =
        TokenServiceAsyncImpl(clientOptions.toBuilder().apply(modifier).build())

    override suspend fun create(
        params: TokenCreateParams,
        requestOptions: RequestOptions,
    ): ApiToken =
        // post /tokens
        withRawResponse().create(params, requestOptions).parse()

    override suspend fun retrieve(
        params: TokenRetrieveParams,
        requestOptions: RequestOptions,
    ): ApiToken =
        // get /tokens/{tokenId}
        withRawResponse().retrieve(params, requestOptions).parse()

    override suspend fun list(
        params: TokenListParams,
        requestOptions: RequestOptions,
    ): TokenListResponse =
        // get /tokens
        withRawResponse().list(params, requestOptions).parse()

    override suspend fun delete(params: TokenDeleteParams, requestOptions: RequestOptions) {
        // delete /tokens/{tokenId}
        withRawResponse().delete(params, requestOptions)
    }

    class WithRawResponseImpl internal constructor(private val clientOptions: ClientOptions) :
        TokenServiceAsync.WithRawResponse {

        private val errorHandler: Handler<HttpResponse> =
            errorHandler(errorBodyHandler(clientOptions.jsonMapper))

        override fun withOptions(
            modifier: (ClientOptions.Builder) -> Unit
        ): TokenServiceAsync.WithRawResponse =
            TokenServiceAsyncImpl.WithRawResponseImpl(
                clientOptions.toBuilder().apply(modifier).build()
            )

        private val createHandler: Handler<ApiToken> =
            jsonHandler<ApiToken>(clientOptions.jsonMapper)

        override suspend fun create(
            params: TokenCreateParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<ApiToken> {
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.POST)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("tokens")
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

        private val retrieveHandler: Handler<ApiToken> =
            jsonHandler<ApiToken>(clientOptions.jsonMapper)

        override suspend fun retrieve(
            params: TokenRetrieveParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<ApiToken> {
            // We check here instead of in the params builder because this can be specified
            // positionally or in the params class.
            checkRequired("tokenId", params.tokenId())
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.GET)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("tokens", params._pathParam(0))
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

        private val listHandler: Handler<TokenListResponse> =
            jsonHandler<TokenListResponse>(clientOptions.jsonMapper)

        override suspend fun list(
            params: TokenListParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<TokenListResponse> {
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.GET)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("tokens")
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

        private val deleteHandler: Handler<Void?> = emptyHandler()

        override suspend fun delete(
            params: TokenDeleteParams,
            requestOptions: RequestOptions,
        ): HttpResponse {
            // We check here instead of in the params builder because this can be specified
            // positionally or in the params class.
            checkRequired("tokenId", params.tokenId())
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.DELETE)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("tokens", params._pathParam(0))
                    .apply { params._body()?.let { body(json(clientOptions.jsonMapper, it)) } }
                    .build()
                    .prepareAsync(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.executeAsync(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response.use { deleteHandler.handle(it) }
            }
        }
    }
}
