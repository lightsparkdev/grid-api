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

class ExternalAccountCreate
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val accountInfo: JsonField<ExternalAccountInfoOneOf>,
    private val currency: JsonField<String>,
    private val customerId: JsonField<String>,
    private val defaultUmaDepositAccount: JsonField<Boolean>,
    private val platformAccountId: JsonField<String>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("accountInfo")
        @ExcludeMissing
        accountInfo: JsonField<ExternalAccountInfoOneOf> = JsonMissing.of(),
        @JsonProperty("currency") @ExcludeMissing currency: JsonField<String> = JsonMissing.of(),
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
        accountInfo,
        currency,
        customerId,
        defaultUmaDepositAccount,
        platformAccountId,
        mutableMapOf(),
    )

    /**
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun accountInfo(): ExternalAccountInfoOneOf = accountInfo.getRequired("accountInfo")

    /**
     * The ISO 4217 currency code
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun currency(): String = currency.getRequired("currency")

    /**
     * The ID of the customer for whom to create the external account. If not provided, the external
     * account will be created on behalf of the platform.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun customerId(): String? = customerId.getNullable("customerId")

    /**
     * Whether to set the external account as the default UMA deposit account. When set to true,
     * incoming payments to this customer's UMA address will be automatically deposited into this
     * external account. False if not provided. Note that only one external account can be set as
     * the default UMA deposit account for a customer, so if there is already a default UMA deposit
     * account, this will override the existing default UMA deposit account. If there is no default
     * UMA deposit account, incoming UMA payments will be deposited into the primary internal
     * account for the customer.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun defaultUmaDepositAccount(): Boolean? =
        defaultUmaDepositAccount.getNullable("defaultUmaDepositAccount")

    /**
     * Your platform's identifier for the account in your system. This can be used to reference the
     * account by your own identifier.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun platformAccountId(): String? = platformAccountId.getNullable("platformAccountId")

    /**
     * Returns the raw JSON value of [accountInfo].
     *
     * Unlike [accountInfo], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("accountInfo")
    @ExcludeMissing
    fun _accountInfo(): JsonField<ExternalAccountInfoOneOf> = accountInfo

    /**
     * Returns the raw JSON value of [currency].
     *
     * Unlike [currency], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("currency") @ExcludeMissing fun _currency(): JsonField<String> = currency

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
         * Returns a mutable builder for constructing an instance of [ExternalAccountCreate].
         *
         * The following fields are required:
         * ```kotlin
         * .accountInfo()
         * .currency()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [ExternalAccountCreate]. */
    class Builder internal constructor() {

        private var accountInfo: JsonField<ExternalAccountInfoOneOf>? = null
        private var currency: JsonField<String>? = null
        private var customerId: JsonField<String> = JsonMissing.of()
        private var defaultUmaDepositAccount: JsonField<Boolean> = JsonMissing.of()
        private var platformAccountId: JsonField<String> = JsonMissing.of()
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(externalAccountCreate: ExternalAccountCreate) = apply {
            accountInfo = externalAccountCreate.accountInfo
            currency = externalAccountCreate.currency
            customerId = externalAccountCreate.customerId
            defaultUmaDepositAccount = externalAccountCreate.defaultUmaDepositAccount
            platformAccountId = externalAccountCreate.platformAccountId
            additionalProperties = externalAccountCreate.additionalProperties.toMutableMap()
        }

        fun accountInfo(accountInfo: ExternalAccountInfoOneOf) =
            accountInfo(JsonField.of(accountInfo))

        /**
         * Sets [Builder.accountInfo] to an arbitrary JSON value.
         *
         * You should usually call [Builder.accountInfo] with a well-typed
         * [ExternalAccountInfoOneOf] value instead. This method is primarily for setting the field
         * to an undocumented or not yet supported value.
         */
        fun accountInfo(accountInfo: JsonField<ExternalAccountInfoOneOf>) = apply {
            this.accountInfo = accountInfo
        }

        /**
         * Alias for calling [accountInfo] with
         * `ExternalAccountInfoOneOf.ofUsAccountExternalAccountInfo(usAccountExternalAccountInfo)`.
         */
        fun accountInfo(
            usAccountExternalAccountInfo: ExternalAccountInfoOneOf.UsAccountExternalAccountInfo
        ) =
            accountInfo(
                ExternalAccountInfoOneOf.ofUsAccountExternalAccountInfo(
                    usAccountExternalAccountInfo
                )
            )

        /**
         * Alias for calling [accountInfo] with
         * `ExternalAccountInfoOneOf.ofClabeAccountExternalAccountInfo(clabeAccountExternalAccountInfo)`.
         */
        fun accountInfo(
            clabeAccountExternalAccountInfo:
                ExternalAccountInfoOneOf.ClabeAccountExternalAccountInfo
        ) =
            accountInfo(
                ExternalAccountInfoOneOf.ofClabeAccountExternalAccountInfo(
                    clabeAccountExternalAccountInfo
                )
            )

        /**
         * Alias for calling [accountInfo] with
         * `ExternalAccountInfoOneOf.ofPixAccountExternalAccountInfo(pixAccountExternalAccountInfo)`.
         */
        fun accountInfo(
            pixAccountExternalAccountInfo: ExternalAccountInfoOneOf.PixAccountExternalAccountInfo
        ) =
            accountInfo(
                ExternalAccountInfoOneOf.ofPixAccountExternalAccountInfo(
                    pixAccountExternalAccountInfo
                )
            )

        /**
         * Alias for calling [accountInfo] with
         * `ExternalAccountInfoOneOf.ofIbanAccountExternalAccountInfo(ibanAccountExternalAccountInfo)`.
         */
        fun accountInfo(
            ibanAccountExternalAccountInfo: ExternalAccountInfoOneOf.IbanAccountExternalAccountInfo
        ) =
            accountInfo(
                ExternalAccountInfoOneOf.ofIbanAccountExternalAccountInfo(
                    ibanAccountExternalAccountInfo
                )
            )

        /**
         * Alias for calling [accountInfo] with
         * `ExternalAccountInfoOneOf.ofUpiAccountExternalAccountInfo(upiAccountExternalAccountInfo)`.
         */
        fun accountInfo(
            upiAccountExternalAccountInfo: ExternalAccountInfoOneOf.UpiAccountExternalAccountInfo
        ) =
            accountInfo(
                ExternalAccountInfoOneOf.ofUpiAccountExternalAccountInfo(
                    upiAccountExternalAccountInfo
                )
            )

        /**
         * Alias for calling [accountInfo] with
         * `ExternalAccountInfoOneOf.ofNgnAccountExternalAccountInfo(ngnAccountExternalAccountInfo)`.
         */
        fun accountInfo(
            ngnAccountExternalAccountInfo: ExternalAccountInfoOneOf.NgnAccountExternalAccountInfo
        ) =
            accountInfo(
                ExternalAccountInfoOneOf.ofNgnAccountExternalAccountInfo(
                    ngnAccountExternalAccountInfo
                )
            )

        /**
         * Alias for calling [accountInfo] with
         * `ExternalAccountInfoOneOf.ofCadAccountExternalAccountInfo(cadAccountExternalAccountInfo)`.
         */
        fun accountInfo(
            cadAccountExternalAccountInfo: ExternalAccountInfoOneOf.CadAccountExternalAccountInfo
        ) =
            accountInfo(
                ExternalAccountInfoOneOf.ofCadAccountExternalAccountInfo(
                    cadAccountExternalAccountInfo
                )
            )

        /**
         * Alias for calling [accountInfo] with
         * `ExternalAccountInfoOneOf.ofGbpAccountExternalAccountInfo(gbpAccountExternalAccountInfo)`.
         */
        fun accountInfo(
            gbpAccountExternalAccountInfo: ExternalAccountInfoOneOf.GbpAccountExternalAccountInfo
        ) =
            accountInfo(
                ExternalAccountInfoOneOf.ofGbpAccountExternalAccountInfo(
                    gbpAccountExternalAccountInfo
                )
            )

        /**
         * Alias for calling [accountInfo] with
         * `ExternalAccountInfoOneOf.ofPhpAccountExternalAccountInfo(phpAccountExternalAccountInfo)`.
         */
        fun accountInfo(
            phpAccountExternalAccountInfo: ExternalAccountInfoOneOf.PhpAccountExternalAccountInfo
        ) =
            accountInfo(
                ExternalAccountInfoOneOf.ofPhpAccountExternalAccountInfo(
                    phpAccountExternalAccountInfo
                )
            )

        /**
         * Alias for calling [accountInfo] with
         * `ExternalAccountInfoOneOf.ofSgdAccountExternalAccountInfo(sgdAccountExternalAccountInfo)`.
         */
        fun accountInfo(
            sgdAccountExternalAccountInfo: ExternalAccountInfoOneOf.SgdAccountExternalAccountInfo
        ) =
            accountInfo(
                ExternalAccountInfoOneOf.ofSgdAccountExternalAccountInfo(
                    sgdAccountExternalAccountInfo
                )
            )

        /**
         * Alias for calling [accountInfo] with
         * `ExternalAccountInfoOneOf.ofSparkWalletExternalAccountInfo(sparkWalletExternalAccountInfo)`.
         */
        fun accountInfo(
            sparkWalletExternalAccountInfo: ExternalAccountInfoOneOf.SparkWalletExternalAccountInfo
        ) =
            accountInfo(
                ExternalAccountInfoOneOf.ofSparkWalletExternalAccountInfo(
                    sparkWalletExternalAccountInfo
                )
            )

        /**
         * Alias for calling [accountInfo] with
         * `ExternalAccountInfoOneOf.ofLightningExternalAccountInfo(lightningExternalAccountInfo)`.
         */
        fun accountInfo(
            lightningExternalAccountInfo: ExternalAccountInfoOneOf.LightningExternalAccountInfo
        ) =
            accountInfo(
                ExternalAccountInfoOneOf.ofLightningExternalAccountInfo(
                    lightningExternalAccountInfo
                )
            )

        /**
         * Alias for calling [accountInfo] with
         * `ExternalAccountInfoOneOf.ofSolanaWalletExternalAccountInfo(solanaWalletExternalAccountInfo)`.
         */
        fun accountInfo(
            solanaWalletExternalAccountInfo:
                ExternalAccountInfoOneOf.SolanaWalletExternalAccountInfo
        ) =
            accountInfo(
                ExternalAccountInfoOneOf.ofSolanaWalletExternalAccountInfo(
                    solanaWalletExternalAccountInfo
                )
            )

        /**
         * Alias for calling [accountInfo] with
         * `ExternalAccountInfoOneOf.ofTronWalletExternalAccountInfo(tronWalletExternalAccountInfo)`.
         */
        fun accountInfo(
            tronWalletExternalAccountInfo: ExternalAccountInfoOneOf.TronWalletExternalAccountInfo
        ) =
            accountInfo(
                ExternalAccountInfoOneOf.ofTronWalletExternalAccountInfo(
                    tronWalletExternalAccountInfo
                )
            )

        /**
         * Alias for calling [accountInfo] with
         * `ExternalAccountInfoOneOf.ofPolygonWalletExternalAccountInfo(polygonWalletExternalAccountInfo)`.
         */
        fun accountInfo(
            polygonWalletExternalAccountInfo:
                ExternalAccountInfoOneOf.PolygonWalletExternalAccountInfo
        ) =
            accountInfo(
                ExternalAccountInfoOneOf.ofPolygonWalletExternalAccountInfo(
                    polygonWalletExternalAccountInfo
                )
            )

        /**
         * Alias for calling [accountInfo] with
         * `ExternalAccountInfoOneOf.ofBaseWalletExternalAccountInfo(baseWalletExternalAccountInfo)`.
         */
        fun accountInfo(
            baseWalletExternalAccountInfo: ExternalAccountInfoOneOf.BaseWalletExternalAccountInfo
        ) =
            accountInfo(
                ExternalAccountInfoOneOf.ofBaseWalletExternalAccountInfo(
                    baseWalletExternalAccountInfo
                )
            )

        /** The ISO 4217 currency code */
        fun currency(currency: String) = currency(JsonField.of(currency))

        /**
         * Sets [Builder.currency] to an arbitrary JSON value.
         *
         * You should usually call [Builder.currency] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun currency(currency: JsonField<String>) = apply { this.currency = currency }

        /**
         * The ID of the customer for whom to create the external account. If not provided, the
         * external account will be created on behalf of the platform.
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
         * Whether to set the external account as the default UMA deposit account. When set to true,
         * incoming payments to this customer's UMA address will be automatically deposited into
         * this external account. False if not provided. Note that only one external account can be
         * set as the default UMA deposit account for a customer, so if there is already a default
         * UMA deposit account, this will override the existing default UMA deposit account. If
         * there is no default UMA deposit account, incoming UMA payments will be deposited into the
         * primary internal account for the customer.
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

        /**
         * Your platform's identifier for the account in your system. This can be used to reference
         * the account by your own identifier.
         */
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
         * Returns an immutable instance of [ExternalAccountCreate].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .accountInfo()
         * .currency()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): ExternalAccountCreate =
            ExternalAccountCreate(
                checkRequired("accountInfo", accountInfo),
                checkRequired("currency", currency),
                customerId,
                defaultUmaDepositAccount,
                platformAccountId,
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): ExternalAccountCreate = apply {
        if (validated) {
            return@apply
        }

        accountInfo().validate()
        currency()
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
        (accountInfo.asKnown()?.validity() ?: 0) +
            (if (currency.asKnown() == null) 0 else 1) +
            (if (customerId.asKnown() == null) 0 else 1) +
            (if (defaultUmaDepositAccount.asKnown() == null) 0 else 1) +
            (if (platformAccountId.asKnown() == null) 0 else 1)

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is ExternalAccountCreate &&
            accountInfo == other.accountInfo &&
            currency == other.currency &&
            customerId == other.customerId &&
            defaultUmaDepositAccount == other.defaultUmaDepositAccount &&
            platformAccountId == other.platformAccountId &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(
            accountInfo,
            currency,
            customerId,
            defaultUmaDepositAccount,
            platformAccountId,
            additionalProperties,
        )
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "ExternalAccountCreate{accountInfo=$accountInfo, currency=$currency, customerId=$customerId, defaultUmaDepositAccount=$defaultUmaDepositAccount, platformAccountId=$platformAccountId, additionalProperties=$additionalProperties}"
}
