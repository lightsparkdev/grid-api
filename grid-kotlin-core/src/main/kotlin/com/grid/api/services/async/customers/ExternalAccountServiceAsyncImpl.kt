// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.async.customers

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
import com.grid.api.core.http.json
import com.grid.api.core.http.parseable
import com.grid.api.core.prepareAsync
import com.grid.api.models.customers.externalaccounts.ExternalAccount
import com.grid.api.models.customers.externalaccounts.ExternalAccountCreateParams
import com.grid.api.models.customers.externalaccounts.ExternalAccountListPageAsync
import com.grid.api.models.customers.externalaccounts.ExternalAccountListPageResponse
import com.grid.api.models.customers.externalaccounts.ExternalAccountListParams

class ExternalAccountServiceAsyncImpl
internal constructor(private val clientOptions: ClientOptions) : ExternalAccountServiceAsync {

    private val withRawResponse: ExternalAccountServiceAsync.WithRawResponse by lazy {
        WithRawResponseImpl(clientOptions)
    }

    override fun withRawResponse(): ExternalAccountServiceAsync.WithRawResponse = withRawResponse

    override fun withOptions(
        modifier: (ClientOptions.Builder) -> Unit
    ): ExternalAccountServiceAsync =
        ExternalAccountServiceAsyncImpl(clientOptions.toBuilder().apply(modifier).build())

    override suspend fun create(
        params: ExternalAccountCreateParams,
        requestOptions: RequestOptions,
    ): ExternalAccount =
        // post /customers/external-accounts
        withRawResponse().create(params, requestOptions).parse()

    override suspend fun list(
        params: ExternalAccountListParams,
        requestOptions: RequestOptions,
    ): ExternalAccountListPageAsync =
        // get /customers/external-accounts
        withRawResponse().list(params, requestOptions).parse()

    class WithRawResponseImpl internal constructor(private val clientOptions: ClientOptions) :
        ExternalAccountServiceAsync.WithRawResponse {

        private val errorHandler: Handler<HttpResponse> =
            errorHandler(errorBodyHandler(clientOptions.jsonMapper))

        override fun withOptions(
            modifier: (ClientOptions.Builder) -> Unit
        ): ExternalAccountServiceAsync.WithRawResponse =
            ExternalAccountServiceAsyncImpl.WithRawResponseImpl(
                clientOptions.toBuilder().apply(modifier).build()
            )

        private val createHandler: Handler<ExternalAccount> =
            jsonHandler<ExternalAccount>(clientOptions.jsonMapper)

        override suspend fun create(
            params: ExternalAccountCreateParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<ExternalAccount> {
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.POST)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("customers", "external-accounts")
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

        private val listHandler: Handler<ExternalAccountListPageResponse> =
            jsonHandler<ExternalAccountListPageResponse>(clientOptions.jsonMapper)

        override suspend fun list(
            params: ExternalAccountListParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<ExternalAccountListPageAsync> {
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.GET)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("customers", "external-accounts")
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
                        ExternalAccountListPageAsync.builder()
                            .service(ExternalAccountServiceAsyncImpl(clientOptions))
                            .params(params)
                            .response(it)
                            .build()
                    }
            }
        }
    }
}
