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
import com.grid.api.models.customers.Address
import java.util.Collections
import java.util.Objects

class BaseBeneficiary
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val beneficiaryType: JsonField<BeneficiaryType>,
    private val address: JsonField<Address>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("beneficiaryType")
        @ExcludeMissing
        beneficiaryType: JsonField<BeneficiaryType> = JsonMissing.of(),
        @JsonProperty("address") @ExcludeMissing address: JsonField<Address> = JsonMissing.of(),
    ) : this(beneficiaryType, address, mutableMapOf())

    /**
     * Whether the beneficiary is an individual or a business entity
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun beneficiaryType(): BeneficiaryType = beneficiaryType.getRequired("beneficiaryType")

    /**
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun address(): Address? = address.getNullable("address")

    /**
     * Returns the raw JSON value of [beneficiaryType].
     *
     * Unlike [beneficiaryType], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("beneficiaryType")
    @ExcludeMissing
    fun _beneficiaryType(): JsonField<BeneficiaryType> = beneficiaryType

    /**
     * Returns the raw JSON value of [address].
     *
     * Unlike [address], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("address") @ExcludeMissing fun _address(): JsonField<Address> = address

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
         * Returns a mutable builder for constructing an instance of [BaseBeneficiary].
         *
         * The following fields are required:
         * ```kotlin
         * .beneficiaryType()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [BaseBeneficiary]. */
    class Builder internal constructor() {

        private var beneficiaryType: JsonField<BeneficiaryType>? = null
        private var address: JsonField<Address> = JsonMissing.of()
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(baseBeneficiary: BaseBeneficiary) = apply {
            beneficiaryType = baseBeneficiary.beneficiaryType
            address = baseBeneficiary.address
            additionalProperties = baseBeneficiary.additionalProperties.toMutableMap()
        }

        /** Whether the beneficiary is an individual or a business entity */
        fun beneficiaryType(beneficiaryType: BeneficiaryType) =
            beneficiaryType(JsonField.of(beneficiaryType))

        /**
         * Sets [Builder.beneficiaryType] to an arbitrary JSON value.
         *
         * You should usually call [Builder.beneficiaryType] with a well-typed [BeneficiaryType]
         * value instead. This method is primarily for setting the field to an undocumented or not
         * yet supported value.
         */
        fun beneficiaryType(beneficiaryType: JsonField<BeneficiaryType>) = apply {
            this.beneficiaryType = beneficiaryType
        }

        fun address(address: Address) = address(JsonField.of(address))

        /**
         * Sets [Builder.address] to an arbitrary JSON value.
         *
         * You should usually call [Builder.address] with a well-typed [Address] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun address(address: JsonField<Address>) = apply { this.address = address }

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
         * Returns an immutable instance of [BaseBeneficiary].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .beneficiaryType()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): BaseBeneficiary =
            BaseBeneficiary(
                checkRequired("beneficiaryType", beneficiaryType),
                address,
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): BaseBeneficiary = apply {
        if (validated) {
            return@apply
        }

        beneficiaryType().validate()
        address()?.validate()
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
        (beneficiaryType.asKnown()?.validity() ?: 0) + (address.asKnown()?.validity() ?: 0)

    /** Whether the beneficiary is an individual or a business entity */
    class BeneficiaryType @JsonCreator private constructor(private val value: JsonField<String>) :
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

            val INDIVIDUAL = of("INDIVIDUAL")

            val BUSINESS = of("BUSINESS")

            fun of(value: String) = BeneficiaryType(JsonField.of(value))
        }

        /** An enum containing [BeneficiaryType]'s known values. */
        enum class Known {
            INDIVIDUAL,
            BUSINESS,
        }

        /**
         * An enum containing [BeneficiaryType]'s known values, as well as an [_UNKNOWN] member.
         *
         * An instance of [BeneficiaryType] can contain an unknown value in a couple of cases:
         * - It was deserialized from data that doesn't match any known member. For example, if the
         *   SDK is on an older version than the API, then the API may respond with new members that
         *   the SDK is unaware of.
         * - It was constructed with an arbitrary value using the [of] method.
         */
        enum class Value {
            INDIVIDUAL,
            BUSINESS,
            /**
             * An enum member indicating that [BeneficiaryType] was instantiated with an unknown
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
                INDIVIDUAL -> Value.INDIVIDUAL
                BUSINESS -> Value.BUSINESS
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
                INDIVIDUAL -> Known.INDIVIDUAL
                BUSINESS -> Known.BUSINESS
                else -> throw GridInvalidDataException("Unknown BeneficiaryType: $value")
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

        fun validate(): BeneficiaryType = apply {
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

            return other is BeneficiaryType && value == other.value
        }

        override fun hashCode() = value.hashCode()

        override fun toString() = value.toString()
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is BaseBeneficiary &&
            beneficiaryType == other.beneficiaryType &&
            address == other.address &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(beneficiaryType, address, additionalProperties)
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "BaseBeneficiary{beneficiaryType=$beneficiaryType, address=$address, additionalProperties=$additionalProperties}"
}
