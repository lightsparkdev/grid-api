// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.async

import com.google.errorprone.annotations.MustBeClosed
import com.grid.api.core.ClientOptions
import com.grid.api.core.RequestOptions
import com.grid.api.core.http.HttpResponseFor
import com.grid.api.models.config.ConfigRetrieveParams
import com.grid.api.models.config.ConfigUpdateParams
import com.grid.api.models.config.PlatformConfig

interface ConfigServiceAsync {

    /**
     * Returns a view of this service that provides access to raw HTTP responses for each method.
     */
    fun withRawResponse(): WithRawResponse

    /**
     * Returns a view of this service with the given option modifications applied.
     *
     * The original service is not modified.
     */
    fun withOptions(modifier: (ClientOptions.Builder) -> Unit): ConfigServiceAsync

    /** Retrieve the current platform configuration */
    suspend fun retrieve(
        params: ConfigRetrieveParams = ConfigRetrieveParams.none(),
        requestOptions: RequestOptions = RequestOptions.none(),
    ): PlatformConfig

    /** @see retrieve */
    suspend fun retrieve(requestOptions: RequestOptions): PlatformConfig =
        retrieve(ConfigRetrieveParams.none(), requestOptions)

    /** Update the platform configuration settings */
    suspend fun update(
        params: ConfigUpdateParams = ConfigUpdateParams.none(),
        requestOptions: RequestOptions = RequestOptions.none(),
    ): PlatformConfig

    /** @see update */
    suspend fun update(requestOptions: RequestOptions): PlatformConfig =
        update(ConfigUpdateParams.none(), requestOptions)

    /**
     * A view of [ConfigServiceAsync] that provides access to raw HTTP responses for each method.
     */
    interface WithRawResponse {

        /**
         * Returns a view of this service with the given option modifications applied.
         *
         * The original service is not modified.
         */
        fun withOptions(
            modifier: (ClientOptions.Builder) -> Unit
        ): ConfigServiceAsync.WithRawResponse

        /**
         * Returns a raw HTTP response for `get /config`, but is otherwise the same as
         * [ConfigServiceAsync.retrieve].
         */
        @MustBeClosed
        suspend fun retrieve(
            params: ConfigRetrieveParams = ConfigRetrieveParams.none(),
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<PlatformConfig>

        /** @see retrieve */
        @MustBeClosed
        suspend fun retrieve(requestOptions: RequestOptions): HttpResponseFor<PlatformConfig> =
            retrieve(ConfigRetrieveParams.none(), requestOptions)

        /**
         * Returns a raw HTTP response for `patch /config`, but is otherwise the same as
         * [ConfigServiceAsync.update].
         */
        @MustBeClosed
        suspend fun update(
            params: ConfigUpdateParams = ConfigUpdateParams.none(),
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<PlatformConfig>

        /** @see update */
        @MustBeClosed
        suspend fun update(requestOptions: RequestOptions): HttpResponseFor<PlatformConfig> =
            update(ConfigUpdateParams.none(), requestOptions)
    }
}
