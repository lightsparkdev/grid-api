// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.async

import com.google.errorprone.annotations.MustBeClosed
import com.grid.api.core.ClientOptions
import com.grid.api.core.RequestOptions
import com.grid.api.core.http.HttpResponseFor
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
import com.grid.api.services.async.customers.BulkServiceAsync
import com.grid.api.services.async.customers.ExternalAccountServiceAsync

interface CustomerServiceAsync {

    /**
     * Returns a view of this service that provides access to raw HTTP responses for each method.
     */
    fun withRawResponse(): WithRawResponse

    /**
     * Returns a view of this service with the given option modifications applied.
     *
     * The original service is not modified.
     */
    fun withOptions(modifier: (ClientOptions.Builder) -> Unit): CustomerServiceAsync

    fun externalAccounts(): ExternalAccountServiceAsync

    fun bulk(): BulkServiceAsync

    /**
     * Register a new customer in the system with an account identifier and bank account information
     */
    suspend fun create(
        params: CustomerCreateParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): CustomerCreateResponse

    /** Retrieve a customer by their system-generated ID */
    suspend fun retrieve(
        customerId: String,
        params: CustomerRetrieveParams = CustomerRetrieveParams.none(),
        requestOptions: RequestOptions = RequestOptions.none(),
    ): CustomerRetrieveResponse =
        retrieve(params.toBuilder().customerId(customerId).build(), requestOptions)

    /** @see retrieve */
    suspend fun retrieve(
        params: CustomerRetrieveParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): CustomerRetrieveResponse

    /** @see retrieve */
    suspend fun retrieve(
        customerId: String,
        requestOptions: RequestOptions,
    ): CustomerRetrieveResponse =
        retrieve(customerId, CustomerRetrieveParams.none(), requestOptions)

    /** Update a customer's metadata by their system-generated ID */
    suspend fun update(
        customerId: String,
        params: CustomerUpdateParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): CustomerUpdateResponse =
        update(params.toBuilder().customerId(customerId).build(), requestOptions)

    /** @see update */
    suspend fun update(
        params: CustomerUpdateParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): CustomerUpdateResponse

    /**
     * Retrieve a list of customers with optional filtering parameters. Returns all customers that
     * match the specified filters. If no filters are provided, returns all customers (paginated).
     */
    suspend fun list(
        params: CustomerListParams = CustomerListParams.none(),
        requestOptions: RequestOptions = RequestOptions.none(),
    ): CustomerListResponse

    /** @see list */
    suspend fun list(requestOptions: RequestOptions): CustomerListResponse =
        list(CustomerListParams.none(), requestOptions)

    /** Delete a customer by their system-generated ID */
    suspend fun delete(
        customerId: String,
        params: CustomerDeleteParams = CustomerDeleteParams.none(),
        requestOptions: RequestOptions = RequestOptions.none(),
    ): CustomerDeleteResponse =
        delete(params.toBuilder().customerId(customerId).build(), requestOptions)

    /** @see delete */
    suspend fun delete(
        params: CustomerDeleteParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): CustomerDeleteResponse

    /** @see delete */
    suspend fun delete(customerId: String, requestOptions: RequestOptions): CustomerDeleteResponse =
        delete(customerId, CustomerDeleteParams.none(), requestOptions)

    /** Generate a hosted KYC link to onboard a customer */
    suspend fun getKycLink(
        params: CustomerGetKycLinkParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): CustomerGetKycLinkResponse

    /**
     * Retrieve a list of internal accounts with optional filtering parameters. Returns all internal
     * accounts that match the specified filters. If no filters are provided, returns all internal
     * accounts (paginated).
     *
     * Internal accounts are created automatically when a customer is created based on the platform
     * configuration.
     */
    suspend fun listInternalAccounts(
        params: CustomerListInternalAccountsParams = CustomerListInternalAccountsParams.none(),
        requestOptions: RequestOptions = RequestOptions.none(),
    ): CustomerListInternalAccountsResponse

    /** @see listInternalAccounts */
    suspend fun listInternalAccounts(
        requestOptions: RequestOptions
    ): CustomerListInternalAccountsResponse =
        listInternalAccounts(CustomerListInternalAccountsParams.none(), requestOptions)

    /**
     * A view of [CustomerServiceAsync] that provides access to raw HTTP responses for each method.
     */
    interface WithRawResponse {

