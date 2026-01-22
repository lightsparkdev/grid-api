// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.sandbox.uma

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
import com.grid.api.errors.GridInvalidDataException
import java.util.Collections
import java.util.Objects

/**
 * Simulate sending payment from an sandbox uma address to a platform customer to test payment
 * receive. This endpoint is only for the sandbox environment and will fail for production
 * platforms/keys.
 */
class UmaReceivePaymentParams
private constructor(
    private val body: Body,
    private val additionalHeaders: Headers,
    private val additionalQueryParams: QueryParams,
) : Params {

    /**
     * The amount to be received in the smallest unit of the currency (eg. cents)
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun receivingCurrencyAmount(): Long = body.receivingCurrencyAmount()

    /**
     * The currency code for the receiving amount
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun receivingCurrencyCode(): String = body.receivingCurrencyCode()

    /**
     * UMA address of the sender from the sandbox
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun senderUmaAddress(): String = body.senderUmaAddress()

    /**
     * System ID of the receiver (optional if receiverUmaAddress is provided)
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun customerId(): String? = body.customerId()

    /**
     * UMA address of the receiver (optional if customerId is provided)
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun receiverUmaAddress(): String? = body.receiverUmaAddress()

    /**
     * Returns the raw JSON value of [receivingCurrencyAmount].
     *
     * Unlike [receivingCurrencyAmount], this method doesn't throw if the JSON field has an
     * unexpected type.
     */
    fun _receivingCurrencyAmount(): JsonField<Long> = body._receivingCurrencyAmount()

    /**
     * Returns the raw JSON value of [receivingCurrencyCode].
     *
     * Unlike [receivingCurrencyCode], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    fun _receivingCurrencyCode(): JsonField<String> = body._receivingCurrencyCode()

    /**
     * Returns the raw JSON value of [senderUmaAddress].
     *
     * Unlike [senderUmaAddress], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    fun _senderUmaAddress(): JsonField<String> = body._senderUmaAddress()

    /**
     * Returns the raw JSON value of [customerId].
     *
     * Unlike [customerId], this method doesn't throw if the JSON field has an unexpected type.
     */
    fun _customerId(): JsonField<String> = body._customerId()

    /**
     * Returns the raw JSON value of [receiverUmaAddress].
     *
     * Unlike [receiverUmaAddress], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    fun _receiverUmaAddress(): JsonField<String> = body._receiverUmaAddress()

    fun _additionalBodyProperties(): Map<String, JsonValue> = body._additionalProperties()

    /** Additional headers to send with the request. */
    fun _additionalHeaders(): Headers = additionalHeaders

    /** Additional query param to send with the request. */
    fun _additionalQueryParams(): QueryParams = additionalQueryParams

    fun toBuilder() = Builder().from(this)

    companion object {

        /**
         * Returns a mutable builder for constructing an instance of [UmaReceivePaymentParams].
         *
         * The following fields are required:
         * ```kotlin
         * .receivingCurrencyAmount()
         * .receivingCurrencyCode()
         * .senderUmaAddress()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [UmaReceivePaymentParams]. */
    class Builder internal constructor() {

        private var body: Body.Builder = Body.builder()
        private var additionalHeaders: Headers.Builder = Headers.builder()
        private var additionalQueryParams: QueryParams.Builder = QueryParams.builder()

        internal fun from(umaReceivePaymentParams: UmaReceivePaymentParams) = apply {
            body = umaReceivePaymentParams.body.toBuilder()
            additionalHeaders = umaReceivePaymentParams.additionalHeaders.toBuilder()
            additionalQueryParams = umaReceivePaymentParams.additionalQueryParams.toBuilder()
        }

        /**
         * Sets the entire request body.
         *
         * This is generally only useful if you are already constructing the body separately.
         * Otherwise, it's more convenient to use the top-level setters instead:
         * - [receivingCurrencyAmount]
         * - [receivingCurrencyCode]
         * - [senderUmaAddress]
         * - [customerId]
         * - [receiverUmaAddress]
         * - etc.
         */
        fun body(body: Body) = apply { this.body = body.toBuilder() }

        /** The amount to be received in the smallest unit of the currency (eg. cents) */
        fun receivingCurrencyAmount(receivingCurrencyAmount: Long) = apply {
            body.receivingCurrencyAmount(receivingCurrencyAmount)
        }

        /**
         * Sets [Builder.receivingCurrencyAmount] to an arbitrary JSON value.
         *
         * You should usually call [Builder.receivingCurrencyAmount] with a well-typed [Long] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun receivingCurrencyAmount(receivingCurrencyAmount: JsonField<Long>) = apply {
            body.receivingCurrencyAmount(receivingCurrencyAmount)
        }

        /** The currency code for the receiving amount */
        fun receivingCurrencyCode(receivingCurrencyCode: String) = apply {
            body.receivingCurrencyCode(receivingCurrencyCode)
        }

        /**
         * Sets [Builder.receivingCurrencyCode] to an arbitrary JSON value.
         *
         * You should usually call [Builder.receivingCurrencyCode] with a well-typed [String] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun receivingCurrencyCode(receivingCurrencyCode: JsonField<String>) = apply {
            body.receivingCurrencyCode(receivingCurrencyCode)
        }

        /** UMA address of the sender from the sandbox */
        fun senderUmaAddress(senderUmaAddress: String) = apply {
            body.senderUmaAddress(senderUmaAddress)
        }

        /**
         * Sets [Builder.senderUmaAddress] to an arbitrary JSON value.
         *
         * You should usually call [Builder.senderUmaAddress] with a well-typed [String] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun senderUmaAddress(senderUmaAddress: JsonField<String>) = apply {
            body.senderUmaAddress(senderUmaAddress)
        }

        /** System ID of the receiver (optional if receiverUmaAddress is provided) */
        fun customerId(customerId: String) = apply { body.customerId(customerId) }

        /**
         * Sets [Builder.customerId] to an arbitrary JSON value.
         *
         * You should usually call [Builder.customerId] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun customerId(customerId: JsonField<String>) = apply { body.customerId(customerId) }

        /** UMA address of the receiver (optional if customerId is provided) */
        fun receiverUmaAddress(receiverUmaAddress: String) = apply {
            body.receiverUmaAddress(receiverUmaAddress)
        }

        /**
         * Sets [Builder.receiverUmaAddress] to an arbitrary JSON value.
         *
         * You should usually call [Builder.receiverUmaAddress] with a well-typed [String] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun receiverUmaAddress(receiverUmaAddress: JsonField<String>) = apply {
            body.receiverUmaAddress(receiverUmaAddress)
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
         * Returns an immutable instance of [UmaReceivePaymentParams].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .receivingCurrencyAmount()
         * .receivingCurrencyCode()
         * .senderUmaAddress()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): UmaReceivePaymentParams =
            UmaReceivePaymentParams(
                body.build(),
                additionalHeaders.build(),
                additionalQueryParams.build(),
            )
    }

    fun _body(): Body = body

    override fun _headers(): Headers = additionalHeaders

    override fun _queryParams(): QueryParams = additionalQueryParams

    class Body
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val receivingCurrencyAmount: JsonField<Long>,
        private val receivingCurrencyCode: JsonField<String>,
        private val senderUmaAddress: JsonField<String>,
        private val customerId: JsonField<String>,
        private val receiverUmaAddress: JsonField<String>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("receivingCurrencyAmount")
            @ExcludeMissing
            receivingCurrencyAmount: JsonField<Long> = JsonMissing.of(),
            @JsonProperty("receivingCurrencyCode")
            @ExcludeMissing
            receivingCurrencyCode: JsonField<String> = JsonMissing.of(),
            @JsonProperty("senderUmaAddress")
            @ExcludeMissing
            senderUmaAddress: JsonField<String> = JsonMissing.of(),
            @JsonProperty("customerId")
            @ExcludeMissing
            customerId: JsonField<String> = JsonMissing.of(),
            @JsonProperty("receiverUmaAddress")
            @ExcludeMissing
            receiverUmaAddress: JsonField<String> = JsonMissing.of(),
        ) : this(
            receivingCurrencyAmount,
            receivingCurrencyCode,
            senderUmaAddress,
            customerId,
            receiverUmaAddress,
            mutableMapOf(),
        )

        /**
         * The amount to be received in the smallest unit of the currency (eg. cents)
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun receivingCurrencyAmount(): Long =
            receivingCurrencyAmount.getRequired("receivingCurrencyAmount")

        /**
         * The currency code for the receiving amount
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun receivingCurrencyCode(): String =
            receivingCurrencyCode.getRequired("receivingCurrencyCode")

        /**
         * UMA address of the sender from the sandbox
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun senderUmaAddress(): String = senderUmaAddress.getRequired("senderUmaAddress")

        /**
         * System ID of the receiver (optional if receiverUmaAddress is provided)
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun customerId(): String? = customerId.getNullable("customerId")

        /**
         * UMA address of the receiver (optional if customerId is provided)
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun receiverUmaAddress(): String? = receiverUmaAddress.getNullable("receiverUmaAddress")

        /**
         * Returns the raw JSON value of [receivingCurrencyAmount].
         *
         * Unlike [receivingCurrencyAmount], this method doesn't throw if the JSON field has an
         * unexpected type.
         */
        @JsonProperty("receivingCurrencyAmount")
        @ExcludeMissing
        fun _receivingCurrencyAmount(): JsonField<Long> = receivingCurrencyAmount

        /**
         * Returns the raw JSON value of [receivingCurrencyCode].
         *
         * Unlike [receivingCurrencyCode], this method doesn't throw if the JSON field has an
         * unexpected type.
         */
        @JsonProperty("receivingCurrencyCode")
        @ExcludeMissing
        fun _receivingCurrencyCode(): JsonField<String> = receivingCurrencyCode

        /**
         * Returns the raw JSON value of [senderUmaAddress].
         *
         * Unlike [senderUmaAddress], this method doesn't throw if the JSON field has an unexpected
         * type.
         */
        @JsonProperty("senderUmaAddress")
        @ExcludeMissing
        fun _senderUmaAddress(): JsonField<String> = senderUmaAddress

        /**
         * Returns the raw JSON value of [customerId].
         *
         * Unlike [customerId], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("customerId")
        @ExcludeMissing
        fun _customerId(): JsonField<String> = customerId

        /**
         * Returns the raw JSON value of [receiverUmaAddress].
         *
         * Unlike [receiverUmaAddress], this method doesn't throw if the JSON field has an
         * unexpected type.
         */
        @JsonProperty("receiverUmaAddress")
        @ExcludeMissing
        fun _receiverUmaAddress(): JsonField<String> = receiverUmaAddress

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
             * .receivingCurrencyAmount()
             * .receivingCurrencyCode()
             * .senderUmaAddress()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [Body]. */
        class Builder internal constructor() {

            private var receivingCurrencyAmount: JsonField<Long>? = null
            private var receivingCurrencyCode: JsonField<String>? = null
            private var senderUmaAddress: JsonField<String>? = null
            private var customerId: JsonField<String> = JsonMissing.of()
            private var receiverUmaAddress: JsonField<String> = JsonMissing.of()
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(body: Body) = apply {
                receivingCurrencyAmount = body.receivingCurrencyAmount
                receivingCurrencyCode = body.receivingCurrencyCode
                senderUmaAddress = body.senderUmaAddress
                customerId = body.customerId
                receiverUmaAddress = body.receiverUmaAddress
                additionalProperties = body.additionalProperties.toMutableMap()
            }

            /** The amount to be received in the smallest unit of the currency (eg. cents) */
            fun receivingCurrencyAmount(receivingCurrencyAmount: Long) =
                receivingCurrencyAmount(JsonField.of(receivingCurrencyAmount))

            /**
             * Sets [Builder.receivingCurrencyAmount] to an arbitrary JSON value.
             *
             * You should usually call [Builder.receivingCurrencyAmount] with a well-typed [Long]
             * value instead. This method is primarily for setting the field to an undocumented or
             * not yet supported value.
             */
            fun receivingCurrencyAmount(receivingCurrencyAmount: JsonField<Long>) = apply {
                this.receivingCurrencyAmount = receivingCurrencyAmount
            }

            /** The currency code for the receiving amount */
            fun receivingCurrencyCode(receivingCurrencyCode: String) =
                receivingCurrencyCode(JsonField.of(receivingCurrencyCode))

            /**
             * Sets [Builder.receivingCurrencyCode] to an arbitrary JSON value.
             *
             * You should usually call [Builder.receivingCurrencyCode] with a well-typed [String]
             * value instead. This method is primarily for setting the field to an undocumented or
             * not yet supported value.
             */
            fun receivingCurrencyCode(receivingCurrencyCode: JsonField<String>) = apply {
                this.receivingCurrencyCode = receivingCurrencyCode
            }

            /** UMA address of the sender from the sandbox */
            fun senderUmaAddress(senderUmaAddress: String) =
                senderUmaAddress(JsonField.of(senderUmaAddress))

            /**
             * Sets [Builder.senderUmaAddress] to an arbitrary JSON value.
             *
             * You should usually call [Builder.senderUmaAddress] with a well-typed [String] value
             * instead. This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun senderUmaAddress(senderUmaAddress: JsonField<String>) = apply {
                this.senderUmaAddress = senderUmaAddress
            }

            /** System ID of the receiver (optional if receiverUmaAddress is provided) */
            fun customerId(customerId: String) = customerId(JsonField.of(customerId))

            /**
             * Sets [Builder.customerId] to an arbitrary JSON value.
             *
             * You should usually call [Builder.customerId] with a well-typed [String] value
             * instead. This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun customerId(customerId: JsonField<String>) = apply { this.customerId = customerId }

            /** UMA address of the receiver (optional if customerId is provided) */
            fun receiverUmaAddress(receiverUmaAddress: String) =
                receiverUmaAddress(JsonField.of(receiverUmaAddress))

            /**
             * Sets [Builder.receiverUmaAddress] to an arbitrary JSON value.
             *
             * You should usually call [Builder.receiverUmaAddress] with a well-typed [String] value
             * instead. This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun receiverUmaAddress(receiverUmaAddress: JsonField<String>) = apply {
                this.receiverUmaAddress = receiverUmaAddress
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
             * .receivingCurrencyAmount()
             * .receivingCurrencyCode()
             * .senderUmaAddress()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): Body =
                Body(
                    checkRequired("receivingCurrencyAmount", receivingCurrencyAmount),
                    checkRequired("receivingCurrencyCode", receivingCurrencyCode),
                    checkRequired("senderUmaAddress", senderUmaAddress),
                    customerId,
                    receiverUmaAddress,
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): Body = apply {
            if (validated) {
                return@apply
            }

            receivingCurrencyAmount()
            receivingCurrencyCode()
            senderUmaAddress()
            customerId()
            receiverUmaAddress()
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
            (if (receivingCurrencyAmount.asKnown() == null) 0 else 1) +
                (if (receivingCurrencyCode.asKnown() == null) 0 else 1) +
                (if (senderUmaAddress.asKnown() == null) 0 else 1) +
                (if (customerId.asKnown() == null) 0 else 1) +
                (if (receiverUmaAddress.asKnown() == null) 0 else 1)

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is Body &&
                receivingCurrencyAmount == other.receivingCurrencyAmount &&
                receivingCurrencyCode == other.receivingCurrencyCode &&
                senderUmaAddress == other.senderUmaAddress &&
                customerId == other.customerId &&
                receiverUmaAddress == other.receiverUmaAddress &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(
                receivingCurrencyAmount,
                receivingCurrencyCode,
                senderUmaAddress,
                customerId,
                receiverUmaAddress,
                additionalProperties,
            )
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "Body{receivingCurrencyAmount=$receivingCurrencyAmount, receivingCurrencyCode=$receivingCurrencyCode, senderUmaAddress=$senderUmaAddress, customerId=$customerId, receiverUmaAddress=$receiverUmaAddress, additionalProperties=$additionalProperties}"
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is UmaReceivePaymentParams &&
            body == other.body &&
            additionalHeaders == other.additionalHeaders &&
            additionalQueryParams == other.additionalQueryParams
    }

    override fun hashCode(): Int = Objects.hash(body, additionalHeaders, additionalQueryParams)

    override fun toString() =
        "UmaReceivePaymentParams{body=$body, additionalHeaders=$additionalHeaders, additionalQueryParams=$additionalQueryParams}"
}
