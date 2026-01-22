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

class UpiAccountInfo
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val accountType: JsonValue,
    private val vpa: JsonField<String>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("accountType") @ExcludeMissing accountType: JsonValue = JsonMissing.of(),
        @JsonProperty("vpa") @ExcludeMissing vpa: JsonField<String> = JsonMissing.of(),
    ) : this(accountType, vpa, mutableMapOf())

    /**
     * Expected to always return the following:
     * ```kotlin
     * JsonValue.from("UPI")
     * ```
     *
     * However, this method can be useful for debugging and logging (e.g. if the server responded
     * with an unexpected value).
     */
    @JsonProperty("accountType") @ExcludeMissing fun _accountType(): JsonValue = accountType

    /**
     * Virtual Payment Address for UPI payments
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun vpa(): String = vpa.getRequired("vpa")

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
         * Returns a mutable builder for constructing an instance of [UpiAccountInfo].
         *
         * The following fields are required:
         * ```kotlin
         * .vpa()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [UpiAccountInfo]. */
    class Builder internal constructor() {

        private var accountType: JsonValue = JsonValue.from("UPI")
        private var vpa: JsonField<String>? = null
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(upiAccountInfo: UpiAccountInfo) = apply {
            accountType = upiAccountInfo.accountType
            vpa = upiAccountInfo.vpa
            additionalProperties = upiAccountInfo.additionalProperties.toMutableMap()
        }

        /**
         * Sets the field to an arbitrary JSON value.
         *
         * It is usually unnecessary to call this method because the field defaults to the
         * following:
         * ```kotlin
         * JsonValue.from("UPI")
         * ```
         *
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun accountType(accountType: JsonValue) = apply { this.accountType = accountType }

        /** Virtual Payment Address for UPI payments */
        fun vpa(vpa: String) = vpa(JsonField.of(vpa))

        /**
         * Sets [Builder.vpa] to an arbitrary JSON value.
         *
         * You should usually call [Builder.vpa] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun vpa(vpa: JsonField<String>) = apply { this.vpa = vpa }

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
         * Returns an immutable instance of [UpiAccountInfo].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .vpa()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): UpiAccountInfo =
            UpiAccountInfo(
                accountType,
                checkRequired("vpa", vpa),
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): UpiAccountInfo = apply {
        if (validated) {
            return@apply
        }

        _accountType().let {
            if (it != JsonValue.from("UPI")) {
                throw GridInvalidDataException("'accountType' is invalid, received $it")
            }
        }
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
     * Returns a score indicating how many valid values are contained in this object recursively.
     *
     * Used for best match union deserialization.
     */
    internal fun validity(): Int =
        accountType.let { if (it == JsonValue.from("UPI")) 1 else 0 } +
            (if (vpa.asKnown() == null) 0 else 1)

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is UpiAccountInfo &&
            accountType == other.accountType &&
            vpa == other.vpa &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy { Objects.hash(accountType, vpa, additionalProperties) }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "UpiAccountInfo{accountType=$accountType, vpa=$vpa, additionalProperties=$additionalProperties}"
}
