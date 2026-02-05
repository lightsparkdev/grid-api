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

class BasePaymentAccountInfo
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val accountType: JsonField<AccountType>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("accountType")
        @ExcludeMissing
        accountType: JsonField<AccountType> = JsonMissing.of()
    ) : this(accountType, mutableMapOf())

    /**
     * Type of payment account or wallet
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun accountType(): AccountType = accountType.getRequired("accountType")

    /**
     * Returns the raw JSON value of [accountType].
     *
     * Unlike [accountType], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("accountType")
    @ExcludeMissing
    fun _accountType(): JsonField<AccountType> = accountType

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
         * Returns a mutable builder for constructing an instance of [BasePaymentAccountInfo].
         *
         * The following fields are required:
         * ```kotlin
         * .accountType()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [BasePaymentAccountInfo]. */
    class Builder internal constructor() {

        private var accountType: JsonField<AccountType>? = null
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(basePaymentAccountInfo: BasePaymentAccountInfo) = apply {
            accountType = basePaymentAccountInfo.accountType
            additionalProperties = basePaymentAccountInfo.additionalProperties.toMutableMap()
        }

        /** Type of payment account or wallet */
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
         * Returns an immutable instance of [BasePaymentAccountInfo].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .accountType()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): BasePaymentAccountInfo =
            BasePaymentAccountInfo(
                checkRequired("accountType", accountType),
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): BasePaymentAccountInfo = apply {
        if (validated) {
            return@apply
        }

        accountType().validate()
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
    internal fun validity(): Int = (accountType.asKnown()?.validity() ?: 0)

    /** Type of payment account or wallet */
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

            val CLABE = of("CLABE")

            val US_ACCOUNT = of("US_ACCOUNT")

            val PIX = of("PIX")

            val IBAN = of("IBAN")

            val UPI = of("UPI")

            val NGN_ACCOUNT = of("NGN_ACCOUNT")

            val SPARK_WALLET = of("SPARK_WALLET")

            val LIGHTNING = of("LIGHTNING")

            val SOLANA_WALLET = of("SOLANA_WALLET")

            val TRON_WALLET = of("TRON_WALLET")

            val POLYGON_WALLET = of("POLYGON_WALLET")

            val BASE_WALLET = of("BASE_WALLET")

            fun of(value: String) = AccountType(JsonField.of(value))
        }

        /** An enum containing [AccountType]'s known values. */
        enum class Known {
            CLABE,
            US_ACCOUNT,
            PIX,
            IBAN,
            UPI,
            NGN_ACCOUNT,
            SPARK_WALLET,
            LIGHTNING,
            SOLANA_WALLET,
            TRON_WALLET,
            POLYGON_WALLET,
            BASE_WALLET,
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
            CLABE,
            US_ACCOUNT,
            PIX,
            IBAN,
            UPI,
            NGN_ACCOUNT,
            SPARK_WALLET,
            LIGHTNING,
            SOLANA_WALLET,
            TRON_WALLET,
            POLYGON_WALLET,
            BASE_WALLET,
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
                CLABE -> Value.CLABE
                US_ACCOUNT -> Value.US_ACCOUNT
                PIX -> Value.PIX
                IBAN -> Value.IBAN
                UPI -> Value.UPI
                NGN_ACCOUNT -> Value.NGN_ACCOUNT
                SPARK_WALLET -> Value.SPARK_WALLET
                LIGHTNING -> Value.LIGHTNING
                SOLANA_WALLET -> Value.SOLANA_WALLET
                TRON_WALLET -> Value.TRON_WALLET
                POLYGON_WALLET -> Value.POLYGON_WALLET
                BASE_WALLET -> Value.BASE_WALLET
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
                CLABE -> Known.CLABE
                US_ACCOUNT -> Known.US_ACCOUNT
                PIX -> Known.PIX
                IBAN -> Known.IBAN
                UPI -> Known.UPI
                NGN_ACCOUNT -> Known.NGN_ACCOUNT
                SPARK_WALLET -> Known.SPARK_WALLET
                LIGHTNING -> Known.LIGHTNING
                SOLANA_WALLET -> Known.SOLANA_WALLET
                TRON_WALLET -> Known.TRON_WALLET
                POLYGON_WALLET -> Known.POLYGON_WALLET
                BASE_WALLET -> Known.BASE_WALLET
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

        return other is BasePaymentAccountInfo &&
            accountType == other.accountType &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy { Objects.hash(accountType, additionalProperties) }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "BasePaymentAccountInfo{accountType=$accountType, additionalProperties=$additionalProperties}"
}
