// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.blocking

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
import com.grid.api.core.http.parseable
import com.grid.api.core.prepare
import com.grid.api.models.receiver.ReceiverLookupExternalAccountParams
import com.grid.api.models.receiver.ReceiverLookupExternalAccountResponse
import com.grid.api.models.receiver.ReceiverLookupUmaParams
import com.grid.api.models.receiver.ReceiverLookupUmaResponse

class ReceiverServiceImpl internal constructor(private val clientOptions: ClientOptions) :
    ReceiverService {

    private val withRawResponse: ReceiverService.WithRawResponse by lazy {
        WithRawResponseImpl(clientOptions)
    }

    override fun withRawResponse(): ReceiverService.WithRawResponse = withRawResponse

    override fun withOptions(modifier: (ClientOptions.Builder) -> Unit): ReceiverService =
        ReceiverServiceImpl(clientOptions.toBuilder().apply(modifier).build())

    override fun lookupExternalAccount(
        params: ReceiverLookupExternalAccountParams,
        requestOptions: RequestOptions,
    ): ReceiverLookupExternalAccountResponse =
        // get /receiver/external-account/{accountId}
        withRawResponse().lookupExternalAccount(params, requestOptions).parse()

    override fun lookupUma(
        params: ReceiverLookupUmaParams,
        requestOptions: RequestOptions,
    ): ReceiverLookupUmaResponse =
        // get /receiver/uma/{receiverUmaAddress}
        withRawResponse().lookupUma(params, requestOptions).parse()

    class WithRawResponseImpl internal constructor(private val clientOptions: ClientOptions) :
        ReceiverService.WithRawResponse {

        private val errorHandler: Handler<HttpResponse> =
            errorHandler(errorBodyHandler(clientOptions.jsonMapper))

        override fun withOptions(
            modifier: (ClientOptions.Builder) -> Unit
        ): ReceiverService.WithRawResponse =
            ReceiverServiceImpl.WithRawResponseImpl(
                clientOptions.toBuilder().apply(modifier).build()
            )

        private val lookupExternalAccountHandler: Handler<ReceiverLookupExternalAccountResponse> =
            jsonHandler<ReceiverLookupExternalAccountResponse>(clientOptions.jsonMapper)

        override fun lookupExternalAccount(
            params: ReceiverLookupExternalAccountParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<ReceiverLookupExternalAccountResponse> {
            // We check here instead of in the params builder because this can be specified
            // positionally or in the params class.
            checkRequired("accountId", params.accountId())
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.GET)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("receiver", "external-account", params._pathParam(0))
                    .build()
                    .prepare(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.execute(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response
                    .use { lookupExternalAccountHandler.handle(it) }
                    .also {
                        if (requestOptions.responseValidation!!) {
                            it.validate()
                        }
                    }
            }
        }

        private val lookupUmaHandler: Handler<ReceiverLookupUmaResponse> =
            jsonHandler<ReceiverLookupUmaResponse>(clientOptions.jsonMapper)

        override fun lookupUma(
            params: ReceiverLookupUmaParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<ReceiverLookupUmaResponse> {
            // We check here instead of in the params builder because this can be specified
            // positionally or in the params class.
            checkRequired("receiverUmaAddress", params.receiverUmaAddress())
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.GET)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("receiver", "uma", params._pathParam(0))
                    .build()
                    .prepare(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.execute(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response
                    .use { lookupUmaHandler.handle(it) }
                    .also {
                        if (requestOptions.responseValidation!!) {
                            it.validate()
                        }
                    }
            }
        }
    }
}
