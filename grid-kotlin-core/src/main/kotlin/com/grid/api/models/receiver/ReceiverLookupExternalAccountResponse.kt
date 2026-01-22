// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.receiver

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
import java.util.Collections
import java.util.Objects

class ReceiverLookupExternalAccountResponse
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val lookupId: JsonField<String>,
    private val supportedCurrencies: JsonField<List<LookupResponse.SupportedCurrency>>,
    private val requiredPayerDataFields: JsonField<List<CounterpartyFieldDefinition>>,
    private val accountId: JsonField<String>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("lookupId") @ExcludeMissing lookupId: JsonField<String> = JsonMissing.of(),
        @JsonProperty("supportedCurrencies")
        @ExcludeMissing
        supportedCurrencies: JsonField<List<LookupResponse.SupportedCurrency>> = JsonMissing.of(),
        @JsonProperty("requiredPayerDataFields")
        @ExcludeMissing
        requiredPayerDataFields: JsonField<List<CounterpartyFieldDefinition>> = JsonMissing.of(),
        @JsonProperty("accountId") @ExcludeMissing accountId: JsonField<String> = JsonMissing.of(),
    ) : this(lookupId, supportedCurrencies, requiredPayerDataFields, accountId, mutableMapOf())

    fun toLookupResponse(): LookupResponse =
        LookupResponse.builder()
            .lookupId(lookupId)
            .supportedCurrencies(supportedCurrencies)
            .requiredPayerDataFields(requiredPayerDataFields)
            .build()

    /**
     * Unique identifier for the lookup. Needed in the subsequent create quote request.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun lookupId(): String = lookupId.getRequired("lookupId")

    /**
     * List of currencies supported by the receiving account
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun supportedCurrencies(): List<LookupResponse.SupportedCurrency> =
        supportedCurrencies.getRequired("supportedCurrencies")

    /**
     * Fields required by the receiving institution about the payer before payment can be completed
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun requiredPayerDataFields(): List<CounterpartyFieldDefinition>? =
        requiredPayerDataFields.getNullable("requiredPayerDataFields")

    /**
     * The external account ID that was looked up
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun accountId(): String = accountId.getRequired("accountId")

    /**
     * Returns the raw JSON value of [lookupId].
     *
     * Unlike [lookupId], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("lookupId") @ExcludeMissing fun _lookupId(): JsonField<String> = lookupId

    /**
     * Returns the raw JSON value of [supportedCurrencies].
     *
     * Unlike [supportedCurrencies], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    @JsonProperty("supportedCurrencies")
    @ExcludeMissing
    fun _supportedCurrencies(): JsonField<List<LookupResponse.SupportedCurrency>> =
        supportedCurrencies

    /**
     * Returns the raw JSON value of [requiredPayerDataFields].
     *
     * Unlike [requiredPayerDataFields], this method doesn't throw if the JSON field has an
     * unexpected type.
     */
    @JsonProperty("requiredPayerDataFields")
    @ExcludeMissing
    fun _requiredPayerDataFields(): JsonField<List<CounterpartyFieldDefinition>> =
        requiredPayerDataFields

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
         * Returns a mutable builder for constructing an instance of
         * [ReceiverLookupExternalAccountResponse].
         *
         * The following fields are required:
         * ```kotlin
         * .lookupId()
         * .supportedCurrencies()
         * .accountId()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [ReceiverLookupExternalAccountResponse]. */
    class Builder internal constructor() {

        private var lookupId: JsonField<String>? = null
        private var supportedCurrencies: JsonField<MutableList<LookupResponse.SupportedCurrency>>? =
            null
        private var requiredPayerDataFields: JsonField<MutableList<CounterpartyFieldDefinition>>? =
            null
        private var accountId: JsonField<String>? = null
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(
            receiverLookupExternalAccountResponse: ReceiverLookupExternalAccountResponse
        ) = apply {
            lookupId = receiverLookupExternalAccountResponse.lookupId
            supportedCurrencies =
                receiverLookupExternalAccountResponse.supportedCurrencies.map { it.toMutableList() }
            requiredPayerDataFields =
                receiverLookupExternalAccountResponse.requiredPayerDataFields.map {
                    it.toMutableList()
                }
            accountId = receiverLookupExternalAccountResponse.accountId
            additionalProperties =
                receiverLookupExternalAccountResponse.additionalProperties.toMutableMap()
        }

        /** Unique identifier for the lookup. Needed in the subsequent create quote request. */
        fun lookupId(lookupId: String) = lookupId(JsonField.of(lookupId))

        /**
         * Sets [Builder.lookupId] to an arbitrary JSON value.
         *
         * You should usually call [Builder.lookupId] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun lookupId(lookupId: JsonField<String>) = apply { this.lookupId = lookupId }

        /** List of currencies supported by the receiving account */
        fun supportedCurrencies(supportedCurrencies: List<LookupResponse.SupportedCurrency>) =
            supportedCurrencies(JsonField.of(supportedCurrencies))

        /**
         * Sets [Builder.supportedCurrencies] to an arbitrary JSON value.
         *
         * You should usually call [Builder.supportedCurrencies] with a well-typed
         * `List<LookupResponse.SupportedCurrency>` value instead. This method is primarily for
         * setting the field to an undocumented or not yet supported value.
         */
        fun supportedCurrencies(
            supportedCurrencies: JsonField<List<LookupResponse.SupportedCurrency>>
        ) = apply { this.supportedCurrencies = supportedCurrencies.map { it.toMutableList() } }

        /**
         * Adds a single [LookupResponse.SupportedCurrency] to [supportedCurrencies].
         *
         * @throws IllegalStateException if the field was previously set to a non-list.
         */
        fun addSupportedCurrency(supportedCurrency: LookupResponse.SupportedCurrency) = apply {
            supportedCurrencies =
                (supportedCurrencies ?: JsonField.of(mutableListOf())).also {
                    checkKnown("supportedCurrencies", it).add(supportedCurrency)
                }
        }

        /**
         * Fields required by the receiving institution about the payer before payment can be
         * completed
         */
        fun requiredPayerDataFields(requiredPayerDataFields: List<CounterpartyFieldDefinition>) =
            requiredPayerDataFields(JsonField.of(requiredPayerDataFields))

        /**
         * Sets [Builder.requiredPayerDataFields] to an arbitrary JSON value.
         *
         * You should usually call [Builder.requiredPayerDataFields] with a well-typed
         * `List<CounterpartyFieldDefinition>` value instead. This method is primarily for setting
         * the field to an undocumented or not yet supported value.
         */
        fun requiredPayerDataFields(
            requiredPayerDataFields: JsonField<List<CounterpartyFieldDefinition>>
        ) = apply {
            this.requiredPayerDataFields = requiredPayerDataFields.map { it.toMutableList() }
        }

        /**
         * Adds a single [CounterpartyFieldDefinition] to [requiredPayerDataFields].
         *
         * @throws IllegalStateException if the field was previously set to a non-list.
         */
        fun addRequiredPayerDataField(requiredPayerDataField: CounterpartyFieldDefinition) = apply {
            requiredPayerDataFields =
                (requiredPayerDataFields ?: JsonField.of(mutableListOf())).also {
                    checkKnown("requiredPayerDataFields", it).add(requiredPayerDataField)
                }
        }

        /** The external account ID that was looked up */
        fun accountId(accountId: String) = accountId(JsonField.of(accountId))

        /**
         * Sets [Builder.accountId] to an arbitrary JSON value.
         *
         * You should usually call [Builder.accountId] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
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
         * Returns an immutable instance of [ReceiverLookupExternalAccountResponse].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .lookupId()
         * .supportedCurrencies()
         * .accountId()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): ReceiverLookupExternalAccountResponse =
            ReceiverLookupExternalAccountResponse(
                checkRequired("lookupId", lookupId),
                checkRequired("supportedCurrencies", supportedCurrencies).map { it.toImmutable() },
                (requiredPayerDataFields ?: JsonMissing.of()).map { it.toImmutable() },
                checkRequired("accountId", accountId),
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): ReceiverLookupExternalAccountResponse = apply {
        if (validated) {
            return@apply
        }

        lookupId()
        supportedCurrencies().forEach { it.validate() }
        requiredPayerDataFields()?.forEach { it.validate() }
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
     * Returns a score indicating how many valid values are contained in this object recursively.
     *
     * Used for best match union deserialization.
     */
    internal fun validity(): Int =
        (if (lookupId.asKnown() == null) 0 else 1) +
            (supportedCurrencies.asKnown()?.sumOf { it.validity().toInt() } ?: 0) +
            (requiredPayerDataFields.asKnown()?.sumOf { it.validity().toInt() } ?: 0) +
            (if (accountId.asKnown() == null) 0 else 1)

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is ReceiverLookupExternalAccountResponse &&
            lookupId == other.lookupId &&
            supportedCurrencies == other.supportedCurrencies &&
            requiredPayerDataFields == other.requiredPayerDataFields &&
            accountId == other.accountId &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(
            lookupId,
            supportedCurrencies,
            requiredPayerDataFields,
            accountId,
            additionalProperties,
        )
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "ReceiverLookupExternalAccountResponse{lookupId=$lookupId, supportedCurrencies=$supportedCurrencies, requiredPayerDataFields=$requiredPayerDataFields, accountId=$accountId, additionalProperties=$additionalProperties}"
}
