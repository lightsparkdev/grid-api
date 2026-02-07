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
import com.grid.api.core.checkRequired
import com.grid.api.errors.GridInvalidDataException
import java.util.Collections
import java.util.Objects

/** Details about the rate and fees for an outgoing transaction or quote. */
class OutgoingRateDetails
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val counterpartyFixedFee: JsonField<Long>,
    private val counterpartyMultiplier: JsonField<Double>,
    private val gridApiFixedFee: JsonField<Long>,
    private val gridApiMultiplier: JsonField<Double>,
    private val gridApiVariableFeeAmount: JsonField<Double>,
    private val gridApiVariableFeeRate: JsonField<Double>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("counterpartyFixedFee")
        @ExcludeMissing
        counterpartyFixedFee: JsonField<Long> = JsonMissing.of(),
        @JsonProperty("counterpartyMultiplier")
        @ExcludeMissing
        counterpartyMultiplier: JsonField<Double> = JsonMissing.of(),
        @JsonProperty("gridApiFixedFee")
        @ExcludeMissing
        gridApiFixedFee: JsonField<Long> = JsonMissing.of(),
        @JsonProperty("gridApiMultiplier")
        @ExcludeMissing
        gridApiMultiplier: JsonField<Double> = JsonMissing.of(),
        @JsonProperty("gridApiVariableFeeAmount")
        @ExcludeMissing
        gridApiVariableFeeAmount: JsonField<Double> = JsonMissing.of(),
        @JsonProperty("gridApiVariableFeeRate")
        @ExcludeMissing
        gridApiVariableFeeRate: JsonField<Double> = JsonMissing.of(),
    ) : this(
        counterpartyFixedFee,
        counterpartyMultiplier,
        gridApiFixedFee,
        gridApiMultiplier,
        gridApiVariableFeeAmount,
        gridApiVariableFeeRate,
        mutableMapOf(),
    )

    /**
     * The fixed fee charged by the counterparty institution to execute the quote in the smallest
     * unit of the receiving currency (eg. cents).
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun counterpartyFixedFee(): Long = counterpartyFixedFee.getRequired("counterpartyFixedFee")

    /**
     * The underlying multiplier from mSATs to the receiving currency as returned by the
     * counterparty institution.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun counterpartyMultiplier(): Double =
        counterpartyMultiplier.getRequired("counterpartyMultiplier")

    /**
     * The fixed fee charged by the Grid product to execute the quote in the smallest unit of the
     * sending currency (eg. cents).
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun gridApiFixedFee(): Long = gridApiFixedFee.getRequired("gridApiFixedFee")

    /**
     * The underlying multiplier from the sending currency to mSATS, including variable fees.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun gridApiMultiplier(): Double = gridApiMultiplier.getRequired("gridApiMultiplier")

    /**
     * The variable fee amount charged by the Grid product to execute the quote in the smallest unit
     * of the sending currency (eg. cents). This is the sending amount times gridApiVariableFeeRate.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun gridApiVariableFeeAmount(): Double =
        gridApiVariableFeeAmount.getRequired("gridApiVariableFeeAmount")

    /**
     * The variable fee rate charged by the Grid product to execute the quote as a percentage of the
     * sending currency amount.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun gridApiVariableFeeRate(): Double =
        gridApiVariableFeeRate.getRequired("gridApiVariableFeeRate")

    /**
     * Returns the raw JSON value of [counterpartyFixedFee].
     *
     * Unlike [counterpartyFixedFee], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    @JsonProperty("counterpartyFixedFee")
    @ExcludeMissing
    fun _counterpartyFixedFee(): JsonField<Long> = counterpartyFixedFee

    /**
     * Returns the raw JSON value of [counterpartyMultiplier].
     *
     * Unlike [counterpartyMultiplier], this method doesn't throw if the JSON field has an
     * unexpected type.
     */
    @JsonProperty("counterpartyMultiplier")
    @ExcludeMissing
    fun _counterpartyMultiplier(): JsonField<Double> = counterpartyMultiplier

    /**
     * Returns the raw JSON value of [gridApiFixedFee].
     *
     * Unlike [gridApiFixedFee], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("gridApiFixedFee")
    @ExcludeMissing
    fun _gridApiFixedFee(): JsonField<Long> = gridApiFixedFee

    /**
     * Returns the raw JSON value of [gridApiMultiplier].
     *
     * Unlike [gridApiMultiplier], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    @JsonProperty("gridApiMultiplier")
    @ExcludeMissing
    fun _gridApiMultiplier(): JsonField<Double> = gridApiMultiplier

    /**
     * Returns the raw JSON value of [gridApiVariableFeeAmount].
     *
     * Unlike [gridApiVariableFeeAmount], this method doesn't throw if the JSON field has an
     * unexpected type.
     */
    @JsonProperty("gridApiVariableFeeAmount")
    @ExcludeMissing
    fun _gridApiVariableFeeAmount(): JsonField<Double> = gridApiVariableFeeAmount

    /**
     * Returns the raw JSON value of [gridApiVariableFeeRate].
     *
     * Unlike [gridApiVariableFeeRate], this method doesn't throw if the JSON field has an
     * unexpected type.
     */
    @JsonProperty("gridApiVariableFeeRate")
    @ExcludeMissing
    fun _gridApiVariableFeeRate(): JsonField<Double> = gridApiVariableFeeRate

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
         * Returns a mutable builder for constructing an instance of [OutgoingRateDetails].
         *
         * The following fields are required:
         * ```kotlin
         * .counterpartyFixedFee()
         * .counterpartyMultiplier()
         * .gridApiFixedFee()
         * .gridApiMultiplier()
         * .gridApiVariableFeeAmount()
         * .gridApiVariableFeeRate()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [OutgoingRateDetails]. */
    class Builder internal constructor() {

        private var counterpartyFixedFee: JsonField<Long>? = null
        private var counterpartyMultiplier: JsonField<Double>? = null
        private var gridApiFixedFee: JsonField<Long>? = null
        private var gridApiMultiplier: JsonField<Double>? = null
        private var gridApiVariableFeeAmount: JsonField<Double>? = null
        private var gridApiVariableFeeRate: JsonField<Double>? = null
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(outgoingRateDetails: OutgoingRateDetails) = apply {
            counterpartyFixedFee = outgoingRateDetails.counterpartyFixedFee
            counterpartyMultiplier = outgoingRateDetails.counterpartyMultiplier
            gridApiFixedFee = outgoingRateDetails.gridApiFixedFee
            gridApiMultiplier = outgoingRateDetails.gridApiMultiplier
            gridApiVariableFeeAmount = outgoingRateDetails.gridApiVariableFeeAmount
            gridApiVariableFeeRate = outgoingRateDetails.gridApiVariableFeeRate
            additionalProperties = outgoingRateDetails.additionalProperties.toMutableMap()
        }

        /**
         * The fixed fee charged by the counterparty institution to execute the quote in the
         * smallest unit of the receiving currency (eg. cents).
         */
        fun counterpartyFixedFee(counterpartyFixedFee: Long) =
            counterpartyFixedFee(JsonField.of(counterpartyFixedFee))

        /**
         * Sets [Builder.counterpartyFixedFee] to an arbitrary JSON value.
         *
         * You should usually call [Builder.counterpartyFixedFee] with a well-typed [Long] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun counterpartyFixedFee(counterpartyFixedFee: JsonField<Long>) = apply {
            this.counterpartyFixedFee = counterpartyFixedFee
        }

        /**
         * The underlying multiplier from mSATs to the receiving currency as returned by the
         * counterparty institution.
         */
        fun counterpartyMultiplier(counterpartyMultiplier: Double) =
            counterpartyMultiplier(JsonField.of(counterpartyMultiplier))

        /**
         * Sets [Builder.counterpartyMultiplier] to an arbitrary JSON value.
         *
         * You should usually call [Builder.counterpartyMultiplier] with a well-typed [Double] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun counterpartyMultiplier(counterpartyMultiplier: JsonField<Double>) = apply {
            this.counterpartyMultiplier = counterpartyMultiplier
        }

        /**
         * The fixed fee charged by the Grid product to execute the quote in the smallest unit of
         * the sending currency (eg. cents).
         */
        fun gridApiFixedFee(gridApiFixedFee: Long) = gridApiFixedFee(JsonField.of(gridApiFixedFee))

        /**
         * Sets [Builder.gridApiFixedFee] to an arbitrary JSON value.
         *
         * You should usually call [Builder.gridApiFixedFee] with a well-typed [Long] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun gridApiFixedFee(gridApiFixedFee: JsonField<Long>) = apply {
            this.gridApiFixedFee = gridApiFixedFee
        }

        /**
         * The underlying multiplier from the sending currency to mSATS, including variable fees.
         */
        fun gridApiMultiplier(gridApiMultiplier: Double) =
            gridApiMultiplier(JsonField.of(gridApiMultiplier))

        /**
         * Sets [Builder.gridApiMultiplier] to an arbitrary JSON value.
         *
         * You should usually call [Builder.gridApiMultiplier] with a well-typed [Double] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun gridApiMultiplier(gridApiMultiplier: JsonField<Double>) = apply {
            this.gridApiMultiplier = gridApiMultiplier
        }

        /**
         * The variable fee amount charged by the Grid product to execute the quote in the smallest
         * unit of the sending currency (eg. cents). This is the sending amount times
         * gridApiVariableFeeRate.
         */
        fun gridApiVariableFeeAmount(gridApiVariableFeeAmount: Double) =
            gridApiVariableFeeAmount(JsonField.of(gridApiVariableFeeAmount))

        /**
         * Sets [Builder.gridApiVariableFeeAmount] to an arbitrary JSON value.
         *
         * You should usually call [Builder.gridApiVariableFeeAmount] with a well-typed [Double]
         * value instead. This method is primarily for setting the field to an undocumented or not
         * yet supported value.
         */
        fun gridApiVariableFeeAmount(gridApiVariableFeeAmount: JsonField<Double>) = apply {
            this.gridApiVariableFeeAmount = gridApiVariableFeeAmount
        }

        /**
         * The variable fee rate charged by the Grid product to execute the quote as a percentage of
         * the sending currency amount.
         */
        fun gridApiVariableFeeRate(gridApiVariableFeeRate: Double) =
            gridApiVariableFeeRate(JsonField.of(gridApiVariableFeeRate))

        /**
         * Sets [Builder.gridApiVariableFeeRate] to an arbitrary JSON value.
         *
         * You should usually call [Builder.gridApiVariableFeeRate] with a well-typed [Double] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun gridApiVariableFeeRate(gridApiVariableFeeRate: JsonField<Double>) = apply {
            this.gridApiVariableFeeRate = gridApiVariableFeeRate
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
         * Returns an immutable instance of [OutgoingRateDetails].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .counterpartyFixedFee()
         * .counterpartyMultiplier()
         * .gridApiFixedFee()
         * .gridApiMultiplier()
         * .gridApiVariableFeeAmount()
         * .gridApiVariableFeeRate()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): OutgoingRateDetails =
            OutgoingRateDetails(
                checkRequired("counterpartyFixedFee", counterpartyFixedFee),
                checkRequired("counterpartyMultiplier", counterpartyMultiplier),
                checkRequired("gridApiFixedFee", gridApiFixedFee),
                checkRequired("gridApiMultiplier", gridApiMultiplier),
                checkRequired("gridApiVariableFeeAmount", gridApiVariableFeeAmount),
                checkRequired("gridApiVariableFeeRate", gridApiVariableFeeRate),
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): OutgoingRateDetails = apply {
        if (validated) {
            return@apply
        }

        counterpartyFixedFee()
        counterpartyMultiplier()
        gridApiFixedFee()
        gridApiMultiplier()
        gridApiVariableFeeAmount()
        gridApiVariableFeeRate()
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
        (if (counterpartyFixedFee.asKnown() == null) 0 else 1) +
            (if (counterpartyMultiplier.asKnown() == null) 0 else 1) +
            (if (gridApiFixedFee.asKnown() == null) 0 else 1) +
            (if (gridApiMultiplier.asKnown() == null) 0 else 1) +
            (if (gridApiVariableFeeAmount.asKnown() == null) 0 else 1) +
            (if (gridApiVariableFeeRate.asKnown() == null) 0 else 1)

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is OutgoingRateDetails &&
            counterpartyFixedFee == other.counterpartyFixedFee &&
            counterpartyMultiplier == other.counterpartyMultiplier &&
            gridApiFixedFee == other.gridApiFixedFee &&
            gridApiMultiplier == other.gridApiMultiplier &&
            gridApiVariableFeeAmount == other.gridApiVariableFeeAmount &&
            gridApiVariableFeeRate == other.gridApiVariableFeeRate &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(
            counterpartyFixedFee,
            counterpartyMultiplier,
            gridApiFixedFee,
            gridApiMultiplier,
            gridApiVariableFeeAmount,
            gridApiVariableFeeRate,
            additionalProperties,
        )
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "OutgoingRateDetails{counterpartyFixedFee=$counterpartyFixedFee, counterpartyMultiplier=$counterpartyMultiplier, gridApiFixedFee=$gridApiFixedFee, gridApiMultiplier=$gridApiMultiplier, gridApiVariableFeeAmount=$gridApiVariableFeeAmount, gridApiVariableFeeRate=$gridApiVariableFeeRate, additionalProperties=$additionalProperties}"
}
