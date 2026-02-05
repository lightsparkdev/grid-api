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

class UsAccountInfo
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val accountCategory: JsonField<AccountCategory>,
    private val accountNumber: JsonField<String>,
    private val accountType: JsonField<AccountType>,
    private val routingNumber: JsonField<String>,
    private val bankName: JsonField<String>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("accountCategory")
        @ExcludeMissing
        accountCategory: JsonField<AccountCategory> = JsonMissing.of(),
        @JsonProperty("accountNumber")
        @ExcludeMissing
        accountNumber: JsonField<String> = JsonMissing.of(),
        @JsonProperty("accountType")
        @ExcludeMissing
        accountType: JsonField<AccountType> = JsonMissing.of(),
        @JsonProperty("routingNumber")
        @ExcludeMissing
        routingNumber: JsonField<String> = JsonMissing.of(),
        @JsonProperty("bankName") @ExcludeMissing bankName: JsonField<String> = JsonMissing.of(),
    ) : this(accountCategory, accountNumber, accountType, routingNumber, bankName, mutableMapOf())

    /**
     * Type of account (checking or savings)
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun accountCategory(): AccountCategory = accountCategory.getRequired("accountCategory")

    /**
     * US bank account number
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun accountNumber(): String = accountNumber.getRequired("accountNumber")

    /**
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun accountType(): AccountType = accountType.getRequired("accountType")

    /**
     * ACH routing number (9 digits)
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun routingNumber(): String = routingNumber.getRequired("routingNumber")

    /**
     * Name of the bank
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun bankName(): String? = bankName.getNullable("bankName")

    /**
     * Returns the raw JSON value of [accountCategory].
     *
     * Unlike [accountCategory], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("accountCategory")
    @ExcludeMissing
    fun _accountCategory(): JsonField<AccountCategory> = accountCategory

    /**
     * Returns the raw JSON value of [accountNumber].
     *
     * Unlike [accountNumber], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("accountNumber")
    @ExcludeMissing
    fun _accountNumber(): JsonField<String> = accountNumber

    /**
     * Returns the raw JSON value of [accountType].
     *
     * Unlike [accountType], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("accountType")
    @ExcludeMissing
    fun _accountType(): JsonField<AccountType> = accountType

    /**
     * Returns the raw JSON value of [routingNumber].
     *
     * Unlike [routingNumber], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("routingNumber")
    @ExcludeMissing
    fun _routingNumber(): JsonField<String> = routingNumber

    /**
     * Returns the raw JSON value of [bankName].
     *
     * Unlike [bankName], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("bankName") @ExcludeMissing fun _bankName(): JsonField<String> = bankName

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
         * Returns a mutable builder for constructing an instance of [UsAccountInfo].
         *
         * The following fields are required:
         * ```kotlin
         * .accountCategory()
         * .accountNumber()
         * .accountType()
         * .routingNumber()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [UsAccountInfo]. */
    class Builder internal constructor() {

        private var accountCategory: JsonField<AccountCategory>? = null
        private var accountNumber: JsonField<String>? = null
        private var accountType: JsonField<AccountType>? = null
        private var routingNumber: JsonField<String>? = null
        private var bankName: JsonField<String> = JsonMissing.of()
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(usAccountInfo: UsAccountInfo) = apply {
            accountCategory = usAccountInfo.accountCategory
            accountNumber = usAccountInfo.accountNumber
            accountType = usAccountInfo.accountType
            routingNumber = usAccountInfo.routingNumber
            bankName = usAccountInfo.bankName
            additionalProperties = usAccountInfo.additionalProperties.toMutableMap()
        }

        /** Type of account (checking or savings) */
        fun accountCategory(accountCategory: AccountCategory) =
            accountCategory(JsonField.of(accountCategory))

        /**
         * Sets [Builder.accountCategory] to an arbitrary JSON value.
         *
         * You should usually call [Builder.accountCategory] with a well-typed [AccountCategory]
         * value instead. This method is primarily for setting the field to an undocumented or not
         * yet supported value.
         */
        fun accountCategory(accountCategory: JsonField<AccountCategory>) = apply {
            this.accountCategory = accountCategory
        }

        /** US bank account number */
        fun accountNumber(accountNumber: String) = accountNumber(JsonField.of(accountNumber))

        /**
         * Sets [Builder.accountNumber] to an arbitrary JSON value.
         *
         * You should usually call [Builder.accountNumber] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun accountNumber(accountNumber: JsonField<String>) = apply {
            this.accountNumber = accountNumber
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

        /** ACH routing number (9 digits) */
        fun routingNumber(routingNumber: String) = routingNumber(JsonField.of(routingNumber))

        /**
         * Sets [Builder.routingNumber] to an arbitrary JSON value.
         *
         * You should usually call [Builder.routingNumber] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun routingNumber(routingNumber: JsonField<String>) = apply {
            this.routingNumber = routingNumber
        }

        /** Name of the bank */
        fun bankName(bankName: String) = bankName(JsonField.of(bankName))

        /**
         * Sets [Builder.bankName] to an arbitrary JSON value.
         *
         * You should usually call [Builder.bankName] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun bankName(bankName: JsonField<String>) = apply { this.bankName = bankName }

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
         * Returns an immutable instance of [UsAccountInfo].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .accountCategory()
         * .accountNumber()
         * .accountType()
         * .routingNumber()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): UsAccountInfo =
            UsAccountInfo(
                checkRequired("accountCategory", accountCategory),
                checkRequired("accountNumber", accountNumber),
                checkRequired("accountType", accountType),
                checkRequired("routingNumber", routingNumber),
                bankName,
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): UsAccountInfo = apply {
        if (validated) {
            return@apply
        }

        accountCategory().validate()
        accountNumber()
        accountType().validate()
        routingNumber()
        bankName()
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
        (accountCategory.asKnown()?.validity() ?: 0) +
            (if (accountNumber.asKnown() == null) 0 else 1) +
            (accountType.asKnown()?.validity() ?: 0) +
            (if (routingNumber.asKnown() == null) 0 else 1) +
            (if (bankName.asKnown() == null) 0 else 1)

    /** Type of account (checking or savings) */
    class AccountCategory @JsonCreator private constructor(private val value: JsonField<String>) :
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

            val CHECKING = of("CHECKING")

            val SAVINGS = of("SAVINGS")

            fun of(value: String) = AccountCategory(JsonField.of(value))
        }

        /** An enum containing [AccountCategory]'s known values. */
        enum class Known {
            CHECKING,
            SAVINGS,
        }

        /**
         * An enum containing [AccountCategory]'s known values, as well as an [_UNKNOWN] member.
         *
         * An instance of [AccountCategory] can contain an unknown value in a couple of cases:
         * - It was deserialized from data that doesn't match any known member. For example, if the
         *   SDK is on an older version than the API, then the API may respond with new members that
         *   the SDK is unaware of.
         * - It was constructed with an arbitrary value using the [of] method.
         */
        enum class Value {
            CHECKING,
            SAVINGS,
            /**
             * An enum member indicating that [AccountCategory] was instantiated with an unknown
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
                CHECKING -> Value.CHECKING
                SAVINGS -> Value.SAVINGS
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
                CHECKING -> Known.CHECKING
                SAVINGS -> Known.SAVINGS
                else -> throw GridInvalidDataException("Unknown AccountCategory: $value")
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

        fun validate(): AccountCategory = apply {
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

            return other is AccountCategory && value == other.value
        }

        override fun hashCode() = value.hashCode()

        override fun toString() = value.toString()
    }

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

            val US_ACCOUNT = of("US_ACCOUNT")

            fun of(value: String) = AccountType(JsonField.of(value))
        }

        /** An enum containing [AccountType]'s known values. */
        enum class Known {
            US_ACCOUNT
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
            US_ACCOUNT,
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
                US_ACCOUNT -> Value.US_ACCOUNT
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
                US_ACCOUNT -> Known.US_ACCOUNT
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

        return other is UsAccountInfo &&
            accountCategory == other.accountCategory &&
            accountNumber == other.accountNumber &&
            accountType == other.accountType &&
            routingNumber == other.routingNumber &&
            bankName == other.bankName &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(
            accountCategory,
            accountNumber,
            accountType,
            routingNumber,
            bankName,
            additionalProperties,
        )
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "UsAccountInfo{accountCategory=$accountCategory, accountNumber=$accountNumber, accountType=$accountType, routingNumber=$routingNumber, bankName=$bankName, additionalProperties=$additionalProperties}"
}
