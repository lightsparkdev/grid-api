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
import com.grid.api.core.http.json
import com.grid.api.core.http.parseable
import com.grid.api.core.prepare
import com.grid.api.models.transactions.IncomingTransaction
import com.grid.api.models.transactions.TransactionApproveParams
import com.grid.api.models.transactions.TransactionListPage
import com.grid.api.models.transactions.TransactionListPageResponse
import com.grid.api.models.transactions.TransactionListParams
import com.grid.api.models.transactions.TransactionRejectParams
import com.grid.api.models.transactions.TransactionRetrieveParams
import com.grid.api.models.transferin.Transaction

class TransactionServiceImpl internal constructor(private val clientOptions: ClientOptions) :
    TransactionService {

    private val withRawResponse: TransactionService.WithRawResponse by lazy {
        WithRawResponseImpl(clientOptions)
    }

    override fun withRawResponse(): TransactionService.WithRawResponse = withRawResponse

    override fun withOptions(modifier: (ClientOptions.Builder) -> Unit): TransactionService =
        TransactionServiceImpl(clientOptions.toBuilder().apply(modifier).build())

    override fun retrieve(
        params: TransactionRetrieveParams,
        requestOptions: RequestOptions,
    ): Transaction =
        // get /transactions/{transactionId}
        withRawResponse().retrieve(params, requestOptions).parse()

    override fun list(
        params: TransactionListParams,
        requestOptions: RequestOptions,
    ): TransactionListPage =
        // get /transactions
        withRawResponse().list(params, requestOptions).parse()

    override fun approve(
        params: TransactionApproveParams,
        requestOptions: RequestOptions,
    ): IncomingTransaction =
        // post /transactions/{transactionId}/approve
        withRawResponse().approve(params, requestOptions).parse()

    override fun reject(
        params: TransactionRejectParams,
        requestOptions: RequestOptions,
    ): IncomingTransaction =
        // post /transactions/{transactionId}/reject
        withRawResponse().reject(params, requestOptions).parse()

    class WithRawResponseImpl internal constructor(private val clientOptions: ClientOptions) :
        TransactionService.WithRawResponse {

        private val errorHandler: Handler<HttpResponse> =
            errorHandler(errorBodyHandler(clientOptions.jsonMapper))

        override fun withOptions(
            modifier: (ClientOptions.Builder) -> Unit
        ): TransactionService.WithRawResponse =
            TransactionServiceImpl.WithRawResponseImpl(
                clientOptions.toBuilder().apply(modifier).build()
            )

        private val retrieveHandler: Handler<Transaction> =
            jsonHandler<Transaction>(clientOptions.jsonMapper)

        override fun retrieve(
            params: TransactionRetrieveParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<Transaction> {
            // We check here instead of in the params builder because this can be specified
            // positionally or in the params class.
            checkRequired("transactionId", params.transactionId())
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.GET)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("transactions", params._pathParam(0))
                    .build()
                    .prepare(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.execute(request, requestOptions)
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

        private val listHandler: Handler<TransactionListPageResponse> =
            jsonHandler<TransactionListPageResponse>(clientOptions.jsonMapper)

        override fun list(
            params: TransactionListParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<TransactionListPage> {
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.GET)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("transactions")
                    .build()
                    .prepare(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.execute(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response
                    .use { listHandler.handle(it) }
                    .also {
                        if (requestOptions.responseValidation!!) {
                            it.validate()
                        }
                    }
                    .let {
                        TransactionListPage.builder()
                            .service(TransactionServiceImpl(clientOptions))
                            .params(params)
                            .response(it)
                            .build()
                    }
            }
        }

        private val approveHandler: Handler<IncomingTransaction> =
            jsonHandler<IncomingTransaction>(clientOptions.jsonMapper)

        override fun approve(
            params: TransactionApproveParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<IncomingTransaction> {
            // We check here instead of in the params builder because this can be specified
            // positionally or in the params class.
            checkRequired("transactionId", params.transactionId())
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.POST)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("transactions", params._pathParam(0), "approve")
                    .body(json(clientOptions.jsonMapper, params._body()))
                    .build()
                    .prepare(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.execute(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response
                    .use { approveHandler.handle(it) }
                    .also {
                        if (requestOptions.responseValidation!!) {
                            it.validate()
                        }
                    }
            }
        }

        private val rejectHandler: Handler<IncomingTransaction> =
            jsonHandler<IncomingTransaction>(clientOptions.jsonMapper)

        override fun reject(
            params: TransactionRejectParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<IncomingTransaction> {
            // We check here instead of in the params builder because this can be specified
            // positionally or in the params class.
            checkRequired("transactionId", params.transactionId())
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.POST)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("transactions", params._pathParam(0), "reject")
                    .body(json(clientOptions.jsonMapper, params._body()))
                    .build()
                    .prepare(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.execute(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response
                    .use { rejectHandler.handle(it) }
                    .also {
                        if (requestOptions.responseValidation!!) {
                            it.validate()
                        }
                    }
            }
        }
    }
}
