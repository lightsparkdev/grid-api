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
import com.grid.api.core.toImmutable
import com.grid.api.errors.GridInvalidDataException
import com.grid.api.models.customers.externalaccounts.ExternalAccountCreate
import java.util.Collections
import java.util.Objects

/** Destination account details */
@JsonDeserialize(using = QuoteDestinationOneOf.Deserializer::class)
@JsonSerialize(using = QuoteDestinationOneOf.Serializer::class)
class QuoteDestinationOneOf
private constructor(
    private val account: Account? = null,
    private val umaAddress: UmaAddress? = null,
    private val externalAccountDetails: ExternalAccountDetails? = null,
    private val _json: JsonValue? = null,
) {

    /** Destination account details */
    fun account(): Account? = account

    /** UMA address destination details */
    fun umaAddress(): UmaAddress? = umaAddress

    /**
     * A convenient destination option which adds the external account and creates the quote in one
     * step rather than first needing to call /external-accounts to add the account. Useful for
     * one-off payments to some destination. See the external accounts endpoints for test values in
     * sandbox mode.
     */
    fun externalAccountDetails(): ExternalAccountDetails? = externalAccountDetails

    fun isAccount(): Boolean = account != null

    fun isUmaAddress(): Boolean = umaAddress != null

    fun isExternalAccountDetails(): Boolean = externalAccountDetails != null

    /** Destination account details */
    fun asAccount(): Account = account.getOrThrow("account")

    /** UMA address destination details */
    fun asUmaAddress(): UmaAddress = umaAddress.getOrThrow("umaAddress")

    /**
     * A convenient destination option which adds the external account and creates the quote in one
     * step rather than first needing to call /external-accounts to add the account. Useful for
     * one-off payments to some destination. See the external accounts endpoints for test values in
     * sandbox mode.
     */
    fun asExternalAccountDetails(): ExternalAccountDetails =
        externalAccountDetails.getOrThrow("externalAccountDetails")

    fun _json(): JsonValue? = _json

    fun <T> accept(visitor: Visitor<T>): T =
        when {
            account != null -> visitor.visitAccount(account)
            umaAddress != null -> visitor.visitUmaAddress(umaAddress)
            externalAccountDetails != null ->
                visitor.visitExternalAccountDetails(externalAccountDetails)
            else -> visitor.unknown(_json)
        }

    private var validated: Boolean = false

    fun validate(): QuoteDestinationOneOf = apply {
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

                override fun visitExternalAccountDetails(
                    externalAccountDetails: ExternalAccountDetails
                ) {
                    externalAccountDetails.validate()
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

                override fun visitUmaAddress(umaAddress: UmaAddress) = umaAddress.validity()

                override fun visitExternalAccountDetails(
                    externalAccountDetails: ExternalAccountDetails
                ) = externalAccountDetails.validity()

                override fun unknown(json: JsonValue?) = 0
            }
        )

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is QuoteDestinationOneOf &&
            account == other.account &&
            umaAddress == other.umaAddress &&
            externalAccountDetails == other.externalAccountDetails
    }

    override fun hashCode(): Int = Objects.hash(account, umaAddress, externalAccountDetails)

    override fun toString(): String =
        when {
            account != null -> "QuoteDestinationOneOf{account=$account}"
            umaAddress != null -> "QuoteDestinationOneOf{umaAddress=$umaAddress}"
            externalAccountDetails != null ->
                "QuoteDestinationOneOf{externalAccountDetails=$externalAccountDetails}"
            _json != null -> "QuoteDestinationOneOf{_unknown=$_json}"
            else -> throw IllegalStateException("Invalid QuoteDestinationOneOf")
        }

    companion object {

        /** Destination account details */
        fun ofAccount(account: Account) = QuoteDestinationOneOf(account = account)

        /** UMA address destination details */
        fun ofUmaAddress(umaAddress: UmaAddress) = QuoteDestinationOneOf(umaAddress = umaAddress)

        /**
         * A convenient destination option which adds the external account and creates the quote in
         * one step rather than first needing to call /external-accounts to add the account. Useful
         * for one-off payments to some destination. See the external accounts endpoints for test
         * values in sandbox mode.
         */
        fun ofExternalAccountDetails(externalAccountDetails: ExternalAccountDetails) =
            QuoteDestinationOneOf(externalAccountDetails = externalAccountDetails)
    }

    /**
     * An interface that defines how to map each variant of [QuoteDestinationOneOf] to a value of
     * type [T].
     */
    interface Visitor<out T> {

        /** Destination account details */
        fun visitAccount(account: Account): T

        /** UMA address destination details */
        fun visitUmaAddress(umaAddress: UmaAddress): T

        /**
         * A convenient destination option which adds the external account and creates the quote in
         * one step rather than first needing to call /external-accounts to add the account. Useful
         * for one-off payments to some destination. See the external accounts endpoints for test
         * values in sandbox mode.
         */
        fun visitExternalAccountDetails(externalAccountDetails: ExternalAccountDetails): T

        /**
         * Maps an unknown variant of [QuoteDestinationOneOf] to a value of type [T].
         *
         * An instance of [QuoteDestinationOneOf] can contain an unknown variant if it was
         * deserialized from data that doesn't match any known variant. For example, if the SDK is
         * on an older version than the API, then the API may respond with new variants that the SDK
         * is unaware of.
         *
         * @throws GridInvalidDataException in the default implementation.
         */
        fun unknown(json: JsonValue?): T {
            throw GridInvalidDataException("Unknown QuoteDestinationOneOf: $json")
        }
    }

    internal class Deserializer :
        BaseDeserializer<QuoteDestinationOneOf>(QuoteDestinationOneOf::class) {

        override fun ObjectCodec.deserialize(node: JsonNode): QuoteDestinationOneOf {
            val json = JsonValue.fromJsonNode(node)

            val bestMatches =
                sequenceOf(
                        tryDeserialize(node, jacksonTypeRef<Account>())?.let {
                            QuoteDestinationOneOf(account = it, _json = json)
                        },
                        tryDeserialize(node, jacksonTypeRef<UmaAddress>())?.let {
                            QuoteDestinationOneOf(umaAddress = it, _json = json)
                        },
                        tryDeserialize(node, jacksonTypeRef<ExternalAccountDetails>())?.let {
                            QuoteDestinationOneOf(externalAccountDetails = it, _json = json)
                        },
                    )
                    .filterNotNull()
                    .allMaxBy { it.validity() }
                    .toList()
            return when (bestMatches.size) {
                // This can happen if what we're deserializing is completely incompatible with all
                // the possible variants (e.g. deserializing from boolean).
                0 -> QuoteDestinationOneOf(_json = json)
                1 -> bestMatches.single()
                // If there's more than one match with the highest validity, then use the first
                // completely valid match, or simply the first match if none are completely valid.
                else -> bestMatches.firstOrNull { it.isValid() } ?: bestMatches.first()
            }
        }
    }

    internal class Serializer :
        BaseSerializer<QuoteDestinationOneOf>(QuoteDestinationOneOf::class) {

        override fun serialize(
            value: QuoteDestinationOneOf,
            generator: JsonGenerator,
            provider: SerializerProvider,
        ) {
            when {
                value.account != null -> generator.writeObject(value.account)
                value.umaAddress != null -> generator.writeObject(value.umaAddress)
                value.externalAccountDetails != null ->
                    generator.writeObject(value.externalAccountDetails)
                value._json != null -> generator.writeObject(value._json)
                else -> throw IllegalStateException("Invalid QuoteDestinationOneOf")
            }
        }
    }

    /** Destination account details */
    class Account
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val accountId: JsonField<String>,
        private val destinationType: JsonField<DestinationType>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("accountId")
            @ExcludeMissing
            accountId: JsonField<String> = JsonMissing.of(),
            @JsonProperty("destinationType")
            @ExcludeMissing
            destinationType: JsonField<DestinationType> = JsonMissing.of(),
        ) : this(accountId, destinationType, mutableMapOf())

        fun toBaseDestination(): BaseDestination = BaseDestination.builder().build()

        /**
         * Destination account identifier
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun accountId(): String = accountId.getRequired("accountId")

        /**
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun destinationType(): DestinationType = destinationType.getRequired("destinationType")

        /**
         * Returns the raw JSON value of [accountId].
         *
         * Unlike [accountId], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("accountId") @ExcludeMissing fun _accountId(): JsonField<String> = accountId

        /**
         * Returns the raw JSON value of [destinationType].
         *
         * Unlike [destinationType], this method doesn't throw if the JSON field has an unexpected
         * type.
         */
        @JsonProperty("destinationType")
        @ExcludeMissing
        fun _destinationType(): JsonField<DestinationType> = destinationType

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
             * .destinationType()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [Account]. */
        class Builder internal constructor() {

            private var accountId: JsonField<String>? = null
            private var destinationType: JsonField<DestinationType>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(account: Account) = apply {
                accountId = account.accountId
                destinationType = account.destinationType
                additionalProperties = account.additionalProperties.toMutableMap()
            }

            /** Destination account identifier */
            fun accountId(accountId: String) = accountId(JsonField.of(accountId))

            /**
             * Sets [Builder.accountId] to an arbitrary JSON value.
             *
             * You should usually call [Builder.accountId] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun accountId(accountId: JsonField<String>) = apply { this.accountId = accountId }

            fun destinationType(destinationType: DestinationType) =
                destinationType(JsonField.of(destinationType))

            /**
             * Sets [Builder.destinationType] to an arbitrary JSON value.
             *
             * You should usually call [Builder.destinationType] with a well-typed [DestinationType]
             * value instead. This method is primarily for setting the field to an undocumented or
             * not yet supported value.
             */
            fun destinationType(destinationType: JsonField<DestinationType>) = apply {
                this.destinationType = destinationType
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
             * Returns an immutable instance of [Account].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             *
             * The following fields are required:
             * ```kotlin
             * .accountId()
             * .destinationType()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): Account =
                Account(
                    checkRequired("accountId", accountId),
                    checkRequired("destinationType", destinationType),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): Account = apply {
            if (validated) {
                return@apply
            }

            accountId()
            destinationType().validate()
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
                (destinationType.asKnown()?.validity() ?: 0)

        class DestinationType
        @JsonCreator
        private constructor(private val value: JsonField<String>) : Enum {

            /**
             * Returns this class instance's raw value.
             *
             * This is usually only useful if this instance was deserialized from data that doesn't
             * match any known member, and you want to know that value. For example, if the SDK is
             * on an older version than the API, then the API may respond with new members that the
             * SDK is unaware of.
             */
            @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

            companion object {

                val ACCOUNT = of("ACCOUNT")

                fun of(value: String) = DestinationType(JsonField.of(value))
            }

            /** An enum containing [DestinationType]'s known values. */
            enum class Known {
                ACCOUNT
            }

            /**
             * An enum containing [DestinationType]'s known values, as well as an [_UNKNOWN] member.
             *
             * An instance of [DestinationType] can contain an unknown value in a couple of cases:
             * - It was deserialized from data that doesn't match any known member. For example, if
             *   the SDK is on an older version than the API, then the API may respond with new
             *   members that the SDK is unaware of.
             * - It was constructed with an arbitrary value using the [of] method.
             */
            enum class Value {
                ACCOUNT,
                /**
                 * An enum member indicating that [DestinationType] was instantiated with an unknown
                 * value.
                 */
                _UNKNOWN,
            }

            /**
             * Returns an enum member corresponding to this class instance's value, or
             * [Value._UNKNOWN] if the class was instantiated with an unknown value.
             *
             * Use the [known] method instead if you're certain the value is always known or if you
             * want to throw for the unknown case.
             */
            fun value(): Value =
                when (this) {
                    ACCOUNT -> Value.ACCOUNT
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
                    ACCOUNT -> Known.ACCOUNT
                    else -> throw GridInvalidDataException("Unknown DestinationType: $value")
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

            fun validate(): DestinationType = apply {
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

                return other is DestinationType && value == other.value
            }

            override fun hashCode() = value.hashCode()

            override fun toString() = value.toString()
        }

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is Account &&
                accountId == other.accountId &&
                destinationType == other.destinationType &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(accountId, destinationType, additionalProperties)
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "Account{accountId=$accountId, destinationType=$destinationType, additionalProperties=$additionalProperties}"
    }

    /** UMA address destination details */
    class UmaAddress
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val destinationType: JsonField<DestinationType>,
        private val umaAddress: JsonField<String>,
        private val counterpartyInformation: JsonField<CounterpartyInformation>,
        private val currency: JsonField<String>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("destinationType")
            @ExcludeMissing
            destinationType: JsonField<DestinationType> = JsonMissing.of(),
            @JsonProperty("umaAddress")
            @ExcludeMissing
            umaAddress: JsonField<String> = JsonMissing.of(),
            @JsonProperty("counterpartyInformation")
            @ExcludeMissing
            counterpartyInformation: JsonField<CounterpartyInformation> = JsonMissing.of(),
            @JsonProperty("currency") @ExcludeMissing currency: JsonField<String> = JsonMissing.of(),
        ) : this(destinationType, umaAddress, counterpartyInformation, currency, mutableMapOf())

        fun toBaseDestination(): BaseDestination = BaseDestination.builder().build()

        /**
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun destinationType(): DestinationType = destinationType.getRequired("destinationType")

        /**
         * UMA address of the recipient
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun umaAddress(): String = umaAddress.getRequired("umaAddress")

        /**
         * Information about the recipient, as required by the platform in their configuration.
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun counterpartyInformation(): CounterpartyInformation? =
            counterpartyInformation.getNullable("counterpartyInformation")

        /**
         * Currency code for the destination. See
         * [Supported Currencies](https://grid.lightspark.com/platform-overview/core-concepts/currencies-and-rails)
         * for the full list of supported fiat and crypto currencies.
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun currency(): String? = currency.getNullable("currency")

        /**
         * Returns the raw JSON value of [destinationType].
         *
         * Unlike [destinationType], this method doesn't throw if the JSON field has an unexpected
         * type.
         */
        @JsonProperty("destinationType")
        @ExcludeMissing
        fun _destinationType(): JsonField<DestinationType> = destinationType

        /**
         * Returns the raw JSON value of [umaAddress].
         *
         * Unlike [umaAddress], this method doesn't throw if the JSON field has an unexpected type.
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
        fun _counterpartyInformation(): JsonField<CounterpartyInformation> = counterpartyInformation

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
             * Returns a mutable builder for constructing an instance of [UmaAddress].
             *
             * The following fields are required:
             * ```kotlin
             * .destinationType()
             * .umaAddress()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [UmaAddress]. */
        class Builder internal constructor() {

            private var destinationType: JsonField<DestinationType>? = null
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

            fun destinationType(destinationType: DestinationType) =
                destinationType(JsonField.of(destinationType))

            /**
             * Sets [Builder.destinationType] to an arbitrary JSON value.
             *
             * You should usually call [Builder.destinationType] with a well-typed [DestinationType]
             * value instead. This method is primarily for setting the field to an undocumented or
             * not yet supported value.
             */
            fun destinationType(destinationType: JsonField<DestinationType>) = apply {
                this.destinationType = destinationType
            }

            /** UMA address of the recipient */
            fun umaAddress(umaAddress: String) = umaAddress(JsonField.of(umaAddress))

            /**
             * Sets [Builder.umaAddress] to an arbitrary JSON value.
             *
             * You should usually call [Builder.umaAddress] with a well-typed [String] value
             * instead. This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun umaAddress(umaAddress: JsonField<String>) = apply { this.umaAddress = umaAddress }

            /**
             * Information about the recipient, as required by the platform in their configuration.
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

            /**
             * Currency code for the destination. See
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
             * Returns an immutable instance of [UmaAddress].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             *
             * The following fields are required:
             * ```kotlin
             * .destinationType()
             * .umaAddress()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): UmaAddress =
                UmaAddress(
                    checkRequired("destinationType", destinationType),
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

            destinationType().validate()
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
            (destinationType.asKnown()?.validity() ?: 0) +
                (if (umaAddress.asKnown() == null) 0 else 1) +
                (counterpartyInformation.asKnown()?.validity() ?: 0) +
                (if (currency.asKnown() == null) 0 else 1)

        class DestinationType
        @JsonCreator
        private constructor(private val value: JsonField<String>) : Enum {

            /**
             * Returns this class instance's raw value.
             *
             * This is usually only useful if this instance was deserialized from data that doesn't
             * match any known member, and you want to know that value. For example, if the SDK is
             * on an older version than the API, then the API may respond with new members that the
             * SDK is unaware of.
             */
            @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

            companion object {

                val UMA_ADDRESS = of("UMA_ADDRESS")

                fun of(value: String) = DestinationType(JsonField.of(value))
            }

            /** An enum containing [DestinationType]'s known values. */
            enum class Known {
                UMA_ADDRESS
            }

            /**
             * An enum containing [DestinationType]'s known values, as well as an [_UNKNOWN] member.
             *
             * An instance of [DestinationType] can contain an unknown value in a couple of cases:
             * - It was deserialized from data that doesn't match any known member. For example, if
             *   the SDK is on an older version than the API, then the API may respond with new
             *   members that the SDK is unaware of.
             * - It was constructed with an arbitrary value using the [of] method.
             */
            enum class Value {
                UMA_ADDRESS,
                /**
                 * An enum member indicating that [DestinationType] was instantiated with an unknown
                 * value.
                 */
                _UNKNOWN,
            }

            /**
             * Returns an enum member corresponding to this class instance's value, or
             * [Value._UNKNOWN] if the class was instantiated with an unknown value.
             *
             * Use the [known] method instead if you're certain the value is always known or if you
             * want to throw for the unknown case.
             */
            fun value(): Value =
                when (this) {
                    UMA_ADDRESS -> Value.UMA_ADDRESS
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
                    UMA_ADDRESS -> Known.UMA_ADDRESS
                    else -> throw GridInvalidDataException("Unknown DestinationType: $value")
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

            fun validate(): DestinationType = apply {
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

                return other is DestinationType && value == other.value
            }

            override fun hashCode() = value.hashCode()

            override fun toString() = value.toString()
        }

        /** Information about the recipient, as required by the platform in their configuration. */
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
                additionalProperties.count { (_, value) -> !value.isNull() && !value.isMissing() }

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

    /**
     * A convenient destination option which adds the external account and creates the quote in one
     * step rather than first needing to call /external-accounts to add the account. Useful for
     * one-off payments to some destination. See the external accounts endpoints for test values in
     * sandbox mode.
     */
    class ExternalAccountDetails
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val destinationType: JsonField<DestinationType>,
        private val externalAccountDetails: JsonField<ExternalAccountCreate>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("destinationType")
            @ExcludeMissing
            destinationType: JsonField<DestinationType> = JsonMissing.of(),
            @JsonProperty("externalAccountDetails")
            @ExcludeMissing
            externalAccountDetails: JsonField<ExternalAccountCreate> = JsonMissing.of(),
        ) : this(destinationType, externalAccountDetails, mutableMapOf())

        fun toBaseDestination(): BaseDestination = BaseDestination.builder().build()

        /**
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun destinationType(): DestinationType = destinationType.getRequired("destinationType")

        /**
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun externalAccountDetails(): ExternalAccountCreate =
            externalAccountDetails.getRequired("externalAccountDetails")

        /**
         * Returns the raw JSON value of [destinationType].
         *
         * Unlike [destinationType], this method doesn't throw if the JSON field has an unexpected
         * type.
         */
        @JsonProperty("destinationType")
        @ExcludeMissing
        fun _destinationType(): JsonField<DestinationType> = destinationType

        /**
         * Returns the raw JSON value of [externalAccountDetails].
         *
         * Unlike [externalAccountDetails], this method doesn't throw if the JSON field has an
         * unexpected type.
         */
        @JsonProperty("externalAccountDetails")
        @ExcludeMissing
        fun _externalAccountDetails(): JsonField<ExternalAccountCreate> = externalAccountDetails

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
             * Returns a mutable builder for constructing an instance of [ExternalAccountDetails].
             *
             * The following fields are required:
             * ```kotlin
             * .destinationType()
             * .externalAccountDetails()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [ExternalAccountDetails]. */
        class Builder internal constructor() {

            private var destinationType: JsonField<DestinationType>? = null
            private var externalAccountDetails: JsonField<ExternalAccountCreate>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(externalAccountDetails: ExternalAccountDetails) = apply {
                destinationType = externalAccountDetails.destinationType
                this.externalAccountDetails = externalAccountDetails.externalAccountDetails
                additionalProperties = externalAccountDetails.additionalProperties.toMutableMap()
            }

            fun destinationType(destinationType: DestinationType) =
                destinationType(JsonField.of(destinationType))

            /**
             * Sets [Builder.destinationType] to an arbitrary JSON value.
             *
             * You should usually call [Builder.destinationType] with a well-typed [DestinationType]
             * value instead. This method is primarily for setting the field to an undocumented or
             * not yet supported value.
             */
            fun destinationType(destinationType: JsonField<DestinationType>) = apply {
                this.destinationType = destinationType
            }

            fun externalAccountDetails(externalAccountDetails: ExternalAccountCreate) =
                externalAccountDetails(JsonField.of(externalAccountDetails))

            /**
             * Sets [Builder.externalAccountDetails] to an arbitrary JSON value.
             *
             * You should usually call [Builder.externalAccountDetails] with a well-typed
             * [ExternalAccountCreate] value instead. This method is primarily for setting the field
             * to an undocumented or not yet supported value.
             */
            fun externalAccountDetails(externalAccountDetails: JsonField<ExternalAccountCreate>) =
                apply {
                    this.externalAccountDetails = externalAccountDetails
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
             * Returns an immutable instance of [ExternalAccountDetails].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             *
             * The following fields are required:
             * ```kotlin
             * .destinationType()
             * .externalAccountDetails()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): ExternalAccountDetails =
                ExternalAccountDetails(
                    checkRequired("destinationType", destinationType),
                    checkRequired("externalAccountDetails", externalAccountDetails),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): ExternalAccountDetails = apply {
            if (validated) {
                return@apply
            }

            destinationType().validate()
            externalAccountDetails().validate()
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
            (destinationType.asKnown()?.validity() ?: 0) +
                (externalAccountDetails.asKnown()?.validity() ?: 0)

        class DestinationType
        @JsonCreator
        private constructor(private val value: JsonField<String>) : Enum {

            /**
             * Returns this class instance's raw value.
             *
             * This is usually only useful if this instance was deserialized from data that doesn't
             * match any known member, and you want to know that value. For example, if the SDK is
             * on an older version than the API, then the API may respond with new members that the
             * SDK is unaware of.
             */
            @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

            companion object {

                val EXTERNAL_ACCOUNT_DETAILS = of("EXTERNAL_ACCOUNT_DETAILS")

                fun of(value: String) = DestinationType(JsonField.of(value))
            }

            /** An enum containing [DestinationType]'s known values. */
            enum class Known {
                EXTERNAL_ACCOUNT_DETAILS
            }

            /**
             * An enum containing [DestinationType]'s known values, as well as an [_UNKNOWN] member.
             *
             * An instance of [DestinationType] can contain an unknown value in a couple of cases:
             * - It was deserialized from data that doesn't match any known member. For example, if
             *   the SDK is on an older version than the API, then the API may respond with new
             *   members that the SDK is unaware of.
             * - It was constructed with an arbitrary value using the [of] method.
             */
            enum class Value {
                EXTERNAL_ACCOUNT_DETAILS,
                /**
                 * An enum member indicating that [DestinationType] was instantiated with an unknown
                 * value.
                 */
                _UNKNOWN,
            }

            /**
             * Returns an enum member corresponding to this class instance's value, or
             * [Value._UNKNOWN] if the class was instantiated with an unknown value.
             *
             * Use the [known] method instead if you're certain the value is always known or if you
             * want to throw for the unknown case.
             */
            fun value(): Value =
                when (this) {
                    EXTERNAL_ACCOUNT_DETAILS -> Value.EXTERNAL_ACCOUNT_DETAILS
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
                    EXTERNAL_ACCOUNT_DETAILS -> Known.EXTERNAL_ACCOUNT_DETAILS
                    else -> throw GridInvalidDataException("Unknown DestinationType: $value")
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

            fun validate(): DestinationType = apply {
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

                return other is DestinationType && value == other.value
            }

            override fun hashCode() = value.hashCode()

            override fun toString() = value.toString()
        }

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is ExternalAccountDetails &&
                destinationType == other.destinationType &&
                externalAccountDetails == other.externalAccountDetails &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(destinationType, externalAccountDetails, additionalProperties)
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "ExternalAccountDetails{destinationType=$destinationType, externalAccountDetails=$externalAccountDetails, additionalProperties=$additionalProperties}"
    }
}
