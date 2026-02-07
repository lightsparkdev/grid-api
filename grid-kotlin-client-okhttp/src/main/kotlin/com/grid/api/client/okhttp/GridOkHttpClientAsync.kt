// File generated from our OpenAPI spec by Stainless.

package com.grid.api.client.okhttp

import com.fasterxml.jackson.databind.json.JsonMapper
import com.grid.api.client.GridClientAsync
import com.grid.api.client.GridClientAsyncImpl
import com.grid.api.core.ClientOptions
import com.grid.api.core.Sleeper
import com.grid.api.core.Timeout
import com.grid.api.core.http.Headers
import com.grid.api.core.http.HttpClient
import com.grid.api.core.http.QueryParams
import com.grid.api.core.jsonMapper
import java.net.Proxy
import java.time.Clock
import java.time.Duration
import java.util.concurrent.ExecutorService
import javax.net.ssl.HostnameVerifier
import javax.net.ssl.SSLSocketFactory
import javax.net.ssl.X509TrustManager

/**
 * A class that allows building an instance of [GridClientAsync] with [OkHttpClient] as the
 * underlying [HttpClient].
 */
class GridOkHttpClientAsync private constructor() {

    companion object {

        /** Returns a mutable builder for constructing an instance of [GridClientAsync]. */
        fun builder() = Builder()

        /**
         * Returns a client configured using system properties and environment variables.
         *
         * @see ClientOptions.Builder.fromEnv
         */
        fun fromEnv(): GridClientAsync = builder().fromEnv().build()
    }

    /** A builder for [GridOkHttpClientAsync]. */
    class Builder internal constructor() {

        private var clientOptions: ClientOptions.Builder = ClientOptions.builder()
        private var dispatcherExecutorService: ExecutorService? = null
        private var proxy: Proxy? = null
        private var sslSocketFactory: SSLSocketFactory? = null
        private var trustManager: X509TrustManager? = null
        private var hostnameVerifier: HostnameVerifier? = null

        /**
         * The executor service to use for running HTTP requests.
         *
         * Defaults to OkHttp's
         * [default executor service](https://github.com/square/okhttp/blob/ace792f443b2ffb17974f5c0d1cecdf589309f26/okhttp/src/commonJvmAndroid/kotlin/okhttp3/Dispatcher.kt#L98-L104).
         *
         * This class takes ownership of the executor service and shuts it down when closed.
         */
        fun dispatcherExecutorService(dispatcherExecutorService: ExecutorService?) = apply {
            this.dispatcherExecutorService = dispatcherExecutorService
        }

        fun proxy(proxy: Proxy?) = apply { this.proxy = proxy }

        /**
         * The socket factory used to secure HTTPS connections.
         *
         * If this is set, then [trustManager] must also be set.
         *
         * If unset, then the system default is used. Most applications should not call this method,
         * and instead use the system default. The default include special optimizations that can be
         * lost if the implementation is modified.
         */
        fun sslSocketFactory(sslSocketFactory: SSLSocketFactory?) = apply {
            this.sslSocketFactory = sslSocketFactory
        }

        /**
         * The trust manager used to secure HTTPS connections.
         *
         * If this is set, then [sslSocketFactory] must also be set.
         *
         * If unset, then the system default is used. Most applications should not call this method,
         * and instead use the system default. The default include special optimizations that can be
         * lost if the implementation is modified.
         */
        fun trustManager(trustManager: X509TrustManager?) = apply {
            this.trustManager = trustManager
        }

        /**
         * The verifier used to confirm that response certificates apply to requested hostnames for
         * HTTPS connections.
         *
         * If unset, then a default hostname verifier is used.
         */
        fun hostnameVerifier(hostnameVerifier: HostnameVerifier?) = apply {
            this.hostnameVerifier = hostnameVerifier
        }

        /**
         * Whether to throw an exception if any of the Jackson versions detected at runtime are
         * incompatible with the SDK's minimum supported Jackson version (2.13.4).
         *
         * Defaults to true. Use extreme caution when disabling this option. There is no guarantee
         * that the SDK will work correctly when using an incompatible Jackson version.
         */
        fun checkJacksonVersionCompatibility(checkJacksonVersionCompatibility: Boolean) = apply {
            clientOptions.checkJacksonVersionCompatibility(checkJacksonVersionCompatibility)
        }

        /**
         * The Jackson JSON mapper to use for serializing and deserializing JSON.
         *
         * Defaults to [com.grid.api.core.jsonMapper]. The default is usually sufficient and rarely
         * needs to be overridden.
         */
        fun jsonMapper(jsonMapper: JsonMapper) = apply { clientOptions.jsonMapper(jsonMapper) }

        /**
         * The interface to use for delaying execution, like during retries.
         *
         * This is primarily useful for using fake delays in tests.
         *
         * Defaults to real execution delays.
         *
         * This class takes ownership of the sleeper and closes it when closed.
         */
        fun sleeper(sleeper: Sleeper) = apply { clientOptions.sleeper(sleeper) }

        /**
         * The clock to use for operations that require timing, like retries.
         *
         * This is primarily useful for using a fake clock in tests.
         *
         * Defaults to [Clock.systemUTC].
         */
        fun clock(clock: Clock) = apply { clientOptions.clock(clock) }

        /**
         * The base URL to use for every request.
         *
         * Defaults to the production environment: `https://api.lightspark.com/grid/2025-10-13`.
         */
        fun baseUrl(baseUrl: String?) = apply { clientOptions.baseUrl(baseUrl) }

        /**
         * Whether to call `validate` on every response before returning it.
         *
         * Defaults to false, which means the shape of the response will not be validated upfront.
         * Instead, validation will only occur for the parts of the response that are accessed.
         */
        fun responseValidation(responseValidation: Boolean) = apply {
            clientOptions.responseValidation(responseValidation)
        }

