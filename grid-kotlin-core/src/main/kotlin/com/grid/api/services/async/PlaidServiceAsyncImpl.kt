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
import com.grid.api.models.customers.externalaccounts.ExternalAccount
import com.grid.api.models.plaid.PlaidCreateLinkTokenParams
import com.grid.api.models.plaid.PlaidCreateLinkTokenResponse
import com.grid.api.models.plaid.PlaidSubmitPublicTokenParams

class PlaidServiceAsyncImpl internal constructor(private val clientOptions: ClientOptions) :
    PlaidServiceAsync {

    private val withRawResponse: PlaidServiceAsync.WithRawResponse by lazy {
        WithRawResponseImpl(clientOptions)
    }

    override fun withRawResponse(): PlaidServiceAsync.WithRawResponse = withRawResponse

    override fun withOptions(modifier: (ClientOptions.Builder) -> Unit): PlaidServiceAsync =
        PlaidServiceAsyncImpl(clientOptions.toBuilder().apply(modifier).build())

    override suspend fun createLinkToken(
        params: PlaidCreateLinkTokenParams,
        requestOptions: RequestOptions,
    ): PlaidCreateLinkTokenResponse =
        // post /plaid/link-tokens
        withRawResponse().createLinkToken(params, requestOptions).parse()

    override suspend fun submitPublicToken(
        params: PlaidSubmitPublicTokenParams,
        requestOptions: RequestOptions,
    ): ExternalAccount =
        // post /plaid/callback/{plaid_link_token}
        withRawResponse().submitPublicToken(params, requestOptions).parse()

    class WithRawResponseImpl internal constructor(private val clientOptions: ClientOptions) :
        PlaidServiceAsync.WithRawResponse {

        private val errorHandler: Handler<HttpResponse> =
            errorHandler(errorBodyHandler(clientOptions.jsonMapper))

        override fun withOptions(
            modifier: (ClientOptions.Builder) -> Unit
        ): PlaidServiceAsync.WithRawResponse =
            PlaidServiceAsyncImpl.WithRawResponseImpl(
                clientOptions.toBuilder().apply(modifier).build()
            )

        private val createLinkTokenHandler: Handler<PlaidCreateLinkTokenResponse> =
            jsonHandler<PlaidCreateLinkTokenResponse>(clientOptions.jsonMapper)

        override suspend fun createLinkToken(
            params: PlaidCreateLinkTokenParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<PlaidCreateLinkTokenResponse> {
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.POST)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("plaid", "link-tokens")
                    .body(json(clientOptions.jsonMapper, params._body()))
                    .build()
                    .prepareAsync(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.executeAsync(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response
                    .use { createLinkTokenHandler.handle(it) }
                    .also {
                        if (requestOptions.responseValidation!!) {
                            it.validate()
                        }
                    }
            }
        }

        private val submitPublicTokenHandler: Handler<ExternalAccount> =
            jsonHandler<ExternalAccount>(clientOptions.jsonMapper)

        override suspend fun submitPublicToken(
            params: PlaidSubmitPublicTokenParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<ExternalAccount> {
            // We check here instead of in the params builder because this can be specified
            // positionally or in the params class.
            checkRequired("plaidLinkToken", params.plaidLinkToken())
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.POST)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("plaid", "callback", params._pathParam(0))
                    .body(json(clientOptions.jsonMapper, params._body()))
                    .build()
                    .prepareAsync(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.executeAsync(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response
                    .use { submitPublicTokenHandler.handle(it) }
                    .also {
                        if (requestOptions.responseValidation!!) {
                            it.validate()
                        }
                    }
            }
        }
    }
}
