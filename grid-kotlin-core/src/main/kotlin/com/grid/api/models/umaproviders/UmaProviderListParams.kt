// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.umaproviders

import com.fasterxml.jackson.annotation.JsonCreator
import com.grid.api.core.Enum
import com.grid.api.core.JsonField
import com.grid.api.core.Params
import com.grid.api.core.http.Headers
import com.grid.api.core.http.QueryParams
import com.grid.api.errors.GridInvalidDataException
import java.util.Objects

/**
 * Retrieve a list of available Counterparty Providers. The response includes basic information
 * about each provider, such as its UMA address, name, and supported currencies.
 */
class UmaProviderListParams
private constructor(
    private val countryCode: String?,
    private val currencyCode: String?,
    private val cursor: String?,
    private val hasBlockedProviders: Boolean?,
    private val limit: Long?,
    private val sortOrder: SortOrder?,
    private val additionalHeaders: Headers,
    private val additionalQueryParams: QueryParams,
) : Params {

    /** The alpha-2 representation of a country, as defined by the ISO 3166-1 standard. */
    fun countryCode(): String? = countryCode

    /** The ISO 4217 currency code to filter providers by supported currency. */
    fun currencyCode(): String? = currencyCode

    /** Cursor for pagination (returned from previous request) */
    fun cursor(): String? = cursor

    /**
     * Whether to include providers which are not on your allowlist in the response. By default the
     * response will include blocked providers.
     */
    fun hasBlockedProviders(): Boolean? = hasBlockedProviders

    /** Maximum number of results to return (default 20, max 100) */
    fun limit(): Long? = limit

    /** Order to sort results in */
    fun sortOrder(): SortOrder? = sortOrder

    /** Additional headers to send with the request. */
    fun _additionalHeaders(): Headers = additionalHeaders

    /** Additional query param to send with the request. */
    fun _additionalQueryParams(): QueryParams = additionalQueryParams

    fun toBuilder() = Builder().from(this)

    companion object {

        fun none(): UmaProviderListParams = builder().build()

        /** Returns a mutable builder for constructing an instance of [UmaProviderListParams]. */
        fun builder() = Builder()
    }

    /** A builder for [UmaProviderListParams]. */
    class Builder internal constructor() {

        private var countryCode: String? = null
        private var currencyCode: String? = null
        private var cursor: String? = null
        private var hasBlockedProviders: Boolean? = null
        private var limit: Long? = null
        private var sortOrder: SortOrder? = null
        private var additionalHeaders: Headers.Builder = Headers.builder()
        private var additionalQueryParams: QueryParams.Builder = QueryParams.builder()

        internal fun from(umaProviderListParams: UmaProviderListParams) = apply {
            countryCode = umaProviderListParams.countryCode
            currencyCode = umaProviderListParams.currencyCode
            cursor = umaProviderListParams.cursor
            hasBlockedProviders = umaProviderListParams.hasBlockedProviders
            limit = umaProviderListParams.limit
            sortOrder = umaProviderListParams.sortOrder
            additionalHeaders = umaProviderListParams.additionalHeaders.toBuilder()
            additionalQueryParams = umaProviderListParams.additionalQueryParams.toBuilder()
        }

        /** The alpha-2 representation of a country, as defined by the ISO 3166-1 standard. */
        fun countryCode(countryCode: String?) = apply { this.countryCode = countryCode }

        /** The ISO 4217 currency code to filter providers by supported currency. */
        fun currencyCode(currencyCode: String?) = apply { this.currencyCode = currencyCode }

        /** Cursor for pagination (returned from previous request) */
        fun cursor(cursor: String?) = apply { this.cursor = cursor }

        /**
         * Whether to include providers which are not on your allowlist in the response. By default
         * the response will include blocked providers.
         */
        fun hasBlockedProviders(hasBlockedProviders: Boolean?) = apply {
            this.hasBlockedProviders = hasBlockedProviders
        }

        /**
         * Alias for [Builder.hasBlockedProviders].
         *
         * This unboxed primitive overload exists for backwards compatibility.
         */
        fun hasBlockedProviders(hasBlockedProviders: Boolean) =
            hasBlockedProviders(hasBlockedProviders as Boolean?)

        /** Maximum number of results to return (default 20, max 100) */
        fun limit(limit: Long?) = apply { this.limit = limit }

        /**
         * Alias for [Builder.limit].
         *
         * This unboxed primitive overload exists for backwards compatibility.
         */
        fun limit(limit: Long) = limit(limit as Long?)

        /** Order to sort results in */
        fun sortOrder(sortOrder: SortOrder?) = apply { this.sortOrder = sortOrder }

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
         * Returns an immutable instance of [UmaProviderListParams].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         */
        fun build(): UmaProviderListParams =
            UmaProviderListParams(
                countryCode,
                currencyCode,
                cursor,
                hasBlockedProviders,
                limit,
                sortOrder,
                additionalHeaders.build(),
                additionalQueryParams.build(),
            )
    }

    override fun _headers(): Headers = additionalHeaders

    override fun _queryParams(): QueryParams =
        QueryParams.builder()
            .apply {
                countryCode?.let { put("countryCode", it) }
                currencyCode?.let { put("currencyCode", it) }
                cursor?.let { put("cursor", it) }
                hasBlockedProviders?.let { put("hasBlockedProviders", it.toString()) }
                limit?.let { put("limit", it.toString()) }
                sortOrder?.let { put("sortOrder", it.toString()) }
                putAll(additionalQueryParams)
            }
            .build()

    /** Order to sort results in */
    class SortOrder @JsonCreator private constructor(private val value: JsonField<String>) : Enum {

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

            val ASC = of("asc")

            val DESC = of("desc")

            fun of(value: String) = SortOrder(JsonField.of(value))
        }

        /** An enum containing [SortOrder]'s known values. */
        enum class Known {
            ASC,
            DESC,
        }

        /**
         * An enum containing [SortOrder]'s known values, as well as an [_UNKNOWN] member.
         *
         * An instance of [SortOrder] can contain an unknown value in a couple of cases:
         * - It was deserialized from data that doesn't match any known member. For example, if the
         *   SDK is on an older version than the API, then the API may respond with new members that
         *   the SDK is unaware of.
         * - It was constructed with an arbitrary value using the [of] method.
         */
        enum class Value {
            ASC,
            DESC,
            /**
             * An enum member indicating that [SortOrder] was instantiated with an unknown value.
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
                ASC -> Value.ASC
                DESC -> Value.DESC
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
                ASC -> Known.ASC
                DESC -> Known.DESC
                else -> throw GridInvalidDataException("Unknown SortOrder: $value")
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

        fun validate(): SortOrder = apply {
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

            return other is SortOrder && value == other.value
        }

        override fun hashCode() = value.hashCode()

        override fun toString() = value.toString()
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is UmaProviderListParams &&
            countryCode == other.countryCode &&
            currencyCode == other.currencyCode &&
            cursor == other.cursor &&
            hasBlockedProviders == other.hasBlockedProviders &&
            limit == other.limit &&
            sortOrder == other.sortOrder &&
            additionalHeaders == other.additionalHeaders &&
            additionalQueryParams == other.additionalQueryParams
    }

    override fun hashCode(): Int =
        Objects.hash(
            countryCode,
            currencyCode,
            cursor,
            hasBlockedProviders,
            limit,
            sortOrder,
            additionalHeaders,
            additionalQueryParams,
        )

    override fun toString() =
        "UmaProviderListParams{countryCode=$countryCode, currencyCode=$currencyCode, cursor=$cursor, hasBlockedProviders=$hasBlockedProviders, limit=$limit, sortOrder=$sortOrder, additionalHeaders=$additionalHeaders, additionalQueryParams=$additionalQueryParams}"
}
