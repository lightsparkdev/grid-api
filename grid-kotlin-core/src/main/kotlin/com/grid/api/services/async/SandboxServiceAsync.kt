// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.async

import com.google.errorprone.annotations.MustBeClosed
import com.grid.api.core.ClientOptions
import com.grid.api.core.RequestOptions
import com.grid.api.core.http.HttpResponseFor
import com.grid.api.models.sandbox.SandboxSendFundsParams
import com.grid.api.models.sandbox.SandboxSendFundsResponse
import com.grid.api.services.async.sandbox.InternalAccountServiceAsync
import com.grid.api.services.async.sandbox.UmaServiceAsync

interface SandboxServiceAsync {

    /**
     * Returns a view of this service that provides access to raw HTTP responses for each method.
     */
    fun withRawResponse(): WithRawResponse

    /**
     * Returns a view of this service with the given option modifications applied.
     *
     * The original service is not modified.
     */
    fun withOptions(modifier: (ClientOptions.Builder) -> Unit): SandboxServiceAsync

    fun uma(): UmaServiceAsync

    fun internalAccounts(): InternalAccountServiceAsync

    /**
     * Simulate sending funds to the bank account as instructed in the quote. This endpoint is only
     * for the sandbox environment and will fail for production platforms/keys.
     */
    suspend fun sendFunds(
        params: SandboxSendFundsParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): SandboxSendFundsResponse

    /**
     * A view of [SandboxServiceAsync] that provides access to raw HTTP responses for each method.
     */
    interface WithRawResponse {

        /**
         * Returns a view of this service with the given option modifications applied.
         *
         * The original service is not modified.
         */
        fun withOptions(
            modifier: (ClientOptions.Builder) -> Unit
        ): SandboxServiceAsync.WithRawResponse

        fun uma(): UmaServiceAsync.WithRawResponse

        fun internalAccounts(): InternalAccountServiceAsync.WithRawResponse

        /**
         * Returns a raw HTTP response for `post /sandbox/send`, but is otherwise the same as
         * [SandboxServiceAsync.sendFunds].
         */
        @MustBeClosed
        suspend fun sendFunds(
            params: SandboxSendFundsParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<SandboxSendFundsResponse>
    }
}
