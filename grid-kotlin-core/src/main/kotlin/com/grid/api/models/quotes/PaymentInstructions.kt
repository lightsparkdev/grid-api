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
import com.grid.api.core.allMaxBy
import com.grid.api.core.checkRequired
import com.grid.api.core.getOrThrow
import com.grid.api.errors.GridInvalidDataException
import com.grid.api.models.customers.externalaccounts.BaseWalletInfo
import com.grid.api.models.customers.externalaccounts.ClabeAccountInfo
import com.grid.api.models.customers.externalaccounts.IbanAccountInfo
import com.grid.api.models.customers.externalaccounts.PixAccountInfo
import com.grid.api.models.customers.externalaccounts.PolygonWalletInfo
import com.grid.api.models.customers.externalaccounts.SolanaWalletInfo
import com.grid.api.models.customers.externalaccounts.SparkWalletInfo
import com.grid.api.models.customers.externalaccounts.TronWalletInfo
import com.grid.api.models.customers.externalaccounts.UpiAccountInfo
import com.grid.api.models.customers.externalaccounts.UsAccountInfo
import java.util.Collections
import java.util.Objects

class PaymentInstructions
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val accountOrWalletInfo: JsonField<AccountOrWalletInfo>,
    private val instructionsNotes: JsonField<String>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("accountOrWalletInfo")
        @ExcludeMissing
        accountOrWalletInfo: JsonField<AccountOrWalletInfo> = JsonMissing.of(),
        @JsonProperty("instructionsNotes")
        @ExcludeMissing
        instructionsNotes: JsonField<String> = JsonMissing.of(),
    ) : this(accountOrWalletInfo, instructionsNotes, mutableMapOf())

    /**
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun accountOrWalletInfo(): AccountOrWalletInfo =
        accountOrWalletInfo.getRequired("accountOrWalletInfo")

    /**
     * Additional human-readable instructions for making the payment
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun instructionsNotes(): String? = instructionsNotes.getNullable("instructionsNotes")

    /**
     * Returns the raw JSON value of [accountOrWalletInfo].
     *
     * Unlike [accountOrWalletInfo], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    @JsonProperty("accountOrWalletInfo")
    @ExcludeMissing
    fun _accountOrWalletInfo(): JsonField<AccountOrWalletInfo> = accountOrWalletInfo

    /**
     * Returns the raw JSON value of [instructionsNotes].
     *
     * Unlike [instructionsNotes], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    @JsonProperty("instructionsNotes")
    @ExcludeMissing
    fun _instructionsNotes(): JsonField<String> = instructionsNotes

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
         * Returns a mutable builder for constructing an instance of [PaymentInstructions].
         *
         * The following fields are required:
         * ```kotlin
         * .accountOrWalletInfo()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [PaymentInstructions]. */
    class Builder internal constructor() {

        private var accountOrWalletInfo: JsonField<AccountOrWalletInfo>? = null
        private var instructionsNotes: JsonField<String> = JsonMissing.of()
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(paymentInstructions: PaymentInstructions) = apply {
            accountOrWalletInfo = paymentInstructions.accountOrWalletInfo
            instructionsNotes = paymentInstructions.instructionsNotes
            additionalProperties = paymentInstructions.additionalProperties.toMutableMap()
        }

        fun accountOrWalletInfo(accountOrWalletInfo: AccountOrWalletInfo) =
            accountOrWalletInfo(JsonField.of(accountOrWalletInfo))

        /**
         * Sets [Builder.accountOrWalletInfo] to an arbitrary JSON value.
         *
         * You should usually call [Builder.accountOrWalletInfo] with a well-typed
         * [AccountOrWalletInfo] value instead. This method is primarily for setting the field to an
         * undocumented or not yet supported value.
         */
        fun accountOrWalletInfo(accountOrWalletInfo: JsonField<AccountOrWalletInfo>) = apply {
            this.accountOrWalletInfo = accountOrWalletInfo
        }

        /**
         * Alias for calling [accountOrWalletInfo] with
         * `AccountOrWalletInfo.ofPaymentClabeAccount(paymentClabeAccount)`.
         */
        fun accountOrWalletInfo(paymentClabeAccount: AccountOrWalletInfo.PaymentClabeAccountInfo) =
            accountOrWalletInfo(AccountOrWalletInfo.ofPaymentClabeAccount(paymentClabeAccount))

        /**
         * Alias for calling [accountOrWalletInfo] with
         * `AccountOrWalletInfo.ofPaymentUsAccount(paymentUsAccount)`.
         */
        fun accountOrWalletInfo(paymentUsAccount: AccountOrWalletInfo.PaymentUsAccountInfo) =
            accountOrWalletInfo(AccountOrWalletInfo.ofPaymentUsAccount(paymentUsAccount))

        /**
         * Alias for calling [accountOrWalletInfo] with
         * `AccountOrWalletInfo.ofPaymentPixAccount(paymentPixAccount)`.
         */
        fun accountOrWalletInfo(paymentPixAccount: AccountOrWalletInfo.PaymentPixAccountInfo) =
            accountOrWalletInfo(AccountOrWalletInfo.ofPaymentPixAccount(paymentPixAccount))

        /**
         * Alias for calling [accountOrWalletInfo] with
         * `AccountOrWalletInfo.ofPaymentIbanAccount(paymentIbanAccount)`.
         */
        fun accountOrWalletInfo(paymentIbanAccount: AccountOrWalletInfo.PaymentIbanAccountInfo) =
            accountOrWalletInfo(AccountOrWalletInfo.ofPaymentIbanAccount(paymentIbanAccount))

        /**
         * Alias for calling [accountOrWalletInfo] with
         * `AccountOrWalletInfo.ofPaymentFboAccount(paymentFboAccount)`.
         */
        fun accountOrWalletInfo(paymentFboAccount: AccountOrWalletInfo.PaymentFboAccountInfo) =
            accountOrWalletInfo(AccountOrWalletInfo.ofPaymentFboAccount(paymentFboAccount))

        /**
         * Alias for calling [accountOrWalletInfo] with
         * `AccountOrWalletInfo.ofPaymentUpiAccount(paymentUpiAccount)`.
         */
        fun accountOrWalletInfo(paymentUpiAccount: AccountOrWalletInfo.PaymentUpiAccountInfo) =
            accountOrWalletInfo(AccountOrWalletInfo.ofPaymentUpiAccount(paymentUpiAccount))

        /**
         * Alias for calling [accountOrWalletInfo] with
         * `AccountOrWalletInfo.ofPaymentSpark(paymentSpark)`.
         */
        fun accountOrWalletInfo(paymentSpark: AccountOrWalletInfo.PaymentSparkWalletInfo) =
            accountOrWalletInfo(AccountOrWalletInfo.ofPaymentSpark(paymentSpark))

        /**
         * Alias for calling [accountOrWalletInfo] with
         * `AccountOrWalletInfo.ofPaymentLightningInvoice(paymentLightningInvoice)`.
         */
        fun accountOrWalletInfo(
            paymentLightningInvoice: AccountOrWalletInfo.PaymentLightningInvoiceInfo
        ) =
            accountOrWalletInfo(
                AccountOrWalletInfo.ofPaymentLightningInvoice(paymentLightningInvoice)
            )

        /**
         * Alias for calling [accountOrWalletInfo] with
         * `AccountOrWalletInfo.ofPaymentSolana(paymentSolana)`.
         */
        fun accountOrWalletInfo(paymentSolana: AccountOrWalletInfo.PaymentSolanaWalletInfo) =
            accountOrWalletInfo(AccountOrWalletInfo.ofPaymentSolana(paymentSolana))

        /**
         * Alias for calling [accountOrWalletInfo] with
         * `AccountOrWalletInfo.ofPaymentTron(paymentTron)`.
         */
        fun accountOrWalletInfo(paymentTron: AccountOrWalletInfo.PaymentTronWalletInfo) =
            accountOrWalletInfo(AccountOrWalletInfo.ofPaymentTron(paymentTron))

        /**
         * Alias for calling [accountOrWalletInfo] with
         * `AccountOrWalletInfo.ofPaymentPolygon(paymentPolygon)`.
         */
        fun accountOrWalletInfo(paymentPolygon: AccountOrWalletInfo.PaymentPolygonWalletInfo) =
            accountOrWalletInfo(AccountOrWalletInfo.ofPaymentPolygon(paymentPolygon))

        /**
         * Alias for calling [accountOrWalletInfo] with
         * `AccountOrWalletInfo.ofPaymentBase(paymentBase)`.
         */
        fun accountOrWalletInfo(paymentBase: AccountOrWalletInfo.PaymentBaseWalletInfo) =
            accountOrWalletInfo(AccountOrWalletInfo.ofPaymentBase(paymentBase))

        /** Additional human-readable instructions for making the payment */
        fun instructionsNotes(instructionsNotes: String) =
            instructionsNotes(JsonField.of(instructionsNotes))

        /**
         * Sets [Builder.instructionsNotes] to an arbitrary JSON value.
         *
         * You should usually call [Builder.instructionsNotes] with a well-typed [String] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun instructionsNotes(instructionsNotes: JsonField<String>) = apply {
            this.instructionsNotes = instructionsNotes
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
         * Returns an immutable instance of [PaymentInstructions].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .accountOrWalletInfo()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): PaymentInstructions =
            PaymentInstructions(
                checkRequired("accountOrWalletInfo", accountOrWalletInfo),
                instructionsNotes,
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): PaymentInstructions = apply {
        if (validated) {
            return@apply
        }

        accountOrWalletInfo().validate()
        instructionsNotes()
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
        (accountOrWalletInfo.asKnown()?.validity() ?: 0) +
            (if (instructionsNotes.asKnown() == null) 0 else 1)

    @JsonDeserialize(using = AccountOrWalletInfo.Deserializer::class)
    @JsonSerialize(using = AccountOrWalletInfo.Serializer::class)
    class AccountOrWalletInfo
    private constructor(
        private val paymentClabeAccount: PaymentClabeAccountInfo? = null,
        private val paymentUsAccount: PaymentUsAccountInfo? = null,
        private val paymentPixAccount: PaymentPixAccountInfo? = null,
        private val paymentIbanAccount: PaymentIbanAccountInfo? = null,
        private val paymentFboAccount: PaymentFboAccountInfo? = null,
        private val paymentUpiAccount: PaymentUpiAccountInfo? = null,
        private val paymentSpark: PaymentSparkWalletInfo? = null,
        private val paymentLightningInvoice: PaymentLightningInvoiceInfo? = null,
        private val paymentSolana: PaymentSolanaWalletInfo? = null,
        private val paymentTron: PaymentTronWalletInfo? = null,
        private val paymentPolygon: PaymentPolygonWalletInfo? = null,
        private val paymentBase: PaymentBaseWalletInfo? = null,
        private val _json: JsonValue? = null,
    ) {

        fun paymentClabeAccount(): PaymentClabeAccountInfo? = paymentClabeAccount

        fun paymentUsAccount(): PaymentUsAccountInfo? = paymentUsAccount

        fun paymentPixAccount(): PaymentPixAccountInfo? = paymentPixAccount

        fun paymentIbanAccount(): PaymentIbanAccountInfo? = paymentIbanAccount

        fun paymentFboAccount(): PaymentFboAccountInfo? = paymentFboAccount

        fun paymentUpiAccount(): PaymentUpiAccountInfo? = paymentUpiAccount

        fun paymentSpark(): PaymentSparkWalletInfo? = paymentSpark

        fun paymentLightningInvoice(): PaymentLightningInvoiceInfo? = paymentLightningInvoice

        fun paymentSolana(): PaymentSolanaWalletInfo? = paymentSolana

        fun paymentTron(): PaymentTronWalletInfo? = paymentTron

        fun paymentPolygon(): PaymentPolygonWalletInfo? = paymentPolygon

        fun paymentBase(): PaymentBaseWalletInfo? = paymentBase

        fun isPaymentClabeAccount(): Boolean = paymentClabeAccount != null

        fun isPaymentUsAccount(): Boolean = paymentUsAccount != null

        fun isPaymentPixAccount(): Boolean = paymentPixAccount != null

        fun isPaymentIbanAccount(): Boolean = paymentIbanAccount != null

        fun isPaymentFboAccount(): Boolean = paymentFboAccount != null

        fun isPaymentUpiAccount(): Boolean = paymentUpiAccount != null

        fun isPaymentSpark(): Boolean = paymentSpark != null

        fun isPaymentLightningInvoice(): Boolean = paymentLightningInvoice != null

        fun isPaymentSolana(): Boolean = paymentSolana != null

        fun isPaymentTron(): Boolean = paymentTron != null

        fun isPaymentPolygon(): Boolean = paymentPolygon != null

        fun isPaymentBase(): Boolean = paymentBase != null

        fun asPaymentClabeAccount(): PaymentClabeAccountInfo =
            paymentClabeAccount.getOrThrow("paymentClabeAccount")

        fun asPaymentUsAccount(): PaymentUsAccountInfo =
            paymentUsAccount.getOrThrow("paymentUsAccount")

        fun asPaymentPixAccount(): PaymentPixAccountInfo =
            paymentPixAccount.getOrThrow("paymentPixAccount")

        fun asPaymentIbanAccount(): PaymentIbanAccountInfo =
            paymentIbanAccount.getOrThrow("paymentIbanAccount")

        fun asPaymentFboAccount(): PaymentFboAccountInfo =
            paymentFboAccount.getOrThrow("paymentFboAccount")

        fun asPaymentUpiAccount(): PaymentUpiAccountInfo =
            paymentUpiAccount.getOrThrow("paymentUpiAccount")

        fun asPaymentSpark(): PaymentSparkWalletInfo = paymentSpark.getOrThrow("paymentSpark")

        fun asPaymentLightningInvoice(): PaymentLightningInvoiceInfo =
            paymentLightningInvoice.getOrThrow("paymentLightningInvoice")

        fun asPaymentSolana(): PaymentSolanaWalletInfo = paymentSolana.getOrThrow("paymentSolana")

        fun asPaymentTron(): PaymentTronWalletInfo = paymentTron.getOrThrow("paymentTron")

        fun asPaymentPolygon(): PaymentPolygonWalletInfo =
            paymentPolygon.getOrThrow("paymentPolygon")

        fun asPaymentBase(): PaymentBaseWalletInfo = paymentBase.getOrThrow("paymentBase")

        fun _json(): JsonValue? = _json

        fun <T> accept(visitor: Visitor<T>): T =
            when {
                paymentClabeAccount != null -> visitor.visitPaymentClabeAccount(paymentClabeAccount)
                paymentUsAccount != null -> visitor.visitPaymentUsAccount(paymentUsAccount)
                paymentPixAccount != null -> visitor.visitPaymentPixAccount(paymentPixAccount)
                paymentIbanAccount != null -> visitor.visitPaymentIbanAccount(paymentIbanAccount)
                paymentFboAccount != null -> visitor.visitPaymentFboAccount(paymentFboAccount)
                paymentUpiAccount != null -> visitor.visitPaymentUpiAccount(paymentUpiAccount)
                paymentSpark != null -> visitor.visitPaymentSpark(paymentSpark)
                paymentLightningInvoice != null ->
                    visitor.visitPaymentLightningInvoice(paymentLightningInvoice)
                paymentSolana != null -> visitor.visitPaymentSolana(paymentSolana)
                paymentTron != null -> visitor.visitPaymentTron(paymentTron)
                paymentPolygon != null -> visitor.visitPaymentPolygon(paymentPolygon)
                paymentBase != null -> visitor.visitPaymentBase(paymentBase)
                else -> visitor.unknown(_json)
            }

        private var validated: Boolean = false

        fun validate(): AccountOrWalletInfo = apply {
            if (validated) {
                return@apply
            }

            accept(
                object : Visitor<Unit> {
                    override fun visitPaymentClabeAccount(
                        paymentClabeAccount: PaymentClabeAccountInfo
                    ) {
                        paymentClabeAccount.validate()
                    }

                    override fun visitPaymentUsAccount(paymentUsAccount: PaymentUsAccountInfo) {
                        paymentUsAccount.validate()
                    }

                    override fun visitPaymentPixAccount(paymentPixAccount: PaymentPixAccountInfo) {
                        paymentPixAccount.validate()
                    }

                    override fun visitPaymentIbanAccount(
                        paymentIbanAccount: PaymentIbanAccountInfo
                    ) {
                        paymentIbanAccount.validate()
                    }

                    override fun visitPaymentFboAccount(paymentFboAccount: PaymentFboAccountInfo) {
                        paymentFboAccount.validate()
                    }

                    override fun visitPaymentUpiAccount(paymentUpiAccount: PaymentUpiAccountInfo) {
                        paymentUpiAccount.validate()
                    }

                    override fun visitPaymentSpark(paymentSpark: PaymentSparkWalletInfo) {
                        paymentSpark.validate()
                    }

                    override fun visitPaymentLightningInvoice(
                        paymentLightningInvoice: PaymentLightningInvoiceInfo
                    ) {
                        paymentLightningInvoice.validate()
                    }

                    override fun visitPaymentSolana(paymentSolana: PaymentSolanaWalletInfo) {
                        paymentSolana.validate()
                    }

                    override fun visitPaymentTron(paymentTron: PaymentTronWalletInfo) {
                        paymentTron.validate()
                    }

                    override fun visitPaymentPolygon(paymentPolygon: PaymentPolygonWalletInfo) {
                        paymentPolygon.validate()
                    }

                    override fun visitPaymentBase(paymentBase: PaymentBaseWalletInfo) {
                        paymentBase.validate()
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
                    override fun visitPaymentClabeAccount(
                        paymentClabeAccount: PaymentClabeAccountInfo
                    ) = paymentClabeAccount.validity()

                    override fun visitPaymentUsAccount(paymentUsAccount: PaymentUsAccountInfo) =
                        paymentUsAccount.validity()

                    override fun visitPaymentPixAccount(paymentPixAccount: PaymentPixAccountInfo) =
                        paymentPixAccount.validity()

                    override fun visitPaymentIbanAccount(
                        paymentIbanAccount: PaymentIbanAccountInfo
                    ) = paymentIbanAccount.validity()

                    override fun visitPaymentFboAccount(paymentFboAccount: PaymentFboAccountInfo) =
                        paymentFboAccount.validity()

                    override fun visitPaymentUpiAccount(paymentUpiAccount: PaymentUpiAccountInfo) =
                        paymentUpiAccount.validity()

                    override fun visitPaymentSpark(paymentSpark: PaymentSparkWalletInfo) =
                        paymentSpark.validity()

                    override fun visitPaymentLightningInvoice(
                        paymentLightningInvoice: PaymentLightningInvoiceInfo
                    ) = paymentLightningInvoice.validity()

                    override fun visitPaymentSolana(paymentSolana: PaymentSolanaWalletInfo) =
                        paymentSolana.validity()

                    override fun visitPaymentTron(paymentTron: PaymentTronWalletInfo) =
                        paymentTron.validity()

                    override fun visitPaymentPolygon(paymentPolygon: PaymentPolygonWalletInfo) =
                        paymentPolygon.validity()

                    override fun visitPaymentBase(paymentBase: PaymentBaseWalletInfo) =
                        paymentBase.validity()

                    override fun unknown(json: JsonValue?) = 0
                }
            )

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is AccountOrWalletInfo &&
                paymentClabeAccount == other.paymentClabeAccount &&
                paymentUsAccount == other.paymentUsAccount &&
                paymentPixAccount == other.paymentPixAccount &&
                paymentIbanAccount == other.paymentIbanAccount &&
                paymentFboAccount == other.paymentFboAccount &&
                paymentUpiAccount == other.paymentUpiAccount &&
                paymentSpark == other.paymentSpark &&
                paymentLightningInvoice == other.paymentLightningInvoice &&
                paymentSolana == other.paymentSolana &&
                paymentTron == other.paymentTron &&
                paymentPolygon == other.paymentPolygon &&
                paymentBase == other.paymentBase
        }

        override fun hashCode(): Int =
            Objects.hash(
                paymentClabeAccount,
                paymentUsAccount,
                paymentPixAccount,
                paymentIbanAccount,
                paymentFboAccount,
                paymentUpiAccount,
                paymentSpark,
                paymentLightningInvoice,
                paymentSolana,
                paymentTron,
                paymentPolygon,
                paymentBase,
            )

        override fun toString(): String =
            when {
                paymentClabeAccount != null ->
                    "AccountOrWalletInfo{paymentClabeAccount=$paymentClabeAccount}"
                paymentUsAccount != null ->
                    "AccountOrWalletInfo{paymentUsAccount=$paymentUsAccount}"
                paymentPixAccount != null ->
                    "AccountOrWalletInfo{paymentPixAccount=$paymentPixAccount}"
                paymentIbanAccount != null ->
                    "AccountOrWalletInfo{paymentIbanAccount=$paymentIbanAccount}"
                paymentFboAccount != null ->
                    "AccountOrWalletInfo{paymentFboAccount=$paymentFboAccount}"
                paymentUpiAccount != null ->
                    "AccountOrWalletInfo{paymentUpiAccount=$paymentUpiAccount}"
                paymentSpark != null -> "AccountOrWalletInfo{paymentSpark=$paymentSpark}"
                paymentLightningInvoice != null ->
                    "AccountOrWalletInfo{paymentLightningInvoice=$paymentLightningInvoice}"
                paymentSolana != null -> "AccountOrWalletInfo{paymentSolana=$paymentSolana}"
                paymentTron != null -> "AccountOrWalletInfo{paymentTron=$paymentTron}"
                paymentPolygon != null -> "AccountOrWalletInfo{paymentPolygon=$paymentPolygon}"
                paymentBase != null -> "AccountOrWalletInfo{paymentBase=$paymentBase}"
                _json != null -> "AccountOrWalletInfo{_unknown=$_json}"
                else -> throw IllegalStateException("Invalid AccountOrWalletInfo")
            }

        companion object {

            fun ofPaymentClabeAccount(paymentClabeAccount: PaymentClabeAccountInfo) =
                AccountOrWalletInfo(paymentClabeAccount = paymentClabeAccount)

            fun ofPaymentUsAccount(paymentUsAccount: PaymentUsAccountInfo) =
                AccountOrWalletInfo(paymentUsAccount = paymentUsAccount)

            fun ofPaymentPixAccount(paymentPixAccount: PaymentPixAccountInfo) =
                AccountOrWalletInfo(paymentPixAccount = paymentPixAccount)

            fun ofPaymentIbanAccount(paymentIbanAccount: PaymentIbanAccountInfo) =
                AccountOrWalletInfo(paymentIbanAccount = paymentIbanAccount)

            fun ofPaymentFboAccount(paymentFboAccount: PaymentFboAccountInfo) =
                AccountOrWalletInfo(paymentFboAccount = paymentFboAccount)

            fun ofPaymentUpiAccount(paymentUpiAccount: PaymentUpiAccountInfo) =
                AccountOrWalletInfo(paymentUpiAccount = paymentUpiAccount)

            fun ofPaymentSpark(paymentSpark: PaymentSparkWalletInfo) =
                AccountOrWalletInfo(paymentSpark = paymentSpark)

            fun ofPaymentLightningInvoice(paymentLightningInvoice: PaymentLightningInvoiceInfo) =
                AccountOrWalletInfo(paymentLightningInvoice = paymentLightningInvoice)

            fun ofPaymentSolana(paymentSolana: PaymentSolanaWalletInfo) =
                AccountOrWalletInfo(paymentSolana = paymentSolana)

            fun ofPaymentTron(paymentTron: PaymentTronWalletInfo) =
                AccountOrWalletInfo(paymentTron = paymentTron)

            fun ofPaymentPolygon(paymentPolygon: PaymentPolygonWalletInfo) =
                AccountOrWalletInfo(paymentPolygon = paymentPolygon)

            fun ofPaymentBase(paymentBase: PaymentBaseWalletInfo) =
                AccountOrWalletInfo(paymentBase = paymentBase)
        }

        /**
         * An interface that defines how to map each variant of [AccountOrWalletInfo] to a value of
         * type [T].
         */
        interface Visitor<out T> {

            fun visitPaymentClabeAccount(paymentClabeAccount: PaymentClabeAccountInfo): T

            fun visitPaymentUsAccount(paymentUsAccount: PaymentUsAccountInfo): T

            fun visitPaymentPixAccount(paymentPixAccount: PaymentPixAccountInfo): T

            fun visitPaymentIbanAccount(paymentIbanAccount: PaymentIbanAccountInfo): T

            fun visitPaymentFboAccount(paymentFboAccount: PaymentFboAccountInfo): T

            fun visitPaymentUpiAccount(paymentUpiAccount: PaymentUpiAccountInfo): T

            fun visitPaymentSpark(paymentSpark: PaymentSparkWalletInfo): T

            fun visitPaymentLightningInvoice(
                paymentLightningInvoice: PaymentLightningInvoiceInfo
            ): T

            fun visitPaymentSolana(paymentSolana: PaymentSolanaWalletInfo): T

            fun visitPaymentTron(paymentTron: PaymentTronWalletInfo): T

            fun visitPaymentPolygon(paymentPolygon: PaymentPolygonWalletInfo): T

            fun visitPaymentBase(paymentBase: PaymentBaseWalletInfo): T

            /**
             * Maps an unknown variant of [AccountOrWalletInfo] to a value of type [T].
             *
             * An instance of [AccountOrWalletInfo] can contain an unknown variant if it was
             * deserialized from data that doesn't match any known variant. For example, if the SDK
             * is on an older version than the API, then the API may respond with new variants that
             * the SDK is unaware of.
             *
             * @throws GridInvalidDataException in the default implementation.
             */
            fun unknown(json: JsonValue?): T {
                throw GridInvalidDataException("Unknown AccountOrWalletInfo: $json")
            }
        }

        internal class Deserializer :
            BaseDeserializer<AccountOrWalletInfo>(AccountOrWalletInfo::class) {

            override fun ObjectCodec.deserialize(node: JsonNode): AccountOrWalletInfo {
                val json = JsonValue.fromJsonNode(node)

                val bestMatches =
                    sequenceOf(
                            tryDeserialize(node, jacksonTypeRef<PaymentClabeAccountInfo>())?.let {
                                AccountOrWalletInfo(paymentClabeAccount = it, _json = json)
                            },
                            tryDeserialize(node, jacksonTypeRef<PaymentUsAccountInfo>())?.let {
                                AccountOrWalletInfo(paymentUsAccount = it, _json = json)
                            },
                            tryDeserialize(node, jacksonTypeRef<PaymentPixAccountInfo>())?.let {
                                AccountOrWalletInfo(paymentPixAccount = it, _json = json)
                            },
                            tryDeserialize(node, jacksonTypeRef<PaymentIbanAccountInfo>())?.let {
                                AccountOrWalletInfo(paymentIbanAccount = it, _json = json)
                            },
                            tryDeserialize(node, jacksonTypeRef<PaymentFboAccountInfo>())?.let {
                                AccountOrWalletInfo(paymentFboAccount = it, _json = json)
                            },
                            tryDeserialize(node, jacksonTypeRef<PaymentUpiAccountInfo>())?.let {
                                AccountOrWalletInfo(paymentUpiAccount = it, _json = json)
                            },
                            tryDeserialize(node, jacksonTypeRef<PaymentSparkWalletInfo>())?.let {
                                AccountOrWalletInfo(paymentSpark = it, _json = json)
                            },
                            tryDeserialize(node, jacksonTypeRef<PaymentLightningInvoiceInfo>())
                                ?.let {
                                    AccountOrWalletInfo(paymentLightningInvoice = it, _json = json)
                                },
                            tryDeserialize(node, jacksonTypeRef<PaymentSolanaWalletInfo>())?.let {
                                AccountOrWalletInfo(paymentSolana = it, _json = json)
                            },
                            tryDeserialize(node, jacksonTypeRef<PaymentTronWalletInfo>())?.let {
                                AccountOrWalletInfo(paymentTron = it, _json = json)
                            },
                            tryDeserialize(node, jacksonTypeRef<PaymentPolygonWalletInfo>())?.let {
                                AccountOrWalletInfo(paymentPolygon = it, _json = json)
                            },
                            tryDeserialize(node, jacksonTypeRef<PaymentBaseWalletInfo>())?.let {
                                AccountOrWalletInfo(paymentBase = it, _json = json)
                            },
                        )
                        .filterNotNull()
                        .allMaxBy { it.validity() }
                        .toList()
                return when (bestMatches.size) {
                    // This can happen if what we're deserializing is completely incompatible with
                    // all the possible variants (e.g. deserializing from boolean).
                    0 -> AccountOrWalletInfo(_json = json)
                    1 -> bestMatches.single()
                    // If there's more than one match with the highest validity, then use the first
                    // completely valid match, or simply the first match if none are completely
                    // valid.
                    else -> bestMatches.firstOrNull { it.isValid() } ?: bestMatches.first()
                }
            }
        }

        internal class Serializer :
            BaseSerializer<AccountOrWalletInfo>(AccountOrWalletInfo::class) {

            override fun serialize(
                value: AccountOrWalletInfo,
                generator: JsonGenerator,
                provider: SerializerProvider,
            ) {
                when {
                    value.paymentClabeAccount != null ->
                        generator.writeObject(value.paymentClabeAccount)
                    value.paymentUsAccount != null -> generator.writeObject(value.paymentUsAccount)
                    value.paymentPixAccount != null ->
                        generator.writeObject(value.paymentPixAccount)
                    value.paymentIbanAccount != null ->
                        generator.writeObject(value.paymentIbanAccount)
                    value.paymentFboAccount != null ->
                        generator.writeObject(value.paymentFboAccount)
                    value.paymentUpiAccount != null ->
                        generator.writeObject(value.paymentUpiAccount)
                    value.paymentSpark != null -> generator.writeObject(value.paymentSpark)
                    value.paymentLightningInvoice != null ->
                        generator.writeObject(value.paymentLightningInvoice)
                    value.paymentSolana != null -> generator.writeObject(value.paymentSolana)
                    value.paymentTron != null -> generator.writeObject(value.paymentTron)
                    value.paymentPolygon != null -> generator.writeObject(value.paymentPolygon)
                    value.paymentBase != null -> generator.writeObject(value.paymentBase)
                    value._json != null -> generator.writeObject(value._json)
                    else -> throw IllegalStateException("Invalid AccountOrWalletInfo")
                }
            }
        }

        class PaymentClabeAccountInfo
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>,
            private val clabeNumber: JsonField<String>,
            private val reference: JsonField<String>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("accountType")
                @ExcludeMissing
                accountType: JsonField<PaymentAccountOrWalletInfo.AccountType> = JsonMissing.of(),
                @JsonProperty("clabeNumber")
                @ExcludeMissing
                clabeNumber: JsonField<String> = JsonMissing.of(),
                @JsonProperty("reference")
                @ExcludeMissing
                reference: JsonField<String> = JsonMissing.of(),
            ) : this(accountType, clabeNumber, reference, mutableMapOf())

            fun toPaymentAccountOrWalletInfo(): PaymentAccountOrWalletInfo =
                PaymentAccountOrWalletInfo.builder().accountType(accountType).build()

            fun toClabeAccountInfo(): ClabeAccountInfo =
                ClabeAccountInfo.builder().accountType(accountType).clabeNumber(clabeNumber).build()

            /**
             * Type of account or wallet information
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun accountType(): PaymentAccountOrWalletInfo.AccountType =
                accountType.getRequired("accountType")

            /**
             * 18-digit CLABE number (Mexican banking standard)
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun clabeNumber(): String = clabeNumber.getRequired("clabeNumber")

            /**
             * Unique reference code that must be included with the payment to properly credit it
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun reference(): String = reference.getRequired("reference")

            /**
             * Returns the raw JSON value of [accountType].
             *
             * Unlike [accountType], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("accountType")
            @ExcludeMissing
            fun _accountType(): JsonField<PaymentAccountOrWalletInfo.AccountType> = accountType

            /**
             * Returns the raw JSON value of [clabeNumber].
             *
             * Unlike [clabeNumber], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("clabeNumber")
            @ExcludeMissing
            fun _clabeNumber(): JsonField<String> = clabeNumber

            /**
             * Returns the raw JSON value of [reference].
             *
             * Unlike [reference], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("reference")
            @ExcludeMissing
            fun _reference(): JsonField<String> = reference

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
                 * [PaymentClabeAccountInfo].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountType()
                 * .clabeNumber()
                 * .reference()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [PaymentClabeAccountInfo]. */
            class Builder internal constructor() {

                private var accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>? = null
                private var clabeNumber: JsonField<String>? = null
                private var reference: JsonField<String>? = null
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(paymentClabeAccountInfo: PaymentClabeAccountInfo) = apply {
                    accountType = paymentClabeAccountInfo.accountType
                    clabeNumber = paymentClabeAccountInfo.clabeNumber
                    reference = paymentClabeAccountInfo.reference
                    additionalProperties =
                        paymentClabeAccountInfo.additionalProperties.toMutableMap()
                }

                /** Type of account or wallet information */
                fun accountType(accountType: PaymentAccountOrWalletInfo.AccountType) =
                    accountType(JsonField.of(accountType))

                /**
                 * Sets [Builder.accountType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.accountType] with a well-typed
                 * [PaymentAccountOrWalletInfo.AccountType] value instead. This method is primarily
                 * for setting the field to an undocumented or not yet supported value.
                 */
                fun accountType(accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>) =
                    apply {
                        this.accountType = accountType
                    }

                /** 18-digit CLABE number (Mexican banking standard) */
                fun clabeNumber(clabeNumber: String) = clabeNumber(JsonField.of(clabeNumber))

                /**
                 * Sets [Builder.clabeNumber] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.clabeNumber] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun clabeNumber(clabeNumber: JsonField<String>) = apply {
                    this.clabeNumber = clabeNumber
                }

                /**
                 * Unique reference code that must be included with the payment to properly credit
                 * it
                 */
                fun reference(reference: String) = reference(JsonField.of(reference))

                /**
                 * Sets [Builder.reference] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.reference] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun reference(reference: JsonField<String>) = apply { this.reference = reference }

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
                 * Returns an immutable instance of [PaymentClabeAccountInfo].
                 *
                 * Further updates to this [Builder] will not mutate the returned instance.
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountType()
                 * .clabeNumber()
                 * .reference()
                 * ```
                 *
                 * @throws IllegalStateException if any required field is unset.
                 */
                fun build(): PaymentClabeAccountInfo =
                    PaymentClabeAccountInfo(
                        checkRequired("accountType", accountType),
                        checkRequired("clabeNumber", clabeNumber),
                        checkRequired("reference", reference),
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): PaymentClabeAccountInfo = apply {
                if (validated) {
                    return@apply
                }

                accountType().validate()
                clabeNumber()
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
            internal fun validity(): Int =
                (accountType.asKnown()?.validity() ?: 0) +
                    (if (clabeNumber.asKnown() == null) 0 else 1) +
                    (if (reference.asKnown() == null) 0 else 1)

            override fun equals(other: Any?): Boolean {
                if (this === other) {
                    return true
                }

                return other is PaymentClabeAccountInfo &&
                    accountType == other.accountType &&
                    clabeNumber == other.clabeNumber &&
                    reference == other.reference &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(accountType, clabeNumber, reference, additionalProperties)
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "PaymentClabeAccountInfo{accountType=$accountType, clabeNumber=$clabeNumber, reference=$reference, additionalProperties=$additionalProperties}"
        }

        class PaymentUsAccountInfo
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>,
            private val accountCategory: JsonField<UsAccountInfo.AccountCategory>,
            private val accountNumber: JsonField<String>,
            private val routingNumber: JsonField<String>,
            private val bankName: JsonField<String>,
            private val reference: JsonField<String>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("accountType")
                @ExcludeMissing
                accountType: JsonField<PaymentAccountOrWalletInfo.AccountType> = JsonMissing.of(),
                @JsonProperty("accountCategory")
                @ExcludeMissing
                accountCategory: JsonField<UsAccountInfo.AccountCategory> = JsonMissing.of(),
                @JsonProperty("accountNumber")
                @ExcludeMissing
                accountNumber: JsonField<String> = JsonMissing.of(),
                @JsonProperty("routingNumber")
                @ExcludeMissing
                routingNumber: JsonField<String> = JsonMissing.of(),
                @JsonProperty("bankName")
                @ExcludeMissing
                bankName: JsonField<String> = JsonMissing.of(),
                @JsonProperty("reference")
                @ExcludeMissing
                reference: JsonField<String> = JsonMissing.of(),
            ) : this(
                accountType,
                accountCategory,
                accountNumber,
                routingNumber,
                bankName,
                reference,
                mutableMapOf(),
            )

            fun toPaymentAccountOrWalletInfo(): PaymentAccountOrWalletInfo =
                PaymentAccountOrWalletInfo.builder().accountType(accountType).build()

            fun toUsAccountInfo(): UsAccountInfo =
                UsAccountInfo.builder()
                    .accountCategory(accountCategory)
                    .accountNumber(accountNumber)
                    .accountType(accountType)
                    .routingNumber(routingNumber)
                    .bankName(bankName)
                    .build()

            /**
             * Type of account or wallet information
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun accountType(): PaymentAccountOrWalletInfo.AccountType =
                accountType.getRequired("accountType")

            /**
             * Type of account (checking or savings)
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun accountCategory(): UsAccountInfo.AccountCategory =
                accountCategory.getRequired("accountCategory")

            /**
             * US bank account number
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun accountNumber(): String = accountNumber.getRequired("accountNumber")

            /**
             * ACH routing number (9 digits)
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun routingNumber(): String = routingNumber.getRequired("routingNumber")

            /**
             * Name of the bank
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun bankName(): String? = bankName.getNullable("bankName")

            /**
             * Unique reference code that must be included with the payment to properly credit it
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun reference(): String = reference.getRequired("reference")

            /**
             * Returns the raw JSON value of [accountType].
             *
             * Unlike [accountType], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("accountType")
            @ExcludeMissing
            fun _accountType(): JsonField<PaymentAccountOrWalletInfo.AccountType> = accountType

            /**
             * Returns the raw JSON value of [accountCategory].
             *
             * Unlike [accountCategory], this method doesn't throw if the JSON field has an
             * unexpected type.
             */
            @JsonProperty("accountCategory")
            @ExcludeMissing
            fun _accountCategory(): JsonField<UsAccountInfo.AccountCategory> = accountCategory

            /**
             * Returns the raw JSON value of [accountNumber].
             *
             * Unlike [accountNumber], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("accountNumber")
            @ExcludeMissing
            fun _accountNumber(): JsonField<String> = accountNumber

            /**
             * Returns the raw JSON value of [routingNumber].
             *
             * Unlike [routingNumber], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("routingNumber")
            @ExcludeMissing
            fun _routingNumber(): JsonField<String> = routingNumber

            /**
             * Returns the raw JSON value of [bankName].
             *
             * Unlike [bankName], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("bankName") @ExcludeMissing fun _bankName(): JsonField<String> = bankName

            /**
             * Returns the raw JSON value of [reference].
             *
             * Unlike [reference], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("reference")
            @ExcludeMissing
            fun _reference(): JsonField<String> = reference

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
                 * Returns a mutable builder for constructing an instance of [PaymentUsAccountInfo].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountType()
                 * .accountCategory()
                 * .accountNumber()
                 * .routingNumber()
                 * .reference()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [PaymentUsAccountInfo]. */
            class Builder internal constructor() {

                private var accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>? = null
                private var accountCategory: JsonField<UsAccountInfo.AccountCategory>? = null
                private var accountNumber: JsonField<String>? = null
                private var routingNumber: JsonField<String>? = null
                private var bankName: JsonField<String> = JsonMissing.of()
                private var reference: JsonField<String>? = null
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(paymentUsAccountInfo: PaymentUsAccountInfo) = apply {
                    accountType = paymentUsAccountInfo.accountType
                    accountCategory = paymentUsAccountInfo.accountCategory
                    accountNumber = paymentUsAccountInfo.accountNumber
                    routingNumber = paymentUsAccountInfo.routingNumber
                    bankName = paymentUsAccountInfo.bankName
                    reference = paymentUsAccountInfo.reference
                    additionalProperties = paymentUsAccountInfo.additionalProperties.toMutableMap()
                }

                /** Type of account or wallet information */
                fun accountType(accountType: PaymentAccountOrWalletInfo.AccountType) =
                    accountType(JsonField.of(accountType))

                /**
                 * Sets [Builder.accountType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.accountType] with a well-typed
                 * [PaymentAccountOrWalletInfo.AccountType] value instead. This method is primarily
                 * for setting the field to an undocumented or not yet supported value.
                 */
                fun accountType(accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>) =
                    apply {
                        this.accountType = accountType
                    }

                /** Type of account (checking or savings) */
                fun accountCategory(accountCategory: UsAccountInfo.AccountCategory) =
                    accountCategory(JsonField.of(accountCategory))

                /**
                 * Sets [Builder.accountCategory] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.accountCategory] with a well-typed
                 * [UsAccountInfo.AccountCategory] value instead. This method is primarily for
                 * setting the field to an undocumented or not yet supported value.
                 */
                fun accountCategory(accountCategory: JsonField<UsAccountInfo.AccountCategory>) =
                    apply {
                        this.accountCategory = accountCategory
                    }

                /** US bank account number */
                fun accountNumber(accountNumber: String) =
                    accountNumber(JsonField.of(accountNumber))

                /**
                 * Sets [Builder.accountNumber] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.accountNumber] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun accountNumber(accountNumber: JsonField<String>) = apply {
                    this.accountNumber = accountNumber
                }

                /** ACH routing number (9 digits) */
                fun routingNumber(routingNumber: String) =
                    routingNumber(JsonField.of(routingNumber))

                /**
                 * Sets [Builder.routingNumber] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.routingNumber] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun routingNumber(routingNumber: JsonField<String>) = apply {
                    this.routingNumber = routingNumber
                }

                /** Name of the bank */
                fun bankName(bankName: String) = bankName(JsonField.of(bankName))

                /**
                 * Sets [Builder.bankName] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.bankName] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun bankName(bankName: JsonField<String>) = apply { this.bankName = bankName }

                /**
                 * Unique reference code that must be included with the payment to properly credit
                 * it
                 */
                fun reference(reference: String) = reference(JsonField.of(reference))

                /**
                 * Sets [Builder.reference] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.reference] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun reference(reference: JsonField<String>) = apply { this.reference = reference }

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
                 * Returns an immutable instance of [PaymentUsAccountInfo].
                 *
                 * Further updates to this [Builder] will not mutate the returned instance.
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountType()
                 * .accountCategory()
                 * .accountNumber()
                 * .routingNumber()
                 * .reference()
                 * ```
                 *
                 * @throws IllegalStateException if any required field is unset.
                 */
                fun build(): PaymentUsAccountInfo =
                    PaymentUsAccountInfo(
                        checkRequired("accountType", accountType),
                        checkRequired("accountCategory", accountCategory),
                        checkRequired("accountNumber", accountNumber),
                        checkRequired("routingNumber", routingNumber),
                        bankName,
                        checkRequired("reference", reference),
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): PaymentUsAccountInfo = apply {
                if (validated) {
                    return@apply
                }

                accountType().validate()
                accountCategory().validate()
                accountNumber()
                routingNumber()
                bankName()
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
            internal fun validity(): Int =
                (accountType.asKnown()?.validity() ?: 0) +
                    (accountCategory.asKnown()?.validity() ?: 0) +
                    (if (accountNumber.asKnown() == null) 0 else 1) +
                    (if (routingNumber.asKnown() == null) 0 else 1) +
                    (if (bankName.asKnown() == null) 0 else 1) +
                    (if (reference.asKnown() == null) 0 else 1)

            override fun equals(other: Any?): Boolean {
                if (this === other) {
                    return true
                }

                return other is PaymentUsAccountInfo &&
                    accountType == other.accountType &&
                    accountCategory == other.accountCategory &&
                    accountNumber == other.accountNumber &&
                    routingNumber == other.routingNumber &&
                    bankName == other.bankName &&
                    reference == other.reference &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(
                    accountType,
                    accountCategory,
                    accountNumber,
                    routingNumber,
                    bankName,
                    reference,
                    additionalProperties,
                )
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "PaymentUsAccountInfo{accountType=$accountType, accountCategory=$accountCategory, accountNumber=$accountNumber, routingNumber=$routingNumber, bankName=$bankName, reference=$reference, additionalProperties=$additionalProperties}"
        }

        class PaymentPixAccountInfo
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>,
            private val pixKey: JsonField<String>,
            private val pixKeyType: JsonField<PixAccountInfo.PixKeyType>,
            private val taxId: JsonField<String>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("accountType")
                @ExcludeMissing
                accountType: JsonField<PaymentAccountOrWalletInfo.AccountType> = JsonMissing.of(),
                @JsonProperty("pixKey")
                @ExcludeMissing
                pixKey: JsonField<String> = JsonMissing.of(),
                @JsonProperty("pixKeyType")
                @ExcludeMissing
                pixKeyType: JsonField<PixAccountInfo.PixKeyType> = JsonMissing.of(),
                @JsonProperty("taxId") @ExcludeMissing taxId: JsonField<String> = JsonMissing.of(),
            ) : this(accountType, pixKey, pixKeyType, taxId, mutableMapOf())

            fun toPaymentAccountOrWalletInfo(): PaymentAccountOrWalletInfo =
                PaymentAccountOrWalletInfo.builder().accountType(accountType).build()

            fun toPixAccountInfo(): PixAccountInfo =
                PixAccountInfo.builder()
                    .accountType(accountType)
                    .pixKey(pixKey)
                    .pixKeyType(pixKeyType)
                    .taxId(taxId)
                    .build()

            /**
             * Type of account or wallet information
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun accountType(): PaymentAccountOrWalletInfo.AccountType =
                accountType.getRequired("accountType")

            /**
             * PIX key for Brazilian instant payments
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun pixKey(): String = pixKey.getRequired("pixKey")

            /**
             * Type of PIX key being used
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun pixKeyType(): PixAccountInfo.PixKeyType = pixKeyType.getRequired("pixKeyType")

            /**
             * Tax ID of the account holder
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun taxId(): String = taxId.getRequired("taxId")

            /**
             * Returns the raw JSON value of [accountType].
             *
             * Unlike [accountType], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("accountType")
            @ExcludeMissing
            fun _accountType(): JsonField<PaymentAccountOrWalletInfo.AccountType> = accountType

            /**
             * Returns the raw JSON value of [pixKey].
             *
             * Unlike [pixKey], this method doesn't throw if the JSON field has an unexpected type.
             */
            @JsonProperty("pixKey") @ExcludeMissing fun _pixKey(): JsonField<String> = pixKey

            /**
             * Returns the raw JSON value of [pixKeyType].
             *
             * Unlike [pixKeyType], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("pixKeyType")
            @ExcludeMissing
            fun _pixKeyType(): JsonField<PixAccountInfo.PixKeyType> = pixKeyType

            /**
             * Returns the raw JSON value of [taxId].
             *
             * Unlike [taxId], this method doesn't throw if the JSON field has an unexpected type.
             */
            @JsonProperty("taxId") @ExcludeMissing fun _taxId(): JsonField<String> = taxId

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
                 * [PaymentPixAccountInfo].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountType()
                 * .pixKey()
                 * .pixKeyType()
                 * .taxId()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [PaymentPixAccountInfo]. */
            class Builder internal constructor() {

                private var accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>? = null
                private var pixKey: JsonField<String>? = null
                private var pixKeyType: JsonField<PixAccountInfo.PixKeyType>? = null
                private var taxId: JsonField<String>? = null
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(paymentPixAccountInfo: PaymentPixAccountInfo) = apply {
                    accountType = paymentPixAccountInfo.accountType
                    pixKey = paymentPixAccountInfo.pixKey
                    pixKeyType = paymentPixAccountInfo.pixKeyType
                    taxId = paymentPixAccountInfo.taxId
                    additionalProperties = paymentPixAccountInfo.additionalProperties.toMutableMap()
                }

                /** Type of account or wallet information */
                fun accountType(accountType: PaymentAccountOrWalletInfo.AccountType) =
                    accountType(JsonField.of(accountType))

                /**
                 * Sets [Builder.accountType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.accountType] with a well-typed
                 * [PaymentAccountOrWalletInfo.AccountType] value instead. This method is primarily
                 * for setting the field to an undocumented or not yet supported value.
                 */
                fun accountType(accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>) =
                    apply {
                        this.accountType = accountType
                    }

                /** PIX key for Brazilian instant payments */
                fun pixKey(pixKey: String) = pixKey(JsonField.of(pixKey))

                /**
                 * Sets [Builder.pixKey] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.pixKey] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun pixKey(pixKey: JsonField<String>) = apply { this.pixKey = pixKey }

                /** Type of PIX key being used */
                fun pixKeyType(pixKeyType: PixAccountInfo.PixKeyType) =
                    pixKeyType(JsonField.of(pixKeyType))

                /**
                 * Sets [Builder.pixKeyType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.pixKeyType] with a well-typed
                 * [PixAccountInfo.PixKeyType] value instead. This method is primarily for setting
                 * the field to an undocumented or not yet supported value.
                 */
                fun pixKeyType(pixKeyType: JsonField<PixAccountInfo.PixKeyType>) = apply {
                    this.pixKeyType = pixKeyType
                }

                /** Tax ID of the account holder */
                fun taxId(taxId: String) = taxId(JsonField.of(taxId))

                /**
                 * Sets [Builder.taxId] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.taxId] with a well-typed [String] value instead.
                 * This method is primarily for setting the field to an undocumented or not yet
                 * supported value.
                 */
                fun taxId(taxId: JsonField<String>) = apply { this.taxId = taxId }

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
                 * Returns an immutable instance of [PaymentPixAccountInfo].
                 *
                 * Further updates to this [Builder] will not mutate the returned instance.
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountType()
                 * .pixKey()
                 * .pixKeyType()
                 * .taxId()
                 * ```
                 *
                 * @throws IllegalStateException if any required field is unset.
                 */
                fun build(): PaymentPixAccountInfo =
                    PaymentPixAccountInfo(
                        checkRequired("accountType", accountType),
                        checkRequired("pixKey", pixKey),
                        checkRequired("pixKeyType", pixKeyType),
                        checkRequired("taxId", taxId),
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): PaymentPixAccountInfo = apply {
                if (validated) {
                    return@apply
                }

                accountType().validate()
                pixKey()
                pixKeyType().validate()
                taxId()
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
                (accountType.asKnown()?.validity() ?: 0) +
                    (if (pixKey.asKnown() == null) 0 else 1) +
                    (pixKeyType.asKnown()?.validity() ?: 0) +
                    (if (taxId.asKnown() == null) 0 else 1)

            override fun equals(other: Any?): Boolean {
                if (this === other) {
                    return true
                }

                return other is PaymentPixAccountInfo &&
                    accountType == other.accountType &&
                    pixKey == other.pixKey &&
                    pixKeyType == other.pixKeyType &&
                    taxId == other.taxId &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(accountType, pixKey, pixKeyType, taxId, additionalProperties)
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "PaymentPixAccountInfo{accountType=$accountType, pixKey=$pixKey, pixKeyType=$pixKeyType, taxId=$taxId, additionalProperties=$additionalProperties}"
        }

        class PaymentIbanAccountInfo
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>,
            private val iban: JsonField<String>,
            private val swiftBic: JsonField<String>,
            private val reference: JsonField<String>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("accountType")
                @ExcludeMissing
                accountType: JsonField<PaymentAccountOrWalletInfo.AccountType> = JsonMissing.of(),
                @JsonProperty("iban") @ExcludeMissing iban: JsonField<String> = JsonMissing.of(),
                @JsonProperty("swiftBic")
                @ExcludeMissing
                swiftBic: JsonField<String> = JsonMissing.of(),
                @JsonProperty("reference")
                @ExcludeMissing
                reference: JsonField<String> = JsonMissing.of(),
            ) : this(accountType, iban, swiftBic, reference, mutableMapOf())

            fun toPaymentAccountOrWalletInfo(): PaymentAccountOrWalletInfo =
                PaymentAccountOrWalletInfo.builder().accountType(accountType).build()

            fun toIbanAccountInfo(): IbanAccountInfo =
                IbanAccountInfo.builder()
                    .accountType(accountType)
                    .iban(iban)
                    .swiftBic(swiftBic)
                    .build()

            /**
             * Type of account or wallet information
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun accountType(): PaymentAccountOrWalletInfo.AccountType =
                accountType.getRequired("accountType")

            /**
             * International Bank Account Number
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun iban(): String = iban.getRequired("iban")

            /**
             * SWIFT/BIC code (8 or 11 characters)
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun swiftBic(): String = swiftBic.getRequired("swiftBic")

            /**
             * Unique reference code that must be included with the payment to properly credit it
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun reference(): String = reference.getRequired("reference")

            /**
             * Returns the raw JSON value of [accountType].
             *
             * Unlike [accountType], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("accountType")
            @ExcludeMissing
            fun _accountType(): JsonField<PaymentAccountOrWalletInfo.AccountType> = accountType

            /**
             * Returns the raw JSON value of [iban].
             *
             * Unlike [iban], this method doesn't throw if the JSON field has an unexpected type.
             */
            @JsonProperty("iban") @ExcludeMissing fun _iban(): JsonField<String> = iban

            /**
             * Returns the raw JSON value of [swiftBic].
             *
             * Unlike [swiftBic], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("swiftBic") @ExcludeMissing fun _swiftBic(): JsonField<String> = swiftBic

            /**
             * Returns the raw JSON value of [reference].
             *
             * Unlike [reference], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("reference")
            @ExcludeMissing
            fun _reference(): JsonField<String> = reference

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
                 * [PaymentIbanAccountInfo].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountType()
                 * .iban()
                 * .swiftBic()
                 * .reference()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [PaymentIbanAccountInfo]. */
            class Builder internal constructor() {

                private var accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>? = null
                private var iban: JsonField<String>? = null
                private var swiftBic: JsonField<String>? = null
                private var reference: JsonField<String>? = null
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(paymentIbanAccountInfo: PaymentIbanAccountInfo) = apply {
                    accountType = paymentIbanAccountInfo.accountType
                    iban = paymentIbanAccountInfo.iban
                    swiftBic = paymentIbanAccountInfo.swiftBic
                    reference = paymentIbanAccountInfo.reference
                    additionalProperties =
                        paymentIbanAccountInfo.additionalProperties.toMutableMap()
                }

                /** Type of account or wallet information */
                fun accountType(accountType: PaymentAccountOrWalletInfo.AccountType) =
                    accountType(JsonField.of(accountType))

                /**
                 * Sets [Builder.accountType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.accountType] with a well-typed
                 * [PaymentAccountOrWalletInfo.AccountType] value instead. This method is primarily
                 * for setting the field to an undocumented or not yet supported value.
                 */
                fun accountType(accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>) =
                    apply {
                        this.accountType = accountType
                    }

                /** International Bank Account Number */
                fun iban(iban: String) = iban(JsonField.of(iban))

                /**
                 * Sets [Builder.iban] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.iban] with a well-typed [String] value instead.
                 * This method is primarily for setting the field to an undocumented or not yet
                 * supported value.
                 */
                fun iban(iban: JsonField<String>) = apply { this.iban = iban }

                /** SWIFT/BIC code (8 or 11 characters) */
                fun swiftBic(swiftBic: String) = swiftBic(JsonField.of(swiftBic))

                /**
                 * Sets [Builder.swiftBic] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.swiftBic] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun swiftBic(swiftBic: JsonField<String>) = apply { this.swiftBic = swiftBic }

                /**
                 * Unique reference code that must be included with the payment to properly credit
                 * it
                 */
                fun reference(reference: String) = reference(JsonField.of(reference))

                /**
                 * Sets [Builder.reference] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.reference] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun reference(reference: JsonField<String>) = apply { this.reference = reference }

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
                 * Returns an immutable instance of [PaymentIbanAccountInfo].
                 *
                 * Further updates to this [Builder] will not mutate the returned instance.
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountType()
                 * .iban()
                 * .swiftBic()
                 * .reference()
                 * ```
                 *
                 * @throws IllegalStateException if any required field is unset.
                 */
                fun build(): PaymentIbanAccountInfo =
                    PaymentIbanAccountInfo(
                        checkRequired("accountType", accountType),
                        checkRequired("iban", iban),
                        checkRequired("swiftBic", swiftBic),
                        checkRequired("reference", reference),
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): PaymentIbanAccountInfo = apply {
                if (validated) {
                    return@apply
                }

                accountType().validate()
                iban()
                swiftBic()
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
            internal fun validity(): Int =
                (accountType.asKnown()?.validity() ?: 0) +
                    (if (iban.asKnown() == null) 0 else 1) +
                    (if (swiftBic.asKnown() == null) 0 else 1) +
                    (if (reference.asKnown() == null) 0 else 1)

            override fun equals(other: Any?): Boolean {
                if (this === other) {
                    return true
                }

                return other is PaymentIbanAccountInfo &&
                    accountType == other.accountType &&
                    iban == other.iban &&
                    swiftBic == other.swiftBic &&
                    reference == other.reference &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(accountType, iban, swiftBic, reference, additionalProperties)
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "PaymentIbanAccountInfo{accountType=$accountType, iban=$iban, swiftBic=$swiftBic, reference=$reference, additionalProperties=$additionalProperties}"
        }

        class PaymentFboAccountInfo
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>,
            private val paymentMethod: JsonField<PaymentMethod>,
            private val paymentUrl: JsonField<String>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("accountType")
                @ExcludeMissing
                accountType: JsonField<PaymentAccountOrWalletInfo.AccountType> = JsonMissing.of(),
                @JsonProperty("paymentMethod")
                @ExcludeMissing
                paymentMethod: JsonField<PaymentMethod> = JsonMissing.of(),
                @JsonProperty("paymentUrl")
                @ExcludeMissing
                paymentUrl: JsonField<String> = JsonMissing.of(),
            ) : this(accountType, paymentMethod, paymentUrl, mutableMapOf())

            fun toPaymentAccountOrWalletInfo(): PaymentAccountOrWalletInfo =
                PaymentAccountOrWalletInfo.builder().accountType(accountType).build()

            /**
             * Type of account or wallet information
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun accountType(): PaymentAccountOrWalletInfo.AccountType =
                accountType.getRequired("accountType")

            /**
             * The HTTP method to use for confirming the payment
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun paymentMethod(): PaymentMethod = paymentMethod.getRequired("paymentMethod")

            /**
             * The URL to make a request to in order to confirm payment
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun paymentUrl(): String = paymentUrl.getRequired("paymentUrl")

            /**
             * Returns the raw JSON value of [accountType].
             *
             * Unlike [accountType], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("accountType")
            @ExcludeMissing
            fun _accountType(): JsonField<PaymentAccountOrWalletInfo.AccountType> = accountType

            /**
             * Returns the raw JSON value of [paymentMethod].
             *
             * Unlike [paymentMethod], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("paymentMethod")
            @ExcludeMissing
            fun _paymentMethod(): JsonField<PaymentMethod> = paymentMethod

            /**
             * Returns the raw JSON value of [paymentUrl].
             *
             * Unlike [paymentUrl], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("paymentUrl")
            @ExcludeMissing
            fun _paymentUrl(): JsonField<String> = paymentUrl

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
                 * [PaymentFboAccountInfo].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountType()
                 * .paymentMethod()
                 * .paymentUrl()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [PaymentFboAccountInfo]. */
            class Builder internal constructor() {

                private var accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>? = null
                private var paymentMethod: JsonField<PaymentMethod>? = null
                private var paymentUrl: JsonField<String>? = null
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(paymentFboAccountInfo: PaymentFboAccountInfo) = apply {
                    accountType = paymentFboAccountInfo.accountType
                    paymentMethod = paymentFboAccountInfo.paymentMethod
                    paymentUrl = paymentFboAccountInfo.paymentUrl
                    additionalProperties = paymentFboAccountInfo.additionalProperties.toMutableMap()
                }

                /** Type of account or wallet information */
                fun accountType(accountType: PaymentAccountOrWalletInfo.AccountType) =
                    accountType(JsonField.of(accountType))

                /**
                 * Sets [Builder.accountType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.accountType] with a well-typed
                 * [PaymentAccountOrWalletInfo.AccountType] value instead. This method is primarily
                 * for setting the field to an undocumented or not yet supported value.
                 */
                fun accountType(accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>) =
                    apply {
                        this.accountType = accountType
                    }

                /** The HTTP method to use for confirming the payment */
                fun paymentMethod(paymentMethod: PaymentMethod) =
                    paymentMethod(JsonField.of(paymentMethod))

                /**
                 * Sets [Builder.paymentMethod] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.paymentMethod] with a well-typed [PaymentMethod]
                 * value instead. This method is primarily for setting the field to an undocumented
                 * or not yet supported value.
                 */
                fun paymentMethod(paymentMethod: JsonField<PaymentMethod>) = apply {
                    this.paymentMethod = paymentMethod
                }

                /** The URL to make a request to in order to confirm payment */
                fun paymentUrl(paymentUrl: String) = paymentUrl(JsonField.of(paymentUrl))

                /**
                 * Sets [Builder.paymentUrl] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.paymentUrl] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun paymentUrl(paymentUrl: JsonField<String>) = apply {
                    this.paymentUrl = paymentUrl
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
                 * Returns an immutable instance of [PaymentFboAccountInfo].
                 *
                 * Further updates to this [Builder] will not mutate the returned instance.
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountType()
                 * .paymentMethod()
                 * .paymentUrl()
                 * ```
                 *
                 * @throws IllegalStateException if any required field is unset.
                 */
                fun build(): PaymentFboAccountInfo =
                    PaymentFboAccountInfo(
                        checkRequired("accountType", accountType),
                        checkRequired("paymentMethod", paymentMethod),
                        checkRequired("paymentUrl", paymentUrl),
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): PaymentFboAccountInfo = apply {
                if (validated) {
                    return@apply
                }

                accountType().validate()
                paymentMethod().validate()
                paymentUrl()
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
                (accountType.asKnown()?.validity() ?: 0) +
                    (paymentMethod.asKnown()?.validity() ?: 0) +
                    (if (paymentUrl.asKnown() == null) 0 else 1)

            /** The HTTP method to use for confirming the payment */
            class PaymentMethod
            @JsonCreator
            private constructor(private val value: JsonField<String>) : Enum {

                /**
                 * Returns this class instance's raw value.
                 *
                 * This is usually only useful if this instance was deserialized from data that
                 * doesn't match any known member, and you want to know that value. For example, if
                 * the SDK is on an older version than the API, then the API may respond with new
                 * members that the SDK is unaware of.
                 */
                @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

                companion object {

                    val POST = of("POST")

                    val GET = of("GET")

                    fun of(value: String) = PaymentMethod(JsonField.of(value))
                }

                /** An enum containing [PaymentMethod]'s known values. */
                enum class Known {
                    POST,
                    GET,
                }

                /**
                 * An enum containing [PaymentMethod]'s known values, as well as an [_UNKNOWN]
                 * member.
                 *
                 * An instance of [PaymentMethod] can contain an unknown value in a couple of cases:
                 * - It was deserialized from data that doesn't match any known member. For example,
                 *   if the SDK is on an older version than the API, then the API may respond with
                 *   new members that the SDK is unaware of.
                 * - It was constructed with an arbitrary value using the [of] method.
                 */
                enum class Value {
                    POST,
                    GET,
                    /**
                     * An enum member indicating that [PaymentMethod] was instantiated with an
                     * unknown value.
                     */
                    _UNKNOWN,
                }

                /**
                 * Returns an enum member corresponding to this class instance's value, or
                 * [Value._UNKNOWN] if the class was instantiated with an unknown value.
                 *
                 * Use the [known] method instead if you're certain the value is always known or if
                 * you want to throw for the unknown case.
                 */
                fun value(): Value =
                    when (this) {
                        POST -> Value.POST
                        GET -> Value.GET
                        else -> Value._UNKNOWN
                    }

                /**
                 * Returns an enum member corresponding to this class instance's value.
                 *
                 * Use the [value] method instead if you're uncertain the value is always known and
                 * don't want to throw for the unknown case.
                 *
                 * @throws GridInvalidDataException if this class instance's value is a not a known
                 *   member.
                 */
                fun known(): Known =
                    when (this) {
                        POST -> Known.POST
                        GET -> Known.GET
                        else -> throw GridInvalidDataException("Unknown PaymentMethod: $value")
                    }

                /**
                 * Returns this class instance's primitive wire representation.
                 *
                 * This differs from the [toString] method because that method is primarily for
                 * debugging and generally doesn't throw.
                 *
                 * @throws GridInvalidDataException if this class instance's value does not have the
                 *   expected primitive type.
                 */
                fun asString(): String =
                    _value().asString() ?: throw GridInvalidDataException("Value is not a String")

                private var validated: Boolean = false

                fun validate(): PaymentMethod = apply {
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

                    return other is PaymentMethod && value == other.value
                }

                override fun hashCode() = value.hashCode()

                override fun toString() = value.toString()
            }

            override fun equals(other: Any?): Boolean {
                if (this === other) {
                    return true
                }

                return other is PaymentFboAccountInfo &&
                    accountType == other.accountType &&
                    paymentMethod == other.paymentMethod &&
                    paymentUrl == other.paymentUrl &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(accountType, paymentMethod, paymentUrl, additionalProperties)
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "PaymentFboAccountInfo{accountType=$accountType, paymentMethod=$paymentMethod, paymentUrl=$paymentUrl, additionalProperties=$additionalProperties}"
        }

        class PaymentUpiAccountInfo
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>,
            private val vpa: JsonField<String>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("accountType")
                @ExcludeMissing
                accountType: JsonField<PaymentAccountOrWalletInfo.AccountType> = JsonMissing.of(),
                @JsonProperty("vpa") @ExcludeMissing vpa: JsonField<String> = JsonMissing.of(),
            ) : this(accountType, vpa, mutableMapOf())

            fun toPaymentAccountOrWalletInfo(): PaymentAccountOrWalletInfo =
                PaymentAccountOrWalletInfo.builder().accountType(accountType).build()

            fun toUpiAccountInfo(): UpiAccountInfo =
                UpiAccountInfo.builder().accountType(accountType).vpa(vpa).build()

            /**
             * Type of account or wallet information
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun accountType(): PaymentAccountOrWalletInfo.AccountType =
                accountType.getRequired("accountType")

            /**
             * Virtual Payment Address for UPI payments
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun vpa(): String = vpa.getRequired("vpa")

            /**
             * Returns the raw JSON value of [accountType].
             *
             * Unlike [accountType], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("accountType")
            @ExcludeMissing
            fun _accountType(): JsonField<PaymentAccountOrWalletInfo.AccountType> = accountType

            /**
             * Returns the raw JSON value of [vpa].
             *
             * Unlike [vpa], this method doesn't throw if the JSON field has an unexpected type.
             */
            @JsonProperty("vpa") @ExcludeMissing fun _vpa(): JsonField<String> = vpa

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
                 * [PaymentUpiAccountInfo].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountType()
                 * .vpa()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [PaymentUpiAccountInfo]. */
            class Builder internal constructor() {

                private var accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>? = null
                private var vpa: JsonField<String>? = null
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(paymentUpiAccountInfo: PaymentUpiAccountInfo) = apply {
                    accountType = paymentUpiAccountInfo.accountType
                    vpa = paymentUpiAccountInfo.vpa
                    additionalProperties = paymentUpiAccountInfo.additionalProperties.toMutableMap()
                }

                /** Type of account or wallet information */
                fun accountType(accountType: PaymentAccountOrWalletInfo.AccountType) =
                    accountType(JsonField.of(accountType))

                /**
                 * Sets [Builder.accountType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.accountType] with a well-typed
                 * [PaymentAccountOrWalletInfo.AccountType] value instead. This method is primarily
                 * for setting the field to an undocumented or not yet supported value.
                 */
                fun accountType(accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>) =
                    apply {
                        this.accountType = accountType
                    }

                /** Virtual Payment Address for UPI payments */
                fun vpa(vpa: String) = vpa(JsonField.of(vpa))

                /**
                 * Sets [Builder.vpa] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.vpa] with a well-typed [String] value instead.
                 * This method is primarily for setting the field to an undocumented or not yet
                 * supported value.
                 */
                fun vpa(vpa: JsonField<String>) = apply { this.vpa = vpa }

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
                 * Returns an immutable instance of [PaymentUpiAccountInfo].
                 *
                 * Further updates to this [Builder] will not mutate the returned instance.
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountType()
                 * .vpa()
                 * ```
                 *
                 * @throws IllegalStateException if any required field is unset.
                 */
                fun build(): PaymentUpiAccountInfo =
                    PaymentUpiAccountInfo(
                        checkRequired("accountType", accountType),
                        checkRequired("vpa", vpa),
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): PaymentUpiAccountInfo = apply {
                if (validated) {
                    return@apply
                }

                accountType().validate()
                vpa()
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
                (accountType.asKnown()?.validity() ?: 0) + (if (vpa.asKnown() == null) 0 else 1)

            override fun equals(other: Any?): Boolean {
                if (this === other) {
                    return true
                }

                return other is PaymentUpiAccountInfo &&
                    accountType == other.accountType &&
                    vpa == other.vpa &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(accountType, vpa, additionalProperties)
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "PaymentUpiAccountInfo{accountType=$accountType, vpa=$vpa, additionalProperties=$additionalProperties}"
        }

        class PaymentSparkWalletInfo
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>,
            private val address: JsonField<String>,
            private val assetType: JsonField<AssetType>,
            private val invoice: JsonField<String>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("accountType")
                @ExcludeMissing
                accountType: JsonField<PaymentAccountOrWalletInfo.AccountType> = JsonMissing.of(),
                @JsonProperty("address")
                @ExcludeMissing
                address: JsonField<String> = JsonMissing.of(),
                @JsonProperty("assetType")
                @ExcludeMissing
                assetType: JsonField<AssetType> = JsonMissing.of(),
                @JsonProperty("invoice")
                @ExcludeMissing
                invoice: JsonField<String> = JsonMissing.of(),
            ) : this(accountType, address, assetType, invoice, mutableMapOf())

            fun toPaymentAccountOrWalletInfo(): PaymentAccountOrWalletInfo =
                PaymentAccountOrWalletInfo.builder().accountType(accountType).build()

            fun toSparkWalletInfo(): SparkWalletInfo =
                SparkWalletInfo.builder().accountType(accountType).address(address).build()

            /**
             * Type of account or wallet information
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun accountType(): PaymentAccountOrWalletInfo.AccountType =
                accountType.getRequired("accountType")

            /**
             * Spark wallet address
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun address(): String = address.getRequired("address")

            /**
             * Type of asset
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun assetType(): AssetType = assetType.getRequired("assetType")

            /**
             * Invoice for the payment
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun invoice(): String? = invoice.getNullable("invoice")

            /**
             * Returns the raw JSON value of [accountType].
             *
             * Unlike [accountType], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("accountType")
            @ExcludeMissing
            fun _accountType(): JsonField<PaymentAccountOrWalletInfo.AccountType> = accountType

            /**
             * Returns the raw JSON value of [address].
             *
             * Unlike [address], this method doesn't throw if the JSON field has an unexpected type.
             */
            @JsonProperty("address") @ExcludeMissing fun _address(): JsonField<String> = address

            /**
             * Returns the raw JSON value of [assetType].
             *
             * Unlike [assetType], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("assetType")
            @ExcludeMissing
            fun _assetType(): JsonField<AssetType> = assetType

            /**
             * Returns the raw JSON value of [invoice].
             *
             * Unlike [invoice], this method doesn't throw if the JSON field has an unexpected type.
             */
            @JsonProperty("invoice") @ExcludeMissing fun _invoice(): JsonField<String> = invoice

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
                 * [PaymentSparkWalletInfo].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountType()
                 * .address()
                 * .assetType()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [PaymentSparkWalletInfo]. */
            class Builder internal constructor() {

                private var accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>? = null
                private var address: JsonField<String>? = null
                private var assetType: JsonField<AssetType>? = null
                private var invoice: JsonField<String> = JsonMissing.of()
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(paymentSparkWalletInfo: PaymentSparkWalletInfo) = apply {
                    accountType = paymentSparkWalletInfo.accountType
                    address = paymentSparkWalletInfo.address
                    assetType = paymentSparkWalletInfo.assetType
                    invoice = paymentSparkWalletInfo.invoice
                    additionalProperties =
                        paymentSparkWalletInfo.additionalProperties.toMutableMap()
                }

                /** Type of account or wallet information */
                fun accountType(accountType: PaymentAccountOrWalletInfo.AccountType) =
                    accountType(JsonField.of(accountType))

                /**
                 * Sets [Builder.accountType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.accountType] with a well-typed
                 * [PaymentAccountOrWalletInfo.AccountType] value instead. This method is primarily
                 * for setting the field to an undocumented or not yet supported value.
                 */
                fun accountType(accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>) =
                    apply {
                        this.accountType = accountType
                    }

                /** Spark wallet address */
                fun address(address: String) = address(JsonField.of(address))

                /**
                 * Sets [Builder.address] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.address] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun address(address: JsonField<String>) = apply { this.address = address }

                /** Type of asset */
                fun assetType(assetType: AssetType) = assetType(JsonField.of(assetType))

                /**
                 * Sets [Builder.assetType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.assetType] with a well-typed [AssetType] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun assetType(assetType: JsonField<AssetType>) = apply {
                    this.assetType = assetType
                }

                /** Invoice for the payment */
                fun invoice(invoice: String) = invoice(JsonField.of(invoice))

                /**
                 * Sets [Builder.invoice] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.invoice] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun invoice(invoice: JsonField<String>) = apply { this.invoice = invoice }

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
                 * Returns an immutable instance of [PaymentSparkWalletInfo].
                 *
                 * Further updates to this [Builder] will not mutate the returned instance.
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountType()
                 * .address()
                 * .assetType()
                 * ```
                 *
                 * @throws IllegalStateException if any required field is unset.
                 */
                fun build(): PaymentSparkWalletInfo =
                    PaymentSparkWalletInfo(
                        checkRequired("accountType", accountType),
                        checkRequired("address", address),
                        checkRequired("assetType", assetType),
                        invoice,
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): PaymentSparkWalletInfo = apply {
                if (validated) {
                    return@apply
                }

                accountType().validate()
                address()
                assetType().validate()
                invoice()
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
                (accountType.asKnown()?.validity() ?: 0) +
                    (if (address.asKnown() == null) 0 else 1) +
                    (assetType.asKnown()?.validity() ?: 0) +
                    (if (invoice.asKnown() == null) 0 else 1)

            /** Type of asset */
            class AssetType @JsonCreator private constructor(private val value: JsonField<String>) :
                Enum {

                /**
                 * Returns this class instance's raw value.
                 *
                 * This is usually only useful if this instance was deserialized from data that
                 * doesn't match any known member, and you want to know that value. For example, if
                 * the SDK is on an older version than the API, then the API may respond with new
                 * members that the SDK is unaware of.
                 */
                @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

                companion object {

                    val BTC = of("BTC")

                    val USDB = of("USDB")

                    fun of(value: String) = AssetType(JsonField.of(value))
                }

                /** An enum containing [AssetType]'s known values. */
                enum class Known {
                    BTC,
                    USDB,
                }

                /**
                 * An enum containing [AssetType]'s known values, as well as an [_UNKNOWN] member.
                 *
                 * An instance of [AssetType] can contain an unknown value in a couple of cases:
                 * - It was deserialized from data that doesn't match any known member. For example,
                 *   if the SDK is on an older version than the API, then the API may respond with
                 *   new members that the SDK is unaware of.
                 * - It was constructed with an arbitrary value using the [of] method.
                 */
                enum class Value {
                    BTC,
                    USDB,
                    /**
                     * An enum member indicating that [AssetType] was instantiated with an unknown
                     * value.
                     */
                    _UNKNOWN,
                }

                /**
                 * Returns an enum member corresponding to this class instance's value, or
                 * [Value._UNKNOWN] if the class was instantiated with an unknown value.
                 *
                 * Use the [known] method instead if you're certain the value is always known or if
                 * you want to throw for the unknown case.
                 */
                fun value(): Value =
                    when (this) {
                        BTC -> Value.BTC
                        USDB -> Value.USDB
                        else -> Value._UNKNOWN
                    }

                /**
                 * Returns an enum member corresponding to this class instance's value.
                 *
                 * Use the [value] method instead if you're uncertain the value is always known and
                 * don't want to throw for the unknown case.
                 *
                 * @throws GridInvalidDataException if this class instance's value is a not a known
                 *   member.
                 */
                fun known(): Known =
                    when (this) {
                        BTC -> Known.BTC
                        USDB -> Known.USDB
                        else -> throw GridInvalidDataException("Unknown AssetType: $value")
                    }

                /**
                 * Returns this class instance's primitive wire representation.
                 *
                 * This differs from the [toString] method because that method is primarily for
                 * debugging and generally doesn't throw.
                 *
                 * @throws GridInvalidDataException if this class instance's value does not have the
                 *   expected primitive type.
                 */
                fun asString(): String =
                    _value().asString() ?: throw GridInvalidDataException("Value is not a String")

                private var validated: Boolean = false

                fun validate(): AssetType = apply {
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

                    return other is AssetType && value == other.value
                }

                override fun hashCode() = value.hashCode()

                override fun toString() = value.toString()
            }

            override fun equals(other: Any?): Boolean {
                if (this === other) {
                    return true
                }

                return other is PaymentSparkWalletInfo &&
                    accountType == other.accountType &&
                    address == other.address &&
                    assetType == other.assetType &&
                    invoice == other.invoice &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(accountType, address, assetType, invoice, additionalProperties)
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "PaymentSparkWalletInfo{accountType=$accountType, address=$address, assetType=$assetType, invoice=$invoice, additionalProperties=$additionalProperties}"
        }

        class PaymentLightningInvoiceInfo
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>,
            private val invoice: JsonField<String>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("accountType")
                @ExcludeMissing
                accountType: JsonField<PaymentAccountOrWalletInfo.AccountType> = JsonMissing.of(),
                @JsonProperty("invoice")
                @ExcludeMissing
                invoice: JsonField<String> = JsonMissing.of(),
            ) : this(accountType, invoice, mutableMapOf())

            fun toPaymentAccountOrWalletInfo(): PaymentAccountOrWalletInfo =
                PaymentAccountOrWalletInfo.builder().accountType(accountType).build()

            /**
             * Type of account or wallet information
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun accountType(): PaymentAccountOrWalletInfo.AccountType =
                accountType.getRequired("accountType")

            /**
             * Invoice for the payment
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun invoice(): String = invoice.getRequired("invoice")

            /**
             * Returns the raw JSON value of [accountType].
             *
             * Unlike [accountType], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("accountType")
            @ExcludeMissing
            fun _accountType(): JsonField<PaymentAccountOrWalletInfo.AccountType> = accountType

            /**
             * Returns the raw JSON value of [invoice].
             *
             * Unlike [invoice], this method doesn't throw if the JSON field has an unexpected type.
             */
            @JsonProperty("invoice") @ExcludeMissing fun _invoice(): JsonField<String> = invoice

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
                 * [PaymentLightningInvoiceInfo].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountType()
                 * .invoice()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [PaymentLightningInvoiceInfo]. */
            class Builder internal constructor() {

                private var accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>? = null
                private var invoice: JsonField<String>? = null
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(paymentLightningInvoiceInfo: PaymentLightningInvoiceInfo) =
                    apply {
                        accountType = paymentLightningInvoiceInfo.accountType
                        invoice = paymentLightningInvoiceInfo.invoice
                        additionalProperties =
                            paymentLightningInvoiceInfo.additionalProperties.toMutableMap()
                    }

                /** Type of account or wallet information */
                fun accountType(accountType: PaymentAccountOrWalletInfo.AccountType) =
                    accountType(JsonField.of(accountType))

                /**
                 * Sets [Builder.accountType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.accountType] with a well-typed
                 * [PaymentAccountOrWalletInfo.AccountType] value instead. This method is primarily
                 * for setting the field to an undocumented or not yet supported value.
                 */
                fun accountType(accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>) =
                    apply {
                        this.accountType = accountType
                    }

                /** Invoice for the payment */
                fun invoice(invoice: String) = invoice(JsonField.of(invoice))

                /**
                 * Sets [Builder.invoice] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.invoice] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun invoice(invoice: JsonField<String>) = apply { this.invoice = invoice }

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
                 * Returns an immutable instance of [PaymentLightningInvoiceInfo].
                 *
                 * Further updates to this [Builder] will not mutate the returned instance.
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountType()
                 * .invoice()
                 * ```
                 *
                 * @throws IllegalStateException if any required field is unset.
                 */
                fun build(): PaymentLightningInvoiceInfo =
                    PaymentLightningInvoiceInfo(
                        checkRequired("accountType", accountType),
                        checkRequired("invoice", invoice),
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): PaymentLightningInvoiceInfo = apply {
                if (validated) {
                    return@apply
                }

                accountType().validate()
                invoice()
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
                (accountType.asKnown()?.validity() ?: 0) + (if (invoice.asKnown() == null) 0 else 1)

            class AccountType
            @JsonCreator
            private constructor(private val value: JsonField<String>) : Enum {

                /**
                 * Returns this class instance's raw value.
                 *
                 * This is usually only useful if this instance was deserialized from data that
                 * doesn't match any known member, and you want to know that value. For example, if
                 * the SDK is on an older version than the API, then the API may respond with new
                 * members that the SDK is unaware of.
                 */
                @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

                companion object {

                    val LIGHTNING = of("LIGHTNING")

                    fun of(value: String) = AccountType(JsonField.of(value))
                }

                /** An enum containing [AccountType]'s known values. */
                enum class Known {
                    LIGHTNING
                }

                /**
                 * An enum containing [AccountType]'s known values, as well as an [_UNKNOWN] member.
                 *
                 * An instance of [AccountType] can contain an unknown value in a couple of cases:
                 * - It was deserialized from data that doesn't match any known member. For example,
                 *   if the SDK is on an older version than the API, then the API may respond with
                 *   new members that the SDK is unaware of.
                 * - It was constructed with an arbitrary value using the [of] method.
                 */
                enum class Value {
                    LIGHTNING,
                    /**
                     * An enum member indicating that [AccountType] was instantiated with an unknown
                     * value.
                     */
                    _UNKNOWN,
                }

                /**
                 * Returns an enum member corresponding to this class instance's value, or
                 * [Value._UNKNOWN] if the class was instantiated with an unknown value.
                 *
                 * Use the [known] method instead if you're certain the value is always known or if
                 * you want to throw for the unknown case.
                 */
                fun value(): Value =
                    when (this) {
                        LIGHTNING -> Value.LIGHTNING
                        else -> Value._UNKNOWN
                    }

                /**
                 * Returns an enum member corresponding to this class instance's value.
                 *
                 * Use the [value] method instead if you're uncertain the value is always known and
                 * don't want to throw for the unknown case.
                 *
                 * @throws GridInvalidDataException if this class instance's value is a not a known
                 *   member.
                 */
                fun known(): Known =
                    when (this) {
                        LIGHTNING -> Known.LIGHTNING
                        else -> throw GridInvalidDataException("Unknown AccountType: $value")
                    }

                /**
                 * Returns this class instance's primitive wire representation.
                 *
                 * This differs from the [toString] method because that method is primarily for
                 * debugging and generally doesn't throw.
                 *
                 * @throws GridInvalidDataException if this class instance's value does not have the
                 *   expected primitive type.
                 */
                fun asString(): String =
                    _value().asString() ?: throw GridInvalidDataException("Value is not a String")

                private var validated: Boolean = false

                fun validate(): AccountType = apply {
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

                    return other is AccountType && value == other.value
                }

                override fun hashCode() = value.hashCode()

                override fun toString() = value.toString()
            }

            override fun equals(other: Any?): Boolean {
                if (this === other) {
                    return true
                }

                return other is PaymentLightningInvoiceInfo &&
                    accountType == other.accountType &&
                    invoice == other.invoice &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(accountType, invoice, additionalProperties)
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "PaymentLightningInvoiceInfo{accountType=$accountType, invoice=$invoice, additionalProperties=$additionalProperties}"
        }

        class PaymentSolanaWalletInfo
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>,
            private val address: JsonField<String>,
            private val assetType: JsonField<AssetType>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("accountType")
                @ExcludeMissing
                accountType: JsonField<PaymentAccountOrWalletInfo.AccountType> = JsonMissing.of(),
                @JsonProperty("address")
                @ExcludeMissing
                address: JsonField<String> = JsonMissing.of(),
                @JsonProperty("assetType")
                @ExcludeMissing
                assetType: JsonField<AssetType> = JsonMissing.of(),
            ) : this(accountType, address, assetType, mutableMapOf())

            fun toPaymentAccountOrWalletInfo(): PaymentAccountOrWalletInfo =
                PaymentAccountOrWalletInfo.builder().accountType(accountType).build()

            fun toSolanaWalletInfo(): SolanaWalletInfo =
                SolanaWalletInfo.builder().accountType(accountType).address(address).build()

            /**
             * Type of account or wallet information
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun accountType(): PaymentAccountOrWalletInfo.AccountType =
                accountType.getRequired("accountType")

            /**
             * Solana wallet address
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun address(): String = address.getRequired("address")

            /**
             * Type of asset
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun assetType(): AssetType? = assetType.getNullable("assetType")

            /**
             * Returns the raw JSON value of [accountType].
             *
             * Unlike [accountType], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("accountType")
            @ExcludeMissing
            fun _accountType(): JsonField<PaymentAccountOrWalletInfo.AccountType> = accountType

            /**
             * Returns the raw JSON value of [address].
             *
             * Unlike [address], this method doesn't throw if the JSON field has an unexpected type.
             */
            @JsonProperty("address") @ExcludeMissing fun _address(): JsonField<String> = address

            /**
             * Returns the raw JSON value of [assetType].
             *
             * Unlike [assetType], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("assetType")
            @ExcludeMissing
            fun _assetType(): JsonField<AssetType> = assetType

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
                 * [PaymentSolanaWalletInfo].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountType()
                 * .address()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [PaymentSolanaWalletInfo]. */
            class Builder internal constructor() {

                private var accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>? = null
                private var address: JsonField<String>? = null
                private var assetType: JsonField<AssetType> = JsonMissing.of()
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(paymentSolanaWalletInfo: PaymentSolanaWalletInfo) = apply {
                    accountType = paymentSolanaWalletInfo.accountType
                    address = paymentSolanaWalletInfo.address
                    assetType = paymentSolanaWalletInfo.assetType
                    additionalProperties =
                        paymentSolanaWalletInfo.additionalProperties.toMutableMap()
                }

                /** Type of account or wallet information */
                fun accountType(accountType: PaymentAccountOrWalletInfo.AccountType) =
                    accountType(JsonField.of(accountType))

                /**
                 * Sets [Builder.accountType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.accountType] with a well-typed
                 * [PaymentAccountOrWalletInfo.AccountType] value instead. This method is primarily
                 * for setting the field to an undocumented or not yet supported value.
                 */
                fun accountType(accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>) =
                    apply {
                        this.accountType = accountType
                    }

                /** Solana wallet address */
                fun address(address: String) = address(JsonField.of(address))

                /**
                 * Sets [Builder.address] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.address] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun address(address: JsonField<String>) = apply { this.address = address }

                /** Type of asset */
                fun assetType(assetType: AssetType) = assetType(JsonField.of(assetType))

                /**
                 * Sets [Builder.assetType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.assetType] with a well-typed [AssetType] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun assetType(assetType: JsonField<AssetType>) = apply {
                    this.assetType = assetType
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
                 * Returns an immutable instance of [PaymentSolanaWalletInfo].
                 *
                 * Further updates to this [Builder] will not mutate the returned instance.
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountType()
                 * .address()
                 * ```
                 *
                 * @throws IllegalStateException if any required field is unset.
                 */
                fun build(): PaymentSolanaWalletInfo =
                    PaymentSolanaWalletInfo(
                        checkRequired("accountType", accountType),
                        checkRequired("address", address),
                        assetType,
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): PaymentSolanaWalletInfo = apply {
                if (validated) {
                    return@apply
                }

                accountType().validate()
                address()
                assetType()?.validate()
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
                (accountType.asKnown()?.validity() ?: 0) +
                    (if (address.asKnown() == null) 0 else 1) +
                    (assetType.asKnown()?.validity() ?: 0)

            /** Type of asset */
            class AssetType @JsonCreator private constructor(private val value: JsonField<String>) :
                Enum {

                /**
                 * Returns this class instance's raw value.
                 *
                 * This is usually only useful if this instance was deserialized from data that
                 * doesn't match any known member, and you want to know that value. For example, if
                 * the SDK is on an older version than the API, then the API may respond with new
                 * members that the SDK is unaware of.
                 */
                @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

                companion object {

                    val USDC = of("USDC")

                    val USDT = of("USDT")

                    fun of(value: String) = AssetType(JsonField.of(value))
                }

                /** An enum containing [AssetType]'s known values. */
                enum class Known {
                    USDC,
                    USDT,
                }

                /**
                 * An enum containing [AssetType]'s known values, as well as an [_UNKNOWN] member.
                 *
                 * An instance of [AssetType] can contain an unknown value in a couple of cases:
                 * - It was deserialized from data that doesn't match any known member. For example,
                 *   if the SDK is on an older version than the API, then the API may respond with
                 *   new members that the SDK is unaware of.
                 * - It was constructed with an arbitrary value using the [of] method.
                 */
                enum class Value {
                    USDC,
                    USDT,
                    /**
                     * An enum member indicating that [AssetType] was instantiated with an unknown
                     * value.
                     */
                    _UNKNOWN,
                }

                /**
                 * Returns an enum member corresponding to this class instance's value, or
                 * [Value._UNKNOWN] if the class was instantiated with an unknown value.
                 *
                 * Use the [known] method instead if you're certain the value is always known or if
                 * you want to throw for the unknown case.
                 */
                fun value(): Value =
                    when (this) {
                        USDC -> Value.USDC
                        USDT -> Value.USDT
                        else -> Value._UNKNOWN
                    }

                /**
                 * Returns an enum member corresponding to this class instance's value.
                 *
                 * Use the [value] method instead if you're uncertain the value is always known and
                 * don't want to throw for the unknown case.
                 *
                 * @throws GridInvalidDataException if this class instance's value is a not a known
                 *   member.
                 */
                fun known(): Known =
                    when (this) {
                        USDC -> Known.USDC
                        USDT -> Known.USDT
                        else -> throw GridInvalidDataException("Unknown AssetType: $value")
                    }

                /**
                 * Returns this class instance's primitive wire representation.
                 *
                 * This differs from the [toString] method because that method is primarily for
                 * debugging and generally doesn't throw.
                 *
                 * @throws GridInvalidDataException if this class instance's value does not have the
                 *   expected primitive type.
                 */
                fun asString(): String =
                    _value().asString() ?: throw GridInvalidDataException("Value is not a String")

                private var validated: Boolean = false

                fun validate(): AssetType = apply {
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

                    return other is AssetType && value == other.value
                }

                override fun hashCode() = value.hashCode()

                override fun toString() = value.toString()
            }

            override fun equals(other: Any?): Boolean {
                if (this === other) {
                    return true
                }

                return other is PaymentSolanaWalletInfo &&
                    accountType == other.accountType &&
                    address == other.address &&
                    assetType == other.assetType &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(accountType, address, assetType, additionalProperties)
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "PaymentSolanaWalletInfo{accountType=$accountType, address=$address, assetType=$assetType, additionalProperties=$additionalProperties}"
        }

        class PaymentTronWalletInfo
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>,
            private val address: JsonField<String>,
            private val assetType: JsonField<AssetType>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("accountType")
                @ExcludeMissing
                accountType: JsonField<PaymentAccountOrWalletInfo.AccountType> = JsonMissing.of(),
                @JsonProperty("address")
                @ExcludeMissing
                address: JsonField<String> = JsonMissing.of(),
                @JsonProperty("assetType")
                @ExcludeMissing
                assetType: JsonField<AssetType> = JsonMissing.of(),
            ) : this(accountType, address, assetType, mutableMapOf())

            fun toPaymentAccountOrWalletInfo(): PaymentAccountOrWalletInfo =
                PaymentAccountOrWalletInfo.builder().accountType(accountType).build()

            fun toTronWalletInfo(): TronWalletInfo =
                TronWalletInfo.builder().accountType(accountType).address(address).build()

            /**
             * Type of account or wallet information
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun accountType(): PaymentAccountOrWalletInfo.AccountType =
                accountType.getRequired("accountType")

            /**
             * Tron wallet address
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun address(): String = address.getRequired("address")

            /**
             * Type of asset
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun assetType(): AssetType? = assetType.getNullable("assetType")

            /**
             * Returns the raw JSON value of [accountType].
             *
             * Unlike [accountType], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("accountType")
            @ExcludeMissing
            fun _accountType(): JsonField<PaymentAccountOrWalletInfo.AccountType> = accountType

            /**
             * Returns the raw JSON value of [address].
             *
             * Unlike [address], this method doesn't throw if the JSON field has an unexpected type.
             */
            @JsonProperty("address") @ExcludeMissing fun _address(): JsonField<String> = address

            /**
             * Returns the raw JSON value of [assetType].
             *
             * Unlike [assetType], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("assetType")
            @ExcludeMissing
            fun _assetType(): JsonField<AssetType> = assetType

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
                 * [PaymentTronWalletInfo].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountType()
                 * .address()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [PaymentTronWalletInfo]. */
            class Builder internal constructor() {

                private var accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>? = null
                private var address: JsonField<String>? = null
                private var assetType: JsonField<AssetType> = JsonMissing.of()
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(paymentTronWalletInfo: PaymentTronWalletInfo) = apply {
                    accountType = paymentTronWalletInfo.accountType
                    address = paymentTronWalletInfo.address
                    assetType = paymentTronWalletInfo.assetType
                    additionalProperties = paymentTronWalletInfo.additionalProperties.toMutableMap()
                }

                /** Type of account or wallet information */
                fun accountType(accountType: PaymentAccountOrWalletInfo.AccountType) =
                    accountType(JsonField.of(accountType))

                /**
                 * Sets [Builder.accountType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.accountType] with a well-typed
                 * [PaymentAccountOrWalletInfo.AccountType] value instead. This method is primarily
                 * for setting the field to an undocumented or not yet supported value.
                 */
                fun accountType(accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>) =
                    apply {
                        this.accountType = accountType
                    }

                /** Tron wallet address */
                fun address(address: String) = address(JsonField.of(address))

                /**
                 * Sets [Builder.address] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.address] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun address(address: JsonField<String>) = apply { this.address = address }

                /** Type of asset */
                fun assetType(assetType: AssetType) = assetType(JsonField.of(assetType))

                /**
                 * Sets [Builder.assetType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.assetType] with a well-typed [AssetType] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun assetType(assetType: JsonField<AssetType>) = apply {
                    this.assetType = assetType
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
                 * Returns an immutable instance of [PaymentTronWalletInfo].
                 *
                 * Further updates to this [Builder] will not mutate the returned instance.
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountType()
                 * .address()
                 * ```
                 *
                 * @throws IllegalStateException if any required field is unset.
                 */
                fun build(): PaymentTronWalletInfo =
                    PaymentTronWalletInfo(
                        checkRequired("accountType", accountType),
                        checkRequired("address", address),
                        assetType,
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): PaymentTronWalletInfo = apply {
                if (validated) {
                    return@apply
                }

                accountType().validate()
                address()
                assetType()?.validate()
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
                (accountType.asKnown()?.validity() ?: 0) +
                    (if (address.asKnown() == null) 0 else 1) +
                    (assetType.asKnown()?.validity() ?: 0)

            /** Type of asset */
            class AssetType @JsonCreator private constructor(private val value: JsonField<String>) :
                Enum {

                /**
                 * Returns this class instance's raw value.
                 *
                 * This is usually only useful if this instance was deserialized from data that
                 * doesn't match any known member, and you want to know that value. For example, if
                 * the SDK is on an older version than the API, then the API may respond with new
                 * members that the SDK is unaware of.
                 */
                @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

                companion object {

                    val USDT = of("USDT")

                    fun of(value: String) = AssetType(JsonField.of(value))
                }

                /** An enum containing [AssetType]'s known values. */
                enum class Known {
                    USDT
                }

                /**
                 * An enum containing [AssetType]'s known values, as well as an [_UNKNOWN] member.
                 *
                 * An instance of [AssetType] can contain an unknown value in a couple of cases:
                 * - It was deserialized from data that doesn't match any known member. For example,
                 *   if the SDK is on an older version than the API, then the API may respond with
                 *   new members that the SDK is unaware of.
                 * - It was constructed with an arbitrary value using the [of] method.
                 */
                enum class Value {
                    USDT,
                    /**
                     * An enum member indicating that [AssetType] was instantiated with an unknown
                     * value.
                     */
                    _UNKNOWN,
                }

                /**
                 * Returns an enum member corresponding to this class instance's value, or
                 * [Value._UNKNOWN] if the class was instantiated with an unknown value.
                 *
                 * Use the [known] method instead if you're certain the value is always known or if
                 * you want to throw for the unknown case.
                 */
                fun value(): Value =
                    when (this) {
                        USDT -> Value.USDT
                        else -> Value._UNKNOWN
                    }

                /**
                 * Returns an enum member corresponding to this class instance's value.
                 *
                 * Use the [value] method instead if you're uncertain the value is always known and
                 * don't want to throw for the unknown case.
                 *
                 * @throws GridInvalidDataException if this class instance's value is a not a known
                 *   member.
                 */
                fun known(): Known =
                    when (this) {
                        USDT -> Known.USDT
                        else -> throw GridInvalidDataException("Unknown AssetType: $value")
                    }

                /**
                 * Returns this class instance's primitive wire representation.
                 *
                 * This differs from the [toString] method because that method is primarily for
                 * debugging and generally doesn't throw.
                 *
                 * @throws GridInvalidDataException if this class instance's value does not have the
                 *   expected primitive type.
                 */
                fun asString(): String =
                    _value().asString() ?: throw GridInvalidDataException("Value is not a String")

                private var validated: Boolean = false

                fun validate(): AssetType = apply {
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

                    return other is AssetType && value == other.value
                }

                override fun hashCode() = value.hashCode()

                override fun toString() = value.toString()
            }

            override fun equals(other: Any?): Boolean {
                if (this === other) {
                    return true
                }

                return other is PaymentTronWalletInfo &&
                    accountType == other.accountType &&
                    address == other.address &&
                    assetType == other.assetType &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(accountType, address, assetType, additionalProperties)
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "PaymentTronWalletInfo{accountType=$accountType, address=$address, assetType=$assetType, additionalProperties=$additionalProperties}"
        }

        class PaymentPolygonWalletInfo
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>,
            private val address: JsonField<String>,
            private val assetType: JsonField<AssetType>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("accountType")
                @ExcludeMissing
                accountType: JsonField<PaymentAccountOrWalletInfo.AccountType> = JsonMissing.of(),
                @JsonProperty("address")
                @ExcludeMissing
                address: JsonField<String> = JsonMissing.of(),
                @JsonProperty("assetType")
                @ExcludeMissing
                assetType: JsonField<AssetType> = JsonMissing.of(),
            ) : this(accountType, address, assetType, mutableMapOf())

            fun toPaymentAccountOrWalletInfo(): PaymentAccountOrWalletInfo =
                PaymentAccountOrWalletInfo.builder().accountType(accountType).build()

            fun toPolygonWalletInfo(): PolygonWalletInfo =
                PolygonWalletInfo.builder().accountType(accountType).address(address).build()

            /**
             * Type of account or wallet information
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun accountType(): PaymentAccountOrWalletInfo.AccountType =
                accountType.getRequired("accountType")

            /**
             * Polygon eth wallet address
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun address(): String = address.getRequired("address")

            /**
             * Type of asset
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun assetType(): AssetType? = assetType.getNullable("assetType")

            /**
             * Returns the raw JSON value of [accountType].
             *
             * Unlike [accountType], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("accountType")
            @ExcludeMissing
            fun _accountType(): JsonField<PaymentAccountOrWalletInfo.AccountType> = accountType

            /**
             * Returns the raw JSON value of [address].
             *
             * Unlike [address], this method doesn't throw if the JSON field has an unexpected type.
             */
            @JsonProperty("address") @ExcludeMissing fun _address(): JsonField<String> = address

            /**
             * Returns the raw JSON value of [assetType].
             *
             * Unlike [assetType], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("assetType")
            @ExcludeMissing
            fun _assetType(): JsonField<AssetType> = assetType

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
                 * [PaymentPolygonWalletInfo].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountType()
                 * .address()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [PaymentPolygonWalletInfo]. */
            class Builder internal constructor() {

                private var accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>? = null
                private var address: JsonField<String>? = null
                private var assetType: JsonField<AssetType> = JsonMissing.of()
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(paymentPolygonWalletInfo: PaymentPolygonWalletInfo) = apply {
                    accountType = paymentPolygonWalletInfo.accountType
                    address = paymentPolygonWalletInfo.address
                    assetType = paymentPolygonWalletInfo.assetType
                    additionalProperties =
                        paymentPolygonWalletInfo.additionalProperties.toMutableMap()
                }

                /** Type of account or wallet information */
                fun accountType(accountType: PaymentAccountOrWalletInfo.AccountType) =
                    accountType(JsonField.of(accountType))

                /**
                 * Sets [Builder.accountType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.accountType] with a well-typed
                 * [PaymentAccountOrWalletInfo.AccountType] value instead. This method is primarily
                 * for setting the field to an undocumented or not yet supported value.
                 */
                fun accountType(accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>) =
                    apply {
                        this.accountType = accountType
                    }

                /** Polygon eth wallet address */
                fun address(address: String) = address(JsonField.of(address))

                /**
                 * Sets [Builder.address] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.address] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun address(address: JsonField<String>) = apply { this.address = address }

                /** Type of asset */
                fun assetType(assetType: AssetType) = assetType(JsonField.of(assetType))

                /**
                 * Sets [Builder.assetType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.assetType] with a well-typed [AssetType] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun assetType(assetType: JsonField<AssetType>) = apply {
                    this.assetType = assetType
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
                 * Returns an immutable instance of [PaymentPolygonWalletInfo].
                 *
                 * Further updates to this [Builder] will not mutate the returned instance.
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountType()
                 * .address()
                 * ```
                 *
                 * @throws IllegalStateException if any required field is unset.
                 */
                fun build(): PaymentPolygonWalletInfo =
                    PaymentPolygonWalletInfo(
                        checkRequired("accountType", accountType),
                        checkRequired("address", address),
                        assetType,
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): PaymentPolygonWalletInfo = apply {
                if (validated) {
                    return@apply
                }

                accountType().validate()
                address()
                assetType()?.validate()
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
                (accountType.asKnown()?.validity() ?: 0) +
                    (if (address.asKnown() == null) 0 else 1) +
                    (assetType.asKnown()?.validity() ?: 0)

            /** Type of asset */
            class AssetType @JsonCreator private constructor(private val value: JsonField<String>) :
                Enum {

                /**
                 * Returns this class instance's raw value.
                 *
                 * This is usually only useful if this instance was deserialized from data that
                 * doesn't match any known member, and you want to know that value. For example, if
                 * the SDK is on an older version than the API, then the API may respond with new
                 * members that the SDK is unaware of.
                 */
                @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

                companion object {

                    val USDC = of("USDC")

                    fun of(value: String) = AssetType(JsonField.of(value))
                }

                /** An enum containing [AssetType]'s known values. */
                enum class Known {
                    USDC
                }

                /**
                 * An enum containing [AssetType]'s known values, as well as an [_UNKNOWN] member.
                 *
                 * An instance of [AssetType] can contain an unknown value in a couple of cases:
                 * - It was deserialized from data that doesn't match any known member. For example,
                 *   if the SDK is on an older version than the API, then the API may respond with
                 *   new members that the SDK is unaware of.
                 * - It was constructed with an arbitrary value using the [of] method.
                 */
                enum class Value {
                    USDC,
                    /**
                     * An enum member indicating that [AssetType] was instantiated with an unknown
                     * value.
                     */
                    _UNKNOWN,
                }

                /**
                 * Returns an enum member corresponding to this class instance's value, or
                 * [Value._UNKNOWN] if the class was instantiated with an unknown value.
                 *
                 * Use the [known] method instead if you're certain the value is always known or if
                 * you want to throw for the unknown case.
                 */
                fun value(): Value =
                    when (this) {
                        USDC -> Value.USDC
                        else -> Value._UNKNOWN
                    }

                /**
                 * Returns an enum member corresponding to this class instance's value.
                 *
                 * Use the [value] method instead if you're uncertain the value is always known and
                 * don't want to throw for the unknown case.
                 *
                 * @throws GridInvalidDataException if this class instance's value is a not a known
                 *   member.
                 */
                fun known(): Known =
                    when (this) {
                        USDC -> Known.USDC
                        else -> throw GridInvalidDataException("Unknown AssetType: $value")
                    }

                /**
                 * Returns this class instance's primitive wire representation.
                 *
                 * This differs from the [toString] method because that method is primarily for
                 * debugging and generally doesn't throw.
                 *
                 * @throws GridInvalidDataException if this class instance's value does not have the
                 *   expected primitive type.
                 */
                fun asString(): String =
                    _value().asString() ?: throw GridInvalidDataException("Value is not a String")

                private var validated: Boolean = false

                fun validate(): AssetType = apply {
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

                    return other is AssetType && value == other.value
                }

                override fun hashCode() = value.hashCode()

                override fun toString() = value.toString()
            }

            override fun equals(other: Any?): Boolean {
                if (this === other) {
                    return true
                }

                return other is PaymentPolygonWalletInfo &&
                    accountType == other.accountType &&
                    address == other.address &&
                    assetType == other.assetType &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(accountType, address, assetType, additionalProperties)
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "PaymentPolygonWalletInfo{accountType=$accountType, address=$address, assetType=$assetType, additionalProperties=$additionalProperties}"
        }

        class PaymentBaseWalletInfo
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>,
            private val address: JsonField<String>,
            private val assetType: JsonField<AssetType>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("accountType")
                @ExcludeMissing
                accountType: JsonField<PaymentAccountOrWalletInfo.AccountType> = JsonMissing.of(),
                @JsonProperty("address")
                @ExcludeMissing
                address: JsonField<String> = JsonMissing.of(),
                @JsonProperty("assetType")
                @ExcludeMissing
                assetType: JsonField<AssetType> = JsonMissing.of(),
            ) : this(accountType, address, assetType, mutableMapOf())

            fun toPaymentAccountOrWalletInfo(): PaymentAccountOrWalletInfo =
                PaymentAccountOrWalletInfo.builder().accountType(accountType).build()

            fun toBaseWalletInfo(): BaseWalletInfo =
                BaseWalletInfo.builder().accountType(accountType).address(address).build()

            /**
             * Type of account or wallet information
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun accountType(): PaymentAccountOrWalletInfo.AccountType =
                accountType.getRequired("accountType")

            /**
             * Base eth wallet address
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun address(): String = address.getRequired("address")

            /**
             * Type of asset
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun assetType(): AssetType? = assetType.getNullable("assetType")

            /**
             * Returns the raw JSON value of [accountType].
             *
             * Unlike [accountType], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("accountType")
            @ExcludeMissing
            fun _accountType(): JsonField<PaymentAccountOrWalletInfo.AccountType> = accountType

            /**
             * Returns the raw JSON value of [address].
             *
             * Unlike [address], this method doesn't throw if the JSON field has an unexpected type.
             */
            @JsonProperty("address") @ExcludeMissing fun _address(): JsonField<String> = address

            /**
             * Returns the raw JSON value of [assetType].
             *
             * Unlike [assetType], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("assetType")
            @ExcludeMissing
            fun _assetType(): JsonField<AssetType> = assetType

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
                 * [PaymentBaseWalletInfo].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountType()
                 * .address()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [PaymentBaseWalletInfo]. */
            class Builder internal constructor() {

                private var accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>? = null
                private var address: JsonField<String>? = null
                private var assetType: JsonField<AssetType> = JsonMissing.of()
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(paymentBaseWalletInfo: PaymentBaseWalletInfo) = apply {
                    accountType = paymentBaseWalletInfo.accountType
                    address = paymentBaseWalletInfo.address
                    assetType = paymentBaseWalletInfo.assetType
                    additionalProperties = paymentBaseWalletInfo.additionalProperties.toMutableMap()
                }

                /** Type of account or wallet information */
                fun accountType(accountType: PaymentAccountOrWalletInfo.AccountType) =
                    accountType(JsonField.of(accountType))

                /**
                 * Sets [Builder.accountType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.accountType] with a well-typed
                 * [PaymentAccountOrWalletInfo.AccountType] value instead. This method is primarily
                 * for setting the field to an undocumented or not yet supported value.
                 */
                fun accountType(accountType: JsonField<PaymentAccountOrWalletInfo.AccountType>) =
                    apply {
                        this.accountType = accountType
                    }

                /** Base eth wallet address */
                fun address(address: String) = address(JsonField.of(address))

                /**
                 * Sets [Builder.address] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.address] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun address(address: JsonField<String>) = apply { this.address = address }

                /** Type of asset */
                fun assetType(assetType: AssetType) = assetType(JsonField.of(assetType))

                /**
                 * Sets [Builder.assetType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.assetType] with a well-typed [AssetType] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun assetType(assetType: JsonField<AssetType>) = apply {
                    this.assetType = assetType
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
                 * Returns an immutable instance of [PaymentBaseWalletInfo].
                 *
                 * Further updates to this [Builder] will not mutate the returned instance.
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountType()
                 * .address()
                 * ```
                 *
                 * @throws IllegalStateException if any required field is unset.
                 */
                fun build(): PaymentBaseWalletInfo =
                    PaymentBaseWalletInfo(
                        checkRequired("accountType", accountType),
                        checkRequired("address", address),
                        assetType,
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): PaymentBaseWalletInfo = apply {
                if (validated) {
                    return@apply
                }

                accountType().validate()
                address()
                assetType()?.validate()
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
                (accountType.asKnown()?.validity() ?: 0) +
                    (if (address.asKnown() == null) 0 else 1) +
                    (assetType.asKnown()?.validity() ?: 0)

            /** Type of asset */
            class AssetType @JsonCreator private constructor(private val value: JsonField<String>) :
                Enum {

                /**
                 * Returns this class instance's raw value.
                 *
                 * This is usually only useful if this instance was deserialized from data that
                 * doesn't match any known member, and you want to know that value. For example, if
                 * the SDK is on an older version than the API, then the API may respond with new
                 * members that the SDK is unaware of.
                 */
                @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

                companion object {

                    val USDC = of("USDC")

                    fun of(value: String) = AssetType(JsonField.of(value))
                }

                /** An enum containing [AssetType]'s known values. */
                enum class Known {
                    USDC
                }

                /**
                 * An enum containing [AssetType]'s known values, as well as an [_UNKNOWN] member.
                 *
                 * An instance of [AssetType] can contain an unknown value in a couple of cases:
                 * - It was deserialized from data that doesn't match any known member. For example,
                 *   if the SDK is on an older version than the API, then the API may respond with
                 *   new members that the SDK is unaware of.
                 * - It was constructed with an arbitrary value using the [of] method.
                 */
                enum class Value {
                    USDC,
                    /**
                     * An enum member indicating that [AssetType] was instantiated with an unknown
                     * value.
                     */
                    _UNKNOWN,
                }

                /**
                 * Returns an enum member corresponding to this class instance's value, or
                 * [Value._UNKNOWN] if the class was instantiated with an unknown value.
                 *
                 * Use the [known] method instead if you're certain the value is always known or if
                 * you want to throw for the unknown case.
                 */
                fun value(): Value =
                    when (this) {
                        USDC -> Value.USDC
                        else -> Value._UNKNOWN
                    }

                /**
                 * Returns an enum member corresponding to this class instance's value.
                 *
                 * Use the [value] method instead if you're uncertain the value is always known and
                 * don't want to throw for the unknown case.
                 *
                 * @throws GridInvalidDataException if this class instance's value is a not a known
                 *   member.
                 */
                fun known(): Known =
                    when (this) {
                        USDC -> Known.USDC
                        else -> throw GridInvalidDataException("Unknown AssetType: $value")
                    }

                /**
                 * Returns this class instance's primitive wire representation.
                 *
                 * This differs from the [toString] method because that method is primarily for
                 * debugging and generally doesn't throw.
                 *
                 * @throws GridInvalidDataException if this class instance's value does not have the
                 *   expected primitive type.
                 */
                fun asString(): String =
                    _value().asString() ?: throw GridInvalidDataException("Value is not a String")

                private var validated: Boolean = false

                fun validate(): AssetType = apply {
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

                    return other is AssetType && value == other.value
                }

                override fun hashCode() = value.hashCode()

                override fun toString() = value.toString()
            }

            override fun equals(other: Any?): Boolean {
                if (this === other) {
                    return true
                }

                return other is PaymentBaseWalletInfo &&
                    accountType == other.accountType &&
                    address == other.address &&
                    assetType == other.assetType &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(accountType, address, assetType, additionalProperties)
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "PaymentBaseWalletInfo{accountType=$accountType, address=$address, assetType=$assetType, additionalProperties=$additionalProperties}"
        }
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is PaymentInstructions &&
            accountOrWalletInfo == other.accountOrWalletInfo &&
            instructionsNotes == other.instructionsNotes &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(accountOrWalletInfo, instructionsNotes, additionalProperties)
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "PaymentInstructions{accountOrWalletInfo=$accountOrWalletInfo, instructionsNotes=$instructionsNotes, additionalProperties=$additionalProperties}"
}
