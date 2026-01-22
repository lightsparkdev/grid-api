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
import com.grid.api.core.http.json
import com.grid.api.core.http.parseable
import com.grid.api.core.prepare
import com.grid.api.models.sandbox.SandboxSendFundsParams
import com.grid.api.models.sandbox.SandboxSendFundsResponse
import com.grid.api.services.blocking.sandbox.InternalAccountService
import com.grid.api.services.blocking.sandbox.InternalAccountServiceImpl
import com.grid.api.services.blocking.sandbox.UmaService
import com.grid.api.services.blocking.sandbox.UmaServiceImpl

class SandboxServiceImpl internal constructor(private val clientOptions: ClientOptions) :
    SandboxService {

    private val withRawResponse: SandboxService.WithRawResponse by lazy {
        WithRawResponseImpl(clientOptions)
    }

    private val uma: UmaService by lazy { UmaServiceImpl(clientOptions) }

    private val internalAccounts: InternalAccountService by lazy {
        InternalAccountServiceImpl(clientOptions)
    }

    override fun withRawResponse(): SandboxService.WithRawResponse = withRawResponse

    override fun withOptions(modifier: (ClientOptions.Builder) -> Unit): SandboxService =
        SandboxServiceImpl(clientOptions.toBuilder().apply(modifier).build())

    override fun uma(): UmaService = uma

    override fun internalAccounts(): InternalAccountService = internalAccounts

    override fun sendFunds(
        params: SandboxSendFundsParams,
        requestOptions: RequestOptions,
    ): SandboxSendFundsResponse =
        // post /sandbox/send
        withRawResponse().sendFunds(params, requestOptions).parse()

    class WithRawResponseImpl internal constructor(private val clientOptions: ClientOptions) :
        SandboxService.WithRawResponse {

        private val errorHandler: Handler<HttpResponse> =
            errorHandler(errorBodyHandler(clientOptions.jsonMapper))

        private val uma: UmaService.WithRawResponse by lazy {
            UmaServiceImpl.WithRawResponseImpl(clientOptions)
        }

        private val internalAccounts: InternalAccountService.WithRawResponse by lazy {
            InternalAccountServiceImpl.WithRawResponseImpl(clientOptions)
        }

        override fun withOptions(
            modifier: (ClientOptions.Builder) -> Unit
        ): SandboxService.WithRawResponse =
            SandboxServiceImpl.WithRawResponseImpl(
                clientOptions.toBuilder().apply(modifier).build()
            )

        override fun uma(): UmaService.WithRawResponse = uma

        override fun internalAccounts(): InternalAccountService.WithRawResponse = internalAccounts

        private val sendFundsHandler: Handler<SandboxSendFundsResponse> =
            jsonHandler<SandboxSendFundsResponse>(clientOptions.jsonMapper)

        override fun sendFunds(
            params: SandboxSendFundsParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<SandboxSendFundsResponse> {
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.POST)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("sandbox", "send")
                    .body(json(clientOptions.jsonMapper, params._body()))
                    .build()
                    .prepare(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.execute(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response
                    .use { sendFundsHandler.handle(it) }
                    .also {
                        if (requestOptions.responseValidation!!) {
                            it.validate()
                        }
                    }
            }
        }
    }
}
