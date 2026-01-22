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

class SolanaWalletInfo
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val accountType: JsonValue,
    private val address: JsonField<String>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("accountType") @ExcludeMissing accountType: JsonValue = JsonMissing.of(),
        @JsonProperty("address") @ExcludeMissing address: JsonField<String> = JsonMissing.of(),
    ) : this(accountType, address, mutableMapOf())

    /**
     * Expected to always return the following:
     * ```kotlin
     * JsonValue.from("SOLANA_WALLET")
     * ```
     *
     * However, this method can be useful for debugging and logging (e.g. if the server responded
     * with an unexpected value).
     */
    @JsonProperty("accountType") @ExcludeMissing fun _accountType(): JsonValue = accountType

    /**
     * Solana wallet address
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun address(): String = address.getRequired("address")

    /**
     * Returns the raw JSON value of [address].
     *
     * Unlike [address], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("address") @ExcludeMissing fun _address(): JsonField<String> = address

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
         * Returns a mutable builder for constructing an instance of [SolanaWalletInfo].
         *
         * The following fields are required:
         * ```kotlin
         * .address()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [SolanaWalletInfo]. */
    class Builder internal constructor() {

        private var accountType: JsonValue = JsonValue.from("SOLANA_WALLET")
        private var address: JsonField<String>? = null
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(solanaWalletInfo: SolanaWalletInfo) = apply {
            accountType = solanaWalletInfo.accountType
            address = solanaWalletInfo.address
            additionalProperties = solanaWalletInfo.additionalProperties.toMutableMap()
        }

        /**
         * Sets the field to an arbitrary JSON value.
         *
         * It is usually unnecessary to call this method because the field defaults to the
         * following:
         * ```kotlin
         * JsonValue.from("SOLANA_WALLET")
         * ```
         *
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun accountType(accountType: JsonValue) = apply { this.accountType = accountType }

        /** Solana wallet address */
        fun address(address: String) = address(JsonField.of(address))

        /**
         * Sets [Builder.address] to an arbitrary JSON value.
         *
         * You should usually call [Builder.address] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun address(address: JsonField<String>) = apply { this.address = address }

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
         * Returns an immutable instance of [SolanaWalletInfo].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .address()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): SolanaWalletInfo =
            SolanaWalletInfo(
                accountType,
                checkRequired("address", address),
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): SolanaWalletInfo = apply {
        if (validated) {
            return@apply
        }

        _accountType().let {
            if (it != JsonValue.from("SOLANA_WALLET")) {
                throw GridInvalidDataException("'accountType' is invalid, received $it")
            }
        }
        address()
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
        accountType.let { if (it == JsonValue.from("SOLANA_WALLET")) 1 else 0 } +
            (if (address.asKnown() == null) 0 else 1)

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is SolanaWalletInfo &&
            accountType == other.accountType &&
            address == other.address &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy { Objects.hash(accountType, address, additionalProperties) }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "SolanaWalletInfo{accountType=$accountType, address=$address, additionalProperties=$additionalProperties}"
}
