// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers

import com.fasterxml.jackson.annotation.JsonAnyGetter
import com.fasterxml.jackson.annotation.JsonAnySetter
import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.grid.api.core.ExcludeMissing
import com.grid.api.core.JsonField
import com.grid.api.core.JsonMissing
import com.grid.api.core.JsonValue
import com.grid.api.core.checkKnown
import com.grid.api.core.checkRequired
import com.grid.api.core.toImmutable
import com.grid.api.errors.GridInvalidDataException
import java.time.OffsetDateTime
import java.util.Collections
import java.util.Objects

class BusinessCustomer
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val customerType: JsonField<CustomerType>,
    private val platformCustomerId: JsonField<String>,
    private val umaAddress: JsonField<String>,
    private val id: JsonField<String>,
    private val createdAt: JsonField<OffsetDateTime>,
    private val isDeleted: JsonField<Boolean>,
    private val kycStatus: JsonField<Customer.KycStatus>,
    private val updatedAt: JsonField<OffsetDateTime>,
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
        @JsonProperty("platformCustomerId")
        @ExcludeMissing
        platformCustomerId: JsonField<String> = JsonMissing.of(),
        @JsonProperty("umaAddress")
        @ExcludeMissing
        umaAddress: JsonField<String> = JsonMissing.of(),
        @JsonProperty("id") @ExcludeMissing id: JsonField<String> = JsonMissing.of(),
        @JsonProperty("createdAt")
        @ExcludeMissing
        createdAt: JsonField<OffsetDateTime> = JsonMissing.of(),
        @JsonProperty("isDeleted") @ExcludeMissing isDeleted: JsonField<Boolean> = JsonMissing.of(),
        @JsonProperty("kycStatus")
        @ExcludeMissing
        kycStatus: JsonField<Customer.KycStatus> = JsonMissing.of(),
        @JsonProperty("updatedAt")
        @ExcludeMissing
        updatedAt: JsonField<OffsetDateTime> = JsonMissing.of(),
        @JsonProperty("address") @ExcludeMissing address: JsonField<Address> = JsonMissing.of(),
        @JsonProperty("beneficialOwners")
        @ExcludeMissing
        beneficialOwners: JsonField<List<UltimateBeneficialOwner>> = JsonMissing.of(),
        @JsonProperty("businessInfo")
        @ExcludeMissing
        businessInfo: JsonField<BusinessInfo> = JsonMissing.of(),
    ) : this(
        customerType,
        platformCustomerId,
        umaAddress,
        id,
        createdAt,
        isDeleted,
        kycStatus,
        updatedAt,
        address,
        beneficialOwners,
        businessInfo,
        mutableMapOf(),
    )

    fun toCustomer(): Customer =
        Customer.builder()
            .customerType(customerType)
            .platformCustomerId(platformCustomerId)
            .umaAddress(umaAddress)
            .id(id)
            .createdAt(createdAt)
            .isDeleted(isDeleted)
            .kycStatus(kycStatus)
            .updatedAt(updatedAt)
            .build()

    /**
     * Whether the customer is an individual or a business entity
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun customerType(): CustomerType = customerType.getRequired("customerType")

    /**
     * Platform-specific customer identifier
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun platformCustomerId(): String = platformCustomerId.getRequired("platformCustomerId")

    /**
     * Full UMA address (always present in responses, even if system-generated). This is an optional
     * identifier to route payments to the customer.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun umaAddress(): String = umaAddress.getRequired("umaAddress")

    /**
     * System-generated unique identifier
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun id(): String? = id.getNullable("id")

    /**
     * Creation timestamp
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun createdAt(): OffsetDateTime? = createdAt.getNullable("createdAt")

    /**
     * Whether the customer is marked as deleted
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun isDeleted(): Boolean? = isDeleted.getNullable("isDeleted")

    /**
     * The current KYC status of a customer
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun kycStatus(): Customer.KycStatus? = kycStatus.getNullable("kycStatus")

    /**
     * Last update timestamp
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun updatedAt(): OffsetDateTime? = updatedAt.getNullable("updatedAt")

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
     * Additional information required for business entities
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
     * Returns the raw JSON value of [platformCustomerId].
     *
     * Unlike [platformCustomerId], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    @JsonProperty("platformCustomerId")
    @ExcludeMissing
    fun _platformCustomerId(): JsonField<String> = platformCustomerId

    /**
     * Returns the raw JSON value of [umaAddress].
     *
     * Unlike [umaAddress], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("umaAddress") @ExcludeMissing fun _umaAddress(): JsonField<String> = umaAddress

    /**
     * Returns the raw JSON value of [id].
     *
     * Unlike [id], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("id") @ExcludeMissing fun _id(): JsonField<String> = id

    /**
     * Returns the raw JSON value of [createdAt].
     *
     * Unlike [createdAt], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("createdAt")
    @ExcludeMissing
    fun _createdAt(): JsonField<OffsetDateTime> = createdAt

    /**
     * Returns the raw JSON value of [isDeleted].
     *
     * Unlike [isDeleted], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("isDeleted") @ExcludeMissing fun _isDeleted(): JsonField<Boolean> = isDeleted

    /**
     * Returns the raw JSON value of [kycStatus].
     *
     * Unlike [kycStatus], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("kycStatus")
    @ExcludeMissing
    fun _kycStatus(): JsonField<Customer.KycStatus> = kycStatus

    /**
     * Returns the raw JSON value of [updatedAt].
     *
     * Unlike [updatedAt], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("updatedAt")
    @ExcludeMissing
    fun _updatedAt(): JsonField<OffsetDateTime> = updatedAt

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
         * Returns a mutable builder for constructing an instance of [BusinessCustomer].
         *
         * The following fields are required:
         * ```kotlin
         * .customerType()
         * .platformCustomerId()
         * .umaAddress()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [BusinessCustomer]. */
    class Builder internal constructor() {

        private var customerType: JsonField<CustomerType>? = null
        private var platformCustomerId: JsonField<String>? = null
        private var umaAddress: JsonField<String>? = null
        private var id: JsonField<String> = JsonMissing.of()
        private var createdAt: JsonField<OffsetDateTime> = JsonMissing.of()
        private var isDeleted: JsonField<Boolean> = JsonMissing.of()
        private var kycStatus: JsonField<Customer.KycStatus> = JsonMissing.of()
        private var updatedAt: JsonField<OffsetDateTime> = JsonMissing.of()
        private var address: JsonField<Address> = JsonMissing.of()
        private var beneficialOwners: JsonField<MutableList<UltimateBeneficialOwner>>? = null
        private var businessInfo: JsonField<BusinessInfo> = JsonMissing.of()
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(businessCustomer: BusinessCustomer) = apply {
            customerType = businessCustomer.customerType
            platformCustomerId = businessCustomer.platformCustomerId
            umaAddress = businessCustomer.umaAddress
            id = businessCustomer.id
            createdAt = businessCustomer.createdAt
            isDeleted = businessCustomer.isDeleted
            kycStatus = businessCustomer.kycStatus
            updatedAt = businessCustomer.updatedAt
            address = businessCustomer.address
            beneficialOwners = businessCustomer.beneficialOwners.map { it.toMutableList() }
            businessInfo = businessCustomer.businessInfo
            additionalProperties = businessCustomer.additionalProperties.toMutableMap()
        }

        /** Whether the customer is an individual or a business entity */
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

        /** Platform-specific customer identifier */
        fun platformCustomerId(platformCustomerId: String) =
            platformCustomerId(JsonField.of(platformCustomerId))

        /**
         * Sets [Builder.platformCustomerId] to an arbitrary JSON value.
         *
         * You should usually call [Builder.platformCustomerId] with a well-typed [String] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun platformCustomerId(platformCustomerId: JsonField<String>) = apply {
            this.platformCustomerId = platformCustomerId
        }

        /**
         * Full UMA address (always present in responses, even if system-generated). This is an
         * optional identifier to route payments to the customer.
         */
        fun umaAddress(umaAddress: String) = umaAddress(JsonField.of(umaAddress))

        /**
         * Sets [Builder.umaAddress] to an arbitrary JSON value.
         *
         * You should usually call [Builder.umaAddress] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun umaAddress(umaAddress: JsonField<String>) = apply { this.umaAddress = umaAddress }

        /** System-generated unique identifier */
        fun id(id: String) = id(JsonField.of(id))

        /**
         * Sets [Builder.id] to an arbitrary JSON value.
         *
         * You should usually call [Builder.id] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun id(id: JsonField<String>) = apply { this.id = id }

        /** Creation timestamp */
        fun createdAt(createdAt: OffsetDateTime) = createdAt(JsonField.of(createdAt))

        /**
         * Sets [Builder.createdAt] to an arbitrary JSON value.
         *
         * You should usually call [Builder.createdAt] with a well-typed [OffsetDateTime] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun createdAt(createdAt: JsonField<OffsetDateTime>) = apply { this.createdAt = createdAt }

        /** Whether the customer is marked as deleted */
        fun isDeleted(isDeleted: Boolean) = isDeleted(JsonField.of(isDeleted))

        /**
         * Sets [Builder.isDeleted] to an arbitrary JSON value.
         *
         * You should usually call [Builder.isDeleted] with a well-typed [Boolean] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun isDeleted(isDeleted: JsonField<Boolean>) = apply { this.isDeleted = isDeleted }

        /** The current KYC status of a customer */
        fun kycStatus(kycStatus: Customer.KycStatus) = kycStatus(JsonField.of(kycStatus))

        /**
         * Sets [Builder.kycStatus] to an arbitrary JSON value.
         *
         * You should usually call [Builder.kycStatus] with a well-typed [Customer.KycStatus] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun kycStatus(kycStatus: JsonField<Customer.KycStatus>) = apply {
            this.kycStatus = kycStatus
        }

        /** Last update timestamp */
        fun updatedAt(updatedAt: OffsetDateTime) = updatedAt(JsonField.of(updatedAt))

        /**
         * Sets [Builder.updatedAt] to an arbitrary JSON value.
         *
         * You should usually call [Builder.updatedAt] with a well-typed [OffsetDateTime] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun updatedAt(updatedAt: JsonField<OffsetDateTime>) = apply { this.updatedAt = updatedAt }

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

        /** Additional information required for business entities */
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
         * Returns an immutable instance of [BusinessCustomer].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .customerType()
         * .platformCustomerId()
         * .umaAddress()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): BusinessCustomer =
            BusinessCustomer(
                checkRequired("customerType", customerType),
                checkRequired("platformCustomerId", platformCustomerId),
                checkRequired("umaAddress", umaAddress),
                id,
                createdAt,
                isDeleted,
                kycStatus,
                updatedAt,
                address,
                (beneficialOwners ?: JsonMissing.of()).map { it.toImmutable() },
                businessInfo,
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): BusinessCustomer = apply {
        if (validated) {
            return@apply
        }

        customerType().validate()
        platformCustomerId()
        umaAddress()
        id()
        createdAt()
        isDeleted()
        kycStatus()?.validate()
        updatedAt()
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
            (if (platformCustomerId.asKnown() == null) 0 else 1) +
            (if (umaAddress.asKnown() == null) 0 else 1) +
            (if (id.asKnown() == null) 0 else 1) +
            (if (createdAt.asKnown() == null) 0 else 1) +
            (if (isDeleted.asKnown() == null) 0 else 1) +
            (kycStatus.asKnown()?.validity() ?: 0) +
            (if (updatedAt.asKnown() == null) 0 else 1) +
            (address.asKnown()?.validity() ?: 0) +
            (beneficialOwners.asKnown()?.sumOf { it.validity().toInt() } ?: 0) +
            (businessInfo.asKnown()?.validity() ?: 0)

    /** Additional information required for business entities */
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
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun legalName(): String = legalName.getRequired("legalName")

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

            /**
             * Returns a mutable builder for constructing an instance of [BusinessInfo].
             *
             * The following fields are required:
             * ```kotlin
             * .legalName()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [BusinessInfo]. */
        class Builder internal constructor() {

            private var legalName: JsonField<String>? = null
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
             *
             * The following fields are required:
             * ```kotlin
             * .legalName()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): BusinessInfo =
                BusinessInfo(
                    checkRequired("legalName", legalName),
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

        return other is BusinessCustomer &&
            customerType == other.customerType &&
            platformCustomerId == other.platformCustomerId &&
            umaAddress == other.umaAddress &&
            id == other.id &&
            createdAt == other.createdAt &&
            isDeleted == other.isDeleted &&
            kycStatus == other.kycStatus &&
            updatedAt == other.updatedAt &&
            address == other.address &&
            beneficialOwners == other.beneficialOwners &&
            businessInfo == other.businessInfo &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(
            customerType,
            platformCustomerId,
            umaAddress,
            id,
            createdAt,
            isDeleted,
            kycStatus,
            updatedAt,
            address,
            beneficialOwners,
            businessInfo,
            additionalProperties,
        )
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "BusinessCustomer{customerType=$customerType, platformCustomerId=$platformCustomerId, umaAddress=$umaAddress, id=$id, createdAt=$createdAt, isDeleted=$isDeleted, kycStatus=$kycStatus, updatedAt=$updatedAt, address=$address, beneficialOwners=$beneficialOwners, businessInfo=$businessInfo, additionalProperties=$additionalProperties}"
}
