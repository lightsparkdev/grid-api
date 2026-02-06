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
    private val accountDestination: AccountDestination? = null,
    private val umaAddressDestination: UmaAddressDestination? = null,
    private val externalAccountDetailsDestination: ExternalAccountDetailsDestination? = null,
    private val _json: JsonValue? = null,
) {

    /** Destination account details */
    fun accountDestination(): AccountDestination? = accountDestination

    /** UMA address destination details */
    fun umaAddressDestination(): UmaAddressDestination? = umaAddressDestination

    /**
     * A convenient destination option which adds the external account and creates the quote in one
     * step rather than first needing to call /external-accounts to add the account. Useful for
     * one-off payments to some destination. See the external accounts endpoints for test values in
     * sandbox mode.
     */
    fun externalAccountDetailsDestination(): ExternalAccountDetailsDestination? =
        externalAccountDetailsDestination

    fun isAccountDestination(): Boolean = accountDestination != null

    fun isUmaAddressDestination(): Boolean = umaAddressDestination != null

    fun isExternalAccountDetailsDestination(): Boolean = externalAccountDetailsDestination != null

    /** Destination account details */
    fun asAccountDestination(): AccountDestination =
        accountDestination.getOrThrow("accountDestination")

    /** UMA address destination details */
    fun asUmaAddressDestination(): UmaAddressDestination =
        umaAddressDestination.getOrThrow("umaAddressDestination")

    /**
     * A convenient destination option which adds the external account and creates the quote in one
     * step rather than first needing to call /external-accounts to add the account. Useful for
     * one-off payments to some destination. See the external accounts endpoints for test values in
     * sandbox mode.
     */
    fun asExternalAccountDetailsDestination(): ExternalAccountDetailsDestination =
        externalAccountDetailsDestination.getOrThrow("externalAccountDetailsDestination")

    fun _json(): JsonValue? = _json

    fun <T> accept(visitor: Visitor<T>): T =
        when {
            accountDestination != null -> visitor.visitAccountDestination(accountDestination)
            umaAddressDestination != null ->
                visitor.visitUmaAddressDestination(umaAddressDestination)
            externalAccountDetailsDestination != null ->
                visitor.visitExternalAccountDetailsDestination(externalAccountDetailsDestination)
            else -> visitor.unknown(_json)
        }

    private var validated: Boolean = false

    fun validate(): QuoteDestinationOneOf = apply {
        if (validated) {
            return@apply
        }

        accept(
            object : Visitor<Unit> {
                override fun visitAccountDestination(accountDestination: AccountDestination) {
                    accountDestination.validate()
                }

                override fun visitUmaAddressDestination(
                    umaAddressDestination: UmaAddressDestination
                ) {
                    umaAddressDestination.validate()
                }

                override fun visitExternalAccountDetailsDestination(
                    externalAccountDetailsDestination: ExternalAccountDetailsDestination
                ) {
                    externalAccountDetailsDestination.validate()
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
                override fun visitAccountDestination(accountDestination: AccountDestination) =
                    accountDestination.validity()

                override fun visitUmaAddressDestination(
                    umaAddressDestination: UmaAddressDestination
                ) = umaAddressDestination.validity()

                override fun visitExternalAccountDetailsDestination(
                    externalAccountDetailsDestination: ExternalAccountDetailsDestination
                ) = externalAccountDetailsDestination.validity()

                override fun unknown(json: JsonValue?) = 0
            }
        )

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is QuoteDestinationOneOf &&
            accountDestination == other.accountDestination &&
            umaAddressDestination == other.umaAddressDestination &&
            externalAccountDetailsDestination == other.externalAccountDetailsDestination
    }

    override fun hashCode(): Int =
        Objects.hash(accountDestination, umaAddressDestination, externalAccountDetailsDestination)

    override fun toString(): String =
        when {
            accountDestination != null ->
                "QuoteDestinationOneOf{accountDestination=$accountDestination}"
            umaAddressDestination != null ->
                "QuoteDestinationOneOf{umaAddressDestination=$umaAddressDestination}"
            externalAccountDetailsDestination != null ->
                "QuoteDestinationOneOf{externalAccountDetailsDestination=$externalAccountDetailsDestination}"
            _json != null -> "QuoteDestinationOneOf{_unknown=$_json}"
            else -> throw IllegalStateException("Invalid QuoteDestinationOneOf")
        }

    companion object {

        /** Destination account details */
        fun ofAccountDestination(accountDestination: AccountDestination) =
            QuoteDestinationOneOf(accountDestination = accountDestination)

        /** UMA address destination details */
        fun ofUmaAddressDestination(umaAddressDestination: UmaAddressDestination) =
            QuoteDestinationOneOf(umaAddressDestination = umaAddressDestination)

        /**
         * A convenient destination option which adds the external account and creates the quote in
         * one step rather than first needing to call /external-accounts to add the account. Useful
         * for one-off payments to some destination. See the external accounts endpoints for test
         * values in sandbox mode.
         */
        fun ofExternalAccountDetailsDestination(
            externalAccountDetailsDestination: ExternalAccountDetailsDestination
        ) =
            QuoteDestinationOneOf(
                externalAccountDetailsDestination = externalAccountDetailsDestination
            )
    }

    /**
     * An interface that defines how to map each variant of [QuoteDestinationOneOf] to a value of
     * type [T].
     */
    interface Visitor<out T> {

        /** Destination account details */
        fun visitAccountDestination(accountDestination: AccountDestination): T

        /** UMA address destination details */
        fun visitUmaAddressDestination(umaAddressDestination: UmaAddressDestination): T

        /**
         * A convenient destination option which adds the external account and creates the quote in
         * one step rather than first needing to call /external-accounts to add the account. Useful
         * for one-off payments to some destination. See the external accounts endpoints for test
         * values in sandbox mode.
         */
        fun visitExternalAccountDetailsDestination(
            externalAccountDetailsDestination: ExternalAccountDetailsDestination
        ): T

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
                        tryDeserialize(node, jacksonTypeRef<AccountDestination>())?.let {
                            QuoteDestinationOneOf(accountDestination = it, _json = json)
                        },
                        tryDeserialize(node, jacksonTypeRef<UmaAddressDestination>())?.let {
                            QuoteDestinationOneOf(umaAddressDestination = it, _json = json)
                        },
                        tryDeserialize(node, jacksonTypeRef<ExternalAccountDetailsDestination>())
                            ?.let {
                                QuoteDestinationOneOf(
                                    externalAccountDetailsDestination = it,
                                    _json = json,
                                )
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
                value.accountDestination != null -> generator.writeObject(value.accountDestination)
                value.umaAddressDestination != null ->
                    generator.writeObject(value.umaAddressDestination)
                value.externalAccountDetailsDestination != null ->
                    generator.writeObject(value.externalAccountDetailsDestination)
                value._json != null -> generator.writeObject(value._json)
                else -> throw IllegalStateException("Invalid QuoteDestinationOneOf")
            }
        }
    }

    /** Destination account details */
    class AccountDestination
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val destinationType: JsonField<BaseDestination.DestinationType>,
        private val accountId: JsonField<String>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("destinationType")
            @ExcludeMissing
            destinationType: JsonField<BaseDestination.DestinationType> = JsonMissing.of(),
            @JsonProperty("accountId")
            @ExcludeMissing
            accountId: JsonField<String> = JsonMissing.of(),
        ) : this(destinationType, accountId, mutableMapOf())

        fun toBaseDestination(): BaseDestination =
            BaseDestination.builder().destinationType(destinationType).build()

        /**
         * Type of payment destination
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun destinationType(): BaseDestination.DestinationType =
            destinationType.getRequired("destinationType")

        /**
         * Destination account identifier
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun accountId(): String = accountId.getRequired("accountId")

        /**
         * Returns the raw JSON value of [destinationType].
         *
         * Unlike [destinationType], this method doesn't throw if the JSON field has an unexpected
         * type.
         */
        @JsonProperty("destinationType")
        @ExcludeMissing
        fun _destinationType(): JsonField<BaseDestination.DestinationType> = destinationType

        /**
         * Returns the raw JSON value of [accountId].
         *
         * Unlike [accountId], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("accountId") @ExcludeMissing fun _accountId(): JsonField<String> = accountId

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
             * Returns a mutable builder for constructing an instance of [AccountDestination].
             *
             * The following fields are required:
             * ```kotlin
             * .destinationType()
             * .accountId()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [AccountDestination]. */
        class Builder internal constructor() {

            private var destinationType: JsonField<BaseDestination.DestinationType>? = null
            private var accountId: JsonField<String>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(accountDestination: AccountDestination) = apply {
                destinationType = accountDestination.destinationType
                accountId = accountDestination.accountId
                additionalProperties = accountDestination.additionalProperties.toMutableMap()
            }

            /** Type of payment destination */
            fun destinationType(destinationType: BaseDestination.DestinationType) =
                destinationType(JsonField.of(destinationType))

            /**
             * Sets [Builder.destinationType] to an arbitrary JSON value.
             *
             * You should usually call [Builder.destinationType] with a well-typed
             * [BaseDestination.DestinationType] value instead. This method is primarily for setting
             * the field to an undocumented or not yet supported value.
             */
            fun destinationType(destinationType: JsonField<BaseDestination.DestinationType>) =
                apply {
                    this.destinationType = destinationType
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
             * Returns an immutable instance of [AccountDestination].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             *
             * The following fields are required:
             * ```kotlin
             * .destinationType()
             * .accountId()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): AccountDestination =
                AccountDestination(
                    checkRequired("destinationType", destinationType),
                    checkRequired("accountId", accountId),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): AccountDestination = apply {
            if (validated) {
                return@apply
            }

            destinationType().validate()
            accountId()
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
                (if (accountId.asKnown() == null) 0 else 1)

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

            return other is AccountDestination &&
                destinationType == other.destinationType &&
                accountId == other.accountId &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(destinationType, accountId, additionalProperties)
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "AccountDestination{destinationType=$destinationType, accountId=$accountId, additionalProperties=$additionalProperties}"
    }

    /** UMA address destination details */
    class UmaAddressDestination
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val destinationType: JsonField<BaseDestination.DestinationType>,
        private val umaAddress: JsonField<String>,
        private val counterpartyInformation: JsonField<CounterpartyInformation>,
        private val currency: JsonField<String>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("destinationType")
            @ExcludeMissing
            destinationType: JsonField<BaseDestination.DestinationType> = JsonMissing.of(),
            @JsonProperty("umaAddress")
            @ExcludeMissing
            umaAddress: JsonField<String> = JsonMissing.of(),
            @JsonProperty("counterpartyInformation")
            @ExcludeMissing
            counterpartyInformation: JsonField<CounterpartyInformation> = JsonMissing.of(),
            @JsonProperty("currency") @ExcludeMissing currency: JsonField<String> = JsonMissing.of(),
        ) : this(destinationType, umaAddress, counterpartyInformation, currency, mutableMapOf())

        fun toBaseDestination(): BaseDestination =
            BaseDestination.builder().destinationType(destinationType).build()

        /**
         * Type of payment destination
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun destinationType(): BaseDestination.DestinationType =
            destinationType.getRequired("destinationType")

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
        fun _destinationType(): JsonField<BaseDestination.DestinationType> = destinationType

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
             * Returns a mutable builder for constructing an instance of [UmaAddressDestination].
             *
             * The following fields are required:
             * ```kotlin
             * .destinationType()
             * .umaAddress()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [UmaAddressDestination]. */
        class Builder internal constructor() {

            private var destinationType: JsonField<BaseDestination.DestinationType>? = null
            private var umaAddress: JsonField<String>? = null
            private var counterpartyInformation: JsonField<CounterpartyInformation> =
                JsonMissing.of()
            private var currency: JsonField<String> = JsonMissing.of()
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(umaAddressDestination: UmaAddressDestination) = apply {
                destinationType = umaAddressDestination.destinationType
                umaAddress = umaAddressDestination.umaAddress
                counterpartyInformation = umaAddressDestination.counterpartyInformation
                currency = umaAddressDestination.currency
                additionalProperties = umaAddressDestination.additionalProperties.toMutableMap()
            }

            /** Type of payment destination */
            fun destinationType(destinationType: BaseDestination.DestinationType) =
                destinationType(JsonField.of(destinationType))

            /**
             * Sets [Builder.destinationType] to an arbitrary JSON value.
             *
             * You should usually call [Builder.destinationType] with a well-typed
             * [BaseDestination.DestinationType] value instead. This method is primarily for setting
             * the field to an undocumented or not yet supported value.
             */
            fun destinationType(destinationType: JsonField<BaseDestination.DestinationType>) =
                apply {
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
             * Returns an immutable instance of [UmaAddressDestination].
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
            fun build(): UmaAddressDestination =
                UmaAddressDestination(
                    checkRequired("destinationType", destinationType),
                    checkRequired("umaAddress", umaAddress),
                    counterpartyInformation,
                    currency,
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): UmaAddressDestination = apply {
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

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is UmaAddressDestination &&
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
            "UmaAddressDestination{destinationType=$destinationType, umaAddress=$umaAddress, counterpartyInformation=$counterpartyInformation, currency=$currency, additionalProperties=$additionalProperties}"
    }

    /**
     * A convenient destination option which adds the external account and creates the quote in one
     * step rather than first needing to call /external-accounts to add the account. Useful for
     * one-off payments to some destination. See the external accounts endpoints for test values in
     * sandbox mode.
     */
    class ExternalAccountDetailsDestination
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val destinationType: JsonField<BaseDestination.DestinationType>,
        private val externalAccountDetails: JsonField<ExternalAccountCreate>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("destinationType")
            @ExcludeMissing
            destinationType: JsonField<BaseDestination.DestinationType> = JsonMissing.of(),
            @JsonProperty("externalAccountDetails")
            @ExcludeMissing
            externalAccountDetails: JsonField<ExternalAccountCreate> = JsonMissing.of(),
        ) : this(destinationType, externalAccountDetails, mutableMapOf())

        fun toBaseDestination(): BaseDestination =
            BaseDestination.builder().destinationType(destinationType).build()

        /**
         * Type of payment destination
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun destinationType(): BaseDestination.DestinationType =
            destinationType.getRequired("destinationType")

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
        fun _destinationType(): JsonField<BaseDestination.DestinationType> = destinationType

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
             * Returns a mutable builder for constructing an instance of
             * [ExternalAccountDetailsDestination].
             *
             * The following fields are required:
             * ```kotlin
             * .destinationType()
             * .externalAccountDetails()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [ExternalAccountDetailsDestination]. */
        class Builder internal constructor() {

            private var destinationType: JsonField<BaseDestination.DestinationType>? = null
            private var externalAccountDetails: JsonField<ExternalAccountCreate>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(
                externalAccountDetailsDestination: ExternalAccountDetailsDestination
            ) = apply {
                destinationType = externalAccountDetailsDestination.destinationType
                externalAccountDetails = externalAccountDetailsDestination.externalAccountDetails
                additionalProperties =
                    externalAccountDetailsDestination.additionalProperties.toMutableMap()
            }

            /** Type of payment destination */
            fun destinationType(destinationType: BaseDestination.DestinationType) =
                destinationType(JsonField.of(destinationType))

            /**
             * Sets [Builder.destinationType] to an arbitrary JSON value.
             *
             * You should usually call [Builder.destinationType] with a well-typed
             * [BaseDestination.DestinationType] value instead. This method is primarily for setting
             * the field to an undocumented or not yet supported value.
             */
            fun destinationType(destinationType: JsonField<BaseDestination.DestinationType>) =
                apply {
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
             * Returns an immutable instance of [ExternalAccountDetailsDestination].
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
            fun build(): ExternalAccountDetailsDestination =
                ExternalAccountDetailsDestination(
                    checkRequired("destinationType", destinationType),
                    checkRequired("externalAccountDetails", externalAccountDetails),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): ExternalAccountDetailsDestination = apply {
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

            return other is ExternalAccountDetailsDestination &&
                destinationType == other.destinationType &&
                externalAccountDetails == other.externalAccountDetails &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(destinationType, externalAccountDetails, additionalProperties)
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "ExternalAccountDetailsDestination{destinationType=$destinationType, externalAccountDetails=$externalAccountDetails, additionalProperties=$additionalProperties}"
    }
}
