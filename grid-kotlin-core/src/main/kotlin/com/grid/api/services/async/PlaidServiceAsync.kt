// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.async

import com.google.errorprone.annotations.MustBeClosed
import com.grid.api.core.ClientOptions
import com.grid.api.core.RequestOptions
import com.grid.api.core.http.HttpResponseFor
import com.grid.api.models.customers.externalaccounts.ExternalAccount
import com.grid.api.models.plaid.PlaidCreateLinkTokenParams
import com.grid.api.models.plaid.PlaidCreateLinkTokenResponse
import com.grid.api.models.plaid.PlaidSubmitPublicTokenParams

interface PlaidServiceAsync {

    /**
     * Returns a view of this service that provides access to raw HTTP responses for each method.
     */
    fun withRawResponse(): WithRawResponse

    /**
     * Returns a view of this service with the given option modifications applied.
     *
     * The original service is not modified.
     */
    fun withOptions(modifier: (ClientOptions.Builder) -> Unit): PlaidServiceAsync

    /**
     * Creates a Plaid Link token that can be used to initialize Plaid Link in your application. The
     * Link token is used to authenticate the customer and allow them to select their bank account.
     *
     * **Async Flow:**
     * 1. Platform calls this endpoint to get a link_token and callbackUrl
     * 2. Platform displays Plaid Link UI to the end customer using the link_token
     * 3. End customer authenticates with their bank and selects an account
     * 4. Plaid returns a public_token to the platform
     * 5. Platform POSTs the public_token to the callbackUrl
     * 6. Lightspark exchanges the public_token with Plaid and creates the external account
     *    asynchronously
     * 7. Platform receives a webhook notification when the external account is ready
     */
    suspend fun createLinkToken(
        params: PlaidCreateLinkTokenParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): PlaidCreateLinkTokenResponse

    /**
     * After the customer completes Plaid Link authentication, the platform should POST the
     * public_token to this callback URL (provided in the link token response).
     *
     * This will trigger asynchronous processing:
     * 1. Lightspark exchanges the public_token for an access_token with Plaid
     * 2. Lightspark retrieves and verifies the account details
     * 3. An external account is created
     * 4. A webhook notification is sent to the platform when complete
     */
    suspend fun submitPublicToken(
        plaidLinkToken: String,
        params: PlaidSubmitPublicTokenParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): ExternalAccount =
        submitPublicToken(params.toBuilder().plaidLinkToken(plaidLinkToken).build(), requestOptions)

    /** @see submitPublicToken */
    suspend fun submitPublicToken(
        params: PlaidSubmitPublicTokenParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): ExternalAccount

    /** A view of [PlaidServiceAsync] that provides access to raw HTTP responses for each method. */
    interface WithRawResponse {

        /**
         * Returns a view of this service with the given option modifications applied.
         *
         * The original service is not modified.
         */
        fun withOptions(
            modifier: (ClientOptions.Builder) -> Unit
        ): PlaidServiceAsync.WithRawResponse

        /**
         * Returns a raw HTTP response for `post /plaid/link-tokens`, but is otherwise the same as
         * [PlaidServiceAsync.createLinkToken].
         */
        @MustBeClosed
        suspend fun createLinkToken(
            params: PlaidCreateLinkTokenParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<PlaidCreateLinkTokenResponse>

        /**
         * Returns a raw HTTP response for `post /plaid/callback/{plaid_link_token}`, but is
         * otherwise the same as [PlaidServiceAsync.submitPublicToken].
         */
        @MustBeClosed
        suspend fun submitPublicToken(
            plaidLinkToken: String,
            params: PlaidSubmitPublicTokenParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<ExternalAccount> =
            submitPublicToken(
                params.toBuilder().plaidLinkToken(plaidLinkToken).build(),
                requestOptions,
            )

        /** @see submitPublicToken */
        @MustBeClosed
        suspend fun submitPublicToken(
            params: PlaidSubmitPublicTokenParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<ExternalAccount>
    }
}
