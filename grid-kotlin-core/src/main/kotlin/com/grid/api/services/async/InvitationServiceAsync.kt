// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.async

import com.google.errorprone.annotations.MustBeClosed
import com.grid.api.core.ClientOptions
import com.grid.api.core.RequestOptions
import com.grid.api.core.http.HttpResponseFor
import com.grid.api.models.invitations.InvitationCancelParams
import com.grid.api.models.invitations.InvitationClaimParams
import com.grid.api.models.invitations.InvitationCreateParams
import com.grid.api.models.invitations.InvitationRetrieveParams
import com.grid.api.models.invitations.UmaInvitation

interface InvitationServiceAsync {

    /**
     * Returns a view of this service that provides access to raw HTTP responses for each method.
     */
    fun withRawResponse(): WithRawResponse

    /**
     * Returns a view of this service with the given option modifications applied.
     *
     * The original service is not modified.
     */
    fun withOptions(modifier: (ClientOptions.Builder) -> Unit): InvitationServiceAsync

    /** Create an UMA invitation from a given platform customer. */
    suspend fun create(
        params: InvitationCreateParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): UmaInvitation

    /** Get a specific UMA invitation by code. */
    suspend fun retrieve(
        invitationCode: String,
        params: InvitationRetrieveParams = InvitationRetrieveParams.none(),
        requestOptions: RequestOptions = RequestOptions.none(),
    ): UmaInvitation =
        retrieve(params.toBuilder().invitationCode(invitationCode).build(), requestOptions)

    /** @see retrieve */
    suspend fun retrieve(
        params: InvitationRetrieveParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): UmaInvitation

    /** @see retrieve */
    suspend fun retrieve(invitationCode: String, requestOptions: RequestOptions): UmaInvitation =
        retrieve(invitationCode, InvitationRetrieveParams.none(), requestOptions)

    /**
     * Cancel a pending UMA invitation. Only the inviter or platform can cancel an invitation.
     *
     * When an invitation is cancelled:
     * 1. The invitation status changes from PENDING to CANCELLED
     * 2. The invitation can no longer be claimed
     * 3. The invitation URL will show as cancelled when accessed
     *
     * Only pending invitations can be cancelled. Attempting to cancel an invitation that is already
     * claimed, expired, or cancelled will result in an error.
     */
    suspend fun cancel(
        invitationCode: String,
        params: InvitationCancelParams = InvitationCancelParams.none(),
        requestOptions: RequestOptions = RequestOptions.none(),
    ): UmaInvitation =
        cancel(params.toBuilder().invitationCode(invitationCode).build(), requestOptions)

    /** @see cancel */
    suspend fun cancel(
        params: InvitationCancelParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): UmaInvitation

    /** @see cancel */
    suspend fun cancel(invitationCode: String, requestOptions: RequestOptions): UmaInvitation =
        cancel(invitationCode, InvitationCancelParams.none(), requestOptions)

    /**
     * Claim an UMA invitation by associating it with an invitee UMA address.
     *
     * When an invitation is successfully claimed:
     * 1. The invitation status changes from PENDING to CLAIMED
     * 2. The invitee UMA address is associated with the invitation
     * 3. An INVITATION_CLAIMED webhook is triggered to notify the platform that created the
     *    invitation
     *
     * This endpoint allows customers to accept invitations sent to them by other UMA customers.
     */
    suspend fun claim(
        invitationCode: String,
        params: InvitationClaimParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): UmaInvitation =
        claim(params.toBuilder().invitationCode(invitationCode).build(), requestOptions)

    /** @see claim */
    suspend fun claim(
        params: InvitationClaimParams,
        requestOptions: RequestOptions = RequestOptions.none(),
    ): UmaInvitation

    /**
     * A view of [InvitationServiceAsync] that provides access to raw HTTP responses for each
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
        ): InvitationServiceAsync.WithRawResponse

        /**
         * Returns a raw HTTP response for `post /invitations`, but is otherwise the same as
         * [InvitationServiceAsync.create].
         */
        @MustBeClosed
        suspend fun create(
            params: InvitationCreateParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<UmaInvitation>

        /**
         * Returns a raw HTTP response for `get /invitations/{invitationCode}`, but is otherwise the
         * same as [InvitationServiceAsync.retrieve].
         */
        @MustBeClosed
        suspend fun retrieve(
            invitationCode: String,
            params: InvitationRetrieveParams = InvitationRetrieveParams.none(),
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<UmaInvitation> =
            retrieve(params.toBuilder().invitationCode(invitationCode).build(), requestOptions)

        /** @see retrieve */
        @MustBeClosed
        suspend fun retrieve(
            params: InvitationRetrieveParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<UmaInvitation>

        /** @see retrieve */
        @MustBeClosed
        suspend fun retrieve(
            invitationCode: String,
            requestOptions: RequestOptions,
        ): HttpResponseFor<UmaInvitation> =
            retrieve(invitationCode, InvitationRetrieveParams.none(), requestOptions)

        /**
         * Returns a raw HTTP response for `post /invitations/{invitationCode}/cancel`, but is
         * otherwise the same as [InvitationServiceAsync.cancel].
         */
        @MustBeClosed
        suspend fun cancel(
            invitationCode: String,
            params: InvitationCancelParams = InvitationCancelParams.none(),
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<UmaInvitation> =
            cancel(params.toBuilder().invitationCode(invitationCode).build(), requestOptions)

        /** @see cancel */
        @MustBeClosed
        suspend fun cancel(
            params: InvitationCancelParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<UmaInvitation>

        /** @see cancel */
        @MustBeClosed
        suspend fun cancel(
            invitationCode: String,
            requestOptions: RequestOptions,
        ): HttpResponseFor<UmaInvitation> =
            cancel(invitationCode, InvitationCancelParams.none(), requestOptions)

        /**
         * Returns a raw HTTP response for `post /invitations/{invitationCode}/claim`, but is
         * otherwise the same as [InvitationServiceAsync.claim].
         */
        @MustBeClosed
        suspend fun claim(
            invitationCode: String,
            params: InvitationClaimParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<UmaInvitation> =
            claim(params.toBuilder().invitationCode(invitationCode).build(), requestOptions)

        /** @see claim */
        @MustBeClosed
        suspend fun claim(
            params: InvitationClaimParams,
            requestOptions: RequestOptions = RequestOptions.none(),
        ): HttpResponseFor<UmaInvitation>
    }
}
