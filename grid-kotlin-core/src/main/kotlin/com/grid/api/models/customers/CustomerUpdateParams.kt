// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers

import com.fasterxml.jackson.annotation.JsonAnyGetter
import com.fasterxml.jackson.annotation.JsonAnySetter
import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.core.ObjectCodec
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.SerializerProvider
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.fasterxml.jackson.databind.annotation.JsonSerialize
import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.BaseDeserializer
import com.grid.api.core.BaseSerializer
import com.grid.api.core.ExcludeMissing
import com.grid.api.core.JsonField
import com.grid.api.core.JsonMissing
import com.grid.api.core.JsonValue
import com.grid.api.core.Params
import com.grid.api.core.allMaxBy
import com.grid.api.core.checkKnown
import com.grid.api.core.checkRequired
import com.grid.api.core.getOrThrow
import com.grid.api.core.http.Headers
import com.grid.api.core.http.QueryParams
import com.grid.api.core.toImmutable
import com.grid.api.errors.GridInvalidDataException
import java.time.LocalDate
import java.util.Collections
import java.util.Objects

/** Update a customer's metadata by their system-generated ID */
class CustomerUpdateParams
private constructor(
    private val customerId: String?,
    private val updateCustomerRequest: UpdateCustomerRequest,
    private val additionalHeaders: Headers,
    private val additionalQueryParams: QueryParams,
) : Params {

    fun customerId(): String? = customerId

    fun updateCustomerRequest(): UpdateCustomerRequest = updateCustomerRequest

    /** Additional headers to send with the request. */
    fun _additionalHeaders(): Headers = additionalHeaders

    /** Additional query param to send with the request. */
    fun _additionalQueryParams(): QueryParams = additionalQueryParams

    fun toBuilder() = Builder().from(this)

    companion object {

        /**
         * Returns a mutable builder for constructing an instance of [CustomerUpdateParams].
         *
         * The following fields are required:
         * ```kotlin
         * .updateCustomerRequest()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [CustomerUpdateParams]. */
    class Builder internal constructor() {

        private var customerId: String? = null
        private var updateCustomerRequest: UpdateCustomerRequest? = null
        private var additionalHeaders: Headers.Builder = Headers.builder()
        private var additionalQueryParams: QueryParams.Builder = QueryParams.builder()

        internal fun from(customerUpdateParams: CustomerUpdateParams) = apply {
            customerId = customerUpdateParams.customerId
            updateCustomerRequest = customerUpdateParams.updateCustomerRequest
            additionalHeaders = customerUpdateParams.additionalHeaders.toBuilder()
            additionalQueryParams = customerUpdateParams.additionalQueryParams.toBuilder()
        }

        fun customerId(customerId: String?) = apply { this.customerId = customerId }

        fun updateCustomerRequest(updateCustomerRequest: UpdateCustomerRequest) = apply {
            this.updateCustomerRequest = updateCustomerRequest
        }

        /**
         * Alias for calling [updateCustomerRequest] with
         * `UpdateCustomerRequest.ofIndividualCustomerUpdate(individualCustomerUpdate)`.
         */
        fun updateCustomerRequest(
            individualCustomerUpdate: UpdateCustomerRequest.IndividualCustomerUpdateRequest
        ) =
            updateCustomerRequest(
                UpdateCustomerRequest.ofIndividualCustomerUpdate(individualCustomerUpdate)
            )

        /**
         * Alias for calling [updateCustomerRequest] with
         * `UpdateCustomerRequest.ofBusinessCustomerUpdate(businessCustomerUpdate)`.
         */
        fun updateCustomerRequest(
            businessCustomerUpdate: UpdateCustomerRequest.BusinessCustomerUpdateRequest
        ) =
            updateCustomerRequest(
                UpdateCustomerRequest.ofBusinessCustomerUpdate(businessCustomerUpdate)
            )

        fun additionalHeaders(additionalHeaders: Headers) = apply {
            this.additionalHeaders.clear()
            putAllAdditionalHeaders(additionalHeaders)
        }

        fun additionalHeaders(additionalHeaders: Map<String, Iterable<String>>) = apply {
            this.additionalHeaders.clear()
            putAllAdditionalHeaders(additionalHeaders)
        }

        fun putAdditionalHeader(name: String, value: String) = apply {
            additionalHeaders.put(name, value)
        }

        fun putAdditionalHeaders(name: String, values: Iterable<String>) = apply {
            additionalHeaders.put(name, values)
        }

        fun putAllAdditionalHeaders(additionalHeaders: Headers) = apply {
            this.additionalHeaders.putAll(additionalHeaders)
        }

        fun putAllAdditionalHeaders(additionalHeaders: Map<String, Iterable<String>>) = apply {
            this.additionalHeaders.putAll(additionalHeaders)
        }

        fun replaceAdditionalHeaders(name: String, value: String) = apply {
            additionalHeaders.replace(name, value)
        }

        fun replaceAdditionalHeaders(name: String, values: Iterable<String>) = apply {
            additionalHeaders.replace(name, values)
        }

        fun replaceAllAdditionalHeaders(additionalHeaders: Headers) = apply {
            this.additionalHeaders.replaceAll(additionalHeaders)
        }

        fun replaceAllAdditionalHeaders(additionalHeaders: Map<String, Iterable<String>>) = apply {
            this.additionalHeaders.replaceAll(additionalHeaders)
        }

        fun removeAdditionalHeaders(name: String) = apply { additionalHeaders.remove(name) }

        fun removeAllAdditionalHeaders(names: Set<String>) = apply {
            additionalHeaders.removeAll(names)
        }

        fun additionalQueryParams(additionalQueryParams: QueryParams) = apply {
            this.additionalQueryParams.clear()
            putAllAdditionalQueryParams(additionalQueryParams)
        }

        fun additionalQueryParams(additionalQueryParams: Map<String, Iterable<String>>) = apply {
            this.additionalQueryParams.clear()
            putAllAdditionalQueryParams(additionalQueryParams)
        }

        fun putAdditionalQueryParam(key: String, value: String) = apply {
            additionalQueryParams.put(key, value)
        }

        fun putAdditionalQueryParams(key: String, values: Iterable<String>) = apply {
            additionalQueryParams.put(key, values)
        }

        fun putAllAdditionalQueryParams(additionalQueryParams: QueryParams) = apply {
            this.additionalQueryParams.putAll(additionalQueryParams)
        }

        fun putAllAdditionalQueryParams(additionalQueryParams: Map<String, Iterable<String>>) =
            apply {
                this.additionalQueryParams.putAll(additionalQueryParams)
            }

        fun replaceAdditionalQueryParams(key: String, value: String) = apply {
            additionalQueryParams.replace(key, value)
        }

        fun replaceAdditionalQueryParams(key: String, values: Iterable<String>) = apply {
            additionalQueryParams.replace(key, values)
        }

        fun replaceAllAdditionalQueryParams(additionalQueryParams: QueryParams) = apply {
            this.additionalQueryParams.replaceAll(additionalQueryParams)
        }

        fun replaceAllAdditionalQueryParams(additionalQueryParams: Map<String, Iterable<String>>) =
            apply {
                this.additionalQueryParams.replaceAll(additionalQueryParams)
            }

        fun removeAdditionalQueryParams(key: String) = apply { additionalQueryParams.remove(key) }

        fun removeAllAdditionalQueryParams(keys: Set<String>) = apply {
            additionalQueryParams.removeAll(keys)
        }

        /**
         * Returns an immutable instance of [CustomerUpdateParams].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .updateCustomerRequest()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): CustomerUpdateParams =
            CustomerUpdateParams(
                customerId,
                checkRequired("updateCustomerRequest", updateCustomerRequest),
                additionalHeaders.build(),
                additionalQueryParams.build(),
            )
    }

    fun _body(): UpdateCustomerRequest = updateCustomerRequest

    fun _pathParam(index: Int): String =
        when (index) {
            0 -> customerId ?: ""
            else -> ""
        }

    override fun _headers(): Headers = additionalHeaders

    override fun _queryParams(): QueryParams = additionalQueryParams

    @JsonDeserialize(using = UpdateCustomerRequest.Deserializer::class)
    @JsonSerialize(using = UpdateCustomerRequest.Serializer::class)
    class UpdateCustomerRequest
    private constructor(
        private val individualCustomerUpdate: IndividualCustomerUpdateRequest? = null,
        private val businessCustomerUpdate: BusinessCustomerUpdateRequest? = null,
        private val _json: JsonValue? = null,
    ) {

        fun individualCustomerUpdate(): IndividualCustomerUpdateRequest? = individualCustomerUpdate

        fun businessCustomerUpdate(): BusinessCustomerUpdateRequest? = businessCustomerUpdate

        fun isIndividualCustomerUpdate(): Boolean = individualCustomerUpdate != null

        fun isBusinessCustomerUpdate(): Boolean = businessCustomerUpdate != null

        fun asIndividualCustomerUpdate(): IndividualCustomerUpdateRequest =
            individualCustomerUpdate.getOrThrow("individualCustomerUpdate")

        fun asBusinessCustomerUpdate(): BusinessCustomerUpdateRequest =
            businessCustomerUpdate.getOrThrow("businessCustomerUpdate")

        fun _json(): JsonValue? = _json

        fun <T> accept(visitor: Visitor<T>): T =
            when {
                individualCustomerUpdate != null ->
                    visitor.visitIndividualCustomerUpdate(individualCustomerUpdate)
                businessCustomerUpdate != null ->
                    visitor.visitBusinessCustomerUpdate(businessCustomerUpdate)
                else -> visitor.unknown(_json)
            }

        private var validated: Boolean = false

        fun validate(): UpdateCustomerRequest = apply {
            if (validated) {
                return@apply
            }

            accept(
                object : Visitor<Unit> {
                    override fun visitIndividualCustomerUpdate(
                        individualCustomerUpdate: IndividualCustomerUpdateRequest
                    ) {
                        individualCustomerUpdate.validate()
                    }

                    override fun visitBusinessCustomerUpdate(
                        businessCustomerUpdate: BusinessCustomerUpdateRequest
                    ) {
                        businessCustomerUpdate.validate()
                    }
                }
            )
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
            accept(
                object : Visitor<Int> {
                    override fun visitIndividualCustomerUpdate(
                        individualCustomerUpdate: IndividualCustomerUpdateRequest
                    ) = individualCustomerUpdate.validity()

                    override fun visitBusinessCustomerUpdate(
                        businessCustomerUpdate: BusinessCustomerUpdateRequest
                    ) = businessCustomerUpdate.validity()

                    override fun unknown(json: JsonValue?) = 0
                }
            )

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is UpdateCustomerRequest &&
                individualCustomerUpdate == other.individualCustomerUpdate &&
                businessCustomerUpdate == other.businessCustomerUpdate
        }

        override fun hashCode(): Int =
            Objects.hash(individualCustomerUpdate, businessCustomerUpdate)

        override fun toString(): String =
            when {
                individualCustomerUpdate != null ->
                    "UpdateCustomerRequest{individualCustomerUpdate=$individualCustomerUpdate}"
                businessCustomerUpdate != null ->
                    "UpdateCustomerRequest{businessCustomerUpdate=$businessCustomerUpdate}"
                _json != null -> "UpdateCustomerRequest{_unknown=$_json}"
                else -> throw IllegalStateException("Invalid UpdateCustomerRequest")
            }

        companion object {

            fun ofIndividualCustomerUpdate(
                individualCustomerUpdate: IndividualCustomerUpdateRequest
            ) = UpdateCustomerRequest(individualCustomerUpdate = individualCustomerUpdate)

            fun ofBusinessCustomerUpdate(businessCustomerUpdate: BusinessCustomerUpdateRequest) =
                UpdateCustomerRequest(businessCustomerUpdate = businessCustomerUpdate)
        }

        /**
         * An interface that defines how to map each variant of [UpdateCustomerRequest] to a value
         * of type [T].
         */
        interface Visitor<out T> {

            fun visitIndividualCustomerUpdate(
                individualCustomerUpdate: IndividualCustomerUpdateRequest
            ): T

            fun visitBusinessCustomerUpdate(
                businessCustomerUpdate: BusinessCustomerUpdateRequest
            ): T

            /**
             * Maps an unknown variant of [UpdateCustomerRequest] to a value of type [T].
             *
             * An instance of [UpdateCustomerRequest] can contain an unknown variant if it was
             * deserialized from data that doesn't match any known variant. For example, if the SDK
             * is on an older version than the API, then the API may respond with new variants that
             * the SDK is unaware of.
             *
             * @throws GridInvalidDataException in the default implementation.
             */
            fun unknown(json: JsonValue?): T {
                throw GridInvalidDataException("Unknown UpdateCustomerRequest: $json")
            }
        }

        internal class Deserializer :
            BaseDeserializer<UpdateCustomerRequest>(UpdateCustomerRequest::class) {

            override fun ObjectCodec.deserialize(node: JsonNode): UpdateCustomerRequest {
                val json = JsonValue.fromJsonNode(node)

                val bestMatches =
                    sequenceOf(
                            tryDeserialize(node, jacksonTypeRef<IndividualCustomerUpdateRequest>())
                                ?.let {
                                    UpdateCustomerRequest(
                                        individualCustomerUpdate = it,
                                        _json = json,
                                    )
                                },
                            tryDeserialize(node, jacksonTypeRef<BusinessCustomerUpdateRequest>())
                                ?.let {
                                    UpdateCustomerRequest(businessCustomerUpdate = it, _json = json)
                                },
                        )
                        .filterNotNull()
                        .allMaxBy { it.validity() }
                        .toList()
                return when (bestMatches.size) {
                    // This can happen if what we're deserializing is completely incompatible with
                    // all the possible variants (e.g. deserializing from boolean).
                    0 -> UpdateCustomerRequest(_json = json)
                    1 -> bestMatches.single()
                    // If there's more than one match with the highest validity, then use the first
                    // completely valid match, or simply the first match if none are completely
                    // valid.
                    else -> bestMatches.firstOrNull { it.isValid() } ?: bestMatches.first()
                }
            }
        }

        internal class Serializer :
            BaseSerializer<UpdateCustomerRequest>(UpdateCustomerRequest::class) {

            override fun serialize(
                value: UpdateCustomerRequest,
                generator: JsonGenerator,
                provider: SerializerProvider,
            ) {
                when {
                    value.individualCustomerUpdate != null ->
                        generator.writeObject(value.individualCustomerUpdate)
                    value.businessCustomerUpdate != null ->
                        generator.writeObject(value.businessCustomerUpdate)
                    value._json != null -> generator.writeObject(value._json)
                    else -> throw IllegalStateException("Invalid UpdateCustomerRequest")
                }
            }
        }

        class IndividualCustomerUpdateRequest
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val customerType: JsonField<CustomerType>,
            private val umaAddress: JsonField<String>,
            private val address: JsonField<Address>,
            private val birthDate: JsonField<LocalDate>,
            private val fullName: JsonField<String>,
            private val nationality: JsonField<String>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("customerType")
                @ExcludeMissing
                customerType: JsonField<CustomerType> = JsonMissing.of(),
                @JsonProperty("umaAddress")
                @ExcludeMissing
                umaAddress: JsonField<String> = JsonMissing.of(),
                @JsonProperty("address")
                @ExcludeMissing
                address: JsonField<Address> = JsonMissing.of(),
                @JsonProperty("birthDate")
                @ExcludeMissing
                birthDate: JsonField<LocalDate> = JsonMissing.of(),
                @JsonProperty("fullName")
                @ExcludeMissing
                fullName: JsonField<String> = JsonMissing.of(),
                @JsonProperty("nationality")
                @ExcludeMissing
                nationality: JsonField<String> = JsonMissing.of(),
            ) : this(
                customerType,
                umaAddress,
                address,
                birthDate,
                fullName,
                nationality,
                mutableMapOf(),
            )

            fun toCustomerUpdate(): CustomerUpdate =
                CustomerUpdate.builder().customerType(customerType).umaAddress(umaAddress).build()

            fun toIndividualCustomerFields(): IndividualCustomerFields =
                IndividualCustomerFields.builder()
                    .customerType(customerType)
                    .address(address)
                    .birthDate(birthDate)
                    .fullName(fullName)
                    .nationality(nationality)
                    .build()

            /**
             * Whether the customer is an individual or a business entity
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun customerType(): CustomerType = customerType.getRequired("customerType")

            /**
             * Optional UMA address identifier. If provided, the customer's UMA address will be
             * updated. This is an optional identifier to route payments to the customer.
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun umaAddress(): String? = umaAddress.getNullable("umaAddress")

            /**
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun address(): Address? = address.getNullable("address")

            /**
             * Date of birth in ISO 8601 format (YYYY-MM-DD)
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun birthDate(): LocalDate? = birthDate.getNullable("birthDate")

            /**
             * Individual's full name
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun fullName(): String? = fullName.getNullable("fullName")

            /**
             * Country code (ISO 3166-1 alpha-2)
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun nationality(): String? = nationality.getNullable("nationality")

            /**
             * Returns the raw JSON value of [customerType].
             *
             * Unlike [customerType], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("customerType")
            @ExcludeMissing
            fun _customerType(): JsonField<CustomerType> = customerType

            /**
             * Returns the raw JSON value of [umaAddress].
             *
             * Unlike [umaAddress], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("umaAddress")
            @ExcludeMissing
            fun _umaAddress(): JsonField<String> = umaAddress

            /**
             * Returns the raw JSON value of [address].
             *
             * Unlike [address], this method doesn't throw if the JSON field has an unexpected type.
             */
            @JsonProperty("address") @ExcludeMissing fun _address(): JsonField<Address> = address

            /**
             * Returns the raw JSON value of [birthDate].
             *
             * Unlike [birthDate], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("birthDate")
            @ExcludeMissing
            fun _birthDate(): JsonField<LocalDate> = birthDate

            /**
             * Returns the raw JSON value of [fullName].
             *
             * Unlike [fullName], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("fullName") @ExcludeMissing fun _fullName(): JsonField<String> = fullName

            /**
             * Returns the raw JSON value of [nationality].
             *
             * Unlike [nationality], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("nationality")
            @ExcludeMissing
            fun _nationality(): JsonField<String> = nationality

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
                 * Returns a mutable builder for constructing an instance of
                 * [IndividualCustomerUpdateRequest].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .customerType()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [IndividualCustomerUpdateRequest]. */
            class Builder internal constructor() {

                private var customerType: JsonField<CustomerType>? = null
                private var umaAddress: JsonField<String> = JsonMissing.of()
                private var address: JsonField<Address> = JsonMissing.of()
                private var birthDate: JsonField<LocalDate> = JsonMissing.of()
                private var fullName: JsonField<String> = JsonMissing.of()
                private var nationality: JsonField<String> = JsonMissing.of()
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(
                    individualCustomerUpdateRequest: IndividualCustomerUpdateRequest
                ) = apply {
                    customerType = individualCustomerUpdateRequest.customerType
                    umaAddress = individualCustomerUpdateRequest.umaAddress
                    address = individualCustomerUpdateRequest.address
                    birthDate = individualCustomerUpdateRequest.birthDate
                    fullName = individualCustomerUpdateRequest.fullName
                    nationality = individualCustomerUpdateRequest.nationality
                    additionalProperties =
                        individualCustomerUpdateRequest.additionalProperties.toMutableMap()
                }

                /** Whether the customer is an individual or a business entity */
                fun customerType(customerType: CustomerType) =
                    customerType(JsonField.of(customerType))

                /**
                 * Sets [Builder.customerType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.customerType] with a well-typed [CustomerType]
                 * value instead. This method is primarily for setting the field to an undocumented
                 * or not yet supported value.
                 */
                fun customerType(customerType: JsonField<CustomerType>) = apply {
                    this.customerType = customerType
                }

                /**
                 * Optional UMA address identifier. If provided, the customer's UMA address will be
                 * updated. This is an optional identifier to route payments to the customer.
                 */
                fun umaAddress(umaAddress: String) = umaAddress(JsonField.of(umaAddress))

                /**
                 * Sets [Builder.umaAddress] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.umaAddress] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun umaAddress(umaAddress: JsonField<String>) = apply {
                    this.umaAddress = umaAddress
                }

                fun address(address: Address) = address(JsonField.of(address))

                /**
                 * Sets [Builder.address] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.address] with a well-typed [Address] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun address(address: JsonField<Address>) = apply { this.address = address }

                /** Date of birth in ISO 8601 format (YYYY-MM-DD) */
                fun birthDate(birthDate: LocalDate) = birthDate(JsonField.of(birthDate))

                /**
                 * Sets [Builder.birthDate] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.birthDate] with a well-typed [LocalDate] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun birthDate(birthDate: JsonField<LocalDate>) = apply {
                    this.birthDate = birthDate
                }

                /** Individual's full name */
                fun fullName(fullName: String) = fullName(JsonField.of(fullName))

                /**
                 * Sets [Builder.fullName] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.fullName] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun fullName(fullName: JsonField<String>) = apply { this.fullName = fullName }

                /** Country code (ISO 3166-1 alpha-2) */
                fun nationality(nationality: String) = nationality(JsonField.of(nationality))

                /**
                 * Sets [Builder.nationality] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.nationality] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun nationality(nationality: JsonField<String>) = apply {
                    this.nationality = nationality
                }

                fun additionalProperties(additionalProperties: Map<String, JsonValue>) = apply {
                    this.additionalProperties.clear()
                    putAllAdditionalProperties(additionalProperties)
                }

                fun putAdditionalProperty(key: String, value: JsonValue) = apply {
                    additionalProperties.put(key, value)
                }

                fun putAllAdditionalProperties(additionalProperties: Map<String, JsonValue>) =
                    apply {
                        this.additionalProperties.putAll(additionalProperties)
                    }

                fun removeAdditionalProperty(key: String) = apply {
                    additionalProperties.remove(key)
                }

                fun removeAllAdditionalProperties(keys: Set<String>) = apply {
                    keys.forEach(::removeAdditionalProperty)
                }

                /**
                 * Returns an immutable instance of [IndividualCustomerUpdateRequest].
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
                fun build(): IndividualCustomerUpdateRequest =
                    IndividualCustomerUpdateRequest(
                        checkRequired("customerType", customerType),
                        umaAddress,
                        address,
                        birthDate,
                        fullName,
                        nationality,
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): IndividualCustomerUpdateRequest = apply {
                if (validated) {
                    return@apply
                }

                customerType().validate()
                umaAddress()
                address()?.validate()
                birthDate()
                fullName()
                nationality()
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
                (customerType.asKnown()?.validity() ?: 0) +
                    (if (umaAddress.asKnown() == null) 0 else 1) +
                    (address.asKnown()?.validity() ?: 0) +
                    (if (birthDate.asKnown() == null) 0 else 1) +
                    (if (fullName.asKnown() == null) 0 else 1) +
                    (if (nationality.asKnown() == null) 0 else 1)

            override fun equals(other: Any?): Boolean {
                if (this === other) {
                    return true
                }

                return other is IndividualCustomerUpdateRequest &&
                    customerType == other.customerType &&
                    umaAddress == other.umaAddress &&
                    address == other.address &&
                    birthDate == other.birthDate &&
                    fullName == other.fullName &&
                    nationality == other.nationality &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(
                    customerType,
                    umaAddress,
                    address,
                    birthDate,
                    fullName,
                    nationality,
                    additionalProperties,
                )
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "IndividualCustomerUpdateRequest{customerType=$customerType, umaAddress=$umaAddress, address=$address, birthDate=$birthDate, fullName=$fullName, nationality=$nationality, additionalProperties=$additionalProperties}"
        }

        class BusinessCustomerUpdateRequest
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val customerType: JsonField<CustomerType>,
            private val umaAddress: JsonField<String>,
            private val address: JsonField<Address>,
            private val beneficialOwners: JsonField<List<UltimateBeneficialOwner>>,
            private val businessInfo: JsonField<BusinessCustomerFields.BusinessInfo>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("customerType")
                @ExcludeMissing
                customerType: JsonField<CustomerType> = JsonMissing.of(),
                @JsonProperty("umaAddress")
                @ExcludeMissing
                umaAddress: JsonField<String> = JsonMissing.of(),
                @JsonProperty("address")
                @ExcludeMissing
                address: JsonField<Address> = JsonMissing.of(),
                @JsonProperty("beneficialOwners")
                @ExcludeMissing
                beneficialOwners: JsonField<List<UltimateBeneficialOwner>> = JsonMissing.of(),
                @JsonProperty("businessInfo")
                @ExcludeMissing
                businessInfo: JsonField<BusinessCustomerFields.BusinessInfo> = JsonMissing.of(),
            ) : this(
                customerType,
                umaAddress,
                address,
                beneficialOwners,
                businessInfo,
                mutableMapOf(),
            )

            fun toCustomerUpdate(): CustomerUpdate =
                CustomerUpdate.builder().customerType(customerType).umaAddress(umaAddress).build()

            fun toBusinessCustomerFields(): BusinessCustomerFields =
                BusinessCustomerFields.builder()
                    .customerType(customerType)
                    .address(address)
                    .beneficialOwners(beneficialOwners)
                    .businessInfo(businessInfo)
                    .build()

            /**
             * Whether the customer is an individual or a business entity
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun customerType(): CustomerType = customerType.getRequired("customerType")

            /**
             * Optional UMA address identifier. If provided, the customer's UMA address will be
             * updated. This is an optional identifier to route payments to the customer.
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun umaAddress(): String? = umaAddress.getNullable("umaAddress")

            /**
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun address(): Address? = address.getNullable("address")

            /**
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun beneficialOwners(): List<UltimateBeneficialOwner>? =
                beneficialOwners.getNullable("beneficialOwners")

            /**
             * Additional information for business entities
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun businessInfo(): BusinessCustomerFields.BusinessInfo? =
                businessInfo.getNullable("businessInfo")

            /**
             * Returns the raw JSON value of [customerType].
             *
             * Unlike [customerType], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("customerType")
            @ExcludeMissing
            fun _customerType(): JsonField<CustomerType> = customerType

            /**
             * Returns the raw JSON value of [umaAddress].
             *
             * Unlike [umaAddress], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("umaAddress")
            @ExcludeMissing
            fun _umaAddress(): JsonField<String> = umaAddress

            /**
             * Returns the raw JSON value of [address].
             *
             * Unlike [address], this method doesn't throw if the JSON field has an unexpected type.
             */
            @JsonProperty("address") @ExcludeMissing fun _address(): JsonField<Address> = address

            /**
             * Returns the raw JSON value of [beneficialOwners].
             *
             * Unlike [beneficialOwners], this method doesn't throw if the JSON field has an
             * unexpected type.
             */
            @JsonProperty("beneficialOwners")
            @ExcludeMissing
            fun _beneficialOwners(): JsonField<List<UltimateBeneficialOwner>> = beneficialOwners

            /**
             * Returns the raw JSON value of [businessInfo].
             *
             * Unlike [businessInfo], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("businessInfo")
            @ExcludeMissing
            fun _businessInfo(): JsonField<BusinessCustomerFields.BusinessInfo> = businessInfo

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
                 * Returns a mutable builder for constructing an instance of
                 * [BusinessCustomerUpdateRequest].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .customerType()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [BusinessCustomerUpdateRequest]. */
            class Builder internal constructor() {

                private var customerType: JsonField<CustomerType>? = null
                private var umaAddress: JsonField<String> = JsonMissing.of()
                private var address: JsonField<Address> = JsonMissing.of()
                private var beneficialOwners: JsonField<MutableList<UltimateBeneficialOwner>>? =
                    null
                private var businessInfo: JsonField<BusinessCustomerFields.BusinessInfo> =
                    JsonMissing.of()
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(businessCustomerUpdateRequest: BusinessCustomerUpdateRequest) =
                    apply {
                        customerType = businessCustomerUpdateRequest.customerType
                        umaAddress = businessCustomerUpdateRequest.umaAddress
                        address = businessCustomerUpdateRequest.address
                        beneficialOwners =
                            businessCustomerUpdateRequest.beneficialOwners.map {
                                it.toMutableList()
                            }
                        businessInfo = businessCustomerUpdateRequest.businessInfo
                        additionalProperties =
                            businessCustomerUpdateRequest.additionalProperties.toMutableMap()
                    }

                /** Whether the customer is an individual or a business entity */
                fun customerType(customerType: CustomerType) =
                    customerType(JsonField.of(customerType))

                /**
                 * Sets [Builder.customerType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.customerType] with a well-typed [CustomerType]
                 * value instead. This method is primarily for setting the field to an undocumented
                 * or not yet supported value.
                 */
                fun customerType(customerType: JsonField<CustomerType>) = apply {
                    this.customerType = customerType
                }

                /**
                 * Optional UMA address identifier. If provided, the customer's UMA address will be
                 * updated. This is an optional identifier to route payments to the customer.
                 */
                fun umaAddress(umaAddress: String) = umaAddress(JsonField.of(umaAddress))

                /**
                 * Sets [Builder.umaAddress] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.umaAddress] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun umaAddress(umaAddress: JsonField<String>) = apply {
                    this.umaAddress = umaAddress
                }

                fun address(address: Address) = address(JsonField.of(address))

                /**
                 * Sets [Builder.address] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.address] with a well-typed [Address] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun address(address: JsonField<Address>) = apply { this.address = address }

                fun beneficialOwners(beneficialOwners: List<UltimateBeneficialOwner>) =
                    beneficialOwners(JsonField.of(beneficialOwners))

                /**
                 * Sets [Builder.beneficialOwners] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.beneficialOwners] with a well-typed
                 * `List<UltimateBeneficialOwner>` value instead. This method is primarily for
                 * setting the field to an undocumented or not yet supported value.
                 */
                fun beneficialOwners(beneficialOwners: JsonField<List<UltimateBeneficialOwner>>) =
                    apply {
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
                fun businessInfo(businessInfo: BusinessCustomerFields.BusinessInfo) =
                    businessInfo(JsonField.of(businessInfo))

                /**
                 * Sets [Builder.businessInfo] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.businessInfo] with a well-typed
                 * [BusinessCustomerFields.BusinessInfo] value instead. This method is primarily for
                 * setting the field to an undocumented or not yet supported value.
                 */
                fun businessInfo(businessInfo: JsonField<BusinessCustomerFields.BusinessInfo>) =
                    apply {
                        this.businessInfo = businessInfo
                    }

                fun additionalProperties(additionalProperties: Map<String, JsonValue>) = apply {
                    this.additionalProperties.clear()
                    putAllAdditionalProperties(additionalProperties)
                }

                fun putAdditionalProperty(key: String, value: JsonValue) = apply {
                    additionalProperties.put(key, value)
                }

                fun putAllAdditionalProperties(additionalProperties: Map<String, JsonValue>) =
                    apply {
                        this.additionalProperties.putAll(additionalProperties)
                    }

                fun removeAdditionalProperty(key: String) = apply {
                    additionalProperties.remove(key)
                }

                fun removeAllAdditionalProperties(keys: Set<String>) = apply {
                    keys.forEach(::removeAdditionalProperty)
                }

                /**
                 * Returns an immutable instance of [BusinessCustomerUpdateRequest].
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
                fun build(): BusinessCustomerUpdateRequest =
                    BusinessCustomerUpdateRequest(
                        checkRequired("customerType", customerType),
                        umaAddress,
                        address,
                        (beneficialOwners ?: JsonMissing.of()).map { it.toImmutable() },
                        businessInfo,
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): BusinessCustomerUpdateRequest = apply {
                if (validated) {
                    return@apply
                }

                customerType().validate()
                umaAddress()
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
             * Returns a score indicating how many valid values are contained in this object
             * recursively.
             *
             * Used for best match union deserialization.
             */
            internal fun validity(): Int =
                (customerType.asKnown()?.validity() ?: 0) +
                    (if (umaAddress.asKnown() == null) 0 else 1) +
                    (address.asKnown()?.validity() ?: 0) +
                    (beneficialOwners.asKnown()?.sumOf { it.validity().toInt() } ?: 0) +
                    (businessInfo.asKnown()?.validity() ?: 0)

            override fun equals(other: Any?): Boolean {
                if (this === other) {
                    return true
                }

                return other is BusinessCustomerUpdateRequest &&
                    customerType == other.customerType &&
                    umaAddress == other.umaAddress &&
                    address == other.address &&
                    beneficialOwners == other.beneficialOwners &&
                    businessInfo == other.businessInfo &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(
                    customerType,
                    umaAddress,
                    address,
                    beneficialOwners,
                    businessInfo,
                    additionalProperties,
                )
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "BusinessCustomerUpdateRequest{customerType=$customerType, umaAddress=$umaAddress, address=$address, beneficialOwners=$beneficialOwners, businessInfo=$businessInfo, additionalProperties=$additionalProperties}"
        }
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is CustomerUpdateParams &&
            customerId == other.customerId &&
            updateCustomerRequest == other.updateCustomerRequest &&
            additionalHeaders == other.additionalHeaders &&
            additionalQueryParams == other.additionalQueryParams
    }

    override fun hashCode(): Int =
        Objects.hash(customerId, updateCustomerRequest, additionalHeaders, additionalQueryParams)

    override fun toString() =
        "CustomerUpdateParams{customerId=$customerId, updateCustomerRequest=$updateCustomerRequest, additionalHeaders=$additionalHeaders, additionalQueryParams=$additionalQueryParams}"
}
