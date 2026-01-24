// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.transactions

import com.fasterxml.jackson.annotation.JsonAnyGetter
import com.fasterxml.jackson.annotation.JsonAnySetter
import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.grid.api.core.ExcludeMissing
import com.grid.api.core.JsonField
import com.grid.api.core.JsonMissing
import com.grid.api.core.JsonValue
import com.grid.api.core.checkRequired
import com.grid.api.errors.GridInvalidDataException
import java.util.Collections
import java.util.Objects

/** Source account details */
class AccountSource
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val accountId: JsonField<String>,
    private val currency: JsonField<String>,
    private val sourceType: JsonValue,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("accountId") @ExcludeMissing accountId: JsonField<String> = JsonMissing.of(),
        @JsonProperty("currency") @ExcludeMissing currency: JsonField<String> = JsonMissing.of(),
        @JsonProperty("sourceType") @ExcludeMissing sourceType: JsonValue = JsonMissing.of(),
    ) : this(accountId, currency, sourceType, mutableMapOf())

    /**
     * Source account identifier
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun accountId(): String = accountId.getRequired("accountId")

    /**
     * Currency code for the source account
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun currency(): String = currency.getRequired("currency")

    /**
     * Source type identifier
     *
     * Expected to always return the following:
     * ```kotlin
     * JsonValue.from("ACCOUNT")
     * ```
     *
     * However, this method can be useful for debugging and logging (e.g. if the server responded
     * with an unexpected value).
     */
    @JsonProperty("sourceType") @ExcludeMissing fun _sourceType(): JsonValue = sourceType

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
        private var sourceType: JsonValue = JsonValue.from("ACCOUNT")
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(accountSource: AccountSource) = apply {
            accountId = accountSource.accountId
            currency = accountSource.currency
            sourceType = accountSource.sourceType
            additionalProperties = accountSource.additionalProperties.toMutableMap()
        }

        /** Source account identifier */
        fun accountId(accountId: String) = accountId(JsonField.of(accountId))

        /**
         * Sets [Builder.accountId] to an arbitrary JSON value.
         *
         * You should usually call [Builder.accountId] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun accountId(accountId: JsonField<String>) = apply { this.accountId = accountId }

        /** Currency code for the source account */
        fun currency(currency: String) = currency(JsonField.of(currency))

        /**
         * Sets [Builder.currency] to an arbitrary JSON value.
         *
         * You should usually call [Builder.currency] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun currency(currency: JsonField<String>) = apply { this.currency = currency }

        /**
         * Sets the field to an arbitrary JSON value.
         *
         * It is usually unnecessary to call this method because the field defaults to the
         * following:
         * ```kotlin
         * JsonValue.from("ACCOUNT")
         * ```
         *
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun sourceType(sourceType: JsonValue) = apply { this.sourceType = sourceType }

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
                sourceType,
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
        _sourceType().let {
            if (it != JsonValue.from("ACCOUNT")) {
                throw GridInvalidDataException("'sourceType' is invalid, received $it")
            }
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
     * Returns a score indicating how many valid values are contained in this object recursively.
     *
     * Used for best match union deserialization.
     */
    internal fun validity(): Int =
        (if (accountId.asKnown() == null) 0 else 1) +
            (if (currency.asKnown() == null) 0 else 1) +
            sourceType.let { if (it == JsonValue.from("ACCOUNT")) 1 else 0 }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is AccountSource &&
            accountId == other.accountId &&
            currency == other.currency &&
            sourceType == other.sourceType &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(accountId, currency, sourceType, additionalProperties)
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "AccountSource{accountId=$accountId, currency=$currency, sourceType=$sourceType, additionalProperties=$additionalProperties}"
}
