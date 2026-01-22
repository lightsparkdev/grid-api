// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.fasterxml.jackson.annotation.JsonAnyGetter
import com.fasterxml.jackson.annotation.JsonAnySetter
import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
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
    private val beneficiaryType: JsonValue,
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
        beneficiaryType: JsonValue = JsonMissing.of(),
        @JsonProperty("legalName") @ExcludeMissing legalName: JsonField<String> = JsonMissing.of(),
        @JsonProperty("address") @ExcludeMissing address: JsonField<Address> = JsonMissing.of(),
        @JsonProperty("registrationNumber")
        @ExcludeMissing
        registrationNumber: JsonField<String> = JsonMissing.of(),
        @JsonProperty("taxId") @ExcludeMissing taxId: JsonField<String> = JsonMissing.of(),
    ) : this(beneficiaryType, legalName, address, registrationNumber, taxId, mutableMapOf())

    /**
     * Expected to always return the following:
     * ```kotlin
     * JsonValue.from("BUSINESS")
     * ```
     *
     * However, this method can be useful for debugging and logging (e.g. if the server responded
     * with an unexpected value).
     */
    @JsonProperty("beneficiaryType")
    @ExcludeMissing
    fun _beneficiaryType(): JsonValue = beneficiaryType

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
         * .legalName()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [BusinessBeneficiary]. */
    class Builder internal constructor() {

        private var beneficiaryType: JsonValue = JsonValue.from("BUSINESS")
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

        /**
         * Sets the field to an arbitrary JSON value.
         *
         * It is usually unnecessary to call this method because the field defaults to the
         * following:
         * ```kotlin
         * JsonValue.from("BUSINESS")
         * ```
         *
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun beneficiaryType(beneficiaryType: JsonValue) = apply {
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
         * .legalName()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): BusinessBeneficiary =
            BusinessBeneficiary(
                beneficiaryType,
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

        _beneficiaryType().let {
            if (it != JsonValue.from("BUSINESS")) {
                throw GridInvalidDataException("'beneficiaryType' is invalid, received $it")
            }
        }
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
        beneficiaryType.let { if (it == JsonValue.from("BUSINESS")) 1 else 0 } +
            (if (legalName.asKnown() == null) 0 else 1) +
            (address.asKnown()?.validity() ?: 0) +
            (if (registrationNumber.asKnown() == null) 0 else 1) +
            (if (taxId.asKnown() == null) 0 else 1)

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
