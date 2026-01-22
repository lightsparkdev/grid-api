// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.quotes

import com.fasterxml.jackson.annotation.JsonAnyGetter
import com.fasterxml.jackson.annotation.JsonAnySetter
import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.grid.api.core.ExcludeMissing
import com.grid.api.core.JsonField
import com.grid.api.core.JsonMissing
import com.grid.api.core.JsonValue
import com.grid.api.core.Params
import com.grid.api.core.checkRequired
import com.grid.api.core.http.Headers
import com.grid.api.core.http.QueryParams
import com.grid.api.core.toImmutable
import com.grid.api.errors.GridInvalidDataException
import java.util.Collections
import java.util.Objects

/**
 * In the case where a customer is debited but the Lightning payment fails to complete, integrators
 * can retry the payment using this endpoint.
 *
 * Payments retried with this endpoint will debit from the sender and deliver to the recipient the
 * same amount as the original quote. As the Grid API does not persist customer PII, retries need to
 * start with a lookup request to retrieve the original quote's recipient counter party data
 * requirements then pass that sender information in the request body. Before calling this endpoint,
 * you should reach out to the Lightspark team to investigate the underlying issue. As part of
 * resolution, they'll update the transaction to the appropriate state. The quote / transaction to
 * retry must be in a `FAILED` or `REFUNDED` state.
 */
