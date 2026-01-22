// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.transactions

import com.fasterxml.jackson.annotation.JsonCreator
import com.grid.api.core.Enum
import com.grid.api.core.JsonField
import com.grid.api.errors.GridInvalidDataException

/** Type of transaction (incoming payment or outgoing payment) */
class TransactionType @JsonCreator private constructor(private val value: JsonField<String>) :
    Enum {

    /**
     * Returns this class instance's raw value.
     *
     * This is usually only useful if this instance was deserialized from data that doesn't match
     * any known member, and you want to know that value. For example, if the SDK is on an older
     * version than the API, then the API may respond with new members that the SDK is unaware of.
     */
    @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

    companion object {

        val INCOMING = of("INCOMING")

        val OUTGOING = of("OUTGOING")

        fun of(value: String) = TransactionType(JsonField.of(value))
    }

    /** An enum containing [TransactionType]'s known values. */
    enum class Known {
        INCOMING,
        OUTGOING,
    }

    /**
     * An enum containing [TransactionType]'s known values, as well as an [_UNKNOWN] member.
     *
     * An instance of [TransactionType] can contain an unknown value in a couple of cases:
     * - It was deserialized from data that doesn't match any known member. For example, if the SDK
     *   is on an older version than the API, then the API may respond with new members that the SDK
     *   is unaware of.
     * - It was constructed with an arbitrary value using the [of] method.
     */
    enum class Value {
        INCOMING,
        OUTGOING,
        /**
         * An enum member indicating that [TransactionType] was instantiated with an unknown value.
         */
        _UNKNOWN,
    }

    /**
     * Returns an enum member corresponding to this class instance's value, or [Value._UNKNOWN] if
     * the class was instantiated with an unknown value.
     *
     * Use the [known] method instead if you're certain the value is always known or if you want to
     * throw for the unknown case.
     */
    fun value(): Value =
        when (this) {
            INCOMING -> Value.INCOMING
            OUTGOING -> Value.OUTGOING
            else -> Value._UNKNOWN
        }

    /**
     * Returns an enum member corresponding to this class instance's value.
     *
     * Use the [value] method instead if you're uncertain the value is always known and don't want
     * to throw for the unknown case.
     *
     * @throws GridInvalidDataException if this class instance's value is a not a known member.
     */
    fun known(): Known =
        when (this) {
            INCOMING -> Known.INCOMING
            OUTGOING -> Known.OUTGOING
            else -> throw GridInvalidDataException("Unknown TransactionType: $value")
        }

    /**
     * Returns this class instance's primitive wire representation.
     *
     * This differs from the [toString] method because that method is primarily for debugging and
     * generally doesn't throw.
     *
     * @throws GridInvalidDataException if this class instance's value does not have the expected
     *   primitive type.
     */
    fun asString(): String =
        _value().asString() ?: throw GridInvalidDataException("Value is not a String")

    private var validated: Boolean = false

    fun validate(): TransactionType = apply {
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
     * Returns a score indicating how many valid values are contained in this object recursively.
     *
     * Used for best match union deserialization.
     */
    internal fun validity(): Int = if (value() == Value._UNKNOWN) 0 else 1

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is TransactionType && value == other.value
    }

    override fun hashCode() = value.hashCode()

    override fun toString() = value.toString()
}
