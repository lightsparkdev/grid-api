// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.config

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
import com.grid.api.models.receiver.CounterpartyFieldDefinition
import com.grid.api.models.transactions.TransactionType
import java.util.Collections
import java.util.Objects

class PlatformCurrencyConfig
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val currencyCode: JsonField<String>,
    private val enabledTransactionTypes: JsonField<List<TransactionType>>,
    private val maxAmount: JsonField<Long>,
    private val minAmount: JsonField<Long>,
    private val requiredCounterpartyFields: JsonField<List<CounterpartyFieldDefinition>>,
    private val providerRequiredCounterpartyCustomerFields: JsonField<List<CustomerInfoFieldName>>,
    private val providerRequiredCustomerFields: JsonField<List<CustomerInfoFieldName>>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("currencyCode")
        @ExcludeMissing
        currencyCode: JsonField<String> = JsonMissing.of(),
        @JsonProperty("enabledTransactionTypes")
        @ExcludeMissing
        enabledTransactionTypes: JsonField<List<TransactionType>> = JsonMissing.of(),
        @JsonProperty("maxAmount") @ExcludeMissing maxAmount: JsonField<Long> = JsonMissing.of(),
        @JsonProperty("minAmount") @ExcludeMissing minAmount: JsonField<Long> = JsonMissing.of(),
        @JsonProperty("requiredCounterpartyFields")
        @ExcludeMissing
        requiredCounterpartyFields: JsonField<List<CounterpartyFieldDefinition>> = JsonMissing.of(),
        @JsonProperty("providerRequiredCounterpartyCustomerFields")
        @ExcludeMissing
        providerRequiredCounterpartyCustomerFields: JsonField<List<CustomerInfoFieldName>> =
            JsonMissing.of(),
        @JsonProperty("providerRequiredCustomerFields")
        @ExcludeMissing
        providerRequiredCustomerFields: JsonField<List<CustomerInfoFieldName>> = JsonMissing.of(),
    ) : this(
        currencyCode,
        enabledTransactionTypes,
        maxAmount,
        minAmount,
        requiredCounterpartyFields,
        providerRequiredCounterpartyCustomerFields,
        providerRequiredCustomerFields,
        mutableMapOf(),
    )

    /**
     * Three-letter currency code (ISO 4217)
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun currencyCode(): String = currencyCode.getRequired("currencyCode")

    /**
     * List of transaction types that are enabled for this currency.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun enabledTransactionTypes(): List<TransactionType> =
        enabledTransactionTypes.getRequired("enabledTransactionTypes")

    /**
     * Maximum amount that can be sent in the smallest unit of this currency
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun maxAmount(): Long = maxAmount.getRequired("maxAmount")

    /**
     * Minimum amount that can be sent in the smallest unit of this currency
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun minAmount(): Long = minAmount.getRequired("minAmount")

    /**
     * List of fields which the platform requires from the counterparty institutions about
     * counterparty customers. Platforms can set mandatory to false if the platform does not require
     * the field, but would like to have it available. Some fields may be required by the underlying
     * UMA provider.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun requiredCounterpartyFields(): List<CounterpartyFieldDefinition> =
        requiredCounterpartyFields.getRequired("requiredCounterpartyFields")

    /**
     * List of fields that are required by the underlying UMA provider for this currency. If the
     * counterparty does not provide these fields, quote requests will fail.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun providerRequiredCounterpartyCustomerFields(): List<CustomerInfoFieldName>? =
        providerRequiredCounterpartyCustomerFields.getNullable(
            "providerRequiredCounterpartyCustomerFields"
        )

    /**
     * List of customer info field names that are required by the underlying UMA provider when
     * creating a customer for this currency. These fields must be supplied when creating or
     * updating a customer if this currency is intended to be used by that customer. If no fields
     * are required, this field is omitted.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun providerRequiredCustomerFields(): List<CustomerInfoFieldName>? =
        providerRequiredCustomerFields.getNullable("providerRequiredCustomerFields")

    /**
     * Returns the raw JSON value of [currencyCode].
     *
     * Unlike [currencyCode], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("currencyCode")
    @ExcludeMissing
    fun _currencyCode(): JsonField<String> = currencyCode

    /**
     * Returns the raw JSON value of [enabledTransactionTypes].
     *
     * Unlike [enabledTransactionTypes], this method doesn't throw if the JSON field has an
     * unexpected type.
     */
    @JsonProperty("enabledTransactionTypes")
    @ExcludeMissing
    fun _enabledTransactionTypes(): JsonField<List<TransactionType>> = enabledTransactionTypes

    /**
     * Returns the raw JSON value of [maxAmount].
     *
     * Unlike [maxAmount], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("maxAmount") @ExcludeMissing fun _maxAmount(): JsonField<Long> = maxAmount

    /**
     * Returns the raw JSON value of [minAmount].
     *
     * Unlike [minAmount], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("minAmount") @ExcludeMissing fun _minAmount(): JsonField<Long> = minAmount

    /**
     * Returns the raw JSON value of [requiredCounterpartyFields].
     *
     * Unlike [requiredCounterpartyFields], this method doesn't throw if the JSON field has an
     * unexpected type.
     */
    @JsonProperty("requiredCounterpartyFields")
    @ExcludeMissing
    fun _requiredCounterpartyFields(): JsonField<List<CounterpartyFieldDefinition>> =
        requiredCounterpartyFields

    /**
     * Returns the raw JSON value of [providerRequiredCounterpartyCustomerFields].
     *
     * Unlike [providerRequiredCounterpartyCustomerFields], this method doesn't throw if the JSON
     * field has an unexpected type.
     */
    @JsonProperty("providerRequiredCounterpartyCustomerFields")
    @ExcludeMissing
    fun _providerRequiredCounterpartyCustomerFields(): JsonField<List<CustomerInfoFieldName>> =
        providerRequiredCounterpartyCustomerFields

    /**
     * Returns the raw JSON value of [providerRequiredCustomerFields].
     *
     * Unlike [providerRequiredCustomerFields], this method doesn't throw if the JSON field has an
     * unexpected type.
     */
    @JsonProperty("providerRequiredCustomerFields")
    @ExcludeMissing
    fun _providerRequiredCustomerFields(): JsonField<List<CustomerInfoFieldName>> =
        providerRequiredCustomerFields

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
         * Returns a mutable builder for constructing an instance of [PlatformCurrencyConfig].
         *
         * The following fields are required:
         * ```kotlin
         * .currencyCode()
         * .enabledTransactionTypes()
         * .maxAmount()
         * .minAmount()
         * .requiredCounterpartyFields()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [PlatformCurrencyConfig]. */
    class Builder internal constructor() {

        private var currencyCode: JsonField<String>? = null
        private var enabledTransactionTypes: JsonField<MutableList<TransactionType>>? = null
        private var maxAmount: JsonField<Long>? = null
        private var minAmount: JsonField<Long>? = null
        private var requiredCounterpartyFields:
            JsonField<MutableList<CounterpartyFieldDefinition>>? =
            null
        private var providerRequiredCounterpartyCustomerFields:
            JsonField<MutableList<CustomerInfoFieldName>>? =
            null
        private var providerRequiredCustomerFields: JsonField<MutableList<CustomerInfoFieldName>>? =
            null
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(platformCurrencyConfig: PlatformCurrencyConfig) = apply {
            currencyCode = platformCurrencyConfig.currencyCode
            enabledTransactionTypes =
                platformCurrencyConfig.enabledTransactionTypes.map { it.toMutableList() }
            maxAmount = platformCurrencyConfig.maxAmount
            minAmount = platformCurrencyConfig.minAmount
            requiredCounterpartyFields =
                platformCurrencyConfig.requiredCounterpartyFields.map { it.toMutableList() }
            providerRequiredCounterpartyCustomerFields =
                platformCurrencyConfig.providerRequiredCounterpartyCustomerFields.map {
                    it.toMutableList()
                }
            providerRequiredCustomerFields =
                platformCurrencyConfig.providerRequiredCustomerFields.map { it.toMutableList() }
            additionalProperties = platformCurrencyConfig.additionalProperties.toMutableMap()
        }

        /** Three-letter currency code (ISO 4217) */
        fun currencyCode(currencyCode: String) = currencyCode(JsonField.of(currencyCode))

        /**
         * Sets [Builder.currencyCode] to an arbitrary JSON value.
         *
         * You should usually call [Builder.currencyCode] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun currencyCode(currencyCode: JsonField<String>) = apply {
            this.currencyCode = currencyCode
        }

        /** List of transaction types that are enabled for this currency. */
        fun enabledTransactionTypes(enabledTransactionTypes: List<TransactionType>) =
            enabledTransactionTypes(JsonField.of(enabledTransactionTypes))

        /**
         * Sets [Builder.enabledTransactionTypes] to an arbitrary JSON value.
         *
         * You should usually call [Builder.enabledTransactionTypes] with a well-typed
         * `List<TransactionType>` value instead. This method is primarily for setting the field to
         * an undocumented or not yet supported value.
         */
        fun enabledTransactionTypes(enabledTransactionTypes: JsonField<List<TransactionType>>) =
            apply {
                this.enabledTransactionTypes = enabledTransactionTypes.map { it.toMutableList() }
            }

        /**
         * Adds a single [TransactionType] to [enabledTransactionTypes].
         *
         * @throws IllegalStateException if the field was previously set to a non-list.
         */
        fun addEnabledTransactionType(enabledTransactionType: TransactionType) = apply {
            enabledTransactionTypes =
                (enabledTransactionTypes ?: JsonField.of(mutableListOf())).also {
                    checkKnown("enabledTransactionTypes", it).add(enabledTransactionType)
                }
        }

        /** Maximum amount that can be sent in the smallest unit of this currency */
        fun maxAmount(maxAmount: Long) = maxAmount(JsonField.of(maxAmount))

        /**
         * Sets [Builder.maxAmount] to an arbitrary JSON value.
         *
         * You should usually call [Builder.maxAmount] with a well-typed [Long] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun maxAmount(maxAmount: JsonField<Long>) = apply { this.maxAmount = maxAmount }

        /** Minimum amount that can be sent in the smallest unit of this currency */
        fun minAmount(minAmount: Long) = minAmount(JsonField.of(minAmount))

        /**
         * Sets [Builder.minAmount] to an arbitrary JSON value.
         *
         * You should usually call [Builder.minAmount] with a well-typed [Long] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun minAmount(minAmount: JsonField<Long>) = apply { this.minAmount = minAmount }

        /**
         * List of fields which the platform requires from the counterparty institutions about
         * counterparty customers. Platforms can set mandatory to false if the platform does not
         * require the field, but would like to have it available. Some fields may be required by
         * the underlying UMA provider.
         */
        fun requiredCounterpartyFields(
            requiredCounterpartyFields: List<CounterpartyFieldDefinition>
        ) = requiredCounterpartyFields(JsonField.of(requiredCounterpartyFields))

        /**
         * Sets [Builder.requiredCounterpartyFields] to an arbitrary JSON value.
         *
         * You should usually call [Builder.requiredCounterpartyFields] with a well-typed
         * `List<CounterpartyFieldDefinition>` value instead. This method is primarily for setting
         * the field to an undocumented or not yet supported value.
         */
        fun requiredCounterpartyFields(
            requiredCounterpartyFields: JsonField<List<CounterpartyFieldDefinition>>
        ) = apply {
            this.requiredCounterpartyFields = requiredCounterpartyFields.map { it.toMutableList() }
        }

        /**
         * Adds a single [CounterpartyFieldDefinition] to [requiredCounterpartyFields].
         *
         * @throws IllegalStateException if the field was previously set to a non-list.
         */
        fun addRequiredCounterpartyField(requiredCounterpartyField: CounterpartyFieldDefinition) =
            apply {
                requiredCounterpartyFields =
                    (requiredCounterpartyFields ?: JsonField.of(mutableListOf())).also {
                        checkKnown("requiredCounterpartyFields", it).add(requiredCounterpartyField)
                    }
            }

        /**
         * List of fields that are required by the underlying UMA provider for this currency. If the
         * counterparty does not provide these fields, quote requests will fail.
         */
        fun providerRequiredCounterpartyCustomerFields(
            providerRequiredCounterpartyCustomerFields: List<CustomerInfoFieldName>
        ) =
            providerRequiredCounterpartyCustomerFields(
                JsonField.of(providerRequiredCounterpartyCustomerFields)
            )

        /**
         * Sets [Builder.providerRequiredCounterpartyCustomerFields] to an arbitrary JSON value.
         *
         * You should usually call [Builder.providerRequiredCounterpartyCustomerFields] with a
         * well-typed `List<CustomerInfoFieldName>` value instead. This method is primarily for
         * setting the field to an undocumented or not yet supported value.
         */
        fun providerRequiredCounterpartyCustomerFields(
            providerRequiredCounterpartyCustomerFields: JsonField<List<CustomerInfoFieldName>>
        ) = apply {
            this.providerRequiredCounterpartyCustomerFields =
                providerRequiredCounterpartyCustomerFields.map { it.toMutableList() }
        }

        /**
         * Adds a single [CustomerInfoFieldName] to [providerRequiredCounterpartyCustomerFields].
         *
         * @throws IllegalStateException if the field was previously set to a non-list.
         */
        fun addProviderRequiredCounterpartyCustomerField(
            providerRequiredCounterpartyCustomerField: CustomerInfoFieldName
        ) = apply {
            providerRequiredCounterpartyCustomerFields =
                (providerRequiredCounterpartyCustomerFields ?: JsonField.of(mutableListOf())).also {
                    checkKnown("providerRequiredCounterpartyCustomerFields", it)
                        .add(providerRequiredCounterpartyCustomerField)
                }
        }

        /**
         * List of customer info field names that are required by the underlying UMA provider when
         * creating a customer for this currency. These fields must be supplied when creating or
         * updating a customer if this currency is intended to be used by that customer. If no
         * fields are required, this field is omitted.
         */
        fun providerRequiredCustomerFields(
            providerRequiredCustomerFields: List<CustomerInfoFieldName>
        ) = providerRequiredCustomerFields(JsonField.of(providerRequiredCustomerFields))

        /**
         * Sets [Builder.providerRequiredCustomerFields] to an arbitrary JSON value.
         *
         * You should usually call [Builder.providerRequiredCustomerFields] with a well-typed
         * `List<CustomerInfoFieldName>` value instead. This method is primarily for setting the
         * field to an undocumented or not yet supported value.
         */
        fun providerRequiredCustomerFields(
            providerRequiredCustomerFields: JsonField<List<CustomerInfoFieldName>>
        ) = apply {
            this.providerRequiredCustomerFields =
                providerRequiredCustomerFields.map { it.toMutableList() }
        }

        /**
         * Adds a single [CustomerInfoFieldName] to [providerRequiredCustomerFields].
         *
         * @throws IllegalStateException if the field was previously set to a non-list.
         */
        fun addProviderRequiredCustomerField(providerRequiredCustomerField: CustomerInfoFieldName) =
            apply {
                providerRequiredCustomerFields =
                    (providerRequiredCustomerFields ?: JsonField.of(mutableListOf())).also {
                        checkKnown("providerRequiredCustomerFields", it)
                            .add(providerRequiredCustomerField)
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
         * Returns an immutable instance of [PlatformCurrencyConfig].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .currencyCode()
         * .enabledTransactionTypes()
         * .maxAmount()
         * .minAmount()
         * .requiredCounterpartyFields()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): PlatformCurrencyConfig =
            PlatformCurrencyConfig(
                checkRequired("currencyCode", currencyCode),
                checkRequired("enabledTransactionTypes", enabledTransactionTypes).map {
                    it.toImmutable()
                },
                checkRequired("maxAmount", maxAmount),
                checkRequired("minAmount", minAmount),
                checkRequired("requiredCounterpartyFields", requiredCounterpartyFields).map {
                    it.toImmutable()
                },
                (providerRequiredCounterpartyCustomerFields ?: JsonMissing.of()).map {
                    it.toImmutable()
                },
                (providerRequiredCustomerFields ?: JsonMissing.of()).map { it.toImmutable() },
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): PlatformCurrencyConfig = apply {
        if (validated) {
            return@apply
        }

        currencyCode()
        enabledTransactionTypes().forEach { it.validate() }
        maxAmount()
        minAmount()
        requiredCounterpartyFields().forEach { it.validate() }
        providerRequiredCounterpartyCustomerFields()?.forEach { it.validate() }
        providerRequiredCustomerFields()?.forEach { it.validate() }
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
        (if (currencyCode.asKnown() == null) 0 else 1) +
            (enabledTransactionTypes.asKnown()?.sumOf { it.validity().toInt() } ?: 0) +
            (if (maxAmount.asKnown() == null) 0 else 1) +
            (if (minAmount.asKnown() == null) 0 else 1) +
            (requiredCounterpartyFields.asKnown()?.sumOf { it.validity().toInt() } ?: 0) +
            (providerRequiredCounterpartyCustomerFields.asKnown()?.sumOf { it.validity().toInt() }
                ?: 0) +
            (providerRequiredCustomerFields.asKnown()?.sumOf { it.validity().toInt() } ?: 0)

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is PlatformCurrencyConfig &&
            currencyCode == other.currencyCode &&
            enabledTransactionTypes == other.enabledTransactionTypes &&
            maxAmount == other.maxAmount &&
            minAmount == other.minAmount &&
            requiredCounterpartyFields == other.requiredCounterpartyFields &&
            providerRequiredCounterpartyCustomerFields ==
                other.providerRequiredCounterpartyCustomerFields &&
            providerRequiredCustomerFields == other.providerRequiredCustomerFields &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(
            currencyCode,
            enabledTransactionTypes,
            maxAmount,
            minAmount,
            requiredCounterpartyFields,
            providerRequiredCounterpartyCustomerFields,
            providerRequiredCustomerFields,
            additionalProperties,
        )
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "PlatformCurrencyConfig{currencyCode=$currencyCode, enabledTransactionTypes=$enabledTransactionTypes, maxAmount=$maxAmount, minAmount=$minAmount, requiredCounterpartyFields=$requiredCounterpartyFields, providerRequiredCounterpartyCustomerFields=$providerRequiredCounterpartyCustomerFields, providerRequiredCustomerFields=$providerRequiredCustomerFields, additionalProperties=$additionalProperties}"
}
