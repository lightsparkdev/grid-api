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

        /** Alias for calling [body] with `Body.ofNewIndividualCustomer(newIndividualCustomer)`. */
        fun body(newIndividualCustomer: Body.NewIndividualCustomer) =
            body(Body.ofNewIndividualCustomer(newIndividualCustomer))

        /** Alias for calling [body] with `Body.ofNewBusinessCustomer(newBusinessCustomer)`. */
        fun body(newBusinessCustomer: Body.NewBusinessCustomer) =
            body(Body.ofNewBusinessCustomer(newBusinessCustomer))

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
        private val newIndividualCustomer: NewIndividualCustomer? = null,
        private val newBusinessCustomer: NewBusinessCustomer? = null,
        private val _json: JsonValue? = null,
    ) {

        fun newIndividualCustomer(): NewIndividualCustomer? = newIndividualCustomer

        fun newBusinessCustomer(): NewBusinessCustomer? = newBusinessCustomer

        fun isNewIndividualCustomer(): Boolean = newIndividualCustomer != null

        fun isNewBusinessCustomer(): Boolean = newBusinessCustomer != null

        fun asNewIndividualCustomer(): NewIndividualCustomer =
            newIndividualCustomer.getOrThrow("newIndividualCustomer")

        fun asNewBusinessCustomer(): NewBusinessCustomer =
            newBusinessCustomer.getOrThrow("newBusinessCustomer")

        fun _json(): JsonValue? = _json

        fun <T> accept(visitor: Visitor<T>): T =
            when {
                newIndividualCustomer != null ->
                    visitor.visitNewIndividualCustomer(newIndividualCustomer)
                newBusinessCustomer != null -> visitor.visitNewBusinessCustomer(newBusinessCustomer)
                else -> visitor.unknown(_json)
            }

        private var validated: Boolean = false

        fun validate(): Body = apply {
            if (validated) {
                return@apply
            }

            accept(
                object : Visitor<Unit> {
                    override fun visitNewIndividualCustomer(
                        newIndividualCustomer: NewIndividualCustomer
                    ) {
                        newIndividualCustomer.validate()
                    }

                    override fun visitNewBusinessCustomer(
                        newBusinessCustomer: NewBusinessCustomer
                    ) {
                        newBusinessCustomer.validate()
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
                    override fun visitNewIndividualCustomer(
                        newIndividualCustomer: NewIndividualCustomer
                    ) = newIndividualCustomer.validity()

                    override fun visitNewBusinessCustomer(
                        newBusinessCustomer: NewBusinessCustomer
                    ) = newBusinessCustomer.validity()

                    override fun unknown(json: JsonValue?) = 0
                }
            )

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is Body &&
                newIndividualCustomer == other.newIndividualCustomer &&
                newBusinessCustomer == other.newBusinessCustomer
        }

        override fun hashCode(): Int = Objects.hash(newIndividualCustomer, newBusinessCustomer)

        override fun toString(): String =
            when {
                newIndividualCustomer != null ->
                    "Body{newIndividualCustomer=$newIndividualCustomer}"
                newBusinessCustomer != null -> "Body{newBusinessCustomer=$newBusinessCustomer}"
                _json != null -> "Body{_unknown=$_json}"
                else -> throw IllegalStateException("Invalid Body")
            }

        companion object {

            fun ofNewIndividualCustomer(newIndividualCustomer: NewIndividualCustomer) =
                Body(newIndividualCustomer = newIndividualCustomer)

            fun ofNewBusinessCustomer(newBusinessCustomer: NewBusinessCustomer) =
                Body(newBusinessCustomer = newBusinessCustomer)
        }

        /** An interface that defines how to map each variant of [Body] to a value of type [T]. */
        interface Visitor<out T> {

            fun visitNewIndividualCustomer(newIndividualCustomer: NewIndividualCustomer): T

            fun visitNewBusinessCustomer(newBusinessCustomer: NewBusinessCustomer): T

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
                            tryDeserialize(node, jacksonTypeRef<NewIndividualCustomer>())?.let {
                                Body(newIndividualCustomer = it, _json = json)
                            },
                            tryDeserialize(node, jacksonTypeRef<NewBusinessCustomer>())?.let {
                                Body(newBusinessCustomer = it, _json = json)
                            },
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
                    value.newIndividualCustomer != null ->
                        generator.writeObject(value.newIndividualCustomer)
                    value.newBusinessCustomer != null ->
                        generator.writeObject(value.newBusinessCustomer)
                    value._json != null -> generator.writeObject(value._json)
                    else -> throw IllegalStateException("Invalid Body")
                }
            }
        }

        class NewIndividualCustomer
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val customerType: JsonField<IndividualCustomerUpdate.CustomerType>,
            private val address: JsonField<Address>,
            private val birthDate: JsonField<LocalDate>,
            private val fullName: JsonField<String>,
            private val nationality: JsonField<String>,
            private val umaAddress: JsonField<String>,
            private val platformCustomerId: JsonField<String>,
            private val kycUrl: JsonField<String>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("customerType")
                @ExcludeMissing
                customerType: JsonField<IndividualCustomerUpdate.CustomerType> = JsonMissing.of(),
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
                @JsonProperty("umaAddress")
                @ExcludeMissing
                umaAddress: JsonField<String> = JsonMissing.of(),
                @JsonProperty("platformCustomerId")
                @ExcludeMissing
                platformCustomerId: JsonField<String> = JsonMissing.of(),
                @JsonProperty("kycUrl") @ExcludeMissing kycUrl: JsonField<String> = JsonMissing.of(),
            ) : this(
                customerType,
                address,
                birthDate,
                fullName,
                nationality,
                umaAddress,
                platformCustomerId,
                kycUrl,
                mutableMapOf(),
            )

            fun toIndividualCustomerUpdate(): IndividualCustomerUpdate =
                IndividualCustomerUpdate.builder()
                    .customerType(customerType)
                    .address(address)
                    .birthDate(birthDate)
                    .fullName(fullName)
                    .nationality(nationality)
                    .umaAddress(umaAddress)
                    .build()

            /**
             * Customer type
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun customerType(): IndividualCustomerUpdate.CustomerType =
                customerType.getRequired("customerType")

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
             * Platform-specific customer identifier
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun platformCustomerId(): String = platformCustomerId.getRequired("platformCustomerId")

            /**
             * A KYC URL to be shared with your individual customer if KYC needs to be completed
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun kycUrl(): String? = kycUrl.getNullable("kycUrl")

            /**
             * Returns the raw JSON value of [customerType].
             *
             * Unlike [customerType], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("customerType")
            @ExcludeMissing
            fun _customerType(): JsonField<IndividualCustomerUpdate.CustomerType> = customerType

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
             * Returns the raw JSON value of [umaAddress].
             *
             * Unlike [umaAddress], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("umaAddress")
            @ExcludeMissing
            fun _umaAddress(): JsonField<String> = umaAddress

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
             * Returns the raw JSON value of [kycUrl].
             *
             * Unlike [kycUrl], this method doesn't throw if the JSON field has an unexpected type.
             */
            @JsonProperty("kycUrl") @ExcludeMissing fun _kycUrl(): JsonField<String> = kycUrl

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
                 * [NewIndividualCustomer].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .customerType()
                 * .platformCustomerId()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [NewIndividualCustomer]. */
            class Builder internal constructor() {

                private var customerType: JsonField<IndividualCustomerUpdate.CustomerType>? = null
                private var address: JsonField<Address> = JsonMissing.of()
                private var birthDate: JsonField<LocalDate> = JsonMissing.of()
                private var fullName: JsonField<String> = JsonMissing.of()
                private var nationality: JsonField<String> = JsonMissing.of()
                private var umaAddress: JsonField<String> = JsonMissing.of()
                private var platformCustomerId: JsonField<String>? = null
                private var kycUrl: JsonField<String> = JsonMissing.of()
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(newIndividualCustomer: NewIndividualCustomer) = apply {
                    customerType = newIndividualCustomer.customerType
                    address = newIndividualCustomer.address
                    birthDate = newIndividualCustomer.birthDate
                    fullName = newIndividualCustomer.fullName
                    nationality = newIndividualCustomer.nationality
                    umaAddress = newIndividualCustomer.umaAddress
                    platformCustomerId = newIndividualCustomer.platformCustomerId
                    kycUrl = newIndividualCustomer.kycUrl
                    additionalProperties = newIndividualCustomer.additionalProperties.toMutableMap()
                }

                /** Customer type */
                fun customerType(customerType: IndividualCustomerUpdate.CustomerType) =
                    customerType(JsonField.of(customerType))

                /**
                 * Sets [Builder.customerType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.customerType] with a well-typed
                 * [IndividualCustomerUpdate.CustomerType] value instead. This method is primarily
                 * for setting the field to an undocumented or not yet supported value.
                 */
                fun customerType(customerType: JsonField<IndividualCustomerUpdate.CustomerType>) =
                    apply {
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
                 * A KYC URL to be shared with your individual customer if KYC needs to be completed
                 */
                fun kycUrl(kycUrl: String) = kycUrl(JsonField.of(kycUrl))

                /**
                 * Sets [Builder.kycUrl] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.kycUrl] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun kycUrl(kycUrl: JsonField<String>) = apply { this.kycUrl = kycUrl }

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
                 * Returns an immutable instance of [NewIndividualCustomer].
                 *
                 * Further updates to this [Builder] will not mutate the returned instance.
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .customerType()
                 * .platformCustomerId()
                 * ```
                 *
                 * @throws IllegalStateException if any required field is unset.
                 */
                fun build(): NewIndividualCustomer =
                    NewIndividualCustomer(
                        checkRequired("customerType", customerType),
                        address,
                        birthDate,
                        fullName,
                        nationality,
                        umaAddress,
                        checkRequired("platformCustomerId", platformCustomerId),
                        kycUrl,
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): NewIndividualCustomer = apply {
                if (validated) {
                    return@apply
                }

                customerType().validate()
                address()?.validate()
                birthDate()
                fullName()
                nationality()
                umaAddress()
                platformCustomerId()
                kycUrl()
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
                    (address.asKnown()?.validity() ?: 0) +
                    (if (birthDate.asKnown() == null) 0 else 1) +
                    (if (fullName.asKnown() == null) 0 else 1) +
                    (if (nationality.asKnown() == null) 0 else 1) +
                    (if (umaAddress.asKnown() == null) 0 else 1) +
                    (if (platformCustomerId.asKnown() == null) 0 else 1) +
                    (if (kycUrl.asKnown() == null) 0 else 1)

            override fun equals(other: Any?): Boolean {
                if (this === other) {
                    return true
                }

                return other is NewIndividualCustomer &&
                    customerType == other.customerType &&
                    address == other.address &&
                    birthDate == other.birthDate &&
                    fullName == other.fullName &&
                    nationality == other.nationality &&
                    umaAddress == other.umaAddress &&
                    platformCustomerId == other.platformCustomerId &&
                    kycUrl == other.kycUrl &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(
                    customerType,
                    address,
                    birthDate,
                    fullName,
                    nationality,
                    umaAddress,
                    platformCustomerId,
                    kycUrl,
                    additionalProperties,
                )
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "NewIndividualCustomer{customerType=$customerType, address=$address, birthDate=$birthDate, fullName=$fullName, nationality=$nationality, umaAddress=$umaAddress, platformCustomerId=$platformCustomerId, kycUrl=$kycUrl, additionalProperties=$additionalProperties}"
        }

        class NewBusinessCustomer
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val customerType: JsonField<BusinessCustomerUpdate.CustomerType>,
            private val address: JsonField<Address>,
            private val beneficialOwners: JsonField<List<UltimateBeneficialOwner>>,
            private val businessInfo: JsonField<BusinessCustomerUpdate.BusinessInfo>,
            private val umaAddress: JsonField<String>,
            private val platformCustomerId: JsonField<String>,
            private val kycUrl: JsonField<String>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("customerType")
                @ExcludeMissing
                customerType: JsonField<BusinessCustomerUpdate.CustomerType> = JsonMissing.of(),
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
                @JsonProperty("platformCustomerId")
                @ExcludeMissing
                platformCustomerId: JsonField<String> = JsonMissing.of(),
                @JsonProperty("kycUrl") @ExcludeMissing kycUrl: JsonField<String> = JsonMissing.of(),
            ) : this(
                customerType,
                address,
                beneficialOwners,
                businessInfo,
                umaAddress,
                platformCustomerId,
                kycUrl,
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
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun customerType(): BusinessCustomerUpdate.CustomerType =
                customerType.getRequired("customerType")

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
             * Platform-specific customer identifier
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun platformCustomerId(): String = platformCustomerId.getRequired("platformCustomerId")

            /**
             * A KYC URL to be shared with your business customer if KYC needs to be completed
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun kycUrl(): String? = kycUrl.getNullable("kycUrl")

            /**
             * Returns the raw JSON value of [customerType].
             *
             * Unlike [customerType], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("customerType")
            @ExcludeMissing
            fun _customerType(): JsonField<BusinessCustomerUpdate.CustomerType> = customerType

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
             * Returns the raw JSON value of [kycUrl].
             *
             * Unlike [kycUrl], this method doesn't throw if the JSON field has an unexpected type.
             */
            @JsonProperty("kycUrl") @ExcludeMissing fun _kycUrl(): JsonField<String> = kycUrl

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
                 * Returns a mutable builder for constructing an instance of [NewBusinessCustomer].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .customerType()
                 * .platformCustomerId()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [NewBusinessCustomer]. */
            class Builder internal constructor() {

                private var customerType: JsonField<BusinessCustomerUpdate.CustomerType>? = null
                private var address: JsonField<Address> = JsonMissing.of()
                private var beneficialOwners: JsonField<MutableList<UltimateBeneficialOwner>>? =
                    null
                private var businessInfo: JsonField<BusinessCustomerUpdate.BusinessInfo> =
                    JsonMissing.of()
                private var umaAddress: JsonField<String> = JsonMissing.of()
                private var platformCustomerId: JsonField<String>? = null
                private var kycUrl: JsonField<String> = JsonMissing.of()
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(newBusinessCustomer: NewBusinessCustomer) = apply {
                    customerType = newBusinessCustomer.customerType
                    address = newBusinessCustomer.address
                    beneficialOwners =
                        newBusinessCustomer.beneficialOwners.map { it.toMutableList() }
                    businessInfo = newBusinessCustomer.businessInfo
                    umaAddress = newBusinessCustomer.umaAddress
                    platformCustomerId = newBusinessCustomer.platformCustomerId
                    kycUrl = newBusinessCustomer.kycUrl
                    additionalProperties = newBusinessCustomer.additionalProperties.toMutableMap()
                }

                /** Customer type */
                fun customerType(customerType: BusinessCustomerUpdate.CustomerType) =
                    customerType(JsonField.of(customerType))

                /**
                 * Sets [Builder.customerType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.customerType] with a well-typed
                 * [BusinessCustomerUpdate.CustomerType] value instead. This method is primarily for
                 * setting the field to an undocumented or not yet supported value.
                 */
                fun customerType(customerType: JsonField<BusinessCustomerUpdate.CustomerType>) =
                    apply {
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
                 * A KYC URL to be shared with your business customer if KYC needs to be completed
                 */
                fun kycUrl(kycUrl: String) = kycUrl(JsonField.of(kycUrl))

                /**
                 * Sets [Builder.kycUrl] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.kycUrl] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun kycUrl(kycUrl: JsonField<String>) = apply { this.kycUrl = kycUrl }

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
                 * Returns an immutable instance of [NewBusinessCustomer].
                 *
                 * Further updates to this [Builder] will not mutate the returned instance.
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .customerType()
                 * .platformCustomerId()
                 * ```
                 *
                 * @throws IllegalStateException if any required field is unset.
                 */
                fun build(): NewBusinessCustomer =
                    NewBusinessCustomer(
                        checkRequired("customerType", customerType),
                        address,
                        (beneficialOwners ?: JsonMissing.of()).map { it.toImmutable() },
                        businessInfo,
                        umaAddress,
                        checkRequired("platformCustomerId", platformCustomerId),
                        kycUrl,
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): NewBusinessCustomer = apply {
                if (validated) {
                    return@apply
                }

                customerType().validate()
                address()?.validate()
                beneficialOwners()?.forEach { it.validate() }
                businessInfo()?.validate()
                umaAddress()
                platformCustomerId()
                kycUrl()
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
                    (address.asKnown()?.validity() ?: 0) +
                    (beneficialOwners.asKnown()?.sumOf { it.validity().toInt() } ?: 0) +
                    (businessInfo.asKnown()?.validity() ?: 0) +
                    (if (umaAddress.asKnown() == null) 0 else 1) +
                    (if (platformCustomerId.asKnown() == null) 0 else 1) +
                    (if (kycUrl.asKnown() == null) 0 else 1)

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
                 * @throws GridInvalidDataException if the JSON field has an unexpected type or is
                 *   unexpectedly missing or null (e.g. if the server responded with an unexpected
                 *   value).
                 */
                fun legalName(): String = legalName.getRequired("legalName")

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

                return other is NewBusinessCustomer &&
                    customerType == other.customerType &&
                    address == other.address &&
                    beneficialOwners == other.beneficialOwners &&
                    businessInfo == other.businessInfo &&
                    umaAddress == other.umaAddress &&
                    platformCustomerId == other.platformCustomerId &&
                    kycUrl == other.kycUrl &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(
                    customerType,
                    address,
                    beneficialOwners,
                    businessInfo,
                    umaAddress,
                    platformCustomerId,
                    kycUrl,
                    additionalProperties,
                )
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "NewBusinessCustomer{customerType=$customerType, address=$address, beneficialOwners=$beneficialOwners, businessInfo=$businessInfo, umaAddress=$umaAddress, platformCustomerId=$platformCustomerId, kycUrl=$kycUrl, additionalProperties=$additionalProperties}"
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
