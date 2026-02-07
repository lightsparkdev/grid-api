// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.async

import com.google.errorprone.annotations.MustBeClosed
import com.grid.api.core.ClientOptions
import com.grid.api.core.RequestOptions
import com.grid.api.core.http.HttpResponseFor
import com.grid.api.models.transferin.Transaction
import com.grid.api.models.transferin.TransferInCreateParams

interface TransferInServiceAsync {

    /**
     * Returns a view of this service that provides access to raw HTTP responses for each method.
     */
    fun withRawResponse(): WithRawResponse

    /**
     * Returns a view of this service with the given option modifications applied.
     *
     * The original service is not modified.
     */
    fun withOptions(modifier: (ClientOptions.Builder) -> Unit): TransferInServiceAsync

    /**
     * Transfer funds from an external account to an internal account for a specific customer. This
     * endpoint should only be used for external account sources with pull functionality (e.g. ACH
     * Pull). Otherwise, use the paymentInstructions on the internal account to deposit funds.
     */
    suspend fun create(
        params: TransferInCreateParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): Transaction

    /**
     * A view of [TransferInServiceAsync] that provides access to raw HTTP responses for each
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
        ): TransferInServiceAsync.WithRawResponse

        /**
         * Returns a raw HTTP response for `post /transfer-in`, but is otherwise the same as
         * [TransferInServiceAsync.create].
         */
        @MustBeClosed
        suspend fun create(
            params: TransferInCreateParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<Transaction>
    }
}
