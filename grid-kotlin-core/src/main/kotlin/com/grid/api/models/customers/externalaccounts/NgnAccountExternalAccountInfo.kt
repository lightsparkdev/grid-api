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

class NgnAccountExternalAccountInfo
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val accountType: JsonField<BaseExternalAccountInfo.AccountType>,
    private val accountNumber: JsonField<String>,
    private val bankName: JsonField<String>,
    private val beneficiary: JsonField<BeneficiaryOneOf>,
    private val purposeOfPayment: JsonField<PurposeOfPayment>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("accountType")
        @ExcludeMissing
        accountType: JsonField<BaseExternalAccountInfo.AccountType> = JsonMissing.of(),
        @JsonProperty("accountNumber")
        @ExcludeMissing
        accountNumber: JsonField<String> = JsonMissing.of(),
        @JsonProperty("bankName") @ExcludeMissing bankName: JsonField<String> = JsonMissing.of(),
        @JsonProperty("beneficiary")
        @ExcludeMissing
        beneficiary: JsonField<BeneficiaryOneOf> = JsonMissing.of(),
        @JsonProperty("purposeOfPayment")
        @ExcludeMissing
        purposeOfPayment: JsonField<PurposeOfPayment> = JsonMissing.of(),
    ) : this(accountType, accountNumber, bankName, beneficiary, purposeOfPayment, mutableMapOf())

    fun toBaseExternalAccountInfo(): BaseExternalAccountInfo =
        BaseExternalAccountInfo.builder().accountType(accountType).build()

    /**
     * Type of external account or wallet
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun accountType(): BaseExternalAccountInfo.AccountType = accountType.getRequired("accountType")

    /**
     * Nigerian bank account number
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun accountNumber(): String = accountNumber.getRequired("accountNumber")

    /**
     * Name of the bank
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun bankName(): String = bankName.getRequired("bankName")

    /**
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun beneficiary(): BeneficiaryOneOf = beneficiary.getRequired("beneficiary")

    /**
     * Purpose of payment
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun purposeOfPayment(): PurposeOfPayment = purposeOfPayment.getRequired("purposeOfPayment")

    /**
     * Returns the raw JSON value of [accountType].
     *
     * Unlike [accountType], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("accountType")
    @ExcludeMissing
    fun _accountType(): JsonField<BaseExternalAccountInfo.AccountType> = accountType

    /**
     * Returns the raw JSON value of [accountNumber].
     *
     * Unlike [accountNumber], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("accountNumber")
    @ExcludeMissing
    fun _accountNumber(): JsonField<String> = accountNumber

    /**
     * Returns the raw JSON value of [bankName].
     *
     * Unlike [bankName], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("bankName") @ExcludeMissing fun _bankName(): JsonField<String> = bankName

    /**
     * Returns the raw JSON value of [beneficiary].
     *
     * Unlike [beneficiary], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("beneficiary")
    @ExcludeMissing
    fun _beneficiary(): JsonField<BeneficiaryOneOf> = beneficiary

    /**
     * Returns the raw JSON value of [purposeOfPayment].
     *
     * Unlike [purposeOfPayment], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    @JsonProperty("purposeOfPayment")
    @ExcludeMissing
    fun _purposeOfPayment(): JsonField<PurposeOfPayment> = purposeOfPayment

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
         * [NgnAccountExternalAccountInfo].
         *
         * The following fields are required:
         * ```kotlin
         * .accountType()
         * .accountNumber()
         * .bankName()
         * .beneficiary()
         * .purposeOfPayment()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [NgnAccountExternalAccountInfo]. */
    class Builder internal constructor() {

        private var accountType: JsonField<BaseExternalAccountInfo.AccountType>? = null
        private var accountNumber: JsonField<String>? = null
        private var bankName: JsonField<String>? = null
        private var beneficiary: JsonField<BeneficiaryOneOf>? = null
        private var purposeOfPayment: JsonField<PurposeOfPayment>? = null
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(ngnAccountExternalAccountInfo: NgnAccountExternalAccountInfo) = apply {
            accountType = ngnAccountExternalAccountInfo.accountType
            accountNumber = ngnAccountExternalAccountInfo.accountNumber
            bankName = ngnAccountExternalAccountInfo.bankName
            beneficiary = ngnAccountExternalAccountInfo.beneficiary
            purposeOfPayment = ngnAccountExternalAccountInfo.purposeOfPayment
            additionalProperties = ngnAccountExternalAccountInfo.additionalProperties.toMutableMap()
        }

        /** Type of external account or wallet */
        fun accountType(accountType: BaseExternalAccountInfo.AccountType) =
            accountType(JsonField.of(accountType))

        /**
         * Sets [Builder.accountType] to an arbitrary JSON value.
         *
         * You should usually call [Builder.accountType] with a well-typed
         * [BaseExternalAccountInfo.AccountType] value instead. This method is primarily for setting
         * the field to an undocumented or not yet supported value.
         */
        fun accountType(accountType: JsonField<BaseExternalAccountInfo.AccountType>) = apply {
            this.accountType = accountType
        }

        /** Nigerian bank account number */
        fun accountNumber(accountNumber: String) = accountNumber(JsonField.of(accountNumber))

        /**
         * Sets [Builder.accountNumber] to an arbitrary JSON value.
         *
         * You should usually call [Builder.accountNumber] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun accountNumber(accountNumber: JsonField<String>) = apply {
            this.accountNumber = accountNumber
        }

        /** Name of the bank */
        fun bankName(bankName: String) = bankName(JsonField.of(bankName))

        /**
         * Sets [Builder.bankName] to an arbitrary JSON value.
         *
         * You should usually call [Builder.bankName] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun bankName(bankName: JsonField<String>) = apply { this.bankName = bankName }

        fun beneficiary(beneficiary: BeneficiaryOneOf) = beneficiary(JsonField.of(beneficiary))

        /**
         * Sets [Builder.beneficiary] to an arbitrary JSON value.
         *
         * You should usually call [Builder.beneficiary] with a well-typed [BeneficiaryOneOf] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun beneficiary(beneficiary: JsonField<BeneficiaryOneOf>) = apply {
            this.beneficiary = beneficiary
        }

        /**
         * Alias for calling [beneficiary] with
         * `BeneficiaryOneOf.ofIndividualBeneficiary(individualBeneficiary)`.
         */
        fun beneficiary(individualBeneficiary: IndividualBeneficiary) =
            beneficiary(BeneficiaryOneOf.ofIndividualBeneficiary(individualBeneficiary))

        /**
         * Alias for calling [beneficiary] with
         * `BeneficiaryOneOf.ofBusinessBeneficiary(businessBeneficiary)`.
         */
        fun beneficiary(businessBeneficiary: BusinessBeneficiary) =
            beneficiary(BeneficiaryOneOf.ofBusinessBeneficiary(businessBeneficiary))

        /** Purpose of payment */
        fun purposeOfPayment(purposeOfPayment: PurposeOfPayment) =
            purposeOfPayment(JsonField.of(purposeOfPayment))

        /**
         * Sets [Builder.purposeOfPayment] to an arbitrary JSON value.
         *
         * You should usually call [Builder.purposeOfPayment] with a well-typed [PurposeOfPayment]
         * value instead. This method is primarily for setting the field to an undocumented or not
         * yet supported value.
         */
        fun purposeOfPayment(purposeOfPayment: JsonField<PurposeOfPayment>) = apply {
            this.purposeOfPayment = purposeOfPayment
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
         * Returns an immutable instance of [NgnAccountExternalAccountInfo].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .accountType()
         * .accountNumber()
         * .bankName()
         * .beneficiary()
         * .purposeOfPayment()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): NgnAccountExternalAccountInfo =
            NgnAccountExternalAccountInfo(
                checkRequired("accountType", accountType),
                checkRequired("accountNumber", accountNumber),
                checkRequired("bankName", bankName),
                checkRequired("beneficiary", beneficiary),
                checkRequired("purposeOfPayment", purposeOfPayment),
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): NgnAccountExternalAccountInfo = apply {
        if (validated) {
            return@apply
        }

        accountType().validate()
        accountNumber()
        bankName()
        beneficiary().validate()
        purposeOfPayment().validate()
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
        (accountType.asKnown()?.validity() ?: 0) +
            (if (accountNumber.asKnown() == null) 0 else 1) +
            (if (bankName.asKnown() == null) 0 else 1) +
            (beneficiary.asKnown()?.validity() ?: 0) +
            (purposeOfPayment.asKnown()?.validity() ?: 0)

    class AccountType @JsonCreator private constructor(private val value: JsonField<String>) :
        Enum {

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

            val NGN_ACCOUNT = of("NGN_ACCOUNT")

            fun of(value: String) = AccountType(JsonField.of(value))
        }

        /** An enum containing [AccountType]'s known values. */
        enum class Known {
            NGN_ACCOUNT
        }

        /**
         * An enum containing [AccountType]'s known values, as well as an [_UNKNOWN] member.
         *
         * An instance of [AccountType] can contain an unknown value in a couple of cases:
         * - It was deserialized from data that doesn't match any known member. For example, if the
         *   SDK is on an older version than the API, then the API may respond with new members that
         *   the SDK is unaware of.
         * - It was constructed with an arbitrary value using the [of] method.
         */
        enum class Value {
            NGN_ACCOUNT,
            /**
             * An enum member indicating that [AccountType] was instantiated with an unknown value.
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
                NGN_ACCOUNT -> Value.NGN_ACCOUNT
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
                NGN_ACCOUNT -> Known.NGN_ACCOUNT
                else -> throw GridInvalidDataException("Unknown AccountType: $value")
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

        fun validate(): AccountType = apply {
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

            return other is AccountType && value == other.value
        }

        override fun hashCode() = value.hashCode()

        override fun toString() = value.toString()
    }

    /** Purpose of payment */
    class PurposeOfPayment @JsonCreator private constructor(private val value: JsonField<String>) :
        Enum {

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

            val GIFT = of("GIFT")

            val SELF = of("SELF")

            val GOODS_OR_SERVICES = of("GOODS_OR_SERVICES")

            val EDUCATION = of("EDUCATION")

            val HEALTH_OR_MEDICAL = of("HEALTH_OR_MEDICAL")

            val REAL_ESTATE_PURCHASE = of("REAL_ESTATE_PURCHASE")

            val LOAN_PAYMENT = of("LOAN_PAYMENT")

            val TAX_PAYMENT = of("TAX_PAYMENT")

            val UTILITY_BILL = of("UTILITY_BILL")

            val DONATION = of("DONATION")

            val TRAVEL = of("TRAVEL")

            val OTHER = of("OTHER")

            fun of(value: String) = PurposeOfPayment(JsonField.of(value))
        }

        /** An enum containing [PurposeOfPayment]'s known values. */
        enum class Known {
            GIFT,
            SELF,
            GOODS_OR_SERVICES,
            EDUCATION,
            HEALTH_OR_MEDICAL,
            REAL_ESTATE_PURCHASE,
            LOAN_PAYMENT,
            TAX_PAYMENT,
            UTILITY_BILL,
            DONATION,
            TRAVEL,
            OTHER,
        }

        /**
         * An enum containing [PurposeOfPayment]'s known values, as well as an [_UNKNOWN] member.
         *
         * An instance of [PurposeOfPayment] can contain an unknown value in a couple of cases:
         * - It was deserialized from data that doesn't match any known member. For example, if the
         *   SDK is on an older version than the API, then the API may respond with new members that
         *   the SDK is unaware of.
         * - It was constructed with an arbitrary value using the [of] method.
         */
        enum class Value {
            GIFT,
            SELF,
            GOODS_OR_SERVICES,
            EDUCATION,
            HEALTH_OR_MEDICAL,
            REAL_ESTATE_PURCHASE,
            LOAN_PAYMENT,
            TAX_PAYMENT,
            UTILITY_BILL,
            DONATION,
            TRAVEL,
            OTHER,
            /**
             * An enum member indicating that [PurposeOfPayment] was instantiated with an unknown
             * value.
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
                GIFT -> Value.GIFT
                SELF -> Value.SELF
                GOODS_OR_SERVICES -> Value.GOODS_OR_SERVICES
                EDUCATION -> Value.EDUCATION
                HEALTH_OR_MEDICAL -> Value.HEALTH_OR_MEDICAL
                REAL_ESTATE_PURCHASE -> Value.REAL_ESTATE_PURCHASE
                LOAN_PAYMENT -> Value.LOAN_PAYMENT
                TAX_PAYMENT -> Value.TAX_PAYMENT
                UTILITY_BILL -> Value.UTILITY_BILL
                DONATION -> Value.DONATION
                TRAVEL -> Value.TRAVEL
                OTHER -> Value.OTHER
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
                GIFT -> Known.GIFT
                SELF -> Known.SELF
                GOODS_OR_SERVICES -> Known.GOODS_OR_SERVICES
                EDUCATION -> Known.EDUCATION
                HEALTH_OR_MEDICAL -> Known.HEALTH_OR_MEDICAL
                REAL_ESTATE_PURCHASE -> Known.REAL_ESTATE_PURCHASE
                LOAN_PAYMENT -> Known.LOAN_PAYMENT
                TAX_PAYMENT -> Known.TAX_PAYMENT
                UTILITY_BILL -> Known.UTILITY_BILL
                DONATION -> Known.DONATION
                TRAVEL -> Known.TRAVEL
                OTHER -> Known.OTHER
                else -> throw GridInvalidDataException("Unknown PurposeOfPayment: $value")
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

        fun validate(): PurposeOfPayment = apply {
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

            return other is PurposeOfPayment && value == other.value
        }

        override fun hashCode() = value.hashCode()

        override fun toString() = value.toString()
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is NgnAccountExternalAccountInfo &&
            accountType == other.accountType &&
            accountNumber == other.accountNumber &&
            bankName == other.bankName &&
            beneficiary == other.beneficiary &&
            purposeOfPayment == other.purposeOfPayment &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(
            accountType,
            accountNumber,
            bankName,
            beneficiary,
            purposeOfPayment,
            additionalProperties,
        )
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "NgnAccountExternalAccountInfo{accountType=$accountType, accountNumber=$accountNumber, bankName=$bankName, beneficiary=$beneficiary, purposeOfPayment=$purposeOfPayment, additionalProperties=$additionalProperties}"
}
