// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers

import com.fasterxml.jackson.annotation.JsonCreator
import com.grid.api.core.Enum
import com.grid.api.core.JsonField
import com.grid.api.core.Params
import com.grid.api.core.http.Headers
import com.grid.api.core.http.QueryParams
import com.grid.api.errors.GridInvalidDataException
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter
import java.util.Objects

/**
 * Retrieve a list of customers with optional filtering parameters. Returns all customers that match
 * the specified filters. If no filters are provided, returns all customers (paginated).
 */
class CustomerListParams
private constructor(
    private val createdAfter: OffsetDateTime?,
    private val createdBefore: OffsetDateTime?,
    private val cursor: String?,
    private val customerType: CustomerType?,
    private val isIncludingDeleted: Boolean?,
    private val limit: Long?,
    private val platformCustomerId: String?,
    private val umaAddress: String?,
    private val updatedAfter: OffsetDateTime?,
    private val updatedBefore: OffsetDateTime?,
    private val additionalHeaders: Headers,
    private val additionalQueryParams: QueryParams,
) : Params {

    /** Filter customers created after this timestamp (inclusive) */
    fun createdAfter(): OffsetDateTime? = createdAfter

    /** Filter customers created before this timestamp (inclusive) */
    fun createdBefore(): OffsetDateTime? = createdBefore

    /** Cursor for pagination (returned from previous request) */
    fun cursor(): String? = cursor

    /** Filter by customer type */
    fun customerType(): CustomerType? = customerType

    /** Whether to include deleted customers in the results. Default is false. */
    fun isIncludingDeleted(): Boolean? = isIncludingDeleted

    /** Maximum number of results to return (default 20, max 100) */
    fun limit(): Long? = limit

    /** Filter by platform-specific customer identifier */
    fun platformCustomerId(): String? = platformCustomerId

    /** Filter by uma address */
    fun umaAddress(): String? = umaAddress

    /** Filter customers updated after this timestamp (inclusive) */
    fun updatedAfter(): OffsetDateTime? = updatedAfter

    /** Filter customers updated before this timestamp (inclusive) */
    fun updatedBefore(): OffsetDateTime? = updatedBefore

    /** Additional headers to send with the request. */
    fun _additionalHeaders(): Headers = additionalHeaders

    /** Additional query param to send with the request. */
    fun _additionalQueryParams(): QueryParams = additionalQueryParams

    fun toBuilder() = Builder().from(this)

    companion object {

        fun none(): CustomerListParams = builder().build()

        /** Returns a mutable builder for constructing an instance of [CustomerListParams]. */
        fun builder() = Builder()
    }

    /** A builder for [CustomerListParams]. */
    class Builder internal constructor() {

        private var createdAfter: OffsetDateTime? = null
        private var createdBefore: OffsetDateTime? = null
        private var cursor: String? = null
        private var customerType: CustomerType? = null
        private var isIncludingDeleted: Boolean? = null
        private var limit: Long? = null
        private var platformCustomerId: String? = null
        private var umaAddress: String? = null
        private var updatedAfter: OffsetDateTime? = null
        private var updatedBefore: OffsetDateTime? = null
        private var additionalHeaders: Headers.Builder = Headers.builder()
        private var additionalQueryParams: QueryParams.Builder = QueryParams.builder()

        internal fun from(customerListParams: CustomerListParams) = apply {
            createdAfter = customerListParams.createdAfter
            createdBefore = customerListParams.createdBefore
            cursor = customerListParams.cursor
            customerType = customerListParams.customerType
            isIncludingDeleted = customerListParams.isIncludingDeleted
            limit = customerListParams.limit
            platformCustomerId = customerListParams.platformCustomerId
            umaAddress = customerListParams.umaAddress
            updatedAfter = customerListParams.updatedAfter
            updatedBefore = customerListParams.updatedBefore
            additionalHeaders = customerListParams.additionalHeaders.toBuilder()
            additionalQueryParams = customerListParams.additionalQueryParams.toBuilder()
        }

        /** Filter customers created after this timestamp (inclusive) */
        fun createdAfter(createdAfter: OffsetDateTime?) = apply { this.createdAfter = createdAfter }

        /** Filter customers created before this timestamp (inclusive) */
        fun createdBefore(createdBefore: OffsetDateTime?) = apply {
            this.createdBefore = createdBefore
        }

        /** Cursor for pagination (returned from previous request) */
        fun cursor(cursor: String?) = apply { this.cursor = cursor }

        /** Filter by customer type */
        fun customerType(customerType: CustomerType?) = apply { this.customerType = customerType }

        /** Whether to include deleted customers in the results. Default is false. */
        fun isIncludingDeleted(isIncludingDeleted: Boolean?) = apply {
            this.isIncludingDeleted = isIncludingDeleted
        }

        /**
         * Alias for [Builder.isIncludingDeleted].
         *
         * This unboxed primitive overload exists for backwards compatibility.
         */
        fun isIncludingDeleted(isIncludingDeleted: Boolean) =
            isIncludingDeleted(isIncludingDeleted as Boolean?)

        /** Maximum number of results to return (default 20, max 100) */
        fun limit(limit: Long?) = apply { this.limit = limit }

        /**
         * Alias for [Builder.limit].
         *
         * This unboxed primitive overload exists for backwards compatibility.
         */
        fun limit(limit: Long) = limit(limit as Long?)

        /** Filter by platform-specific customer identifier */
        fun platformCustomerId(platformCustomerId: String?) = apply {
            this.platformCustomerId = platformCustomerId
        }

        /** Filter by uma address */
        fun umaAddress(umaAddress: String?) = apply { this.umaAddress = umaAddress }

        /** Filter customers updated after this timestamp (inclusive) */
        fun updatedAfter(updatedAfter: OffsetDateTime?) = apply { this.updatedAfter = updatedAfter }

        /** Filter customers updated before this timestamp (inclusive) */
        fun updatedBefore(updatedBefore: OffsetDateTime?) = apply {
            this.updatedBefore = updatedBefore
        }

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
         * Returns an immutable instance of [CustomerListParams].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         */
        fun build(): CustomerListParams =
            CustomerListParams(
                createdAfter,
                createdBefore,
                cursor,
                customerType,
                isIncludingDeleted,
                limit,
                platformCustomerId,
                umaAddress,
                updatedAfter,
                updatedBefore,
                additionalHeaders.build(),
                additionalQueryParams.build(),
            )
    }

    override fun _headers(): Headers = additionalHeaders

    override fun _queryParams(): QueryParams =
        QueryParams.builder()
            .apply {
                createdAfter?.let {
                    put("createdAfter", DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(it))
                }
                createdBefore?.let {
                    put("createdBefore", DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(it))
                }
                cursor?.let { put("cursor", it) }
                customerType?.let { put("customerType", it.toString()) }
                isIncludingDeleted?.let { put("isIncludingDeleted", it.toString()) }
                limit?.let { put("limit", it.toString()) }
                platformCustomerId?.let { put("platformCustomerId", it) }
                umaAddress?.let { put("umaAddress", it) }
                updatedAfter?.let {
                    put("updatedAfter", DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(it))
                }
                updatedBefore?.let {
                    put("updatedBefore", DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(it))
                }
                putAll(additionalQueryParams)
            }
            .build()

    /** Filter by customer type */
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
         * An enum containing [CustomerType]'s known values, as well as an [_UNKNOWN] member.
         *
         * An instance of [CustomerType] can contain an unknown value in a couple of cases:
         * - It was deserialized from data that doesn't match any known member. For example, if the
         *   SDK is on an older version than the API, then the API may respond with new members that
         *   the SDK is unaware of.
         * - It was constructed with an arbitrary value using the [of] method.
         */
        enum class Value {
            INDIVIDUAL,
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
                INDIVIDUAL -> Value.INDIVIDUAL
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
                INDIVIDUAL -> Known.INDIVIDUAL
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

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is CustomerListParams &&
            createdAfter == other.createdAfter &&
            createdBefore == other.createdBefore &&
            cursor == other.cursor &&
            customerType == other.customerType &&
            isIncludingDeleted == other.isIncludingDeleted &&
            limit == other.limit &&
            platformCustomerId == other.platformCustomerId &&
            umaAddress == other.umaAddress &&
            updatedAfter == other.updatedAfter &&
            updatedBefore == other.updatedBefore &&
            additionalHeaders == other.additionalHeaders &&
            additionalQueryParams == other.additionalQueryParams
    }

    override fun hashCode(): Int =
        Objects.hash(
            createdAfter,
            createdBefore,
            cursor,
            customerType,
            isIncludingDeleted,
            limit,
            platformCustomerId,
            umaAddress,
            updatedAfter,
            updatedBefore,
            additionalHeaders,
            additionalQueryParams,
        )

    override fun toString() =
        "CustomerListParams{createdAfter=$createdAfter, createdBefore=$createdBefore, cursor=$cursor, customerType=$customerType, isIncludingDeleted=$isIncludingDeleted, limit=$limit, platformCustomerId=$platformCustomerId, umaAddress=$umaAddress, updatedAfter=$updatedAfter, updatedBefore=$updatedBefore, additionalHeaders=$additionalHeaders, additionalQueryParams=$additionalQueryParams}"
}
