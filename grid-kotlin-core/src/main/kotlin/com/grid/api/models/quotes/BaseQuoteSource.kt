// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.quotes

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

class BaseQuoteSource
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val sourceType: JsonField<SourceType>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("sourceType")
        @ExcludeMissing
        sourceType: JsonField<SourceType> = JsonMissing.of()
    ) : this(sourceType, mutableMapOf())

    /**
     * Type of quote funding source
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun sourceType(): SourceType = sourceType.getRequired("sourceType")

    /**
     * Returns the raw JSON value of [sourceType].
     *
     * Unlike [sourceType], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("sourceType")
    @ExcludeMissing
    fun _sourceType(): JsonField<SourceType> = sourceType

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
         * Returns a mutable builder for constructing an instance of [BaseQuoteSource].
         *
         * The following fields are required:
         * ```kotlin
         * .sourceType()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [BaseQuoteSource]. */
    class Builder internal constructor() {

        private var sourceType: JsonField<SourceType>? = null
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(baseQuoteSource: BaseQuoteSource) = apply {
            sourceType = baseQuoteSource.sourceType
            additionalProperties = baseQuoteSource.additionalProperties.toMutableMap()
        }

        /** Type of quote funding source */
        fun sourceType(sourceType: SourceType) = sourceType(JsonField.of(sourceType))

        /**
         * Sets [Builder.sourceType] to an arbitrary JSON value.
         *
         * You should usually call [Builder.sourceType] with a well-typed [SourceType] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun sourceType(sourceType: JsonField<SourceType>) = apply { this.sourceType = sourceType }

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
         * Returns an immutable instance of [BaseQuoteSource].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .sourceType()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): BaseQuoteSource =
            BaseQuoteSource(
                checkRequired("sourceType", sourceType),
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): BaseQuoteSource = apply {
        if (validated) {
            return@apply
        }

        sourceType().validate()
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
    internal fun validity(): Int = (sourceType.asKnown()?.validity() ?: 0)

    /** Type of quote funding source */
    class SourceType @JsonCreator private constructor(private val value: JsonField<String>) : Enum {

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

            val REALTIME_FUNDING = of("REALTIME_FUNDING")

            fun of(value: String) = SourceType(JsonField.of(value))
        }

        /** An enum containing [SourceType]'s known values. */
        enum class Known {
            ACCOUNT,
            REALTIME_FUNDING,
        }

        /**
         * An enum containing [SourceType]'s known values, as well as an [_UNKNOWN] member.
         *
         * An instance of [SourceType] can contain an unknown value in a couple of cases:
         * - It was deserialized from data that doesn't match any known member. For example, if the
         *   SDK is on an older version than the API, then the API may respond with new members that
         *   the SDK is unaware of.
         * - It was constructed with an arbitrary value using the [of] method.
         */
        enum class Value {
            ACCOUNT,
            REALTIME_FUNDING,
            /**
             * An enum member indicating that [SourceType] was instantiated with an unknown value.
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
                REALTIME_FUNDING -> Value.REALTIME_FUNDING
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
                REALTIME_FUNDING -> Known.REALTIME_FUNDING
                else -> throw GridInvalidDataException("Unknown SourceType: $value")
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

        fun validate(): SourceType = apply {
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

            return other is SourceType && value == other.value
        }

        override fun hashCode() = value.hashCode()

        override fun toString() = value.toString()
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is BaseQuoteSource &&
            sourceType == other.sourceType &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy { Objects.hash(sourceType, additionalProperties) }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "BaseQuoteSource{sourceType=$sourceType, additionalProperties=$additionalProperties}"
}
