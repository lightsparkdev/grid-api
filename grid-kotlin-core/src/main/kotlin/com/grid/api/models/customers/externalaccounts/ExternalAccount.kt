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

class ExternalAccount
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val id: JsonField<String>,
    private val accountInfo: JsonField<ExternalAccountInfo>,
    private val currency: JsonField<String>,
    private val status: JsonField<Status>,
    private val customerId: JsonField<String>,
    private val defaultUmaDepositAccount: JsonField<Boolean>,
    private val platformAccountId: JsonField<String>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("id") @ExcludeMissing id: JsonField<String> = JsonMissing.of(),
        @JsonProperty("accountInfo")
        @ExcludeMissing
        accountInfo: JsonField<ExternalAccountInfo> = JsonMissing.of(),
        @JsonProperty("currency") @ExcludeMissing currency: JsonField<String> = JsonMissing.of(),
        @JsonProperty("status") @ExcludeMissing status: JsonField<Status> = JsonMissing.of(),
        @JsonProperty("customerId")
        @ExcludeMissing
        customerId: JsonField<String> = JsonMissing.of(),
        @JsonProperty("defaultUmaDepositAccount")
        @ExcludeMissing
        defaultUmaDepositAccount: JsonField<Boolean> = JsonMissing.of(),
        @JsonProperty("platformAccountId")
        @ExcludeMissing
        platformAccountId: JsonField<String> = JsonMissing.of(),
    ) : this(
        id,
        accountInfo,
        currency,
        status,
        customerId,
        defaultUmaDepositAccount,
        platformAccountId,
        mutableMapOf(),
    )

    /**
     * The system generated identifier of this account
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun id(): String = id.getRequired("id")

    /**
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun accountInfo(): ExternalAccountInfo = accountInfo.getRequired("accountInfo")

    /**
     * The ISO 4217 currency code
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun currency(): String = currency.getRequired("currency")

    /**
     * Status of the external account
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun status(): Status = status.getRequired("status")

    /**
     * The customer this account is tied to, or null if the account is on behalf of the platform.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun customerId(): String? = customerId.getNullable("customerId")

    /**
     * Whether this account is the default UMA deposit account for the customer. If true, incoming
     * UMA payments to this customer's UMA address will be automatically deposited into this account
     * instead of the primary internal account. False if not provided. Note that at most, one
     * external account can be set as the default UMA deposit account for a customer. If there is no
     * default UMA deposit account, incoming UMA payments will be deposited into the primary
     * internal account for the customer.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun defaultUmaDepositAccount(): Boolean? =
        defaultUmaDepositAccount.getNullable("defaultUmaDepositAccount")

    /**
     * Optional platform-specific identifier for this account
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun platformAccountId(): String? = platformAccountId.getNullable("platformAccountId")

    /**
     * Returns the raw JSON value of [id].
     *
     * Unlike [id], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("id") @ExcludeMissing fun _id(): JsonField<String> = id

    /**
     * Returns the raw JSON value of [accountInfo].
     *
     * Unlike [accountInfo], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("accountInfo")
    @ExcludeMissing
    fun _accountInfo(): JsonField<ExternalAccountInfo> = accountInfo

    /**
     * Returns the raw JSON value of [currency].
     *
     * Unlike [currency], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("currency") @ExcludeMissing fun _currency(): JsonField<String> = currency

    /**
     * Returns the raw JSON value of [status].
     *
     * Unlike [status], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("status") @ExcludeMissing fun _status(): JsonField<Status> = status

    /**
     * Returns the raw JSON value of [customerId].
     *
     * Unlike [customerId], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("customerId") @ExcludeMissing fun _customerId(): JsonField<String> = customerId

    /**
     * Returns the raw JSON value of [defaultUmaDepositAccount].
     *
     * Unlike [defaultUmaDepositAccount], this method doesn't throw if the JSON field has an
     * unexpected type.
     */
    @JsonProperty("defaultUmaDepositAccount")
    @ExcludeMissing
    fun _defaultUmaDepositAccount(): JsonField<Boolean> = defaultUmaDepositAccount

    /**
     * Returns the raw JSON value of [platformAccountId].
     *
     * Unlike [platformAccountId], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    @JsonProperty("platformAccountId")
    @ExcludeMissing
    fun _platformAccountId(): JsonField<String> = platformAccountId

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
         * Returns a mutable builder for constructing an instance of [ExternalAccount].
         *
         * The following fields are required:
         * ```kotlin
         * .id()
         * .accountInfo()
         * .currency()
         * .status()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [ExternalAccount]. */
    class Builder internal constructor() {

        private var id: JsonField<String>? = null
        private var accountInfo: JsonField<ExternalAccountInfo>? = null
        private var currency: JsonField<String>? = null
        private var status: JsonField<Status>? = null
        private var customerId: JsonField<String> = JsonMissing.of()
        private var defaultUmaDepositAccount: JsonField<Boolean> = JsonMissing.of()
        private var platformAccountId: JsonField<String> = JsonMissing.of()
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(externalAccount: ExternalAccount) = apply {
            id = externalAccount.id
            accountInfo = externalAccount.accountInfo
            currency = externalAccount.currency
            status = externalAccount.status
            customerId = externalAccount.customerId
            defaultUmaDepositAccount = externalAccount.defaultUmaDepositAccount
            platformAccountId = externalAccount.platformAccountId
            additionalProperties = externalAccount.additionalProperties.toMutableMap()
        }

        /** The system generated identifier of this account */
        fun id(id: String) = id(JsonField.of(id))

        /**
         * Sets [Builder.id] to an arbitrary JSON value.
         *
         * You should usually call [Builder.id] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun id(id: JsonField<String>) = apply { this.id = id }

        fun accountInfo(accountInfo: ExternalAccountInfo) = accountInfo(JsonField.of(accountInfo))

        /**
         * Sets [Builder.accountInfo] to an arbitrary JSON value.
         *
         * You should usually call [Builder.accountInfo] with a well-typed [ExternalAccountInfo]
         * value instead. This method is primarily for setting the field to an undocumented or not
         * yet supported value.
         */
        fun accountInfo(accountInfo: JsonField<ExternalAccountInfo>) = apply {
            this.accountInfo = accountInfo
        }

        /** Alias for calling [accountInfo] with `ExternalAccountInfo.ofUsAccount(usAccount)`. */
        fun accountInfo(usAccount: ExternalAccountInfo.UsAccount) =
            accountInfo(ExternalAccountInfo.ofUsAccount(usAccount))

        /** Alias for calling [accountInfo] with `ExternalAccountInfo.ofClabe(clabe)`. */
        fun accountInfo(clabe: ExternalAccountInfo.Clabe) =
            accountInfo(ExternalAccountInfo.ofClabe(clabe))

        /**
         * Alias for calling [accountInfo] with the following:
         * ```kotlin
         * ExternalAccountInfo.Clabe.builder()
         *     .clabeNumber(clabeNumber)
         *     .build()
         * ```
         */
        fun clabeAccountInfo(clabeNumber: String) =
            accountInfo(ExternalAccountInfo.Clabe.builder().clabeNumber(clabeNumber).build())

        /** Alias for calling [accountInfo] with `ExternalAccountInfo.ofPix(pix)`. */
        fun accountInfo(pix: ExternalAccountInfo.Pix) = accountInfo(ExternalAccountInfo.ofPix(pix))

        /** Alias for calling [accountInfo] with `ExternalAccountInfo.ofIban(iban)`. */
        fun accountInfo(iban: ExternalAccountInfo.Iban) =
            accountInfo(ExternalAccountInfo.ofIban(iban))

        /** Alias for calling [accountInfo] with `ExternalAccountInfo.ofUpi(upi)`. */
        fun accountInfo(upi: ExternalAccountInfo.Upi) = accountInfo(ExternalAccountInfo.ofUpi(upi))

        /**
         * Alias for calling [accountInfo] with the following:
         * ```kotlin
         * ExternalAccountInfo.Upi.builder()
         *     .vpa(vpa)
         *     .build()
         * ```
         */
        fun upiAccountInfo(vpa: String) =
            accountInfo(ExternalAccountInfo.Upi.builder().vpa(vpa).build())

        /** Alias for calling [accountInfo] with `ExternalAccountInfo.ofNgnAccount(ngnAccount)`. */
        fun accountInfo(ngnAccount: ExternalAccountInfo.NgnAccount) =
            accountInfo(ExternalAccountInfo.ofNgnAccount(ngnAccount))

        /**
         * Alias for calling [accountInfo] with `ExternalAccountInfo.ofSparkWallet(sparkWallet)`.
         */
        fun accountInfo(sparkWallet: ExternalAccountInfo.SparkWallet) =
            accountInfo(ExternalAccountInfo.ofSparkWallet(sparkWallet))

        /**
         * Alias for calling [accountInfo] with the following:
         * ```kotlin
         * ExternalAccountInfo.SparkWallet.builder()
         *     .address(address)
         *     .build()
         * ```
         */
        fun sparkWalletAccountInfo(address: String) =
            accountInfo(ExternalAccountInfo.SparkWallet.builder().address(address).build())

        /** Alias for calling [accountInfo] with `ExternalAccountInfo.ofLightning(lightning)`. */
        fun accountInfo(lightning: ExternalAccountInfo.LightningExternalAccountInfo) =
            accountInfo(ExternalAccountInfo.ofLightning(lightning))

        /**
         * Alias for calling [accountInfo] with `ExternalAccountInfo.ofSolanaWallet(solanaWallet)`.
         */
        fun accountInfo(solanaWallet: ExternalAccountInfo.SolanaWallet) =
            accountInfo(ExternalAccountInfo.ofSolanaWallet(solanaWallet))

        /**
         * Alias for calling [accountInfo] with the following:
         * ```kotlin
         * ExternalAccountInfo.SolanaWallet.builder()
         *     .address(address)
         *     .build()
         * ```
         */
        fun solanaWalletAccountInfo(address: String) =
            accountInfo(ExternalAccountInfo.SolanaWallet.builder().address(address).build())

        /** Alias for calling [accountInfo] with `ExternalAccountInfo.ofTronWallet(tronWallet)`. */
        fun accountInfo(tronWallet: ExternalAccountInfo.TronWallet) =
            accountInfo(ExternalAccountInfo.ofTronWallet(tronWallet))

        /**
         * Alias for calling [accountInfo] with the following:
         * ```kotlin
         * ExternalAccountInfo.TronWallet.builder()
         *     .address(address)
         *     .build()
         * ```
         */
        fun tronWalletAccountInfo(address: String) =
            accountInfo(ExternalAccountInfo.TronWallet.builder().address(address).build())

        /**
         * Alias for calling [accountInfo] with
         * `ExternalAccountInfo.ofPolygonWallet(polygonWallet)`.
         */
        fun accountInfo(polygonWallet: ExternalAccountInfo.PolygonWallet) =
            accountInfo(ExternalAccountInfo.ofPolygonWallet(polygonWallet))

        /**
         * Alias for calling [accountInfo] with the following:
         * ```kotlin
         * ExternalAccountInfo.PolygonWallet.builder()
         *     .address(address)
         *     .build()
         * ```
         */
        fun polygonWalletAccountInfo(address: String) =
            accountInfo(ExternalAccountInfo.PolygonWallet.builder().address(address).build())

        /** Alias for calling [accountInfo] with `ExternalAccountInfo.ofBaseWallet(baseWallet)`. */
        fun accountInfo(baseWallet: ExternalAccountInfo.BaseWallet) =
            accountInfo(ExternalAccountInfo.ofBaseWallet(baseWallet))

        /**
         * Alias for calling [accountInfo] with the following:
         * ```kotlin
         * ExternalAccountInfo.BaseWallet.builder()
         *     .address(address)
         *     .build()
         * ```
         */
        fun baseWalletAccountInfo(address: String) =
            accountInfo(ExternalAccountInfo.BaseWallet.builder().address(address).build())

        /** The ISO 4217 currency code */
        fun currency(currency: String) = currency(JsonField.of(currency))

        /**
         * Sets [Builder.currency] to an arbitrary JSON value.
         *
         * You should usually call [Builder.currency] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun currency(currency: JsonField<String>) = apply { this.currency = currency }

        /** Status of the external account */
        fun status(status: Status) = status(JsonField.of(status))

        /**
         * Sets [Builder.status] to an arbitrary JSON value.
         *
         * You should usually call [Builder.status] with a well-typed [Status] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun status(status: JsonField<Status>) = apply { this.status = status }

        /**
         * The customer this account is tied to, or null if the account is on behalf of the
         * platform.
         */
        fun customerId(customerId: String) = customerId(JsonField.of(customerId))

        /**
         * Sets [Builder.customerId] to an arbitrary JSON value.
         *
         * You should usually call [Builder.customerId] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun customerId(customerId: JsonField<String>) = apply { this.customerId = customerId }

        /**
         * Whether this account is the default UMA deposit account for the customer. If true,
         * incoming UMA payments to this customer's UMA address will be automatically deposited into
         * this account instead of the primary internal account. False if not provided. Note that at
         * most, one external account can be set as the default UMA deposit account for a customer.
         * If there is no default UMA deposit account, incoming UMA payments will be deposited into
         * the primary internal account for the customer.
         */
        fun defaultUmaDepositAccount(defaultUmaDepositAccount: Boolean) =
            defaultUmaDepositAccount(JsonField.of(defaultUmaDepositAccount))

        /**
         * Sets [Builder.defaultUmaDepositAccount] to an arbitrary JSON value.
         *
         * You should usually call [Builder.defaultUmaDepositAccount] with a well-typed [Boolean]
         * value instead. This method is primarily for setting the field to an undocumented or not
         * yet supported value.
         */
        fun defaultUmaDepositAccount(defaultUmaDepositAccount: JsonField<Boolean>) = apply {
            this.defaultUmaDepositAccount = defaultUmaDepositAccount
        }

        /** Optional platform-specific identifier for this account */
        fun platformAccountId(platformAccountId: String) =
            platformAccountId(JsonField.of(platformAccountId))

        /**
         * Sets [Builder.platformAccountId] to an arbitrary JSON value.
         *
         * You should usually call [Builder.platformAccountId] with a well-typed [String] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun platformAccountId(platformAccountId: JsonField<String>) = apply {
            this.platformAccountId = platformAccountId
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
         * Returns an immutable instance of [ExternalAccount].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .id()
         * .accountInfo()
         * .currency()
         * .status()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): ExternalAccount =
            ExternalAccount(
                checkRequired("id", id),
                checkRequired("accountInfo", accountInfo),
                checkRequired("currency", currency),
                checkRequired("status", status),
                customerId,
                defaultUmaDepositAccount,
                platformAccountId,
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): ExternalAccount = apply {
        if (validated) {
            return@apply
        }

        id()
        accountInfo().validate()
        currency()
        status().validate()
        customerId()
        defaultUmaDepositAccount()
        platformAccountId()
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
        (if (id.asKnown() == null) 0 else 1) +
            (accountInfo.asKnown()?.validity() ?: 0) +
            (if (currency.asKnown() == null) 0 else 1) +
            (status.asKnown()?.validity() ?: 0) +
            (if (customerId.asKnown() == null) 0 else 1) +
            (if (defaultUmaDepositAccount.asKnown() == null) 0 else 1) +
            (if (platformAccountId.asKnown() == null) 0 else 1)

    /** Status of the external account */
    class Status @JsonCreator private constructor(private val value: JsonField<String>) : Enum {

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

            val PENDING = of("PENDING")

            val ACTIVE = of("ACTIVE")

            val UNDER_REVIEW = of("UNDER_REVIEW")

            val INACTIVE = of("INACTIVE")

            fun of(value: String) = Status(JsonField.of(value))
        }

        /** An enum containing [Status]'s known values. */
        enum class Known {
            PENDING,
            ACTIVE,
            UNDER_REVIEW,
            INACTIVE,
        }

        /**
         * An enum containing [Status]'s known values, as well as an [_UNKNOWN] member.
         *
         * An instance of [Status] can contain an unknown value in a couple of cases:
         * - It was deserialized from data that doesn't match any known member. For example, if the
         *   SDK is on an older version than the API, then the API may respond with new members that
         *   the SDK is unaware of.
         * - It was constructed with an arbitrary value using the [of] method.
         */
        enum class Value {
            PENDING,
            ACTIVE,
            UNDER_REVIEW,
            INACTIVE,
            /** An enum member indicating that [Status] was instantiated with an unknown value. */
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
                PENDING -> Value.PENDING
                ACTIVE -> Value.ACTIVE
                UNDER_REVIEW -> Value.UNDER_REVIEW
                INACTIVE -> Value.INACTIVE
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
                PENDING -> Known.PENDING
                ACTIVE -> Known.ACTIVE
                UNDER_REVIEW -> Known.UNDER_REVIEW
                INACTIVE -> Known.INACTIVE
                else -> throw GridInvalidDataException("Unknown Status: $value")
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

        fun validate(): Status = apply {
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

            return other is Status && value == other.value
        }

        override fun hashCode() = value.hashCode()

        override fun toString() = value.toString()
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is ExternalAccount &&
            id == other.id &&
            accountInfo == other.accountInfo &&
            currency == other.currency &&
            status == other.status &&
            customerId == other.customerId &&
            defaultUmaDepositAccount == other.defaultUmaDepositAccount &&
            platformAccountId == other.platformAccountId &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(
            id,
            accountInfo,
            currency,
            status,
            customerId,
            defaultUmaDepositAccount,
            platformAccountId,
            additionalProperties,
        )
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "ExternalAccount{id=$id, accountInfo=$accountInfo, currency=$currency, status=$status, customerId=$customerId, defaultUmaDepositAccount=$defaultUmaDepositAccount, platformAccountId=$platformAccountId, additionalProperties=$additionalProperties}"
}
