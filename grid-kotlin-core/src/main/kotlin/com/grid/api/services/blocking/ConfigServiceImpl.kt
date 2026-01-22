// File generated from our OpenAPI spec by Stainless.

package com.grid.api.services.blocking

import com.grid.api.core.ClientOptions
import com.grid.api.core.RequestOptions
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
import com.grid.api.models.config.ConfigRetrieveParams
import com.grid.api.models.config.ConfigUpdateParams
import com.grid.api.models.config.PlatformConfig

class ConfigServiceImpl internal constructor(private val clientOptions: ClientOptions) :
    ConfigService {

    private val withRawResponse: ConfigService.WithRawResponse by lazy {
        WithRawResponseImpl(clientOptions)
    }

    override fun withRawResponse(): ConfigService.WithRawResponse = withRawResponse

    override fun withOptions(modifier: (ClientOptions.Builder) -> Unit): ConfigService =
        ConfigServiceImpl(clientOptions.toBuilder().apply(modifier).build())

    override fun retrieve(
        params: ConfigRetrieveParams,
        requestOptions: RequestOptions,
    ): PlatformConfig =
        // get /config
        withRawResponse().retrieve(params, requestOptions).parse()

    override fun update(
        params: ConfigUpdateParams,
        requestOptions: RequestOptions,
    ): PlatformConfig =
        // patch /config
        withRawResponse().update(params, requestOptions).parse()

    class WithRawResponseImpl internal constructor(private val clientOptions: ClientOptions) :
        ConfigService.WithRawResponse {

        private val errorHandler: Handler<HttpResponse> =
            errorHandler(errorBodyHandler(clientOptions.jsonMapper))

        override fun withOptions(
            modifier: (ClientOptions.Builder) -> Unit
        ): ConfigService.WithRawResponse =
            ConfigServiceImpl.WithRawResponseImpl(clientOptions.toBuilder().apply(modifier).build())

        private val retrieveHandler: Handler<PlatformConfig> =
            jsonHandler<PlatformConfig>(clientOptions.jsonMapper)

        override fun retrieve(
            params: ConfigRetrieveParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<PlatformConfig> {
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.GET)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("config")
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

        private val updateHandler: Handler<PlatformConfig> =
            jsonHandler<PlatformConfig>(clientOptions.jsonMapper)

        override fun update(
            params: ConfigUpdateParams,
            requestOptions: RequestOptions,
        ): HttpResponseFor<PlatformConfig> {
            val request =
                HttpRequest.builder()
                    .method(HttpMethod.PATCH)
                    .baseUrl(clientOptions.baseUrl())
                    .addPathSegments("config")
                    .body(json(clientOptions.jsonMapper, params._body()))
                    .build()
                    .prepare(clientOptions, params)
            val requestOptions = requestOptions.applyDefaults(RequestOptions.from(clientOptions))
            val response = clientOptions.httpClient.execute(request, requestOptions)
            return errorHandler.handle(response).parseable {
                response
                    .use { updateHandler.handle(it) }
                    .also {
                        if (requestOptions.responseValidation!!) {
                            it.validate()
                        }
                    }
            }
        }
    }
}
