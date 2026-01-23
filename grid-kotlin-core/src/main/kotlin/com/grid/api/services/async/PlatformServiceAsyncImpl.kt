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
import com.grid.api.models.platform.PlatformInternalAccountsParams
import com.grid.api.models.platform.PlatformInternalAccountsResponse
import com.grid.api.services.async.platform.ExternalAccountServiceAsync
import com.grid.api.services.async.platform.ExternalAccountServiceAsyncImpl

class PlatformServiceAsyncImpl internal constructor(private val clientOptions: ClientOptions) :
    PlatformServiceAsync {

    private val withRawResponse: PlatformServiceAsync.WithRawResponse by lazy {
        WithRawResponseImpl(clientOptions)
    }

    private val externalAccounts: ExternalAccountServiceAsync by lazy {
        ExternalAccountServiceAsyncImpl(clientOptions)
    }

    override fun withRawResponse(): PlatformServiceAsync.WithRawResponse = withRawResponse

    override fun withOptions(modifier: (ClientOptions.Builder) -> Unit): PlatformServiceAsync =
        PlatformServiceAsyncImpl(clientOptions.toBuilder().apply(modifier).build())

    override fun externalAccounts(): ExternalAccountServiceAsync = externalAccounts

    override suspend fun internalAccounts(
        params: PlatformInternalAccountsParams,
        requestOptions: RequestOptions,
    ): PlatformInternalAccountsResponse =
        // get /platform/internal-accounts
        withRawResponse().internalAccounts(params, requestOptions).parse()

    class WithRawResponseImpl internal constructor(private val clientOptions: ClientOptions) :
        PlatformServiceAsync.WithRawResponse {

        private val errorHandler: Handler<HttpResponse> =
            errorHandler(errorBodyHandler(clientOptions.jsonMapper))

        private val externalAccounts: ExternalAccountServiceAsync.WithRawResponse by lazy {
            ExternalAccountServiceAsyncImpl.WithRawResponseImpl(clientOptions)
        }

        override fun withOptions(
            modifier: (ClientOptions.Builder) -> Unit
        ): PlatformServiceAsync.WithRawResponse =
            PlatformServiceAsyncImpl.WithRawResponseImpl(
                clientOptions.toBuilder().apply(modifier).build()
            )

        override fun externalAccounts(): ExternalAccountServiceAsync.WithRawResponse =
            externalAccounts

        private val internalAccountsHandler: Handler<PlatformInternalAccountsResponse> =
            jsonHandler<PlatformInternalAccountsResponse>(clientOptions.jsonMapper)

        override suspend fun internalAccounts(
            params: PlatformInternalAccountsParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<PlatformInternalAccountsResponse> {
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.GET)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("platform", "internal-accounts")
                    .build()
                    .prepareAsync(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.executeAsync(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response
                    .use { internalAccountsHandler.handle(it) }
                    .also {
                        if (requestOptions.responseValidation!!) {
                            it.validate()
                        }
                    }
            }
        }
    }
}
