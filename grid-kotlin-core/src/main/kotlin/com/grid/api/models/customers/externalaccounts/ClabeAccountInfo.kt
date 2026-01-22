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

class ClabeAccountInfo
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val accountType: JsonValue,
    private val clabeNumber: JsonField<String>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("accountType") @ExcludeMissing accountType: JsonValue = JsonMissing.of(),
        @JsonProperty("clabeNumber")
        @ExcludeMissing
        clabeNumber: JsonField<String> = JsonMissing.of(),
    ) : this(accountType, clabeNumber, mutableMapOf())

    /**
     * Expected to always return the following:
     * ```kotlin
     * JsonValue.from("CLABE")
     * ```
     *
     * However, this method can be useful for debugging and logging (e.g. if the server responded
     * with an unexpected value).
     */
    @JsonProperty("accountType") @ExcludeMissing fun _accountType(): JsonValue = accountType

    /**
     * 18-digit CLABE number (Mexican banking standard)
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun clabeNumber(): String = clabeNumber.getRequired("clabeNumber")

    /**
     * Returns the raw JSON value of [clabeNumber].
     *
     * Unlike [clabeNumber], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("clabeNumber") @ExcludeMissing fun _clabeNumber(): JsonField<String> = clabeNumber

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
         * Returns a mutable builder for constructing an instance of [ClabeAccountInfo].
         *
         * The following fields are required:
         * ```kotlin
         * .clabeNumber()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [ClabeAccountInfo]. */
    class Builder internal constructor() {

        private var accountType: JsonValue = JsonValue.from("CLABE")
        private var clabeNumber: JsonField<String>? = null
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(clabeAccountInfo: ClabeAccountInfo) = apply {
            accountType = clabeAccountInfo.accountType
            clabeNumber = clabeAccountInfo.clabeNumber
            additionalProperties = clabeAccountInfo.additionalProperties.toMutableMap()
        }

        /**
         * Sets the field to an arbitrary JSON value.
         *
         * It is usually unnecessary to call this method because the field defaults to the
         * following:
         * ```kotlin
         * JsonValue.from("CLABE")
         * ```
         *
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun accountType(accountType: JsonValue) = apply { this.accountType = accountType }

        /** 18-digit CLABE number (Mexican banking standard) */
        fun clabeNumber(clabeNumber: String) = clabeNumber(JsonField.of(clabeNumber))

        /**
         * Sets [Builder.clabeNumber] to an arbitrary JSON value.
         *
         * You should usually call [Builder.clabeNumber] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun clabeNumber(clabeNumber: JsonField<String>) = apply { this.clabeNumber = clabeNumber }

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
         * Returns an immutable instance of [ClabeAccountInfo].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .clabeNumber()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): ClabeAccountInfo =
            ClabeAccountInfo(
                accountType,
                checkRequired("clabeNumber", clabeNumber),
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): ClabeAccountInfo = apply {
        if (validated) {
            return@apply
        }

        _accountType().let {
            if (it != JsonValue.from("CLABE")) {
                throw GridInvalidDataException("'accountType' is invalid, received $it")
            }
        }
        clabeNumber()
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
        accountType.let { if (it == JsonValue.from("CLABE")) 1 else 0 } +
            (if (clabeNumber.asKnown() == null) 0 else 1)

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is ClabeAccountInfo &&
            accountType == other.accountType &&
            clabeNumber == other.clabeNumber &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(accountType, clabeNumber, additionalProperties)
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "ClabeAccountInfo{accountType=$accountType, clabeNumber=$clabeNumber, additionalProperties=$additionalProperties}"
}
