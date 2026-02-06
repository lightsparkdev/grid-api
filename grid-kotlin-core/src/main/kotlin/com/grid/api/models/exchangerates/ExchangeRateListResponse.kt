// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.exchangerates

import com.fasterxml.jackson.annotation.JsonAnyGetter
import com.fasterxml.jackson.annotation.JsonAnySetter
import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.grid.api.core.ExcludeMissing
import com.grid.api.core.JsonField
import com.grid.api.core.JsonMissing
import com.grid.api.core.JsonValue
import com.grid.api.core.checkKnown
import com.grid.api.core.checkRequired
import com.grid.api.core.toImmutable
import com.grid.api.errors.GridInvalidDataException
import com.grid.api.models.quotes.Currency
import java.time.OffsetDateTime
import java.util.Collections
import java.util.Objects

class ExchangeRateListResponse
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val data: JsonField<List<Data>>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("data") @ExcludeMissing data: JsonField<List<Data>> = JsonMissing.of()
    ) : this(data, mutableMapOf())

    /**
     * List of exchange rates matching the filter criteria
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun data(): List<Data> = data.getRequired("data")

    /**
     * Returns the raw JSON value of [data].
     *
     * Unlike [data], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("data") @ExcludeMissing fun _data(): JsonField<List<Data>> = data

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
         * Returns a mutable builder for constructing an instance of [ExchangeRateListResponse].
         *
         * The following fields are required:
         * ```kotlin
         * .data()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [ExchangeRateListResponse]. */
    class Builder internal constructor() {

        private var data: JsonField<MutableList<Data>>? = null
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(exchangeRateListResponse: ExchangeRateListResponse) = apply {
            data = exchangeRateListResponse.data.map { it.toMutableList() }
            additionalProperties = exchangeRateListResponse.additionalProperties.toMutableMap()
        }

        /** List of exchange rates matching the filter criteria */
        fun data(data: List<Data>) = data(JsonField.of(data))

        /**
         * Sets [Builder.data] to an arbitrary JSON value.
         *
         * You should usually call [Builder.data] with a well-typed `List<Data>` value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun data(data: JsonField<List<Data>>) = apply {
            this.data = data.map { it.toMutableList() }
        }

        /**
         * Adds a single [Data] to [Builder.data].
         *
         * @throws IllegalStateException if the field was previously set to a non-list.
         */
        fun addData(data: Data) = apply {
            this.data =
                (this.data ?: JsonField.of(mutableListOf())).also {
                    checkKnown("data", it).add(data)
                }
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
         * Returns an immutable instance of [ExchangeRateListResponse].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .data()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): ExchangeRateListResponse =
            ExchangeRateListResponse(
                checkRequired("data", data).map { it.toImmutable() },
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): ExchangeRateListResponse = apply {
        if (validated) {
            return@apply
        }

        data().forEach { it.validate() }
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
     * Returns a score indicating how many valid values are contained in this object recursively.
     *
     * Used for best match union deserialization.
     */
    internal fun validity(): Int = (data.asKnown()?.sumOf { it.validity().toInt() } ?: 0)

    /** Exchange rate information for a currency corridor */
    class Data
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val destinationCurrency: JsonField<Currency>,
        private val destinationPaymentRail: JsonField<String>,
        private val exchangeRate: JsonField<Double>,
        private val fees: JsonField<Fees>,
        private val receivingAmount: JsonField<Long>,
        private val sourceCurrency: JsonField<Currency>,
        private val updatedAt: JsonField<OffsetDateTime>,
        private val sendingAmount: JsonField<Long>,
        private val sourcePaymentRail: JsonField<String>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("destinationCurrency")
            @ExcludeMissing
            destinationCurrency: JsonField<Currency> = JsonMissing.of(),
            @JsonProperty("destinationPaymentRail")
            @ExcludeMissing
            destinationPaymentRail: JsonField<String> = JsonMissing.of(),
            @JsonProperty("exchangeRate")
            @ExcludeMissing
            exchangeRate: JsonField<Double> = JsonMissing.of(),
            @JsonProperty("fees") @ExcludeMissing fees: JsonField<Fees> = JsonMissing.of(),
            @JsonProperty("receivingAmount")
            @ExcludeMissing
            receivingAmount: JsonField<Long> = JsonMissing.of(),
            @JsonProperty("sourceCurrency")
            @ExcludeMissing
            sourceCurrency: JsonField<Currency> = JsonMissing.of(),
            @JsonProperty("updatedAt")
            @ExcludeMissing
            updatedAt: JsonField<OffsetDateTime> = JsonMissing.of(),
            @JsonProperty("sendingAmount")
            @ExcludeMissing
            sendingAmount: JsonField<Long> = JsonMissing.of(),
            @JsonProperty("sourcePaymentRail")
            @ExcludeMissing
            sourcePaymentRail: JsonField<String> = JsonMissing.of(),
        ) : this(
            destinationCurrency,
            destinationPaymentRail,
            exchangeRate,
            fees,
            receivingAmount,
            sourceCurrency,
            updatedAt,
            sendingAmount,
            sourcePaymentRail,
            mutableMapOf(),
        )

        /**
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun destinationCurrency(): Currency = destinationCurrency.getRequired("destinationCurrency")

        /**
         * The payment rail used for the destination (e.g., UPI, SEPA_INSTANT, MOBILE_MONEY,
         * FASTER_PAYMENTS)
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun destinationPaymentRail(): String =
            destinationPaymentRail.getRequired("destinationPaymentRail")

        /**
         * Number of destination currency units per sending currency unit
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun exchangeRate(): Double = exchangeRate.getRequired("exchangeRate")

        /**
         * Fees associated with an exchange rate
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun fees(): Fees = fees.getRequired("fees")

        /**
         * The receiving amount in the smallest unit of the destination currency
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun receivingAmount(): Long = receivingAmount.getRequired("receivingAmount")

        /**
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun sourceCurrency(): Currency = sourceCurrency.getRequired("sourceCurrency")

        /**
         * Timestamp when this exchange rate was last refreshed
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun updatedAt(): OffsetDateTime = updatedAt.getRequired("updatedAt")

        /**
         * The sending amount in the smallest unit of the source currency (e.g., cents for USD).
         * Echoed back from the request if provided.
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun sendingAmount(): Long? = sendingAmount.getNullable("sendingAmount")

        /**
         * The payment rail used for the source (e.g., ACCOUNT, RTP)
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun sourcePaymentRail(): String? = sourcePaymentRail.getNullable("sourcePaymentRail")

        /**
         * Returns the raw JSON value of [destinationCurrency].
         *
         * Unlike [destinationCurrency], this method doesn't throw if the JSON field has an
         * unexpected type.
         */
        @JsonProperty("destinationCurrency")
        @ExcludeMissing
        fun _destinationCurrency(): JsonField<Currency> = destinationCurrency

        /**
         * Returns the raw JSON value of [destinationPaymentRail].
         *
         * Unlike [destinationPaymentRail], this method doesn't throw if the JSON field has an
         * unexpected type.
         */
        @JsonProperty("destinationPaymentRail")
        @ExcludeMissing
        fun _destinationPaymentRail(): JsonField<String> = destinationPaymentRail

        /**
         * Returns the raw JSON value of [exchangeRate].
         *
         * Unlike [exchangeRate], this method doesn't throw if the JSON field has an unexpected
         * type.
         */
        @JsonProperty("exchangeRate")
        @ExcludeMissing
        fun _exchangeRate(): JsonField<Double> = exchangeRate

        /**
         * Returns the raw JSON value of [fees].
         *
         * Unlike [fees], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("fees") @ExcludeMissing fun _fees(): JsonField<Fees> = fees

        /**
         * Returns the raw JSON value of [receivingAmount].
         *
         * Unlike [receivingAmount], this method doesn't throw if the JSON field has an unexpected
         * type.
         */
        @JsonProperty("receivingAmount")
        @ExcludeMissing
        fun _receivingAmount(): JsonField<Long> = receivingAmount

        /**
         * Returns the raw JSON value of [sourceCurrency].
         *
         * Unlike [sourceCurrency], this method doesn't throw if the JSON field has an unexpected
         * type.
         */
        @JsonProperty("sourceCurrency")
        @ExcludeMissing
        fun _sourceCurrency(): JsonField<Currency> = sourceCurrency

        /**
         * Returns the raw JSON value of [updatedAt].
         *
         * Unlike [updatedAt], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("updatedAt")
        @ExcludeMissing
        fun _updatedAt(): JsonField<OffsetDateTime> = updatedAt

        /**
         * Returns the raw JSON value of [sendingAmount].
         *
         * Unlike [sendingAmount], this method doesn't throw if the JSON field has an unexpected
         * type.
         */
        @JsonProperty("sendingAmount")
        @ExcludeMissing
        fun _sendingAmount(): JsonField<Long> = sendingAmount

        /**
         * Returns the raw JSON value of [sourcePaymentRail].
         *
         * Unlike [sourcePaymentRail], this method doesn't throw if the JSON field has an unexpected
         * type.
         */
        @JsonProperty("sourcePaymentRail")
        @ExcludeMissing
        fun _sourcePaymentRail(): JsonField<String> = sourcePaymentRail

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
             * Returns a mutable builder for constructing an instance of [Data].
             *
             * The following fields are required:
             * ```kotlin
             * .destinationCurrency()
             * .destinationPaymentRail()
             * .exchangeRate()
             * .fees()
             * .receivingAmount()
             * .sourceCurrency()
             * .updatedAt()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [Data]. */
        class Builder internal constructor() {

            private var destinationCurrency: JsonField<Currency>? = null
            private var destinationPaymentRail: JsonField<String>? = null
            private var exchangeRate: JsonField<Double>? = null
            private var fees: JsonField<Fees>? = null
            private var receivingAmount: JsonField<Long>? = null
            private var sourceCurrency: JsonField<Currency>? = null
            private var updatedAt: JsonField<OffsetDateTime>? = null
            private var sendingAmount: JsonField<Long> = JsonMissing.of()
            private var sourcePaymentRail: JsonField<String> = JsonMissing.of()
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(data: Data) = apply {
                destinationCurrency = data.destinationCurrency
                destinationPaymentRail = data.destinationPaymentRail
                exchangeRate = data.exchangeRate
                fees = data.fees
                receivingAmount = data.receivingAmount
                sourceCurrency = data.sourceCurrency
                updatedAt = data.updatedAt
                sendingAmount = data.sendingAmount
                sourcePaymentRail = data.sourcePaymentRail
                additionalProperties = data.additionalProperties.toMutableMap()
            }

            fun destinationCurrency(destinationCurrency: Currency) =
                destinationCurrency(JsonField.of(destinationCurrency))

            /**
             * Sets [Builder.destinationCurrency] to an arbitrary JSON value.
             *
             * You should usually call [Builder.destinationCurrency] with a well-typed [Currency]
             * value instead. This method is primarily for setting the field to an undocumented or
             * not yet supported value.
             */
            fun destinationCurrency(destinationCurrency: JsonField<Currency>) = apply {
                this.destinationCurrency = destinationCurrency
            }

            /**
             * The payment rail used for the destination (e.g., UPI, SEPA_INSTANT, MOBILE_MONEY,
             * FASTER_PAYMENTS)
             */
            fun destinationPaymentRail(destinationPaymentRail: String) =
                destinationPaymentRail(JsonField.of(destinationPaymentRail))

            /**
             * Sets [Builder.destinationPaymentRail] to an arbitrary JSON value.
             *
             * You should usually call [Builder.destinationPaymentRail] with a well-typed [String]
             * value instead. This method is primarily for setting the field to an undocumented or
             * not yet supported value.
             */
            fun destinationPaymentRail(destinationPaymentRail: JsonField<String>) = apply {
                this.destinationPaymentRail = destinationPaymentRail
            }

            /** Number of destination currency units per sending currency unit */
            fun exchangeRate(exchangeRate: Double) = exchangeRate(JsonField.of(exchangeRate))

            /**
             * Sets [Builder.exchangeRate] to an arbitrary JSON value.
             *
             * You should usually call [Builder.exchangeRate] with a well-typed [Double] value
             * instead. This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun exchangeRate(exchangeRate: JsonField<Double>) = apply {
                this.exchangeRate = exchangeRate
            }

            /** Fees associated with an exchange rate */
            fun fees(fees: Fees) = fees(JsonField.of(fees))

            /**
             * Sets [Builder.fees] to an arbitrary JSON value.
             *
             * You should usually call [Builder.fees] with a well-typed [Fees] value instead. This
             * method is primarily for setting the field to an undocumented or not yet supported
             * value.
             */
            fun fees(fees: JsonField<Fees>) = apply { this.fees = fees }

            /** The receiving amount in the smallest unit of the destination currency */
            fun receivingAmount(receivingAmount: Long) =
                receivingAmount(JsonField.of(receivingAmount))

            /**
             * Sets [Builder.receivingAmount] to an arbitrary JSON value.
             *
             * You should usually call [Builder.receivingAmount] with a well-typed [Long] value
             * instead. This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun receivingAmount(receivingAmount: JsonField<Long>) = apply {
                this.receivingAmount = receivingAmount
            }

            fun sourceCurrency(sourceCurrency: Currency) =
                sourceCurrency(JsonField.of(sourceCurrency))

            /**
             * Sets [Builder.sourceCurrency] to an arbitrary JSON value.
             *
             * You should usually call [Builder.sourceCurrency] with a well-typed [Currency] value
             * instead. This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun sourceCurrency(sourceCurrency: JsonField<Currency>) = apply {
                this.sourceCurrency = sourceCurrency
            }

            /** Timestamp when this exchange rate was last refreshed */
            fun updatedAt(updatedAt: OffsetDateTime) = updatedAt(JsonField.of(updatedAt))

            /**
             * Sets [Builder.updatedAt] to an arbitrary JSON value.
             *
             * You should usually call [Builder.updatedAt] with a well-typed [OffsetDateTime] value
             * instead. This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun updatedAt(updatedAt: JsonField<OffsetDateTime>) = apply {
                this.updatedAt = updatedAt
            }

            /**
             * The sending amount in the smallest unit of the source currency (e.g., cents for USD).
             * Echoed back from the request if provided.
             */
            fun sendingAmount(sendingAmount: Long) = sendingAmount(JsonField.of(sendingAmount))

            /**
             * Sets [Builder.sendingAmount] to an arbitrary JSON value.
             *
             * You should usually call [Builder.sendingAmount] with a well-typed [Long] value
             * instead. This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun sendingAmount(sendingAmount: JsonField<Long>) = apply {
                this.sendingAmount = sendingAmount
            }

            /** The payment rail used for the source (e.g., ACCOUNT, RTP) */
            fun sourcePaymentRail(sourcePaymentRail: String) =
                sourcePaymentRail(JsonField.of(sourcePaymentRail))

            /**
             * Sets [Builder.sourcePaymentRail] to an arbitrary JSON value.
             *
             * You should usually call [Builder.sourcePaymentRail] with a well-typed [String] value
             * instead. This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun sourcePaymentRail(sourcePaymentRail: JsonField<String>) = apply {
                this.sourcePaymentRail = sourcePaymentRail
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
             * Returns an immutable instance of [Data].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             *
             * The following fields are required:
             * ```kotlin
             * .destinationCurrency()
             * .destinationPaymentRail()
             * .exchangeRate()
             * .fees()
             * .receivingAmount()
             * .sourceCurrency()
             * .updatedAt()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): Data =
                Data(
                    checkRequired("destinationCurrency", destinationCurrency),
                    checkRequired("destinationPaymentRail", destinationPaymentRail),
                    checkRequired("exchangeRate", exchangeRate),
                    checkRequired("fees", fees),
                    checkRequired("receivingAmount", receivingAmount),
                    checkRequired("sourceCurrency", sourceCurrency),
                    checkRequired("updatedAt", updatedAt),
                    sendingAmount,
                    sourcePaymentRail,
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): Data = apply {
            if (validated) {
                return@apply
            }

            destinationCurrency().validate()
            destinationPaymentRail()
            exchangeRate()
            fees().validate()
            receivingAmount()
            sourceCurrency().validate()
            updatedAt()
            sendingAmount()
            sourcePaymentRail()
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
            (destinationCurrency.asKnown()?.validity() ?: 0) +
                (if (destinationPaymentRail.asKnown() == null) 0 else 1) +
                (if (exchangeRate.asKnown() == null) 0 else 1) +
                (fees.asKnown()?.validity() ?: 0) +
                (if (receivingAmount.asKnown() == null) 0 else 1) +
                (sourceCurrency.asKnown()?.validity() ?: 0) +
                (if (updatedAt.asKnown() == null) 0 else 1) +
                (if (sendingAmount.asKnown() == null) 0 else 1) +
                (if (sourcePaymentRail.asKnown() == null) 0 else 1)

        /** Fees associated with an exchange rate */
        class Fees
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val fixed: JsonField<Long>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("fixed") @ExcludeMissing fixed: JsonField<Long> = JsonMissing.of()
            ) : this(fixed, mutableMapOf())

            /**
             * Fixed fee in the smallest unit of the sending currency (e.g., cents for USD)
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun fixed(): Long? = fixed.getNullable("fixed")

            /**
             * Returns the raw JSON value of [fixed].
             *
             * Unlike [fixed], this method doesn't throw if the JSON field has an unexpected type.
             */
            @JsonProperty("fixed") @ExcludeMissing fun _fixed(): JsonField<Long> = fixed

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

                /** Returns a mutable builder for constructing an instance of [Fees]. */
                fun builder() = Builder()
            }

            /** A builder for [Fees]. */
            class Builder internal constructor() {

                private var fixed: JsonField<Long> = JsonMissing.of()
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(fees: Fees) = apply {
                    fixed = fees.fixed
                    additionalProperties = fees.additionalProperties.toMutableMap()
                }

                /** Fixed fee in the smallest unit of the sending currency (e.g., cents for USD) */
                fun fixed(fixed: Long) = fixed(JsonField.of(fixed))

                /**
                 * Sets [Builder.fixed] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.fixed] with a well-typed [Long] value instead.
                 * This method is primarily for setting the field to an undocumented or not yet
                 * supported value.
                 */
                fun fixed(fixed: JsonField<Long>) = apply { this.fixed = fixed }

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
                 * Returns an immutable instance of [Fees].
                 *
                 * Further updates to this [Builder] will not mutate the returned instance.
                 */
                fun build(): Fees = Fees(fixed, additionalProperties.toMutableMap())
            }

            private var validated: Boolean = false

            fun validate(): Fees = apply {
                if (validated) {
                    return@apply
                }

                fixed()
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
            internal fun validity(): Int = (if (fixed.asKnown() == null) 0 else 1)

            override fun equals(other: Any?): Boolean {
                if (this === other) {
                    return true
                }

                return other is Fees &&
                    fixed == other.fixed &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy { Objects.hash(fixed, additionalProperties) }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "Fees{fixed=$fixed, additionalProperties=$additionalProperties}"
        }

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is Data &&
                destinationCurrency == other.destinationCurrency &&
                destinationPaymentRail == other.destinationPaymentRail &&
                exchangeRate == other.exchangeRate &&
                fees == other.fees &&
                receivingAmount == other.receivingAmount &&
                sourceCurrency == other.sourceCurrency &&
                updatedAt == other.updatedAt &&
                sendingAmount == other.sendingAmount &&
                sourcePaymentRail == other.sourcePaymentRail &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(
                destinationCurrency,
                destinationPaymentRail,
                exchangeRate,
                fees,
                receivingAmount,
                sourceCurrency,
                updatedAt,
                sendingAmount,
                sourcePaymentRail,
                additionalProperties,
            )
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "Data{destinationCurrency=$destinationCurrency, destinationPaymentRail=$destinationPaymentRail, exchangeRate=$exchangeRate, fees=$fees, receivingAmount=$receivingAmount, sourceCurrency=$sourceCurrency, updatedAt=$updatedAt, sendingAmount=$sendingAmount, sourcePaymentRail=$sourcePaymentRail, additionalProperties=$additionalProperties}"
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is ExchangeRateListResponse &&
            data == other.data &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy { Objects.hash(data, additionalProperties) }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "ExchangeRateListResponse{data=$data, additionalProperties=$additionalProperties}"
}
