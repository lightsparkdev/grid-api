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
import com.grid.api.errors.GridInvalidDataException
import java.util.Collections
import java.util.Objects

class Currency
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val code: JsonField<String>,
    private val decimals: JsonField<Long>,
    private val name: JsonField<String>,
    private val symbol: JsonField<String>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("code") @ExcludeMissing code: JsonField<String> = JsonMissing.of(),
        @JsonProperty("decimals") @ExcludeMissing decimals: JsonField<Long> = JsonMissing.of(),
        @JsonProperty("name") @ExcludeMissing name: JsonField<String> = JsonMissing.of(),
        @JsonProperty("symbol") @ExcludeMissing symbol: JsonField<String> = JsonMissing.of(),
    ) : this(code, decimals, name, symbol, mutableMapOf())

    /**
     * Three-letter currency code (ISO 4217) for fiat currencies. Some cryptocurrencies may use
     * their own ticker symbols (e.g. "BTC" for Bitcoin, "USDC" for USDC, etc.)
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun code(): String? = code.getNullable("code")

    /**
     * Number of decimal places for the currency
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun decimals(): Long? = decimals.getNullable("decimals")

    /**
     * Full name of the currency
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun name(): String? = name.getNullable("name")

    /**
     * Symbol of the currency
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun symbol(): String? = symbol.getNullable("symbol")

    /**
     * Returns the raw JSON value of [code].
     *
     * Unlike [code], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("code") @ExcludeMissing fun _code(): JsonField<String> = code

    /**
     * Returns the raw JSON value of [decimals].
     *
     * Unlike [decimals], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("decimals") @ExcludeMissing fun _decimals(): JsonField<Long> = decimals

    /**
     * Returns the raw JSON value of [name].
     *
     * Unlike [name], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("name") @ExcludeMissing fun _name(): JsonField<String> = name

    /**
     * Returns the raw JSON value of [symbol].
     *
     * Unlike [symbol], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("symbol") @ExcludeMissing fun _symbol(): JsonField<String> = symbol

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

        /** Returns a mutable builder for constructing an instance of [Currency]. */
        fun builder() = Builder()
    }

    /** A builder for [Currency]. */
    class Builder internal constructor() {

        private var code: JsonField<String> = JsonMissing.of()
        private var decimals: JsonField<Long> = JsonMissing.of()
        private var name: JsonField<String> = JsonMissing.of()
        private var symbol: JsonField<String> = JsonMissing.of()
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(currency: Currency) = apply {
            code = currency.code
            decimals = currency.decimals
            name = currency.name
            symbol = currency.symbol
            additionalProperties = currency.additionalProperties.toMutableMap()
        }

        /**
         * Three-letter currency code (ISO 4217) for fiat currencies. Some cryptocurrencies may use
         * their own ticker symbols (e.g. "BTC" for Bitcoin, "USDC" for USDC, etc.)
         */
        fun code(code: String) = code(JsonField.of(code))

        /**
         * Sets [Builder.code] to an arbitrary JSON value.
         *
         * You should usually call [Builder.code] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun code(code: JsonField<String>) = apply { this.code = code }

        /** Number of decimal places for the currency */
        fun decimals(decimals: Long) = decimals(JsonField.of(decimals))

        /**
         * Sets [Builder.decimals] to an arbitrary JSON value.
         *
         * You should usually call [Builder.decimals] with a well-typed [Long] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun decimals(decimals: JsonField<Long>) = apply { this.decimals = decimals }

        /** Full name of the currency */
        fun name(name: String) = name(JsonField.of(name))

        /**
         * Sets [Builder.name] to an arbitrary JSON value.
         *
         * You should usually call [Builder.name] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun name(name: JsonField<String>) = apply { this.name = name }

        /** Symbol of the currency */
        fun symbol(symbol: String) = symbol(JsonField.of(symbol))

        /**
         * Sets [Builder.symbol] to an arbitrary JSON value.
         *
         * You should usually call [Builder.symbol] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun symbol(symbol: JsonField<String>) = apply { this.symbol = symbol }

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
         * Returns an immutable instance of [Currency].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         */
        fun build(): Currency =
            Currency(code, decimals, name, symbol, additionalProperties.toMutableMap())
    }

    private var validated: Boolean = false

    fun validate(): Currency = apply {
        if (validated) {
            return@apply
        }

        code()
        decimals()
        name()
        symbol()
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
        (if (code.asKnown() == null) 0 else 1) +
            (if (decimals.asKnown() == null) 0 else 1) +
            (if (name.asKnown() == null) 0 else 1) +
            (if (symbol.asKnown() == null) 0 else 1)

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is Currency &&
            code == other.code &&
            decimals == other.decimals &&
            name == other.name &&
            symbol == other.symbol &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(code, decimals, name, symbol, additionalProperties)
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "Currency{code=$code, decimals=$decimals, name=$name, symbol=$symbol, additionalProperties=$additionalProperties}"
}
