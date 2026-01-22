// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers

import com.fasterxml.jackson.annotation.JsonAnyGetter
import com.fasterxml.jackson.annotation.JsonAnySetter
import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.grid.api.core.ExcludeMissing
import com.grid.api.core.JsonField
import com.grid.api.core.JsonMissing
import com.grid.api.core.JsonValue
import com.grid.api.errors.GridInvalidDataException
import java.util.Collections
import java.util.Objects

class CustomerGetKycLinkResponse
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val customerId: JsonField<String>,
    private val kycUrl: JsonField<String>,
    private val platformCustomerId: JsonField<String>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("customerId")
        @ExcludeMissing
        customerId: JsonField<String> = JsonMissing.of(),
        @JsonProperty("kycUrl") @ExcludeMissing kycUrl: JsonField<String> = JsonMissing.of(),
        @JsonProperty("platformCustomerId")
        @ExcludeMissing
        platformCustomerId: JsonField<String> = JsonMissing.of(),
    ) : this(customerId, kycUrl, platformCustomerId, mutableMapOf())

    /**
     * The customer id of the newly created customer on the system
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun customerId(): String? = customerId.getNullable("customerId")

    /**
     * A hosted KYC link for your customer to complete KYC
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun kycUrl(): String? = kycUrl.getNullable("kycUrl")

    /**
     * The platform id of the customer to onboard
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun platformCustomerId(): String? = platformCustomerId.getNullable("platformCustomerId")

    /**
     * Returns the raw JSON value of [customerId].
     *
     * Unlike [customerId], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("customerId") @ExcludeMissing fun _customerId(): JsonField<String> = customerId

    /**
     * Returns the raw JSON value of [kycUrl].
     *
     * Unlike [kycUrl], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("kycUrl") @ExcludeMissing fun _kycUrl(): JsonField<String> = kycUrl

    /**
     * Returns the raw JSON value of [platformCustomerId].
     *
     * Unlike [platformCustomerId], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    @JsonProperty("platformCustomerId")
    @ExcludeMissing
    fun _platformCustomerId(): JsonField<String> = platformCustomerId

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
         * Returns a mutable builder for constructing an instance of [CustomerGetKycLinkResponse].
         */
        fun builder() = Builder()
    }

    /** A builder for [CustomerGetKycLinkResponse]. */
    class Builder internal constructor() {

        private var customerId: JsonField<String> = JsonMissing.of()
        private var kycUrl: JsonField<String> = JsonMissing.of()
        private var platformCustomerId: JsonField<String> = JsonMissing.of()
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(customerGetKycLinkResponse: CustomerGetKycLinkResponse) = apply {
            customerId = customerGetKycLinkResponse.customerId
            kycUrl = customerGetKycLinkResponse.kycUrl
            platformCustomerId = customerGetKycLinkResponse.platformCustomerId
            additionalProperties = customerGetKycLinkResponse.additionalProperties.toMutableMap()
        }

        /** The customer id of the newly created customer on the system */
        fun customerId(customerId: String) = customerId(JsonField.of(customerId))

        /**
         * Sets [Builder.customerId] to an arbitrary JSON value.
         *
         * You should usually call [Builder.customerId] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun customerId(customerId: JsonField<String>) = apply { this.customerId = customerId }

        /** A hosted KYC link for your customer to complete KYC */
        fun kycUrl(kycUrl: String) = kycUrl(JsonField.of(kycUrl))

        /**
         * Sets [Builder.kycUrl] to an arbitrary JSON value.
         *
         * You should usually call [Builder.kycUrl] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun kycUrl(kycUrl: JsonField<String>) = apply { this.kycUrl = kycUrl }

        /** The platform id of the customer to onboard */
        fun platformCustomerId(platformCustomerId: String) =
            platformCustomerId(JsonField.of(platformCustomerId))

        /**
         * Sets [Builder.platformCustomerId] to an arbitrary JSON value.
         *
         * You should usually call [Builder.platformCustomerId] with a well-typed [String] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun platformCustomerId(platformCustomerId: JsonField<String>) = apply {
            this.platformCustomerId = platformCustomerId
        }

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
         * Returns an immutable instance of [CustomerGetKycLinkResponse].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         */
        fun build(): CustomerGetKycLinkResponse =
            CustomerGetKycLinkResponse(
                customerId,
                kycUrl,
                platformCustomerId,
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): CustomerGetKycLinkResponse = apply {
        if (validated) {
            return@apply
        }

        customerId()
        kycUrl()
        platformCustomerId()
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
        (if (customerId.asKnown() == null) 0 else 1) +
            (if (kycUrl.asKnown() == null) 0 else 1) +
            (if (platformCustomerId.asKnown() == null) 0 else 1)

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is CustomerGetKycLinkResponse &&
            customerId == other.customerId &&
            kycUrl == other.kycUrl &&
            platformCustomerId == other.platformCustomerId &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(customerId, kycUrl, platformCustomerId, additionalProperties)
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "CustomerGetKycLinkResponse{customerId=$customerId, kycUrl=$kycUrl, platformCustomerId=$platformCustomerId, additionalProperties=$additionalProperties}"
}
