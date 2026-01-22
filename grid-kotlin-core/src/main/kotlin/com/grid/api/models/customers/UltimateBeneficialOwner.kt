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
import com.grid.api.core.checkRequired
import com.grid.api.errors.GridInvalidDataException
import java.time.LocalDate
import java.util.Collections
import java.util.Objects

class UltimateBeneficialOwner
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val fullName: JsonField<String>,
    private val individualType: JsonField<IndividualType>,
    private val address: JsonField<Address>,
    private val birthDate: JsonField<LocalDate>,
    private val emailAddress: JsonField<String>,
    private val nationality: JsonField<String>,
    private val percentageOwnership: JsonField<Double>,
    private val phoneNumber: JsonField<String>,
    private val taxId: JsonField<String>,
    private val title: JsonField<String>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("fullName") @ExcludeMissing fullName: JsonField<String> = JsonMissing.of(),
        @JsonProperty("individualType")
        @ExcludeMissing
        individualType: JsonField<IndividualType> = JsonMissing.of(),
        @JsonProperty("address") @ExcludeMissing address: JsonField<Address> = JsonMissing.of(),
        @JsonProperty("birthDate")
        @ExcludeMissing
        birthDate: JsonField<LocalDate> = JsonMissing.of(),
        @JsonProperty("emailAddress")
        @ExcludeMissing
        emailAddress: JsonField<String> = JsonMissing.of(),
        @JsonProperty("nationality")
        @ExcludeMissing
        nationality: JsonField<String> = JsonMissing.of(),
        @JsonProperty("percentageOwnership")
        @ExcludeMissing
        percentageOwnership: JsonField<Double> = JsonMissing.of(),
        @JsonProperty("phoneNumber")
        @ExcludeMissing
        phoneNumber: JsonField<String> = JsonMissing.of(),
        @JsonProperty("taxId") @ExcludeMissing taxId: JsonField<String> = JsonMissing.of(),
        @JsonProperty("title") @ExcludeMissing title: JsonField<String> = JsonMissing.of(),
    ) : this(
        fullName,
        individualType,
        address,
        birthDate,
        emailAddress,
        nationality,
        percentageOwnership,
        phoneNumber,
        taxId,
        title,
        mutableMapOf(),
    )

    /**
     * Individual's full name
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun fullName(): String = fullName.getRequired("fullName")

    /**
     * Type of individual in the corporation
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun individualType(): IndividualType = individualType.getRequired("individualType")

    /**
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun address(): Address? = address.getNullable("address")

    /**
     * Date of birth in ISO 8601 format (YYYY-MM-DD)
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun birthDate(): LocalDate? = birthDate.getNullable("birthDate")

    /**
     * Email address of the individual
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun emailAddress(): String? = emailAddress.getNullable("emailAddress")

    /**
     * Country code (ISO 3166-1 alpha-2)
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun nationality(): String? = nationality.getNullable("nationality")

    /**
     * Percent of ownership when individual type is beneficial owner
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun percentageOwnership(): Double? = percentageOwnership.getNullable("percentageOwnership")

    /**
     * Phone number of the individual in E.164 format
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun phoneNumber(): String? = phoneNumber.getNullable("phoneNumber")

    /**
     * Tax identification number of the individual. This could be a Social Security Number (SSN) for
     * US individuals, Tax Identification Number (TIN) for non-US individuals, or a Passport Number.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun taxId(): String? = taxId.getNullable("taxId")

    /**
     * Title at company
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun title(): String? = title.getNullable("title")

    /**
     * Returns the raw JSON value of [fullName].
     *
     * Unlike [fullName], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("fullName") @ExcludeMissing fun _fullName(): JsonField<String> = fullName

    /**
     * Returns the raw JSON value of [individualType].
     *
     * Unlike [individualType], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("individualType")
    @ExcludeMissing
    fun _individualType(): JsonField<IndividualType> = individualType

    /**
     * Returns the raw JSON value of [address].
     *
     * Unlike [address], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("address") @ExcludeMissing fun _address(): JsonField<Address> = address

    /**
     * Returns the raw JSON value of [birthDate].
     *
     * Unlike [birthDate], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("birthDate") @ExcludeMissing fun _birthDate(): JsonField<LocalDate> = birthDate

    /**
     * Returns the raw JSON value of [emailAddress].
     *
     * Unlike [emailAddress], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("emailAddress")
    @ExcludeMissing
    fun _emailAddress(): JsonField<String> = emailAddress

    /**
     * Returns the raw JSON value of [nationality].
     *
     * Unlike [nationality], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("nationality") @ExcludeMissing fun _nationality(): JsonField<String> = nationality

    /**
     * Returns the raw JSON value of [percentageOwnership].
     *
     * Unlike [percentageOwnership], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    @JsonProperty("percentageOwnership")
    @ExcludeMissing
    fun _percentageOwnership(): JsonField<Double> = percentageOwnership

    /**
     * Returns the raw JSON value of [phoneNumber].
     *
     * Unlike [phoneNumber], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("phoneNumber") @ExcludeMissing fun _phoneNumber(): JsonField<String> = phoneNumber

    /**
     * Returns the raw JSON value of [taxId].
     *
     * Unlike [taxId], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("taxId") @ExcludeMissing fun _taxId(): JsonField<String> = taxId

    /**
     * Returns the raw JSON value of [title].
     *
     * Unlike [title], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("title") @ExcludeMissing fun _title(): JsonField<String> = title

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
         * Returns a mutable builder for constructing an instance of [UltimateBeneficialOwner].
         *
         * The following fields are required:
         * ```kotlin
         * .fullName()
         * .individualType()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [UltimateBeneficialOwner]. */
    class Builder internal constructor() {

        private var fullName: JsonField<String>? = null
        private var individualType: JsonField<IndividualType>? = null
        private var address: JsonField<Address> = JsonMissing.of()
        private var birthDate: JsonField<LocalDate> = JsonMissing.of()
        private var emailAddress: JsonField<String> = JsonMissing.of()
        private var nationality: JsonField<String> = JsonMissing.of()
        private var percentageOwnership: JsonField<Double> = JsonMissing.of()
        private var phoneNumber: JsonField<String> = JsonMissing.of()
        private var taxId: JsonField<String> = JsonMissing.of()
        private var title: JsonField<String> = JsonMissing.of()
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(ultimateBeneficialOwner: UltimateBeneficialOwner) = apply {
            fullName = ultimateBeneficialOwner.fullName
            individualType = ultimateBeneficialOwner.individualType
            address = ultimateBeneficialOwner.address
            birthDate = ultimateBeneficialOwner.birthDate
            emailAddress = ultimateBeneficialOwner.emailAddress
            nationality = ultimateBeneficialOwner.nationality
            percentageOwnership = ultimateBeneficialOwner.percentageOwnership
            phoneNumber = ultimateBeneficialOwner.phoneNumber
            taxId = ultimateBeneficialOwner.taxId
            title = ultimateBeneficialOwner.title
            additionalProperties = ultimateBeneficialOwner.additionalProperties.toMutableMap()
        }

        /** Individual's full name */
        fun fullName(fullName: String) = fullName(JsonField.of(fullName))

        /**
         * Sets [Builder.fullName] to an arbitrary JSON value.
         *
         * You should usually call [Builder.fullName] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun fullName(fullName: JsonField<String>) = apply { this.fullName = fullName }

        /** Type of individual in the corporation */
        fun individualType(individualType: IndividualType) =
            individualType(JsonField.of(individualType))

        /**
         * Sets [Builder.individualType] to an arbitrary JSON value.
         *
         * You should usually call [Builder.individualType] with a well-typed [IndividualType] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun individualType(individualType: JsonField<IndividualType>) = apply {
            this.individualType = individualType
        }

        fun address(address: Address) = address(JsonField.of(address))

        /**
         * Sets [Builder.address] to an arbitrary JSON value.
         *
         * You should usually call [Builder.address] with a well-typed [Address] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun address(address: JsonField<Address>) = apply { this.address = address }

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

        /** Email address of the individual */
        fun emailAddress(emailAddress: String) = emailAddress(JsonField.of(emailAddress))

        /**
         * Sets [Builder.emailAddress] to an arbitrary JSON value.
         *
         * You should usually call [Builder.emailAddress] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun emailAddress(emailAddress: JsonField<String>) = apply {
            this.emailAddress = emailAddress
        }

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

        /** Percent of ownership when individual type is beneficial owner */
        fun percentageOwnership(percentageOwnership: Double) =
            percentageOwnership(JsonField.of(percentageOwnership))

        /**
         * Sets [Builder.percentageOwnership] to an arbitrary JSON value.
         *
         * You should usually call [Builder.percentageOwnership] with a well-typed [Double] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun percentageOwnership(percentageOwnership: JsonField<Double>) = apply {
            this.percentageOwnership = percentageOwnership
        }

        /** Phone number of the individual in E.164 format */
        fun phoneNumber(phoneNumber: String) = phoneNumber(JsonField.of(phoneNumber))

        /**
         * Sets [Builder.phoneNumber] to an arbitrary JSON value.
         *
         * You should usually call [Builder.phoneNumber] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun phoneNumber(phoneNumber: JsonField<String>) = apply { this.phoneNumber = phoneNumber }

        /**
         * Tax identification number of the individual. This could be a Social Security Number (SSN)
         * for US individuals, Tax Identification Number (TIN) for non-US individuals, or a Passport
         * Number.
         */
        fun taxId(taxId: String) = taxId(JsonField.of(taxId))

        /**
         * Sets [Builder.taxId] to an arbitrary JSON value.
         *
         * You should usually call [Builder.taxId] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun taxId(taxId: JsonField<String>) = apply { this.taxId = taxId }

        /** Title at company */
        fun title(title: String) = title(JsonField.of(title))

        /**
         * Sets [Builder.title] to an arbitrary JSON value.
         *
         * You should usually call [Builder.title] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun title(title: JsonField<String>) = apply { this.title = title }

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
         * Returns an immutable instance of [UltimateBeneficialOwner].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .fullName()
         * .individualType()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): UltimateBeneficialOwner =
            UltimateBeneficialOwner(
                checkRequired("fullName", fullName),
                checkRequired("individualType", individualType),
                address,
                birthDate,
                emailAddress,
                nationality,
                percentageOwnership,
                phoneNumber,
                taxId,
                title,
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): UltimateBeneficialOwner = apply {
        if (validated) {
            return@apply
        }

        fullName()
        individualType().validate()
        address()?.validate()
        birthDate()
        emailAddress()
        nationality()
        percentageOwnership()
        phoneNumber()
        taxId()
        title()
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
        (if (fullName.asKnown() == null) 0 else 1) +
            (individualType.asKnown()?.validity() ?: 0) +
            (address.asKnown()?.validity() ?: 0) +
            (if (birthDate.asKnown() == null) 0 else 1) +
            (if (emailAddress.asKnown() == null) 0 else 1) +
            (if (nationality.asKnown() == null) 0 else 1) +
            (if (percentageOwnership.asKnown() == null) 0 else 1) +
            (if (phoneNumber.asKnown() == null) 0 else 1) +
            (if (taxId.asKnown() == null) 0 else 1) +
            (if (title.asKnown() == null) 0 else 1)

    /** Type of individual in the corporation */
    class IndividualType @JsonCreator private constructor(private val value: JsonField<String>) :
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

            val DIRECTOR = of("DIRECTOR")

            val CONTROL_PERSON = of("CONTROL_PERSON")

            val BUSINESS_POINT_OF_CONTACT = of("BUSINESS_POINT_OF_CONTACT")

            val TRUSTEE = of("TRUSTEE")

            val SETTLOR = of("SETTLOR")

            val GENERAL_PARTNER = of("GENERAL_PARTNER")

            fun of(value: String) = IndividualType(JsonField.of(value))
        }

        /** An enum containing [IndividualType]'s known values. */
        enum class Known {
            DIRECTOR,
            CONTROL_PERSON,
            BUSINESS_POINT_OF_CONTACT,
            TRUSTEE,
            SETTLOR,
            GENERAL_PARTNER,
        }

        /**
         * An enum containing [IndividualType]'s known values, as well as an [_UNKNOWN] member.
         *
         * An instance of [IndividualType] can contain an unknown value in a couple of cases:
         * - It was deserialized from data that doesn't match any known member. For example, if the
         *   SDK is on an older version than the API, then the API may respond with new members that
         *   the SDK is unaware of.
         * - It was constructed with an arbitrary value using the [of] method.
         */
        enum class Value {
            DIRECTOR,
            CONTROL_PERSON,
            BUSINESS_POINT_OF_CONTACT,
            TRUSTEE,
            SETTLOR,
            GENERAL_PARTNER,
            /**
             * An enum member indicating that [IndividualType] was instantiated with an unknown
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
                DIRECTOR -> Value.DIRECTOR
                CONTROL_PERSON -> Value.CONTROL_PERSON
                BUSINESS_POINT_OF_CONTACT -> Value.BUSINESS_POINT_OF_CONTACT
                TRUSTEE -> Value.TRUSTEE
                SETTLOR -> Value.SETTLOR
                GENERAL_PARTNER -> Value.GENERAL_PARTNER
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
                DIRECTOR -> Known.DIRECTOR
                CONTROL_PERSON -> Known.CONTROL_PERSON
                BUSINESS_POINT_OF_CONTACT -> Known.BUSINESS_POINT_OF_CONTACT
                TRUSTEE -> Known.TRUSTEE
                SETTLOR -> Known.SETTLOR
                GENERAL_PARTNER -> Known.GENERAL_PARTNER
                else -> throw GridInvalidDataException("Unknown IndividualType: $value")
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

        fun validate(): IndividualType = apply {
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

            return other is IndividualType && value == other.value
        }

        override fun hashCode() = value.hashCode()

        override fun toString() = value.toString()
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is UltimateBeneficialOwner &&
            fullName == other.fullName &&
            individualType == other.individualType &&
            address == other.address &&
            birthDate == other.birthDate &&
            emailAddress == other.emailAddress &&
            nationality == other.nationality &&
            percentageOwnership == other.percentageOwnership &&
            phoneNumber == other.phoneNumber &&
            taxId == other.taxId &&
            title == other.title &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(
            fullName,
            individualType,
            address,
            birthDate,
            emailAddress,
            nationality,
            percentageOwnership,
            phoneNumber,
            taxId,
            title,
            additionalProperties,
        )
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "UltimateBeneficialOwner{fullName=$fullName, individualType=$individualType, address=$address, birthDate=$birthDate, emailAddress=$emailAddress, nationality=$nationality, percentageOwnership=$percentageOwnership, phoneNumber=$phoneNumber, taxId=$taxId, title=$title, additionalProperties=$additionalProperties}"
}
