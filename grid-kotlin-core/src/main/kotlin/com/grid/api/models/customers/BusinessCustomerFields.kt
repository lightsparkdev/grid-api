// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers

import com.fasterxml.jackson.annotation.JsonAnyGetter
import com.fasterxml.jackson.annotation.JsonAnySetter
import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.grid.api.core.Enum
import com.grid.api.core.ExcludeMissing
import com.grid.api.core.JsonField
import com.grid.api.core.JsonMissing
import com.grid.api.core.JsonValue
import com.grid.api.core.checkKnown
import com.grid.api.core.checkRequired
import com.grid.api.core.toImmutable
import com.grid.api.errors.GridInvalidDataException
import java.util.Collections
import java.util.Objects

class BusinessCustomerFields
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val customerType: JsonField<CustomerType>,
    private val address: JsonField<Address>,
    private val beneficialOwners: JsonField<List<UltimateBeneficialOwner>>,
    private val businessInfo: JsonField<BusinessInfo>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("customerType")
        @ExcludeMissing
        customerType: JsonField<CustomerType> = JsonMissing.of(),
        @JsonProperty("address") @ExcludeMissing address: JsonField<Address> = JsonMissing.of(),
        @JsonProperty("beneficialOwners")
        @ExcludeMissing
        beneficialOwners: JsonField<List<UltimateBeneficialOwner>> = JsonMissing.of(),
        @JsonProperty("businessInfo")
        @ExcludeMissing
        businessInfo: JsonField<BusinessInfo> = JsonMissing.of(),
    ) : this(customerType, address, beneficialOwners, businessInfo, mutableMapOf())

    /**
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun customerType(): CustomerType = customerType.getRequired("customerType")

    /**
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun address(): Address? = address.getNullable("address")

    /**
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun beneficialOwners(): List<UltimateBeneficialOwner>? =
        beneficialOwners.getNullable("beneficialOwners")

    /**
     * Additional information for business entities
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun businessInfo(): BusinessInfo? = businessInfo.getNullable("businessInfo")

    /**
     * Returns the raw JSON value of [customerType].
     *
     * Unlike [customerType], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("customerType")
    @ExcludeMissing
    fun _customerType(): JsonField<CustomerType> = customerType

    /**
     * Returns the raw JSON value of [address].
     *
     * Unlike [address], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("address") @ExcludeMissing fun _address(): JsonField<Address> = address

    /**
     * Returns the raw JSON value of [beneficialOwners].
     *
     * Unlike [beneficialOwners], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    @JsonProperty("beneficialOwners")
    @ExcludeMissing
    fun _beneficialOwners(): JsonField<List<UltimateBeneficialOwner>> = beneficialOwners

    /**
     * Returns the raw JSON value of [businessInfo].
     *
     * Unlike [businessInfo], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("businessInfo")
    @ExcludeMissing
    fun _businessInfo(): JsonField<BusinessInfo> = businessInfo

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
         * Returns a mutable builder for constructing an instance of [BusinessCustomerFields].
         *
         * The following fields are required:
         * ```kotlin
         * .customerType()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [BusinessCustomerFields]. */
    class Builder internal constructor() {

        private var customerType: JsonField<CustomerType>? = null
        private var address: JsonField<Address> = JsonMissing.of()
        private var beneficialOwners: JsonField<MutableList<UltimateBeneficialOwner>>? = null
        private var businessInfo: JsonField<BusinessInfo> = JsonMissing.of()
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(businessCustomerFields: BusinessCustomerFields) = apply {
            customerType = businessCustomerFields.customerType
            address = businessCustomerFields.address
            beneficialOwners = businessCustomerFields.beneficialOwners.map { it.toMutableList() }
            businessInfo = businessCustomerFields.businessInfo
            additionalProperties = businessCustomerFields.additionalProperties.toMutableMap()
        }

        fun customerType(customerType: CustomerType) = customerType(JsonField.of(customerType))

        /**
         * Sets [Builder.customerType] to an arbitrary JSON value.
         *
         * You should usually call [Builder.customerType] with a well-typed [CustomerType] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun customerType(customerType: JsonField<CustomerType>) = apply {
            this.customerType = customerType
        }

        fun address(address: Address) = address(JsonField.of(address))

        /**
         * Sets [Builder.address] to an arbitrary JSON value.
         *
         * You should usually call [Builder.address] with a well-typed [Address] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun address(address: JsonField<Address>) = apply { this.address = address }

        fun beneficialOwners(beneficialOwners: List<UltimateBeneficialOwner>) =
            beneficialOwners(JsonField.of(beneficialOwners))

        /**
         * Sets [Builder.beneficialOwners] to an arbitrary JSON value.
         *
         * You should usually call [Builder.beneficialOwners] with a well-typed
         * `List<UltimateBeneficialOwner>` value instead. This method is primarily for setting the
         * field to an undocumented or not yet supported value.
         */
        fun beneficialOwners(beneficialOwners: JsonField<List<UltimateBeneficialOwner>>) = apply {
            this.beneficialOwners = beneficialOwners.map { it.toMutableList() }
        }

        /**
         * Adds a single [UltimateBeneficialOwner] to [beneficialOwners].
         *
         * @throws IllegalStateException if the field was previously set to a non-list.
         */
        fun addBeneficialOwner(beneficialOwner: UltimateBeneficialOwner) = apply {
            beneficialOwners =
                (beneficialOwners ?: JsonField.of(mutableListOf())).also {
                    checkKnown("beneficialOwners", it).add(beneficialOwner)
                }
        }

        /** Additional information for business entities */
        fun businessInfo(businessInfo: BusinessInfo) = businessInfo(JsonField.of(businessInfo))

        /**
         * Sets [Builder.businessInfo] to an arbitrary JSON value.
         *
         * You should usually call [Builder.businessInfo] with a well-typed [BusinessInfo] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun businessInfo(businessInfo: JsonField<BusinessInfo>) = apply {
            this.businessInfo = businessInfo
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
         * Returns an immutable instance of [BusinessCustomerFields].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .customerType()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): BusinessCustomerFields =
            BusinessCustomerFields(
                checkRequired("customerType", customerType),
                address,
                (beneficialOwners ?: JsonMissing.of()).map { it.toImmutable() },
                businessInfo,
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): BusinessCustomerFields = apply {
        if (validated) {
            return@apply
        }

        customerType().validate()
        address()?.validate()
        beneficialOwners()?.forEach { it.validate() }
        businessInfo()?.validate()
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
        (customerType.asKnown()?.validity() ?: 0) +
            (address.asKnown()?.validity() ?: 0) +
            (beneficialOwners.asKnown()?.sumOf { it.validity().toInt() } ?: 0) +
            (businessInfo.asKnown()?.validity() ?: 0)

    class CustomerType @JsonCreator private constructor(private val value: JsonField<String>) :
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

            fun of(value: String) = CustomerType(JsonField.of(value))
        }

        /** An enum containing [CustomerType]'s known values. */
        enum class Known {
            BUSINESS
        }

        /**
         * An enum containing [CustomerType]'s known values, as well as an [_UNKNOWN] member.
         *
         * An instance of [CustomerType] can contain an unknown value in a couple of cases:
         * - It was deserialized from data that doesn't match any known member. For example, if the
         *   SDK is on an older version than the API, then the API may respond with new members that
         *   the SDK is unaware of.
         * - It was constructed with an arbitrary value using the [of] method.
         */
        enum class Value {
            BUSINESS,
            /**
             * An enum member indicating that [CustomerType] was instantiated with an unknown value.
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
                else -> throw GridInvalidDataException("Unknown CustomerType: $value")
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

        fun validate(): CustomerType = apply {
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

            return other is CustomerType && value == other.value
        }

        override fun hashCode() = value.hashCode()

        override fun toString() = value.toString()
    }

    /** Additional information for business entities */
    class BusinessInfo
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val legalName: JsonField<String>,
        private val registrationNumber: JsonField<String>,
        private val taxId: JsonField<String>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("legalName")
            @ExcludeMissing
            legalName: JsonField<String> = JsonMissing.of(),
            @JsonProperty("registrationNumber")
            @ExcludeMissing
            registrationNumber: JsonField<String> = JsonMissing.of(),
            @JsonProperty("taxId") @ExcludeMissing taxId: JsonField<String> = JsonMissing.of(),
        ) : this(legalName, registrationNumber, taxId, mutableMapOf())

        /**
         * Legal name of the business
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun legalName(): String? = legalName.getNullable("legalName")

        /**
         * Business registration number
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun registrationNumber(): String? = registrationNumber.getNullable("registrationNumber")

        /**
         * Tax identification number
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun taxId(): String? = taxId.getNullable("taxId")

        /**
         * Returns the raw JSON value of [legalName].
         *
         * Unlike [legalName], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("legalName") @ExcludeMissing fun _legalName(): JsonField<String> = legalName

        /**
         * Returns the raw JSON value of [registrationNumber].
         *
         * Unlike [registrationNumber], this method doesn't throw if the JSON field has an
         * unexpected type.
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

            /** Returns a mutable builder for constructing an instance of [BusinessInfo]. */
            fun builder() = Builder()
        }

        /** A builder for [BusinessInfo]. */
        class Builder internal constructor() {

            private var legalName: JsonField<String> = JsonMissing.of()
            private var registrationNumber: JsonField<String> = JsonMissing.of()
            private var taxId: JsonField<String> = JsonMissing.of()
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(businessInfo: BusinessInfo) = apply {
                legalName = businessInfo.legalName
                registrationNumber = businessInfo.registrationNumber
                taxId = businessInfo.taxId
                additionalProperties = businessInfo.additionalProperties.toMutableMap()
            }

            /** Legal name of the business */
            fun legalName(legalName: String) = legalName(JsonField.of(legalName))

            /**
             * Sets [Builder.legalName] to an arbitrary JSON value.
             *
             * You should usually call [Builder.legalName] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun legalName(legalName: JsonField<String>) = apply { this.legalName = legalName }

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
             * You should usually call [Builder.taxId] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
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
             * Returns an immutable instance of [BusinessInfo].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             */
            fun build(): BusinessInfo =
                BusinessInfo(
                    legalName,
                    registrationNumber,
                    taxId,
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): BusinessInfo = apply {
            if (validated) {
                return@apply
            }

            legalName()
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
         * Returns a score indicating how many valid values are contained in this object
         * recursively.
         *
         * Used for best match union deserialization.
         */
        internal fun validity(): Int =
            (if (legalName.asKnown() == null) 0 else 1) +
                (if (registrationNumber.asKnown() == null) 0 else 1) +
                (if (taxId.asKnown() == null) 0 else 1)

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is BusinessInfo &&
                legalName == other.legalName &&
                registrationNumber == other.registrationNumber &&
                taxId == other.taxId &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(legalName, registrationNumber, taxId, additionalProperties)
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "BusinessInfo{legalName=$legalName, registrationNumber=$registrationNumber, taxId=$taxId, additionalProperties=$additionalProperties}"
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is BusinessCustomerFields &&
            customerType == other.customerType &&
            address == other.address &&
            beneficialOwners == other.beneficialOwners &&
            businessInfo == other.businessInfo &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(customerType, address, beneficialOwners, businessInfo, additionalProperties)
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "BusinessCustomerFields{customerType=$customerType, address=$address, beneficialOwners=$beneficialOwners, businessInfo=$businessInfo, additionalProperties=$additionalProperties}"
}
