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
import com.grid.api.core.Enum
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
         * `UpdateCustomerRequest.ofIndividual(individual)`.
         */
        fun updateCustomerRequest(individual: UpdateCustomerRequest.Individual) =
            updateCustomerRequest(UpdateCustomerRequest.ofIndividual(individual))

        /**
         * Alias for calling [updateCustomerRequest] with
         * `UpdateCustomerRequest.ofBusiness(business)`.
         */
        fun updateCustomerRequest(business: UpdateCustomerRequest.Business) =
            updateCustomerRequest(UpdateCustomerRequest.ofBusiness(business))

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
        private val individual: Individual? = null,
        private val business: Business? = null,
        private val _json: JsonValue? = null,
    ) {

        fun individual(): Individual? = individual

        fun business(): Business? = business

        fun isIndividual(): Boolean = individual != null

        fun isBusiness(): Boolean = business != null

        fun asIndividual(): Individual = individual.getOrThrow("individual")

        fun asBusiness(): Business = business.getOrThrow("business")

        fun _json(): JsonValue? = _json

        fun <T> accept(visitor: Visitor<T>): T =
            when {
                individual != null -> visitor.visitIndividual(individual)
                business != null -> visitor.visitBusiness(business)
                else -> visitor.unknown(_json)
            }

        private var validated: Boolean = false

        fun validate(): UpdateCustomerRequest = apply {
            if (validated) {
                return@apply
            }

            accept(
                object : Visitor<Unit> {
                    override fun visitIndividual(individual: Individual) {
                        individual.validate()
                    }

                    override fun visitBusiness(business: Business) {
                        business.validate()
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
                    override fun visitIndividual(individual: Individual) = individual.validity()

                    override fun visitBusiness(business: Business) = business.validity()

                    override fun unknown(json: JsonValue?) = 0
                }
            )

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is UpdateCustomerRequest &&
                individual == other.individual &&
                business == other.business
        }

        override fun hashCode(): Int = Objects.hash(individual, business)

        override fun toString(): String =
            when {
                individual != null -> "UpdateCustomerRequest{individual=$individual}"
                business != null -> "UpdateCustomerRequest{business=$business}"
                _json != null -> "UpdateCustomerRequest{_unknown=$_json}"
                else -> throw IllegalStateException("Invalid UpdateCustomerRequest")
            }

        companion object {

            fun ofIndividual(individual: Individual) =
                UpdateCustomerRequest(individual = individual)

            fun ofBusiness(business: Business) = UpdateCustomerRequest(business = business)
        }

        /**
         * An interface that defines how to map each variant of [UpdateCustomerRequest] to a value
         * of type [T].
         */
        interface Visitor<out T> {

            fun visitIndividual(individual: Individual): T

            fun visitBusiness(business: Business): T

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
                            tryDeserialize(node, jacksonTypeRef<Individual>())?.let {
                                UpdateCustomerRequest(individual = it, _json = json)
                            },
                            tryDeserialize(node, jacksonTypeRef<Business>())?.let {
                                UpdateCustomerRequest(business = it, _json = json)
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
                    value.individual != null -> generator.writeObject(value.individual)
                    value.business != null -> generator.writeObject(value.business)
                    value._json != null -> generator.writeObject(value._json)
                    else -> throw IllegalStateException("Invalid UpdateCustomerRequest")
                }
            }
        }

        class Individual
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val umaAddress: JsonField<String>,
            private val customerType: JsonField<CustomerType>,
            private val address: JsonField<Address>,
            private val birthDate: JsonField<LocalDate>,
            private val fullName: JsonField<String>,
            private val nationality: JsonField<String>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("umaAddress")
                @ExcludeMissing
                umaAddress: JsonField<String> = JsonMissing.of(),
                @JsonProperty("customerType")
                @ExcludeMissing
                customerType: JsonField<CustomerType> = JsonMissing.of(),
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
                umaAddress,
                customerType,
                address,
                birthDate,
                fullName,
                nationality,
                mutableMapOf(),
            )

            fun toCustomerUpdate(): CustomerUpdate =
                CustomerUpdate.builder().umaAddress(umaAddress).build()

            /**
             * Optional UMA address identifier. If provided, the customer's UMA address will be
             * updated. This is an optional identifier to route payments to the customer.
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun umaAddress(): String? = umaAddress.getNullable("umaAddress")

            /**
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun customerType(): CustomerType = customerType.getRequired("customerType")

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
             * Returns the raw JSON value of [umaAddress].
             *
             * Unlike [umaAddress], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("umaAddress")
            @ExcludeMissing
            fun _umaAddress(): JsonField<String> = umaAddress

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
                 * Returns a mutable builder for constructing an instance of [Individual].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .customerType()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [Individual]. */
            class Builder internal constructor() {

                private var umaAddress: JsonField<String> = JsonMissing.of()
                private var customerType: JsonField<CustomerType>? = null
                private var address: JsonField<Address> = JsonMissing.of()
                private var birthDate: JsonField<LocalDate> = JsonMissing.of()
                private var fullName: JsonField<String> = JsonMissing.of()
                private var nationality: JsonField<String> = JsonMissing.of()
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(individual: Individual) = apply {
                    umaAddress = individual.umaAddress
                    customerType = individual.customerType
                    address = individual.address
                    birthDate = individual.birthDate
                    fullName = individual.fullName
                    nationality = individual.nationality
                    additionalProperties = individual.additionalProperties.toMutableMap()
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
                 * Returns an immutable instance of [Individual].
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
                fun build(): Individual =
                    Individual(
                        umaAddress,
                        checkRequired("customerType", customerType),
                        address,
                        birthDate,
                        fullName,
                        nationality,
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): Individual = apply {
                if (validated) {
                    return@apply
                }

                umaAddress()
                customerType().validate()
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
                (if (umaAddress.asKnown() == null) 0 else 1) +
                    (customerType.asKnown()?.validity() ?: 0) +
                    (address.asKnown()?.validity() ?: 0) +
                    (if (birthDate.asKnown() == null) 0 else 1) +
                    (if (fullName.asKnown() == null) 0 else 1) +
                    (if (nationality.asKnown() == null) 0 else 1)

            class CustomerType
            @JsonCreator
            private constructor(private val value: JsonField<String>) : Enum {

                /**
                 * Returns this class instance's raw value.
                 *
                 * This is usually only useful if this instance was deserialized from data that
                 * doesn't match any known member, and you want to know that value. For example, if
                 * the SDK is on an older version than the API, then the API may respond with new
                 * members that the SDK is unaware of.
                 */
                @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

                companion object {

                    val INDIVIDUAL = of("INDIVIDUAL")

                    fun of(value: String) = CustomerType(JsonField.of(value))
                }

                /** An enum containing [CustomerType]'s known values. */
                enum class Known {
                    INDIVIDUAL
                }

                /**
                 * An enum containing [CustomerType]'s known values, as well as an [_UNKNOWN]
                 * member.
                 *
                 * An instance of [CustomerType] can contain an unknown value in a couple of cases:
                 * - It was deserialized from data that doesn't match any known member. For example,
                 *   if the SDK is on an older version than the API, then the API may respond with
                 *   new members that the SDK is unaware of.
                 * - It was constructed with an arbitrary value using the [of] method.
                 */
                enum class Value {
                    INDIVIDUAL,
                    /**
                     * An enum member indicating that [CustomerType] was instantiated with an
                     * unknown value.
                     */
                    _UNKNOWN,
                }

                /**
                 * Returns an enum member corresponding to this class instance's value, or
                 * [Value._UNKNOWN] if the class was instantiated with an unknown value.
                 *
                 * Use the [known] method instead if you're certain the value is always known or if
                 * you want to throw for the unknown case.
                 */
                fun value(): Value =
                    when (this) {
                        INDIVIDUAL -> Value.INDIVIDUAL
                        else -> Value._UNKNOWN
                    }

                /**
                 * Returns an enum member corresponding to this class instance's value.
                 *
                 * Use the [value] method instead if you're uncertain the value is always known and
                 * don't want to throw for the unknown case.
                 *
                 * @throws GridInvalidDataException if this class instance's value is a not a known
                 *   member.
                 */
                fun known(): Known =
                    when (this) {
                        INDIVIDUAL -> Known.INDIVIDUAL
                        else -> throw GridInvalidDataException("Unknown CustomerType: $value")
                    }

                /**
                 * Returns this class instance's primitive wire representation.
                 *
                 * This differs from the [toString] method because that method is primarily for
                 * debugging and generally doesn't throw.
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

            class Address
            @JsonCreator(mode = JsonCreator.Mode.DISABLED)
            private constructor(
                private val country: JsonField<String>,
                private val line1: JsonField<String>,
                private val postalCode: JsonField<String>,
                private val city: JsonField<String>,
                private val line2: JsonField<String>,
                private val state: JsonField<String>,
                private val additionalProperties: MutableMap<String, JsonValue>,
            ) {

                @JsonCreator
                private constructor(
                    @JsonProperty("country")
                    @ExcludeMissing
                    country: JsonField<String> = JsonMissing.of(),
                    @JsonProperty("line1")
                    @ExcludeMissing
                    line1: JsonField<String> = JsonMissing.of(),
                    @JsonProperty("postalCode")
                    @ExcludeMissing
                    postalCode: JsonField<String> = JsonMissing.of(),
                    @JsonProperty("city")
                    @ExcludeMissing
                    city: JsonField<String> = JsonMissing.of(),
                    @JsonProperty("line2")
                    @ExcludeMissing
                    line2: JsonField<String> = JsonMissing.of(),
                    @JsonProperty("state")
                    @ExcludeMissing
                    state: JsonField<String> = JsonMissing.of(),
                ) : this(country, line1, postalCode, city, line2, state, mutableMapOf())

                /**
                 * Country code (ISO 3166-1 alpha-2)
                 *
                 * @throws GridInvalidDataException if the JSON field has an unexpected type or is
                 *   unexpectedly missing or null (e.g. if the server responded with an unexpected
                 *   value).
                 */
                fun country(): String = country.getRequired("country")

                /**
                 * Street address line 1
                 *
                 * @throws GridInvalidDataException if the JSON field has an unexpected type or is
                 *   unexpectedly missing or null (e.g. if the server responded with an unexpected
                 *   value).
                 */
                fun line1(): String = line1.getRequired("line1")

                /**
                 * Postal/ZIP code
                 *
                 * @throws GridInvalidDataException if the JSON field has an unexpected type or is
                 *   unexpectedly missing or null (e.g. if the server responded with an unexpected
                 *   value).
                 */
                fun postalCode(): String = postalCode.getRequired("postalCode")

                /**
                 * City
                 *
                 * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g.
                 *   if the server responded with an unexpected value).
                 */
                fun city(): String? = city.getNullable("city")

                /**
                 * Street address line 2
                 *
                 * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g.
                 *   if the server responded with an unexpected value).
                 */
                fun line2(): String? = line2.getNullable("line2")

                /**
                 * State/Province/Region
                 *
                 * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g.
                 *   if the server responded with an unexpected value).
                 */
                fun state(): String? = state.getNullable("state")

                /**
                 * Returns the raw JSON value of [country].
                 *
                 * Unlike [country], this method doesn't throw if the JSON field has an unexpected
                 * type.
                 */
                @JsonProperty("country") @ExcludeMissing fun _country(): JsonField<String> = country

                /**
                 * Returns the raw JSON value of [line1].
                 *
                 * Unlike [line1], this method doesn't throw if the JSON field has an unexpected
                 * type.
                 */
                @JsonProperty("line1") @ExcludeMissing fun _line1(): JsonField<String> = line1

                /**
                 * Returns the raw JSON value of [postalCode].
                 *
                 * Unlike [postalCode], this method doesn't throw if the JSON field has an
                 * unexpected type.
                 */
                @JsonProperty("postalCode")
                @ExcludeMissing
                fun _postalCode(): JsonField<String> = postalCode

                /**
                 * Returns the raw JSON value of [city].
                 *
                 * Unlike [city], this method doesn't throw if the JSON field has an unexpected
                 * type.
                 */
                @JsonProperty("city") @ExcludeMissing fun _city(): JsonField<String> = city

                /**
                 * Returns the raw JSON value of [line2].
                 *
                 * Unlike [line2], this method doesn't throw if the JSON field has an unexpected
                 * type.
                 */
                @JsonProperty("line2") @ExcludeMissing fun _line2(): JsonField<String> = line2

                /**
                 * Returns the raw JSON value of [state].
                 *
                 * Unlike [state], this method doesn't throw if the JSON field has an unexpected
                 * type.
                 */
                @JsonProperty("state") @ExcludeMissing fun _state(): JsonField<String> = state

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
                     * Returns a mutable builder for constructing an instance of [Address].
                     *
                     * The following fields are required:
                     * ```kotlin
                     * .country()
                     * .line1()
                     * .postalCode()
                     * ```
                     */
                    fun builder() = Builder()
                }

                /** A builder for [Address]. */
                class Builder internal constructor() {

                    private var country: JsonField<String>? = null
                    private var line1: JsonField<String>? = null
                    private var postalCode: JsonField<String>? = null
                    private var city: JsonField<String> = JsonMissing.of()
                    private var line2: JsonField<String> = JsonMissing.of()
                    private var state: JsonField<String> = JsonMissing.of()
                    private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                    internal fun from(address: Address) = apply {
                        country = address.country
                        line1 = address.line1
                        postalCode = address.postalCode
                        city = address.city
                        line2 = address.line2
                        state = address.state
                        additionalProperties = address.additionalProperties.toMutableMap()
                    }

                    /** Country code (ISO 3166-1 alpha-2) */
                    fun country(country: String) = country(JsonField.of(country))

                    /**
                     * Sets [Builder.country] to an arbitrary JSON value.
                     *
                     * You should usually call [Builder.country] with a well-typed [String] value
                     * instead. This method is primarily for setting the field to an undocumented or
                     * not yet supported value.
                     */
                    fun country(country: JsonField<String>) = apply { this.country = country }

                    /** Street address line 1 */
                    fun line1(line1: String) = line1(JsonField.of(line1))

                    /**
                     * Sets [Builder.line1] to an arbitrary JSON value.
                     *
                     * You should usually call [Builder.line1] with a well-typed [String] value
                     * instead. This method is primarily for setting the field to an undocumented or
                     * not yet supported value.
                     */
                    fun line1(line1: JsonField<String>) = apply { this.line1 = line1 }

                    /** Postal/ZIP code */
                    fun postalCode(postalCode: String) = postalCode(JsonField.of(postalCode))

                    /**
                     * Sets [Builder.postalCode] to an arbitrary JSON value.
                     *
                     * You should usually call [Builder.postalCode] with a well-typed [String] value
                     * instead. This method is primarily for setting the field to an undocumented or
                     * not yet supported value.
                     */
                    fun postalCode(postalCode: JsonField<String>) = apply {
                        this.postalCode = postalCode
                    }

                    /** City */
                    fun city(city: String) = city(JsonField.of(city))

                    /**
                     * Sets [Builder.city] to an arbitrary JSON value.
                     *
                     * You should usually call [Builder.city] with a well-typed [String] value
                     * instead. This method is primarily for setting the field to an undocumented or
                     * not yet supported value.
                     */
                    fun city(city: JsonField<String>) = apply { this.city = city }

                    /** Street address line 2 */
                    fun line2(line2: String) = line2(JsonField.of(line2))

                    /**
                     * Sets [Builder.line2] to an arbitrary JSON value.
                     *
                     * You should usually call [Builder.line2] with a well-typed [String] value
                     * instead. This method is primarily for setting the field to an undocumented or
                     * not yet supported value.
                     */
                    fun line2(line2: JsonField<String>) = apply { this.line2 = line2 }

                    /** State/Province/Region */
                    fun state(state: String) = state(JsonField.of(state))

                    /**
                     * Sets [Builder.state] to an arbitrary JSON value.
                     *
                     * You should usually call [Builder.state] with a well-typed [String] value
                     * instead. This method is primarily for setting the field to an undocumented or
                     * not yet supported value.
                     */
                    fun state(state: JsonField<String>) = apply { this.state = state }

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
                     * Returns an immutable instance of [Address].
                     *
                     * Further updates to this [Builder] will not mutate the returned instance.
                     *
                     * The following fields are required:
                     * ```kotlin
                     * .country()
                     * .line1()
                     * .postalCode()
                     * ```
                     *
                     * @throws IllegalStateException if any required field is unset.
                     */
                    fun build(): Address =
                        Address(
                            checkRequired("country", country),
                            checkRequired("line1", line1),
                            checkRequired("postalCode", postalCode),
                            city,
                            line2,
                            state,
                            additionalProperties.toMutableMap(),
                        )
                }

                private var validated: Boolean = false

                fun validate(): Address = apply {
                    if (validated) {
                        return@apply
                    }

                    country()
                    line1()
                    postalCode()
                    city()
                    line2()
                    state()
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
                    (if (country.asKnown() == null) 0 else 1) +
                        (if (line1.asKnown() == null) 0 else 1) +
                        (if (postalCode.asKnown() == null) 0 else 1) +
                        (if (city.asKnown() == null) 0 else 1) +
                        (if (line2.asKnown() == null) 0 else 1) +
                        (if (state.asKnown() == null) 0 else 1)

                override fun equals(other: Any?): Boolean {
                    if (this === other) {
                        return true
                    }

                    return other is Address &&
                        country == other.country &&
                        line1 == other.line1 &&
                        postalCode == other.postalCode &&
                        city == other.city &&
                        line2 == other.line2 &&
                        state == other.state &&
                        additionalProperties == other.additionalProperties
                }

                private val hashCode: Int by lazy {
                    Objects.hash(
                        country,
                        line1,
                        postalCode,
                        city,
                        line2,
                        state,
                        additionalProperties,
                    )
                }

                override fun hashCode(): Int = hashCode

                override fun toString() =
                    "Address{country=$country, line1=$line1, postalCode=$postalCode, city=$city, line2=$line2, state=$state, additionalProperties=$additionalProperties}"
            }

            override fun equals(other: Any?): Boolean {
                if (this === other) {
                    return true
                }

                return other is Individual &&
                    umaAddress == other.umaAddress &&
                    customerType == other.customerType &&
                    address == other.address &&
                    birthDate == other.birthDate &&
                    fullName == other.fullName &&
                    nationality == other.nationality &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(
                    umaAddress,
                    customerType,
                    address,
                    birthDate,
                    fullName,
                    nationality,
                    additionalProperties,
                )
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "Individual{umaAddress=$umaAddress, customerType=$customerType, address=$address, birthDate=$birthDate, fullName=$fullName, nationality=$nationality, additionalProperties=$additionalProperties}"
        }

        class Business
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val umaAddress: JsonField<String>,
            private val customerType: JsonField<CustomerType>,
            private val address: JsonField<Address>,
            private val beneficialOwners: JsonField<List<BeneficialOwner>>,
            private val businessInfo: JsonField<BusinessInfo>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("umaAddress")
                @ExcludeMissing
                umaAddress: JsonField<String> = JsonMissing.of(),
                @JsonProperty("customerType")
                @ExcludeMissing
                customerType: JsonField<CustomerType> = JsonMissing.of(),
                @JsonProperty("address")
                @ExcludeMissing
                address: JsonField<Address> = JsonMissing.of(),
                @JsonProperty("beneficialOwners")
                @ExcludeMissing
                beneficialOwners: JsonField<List<BeneficialOwner>> = JsonMissing.of(),
                @JsonProperty("businessInfo")
                @ExcludeMissing
                businessInfo: JsonField<BusinessInfo> = JsonMissing.of(),
            ) : this(
                umaAddress,
                customerType,
                address,
                beneficialOwners,
                businessInfo,
                mutableMapOf(),
            )

            fun toCustomerUpdate(): CustomerUpdate =
                CustomerUpdate.builder().umaAddress(umaAddress).build()

            /**
             * Optional UMA address identifier. If provided, the customer's UMA address will be
             * updated. This is an optional identifier to route payments to the customer.
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun umaAddress(): String? = umaAddress.getNullable("umaAddress")

            /**
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun customerType(): CustomerType = customerType.getRequired("customerType")

            /**
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun address(): Address? = address.getNullable("address")

            /**
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun beneficialOwners(): List<BeneficialOwner>? =
                beneficialOwners.getNullable("beneficialOwners")

            /**
             * Additional information for business entities
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun businessInfo(): BusinessInfo? = businessInfo.getNullable("businessInfo")

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
             * Returns the raw JSON value of [customerType].
             *
             * Unlike [customerType], this method doesn't throw if the JSON field has an unexpected
             * type.
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
             * Unlike [beneficialOwners], this method doesn't throw if the JSON field has an
             * unexpected type.
             */
            @JsonProperty("beneficialOwners")
            @ExcludeMissing
            fun _beneficialOwners(): JsonField<List<BeneficialOwner>> = beneficialOwners

            /**
             * Returns the raw JSON value of [businessInfo].
             *
             * Unlike [businessInfo], this method doesn't throw if the JSON field has an unexpected
             * type.
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
                 * Returns a mutable builder for constructing an instance of [Business].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .customerType()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [Business]. */
            class Builder internal constructor() {

                private var umaAddress: JsonField<String> = JsonMissing.of()
                private var customerType: JsonField<CustomerType>? = null
                private var address: JsonField<Address> = JsonMissing.of()
                private var beneficialOwners: JsonField<MutableList<BeneficialOwner>>? = null
                private var businessInfo: JsonField<BusinessInfo> = JsonMissing.of()
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(business: Business) = apply {
                    umaAddress = business.umaAddress
                    customerType = business.customerType
                    address = business.address
                    beneficialOwners = business.beneficialOwners.map { it.toMutableList() }
                    businessInfo = business.businessInfo
                    additionalProperties = business.additionalProperties.toMutableMap()
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

                fun address(address: Address) = address(JsonField.of(address))

                /**
                 * Sets [Builder.address] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.address] with a well-typed [Address] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun address(address: JsonField<Address>) = apply { this.address = address }

                fun beneficialOwners(beneficialOwners: List<BeneficialOwner>) =
                    beneficialOwners(JsonField.of(beneficialOwners))

                /**
                 * Sets [Builder.beneficialOwners] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.beneficialOwners] with a well-typed
                 * `List<BeneficialOwner>` value instead. This method is primarily for setting the
                 * field to an undocumented or not yet supported value.
                 */
                fun beneficialOwners(beneficialOwners: JsonField<List<BeneficialOwner>>) = apply {
                    this.beneficialOwners = beneficialOwners.map { it.toMutableList() }
                }

                /**
                 * Adds a single [BeneficialOwner] to [beneficialOwners].
                 *
                 * @throws IllegalStateException if the field was previously set to a non-list.
                 */
                fun addBeneficialOwner(beneficialOwner: BeneficialOwner) = apply {
                    beneficialOwners =
                        (beneficialOwners ?: JsonField.of(mutableListOf())).also {
                            checkKnown("beneficialOwners", it).add(beneficialOwner)
                        }
                }

                /** Additional information for business entities */
                fun businessInfo(businessInfo: BusinessInfo) =
                    businessInfo(JsonField.of(businessInfo))

                /**
                 * Sets [Builder.businessInfo] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.businessInfo] with a well-typed [BusinessInfo]
                 * value instead. This method is primarily for setting the field to an undocumented
                 * or not yet supported value.
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
                 * Returns an immutable instance of [Business].
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
                fun build(): Business =
                    Business(
                        umaAddress,
                        checkRequired("customerType", customerType),
                        address,
                        (beneficialOwners ?: JsonMissing.of()).map { it.toImmutable() },
                        businessInfo,
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): Business = apply {
                if (validated) {
                    return@apply
                }

                umaAddress()
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
             * Returns a score indicating how many valid values are contained in this object
             * recursively.
             *
             * Used for best match union deserialization.
             */
            internal fun validity(): Int =
                (if (umaAddress.asKnown() == null) 0 else 1) +
                    (customerType.asKnown()?.validity() ?: 0) +
                    (address.asKnown()?.validity() ?: 0) +
                    (beneficialOwners.asKnown()?.sumOf { it.validity().toInt() } ?: 0) +
                    (businessInfo.asKnown()?.validity() ?: 0)

            class CustomerType
            @JsonCreator
            private constructor(private val value: JsonField<String>) : Enum {

                /**
                 * Returns this class instance's raw value.
                 *
                 * This is usually only useful if this instance was deserialized from data that
                 * doesn't match any known member, and you want to know that value. For example, if
                 * the SDK is on an older version than the API, then the API may respond with new
                 * members that the SDK is unaware of.
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
                 * An enum containing [CustomerType]'s known values, as well as an [_UNKNOWN]
                 * member.
                 *
                 * An instance of [CustomerType] can contain an unknown value in a couple of cases:
                 * - It was deserialized from data that doesn't match any known member. For example,
                 *   if the SDK is on an older version than the API, then the API may respond with
                 *   new members that the SDK is unaware of.
                 * - It was constructed with an arbitrary value using the [of] method.
                 */
                enum class Value {
                    BUSINESS,
                    /**
                     * An enum member indicating that [CustomerType] was instantiated with an
                     * unknown value.
                     */
                    _UNKNOWN,
                }

                /**
                 * Returns an enum member corresponding to this class instance's value, or
                 * [Value._UNKNOWN] if the class was instantiated with an unknown value.
                 *
                 * Use the [known] method instead if you're certain the value is always known or if
                 * you want to throw for the unknown case.
                 */
                fun value(): Value =
                    when (this) {
                        BUSINESS -> Value.BUSINESS
                        else -> Value._UNKNOWN
                    }

                /**
                 * Returns an enum member corresponding to this class instance's value.
                 *
                 * Use the [value] method instead if you're uncertain the value is always known and
                 * don't want to throw for the unknown case.
                 *
                 * @throws GridInvalidDataException if this class instance's value is a not a known
                 *   member.
                 */
                fun known(): Known =
                    when (this) {
                        BUSINESS -> Known.BUSINESS
                        else -> throw GridInvalidDataException("Unknown CustomerType: $value")
                    }

                /**
                 * Returns this class instance's primitive wire representation.
                 *
                 * This differs from the [toString] method because that method is primarily for
                 * debugging and generally doesn't throw.
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

            class Address
            @JsonCreator(mode = JsonCreator.Mode.DISABLED)
            private constructor(
                private val country: JsonField<String>,
                private val line1: JsonField<String>,
                private val postalCode: JsonField<String>,
                private val city: JsonField<String>,
                private val line2: JsonField<String>,
                private val state: JsonField<String>,
                private val additionalProperties: MutableMap<String, JsonValue>,
            ) {

                @JsonCreator
                private constructor(
                    @JsonProperty("country")
                    @ExcludeMissing
                    country: JsonField<String> = JsonMissing.of(),
                    @JsonProperty("line1")
                    @ExcludeMissing
                    line1: JsonField<String> = JsonMissing.of(),
                    @JsonProperty("postalCode")
                    @ExcludeMissing
                    postalCode: JsonField<String> = JsonMissing.of(),
                    @JsonProperty("city")
                    @ExcludeMissing
                    city: JsonField<String> = JsonMissing.of(),
                    @JsonProperty("line2")
                    @ExcludeMissing
                    line2: JsonField<String> = JsonMissing.of(),
                    @JsonProperty("state")
                    @ExcludeMissing
                    state: JsonField<String> = JsonMissing.of(),
                ) : this(country, line1, postalCode, city, line2, state, mutableMapOf())

                /**
                 * Country code (ISO 3166-1 alpha-2)
                 *
                 * @throws GridInvalidDataException if the JSON field has an unexpected type or is
                 *   unexpectedly missing or null (e.g. if the server responded with an unexpected
                 *   value).
                 */
                fun country(): String = country.getRequired("country")

                /**
                 * Street address line 1
                 *
                 * @throws GridInvalidDataException if the JSON field has an unexpected type or is
                 *   unexpectedly missing or null (e.g. if the server responded with an unexpected
                 *   value).
                 */
                fun line1(): String = line1.getRequired("line1")

                /**
                 * Postal/ZIP code
                 *
                 * @throws GridInvalidDataException if the JSON field has an unexpected type or is
                 *   unexpectedly missing or null (e.g. if the server responded with an unexpected
                 *   value).
                 */
                fun postalCode(): String = postalCode.getRequired("postalCode")

                /**
                 * City
                 *
                 * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g.
                 *   if the server responded with an unexpected value).
                 */
                fun city(): String? = city.getNullable("city")

                /**
                 * Street address line 2
                 *
                 * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g.
                 *   if the server responded with an unexpected value).
                 */
                fun line2(): String? = line2.getNullable("line2")

                /**
                 * State/Province/Region
                 *
                 * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g.
                 *   if the server responded with an unexpected value).
                 */
                fun state(): String? = state.getNullable("state")

                /**
                 * Returns the raw JSON value of [country].
                 *
                 * Unlike [country], this method doesn't throw if the JSON field has an unexpected
                 * type.
                 */
                @JsonProperty("country") @ExcludeMissing fun _country(): JsonField<String> = country

                /**
                 * Returns the raw JSON value of [line1].
                 *
                 * Unlike [line1], this method doesn't throw if the JSON field has an unexpected
                 * type.
                 */
                @JsonProperty("line1") @ExcludeMissing fun _line1(): JsonField<String> = line1

                /**
                 * Returns the raw JSON value of [postalCode].
                 *
                 * Unlike [postalCode], this method doesn't throw if the JSON field has an
                 * unexpected type.
                 */
                @JsonProperty("postalCode")
                @ExcludeMissing
                fun _postalCode(): JsonField<String> = postalCode

                /**
                 * Returns the raw JSON value of [city].
                 *
                 * Unlike [city], this method doesn't throw if the JSON field has an unexpected
                 * type.
                 */
                @JsonProperty("city") @ExcludeMissing fun _city(): JsonField<String> = city

                /**
                 * Returns the raw JSON value of [line2].
                 *
                 * Unlike [line2], this method doesn't throw if the JSON field has an unexpected
                 * type.
                 */
                @JsonProperty("line2") @ExcludeMissing fun _line2(): JsonField<String> = line2

                /**
                 * Returns the raw JSON value of [state].
                 *
                 * Unlike [state], this method doesn't throw if the JSON field has an unexpected
                 * type.
                 */
                @JsonProperty("state") @ExcludeMissing fun _state(): JsonField<String> = state

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
                     * Returns a mutable builder for constructing an instance of [Address].
                     *
                     * The following fields are required:
                     * ```kotlin
                     * .country()
                     * .line1()
                     * .postalCode()
                     * ```
                     */
                    fun builder() = Builder()
                }

                /** A builder for [Address]. */
                class Builder internal constructor() {

                    private var country: JsonField<String>? = null
                    private var line1: JsonField<String>? = null
                    private var postalCode: JsonField<String>? = null
                    private var city: JsonField<String> = JsonMissing.of()
                    private var line2: JsonField<String> = JsonMissing.of()
                    private var state: JsonField<String> = JsonMissing.of()
                    private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                    internal fun from(address: Address) = apply {
                        country = address.country
                        line1 = address.line1
                        postalCode = address.postalCode
                        city = address.city
                        line2 = address.line2
                        state = address.state
                        additionalProperties = address.additionalProperties.toMutableMap()
                    }

                    /** Country code (ISO 3166-1 alpha-2) */
                    fun country(country: String) = country(JsonField.of(country))

                    /**
                     * Sets [Builder.country] to an arbitrary JSON value.
                     *
                     * You should usually call [Builder.country] with a well-typed [String] value
                     * instead. This method is primarily for setting the field to an undocumented or
                     * not yet supported value.
                     */
                    fun country(country: JsonField<String>) = apply { this.country = country }

                    /** Street address line 1 */
                    fun line1(line1: String) = line1(JsonField.of(line1))

                    /**
                     * Sets [Builder.line1] to an arbitrary JSON value.
                     *
                     * You should usually call [Builder.line1] with a well-typed [String] value
                     * instead. This method is primarily for setting the field to an undocumented or
                     * not yet supported value.
                     */
                    fun line1(line1: JsonField<String>) = apply { this.line1 = line1 }

                    /** Postal/ZIP code */
                    fun postalCode(postalCode: String) = postalCode(JsonField.of(postalCode))

                    /**
                     * Sets [Builder.postalCode] to an arbitrary JSON value.
                     *
                     * You should usually call [Builder.postalCode] with a well-typed [String] value
                     * instead. This method is primarily for setting the field to an undocumented or
                     * not yet supported value.
                     */
                    fun postalCode(postalCode: JsonField<String>) = apply {
                        this.postalCode = postalCode
                    }

                    /** City */
                    fun city(city: String) = city(JsonField.of(city))

                    /**
                     * Sets [Builder.city] to an arbitrary JSON value.
                     *
                     * You should usually call [Builder.city] with a well-typed [String] value
                     * instead. This method is primarily for setting the field to an undocumented or
                     * not yet supported value.
                     */
                    fun city(city: JsonField<String>) = apply { this.city = city }

                    /** Street address line 2 */
                    fun line2(line2: String) = line2(JsonField.of(line2))

                    /**
                     * Sets [Builder.line2] to an arbitrary JSON value.
                     *
                     * You should usually call [Builder.line2] with a well-typed [String] value
                     * instead. This method is primarily for setting the field to an undocumented or
                     * not yet supported value.
                     */
                    fun line2(line2: JsonField<String>) = apply { this.line2 = line2 }

                    /** State/Province/Region */
                    fun state(state: String) = state(JsonField.of(state))

                    /**
                     * Sets [Builder.state] to an arbitrary JSON value.
                     *
                     * You should usually call [Builder.state] with a well-typed [String] value
                     * instead. This method is primarily for setting the field to an undocumented or
                     * not yet supported value.
                     */
                    fun state(state: JsonField<String>) = apply { this.state = state }

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
                     * Returns an immutable instance of [Address].
                     *
                     * Further updates to this [Builder] will not mutate the returned instance.
                     *
                     * The following fields are required:
                     * ```kotlin
                     * .country()
                     * .line1()
                     * .postalCode()
                     * ```
                     *
                     * @throws IllegalStateException if any required field is unset.
                     */
                    fun build(): Address =
                        Address(
                            checkRequired("country", country),
                            checkRequired("line1", line1),
                            checkRequired("postalCode", postalCode),
                            city,
                            line2,
                            state,
                            additionalProperties.toMutableMap(),
                        )
                }

                private var validated: Boolean = false

                fun validate(): Address = apply {
                    if (validated) {
                        return@apply
                    }

                    country()
                    line1()
                    postalCode()
                    city()
                    line2()
                    state()
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
                    (if (country.asKnown() == null) 0 else 1) +
                        (if (line1.asKnown() == null) 0 else 1) +
                        (if (postalCode.asKnown() == null) 0 else 1) +
                        (if (city.asKnown() == null) 0 else 1) +
                        (if (line2.asKnown() == null) 0 else 1) +
                        (if (state.asKnown() == null) 0 else 1)

                override fun equals(other: Any?): Boolean {
                    if (this === other) {
                        return true
                    }

                    return other is Address &&
                        country == other.country &&
                        line1 == other.line1 &&
                        postalCode == other.postalCode &&
                        city == other.city &&
                        line2 == other.line2 &&
                        state == other.state &&
                        additionalProperties == other.additionalProperties
                }

                private val hashCode: Int by lazy {
                    Objects.hash(
                        country,
                        line1,
                        postalCode,
                        city,
                        line2,
                        state,
                        additionalProperties,
                    )
                }

                override fun hashCode(): Int = hashCode

                override fun toString() =
                    "Address{country=$country, line1=$line1, postalCode=$postalCode, city=$city, line2=$line2, state=$state, additionalProperties=$additionalProperties}"
            }

            class BeneficialOwner
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
                    @JsonProperty("fullName")
                    @ExcludeMissing
                    fullName: JsonField<String> = JsonMissing.of(),
                    @JsonProperty("individualType")
                    @ExcludeMissing
                    individualType: JsonField<IndividualType> = JsonMissing.of(),
                    @JsonProperty("address")
                    @ExcludeMissing
                    address: JsonField<Address> = JsonMissing.of(),
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
                    @JsonProperty("taxId")
                    @ExcludeMissing
                    taxId: JsonField<String> = JsonMissing.of(),
                    @JsonProperty("title")
                    @ExcludeMissing
                    title: JsonField<String> = JsonMissing.of(),
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
                 * @throws GridInvalidDataException if the JSON field has an unexpected type or is
                 *   unexpectedly missing or null (e.g. if the server responded with an unexpected
                 *   value).
                 */
                fun fullName(): String = fullName.getRequired("fullName")

                /**
                 * Type of individual in the corporation
                 *
                 * @throws GridInvalidDataException if the JSON field has an unexpected type or is
                 *   unexpectedly missing or null (e.g. if the server responded with an unexpected
                 *   value).
                 */
                fun individualType(): IndividualType = individualType.getRequired("individualType")

                /**
                 * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g.
                 *   if the server responded with an unexpected value).
                 */
                fun address(): Address? = address.getNullable("address")

                /**
                 * Date of birth in ISO 8601 format (YYYY-MM-DD)
                 *
                 * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g.
                 *   if the server responded with an unexpected value).
                 */
                fun birthDate(): LocalDate? = birthDate.getNullable("birthDate")

                /**
                 * Email address of the individual
                 *
                 * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g.
                 *   if the server responded with an unexpected value).
                 */
                fun emailAddress(): String? = emailAddress.getNullable("emailAddress")

                /**
                 * Country code (ISO 3166-1 alpha-2)
                 *
                 * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g.
                 *   if the server responded with an unexpected value).
                 */
                fun nationality(): String? = nationality.getNullable("nationality")

                /**
                 * Percent of ownership when individual type is beneficial owner
                 *
                 * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g.
                 *   if the server responded with an unexpected value).
                 */
                fun percentageOwnership(): Double? =
                    percentageOwnership.getNullable("percentageOwnership")

                /**
                 * Phone number of the individual in E.164 format
                 *
                 * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g.
                 *   if the server responded with an unexpected value).
                 */
                fun phoneNumber(): String? = phoneNumber.getNullable("phoneNumber")

                /**
                 * Tax identification number of the individual. This could be a Social Security
                 * Number (SSN) for US individuals, Tax Identification Number (TIN) for non-US
                 * individuals, or a Passport Number.
                 *
                 * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g.
                 *   if the server responded with an unexpected value).
                 */
                fun taxId(): String? = taxId.getNullable("taxId")

                /**
                 * Title at company
                 *
                 * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g.
                 *   if the server responded with an unexpected value).
                 */
                fun title(): String? = title.getNullable("title")

                /**
                 * Returns the raw JSON value of [fullName].
                 *
                 * Unlike [fullName], this method doesn't throw if the JSON field has an unexpected
                 * type.
                 */
                @JsonProperty("fullName")
                @ExcludeMissing
                fun _fullName(): JsonField<String> = fullName

                /**
                 * Returns the raw JSON value of [individualType].
                 *
                 * Unlike [individualType], this method doesn't throw if the JSON field has an
                 * unexpected type.
                 */
                @JsonProperty("individualType")
                @ExcludeMissing
                fun _individualType(): JsonField<IndividualType> = individualType

                /**
                 * Returns the raw JSON value of [address].
                 *
                 * Unlike [address], this method doesn't throw if the JSON field has an unexpected
                 * type.
                 */
                @JsonProperty("address")
                @ExcludeMissing
                fun _address(): JsonField<Address> = address

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
                 * Returns the raw JSON value of [emailAddress].
                 *
                 * Unlike [emailAddress], this method doesn't throw if the JSON field has an
                 * unexpected type.
                 */
                @JsonProperty("emailAddress")
                @ExcludeMissing
                fun _emailAddress(): JsonField<String> = emailAddress

                /**
                 * Returns the raw JSON value of [nationality].
                 *
                 * Unlike [nationality], this method doesn't throw if the JSON field has an
                 * unexpected type.
                 */
                @JsonProperty("nationality")
                @ExcludeMissing
                fun _nationality(): JsonField<String> = nationality

                /**
                 * Returns the raw JSON value of [percentageOwnership].
                 *
                 * Unlike [percentageOwnership], this method doesn't throw if the JSON field has an
                 * unexpected type.
                 */
                @JsonProperty("percentageOwnership")
                @ExcludeMissing
                fun _percentageOwnership(): JsonField<Double> = percentageOwnership

                /**
                 * Returns the raw JSON value of [phoneNumber].
                 *
                 * Unlike [phoneNumber], this method doesn't throw if the JSON field has an
                 * unexpected type.
                 */
                @JsonProperty("phoneNumber")
                @ExcludeMissing
                fun _phoneNumber(): JsonField<String> = phoneNumber

                /**
                 * Returns the raw JSON value of [taxId].
                 *
                 * Unlike [taxId], this method doesn't throw if the JSON field has an unexpected
                 * type.
                 */
                @JsonProperty("taxId") @ExcludeMissing fun _taxId(): JsonField<String> = taxId

                /**
                 * Returns the raw JSON value of [title].
                 *
                 * Unlike [title], this method doesn't throw if the JSON field has an unexpected
                 * type.
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
                     * Returns a mutable builder for constructing an instance of [BeneficialOwner].
                     *
                     * The following fields are required:
                     * ```kotlin
                     * .fullName()
                     * .individualType()
                     * ```
                     */
                    fun builder() = Builder()
                }

                /** A builder for [BeneficialOwner]. */
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

                    internal fun from(beneficialOwner: BeneficialOwner) = apply {
                        fullName = beneficialOwner.fullName
                        individualType = beneficialOwner.individualType
                        address = beneficialOwner.address
                        birthDate = beneficialOwner.birthDate
                        emailAddress = beneficialOwner.emailAddress
                        nationality = beneficialOwner.nationality
                        percentageOwnership = beneficialOwner.percentageOwnership
                        phoneNumber = beneficialOwner.phoneNumber
                        taxId = beneficialOwner.taxId
                        title = beneficialOwner.title
                        additionalProperties = beneficialOwner.additionalProperties.toMutableMap()
                    }

                    /** Individual's full name */
                    fun fullName(fullName: String) = fullName(JsonField.of(fullName))

                    /**
                     * Sets [Builder.fullName] to an arbitrary JSON value.
                     *
                     * You should usually call [Builder.fullName] with a well-typed [String] value
                     * instead. This method is primarily for setting the field to an undocumented or
                     * not yet supported value.
                     */
                    fun fullName(fullName: JsonField<String>) = apply { this.fullName = fullName }

                    /** Type of individual in the corporation */
                    fun individualType(individualType: IndividualType) =
                        individualType(JsonField.of(individualType))

                    /**
                     * Sets [Builder.individualType] to an arbitrary JSON value.
                     *
                     * You should usually call [Builder.individualType] with a well-typed
                     * [IndividualType] value instead. This method is primarily for setting the
                     * field to an undocumented or not yet supported value.
                     */
                    fun individualType(individualType: JsonField<IndividualType>) = apply {
                        this.individualType = individualType
                    }

                    fun address(address: Address) = address(JsonField.of(address))

                    /**
                     * Sets [Builder.address] to an arbitrary JSON value.
                     *
                     * You should usually call [Builder.address] with a well-typed [Address] value
                     * instead. This method is primarily for setting the field to an undocumented or
                     * not yet supported value.
                     */
                    fun address(address: JsonField<Address>) = apply { this.address = address }

                    /** Date of birth in ISO 8601 format (YYYY-MM-DD) */
                    fun birthDate(birthDate: LocalDate) = birthDate(JsonField.of(birthDate))

                    /**
                     * Sets [Builder.birthDate] to an arbitrary JSON value.
                     *
                     * You should usually call [Builder.birthDate] with a well-typed [LocalDate]
                     * value instead. This method is primarily for setting the field to an
                     * undocumented or not yet supported value.
                     */
                    fun birthDate(birthDate: JsonField<LocalDate>) = apply {
                        this.birthDate = birthDate
                    }

                    /** Email address of the individual */
                    fun emailAddress(emailAddress: String) =
                        emailAddress(JsonField.of(emailAddress))

                    /**
                     * Sets [Builder.emailAddress] to an arbitrary JSON value.
                     *
                     * You should usually call [Builder.emailAddress] with a well-typed [String]
                     * value instead. This method is primarily for setting the field to an
                     * undocumented or not yet supported value.
                     */
                    fun emailAddress(emailAddress: JsonField<String>) = apply {
                        this.emailAddress = emailAddress
                    }

                    /** Country code (ISO 3166-1 alpha-2) */
                    fun nationality(nationality: String) = nationality(JsonField.of(nationality))

                    /**
                     * Sets [Builder.nationality] to an arbitrary JSON value.
                     *
                     * You should usually call [Builder.nationality] with a well-typed [String]
                     * value instead. This method is primarily for setting the field to an
                     * undocumented or not yet supported value.
                     */
                    fun nationality(nationality: JsonField<String>) = apply {
                        this.nationality = nationality
                    }

                    /** Percent of ownership when individual type is beneficial owner */
                    fun percentageOwnership(percentageOwnership: Double) =
                        percentageOwnership(JsonField.of(percentageOwnership))

                    /**
                     * Sets [Builder.percentageOwnership] to an arbitrary JSON value.
                     *
                     * You should usually call [Builder.percentageOwnership] with a well-typed
                     * [Double] value instead. This method is primarily for setting the field to an
                     * undocumented or not yet supported value.
                     */
                    fun percentageOwnership(percentageOwnership: JsonField<Double>) = apply {
                        this.percentageOwnership = percentageOwnership
                    }

                    /** Phone number of the individual in E.164 format */
                    fun phoneNumber(phoneNumber: String) = phoneNumber(JsonField.of(phoneNumber))

                    /**
                     * Sets [Builder.phoneNumber] to an arbitrary JSON value.
                     *
                     * You should usually call [Builder.phoneNumber] with a well-typed [String]
                     * value instead. This method is primarily for setting the field to an
                     * undocumented or not yet supported value.
                     */
                    fun phoneNumber(phoneNumber: JsonField<String>) = apply {
                        this.phoneNumber = phoneNumber
                    }

                    /**
                     * Tax identification number of the individual. This could be a Social Security
                     * Number (SSN) for US individuals, Tax Identification Number (TIN) for non-US
                     * individuals, or a Passport Number.
                     */
                    fun taxId(taxId: String) = taxId(JsonField.of(taxId))

                    /**
                     * Sets [Builder.taxId] to an arbitrary JSON value.
                     *
                     * You should usually call [Builder.taxId] with a well-typed [String] value
                     * instead. This method is primarily for setting the field to an undocumented or
                     * not yet supported value.
                     */
                    fun taxId(taxId: JsonField<String>) = apply { this.taxId = taxId }

                    /** Title at company */
                    fun title(title: String) = title(JsonField.of(title))

                    /**
                     * Sets [Builder.title] to an arbitrary JSON value.
                     *
                     * You should usually call [Builder.title] with a well-typed [String] value
                     * instead. This method is primarily for setting the field to an undocumented or
                     * not yet supported value.
                     */
                    fun title(title: JsonField<String>) = apply { this.title = title }

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
                     * Returns an immutable instance of [BeneficialOwner].
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
                    fun build(): BeneficialOwner =
                        BeneficialOwner(
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

                fun validate(): BeneficialOwner = apply {
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
                 * Returns a score indicating how many valid values are contained in this object
                 * recursively.
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
                class IndividualType
                @JsonCreator
                private constructor(private val value: JsonField<String>) : Enum {

                    /**
                     * Returns this class instance's raw value.
                     *
                     * This is usually only useful if this instance was deserialized from data that
                     * doesn't match any known member, and you want to know that value. For example,
                     * if the SDK is on an older version than the API, then the API may respond with
                     * new members that the SDK is unaware of.
                     */
                    @com.fasterxml.jackson.annotation.JsonValue
                    fun _value(): JsonField<String> = value

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
                     * An enum containing [IndividualType]'s known values, as well as an [_UNKNOWN]
                     * member.
                     *
                     * An instance of [IndividualType] can contain an unknown value in a couple of
                     * cases:
                     * - It was deserialized from data that doesn't match any known member. For
                     *   example, if the SDK is on an older version than the API, then the API may
                     *   respond with new members that the SDK is unaware of.
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
                         * An enum member indicating that [IndividualType] was instantiated with an
                         * unknown value.
                         */
                        _UNKNOWN,
                    }

                    /**
                     * Returns an enum member corresponding to this class instance's value, or
                     * [Value._UNKNOWN] if the class was instantiated with an unknown value.
                     *
                     * Use the [known] method instead if you're certain the value is always known or
                     * if you want to throw for the unknown case.
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
                     * Use the [value] method instead if you're uncertain the value is always known
                     * and don't want to throw for the unknown case.
                     *
                     * @throws GridInvalidDataException if this class instance's value is a not a
                     *   known member.
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
                     * This differs from the [toString] method because that method is primarily for
                     * debugging and generally doesn't throw.
                     *
                     * @throws GridInvalidDataException if this class instance's value does not have
                     *   the expected primitive type.
                     */
                    fun asString(): String =
                        _value().asString()
                            ?: throw GridInvalidDataException("Value is not a String")

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

                class Address
                @JsonCreator(mode = JsonCreator.Mode.DISABLED)
                private constructor(
                    private val country: JsonField<String>,
                    private val line1: JsonField<String>,
                    private val postalCode: JsonField<String>,
                    private val city: JsonField<String>,
                    private val line2: JsonField<String>,
                    private val state: JsonField<String>,
                    private val additionalProperties: MutableMap<String, JsonValue>,
                ) {

                    @JsonCreator
                    private constructor(
                        @JsonProperty("country")
                        @ExcludeMissing
                        country: JsonField<String> = JsonMissing.of(),
                        @JsonProperty("line1")
                        @ExcludeMissing
                        line1: JsonField<String> = JsonMissing.of(),
                        @JsonProperty("postalCode")
                        @ExcludeMissing
                        postalCode: JsonField<String> = JsonMissing.of(),
                        @JsonProperty("city")
                        @ExcludeMissing
                        city: JsonField<String> = JsonMissing.of(),
                        @JsonProperty("line2")
                        @ExcludeMissing
                        line2: JsonField<String> = JsonMissing.of(),
                        @JsonProperty("state")
                        @ExcludeMissing
                        state: JsonField<String> = JsonMissing.of(),
                    ) : this(country, line1, postalCode, city, line2, state, mutableMapOf())

                    /**
                     * Country code (ISO 3166-1 alpha-2)
                     *
                     * @throws GridInvalidDataException if the JSON field has an unexpected type or
                     *   is unexpectedly missing or null (e.g. if the server responded with an
                     *   unexpected value).
                     */
                    fun country(): String = country.getRequired("country")

                    /**
                     * Street address line 1
                     *
                     * @throws GridInvalidDataException if the JSON field has an unexpected type or
                     *   is unexpectedly missing or null (e.g. if the server responded with an
                     *   unexpected value).
                     */
                    fun line1(): String = line1.getRequired("line1")

                    /**
                     * Postal/ZIP code
                     *
                     * @throws GridInvalidDataException if the JSON field has an unexpected type or
                     *   is unexpectedly missing or null (e.g. if the server responded with an
                     *   unexpected value).
                     */
                    fun postalCode(): String = postalCode.getRequired("postalCode")

                    /**
                     * City
                     *
                     * @throws GridInvalidDataException if the JSON field has an unexpected type
                     *   (e.g. if the server responded with an unexpected value).
                     */
                    fun city(): String? = city.getNullable("city")

                    /**
                     * Street address line 2
                     *
                     * @throws GridInvalidDataException if the JSON field has an unexpected type
                     *   (e.g. if the server responded with an unexpected value).
                     */
                    fun line2(): String? = line2.getNullable("line2")

                    /**
                     * State/Province/Region
                     *
                     * @throws GridInvalidDataException if the JSON field has an unexpected type
                     *   (e.g. if the server responded with an unexpected value).
                     */
                    fun state(): String? = state.getNullable("state")

                    /**
                     * Returns the raw JSON value of [country].
                     *
                     * Unlike [country], this method doesn't throw if the JSON field has an
                     * unexpected type.
                     */
                    @JsonProperty("country")
                    @ExcludeMissing
                    fun _country(): JsonField<String> = country

                    /**
                     * Returns the raw JSON value of [line1].
                     *
                     * Unlike [line1], this method doesn't throw if the JSON field has an unexpected
                     * type.
                     */
                    @JsonProperty("line1") @ExcludeMissing fun _line1(): JsonField<String> = line1

                    /**
                     * Returns the raw JSON value of [postalCode].
                     *
                     * Unlike [postalCode], this method doesn't throw if the JSON field has an
                     * unexpected type.
                     */
                    @JsonProperty("postalCode")
                    @ExcludeMissing
                    fun _postalCode(): JsonField<String> = postalCode

                    /**
                     * Returns the raw JSON value of [city].
                     *
                     * Unlike [city], this method doesn't throw if the JSON field has an unexpected
                     * type.
                     */
                    @JsonProperty("city") @ExcludeMissing fun _city(): JsonField<String> = city

                    /**
                     * Returns the raw JSON value of [line2].
                     *
                     * Unlike [line2], this method doesn't throw if the JSON field has an unexpected
                     * type.
                     */
                    @JsonProperty("line2") @ExcludeMissing fun _line2(): JsonField<String> = line2

                    /**
                     * Returns the raw JSON value of [state].
                     *
                     * Unlike [state], this method doesn't throw if the JSON field has an unexpected
                     * type.
                     */
                    @JsonProperty("state") @ExcludeMissing fun _state(): JsonField<String> = state

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
                         * Returns a mutable builder for constructing an instance of [Address].
                         *
                         * The following fields are required:
                         * ```kotlin
                         * .country()
                         * .line1()
                         * .postalCode()
                         * ```
                         */
                        fun builder() = Builder()
                    }

                    /** A builder for [Address]. */
                    class Builder internal constructor() {

                        private var country: JsonField<String>? = null
                        private var line1: JsonField<String>? = null
                        private var postalCode: JsonField<String>? = null
                        private var city: JsonField<String> = JsonMissing.of()
                        private var line2: JsonField<String> = JsonMissing.of()
                        private var state: JsonField<String> = JsonMissing.of()
                        private var additionalProperties: MutableMap<String, JsonValue> =
                            mutableMapOf()

                        internal fun from(address: Address) = apply {
                            country = address.country
                            line1 = address.line1
                            postalCode = address.postalCode
                            city = address.city
                            line2 = address.line2
                            state = address.state
                            additionalProperties = address.additionalProperties.toMutableMap()
                        }

                        /** Country code (ISO 3166-1 alpha-2) */
                        fun country(country: String) = country(JsonField.of(country))

                        /**
                         * Sets [Builder.country] to an arbitrary JSON value.
                         *
                         * You should usually call [Builder.country] with a well-typed [String]
                         * value instead. This method is primarily for setting the field to an
                         * undocumented or not yet supported value.
                         */
                        fun country(country: JsonField<String>) = apply { this.country = country }

                        /** Street address line 1 */
                        fun line1(line1: String) = line1(JsonField.of(line1))

                        /**
                         * Sets [Builder.line1] to an arbitrary JSON value.
                         *
                         * You should usually call [Builder.line1] with a well-typed [String] value
                         * instead. This method is primarily for setting the field to an
                         * undocumented or not yet supported value.
                         */
                        fun line1(line1: JsonField<String>) = apply { this.line1 = line1 }

                        /** Postal/ZIP code */
                        fun postalCode(postalCode: String) = postalCode(JsonField.of(postalCode))

                        /**
                         * Sets [Builder.postalCode] to an arbitrary JSON value.
                         *
                         * You should usually call [Builder.postalCode] with a well-typed [String]
                         * value instead. This method is primarily for setting the field to an
                         * undocumented or not yet supported value.
                         */
                        fun postalCode(postalCode: JsonField<String>) = apply {
                            this.postalCode = postalCode
                        }

                        /** City */
                        fun city(city: String) = city(JsonField.of(city))

                        /**
                         * Sets [Builder.city] to an arbitrary JSON value.
                         *
                         * You should usually call [Builder.city] with a well-typed [String] value
                         * instead. This method is primarily for setting the field to an
                         * undocumented or not yet supported value.
                         */
                        fun city(city: JsonField<String>) = apply { this.city = city }

                        /** Street address line 2 */
                        fun line2(line2: String) = line2(JsonField.of(line2))

                        /**
                         * Sets [Builder.line2] to an arbitrary JSON value.
                         *
                         * You should usually call [Builder.line2] with a well-typed [String] value
                         * instead. This method is primarily for setting the field to an
                         * undocumented or not yet supported value.
                         */
                        fun line2(line2: JsonField<String>) = apply { this.line2 = line2 }

                        /** State/Province/Region */
                        fun state(state: String) = state(JsonField.of(state))

                        /**
                         * Sets [Builder.state] to an arbitrary JSON value.
                         *
                         * You should usually call [Builder.state] with a well-typed [String] value
                         * instead. This method is primarily for setting the field to an
                         * undocumented or not yet supported value.
                         */
                        fun state(state: JsonField<String>) = apply { this.state = state }

                        fun additionalProperties(additionalProperties: Map<String, JsonValue>) =
                            apply {
                                this.additionalProperties.clear()
                                putAllAdditionalProperties(additionalProperties)
                            }

                        fun putAdditionalProperty(key: String, value: JsonValue) = apply {
                            additionalProperties.put(key, value)
                        }

                        fun putAllAdditionalProperties(
                            additionalProperties: Map<String, JsonValue>
                        ) = apply { this.additionalProperties.putAll(additionalProperties) }

                        fun removeAdditionalProperty(key: String) = apply {
                            additionalProperties.remove(key)
                        }

                        fun removeAllAdditionalProperties(keys: Set<String>) = apply {
                            keys.forEach(::removeAdditionalProperty)
                        }

                        /**
                         * Returns an immutable instance of [Address].
                         *
                         * Further updates to this [Builder] will not mutate the returned instance.
                         *
                         * The following fields are required:
                         * ```kotlin
                         * .country()
                         * .line1()
                         * .postalCode()
                         * ```
                         *
                         * @throws IllegalStateException if any required field is unset.
                         */
                        fun build(): Address =
                            Address(
                                checkRequired("country", country),
                                checkRequired("line1", line1),
                                checkRequired("postalCode", postalCode),
                                city,
                                line2,
                                state,
                                additionalProperties.toMutableMap(),
                            )
                    }

                    private var validated: Boolean = false

                    fun validate(): Address = apply {
                        if (validated) {
                            return@apply
                        }

                        country()
                        line1()
                        postalCode()
                        city()
                        line2()
                        state()
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
                        (if (country.asKnown() == null) 0 else 1) +
                            (if (line1.asKnown() == null) 0 else 1) +
                            (if (postalCode.asKnown() == null) 0 else 1) +
                            (if (city.asKnown() == null) 0 else 1) +
                            (if (line2.asKnown() == null) 0 else 1) +
                            (if (state.asKnown() == null) 0 else 1)

                    override fun equals(other: Any?): Boolean {
                        if (this === other) {
                            return true
                        }

                        return other is Address &&
                            country == other.country &&
                            line1 == other.line1 &&
                            postalCode == other.postalCode &&
                            city == other.city &&
                            line2 == other.line2 &&
                            state == other.state &&
                            additionalProperties == other.additionalProperties
                    }

                    private val hashCode: Int by lazy {
                        Objects.hash(
                            country,
                            line1,
                            postalCode,
                            city,
                            line2,
                            state,
                            additionalProperties,
                        )
                    }

                    override fun hashCode(): Int = hashCode

                    override fun toString() =
                        "Address{country=$country, line1=$line1, postalCode=$postalCode, city=$city, line2=$line2, state=$state, additionalProperties=$additionalProperties}"
                }

                override fun equals(other: Any?): Boolean {
                    if (this === other) {
                        return true
                    }

                    return other is BeneficialOwner &&
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
                    "BeneficialOwner{fullName=$fullName, individualType=$individualType, address=$address, birthDate=$birthDate, emailAddress=$emailAddress, nationality=$nationality, percentageOwnership=$percentageOwnership, phoneNumber=$phoneNumber, taxId=$taxId, title=$title, additionalProperties=$additionalProperties}"
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
                    @JsonProperty("taxId")
                    @ExcludeMissing
                    taxId: JsonField<String> = JsonMissing.of(),
                ) : this(legalName, registrationNumber, taxId, mutableMapOf())

                /**
                 * Legal name of the business
                 *
                 * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g.
                 *   if the server responded with an unexpected value).
                 */
                fun legalName(): String? = legalName.getNullable("legalName")

                /**
                 * Business registration number
                 *
                 * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g.
                 *   if the server responded with an unexpected value).
                 */
                fun registrationNumber(): String? =
                    registrationNumber.getNullable("registrationNumber")

                /**
                 * Tax identification number
                 *
                 * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g.
                 *   if the server responded with an unexpected value).
                 */
                fun taxId(): String? = taxId.getNullable("taxId")

                /**
                 * Returns the raw JSON value of [legalName].
                 *
                 * Unlike [legalName], this method doesn't throw if the JSON field has an unexpected
                 * type.
                 */
                @JsonProperty("legalName")
                @ExcludeMissing
                fun _legalName(): JsonField<String> = legalName

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
                 * Unlike [taxId], this method doesn't throw if the JSON field has an unexpected
                 * type.
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
                     * You should usually call [Builder.legalName] with a well-typed [String] value
                     * instead. This method is primarily for setting the field to an undocumented or
                     * not yet supported value.
                     */
                    fun legalName(legalName: JsonField<String>) = apply {
                        this.legalName = legalName
                    }

                    /** Business registration number */
                    fun registrationNumber(registrationNumber: String) =
                        registrationNumber(JsonField.of(registrationNumber))

                    /**
                     * Sets [Builder.registrationNumber] to an arbitrary JSON value.
                     *
                     * You should usually call [Builder.registrationNumber] with a well-typed
                     * [String] value instead. This method is primarily for setting the field to an
                     * undocumented or not yet supported value.
                     */
                    fun registrationNumber(registrationNumber: JsonField<String>) = apply {
                        this.registrationNumber = registrationNumber
                    }

                    /** Tax identification number */
                    fun taxId(taxId: String) = taxId(JsonField.of(taxId))

                    /**
                     * Sets [Builder.taxId] to an arbitrary JSON value.
                     *
                     * You should usually call [Builder.taxId] with a well-typed [String] value
                     * instead. This method is primarily for setting the field to an undocumented or
                     * not yet supported value.
                     */
                    fun taxId(taxId: JsonField<String>) = apply { this.taxId = taxId }

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

                return other is Business &&
                    umaAddress == other.umaAddress &&
                    customerType == other.customerType &&
                    address == other.address &&
                    beneficialOwners == other.beneficialOwners &&
                    businessInfo == other.businessInfo &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(
                    umaAddress,
                    customerType,
                    address,
                    beneficialOwners,
                    businessInfo,
                    additionalProperties,
                )
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "Business{umaAddress=$umaAddress, customerType=$customerType, address=$address, beneficialOwners=$beneficialOwners, businessInfo=$businessInfo, additionalProperties=$additionalProperties}"
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
