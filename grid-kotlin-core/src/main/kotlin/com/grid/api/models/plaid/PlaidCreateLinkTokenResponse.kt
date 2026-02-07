// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.plaid

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
import java.time.OffsetDateTime
import java.util.Collections
import java.util.Objects

class PlaidCreateLinkTokenResponse
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val callbackUrl: JsonField<String>,
    private val expiration: JsonField<OffsetDateTime>,
    private val linkToken: JsonField<String>,
    private val requestId: JsonField<String>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("callbackUrl")
        @ExcludeMissing
        callbackUrl: JsonField<String> = JsonMissing.of(),
        @JsonProperty("expiration")
        @ExcludeMissing
        expiration: JsonField<OffsetDateTime> = JsonMissing.of(),
        @JsonProperty("linkToken") @ExcludeMissing linkToken: JsonField<String> = JsonMissing.of(),
        @JsonProperty("requestId") @ExcludeMissing requestId: JsonField<String> = JsonMissing.of(),
    ) : this(callbackUrl, expiration, linkToken, requestId, mutableMapOf())

    /**
     * The URL where the platform should POST the public_token after the customer completes Plaid
     * Link authentication. This will trigger asynchronous external account creation. The URL
     * includes the linkToken as the path parameter.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun callbackUrl(): String = callbackUrl.getRequired("callbackUrl")

    /**
     * The ISO 8601 timestamp when this link token expires. Link tokens typically expire after 4
     * hours.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun expiration(): OffsetDateTime = expiration.getRequired("expiration")

    /**
     * The Plaid Link token to be used to initialize Plaid Link in your application. This token is
     * single-use and expires after the specified expiration time.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun linkToken(): String = linkToken.getRequired("linkToken")

    /**
     * A unique identifier for this request, useful for debugging
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun requestId(): String? = requestId.getNullable("requestId")

    /**
     * Returns the raw JSON value of [callbackUrl].
     *
     * Unlike [callbackUrl], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("callbackUrl") @ExcludeMissing fun _callbackUrl(): JsonField<String> = callbackUrl

    /**
     * Returns the raw JSON value of [expiration].
     *
     * Unlike [expiration], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("expiration")
    @ExcludeMissing
    fun _expiration(): JsonField<OffsetDateTime> = expiration

    /**
     * Returns the raw JSON value of [linkToken].
     *
     * Unlike [linkToken], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("linkToken") @ExcludeMissing fun _linkToken(): JsonField<String> = linkToken

    /**
     * Returns the raw JSON value of [requestId].
     *
     * Unlike [requestId], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("requestId") @ExcludeMissing fun _requestId(): JsonField<String> = requestId

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
         * Returns a mutable builder for constructing an instance of [PlaidCreateLinkTokenResponse].
         *
         * The following fields are required:
         * ```kotlin
         * .callbackUrl()
         * .expiration()
         * .linkToken()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [PlaidCreateLinkTokenResponse]. */
    class Builder internal constructor() {

        private var callbackUrl: JsonField<String>? = null
        private var expiration: JsonField<OffsetDateTime>? = null
        private var linkToken: JsonField<String>? = null
        private var requestId: JsonField<String> = JsonMissing.of()
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(plaidCreateLinkTokenResponse: PlaidCreateLinkTokenResponse) = apply {
            callbackUrl = plaidCreateLinkTokenResponse.callbackUrl
            expiration = plaidCreateLinkTokenResponse.expiration
            linkToken = plaidCreateLinkTokenResponse.linkToken
            requestId = plaidCreateLinkTokenResponse.requestId
            additionalProperties = plaidCreateLinkTokenResponse.additionalProperties.toMutableMap()
        }

        /**
         * The URL where the platform should POST the public_token after the customer completes
         * Plaid Link authentication. This will trigger asynchronous external account creation. The
         * URL includes the linkToken as the path parameter.
         */
        fun callbackUrl(callbackUrl: String) = callbackUrl(JsonField.of(callbackUrl))

        /**
         * Sets [Builder.callbackUrl] to an arbitrary JSON value.
         *
         * You should usually call [Builder.callbackUrl] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun callbackUrl(callbackUrl: JsonField<String>) = apply { this.callbackUrl = callbackUrl }

        /**
         * The ISO 8601 timestamp when this link token expires. Link tokens typically expire after 4
         * hours.
         */
        fun expiration(expiration: OffsetDateTime) = expiration(JsonField.of(expiration))

        /**
         * Sets [Builder.expiration] to an arbitrary JSON value.
         *
         * You should usually call [Builder.expiration] with a well-typed [OffsetDateTime] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun expiration(expiration: JsonField<OffsetDateTime>) = apply {
            this.expiration = expiration
        }

        /**
         * The Plaid Link token to be used to initialize Plaid Link in your application. This token
         * is single-use and expires after the specified expiration time.
         */
        fun linkToken(linkToken: String) = linkToken(JsonField.of(linkToken))

        /**
         * Sets [Builder.linkToken] to an arbitrary JSON value.
         *
         * You should usually call [Builder.linkToken] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun linkToken(linkToken: JsonField<String>) = apply { this.linkToken = linkToken }

        /** A unique identifier for this request, useful for debugging */
        fun requestId(requestId: String) = requestId(JsonField.of(requestId))

        /**
         * Sets [Builder.requestId] to an arbitrary JSON value.
         *
         * You should usually call [Builder.requestId] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun requestId(requestId: JsonField<String>) = apply { this.requestId = requestId }

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
         * Returns an immutable instance of [PlaidCreateLinkTokenResponse].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .callbackUrl()
         * .expiration()
         * .linkToken()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): PlaidCreateLinkTokenResponse =
            PlaidCreateLinkTokenResponse(
                checkRequired("callbackUrl", callbackUrl),
                checkRequired("expiration", expiration),
                checkRequired("linkToken", linkToken),
                requestId,
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): PlaidCreateLinkTokenResponse = apply {
        if (validated) {
            return@apply
        }

        callbackUrl()
        expiration()
        linkToken()
        requestId()
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
        (if (callbackUrl.asKnown() == null) 0 else 1) +
            (if (expiration.asKnown() == null) 0 else 1) +
            (if (linkToken.asKnown() == null) 0 else 1) +
            (if (requestId.asKnown() == null) 0 else 1)

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is PlaidCreateLinkTokenResponse &&
            callbackUrl == other.callbackUrl &&
            expiration == other.expiration &&
            linkToken == other.linkToken &&
            requestId == other.requestId &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(callbackUrl, expiration, linkToken, requestId, additionalProperties)
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "PlaidCreateLinkTokenResponse{callbackUrl=$callbackUrl, expiration=$expiration, linkToken=$linkToken, requestId=$requestId, additionalProperties=$additionalProperties}"
}
