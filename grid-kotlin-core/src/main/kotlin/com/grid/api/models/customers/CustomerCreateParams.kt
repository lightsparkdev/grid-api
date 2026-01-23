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

/** Register a new customer in the system with an account identifier and bank account information */
class CustomerCreateParams
private constructor(
    private val body: Body,
    private val additionalHeaders: Headers,
    private val additionalQueryParams: QueryParams,
) : Params {

    fun body(): Body = body

    /** Additional headers to send with the request. */
    fun _additionalHeaders(): Headers = additionalHeaders

    /** Additional query param to send with the request. */
    fun _additionalQueryParams(): QueryParams = additionalQueryParams

    fun toBuilder() = Builder().from(this)

    companion object {

        /**
         * Returns a mutable builder for constructing an instance of [CustomerCreateParams].
         *
         * The following fields are required:
         * ```kotlin
         * .body()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [CustomerCreateParams]. */
    class Builder internal constructor() {

        private var body: Body? = null
        private var additionalHeaders: Headers.Builder = Headers.builder()
        private var additionalQueryParams: QueryParams.Builder = QueryParams.builder()

        internal fun from(customerCreateParams: CustomerCreateParams) = apply {
            body = customerCreateParams.body
            additionalHeaders = customerCreateParams.additionalHeaders.toBuilder()
            additionalQueryParams = customerCreateParams.additionalQueryParams.toBuilder()
        }

        fun body(body: Body) = apply { this.body = body }

        /**
         * Alias for calling [body] with
         * `Body.ofCustomersIndividualCustomerUpdate(customersIndividualCustomerUpdate)`.
         */
        fun body(customersIndividualCustomerUpdate: Body.CustomersIndividualCustomerUpdate) =
            body(Body.ofCustomersIndividualCustomerUpdate(customersIndividualCustomerUpdate))

        /**
         * Alias for calling [body] with
         * `Body.ofCustomersBusinessCustomerUpdate(customersBusinessCustomerUpdate)`.
         */
        fun body(customersBusinessCustomerUpdate: Body.CustomersBusinessCustomerUpdate) =
            body(Body.ofCustomersBusinessCustomerUpdate(customersBusinessCustomerUpdate))

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
         * Returns an immutable instance of [CustomerCreateParams].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .body()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): CustomerCreateParams =
            CustomerCreateParams(
                checkRequired("body", body),
                additionalHeaders.build(),
                additionalQueryParams.build(),
            )
    }

    fun _body(): Body = body

    override fun _headers(): Headers = additionalHeaders

    override fun _queryParams(): QueryParams = additionalQueryParams

    @JsonDeserialize(using = Body.Deserializer::class)
    @JsonSerialize(using = Body.Serializer::class)
    class Body
    private constructor(
        private val customersIndividualCustomerUpdate: CustomersIndividualCustomerUpdate? = null,
        private val customersBusinessCustomerUpdate: CustomersBusinessCustomerUpdate? = null,
        private val _json: JsonValue? = null,
    ) {

        fun customersIndividualCustomerUpdate(): CustomersIndividualCustomerUpdate? =
            customersIndividualCustomerUpdate

        fun customersBusinessCustomerUpdate(): CustomersBusinessCustomerUpdate? =
            customersBusinessCustomerUpdate

        fun isCustomersIndividualCustomerUpdate(): Boolean =
            customersIndividualCustomerUpdate != null

        fun isCustomersBusinessCustomerUpdate(): Boolean = customersBusinessCustomerUpdate != null

        fun asCustomersIndividualCustomerUpdate(): CustomersIndividualCustomerUpdate =
            customersIndividualCustomerUpdate.getOrThrow("customersIndividualCustomerUpdate")

        fun asCustomersBusinessCustomerUpdate(): CustomersBusinessCustomerUpdate =
            customersBusinessCustomerUpdate.getOrThrow("customersBusinessCustomerUpdate")

        fun _json(): JsonValue? = _json

        fun <T> accept(visitor: Visitor<T>): T =
            when {
                customersIndividualCustomerUpdate != null ->
                    visitor.visitCustomersIndividualCustomerUpdate(
                        customersIndividualCustomerUpdate
                    )
                customersBusinessCustomerUpdate != null ->
                    visitor.visitCustomersBusinessCustomerUpdate(customersBusinessCustomerUpdate)
                else -> visitor.unknown(_json)
            }

        private var validated: Boolean = false

        fun validate(): Body = apply {
            if (validated) {
                return@apply
            }

            accept(
                object : Visitor<Unit> {
                    override fun visitCustomersIndividualCustomerUpdate(
                        customersIndividualCustomerUpdate: CustomersIndividualCustomerUpdate
                    ) {
                        customersIndividualCustomerUpdate.validate()
                    }

                    override fun visitCustomersBusinessCustomerUpdate(
                        customersBusinessCustomerUpdate: CustomersBusinessCustomerUpdate
                    ) {
                        customersBusinessCustomerUpdate.validate()
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
                    override fun visitCustomersIndividualCustomerUpdate(
                        customersIndividualCustomerUpdate: CustomersIndividualCustomerUpdate
                    ) = customersIndividualCustomerUpdate.validity()

                    override fun visitCustomersBusinessCustomerUpdate(
                        customersBusinessCustomerUpdate: CustomersBusinessCustomerUpdate
                    ) = customersBusinessCustomerUpdate.validity()

                    override fun unknown(json: JsonValue?) = 0
                }
            )

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is Body &&
                customersIndividualCustomerUpdate == other.customersIndividualCustomerUpdate &&
                customersBusinessCustomerUpdate == other.customersBusinessCustomerUpdate
        }

        override fun hashCode(): Int =
            Objects.hash(customersIndividualCustomerUpdate, customersBusinessCustomerUpdate)

        override fun toString(): String =
            when {
                customersIndividualCustomerUpdate != null ->
                    "Body{customersIndividualCustomerUpdate=$customersIndividualCustomerUpdate}"
                customersBusinessCustomerUpdate != null ->
                    "Body{customersBusinessCustomerUpdate=$customersBusinessCustomerUpdate}"
                _json != null -> "Body{_unknown=$_json}"
                else -> throw IllegalStateException("Invalid Body")
            }

        companion object {

            fun ofCustomersIndividualCustomerUpdate(
                customersIndividualCustomerUpdate: CustomersIndividualCustomerUpdate
            ) = Body(customersIndividualCustomerUpdate = customersIndividualCustomerUpdate)

            fun ofCustomersBusinessCustomerUpdate(
                customersBusinessCustomerUpdate: CustomersBusinessCustomerUpdate
            ) = Body(customersBusinessCustomerUpdate = customersBusinessCustomerUpdate)
        }

        /** An interface that defines how to map each variant of [Body] to a value of type [T]. */
        interface Visitor<out T> {

            fun visitCustomersIndividualCustomerUpdate(
                customersIndividualCustomerUpdate: CustomersIndividualCustomerUpdate
            ): T

            fun visitCustomersBusinessCustomerUpdate(
                customersBusinessCustomerUpdate: CustomersBusinessCustomerUpdate
            ): T

            /**
             * Maps an unknown variant of [Body] to a value of type [T].
             *
             * An instance of [Body] can contain an unknown variant if it was deserialized from data
             * that doesn't match any known variant. For example, if the SDK is on an older version
             * than the API, then the API may respond with new variants that the SDK is unaware of.
             *
             * @throws GridInvalidDataException in the default implementation.
             */
            fun unknown(json: JsonValue?): T {
                throw GridInvalidDataException("Unknown Body: $json")
            }
        }

        internal class Deserializer : BaseDeserializer<Body>(Body::class) {

            override fun ObjectCodec.deserialize(node: JsonNode): Body {
                val json = JsonValue.fromJsonNode(node)

                val bestMatches =
                    sequenceOf(
                            tryDeserialize(
                                    node,
                                    jacksonTypeRef<CustomersIndividualCustomerUpdate>(),
                                )
                                ?.let {
                                    Body(customersIndividualCustomerUpdate = it, _json = json)
                                },
                            tryDeserialize(node, jacksonTypeRef<CustomersBusinessCustomerUpdate>())
                                ?.let { Body(customersBusinessCustomerUpdate = it, _json = json) },
                        )
                        .filterNotNull()
                        .allMaxBy { it.validity() }
                        .toList()
                return when (bestMatches.size) {
                    // This can happen if what we're deserializing is completely incompatible with
                    // all the possible variants (e.g. deserializing from boolean).
                    0 -> Body(_json = json)
                    1 -> bestMatches.single()
                    // If there's more than one match with the highest validity, then use the first
                    // completely valid match, or simply the first match if none are completely
                    // valid.
                    else -> bestMatches.firstOrNull { it.isValid() } ?: bestMatches.first()
                }
            }
        }

        internal class Serializer : BaseSerializer<Body>(Body::class) {

            override fun serialize(
                value: Body,
                generator: JsonGenerator,
                provider: SerializerProvider,
            ) {
                when {
                    value.customersIndividualCustomerUpdate != null ->
                        generator.writeObject(value.customersIndividualCustomerUpdate)
                    value.customersBusinessCustomerUpdate != null ->
                        generator.writeObject(value.customersBusinessCustomerUpdate)
                    value._json != null -> generator.writeObject(value._json)
                    else -> throw IllegalStateException("Invalid Body")
                }
            }
        }

        class CustomersIndividualCustomerUpdate
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val customerType: JsonValue,
            private val address: JsonField<Address>,
            private val birthDate: JsonField<LocalDate>,
            private val fullName: JsonField<String>,
            private val nationality: JsonField<String>,
            private val platformCustomerId: JsonField<String>,
            private val umaAddress: JsonField<String>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("customerType")
                @ExcludeMissing
                customerType: JsonValue = JsonMissing.of(),
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
                @JsonProperty("platformCustomerId")
                @ExcludeMissing
                platformCustomerId: JsonField<String> = JsonMissing.of(),
                @JsonProperty("umaAddress")
                @ExcludeMissing
                umaAddress: JsonField<String> = JsonMissing.of(),
            ) : this(
                customerType,
                address,
                birthDate,
                fullName,
                nationality,
                platformCustomerId,
                umaAddress,
                mutableMapOf(),
            )

            fun toIndividualCustomerUpdate(): IndividualCustomerUpdate =
                IndividualCustomerUpdate.builder()
                    .customerType(customerType)
                    .address(address)
                    .birthDate(birthDate)
                    .fullName(fullName)
                    .nationality(nationality)
                    .platformCustomerId(platformCustomerId)
                    .umaAddress(umaAddress)
                    .build()

            /**
             * Customer type
             *
             * Expected to always return the following:
             * ```kotlin
             * JsonValue.from("INDIVIDUAL")
             * ```
             *
             * However, this method can be useful for debugging and logging (e.g. if the server
             * responded with an unexpected value).
             */
            @JsonProperty("customerType")
            @ExcludeMissing
            fun _customerType(): JsonValue = customerType

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
             * Platform-specific customer identifier
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun platformCustomerId(): String? = platformCustomerId.getNullable("platformCustomerId")

            /**
             * Optional UMA address identifier. If not provided during customer creation, one will
             * be generated by the system. If provided during customer update, the UMA address will
             * be updated to the provided value. This is an optional identifier to route payments to
             * the customer.
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun umaAddress(): String? = umaAddress.getNullable("umaAddress")

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

            /**
             * Returns the raw JSON value of [platformCustomerId].
             *
             * Unlike [platformCustomerId], this method doesn't throw if the JSON field has an
             * unexpected type.
             */
            @JsonProperty("platformCustomerId")
            @ExcludeMissing
            fun _platformCustomerId(): JsonField<String> = platformCustomerId

            /**
             * Returns the raw JSON value of [umaAddress].
             *
             * Unlike [umaAddress], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("umaAddress")
            @ExcludeMissing
            fun _umaAddress(): JsonField<String> = umaAddress

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
                 * [CustomersIndividualCustomerUpdate].
                 */
                fun builder() = Builder()
            }

            /** A builder for [CustomersIndividualCustomerUpdate]. */
            class Builder internal constructor() {

                private var customerType: JsonValue = JsonValue.from("INDIVIDUAL")
                private var address: JsonField<Address> = JsonMissing.of()
                private var birthDate: JsonField<LocalDate> = JsonMissing.of()
                private var fullName: JsonField<String> = JsonMissing.of()
                private var nationality: JsonField<String> = JsonMissing.of()
                private var platformCustomerId: JsonField<String> = JsonMissing.of()
                private var umaAddress: JsonField<String> = JsonMissing.of()
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(
                    customersIndividualCustomerUpdate: CustomersIndividualCustomerUpdate
                ) = apply {
                    customerType = customersIndividualCustomerUpdate.customerType
                    address = customersIndividualCustomerUpdate.address
                    birthDate = customersIndividualCustomerUpdate.birthDate
                    fullName = customersIndividualCustomerUpdate.fullName
                    nationality = customersIndividualCustomerUpdate.nationality
                    platformCustomerId = customersIndividualCustomerUpdate.platformCustomerId
                    umaAddress = customersIndividualCustomerUpdate.umaAddress
                    additionalProperties =
                        customersIndividualCustomerUpdate.additionalProperties.toMutableMap()
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
                 * This method is primarily for setting the field to an undocumented or not yet
                 * supported value.
                 */
                fun customerType(customerType: JsonValue) = apply {
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

                /** Platform-specific customer identifier */
                fun platformCustomerId(platformCustomerId: String) =
                    platformCustomerId(JsonField.of(platformCustomerId))

                /**
                 * Sets [Builder.platformCustomerId] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.platformCustomerId] with a well-typed [String]
                 * value instead. This method is primarily for setting the field to an undocumented
                 * or not yet supported value.
                 */
                fun platformCustomerId(platformCustomerId: JsonField<String>) = apply {
                    this.platformCustomerId = platformCustomerId
                }

                /**
                 * Optional UMA address identifier. If not provided during customer creation, one
                 * will be generated by the system. If provided during customer update, the UMA
                 * address will be updated to the provided value. This is an optional identifier to
                 * route payments to the customer.
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
                 * Returns an immutable instance of [CustomersIndividualCustomerUpdate].
                 *
                 * Further updates to this [Builder] will not mutate the returned instance.
                 */
                fun build(): CustomersIndividualCustomerUpdate =
                    CustomersIndividualCustomerUpdate(
                        customerType,
                        address,
                        birthDate,
                        fullName,
                        nationality,
                        platformCustomerId,
                        umaAddress,
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): CustomersIndividualCustomerUpdate = apply {
                if (validated) {
                    return@apply
                }

                _customerType().let {
                    if (it != JsonValue.from("INDIVIDUAL")) {
                        throw GridInvalidDataException("'customerType' is invalid, received $it")
                    }
                }
                address()?.validate()
                birthDate()
                fullName()
                nationality()
                platformCustomerId()
                umaAddress()
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
                customerType.let { if (it == JsonValue.from("INDIVIDUAL")) 1 else 0 } +
                    (address.asKnown()?.validity() ?: 0) +
                    (if (birthDate.asKnown() == null) 0 else 1) +
                    (if (fullName.asKnown() == null) 0 else 1) +
                    (if (nationality.asKnown() == null) 0 else 1) +
                    (if (platformCustomerId.asKnown() == null) 0 else 1) +
                    (if (umaAddress.asKnown() == null) 0 else 1)

            /** Customer type discriminator */
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

                    val BUSINESS = of("BUSINESS")

                    fun of(value: String) = CustomerType(JsonField.of(value))
                }

                /** An enum containing [CustomerType]'s known values. */
                enum class Known {
                    INDIVIDUAL,
                    BUSINESS,
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
                        INDIVIDUAL -> Value.INDIVIDUAL
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
                        INDIVIDUAL -> Known.INDIVIDUAL
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

            override fun equals(other: Any?): Boolean {
                if (this === other) {
                    return true
                }

                return other is CustomersIndividualCustomerUpdate &&
                    customerType == other.customerType &&
                    address == other.address &&
                    birthDate == other.birthDate &&
                    fullName == other.fullName &&
                    nationality == other.nationality &&
                    platformCustomerId == other.platformCustomerId &&
                    umaAddress == other.umaAddress &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(
                    customerType,
                    address,
                    birthDate,
                    fullName,
                    nationality,
                    platformCustomerId,
                    umaAddress,
                    additionalProperties,
                )
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "CustomersIndividualCustomerUpdate{customerType=$customerType, address=$address, birthDate=$birthDate, fullName=$fullName, nationality=$nationality, platformCustomerId=$platformCustomerId, umaAddress=$umaAddress, additionalProperties=$additionalProperties}"
        }

        class CustomersBusinessCustomerUpdate
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val customerType: JsonValue,
            private val address: JsonField<Address>,
            private val beneficialOwners: JsonField<List<UltimateBeneficialOwner>>,
            private val businessInfo: JsonField<BusinessCustomerUpdate.BusinessInfo>,
            private val umaAddress: JsonField<String>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("customerType")
                @ExcludeMissing
                customerType: JsonValue = JsonMissing.of(),
                @JsonProperty("address")
                @ExcludeMissing
                address: JsonField<Address> = JsonMissing.of(),
                @JsonProperty("beneficialOwners")
                @ExcludeMissing
                beneficialOwners: JsonField<List<UltimateBeneficialOwner>> = JsonMissing.of(),
                @JsonProperty("businessInfo")
                @ExcludeMissing
                businessInfo: JsonField<BusinessCustomerUpdate.BusinessInfo> = JsonMissing.of(),
                @JsonProperty("umaAddress")
                @ExcludeMissing
                umaAddress: JsonField<String> = JsonMissing.of(),
            ) : this(
                customerType,
                address,
                beneficialOwners,
                businessInfo,
                umaAddress,
                mutableMapOf(),
            )

            fun toBusinessCustomerUpdate(): BusinessCustomerUpdate =
                BusinessCustomerUpdate.builder()
                    .customerType(customerType)
                    .address(address)
                    .beneficialOwners(beneficialOwners)
                    .businessInfo(businessInfo)
                    .umaAddress(umaAddress)
                    .build()

            /**
             * Customer type
             *
             * Expected to always return the following:
             * ```kotlin
             * JsonValue.from("BUSINESS")
             * ```
             *
             * However, this method can be useful for debugging and logging (e.g. if the server
             * responded with an unexpected value).
             */
            @JsonProperty("customerType")
            @ExcludeMissing
            fun _customerType(): JsonValue = customerType

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
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun businessInfo(): BusinessCustomerUpdate.BusinessInfo? =
                businessInfo.getNullable("businessInfo")

            /**
             * Optional UMA address identifier. If not provided, will be generated by the system.
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun umaAddress(): String? = umaAddress.getNullable("umaAddress")

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
            fun _businessInfo(): JsonField<BusinessCustomerUpdate.BusinessInfo> = businessInfo

            /**
             * Returns the raw JSON value of [umaAddress].
             *
             * Unlike [umaAddress], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("umaAddress")
            @ExcludeMissing
            fun _umaAddress(): JsonField<String> = umaAddress

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
                 * [CustomersBusinessCustomerUpdate].
                 */
                fun builder() = Builder()
            }

            /** A builder for [CustomersBusinessCustomerUpdate]. */
            class Builder internal constructor() {

                private var customerType: JsonValue = JsonValue.from("BUSINESS")
                private var address: JsonField<Address> = JsonMissing.of()
                private var beneficialOwners: JsonField<MutableList<UltimateBeneficialOwner>>? =
                    null
                private var businessInfo: JsonField<BusinessCustomerUpdate.BusinessInfo> =
                    JsonMissing.of()
                private var umaAddress: JsonField<String> = JsonMissing.of()
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(
                    customersBusinessCustomerUpdate: CustomersBusinessCustomerUpdate
                ) = apply {
                    customerType = customersBusinessCustomerUpdate.customerType
                    address = customersBusinessCustomerUpdate.address
                    beneficialOwners =
                        customersBusinessCustomerUpdate.beneficialOwners.map { it.toMutableList() }
                    businessInfo = customersBusinessCustomerUpdate.businessInfo
                    umaAddress = customersBusinessCustomerUpdate.umaAddress
                    additionalProperties =
                        customersBusinessCustomerUpdate.additionalProperties.toMutableMap()
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
                 * This method is primarily for setting the field to an undocumented or not yet
                 * supported value.
                 */
                fun customerType(customerType: JsonValue) = apply {
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

                fun businessInfo(businessInfo: BusinessCustomerUpdate.BusinessInfo) =
                    businessInfo(JsonField.of(businessInfo))

                /**
                 * Sets [Builder.businessInfo] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.businessInfo] with a well-typed
                 * [BusinessCustomerUpdate.BusinessInfo] value instead. This method is primarily for
                 * setting the field to an undocumented or not yet supported value.
                 */
                fun businessInfo(businessInfo: JsonField<BusinessCustomerUpdate.BusinessInfo>) =
                    apply {
                        this.businessInfo = businessInfo
                    }

                /**
                 * Optional UMA address identifier. If not provided, will be generated by the
                 * system.
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
                 * Returns an immutable instance of [CustomersBusinessCustomerUpdate].
                 *
                 * Further updates to this [Builder] will not mutate the returned instance.
                 */
                fun build(): CustomersBusinessCustomerUpdate =
                    CustomersBusinessCustomerUpdate(
                        customerType,
                        address,
                        (beneficialOwners ?: JsonMissing.of()).map { it.toImmutable() },
                        businessInfo,
                        umaAddress,
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): CustomersBusinessCustomerUpdate = apply {
                if (validated) {
                    return@apply
                }

                _customerType().let {
                    if (it != JsonValue.from("BUSINESS")) {
                        throw GridInvalidDataException("'customerType' is invalid, received $it")
                    }
                }
                address()?.validate()
                beneficialOwners()?.forEach { it.validate() }
                businessInfo()?.validate()
                umaAddress()
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
                customerType.let { if (it == JsonValue.from("BUSINESS")) 1 else 0 } +
                    (address.asKnown()?.validity() ?: 0) +
                    (beneficialOwners.asKnown()?.sumOf { it.validity().toInt() } ?: 0) +
                    (businessInfo.asKnown()?.validity() ?: 0) +
                    (if (umaAddress.asKnown() == null) 0 else 1)

            /** Customer type discriminator */
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

                    val BUSINESS = of("BUSINESS")

                    fun of(value: String) = CustomerType(JsonField.of(value))
                }

                /** An enum containing [CustomerType]'s known values. */
                enum class Known {
                    INDIVIDUAL,
                    BUSINESS,
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
                        INDIVIDUAL -> Value.INDIVIDUAL
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
                        INDIVIDUAL -> Known.INDIVIDUAL
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

            override fun equals(other: Any?): Boolean {
                if (this === other) {
                    return true
                }

                return other is CustomersBusinessCustomerUpdate &&
                    customerType == other.customerType &&
                    address == other.address &&
                    beneficialOwners == other.beneficialOwners &&
                    businessInfo == other.businessInfo &&
                    umaAddress == other.umaAddress &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(
                    customerType,
                    address,
                    beneficialOwners,
                    businessInfo,
                    umaAddress,
                    additionalProperties,
                )
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "CustomersBusinessCustomerUpdate{customerType=$customerType, address=$address, beneficialOwners=$beneficialOwners, businessInfo=$businessInfo, umaAddress=$umaAddress, additionalProperties=$additionalProperties}"
        }
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is CustomerCreateParams &&
            body == other.body &&
            additionalHeaders == other.additionalHeaders &&
            additionalQueryParams == other.additionalQueryParams
    }

    override fun hashCode(): Int = Objects.hash(body, additionalHeaders, additionalQueryParams)

    override fun toString() =
        "CustomerCreateParams{body=$body, additionalHeaders=$additionalHeaders, additionalQueryParams=$additionalQueryParams}"
}
