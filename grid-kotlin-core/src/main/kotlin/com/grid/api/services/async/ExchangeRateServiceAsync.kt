// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.async

import com.google.errorprone.annotations.MustBeClosed
import com.grid.api.core.ClientOptions
import com.grid.api.core.RequestOptions
import com.grid.api.core.http.HttpResponseFor
import com.grid.api.models.exchangerates.ExchangeRateListParams
import com.grid.api.models.exchangerates.ExchangeRateListResponse

interface ExchangeRateServiceAsync {

    /**
     * Returns a view of this service that provides access to raw HTTP responses for each method.
     */
    fun withRawResponse(): WithRawResponse

    /**
     * Returns a view of this service with the given option modifications applied.
     *
     * The original service is not modified.
     */
    fun withOptions(modifier: (ClientOptions.Builder) -> Unit): ExchangeRateServiceAsync

    /**
     * Retrieve cached exchange rates for currency corridors. Returns FX rates that are cached for
     * approximately 5 minutes. Rates include fees specific to your platform for authenticated
     * requests.
     *
     * **Filtering Options:**
     * - Filter by source currency to get all available destination corridors
     * - Filter by specific destination currency or currencies
     * - Provide a sending amount to get calculated receiving amounts
     */
    suspend fun list(
        params: ExchangeRateListParams = ExchangeRateListParams.none(),
        requestOptions: RequestOptions = RequestOptions.none(),
    ): ExchangeRateListResponse

    /** @see list */
    suspend fun list(requestOptions: RequestOptions): ExchangeRateListResponse =
        list(ExchangeRateListParams.none(), requestOptions)

    /**
     * A view of [ExchangeRateServiceAsync] that provides access to raw HTTP responses for each
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
        ): ExchangeRateServiceAsync.WithRawResponse

        /**
         * Returns a raw HTTP response for `get /exchange-rates`, but is otherwise the same as
         * [ExchangeRateServiceAsync.list].
         */
        @MustBeClosed
        suspend fun list(
            params: ExchangeRateListParams = ExchangeRateListParams.none(),
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<ExchangeRateListResponse>

        /** @see list */
        @MustBeClosed
        suspend fun list(
            requestOptions: RequestOptions
        ): HttpResponseFor<ExchangeRateListResponse> =
            list(ExchangeRateListParams.none(), requestOptions)
    }
}
