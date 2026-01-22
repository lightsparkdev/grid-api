// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.async

import com.google.errorprone.annotations.MustBeClosed
import com.grid.api.core.ClientOptions
import com.grid.api.core.RequestOptions
import com.grid.api.core.http.HttpResponseFor
import com.grid.api.models.platform.PlatformListInternalAccountsParams
import com.grid.api.models.platform.PlatformListInternalAccountsResponse
import com.grid.api.services.async.platform.ExternalAccountServiceAsync

interface PlatformServiceAsync {

    /**
     * Returns a view of this service that provides access to raw HTTP responses for each method.
     */
    fun withRawResponse(): WithRawResponse

    /**
     * Returns a view of this service with the given option modifications applied.
     *
     * The original service is not modified.
     */
    fun withOptions(modifier: (ClientOptions.Builder) -> Unit): PlatformServiceAsync

    fun externalAccounts(): ExternalAccountServiceAsync

    /**
     * Retrieve a list of all internal accounts that belong to the platform, as opposed to an
     * individual customer.
     *
     * These accounts are created automatically when the platform is configured for each supported
     * currency. They can be used for things like distributing bitcoin rewards to customers, or for
     * other platform-wide purposes.
     */
    suspend fun listInternalAccounts(
        params: PlatformListInternalAccountsParams = PlatformListInternalAccountsParams.none(),
        requestOptions: RequestOptions = RequestOptions.none(),
    ): PlatformListInternalAccountsResponse

    /** @see listInternalAccounts */
    suspend fun listInternalAccounts(
        requestOptions: RequestOptions
    ): PlatformListInternalAccountsResponse =
        listInternalAccounts(PlatformListInternalAccountsParams.none(), requestOptions)

    /**
     * A view of [PlatformServiceAsync] that provides access to raw HTTP responses for each method.
     */
    interface WithRawResponse {

        /**
         * Returns a view of this service with the given option modifications applied.
         *
         * The original service is not modified.
         */
        fun withOptions(
            modifier: (ClientOptions.Builder) -> Unit
        ): PlatformServiceAsync.WithRawResponse

        fun externalAccounts(): ExternalAccountServiceAsync.WithRawResponse

        /**
         * Returns a raw HTTP response for `get /platform/internal-accounts`, but is otherwise the
         * same as [PlatformServiceAsync.listInternalAccounts].
         */
        @MustBeClosed
        suspend fun listInternalAccounts(
            params: PlatformListInternalAccountsParams = PlatformListInternalAccountsParams.none(),
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<PlatformListInternalAccountsResponse>

        /** @see listInternalAccounts */
        @MustBeClosed
        suspend fun listInternalAccounts(
            requestOptions: RequestOptions
        ): HttpResponseFor<PlatformListInternalAccountsResponse> =
            listInternalAccounts(PlatformListInternalAccountsParams.none(), requestOptions)
    }
}
