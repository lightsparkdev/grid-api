// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.config

import com.fasterxml.jackson.annotation.JsonCreator
import com.grid.api.core.Enum
import com.grid.api.core.JsonField
import com.grid.api.errors.GridInvalidDataException

/** Name of a type of field containing info about a platform's customer or counterparty customer. */
class CustomerInfoFieldName @JsonCreator private constructor(private val value: JsonField<String>) :
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

        val FULL_NAME = of("FULL_NAME")

        val BIRTH_DATE = of("BIRTH_DATE")

        val NATIONALITY = of("NATIONALITY")

        val PHONE_NUMBER = of("PHONE_NUMBER")

        val EMAIL = of("EMAIL")

        val POSTAL_ADDRESS = of("POSTAL_ADDRESS")

        val TAX_ID = of("TAX_ID")

        val REGISTRATION_NUMBER = of("REGISTRATION_NUMBER")

        val USER_TYPE = of("USER_TYPE")

        val COUNTRY_OF_RESIDENCE = of("COUNTRY_OF_RESIDENCE")

        val ACCOUNT_IDENTIFIER = of("ACCOUNT_IDENTIFIER")

        val FI_LEGAL_ENTITY_NAME = of("FI_LEGAL_ENTITY_NAME")

        val FI_ADDRESS = of("FI_ADDRESS")

        val PURPOSE_OF_PAYMENT = of("PURPOSE_OF_PAYMENT")

        val ULTIMATE_INSTITUTION_COUNTRY = of("ULTIMATE_INSTITUTION_COUNTRY")

        val IDENTIFIER = of("IDENTIFIER")

        fun of(value: String) = CustomerInfoFieldName(JsonField.of(value))
    }

    /** An enum containing [CustomerInfoFieldName]'s known values. */
    enum class Known {
        FULL_NAME,
        BIRTH_DATE,
        NATIONALITY,
        PHONE_NUMBER,
        EMAIL,
        POSTAL_ADDRESS,
        TAX_ID,
        REGISTRATION_NUMBER,
        USER_TYPE,
        COUNTRY_OF_RESIDENCE,
        ACCOUNT_IDENTIFIER,
        FI_LEGAL_ENTITY_NAME,
        FI_ADDRESS,
        PURPOSE_OF_PAYMENT,
        ULTIMATE_INSTITUTION_COUNTRY,
        IDENTIFIER,
    }

    /**
     * An enum containing [CustomerInfoFieldName]'s known values, as well as an [_UNKNOWN] member.
     *
     * An instance of [CustomerInfoFieldName] can contain an unknown value in a couple of cases:
     * - It was deserialized from data that doesn't match any known member. For example, if the SDK
     *   is on an older version than the API, then the API may respond with new members that the SDK
     *   is unaware of.
     * - It was constructed with an arbitrary value using the [of] method.
     */
    enum class Value {
        FULL_NAME,
        BIRTH_DATE,
        NATIONALITY,
        PHONE_NUMBER,
        EMAIL,
        POSTAL_ADDRESS,
        TAX_ID,
        REGISTRATION_NUMBER,
        USER_TYPE,
        COUNTRY_OF_RESIDENCE,
        ACCOUNT_IDENTIFIER,
        FI_LEGAL_ENTITY_NAME,
        FI_ADDRESS,
        PURPOSE_OF_PAYMENT,
        ULTIMATE_INSTITUTION_COUNTRY,
        IDENTIFIER,
        /**
         * An enum member indicating that [CustomerInfoFieldName] was instantiated with an unknown
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
            FULL_NAME -> Value.FULL_NAME
            BIRTH_DATE -> Value.BIRTH_DATE
            NATIONALITY -> Value.NATIONALITY
            PHONE_NUMBER -> Value.PHONE_NUMBER
            EMAIL -> Value.EMAIL
            POSTAL_ADDRESS -> Value.POSTAL_ADDRESS
            TAX_ID -> Value.TAX_ID
            REGISTRATION_NUMBER -> Value.REGISTRATION_NUMBER
            USER_TYPE -> Value.USER_TYPE
            COUNTRY_OF_RESIDENCE -> Value.COUNTRY_OF_RESIDENCE
            ACCOUNT_IDENTIFIER -> Value.ACCOUNT_IDENTIFIER
            FI_LEGAL_ENTITY_NAME -> Value.FI_LEGAL_ENTITY_NAME
            FI_ADDRESS -> Value.FI_ADDRESS
            PURPOSE_OF_PAYMENT -> Value.PURPOSE_OF_PAYMENT
            ULTIMATE_INSTITUTION_COUNTRY -> Value.ULTIMATE_INSTITUTION_COUNTRY
            IDENTIFIER -> Value.IDENTIFIER
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
            FULL_NAME -> Known.FULL_NAME
            BIRTH_DATE -> Known.BIRTH_DATE
            NATIONALITY -> Known.NATIONALITY
            PHONE_NUMBER -> Known.PHONE_NUMBER
            EMAIL -> Known.EMAIL
            POSTAL_ADDRESS -> Known.POSTAL_ADDRESS
            TAX_ID -> Known.TAX_ID
            REGISTRATION_NUMBER -> Known.REGISTRATION_NUMBER
            USER_TYPE -> Known.USER_TYPE
            COUNTRY_OF_RESIDENCE -> Known.COUNTRY_OF_RESIDENCE
            ACCOUNT_IDENTIFIER -> Known.ACCOUNT_IDENTIFIER
            FI_LEGAL_ENTITY_NAME -> Known.FI_LEGAL_ENTITY_NAME
            FI_ADDRESS -> Known.FI_ADDRESS
            PURPOSE_OF_PAYMENT -> Known.PURPOSE_OF_PAYMENT
            ULTIMATE_INSTITUTION_COUNTRY -> Known.ULTIMATE_INSTITUTION_COUNTRY
            IDENTIFIER -> Known.IDENTIFIER
            else -> throw GridInvalidDataException("Unknown CustomerInfoFieldName: $value")
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

    fun validate(): CustomerInfoFieldName = apply {
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

        return other is CustomerInfoFieldName && value == other.value
    }

    override fun hashCode() = value.hashCode()

    override fun toString() = value.toString()
}
