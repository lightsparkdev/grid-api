// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.blocking

import com.google.errorprone.annotations.MustBeClosed
import com.grid.api.core.ClientOptions
import com.grid.api.core.RequestOptions
import com.grid.api.core.http.HttpResponseFor
import com.grid.api.models.quotes.Quote
import com.grid.api.models.quotes.QuoteCreateParams
import com.grid.api.models.quotes.QuoteExecuteParams
import com.grid.api.models.quotes.QuoteListPage
import com.grid.api.models.quotes.QuoteListParams
import com.grid.api.models.quotes.QuoteRetrieveParams
import com.grid.api.models.quotes.QuoteRetryParams

interface QuoteService {

    /**
     * Returns a view of this service that provides access to raw HTTP responses for each method.
     */
    fun withRawResponse(): WithRawResponse

    /**
     * Returns a view of this service with the given option modifications applied.
     *
     * The original service is not modified.
     */
    fun withOptions(modifier: (ClientOptions.Builder) -> Unit): QuoteService

    /**
     * Generate a quote for a cross-currency transfer between any combination of accounts and UMA
     * addresses. This endpoint handles currency exchange and provides the necessary instructions to
     * execute the transfer.
     *
     * **Transfer Types Supported:**
     * - **Account to Account**: Transfer between internal/external accounts with currency exchange.
     * - **Account to UMA**: Transfer from an internal account to an UMA address.
     * - **UMA to Account or UMA to UMA**: This transfer type will only be funded by payment
     *   instructions, not from an internal account.
     *
     * **Key Features:**
     * - **Flexible Amount Locking**: Always specify whether you want to lock the sending amount or
     *   receiving amount
     * - **Currency Exchange**: Handles all cross-currency transfers with real-time exchange rates
     * - **Payment Instructions**: For UMA or customer ID sources, provides banking details needed
     *   for execution
     *
     * **Important:** If you are transferring funds in the same currency (no exchange required), use
     * the `/transfer-in` or `/transfer-out` endpoints instead.
     *
     * **Sandbox Testing:** When using the `externalAccountDetails` destination type in sandbox
     * mode, use account number patterns ending in specific digits to test different scenarios.
     * These patterns should be used with the primary alias, address, or identifier of whatever
     * account type you're testing. For example, the US account number, a CLABE, an IBAN, a spark
     * wallet address, etc. The failure patterns are:
     * - Account numbers ending in **002**: Insufficient funds (transfer-in will fail)
     * - Account numbers ending in **003**: Account closed/invalid (transfers will fail)
     * - Account numbers ending in **004**: Transfer rejected (bank rejects the transfer)
     * - Account numbers ending in **005**: Timeout/delayed failure (stays pending ~30s, then fails)
     * - Any other account number: Success (transfers complete normally)
     */
    fun create(
        params: QuoteCreateParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): Quote

    /**
     * Retrieve a quote by its ID. If the quote has been settled, it will include the transaction
     * ID. This allows clients to track the full lifecycle of a payment from quote creation to
     * settlement.
     */
    fun retrieve(
        quoteId: String,
        params: QuoteRetrieveParams = QuoteRetrieveParams.none(),
        requestOptions: RequestOptions = RequestOptions.none(),
    ): Quote = retrieve(params.toBuilder().quoteId(quoteId).build(), requestOptions)

    /** @see retrieve */
    fun retrieve(
        params: QuoteRetrieveParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): Quote

    /** @see retrieve */
    fun retrieve(quoteId: String, requestOptions: RequestOptions): Quote =
        retrieve(quoteId, QuoteRetrieveParams.none(), requestOptions)

    /**
     * Retrieve a list of transfer quotes with optional filtering parameters. Returns all quotes
     * that match the specified filters. If no filters are provided, returns all quotes (paginated).
     */
    fun list(
        params: QuoteListParams = QuoteListParams.none(),
        requestOptions: RequestOptions = RequestOptions.none(),
    ): QuoteListPage

    /** @see list */
    fun list(requestOptions: RequestOptions): QuoteListPage =
        list(QuoteListParams.none(), requestOptions)

    /**
     * Execute a quote by its ID. This endpoint initiates the transfer between the source and
     * destination accounts.
     *
     * This endpoint can only be used for quotes with a `source` which is either an internal
     * account, or has direct pull functionality (e.g. ACH pull with an external account).
     *
     * Once executed, the quote cannot be cancelled and the transfer will be processed.
     */
    fun execute(
        quoteId: String,
        params: QuoteExecuteParams = QuoteExecuteParams.none(),
        requestOptions: RequestOptions = RequestOptions.none(),
    ): Quote = execute(params.toBuilder().quoteId(quoteId).build(), requestOptions)

