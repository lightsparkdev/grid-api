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
import com.grid.api.models.platform.PlatformListInternalAccountsParams
import com.grid.api.models.platform.PlatformListInternalAccountsResponse
import com.grid.api.services.blocking.platform.ExternalAccountService
import com.grid.api.services.blocking.platform.ExternalAccountServiceImpl

class PlatformServiceImpl internal constructor(private val clientOptions: ClientOptions) :
    PlatformService {

    private val withRawResponse: PlatformService.WithRawResponse by lazy {
        WithRawResponseImpl(clientOptions)
    }

    private val externalAccounts: ExternalAccountService by lazy {
        ExternalAccountServiceImpl(clientOptions)
    }

    override fun withRawResponse(): PlatformService.WithRawResponse = withRawResponse

    override fun withOptions(modifier: (ClientOptions.Builder) -> Unit): PlatformService =
        PlatformServiceImpl(clientOptions.toBuilder().apply(modifier).build())

    override fun externalAccounts(): ExternalAccountService = externalAccounts

    override fun listInternalAccounts(
        params: PlatformListInternalAccountsParams,
        requestOptions: RequestOptions,
    ): PlatformListInternalAccountsResponse =
        // get /platform/internal-accounts
        withRawResponse().listInternalAccounts(params, requestOptions).parse()

    class WithRawResponseImpl internal constructor(private val clientOptions: ClientOptions) :
        PlatformService.WithRawResponse {

        private val errorHandler: Handler<HttpResponse> =
            errorHandler(errorBodyHandler(clientOptions.jsonMapper))

        private val externalAccounts: ExternalAccountService.WithRawResponse by lazy {
            ExternalAccountServiceImpl.WithRawResponseImpl(clientOptions)
        }

        override fun withOptions(
            modifier: (ClientOptions.Builder) -> Unit
        ): PlatformService.WithRawResponse =
            PlatformServiceImpl.WithRawResponseImpl(
                clientOptions.toBuilder().apply(modifier).build()
            )

        override fun externalAccounts(): ExternalAccountService.WithRawResponse = externalAccounts

        private val listInternalAccountsHandler: Handler<PlatformListInternalAccountsResponse> =
            jsonHandler<PlatformListInternalAccountsResponse>(clientOptions.jsonMapper)

        override fun listInternalAccounts(
            params: PlatformListInternalAccountsParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<PlatformListInternalAccountsResponse> {
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.GET)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("platform", "internal-accounts")
                    .build()
                    .prepare(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.execute(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response
                    .use { listInternalAccountsHandler.handle(it) }
                    .also {
                        if (requestOptions.responseValidation!!) {
                            it.validate()
                        }
                    }
            }
        }
    }
}
