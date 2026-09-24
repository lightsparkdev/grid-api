package com.grid.sample

import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.util.Base64

/**
 * Direct REST calls for endpoints the pinned Kotlin SDK doesn't model yet
 * (or models with an outdated shape). Returns Grid's status code and body
 * verbatim so routes can pass errors straight through to the frontend.
 */
object GridRest {
    // NOTE: keep in sync with the SDK's default base URL when bumping the SDK.
    private const val DEFAULT_BASE_URL = "https://api.lightspark.com/grid/2025-10-13"

    private val httpClient: HttpClient by lazy { HttpClient.newHttpClient() }

    data class Response(val status: Int, val body: String)

    fun request(
        method: String,
        path: String,
        body: String? = null,
        headers: Map<String, String> = emptyMap(),
    ): Response {
        val baseUrl = Config.apiBaseUrl ?: DEFAULT_BASE_URL
        val auth = Base64.getEncoder()
            .encodeToString("${Config.apiTokenId}:${Config.apiClientSecret}".toByteArray())
        val publisher = body?.let { HttpRequest.BodyPublishers.ofString(it) }
            ?: HttpRequest.BodyPublishers.noBody()
        val request = HttpRequest.newBuilder()
            .uri(URI.create("$baseUrl$path"))
            .header("Authorization", "Basic $auth")
            .header("Content-Type", "application/json")
            .apply { headers.forEach { (k, v) -> header(k, v) } }
            .method(method, publisher)
            .build()
        val response = httpClient.send(request, HttpResponse.BodyHandlers.ofString())
        return Response(response.statusCode(), response.body().ifBlank { "{}" })
    }
}
