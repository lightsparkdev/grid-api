// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.blocking.sandbox

import com.google.errorprone.annotations.MustBeClosed
import com.grid.api.core.ClientOptions
import com.grid.api.core.RequestOptions
import com.grid.api.core.http.HttpResponseFor
import com.grid.api.models.sandbox.internalaccounts.InternalAccount
import com.grid.api.models.sandbox.internalaccounts.InternalAccountFundParams

interface InternalAccountService {

    /**
     * Returns a view of this service that provides access to raw HTTP responses for each method.
     */
    fun withRawResponse(): WithRawResponse

    /**
     * Returns a view of this service with the given option modifications applied.
     *
     * The original service is not modified.
     */
    fun withOptions(modifier: (ClientOptions.Builder) -> Unit): InternalAccountService

    /**
     * Simulate receiving funds into an internal account in the sandbox environment. This is useful
     * for testing scenarios where you need to add funds to a customer's or platform's internal
     * account without going through a real bank transfer or following payment instructions. This
     * endpoint is only for the sandbox environment and will fail for production platforms/keys.
     */
    fun fund(
        accountId: String,
        params: InternalAccountFundParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): InternalAccount = fund(params.toBuilder().accountId(accountId).build(), requestOptions)

    /** @see fund */
    fun fund(
        params: InternalAccountFundParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): InternalAccount

    /**
     * A view of [InternalAccountService] that provides access to raw HTTP responses for each
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
        ): InternalAccountService.WithRawResponse

        /**
         * Returns a raw HTTP response for `post /sandbox/internal-accounts/{accountId}/fund`, but
         * is otherwise the same as [InternalAccountService.fund].
         */
        @MustBeClosed
        fun fund(
            accountId: String,
            params: InternalAccountFundParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<InternalAccount> =
            fund(params.toBuilder().accountId(accountId).build(), requestOptions)

        /** @see fund */
        @MustBeClosed
        fun fund(
            params: InternalAccountFundParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<InternalAccount>
    }
}
