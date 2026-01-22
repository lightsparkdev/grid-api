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
import java.time.LocalDate
import java.util.Collections
import java.util.Objects

class IndividualBeneficiary
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val beneficiaryType: JsonValue,
    private val birthDate: JsonField<LocalDate>,
    private val fullName: JsonField<String>,
    private val nationality: JsonField<String>,
    private val address: JsonField<Address>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("beneficiaryType")
        @ExcludeMissing
        beneficiaryType: JsonValue = JsonMissing.of(),
        @JsonProperty("birthDate")
        @ExcludeMissing
        birthDate: JsonField<LocalDate> = JsonMissing.of(),
        @JsonProperty("fullName") @ExcludeMissing fullName: JsonField<String> = JsonMissing.of(),
        @JsonProperty("nationality")
        @ExcludeMissing
        nationality: JsonField<String> = JsonMissing.of(),
        @JsonProperty("address") @ExcludeMissing address: JsonField<Address> = JsonMissing.of(),
    ) : this(beneficiaryType, birthDate, fullName, nationality, address, mutableMapOf())

    /**
     * Expected to always return the following:
     * ```kotlin
     * JsonValue.from("INDIVIDUAL")
     * ```
     *
     * However, this method can be useful for debugging and logging (e.g. if the server responded
     * with an unexpected value).
     */
    @JsonProperty("beneficiaryType")
    @ExcludeMissing
    fun _beneficiaryType(): JsonValue = beneficiaryType

    /**
     * Date of birth in ISO 8601 format (YYYY-MM-DD)
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun birthDate(): LocalDate = birthDate.getRequired("birthDate")

    /**
     * Individual's full name
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun fullName(): String = fullName.getRequired("fullName")

    /**
     * Country code (ISO 3166-1 alpha-2)
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun nationality(): String = nationality.getRequired("nationality")

    /**
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun address(): Address? = address.getNullable("address")

    /**
     * Returns the raw JSON value of [birthDate].
     *
     * Unlike [birthDate], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("birthDate") @ExcludeMissing fun _birthDate(): JsonField<LocalDate> = birthDate

    /**
     * Returns the raw JSON value of [fullName].
     *
     * Unlike [fullName], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("fullName") @ExcludeMissing fun _fullName(): JsonField<String> = fullName

    /**
     * Returns the raw JSON value of [nationality].
     *
     * Unlike [nationality], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("nationality") @ExcludeMissing fun _nationality(): JsonField<String> = nationality

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
         * Returns a mutable builder for constructing an instance of [IndividualBeneficiary].
         *
         * The following fields are required:
         * ```kotlin
         * .birthDate()
         * .fullName()
         * .nationality()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [IndividualBeneficiary]. */
    class Builder internal constructor() {

        private var beneficiaryType: JsonValue = JsonValue.from("INDIVIDUAL")
        private var birthDate: JsonField<LocalDate>? = null
        private var fullName: JsonField<String>? = null
        private var nationality: JsonField<String>? = null
        private var address: JsonField<Address> = JsonMissing.of()
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(individualBeneficiary: IndividualBeneficiary) = apply {
            beneficiaryType = individualBeneficiary.beneficiaryType
            birthDate = individualBeneficiary.birthDate
            fullName = individualBeneficiary.fullName
            nationality = individualBeneficiary.nationality
            address = individualBeneficiary.address
            additionalProperties = individualBeneficiary.additionalProperties.toMutableMap()
        }

        /**
         * Sets the field to an arbitrary JSON value.
         *
         * It is usually unnecessary to call this method because the field defaults to the
         * following:
         * ```kotlin
         * JsonValue.from("INDIVIDUAL")
         * ```
         *
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun beneficiaryType(beneficiaryType: JsonValue) = apply {
            this.beneficiaryType = beneficiaryType
        }

        /** Date of birth in ISO 8601 format (YYYY-MM-DD) */
        fun birthDate(birthDate: LocalDate) = birthDate(JsonField.of(birthDate))

        /**
         * Sets [Builder.birthDate] to an arbitrary JSON value.
         *
         * You should usually call [Builder.birthDate] with a well-typed [LocalDate] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun birthDate(birthDate: JsonField<LocalDate>) = apply { this.birthDate = birthDate }

        /** Individual's full name */
        fun fullName(fullName: String) = fullName(JsonField.of(fullName))

        /**
         * Sets [Builder.fullName] to an arbitrary JSON value.
         *
         * You should usually call [Builder.fullName] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun fullName(fullName: JsonField<String>) = apply { this.fullName = fullName }

        /** Country code (ISO 3166-1 alpha-2) */
        fun nationality(nationality: String) = nationality(JsonField.of(nationality))

        /**
         * Sets [Builder.nationality] to an arbitrary JSON value.
         *
         * You should usually call [Builder.nationality] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun nationality(nationality: JsonField<String>) = apply { this.nationality = nationality }

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
         * Returns an immutable instance of [IndividualBeneficiary].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .birthDate()
         * .fullName()
         * .nationality()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): IndividualBeneficiary =
            IndividualBeneficiary(
                beneficiaryType,
                checkRequired("birthDate", birthDate),
                checkRequired("fullName", fullName),
                checkRequired("nationality", nationality),
                address,
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): IndividualBeneficiary = apply {
        if (validated) {
            return@apply
        }

        _beneficiaryType().let {
            if (it != JsonValue.from("INDIVIDUAL")) {
                throw GridInvalidDataException("'beneficiaryType' is invalid, received $it")
            }
        }
        birthDate()
        fullName()
        nationality()
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
        beneficiaryType.let { if (it == JsonValue.from("INDIVIDUAL")) 1 else 0 } +
            (if (birthDate.asKnown() == null) 0 else 1) +
            (if (fullName.asKnown() == null) 0 else 1) +
            (if (nationality.asKnown() == null) 0 else 1) +
            (address.asKnown()?.validity() ?: 0)

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is IndividualBeneficiary &&
            beneficiaryType == other.beneficiaryType &&
            birthDate == other.birthDate &&
            fullName == other.fullName &&
            nationality == other.nationality &&
            address == other.address &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(
            beneficiaryType,
            birthDate,
            fullName,
            nationality,
            address,
            additionalProperties,
        )
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "IndividualBeneficiary{beneficiaryType=$beneficiaryType, birthDate=$birthDate, fullName=$fullName, nationality=$nationality, address=$address, additionalProperties=$additionalProperties}"
}
