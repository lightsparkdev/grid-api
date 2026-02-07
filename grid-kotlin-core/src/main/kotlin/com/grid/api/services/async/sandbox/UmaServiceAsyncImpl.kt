// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.async.sandbox

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
import com.grid.api.models.sandbox.uma.UmaReceivePaymentParams
import com.grid.api.models.transactions.IncomingTransaction

class UmaServiceAsyncImpl internal constructor(private val clientOptions: ClientOptions) :
    UmaServiceAsync {

    private val withRawResponse: UmaServiceAsync.WithRawResponse by lazy {
        WithRawResponseImpl(clientOptions)
    }

    override fun withRawResponse(): UmaServiceAsync.WithRawResponse = withRawResponse

    override fun withOptions(modifier: (ClientOptions.Builder) -> Unit): UmaServiceAsync =
        UmaServiceAsyncImpl(clientOptions.toBuilder().apply(modifier).build())

    override suspend fun receivePayment(
        params: UmaReceivePaymentParams,
        requestOptions: RequestOptions,
    ): IncomingTransaction =
        // post /sandbox/uma/receive
        withRawResponse().receivePayment(params, requestOptions).parse()

    class WithRawResponseImpl internal constructor(private val clientOptions: ClientOptions) :
        UmaServiceAsync.WithRawResponse {

        private val errorHandler: Handler<HttpResponse> =
            errorHandler(errorBodyHandler(clientOptions.jsonMapper))

        override fun withOptions(
            modifier: (ClientOptions.Builder) -> Unit
        ): UmaServiceAsync.WithRawResponse =
            UmaServiceAsyncImpl.WithRawResponseImpl(
                clientOptions.toBuilder().apply(modifier).build()
            )

        private val receivePaymentHandler: Handler<IncomingTransaction> =
            jsonHandler<IncomingTransaction>(clientOptions.jsonMapper)

        override suspend fun receivePayment(
            params: UmaReceivePaymentParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<IncomingTransaction> {
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.POST)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("sandbox", "uma", "receive")
                    .body(json(clientOptions.jsonMapper, params._body()))
                    .build()
                    .prepareAsync(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.executeAsync(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response
                    .use { receivePaymentHandler.handle(it) }
                    .also {
                        if (requestOptions.responseValidation!!) {
                            it.validate()
                        }
                    }
            }
        }
    }
}
