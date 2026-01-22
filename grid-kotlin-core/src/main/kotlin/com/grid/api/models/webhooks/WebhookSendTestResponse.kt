// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.webhooks

import com.fasterxml.jackson.annotation.JsonAnyGetter
import com.fasterxml.jackson.annotation.JsonAnySetter
import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.grid.api.core.ExcludeMissing
import com.grid.api.core.JsonField
import com.grid.api.core.JsonMissing
import com.grid.api.core.JsonValue
import com.grid.api.core.checkRequired
import com.grid.api.errors.GridInvalidDataException
import java.util.Collections
import java.util.Objects

class WebhookSendTestResponse
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val responseStatus: JsonField<Long>,
    private val responseBody: JsonField<String>,
    private val url: JsonField<String>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("response_status")
        @ExcludeMissing
        responseStatus: JsonField<Long> = JsonMissing.of(),
        @JsonProperty("response_body")
        @ExcludeMissing
        responseBody: JsonField<String> = JsonMissing.of(),
        @JsonProperty("url") @ExcludeMissing url: JsonField<String> = JsonMissing.of(),
    ) : this(responseStatus, responseBody, url, mutableMapOf())

    /**
     * The HTTP status code returned by the webhook endpoint
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun responseStatus(): Long = responseStatus.getRequired("response_status")

    /**
     * The raw body content returned by the webhook endpoint in response to the request
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun responseBody(): String? = responseBody.getNullable("response_body")

    /**
     * URL where the webhook was sent
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun url(): String? = url.getNullable("url")

    /**
     * Returns the raw JSON value of [responseStatus].
     *
     * Unlike [responseStatus], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("response_status")
    @ExcludeMissing
    fun _responseStatus(): JsonField<Long> = responseStatus

    /**
     * Returns the raw JSON value of [responseBody].
     *
     * Unlike [responseBody], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("response_body")
    @ExcludeMissing
    fun _responseBody(): JsonField<String> = responseBody

    /**
     * Returns the raw JSON value of [url].
     *
     * Unlike [url], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("url") @ExcludeMissing fun _url(): JsonField<String> = url

    @JsonAnySetter
    private fun putAdditionalProperty(key: String, value: JsonValue) {
        additionalProperties.put(key, value)
    }

    @JsonAnyGetter
    @ExcludeMissing
    fun _additionalProperties(): Map<String, JsonValue> =
        Collections.unmodifiableMap(additionalProperties)

    fun toBuilder() = Builder().from(this)

    companion object {

        /**
         * Returns a mutable builder for constructing an instance of [WebhookSendTestResponse].
         *
         * The following fields are required:
         * ```kotlin
         * .responseStatus()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [WebhookSendTestResponse]. */
    class Builder internal constructor() {

        private var responseStatus: JsonField<Long>? = null
        private var responseBody: JsonField<String> = JsonMissing.of()
        private var url: JsonField<String> = JsonMissing.of()
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(webhookSendTestResponse: WebhookSendTestResponse) = apply {
            responseStatus = webhookSendTestResponse.responseStatus
            responseBody = webhookSendTestResponse.responseBody
            url = webhookSendTestResponse.url
            additionalProperties = webhookSendTestResponse.additionalProperties.toMutableMap()
        }

        /** The HTTP status code returned by the webhook endpoint */
        fun responseStatus(responseStatus: Long) = responseStatus(JsonField.of(responseStatus))

        /**
         * Sets [Builder.responseStatus] to an arbitrary JSON value.
         *
         * You should usually call [Builder.responseStatus] with a well-typed [Long] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun responseStatus(responseStatus: JsonField<Long>) = apply {
            this.responseStatus = responseStatus
        }

        /** The raw body content returned by the webhook endpoint in response to the request */
        fun responseBody(responseBody: String) = responseBody(JsonField.of(responseBody))

        /**
         * Sets [Builder.responseBody] to an arbitrary JSON value.
         *
         * You should usually call [Builder.responseBody] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun responseBody(responseBody: JsonField<String>) = apply {
            this.responseBody = responseBody
        }

        /** URL where the webhook was sent */
        fun url(url: String) = url(JsonField.of(url))

        /**
         * Sets [Builder.url] to an arbitrary JSON value.
         *
         * You should usually call [Builder.url] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun url(url: JsonField<String>) = apply { this.url = url }

        fun additionalProperties(additionalProperties: Map<String, JsonValue>) = apply {
            this.additionalProperties.clear()
            putAllAdditionalProperties(additionalProperties)
        }

        fun putAdditionalProperty(key: String, value: JsonValue) = apply {
            additionalProperties.put(key, value)
        }

        fun putAllAdditionalProperties(additionalProperties: Map<String, JsonValue>) = apply {
            this.additionalProperties.putAll(additionalProperties)
        }

        fun removeAdditionalProperty(key: String) = apply { additionalProperties.remove(key) }

        fun removeAllAdditionalProperties(keys: Set<String>) = apply {
            keys.forEach(::removeAdditionalProperty)
        }

        /**
         * Returns an immutable instance of [WebhookSendTestResponse].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .responseStatus()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): WebhookSendTestResponse =
            WebhookSendTestResponse(
                checkRequired("responseStatus", responseStatus),
                responseBody,
                url,
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): WebhookSendTestResponse = apply {
        if (validated) {
            return@apply
        }

        responseStatus()
        responseBody()
        url()
        validated = true
    }

    fun isValid(): Boolean =
        try {
            validate()
            true
        } catch (e: GridInvalidDataException) {
            false
        }

    /**
     * Returns a score indicating how many valid values are contained in this object recursively.
     *
     * Used for best match union deserialization.
     */
    internal fun validity(): Int =
        (if (responseStatus.asKnown() == null) 0 else 1) +
            (if (responseBody.asKnown() == null) 0 else 1) +
            (if (url.asKnown() == null) 0 else 1)

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is WebhookSendTestResponse &&
            responseStatus == other.responseStatus &&
            responseBody == other.responseBody &&
            url == other.url &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(responseStatus, responseBody, url, additionalProperties)
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "WebhookSendTestResponse{responseStatus=$responseStatus, responseBody=$responseBody, url=$url, additionalProperties=$additionalProperties}"
}
