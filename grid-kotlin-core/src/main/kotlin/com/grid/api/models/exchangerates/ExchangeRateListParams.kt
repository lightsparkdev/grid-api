// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.exchangerates

import com.grid.api.core.Params
import com.grid.api.core.http.Headers
import com.grid.api.core.http.QueryParams
import com.grid.api.core.toImmutable
import java.util.Objects

/**
 * Retrieve cached exchange rates for currency corridors. Returns FX rates that are cached for
 * approximately 5 minutes. Rates include fees specific to your platform for authenticated requests.
 *
 * **Filtering Options:**
 * - Filter by source currency to get all available destination corridors
 * - Filter by specific destination currency or currencies
 * - Provide a sending amount to get calculated receiving amounts
 */
class ExchangeRateListParams
private constructor(
    private val destinationCurrency: List<String>?,
    private val sendingAmount: Long?,
    private val sourceCurrency: String?,
    private val additionalHeaders: Headers,
    private val additionalQueryParams: QueryParams,
) : Params {

    /**
     * Filter by destination currency code(s). Can be repeated for multiple currencies (e.g.,
     * &destinationCurrency=INR&destinationCurrency=GBP)
     */
    fun destinationCurrency(): List<String>? = destinationCurrency

    /**
     * Sending amount in the smallest unit of the source currency (e.g., cents for USD). If no
     * amount is provided, the default is 10000 in the sending currency smallest unit.
     */
    fun sendingAmount(): Long? = sendingAmount

    /** Filter by source currency code (e.g., USD) */
    fun sourceCurrency(): String? = sourceCurrency

    /** Additional headers to send with the request. */
    fun _additionalHeaders(): Headers = additionalHeaders

    /** Additional query param to send with the request. */
    fun _additionalQueryParams(): QueryParams = additionalQueryParams

    fun toBuilder() = Builder().from(this)

    companion object {

        fun none(): ExchangeRateListParams = builder().build()

        /** Returns a mutable builder for constructing an instance of [ExchangeRateListParams]. */
        fun builder() = Builder()
    }

    /** A builder for [ExchangeRateListParams]. */
    class Builder internal constructor() {

        private var destinationCurrency: MutableList<String>? = null
        private var sendingAmount: Long? = null
        private var sourceCurrency: String? = null
        private var additionalHeaders: Headers.Builder = Headers.builder()
        private var additionalQueryParams: QueryParams.Builder = QueryParams.builder()

        internal fun from(exchangeRateListParams: ExchangeRateListParams) = apply {
            destinationCurrency = exchangeRateListParams.destinationCurrency?.toMutableList()
            sendingAmount = exchangeRateListParams.sendingAmount
            sourceCurrency = exchangeRateListParams.sourceCurrency
            additionalHeaders = exchangeRateListParams.additionalHeaders.toBuilder()
            additionalQueryParams = exchangeRateListParams.additionalQueryParams.toBuilder()
        }

        /**
         * Filter by destination currency code(s). Can be repeated for multiple currencies (e.g.,
         * &destinationCurrency=INR&destinationCurrency=GBP)
         */
        fun destinationCurrency(destinationCurrency: List<String>?) = apply {
            this.destinationCurrency = destinationCurrency?.toMutableList()
        }

        /**
         * Adds a single [String] to [Builder.destinationCurrency].
         *
         * @throws IllegalStateException if the field was previously set to a non-list.
         */
        fun addDestinationCurrency(destinationCurrency: String) = apply {
            this.destinationCurrency =
                (this.destinationCurrency ?: mutableListOf()).apply { add(destinationCurrency) }
        }

        /**
         * Sending amount in the smallest unit of the source currency (e.g., cents for USD). If no
         * amount is provided, the default is 10000 in the sending currency smallest unit.
         */
        fun sendingAmount(sendingAmount: Long?) = apply { this.sendingAmount = sendingAmount }

        /**
         * Alias for [Builder.sendingAmount].
         *
         * This unboxed primitive overload exists for backwards compatibility.
         */
        fun sendingAmount(sendingAmount: Long) = sendingAmount(sendingAmount as Long?)

        /** Filter by source currency code (e.g., USD) */
        fun sourceCurrency(sourceCurrency: String?) = apply { this.sourceCurrency = sourceCurrency }

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
         * Returns an immutable instance of [ExchangeRateListParams].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         */
        fun build(): ExchangeRateListParams =
            ExchangeRateListParams(
                destinationCurrency?.toImmutable(),
                sendingAmount,
                sourceCurrency,
                additionalHeaders.build(),
                additionalQueryParams.build(),
            )
    }

    override fun _headers(): Headers = additionalHeaders

    override fun _queryParams(): QueryParams =
        QueryParams.builder()
            .apply {
                destinationCurrency?.let { put("destinationCurrency", it.joinToString(",")) }
                sendingAmount?.let { put("sendingAmount", it.toString()) }
                sourceCurrency?.let { put("sourceCurrency", it) }
                putAll(additionalQueryParams)
            }
            .build()

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is ExchangeRateListParams &&
            destinationCurrency == other.destinationCurrency &&
            sendingAmount == other.sendingAmount &&
            sourceCurrency == other.sourceCurrency &&
            additionalHeaders == other.additionalHeaders &&
            additionalQueryParams == other.additionalQueryParams
    }

    override fun hashCode(): Int =
        Objects.hash(
            destinationCurrency,
            sendingAmount,
            sourceCurrency,
            additionalHeaders,
            additionalQueryParams,
        )

    override fun toString() =
        "ExchangeRateListParams{destinationCurrency=$destinationCurrency, sendingAmount=$sendingAmount, sourceCurrency=$sourceCurrency, additionalHeaders=$additionalHeaders, additionalQueryParams=$additionalQueryParams}"
}
