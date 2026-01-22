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
import com.grid.api.core.ExcludeMissing
import com.grid.api.core.JsonField
import com.grid.api.core.JsonMissing
import com.grid.api.core.JsonValue
import com.grid.api.core.allMaxBy
import com.grid.api.core.checkRequired
import com.grid.api.core.getOrThrow
import com.grid.api.errors.GridInvalidDataException
import java.util.Collections
import java.util.Objects

/** Source account details */
@JsonDeserialize(using = QuoteSource.Deserializer::class)
@JsonSerialize(using = QuoteSource.Serializer::class)
class QuoteSource
private constructor(
    private val account: Account? = null,
    private val realTimeFunding: RealTimeFunding? = null,
    private val _json: JsonValue? = null,
) {

    /** Source account details */
    fun account(): Account? = account

    /**
     * Fund the quote using a real-time funding source (RTP, SEPA Instant, Spark, Stables, etc.).
     * This will require manual just-in-time funding using `paymentInstructions` in the response.
     * Because quotes expire quickly, this option is only valid for instant payment methods. Do not
     * try to fund a quote with a non-instant payment method (ACH, etc.).
     */
    fun realTimeFunding(): RealTimeFunding? = realTimeFunding

    fun isAccount(): Boolean = account != null

    fun isRealTimeFunding(): Boolean = realTimeFunding != null

    /** Source account details */
    fun asAccount(): Account = account.getOrThrow("account")

    /**
     * Fund the quote using a real-time funding source (RTP, SEPA Instant, Spark, Stables, etc.).
     * This will require manual just-in-time funding using `paymentInstructions` in the response.
     * Because quotes expire quickly, this option is only valid for instant payment methods. Do not
     * try to fund a quote with a non-instant payment method (ACH, etc.).
     */
    fun asRealTimeFunding(): RealTimeFunding = realTimeFunding.getOrThrow("realTimeFunding")

    fun _json(): JsonValue? = _json

    fun <T> accept(visitor: Visitor<T>): T =
        when {
            account != null -> visitor.visitAccount(account)
            realTimeFunding != null -> visitor.visitRealTimeFunding(realTimeFunding)
            else -> visitor.unknown(_json)
        }

    private var validated: Boolean = false

    fun validate(): QuoteSource = apply {
        if (validated) {
            return@apply
        }

        accept(
            object : Visitor<Unit> {
                override fun visitAccount(account: Account) {
                    account.validate()
                }

                override fun visitRealTimeFunding(realTimeFunding: RealTimeFunding) {
                    realTimeFunding.validate()
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
     * Returns a score indicating how many valid values are contained in this object recursively.
     *
     * Used for best match union deserialization.
     */
    internal fun validity(): Int =
        accept(
            object : Visitor<Int> {
                override fun visitAccount(account: Account) = account.validity()

                override fun visitRealTimeFunding(realTimeFunding: RealTimeFunding) =
                    realTimeFunding.validity()

                override fun unknown(json: JsonValue?) = 0
            }
        )

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is QuoteSource &&
            account == other.account &&
            realTimeFunding == other.realTimeFunding
    }

    override fun hashCode(): Int = Objects.hash(account, realTimeFunding)

    override fun toString(): String =
        when {
            account != null -> "QuoteSource{account=$account}"
            realTimeFunding != null -> "QuoteSource{realTimeFunding=$realTimeFunding}"
            _json != null -> "QuoteSource{_unknown=$_json}"
            else -> throw IllegalStateException("Invalid QuoteSource")
        }

    companion object {

        /** Source account details */
        fun ofAccount(account: Account) = QuoteSource(account = account)

        /**
         * Fund the quote using a real-time funding source (RTP, SEPA Instant, Spark, Stables,
         * etc.). This will require manual just-in-time funding using `paymentInstructions` in the
         * response. Because quotes expire quickly, this option is only valid for instant payment
         * methods. Do not try to fund a quote with a non-instant payment method (ACH, etc.).
         */
        fun ofRealTimeFunding(realTimeFunding: RealTimeFunding) =
            QuoteSource(realTimeFunding = realTimeFunding)
    }

    /**
     * An interface that defines how to map each variant of [QuoteSource] to a value of type [T].
     */
    interface Visitor<out T> {

        /** Source account details */
        fun visitAccount(account: Account): T

        /**
         * Fund the quote using a real-time funding source (RTP, SEPA Instant, Spark, Stables,
         * etc.). This will require manual just-in-time funding using `paymentInstructions` in the
         * response. Because quotes expire quickly, this option is only valid for instant payment
         * methods. Do not try to fund a quote with a non-instant payment method (ACH, etc.).
         */
        fun visitRealTimeFunding(realTimeFunding: RealTimeFunding): T

        /**
         * Maps an unknown variant of [QuoteSource] to a value of type [T].
         *
         * An instance of [QuoteSource] can contain an unknown variant if it was deserialized from
         * data that doesn't match any known variant. For example, if the SDK is on an older version
         * than the API, then the API may respond with new variants that the SDK is unaware of.
         *
         * @throws GridInvalidDataException in the default implementation.
         */
        fun unknown(json: JsonValue?): T {
            throw GridInvalidDataException("Unknown QuoteSource: $json")
        }
    }

    internal class Deserializer : BaseDeserializer<QuoteSource>(QuoteSource::class) {

        override fun ObjectCodec.deserialize(node: JsonNode): QuoteSource {
            val json = JsonValue.fromJsonNode(node)

            val bestMatches =
                sequenceOf(
                        tryDeserialize(node, jacksonTypeRef<Account>())?.let {
                            QuoteSource(account = it, _json = json)
                        },
                        tryDeserialize(node, jacksonTypeRef<RealTimeFunding>())?.let {
                            QuoteSource(realTimeFunding = it, _json = json)
                        },
                    )
                    .filterNotNull()
                    .allMaxBy { it.validity() }
                    .toList()
            return when (bestMatches.size) {
                // This can happen if what we're deserializing is completely incompatible with all
                // the possible variants (e.g. deserializing from boolean).
                0 -> QuoteSource(_json = json)
                1 -> bestMatches.single()
                // If there's more than one match with the highest validity, then use the first
                // completely valid match, or simply the first match if none are completely valid.
                else -> bestMatches.firstOrNull { it.isValid() } ?: bestMatches.first()
            }
        }
    }

    internal class Serializer : BaseSerializer<QuoteSource>(QuoteSource::class) {

        override fun serialize(
            value: QuoteSource,
            generator: JsonGenerator,
            provider: SerializerProvider,
        ) {
            when {
                value.account != null -> generator.writeObject(value.account)
                value.realTimeFunding != null -> generator.writeObject(value.realTimeFunding)
                value._json != null -> generator.writeObject(value._json)
                else -> throw IllegalStateException("Invalid QuoteSource")
            }
        }
    }

    /** Source account details */
    class Account
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
            @JsonProperty("currency") @ExcludeMissing currency: JsonField<String> = JsonMissing.of(),
        ) : this(accountId, currency, mutableMapOf())

        /**
         * Source account identifier
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun accountId(): String = accountId.getRequired("accountId")

        /**
         * Currency code for the funding source. See
         * [Supported Currencies](https://grid.lightspark.com/platform-overview/core-concepts/currencies-and-rails)
         * for the full list of supported fiat and crypto currencies.
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun currency(): String? = currency.getNullable("currency")

        /**
         * Returns the raw JSON value of [accountId].
         *
         * Unlike [accountId], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("accountId") @ExcludeMissing fun _accountId(): JsonField<String> = accountId

        /**
         * Returns the raw JSON value of [currency].
         *
         * Unlike [currency], this method doesn't throw if the JSON field has an unexpected type.
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
            private var currency: JsonField<String> = JsonMissing.of()
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(account: Account) = apply {
                accountId = account.accountId
                currency = account.currency
                additionalProperties = account.additionalProperties.toMutableMap()
            }

            /** Source account identifier */
            fun accountId(accountId: String) = accountId(JsonField.of(accountId))

            /**
             * Sets [Builder.accountId] to an arbitrary JSON value.
             *
             * You should usually call [Builder.accountId] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun accountId(accountId: JsonField<String>) = apply { this.accountId = accountId }

            /**
             * Currency code for the funding source. See
             * [Supported Currencies](https://grid.lightspark.com/platform-overview/core-concepts/currencies-and-rails)
             * for the full list of supported fiat and crypto currencies.
             */
            fun currency(currency: String) = currency(JsonField.of(currency))

            /**
             * Sets [Builder.currency] to an arbitrary JSON value.
             *
             * You should usually call [Builder.currency] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun currency(currency: JsonField<String>) = apply { this.currency = currency }

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
            (if (accountId.asKnown() == null) 0 else 1) + (if (currency.asKnown() == null) 0 else 1)

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is Account &&
                accountId == other.accountId &&
                currency == other.currency &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(accountId, currency, additionalProperties)
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "Account{accountId=$accountId, currency=$currency, additionalProperties=$additionalProperties}"
    }

    /**
     * Fund the quote using a real-time funding source (RTP, SEPA Instant, Spark, Stables, etc.).
     * This will require manual just-in-time funding using `paymentInstructions` in the response.
     * Because quotes expire quickly, this option is only valid for instant payment methods. Do not
     * try to fund a quote with a non-instant payment method (ACH, etc.).
     */
    class RealTimeFunding
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val currency: JsonField<String>,
        private val customerId: JsonField<String>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("currency")
            @ExcludeMissing
            currency: JsonField<String> = JsonMissing.of(),
            @JsonProperty("customerId")
            @ExcludeMissing
            customerId: JsonField<String> = JsonMissing.of(),
        ) : this(currency, customerId, mutableMapOf())

        /**
         * Currency code for the funding source. See
         * [Supported Currencies](https://grid.lightspark.com/platform-overview/core-concepts/currencies-and-rails)
         * for the full list of supported fiat and crypto currencies.
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun currency(): String = currency.getRequired("currency")

        /**
         * Source customer ID. If this transaction is being initiated on behalf of a customer, this
         * is required. If customerId is not provided, the quote will be created on behalf of the
         * platform itself.
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun customerId(): String = customerId.getRequired("customerId")

        /**
         * Returns the raw JSON value of [currency].
         *
         * Unlike [currency], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("currency") @ExcludeMissing fun _currency(): JsonField<String> = currency

        /**
         * Returns the raw JSON value of [customerId].
         *
         * Unlike [customerId], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("customerId")
        @ExcludeMissing
        fun _customerId(): JsonField<String> = customerId

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
             * Returns a mutable builder for constructing an instance of [RealTimeFunding].
             *
             * The following fields are required:
             * ```kotlin
             * .currency()
             * .customerId()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [RealTimeFunding]. */
        class Builder internal constructor() {

            private var currency: JsonField<String>? = null
            private var customerId: JsonField<String>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(realTimeFunding: RealTimeFunding) = apply {
                currency = realTimeFunding.currency
                customerId = realTimeFunding.customerId
                additionalProperties = realTimeFunding.additionalProperties.toMutableMap()
            }

            /**
             * Currency code for the funding source. See
             * [Supported Currencies](https://grid.lightspark.com/platform-overview/core-concepts/currencies-and-rails)
             * for the full list of supported fiat and crypto currencies.
             */
            fun currency(currency: String) = currency(JsonField.of(currency))

            /**
             * Sets [Builder.currency] to an arbitrary JSON value.
             *
             * You should usually call [Builder.currency] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun currency(currency: JsonField<String>) = apply { this.currency = currency }

            /**
             * Source customer ID. If this transaction is being initiated on behalf of a customer,
             * this is required. If customerId is not provided, the quote will be created on behalf
             * of the platform itself.
             */
            fun customerId(customerId: String) = customerId(JsonField.of(customerId))

            /**
             * Sets [Builder.customerId] to an arbitrary JSON value.
             *
             * You should usually call [Builder.customerId] with a well-typed [String] value
             * instead. This method is primarily for setting the field to an undocumented or not yet
             * supported value.
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
             * Returns an immutable instance of [RealTimeFunding].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             *
             * The following fields are required:
             * ```kotlin
             * .currency()
             * .customerId()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): RealTimeFunding =
                RealTimeFunding(
                    checkRequired("currency", currency),
                    checkRequired("customerId", customerId),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): RealTimeFunding = apply {
            if (validated) {
                return@apply
            }

            currency()
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
         * Returns a score indicating how many valid values are contained in this object
         * recursively.
         *
         * Used for best match union deserialization.
         */
        internal fun validity(): Int =
            (if (currency.asKnown() == null) 0 else 1) +
                (if (customerId.asKnown() == null) 0 else 1)

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is RealTimeFunding &&
                currency == other.currency &&
                customerId == other.customerId &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(currency, customerId, additionalProperties)
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "RealTimeFunding{currency=$currency, customerId=$customerId, additionalProperties=$additionalProperties}"
    }
}
