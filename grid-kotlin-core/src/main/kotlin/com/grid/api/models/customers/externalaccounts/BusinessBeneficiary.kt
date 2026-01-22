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

class BusinessBeneficiary
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val beneficiaryType: JsonField<BeneficiaryType>,
    private val legalName: JsonField<String>,
    private val address: JsonField<Address>,
    private val registrationNumber: JsonField<String>,
    private val taxId: JsonField<String>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("beneficiaryType")
        @ExcludeMissing
        beneficiaryType: JsonField<BeneficiaryType> = JsonMissing.of(),
        @JsonProperty("legalName") @ExcludeMissing legalName: JsonField<String> = JsonMissing.of(),
        @JsonProperty("address") @ExcludeMissing address: JsonField<Address> = JsonMissing.of(),
        @JsonProperty("registrationNumber")
        @ExcludeMissing
        registrationNumber: JsonField<String> = JsonMissing.of(),
        @JsonProperty("taxId") @ExcludeMissing taxId: JsonField<String> = JsonMissing.of(),
    ) : this(beneficiaryType, legalName, address, registrationNumber, taxId, mutableMapOf())

    /**
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun beneficiaryType(): BeneficiaryType = beneficiaryType.getRequired("beneficiaryType")

    /**
     * Legal name of the business
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun legalName(): String = legalName.getRequired("legalName")

    /**
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun address(): Address? = address.getNullable("address")

    /**
     * Business registration number
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun registrationNumber(): String? = registrationNumber.getNullable("registrationNumber")

    /**
     * Tax identification number
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun taxId(): String? = taxId.getNullable("taxId")

    /**
     * Returns the raw JSON value of [beneficiaryType].
     *
     * Unlike [beneficiaryType], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("beneficiaryType")
    @ExcludeMissing
    fun _beneficiaryType(): JsonField<BeneficiaryType> = beneficiaryType

    /**
     * Returns the raw JSON value of [legalName].
     *
     * Unlike [legalName], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("legalName") @ExcludeMissing fun _legalName(): JsonField<String> = legalName

    /**
     * Returns the raw JSON value of [address].
     *
     * Unlike [address], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("address") @ExcludeMissing fun _address(): JsonField<Address> = address

    /**
     * Returns the raw JSON value of [registrationNumber].
     *
     * Unlike [registrationNumber], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    @JsonProperty("registrationNumber")
    @ExcludeMissing
    fun _registrationNumber(): JsonField<String> = registrationNumber

    /**
     * Returns the raw JSON value of [taxId].
     *
     * Unlike [taxId], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("taxId") @ExcludeMissing fun _taxId(): JsonField<String> = taxId

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
         * Returns a mutable builder for constructing an instance of [BusinessBeneficiary].
         *
         * The following fields are required:
         * ```kotlin
         * .beneficiaryType()
         * .legalName()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [BusinessBeneficiary]. */
    class Builder internal constructor() {

        private var beneficiaryType: JsonField<BeneficiaryType>? = null
        private var legalName: JsonField<String>? = null
        private var address: JsonField<Address> = JsonMissing.of()
        private var registrationNumber: JsonField<String> = JsonMissing.of()
        private var taxId: JsonField<String> = JsonMissing.of()
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(businessBeneficiary: BusinessBeneficiary) = apply {
            beneficiaryType = businessBeneficiary.beneficiaryType
            legalName = businessBeneficiary.legalName
            address = businessBeneficiary.address
            registrationNumber = businessBeneficiary.registrationNumber
            taxId = businessBeneficiary.taxId
            additionalProperties = businessBeneficiary.additionalProperties.toMutableMap()
        }

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

        /** Legal name of the business */
        fun legalName(legalName: String) = legalName(JsonField.of(legalName))

        /**
         * Sets [Builder.legalName] to an arbitrary JSON value.
         *
         * You should usually call [Builder.legalName] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun legalName(legalName: JsonField<String>) = apply { this.legalName = legalName }

        fun address(address: Address) = address(JsonField.of(address))

        /**
         * Sets [Builder.address] to an arbitrary JSON value.
         *
         * You should usually call [Builder.address] with a well-typed [Address] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun address(address: JsonField<Address>) = apply { this.address = address }

        /** Business registration number */
        fun registrationNumber(registrationNumber: String) =
            registrationNumber(JsonField.of(registrationNumber))

        /**
         * Sets [Builder.registrationNumber] to an arbitrary JSON value.
         *
         * You should usually call [Builder.registrationNumber] with a well-typed [String] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun registrationNumber(registrationNumber: JsonField<String>) = apply {
            this.registrationNumber = registrationNumber
        }

        /** Tax identification number */
        fun taxId(taxId: String) = taxId(JsonField.of(taxId))

        /**
         * Sets [Builder.taxId] to an arbitrary JSON value.
         *
         * You should usually call [Builder.taxId] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun taxId(taxId: JsonField<String>) = apply { this.taxId = taxId }

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
         * Returns an immutable instance of [BusinessBeneficiary].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .beneficiaryType()
         * .legalName()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): BusinessBeneficiary =
            BusinessBeneficiary(
                checkRequired("beneficiaryType", beneficiaryType),
                checkRequired("legalName", legalName),
                address,
                registrationNumber,
                taxId,
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): BusinessBeneficiary = apply {
        if (validated) {
            return@apply
        }

        beneficiaryType().validate()
        legalName()
        address()?.validate()
        registrationNumber()
        taxId()
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
        (beneficiaryType.asKnown()?.validity() ?: 0) +
            (if (legalName.asKnown() == null) 0 else 1) +
            (address.asKnown()?.validity() ?: 0) +
            (if (registrationNumber.asKnown() == null) 0 else 1) +
            (if (taxId.asKnown() == null) 0 else 1)

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

            val BUSINESS = of("BUSINESS")

            fun of(value: String) = BeneficiaryType(JsonField.of(value))
        }

        /** An enum containing [BeneficiaryType]'s known values. */
        enum class Known {
            BUSINESS
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

        return other is BusinessBeneficiary &&
            beneficiaryType == other.beneficiaryType &&
            legalName == other.legalName &&
            address == other.address &&
            registrationNumber == other.registrationNumber &&
            taxId == other.taxId &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(
            beneficiaryType,
            legalName,
            address,
            registrationNumber,
            taxId,
            additionalProperties,
        )
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "BusinessBeneficiary{beneficiaryType=$beneficiaryType, legalName=$legalName, address=$address, registrationNumber=$registrationNumber, taxId=$taxId, additionalProperties=$additionalProperties}"
}
