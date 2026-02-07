// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.blocking.sandbox

import com.google.errorprone.annotations.MustBeClosed
import com.grid.api.core.ClientOptions
import com.grid.api.core.RequestOptions
import com.grid.api.core.http.HttpResponseFor
import com.grid.api.models.sandbox.uma.UmaReceivePaymentParams
import com.grid.api.models.transactions.IncomingTransaction

interface UmaService {

    /**
     * Returns a view of this service that provides access to raw HTTP responses for each method.
     */
    fun withRawResponse(): WithRawResponse

    /**
     * Returns a view of this service with the given option modifications applied.
     *
     * The original service is not modified.
     */
    fun withOptions(modifier: (ClientOptions.Builder) -> Unit): UmaService

    /**
     * Simulate sending payment from an sandbox uma address to a platform customer to test payment
     * receive. This endpoint is only for the sandbox environment and will fail for production
     * platforms/keys.
     */
    fun receivePayment(
        params: UmaReceivePaymentParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): IncomingTransaction

    /** A view of [UmaService] that provides access to raw HTTP responses for each method. */
    interface WithRawResponse {

        /**
         * Returns a view of this service with the given option modifications applied.
         *
         * The original service is not modified.
         */
        fun withOptions(modifier: (ClientOptions.Builder) -> Unit): UmaService.WithRawResponse

        /**
         * Returns a raw HTTP response for `post /sandbox/uma/receive`, but is otherwise the same as
         * [UmaService.receivePayment].
         */
        @MustBeClosed
        fun receivePayment(
            params: UmaReceivePaymentParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<IncomingTransaction>
    }
}
