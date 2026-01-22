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
import com.grid.api.models.customers.CustomerCreateParams
import com.grid.api.models.customers.CustomerCreateResponse
import com.grid.api.models.customers.CustomerDeleteParams
import com.grid.api.models.customers.CustomerDeleteResponse
import com.grid.api.models.customers.CustomerGetKycLinkParams
import com.grid.api.models.customers.CustomerGetKycLinkResponse
import com.grid.api.models.customers.CustomerListInternalAccountsParams
import com.grid.api.models.customers.CustomerListInternalAccountsResponse
import com.grid.api.models.customers.CustomerListParams
import com.grid.api.models.customers.CustomerListResponse
import com.grid.api.models.customers.CustomerRetrieveParams
import com.grid.api.models.customers.CustomerRetrieveResponse
import com.grid.api.models.customers.CustomerUpdateParams
import com.grid.api.models.customers.CustomerUpdateResponse
import com.grid.api.services.blocking.customers.BulkService
import com.grid.api.services.blocking.customers.BulkServiceImpl
import com.grid.api.services.blocking.customers.ExternalAccountService
import com.grid.api.services.blocking.customers.ExternalAccountServiceImpl

class CustomerServiceImpl internal constructor(private val clientOptions: ClientOptions) :
    CustomerService {

    private val withRawResponse: CustomerService.WithRawResponse by lazy {
        WithRawResponseImpl(clientOptions)
    }

    private val externalAccounts: ExternalAccountService by lazy {
        ExternalAccountServiceImpl(clientOptions)
    }

    private val bulk: BulkService by lazy { BulkServiceImpl(clientOptions) }

    override fun withRawResponse(): CustomerService.WithRawResponse = withRawResponse

    override fun withOptions(modifier: (ClientOptions.Builder) -> Unit): CustomerService =
        CustomerServiceImpl(clientOptions.toBuilder().apply(modifier).build())

    override fun externalAccounts(): ExternalAccountService = externalAccounts

    override fun bulk(): BulkService = bulk

    override fun create(
        params: CustomerCreateParams,
        requestOptions: RequestOptions,
    ): CustomerCreateResponse =
        // post /customers
        withRawResponse().create(params, requestOptions).parse()

    override fun retrieve(
        params: CustomerRetrieveParams,
        requestOptions: RequestOptions,
    ): CustomerRetrieveResponse =
        // get /customers/{customerId}
        withRawResponse().retrieve(params, requestOptions).parse()

    override fun update(
        params: CustomerUpdateParams,
        requestOptions: RequestOptions,
    ): CustomerUpdateResponse =
        // patch /customers/{customerId}
        withRawResponse().update(params, requestOptions).parse()

    override fun list(
        params: CustomerListParams,
        requestOptions: RequestOptions,
    ): CustomerListResponse =
        // get /customers
        withRawResponse().list(params, requestOptions).parse()

    override fun delete(
        params: CustomerDeleteParams,
        requestOptions: RequestOptions,
    ): CustomerDeleteResponse =
        // delete /customers/{customerId}
        withRawResponse().delete(params, requestOptions).parse()

    override fun getKycLink(
        params: CustomerGetKycLinkParams,
        requestOptions: RequestOptions,
    ): CustomerGetKycLinkResponse =
        // get /customers/kyc-link
        withRawResponse().getKycLink(params, requestOptions).parse()

    override fun listInternalAccounts(
        params: CustomerListInternalAccountsParams,
        requestOptions: RequestOptions,
    ): CustomerListInternalAccountsResponse =
        // get /customers/internal-accounts
        withRawResponse().listInternalAccounts(params, requestOptions).parse()

    class WithRawResponseImpl internal constructor(private val clientOptions: ClientOptions) :
        CustomerService.WithRawResponse {

        private val errorHandler: Handler<HttpResponse> =
            errorHandler(errorBodyHandler(clientOptions.jsonMapper))

        private val externalAccounts: ExternalAccountService.WithRawResponse by lazy {
            ExternalAccountServiceImpl.WithRawResponseImpl(clientOptions)
        }

        private val bulk: BulkService.WithRawResponse by lazy {
            BulkServiceImpl.WithRawResponseImpl(clientOptions)
        }

        override fun withOptions(
            modifier: (ClientOptions.Builder) -> Unit
        ): CustomerService.WithRawResponse =
            CustomerServiceImpl.WithRawResponseImpl(
                clientOptions.toBuilder().apply(modifier).build()
            )

        override fun externalAccounts(): ExternalAccountService.WithRawResponse = externalAccounts

        override fun bulk(): BulkService.WithRawResponse = bulk

        private val createHandler: Handler<CustomerCreateResponse> =
            jsonHandler<CustomerCreateResponse>(clientOptions.jsonMapper)

        override fun create(
            params: CustomerCreateParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<CustomerCreateResponse> {
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.POST)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("customers")
                    .body(json(clientOptions.jsonMapper, params._body()))
                    .build()
                    .prepare(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.execute(request, requestOptions)
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

        private val retrieveHandler: Handler<CustomerRetrieveResponse> =
            jsonHandler<CustomerRetrieveResponse>(clientOptions.jsonMapper)

        override fun retrieve(
            params: CustomerRetrieveParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<CustomerRetrieveResponse> {
            // We check here instead of in the params builder because this can be specified
            // positionally or in the params class.
            checkRequired("customerId", params.customerId())
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.GET)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("customers", params._pathParam(0))
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

        private val updateHandler: Handler<CustomerUpdateResponse> =
            jsonHandler<CustomerUpdateResponse>(clientOptions.jsonMapper)

        override fun update(
            params: CustomerUpdateParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<CustomerUpdateResponse> {
            // We check here instead of in the params builder because this can be specified
            // positionally or in the params class.
            checkRequired("customerId", params.customerId())
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.PATCH)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("customers", params._pathParam(0))
                    .body(json(clientOptions.jsonMapper, params._body()))
                    .build()
                    .prepare(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.execute(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response
                    .use { updateHandler.handle(it) }
                    .also {
                        if (requestOptions.responseValidation!!) {
                            it.validate()
                        }
                    }
            }
        }

        private val listHandler: Handler<CustomerListResponse> =
            jsonHandler<CustomerListResponse>(clientOptions.jsonMapper)

        override fun list(
            params: CustomerListParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<CustomerListResponse> {
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.GET)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("customers")
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
            }
        }

        private val deleteHandler: Handler<CustomerDeleteResponse> =
            jsonHandler<CustomerDeleteResponse>(clientOptions.jsonMapper)

        override fun delete(
            params: CustomerDeleteParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<CustomerDeleteResponse> {
            // We check here instead of in the params builder because this can be specified
            // positionally or in the params class.
            checkRequired("customerId", params.customerId())
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.DELETE)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("customers", params._pathParam(0))
                    .apply { params._body()?.let { body(json(clientOptions.jsonMapper, it)) } }
                    .build()
                    .prepare(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.execute(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response
                    .use { deleteHandler.handle(it) }
                    .also {
                        if (requestOptions.responseValidation!!) {
                            it.validate()
                        }
                    }
            }
        }

        private val getKycLinkHandler: Handler<CustomerGetKycLinkResponse> =
            jsonHandler<CustomerGetKycLinkResponse>(clientOptions.jsonMapper)

        override fun getKycLink(
            params: CustomerGetKycLinkParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<CustomerGetKycLinkResponse> {
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.GET)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("customers", "kyc-link")
                    .build()
                    .prepare(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.execute(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response
                    .use { getKycLinkHandler.handle(it) }
                    .also {
                        if (requestOptions.responseValidation!!) {
                            it.validate()
                        }
                    }
            }
        }

        private val listInternalAccountsHandler: Handler<CustomerListInternalAccountsResponse> =
            jsonHandler<CustomerListInternalAccountsResponse>(clientOptions.jsonMapper)

        override fun listInternalAccounts(
            params: CustomerListInternalAccountsParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<CustomerListInternalAccountsResponse> {
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.GET)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("customers", "internal-accounts")
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
