// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.transactions

import com.fasterxml.jackson.annotation.JsonCreator
import com.grid.api.core.Enum
import com.grid.api.core.JsonField
import com.grid.api.errors.GridInvalidDataException

/** Status of a payment transaction */
class TransactionStatus @JsonCreator private constructor(private val value: JsonField<String>) :
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

        val CREATED = of("CREATED")

        val PENDING = of("PENDING")

        val PROCESSING = of("PROCESSING")

        val COMPLETED = of("COMPLETED")

        val REJECTED = of("REJECTED")

        val FAILED = of("FAILED")

        val REFUNDED = of("REFUNDED")

        val EXPIRED = of("EXPIRED")

        fun of(value: String) = TransactionStatus(JsonField.of(value))
    }

    /** An enum containing [TransactionStatus]'s known values. */
    enum class Known {
        CREATED,
        PENDING,
        PROCESSING,
        COMPLETED,
        REJECTED,
        FAILED,
        REFUNDED,
        EXPIRED,
    }

    /**
     * An enum containing [TransactionStatus]'s known values, as well as an [_UNKNOWN] member.
     *
     * An instance of [TransactionStatus] can contain an unknown value in a couple of cases:
     * - It was deserialized from data that doesn't match any known member. For example, if the SDK
     *   is on an older version than the API, then the API may respond with new members that the SDK
     *   is unaware of.
     * - It was constructed with an arbitrary value using the [of] method.
     */
    enum class Value {
        CREATED,
        PENDING,
        PROCESSING,
        COMPLETED,
        REJECTED,
        FAILED,
        REFUNDED,
        EXPIRED,
        /**
         * An enum member indicating that [TransactionStatus] was instantiated with an unknown
         * value.
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
            CREATED -> Value.CREATED
            PENDING -> Value.PENDING
            PROCESSING -> Value.PROCESSING
            COMPLETED -> Value.COMPLETED
            REJECTED -> Value.REJECTED
            FAILED -> Value.FAILED
            REFUNDED -> Value.REFUNDED
            EXPIRED -> Value.EXPIRED
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
            CREATED -> Known.CREATED
            PENDING -> Known.PENDING
            PROCESSING -> Known.PROCESSING
            COMPLETED -> Known.COMPLETED
            REJECTED -> Known.REJECTED
            FAILED -> Known.FAILED
            REFUNDED -> Known.REFUNDED
            EXPIRED -> Known.EXPIRED
            else -> throw GridInvalidDataException("Unknown TransactionStatus: $value")
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

    fun validate(): TransactionStatus = apply {
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

        return other is TransactionStatus && value == other.value
    }

    override fun hashCode() = value.hashCode()

    override fun toString() = value.toString()
}
