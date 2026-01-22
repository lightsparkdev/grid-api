// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.sandbox

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
import com.grid.api.core.allMaxBy
import com.grid.api.core.checkKnown
import com.grid.api.core.checkRequired
import com.grid.api.core.getOrThrow
import com.grid.api.core.toImmutable
import com.grid.api.errors.GridInvalidDataException
import com.grid.api.models.invitations.CurrencyAmount
import com.grid.api.models.quotes.OutgoingRateDetails
import com.grid.api.models.quotes.PaymentInstructions
import com.grid.api.models.transactions.TransactionStatus
import com.grid.api.models.transactions.TransactionType
import com.grid.api.models.transferin.Transaction
import java.time.OffsetDateTime
import java.util.Collections
import java.util.Objects

class SandboxSendFundsResponse
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val id: JsonField<String>,
    private val customerId: JsonField<String>,
    private val destination: JsonField<Transaction.Destination>,
    private val platformCustomerId: JsonField<String>,
    private val status: JsonField<TransactionStatus>,
    private val type: JsonField<TransactionType>,
    private val counterpartyInformation: JsonField<Transaction.CounterpartyInformation>,
    private val createdAt: JsonField<OffsetDateTime>,
    private val description: JsonField<String>,
    private val settledAt: JsonField<OffsetDateTime>,
    private val updatedAt: JsonField<OffsetDateTime>,
    private val paymentInstructions: JsonField<List<PaymentInstructions>>,
    private val sentAmount: JsonField<CurrencyAmount>,
    private val source: JsonField<Source>,
    private val exchangeRate: JsonField<Double>,
    private val failureReason: JsonField<FailureReason>,
    private val fees: JsonField<Long>,
    private val originalTransactionId: JsonField<String>,
    private val quoteId: JsonField<String>,
    private val rateDetails: JsonField<OutgoingRateDetails>,
    private val receivedAmount: JsonField<CurrencyAmount>,
    private val refund: JsonField<Refund>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("id") @ExcludeMissing id: JsonField<String> = JsonMissing.of(),
        @JsonProperty("customerId")
        @ExcludeMissing
        customerId: JsonField<String> = JsonMissing.of(),
        @JsonProperty("destination")
        @ExcludeMissing
        destination: JsonField<Transaction.Destination> = JsonMissing.of(),
        @JsonProperty("platformCustomerId")
        @ExcludeMissing
        platformCustomerId: JsonField<String> = JsonMissing.of(),
        @JsonProperty("status")
        @ExcludeMissing
        status: JsonField<TransactionStatus> = JsonMissing.of(),
        @JsonProperty("type") @ExcludeMissing type: JsonField<TransactionType> = JsonMissing.of(),
        @JsonProperty("counterpartyInformation")
        @ExcludeMissing
        counterpartyInformation: JsonField<Transaction.CounterpartyInformation> = JsonMissing.of(),
        @JsonProperty("createdAt")
        @ExcludeMissing
        createdAt: JsonField<OffsetDateTime> = JsonMissing.of(),
        @JsonProperty("description")
        @ExcludeMissing
        description: JsonField<String> = JsonMissing.of(),
        @JsonProperty("settledAt")
        @ExcludeMissing
        settledAt: JsonField<OffsetDateTime> = JsonMissing.of(),
        @JsonProperty("updatedAt")
        @ExcludeMissing
        updatedAt: JsonField<OffsetDateTime> = JsonMissing.of(),
        @JsonProperty("paymentInstructions")
        @ExcludeMissing
        paymentInstructions: JsonField<List<PaymentInstructions>> = JsonMissing.of(),
        @JsonProperty("sentAmount")
        @ExcludeMissing
        sentAmount: JsonField<CurrencyAmount> = JsonMissing.of(),
        @JsonProperty("source") @ExcludeMissing source: JsonField<Source> = JsonMissing.of(),
        @JsonProperty("exchangeRate")
        @ExcludeMissing
        exchangeRate: JsonField<Double> = JsonMissing.of(),
        @JsonProperty("failureReason")
        @ExcludeMissing
        failureReason: JsonField<FailureReason> = JsonMissing.of(),
        @JsonProperty("fees") @ExcludeMissing fees: JsonField<Long> = JsonMissing.of(),
        @JsonProperty("originalTransactionId")
        @ExcludeMissing
        originalTransactionId: JsonField<String> = JsonMissing.of(),
        @JsonProperty("quoteId") @ExcludeMissing quoteId: JsonField<String> = JsonMissing.of(),
        @JsonProperty("rateDetails")
        @ExcludeMissing
        rateDetails: JsonField<OutgoingRateDetails> = JsonMissing.of(),
        @JsonProperty("receivedAmount")
        @ExcludeMissing
        receivedAmount: JsonField<CurrencyAmount> = JsonMissing.of(),
        @JsonProperty("refund") @ExcludeMissing refund: JsonField<Refund> = JsonMissing.of(),
    ) : this(
        id,
        customerId,
        destination,
        platformCustomerId,
        status,
        type,
        counterpartyInformation,
        createdAt,
        description,
        settledAt,
        updatedAt,
        paymentInstructions,
        sentAmount,
        source,
        exchangeRate,
        failureReason,
        fees,
        originalTransactionId,
        quoteId,
        rateDetails,
        receivedAmount,
        refund,
        mutableMapOf(),
    )

    fun toTransaction(): Transaction =
        Transaction.builder()
            .id(id)
            .customerId(customerId)
            .destination(destination)
            .platformCustomerId(platformCustomerId)
            .status(status)
            .type(type)
            .counterpartyInformation(counterpartyInformation)
            .createdAt(createdAt)
            .description(description)
            .settledAt(settledAt)
            .updatedAt(updatedAt)
            .build()

    /**
     * Unique identifier for the transaction
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun id(): String = id.getRequired("id")

    /**
     * System ID of the customer (sender for outgoing, recipient for incoming)
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun customerId(): String = customerId.getRequired("customerId")

    /**
     * Destination account details
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun destination(): Transaction.Destination = destination.getRequired("destination")

    /**
     * Platform-specific ID of the customer (sender for outgoing, recipient for incoming)
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun platformCustomerId(): String = platformCustomerId.getRequired("platformCustomerId")

    /**
     * Status of a payment transaction
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun status(): TransactionStatus = status.getRequired("status")

    /**
     * Type of transaction (incoming payment or outgoing payment)
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun type(): TransactionType = type.getRequired("type")

    /**
     * Additional information about the counterparty, if available and relevant to the transaction
     * and platform. Only applicable for transactions to/from UMA addresses.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun counterpartyInformation(): Transaction.CounterpartyInformation? =
        counterpartyInformation.getNullable("counterpartyInformation")

    /**
     * When the transaction was created
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun createdAt(): OffsetDateTime? = createdAt.getNullable("createdAt")

    /**
     * Optional memo or description for the payment
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun description(): String? = description.getNullable("description")

    /**
     * When the payment was or will be settled
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun settledAt(): OffsetDateTime? = settledAt.getNullable("settledAt")

    /**
     * When the transaction was last updated
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun updatedAt(): OffsetDateTime? = updatedAt.getNullable("updatedAt")

    /**
     * Payment instructions for executing the payment.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun paymentInstructions(): List<PaymentInstructions> =
        paymentInstructions.getRequired("paymentInstructions")

    /**
     * Amount sent in the sender's currency
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun sentAmount(): CurrencyAmount = sentAmount.getRequired("sentAmount")

    /**
     * Source account details
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun source(): Source = source.getRequired("source")

    /**
     * Number of sending currency units per receiving currency unit.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun exchangeRate(): Double? = exchangeRate.getNullable("exchangeRate")

    /**
     * If the transaction failed, this field provides the reason for failure.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun failureReason(): FailureReason? = failureReason.getNullable("failureReason")

    /**
     * The fees associated with the quote in the smallest unit of the sending currency (eg. cents).
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun fees(): Long? = fees.getNullable("fees")

    /**
     * ID of the original transaction that this transaction is retrying, if applicable
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun originalTransactionId(): String? =
        originalTransactionId.getNullable("originalTransactionId")

    /**
     * The ID of the quote that was used to trigger this payment
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun quoteId(): String? = quoteId.getNullable("quoteId")

    /**
     * Details about the rate and fees for the transaction.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun rateDetails(): OutgoingRateDetails? = rateDetails.getNullable("rateDetails")

    /**
     * Amount to be received by recipient in the recipient's currency
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun receivedAmount(): CurrencyAmount? = receivedAmount.getNullable("receivedAmount")

    /**
     * The refund if transaction was refunded.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun refund(): Refund? = refund.getNullable("refund")

    /**
     * Returns the raw JSON value of [id].
     *
     * Unlike [id], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("id") @ExcludeMissing fun _id(): JsonField<String> = id

    /**
     * Returns the raw JSON value of [customerId].
     *
     * Unlike [customerId], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("customerId") @ExcludeMissing fun _customerId(): JsonField<String> = customerId

    /**
     * Returns the raw JSON value of [destination].
     *
     * Unlike [destination], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("destination")
    @ExcludeMissing
    fun _destination(): JsonField<Transaction.Destination> = destination

    /**
     * Returns the raw JSON value of [platformCustomerId].
     *
     * Unlike [platformCustomerId], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    @JsonProperty("platformCustomerId")
    @ExcludeMissing
    fun _platformCustomerId(): JsonField<String> = platformCustomerId

    /**
     * Returns the raw JSON value of [status].
     *
     * Unlike [status], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("status") @ExcludeMissing fun _status(): JsonField<TransactionStatus> = status

    /**
     * Returns the raw JSON value of [type].
     *
     * Unlike [type], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("type") @ExcludeMissing fun _type(): JsonField<TransactionType> = type

    /**
     * Returns the raw JSON value of [counterpartyInformation].
     *
     * Unlike [counterpartyInformation], this method doesn't throw if the JSON field has an
     * unexpected type.
     */
    @JsonProperty("counterpartyInformation")
    @ExcludeMissing
    fun _counterpartyInformation(): JsonField<Transaction.CounterpartyInformation> =
        counterpartyInformation

    /**
     * Returns the raw JSON value of [createdAt].
     *
     * Unlike [createdAt], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("createdAt")
    @ExcludeMissing
    fun _createdAt(): JsonField<OffsetDateTime> = createdAt

    /**
     * Returns the raw JSON value of [description].
     *
     * Unlike [description], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("description") @ExcludeMissing fun _description(): JsonField<String> = description

    /**
     * Returns the raw JSON value of [settledAt].
     *
     * Unlike [settledAt], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("settledAt")
    @ExcludeMissing
    fun _settledAt(): JsonField<OffsetDateTime> = settledAt

    /**
     * Returns the raw JSON value of [updatedAt].
     *
     * Unlike [updatedAt], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("updatedAt")
    @ExcludeMissing
    fun _updatedAt(): JsonField<OffsetDateTime> = updatedAt

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
     * Returns the raw JSON value of [sentAmount].
     *
     * Unlike [sentAmount], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("sentAmount")
    @ExcludeMissing
    fun _sentAmount(): JsonField<CurrencyAmount> = sentAmount

    /**
     * Returns the raw JSON value of [source].
     *
     * Unlike [source], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("source") @ExcludeMissing fun _source(): JsonField<Source> = source

    /**
     * Returns the raw JSON value of [exchangeRate].
     *
     * Unlike [exchangeRate], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("exchangeRate")
    @ExcludeMissing
    fun _exchangeRate(): JsonField<Double> = exchangeRate

    /**
     * Returns the raw JSON value of [failureReason].
     *
     * Unlike [failureReason], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("failureReason")
    @ExcludeMissing
    fun _failureReason(): JsonField<FailureReason> = failureReason

    /**
     * Returns the raw JSON value of [fees].
     *
     * Unlike [fees], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("fees") @ExcludeMissing fun _fees(): JsonField<Long> = fees

    /**
     * Returns the raw JSON value of [originalTransactionId].
     *
     * Unlike [originalTransactionId], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    @JsonProperty("originalTransactionId")
    @ExcludeMissing
    fun _originalTransactionId(): JsonField<String> = originalTransactionId

    /**
     * Returns the raw JSON value of [quoteId].
     *
     * Unlike [quoteId], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("quoteId") @ExcludeMissing fun _quoteId(): JsonField<String> = quoteId

    /**
     * Returns the raw JSON value of [rateDetails].
     *
     * Unlike [rateDetails], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("rateDetails")
    @ExcludeMissing
    fun _rateDetails(): JsonField<OutgoingRateDetails> = rateDetails

    /**
     * Returns the raw JSON value of [receivedAmount].
     *
     * Unlike [receivedAmount], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("receivedAmount")
    @ExcludeMissing
    fun _receivedAmount(): JsonField<CurrencyAmount> = receivedAmount

    /**
     * Returns the raw JSON value of [refund].
     *
     * Unlike [refund], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("refund") @ExcludeMissing fun _refund(): JsonField<Refund> = refund

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
         * Returns a mutable builder for constructing an instance of [SandboxSendFundsResponse].
         *
         * The following fields are required:
         * ```kotlin
         * .id()
         * .customerId()
         * .destination()
         * .platformCustomerId()
         * .status()
         * .type()
         * .paymentInstructions()
         * .sentAmount()
         * .source()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [SandboxSendFundsResponse]. */
    class Builder internal constructor() {

        private var id: JsonField<String>? = null
        private var customerId: JsonField<String>? = null
        private var destination: JsonField<Transaction.Destination>? = null
        private var platformCustomerId: JsonField<String>? = null
        private var status: JsonField<TransactionStatus>? = null
        private var type: JsonField<TransactionType>? = null
        private var counterpartyInformation: JsonField<Transaction.CounterpartyInformation> =
            JsonMissing.of()
        private var createdAt: JsonField<OffsetDateTime> = JsonMissing.of()
        private var description: JsonField<String> = JsonMissing.of()
        private var settledAt: JsonField<OffsetDateTime> = JsonMissing.of()
        private var updatedAt: JsonField<OffsetDateTime> = JsonMissing.of()
        private var paymentInstructions: JsonField<MutableList<PaymentInstructions>>? = null
        private var sentAmount: JsonField<CurrencyAmount>? = null
        private var source: JsonField<Source>? = null
        private var exchangeRate: JsonField<Double> = JsonMissing.of()
        private var failureReason: JsonField<FailureReason> = JsonMissing.of()
        private var fees: JsonField<Long> = JsonMissing.of()
        private var originalTransactionId: JsonField<String> = JsonMissing.of()
        private var quoteId: JsonField<String> = JsonMissing.of()
        private var rateDetails: JsonField<OutgoingRateDetails> = JsonMissing.of()
        private var receivedAmount: JsonField<CurrencyAmount> = JsonMissing.of()
        private var refund: JsonField<Refund> = JsonMissing.of()
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(sandboxSendFundsResponse: SandboxSendFundsResponse) = apply {
            id = sandboxSendFundsResponse.id
            customerId = sandboxSendFundsResponse.customerId
            destination = sandboxSendFundsResponse.destination
            platformCustomerId = sandboxSendFundsResponse.platformCustomerId
            status = sandboxSendFundsResponse.status
            type = sandboxSendFundsResponse.type
            counterpartyInformation = sandboxSendFundsResponse.counterpartyInformation
            createdAt = sandboxSendFundsResponse.createdAt
            description = sandboxSendFundsResponse.description
            settledAt = sandboxSendFundsResponse.settledAt
            updatedAt = sandboxSendFundsResponse.updatedAt
            paymentInstructions =
                sandboxSendFundsResponse.paymentInstructions.map { it.toMutableList() }
            sentAmount = sandboxSendFundsResponse.sentAmount
            source = sandboxSendFundsResponse.source
            exchangeRate = sandboxSendFundsResponse.exchangeRate
            failureReason = sandboxSendFundsResponse.failureReason
            fees = sandboxSendFundsResponse.fees
            originalTransactionId = sandboxSendFundsResponse.originalTransactionId
            quoteId = sandboxSendFundsResponse.quoteId
            rateDetails = sandboxSendFundsResponse.rateDetails
            receivedAmount = sandboxSendFundsResponse.receivedAmount
            refund = sandboxSendFundsResponse.refund
            additionalProperties = sandboxSendFundsResponse.additionalProperties.toMutableMap()
        }

        /** Unique identifier for the transaction */
        fun id(id: String) = id(JsonField.of(id))

        /**
         * Sets [Builder.id] to an arbitrary JSON value.
         *
         * You should usually call [Builder.id] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun id(id: JsonField<String>) = apply { this.id = id }

        /** System ID of the customer (sender for outgoing, recipient for incoming) */
        fun customerId(customerId: String) = customerId(JsonField.of(customerId))

        /**
         * Sets [Builder.customerId] to an arbitrary JSON value.
         *
         * You should usually call [Builder.customerId] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun customerId(customerId: JsonField<String>) = apply { this.customerId = customerId }

        /** Destination account details */
        fun destination(destination: Transaction.Destination) =
            destination(JsonField.of(destination))

        /**
         * Sets [Builder.destination] to an arbitrary JSON value.
         *
         * You should usually call [Builder.destination] with a well-typed [Transaction.Destination]
         * value instead. This method is primarily for setting the field to an undocumented or not
         * yet supported value.
         */
        fun destination(destination: JsonField<Transaction.Destination>) = apply {
            this.destination = destination
        }

        /** Alias for calling [destination] with `Transaction.Destination.ofAccount(account)`. */
        fun destination(account: Transaction.Destination.AccountDestination) =
            destination(Transaction.Destination.ofAccount(account))

        /**
         * Alias for calling [destination] with `Transaction.Destination.ofUmaAddress(umaAddress)`.
         */
        fun destination(umaAddress: Transaction.Destination.UmaAddressDestination) =
            destination(Transaction.Destination.ofUmaAddress(umaAddress))

        /** Platform-specific ID of the customer (sender for outgoing, recipient for incoming) */
        fun platformCustomerId(platformCustomerId: String) =
            platformCustomerId(JsonField.of(platformCustomerId))

        /**
         * Sets [Builder.platformCustomerId] to an arbitrary JSON value.
         *
         * You should usually call [Builder.platformCustomerId] with a well-typed [String] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun platformCustomerId(platformCustomerId: JsonField<String>) = apply {
            this.platformCustomerId = platformCustomerId
        }

        /** Status of a payment transaction */
        fun status(status: TransactionStatus) = status(JsonField.of(status))

        /**
         * Sets [Builder.status] to an arbitrary JSON value.
         *
         * You should usually call [Builder.status] with a well-typed [TransactionStatus] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun status(status: JsonField<TransactionStatus>) = apply { this.status = status }

        /** Type of transaction (incoming payment or outgoing payment) */
        fun type(type: TransactionType) = type(JsonField.of(type))

        /**
         * Sets [Builder.type] to an arbitrary JSON value.
         *
         * You should usually call [Builder.type] with a well-typed [TransactionType] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun type(type: JsonField<TransactionType>) = apply { this.type = type }

        /**
         * Additional information about the counterparty, if available and relevant to the
         * transaction and platform. Only applicable for transactions to/from UMA addresses.
         */
        fun counterpartyInformation(counterpartyInformation: Transaction.CounterpartyInformation) =
            counterpartyInformation(JsonField.of(counterpartyInformation))

        /**
         * Sets [Builder.counterpartyInformation] to an arbitrary JSON value.
         *
         * You should usually call [Builder.counterpartyInformation] with a well-typed
         * [Transaction.CounterpartyInformation] value instead. This method is primarily for setting
         * the field to an undocumented or not yet supported value.
         */
        fun counterpartyInformation(
            counterpartyInformation: JsonField<Transaction.CounterpartyInformation>
        ) = apply { this.counterpartyInformation = counterpartyInformation }

        /** When the transaction was created */
        fun createdAt(createdAt: OffsetDateTime) = createdAt(JsonField.of(createdAt))

        /**
         * Sets [Builder.createdAt] to an arbitrary JSON value.
         *
         * You should usually call [Builder.createdAt] with a well-typed [OffsetDateTime] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun createdAt(createdAt: JsonField<OffsetDateTime>) = apply { this.createdAt = createdAt }

        /** Optional memo or description for the payment */
        fun description(description: String) = description(JsonField.of(description))

        /**
         * Sets [Builder.description] to an arbitrary JSON value.
         *
         * You should usually call [Builder.description] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun description(description: JsonField<String>) = apply { this.description = description }

        /** When the payment was or will be settled */
        fun settledAt(settledAt: OffsetDateTime) = settledAt(JsonField.of(settledAt))

        /**
         * Sets [Builder.settledAt] to an arbitrary JSON value.
         *
         * You should usually call [Builder.settledAt] with a well-typed [OffsetDateTime] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun settledAt(settledAt: JsonField<OffsetDateTime>) = apply { this.settledAt = settledAt }

        /** When the transaction was last updated */
        fun updatedAt(updatedAt: OffsetDateTime) = updatedAt(JsonField.of(updatedAt))

        /**
         * Sets [Builder.updatedAt] to an arbitrary JSON value.
         *
         * You should usually call [Builder.updatedAt] with a well-typed [OffsetDateTime] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun updatedAt(updatedAt: JsonField<OffsetDateTime>) = apply { this.updatedAt = updatedAt }

        /** Payment instructions for executing the payment. */
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

        /** Amount sent in the sender's currency */
        fun sentAmount(sentAmount: CurrencyAmount) = sentAmount(JsonField.of(sentAmount))

        /**
         * Sets [Builder.sentAmount] to an arbitrary JSON value.
         *
         * You should usually call [Builder.sentAmount] with a well-typed [CurrencyAmount] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun sentAmount(sentAmount: JsonField<CurrencyAmount>) = apply {
            this.sentAmount = sentAmount
        }

        /** Source account details */
        fun source(source: Source) = source(JsonField.of(source))

        /**
         * Sets [Builder.source] to an arbitrary JSON value.
         *
         * You should usually call [Builder.source] with a well-typed [Source] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun source(source: JsonField<Source>) = apply { this.source = source }

        /** Alias for calling [source] with `Source.ofAccount(account)`. */
        fun source(account: Source.AccountSource) = source(Source.ofAccount(account))

        /** Alias for calling [source] with `Source.ofUmaAddress(umaAddress)`. */
        fun source(umaAddress: Source.UmaAddressSource) = source(Source.ofUmaAddress(umaAddress))

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

        /** If the transaction failed, this field provides the reason for failure. */
        fun failureReason(failureReason: FailureReason) = failureReason(JsonField.of(failureReason))

        /**
         * Sets [Builder.failureReason] to an arbitrary JSON value.
         *
         * You should usually call [Builder.failureReason] with a well-typed [FailureReason] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun failureReason(failureReason: JsonField<FailureReason>) = apply {
            this.failureReason = failureReason
        }

        /**
         * The fees associated with the quote in the smallest unit of the sending currency (eg.
         * cents).
         */
        fun fees(fees: Long) = fees(JsonField.of(fees))

        /**
         * Sets [Builder.fees] to an arbitrary JSON value.
         *
         * You should usually call [Builder.fees] with a well-typed [Long] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun fees(fees: JsonField<Long>) = apply { this.fees = fees }

        /** ID of the original transaction that this transaction is retrying, if applicable */
        fun originalTransactionId(originalTransactionId: String) =
            originalTransactionId(JsonField.of(originalTransactionId))

        /**
         * Sets [Builder.originalTransactionId] to an arbitrary JSON value.
         *
         * You should usually call [Builder.originalTransactionId] with a well-typed [String] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun originalTransactionId(originalTransactionId: JsonField<String>) = apply {
            this.originalTransactionId = originalTransactionId
        }

        /** The ID of the quote that was used to trigger this payment */
        fun quoteId(quoteId: String) = quoteId(JsonField.of(quoteId))

        /**
         * Sets [Builder.quoteId] to an arbitrary JSON value.
         *
         * You should usually call [Builder.quoteId] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun quoteId(quoteId: JsonField<String>) = apply { this.quoteId = quoteId }

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

        /** Amount to be received by recipient in the recipient's currency */
        fun receivedAmount(receivedAmount: CurrencyAmount) =
            receivedAmount(JsonField.of(receivedAmount))

        /**
         * Sets [Builder.receivedAmount] to an arbitrary JSON value.
         *
         * You should usually call [Builder.receivedAmount] with a well-typed [CurrencyAmount] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun receivedAmount(receivedAmount: JsonField<CurrencyAmount>) = apply {
            this.receivedAmount = receivedAmount
        }

        /** The refund if transaction was refunded. */
        fun refund(refund: Refund) = refund(JsonField.of(refund))

        /**
         * Sets [Builder.refund] to an arbitrary JSON value.
         *
         * You should usually call [Builder.refund] with a well-typed [Refund] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun refund(refund: JsonField<Refund>) = apply { this.refund = refund }

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
         * Returns an immutable instance of [SandboxSendFundsResponse].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .id()
         * .customerId()
         * .destination()
         * .platformCustomerId()
         * .status()
         * .type()
         * .paymentInstructions()
         * .sentAmount()
         * .source()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): SandboxSendFundsResponse =
            SandboxSendFundsResponse(
                checkRequired("id", id),
                checkRequired("customerId", customerId),
                checkRequired("destination", destination),
                checkRequired("platformCustomerId", platformCustomerId),
                checkRequired("status", status),
                checkRequired("type", type),
                counterpartyInformation,
                createdAt,
                description,
                settledAt,
                updatedAt,
                checkRequired("paymentInstructions", paymentInstructions).map { it.toImmutable() },
                checkRequired("sentAmount", sentAmount),
                checkRequired("source", source),
                exchangeRate,
                failureReason,
                fees,
                originalTransactionId,
                quoteId,
                rateDetails,
                receivedAmount,
                refund,
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): SandboxSendFundsResponse = apply {
        if (validated) {
            return@apply
        }

        id()
        customerId()
        destination().validate()
        platformCustomerId()
        status().validate()
        type().validate()
        counterpartyInformation()?.validate()
        createdAt()
        description()
        settledAt()
        updatedAt()
        paymentInstructions().forEach { it.validate() }
        sentAmount().validate()
        source().validate()
        exchangeRate()
        failureReason()?.validate()
        fees()
        originalTransactionId()
        quoteId()
        rateDetails()?.validate()
        receivedAmount()?.validate()
        refund()?.validate()
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
        (if (id.asKnown() == null) 0 else 1) +
            (if (customerId.asKnown() == null) 0 else 1) +
            (destination.asKnown()?.validity() ?: 0) +
            (if (platformCustomerId.asKnown() == null) 0 else 1) +
            (status.asKnown()?.validity() ?: 0) +
            (type.asKnown()?.validity() ?: 0) +
            (counterpartyInformation.asKnown()?.validity() ?: 0) +
            (if (createdAt.asKnown() == null) 0 else 1) +
            (if (description.asKnown() == null) 0 else 1) +
            (if (settledAt.asKnown() == null) 0 else 1) +
            (if (updatedAt.asKnown() == null) 0 else 1) +
            (paymentInstructions.asKnown()?.sumOf { it.validity().toInt() } ?: 0) +
            (sentAmount.asKnown()?.validity() ?: 0) +
            (source.asKnown()?.validity() ?: 0) +
            (if (exchangeRate.asKnown() == null) 0 else 1) +
            (failureReason.asKnown()?.validity() ?: 0) +
            (if (fees.asKnown() == null) 0 else 1) +
            (if (originalTransactionId.asKnown() == null) 0 else 1) +
            (if (quoteId.asKnown() == null) 0 else 1) +
            (rateDetails.asKnown()?.validity() ?: 0) +
            (receivedAmount.asKnown()?.validity() ?: 0) +
            (refund.asKnown()?.validity() ?: 0)

    /** Source account details */
    @JsonDeserialize(using = Source.Deserializer::class)
    @JsonSerialize(using = Source.Serializer::class)
    class Source
    private constructor(
        private val account: AccountSource? = null,
        private val umaAddress: UmaAddressSource? = null,
        private val _json: JsonValue? = null,
    ) {

        /** Source account details */
        fun account(): AccountSource? = account

        /** UMA address source details */
        fun umaAddress(): UmaAddressSource? = umaAddress

        fun isAccount(): Boolean = account != null

        fun isUmaAddress(): Boolean = umaAddress != null

        /** Source account details */
        fun asAccount(): AccountSource = account.getOrThrow("account")

        /** UMA address source details */
        fun asUmaAddress(): UmaAddressSource = umaAddress.getOrThrow("umaAddress")

        fun _json(): JsonValue? = _json

        fun <T> accept(visitor: Visitor<T>): T =
            when {
                account != null -> visitor.visitAccount(account)
                umaAddress != null -> visitor.visitUmaAddress(umaAddress)
                else -> visitor.unknown(_json)
            }

        private var validated: Boolean = false

        fun validate(): Source = apply {
            if (validated) {
                return@apply
            }

            accept(
                object : Visitor<Unit> {
                    override fun visitAccount(account: AccountSource) {
                        account.validate()
                    }

                    override fun visitUmaAddress(umaAddress: UmaAddressSource) {
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
                    override fun visitAccount(account: AccountSource) = account.validity()

                    override fun visitUmaAddress(umaAddress: UmaAddressSource) =
                        umaAddress.validity()

                    override fun unknown(json: JsonValue?) = 0
                }
            )

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is Source && account == other.account && umaAddress == other.umaAddress
        }

        override fun hashCode(): Int = Objects.hash(account, umaAddress)

        override fun toString(): String =
            when {
                account != null -> "Source{account=$account}"
                umaAddress != null -> "Source{umaAddress=$umaAddress}"
                _json != null -> "Source{_unknown=$_json}"
                else -> throw IllegalStateException("Invalid Source")
            }

        companion object {

            /** Source account details */
            fun ofAccount(account: AccountSource) = Source(account = account)

            /** UMA address source details */
            fun ofUmaAddress(umaAddress: UmaAddressSource) = Source(umaAddress = umaAddress)
        }

        /** An interface that defines how to map each variant of [Source] to a value of type [T]. */
        interface Visitor<out T> {

            /** Source account details */
            fun visitAccount(account: AccountSource): T

            /** UMA address source details */
            fun visitUmaAddress(umaAddress: UmaAddressSource): T

            /**
             * Maps an unknown variant of [Source] to a value of type [T].
             *
             * An instance of [Source] can contain an unknown variant if it was deserialized from
             * data that doesn't match any known variant. For example, if the SDK is on an older
             * version than the API, then the API may respond with new variants that the SDK is
             * unaware of.
             *
             * @throws GridInvalidDataException in the default implementation.
             */
            fun unknown(json: JsonValue?): T {
                throw GridInvalidDataException("Unknown Source: $json")
            }
        }

        internal class Deserializer : BaseDeserializer<Source>(Source::class) {

            override fun ObjectCodec.deserialize(node: JsonNode): Source {
                val json = JsonValue.fromJsonNode(node)

                val bestMatches =
                    sequenceOf(
                            tryDeserialize(node, jacksonTypeRef<AccountSource>())?.let {
                                Source(account = it, _json = json)
                            },
                            tryDeserialize(node, jacksonTypeRef<UmaAddressSource>())?.let {
                                Source(umaAddress = it, _json = json)
                            },
                        )
                        .filterNotNull()
                        .allMaxBy { it.validity() }
                        .toList()
                return when (bestMatches.size) {
                    // This can happen if what we're deserializing is completely incompatible with
                    // all the possible variants (e.g. deserializing from boolean).
                    0 -> Source(_json = json)
                    1 -> bestMatches.single()
                    // If there's more than one match with the highest validity, then use the first
                    // completely valid match, or simply the first match if none are completely
                    // valid.
                    else -> bestMatches.firstOrNull { it.isValid() } ?: bestMatches.first()
                }
            }
        }

        internal class Serializer : BaseSerializer<Source>(Source::class) {

            override fun serialize(
                value: Source,
                generator: JsonGenerator,
                provider: SerializerProvider,
            ) {
                when {
                    value.account != null -> generator.writeObject(value.account)
                    value.umaAddress != null -> generator.writeObject(value.umaAddress)
                    value._json != null -> generator.writeObject(value._json)
                    else -> throw IllegalStateException("Invalid Source")
                }
            }
        }

        /** Source account details */
        class AccountSource
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val accountId: JsonField<String>,
            private val currency: JsonField<String>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("accountId")
                @ExcludeMissing
                accountId: JsonField<String> = JsonMissing.of(),
                @JsonProperty("currency")
                @ExcludeMissing
                currency: JsonField<String> = JsonMissing.of(),
            ) : this(accountId, currency, mutableMapOf())

            /**
             * Source account identifier
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun accountId(): String = accountId.getRequired("accountId")

            /**
             * Currency code for the source account
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun currency(): String = currency.getRequired("currency")

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
                 * Returns a mutable builder for constructing an instance of [AccountSource].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountId()
                 * .currency()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [AccountSource]. */
            class Builder internal constructor() {

                private var accountId: JsonField<String>? = null
                private var currency: JsonField<String>? = null
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(accountSource: AccountSource) = apply {
                    accountId = accountSource.accountId
                    currency = accountSource.currency
                    additionalProperties = accountSource.additionalProperties.toMutableMap()
                }

                /** Source account identifier */
                fun accountId(accountId: String) = accountId(JsonField.of(accountId))

                /**
                 * Sets [Builder.accountId] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.accountId] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun accountId(accountId: JsonField<String>) = apply { this.accountId = accountId }

                /** Currency code for the source account */
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
                 * Returns an immutable instance of [AccountSource].
                 *
                 * Further updates to this [Builder] will not mutate the returned instance.
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountId()
                 * .currency()
                 * ```
                 *
                 * @throws IllegalStateException if any required field is unset.
                 */
                fun build(): AccountSource =
                    AccountSource(
                        checkRequired("accountId", accountId),
                        checkRequired("currency", currency),
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): AccountSource = apply {
                if (validated) {
                    return@apply
                }

                accountId()
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
                    (if (currency.asKnown() == null) 0 else 1)

            override fun equals(other: Any?): Boolean {
                if (this === other) {
                    return true
                }

                return other is AccountSource &&
                    accountId == other.accountId &&
                    currency == other.currency &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(accountId, currency, additionalProperties)
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "AccountSource{accountId=$accountId, currency=$currency, additionalProperties=$additionalProperties}"
        }

        /** UMA address source details */
        class UmaAddressSource
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val umaAddress: JsonField<String>,
            private val currency: JsonField<String>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("umaAddress")
                @ExcludeMissing
                umaAddress: JsonField<String> = JsonMissing.of(),
                @JsonProperty("currency")
                @ExcludeMissing
                currency: JsonField<String> = JsonMissing.of(),
            ) : this(umaAddress, currency, mutableMapOf())

            /**
             * UMA address of the sender
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun umaAddress(): String = umaAddress.getRequired("umaAddress")

            /**
             * Currency code for the source
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
                 * Returns a mutable builder for constructing an instance of [UmaAddressSource].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .umaAddress()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [UmaAddressSource]. */
            class Builder internal constructor() {

                private var umaAddress: JsonField<String>? = null
                private var currency: JsonField<String> = JsonMissing.of()
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(umaAddressSource: UmaAddressSource) = apply {
                    umaAddress = umaAddressSource.umaAddress
                    currency = umaAddressSource.currency
                    additionalProperties = umaAddressSource.additionalProperties.toMutableMap()
                }

                /** UMA address of the sender */
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

                /** Currency code for the source */
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
                 * Returns an immutable instance of [UmaAddressSource].
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
                fun build(): UmaAddressSource =
                    UmaAddressSource(
                        checkRequired("umaAddress", umaAddress),
                        currency,
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): UmaAddressSource = apply {
                if (validated) {
                    return@apply
                }

                umaAddress()
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
                (if (umaAddress.asKnown() == null) 0 else 1) +
                    (if (currency.asKnown() == null) 0 else 1)

            override fun equals(other: Any?): Boolean {
                if (this === other) {
                    return true
                }

                return other is UmaAddressSource &&
                    umaAddress == other.umaAddress &&
                    currency == other.currency &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(umaAddress, currency, additionalProperties)
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "UmaAddressSource{umaAddress=$umaAddress, currency=$currency, additionalProperties=$additionalProperties}"
        }
    }

    /** If the transaction failed, this field provides the reason for failure. */
    class FailureReason @JsonCreator private constructor(private val value: JsonField<String>) :
        Enum {

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

            val QUOTE_EXPIRED = of("QUOTE_EXPIRED")

            val QUOTE_EXECUTION_FAILED = of("QUOTE_EXECUTION_FAILED")

            val LIGHTNING_PAYMENT_FAILED = of("LIGHTNING_PAYMENT_FAILED")

            val FUNDING_AMOUNT_MISMATCH = of("FUNDING_AMOUNT_MISMATCH")

            val COUNTERPARTY_POST_TX_FAILED = of("COUNTERPARTY_POST_TX_FAILED")

            val TIMEOUT = of("TIMEOUT")

            fun of(value: String) = FailureReason(JsonField.of(value))
        }

        /** An enum containing [FailureReason]'s known values. */
        enum class Known {
            QUOTE_EXPIRED,
            QUOTE_EXECUTION_FAILED,
            LIGHTNING_PAYMENT_FAILED,
            FUNDING_AMOUNT_MISMATCH,
            COUNTERPARTY_POST_TX_FAILED,
            TIMEOUT,
        }

        /**
         * An enum containing [FailureReason]'s known values, as well as an [_UNKNOWN] member.
         *
         * An instance of [FailureReason] can contain an unknown value in a couple of cases:
         * - It was deserialized from data that doesn't match any known member. For example, if the
         *   SDK is on an older version than the API, then the API may respond with new members that
         *   the SDK is unaware of.
         * - It was constructed with an arbitrary value using the [of] method.
         */
        enum class Value {
            QUOTE_EXPIRED,
            QUOTE_EXECUTION_FAILED,
            LIGHTNING_PAYMENT_FAILED,
            FUNDING_AMOUNT_MISMATCH,
            COUNTERPARTY_POST_TX_FAILED,
            TIMEOUT,
            /**
             * An enum member indicating that [FailureReason] was instantiated with an unknown
             * value.
             */
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
                QUOTE_EXPIRED -> Value.QUOTE_EXPIRED
                QUOTE_EXECUTION_FAILED -> Value.QUOTE_EXECUTION_FAILED
                LIGHTNING_PAYMENT_FAILED -> Value.LIGHTNING_PAYMENT_FAILED
                FUNDING_AMOUNT_MISMATCH -> Value.FUNDING_AMOUNT_MISMATCH
                COUNTERPARTY_POST_TX_FAILED -> Value.COUNTERPARTY_POST_TX_FAILED
                TIMEOUT -> Value.TIMEOUT
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
                QUOTE_EXPIRED -> Known.QUOTE_EXPIRED
                QUOTE_EXECUTION_FAILED -> Known.QUOTE_EXECUTION_FAILED
                LIGHTNING_PAYMENT_FAILED -> Known.LIGHTNING_PAYMENT_FAILED
                FUNDING_AMOUNT_MISMATCH -> Known.FUNDING_AMOUNT_MISMATCH
                COUNTERPARTY_POST_TX_FAILED -> Known.COUNTERPARTY_POST_TX_FAILED
                TIMEOUT -> Known.TIMEOUT
                else -> throw GridInvalidDataException("Unknown FailureReason: $value")
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

        fun validate(): FailureReason = apply {
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

            return other is FailureReason && value == other.value
        }

        override fun hashCode() = value.hashCode()

        override fun toString() = value.toString()
    }

    /** The refund if transaction was refunded. */
    class Refund
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val initiatedAt: JsonField<OffsetDateTime>,
        private val reference: JsonField<String>,
        private val settledAt: JsonField<OffsetDateTime>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("initiatedAt")
            @ExcludeMissing
            initiatedAt: JsonField<OffsetDateTime> = JsonMissing.of(),
            @JsonProperty("reference")
            @ExcludeMissing
            reference: JsonField<String> = JsonMissing.of(),
            @JsonProperty("settledAt")
            @ExcludeMissing
            settledAt: JsonField<OffsetDateTime> = JsonMissing.of(),
        ) : this(initiatedAt, reference, settledAt, mutableMapOf())

        /**
         * When the refund was initiated
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun initiatedAt(): OffsetDateTime = initiatedAt.getRequired("initiatedAt")

        /**
         * The unique reference code of the refund
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun reference(): String = reference.getRequired("reference")

        /**
         * When the refund was or will be settled
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun settledAt(): OffsetDateTime? = settledAt.getNullable("settledAt")

        /**
         * Returns the raw JSON value of [initiatedAt].
         *
         * Unlike [initiatedAt], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("initiatedAt")
        @ExcludeMissing
        fun _initiatedAt(): JsonField<OffsetDateTime> = initiatedAt

        /**
         * Returns the raw JSON value of [reference].
         *
         * Unlike [reference], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("reference") @ExcludeMissing fun _reference(): JsonField<String> = reference

        /**
         * Returns the raw JSON value of [settledAt].
         *
         * Unlike [settledAt], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("settledAt")
        @ExcludeMissing
        fun _settledAt(): JsonField<OffsetDateTime> = settledAt

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
             * Returns a mutable builder for constructing an instance of [Refund].
             *
             * The following fields are required:
             * ```kotlin
             * .initiatedAt()
             * .reference()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [Refund]. */
        class Builder internal constructor() {

            private var initiatedAt: JsonField<OffsetDateTime>? = null
            private var reference: JsonField<String>? = null
            private var settledAt: JsonField<OffsetDateTime> = JsonMissing.of()
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(refund: Refund) = apply {
                initiatedAt = refund.initiatedAt
                reference = refund.reference
                settledAt = refund.settledAt
                additionalProperties = refund.additionalProperties.toMutableMap()
            }

            /** When the refund was initiated */
            fun initiatedAt(initiatedAt: OffsetDateTime) = initiatedAt(JsonField.of(initiatedAt))

            /**
             * Sets [Builder.initiatedAt] to an arbitrary JSON value.
             *
             * You should usually call [Builder.initiatedAt] with a well-typed [OffsetDateTime]
             * value instead. This method is primarily for setting the field to an undocumented or
             * not yet supported value.
             */
            fun initiatedAt(initiatedAt: JsonField<OffsetDateTime>) = apply {
                this.initiatedAt = initiatedAt
            }

            /** The unique reference code of the refund */
            fun reference(reference: String) = reference(JsonField.of(reference))

            /**
             * Sets [Builder.reference] to an arbitrary JSON value.
             *
             * You should usually call [Builder.reference] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun reference(reference: JsonField<String>) = apply { this.reference = reference }

            /** When the refund was or will be settled */
            fun settledAt(settledAt: OffsetDateTime) = settledAt(JsonField.of(settledAt))

            /**
             * Sets [Builder.settledAt] to an arbitrary JSON value.
             *
             * You should usually call [Builder.settledAt] with a well-typed [OffsetDateTime] value
             * instead. This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun settledAt(settledAt: JsonField<OffsetDateTime>) = apply {
                this.settledAt = settledAt
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
             * Returns an immutable instance of [Refund].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             *
             * The following fields are required:
             * ```kotlin
             * .initiatedAt()
             * .reference()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): Refund =
                Refund(
                    checkRequired("initiatedAt", initiatedAt),
                    checkRequired("reference", reference),
                    settledAt,
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): Refund = apply {
            if (validated) {
                return@apply
            }

            initiatedAt()
            reference()
            settledAt()
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
            (if (initiatedAt.asKnown() == null) 0 else 1) +
                (if (reference.asKnown() == null) 0 else 1) +
                (if (settledAt.asKnown() == null) 0 else 1)

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is Refund &&
                initiatedAt == other.initiatedAt &&
                reference == other.reference &&
                settledAt == other.settledAt &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(initiatedAt, reference, settledAt, additionalProperties)
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "Refund{initiatedAt=$initiatedAt, reference=$reference, settledAt=$settledAt, additionalProperties=$additionalProperties}"
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is SandboxSendFundsResponse &&
            id == other.id &&
            customerId == other.customerId &&
            destination == other.destination &&
            platformCustomerId == other.platformCustomerId &&
            status == other.status &&
            type == other.type &&
            counterpartyInformation == other.counterpartyInformation &&
            createdAt == other.createdAt &&
            description == other.description &&
            settledAt == other.settledAt &&
            updatedAt == other.updatedAt &&
            paymentInstructions == other.paymentInstructions &&
            sentAmount == other.sentAmount &&
            source == other.source &&
            exchangeRate == other.exchangeRate &&
            failureReason == other.failureReason &&
            fees == other.fees &&
            originalTransactionId == other.originalTransactionId &&
            quoteId == other.quoteId &&
            rateDetails == other.rateDetails &&
            receivedAmount == other.receivedAmount &&
            refund == other.refund &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(
            id,
            customerId,
            destination,
            platformCustomerId,
            status,
            type,
            counterpartyInformation,
            createdAt,
            description,
            settledAt,
            updatedAt,
            paymentInstructions,
            sentAmount,
            source,
            exchangeRate,
            failureReason,
            fees,
            originalTransactionId,
            quoteId,
            rateDetails,
            receivedAmount,
            refund,
            additionalProperties,
        )
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "SandboxSendFundsResponse{id=$id, customerId=$customerId, destination=$destination, platformCustomerId=$platformCustomerId, status=$status, type=$type, counterpartyInformation=$counterpartyInformation, createdAt=$createdAt, description=$description, settledAt=$settledAt, updatedAt=$updatedAt, paymentInstructions=$paymentInstructions, sentAmount=$sentAmount, source=$source, exchangeRate=$exchangeRate, failureReason=$failureReason, fees=$fees, originalTransactionId=$originalTransactionId, quoteId=$quoteId, rateDetails=$rateDetails, receivedAmount=$receivedAmount, refund=$refund, additionalProperties=$additionalProperties}"
}
