// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers

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

class CustomerUpdate
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val customerType: JsonField<CustomerType>,
    private val umaAddress: JsonField<String>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("customerType")
        @ExcludeMissing
        customerType: JsonField<CustomerType> = JsonMissing.of(),
        @JsonProperty("umaAddress") @ExcludeMissing umaAddress: JsonField<String> = JsonMissing.of(),
    ) : this(customerType, umaAddress, mutableMapOf())

    /**
     * Whether the customer is an individual or a business entity
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun customerType(): CustomerType = customerType.getRequired("customerType")

    /**
     * Optional UMA address identifier. If provided, the customer's UMA address will be updated.
     * This is an optional identifier to route payments to the customer.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun umaAddress(): String? = umaAddress.getNullable("umaAddress")

    /**
     * Returns the raw JSON value of [customerType].
     *
     * Unlike [customerType], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("customerType")
    @ExcludeMissing
    fun _customerType(): JsonField<CustomerType> = customerType

    /**
     * Returns the raw JSON value of [umaAddress].
     *
     * Unlike [umaAddress], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("umaAddress") @ExcludeMissing fun _umaAddress(): JsonField<String> = umaAddress

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
         * Returns a mutable builder for constructing an instance of [CustomerUpdate].
         *
         * The following fields are required:
         * ```kotlin
         * .customerType()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [CustomerUpdate]. */
    class Builder internal constructor() {

        private var customerType: JsonField<CustomerType>? = null
        private var umaAddress: JsonField<String> = JsonMissing.of()
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(customerUpdate: CustomerUpdate) = apply {
            customerType = customerUpdate.customerType
            umaAddress = customerUpdate.umaAddress
            additionalProperties = customerUpdate.additionalProperties.toMutableMap()
        }

        /** Whether the customer is an individual or a business entity */
        fun customerType(customerType: CustomerType) = customerType(JsonField.of(customerType))

        /**
         * Sets [Builder.customerType] to an arbitrary JSON value.
         *
         * You should usually call [Builder.customerType] with a well-typed [CustomerType] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun customerType(customerType: JsonField<CustomerType>) = apply {
            this.customerType = customerType
        }

        /**
         * Optional UMA address identifier. If provided, the customer's UMA address will be updated.
         * This is an optional identifier to route payments to the customer.
         */
        fun umaAddress(umaAddress: String) = umaAddress(JsonField.of(umaAddress))

        /**
         * Sets [Builder.umaAddress] to an arbitrary JSON value.
         *
         * You should usually call [Builder.umaAddress] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun umaAddress(umaAddress: JsonField<String>) = apply { this.umaAddress = umaAddress }

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
         * Returns an immutable instance of [CustomerUpdate].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .customerType()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): CustomerUpdate =
            CustomerUpdate(
                checkRequired("customerType", customerType),
                umaAddress,
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): CustomerUpdate = apply {
        if (validated) {
            return@apply
        }

        customerType().validate()
        umaAddress()
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
        (customerType.asKnown()?.validity() ?: 0) + (if (umaAddress.asKnown() == null) 0 else 1)

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is CustomerUpdate &&
            customerType == other.customerType &&
            umaAddress == other.umaAddress &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(customerType, umaAddress, additionalProperties)
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "CustomerUpdate{customerType=$customerType, umaAddress=$umaAddress, additionalProperties=$additionalProperties}"
}
