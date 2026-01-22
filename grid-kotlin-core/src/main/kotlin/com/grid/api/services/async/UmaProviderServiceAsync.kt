// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.async

import com.google.errorprone.annotations.MustBeClosed
import com.grid.api.core.ClientOptions
import com.grid.api.core.RequestOptions
import com.grid.api.core.http.HttpResponseFor
import com.grid.api.models.umaproviders.UmaProviderListParams
import com.grid.api.models.umaproviders.UmaProviderListResponse

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
     * This endpoint provides a list of Counterparty Providers that are available.
     *
     * The response includes basic information about each provider, such as its UMA address, name,
     * and supported currencies. This can be used to determine which providers are available for
     * sending or receiving payments.
     */
    suspend fun list(
        params: UmaProviderListParams = UmaProviderListParams.none(),
        requestOptions: RequestOptions = RequestOptions.none(),
    ): UmaProviderListResponse

    /** @see list */
    suspend fun list(requestOptions: RequestOptions): UmaProviderListResponse =
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
        ): HttpResponseFor<UmaProviderListResponse>

        /** @see list */
        @MustBeClosed
        suspend fun list(requestOptions: RequestOptions): HttpResponseFor<UmaProviderListResponse> =
            list(UmaProviderListParams.none(), requestOptions)
    }
}
