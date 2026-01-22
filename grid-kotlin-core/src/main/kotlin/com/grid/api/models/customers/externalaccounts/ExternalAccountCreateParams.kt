// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.grid.api.core.JsonValue
import com.grid.api.core.Params
import com.grid.api.core.checkRequired
import com.grid.api.core.http.Headers
import com.grid.api.core.http.QueryParams
import java.util.Objects

/**
 * Register a new external bank account for a customer.
 *
 * **Sandbox Testing:** In sandbox mode, use these account number patterns to test different
 * transfer scenarios. These patterns should be used with the primary alias, address, or identifier
 * of whatever account type you're testing. For example, the US account number, a CLABE, an IBAN, a
 * spark wallet address, etc. The failure patterns are:
 * - Account numbers ending in **002**: Insufficient funds (transfer-in will fail)
 * - Account numbers ending in **003**: Account closed/invalid (transfers will fail)
 * - Account numbers ending in **004**: Transfer rejected (bank rejects the transfer)
 * - Account numbers ending in **005**: Timeout/delayed failure (stays pending ~30s, then fails)
 * - Any other account number: Success (transfers complete normally)
 */
class ExternalAccountCreateParams
private constructor(
    private val externalAccountCreate: ExternalAccountCreate,
    private val additionalHeaders: Headers,
    private val additionalQueryParams: QueryParams,
) : Params {

    fun externalAccountCreate(): ExternalAccountCreate = externalAccountCreate

    fun _additionalBodyProperties(): Map<String, JsonValue> =
        externalAccountCreate._additionalProperties()

    /** Additional headers to send with the request. */
    fun _additionalHeaders(): Headers = additionalHeaders

    /** Additional query param to send with the request. */
    fun _additionalQueryParams(): QueryParams = additionalQueryParams

    fun toBuilder() = Builder().from(this)

    companion object {

        /**
         * Returns a mutable builder for constructing an instance of [ExternalAccountCreateParams].
         *
         * The following fields are required:
         * ```kotlin
         * .externalAccountCreate()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [ExternalAccountCreateParams]. */
    class Builder internal constructor() {

        private var externalAccountCreate: ExternalAccountCreate? = null
        private var additionalHeaders: Headers.Builder = Headers.builder()
        private var additionalQueryParams: QueryParams.Builder = QueryParams.builder()

        internal fun from(externalAccountCreateParams: ExternalAccountCreateParams) = apply {
            externalAccountCreate = externalAccountCreateParams.externalAccountCreate
            additionalHeaders = externalAccountCreateParams.additionalHeaders.toBuilder()
            additionalQueryParams = externalAccountCreateParams.additionalQueryParams.toBuilder()
        }

        fun externalAccountCreate(externalAccountCreate: ExternalAccountCreate) = apply {
            this.externalAccountCreate = externalAccountCreate
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
         * Returns an immutable instance of [ExternalAccountCreateParams].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .externalAccountCreate()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): ExternalAccountCreateParams =
            ExternalAccountCreateParams(
                checkRequired("externalAccountCreate", externalAccountCreate),
                additionalHeaders.build(),
                additionalQueryParams.build(),
            )
    }

    fun _body(): ExternalAccountCreate = externalAccountCreate

    override fun _headers(): Headers = additionalHeaders

    override fun _queryParams(): QueryParams = additionalQueryParams

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is ExternalAccountCreateParams &&
            externalAccountCreate == other.externalAccountCreate &&
            additionalHeaders == other.additionalHeaders &&
            additionalQueryParams == other.additionalQueryParams
    }

    override fun hashCode(): Int =
        Objects.hash(externalAccountCreate, additionalHeaders, additionalQueryParams)

    override fun toString() =
        "ExternalAccountCreateParams{externalAccountCreate=$externalAccountCreate, additionalHeaders=$additionalHeaders, additionalQueryParams=$additionalQueryParams}"
}
