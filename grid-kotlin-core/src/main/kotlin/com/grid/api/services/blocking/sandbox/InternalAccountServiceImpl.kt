// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.blocking.sandbox

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
import com.grid.api.core.prepare
import com.grid.api.models.sandbox.internalaccounts.InternalAccount
import com.grid.api.models.sandbox.internalaccounts.InternalAccountFundParams

class InternalAccountServiceImpl internal constructor(private val clientOptions: ClientOptions) :
    InternalAccountService {

    private val withRawResponse: InternalAccountService.WithRawResponse by lazy {
        WithRawResponseImpl(clientOptions)
    }

    override fun withRawResponse(): InternalAccountService.WithRawResponse = withRawResponse

    override fun withOptions(modifier: (ClientOptions.Builder) -> Unit): InternalAccountService =
        InternalAccountServiceImpl(clientOptions.toBuilder().apply(modifier).build())

    override fun fund(
        params: InternalAccountFundParams,
        requestOptions: RequestOptions,
    ): InternalAccount =
        // post /sandbox/internal-accounts/{accountId}/fund
        withRawResponse().fund(params, requestOptions).parse()

    class WithRawResponseImpl internal constructor(private val clientOptions: ClientOptions) :
        InternalAccountService.WithRawResponse {

        private val errorHandler: Handler<HttpResponse> =
            errorHandler(errorBodyHandler(clientOptions.jsonMapper))

        override fun withOptions(
            modifier: (ClientOptions.Builder) -> Unit
        ): InternalAccountService.WithRawResponse =
            InternalAccountServiceImpl.WithRawResponseImpl(
                clientOptions.toBuilder().apply(modifier).build()
            )

        private val fundHandler: Handler<InternalAccount> =
            jsonHandler<InternalAccount>(clientOptions.jsonMapper)

        override fun fund(
            params: InternalAccountFundParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<InternalAccount> {
            // We check here instead of in the params builder because this can be specified
            // positionally or in the params class.
            checkRequired("accountId", params.accountId())
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.POST)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("sandbox", "internal-accounts", params._pathParam(0), "fund")
                    .body(json(clientOptions.jsonMapper, params._body()))
                    .build()
                    .prepare(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.execute(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response
                    .use { fundHandler.handle(it) }
                    .also {
                        if (requestOptions.responseValidation!!) {
                            it.validate()
                        }
                    }
            }
        }
    }
}
