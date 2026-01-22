// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

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

class IbanAccountInfo
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val accountType: JsonValue,
    private val iban: JsonField<String>,
    private val swiftBic: JsonField<String>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("accountType") @ExcludeMissing accountType: JsonValue = JsonMissing.of(),
        @JsonProperty("iban") @ExcludeMissing iban: JsonField<String> = JsonMissing.of(),
        @JsonProperty("swiftBic") @ExcludeMissing swiftBic: JsonField<String> = JsonMissing.of(),
    ) : this(accountType, iban, swiftBic, mutableMapOf())

    /**
     * Expected to always return the following:
     * ```kotlin
     * JsonValue.from("IBAN")
     * ```
     *
     * However, this method can be useful for debugging and logging (e.g. if the server responded
     * with an unexpected value).
     */
    @JsonProperty("accountType") @ExcludeMissing fun _accountType(): JsonValue = accountType

    /**
     * International Bank Account Number
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun iban(): String = iban.getRequired("iban")

    /**
     * SWIFT/BIC code (8 or 11 characters)
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun swiftBic(): String = swiftBic.getRequired("swiftBic")

    /**
     * Returns the raw JSON value of [iban].
     *
     * Unlike [iban], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("iban") @ExcludeMissing fun _iban(): JsonField<String> = iban

    /**
     * Returns the raw JSON value of [swiftBic].
     *
     * Unlike [swiftBic], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("swiftBic") @ExcludeMissing fun _swiftBic(): JsonField<String> = swiftBic

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
         * Returns a mutable builder for constructing an instance of [IbanAccountInfo].
         *
         * The following fields are required:
         * ```kotlin
         * .iban()
         * .swiftBic()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [IbanAccountInfo]. */
    class Builder internal constructor() {

        private var accountType: JsonValue = JsonValue.from("IBAN")
        private var iban: JsonField<String>? = null
        private var swiftBic: JsonField<String>? = null
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(ibanAccountInfo: IbanAccountInfo) = apply {
            accountType = ibanAccountInfo.accountType
            iban = ibanAccountInfo.iban
            swiftBic = ibanAccountInfo.swiftBic
            additionalProperties = ibanAccountInfo.additionalProperties.toMutableMap()
        }

        /**
         * Sets the field to an arbitrary JSON value.
         *
         * It is usually unnecessary to call this method because the field defaults to the
         * following:
         * ```kotlin
         * JsonValue.from("IBAN")
         * ```
         *
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun accountType(accountType: JsonValue) = apply { this.accountType = accountType }

        /** International Bank Account Number */
        fun iban(iban: String) = iban(JsonField.of(iban))

        /**
         * Sets [Builder.iban] to an arbitrary JSON value.
         *
         * You should usually call [Builder.iban] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun iban(iban: JsonField<String>) = apply { this.iban = iban }

        /** SWIFT/BIC code (8 or 11 characters) */
        fun swiftBic(swiftBic: String) = swiftBic(JsonField.of(swiftBic))

        /**
         * Sets [Builder.swiftBic] to an arbitrary JSON value.
         *
         * You should usually call [Builder.swiftBic] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun swiftBic(swiftBic: JsonField<String>) = apply { this.swiftBic = swiftBic }

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
         * Returns an immutable instance of [IbanAccountInfo].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .iban()
         * .swiftBic()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): IbanAccountInfo =
            IbanAccountInfo(
                accountType,
                checkRequired("iban", iban),
                checkRequired("swiftBic", swiftBic),
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): IbanAccountInfo = apply {
        if (validated) {
            return@apply
        }

        _accountType().let {
            if (it != JsonValue.from("IBAN")) {
                throw GridInvalidDataException("'accountType' is invalid, received $it")
            }
        }
        iban()
        swiftBic()
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
        accountType.let { if (it == JsonValue.from("IBAN")) 1 else 0 } +
            (if (iban.asKnown() == null) 0 else 1) +
            (if (swiftBic.asKnown() == null) 0 else 1)

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is IbanAccountInfo &&
            accountType == other.accountType &&
            iban == other.iban &&
            swiftBic == other.swiftBic &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(accountType, iban, swiftBic, additionalProperties)
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "IbanAccountInfo{accountType=$accountType, iban=$iban, swiftBic=$swiftBic, additionalProperties=$additionalProperties}"
}
