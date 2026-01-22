// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.blocking

import com.google.errorprone.annotations.MustBeClosed
import com.grid.api.core.ClientOptions
import com.grid.api.core.RequestOptions
import com.grid.api.core.http.HttpResponseFor
import com.grid.api.models.webhooks.WebhookSendTestParams
import com.grid.api.models.webhooks.WebhookSendTestResponse

interface WebhookService {

    /**
     * Returns a view of this service that provides access to raw HTTP responses for each method.
     */
    fun withRawResponse(): WithRawResponse

    /**
     * Returns a view of this service with the given option modifications applied.
     *
     * The original service is not modified.
     */
    fun withOptions(modifier: (ClientOptions.Builder) -> Unit): WebhookService

    /** Send a test webhook to the configured endpoint */
    fun sendTest(
        params: WebhookSendTestParams = WebhookSendTestParams.none(),
        requestOptions: RequestOptions = RequestOptions.none(),
    ): WebhookSendTestResponse

    /** @see sendTest */
    fun sendTest(requestOptions: RequestOptions): WebhookSendTestResponse =
        sendTest(WebhookSendTestParams.none(), requestOptions)

    /** A view of [WebhookService] that provides access to raw HTTP responses for each method. */
    interface WithRawResponse {

        /**
         * Returns a view of this service with the given option modifications applied.
         *
         * The original service is not modified.
         */
        fun withOptions(modifier: (ClientOptions.Builder) -> Unit): WebhookService.WithRawResponse

        /**
         * Returns a raw HTTP response for `post /webhooks/test`, but is otherwise the same as
         * [WebhookService.sendTest].
         */
        @MustBeClosed
        fun sendTest(
            params: WebhookSendTestParams = WebhookSendTestParams.none(),
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<WebhookSendTestResponse>

        /** @see sendTest */
        @MustBeClosed
        fun sendTest(requestOptions: RequestOptions): HttpResponseFor<WebhookSendTestResponse> =
            sendTest(WebhookSendTestParams.none(), requestOptions)
    }
}
