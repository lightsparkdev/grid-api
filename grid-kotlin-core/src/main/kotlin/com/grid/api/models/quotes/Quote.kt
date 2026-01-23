// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.quotes

import com.fasterxml.jackson.annotation.JsonAnyGetter
import com.fasterxml.jackson.annotation.JsonAnySetter
import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.core.ObjectCodec
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.SerializerProvider
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.fasterxml.jackson.databind.annotation.JsonSerialize
import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.BaseDeserializer
import com.grid.api.core.BaseSerializer
import com.grid.api.core.Enum
import com.grid.api.core.ExcludeMissing
import com.grid.api.core.JsonField
import com.grid.api.core.JsonMissing
import com.grid.api.core.JsonValue
import com.grid.api.core.checkKnown
import com.grid.api.core.checkRequired
import com.grid.api.core.getOrThrow
import com.grid.api.core.toImmutable
import com.grid.api.errors.GridInvalidDataException
import java.time.OffsetDateTime
import java.util.Collections
import java.util.Objects

class Quote
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val createdAt: JsonField<OffsetDateTime>,
    private val destination: JsonField<Destination>,
    private val exchangeRate: JsonField<Double>,
    private val expiresAt: JsonField<OffsetDateTime>,
    private val feesIncluded: JsonField<Long>,
    private val quoteId: JsonField<String>,
    private val receivingCurrency: JsonField<Currency>,
    private val sendingCurrency: JsonField<Currency>,
    private val source: JsonField<QuoteSource>,
    private val status: JsonField<Status>,
    private val totalReceivingAmount: JsonField<Long>,
    private val totalSendingAmount: JsonField<Long>,
    private val transactionId: JsonField<String>,
    private val originalQuoteId: JsonField<String>,
    private val paymentInstructions: JsonField<List<PaymentInstructions>>,
    private val rateDetails: JsonField<OutgoingRateDetails>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("createdAt")
        @ExcludeMissing
        createdAt: JsonField<OffsetDateTime> = JsonMissing.of(),
        @JsonProperty("destination")
        @ExcludeMissing
        destination: JsonField<Destination> = JsonMissing.of(),
        @JsonProperty("exchangeRate")
        @ExcludeMissing
        exchangeRate: JsonField<Double> = JsonMissing.of(),
        @JsonProperty("expiresAt")
        @ExcludeMissing
        expiresAt: JsonField<OffsetDateTime> = JsonMissing.of(),
        @JsonProperty("feesIncluded")
        @ExcludeMissing
        feesIncluded: JsonField<Long> = JsonMissing.of(),
        @JsonProperty("quoteId") @ExcludeMissing quoteId: JsonField<String> = JsonMissing.of(),
        @JsonProperty("receivingCurrency")
        @ExcludeMissing
        receivingCurrency: JsonField<Currency> = JsonMissing.of(),
        @JsonProperty("sendingCurrency")
        @ExcludeMissing
        sendingCurrency: JsonField<Currency> = JsonMissing.of(),
        @JsonProperty("source") @ExcludeMissing source: JsonField<QuoteSource> = JsonMissing.of(),
        @JsonProperty("status") @ExcludeMissing status: JsonField<Status> = JsonMissing.of(),
        @JsonProperty("totalReceivingAmount")
        @ExcludeMissing
        totalReceivingAmount: JsonField<Long> = JsonMissing.of(),
        @JsonProperty("totalSendingAmount")
        @ExcludeMissing
        totalSendingAmount: JsonField<Long> = JsonMissing.of(),
        @JsonProperty("transactionId")
        @ExcludeMissing
        transactionId: JsonField<String> = JsonMissing.of(),
        @JsonProperty("originalQuoteId")
        @ExcludeMissing
        originalQuoteId: JsonField<String> = JsonMissing.of(),
        @JsonProperty("paymentInstructions")
        @ExcludeMissing
        paymentInstructions: JsonField<List<PaymentInstructions>> = JsonMissing.of(),
        @JsonProperty("rateDetails")
        @ExcludeMissing
        rateDetails: JsonField<OutgoingRateDetails> = JsonMissing.of(),
    ) : this(
        createdAt,
        destination,
        exchangeRate,
        expiresAt,
        feesIncluded,
        quoteId,
        receivingCurrency,
        sendingCurrency,
        source,
        status,
        totalReceivingAmount,
        totalSendingAmount,
        transactionId,
        originalQuoteId,
        paymentInstructions,
        rateDetails,
        mutableMapOf(),
    )

    /**
     * When this quote was created
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun createdAt(): OffsetDateTime = createdAt.getRequired("createdAt")

    /**
     * Destination account details
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun destination(): Destination = destination.getRequired("destination")

    /**
     * Number of sending currency units per receiving currency unit.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun exchangeRate(): Double = exchangeRate.getRequired("exchangeRate")

    /**
     * When this quote expires (typically 1-5 minutes after creation)
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun expiresAt(): OffsetDateTime = expiresAt.getRequired("expiresAt")

    /**
     * The fees associated with the quote in the smallest unit of the sending currency (eg. cents).
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun feesIncluded(): Long = feesIncluded.getRequired("feesIncluded")

    /**
     * Unique identifier for this quote
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun quoteId(): String = quoteId.getRequired("quoteId")

    /**
     * Currency for the receiving amount
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun receivingCurrency(): Currency = receivingCurrency.getRequired("receivingCurrency")

    /**
     * Currency for the sending amount
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun sendingCurrency(): Currency = sendingCurrency.getRequired("sendingCurrency")

    /**
     * Source account details
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun source(): QuoteSource = source.getRequired("source")

    /**
     * Current status of the quote
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun status(): Status = status.getRequired("status")

    /**
     * The total amount that will be received in the smallest unit of the receiving currency (eg.
     * cents).
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun totalReceivingAmount(): Long = totalReceivingAmount.getRequired("totalReceivingAmount")

    /**
     * The total amount that will be sent in the smallest unit of the sending currency (eg. cents).
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun totalSendingAmount(): Long = totalSendingAmount.getRequired("totalSendingAmount")

    /**
     * The ID of the transaction created from this quote.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun transactionId(): String = transactionId.getRequired("transactionId")

    /**
     * ID of the quote that is being retried
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun originalQuoteId(): String? = originalQuoteId.getNullable("originalQuoteId")

    /**
     * Payment instructions for executing the payment. This is not required when using an internal
     * account source.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun paymentInstructions(): List<PaymentInstructions>? =
        paymentInstructions.getNullable("paymentInstructions")

    /**
     * Details about the rate and fees for the transaction.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun rateDetails(): OutgoingRateDetails? = rateDetails.getNullable("rateDetails")

    /**
     * Returns the raw JSON value of [createdAt].
     *
     * Unlike [createdAt], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("createdAt")
    @ExcludeMissing
    fun _createdAt(): JsonField<OffsetDateTime> = createdAt

    /**
     * Returns the raw JSON value of [destination].
     *
     * Unlike [destination], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("destination")
    @ExcludeMissing
    fun _destination(): JsonField<Destination> = destination

    /**
     * Returns the raw JSON value of [exchangeRate].
     *
     * Unlike [exchangeRate], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("exchangeRate")
    @ExcludeMissing
    fun _exchangeRate(): JsonField<Double> = exchangeRate

    /**
     * Returns the raw JSON value of [expiresAt].
     *
     * Unlike [expiresAt], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("expiresAt")
    @ExcludeMissing
    fun _expiresAt(): JsonField<OffsetDateTime> = expiresAt

    /**
     * Returns the raw JSON value of [feesIncluded].
     *
     * Unlike [feesIncluded], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("feesIncluded")
    @ExcludeMissing
    fun _feesIncluded(): JsonField<Long> = feesIncluded

    /**
     * Returns the raw JSON value of [quoteId].
     *
     * Unlike [quoteId], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("quoteId") @ExcludeMissing fun _quoteId(): JsonField<String> = quoteId

    /**
     * Returns the raw JSON value of [receivingCurrency].
     *
     * Unlike [receivingCurrency], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    @JsonProperty("receivingCurrency")
    @ExcludeMissing
    fun _receivingCurrency(): JsonField<Currency> = receivingCurrency

    /**
     * Returns the raw JSON value of [sendingCurrency].
     *
     * Unlike [sendingCurrency], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("sendingCurrency")
    @ExcludeMissing
    fun _sendingCurrency(): JsonField<Currency> = sendingCurrency

    /**
     * Returns the raw JSON value of [source].
     *
     * Unlike [source], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("source") @ExcludeMissing fun _source(): JsonField<QuoteSource> = source

    /**
     * Returns the raw JSON value of [status].
     *
     * Unlike [status], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("status") @ExcludeMissing fun _status(): JsonField<Status> = status

    /**
     * Returns the raw JSON value of [totalReceivingAmount].
     *
     * Unlike [totalReceivingAmount], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    @JsonProperty("totalReceivingAmount")
    @ExcludeMissing
    fun _totalReceivingAmount(): JsonField<Long> = totalReceivingAmount

    /**
     * Returns the raw JSON value of [totalSendingAmount].
     *
     * Unlike [totalSendingAmount], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    @JsonProperty("totalSendingAmount")
    @ExcludeMissing
    fun _totalSendingAmount(): JsonField<Long> = totalSendingAmount

    /**
     * Returns the raw JSON value of [transactionId].
     *
     * Unlike [transactionId], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("transactionId")
    @ExcludeMissing
    fun _transactionId(): JsonField<String> = transactionId

    /**
     * Returns the raw JSON value of [originalQuoteId].
     *
     * Unlike [originalQuoteId], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("originalQuoteId")
    @ExcludeMissing
    fun _originalQuoteId(): JsonField<String> = originalQuoteId

    /**
     * Returns the raw JSON value of [paymentInstructions].
     *
     * Unlike [paymentInstructions], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    @JsonProperty("paymentInstructions")
    @ExcludeMissing
    fun _paymentInstructions(): JsonField<List<PaymentInstructions>> = paymentInstructions

    /**
     * Returns the raw JSON value of [rateDetails].
     *
     * Unlike [rateDetails], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("rateDetails")
    @ExcludeMissing
    fun _rateDetails(): JsonField<OutgoingRateDetails> = rateDetails

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
         * Returns a mutable builder for constructing an instance of [Quote].
         *
         * The following fields are required:
         * ```kotlin
         * .createdAt()
         * .destination()
         * .exchangeRate()
         * .expiresAt()
         * .feesIncluded()
         * .quoteId()
         * .receivingCurrency()
         * .sendingCurrency()
         * .source()
         * .status()
         * .totalReceivingAmount()
         * .totalSendingAmount()
         * .transactionId()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [Quote]. */
    class Builder internal constructor() {

        private var createdAt: JsonField<OffsetDateTime>? = null
        private var destination: JsonField<Destination>? = null
        private var exchangeRate: JsonField<Double>? = null
        private var expiresAt: JsonField<OffsetDateTime>? = null
        private var feesIncluded: JsonField<Long>? = null
        private var quoteId: JsonField<String>? = null
        private var receivingCurrency: JsonField<Currency>? = null
        private var sendingCurrency: JsonField<Currency>? = null
        private var source: JsonField<QuoteSource>? = null
        private var status: JsonField<Status>? = null
        private var totalReceivingAmount: JsonField<Long>? = null
        private var totalSendingAmount: JsonField<Long>? = null
        private var transactionId: JsonField<String>? = null
        private var originalQuoteId: JsonField<String> = JsonMissing.of()
        private var paymentInstructions: JsonField<MutableList<PaymentInstructions>>? = null
        private var rateDetails: JsonField<OutgoingRateDetails> = JsonMissing.of()
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(quote: Quote) = apply {
            createdAt = quote.createdAt
            destination = quote.destination
            exchangeRate = quote.exchangeRate
            expiresAt = quote.expiresAt
            feesIncluded = quote.feesIncluded
            quoteId = quote.quoteId
            receivingCurrency = quote.receivingCurrency
            sendingCurrency = quote.sendingCurrency
            source = quote.source
            status = quote.status
            totalReceivingAmount = quote.totalReceivingAmount
            totalSendingAmount = quote.totalSendingAmount
            transactionId = quote.transactionId
            originalQuoteId = quote.originalQuoteId
            paymentInstructions = quote.paymentInstructions.map { it.toMutableList() }
            rateDetails = quote.rateDetails
            additionalProperties = quote.additionalProperties.toMutableMap()
        }

        /** When this quote was created */
        fun createdAt(createdAt: OffsetDateTime) = createdAt(JsonField.of(createdAt))

        /**
         * Sets [Builder.createdAt] to an arbitrary JSON value.
         *
         * You should usually call [Builder.createdAt] with a well-typed [OffsetDateTime] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun createdAt(createdAt: JsonField<OffsetDateTime>) = apply { this.createdAt = createdAt }

        /** Destination account details */
        fun destination(destination: Destination) = destination(JsonField.of(destination))

        /**
         * Sets [Builder.destination] to an arbitrary JSON value.
         *
         * You should usually call [Builder.destination] with a well-typed [Destination] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun destination(destination: JsonField<Destination>) = apply {
            this.destination = destination
        }

        /** Alias for calling [destination] with `Destination.ofAccount(account)`. */
        fun destination(account: Destination.Account) = destination(Destination.ofAccount(account))

        /**
         * Alias for calling [destination] with the following:
         * ```kotlin
         * Destination.Account.builder()
         *     .accountId(accountId)
         *     .build()
         * ```
         */
        fun accountDestination(accountId: String) =
            destination(Destination.Account.builder().accountId(accountId).build())

        /** Alias for calling [destination] with `Destination.ofUmaAddress(umaAddress)`. */
        fun destination(umaAddress: Destination.UmaAddress) =
            destination(Destination.ofUmaAddress(umaAddress))

        /**
         * Alias for calling [destination] with the following:
         * ```kotlin
         * Destination.UmaAddress.builder()
         *     .umaAddress(umaAddress)
         *     .build()
         * ```
         */
        fun umaAddressDestination(umaAddress: String) =
            destination(Destination.UmaAddress.builder().umaAddress(umaAddress).build())

        /** Number of sending currency units per receiving currency unit. */
        fun exchangeRate(exchangeRate: Double) = exchangeRate(JsonField.of(exchangeRate))

        /**
         * Sets [Builder.exchangeRate] to an arbitrary JSON value.
         *
         * You should usually call [Builder.exchangeRate] with a well-typed [Double] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun exchangeRate(exchangeRate: JsonField<Double>) = apply {
            this.exchangeRate = exchangeRate
        }

        /** When this quote expires (typically 1-5 minutes after creation) */
        fun expiresAt(expiresAt: OffsetDateTime) = expiresAt(JsonField.of(expiresAt))

        /**
         * Sets [Builder.expiresAt] to an arbitrary JSON value.
         *
         * You should usually call [Builder.expiresAt] with a well-typed [OffsetDateTime] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun expiresAt(expiresAt: JsonField<OffsetDateTime>) = apply { this.expiresAt = expiresAt }

        /**
         * The fees associated with the quote in the smallest unit of the sending currency (eg.
         * cents).
         */
        fun feesIncluded(feesIncluded: Long) = feesIncluded(JsonField.of(feesIncluded))

        /**
         * Sets [Builder.feesIncluded] to an arbitrary JSON value.
         *
         * You should usually call [Builder.feesIncluded] with a well-typed [Long] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun feesIncluded(feesIncluded: JsonField<Long>) = apply { this.feesIncluded = feesIncluded }

        /** Unique identifier for this quote */
        fun quoteId(quoteId: String) = quoteId(JsonField.of(quoteId))

        /**
         * Sets [Builder.quoteId] to an arbitrary JSON value.
         *
         * You should usually call [Builder.quoteId] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun quoteId(quoteId: JsonField<String>) = apply { this.quoteId = quoteId }

        /** Currency for the receiving amount */
        fun receivingCurrency(receivingCurrency: Currency) =
            receivingCurrency(JsonField.of(receivingCurrency))

        /**
         * Sets [Builder.receivingCurrency] to an arbitrary JSON value.
         *
         * You should usually call [Builder.receivingCurrency] with a well-typed [Currency] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun receivingCurrency(receivingCurrency: JsonField<Currency>) = apply {
            this.receivingCurrency = receivingCurrency
        }

        /** Currency for the sending amount */
        fun sendingCurrency(sendingCurrency: Currency) =
            sendingCurrency(JsonField.of(sendingCurrency))

        /**
         * Sets [Builder.sendingCurrency] to an arbitrary JSON value.
         *
         * You should usually call [Builder.sendingCurrency] with a well-typed [Currency] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun sendingCurrency(sendingCurrency: JsonField<Currency>) = apply {
            this.sendingCurrency = sendingCurrency
        }

        /** Source account details */
        fun source(source: QuoteSource) = source(JsonField.of(source))

        /**
         * Sets [Builder.source] to an arbitrary JSON value.
         *
         * You should usually call [Builder.source] with a well-typed [QuoteSource] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun source(source: JsonField<QuoteSource>) = apply { this.source = source }

        /** Alias for calling [source] with `QuoteSource.ofAccount(account)`. */
        fun source(account: QuoteSource.Account) = source(QuoteSource.ofAccount(account))

        /**
         * Alias for calling [source] with the following:
         * ```kotlin
         * QuoteSource.Account.builder()
         *     .accountId(accountId)
         *     .build()
         * ```
         */
        fun accountSource(accountId: String) =
            source(QuoteSource.Account.builder().accountId(accountId).build())

        /** Alias for calling [source] with `QuoteSource.ofRealtimeFunding(realtimeFunding)`. */
        fun source(realtimeFunding: QuoteSource.RealtimeFunding) =
            source(QuoteSource.ofRealtimeFunding(realtimeFunding))

        /** Current status of the quote */
        fun status(status: Status) = status(JsonField.of(status))

        /**
         * Sets [Builder.status] to an arbitrary JSON value.
         *
         * You should usually call [Builder.status] with a well-typed [Status] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun status(status: JsonField<Status>) = apply { this.status = status }

        /**
         * The total amount that will be received in the smallest unit of the receiving currency
         * (eg. cents).
         */
        fun totalReceivingAmount(totalReceivingAmount: Long) =
            totalReceivingAmount(JsonField.of(totalReceivingAmount))

        /**
         * Sets [Builder.totalReceivingAmount] to an arbitrary JSON value.
         *
         * You should usually call [Builder.totalReceivingAmount] with a well-typed [Long] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun totalReceivingAmount(totalReceivingAmount: JsonField<Long>) = apply {
            this.totalReceivingAmount = totalReceivingAmount
        }

        /**
         * The total amount that will be sent in the smallest unit of the sending currency (eg.
         * cents).
         */
        fun totalSendingAmount(totalSendingAmount: Long) =
            totalSendingAmount(JsonField.of(totalSendingAmount))

        /**
         * Sets [Builder.totalSendingAmount] to an arbitrary JSON value.
         *
         * You should usually call [Builder.totalSendingAmount] with a well-typed [Long] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun totalSendingAmount(totalSendingAmount: JsonField<Long>) = apply {
            this.totalSendingAmount = totalSendingAmount
        }

        /** The ID of the transaction created from this quote. */
        fun transactionId(transactionId: String) = transactionId(JsonField.of(transactionId))

        /**
         * Sets [Builder.transactionId] to an arbitrary JSON value.
         *
         * You should usually call [Builder.transactionId] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun transactionId(transactionId: JsonField<String>) = apply {
            this.transactionId = transactionId
        }

        /** ID of the quote that is being retried */
        fun originalQuoteId(originalQuoteId: String) =
            originalQuoteId(JsonField.of(originalQuoteId))

        /**
         * Sets [Builder.originalQuoteId] to an arbitrary JSON value.
         *
         * You should usually call [Builder.originalQuoteId] with a well-typed [String] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun originalQuoteId(originalQuoteId: JsonField<String>) = apply {
            this.originalQuoteId = originalQuoteId
        }

        /**
         * Payment instructions for executing the payment. This is not required when using an
         * internal account source.
         */
        fun paymentInstructions(paymentInstructions: List<PaymentInstructions>) =
            paymentInstructions(JsonField.of(paymentInstructions))

        /**
         * Sets [Builder.paymentInstructions] to an arbitrary JSON value.
         *
         * You should usually call [Builder.paymentInstructions] with a well-typed
         * `List<PaymentInstructions>` value instead. This method is primarily for setting the field
         * to an undocumented or not yet supported value.
         */
        fun paymentInstructions(paymentInstructions: JsonField<List<PaymentInstructions>>) = apply {
            this.paymentInstructions = paymentInstructions.map { it.toMutableList() }
        }

        /**
         * Adds a single [PaymentInstructions] to [paymentInstructions].
         *
         * @throws IllegalStateException if the field was previously set to a non-list.
         */
        fun addPaymentInstruction(paymentInstruction: PaymentInstructions) = apply {
            paymentInstructions =
                (paymentInstructions ?: JsonField.of(mutableListOf())).also {
                    checkKnown("paymentInstructions", it).add(paymentInstruction)
                }
        }

        /** Details about the rate and fees for the transaction. */
        fun rateDetails(rateDetails: OutgoingRateDetails) = rateDetails(JsonField.of(rateDetails))

        /**
         * Sets [Builder.rateDetails] to an arbitrary JSON value.
         *
         * You should usually call [Builder.rateDetails] with a well-typed [OutgoingRateDetails]
         * value instead. This method is primarily for setting the field to an undocumented or not
         * yet supported value.
         */
        fun rateDetails(rateDetails: JsonField<OutgoingRateDetails>) = apply {
            this.rateDetails = rateDetails
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
         * Returns an immutable instance of [Quote].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .createdAt()
         * .destination()
         * .exchangeRate()
         * .expiresAt()
         * .feesIncluded()
         * .quoteId()
         * .receivingCurrency()
         * .sendingCurrency()
         * .source()
         * .status()
         * .totalReceivingAmount()
         * .totalSendingAmount()
         * .transactionId()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): Quote =
            Quote(
                checkRequired("createdAt", createdAt),
                checkRequired("destination", destination),
                checkRequired("exchangeRate", exchangeRate),
                checkRequired("expiresAt", expiresAt),
                checkRequired("feesIncluded", feesIncluded),
                checkRequired("quoteId", quoteId),
                checkRequired("receivingCurrency", receivingCurrency),
                checkRequired("sendingCurrency", sendingCurrency),
                checkRequired("source", source),
                checkRequired("status", status),
                checkRequired("totalReceivingAmount", totalReceivingAmount),
                checkRequired("totalSendingAmount", totalSendingAmount),
                checkRequired("transactionId", transactionId),
                originalQuoteId,
                (paymentInstructions ?: JsonMissing.of()).map { it.toImmutable() },
                rateDetails,
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): Quote = apply {
        if (validated) {
            return@apply
        }

        createdAt()
        destination().validate()
        exchangeRate()
        expiresAt()
        feesIncluded()
        quoteId()
        receivingCurrency().validate()
        sendingCurrency().validate()
        source().validate()
        status().validate()
        totalReceivingAmount()
        totalSendingAmount()
        transactionId()
        originalQuoteId()
        paymentInstructions()?.forEach { it.validate() }
        rateDetails()?.validate()
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
        (if (createdAt.asKnown() == null) 0 else 1) +
            (destination.asKnown()?.validity() ?: 0) +
            (if (exchangeRate.asKnown() == null) 0 else 1) +
            (if (expiresAt.asKnown() == null) 0 else 1) +
            (if (feesIncluded.asKnown() == null) 0 else 1) +
            (if (quoteId.asKnown() == null) 0 else 1) +
            (receivingCurrency.asKnown()?.validity() ?: 0) +
            (sendingCurrency.asKnown()?.validity() ?: 0) +
            (source.asKnown()?.validity() ?: 0) +
            (status.asKnown()?.validity() ?: 0) +
            (if (totalReceivingAmount.asKnown() == null) 0 else 1) +
            (if (totalSendingAmount.asKnown() == null) 0 else 1) +
            (if (transactionId.asKnown() == null) 0 else 1) +
            (if (originalQuoteId.asKnown() == null) 0 else 1) +
            (paymentInstructions.asKnown()?.sumOf { it.validity().toInt() } ?: 0) +
            (rateDetails.asKnown()?.validity() ?: 0)

    /** Destination account details */
    @JsonDeserialize(using = Destination.Deserializer::class)
    @JsonSerialize(using = Destination.Serializer::class)
    class Destination
    private constructor(
        private val account: Account? = null,
        private val umaAddress: UmaAddress? = null,
        private val _json: JsonValue? = null,
    ) {

        /** Destination account details */
        fun account(): Account? = account

        /** UMA address destination details */
        fun umaAddress(): UmaAddress? = umaAddress

        fun isAccount(): Boolean = account != null

        fun isUmaAddress(): Boolean = umaAddress != null

        /** Destination account details */
        fun asAccount(): Account = account.getOrThrow("account")

        /** UMA address destination details */
        fun asUmaAddress(): UmaAddress = umaAddress.getOrThrow("umaAddress")

        fun _json(): JsonValue? = _json

        fun <T> accept(visitor: Visitor<T>): T =
            when {
                account != null -> visitor.visitAccount(account)
                umaAddress != null -> visitor.visitUmaAddress(umaAddress)
                else -> visitor.unknown(_json)
            }

        private var validated: Boolean = false

        fun validate(): Destination = apply {
            if (validated) {
                return@apply
            }

            accept(
                object : Visitor<Unit> {
                    override fun visitAccount(account: Account) {
                        account.validate()
                    }

                    override fun visitUmaAddress(umaAddress: UmaAddress) {
                        umaAddress.validate()
                    }
                }
            )
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
            accept(
                object : Visitor<Int> {
                    override fun visitAccount(account: Account) = account.validity()

                    override fun visitUmaAddress(umaAddress: UmaAddress) = umaAddress.validity()

                    override fun unknown(json: JsonValue?) = 0
                }
            )

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is Destination &&
                account == other.account &&
                umaAddress == other.umaAddress
        }

        override fun hashCode(): Int = Objects.hash(account, umaAddress)

        override fun toString(): String =
            when {
                account != null -> "Destination{account=$account}"
                umaAddress != null -> "Destination{umaAddress=$umaAddress}"
                _json != null -> "Destination{_unknown=$_json}"
                else -> throw IllegalStateException("Invalid Destination")
            }

        companion object {

            /** Destination account details */
            fun ofAccount(account: Account) = Destination(account = account)

            /** UMA address destination details */
            fun ofUmaAddress(umaAddress: UmaAddress) = Destination(umaAddress = umaAddress)
        }

        /**
         * An interface that defines how to map each variant of [Destination] to a value of type
         * [T].
         */
        interface Visitor<out T> {

            /** Destination account details */
            fun visitAccount(account: Account): T

            /** UMA address destination details */
            fun visitUmaAddress(umaAddress: UmaAddress): T

            /**
             * Maps an unknown variant of [Destination] to a value of type [T].
             *
             * An instance of [Destination] can contain an unknown variant if it was deserialized
             * from data that doesn't match any known variant. For example, if the SDK is on an
             * older version than the API, then the API may respond with new variants that the SDK
             * is unaware of.
             *
             * @throws GridInvalidDataException in the default implementation.
             */
            fun unknown(json: JsonValue?): T {
                throw GridInvalidDataException("Unknown Destination: $json")
            }
        }

        internal class Deserializer : BaseDeserializer<Destination>(Destination::class) {

            override fun ObjectCodec.deserialize(node: JsonNode): Destination {
                val json = JsonValue.fromJsonNode(node)
                val destinationType = json.asObject()?.get("destinationType")?.asString()

                when (destinationType) {
                    "ACCOUNT" -> {
                        return tryDeserialize(node, jacksonTypeRef<Account>())?.let {
                            Destination(account = it, _json = json)
                        } ?: Destination(_json = json)
                    }
                    "UMA_ADDRESS" -> {
                        return tryDeserialize(node, jacksonTypeRef<UmaAddress>())?.let {
                            Destination(umaAddress = it, _json = json)
                        } ?: Destination(_json = json)
                    }
                }

                return Destination(_json = json)
            }
        }

        internal class Serializer : BaseSerializer<Destination>(Destination::class) {

            override fun serialize(
                value: Destination,
                generator: JsonGenerator,
                provider: SerializerProvider,
            ) {
                when {
                    value.account != null -> generator.writeObject(value.account)
                    value.umaAddress != null -> generator.writeObject(value.umaAddress)
                    value._json != null -> generator.writeObject(value._json)
                    else -> throw IllegalStateException("Invalid Destination")
                }
            }
        }

        /** Destination account details */
        class Account
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val accountId: JsonField<String>,
            private val destinationType: JsonValue,
            private val currency: JsonField<String>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("accountId")
                @ExcludeMissing
                accountId: JsonField<String> = JsonMissing.of(),
                @JsonProperty("destinationType")
                @ExcludeMissing
                destinationType: JsonValue = JsonMissing.of(),
                @JsonProperty("currency")
                @ExcludeMissing
                currency: JsonField<String> = JsonMissing.of(),
            ) : this(accountId, destinationType, currency, mutableMapOf())

            /**
             * Destination account identifier
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun accountId(): String = accountId.getRequired("accountId")

            /**
             * Destination type identifier
             *
             * Expected to always return the following:
             * ```kotlin
             * JsonValue.from("ACCOUNT")
             * ```
             *
             * However, this method can be useful for debugging and logging (e.g. if the server
             * responded with an unexpected value).
             */
            @JsonProperty("destinationType")
            @ExcludeMissing
            fun _destinationType(): JsonValue = destinationType

            /**
             * Currency code for the destination account
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun currency(): String? = currency.getNullable("currency")

            /**
             * Returns the raw JSON value of [accountId].
             *
             * Unlike [accountId], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("accountId")
            @ExcludeMissing
            fun _accountId(): JsonField<String> = accountId

            /**
             * Returns the raw JSON value of [currency].
             *
             * Unlike [currency], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("currency") @ExcludeMissing fun _currency(): JsonField<String> = currency

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
                 * Returns a mutable builder for constructing an instance of [Account].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountId()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [Account]. */
            class Builder internal constructor() {

                private var accountId: JsonField<String>? = null
                private var destinationType: JsonValue = JsonValue.from("ACCOUNT")
                private var currency: JsonField<String> = JsonMissing.of()
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(account: Account) = apply {
                    accountId = account.accountId
                    destinationType = account.destinationType
                    currency = account.currency
                    additionalProperties = account.additionalProperties.toMutableMap()
                }

                /** Destination account identifier */
                fun accountId(accountId: String) = accountId(JsonField.of(accountId))

                /**
                 * Sets [Builder.accountId] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.accountId] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun accountId(accountId: JsonField<String>) = apply { this.accountId = accountId }

                /**
                 * Sets the field to an arbitrary JSON value.
                 *
                 * It is usually unnecessary to call this method because the field defaults to the
                 * following:
                 * ```kotlin
                 * JsonValue.from("ACCOUNT")
                 * ```
                 *
                 * This method is primarily for setting the field to an undocumented or not yet
                 * supported value.
                 */
                fun destinationType(destinationType: JsonValue) = apply {
                    this.destinationType = destinationType
                }

                /** Currency code for the destination account */
                fun currency(currency: String) = currency(JsonField.of(currency))

                /**
                 * Sets [Builder.currency] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.currency] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun currency(currency: JsonField<String>) = apply { this.currency = currency }

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
                 * Returns an immutable instance of [Account].
                 *
                 * Further updates to this [Builder] will not mutate the returned instance.
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountId()
                 * ```
                 *
                 * @throws IllegalStateException if any required field is unset.
                 */
                fun build(): Account =
                    Account(
                        checkRequired("accountId", accountId),
                        destinationType,
                        currency,
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): Account = apply {
                if (validated) {
                    return@apply
                }

                accountId()
                _destinationType().let {
                    if (it != JsonValue.from("ACCOUNT")) {
                        throw GridInvalidDataException("'destinationType' is invalid, received $it")
                    }
                }
                currency()
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
                (if (accountId.asKnown() == null) 0 else 1) +
                    destinationType.let { if (it == JsonValue.from("ACCOUNT")) 1 else 0 } +
                    (if (currency.asKnown() == null) 0 else 1)

            override fun equals(other: Any?): Boolean {
                if (this === other) {
                    return true
                }

                return other is Account &&
                    accountId == other.accountId &&
                    destinationType == other.destinationType &&
                    currency == other.currency &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(accountId, destinationType, currency, additionalProperties)
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "Account{accountId=$accountId, destinationType=$destinationType, currency=$currency, additionalProperties=$additionalProperties}"
        }

        /** UMA address destination details */
        class UmaAddress
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val destinationType: JsonValue,
            private val umaAddress: JsonField<String>,
            private val counterpartyInformation: JsonField<CounterpartyInformation>,
            private val currency: JsonField<String>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("destinationType")
                @ExcludeMissing
                destinationType: JsonValue = JsonMissing.of(),
                @JsonProperty("umaAddress")
                @ExcludeMissing
                umaAddress: JsonField<String> = JsonMissing.of(),
                @JsonProperty("counterpartyInformation")
                @ExcludeMissing
                counterpartyInformation: JsonField<CounterpartyInformation> = JsonMissing.of(),
                @JsonProperty("currency")
                @ExcludeMissing
                currency: JsonField<String> = JsonMissing.of(),
            ) : this(destinationType, umaAddress, counterpartyInformation, currency, mutableMapOf())

            /**
             * Destination type identifier
             *
             * Expected to always return the following:
             * ```kotlin
             * JsonValue.from("UMA_ADDRESS")
             * ```
             *
             * However, this method can be useful for debugging and logging (e.g. if the server
             * responded with an unexpected value).
             */
            @JsonProperty("destinationType")
            @ExcludeMissing
            fun _destinationType(): JsonValue = destinationType

            /**
             * UMA address of the recipient
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun umaAddress(): String = umaAddress.getRequired("umaAddress")

            /**
             * Information about the recipient, as required by the platform in their configuration.
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun counterpartyInformation(): CounterpartyInformation? =
                counterpartyInformation.getNullable("counterpartyInformation")

            /**
             * Currency code for the destination
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun currency(): String? = currency.getNullable("currency")

            /**
             * Returns the raw JSON value of [umaAddress].
             *
             * Unlike [umaAddress], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("umaAddress")
            @ExcludeMissing
            fun _umaAddress(): JsonField<String> = umaAddress

            /**
             * Returns the raw JSON value of [counterpartyInformation].
             *
             * Unlike [counterpartyInformation], this method doesn't throw if the JSON field has an
             * unexpected type.
             */
            @JsonProperty("counterpartyInformation")
            @ExcludeMissing
            fun _counterpartyInformation(): JsonField<CounterpartyInformation> =
                counterpartyInformation

            /**
             * Returns the raw JSON value of [currency].
             *
             * Unlike [currency], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("currency") @ExcludeMissing fun _currency(): JsonField<String> = currency

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
                 * Returns a mutable builder for constructing an instance of [UmaAddress].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .umaAddress()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [UmaAddress]. */
            class Builder internal constructor() {

                private var destinationType: JsonValue = JsonValue.from("UMA_ADDRESS")
                private var umaAddress: JsonField<String>? = null
                private var counterpartyInformation: JsonField<CounterpartyInformation> =
                    JsonMissing.of()
                private var currency: JsonField<String> = JsonMissing.of()
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(umaAddress: UmaAddress) = apply {
                    destinationType = umaAddress.destinationType
                    this.umaAddress = umaAddress.umaAddress
                    counterpartyInformation = umaAddress.counterpartyInformation
                    currency = umaAddress.currency
                    additionalProperties = umaAddress.additionalProperties.toMutableMap()
                }

                /**
                 * Sets the field to an arbitrary JSON value.
                 *
                 * It is usually unnecessary to call this method because the field defaults to the
                 * following:
                 * ```kotlin
                 * JsonValue.from("UMA_ADDRESS")
                 * ```
                 *
                 * This method is primarily for setting the field to an undocumented or not yet
                 * supported value.
                 */
                fun destinationType(destinationType: JsonValue) = apply {
                    this.destinationType = destinationType
                }

                /** UMA address of the recipient */
                fun umaAddress(umaAddress: String) = umaAddress(JsonField.of(umaAddress))

                /**
                 * Sets [Builder.umaAddress] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.umaAddress] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun umaAddress(umaAddress: JsonField<String>) = apply {
                    this.umaAddress = umaAddress
                }

                /**
                 * Information about the recipient, as required by the platform in their
                 * configuration.
                 */
                fun counterpartyInformation(counterpartyInformation: CounterpartyInformation) =
                    counterpartyInformation(JsonField.of(counterpartyInformation))

                /**
                 * Sets [Builder.counterpartyInformation] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.counterpartyInformation] with a well-typed
                 * [CounterpartyInformation] value instead. This method is primarily for setting the
                 * field to an undocumented or not yet supported value.
                 */
                fun counterpartyInformation(
                    counterpartyInformation: JsonField<CounterpartyInformation>
                ) = apply { this.counterpartyInformation = counterpartyInformation }

                /** Currency code for the destination */
                fun currency(currency: String) = currency(JsonField.of(currency))

                /**
                 * Sets [Builder.currency] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.currency] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun currency(currency: JsonField<String>) = apply { this.currency = currency }

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
                 * Returns an immutable instance of [UmaAddress].
                 *
                 * Further updates to this [Builder] will not mutate the returned instance.
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .umaAddress()
                 * ```
                 *
                 * @throws IllegalStateException if any required field is unset.
                 */
                fun build(): UmaAddress =
                    UmaAddress(
                        destinationType,
                        checkRequired("umaAddress", umaAddress),
                        counterpartyInformation,
                        currency,
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): UmaAddress = apply {
                if (validated) {
                    return@apply
                }

                _destinationType().let {
                    if (it != JsonValue.from("UMA_ADDRESS")) {
                        throw GridInvalidDataException("'destinationType' is invalid, received $it")
                    }
                }
                umaAddress()
                counterpartyInformation()?.validate()
                currency()
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
                destinationType.let { if (it == JsonValue.from("UMA_ADDRESS")) 1 else 0 } +
                    (if (umaAddress.asKnown() == null) 0 else 1) +
                    (counterpartyInformation.asKnown()?.validity() ?: 0) +
                    (if (currency.asKnown() == null) 0 else 1)

            /**
             * Information about the recipient, as required by the platform in their configuration.
             */
            class CounterpartyInformation
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

                    /**
                     * Returns a mutable builder for constructing an instance of
                     * [CounterpartyInformation].
                     */
                    fun builder() = Builder()
                }

                /** A builder for [CounterpartyInformation]. */
                class Builder internal constructor() {

                    private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                    internal fun from(counterpartyInformation: CounterpartyInformation) = apply {
                        additionalProperties =
                            counterpartyInformation.additionalProperties.toMutableMap()
                    }

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
                     * Returns an immutable instance of [CounterpartyInformation].
                     *
                     * Further updates to this [Builder] will not mutate the returned instance.
                     */
                    fun build(): CounterpartyInformation =
                        CounterpartyInformation(additionalProperties.toImmutable())
                }

                private var validated: Boolean = false

                fun validate(): CounterpartyInformation = apply {
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
                    additionalProperties.count { (_, value) ->
                        !value.isNull() && !value.isMissing()
                    }

                override fun equals(other: Any?): Boolean {
                    if (this === other) {
                        return true
                    }

                    return other is CounterpartyInformation &&
                        additionalProperties == other.additionalProperties
                }

                private val hashCode: Int by lazy { Objects.hash(additionalProperties) }

                override fun hashCode(): Int = hashCode

                override fun toString() =
                    "CounterpartyInformation{additionalProperties=$additionalProperties}"
            }

            override fun equals(other: Any?): Boolean {
                if (this === other) {
                    return true
                }

                return other is UmaAddress &&
                    destinationType == other.destinationType &&
                    umaAddress == other.umaAddress &&
                    counterpartyInformation == other.counterpartyInformation &&
                    currency == other.currency &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(
                    destinationType,
                    umaAddress,
                    counterpartyInformation,
                    currency,
                    additionalProperties,
                )
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "UmaAddress{destinationType=$destinationType, umaAddress=$umaAddress, counterpartyInformation=$counterpartyInformation, currency=$currency, additionalProperties=$additionalProperties}"
        }
    }

    /** Current status of the quote */
    class Status @JsonCreator private constructor(private val value: JsonField<String>) : Enum {

        /**
         * Returns this class instance's raw value.
         *
         * This is usually only useful if this instance was deserialized from data that doesn't
         * match any known member, and you want to know that value. For example, if the SDK is on an
         * older version than the API, then the API may respond with new members that the SDK is
         * unaware of.
         */
        @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

        companion object {

            val PENDING = of("PENDING")

            val PROCESSING = of("PROCESSING")

            val COMPLETED = of("COMPLETED")

            val FAILED = of("FAILED")

            val EXPIRED = of("EXPIRED")

            fun of(value: String) = Status(JsonField.of(value))
        }

        /** An enum containing [Status]'s known values. */
        enum class Known {
            PENDING,
            PROCESSING,
            COMPLETED,
            FAILED,
            EXPIRED,
        }

        /**
         * An enum containing [Status]'s known values, as well as an [_UNKNOWN] member.
         *
         * An instance of [Status] can contain an unknown value in a couple of cases:
         * - It was deserialized from data that doesn't match any known member. For example, if the
         *   SDK is on an older version than the API, then the API may respond with new members that
         *   the SDK is unaware of.
         * - It was constructed with an arbitrary value using the [of] method.
         */
        enum class Value {
            PENDING,
            PROCESSING,
            COMPLETED,
            FAILED,
            EXPIRED,
            /** An enum member indicating that [Status] was instantiated with an unknown value. */
            _UNKNOWN,
        }

        /**
         * Returns an enum member corresponding to this class instance's value, or [Value._UNKNOWN]
         * if the class was instantiated with an unknown value.
         *
         * Use the [known] method instead if you're certain the value is always known or if you want
         * to throw for the unknown case.
         */
        fun value(): Value =
            when (this) {
                PENDING -> Value.PENDING
                PROCESSING -> Value.PROCESSING
                COMPLETED -> Value.COMPLETED
                FAILED -> Value.FAILED
                EXPIRED -> Value.EXPIRED
                else -> Value._UNKNOWN
            }

        /**
         * Returns an enum member corresponding to this class instance's value.
         *
         * Use the [value] method instead if you're uncertain the value is always known and don't
         * want to throw for the unknown case.
         *
         * @throws GridInvalidDataException if this class instance's value is a not a known member.
         */
        fun known(): Known =
            when (this) {
                PENDING -> Known.PENDING
                PROCESSING -> Known.PROCESSING
                COMPLETED -> Known.COMPLETED
                FAILED -> Known.FAILED
                EXPIRED -> Known.EXPIRED
                else -> throw GridInvalidDataException("Unknown Status: $value")
            }

        /**
         * Returns this class instance's primitive wire representation.
         *
         * This differs from the [toString] method because that method is primarily for debugging
         * and generally doesn't throw.
         *
         * @throws GridInvalidDataException if this class instance's value does not have the
         *   expected primitive type.
         */
        fun asString(): String =
            _value().asString() ?: throw GridInvalidDataException("Value is not a String")

        private var validated: Boolean = false

        fun validate(): Status = apply {
            if (validated) {
                return@apply
            }

            known()
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
        internal fun validity(): Int = if (value() == Value._UNKNOWN) 0 else 1

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is Status && value == other.value
        }

        override fun hashCode() = value.hashCode()

        override fun toString() = value.toString()
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is Quote &&
            createdAt == other.createdAt &&
            destination == other.destination &&
            exchangeRate == other.exchangeRate &&
            expiresAt == other.expiresAt &&
            feesIncluded == other.feesIncluded &&
            quoteId == other.quoteId &&
            receivingCurrency == other.receivingCurrency &&
            sendingCurrency == other.sendingCurrency &&
            source == other.source &&
            status == other.status &&
            totalReceivingAmount == other.totalReceivingAmount &&
            totalSendingAmount == other.totalSendingAmount &&
            transactionId == other.transactionId &&
            originalQuoteId == other.originalQuoteId &&
            paymentInstructions == other.paymentInstructions &&
            rateDetails == other.rateDetails &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(
            createdAt,
            destination,
            exchangeRate,
            expiresAt,
            feesIncluded,
            quoteId,
            receivingCurrency,
            sendingCurrency,
            source,
            status,
            totalReceivingAmount,
            totalSendingAmount,
            transactionId,
            originalQuoteId,
            paymentInstructions,
            rateDetails,
            additionalProperties,
        )
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "Quote{createdAt=$createdAt, destination=$destination, exchangeRate=$exchangeRate, expiresAt=$expiresAt, feesIncluded=$feesIncluded, quoteId=$quoteId, receivingCurrency=$receivingCurrency, sendingCurrency=$sendingCurrency, source=$source, status=$status, totalReceivingAmount=$totalReceivingAmount, totalSendingAmount=$totalSendingAmount, transactionId=$transactionId, originalQuoteId=$originalQuoteId, paymentInstructions=$paymentInstructions, rateDetails=$rateDetails, additionalProperties=$additionalProperties}"
}
