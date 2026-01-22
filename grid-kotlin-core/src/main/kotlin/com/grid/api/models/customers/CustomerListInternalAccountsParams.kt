// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers

import com.grid.api.core.Params
import com.grid.api.core.http.Headers
import com.grid.api.core.http.QueryParams
import java.util.Objects

/**
 * Retrieve a list of internal accounts with optional filtering parameters. Returns all internal
 * accounts that match the specified filters. If no filters are provided, returns all internal
 * accounts (paginated).
 *
 * Internal accounts are created automatically when a customer is created based on the platform
 * configuration.
 */
class CustomerListInternalAccountsParams
private constructor(
    private val currency: String?,
    private val cursor: String?,
    private val customerId: String?,
    private val limit: Long?,
    private val additionalHeaders: Headers,
    private val additionalQueryParams: QueryParams,
) : Params {

    /** Filter by currency code */
    fun currency(): String? = currency

    /** Cursor for pagination (returned from previous request) */
    fun cursor(): String? = cursor

    /** Filter by internal accounts associated with a specific customer */
    fun customerId(): String? = customerId

    /** Maximum number of results to return (default 20, max 100) */
    fun limit(): Long? = limit

    /** Additional headers to send with the request. */
    fun _additionalHeaders(): Headers = additionalHeaders

    /** Additional query param to send with the request. */
    fun _additionalQueryParams(): QueryParams = additionalQueryParams

    fun toBuilder() = Builder().from(this)

    companion object {

        fun none(): CustomerListInternalAccountsParams = builder().build()

        /**
         * Returns a mutable builder for constructing an instance of
         * [CustomerListInternalAccountsParams].
         */
        fun builder() = Builder()
    }

    /** A builder for [CustomerListInternalAccountsParams]. */
    class Builder internal constructor() {

        private var currency: String? = null
        private var cursor: String? = null
        private var customerId: String? = null
        private var limit: Long? = null
        private var additionalHeaders: Headers.Builder = Headers.builder()
        private var additionalQueryParams: QueryParams.Builder = QueryParams.builder()

        internal fun from(customerListInternalAccountsParams: CustomerListInternalAccountsParams) =
            apply {
                currency = customerListInternalAccountsParams.currency
                cursor = customerListInternalAccountsParams.cursor
                customerId = customerListInternalAccountsParams.customerId
                limit = customerListInternalAccountsParams.limit
                additionalHeaders = customerListInternalAccountsParams.additionalHeaders.toBuilder()
                additionalQueryParams =
                    customerListInternalAccountsParams.additionalQueryParams.toBuilder()
            }

        /** Filter by currency code */
        fun currency(currency: String?) = apply { this.currency = currency }

        /** Cursor for pagination (returned from previous request) */
        fun cursor(cursor: String?) = apply { this.cursor = cursor }

        /** Filter by internal accounts associated with a specific customer */
        fun customerId(customerId: String?) = apply { this.customerId = customerId }

        /** Maximum number of results to return (default 20, max 100) */
        fun limit(limit: Long?) = apply { this.limit = limit }

        /**
         * Alias for [Builder.limit].
         *
         * This unboxed primitive overload exists for backwards compatibility.
         */
        fun limit(limit: Long) = limit(limit as Long?)

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
         * Returns an immutable instance of [CustomerListInternalAccountsParams].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         */
        fun build(): CustomerListInternalAccountsParams =
            CustomerListInternalAccountsParams(
                currency,
                cursor,
                customerId,
                limit,
                additionalHeaders.build(),
                additionalQueryParams.build(),
            )
    }

    override fun _headers(): Headers = additionalHeaders

    override fun _queryParams(): QueryParams =
        QueryParams.builder()
            .apply {
                currency?.let { put("currency", it) }
                cursor?.let { put("cursor", it) }
                customerId?.let { put("customerId", it) }
                limit?.let { put("limit", it.toString()) }
                putAll(additionalQueryParams)
            }
            .build()

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is CustomerListInternalAccountsParams &&
            currency == other.currency &&
            cursor == other.cursor &&
            customerId == other.customerId &&
            limit == other.limit &&
            additionalHeaders == other.additionalHeaders &&
            additionalQueryParams == other.additionalQueryParams
    }

    override fun hashCode(): Int =
        Objects.hash(currency, cursor, customerId, limit, additionalHeaders, additionalQueryParams)

    override fun toString() =
        "CustomerListInternalAccountsParams{currency=$currency, cursor=$cursor, customerId=$customerId, limit=$limit, additionalHeaders=$additionalHeaders, additionalQueryParams=$additionalQueryParams}"
}
