// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.quotes

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
 * Retrieve a list of transfer quotes with optional filtering parameters. Returns all quotes that
 * match the specified filters. If no filters are provided, returns all quotes (paginated).
 */
class QuoteListParams
private constructor(
    private val createdAfter: OffsetDateTime?,
    private val createdBefore: OffsetDateTime?,
    private val cursor: String?,
    private val customerId: String?,
    private val limit: Long?,
    private val receivingAccountId: String?,
    private val receivingUmaAddress: String?,
    private val sendingAccountId: String?,
    private val sendingUmaAddress: String?,
    private val status: Status?,
    private val additionalHeaders: Headers,
    private val additionalQueryParams: QueryParams,
) : Params {

    /** Filter quotes created after this timestamp (inclusive) */
    fun createdAfter(): OffsetDateTime? = createdAfter

    /** Filter quotes created before this timestamp (inclusive) */
    fun createdBefore(): OffsetDateTime? = createdBefore

    /** Cursor for pagination (returned from previous request) */
    fun cursor(): String? = cursor

    /** Filter by sending customer ID */
    fun customerId(): String? = customerId

    /** Maximum number of results to return (default 20, max 100) */
    fun limit(): Long? = limit

    /** Filter by receiving account ID */
    fun receivingAccountId(): String? = receivingAccountId

    /** Filter by receiving UMA address */
    fun receivingUmaAddress(): String? = receivingUmaAddress

    /** Filter by sending account ID */
    fun sendingAccountId(): String? = sendingAccountId

    /** Filter by sending UMA address */
    fun sendingUmaAddress(): String? = sendingUmaAddress

    /** Filter by quote status */
    fun status(): Status? = status

    /** Additional headers to send with the request. */
    fun _additionalHeaders(): Headers = additionalHeaders

    /** Additional query param to send with the request. */
    fun _additionalQueryParams(): QueryParams = additionalQueryParams

    fun toBuilder() = Builder().from(this)

    companion object {

        fun none(): QuoteListParams = builder().build()

        /** Returns a mutable builder for constructing an instance of [QuoteListParams]. */
        fun builder() = Builder()
    }

    /** A builder for [QuoteListParams]. */
    class Builder internal constructor() {

        private var createdAfter: OffsetDateTime? = null
        private var createdBefore: OffsetDateTime? = null
        private var cursor: String? = null
        private var customerId: String? = null
        private var limit: Long? = null
        private var receivingAccountId: String? = null
        private var receivingUmaAddress: String? = null
        private var sendingAccountId: String? = null
        private var sendingUmaAddress: String? = null
        private var status: Status? = null
        private var additionalHeaders: Headers.Builder = Headers.builder()
        private var additionalQueryParams: QueryParams.Builder = QueryParams.builder()

        internal fun from(quoteListParams: QuoteListParams) = apply {
            createdAfter = quoteListParams.createdAfter
            createdBefore = quoteListParams.createdBefore
            cursor = quoteListParams.cursor
            customerId = quoteListParams.customerId
            limit = quoteListParams.limit
            receivingAccountId = quoteListParams.receivingAccountId
            receivingUmaAddress = quoteListParams.receivingUmaAddress
            sendingAccountId = quoteListParams.sendingAccountId
            sendingUmaAddress = quoteListParams.sendingUmaAddress
            status = quoteListParams.status
            additionalHeaders = quoteListParams.additionalHeaders.toBuilder()
            additionalQueryParams = quoteListParams.additionalQueryParams.toBuilder()
        }

        /** Filter quotes created after this timestamp (inclusive) */
        fun createdAfter(createdAfter: OffsetDateTime?) = apply { this.createdAfter = createdAfter }

        /** Filter quotes created before this timestamp (inclusive) */
        fun createdBefore(createdBefore: OffsetDateTime?) = apply {
            this.createdBefore = createdBefore
        }

        /** Cursor for pagination (returned from previous request) */
        fun cursor(cursor: String?) = apply { this.cursor = cursor }

        /** Filter by sending customer ID */
        fun customerId(customerId: String?) = apply { this.customerId = customerId }

        /** Maximum number of results to return (default 20, max 100) */
        fun limit(limit: Long?) = apply { this.limit = limit }

        /**
         * Alias for [Builder.limit].
         *
         * This unboxed primitive overload exists for backwards compatibility.
         */
        fun limit(limit: Long) = limit(limit as Long?)

        /** Filter by receiving account ID */
        fun receivingAccountId(receivingAccountId: String?) = apply {
            this.receivingAccountId = receivingAccountId
        }

        /** Filter by receiving UMA address */
        fun receivingUmaAddress(receivingUmaAddress: String?) = apply {
            this.receivingUmaAddress = receivingUmaAddress
        }

        /** Filter by sending account ID */
        fun sendingAccountId(sendingAccountId: String?) = apply {
            this.sendingAccountId = sendingAccountId
        }

        /** Filter by sending UMA address */
        fun sendingUmaAddress(sendingUmaAddress: String?) = apply {
            this.sendingUmaAddress = sendingUmaAddress
        }

        /** Filter by quote status */
        fun status(status: Status?) = apply { this.status = status }

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
         * Returns an immutable instance of [QuoteListParams].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         */
        fun build(): QuoteListParams =
            QuoteListParams(
                createdAfter,
                createdBefore,
                cursor,
                customerId,
                limit,
                receivingAccountId,
                receivingUmaAddress,
                sendingAccountId,
                sendingUmaAddress,
                status,
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
                customerId?.let { put("customerId", it) }
                limit?.let { put("limit", it.toString()) }
                receivingAccountId?.let { put("receivingAccountId", it) }
                receivingUmaAddress?.let { put("receivingUmaAddress", it) }
                sendingAccountId?.let { put("sendingAccountId", it) }
                sendingUmaAddress?.let { put("sendingUmaAddress", it) }
                status?.let { put("status", it.toString()) }
                putAll(additionalQueryParams)
            }
            .build()

    /** Filter by quote status */
    class Status @JsonCreator private constructor(private val value: JsonField<String>) : Enum {

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

            val PENDING = of("PENDING")

            val PROCESSING = of("PROCESSING")

            val COMPLETED = of("COMPLETED")

            val FAILED = of("FAILED")

            val EXPIRED = of("EXPIRED")

            fun of(value: String) = Status(JsonField.of(value))
        }

        /** An enum containing [Status]'s known values. */
        enum class Known {
            PENDING,
            PROCESSING,
            COMPLETED,
            FAILED,
            EXPIRED,
        }

        /**
         * An enum containing [Status]'s known values, as well as an [_UNKNOWN] member.
         *
         * An instance of [Status] can contain an unknown value in a couple of cases:
         * - It was deserialized from data that doesn't match any known member. For example, if the
         *   SDK is on an older version than the API, then the API may respond with new members that
         *   the SDK is unaware of.
         * - It was constructed with an arbitrary value using the [of] method.
         */
        enum class Value {
            PENDING,
            PROCESSING,
            COMPLETED,
            FAILED,
            EXPIRED,
            /** An enum member indicating that [Status] was instantiated with an unknown value. */
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
                PENDING -> Value.PENDING
                PROCESSING -> Value.PROCESSING
                COMPLETED -> Value.COMPLETED
                FAILED -> Value.FAILED
                EXPIRED -> Value.EXPIRED
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
                PENDING -> Known.PENDING
                PROCESSING -> Known.PROCESSING
                COMPLETED -> Known.COMPLETED
                FAILED -> Known.FAILED
                EXPIRED -> Known.EXPIRED
                else -> throw GridInvalidDataException("Unknown Status: $value")
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

        fun validate(): Status = apply {
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

            return other is Status && value == other.value
        }

        override fun hashCode() = value.hashCode()

        override fun toString() = value.toString()
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is QuoteListParams &&
            createdAfter == other.createdAfter &&
            createdBefore == other.createdBefore &&
            cursor == other.cursor &&
            customerId == other.customerId &&
            limit == other.limit &&
            receivingAccountId == other.receivingAccountId &&
            receivingUmaAddress == other.receivingUmaAddress &&
            sendingAccountId == other.sendingAccountId &&
            sendingUmaAddress == other.sendingUmaAddress &&
            status == other.status &&
            additionalHeaders == other.additionalHeaders &&
            additionalQueryParams == other.additionalQueryParams
    }

    override fun hashCode(): Int =
        Objects.hash(
            createdAfter,
            createdBefore,
            cursor,
            customerId,
            limit,
            receivingAccountId,
            receivingUmaAddress,
            sendingAccountId,
            sendingUmaAddress,
            status,
            additionalHeaders,
            additionalQueryParams,
        )

    override fun toString() =
        "QuoteListParams{createdAfter=$createdAfter, createdBefore=$createdBefore, cursor=$cursor, customerId=$customerId, limit=$limit, receivingAccountId=$receivingAccountId, receivingUmaAddress=$receivingUmaAddress, sendingAccountId=$sendingAccountId, sendingUmaAddress=$sendingUmaAddress, status=$status, additionalHeaders=$additionalHeaders, additionalQueryParams=$additionalQueryParams}"
}
