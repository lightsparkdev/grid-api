// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.blocking

import com.google.errorprone.annotations.MustBeClosed
import com.grid.api.core.ClientOptions
import com.grid.api.core.RequestOptions
import com.grid.api.core.http.HttpResponseFor
import com.grid.api.models.umaproviders.UmaProviderListPage
import com.grid.api.models.umaproviders.UmaProviderListParams

interface UmaProviderService {

    /**
     * Returns a view of this service that provides access to raw HTTP responses for each method.
     */
    fun withRawResponse(): WithRawResponse

    /**
     * Returns a view of this service with the given option modifications applied.
     *
     * The original service is not modified.
     */
    fun withOptions(modifier: (ClientOptions.Builder) -> Unit): UmaProviderService

    /**
     * Retrieve a list of available Counterparty Providers. The response includes basic information
     * about each provider, such as its UMA address, name, and supported currencies.
     */
    fun list(
        params: UmaProviderListParams = UmaProviderListParams.none(),
        requestOptions: RequestOptions = RequestOptions.none(),
    ): UmaProviderListPage

    /** @see list */
    fun list(requestOptions: RequestOptions): UmaProviderListPage =
        list(UmaProviderListParams.none(), requestOptions)

    /**
     * A view of [UmaProviderService] that provides access to raw HTTP responses for each method.
     */
    interface WithRawResponse {

        /**
         * Returns a view of this service with the given option modifications applied.
         *
         * The original service is not modified.
         */
        fun withOptions(
            modifier: (ClientOptions.Builder) -> Unit
        ): UmaProviderService.WithRawResponse

        /**
         * Returns a raw HTTP response for `get /uma-providers`, but is otherwise the same as
         * [UmaProviderService.list].
         */
        @MustBeClosed
        fun list(
            params: UmaProviderListParams = UmaProviderListParams.none(),
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<UmaProviderListPage>

        /** @see list */
        @MustBeClosed
        fun list(requestOptions: RequestOptions): HttpResponseFor<UmaProviderListPage> =
            list(UmaProviderListParams.none(), requestOptions)
    }
}
