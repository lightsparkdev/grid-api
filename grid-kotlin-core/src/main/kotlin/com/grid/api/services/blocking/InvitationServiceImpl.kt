// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.blocking

import com.grid.api.core.ClientOptions
import com.grid.api.core.RequestOptions
import com.grid.api.core.checkRequired
import com.grid.api.core.handlers.errorBodyHandler
import com.grid.api.core.handlers.errorHandler
import com.grid.api.core.handlers.jsonHandler
import com.grid.api.core.http.HttpMethod
import com.grid.api.core.http.HttpRequest
import com.grid.api.core.http.HttpResponse
import com.grid.api.core.http.HttpResponse.Handler
import com.grid.api.core.http.HttpResponseFor
import com.grid.api.core.http.json
import com.grid.api.core.http.parseable
import com.grid.api.core.prepare
import com.grid.api.models.invitations.InvitationCancelParams
import com.grid.api.models.invitations.InvitationClaimParams
import com.grid.api.models.invitations.InvitationCreateParams
import com.grid.api.models.invitations.InvitationRetrieveParams
import com.grid.api.models.invitations.UmaInvitation

class InvitationServiceImpl internal constructor(private val clientOptions: ClientOptions) :
    InvitationService {

    private val withRawResponse: InvitationService.WithRawResponse by lazy {
        WithRawResponseImpl(clientOptions)
    }

    override fun withRawResponse(): InvitationService.WithRawResponse = withRawResponse

    override fun withOptions(modifier: (ClientOptions.Builder) -> Unit): InvitationService =
        InvitationServiceImpl(clientOptions.toBuilder().apply(modifier).build())

    override fun create(
        params: InvitationCreateParams,
        requestOptions: RequestOptions,
    ): UmaInvitation =
        // post /invitations
        withRawResponse().create(params, requestOptions).parse()

    override fun retrieve(
        params: InvitationRetrieveParams,
        requestOptions: RequestOptions,
    ): UmaInvitation =
        // get /invitations/{invitationCode}
        withRawResponse().retrieve(params, requestOptions).parse()

    override fun cancel(
        params: InvitationCancelParams,
        requestOptions: RequestOptions,
    ): UmaInvitation =
        // post /invitations/{invitationCode}/cancel
        withRawResponse().cancel(params, requestOptions).parse()

    override fun claim(
        params: InvitationClaimParams,
        requestOptions: RequestOptions,
    ): UmaInvitation =
        // post /invitations/{invitationCode}/claim
        withRawResponse().claim(params, requestOptions).parse()

    class WithRawResponseImpl internal constructor(private val clientOptions: ClientOptions) :
        InvitationService.WithRawResponse {

        private val errorHandler: Handler<HttpResponse> =
            errorHandler(errorBodyHandler(clientOptions.jsonMapper))

        override fun withOptions(
            modifier: (ClientOptions.Builder) -> Unit
        ): InvitationService.WithRawResponse =
            InvitationServiceImpl.WithRawResponseImpl(
                clientOptions.toBuilder().apply(modifier).build()
            )

        private val createHandler: Handler<UmaInvitation> =
            jsonHandler<UmaInvitation>(clientOptions.jsonMapper)

        override fun create(
            params: InvitationCreateParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<UmaInvitation> {
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.POST)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("invitations")
                    .body(json(clientOptions.jsonMapper, params._body()))
                    .build()
                    .prepare(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.execute(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response
                    .use { createHandler.handle(it) }
                    .also {
                        if (requestOptions.responseValidation!!) {
                            it.validate()
                        }
                    }
            }
        }

        private val retrieveHandler: Handler<UmaInvitation> =
            jsonHandler<UmaInvitation>(clientOptions.jsonMapper)

        override fun retrieve(
            params: InvitationRetrieveParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<UmaInvitation> {
            // We check here instead of in the params builder because this can be specified
            // positionally or in the params class.
            checkRequired("invitationCode", params.invitationCode())
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.GET)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("invitations", params._pathParam(0))
                    .build()
                    .prepare(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.execute(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response
                    .use { retrieveHandler.handle(it) }
                    .also {
                        if (requestOptions.responseValidation!!) {
                            it.validate()
                        }
                    }
            }
        }

        private val cancelHandler: Handler<UmaInvitation> =
            jsonHandler<UmaInvitation>(clientOptions.jsonMapper)

        override fun cancel(
            params: InvitationCancelParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<UmaInvitation> {
            // We check here instead of in the params builder because this can be specified
            // positionally or in the params class.
            checkRequired("invitationCode", params.invitationCode())
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.POST)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("invitations", params._pathParam(0), "cancel")
                    .apply { params._body()?.let { body(json(clientOptions.jsonMapper, it)) } }
                    .build()
                    .prepare(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.execute(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response
                    .use { cancelHandler.handle(it) }
                    .also {
                        if (requestOptions.responseValidation!!) {
                            it.validate()
                        }
                    }
            }
        }

        private val claimHandler: Handler<UmaInvitation> =
            jsonHandler<UmaInvitation>(clientOptions.jsonMapper)

        override fun claim(
            params: InvitationClaimParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<UmaInvitation> {
            // We check here instead of in the params builder because this can be specified
            // positionally or in the params class.
            checkRequired("invitationCode", params.invitationCode())
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.POST)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("invitations", params._pathParam(0), "claim")
                    .body(json(clientOptions.jsonMapper, params._body()))
                    .build()
                    .prepare(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.execute(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response
                    .use { claimHandler.handle(it) }
                    .also {
                        if (requestOptions.responseValidation!!) {
                            it.validate()
                        }
                    }
            }
        }
    }
}
