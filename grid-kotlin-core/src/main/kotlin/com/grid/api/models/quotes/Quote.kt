// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.quotes

import com.fasterxml.jackson.annotation.JsonAnyGetter
import com.fasterxml.jackson.annotation.JsonAnySetter
import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.grid.api.core.Enum
import com.grid.api.core.ExcludeMissing
import com.grid.api.core.JsonField
import com.grid.api.core.JsonMissing
import com.grid.api.core.JsonValue
import com.grid.api.core.checkKnown
import com.grid.api.core.checkRequired
import com.grid.api.core.toImmutable
import com.grid.api.errors.GridInvalidDataException
import com.grid.api.models.customers.externalaccounts.ExternalAccountCreate
import java.time.OffsetDateTime
import java.util.Collections
import java.util.Objects

class Quote
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val createdAt: JsonField<OffsetDateTime>,
    private val destination: JsonField<QuoteDestinationOneOf>,
    private val exchangeRate: JsonField<Double>,
    private val expiresAt: JsonField<OffsetDateTime>,
    private val feesIncluded: JsonField<Long>,
    private val quoteId: JsonField<String>,
    private val receivingCurrency: JsonField<Currency>,
    private val sendingCurrency: JsonField<Currency>,
    private val source: JsonField<QuoteSourceOneOf>,
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
        destination: JsonField<QuoteDestinationOneOf> = JsonMissing.of(),
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
        @JsonProperty("source")
        @ExcludeMissing
        source: JsonField<QuoteSourceOneOf> = JsonMissing.of(),
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
    fun destination(): QuoteDestinationOneOf = destination.getRequired("destination")

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
    fun source(): QuoteSourceOneOf = source.getRequired("source")

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
    fun _destination(): JsonField<QuoteDestinationOneOf> = destination

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
    @JsonProperty("source") @ExcludeMissing fun _source(): JsonField<QuoteSourceOneOf> = source

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
        private var destination: JsonField<QuoteDestinationOneOf>? = null
        private var exchangeRate: JsonField<Double>? = null
        private var expiresAt: JsonField<OffsetDateTime>? = null
        private var feesIncluded: JsonField<Long>? = null
        private var quoteId: JsonField<String>? = null
        private var receivingCurrency: JsonField<Currency>? = null
        private var sendingCurrency: JsonField<Currency>? = null
        private var source: JsonField<QuoteSourceOneOf>? = null
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
        fun destination(destination: QuoteDestinationOneOf) = destination(JsonField.of(destination))

        /**
         * Sets [Builder.destination] to an arbitrary JSON value.
         *
         * You should usually call [Builder.destination] with a well-typed [QuoteDestinationOneOf]
         * value instead. This method is primarily for setting the field to an undocumented or not
         * yet supported value.
         */
        fun destination(destination: JsonField<QuoteDestinationOneOf>) = apply {
            this.destination = destination
        }

        /** Alias for calling [destination] with `QuoteDestinationOneOf.ofAccount(account)`. */
        fun destination(account: QuoteDestinationOneOf.Account) =
            destination(QuoteDestinationOneOf.ofAccount(account))

        /**
         * Alias for calling [destination] with the following:
         * ```kotlin
         * QuoteDestinationOneOf.Account.builder()
         *     .destinationType(QuoteDestinationOneOf.Account.DestinationType.ACCOUNT)
         *     .accountId(accountId)
         *     .build()
         * ```
         */
        fun accountDestination(accountId: String) =
            destination(
                QuoteDestinationOneOf.Account.builder()
                    .destinationType(QuoteDestinationOneOf.Account.DestinationType.ACCOUNT)
                    .accountId(accountId)
                    .build()
            )

        /**
         * Alias for calling [destination] with `QuoteDestinationOneOf.ofUmaAddress(umaAddress)`.
         */
        fun destination(umaAddress: QuoteDestinationOneOf.UmaAddress) =
            destination(QuoteDestinationOneOf.ofUmaAddress(umaAddress))

        /**
         * Alias for calling [destination] with the following:
         * ```kotlin
         * QuoteDestinationOneOf.UmaAddress.builder()
         *     .destinationType(QuoteDestinationOneOf.UmaAddress.DestinationType.UMA_ADDRESS)
         *     .umaAddress(umaAddress)
         *     .build()
         * ```
         */
        fun umaAddressDestination(umaAddress: String) =
            destination(
                QuoteDestinationOneOf.UmaAddress.builder()
                    .destinationType(QuoteDestinationOneOf.UmaAddress.DestinationType.UMA_ADDRESS)
                    .umaAddress(umaAddress)
                    .build()
            )

        /**
         * Alias for calling [destination] with
         * `QuoteDestinationOneOf.ofExternalAccountDetails(externalAccountDetails)`.
         */
        fun destination(externalAccountDetails: QuoteDestinationOneOf.ExternalAccountDetails) =
            destination(QuoteDestinationOneOf.ofExternalAccountDetails(externalAccountDetails))

        /**
         * Alias for calling [destination] with the following:
         * ```kotlin
         * QuoteDestinationOneOf.ExternalAccountDetails.builder()
         *     .destinationType(QuoteDestinationOneOf.ExternalAccountDetails.DestinationType.EXTERNAL_ACCOUNT_DETAILS)
         *     .externalAccountDetails(externalAccountDetails)
         *     .build()
         * ```
         */
        fun externalAccountDetailsDestination(externalAccountDetails: ExternalAccountCreate) =
            destination(
                QuoteDestinationOneOf.ExternalAccountDetails.builder()
                    .destinationType(
                        QuoteDestinationOneOf.ExternalAccountDetails.DestinationType
                            .EXTERNAL_ACCOUNT_DETAILS
                    )
                    .externalAccountDetails(externalAccountDetails)
                    .build()
            )

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
        fun source(source: QuoteSourceOneOf) = source(JsonField.of(source))

        /**
         * Sets [Builder.source] to an arbitrary JSON value.
         *
         * You should usually call [Builder.source] with a well-typed [QuoteSourceOneOf] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun source(source: JsonField<QuoteSourceOneOf>) = apply { this.source = source }

        /** Alias for calling [source] with `QuoteSourceOneOf.ofAccount(account)`. */
        fun source(account: QuoteSourceOneOf.Account) = source(QuoteSourceOneOf.ofAccount(account))

        /**
         * Alias for calling [source] with the following:
         * ```kotlin
         * QuoteSourceOneOf.Account.builder()
         *     .sourceType(QuoteSourceOneOf.Account.SourceType.ACCOUNT)
         *     .accountId(accountId)
         *     .build()
         * ```
         */
        fun accountSource(accountId: String) =
            source(
                QuoteSourceOneOf.Account.builder()
                    .sourceType(QuoteSourceOneOf.Account.SourceType.ACCOUNT)
                    .accountId(accountId)
                    .build()
            )

        /**
         * Alias for calling [source] with `QuoteSourceOneOf.ofRealtimeFunding(realtimeFunding)`.
         */
        fun source(realtimeFunding: QuoteSourceOneOf.RealtimeFunding) =
            source(QuoteSourceOneOf.ofRealtimeFunding(realtimeFunding))

        /**
         * Alias for calling [source] with the following:
         * ```kotlin
         * QuoteSourceOneOf.RealtimeFunding.builder()
         *     .sourceType(QuoteSourceOneOf.RealtimeFunding.SourceType.REALTIME_FUNDING)
         *     .currency(currency)
         *     .build()
         * ```
         */
        fun realtimeFundingSource(currency: String) =
            source(
                QuoteSourceOneOf.RealtimeFunding.builder()
                    .sourceType(QuoteSourceOneOf.RealtimeFunding.SourceType.REALTIME_FUNDING)
                    .currency(currency)
                    .build()
            )

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
