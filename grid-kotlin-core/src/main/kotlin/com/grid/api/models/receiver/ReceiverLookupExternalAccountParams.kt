// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.receiver

import com.grid.api.core.Params
import com.grid.api.core.http.Headers
import com.grid.api.core.http.QueryParams
import java.util.Objects

/**
 * Lookup an external account by ID to determine supported currencies and exchange rates. This
 * endpoint helps platforms determine what currencies they can send to a given external account,
 * along with the current estimated exchange rates and minimum and maximum amounts that can be sent.
 */
class ReceiverLookupExternalAccountParams
private constructor(
    private val accountId: String?,
    private val customerId: String?,
    private val senderUmaAddress: String?,
    private val additionalHeaders: Headers,
    private val additionalQueryParams: QueryParams,
) : Params {

    fun accountId(): String? = accountId

    /** System ID of the sender (optional if senderUmaAddress is provided) */
    fun customerId(): String? = customerId

    /** UMA address of the sender (optional if customerId is provided) */
    fun senderUmaAddress(): String? = senderUmaAddress

    /** Additional headers to send with the request. */
    fun _additionalHeaders(): Headers = additionalHeaders

    /** Additional query param to send with the request. */
    fun _additionalQueryParams(): QueryParams = additionalQueryParams

    fun toBuilder() = Builder().from(this)

    companion object {

        fun none(): ReceiverLookupExternalAccountParams = builder().build()

        /**
         * Returns a mutable builder for constructing an instance of
         * [ReceiverLookupExternalAccountParams].
         */
        fun builder() = Builder()
    }

    /** A builder for [ReceiverLookupExternalAccountParams]. */
    class Builder internal constructor() {

        private var accountId: String? = null
        private var customerId: String? = null
        private var senderUmaAddress: String? = null
        private var additionalHeaders: Headers.Builder = Headers.builder()
        private var additionalQueryParams: QueryParams.Builder = QueryParams.builder()

        internal fun from(
            receiverLookupExternalAccountParams: ReceiverLookupExternalAccountParams
        ) = apply {
            accountId = receiverLookupExternalAccountParams.accountId
            customerId = receiverLookupExternalAccountParams.customerId
            senderUmaAddress = receiverLookupExternalAccountParams.senderUmaAddress
            additionalHeaders = receiverLookupExternalAccountParams.additionalHeaders.toBuilder()
            additionalQueryParams =
                receiverLookupExternalAccountParams.additionalQueryParams.toBuilder()
        }

        fun accountId(accountId: String?) = apply { this.accountId = accountId }

        /** System ID of the sender (optional if senderUmaAddress is provided) */
        fun customerId(customerId: String?) = apply { this.customerId = customerId }

        /** UMA address of the sender (optional if customerId is provided) */
        fun senderUmaAddress(senderUmaAddress: String?) = apply {
            this.senderUmaAddress = senderUmaAddress
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
         * Returns an immutable instance of [ReceiverLookupExternalAccountParams].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         */
        fun build(): ReceiverLookupExternalAccountParams =
            ReceiverLookupExternalAccountParams(
                accountId,
                customerId,
                senderUmaAddress,
                additionalHeaders.build(),
                additionalQueryParams.build(),
            )
    }

    fun _pathParam(index: Int): String =
        when (index) {
            0 -> accountId ?: ""
            else -> ""
        }

    override fun _headers(): Headers = additionalHeaders

    override fun _queryParams(): QueryParams =
        QueryParams.builder()
            .apply {
                customerId?.let { put("customerId", it) }
                senderUmaAddress?.let { put("senderUmaAddress", it) }
                putAll(additionalQueryParams)
            }
            .build()

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is ReceiverLookupExternalAccountParams &&
            accountId == other.accountId &&
            customerId == other.customerId &&
            senderUmaAddress == other.senderUmaAddress &&
            additionalHeaders == other.additionalHeaders &&
            additionalQueryParams == other.additionalQueryParams
    }

    override fun hashCode(): Int =
        Objects.hash(
            accountId,
            customerId,
            senderUmaAddress,
            additionalHeaders,
            additionalQueryParams,
        )

    override fun toString() =
        "ReceiverLookupExternalAccountParams{accountId=$accountId, customerId=$customerId, senderUmaAddress=$senderUmaAddress, additionalHeaders=$additionalHeaders, additionalQueryParams=$additionalQueryParams}"
}
