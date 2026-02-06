// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.async

import com.google.errorprone.annotations.MustBeClosed
import com.grid.api.core.ClientOptions
import com.grid.api.core.RequestOptions
import com.grid.api.core.http.HttpResponseFor
import com.grid.api.models.umaproviders.UmaProviderListPageAsync
import com.grid.api.models.umaproviders.UmaProviderListParams

interface UmaProviderServiceAsync {

    /**
     * Returns a view of this service that provides access to raw HTTP responses for each method.
     */
    fun withRawResponse(): WithRawResponse

    /**
     * Returns a view of this service with the given option modifications applied.
     *
     * The original service is not modified.
     */
    fun withOptions(modifier: (ClientOptions.Builder) -> Unit): UmaProviderServiceAsync

    /**
     * Retrieve a list of available Counterparty Providers. The response includes basic information
     * about each provider, such as its UMA address, name, and supported currencies.
     */
    suspend fun list(
        params: UmaProviderListParams = UmaProviderListParams.none(),
        requestOptions: RequestOptions = RequestOptions.none(),
    ): UmaProviderListPageAsync

    /** @see list */
    suspend fun list(requestOptions: RequestOptions): UmaProviderListPageAsync =
        list(UmaProviderListParams.none(), requestOptions)

    /**
     * A view of [UmaProviderServiceAsync] that provides access to raw HTTP responses for each
     * method.
     */
    interface WithRawResponse {

        /**
         * Returns a view of this service with the given option modifications applied.
         *
         * The original service is not modified.
         */
        fun withOptions(
            modifier: (ClientOptions.Builder) -> Unit
        ): UmaProviderServiceAsync.WithRawResponse

        /**
         * Returns a raw HTTP response for `get /uma-providers`, but is otherwise the same as
         * [UmaProviderServiceAsync.list].
         */
        @MustBeClosed
        suspend fun list(
            params: UmaProviderListParams = UmaProviderListParams.none(),
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<UmaProviderListPageAsync>

        /** @see list */
        @MustBeClosed
        suspend fun list(
            requestOptions: RequestOptions
        ): HttpResponseFor<UmaProviderListPageAsync> =
            list(UmaProviderListParams.none(), requestOptions)
    }
}