    /** @see execute */
    fun execute(
        params: QuoteExecuteParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): Quote

    /** @see execute */
    fun execute(quoteId: String, requestOptions: RequestOptions): Quote =
        execute(quoteId, QuoteExecuteParams.none(), requestOptions)

    /**
     * In the case where a customer is debited but the Lightning payment fails to complete,
     * integrators can retry the payment using this endpoint.
     *
     * Payments retried with this endpoint will debit from the sender and deliver to the recipient
     * the same amount as the original quote. As the Grid API does not persist customer PII, retries
     * need to start with a lookup request to retrieve the original quote's recipient counter party
     * data requirements then pass that sender information in the request body. Before calling this
     * endpoint, you should reach out to the Lightspark team to investigate the underlying issue. As
     * part of resolution, they'll update the transaction to the appropriate state. The quote /
     * transaction to retry must be in a `FAILED` or `REFUNDED` state.
     */
    fun retry(
        quoteId: String,
        params: QuoteRetryParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): Quote = retry(params.toBuilder().quoteId(quoteId).build(), requestOptions)

    /** @see retry */
    fun retry(
        params: QuoteRetryParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): Quote

    /** A view of [QuoteService] that provides access to raw HTTP responses for each method. */
    interface WithRawResponse {

        /**
         * Returns a view of this service with the given option modifications applied.
         *
         * The original service is not modified.
         */
        fun withOptions(modifier: (ClientOptions.Builder) -> Unit): QuoteService.WithRawResponse

        /**
         * Returns a raw HTTP response for `post /quotes`, but is otherwise the same as
         * [QuoteService.create].
         */
        @MustBeClosed
        fun create(
            params: QuoteCreateParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<Quote>

        /**
         * Returns a raw HTTP response for `get /quotes/{quoteId}`, but is otherwise the same as
         * [QuoteService.retrieve].
         */
        @MustBeClosed
        fun retrieve(
            quoteId: String,
            params: QuoteRetrieveParams = QuoteRetrieveParams.none(),
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<Quote> =
            retrieve(params.toBuilder().quoteId(quoteId).build(), requestOptions)

        /** @see retrieve */
        @MustBeClosed
        fun retrieve(
            params: QuoteRetrieveParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<Quote>

        /** @see retrieve */
        @MustBeClosed
        fun retrieve(quoteId: String, requestOptions: RequestOptions): HttpResponseFor<Quote> =
            retrieve(quoteId, QuoteRetrieveParams.none(), requestOptions)

        /**
         * Returns a raw HTTP response for `get /quotes`, but is otherwise the same as
         * [QuoteService.list].
         */
        @MustBeClosed
        fun list(
            params: QuoteListParams = QuoteListParams.none(),
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<QuoteListPage>

        /** @see list */
        @MustBeClosed
        fun list(requestOptions: RequestOptions): HttpResponseFor<QuoteListPage> =
            list(QuoteListParams.none(), requestOptions)

        /**
         * Returns a raw HTTP response for `post /quotes/{quoteId}/execute`, but is otherwise the
         * same as [QuoteService.execute].
         */
        @MustBeClosed
        fun execute(
            quoteId: String,
            params: QuoteExecuteParams = QuoteExecuteParams.none(),
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<Quote> =
            execute(params.toBuilder().quoteId(quoteId).build(), requestOptions)

        /** @see execute */
        @MustBeClosed
        fun execute(
            params: QuoteExecuteParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<Quote>

        /** @see execute */
        @MustBeClosed
        fun execute(quoteId: String, requestOptions: RequestOptions): HttpResponseFor<Quote> =
            execute(quoteId, QuoteExecuteParams.none(), requestOptions)

        /**
         * Returns a raw HTTP response for `post /quotes/{quoteId}/retry`, but is otherwise the same
         * as [QuoteService.retry].
         */
        @MustBeClosed
        fun retry(
            quoteId: String,
            params: QuoteRetryParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<Quote> =
            retry(params.toBuilder().quoteId(quoteId).build(), requestOptions)

        /** @see retry */
        @MustBeClosed
        fun retry(
            params: QuoteRetryParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<Quote>
    }
}
