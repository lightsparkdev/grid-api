// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.transactions

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

/** UMA address source details */
class UmaAddressSource
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val sourceType: JsonValue,
    private val umaAddress: JsonField<String>,
    private val currency: JsonField<String>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("sourceType") @ExcludeMissing sourceType: JsonValue = JsonMissing.of(),
        @JsonProperty("umaAddress")
        @ExcludeMissing
        umaAddress: JsonField<String> = JsonMissing.of(),
        @JsonProperty("currency") @ExcludeMissing currency: JsonField<String> = JsonMissing.of(),
    ) : this(sourceType, umaAddress, currency, mutableMapOf())

    /**
     * Source type identifier
     *
     * Expected to always return the following:
     * ```kotlin
     * JsonValue.from("UMA_ADDRESS")
     * ```
     *
     * However, this method can be useful for debugging and logging (e.g. if the server responded
     * with an unexpected value).
     */
    @JsonProperty("sourceType") @ExcludeMissing fun _sourceType(): JsonValue = sourceType

    /**
     * UMA address of the sender
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun umaAddress(): String = umaAddress.getRequired("umaAddress")

    /**
     * Currency code for the source
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun currency(): String? = currency.getNullable("currency")

    /**
     * Returns the raw JSON value of [umaAddress].
     *
     * Unlike [umaAddress], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("umaAddress") @ExcludeMissing fun _umaAddress(): JsonField<String> = umaAddress

    /**
     * Returns the raw JSON value of [currency].
     *
     * Unlike [currency], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("currency") @ExcludeMissing fun _currency(): JsonField<String> = currency

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
         * Returns a mutable builder for constructing an instance of [UmaAddressSource].
         *
         * The following fields are required:
         * ```kotlin
         * .umaAddress()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [UmaAddressSource]. */
    class Builder internal constructor() {

        private var sourceType: JsonValue = JsonValue.from("UMA_ADDRESS")
        private var umaAddress: JsonField<String>? = null
        private var currency: JsonField<String> = JsonMissing.of()
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(umaAddressSource: UmaAddressSource) = apply {
            sourceType = umaAddressSource.sourceType
            umaAddress = umaAddressSource.umaAddress
            currency = umaAddressSource.currency
            additionalProperties = umaAddressSource.additionalProperties.toMutableMap()
        }

        /**
         * Sets the field to an arbitrary JSON value.
         *
         * It is usually unnecessary to call this method because the field defaults to the
         * following:
         * ```kotlin
         * JsonValue.from("UMA_ADDRESS")
         * ```
         *
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun sourceType(sourceType: JsonValue) = apply { this.sourceType = sourceType }

        /** UMA address of the sender */
        fun umaAddress(umaAddress: String) = umaAddress(JsonField.of(umaAddress))

        /**
         * Sets [Builder.umaAddress] to an arbitrary JSON value.
         *
         * You should usually call [Builder.umaAddress] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun umaAddress(umaAddress: JsonField<String>) = apply { this.umaAddress = umaAddress }

        /** Currency code for the source */
        fun currency(currency: String) = currency(JsonField.of(currency))

        /**
         * Sets [Builder.currency] to an arbitrary JSON value.
         *
         * You should usually call [Builder.currency] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun currency(currency: JsonField<String>) = apply { this.currency = currency }

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
         * Returns an immutable instance of [UmaAddressSource].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .umaAddress()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): UmaAddressSource =
            UmaAddressSource(
                sourceType,
                checkRequired("umaAddress", umaAddress),
                currency,
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): UmaAddressSource = apply {
        if (validated) {
            return@apply
        }

        _sourceType().let {
            if (it != JsonValue.from("UMA_ADDRESS")) {
                throw GridInvalidDataException("'sourceType' is invalid, received $it")
            }
        }
        umaAddress()
        currency()
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
        sourceType.let { if (it == JsonValue.from("UMA_ADDRESS")) 1 else 0 } +
            (if (umaAddress.asKnown() == null) 0 else 1) +
            (if (currency.asKnown() == null) 0 else 1)

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is UmaAddressSource &&
            sourceType == other.sourceType &&
            umaAddress == other.umaAddress &&
            currency == other.currency &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(sourceType, umaAddress, currency, additionalProperties)
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "UmaAddressSource{sourceType=$sourceType, umaAddress=$umaAddress, currency=$currency, additionalProperties=$additionalProperties}"
}