class QuoteRetryParams
private constructor(
    private val quoteId: String?,
    private val body: Body,
    private val additionalHeaders: Headers,
    private val additionalQueryParams: QueryParams,
) : Params {

    fun quoteId(): String? = quoteId

    /**
     * Unique identifier for the prior receiver uma address lookup request.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun lookupId(): String = body.lookupId()

    /**
     * Key-value pairs of information about the sender which was requested by the counterparty
     * (recipient) institution. Any fields specified in `requiredPayerDataFields` from the response
     * of the `/receiver/{receiverUmaAddress}` (lookupUma) endpoint MUST be provided here if they
     * were requested. If the counterparty (recipient) institution did not request any information,
     * this field can be omitted.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun senderCustomerInfo(): SenderCustomerInfo? = body.senderCustomerInfo()

    /**
     * Returns the raw JSON value of [lookupId].
     *
     * Unlike [lookupId], this method doesn't throw if the JSON field has an unexpected type.
     */
    fun _lookupId(): JsonField<String> = body._lookupId()

    /**
     * Returns the raw JSON value of [senderCustomerInfo].
     *
     * Unlike [senderCustomerInfo], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    fun _senderCustomerInfo(): JsonField<SenderCustomerInfo> = body._senderCustomerInfo()

    fun _additionalBodyProperties(): Map<String, JsonValue> = body._additionalProperties()

    /** Additional headers to send with the request. */
    fun _additionalHeaders(): Headers = additionalHeaders

    /** Additional query param to send with the request. */
    fun _additionalQueryParams(): QueryParams = additionalQueryParams

    fun toBuilder() = Builder().from(this)

    companion object {

        /**
         * Returns a mutable builder for constructing an instance of [QuoteRetryParams].
         *
         * The following fields are required:
         * ```kotlin
         * .lookupId()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [QuoteRetryParams]. */
    class Builder internal constructor() {

        private var quoteId: String? = null
        private var body: Body.Builder = Body.builder()
        private var additionalHeaders: Headers.Builder = Headers.builder()
        private var additionalQueryParams: QueryParams.Builder = QueryParams.builder()

        internal fun from(quoteRetryParams: QuoteRetryParams) = apply {
            quoteId = quoteRetryParams.quoteId
            body = quoteRetryParams.body.toBuilder()
            additionalHeaders = quoteRetryParams.additionalHeaders.toBuilder()
            additionalQueryParams = quoteRetryParams.additionalQueryParams.toBuilder()
        }

        fun quoteId(quoteId: String?) = apply { this.quoteId = quoteId }

        /**
         * Sets the entire request body.
         *
         * This is generally only useful if you are already constructing the body separately.
         * Otherwise, it's more convenient to use the top-level setters instead:
         * - [lookupId]
         * - [senderCustomerInfo]
         */
        fun body(body: Body) = apply { this.body = body.toBuilder() }

        /** Unique identifier for the prior receiver uma address lookup request. */
        fun lookupId(lookupId: String) = apply { body.lookupId(lookupId) }

        /**
         * Sets [Builder.lookupId] to an arbitrary JSON value.
         *
         * You should usually call [Builder.lookupId] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun lookupId(lookupId: JsonField<String>) = apply { body.lookupId(lookupId) }

        /**
         * Key-value pairs of information about the sender which was requested by the counterparty
         * (recipient) institution. Any fields specified in `requiredPayerDataFields` from the
         * response of the `/receiver/{receiverUmaAddress}` (lookupUma) endpoint MUST be provided
         * here if they were requested. If the counterparty (recipient) institution did not request
         * any information, this field can be omitted.
         */
        fun senderCustomerInfo(senderCustomerInfo: SenderCustomerInfo) = apply {
            body.senderCustomerInfo(senderCustomerInfo)
        }

        /**
         * Sets [Builder.senderCustomerInfo] to an arbitrary JSON value.
         *
         * You should usually call [Builder.senderCustomerInfo] with a well-typed
         * [SenderCustomerInfo] value instead. This method is primarily for setting the field to an
         * undocumented or not yet supported value.
         */
        fun senderCustomerInfo(senderCustomerInfo: JsonField<SenderCustomerInfo>) = apply {
            body.senderCustomerInfo(senderCustomerInfo)
        }

        fun additionalBodyProperties(additionalBodyProperties: Map<String, JsonValue>) = apply {
            body.additionalProperties(additionalBodyProperties)
        }

        fun putAdditionalBodyProperty(key: String, value: JsonValue) = apply {
            body.putAdditionalProperty(key, value)
        }

        fun putAllAdditionalBodyProperties(additionalBodyProperties: Map<String, JsonValue>) =
            apply {
                body.putAllAdditionalProperties(additionalBodyProperties)
            }

        fun removeAdditionalBodyProperty(key: String) = apply { body.removeAdditionalProperty(key) }

        fun removeAllAdditionalBodyProperties(keys: Set<String>) = apply {
            body.removeAllAdditionalProperties(keys)
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
         * Returns an immutable instance of [QuoteRetryParams].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .lookupId()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): QuoteRetryParams =
            QuoteRetryParams(
                quoteId,
                body.build(),
                additionalHeaders.build(),
                additionalQueryParams.build(),
            )
    }

    fun _body(): Body = body

    fun _pathParam(index: Int): String =
        when (index) {
            0 -> quoteId ?: ""
            else -> ""
        }

    override fun _headers(): Headers = additionalHeaders

    override fun _queryParams(): QueryParams = additionalQueryParams

    class Body
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val lookupId: JsonField<String>,
        private val senderCustomerInfo: JsonField<SenderCustomerInfo>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("lookupId")
            @ExcludeMissing
            lookupId: JsonField<String> = JsonMissing.of(),
            @JsonProperty("senderCustomerInfo")
            @ExcludeMissing
            senderCustomerInfo: JsonField<SenderCustomerInfo> = JsonMissing.of(),
        ) : this(lookupId, senderCustomerInfo, mutableMapOf())

        /**
         * Unique identifier for the prior receiver uma address lookup request.
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun lookupId(): String = lookupId.getRequired("lookupId")

        /**
         * Key-value pairs of information about the sender which was requested by the counterparty
         * (recipient) institution. Any fields specified in `requiredPayerDataFields` from the
         * response of the `/receiver/{receiverUmaAddress}` (lookupUma) endpoint MUST be provided
         * here if they were requested. If the counterparty (recipient) institution did not request
         * any information, this field can be omitted.
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun senderCustomerInfo(): SenderCustomerInfo? =
            senderCustomerInfo.getNullable("senderCustomerInfo")

        /**
         * Returns the raw JSON value of [lookupId].
         *
         * Unlike [lookupId], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("lookupId") @ExcludeMissing fun _lookupId(): JsonField<String> = lookupId

        /**
         * Returns the raw JSON value of [senderCustomerInfo].
         *
         * Unlike [senderCustomerInfo], this method doesn't throw if the JSON field has an
         * unexpected type.
         */
        @JsonProperty("senderCustomerInfo")
        @ExcludeMissing
        fun _senderCustomerInfo(): JsonField<SenderCustomerInfo> = senderCustomerInfo

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
             * Returns a mutable builder for constructing an instance of [Body].
             *
             * The following fields are required:
             * ```kotlin
             * .lookupId()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [Body]. */
        class Builder internal constructor() {

            private var lookupId: JsonField<String>? = null
            private var senderCustomerInfo: JsonField<SenderCustomerInfo> = JsonMissing.of()
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(body: Body) = apply {
                lookupId = body.lookupId
                senderCustomerInfo = body.senderCustomerInfo
                additionalProperties = body.additionalProperties.toMutableMap()
            }

            /** Unique identifier for the prior receiver uma address lookup request. */
            fun lookupId(lookupId: String) = lookupId(JsonField.of(lookupId))

            /**
             * Sets [Builder.lookupId] to an arbitrary JSON value.
             *
             * You should usually call [Builder.lookupId] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun lookupId(lookupId: JsonField<String>) = apply { this.lookupId = lookupId }

            /**
             * Key-value pairs of information about the sender which was requested by the
             * counterparty (recipient) institution. Any fields specified in
             * `requiredPayerDataFields` from the response of the `/receiver/{receiverUmaAddress}`
             * (lookupUma) endpoint MUST be provided here if they were requested. If the
             * counterparty (recipient) institution did not request any information, this field can
             * be omitted.
             */
            fun senderCustomerInfo(senderCustomerInfo: SenderCustomerInfo) =
                senderCustomerInfo(JsonField.of(senderCustomerInfo))

            /**
             * Sets [Builder.senderCustomerInfo] to an arbitrary JSON value.
             *
             * You should usually call [Builder.senderCustomerInfo] with a well-typed
             * [SenderCustomerInfo] value instead. This method is primarily for setting the field to
             * an undocumented or not yet supported value.
             */
            fun senderCustomerInfo(senderCustomerInfo: JsonField<SenderCustomerInfo>) = apply {
                this.senderCustomerInfo = senderCustomerInfo
            }

            fun additionalProperties(additionalProperties: Map<String, JsonValue>) = apply {
                this.additionalProperties.clear()
                putAllAdditionalProperties(additionalProperties)
            }

            fun putAdditionalProperty(key: String, value: JsonValue) = apply {
                additionalProperties.put(key, value)
            }

            fun putAllAdditionalProperties(additionalProperties: Map<String, JsonValue>) = apply {
                this.additionalProperties.putAll(additionalProperties)
            }

            fun removeAdditionalProperty(key: String) = apply { additionalProperties.remove(key) }

            fun removeAllAdditionalProperties(keys: Set<String>) = apply {
                keys.forEach(::removeAdditionalProperty)
            }

            /**
             * Returns an immutable instance of [Body].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             *
             * The following fields are required:
             * ```kotlin
             * .lookupId()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): Body =
                Body(
                    checkRequired("lookupId", lookupId),
                    senderCustomerInfo,
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): Body = apply {
            if (validated) {
                return@apply
            }

            lookupId()
            senderCustomerInfo()?.validate()
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
            (if (lookupId.asKnown() == null) 0 else 1) +
                (senderCustomerInfo.asKnown()?.validity() ?: 0)

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is Body &&
                lookupId == other.lookupId &&
                senderCustomerInfo == other.senderCustomerInfo &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(lookupId, senderCustomerInfo, additionalProperties)
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "Body{lookupId=$lookupId, senderCustomerInfo=$senderCustomerInfo, additionalProperties=$additionalProperties}"
    }

    /**
     * Key-value pairs of information about the sender which was requested by the counterparty
     * (recipient) institution. Any fields specified in `requiredPayerDataFields` from the response
     * of the `/receiver/{receiverUmaAddress}` (lookupUma) endpoint MUST be provided here if they
     * were requested. If the counterparty (recipient) institution did not request any information,
     * this field can be omitted.
     */
    class SenderCustomerInfo
    @JsonCreator
    private constructor(
        @com.fasterxml.jackson.annotation.JsonValue
        private val additionalProperties: Map<String, JsonValue>
    ) {

        @JsonAnyGetter
        @ExcludeMissing
        fun _additionalProperties(): Map<String, JsonValue> = additionalProperties

        fun toBuilder() = Builder().from(this)

        companion object {

            /** Returns a mutable builder for constructing an instance of [SenderCustomerInfo]. */
            fun builder() = Builder()
        }

        /** A builder for [SenderCustomerInfo]. */
        class Builder internal constructor() {

            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(senderCustomerInfo: SenderCustomerInfo) = apply {
                additionalProperties = senderCustomerInfo.additionalProperties.toMutableMap()
            }

            fun additionalProperties(additionalProperties: Map<String, JsonValue>) = apply {
                this.additionalProperties.clear()
                putAllAdditionalProperties(additionalProperties)
            }

            fun putAdditionalProperty(key: String, value: JsonValue) = apply {
                additionalProperties.put(key, value)
            }

            fun putAllAdditionalProperties(additionalProperties: Map<String, JsonValue>) = apply {
                this.additionalProperties.putAll(additionalProperties)
            }

            fun removeAdditionalProperty(key: String) = apply { additionalProperties.remove(key) }

            fun removeAllAdditionalProperties(keys: Set<String>) = apply {
                keys.forEach(::removeAdditionalProperty)
            }

            /**
             * Returns an immutable instance of [SenderCustomerInfo].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             */
            fun build(): SenderCustomerInfo = SenderCustomerInfo(additionalProperties.toImmutable())
        }

        private var validated: Boolean = false

        fun validate(): SenderCustomerInfo = apply {
            if (validated) {
                return@apply
            }

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
            additionalProperties.count { (_, value) -> !value.isNull() && !value.isMissing() }

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is SenderCustomerInfo && additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy { Objects.hash(additionalProperties) }

        override fun hashCode(): Int = hashCode

        override fun toString() = "SenderCustomerInfo{additionalProperties=$additionalProperties}"
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is QuoteRetryParams &&
            quoteId == other.quoteId &&
            body == other.body &&
            additionalHeaders == other.additionalHeaders &&
            additionalQueryParams == other.additionalQueryParams
    }

    override fun hashCode(): Int =
        Objects.hash(quoteId, body, additionalHeaders, additionalQueryParams)

    override fun toString() =
        "QuoteRetryParams{quoteId=$quoteId, body=$body, additionalHeaders=$additionalHeaders, additionalQueryParams=$additionalQueryParams}"
}
