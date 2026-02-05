// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

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

class IbanAccountInfo
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val accountType: JsonField<AccountType>,
    private val iban: JsonField<String>,
    private val swiftBic: JsonField<String>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("accountType")
        @ExcludeMissing
        accountType: JsonField<AccountType> = JsonMissing.of(),
        @JsonProperty("iban") @ExcludeMissing iban: JsonField<String> = JsonMissing.of(),
        @JsonProperty("swiftBic") @ExcludeMissing swiftBic: JsonField<String> = JsonMissing.of(),
    ) : this(accountType, iban, swiftBic, mutableMapOf())

    /**
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun accountType(): AccountType = accountType.getRequired("accountType")

    /**
     * International Bank Account Number
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun iban(): String = iban.getRequired("iban")

    /**
     * SWIFT/BIC code (8 or 11 characters)
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun swiftBic(): String = swiftBic.getRequired("swiftBic")

    /**
     * Returns the raw JSON value of [accountType].
     *
     * Unlike [accountType], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("accountType")
    @ExcludeMissing
    fun _accountType(): JsonField<AccountType> = accountType

    /**
     * Returns the raw JSON value of [iban].
     *
     * Unlike [iban], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("iban") @ExcludeMissing fun _iban(): JsonField<String> = iban

    /**
     * Returns the raw JSON value of [swiftBic].
     *
     * Unlike [swiftBic], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("swiftBic") @ExcludeMissing fun _swiftBic(): JsonField<String> = swiftBic

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
         * Returns a mutable builder for constructing an instance of [IbanAccountInfo].
         *
         * The following fields are required:
         * ```kotlin
         * .accountType()
         * .iban()
         * .swiftBic()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [IbanAccountInfo]. */
    class Builder internal constructor() {

        private var accountType: JsonField<AccountType>? = null
        private var iban: JsonField<String>? = null
        private var swiftBic: JsonField<String>? = null
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(ibanAccountInfo: IbanAccountInfo) = apply {
            accountType = ibanAccountInfo.accountType
            iban = ibanAccountInfo.iban
            swiftBic = ibanAccountInfo.swiftBic
            additionalProperties = ibanAccountInfo.additionalProperties.toMutableMap()
        }

        fun accountType(accountType: AccountType) = accountType(JsonField.of(accountType))

        /**
         * Sets [Builder.accountType] to an arbitrary JSON value.
         *
         * You should usually call [Builder.accountType] with a well-typed [AccountType] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun accountType(accountType: JsonField<AccountType>) = apply {
            this.accountType = accountType
        }

        /** International Bank Account Number */
        fun iban(iban: String) = iban(JsonField.of(iban))

        /**
         * Sets [Builder.iban] to an arbitrary JSON value.
         *
         * You should usually call [Builder.iban] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun iban(iban: JsonField<String>) = apply { this.iban = iban }

        /** SWIFT/BIC code (8 or 11 characters) */
        fun swiftBic(swiftBic: String) = swiftBic(JsonField.of(swiftBic))

        /**
         * Sets [Builder.swiftBic] to an arbitrary JSON value.
         *
         * You should usually call [Builder.swiftBic] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun swiftBic(swiftBic: JsonField<String>) = apply { this.swiftBic = swiftBic }

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
         * Returns an immutable instance of [IbanAccountInfo].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .accountType()
         * .iban()
         * .swiftBic()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): IbanAccountInfo =
            IbanAccountInfo(
                checkRequired("accountType", accountType),
                checkRequired("iban", iban),
                checkRequired("swiftBic", swiftBic),
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): IbanAccountInfo = apply {
        if (validated) {
            return@apply
        }

        accountType().validate()
        iban()
        swiftBic()
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
        (accountType.asKnown()?.validity() ?: 0) +
            (if (iban.asKnown() == null) 0 else 1) +
            (if (swiftBic.asKnown() == null) 0 else 1)

    class AccountType @JsonCreator private constructor(private val value: JsonField<String>) :
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

            val IBAN = of("IBAN")

            fun of(value: String) = AccountType(JsonField.of(value))
        }

        /** An enum containing [AccountType]'s known values. */
        enum class Known {
            IBAN
        }

        /**
         * An enum containing [AccountType]'s known values, as well as an [_UNKNOWN] member.
         *
         * An instance of [AccountType] can contain an unknown value in a couple of cases:
         * - It was deserialized from data that doesn't match any known member. For example, if the
         *   SDK is on an older version than the API, then the API may respond with new members that
         *   the SDK is unaware of.
         * - It was constructed with an arbitrary value using the [of] method.
         */
        enum class Value {
            IBAN,
            /**
             * An enum member indicating that [AccountType] was instantiated with an unknown value.
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
                IBAN -> Value.IBAN
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
                IBAN -> Known.IBAN
                else -> throw GridInvalidDataException("Unknown AccountType: $value")
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

        fun validate(): AccountType = apply {
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

            return other is AccountType && value == other.value
        }

        override fun hashCode() = value.hashCode()

        override fun toString() = value.toString()
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is IbanAccountInfo &&
            accountType == other.accountType &&
            iban == other.iban &&
            swiftBic == other.swiftBic &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(accountType, iban, swiftBic, additionalProperties)
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "IbanAccountInfo{accountType=$accountType, iban=$iban, swiftBic=$swiftBic, additionalProperties=$additionalProperties}"
}
