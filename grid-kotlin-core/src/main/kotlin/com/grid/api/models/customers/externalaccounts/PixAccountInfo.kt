// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.fasterxml.jackson.annotation.JsonAnyGetter
import com.fasterxml.jackson.annotation.JsonAnySetter
import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.grid.api.core.Enum
import com.grid.api.core.ExcludeMissing
import com.grid.api.core.JsonField
import com.grid.api.core.JsonMissing
import com.grid.api.core.JsonValue
import com.grid.api.core.checkRequired
import com.grid.api.errors.GridInvalidDataException
import java.util.Collections
import java.util.Objects

class PixAccountInfo
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val accountType: JsonValue,
    private val pixKey: JsonField<String>,
    private val pixKeyType: JsonField<PixKeyType>,
    private val taxId: JsonField<String>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("accountType") @ExcludeMissing accountType: JsonValue = JsonMissing.of(),
        @JsonProperty("pixKey") @ExcludeMissing pixKey: JsonField<String> = JsonMissing.of(),
        @JsonProperty("pixKeyType")
        @ExcludeMissing
        pixKeyType: JsonField<PixKeyType> = JsonMissing.of(),
        @JsonProperty("taxId") @ExcludeMissing taxId: JsonField<String> = JsonMissing.of(),
    ) : this(accountType, pixKey, pixKeyType, taxId, mutableMapOf())

    /**
     * Expected to always return the following:
     * ```kotlin
     * JsonValue.from("PIX")
     * ```
     *
     * However, this method can be useful for debugging and logging (e.g. if the server responded
     * with an unexpected value).
     */
    @JsonProperty("accountType") @ExcludeMissing fun _accountType(): JsonValue = accountType

    /**
     * PIX key for Brazilian instant payments
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun pixKey(): String = pixKey.getRequired("pixKey")

    /**
     * Type of PIX key being used
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun pixKeyType(): PixKeyType = pixKeyType.getRequired("pixKeyType")

    /**
     * Tax ID of the account holder
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun taxId(): String = taxId.getRequired("taxId")

    /**
     * Returns the raw JSON value of [pixKey].
     *
     * Unlike [pixKey], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("pixKey") @ExcludeMissing fun _pixKey(): JsonField<String> = pixKey

    /**
     * Returns the raw JSON value of [pixKeyType].
     *
     * Unlike [pixKeyType], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("pixKeyType")
    @ExcludeMissing
    fun _pixKeyType(): JsonField<PixKeyType> = pixKeyType

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
         * Returns a mutable builder for constructing an instance of [PixAccountInfo].
         *
         * The following fields are required:
         * ```kotlin
         * .pixKey()
         * .pixKeyType()
         * .taxId()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [PixAccountInfo]. */
    class Builder internal constructor() {

        private var accountType: JsonValue = JsonValue.from("PIX")
        private var pixKey: JsonField<String>? = null
        private var pixKeyType: JsonField<PixKeyType>? = null
        private var taxId: JsonField<String>? = null
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(pixAccountInfo: PixAccountInfo) = apply {
            accountType = pixAccountInfo.accountType
            pixKey = pixAccountInfo.pixKey
            pixKeyType = pixAccountInfo.pixKeyType
            taxId = pixAccountInfo.taxId
            additionalProperties = pixAccountInfo.additionalProperties.toMutableMap()
        }

        /**
         * Sets the field to an arbitrary JSON value.
         *
         * It is usually unnecessary to call this method because the field defaults to the
         * following:
         * ```kotlin
         * JsonValue.from("PIX")
         * ```
         *
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun accountType(accountType: JsonValue) = apply { this.accountType = accountType }

        /** PIX key for Brazilian instant payments */
        fun pixKey(pixKey: String) = pixKey(JsonField.of(pixKey))

        /**
         * Sets [Builder.pixKey] to an arbitrary JSON value.
         *
         * You should usually call [Builder.pixKey] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun pixKey(pixKey: JsonField<String>) = apply { this.pixKey = pixKey }

        /** Type of PIX key being used */
        fun pixKeyType(pixKeyType: PixKeyType) = pixKeyType(JsonField.of(pixKeyType))

        /**
         * Sets [Builder.pixKeyType] to an arbitrary JSON value.
         *
         * You should usually call [Builder.pixKeyType] with a well-typed [PixKeyType] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun pixKeyType(pixKeyType: JsonField<PixKeyType>) = apply { this.pixKeyType = pixKeyType }

        /** Tax ID of the account holder */
        fun taxId(taxId: String) = taxId(JsonField.of(taxId))

        /**
         * Sets [Builder.taxId] to an arbitrary JSON value.
         *
         * You should usually call [Builder.taxId] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun taxId(taxId: JsonField<String>) = apply { this.taxId = taxId }

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
         * Returns an immutable instance of [PixAccountInfo].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .pixKey()
         * .pixKeyType()
         * .taxId()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): PixAccountInfo =
            PixAccountInfo(
                accountType,
                checkRequired("pixKey", pixKey),
                checkRequired("pixKeyType", pixKeyType),
                checkRequired("taxId", taxId),
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): PixAccountInfo = apply {
        if (validated) {
            return@apply
        }

        _accountType().let {
            if (it != JsonValue.from("PIX")) {
                throw GridInvalidDataException("'accountType' is invalid, received $it")
            }
        }
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
     * Returns a score indicating how many valid values are contained in this object recursively.
     *
     * Used for best match union deserialization.
     */
    internal fun validity(): Int =
        accountType.let { if (it == JsonValue.from("PIX")) 1 else 0 } +
            (if (pixKey.asKnown() == null) 0 else 1) +
            (pixKeyType.asKnown()?.validity() ?: 0) +
            (if (taxId.asKnown() == null) 0 else 1)

    /** Type of PIX key being used */
    class PixKeyType @JsonCreator private constructor(private val value: JsonField<String>) : Enum {

        /**
         * Returns this class instance's raw value.
         *
         * This is usually only useful if this instance was deserialized from data that doesn't
         * match any known member, and you want to know that value. For example, if the SDK is on an
         * older version than the API, then the API may respond with new members that the SDK is
         * unaware of.
         */
        @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

        companion object {

            val CPF = of("CPF")

            val CNPJ = of("CNPJ")

            val EMAIL = of("EMAIL")

            val PHONE = of("PHONE")

            val RANDOM = of("RANDOM")

            fun of(value: String) = PixKeyType(JsonField.of(value))
        }

        /** An enum containing [PixKeyType]'s known values. */
        enum class Known {
            CPF,
            CNPJ,
            EMAIL,
            PHONE,
            RANDOM,
        }

        /**
         * An enum containing [PixKeyType]'s known values, as well as an [_UNKNOWN] member.
         *
         * An instance of [PixKeyType] can contain an unknown value in a couple of cases:
         * - It was deserialized from data that doesn't match any known member. For example, if the
         *   SDK is on an older version than the API, then the API may respond with new members that
         *   the SDK is unaware of.
         * - It was constructed with an arbitrary value using the [of] method.
         */
        enum class Value {
            CPF,
            CNPJ,
            EMAIL,
            PHONE,
            RANDOM,
            /**
             * An enum member indicating that [PixKeyType] was instantiated with an unknown value.
             */
            _UNKNOWN,
        }

        /**
         * Returns an enum member corresponding to this class instance's value, or [Value._UNKNOWN]
         * if the class was instantiated with an unknown value.
         *
         * Use the [known] method instead if you're certain the value is always known or if you want
         * to throw for the unknown case.
         */
        fun value(): Value =
            when (this) {
                CPF -> Value.CPF
                CNPJ -> Value.CNPJ
                EMAIL -> Value.EMAIL
                PHONE -> Value.PHONE
                RANDOM -> Value.RANDOM
                else -> Value._UNKNOWN
            }

        /**
         * Returns an enum member corresponding to this class instance's value.
         *
         * Use the [value] method instead if you're uncertain the value is always known and don't
         * want to throw for the unknown case.
         *
         * @throws GridInvalidDataException if this class instance's value is a not a known member.
         */
        fun known(): Known =
            when (this) {
                CPF -> Known.CPF
                CNPJ -> Known.CNPJ
                EMAIL -> Known.EMAIL
                PHONE -> Known.PHONE
                RANDOM -> Known.RANDOM
                else -> throw GridInvalidDataException("Unknown PixKeyType: $value")
            }

        /**
         * Returns this class instance's primitive wire representation.
         *
         * This differs from the [toString] method because that method is primarily for debugging
         * and generally doesn't throw.
         *
         * @throws GridInvalidDataException if this class instance's value does not have the
         *   expected primitive type.
         */
        fun asString(): String =
            _value().asString() ?: throw GridInvalidDataException("Value is not a String")

        private var validated: Boolean = false

        fun validate(): PixKeyType = apply {
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

            return other is PixKeyType && value == other.value
        }

        override fun hashCode() = value.hashCode()

        override fun toString() = value.toString()
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is PixAccountInfo &&
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
        "PixAccountInfo{accountType=$accountType, pixKey=$pixKey, pixKeyType=$pixKeyType, taxId=$taxId, additionalProperties=$additionalProperties}"
}
