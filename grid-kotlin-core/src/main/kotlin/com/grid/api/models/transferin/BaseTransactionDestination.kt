// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.transferin

import com.fasterxml.jackson.annotation.JsonAnyGetter
import com.fasterxml.jackson.annotation.JsonAnySetter
import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.grid.api.core.Enum
import com.grid.api.core.ExcludeMissing
import com.grid.api.core.JsonField
import com.grid.api.core.JsonMissing
import com.grid.api.core.JsonValue
import com.grid.api.core.checkRequired
import com.grid.api.errors.GridInvalidDataException
import java.util.Collections
import java.util.Objects

class BaseTransactionDestination
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val destinationType: JsonField<DestinationType>,
    private val currency: JsonField<String>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("destinationType")
        @ExcludeMissing
        destinationType: JsonField<DestinationType> = JsonMissing.of(),
        @JsonProperty("currency") @ExcludeMissing currency: JsonField<String> = JsonMissing.of(),
    ) : this(destinationType, currency, mutableMapOf())

    /**
     * Type of transaction destination
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun destinationType(): DestinationType = destinationType.getRequired("destinationType")

    /**
     * Currency code for the destination
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun currency(): String? = currency.getNullable("currency")

    /**
     * Returns the raw JSON value of [destinationType].
     *
     * Unlike [destinationType], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("destinationType")
    @ExcludeMissing
    fun _destinationType(): JsonField<DestinationType> = destinationType

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
         * Returns a mutable builder for constructing an instance of [BaseTransactionDestination].
         *
         * The following fields are required:
         * ```kotlin
         * .destinationType()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [BaseTransactionDestination]. */
    class Builder internal constructor() {

        private var destinationType: JsonField<DestinationType>? = null
        private var currency: JsonField<String> = JsonMissing.of()
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(baseTransactionDestination: BaseTransactionDestination) = apply {
            destinationType = baseTransactionDestination.destinationType
            currency = baseTransactionDestination.currency
            additionalProperties = baseTransactionDestination.additionalProperties.toMutableMap()
        }

        /** Type of transaction destination */
        fun destinationType(destinationType: DestinationType) =
            destinationType(JsonField.of(destinationType))

        /**
         * Sets [Builder.destinationType] to an arbitrary JSON value.
         *
         * You should usually call [Builder.destinationType] with a well-typed [DestinationType]
         * value instead. This method is primarily for setting the field to an undocumented or not
         * yet supported value.
         */
        fun destinationType(destinationType: JsonField<DestinationType>) = apply {
            this.destinationType = destinationType
        }

        /** Currency code for the destination */
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
         * Returns an immutable instance of [BaseTransactionDestination].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .destinationType()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): BaseTransactionDestination =
            BaseTransactionDestination(
                checkRequired("destinationType", destinationType),
                currency,
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): BaseTransactionDestination = apply {
        if (validated) {
            return@apply
        }

        destinationType().validate()
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
        (destinationType.asKnown()?.validity() ?: 0) + (if (currency.asKnown() == null) 0 else 1)

    /** Type of transaction destination */
    class DestinationType @JsonCreator private constructor(private val value: JsonField<String>) :
        Enum {

        /**
         * Returns this class instance's raw value.
         *
         * This is usually only useful if this instance was deserialized from data that doesn't
         * match any known member, and you want to know that value. For example, if the SDK is on an
         * older version than the API, then the API may respond with new members that the SDK is
         * unaware of.
         */
        @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

        companion object {

            val ACCOUNT = of("ACCOUNT")

            val UMA_ADDRESS = of("UMA_ADDRESS")

            fun of(value: String) = DestinationType(JsonField.of(value))
        }

        /** An enum containing [DestinationType]'s known values. */
        enum class Known {
            ACCOUNT,
            UMA_ADDRESS,
        }

        /**
         * An enum containing [DestinationType]'s known values, as well as an [_UNKNOWN] member.
         *
         * An instance of [DestinationType] can contain an unknown value in a couple of cases:
         * - It was deserialized from data that doesn't match any known member. For example, if the
         *   SDK is on an older version than the API, then the API may respond with new members that
         *   the SDK is unaware of.
         * - It was constructed with an arbitrary value using the [of] method.
         */
        enum class Value {
            ACCOUNT,
            UMA_ADDRESS,
            /**
             * An enum member indicating that [DestinationType] was instantiated with an unknown
             * value.
             */
            _UNKNOWN,
        }

        /**
         * Returns an enum member corresponding to this class instance's value, or [Value._UNKNOWN]
         * if the class was instantiated with an unknown value.
         *
         * Use the [known] method instead if you're certain the value is always known or if you want
         * to throw for the unknown case.
         */
        fun value(): Value =
            when (this) {
                ACCOUNT -> Value.ACCOUNT
                UMA_ADDRESS -> Value.UMA_ADDRESS
                else -> Value._UNKNOWN
            }

        /**
         * Returns an enum member corresponding to this class instance's value.
         *
         * Use the [value] method instead if you're uncertain the value is always known and don't
         * want to throw for the unknown case.
         *
         * @throws GridInvalidDataException if this class instance's value is a not a known member.
         */
        fun known(): Known =
            when (this) {
                ACCOUNT -> Known.ACCOUNT
                UMA_ADDRESS -> Known.UMA_ADDRESS
                else -> throw GridInvalidDataException("Unknown DestinationType: $value")
            }

        /**
         * Returns this class instance's primitive wire representation.
         *
         * This differs from the [toString] method because that method is primarily for debugging
         * and generally doesn't throw.
         *
         * @throws GridInvalidDataException if this class instance's value does not have the
         *   expected primitive type.
         */
        fun asString(): String =
            _value().asString() ?: throw GridInvalidDataException("Value is not a String")

        private var validated: Boolean = false

        fun validate(): DestinationType = apply {
            if (validated) {
                return@apply
            }

            known()
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
         * Returns a score indicating how many valid values are contained in this object
         * recursively.
         *
         * Used for best match union deserialization.
         */
        internal fun validity(): Int = if (value() == Value._UNKNOWN) 0 else 1

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is DestinationType && value == other.value
        }

        override fun hashCode() = value.hashCode()

        override fun toString() = value.toString()
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is BaseTransactionDestination &&
            destinationType == other.destinationType &&
            currency == other.currency &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(destinationType, currency, additionalProperties)
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "BaseTransactionDestination{destinationType=$destinationType, currency=$currency, additionalProperties=$additionalProperties}"
}
