// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.blocking.platform

import com.google.errorprone.annotations.MustBeClosed
import com.grid.api.core.ClientOptions
import com.grid.api.core.RequestOptions
import com.grid.api.core.http.HttpResponseFor
import com.grid.api.models.customers.externalaccounts.ExternalAccount
import com.grid.api.models.customers.externalaccounts.ExternalAccountCreate
import com.grid.api.models.platform.externalaccounts.ExternalAccountCreateParams
import com.grid.api.models.platform.externalaccounts.ExternalAccountListParams
import com.grid.api.models.platform.externalaccounts.ExternalAccountListResponse

interface ExternalAccountService {

    /**
     * Returns a view of this service that provides access to raw HTTP responses for each method.
     */
    fun withRawResponse(): WithRawResponse

    /**
     * Returns a view of this service with the given option modifications applied.
     *
     * The original service is not modified.
     */
    fun withOptions(modifier: (ClientOptions.Builder) -> Unit): ExternalAccountService

    /**
     * Register a new external bank account for the platform.
     *
     * **Sandbox Testing:** In sandbox mode, use these account number patterns to test different
     * transfer scenarios. These patterns should be used with the primary alias, address, or
     * identifier of whatever account type you're testing. For example, the US account number, a
     * CLABE, an IBAN, a spark wallet address, etc. The failure patterns are:
     * - Account numbers ending in **002**: Insufficient funds (transfer-in will fail)
     * - Account numbers ending in **003**: Account closed/invalid (transfers will fail)
     * - Account numbers ending in **004**: Transfer rejected (bank rejects the transfer)
     * - Account numbers ending in **005**: Timeout/delayed failure (stays pending ~30s, then fails)
     * - Any other account number: Success (transfers complete normally)
     */
    fun create(
        params: ExternalAccountCreateParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): ExternalAccount

    /** @see create */
    fun create(
        externalAccountCreate: ExternalAccountCreate,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): ExternalAccount =
        create(
            ExternalAccountCreateParams.builder()
                .externalAccountCreate(externalAccountCreate)
                .build(),
            requestOptions,
        )

    /**
     * Retrieve a list of all external accounts that belong to the platform, as opposed to an
     * individual customer.
     *
     * These accounts are used for platform-wide operations such as receiving funds from external
     * sources or managing platform-level payment destinations.
     */
    fun list(
        params: ExternalAccountListParams = ExternalAccountListParams.none(),
        requestOptions: RequestOptions = RequestOptions.none(),
    ): ExternalAccountListResponse

    /** @see list */
    fun list(requestOptions: RequestOptions): ExternalAccountListResponse =
        list(ExternalAccountListParams.none(), requestOptions)

    /**
     * A view of [ExternalAccountService] that provides access to raw HTTP responses for each
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
        ): ExternalAccountService.WithRawResponse

        /**
         * Returns a raw HTTP response for `post /platform/external-accounts`, but is otherwise the
         * same as [ExternalAccountService.create].
         */
        @MustBeClosed
        fun create(
            params: ExternalAccountCreateParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<ExternalAccount>

        /** @see create */
        @MustBeClosed
        fun create(
            externalAccountCreate: ExternalAccountCreate,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<ExternalAccount> =
            create(
                ExternalAccountCreateParams.builder()
                    .externalAccountCreate(externalAccountCreate)
                    .build(),
                requestOptions,
            )

        /**
         * Returns a raw HTTP response for `get /platform/external-accounts`, but is otherwise the
         * same as [ExternalAccountService.list].
         */
        @MustBeClosed
        fun list(
            params: ExternalAccountListParams = ExternalAccountListParams.none(),
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<ExternalAccountListResponse>

        /** @see list */
        @MustBeClosed
        fun list(requestOptions: RequestOptions): HttpResponseFor<ExternalAccountListResponse> =
            list(ExternalAccountListParams.none(), requestOptions)
    }
}
