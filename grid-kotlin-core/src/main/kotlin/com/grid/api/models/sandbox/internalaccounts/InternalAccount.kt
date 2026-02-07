// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.sandbox.internalaccounts

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
import com.grid.api.models.invitations.CurrencyAmount
import com.grid.api.models.quotes.PaymentInstructions
import java.time.OffsetDateTime
import java.util.Collections
import java.util.Objects

class InternalAccount
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val id: JsonField<String>,
    private val balance: JsonField<CurrencyAmount>,
    private val createdAt: JsonField<OffsetDateTime>,
    private val fundingPaymentInstructions: JsonField<List<PaymentInstructions>>,
    private val updatedAt: JsonField<OffsetDateTime>,
    private val customerId: JsonField<String>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("id") @ExcludeMissing id: JsonField<String> = JsonMissing.of(),
        @JsonProperty("balance")
        @ExcludeMissing
        balance: JsonField<CurrencyAmount> = JsonMissing.of(),
        @JsonProperty("createdAt")
        @ExcludeMissing
        createdAt: JsonField<OffsetDateTime> = JsonMissing.of(),
        @JsonProperty("fundingPaymentInstructions")
        @ExcludeMissing
        fundingPaymentInstructions: JsonField<List<PaymentInstructions>> = JsonMissing.of(),
        @JsonProperty("updatedAt")
        @ExcludeMissing
        updatedAt: JsonField<OffsetDateTime> = JsonMissing.of(),
        @JsonProperty("customerId") @ExcludeMissing customerId: JsonField<String> = JsonMissing.of(),
    ) : this(
        id,
        balance,
        createdAt,
        fundingPaymentInstructions,
        updatedAt,
        customerId,
        mutableMapOf(),
    )

    /**
     * The ID of the internal account
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun id(): String = id.getRequired("id")

    /**
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun balance(): CurrencyAmount = balance.getRequired("balance")

    /**
     * Timestamp when the internal account was created
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun createdAt(): OffsetDateTime = createdAt.getRequired("createdAt")

    /**
     * Payment instructions for funding the account
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun fundingPaymentInstructions(): List<PaymentInstructions> =
        fundingPaymentInstructions.getRequired("fundingPaymentInstructions")

    /**
     * Timestamp when the internal account was last updated
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun updatedAt(): OffsetDateTime = updatedAt.getRequired("updatedAt")

    /**
     * The ID of the customer associated with the internal account. If this field is empty, the
     * internal account belongs to the platform.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun customerId(): String? = customerId.getNullable("customerId")

    /**
     * Returns the raw JSON value of [id].
     *
     * Unlike [id], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("id") @ExcludeMissing fun _id(): JsonField<String> = id

    /**
     * Returns the raw JSON value of [balance].
     *
     * Unlike [balance], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("balance") @ExcludeMissing fun _balance(): JsonField<CurrencyAmount> = balance

    /**
     * Returns the raw JSON value of [createdAt].
     *
     * Unlike [createdAt], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("createdAt")
    @ExcludeMissing
    fun _createdAt(): JsonField<OffsetDateTime> = createdAt

    /**
     * Returns the raw JSON value of [fundingPaymentInstructions].
     *
     * Unlike [fundingPaymentInstructions], this method doesn't throw if the JSON field has an
     * unexpected type.
     */
    @JsonProperty("fundingPaymentInstructions")
    @ExcludeMissing
    fun _fundingPaymentInstructions(): JsonField<List<PaymentInstructions>> =
        fundingPaymentInstructions

    /**
     * Returns the raw JSON value of [updatedAt].
     *
     * Unlike [updatedAt], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("updatedAt")
    @ExcludeMissing
    fun _updatedAt(): JsonField<OffsetDateTime> = updatedAt

    /**
     * Returns the raw JSON value of [customerId].
     *
     * Unlike [customerId], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("customerId") @ExcludeMissing fun _customerId(): JsonField<String> = customerId

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
         * Returns a mutable builder for constructing an instance of [InternalAccount].
         *
         * The following fields are required:
         * ```kotlin
         * .id()
         * .balance()
         * .createdAt()
         * .fundingPaymentInstructions()
         * .updatedAt()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [InternalAccount]. */
    class Builder internal constructor() {

        private var id: JsonField<String>? = null
        private var balance: JsonField<CurrencyAmount>? = null
        private var createdAt: JsonField<OffsetDateTime>? = null
        private var fundingPaymentInstructions: JsonField<MutableList<PaymentInstructions>>? = null
        private var updatedAt: JsonField<OffsetDateTime>? = null
        private var customerId: JsonField<String> = JsonMissing.of()
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(internalAccount: InternalAccount) = apply {
            id = internalAccount.id
            balance = internalAccount.balance
            createdAt = internalAccount.createdAt
            fundingPaymentInstructions =
                internalAccount.fundingPaymentInstructions.map { it.toMutableList() }
            updatedAt = internalAccount.updatedAt
            customerId = internalAccount.customerId
            additionalProperties = internalAccount.additionalProperties.toMutableMap()
        }

        /** The ID of the internal account */
        fun id(id: String) = id(JsonField.of(id))

        /**
         * Sets [Builder.id] to an arbitrary JSON value.
         *
         * You should usually call [Builder.id] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun id(id: JsonField<String>) = apply { this.id = id }

        fun balance(balance: CurrencyAmount) = balance(JsonField.of(balance))

        /**
         * Sets [Builder.balance] to an arbitrary JSON value.
         *
         * You should usually call [Builder.balance] with a well-typed [CurrencyAmount] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun balance(balance: JsonField<CurrencyAmount>) = apply { this.balance = balance }

        /** Timestamp when the internal account was created */
        fun createdAt(createdAt: OffsetDateTime) = createdAt(JsonField.of(createdAt))

        /**
         * Sets [Builder.createdAt] to an arbitrary JSON value.
         *
         * You should usually call [Builder.createdAt] with a well-typed [OffsetDateTime] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun createdAt(createdAt: JsonField<OffsetDateTime>) = apply { this.createdAt = createdAt }

        /** Payment instructions for funding the account */
        fun fundingPaymentInstructions(fundingPaymentInstructions: List<PaymentInstructions>) =
            fundingPaymentInstructions(JsonField.of(fundingPaymentInstructions))

        /**
         * Sets [Builder.fundingPaymentInstructions] to an arbitrary JSON value.
         *
         * You should usually call [Builder.fundingPaymentInstructions] with a well-typed
         * `List<PaymentInstructions>` value instead. This method is primarily for setting the field
         * to an undocumented or not yet supported value.
         */
        fun fundingPaymentInstructions(
            fundingPaymentInstructions: JsonField<List<PaymentInstructions>>
        ) = apply {
            this.fundingPaymentInstructions = fundingPaymentInstructions.map { it.toMutableList() }
        }

        /**
         * Adds a single [PaymentInstructions] to [fundingPaymentInstructions].
         *
         * @throws IllegalStateException if the field was previously set to a non-list.
         */
        fun addFundingPaymentInstruction(fundingPaymentInstruction: PaymentInstructions) = apply {
            fundingPaymentInstructions =
                (fundingPaymentInstructions ?: JsonField.of(mutableListOf())).also {
                    checkKnown("fundingPaymentInstructions", it).add(fundingPaymentInstruction)
                }
        }

        /** Timestamp when the internal account was last updated */
        fun updatedAt(updatedAt: OffsetDateTime) = updatedAt(JsonField.of(updatedAt))

        /**
         * Sets [Builder.updatedAt] to an arbitrary JSON value.
         *
         * You should usually call [Builder.updatedAt] with a well-typed [OffsetDateTime] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun updatedAt(updatedAt: JsonField<OffsetDateTime>) = apply { this.updatedAt = updatedAt }

        /**
         * The ID of the customer associated with the internal account. If this field is empty, the
         * internal account belongs to the platform.
         */
        fun customerId(customerId: String) = customerId(JsonField.of(customerId))

        /**
         * Sets [Builder.customerId] to an arbitrary JSON value.
         *
         * You should usually call [Builder.customerId] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun customerId(customerId: JsonField<String>) = apply { this.customerId = customerId }

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
         * Returns an immutable instance of [InternalAccount].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .id()
         * .balance()
         * .createdAt()
         * .fundingPaymentInstructions()
         * .updatedAt()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): InternalAccount =
            InternalAccount(
                checkRequired("id", id),
                checkRequired("balance", balance),
                checkRequired("createdAt", createdAt),
                checkRequired("fundingPaymentInstructions", fundingPaymentInstructions).map {
                    it.toImmutable()
                },
                checkRequired("updatedAt", updatedAt),
                customerId,
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): InternalAccount = apply {
        if (validated) {
            return@apply
        }

        id()
        balance().validate()
        createdAt()
        fundingPaymentInstructions().forEach { it.validate() }
        updatedAt()
        customerId()
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
            (balance.asKnown()?.validity() ?: 0) +
            (if (createdAt.asKnown() == null) 0 else 1) +
            (fundingPaymentInstructions.asKnown()?.sumOf { it.validity().toInt() } ?: 0) +
            (if (updatedAt.asKnown() == null) 0 else 1) +
            (if (customerId.asKnown() == null) 0 else 1)

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is InternalAccount &&
            id == other.id &&
            balance == other.balance &&
            createdAt == other.createdAt &&
            fundingPaymentInstructions == other.fundingPaymentInstructions &&
            updatedAt == other.updatedAt &&
            customerId == other.customerId &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(
            id,
            balance,
            createdAt,
            fundingPaymentInstructions,
            updatedAt,
            customerId,
            additionalProperties,
        )
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "InternalAccount{id=$id, balance=$balance, createdAt=$createdAt, fundingPaymentInstructions=$fundingPaymentInstructions, updatedAt=$updatedAt, customerId=$customerId, additionalProperties=$additionalProperties}"
}
