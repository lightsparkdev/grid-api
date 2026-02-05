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

/**
 * Lightning payment destination. Exactly one of `invoice`, `bolt12`, or `lightningAddress` must be
 * provided.
 */
class LightningExternalAccountInfo
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val accountType: JsonField<BaseExternalAccountInfo.AccountType>,
    private val bolt12: JsonField<String>,
    private val invoice: JsonField<String>,
    private val lightningAddress: JsonField<String>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("accountType")
        @ExcludeMissing
        accountType: JsonField<BaseExternalAccountInfo.AccountType> = JsonMissing.of(),
        @JsonProperty("bolt12") @ExcludeMissing bolt12: JsonField<String> = JsonMissing.of(),
        @JsonProperty("invoice") @ExcludeMissing invoice: JsonField<String> = JsonMissing.of(),
        @JsonProperty("lightningAddress")
        @ExcludeMissing
        lightningAddress: JsonField<String> = JsonMissing.of(),
    ) : this(accountType, bolt12, invoice, lightningAddress, mutableMapOf())

    fun toBaseExternalAccountInfo(): BaseExternalAccountInfo =
        BaseExternalAccountInfo.builder().accountType(accountType).build()

    /**
     * Type of external account or wallet
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun accountType(): BaseExternalAccountInfo.AccountType = accountType.getRequired("accountType")

    /**
     * A bolt12 offer which can be reused as a payment destination
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun bolt12(): String? = bolt12.getNullable("bolt12")

    /**
     * 1-time use lightning bolt11 invoice payout destination
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun invoice(): String? = invoice.getNullable("invoice")

    /**
     * A lightning address which can be used as a payment destination. Note that for UMA addresses,
     * no external account is needed. You can use the UMA address directly as a destination.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun lightningAddress(): String? = lightningAddress.getNullable("lightningAddress")

    /**
     * Returns the raw JSON value of [accountType].
     *
     * Unlike [accountType], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("accountType")
    @ExcludeMissing
    fun _accountType(): JsonField<BaseExternalAccountInfo.AccountType> = accountType

    /**
     * Returns the raw JSON value of [bolt12].
     *
     * Unlike [bolt12], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("bolt12") @ExcludeMissing fun _bolt12(): JsonField<String> = bolt12

    /**
     * Returns the raw JSON value of [invoice].
     *
     * Unlike [invoice], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("invoice") @ExcludeMissing fun _invoice(): JsonField<String> = invoice

    /**
     * Returns the raw JSON value of [lightningAddress].
     *
     * Unlike [lightningAddress], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    @JsonProperty("lightningAddress")
    @ExcludeMissing
    fun _lightningAddress(): JsonField<String> = lightningAddress

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
         * Returns a mutable builder for constructing an instance of [LightningExternalAccountInfo].
         *
         * The following fields are required:
         * ```kotlin
         * .accountType()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [LightningExternalAccountInfo]. */
    class Builder internal constructor() {

        private var accountType: JsonField<BaseExternalAccountInfo.AccountType>? = null
        private var bolt12: JsonField<String> = JsonMissing.of()
        private var invoice: JsonField<String> = JsonMissing.of()
        private var lightningAddress: JsonField<String> = JsonMissing.of()
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(lightningExternalAccountInfo: LightningExternalAccountInfo) = apply {
            accountType = lightningExternalAccountInfo.accountType
            bolt12 = lightningExternalAccountInfo.bolt12
            invoice = lightningExternalAccountInfo.invoice
            lightningAddress = lightningExternalAccountInfo.lightningAddress
            additionalProperties = lightningExternalAccountInfo.additionalProperties.toMutableMap()
        }

        /** Type of external account or wallet */
        fun accountType(accountType: BaseExternalAccountInfo.AccountType) =
            accountType(JsonField.of(accountType))

        /**
         * Sets [Builder.accountType] to an arbitrary JSON value.
         *
         * You should usually call [Builder.accountType] with a well-typed
         * [BaseExternalAccountInfo.AccountType] value instead. This method is primarily for setting
         * the field to an undocumented or not yet supported value.
         */
        fun accountType(accountType: JsonField<BaseExternalAccountInfo.AccountType>) = apply {
            this.accountType = accountType
        }

        /** A bolt12 offer which can be reused as a payment destination */
        fun bolt12(bolt12: String) = bolt12(JsonField.of(bolt12))

        /**
         * Sets [Builder.bolt12] to an arbitrary JSON value.
         *
         * You should usually call [Builder.bolt12] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun bolt12(bolt12: JsonField<String>) = apply { this.bolt12 = bolt12 }

        /** 1-time use lightning bolt11 invoice payout destination */
        fun invoice(invoice: String) = invoice(JsonField.of(invoice))

        /**
         * Sets [Builder.invoice] to an arbitrary JSON value.
         *
         * You should usually call [Builder.invoice] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun invoice(invoice: JsonField<String>) = apply { this.invoice = invoice }

        /**
         * A lightning address which can be used as a payment destination. Note that for UMA
         * addresses, no external account is needed. You can use the UMA address directly as a
         * destination.
         */
        fun lightningAddress(lightningAddress: String) =
            lightningAddress(JsonField.of(lightningAddress))

        /**
         * Sets [Builder.lightningAddress] to an arbitrary JSON value.
         *
         * You should usually call [Builder.lightningAddress] with a well-typed [String] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun lightningAddress(lightningAddress: JsonField<String>) = apply {
            this.lightningAddress = lightningAddress
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
         * Returns an immutable instance of [LightningExternalAccountInfo].
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
        fun build(): LightningExternalAccountInfo =
            LightningExternalAccountInfo(
                checkRequired("accountType", accountType),
                bolt12,
                invoice,
                lightningAddress,
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): LightningExternalAccountInfo = apply {
        if (validated) {
            return@apply
        }

        accountType().validate()
        bolt12()
        invoice()
        lightningAddress()
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
            (if (bolt12.asKnown() == null) 0 else 1) +
            (if (invoice.asKnown() == null) 0 else 1) +
            (if (lightningAddress.asKnown() == null) 0 else 1)

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

            val LIGHTNING = of("LIGHTNING")

            fun of(value: String) = AccountType(JsonField.of(value))
        }

        /** An enum containing [AccountType]'s known values. */
        enum class Known {
            LIGHTNING
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
            LIGHTNING,
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
                LIGHTNING -> Value.LIGHTNING
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
                LIGHTNING -> Known.LIGHTNING
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

        return other is LightningExternalAccountInfo &&
            accountType == other.accountType &&
            bolt12 == other.bolt12 &&
            invoice == other.invoice &&
            lightningAddress == other.lightningAddress &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(accountType, bolt12, invoice, lightningAddress, additionalProperties)
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "LightningExternalAccountInfo{accountType=$accountType, bolt12=$bolt12, invoice=$invoice, lightningAddress=$lightningAddress, additionalProperties=$additionalProperties}"
}
