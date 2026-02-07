// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.receiver

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
import java.util.Collections
import java.util.Objects

class LookupResponse
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val lookupId: JsonField<String>,
    private val supportedCurrencies: JsonField<List<SupportedCurrency>>,
    private val requiredPayerDataFields: JsonField<List<CounterpartyFieldDefinition>>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("lookupId") @ExcludeMissing lookupId: JsonField<String> = JsonMissing.of(),
        @JsonProperty("supportedCurrencies")
        @ExcludeMissing
        supportedCurrencies: JsonField<List<SupportedCurrency>> = JsonMissing.of(),
        @JsonProperty("requiredPayerDataFields")
        @ExcludeMissing
        requiredPayerDataFields: JsonField<List<CounterpartyFieldDefinition>> = JsonMissing.of(),
    ) : this(lookupId, supportedCurrencies, requiredPayerDataFields, mutableMapOf())

    /**
     * Unique identifier for the lookup. Needed in the subsequent create quote request.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun lookupId(): String = lookupId.getRequired("lookupId")

    /**
     * List of currencies supported by the receiving account
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun supportedCurrencies(): List<SupportedCurrency> =
        supportedCurrencies.getRequired("supportedCurrencies")

    /**
     * Fields required by the receiving institution about the payer before payment can be completed
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun requiredPayerDataFields(): List<CounterpartyFieldDefinition>? =
        requiredPayerDataFields.getNullable("requiredPayerDataFields")

    /**
     * Returns the raw JSON value of [lookupId].
     *
     * Unlike [lookupId], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("lookupId") @ExcludeMissing fun _lookupId(): JsonField<String> = lookupId

    /**
     * Returns the raw JSON value of [supportedCurrencies].
     *
     * Unlike [supportedCurrencies], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    @JsonProperty("supportedCurrencies")
    @ExcludeMissing
    fun _supportedCurrencies(): JsonField<List<SupportedCurrency>> = supportedCurrencies

    /**
     * Returns the raw JSON value of [requiredPayerDataFields].
     *
     * Unlike [requiredPayerDataFields], this method doesn't throw if the JSON field has an
     * unexpected type.
     */
    @JsonProperty("requiredPayerDataFields")
    @ExcludeMissing
    fun _requiredPayerDataFields(): JsonField<List<CounterpartyFieldDefinition>> =
        requiredPayerDataFields

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
         * Returns a mutable builder for constructing an instance of [LookupResponse].
         *
         * The following fields are required:
         * ```kotlin
         * .lookupId()
         * .supportedCurrencies()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [LookupResponse]. */
    class Builder internal constructor() {

        private var lookupId: JsonField<String>? = null
        private var supportedCurrencies: JsonField<MutableList<SupportedCurrency>>? = null
        private var requiredPayerDataFields: JsonField<MutableList<CounterpartyFieldDefinition>>? =
            null
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(lookupResponse: LookupResponse) = apply {
            lookupId = lookupResponse.lookupId
            supportedCurrencies = lookupResponse.supportedCurrencies.map { it.toMutableList() }
            requiredPayerDataFields =
                lookupResponse.requiredPayerDataFields.map { it.toMutableList() }
            additionalProperties = lookupResponse.additionalProperties.toMutableMap()
        }

        /** Unique identifier for the lookup. Needed in the subsequent create quote request. */
        fun lookupId(lookupId: String) = lookupId(JsonField.of(lookupId))

        /**
         * Sets [Builder.lookupId] to an arbitrary JSON value.
         *
         * You should usually call [Builder.lookupId] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun lookupId(lookupId: JsonField<String>) = apply { this.lookupId = lookupId }

        /** List of currencies supported by the receiving account */
        fun supportedCurrencies(supportedCurrencies: List<SupportedCurrency>) =
            supportedCurrencies(JsonField.of(supportedCurrencies))

        /**
         * Sets [Builder.supportedCurrencies] to an arbitrary JSON value.
         *
         * You should usually call [Builder.supportedCurrencies] with a well-typed
         * `List<SupportedCurrency>` value instead. This method is primarily for setting the field
         * to an undocumented or not yet supported value.
         */
        fun supportedCurrencies(supportedCurrencies: JsonField<List<SupportedCurrency>>) = apply {
            this.supportedCurrencies = supportedCurrencies.map { it.toMutableList() }
        }

        /**
         * Adds a single [SupportedCurrency] to [supportedCurrencies].
         *
         * @throws IllegalStateException if the field was previously set to a non-list.
         */
        fun addSupportedCurrency(supportedCurrency: SupportedCurrency) = apply {
            supportedCurrencies =
                (supportedCurrencies ?: JsonField.of(mutableListOf())).also {
                    checkKnown("supportedCurrencies", it).add(supportedCurrency)
                }
        }

        /**
         * Fields required by the receiving institution about the payer before payment can be
         * completed
         */
        fun requiredPayerDataFields(requiredPayerDataFields: List<CounterpartyFieldDefinition>) =
            requiredPayerDataFields(JsonField.of(requiredPayerDataFields))

        /**
         * Sets [Builder.requiredPayerDataFields] to an arbitrary JSON value.
         *
         * You should usually call [Builder.requiredPayerDataFields] with a well-typed
         * `List<CounterpartyFieldDefinition>` value instead. This method is primarily for setting
         * the field to an undocumented or not yet supported value.
         */
        fun requiredPayerDataFields(
            requiredPayerDataFields: JsonField<List<CounterpartyFieldDefinition>>
        ) = apply {
            this.requiredPayerDataFields = requiredPayerDataFields.map { it.toMutableList() }
        }

        /**
         * Adds a single [CounterpartyFieldDefinition] to [requiredPayerDataFields].
         *
         * @throws IllegalStateException if the field was previously set to a non-list.
         */
        fun addRequiredPayerDataField(requiredPayerDataField: CounterpartyFieldDefinition) = apply {
            requiredPayerDataFields =
                (requiredPayerDataFields ?: JsonField.of(mutableListOf())).also {
                    checkKnown("requiredPayerDataFields", it).add(requiredPayerDataField)
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
         * Returns an immutable instance of [LookupResponse].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .lookupId()
         * .supportedCurrencies()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): LookupResponse =
            LookupResponse(
                checkRequired("lookupId", lookupId),
                checkRequired("supportedCurrencies", supportedCurrencies).map { it.toImmutable() },
                (requiredPayerDataFields ?: JsonMissing.of()).map { it.toImmutable() },
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): LookupResponse = apply {
        if (validated) {
            return@apply
        }

        lookupId()
        supportedCurrencies().forEach { it.validate() }
        requiredPayerDataFields()?.forEach { it.validate() }
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
    internal fun validity(): Int =
        (if (lookupId.asKnown() == null) 0 else 1) +
            (supportedCurrencies.asKnown()?.sumOf { it.validity().toInt() } ?: 0) +
            (requiredPayerDataFields.asKnown()?.sumOf { it.validity().toInt() } ?: 0)

    class SupportedCurrency
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val currency: JsonField<Currency>,
        private val estimatedExchangeRate: JsonField<Double>,
        private val max: JsonField<Long>,
        private val min: JsonField<Long>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("currency")
            @ExcludeMissing
            currency: JsonField<Currency> = JsonMissing.of(),
            @JsonProperty("estimatedExchangeRate")
            @ExcludeMissing
            estimatedExchangeRate: JsonField<Double> = JsonMissing.of(),
            @JsonProperty("max") @ExcludeMissing max: JsonField<Long> = JsonMissing.of(),
            @JsonProperty("min") @ExcludeMissing min: JsonField<Long> = JsonMissing.of(),
        ) : this(currency, estimatedExchangeRate, max, min, mutableMapOf())

        /**
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun currency(): Currency = currency.getRequired("currency")

        /**
         * An estimated exchange rate from the sender's currency to this currency. This is not a
         * locked rate and is subject to change when calling the quotes endpoint.
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun estimatedExchangeRate(): Double =
            estimatedExchangeRate.getRequired("estimatedExchangeRate")

        /**
         * The maximum amount that can be received in this currency.
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun max(): Long = max.getRequired("max")

        /**
         * The minimum amount that can be received in this currency.
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun min(): Long = min.getRequired("min")

        /**
         * Returns the raw JSON value of [currency].
         *
         * Unlike [currency], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("currency") @ExcludeMissing fun _currency(): JsonField<Currency> = currency

        /**
         * Returns the raw JSON value of [estimatedExchangeRate].
         *
         * Unlike [estimatedExchangeRate], this method doesn't throw if the JSON field has an
         * unexpected type.
         */
        @JsonProperty("estimatedExchangeRate")
        @ExcludeMissing
        fun _estimatedExchangeRate(): JsonField<Double> = estimatedExchangeRate

        /**
         * Returns the raw JSON value of [max].
         *
         * Unlike [max], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("max") @ExcludeMissing fun _max(): JsonField<Long> = max

        /**
         * Returns the raw JSON value of [min].
         *
         * Unlike [min], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("min") @ExcludeMissing fun _min(): JsonField<Long> = min

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
             * Returns a mutable builder for constructing an instance of [SupportedCurrency].
             *
             * The following fields are required:
             * ```kotlin
             * .currency()
             * .estimatedExchangeRate()
             * .max()
             * .min()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [SupportedCurrency]. */
        class Builder internal constructor() {

            private var currency: JsonField<Currency>? = null
            private var estimatedExchangeRate: JsonField<Double>? = null
            private var max: JsonField<Long>? = null
            private var min: JsonField<Long>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(supportedCurrency: SupportedCurrency) = apply {
                currency = supportedCurrency.currency
                estimatedExchangeRate = supportedCurrency.estimatedExchangeRate
                max = supportedCurrency.max
                min = supportedCurrency.min
                additionalProperties = supportedCurrency.additionalProperties.toMutableMap()
            }

            fun currency(currency: Currency) = currency(JsonField.of(currency))

            /**
             * Sets [Builder.currency] to an arbitrary JSON value.
             *
             * You should usually call [Builder.currency] with a well-typed [Currency] value
             * instead. This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun currency(currency: JsonField<Currency>) = apply { this.currency = currency }

            /**
             * An estimated exchange rate from the sender's currency to this currency. This is not a
             * locked rate and is subject to change when calling the quotes endpoint.
             */
            fun estimatedExchangeRate(estimatedExchangeRate: Double) =
                estimatedExchangeRate(JsonField.of(estimatedExchangeRate))

            /**
             * Sets [Builder.estimatedExchangeRate] to an arbitrary JSON value.
             *
             * You should usually call [Builder.estimatedExchangeRate] with a well-typed [Double]
             * value instead. This method is primarily for setting the field to an undocumented or
             * not yet supported value.
             */
            fun estimatedExchangeRate(estimatedExchangeRate: JsonField<Double>) = apply {
                this.estimatedExchangeRate = estimatedExchangeRate
            }

            /** The maximum amount that can be received in this currency. */
            fun max(max: Long) = max(JsonField.of(max))

            /**
             * Sets [Builder.max] to an arbitrary JSON value.
             *
             * You should usually call [Builder.max] with a well-typed [Long] value instead. This
             * method is primarily for setting the field to an undocumented or not yet supported
             * value.
             */
            fun max(max: JsonField<Long>) = apply { this.max = max }

            /** The minimum amount that can be received in this currency. */
            fun min(min: Long) = min(JsonField.of(min))

            /**
             * Sets [Builder.min] to an arbitrary JSON value.
             *
             * You should usually call [Builder.min] with a well-typed [Long] value instead. This
             * method is primarily for setting the field to an undocumented or not yet supported
             * value.
             */
            fun min(min: JsonField<Long>) = apply { this.min = min }

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
             * Returns an immutable instance of [SupportedCurrency].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             *
             * The following fields are required:
             * ```kotlin
             * .currency()
             * .estimatedExchangeRate()
             * .max()
             * .min()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): SupportedCurrency =
                SupportedCurrency(
                    checkRequired("currency", currency),
                    checkRequired("estimatedExchangeRate", estimatedExchangeRate),
                    checkRequired("max", max),
                    checkRequired("min", min),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): SupportedCurrency = apply {
            if (validated) {
                return@apply
            }

            currency().validate()
            estimatedExchangeRate()
            max()
            min()
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
            (currency.asKnown()?.validity() ?: 0) +
                (if (estimatedExchangeRate.asKnown() == null) 0 else 1) +
                (if (max.asKnown() == null) 0 else 1) +
                (if (min.asKnown() == null) 0 else 1)

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is SupportedCurrency &&
                currency == other.currency &&
                estimatedExchangeRate == other.estimatedExchangeRate &&
                max == other.max &&
                min == other.min &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(currency, estimatedExchangeRate, max, min, additionalProperties)
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "SupportedCurrency{currency=$currency, estimatedExchangeRate=$estimatedExchangeRate, max=$max, min=$min, additionalProperties=$additionalProperties}"
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is LookupResponse &&
            lookupId == other.lookupId &&
            supportedCurrencies == other.supportedCurrencies &&
            requiredPayerDataFields == other.requiredPayerDataFields &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(lookupId, supportedCurrencies, requiredPayerDataFields, additionalProperties)
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "LookupResponse{lookupId=$lookupId, supportedCurrencies=$supportedCurrencies, requiredPayerDataFields=$requiredPayerDataFields, additionalProperties=$additionalProperties}"
}
