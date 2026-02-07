// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.blocking

import com.google.errorprone.annotations.MustBeClosed
import com.grid.api.core.ClientOptions
import com.grid.api.core.RequestOptions
import com.grid.api.core.http.HttpResponse
import com.grid.api.core.http.HttpResponseFor
import com.grid.api.models.tokens.ApiToken
import com.grid.api.models.tokens.TokenCreateParams
import com.grid.api.models.tokens.TokenDeleteParams
import com.grid.api.models.tokens.TokenListPage
import com.grid.api.models.tokens.TokenListParams
import com.grid.api.models.tokens.TokenRetrieveParams

interface TokenService {

    /**
     * Returns a view of this service that provides access to raw HTTP responses for each method.
     */
    fun withRawResponse(): WithRawResponse

    /**
     * Returns a view of this service with the given option modifications applied.
     *
     * The original service is not modified.
     */
    fun withOptions(modifier: (ClientOptions.Builder) -> Unit): TokenService

    /** Create a new API token to access the Grid APIs. */
    fun create(
        params: TokenCreateParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): ApiToken

    /** Retrieve an API token by their system-generated ID */
    fun retrieve(
        tokenId: String,
        params: TokenRetrieveParams = TokenRetrieveParams.none(),
        requestOptions: RequestOptions = RequestOptions.none(),
    ): ApiToken = retrieve(params.toBuilder().tokenId(tokenId).build(), requestOptions)

    /** @see retrieve */
    fun retrieve(
        params: TokenRetrieveParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): ApiToken

    /** @see retrieve */
    fun retrieve(tokenId: String, requestOptions: RequestOptions): ApiToken =
        retrieve(tokenId, TokenRetrieveParams.none(), requestOptions)

    /**
     * Retrieve a list of API tokens with optional filtering parameters. Returns all tokens that
     * match the specified filters. If no filters are provided, returns all tokens (paginated).
     */
    fun list(
        params: TokenListParams = TokenListParams.none(),
        requestOptions: RequestOptions = RequestOptions.none(),
    ): TokenListPage

    /** @see list */
    fun list(requestOptions: RequestOptions): TokenListPage =
        list(TokenListParams.none(), requestOptions)

    /** Delete an API token by their system-generated ID */
    fun delete(
        tokenId: String,
        params: TokenDeleteParams = TokenDeleteParams.none(),
        requestOptions: RequestOptions = RequestOptions.none(),
    ) = delete(params.toBuilder().tokenId(tokenId).build(), requestOptions)

    /** @see delete */
    fun delete(params: TokenDeleteParams, requestOptions: RequestOptions = RequestOptions.none())

    /** @see delete */
    fun delete(tokenId: String, requestOptions: RequestOptions) =
        delete(tokenId, TokenDeleteParams.none(), requestOptions)

    /** A view of [TokenService] that provides access to raw HTTP responses for each method. */
    interface WithRawResponse {

        /**
         * Returns a view of this service with the given option modifications applied.
         *
         * The original service is not modified.
         */
        fun withOptions(modifier: (ClientOptions.Builder) -> Unit): TokenService.WithRawResponse

        /**
         * Returns a raw HTTP response for `post /tokens`, but is otherwise the same as
         * [TokenService.create].
         */
        @MustBeClosed
        fun create(
            params: TokenCreateParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<ApiToken>

        /**
         * Returns a raw HTTP response for `get /tokens/{tokenId}`, but is otherwise the same as
         * [TokenService.retrieve].
         */
        @MustBeClosed
        fun retrieve(
            tokenId: String,
            params: TokenRetrieveParams = TokenRetrieveParams.none(),
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<ApiToken> =
            retrieve(params.toBuilder().tokenId(tokenId).build(), requestOptions)

        /** @see retrieve */
        @MustBeClosed
        fun retrieve(
            params: TokenRetrieveParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<ApiToken>

        /** @see retrieve */
        @MustBeClosed
        fun retrieve(tokenId: String, requestOptions: RequestOptions): HttpResponseFor<ApiToken> =
            retrieve(tokenId, TokenRetrieveParams.none(), requestOptions)

        /**
         * Returns a raw HTTP response for `get /tokens`, but is otherwise the same as
         * [TokenService.list].
         */
        @MustBeClosed
        fun list(
            params: TokenListParams = TokenListParams.none(),
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<TokenListPage>

        /** @see list */
        @MustBeClosed
        fun list(requestOptions: RequestOptions): HttpResponseFor<TokenListPage> =
            list(TokenListParams.none(), requestOptions)

        /**
         * Returns a raw HTTP response for `delete /tokens/{tokenId}`, but is otherwise the same as
         * [TokenService.delete].
         */
        @MustBeClosed
        fun delete(
            tokenId: String,
            params: TokenDeleteParams = TokenDeleteParams.none(),
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponse = delete(params.toBuilder().tokenId(tokenId).build(), requestOptions)

        /** @see delete */
        @MustBeClosed
        fun delete(
            params: TokenDeleteParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponse

        /** @see delete */
        @MustBeClosed
        fun delete(tokenId: String, requestOptions: RequestOptions): HttpResponse =
            delete(tokenId, TokenDeleteParams.none(), requestOptions)
    }
}
