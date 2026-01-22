// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.blocking

import com.google.errorprone.annotations.MustBeClosed
import com.grid.api.core.ClientOptions
import com.grid.api.core.RequestOptions
import com.grid.api.core.http.HttpResponseFor
import com.grid.api.models.receiver.ReceiverLookupExternalAccountParams
import com.grid.api.models.receiver.ReceiverLookupExternalAccountResponse
import com.grid.api.models.receiver.ReceiverLookupUmaParams
import com.grid.api.models.receiver.ReceiverLookupUmaResponse

interface ReceiverService {

    /**
     * Returns a view of this service that provides access to raw HTTP responses for each method.
     */
    fun withRawResponse(): WithRawResponse

    /**
     * Returns a view of this service with the given option modifications applied.
     *
     * The original service is not modified.
     */
    fun withOptions(modifier: (ClientOptions.Builder) -> Unit): ReceiverService

    /**
     * Lookup an external account by ID to determine supported currencies and exchange rates. This
     * endpoint helps platforms determine what currencies they can send to a given external account,
     * along with the current estimated exchange rates and minimum and maximum amounts that can be
     * sent.
     */
    fun lookupExternalAccount(
        accountId: String,
        params: ReceiverLookupExternalAccountParams = ReceiverLookupExternalAccountParams.none(),
        requestOptions: RequestOptions = RequestOptions.none(),
    ): ReceiverLookupExternalAccountResponse =
        lookupExternalAccount(params.toBuilder().accountId(accountId).build(), requestOptions)

    /** @see lookupExternalAccount */
    fun lookupExternalAccount(
        params: ReceiverLookupExternalAccountParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): ReceiverLookupExternalAccountResponse

    /** @see lookupExternalAccount */
    fun lookupExternalAccount(
        accountId: String,
        requestOptions: RequestOptions,
    ): ReceiverLookupExternalAccountResponse =
        lookupExternalAccount(accountId, ReceiverLookupExternalAccountParams.none(), requestOptions)

    /**
     * Lookup a receiving UMA address to determine supported currencies and exchange rates. This
     * endpoint helps platforms determine what currencies they can send to a given UMA address.
     */
    fun lookupUma(
        receiverUmaAddress: String,
        params: ReceiverLookupUmaParams = ReceiverLookupUmaParams.none(),
        requestOptions: RequestOptions = RequestOptions.none(),
    ): ReceiverLookupUmaResponse =
        lookupUma(params.toBuilder().receiverUmaAddress(receiverUmaAddress).build(), requestOptions)

    /** @see lookupUma */
    fun lookupUma(
        params: ReceiverLookupUmaParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): ReceiverLookupUmaResponse

    /** @see lookupUma */
    fun lookupUma(
        receiverUmaAddress: String,
        requestOptions: RequestOptions,
    ): ReceiverLookupUmaResponse =
        lookupUma(receiverUmaAddress, ReceiverLookupUmaParams.none(), requestOptions)

    /** A view of [ReceiverService] that provides access to raw HTTP responses for each method. */
    interface WithRawResponse {

        /**
         * Returns a view of this service with the given option modifications applied.
         *
         * The original service is not modified.
         */
        fun withOptions(modifier: (ClientOptions.Builder) -> Unit): ReceiverService.WithRawResponse

        /**
         * Returns a raw HTTP response for `get /receiver/external-account/{accountId}`, but is
         * otherwise the same as [ReceiverService.lookupExternalAccount].
         */
        @MustBeClosed
        fun lookupExternalAccount(
            accountId: String,
            params: ReceiverLookupExternalAccountParams =
                ReceiverLookupExternalAccountParams.none(),
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<ReceiverLookupExternalAccountResponse> =
            lookupExternalAccount(params.toBuilder().accountId(accountId).build(), requestOptions)

        /** @see lookupExternalAccount */
        @MustBeClosed
        fun lookupExternalAccount(
            params: ReceiverLookupExternalAccountParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<ReceiverLookupExternalAccountResponse>

        /** @see lookupExternalAccount */
        @MustBeClosed
        fun lookupExternalAccount(
            accountId: String,
            requestOptions: RequestOptions,
        ): HttpResponseFor<ReceiverLookupExternalAccountResponse> =
            lookupExternalAccount(
                accountId,
                ReceiverLookupExternalAccountParams.none(),
                requestOptions,
            )

        /**
         * Returns a raw HTTP response for `get /receiver/uma/{receiverUmaAddress}`, but is
         * otherwise the same as [ReceiverService.lookupUma].
         */
        @MustBeClosed
        fun lookupUma(
            receiverUmaAddress: String,
            params: ReceiverLookupUmaParams = ReceiverLookupUmaParams.none(),
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<ReceiverLookupUmaResponse> =
            lookupUma(
                params.toBuilder().receiverUmaAddress(receiverUmaAddress).build(),
                requestOptions,
            )

        /** @see lookupUma */
        @MustBeClosed
        fun lookupUma(
            params: ReceiverLookupUmaParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<ReceiverLookupUmaResponse>

        /** @see lookupUma */
        @MustBeClosed
        fun lookupUma(
            receiverUmaAddress: String,
            requestOptions: RequestOptions,
        ): HttpResponseFor<ReceiverLookupUmaResponse> =
            lookupUma(receiverUmaAddress, ReceiverLookupUmaParams.none(), requestOptions)
    }
}