        /**
         * Returns a view of this service with the given option modifications applied.
         *
         * The original service is not modified.
         */
        fun withOptions(
            modifier: (ClientOptions.Builder) -> Unit
        ): CustomerServiceAsync.WithRawResponse

        fun externalAccounts(): ExternalAccountServiceAsync.WithRawResponse

        fun bulk(): BulkServiceAsync.WithRawResponse

        /**
         * Returns a raw HTTP response for `post /customers`, but is otherwise the same as
         * [CustomerServiceAsync.create].
         */
        @MustBeClosed
        suspend fun create(
            params: CustomerCreateParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<CustomerCreateResponse>

        /**
         * Returns a raw HTTP response for `get /customers/{customerId}`, but is otherwise the same
         * as [CustomerServiceAsync.retrieve].
         */
        @MustBeClosed
        suspend fun retrieve(
            customerId: String,
            params: CustomerRetrieveParams = CustomerRetrieveParams.none(),
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<CustomerRetrieveResponse> =
            retrieve(params.toBuilder().customerId(customerId).build(), requestOptions)

        /** @see retrieve */
        @MustBeClosed
        suspend fun retrieve(
            params: CustomerRetrieveParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<CustomerRetrieveResponse>

        /** @see retrieve */
        @MustBeClosed
        suspend fun retrieve(
            customerId: String,
            requestOptions: RequestOptions,
        ): HttpResponseFor<CustomerRetrieveResponse> =
            retrieve(customerId, CustomerRetrieveParams.none(), requestOptions)

        /**
         * Returns a raw HTTP response for `patch /customers/{customerId}`, but is otherwise the
         * same as [CustomerServiceAsync.update].
         */
        @MustBeClosed
        suspend fun update(
            customerId: String,
            params: CustomerUpdateParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<CustomerUpdateResponse> =
            update(params.toBuilder().customerId(customerId).build(), requestOptions)

        /** @see update */
        @MustBeClosed
        suspend fun update(
            params: CustomerUpdateParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<CustomerUpdateResponse>

        /**
         * Returns a raw HTTP response for `get /customers`, but is otherwise the same as
         * [CustomerServiceAsync.list].
         */
        @MustBeClosed
        suspend fun list(
            params: CustomerListParams = CustomerListParams.none(),
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<CustomerListResponse>

        /** @see list */
        @MustBeClosed
        suspend fun list(requestOptions: RequestOptions): HttpResponseFor<CustomerListResponse> =
            list(CustomerListParams.none(), requestOptions)

        /**
         * Returns a raw HTTP response for `delete /customers/{customerId}`, but is otherwise the
         * same as [CustomerServiceAsync.delete].
         */
        @MustBeClosed
        suspend fun delete(
            customerId: String,
            params: CustomerDeleteParams = CustomerDeleteParams.none(),
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<CustomerDeleteResponse> =
            delete(params.toBuilder().customerId(customerId).build(), requestOptions)

        /** @see delete */
        @MustBeClosed
        suspend fun delete(
            params: CustomerDeleteParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<CustomerDeleteResponse>

        /** @see delete */
        @MustBeClosed
        suspend fun delete(
            customerId: String,
            requestOptions: RequestOptions,
        ): HttpResponseFor<CustomerDeleteResponse> =
            delete(customerId, CustomerDeleteParams.none(), requestOptions)

        /**
         * Returns a raw HTTP response for `get /customers/kyc-link`, but is otherwise the same as
         * [CustomerServiceAsync.getKycLink].
         */
        @MustBeClosed
        suspend fun getKycLink(
            params: CustomerGetKycLinkParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<CustomerGetKycLinkResponse>

        /**
         * Returns a raw HTTP response for `get /customers/internal-accounts`, but is otherwise the
         * same as [CustomerServiceAsync.listInternalAccounts].
         */
        @MustBeClosed
        suspend fun listInternalAccounts(
            params: CustomerListInternalAccountsParams = CustomerListInternalAccountsParams.none(),
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<CustomerListInternalAccountsResponse>

        /** @see listInternalAccounts */
        @MustBeClosed
        suspend fun listInternalAccounts(
            requestOptions: RequestOptions
        ): HttpResponseFor<CustomerListInternalAccountsResponse> =
            listInternalAccounts(CustomerListInternalAccountsParams.none(), requestOptions)
    }
}
