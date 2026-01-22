// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.transactions

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
import com.grid.api.core.checkRequired
import com.grid.api.core.getOrThrow
import com.grid.api.errors.GridInvalidDataException
import com.grid.api.models.invitations.CurrencyAmount
import com.grid.api.models.transferin.Transaction
import java.time.OffsetDateTime
import java.util.Collections
import java.util.Objects

class IncomingTransaction
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
    private val receivedAmount: JsonField<CurrencyAmount>,
    private val failureReason: JsonField<FailureReason>,
    private val rateDetails: JsonField<RateDetails>,
    private val reconciliationInstructions: JsonField<ReconciliationInstructions>,
    private val source: JsonField<Source>,
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
        @JsonProperty("receivedAmount")
        @ExcludeMissing
        receivedAmount: JsonField<CurrencyAmount> = JsonMissing.of(),
        @JsonProperty("failureReason")
        @ExcludeMissing
        failureReason: JsonField<FailureReason> = JsonMissing.of(),
        @JsonProperty("rateDetails")
        @ExcludeMissing
        rateDetails: JsonField<RateDetails> = JsonMissing.of(),
        @JsonProperty("reconciliationInstructions")
        @ExcludeMissing
        reconciliationInstructions: JsonField<ReconciliationInstructions> = JsonMissing.of(),
        @JsonProperty("source") @ExcludeMissing source: JsonField<Source> = JsonMissing.of(),
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
        receivedAmount,
        failureReason,
        rateDetails,
        reconciliationInstructions,
        source,
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
     * Amount received in the recipient's currency
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun receivedAmount(): CurrencyAmount = receivedAmount.getRequired("receivedAmount")

    /**
     * If the transaction failed, this field provides the reason for failure.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun failureReason(): FailureReason? = failureReason.getNullable("failureReason")

    /**
     * Details about the rate and fees for the transaction.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun rateDetails(): RateDetails? = rateDetails.getNullable("rateDetails")

    /**
     * Included for all transactions except those with "CREATED" status
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun reconciliationInstructions(): ReconciliationInstructions? =
        reconciliationInstructions.getNullable("reconciliationInstructions")

    /**
     * Source account details
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun source(): Source? = source.getNullable("source")

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
     * Returns the raw JSON value of [receivedAmount].
     *
     * Unlike [receivedAmount], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("receivedAmount")
    @ExcludeMissing
    fun _receivedAmount(): JsonField<CurrencyAmount> = receivedAmount

    /**
     * Returns the raw JSON value of [failureReason].
     *
     * Unlike [failureReason], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("failureReason")
    @ExcludeMissing
    fun _failureReason(): JsonField<FailureReason> = failureReason

    /**
     * Returns the raw JSON value of [rateDetails].
     *
     * Unlike [rateDetails], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("rateDetails")
    @ExcludeMissing
    fun _rateDetails(): JsonField<RateDetails> = rateDetails

    /**
     * Returns the raw JSON value of [reconciliationInstructions].
     *
     * Unlike [reconciliationInstructions], this method doesn't throw if the JSON field has an
     * unexpected type.
     */
    @JsonProperty("reconciliationInstructions")
    @ExcludeMissing
    fun _reconciliationInstructions(): JsonField<ReconciliationInstructions> =
        reconciliationInstructions

    /**
     * Returns the raw JSON value of [source].
     *
     * Unlike [source], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("source") @ExcludeMissing fun _source(): JsonField<Source> = source

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
         * Returns a mutable builder for constructing an instance of [IncomingTransaction].
         *
         * The following fields are required:
         * ```kotlin
         * .id()
         * .customerId()
         * .destination()
         * .platformCustomerId()
         * .status()
         * .type()
         * .receivedAmount()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [IncomingTransaction]. */
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
        private var receivedAmount: JsonField<CurrencyAmount>? = null
        private var failureReason: JsonField<FailureReason> = JsonMissing.of()
        private var rateDetails: JsonField<RateDetails> = JsonMissing.of()
        private var reconciliationInstructions: JsonField<ReconciliationInstructions> =
            JsonMissing.of()
        private var source: JsonField<Source> = JsonMissing.of()
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(incomingTransaction: IncomingTransaction) = apply {
            id = incomingTransaction.id
            customerId = incomingTransaction.customerId
            destination = incomingTransaction.destination
            platformCustomerId = incomingTransaction.platformCustomerId
            status = incomingTransaction.status
            type = incomingTransaction.type
            counterpartyInformation = incomingTransaction.counterpartyInformation
            createdAt = incomingTransaction.createdAt
            description = incomingTransaction.description
            settledAt = incomingTransaction.settledAt
            updatedAt = incomingTransaction.updatedAt
            receivedAmount = incomingTransaction.receivedAmount
            failureReason = incomingTransaction.failureReason
            rateDetails = incomingTransaction.rateDetails
            reconciliationInstructions = incomingTransaction.reconciliationInstructions
            source = incomingTransaction.source
            additionalProperties = incomingTransaction.additionalProperties.toMutableMap()
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

        /** Amount received in the recipient's currency */
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

        /** Details about the rate and fees for the transaction. */
        fun rateDetails(rateDetails: RateDetails) = rateDetails(JsonField.of(rateDetails))

        /**
         * Sets [Builder.rateDetails] to an arbitrary JSON value.
         *
         * You should usually call [Builder.rateDetails] with a well-typed [RateDetails] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun rateDetails(rateDetails: JsonField<RateDetails>) = apply {
            this.rateDetails = rateDetails
        }

        /** Included for all transactions except those with "CREATED" status */
        fun reconciliationInstructions(reconciliationInstructions: ReconciliationInstructions) =
            reconciliationInstructions(JsonField.of(reconciliationInstructions))

        /**
         * Sets [Builder.reconciliationInstructions] to an arbitrary JSON value.
         *
         * You should usually call [Builder.reconciliationInstructions] with a well-typed
         * [ReconciliationInstructions] value instead. This method is primarily for setting the
         * field to an undocumented or not yet supported value.
         */
        fun reconciliationInstructions(
            reconciliationInstructions: JsonField<ReconciliationInstructions>
        ) = apply { this.reconciliationInstructions = reconciliationInstructions }

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
         * Returns an immutable instance of [IncomingTransaction].
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
         * .receivedAmount()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): IncomingTransaction =
            IncomingTransaction(
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
                checkRequired("receivedAmount", receivedAmount),
                failureReason,
                rateDetails,
                reconciliationInstructions,
                source,
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): IncomingTransaction = apply {
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
        receivedAmount().validate()
        failureReason()?.validate()
        rateDetails()?.validate()
        reconciliationInstructions()?.validate()
        source()?.validate()
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
            (receivedAmount.asKnown()?.validity() ?: 0) +
            (failureReason.asKnown()?.validity() ?: 0) +
            (rateDetails.asKnown()?.validity() ?: 0) +
            (reconciliationInstructions.asKnown()?.validity() ?: 0) +
            (source.asKnown()?.validity() ?: 0)

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

            val LNURLP_FAILED = of("LNURLP_FAILED")

            val PAY_REQUEST_FAILED = of("PAY_REQUEST_FAILED")

            val PAYMENT_APPROVAL_WEBHOOK_ERROR = of("PAYMENT_APPROVAL_WEBHOOK_ERROR")

            val PAYMENT_APPROVAL_TIMED_OUT = of("PAYMENT_APPROVAL_TIMED_OUT")

            val OFFRAMP_FAILED = of("OFFRAMP_FAILED")

            val MISSING_MANDATORY_PAYEE_DATA = of("MISSING_MANDATORY_PAYEE_DATA")

            val QUOTE_EXPIRED = of("QUOTE_EXPIRED")

            val QUOTE_EXECUTION_FAILED = of("QUOTE_EXECUTION_FAILED")

            fun of(value: String) = FailureReason(JsonField.of(value))
        }

        /** An enum containing [FailureReason]'s known values. */
        enum class Known {
            LNURLP_FAILED,
            PAY_REQUEST_FAILED,
            PAYMENT_APPROVAL_WEBHOOK_ERROR,
            PAYMENT_APPROVAL_TIMED_OUT,
            OFFRAMP_FAILED,
            MISSING_MANDATORY_PAYEE_DATA,
            QUOTE_EXPIRED,
            QUOTE_EXECUTION_FAILED,
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
            LNURLP_FAILED,
            PAY_REQUEST_FAILED,
            PAYMENT_APPROVAL_WEBHOOK_ERROR,
            PAYMENT_APPROVAL_TIMED_OUT,
            OFFRAMP_FAILED,
            MISSING_MANDATORY_PAYEE_DATA,
            QUOTE_EXPIRED,
            QUOTE_EXECUTION_FAILED,
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
                LNURLP_FAILED -> Value.LNURLP_FAILED
                PAY_REQUEST_FAILED -> Value.PAY_REQUEST_FAILED
                PAYMENT_APPROVAL_WEBHOOK_ERROR -> Value.PAYMENT_APPROVAL_WEBHOOK_ERROR
                PAYMENT_APPROVAL_TIMED_OUT -> Value.PAYMENT_APPROVAL_TIMED_OUT
                OFFRAMP_FAILED -> Value.OFFRAMP_FAILED
                MISSING_MANDATORY_PAYEE_DATA -> Value.MISSING_MANDATORY_PAYEE_DATA
                QUOTE_EXPIRED -> Value.QUOTE_EXPIRED
                QUOTE_EXECUTION_FAILED -> Value.QUOTE_EXECUTION_FAILED
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
                LNURLP_FAILED -> Known.LNURLP_FAILED
                PAY_REQUEST_FAILED -> Known.PAY_REQUEST_FAILED
                PAYMENT_APPROVAL_WEBHOOK_ERROR -> Known.PAYMENT_APPROVAL_WEBHOOK_ERROR
                PAYMENT_APPROVAL_TIMED_OUT -> Known.PAYMENT_APPROVAL_TIMED_OUT
                OFFRAMP_FAILED -> Known.OFFRAMP_FAILED
                MISSING_MANDATORY_PAYEE_DATA -> Known.MISSING_MANDATORY_PAYEE_DATA
                QUOTE_EXPIRED -> Known.QUOTE_EXPIRED
                QUOTE_EXECUTION_FAILED -> Known.QUOTE_EXECUTION_FAILED
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

    /** Details about the rate and fees for the transaction. */
    class RateDetails
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val gridApiFixedFee: JsonField<Long>,
        private val gridApiMultiplier: JsonField<Double>,
        private val gridApiVariableFeeAmount: JsonField<Double>,
        private val gridApiVariableFeeRate: JsonField<Double>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
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
            gridApiFixedFee,
            gridApiMultiplier,
            gridApiVariableFeeAmount,
            gridApiVariableFeeRate,
            mutableMapOf(),
        )

        /**
         * The fixed fee charged by the Grid product to execute the quote in the smallest unit of
         * the receiving currency (eg. cents).
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun gridApiFixedFee(): Long = gridApiFixedFee.getRequired("gridApiFixedFee")

        /**
         * The underlying multiplier from the mSATS to the receiving currency, including variable
         * fees.
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun gridApiMultiplier(): Double = gridApiMultiplier.getRequired("gridApiMultiplier")

        /**
         * The variable fee amount charged by the Grid product to execute the quote in the smallest
         * unit of the receiving currency (eg. cents). This is the receiving amount times
         * gridApiVariableFeeRate.
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun gridApiVariableFeeAmount(): Double =
            gridApiVariableFeeAmount.getRequired("gridApiVariableFeeAmount")

        /**
         * The variable fee rate charged by the Grid product to execute the quote as a percentage of
         * the receiving currency amount.
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun gridApiVariableFeeRate(): Double =
            gridApiVariableFeeRate.getRequired("gridApiVariableFeeRate")

        /**
         * Returns the raw JSON value of [gridApiFixedFee].
         *
         * Unlike [gridApiFixedFee], this method doesn't throw if the JSON field has an unexpected
         * type.
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
             * Returns a mutable builder for constructing an instance of [RateDetails].
             *
             * The following fields are required:
             * ```kotlin
             * .gridApiFixedFee()
             * .gridApiMultiplier()
             * .gridApiVariableFeeAmount()
             * .gridApiVariableFeeRate()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [RateDetails]. */
        class Builder internal constructor() {

            private var gridApiFixedFee: JsonField<Long>? = null
            private var gridApiMultiplier: JsonField<Double>? = null
            private var gridApiVariableFeeAmount: JsonField<Double>? = null
            private var gridApiVariableFeeRate: JsonField<Double>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(rateDetails: RateDetails) = apply {
                gridApiFixedFee = rateDetails.gridApiFixedFee
                gridApiMultiplier = rateDetails.gridApiMultiplier
                gridApiVariableFeeAmount = rateDetails.gridApiVariableFeeAmount
                gridApiVariableFeeRate = rateDetails.gridApiVariableFeeRate
                additionalProperties = rateDetails.additionalProperties.toMutableMap()
            }

            /**
             * The fixed fee charged by the Grid product to execute the quote in the smallest unit
             * of the receiving currency (eg. cents).
             */
            fun gridApiFixedFee(gridApiFixedFee: Long) =
                gridApiFixedFee(JsonField.of(gridApiFixedFee))

            /**
             * Sets [Builder.gridApiFixedFee] to an arbitrary JSON value.
             *
             * You should usually call [Builder.gridApiFixedFee] with a well-typed [Long] value
             * instead. This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun gridApiFixedFee(gridApiFixedFee: JsonField<Long>) = apply {
                this.gridApiFixedFee = gridApiFixedFee
            }

            /**
             * The underlying multiplier from the mSATS to the receiving currency, including
             * variable fees.
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
             * The variable fee amount charged by the Grid product to execute the quote in the
             * smallest unit of the receiving currency (eg. cents). This is the receiving amount
             * times gridApiVariableFeeRate.
             */
            fun gridApiVariableFeeAmount(gridApiVariableFeeAmount: Double) =
                gridApiVariableFeeAmount(JsonField.of(gridApiVariableFeeAmount))

            /**
             * Sets [Builder.gridApiVariableFeeAmount] to an arbitrary JSON value.
             *
             * You should usually call [Builder.gridApiVariableFeeAmount] with a well-typed [Double]
             * value instead. This method is primarily for setting the field to an undocumented or
             * not yet supported value.
             */
            fun gridApiVariableFeeAmount(gridApiVariableFeeAmount: JsonField<Double>) = apply {
                this.gridApiVariableFeeAmount = gridApiVariableFeeAmount
            }

            /**
             * The variable fee rate charged by the Grid product to execute the quote as a
             * percentage of the receiving currency amount.
             */
            fun gridApiVariableFeeRate(gridApiVariableFeeRate: Double) =
                gridApiVariableFeeRate(JsonField.of(gridApiVariableFeeRate))

            /**
             * Sets [Builder.gridApiVariableFeeRate] to an arbitrary JSON value.
             *
             * You should usually call [Builder.gridApiVariableFeeRate] with a well-typed [Double]
             * value instead. This method is primarily for setting the field to an undocumented or
             * not yet supported value.
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
             * Returns an immutable instance of [RateDetails].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             *
             * The following fields are required:
             * ```kotlin
             * .gridApiFixedFee()
             * .gridApiMultiplier()
             * .gridApiVariableFeeAmount()
             * .gridApiVariableFeeRate()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): RateDetails =
                RateDetails(
                    checkRequired("gridApiFixedFee", gridApiFixedFee),
                    checkRequired("gridApiMultiplier", gridApiMultiplier),
                    checkRequired("gridApiVariableFeeAmount", gridApiVariableFeeAmount),
                    checkRequired("gridApiVariableFeeRate", gridApiVariableFeeRate),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): RateDetails = apply {
            if (validated) {
                return@apply
            }

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
         * Returns a score indicating how many valid values are contained in this object
         * recursively.
         *
         * Used for best match union deserialization.
         */
        internal fun validity(): Int =
            (if (gridApiFixedFee.asKnown() == null) 0 else 1) +
                (if (gridApiMultiplier.asKnown() == null) 0 else 1) +
                (if (gridApiVariableFeeAmount.asKnown() == null) 0 else 1) +
                (if (gridApiVariableFeeRate.asKnown() == null) 0 else 1)

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is RateDetails &&
                gridApiFixedFee == other.gridApiFixedFee &&
                gridApiMultiplier == other.gridApiMultiplier &&
                gridApiVariableFeeAmount == other.gridApiVariableFeeAmount &&
                gridApiVariableFeeRate == other.gridApiVariableFeeRate &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(
                gridApiFixedFee,
                gridApiMultiplier,
                gridApiVariableFeeAmount,
                gridApiVariableFeeRate,
                additionalProperties,
            )
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "RateDetails{gridApiFixedFee=$gridApiFixedFee, gridApiMultiplier=$gridApiMultiplier, gridApiVariableFeeAmount=$gridApiVariableFeeAmount, gridApiVariableFeeRate=$gridApiVariableFeeRate, additionalProperties=$additionalProperties}"
    }

    /** Included for all transactions except those with "CREATED" status */
    class ReconciliationInstructions
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val reference: JsonField<String>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("reference")
            @ExcludeMissing
            reference: JsonField<String> = JsonMissing.of()
        ) : this(reference, mutableMapOf())

        /**
         * Unique reference code that must be included with the payment to match it with the correct
         * incoming transaction
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun reference(): String = reference.getRequired("reference")

        /**
         * Returns the raw JSON value of [reference].
         *
         * Unlike [reference], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("reference") @ExcludeMissing fun _reference(): JsonField<String> = reference

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
             * Returns a mutable builder for constructing an instance of
             * [ReconciliationInstructions].
             *
             * The following fields are required:
             * ```kotlin
             * .reference()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [ReconciliationInstructions]. */
        class Builder internal constructor() {

            private var reference: JsonField<String>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(reconciliationInstructions: ReconciliationInstructions) = apply {
                reference = reconciliationInstructions.reference
                additionalProperties =
                    reconciliationInstructions.additionalProperties.toMutableMap()
            }

            /**
             * Unique reference code that must be included with the payment to match it with the
             * correct incoming transaction
             */
            fun reference(reference: String) = reference(JsonField.of(reference))

            /**
             * Sets [Builder.reference] to an arbitrary JSON value.
             *
             * You should usually call [Builder.reference] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun reference(reference: JsonField<String>) = apply { this.reference = reference }

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
             * Returns an immutable instance of [ReconciliationInstructions].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             *
             * The following fields are required:
             * ```kotlin
             * .reference()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): ReconciliationInstructions =
                ReconciliationInstructions(
                    checkRequired("reference", reference),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): ReconciliationInstructions = apply {
            if (validated) {
                return@apply
            }

            reference()
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
        internal fun validity(): Int = (if (reference.asKnown() == null) 0 else 1)

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is ReconciliationInstructions &&
                reference == other.reference &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy { Objects.hash(reference, additionalProperties) }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "ReconciliationInstructions{reference=$reference, additionalProperties=$additionalProperties}"
    }

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

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is IncomingTransaction &&
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
            receivedAmount == other.receivedAmount &&
            failureReason == other.failureReason &&
            rateDetails == other.rateDetails &&
            reconciliationInstructions == other.reconciliationInstructions &&
            source == other.source &&
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
            receivedAmount,
            failureReason,
            rateDetails,
            reconciliationInstructions,
            source,
            additionalProperties,
        )
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "IncomingTransaction{id=$id, customerId=$customerId, destination=$destination, platformCustomerId=$platformCustomerId, status=$status, type=$type, counterpartyInformation=$counterpartyInformation, createdAt=$createdAt, description=$description, settledAt=$settledAt, updatedAt=$updatedAt, receivedAmount=$receivedAmount, failureReason=$failureReason, rateDetails=$rateDetails, reconciliationInstructions=$reconciliationInstructions, source=$source, additionalProperties=$additionalProperties}"
}
