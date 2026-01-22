// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.platform.externalaccounts

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
import com.grid.api.models.customers.externalaccounts.ExternalAccount
import java.util.Collections
import java.util.Objects

class ExternalAccountListResponse
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val accounts: JsonField<List<ExternalAccount>>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("accounts")
        @ExcludeMissing
        accounts: JsonField<List<ExternalAccount>> = JsonMissing.of()
    ) : this(accounts, mutableMapOf())

    /**
     * List of external accounts matching the filter criteria
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun accounts(): List<ExternalAccount> = accounts.getRequired("accounts")

    /**
     * Returns the raw JSON value of [accounts].
     *
     * Unlike [accounts], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("accounts")
    @ExcludeMissing
    fun _accounts(): JsonField<List<ExternalAccount>> = accounts

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
         * Returns a mutable builder for constructing an instance of [ExternalAccountListResponse].
         *
         * The following fields are required:
         * ```kotlin
         * .accounts()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [ExternalAccountListResponse]. */
    class Builder internal constructor() {

        private var accounts: JsonField<MutableList<ExternalAccount>>? = null
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(externalAccountListResponse: ExternalAccountListResponse) = apply {
            accounts = externalAccountListResponse.accounts.map { it.toMutableList() }
            additionalProperties = externalAccountListResponse.additionalProperties.toMutableMap()
        }

        /** List of external accounts matching the filter criteria */
        fun accounts(accounts: List<ExternalAccount>) = accounts(JsonField.of(accounts))

        /**
         * Sets [Builder.accounts] to an arbitrary JSON value.
         *
         * You should usually call [Builder.accounts] with a well-typed `List<ExternalAccount>`
         * value instead. This method is primarily for setting the field to an undocumented or not
         * yet supported value.
         */
        fun accounts(accounts: JsonField<List<ExternalAccount>>) = apply {
            this.accounts = accounts.map { it.toMutableList() }
        }

        /**
         * Adds a single [ExternalAccount] to [accounts].
         *
         * @throws IllegalStateException if the field was previously set to a non-list.
         */
        fun addAccount(account: ExternalAccount) = apply {
            accounts =
                (accounts ?: JsonField.of(mutableListOf())).also {
                    checkKnown("accounts", it).add(account)
                }
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
         * Returns an immutable instance of [ExternalAccountListResponse].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .accounts()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): ExternalAccountListResponse =
            ExternalAccountListResponse(
                checkRequired("accounts", accounts).map { it.toImmutable() },
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): ExternalAccountListResponse = apply {
        if (validated) {
            return@apply
        }

        accounts().forEach { it.validate() }
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
    internal fun validity(): Int = (accounts.asKnown()?.sumOf { it.validity().toInt() } ?: 0)

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is ExternalAccountListResponse &&
            accounts == other.accounts &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy { Objects.hash(accounts, additionalProperties) }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "ExternalAccountListResponse{accounts=$accounts, additionalProperties=$additionalProperties}"
}
