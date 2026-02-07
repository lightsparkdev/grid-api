// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.tokens

import com.fasterxml.jackson.annotation.JsonCreator
import com.grid.api.core.Enum
import com.grid.api.core.JsonField
import com.grid.api.errors.GridInvalidDataException

/**
 * Permission of an API token that determines what actions the token can perform: VIEW: Can view all
 * data, including platform config, customers and transactions TRANSACT: Can send payments MANAGE:
 * Can manage platform config, api tokens and customers
 */
class Permission @JsonCreator private constructor(private val value: JsonField<String>) : Enum {

    /**
     * Returns this class instance's raw value.
     *
     * This is usually only useful if this instance was deserialized from data that doesn't match
     * any known member, and you want to know that value. For example, if the SDK is on an older
     * version than the API, then the API may respond with new members that the SDK is unaware of.
     */
    @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

    companion object {

        val VIEW = of("VIEW")

        val TRANSACT = of("TRANSACT")

        val MANAGE = of("MANAGE")

        fun of(value: String) = Permission(JsonField.of(value))
    }

    /** An enum containing [Permission]'s known values. */
    enum class Known {
        VIEW,
        TRANSACT,
        MANAGE,
    }

    /**
     * An enum containing [Permission]'s known values, as well as an [_UNKNOWN] member.
     *
     * An instance of [Permission] can contain an unknown value in a couple of cases:
     * - It was deserialized from data that doesn't match any known member. For example, if the SDK
     *   is on an older version than the API, then the API may respond with new members that the SDK
     *   is unaware of.
     * - It was constructed with an arbitrary value using the [of] method.
     */
    enum class Value {
        VIEW,
        TRANSACT,
        MANAGE,
        /** An enum member indicating that [Permission] was instantiated with an unknown value. */
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
            VIEW -> Value.VIEW
            TRANSACT -> Value.TRANSACT
            MANAGE -> Value.MANAGE
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
            VIEW -> Known.VIEW
            TRANSACT -> Known.TRANSACT
            MANAGE -> Known.MANAGE
            else -> throw GridInvalidDataException("Unknown Permission: $value")
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

    fun validate(): Permission = apply {
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

        return other is Permission && value == other.value
    }

    override fun hashCode() = value.hashCode()

    override fun toString() = value.toString()
}
