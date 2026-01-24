// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.fasterxml.jackson.annotation.JsonAnyGetter
import com.fasterxml.jackson.annotation.JsonAnySetter
import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.core.ObjectCodec
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.SerializerProvider
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.fasterxml.jackson.databind.annotation.JsonSerialize
import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.BaseDeserializer
import com.grid.api.core.BaseSerializer
import com.grid.api.core.Enum
import com.grid.api.core.ExcludeMissing
import com.grid.api.core.JsonField
import com.grid.api.core.JsonMissing
import com.grid.api.core.JsonValue
import com.grid.api.core.checkRequired
import com.grid.api.core.getOrThrow
import com.grid.api.errors.GridInvalidDataException
import java.util.Collections
import java.util.Objects

class NgnAccountExternalAccountInfo
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val accountNumber: JsonField<String>,
    private val accountType: JsonValue,
    private val bankName: JsonField<String>,
    private val beneficiary: JsonField<Beneficiary>,
    private val purposeOfPayment: JsonField<PurposeOfPayment>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("accountNumber")
        @ExcludeMissing
        accountNumber: JsonField<String> = JsonMissing.of(),
        @JsonProperty("accountType") @ExcludeMissing accountType: JsonValue = JsonMissing.of(),
        @JsonProperty("bankName") @ExcludeMissing bankName: JsonField<String> = JsonMissing.of(),
        @JsonProperty("beneficiary")
        @ExcludeMissing
        beneficiary: JsonField<Beneficiary> = JsonMissing.of(),
        @JsonProperty("purposeOfPayment")
        @ExcludeMissing
        purposeOfPayment: JsonField<PurposeOfPayment> = JsonMissing.of(),
    ) : this(accountNumber, accountType, bankName, beneficiary, purposeOfPayment, mutableMapOf())

    /**
     * Nigerian bank account number
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun accountNumber(): String = accountNumber.getRequired("accountNumber")

    /**
     * Expected to always return the following:
     * ```kotlin
     * JsonValue.from("NGN_ACCOUNT")
     * ```
     *
     * However, this method can be useful for debugging and logging (e.g. if the server responded
     * with an unexpected value).
     */
    @JsonProperty("accountType") @ExcludeMissing fun _accountType(): JsonValue = accountType

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
    fun beneficiary(): Beneficiary = beneficiary.getRequired("beneficiary")

    /**
     * Purpose of payment
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun purposeOfPayment(): PurposeOfPayment = purposeOfPayment.getRequired("purposeOfPayment")

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
    fun _beneficiary(): JsonField<Beneficiary> = beneficiary

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

        private var accountNumber: JsonField<String>? = null
        private var accountType: JsonValue = JsonValue.from("NGN_ACCOUNT")
        private var bankName: JsonField<String>? = null
        private var beneficiary: JsonField<Beneficiary>? = null
        private var purposeOfPayment: JsonField<PurposeOfPayment>? = null
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(ngnAccountExternalAccountInfo: NgnAccountExternalAccountInfo) = apply {
            accountNumber = ngnAccountExternalAccountInfo.accountNumber
            accountType = ngnAccountExternalAccountInfo.accountType
            bankName = ngnAccountExternalAccountInfo.bankName
            beneficiary = ngnAccountExternalAccountInfo.beneficiary
            purposeOfPayment = ngnAccountExternalAccountInfo.purposeOfPayment
            additionalProperties = ngnAccountExternalAccountInfo.additionalProperties.toMutableMap()
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

        /**
         * Sets the field to an arbitrary JSON value.
         *
         * It is usually unnecessary to call this method because the field defaults to the
         * following:
         * ```kotlin
         * JsonValue.from("NGN_ACCOUNT")
         * ```
         *
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun accountType(accountType: JsonValue) = apply { this.accountType = accountType }

        /** Name of the bank */
        fun bankName(bankName: String) = bankName(JsonField.of(bankName))

        /**
         * Sets [Builder.bankName] to an arbitrary JSON value.
         *
         * You should usually call [Builder.bankName] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun bankName(bankName: JsonField<String>) = apply { this.bankName = bankName }

        fun beneficiary(beneficiary: Beneficiary) = beneficiary(JsonField.of(beneficiary))

        /**
         * Sets [Builder.beneficiary] to an arbitrary JSON value.
         *
         * You should usually call [Builder.beneficiary] with a well-typed [Beneficiary] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun beneficiary(beneficiary: JsonField<Beneficiary>) = apply {
            this.beneficiary = beneficiary
        }

        /** Alias for calling [beneficiary] with `Beneficiary.ofIndividual(individual)`. */
        fun beneficiary(individual: IndividualBeneficiary) =
            beneficiary(Beneficiary.ofIndividual(individual))

        /** Alias for calling [beneficiary] with `Beneficiary.ofBusiness(business)`. */
        fun beneficiary(business: BusinessBeneficiary) =
            beneficiary(Beneficiary.ofBusiness(business))

        /**
         * Alias for calling [beneficiary] with the following:
         * ```kotlin
         * BusinessBeneficiary.builder()
         *     .legalName(legalName)
         *     .build()
         * ```
         */
        fun businessBeneficiary(legalName: String) =
            beneficiary(BusinessBeneficiary.builder().legalName(legalName).build())

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
                checkRequired("accountNumber", accountNumber),
                accountType,
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

        accountNumber()
        _accountType().let {
            if (it != JsonValue.from("NGN_ACCOUNT")) {
                throw GridInvalidDataException("'accountType' is invalid, received $it")
            }
        }
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
        (if (accountNumber.asKnown() == null) 0 else 1) +
            accountType.let { if (it == JsonValue.from("NGN_ACCOUNT")) 1 else 0 } +
            (if (bankName.asKnown() == null) 0 else 1) +
            (beneficiary.asKnown()?.validity() ?: 0) +
            (purposeOfPayment.asKnown()?.validity() ?: 0)

    @JsonDeserialize(using = Beneficiary.Deserializer::class)
    @JsonSerialize(using = Beneficiary.Serializer::class)
    class Beneficiary
    private constructor(
        private val individual: IndividualBeneficiary? = null,
        private val business: BusinessBeneficiary? = null,
        private val _json: JsonValue? = null,
    ) {

        fun individual(): IndividualBeneficiary? = individual

        fun business(): BusinessBeneficiary? = business

        fun isIndividual(): Boolean = individual != null

        fun isBusiness(): Boolean = business != null

        fun asIndividual(): IndividualBeneficiary = individual.getOrThrow("individual")

        fun asBusiness(): BusinessBeneficiary = business.getOrThrow("business")

        fun _json(): JsonValue? = _json

        fun <T> accept(visitor: Visitor<T>): T =
            when {
                individual != null -> visitor.visitIndividual(individual)
                business != null -> visitor.visitBusiness(business)
                else -> visitor.unknown(_json)
            }

        private var validated: Boolean = false

        fun validate(): Beneficiary = apply {
            if (validated) {
                return@apply
            }

            accept(
                object : Visitor<Unit> {
                    override fun visitIndividual(individual: IndividualBeneficiary) {
                        individual.validate()
                    }

                    override fun visitBusiness(business: BusinessBeneficiary) {
                        business.validate()
                    }
                }
            )
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
        internal fun validity(): Int =
            accept(
                object : Visitor<Int> {
                    override fun visitIndividual(individual: IndividualBeneficiary) =
                        individual.validity()

                    override fun visitBusiness(business: BusinessBeneficiary) = business.validity()

                    override fun unknown(json: JsonValue?) = 0
                }
            )

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is Beneficiary &&
                individual == other.individual &&
                business == other.business
        }

        override fun hashCode(): Int = Objects.hash(individual, business)

        override fun toString(): String =
            when {
                individual != null -> "Beneficiary{individual=$individual}"
                business != null -> "Beneficiary{business=$business}"
                _json != null -> "Beneficiary{_unknown=$_json}"
                else -> throw IllegalStateException("Invalid Beneficiary")
            }

        companion object {

            fun ofIndividual(individual: IndividualBeneficiary) =
                Beneficiary(individual = individual)

            fun ofBusiness(business: BusinessBeneficiary) = Beneficiary(business = business)
        }

        /**
         * An interface that defines how to map each variant of [Beneficiary] to a value of type
         * [T].
         */
        interface Visitor<out T> {

            fun visitIndividual(individual: IndividualBeneficiary): T

            fun visitBusiness(business: BusinessBeneficiary): T

            /**
             * Maps an unknown variant of [Beneficiary] to a value of type [T].
             *
             * An instance of [Beneficiary] can contain an unknown variant if it was deserialized
             * from data that doesn't match any known variant. For example, if the SDK is on an
             * older version than the API, then the API may respond with new variants that the SDK
             * is unaware of.
             *
             * @throws GridInvalidDataException in the default implementation.
             */
            fun unknown(json: JsonValue?): T {
                throw GridInvalidDataException("Unknown Beneficiary: $json")
            }
        }

        internal class Deserializer : BaseDeserializer<Beneficiary>(Beneficiary::class) {

            override fun ObjectCodec.deserialize(node: JsonNode): Beneficiary {
                val json = JsonValue.fromJsonNode(node)
                val beneficiaryType = json.asObject()?.get("beneficiaryType")?.asString()

                when (beneficiaryType) {
                    "INDIVIDUAL" -> {
                        return tryDeserialize(node, jacksonTypeRef<IndividualBeneficiary>())?.let {
                            Beneficiary(individual = it, _json = json)
                        } ?: Beneficiary(_json = json)
                    }
                    "BUSINESS" -> {
                        return tryDeserialize(node, jacksonTypeRef<BusinessBeneficiary>())?.let {
                            Beneficiary(business = it, _json = json)
                        } ?: Beneficiary(_json = json)
                    }
                }

                return Beneficiary(_json = json)
            }
        }

        internal class Serializer : BaseSerializer<Beneficiary>(Beneficiary::class) {

            override fun serialize(
                value: Beneficiary,
                generator: JsonGenerator,
                provider: SerializerProvider,
            ) {
                when {
                    value.individual != null -> generator.writeObject(value.individual)
                    value.business != null -> generator.writeObject(value.business)
                    value._json != null -> generator.writeObject(value._json)
                    else -> throw IllegalStateException("Invalid Beneficiary")
                }
            }
        }
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
            accountNumber == other.accountNumber &&
            accountType == other.accountType &&
            bankName == other.bankName &&
            beneficiary == other.beneficiary &&
            purposeOfPayment == other.purposeOfPayment &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(
            accountNumber,
            accountType,
            bankName,
            beneficiary,
            purposeOfPayment,
            additionalProperties,
        )
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "NgnAccountExternalAccountInfo{accountNumber=$accountNumber, accountType=$accountType, bankName=$bankName, beneficiary=$beneficiary, purposeOfPayment=$purposeOfPayment, additionalProperties=$additionalProperties}"
}