        /**
         * Sets the maximum time allowed for various parts of an HTTP call's lifecycle, excluding
         * retries.
         *
         * Defaults to [Timeout.default].
         */
        fun timeout(timeout: Timeout) = apply { clientOptions.timeout(timeout) }

        /**
         * Sets the maximum time allowed for a complete HTTP call, not including retries.
         *
         * See [Timeout.request] for more details.
         *
         * For fine-grained control, pass a [Timeout] object.
         */
        fun timeout(timeout: Duration) = apply { clientOptions.timeout(timeout) }

        /**
         * The maximum number of times to retry failed requests, with a short exponential backoff
         * between requests.
         *
         * Only the following error types are retried:
         * - Connection errors (for example, due to a network connectivity problem)
         * - 408 Request Timeout
         * - 409 Conflict
         * - 429 Rate Limit
         * - 5xx Internal
         *
         * The API may also explicitly instruct the SDK to retry or not retry a request.
         *
         * Defaults to 2.
         */
        fun maxRetries(maxRetries: Int) = apply { clientOptions.maxRetries(maxRetries) }

        /** API token authentication using format `<api token id>:<api client secret>` */
        fun username(username: String) = apply { clientOptions.username(username) }

        /** API token authentication using format `<api token id>:<api client secret>` */
        fun password(password: String) = apply { clientOptions.password(password) }

        /**
         * Secp256r1 (P-256) asymmetric signature of the webhook payload, which can be used to
         * verify that the webhook was sent by Grid.
         *
         * To verify the signature:
         * 1. Get the Grid public key provided to you during integration
         * 2. Decode the base64 signature from the header
         * 3. Create a SHA-256 hash of the request body
         * 4. Verify the signature using the public key and the hash
         *
         * If the signature verification succeeds, the webhook is authentic. If not, it should be
         * rejected.
         */
        fun webhookSignature(webhookSignature: String?) = apply {
            clientOptions.webhookSignature(webhookSignature)
        }

        fun headers(headers: Headers) = apply { clientOptions.headers(headers) }

        fun headers(headers: Map<String, Iterable<String>>) = apply {
            clientOptions.headers(headers)
        }

        fun putHeader(name: String, value: String) = apply { clientOptions.putHeader(name, value) }

        fun putHeaders(name: String, values: Iterable<String>) = apply {
            clientOptions.putHeaders(name, values)
        }

        fun putAllHeaders(headers: Headers) = apply { clientOptions.putAllHeaders(headers) }

        fun putAllHeaders(headers: Map<String, Iterable<String>>) = apply {
            clientOptions.putAllHeaders(headers)
        }

        fun replaceHeaders(name: String, value: String) = apply {
            clientOptions.replaceHeaders(name, value)
        }

        fun replaceHeaders(name: String, values: Iterable<String>) = apply {
            clientOptions.replaceHeaders(name, values)
        }

        fun replaceAllHeaders(headers: Headers) = apply { clientOptions.replaceAllHeaders(headers) }

        fun replaceAllHeaders(headers: Map<String, Iterable<String>>) = apply {
            clientOptions.replaceAllHeaders(headers)
        }

        fun removeHeaders(name: String) = apply { clientOptions.removeHeaders(name) }

        fun removeAllHeaders(names: Set<String>) = apply { clientOptions.removeAllHeaders(names) }

        fun queryParams(queryParams: QueryParams) = apply { clientOptions.queryParams(queryParams) }

        fun queryParams(queryParams: Map<String, Iterable<String>>) = apply {
            clientOptions.queryParams(queryParams)
        }

        fun putQueryParam(key: String, value: String) = apply {
            clientOptions.putQueryParam(key, value)
        }

        fun putQueryParams(key: String, values: Iterable<String>) = apply {
            clientOptions.putQueryParams(key, values)
        }

        fun putAllQueryParams(queryParams: QueryParams) = apply {
            clientOptions.putAllQueryParams(queryParams)
        }

        fun putAllQueryParams(queryParams: Map<String, Iterable<String>>) = apply {
            clientOptions.putAllQueryParams(queryParams)
        }

        fun replaceQueryParams(key: String, value: String) = apply {
            clientOptions.replaceQueryParams(key, value)
        }

        fun replaceQueryParams(key: String, values: Iterable<String>) = apply {
            clientOptions.replaceQueryParams(key, values)
        }

        fun replaceAllQueryParams(queryParams: QueryParams) = apply {
            clientOptions.replaceAllQueryParams(queryParams)
        }

        fun replaceAllQueryParams(queryParams: Map<String, Iterable<String>>) = apply {
            clientOptions.replaceAllQueryParams(queryParams)
        }

        fun removeQueryParams(key: String) = apply { clientOptions.removeQueryParams(key) }

        fun removeAllQueryParams(keys: Set<String>) = apply {
            clientOptions.removeAllQueryParams(keys)
        }

        /**
         * Updates configuration using system properties and environment variables.
         *
         * @see ClientOptions.Builder.fromEnv
         */
        fun fromEnv() = apply { clientOptions.fromEnv() }

        /**
         * Returns an immutable instance of [GridClientAsync].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         */
        fun build(): GridClientAsync =
            GridClientAsyncImpl(
                clientOptions
                    .httpClient(
                        OkHttpClient.builder()
                            .timeout(clientOptions.timeout())
                            .proxy(proxy)
                            .dispatcherExecutorService(dispatcherExecutorService)
                            .sslSocketFactory(sslSocketFactory)
                            .trustManager(trustManager)
                            .hostnameVerifier(hostnameVerifier)
                            .build()
                    )
                    .build()
            )
    }
}
