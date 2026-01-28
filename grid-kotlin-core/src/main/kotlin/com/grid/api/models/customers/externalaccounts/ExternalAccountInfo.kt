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
import com.grid.api.core.allMaxBy
import com.grid.api.core.checkRequired
import com.grid.api.core.getOrThrow
import com.grid.api.errors.GridInvalidDataException
import java.util.Collections
import java.util.Objects

@JsonDeserialize(using = ExternalAccountInfo.Deserializer::class)
@JsonSerialize(using = ExternalAccountInfo.Serializer::class)
class ExternalAccountInfo
private constructor(
    private val usAccount: UsAccount? = null,
    private val clabeAccount: ClabeAccount? = null,
    private val pixAccount: PixAccount? = null,
    private val ibanAccount: IbanAccount? = null,
    private val upiAccount: UpiAccount? = null,
    private val ngnAccount: NgnAccount? = null,
    private val sparkWallet: SparkWallet? = null,
    private val lightning: Lightning? = null,
    private val solanaWallet: SolanaWallet? = null,
    private val tronWallet: TronWallet? = null,
    private val polygonWallet: PolygonWallet? = null,
    private val baseWallet: BaseWallet? = null,
    private val _json: JsonValue? = null,
) {

    fun usAccount(): UsAccount? = usAccount

    fun clabeAccount(): ClabeAccount? = clabeAccount

    fun pixAccount(): PixAccount? = pixAccount

    fun ibanAccount(): IbanAccount? = ibanAccount

    fun upiAccount(): UpiAccount? = upiAccount

    fun ngnAccount(): NgnAccount? = ngnAccount

    fun sparkWallet(): SparkWallet? = sparkWallet

    fun lightning(): Lightning? = lightning

    fun solanaWallet(): SolanaWallet? = solanaWallet

    fun tronWallet(): TronWallet? = tronWallet

    fun polygonWallet(): PolygonWallet? = polygonWallet

    fun baseWallet(): BaseWallet? = baseWallet

    fun isUsAccount(): Boolean = usAccount != null

    fun isClabeAccount(): Boolean = clabeAccount != null

    fun isPixAccount(): Boolean = pixAccount != null

    fun isIbanAccount(): Boolean = ibanAccount != null

    fun isUpiAccount(): Boolean = upiAccount != null

    fun isNgnAccount(): Boolean = ngnAccount != null

    fun isSparkWallet(): Boolean = sparkWallet != null

    fun isLightning(): Boolean = lightning != null

    fun isSolanaWallet(): Boolean = solanaWallet != null

    fun isTronWallet(): Boolean = tronWallet != null

    fun isPolygonWallet(): Boolean = polygonWallet != null

    fun isBaseWallet(): Boolean = baseWallet != null

    fun asUsAccount(): UsAccount = usAccount.getOrThrow("usAccount")

    fun asClabeAccount(): ClabeAccount = clabeAccount.getOrThrow("clabeAccount")

    fun asPixAccount(): PixAccount = pixAccount.getOrThrow("pixAccount")

    fun asIbanAccount(): IbanAccount = ibanAccount.getOrThrow("ibanAccount")

    fun asUpiAccount(): UpiAccount = upiAccount.getOrThrow("upiAccount")

    fun asNgnAccount(): NgnAccount = ngnAccount.getOrThrow("ngnAccount")

    fun asSparkWallet(): SparkWallet = sparkWallet.getOrThrow("sparkWallet")

    fun asLightning(): Lightning = lightning.getOrThrow("lightning")

    fun asSolanaWallet(): SolanaWallet = solanaWallet.getOrThrow("solanaWallet")

    fun asTronWallet(): TronWallet = tronWallet.getOrThrow("tronWallet")

    fun asPolygonWallet(): PolygonWallet = polygonWallet.getOrThrow("polygonWallet")

    fun asBaseWallet(): BaseWallet = baseWallet.getOrThrow("baseWallet")

    fun _json(): JsonValue? = _json

    fun <T> accept(visitor: Visitor<T>): T =
        when {
            usAccount != null -> visitor.visitUsAccount(usAccount)
            clabeAccount != null -> visitor.visitClabeAccount(clabeAccount)
            pixAccount != null -> visitor.visitPixAccount(pixAccount)
            ibanAccount != null -> visitor.visitIbanAccount(ibanAccount)
            upiAccount != null -> visitor.visitUpiAccount(upiAccount)
            ngnAccount != null -> visitor.visitNgnAccount(ngnAccount)
            sparkWallet != null -> visitor.visitSparkWallet(sparkWallet)
            lightning != null -> visitor.visitLightning(lightning)
            solanaWallet != null -> visitor.visitSolanaWallet(solanaWallet)
            tronWallet != null -> visitor.visitTronWallet(tronWallet)
            polygonWallet != null -> visitor.visitPolygonWallet(polygonWallet)
            baseWallet != null -> visitor.visitBaseWallet(baseWallet)
            else -> visitor.unknown(_json)
        }

    private var validated: Boolean = false

    fun validate(): ExternalAccountInfo = apply {
        if (validated) {
            return@apply
        }

        accept(
            object : Visitor<Unit> {
                override fun visitUsAccount(usAccount: UsAccount) {
                    usAccount.validate()
                }

                override fun visitClabeAccount(clabeAccount: ClabeAccount) {
                    clabeAccount.validate()
                }

                override fun visitPixAccount(pixAccount: PixAccount) {
                    pixAccount.validate()
                }

                override fun visitIbanAccount(ibanAccount: IbanAccount) {
                    ibanAccount.validate()
                }

                override fun visitUpiAccount(upiAccount: UpiAccount) {
                    upiAccount.validate()
                }

                override fun visitNgnAccount(ngnAccount: NgnAccount) {
                    ngnAccount.validate()
                }

                override fun visitSparkWallet(sparkWallet: SparkWallet) {
                    sparkWallet.validate()
                }

                override fun visitLightning(lightning: Lightning) {
                    lightning.validate()
                }

                override fun visitSolanaWallet(solanaWallet: SolanaWallet) {
                    solanaWallet.validate()
                }

                override fun visitTronWallet(tronWallet: TronWallet) {
                    tronWallet.validate()
                }

                override fun visitPolygonWallet(polygonWallet: PolygonWallet) {
                    polygonWallet.validate()
                }

                override fun visitBaseWallet(baseWallet: BaseWallet) {
                    baseWallet.validate()
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
     * Returns a score indicating how many valid values are contained in this object recursively.
     *
     * Used for best match union deserialization.
     */
    internal fun validity(): Int =
        accept(
            object : Visitor<Int> {
                override fun visitUsAccount(usAccount: UsAccount) = usAccount.validity()

                override fun visitClabeAccount(clabeAccount: ClabeAccount) = clabeAccount.validity()

                override fun visitPixAccount(pixAccount: PixAccount) = pixAccount.validity()

                override fun visitIbanAccount(ibanAccount: IbanAccount) = ibanAccount.validity()

                override fun visitUpiAccount(upiAccount: UpiAccount) = upiAccount.validity()

                override fun visitNgnAccount(ngnAccount: NgnAccount) = ngnAccount.validity()

                override fun visitSparkWallet(sparkWallet: SparkWallet) = sparkWallet.validity()

                override fun visitLightning(lightning: Lightning) = lightning.validity()

                override fun visitSolanaWallet(solanaWallet: SolanaWallet) = solanaWallet.validity()

                override fun visitTronWallet(tronWallet: TronWallet) = tronWallet.validity()

                override fun visitPolygonWallet(polygonWallet: PolygonWallet) =
                    polygonWallet.validity()

                override fun visitBaseWallet(baseWallet: BaseWallet) = baseWallet.validity()

                override fun unknown(json: JsonValue?) = 0
            }
        )

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is ExternalAccountInfo &&
            usAccount == other.usAccount &&
            clabeAccount == other.clabeAccount &&
            pixAccount == other.pixAccount &&
            ibanAccount == other.ibanAccount &&
            upiAccount == other.upiAccount &&
            ngnAccount == other.ngnAccount &&
            sparkWallet == other.sparkWallet &&
            lightning == other.lightning &&
            solanaWallet == other.solanaWallet &&
            tronWallet == other.tronWallet &&
            polygonWallet == other.polygonWallet &&
            baseWallet == other.baseWallet
    }

    override fun hashCode(): Int =
        Objects.hash(
            usAccount,
            clabeAccount,
            pixAccount,
            ibanAccount,
            upiAccount,
            ngnAccount,
            sparkWallet,
            lightning,
            solanaWallet,
            tronWallet,
            polygonWallet,
            baseWallet,
        )

    override fun toString(): String =
        when {
            usAccount != null -> "ExternalAccountInfo{usAccount=$usAccount}"
            clabeAccount != null -> "ExternalAccountInfo{clabeAccount=$clabeAccount}"
            pixAccount != null -> "ExternalAccountInfo{pixAccount=$pixAccount}"
            ibanAccount != null -> "ExternalAccountInfo{ibanAccount=$ibanAccount}"
            upiAccount != null -> "ExternalAccountInfo{upiAccount=$upiAccount}"
            ngnAccount != null -> "ExternalAccountInfo{ngnAccount=$ngnAccount}"
            sparkWallet != null -> "ExternalAccountInfo{sparkWallet=$sparkWallet}"
            lightning != null -> "ExternalAccountInfo{lightning=$lightning}"
            solanaWallet != null -> "ExternalAccountInfo{solanaWallet=$solanaWallet}"
            tronWallet != null -> "ExternalAccountInfo{tronWallet=$tronWallet}"
            polygonWallet != null -> "ExternalAccountInfo{polygonWallet=$polygonWallet}"
            baseWallet != null -> "ExternalAccountInfo{baseWallet=$baseWallet}"
            _json != null -> "ExternalAccountInfo{_unknown=$_json}"
            else -> throw IllegalStateException("Invalid ExternalAccountInfo")
        }

    companion object {

        fun ofUsAccount(usAccount: UsAccount) = ExternalAccountInfo(usAccount = usAccount)

        fun ofClabeAccount(clabeAccount: ClabeAccount) =
            ExternalAccountInfo(clabeAccount = clabeAccount)

        fun ofPixAccount(pixAccount: PixAccount) = ExternalAccountInfo(pixAccount = pixAccount)

        fun ofIbanAccount(ibanAccount: IbanAccount) = ExternalAccountInfo(ibanAccount = ibanAccount)

        fun ofUpiAccount(upiAccount: UpiAccount) = ExternalAccountInfo(upiAccount = upiAccount)

        fun ofNgnAccount(ngnAccount: NgnAccount) = ExternalAccountInfo(ngnAccount = ngnAccount)

        fun ofSparkWallet(sparkWallet: SparkWallet) = ExternalAccountInfo(sparkWallet = sparkWallet)

        fun ofLightning(lightning: Lightning) = ExternalAccountInfo(lightning = lightning)

        fun ofSolanaWallet(solanaWallet: SolanaWallet) =
            ExternalAccountInfo(solanaWallet = solanaWallet)

        fun ofTronWallet(tronWallet: TronWallet) = ExternalAccountInfo(tronWallet = tronWallet)

        fun ofPolygonWallet(polygonWallet: PolygonWallet) =
            ExternalAccountInfo(polygonWallet = polygonWallet)

        fun ofBaseWallet(baseWallet: BaseWallet) = ExternalAccountInfo(baseWallet = baseWallet)
    }

    /**
     * An interface that defines how to map each variant of [ExternalAccountInfo] to a value of type
     * [T].
     */
    interface Visitor<out T> {

        fun visitUsAccount(usAccount: UsAccount): T

        fun visitClabeAccount(clabeAccount: ClabeAccount): T

        fun visitPixAccount(pixAccount: PixAccount): T

        fun visitIbanAccount(ibanAccount: IbanAccount): T

        fun visitUpiAccount(upiAccount: UpiAccount): T

        fun visitNgnAccount(ngnAccount: NgnAccount): T

        fun visitSparkWallet(sparkWallet: SparkWallet): T

        fun visitLightning(lightning: Lightning): T

        fun visitSolanaWallet(solanaWallet: SolanaWallet): T

        fun visitTronWallet(tronWallet: TronWallet): T

        fun visitPolygonWallet(polygonWallet: PolygonWallet): T

        fun visitBaseWallet(baseWallet: BaseWallet): T

        /**
         * Maps an unknown variant of [ExternalAccountInfo] to a value of type [T].
         *
         * An instance of [ExternalAccountInfo] can contain an unknown variant if it was
         * deserialized from data that doesn't match any known variant. For example, if the SDK is
         * on an older version than the API, then the API may respond with new variants that the SDK
         * is unaware of.
         *
         * @throws GridInvalidDataException in the default implementation.
         */
        fun unknown(json: JsonValue?): T {
            throw GridInvalidDataException("Unknown ExternalAccountInfo: $json")
        }
    }

    internal class Deserializer :
        BaseDeserializer<ExternalAccountInfo>(ExternalAccountInfo::class) {

        override fun ObjectCodec.deserialize(node: JsonNode): ExternalAccountInfo {
            val json = JsonValue.fromJsonNode(node)

            val bestMatches =
                sequenceOf(
                        tryDeserialize(node, jacksonTypeRef<UsAccount>())?.let {
                            ExternalAccountInfo(usAccount = it, _json = json)
                        },
                        tryDeserialize(node, jacksonTypeRef<ClabeAccount>())?.let {
                            ExternalAccountInfo(clabeAccount = it, _json = json)
                        },
                        tryDeserialize(node, jacksonTypeRef<PixAccount>())?.let {
                            ExternalAccountInfo(pixAccount = it, _json = json)
                        },
                        tryDeserialize(node, jacksonTypeRef<IbanAccount>())?.let {
                            ExternalAccountInfo(ibanAccount = it, _json = json)
                        },
                        tryDeserialize(node, jacksonTypeRef<UpiAccount>())?.let {
                            ExternalAccountInfo(upiAccount = it, _json = json)
                        },
                        tryDeserialize(node, jacksonTypeRef<NgnAccount>())?.let {
                            ExternalAccountInfo(ngnAccount = it, _json = json)
                        },
                        tryDeserialize(node, jacksonTypeRef<SparkWallet>())?.let {
                            ExternalAccountInfo(sparkWallet = it, _json = json)
                        },
                        tryDeserialize(node, jacksonTypeRef<Lightning>())?.let {
                            ExternalAccountInfo(lightning = it, _json = json)
                        },
                        tryDeserialize(node, jacksonTypeRef<SolanaWallet>())?.let {
                            ExternalAccountInfo(solanaWallet = it, _json = json)
                        },
                        tryDeserialize(node, jacksonTypeRef<TronWallet>())?.let {
                            ExternalAccountInfo(tronWallet = it, _json = json)
                        },
                        tryDeserialize(node, jacksonTypeRef<PolygonWallet>())?.let {
                            ExternalAccountInfo(polygonWallet = it, _json = json)
                        },
                        tryDeserialize(node, jacksonTypeRef<BaseWallet>())?.let {
                            ExternalAccountInfo(baseWallet = it, _json = json)
                        },
                    )
                    .filterNotNull()
                    .allMaxBy { it.validity() }
                    .toList()
            return when (bestMatches.size) {
                // This can happen if what we're deserializing is completely incompatible with all
                // the possible variants (e.g. deserializing from boolean).
                0 -> ExternalAccountInfo(_json = json)
                1 -> bestMatches.single()
                // If there's more than one match with the highest validity, then use the first
                // completely valid match, or simply the first match if none are completely valid.
                else -> bestMatches.firstOrNull { it.isValid() } ?: bestMatches.first()
            }
        }
    }

    internal class Serializer : BaseSerializer<ExternalAccountInfo>(ExternalAccountInfo::class) {

        override fun serialize(
            value: ExternalAccountInfo,
            generator: JsonGenerator,
            provider: SerializerProvider,
        ) {
            when {
                value.usAccount != null -> generator.writeObject(value.usAccount)
                value.clabeAccount != null -> generator.writeObject(value.clabeAccount)
                value.pixAccount != null -> generator.writeObject(value.pixAccount)
                value.ibanAccount != null -> generator.writeObject(value.ibanAccount)
                value.upiAccount != null -> generator.writeObject(value.upiAccount)
                value.ngnAccount != null -> generator.writeObject(value.ngnAccount)
                value.sparkWallet != null -> generator.writeObject(value.sparkWallet)
                value.lightning != null -> generator.writeObject(value.lightning)
                value.solanaWallet != null -> generator.writeObject(value.solanaWallet)
                value.tronWallet != null -> generator.writeObject(value.tronWallet)
                value.polygonWallet != null -> generator.writeObject(value.polygonWallet)
                value.baseWallet != null -> generator.writeObject(value.baseWallet)
                value._json != null -> generator.writeObject(value._json)
                else -> throw IllegalStateException("Invalid ExternalAccountInfo")
            }
        }
    }

    class UsAccount
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val accountCategory: JsonField<UsAccountInfo.AccountCategory>,
        private val accountNumber: JsonField<String>,
        private val accountType: JsonValue,
        private val routingNumber: JsonField<String>,
        private val bankName: JsonField<String>,
        private val beneficiary: JsonField<Beneficiary>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("accountCategory")
            @ExcludeMissing
            accountCategory: JsonField<UsAccountInfo.AccountCategory> = JsonMissing.of(),
            @JsonProperty("accountNumber")
            @ExcludeMissing
            accountNumber: JsonField<String> = JsonMissing.of(),
            @JsonProperty("accountType") @ExcludeMissing accountType: JsonValue = JsonMissing.of(),
            @JsonProperty("routingNumber")
            @ExcludeMissing
            routingNumber: JsonField<String> = JsonMissing.of(),
            @JsonProperty("bankName")
            @ExcludeMissing
            bankName: JsonField<String> = JsonMissing.of(),
            @JsonProperty("beneficiary")
            @ExcludeMissing
            beneficiary: JsonField<Beneficiary> = JsonMissing.of(),
        ) : this(
            accountCategory,
            accountNumber,
            accountType,
            routingNumber,
            bankName,
            beneficiary,
            mutableMapOf(),
        )

        fun toUsAccountInfo(): UsAccountInfo =
            UsAccountInfo.builder()
                .accountCategory(accountCategory)
                .accountNumber(accountNumber)
                .accountType(accountType)
                .routingNumber(routingNumber)
                .bankName(bankName)
                .build()

        /**
         * Type of account (checking or savings)
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun accountCategory(): UsAccountInfo.AccountCategory =
            accountCategory.getRequired("accountCategory")

        /**
         * US bank account number
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun accountNumber(): String = accountNumber.getRequired("accountNumber")

        /**
         * Expected to always return the following:
         * ```kotlin
         * JsonValue.from("US_ACCOUNT")
         * ```
         *
         * However, this method can be useful for debugging and logging (e.g. if the server
         * responded with an unexpected value).
         */
        @JsonProperty("accountType") @ExcludeMissing fun _accountType(): JsonValue = accountType

        /**
         * ACH routing number (9 digits)
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun routingNumber(): String = routingNumber.getRequired("routingNumber")

        /**
         * Name of the bank
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun bankName(): String? = bankName.getNullable("bankName")

        /**
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun beneficiary(): Beneficiary = beneficiary.getRequired("beneficiary")

        /**
         * Returns the raw JSON value of [accountCategory].
         *
         * Unlike [accountCategory], this method doesn't throw if the JSON field has an unexpected
         * type.
         */
        @JsonProperty("accountCategory")
        @ExcludeMissing
        fun _accountCategory(): JsonField<UsAccountInfo.AccountCategory> = accountCategory

        /**
         * Returns the raw JSON value of [accountNumber].
         *
         * Unlike [accountNumber], this method doesn't throw if the JSON field has an unexpected
         * type.
         */
        @JsonProperty("accountNumber")
        @ExcludeMissing
        fun _accountNumber(): JsonField<String> = accountNumber

        /**
         * Returns the raw JSON value of [routingNumber].
         *
         * Unlike [routingNumber], this method doesn't throw if the JSON field has an unexpected
         * type.
         */
        @JsonProperty("routingNumber")
        @ExcludeMissing
        fun _routingNumber(): JsonField<String> = routingNumber

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
             * Returns a mutable builder for constructing an instance of [UsAccount].
             *
             * The following fields are required:
             * ```kotlin
             * .accountCategory()
             * .accountNumber()
             * .routingNumber()
             * .beneficiary()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [UsAccount]. */
        class Builder internal constructor() {

            private var accountCategory: JsonField<UsAccountInfo.AccountCategory>? = null
            private var accountNumber: JsonField<String>? = null
            private var accountType: JsonValue = JsonValue.from("US_ACCOUNT")
            private var routingNumber: JsonField<String>? = null
            private var bankName: JsonField<String> = JsonMissing.of()
            private var beneficiary: JsonField<Beneficiary>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(usAccount: UsAccount) = apply {
                accountCategory = usAccount.accountCategory
                accountNumber = usAccount.accountNumber
                accountType = usAccount.accountType
                routingNumber = usAccount.routingNumber
                bankName = usAccount.bankName
                beneficiary = usAccount.beneficiary
                additionalProperties = usAccount.additionalProperties.toMutableMap()
            }

            /** Type of account (checking or savings) */
            fun accountCategory(accountCategory: UsAccountInfo.AccountCategory) =
                accountCategory(JsonField.of(accountCategory))

            /**
             * Sets [Builder.accountCategory] to an arbitrary JSON value.
             *
             * You should usually call [Builder.accountCategory] with a well-typed
             * [UsAccountInfo.AccountCategory] value instead. This method is primarily for setting
             * the field to an undocumented or not yet supported value.
             */
            fun accountCategory(accountCategory: JsonField<UsAccountInfo.AccountCategory>) = apply {
                this.accountCategory = accountCategory
            }

            /** US bank account number */
            fun accountNumber(accountNumber: String) = accountNumber(JsonField.of(accountNumber))

            /**
             * Sets [Builder.accountNumber] to an arbitrary JSON value.
             *
             * You should usually call [Builder.accountNumber] with a well-typed [String] value
             * instead. This method is primarily for setting the field to an undocumented or not yet
             * supported value.
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
             * JsonValue.from("US_ACCOUNT")
             * ```
             *
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun accountType(accountType: JsonValue) = apply { this.accountType = accountType }

            /** ACH routing number (9 digits) */
            fun routingNumber(routingNumber: String) = routingNumber(JsonField.of(routingNumber))

            /**
             * Sets [Builder.routingNumber] to an arbitrary JSON value.
             *
             * You should usually call [Builder.routingNumber] with a well-typed [String] value
             * instead. This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun routingNumber(routingNumber: JsonField<String>) = apply {
                this.routingNumber = routingNumber
            }

            /** Name of the bank */
            fun bankName(bankName: String) = bankName(JsonField.of(bankName))

            /**
             * Sets [Builder.bankName] to an arbitrary JSON value.
             *
             * You should usually call [Builder.bankName] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
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
             * Returns an immutable instance of [UsAccount].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             *
             * The following fields are required:
             * ```kotlin
             * .accountCategory()
             * .accountNumber()
             * .routingNumber()
             * .beneficiary()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): UsAccount =
                UsAccount(
                    checkRequired("accountCategory", accountCategory),
                    checkRequired("accountNumber", accountNumber),
                    accountType,
                    checkRequired("routingNumber", routingNumber),
                    bankName,
                    checkRequired("beneficiary", beneficiary),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): UsAccount = apply {
            if (validated) {
                return@apply
            }

            accountCategory().validate()
            accountNumber()
            _accountType().let {
                if (it != JsonValue.from("US_ACCOUNT")) {
                    throw GridInvalidDataException("'accountType' is invalid, received $it")
                }
            }
            routingNumber()
            bankName()
            beneficiary().validate()
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
            (accountCategory.asKnown()?.validity() ?: 0) +
                (if (accountNumber.asKnown() == null) 0 else 1) +
                accountType.let { if (it == JsonValue.from("US_ACCOUNT")) 1 else 0 } +
                (if (routingNumber.asKnown() == null) 0 else 1) +
                (if (bankName.asKnown() == null) 0 else 1) +
                (beneficiary.asKnown()?.validity() ?: 0)

        class AccountType @JsonCreator private constructor(private val value: JsonField<String>) :
            Enum {

            /**
             * Returns this class instance's raw value.
             *
             * This is usually only useful if this instance was deserialized from data that doesn't
             * match any known member, and you want to know that value. For example, if the SDK is
             * on an older version than the API, then the API may respond with new members that the
             * SDK is unaware of.
             */
            @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

            companion object {

                val US_ACCOUNT = of("US_ACCOUNT")

                val CLABE = of("CLABE")

                val PIX = of("PIX")

                val IBAN = of("IBAN")

                val UPI = of("UPI")

                val SPARK_WALLET = of("SPARK_WALLET")

                val LIGHTNING = of("LIGHTNING")

                val SOLANA_WALLET = of("SOLANA_WALLET")

                val TRON_WALLET = of("TRON_WALLET")

                val POLYGON_WALLET = of("POLYGON_WALLET")

                val BASE_WALLET = of("BASE_WALLET")

                fun of(value: String) = AccountType(JsonField.of(value))
            }

            /** An enum containing [AccountType]'s known values. */
            enum class Known {
                US_ACCOUNT,
                CLABE,
                PIX,
                IBAN,
                UPI,
                SPARK_WALLET,
                LIGHTNING,
                SOLANA_WALLET,
                TRON_WALLET,
                POLYGON_WALLET,
                BASE_WALLET,
            }

            /**
             * An enum containing [AccountType]'s known values, as well as an [_UNKNOWN] member.
             *
             * An instance of [AccountType] can contain an unknown value in a couple of cases:
             * - It was deserialized from data that doesn't match any known member. For example, if
             *   the SDK is on an older version than the API, then the API may respond with new
             *   members that the SDK is unaware of.
             * - It was constructed with an arbitrary value using the [of] method.
             */
            enum class Value {
                US_ACCOUNT,
                CLABE,
                PIX,
                IBAN,
                UPI,
                SPARK_WALLET,
                LIGHTNING,
                SOLANA_WALLET,
                TRON_WALLET,
                POLYGON_WALLET,
                BASE_WALLET,
                /**
                 * An enum member indicating that [AccountType] was instantiated with an unknown
                 * value.
                 */
                _UNKNOWN,
            }

            /**
             * Returns an enum member corresponding to this class instance's value, or
             * [Value._UNKNOWN] if the class was instantiated with an unknown value.
             *
             * Use the [known] method instead if you're certain the value is always known or if you
             * want to throw for the unknown case.
             */
            fun value(): Value =
                when (this) {
                    US_ACCOUNT -> Value.US_ACCOUNT
                    CLABE -> Value.CLABE
                    PIX -> Value.PIX
                    IBAN -> Value.IBAN
                    UPI -> Value.UPI
                    SPARK_WALLET -> Value.SPARK_WALLET
                    LIGHTNING -> Value.LIGHTNING
                    SOLANA_WALLET -> Value.SOLANA_WALLET
                    TRON_WALLET -> Value.TRON_WALLET
                    POLYGON_WALLET -> Value.POLYGON_WALLET
                    BASE_WALLET -> Value.BASE_WALLET
                    else -> Value._UNKNOWN
                }

            /**
             * Returns an enum member corresponding to this class instance's value.
             *
             * Use the [value] method instead if you're uncertain the value is always known and
             * don't want to throw for the unknown case.
             *
             * @throws GridInvalidDataException if this class instance's value is a not a known
             *   member.
             */
            fun known(): Known =
                when (this) {
                    US_ACCOUNT -> Known.US_ACCOUNT
                    CLABE -> Known.CLABE
                    PIX -> Known.PIX
                    IBAN -> Known.IBAN
                    UPI -> Known.UPI
                    SPARK_WALLET -> Known.SPARK_WALLET
                    LIGHTNING -> Known.LIGHTNING
                    SOLANA_WALLET -> Known.SOLANA_WALLET
                    TRON_WALLET -> Known.TRON_WALLET
                    POLYGON_WALLET -> Known.POLYGON_WALLET
                    BASE_WALLET -> Known.BASE_WALLET
                    else -> throw GridInvalidDataException("Unknown AccountType: $value")
                }

            /**
             * Returns this class instance's primitive wire representation.
             *
             * This differs from the [toString] method because that method is primarily for
             * debugging and generally doesn't throw.
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

                        override fun visitBusiness(business: BusinessBeneficiary) =
                            business.validity()

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
                 * An instance of [Beneficiary] can contain an unknown variant if it was
                 * deserialized from data that doesn't match any known variant. For example, if the
                 * SDK is on an older version than the API, then the API may respond with new
                 * variants that the SDK is unaware of.
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
                            return tryDeserialize(node, jacksonTypeRef<IndividualBeneficiary>())
                                ?.let { Beneficiary(individual = it, _json = json) }
                                ?: Beneficiary(_json = json)
                        }
                        "BUSINESS" -> {
                            return tryDeserialize(node, jacksonTypeRef<BusinessBeneficiary>())
                                ?.let { Beneficiary(business = it, _json = json) }
                                ?: Beneficiary(_json = json)
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

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is UsAccount &&
                accountCategory == other.accountCategory &&
                accountNumber == other.accountNumber &&
                accountType == other.accountType &&
                routingNumber == other.routingNumber &&
                bankName == other.bankName &&
                beneficiary == other.beneficiary &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(
                accountCategory,
                accountNumber,
                accountType,
                routingNumber,
                bankName,
                beneficiary,
                additionalProperties,
            )
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "UsAccount{accountCategory=$accountCategory, accountNumber=$accountNumber, accountType=$accountType, routingNumber=$routingNumber, bankName=$bankName, beneficiary=$beneficiary, additionalProperties=$additionalProperties}"
    }

    class ClabeAccount
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val accountType: JsonValue,
        private val clabeNumber: JsonField<String>,
        private val beneficiary: JsonField<Beneficiary>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("accountType") @ExcludeMissing accountType: JsonValue = JsonMissing.of(),
            @JsonProperty("clabeNumber")
            @ExcludeMissing
            clabeNumber: JsonField<String> = JsonMissing.of(),
            @JsonProperty("beneficiary")
            @ExcludeMissing
            beneficiary: JsonField<Beneficiary> = JsonMissing.of(),
        ) : this(accountType, clabeNumber, beneficiary, mutableMapOf())

        fun toClabeAccountInfo(): ClabeAccountInfo =
            ClabeAccountInfo.builder().accountType(accountType).clabeNumber(clabeNumber).build()

        /**
         * Expected to always return the following:
         * ```kotlin
         * JsonValue.from("CLABE")
         * ```
         *
         * However, this method can be useful for debugging and logging (e.g. if the server
         * responded with an unexpected value).
         */
        @JsonProperty("accountType") @ExcludeMissing fun _accountType(): JsonValue = accountType

        /**
         * 18-digit CLABE number (Mexican banking standard)
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun clabeNumber(): String = clabeNumber.getRequired("clabeNumber")

        /**
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun beneficiary(): Beneficiary? = beneficiary.getNullable("beneficiary")

        /**
         * Returns the raw JSON value of [clabeNumber].
         *
         * Unlike [clabeNumber], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("clabeNumber")
        @ExcludeMissing
        fun _clabeNumber(): JsonField<String> = clabeNumber

        /**
         * Returns the raw JSON value of [beneficiary].
         *
         * Unlike [beneficiary], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("beneficiary")
        @ExcludeMissing
        fun _beneficiary(): JsonField<Beneficiary> = beneficiary

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
             * Returns a mutable builder for constructing an instance of [ClabeAccount].
             *
             * The following fields are required:
             * ```kotlin
             * .clabeNumber()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [ClabeAccount]. */
        class Builder internal constructor() {

            private var accountType: JsonValue = JsonValue.from("CLABE")
            private var clabeNumber: JsonField<String>? = null
            private var beneficiary: JsonField<Beneficiary> = JsonMissing.of()
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(clabeAccount: ClabeAccount) = apply {
                accountType = clabeAccount.accountType
                clabeNumber = clabeAccount.clabeNumber
                beneficiary = clabeAccount.beneficiary
                additionalProperties = clabeAccount.additionalProperties.toMutableMap()
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
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun accountType(accountType: JsonValue) = apply { this.accountType = accountType }

            /** 18-digit CLABE number (Mexican banking standard) */
            fun clabeNumber(clabeNumber: String) = clabeNumber(JsonField.of(clabeNumber))

            /**
             * Sets [Builder.clabeNumber] to an arbitrary JSON value.
             *
             * You should usually call [Builder.clabeNumber] with a well-typed [String] value
             * instead. This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun clabeNumber(clabeNumber: JsonField<String>) = apply {
                this.clabeNumber = clabeNumber
            }

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
             * Returns an immutable instance of [ClabeAccount].
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
            fun build(): ClabeAccount =
                ClabeAccount(
                    accountType,
                    checkRequired("clabeNumber", clabeNumber),
                    beneficiary,
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): ClabeAccount = apply {
            if (validated) {
                return@apply
            }

            _accountType().let {
                if (it != JsonValue.from("CLABE")) {
                    throw GridInvalidDataException("'accountType' is invalid, received $it")
                }
            }
            clabeNumber()
            beneficiary()?.validate()
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
            accountType.let { if (it == JsonValue.from("CLABE")) 1 else 0 } +
                (if (clabeNumber.asKnown() == null) 0 else 1) +
                (beneficiary.asKnown()?.validity() ?: 0)

        class AccountType @JsonCreator private constructor(private val value: JsonField<String>) :
            Enum {

            /**
             * Returns this class instance's raw value.
             *
             * This is usually only useful if this instance was deserialized from data that doesn't
             * match any known member, and you want to know that value. For example, if the SDK is
             * on an older version than the API, then the API may respond with new members that the
             * SDK is unaware of.
             */
            @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

            companion object {

                val CLABE = of("CLABE")

                val US_ACCOUNT = of("US_ACCOUNT")

                val PIX = of("PIX")

                val IBAN = of("IBAN")

                val UPI = of("UPI")

                val SPARK_WALLET = of("SPARK_WALLET")

                val LIGHTNING = of("LIGHTNING")

                val SOLANA_WALLET = of("SOLANA_WALLET")

                val TRON_WALLET = of("TRON_WALLET")

                val POLYGON_WALLET = of("POLYGON_WALLET")

                val BASE_WALLET = of("BASE_WALLET")

                fun of(value: String) = AccountType(JsonField.of(value))
            }

            /** An enum containing [AccountType]'s known values. */
            enum class Known {
                CLABE,
                US_ACCOUNT,
                PIX,
                IBAN,
                UPI,
                SPARK_WALLET,
                LIGHTNING,
                SOLANA_WALLET,
                TRON_WALLET,
                POLYGON_WALLET,
                BASE_WALLET,
            }

            /**
             * An enum containing [AccountType]'s known values, as well as an [_UNKNOWN] member.
             *
             * An instance of [AccountType] can contain an unknown value in a couple of cases:
             * - It was deserialized from data that doesn't match any known member. For example, if
             *   the SDK is on an older version than the API, then the API may respond with new
             *   members that the SDK is unaware of.
             * - It was constructed with an arbitrary value using the [of] method.
             */
            enum class Value {
                CLABE,
                US_ACCOUNT,
                PIX,
                IBAN,
                UPI,
                SPARK_WALLET,
                LIGHTNING,
                SOLANA_WALLET,
                TRON_WALLET,
                POLYGON_WALLET,
                BASE_WALLET,
                /**
                 * An enum member indicating that [AccountType] was instantiated with an unknown
                 * value.
                 */
                _UNKNOWN,
            }

            /**
             * Returns an enum member corresponding to this class instance's value, or
             * [Value._UNKNOWN] if the class was instantiated with an unknown value.
             *
             * Use the [known] method instead if you're certain the value is always known or if you
             * want to throw for the unknown case.
             */
            fun value(): Value =
                when (this) {
                    CLABE -> Value.CLABE
                    US_ACCOUNT -> Value.US_ACCOUNT
                    PIX -> Value.PIX
                    IBAN -> Value.IBAN
                    UPI -> Value.UPI
                    SPARK_WALLET -> Value.SPARK_WALLET
                    LIGHTNING -> Value.LIGHTNING
                    SOLANA_WALLET -> Value.SOLANA_WALLET
                    TRON_WALLET -> Value.TRON_WALLET
                    POLYGON_WALLET -> Value.POLYGON_WALLET
                    BASE_WALLET -> Value.BASE_WALLET
                    else -> Value._UNKNOWN
                }

            /**
             * Returns an enum member corresponding to this class instance's value.
             *
             * Use the [value] method instead if you're uncertain the value is always known and
             * don't want to throw for the unknown case.
             *
             * @throws GridInvalidDataException if this class instance's value is a not a known
             *   member.
             */
            fun known(): Known =
                when (this) {
                    CLABE -> Known.CLABE
                    US_ACCOUNT -> Known.US_ACCOUNT
                    PIX -> Known.PIX
                    IBAN -> Known.IBAN
                    UPI -> Known.UPI
                    SPARK_WALLET -> Known.SPARK_WALLET
                    LIGHTNING -> Known.LIGHTNING
                    SOLANA_WALLET -> Known.SOLANA_WALLET
                    TRON_WALLET -> Known.TRON_WALLET
                    POLYGON_WALLET -> Known.POLYGON_WALLET
                    BASE_WALLET -> Known.BASE_WALLET
                    else -> throw GridInvalidDataException("Unknown AccountType: $value")
                }

            /**
             * Returns this class instance's primitive wire representation.
             *
             * This differs from the [toString] method because that method is primarily for
             * debugging and generally doesn't throw.
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

                        override fun visitBusiness(business: BusinessBeneficiary) =
                            business.validity()

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
                 * An instance of [Beneficiary] can contain an unknown variant if it was
                 * deserialized from data that doesn't match any known variant. For example, if the
                 * SDK is on an older version than the API, then the API may respond with new
                 * variants that the SDK is unaware of.
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
                            return tryDeserialize(node, jacksonTypeRef<IndividualBeneficiary>())
                                ?.let { Beneficiary(individual = it, _json = json) }
                                ?: Beneficiary(_json = json)
                        }
                        "BUSINESS" -> {
                            return tryDeserialize(node, jacksonTypeRef<BusinessBeneficiary>())
                                ?.let { Beneficiary(business = it, _json = json) }
                                ?: Beneficiary(_json = json)
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

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is ClabeAccount &&
                accountType == other.accountType &&
                clabeNumber == other.clabeNumber &&
                beneficiary == other.beneficiary &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(accountType, clabeNumber, beneficiary, additionalProperties)
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "ClabeAccount{accountType=$accountType, clabeNumber=$clabeNumber, beneficiary=$beneficiary, additionalProperties=$additionalProperties}"
    }

    class PixAccount
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val accountType: JsonValue,
        private val pixKey: JsonField<String>,
        private val pixKeyType: JsonField<PixAccountInfo.PixKeyType>,
        private val taxId: JsonField<String>,
        private val beneficiary: JsonField<Beneficiary>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("accountType") @ExcludeMissing accountType: JsonValue = JsonMissing.of(),
            @JsonProperty("pixKey") @ExcludeMissing pixKey: JsonField<String> = JsonMissing.of(),
            @JsonProperty("pixKeyType")
            @ExcludeMissing
            pixKeyType: JsonField<PixAccountInfo.PixKeyType> = JsonMissing.of(),
            @JsonProperty("taxId") @ExcludeMissing taxId: JsonField<String> = JsonMissing.of(),
            @JsonProperty("beneficiary")
            @ExcludeMissing
            beneficiary: JsonField<Beneficiary> = JsonMissing.of(),
        ) : this(accountType, pixKey, pixKeyType, taxId, beneficiary, mutableMapOf())

        fun toPixAccountInfo(): PixAccountInfo =
            PixAccountInfo.builder()
                .accountType(accountType)
                .pixKey(pixKey)
                .pixKeyType(pixKeyType)
                .taxId(taxId)
                .build()

        /**
         * Expected to always return the following:
         * ```kotlin
         * JsonValue.from("PIX")
         * ```
         *
         * However, this method can be useful for debugging and logging (e.g. if the server
         * responded with an unexpected value).
         */
        @JsonProperty("accountType") @ExcludeMissing fun _accountType(): JsonValue = accountType

        /**
         * PIX key for Brazilian instant payments
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun pixKey(): String = pixKey.getRequired("pixKey")

        /**
         * Type of PIX key being used
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun pixKeyType(): PixAccountInfo.PixKeyType = pixKeyType.getRequired("pixKeyType")

        /**
         * Tax ID of the account holder
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun taxId(): String = taxId.getRequired("taxId")

        /**
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun beneficiary(): Beneficiary? = beneficiary.getNullable("beneficiary")

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
        fun _pixKeyType(): JsonField<PixAccountInfo.PixKeyType> = pixKeyType

        /**
         * Returns the raw JSON value of [taxId].
         *
         * Unlike [taxId], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("taxId") @ExcludeMissing fun _taxId(): JsonField<String> = taxId

        /**
         * Returns the raw JSON value of [beneficiary].
         *
         * Unlike [beneficiary], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("beneficiary")
        @ExcludeMissing
        fun _beneficiary(): JsonField<Beneficiary> = beneficiary

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
             * Returns a mutable builder for constructing an instance of [PixAccount].
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

        /** A builder for [PixAccount]. */
        class Builder internal constructor() {

            private var accountType: JsonValue = JsonValue.from("PIX")
            private var pixKey: JsonField<String>? = null
            private var pixKeyType: JsonField<PixAccountInfo.PixKeyType>? = null
            private var taxId: JsonField<String>? = null
            private var beneficiary: JsonField<Beneficiary> = JsonMissing.of()
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(pixAccount: PixAccount) = apply {
                accountType = pixAccount.accountType
                pixKey = pixAccount.pixKey
                pixKeyType = pixAccount.pixKeyType
                taxId = pixAccount.taxId
                beneficiary = pixAccount.beneficiary
                additionalProperties = pixAccount.additionalProperties.toMutableMap()
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
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun accountType(accountType: JsonValue) = apply { this.accountType = accountType }

            /** PIX key for Brazilian instant payments */
            fun pixKey(pixKey: String) = pixKey(JsonField.of(pixKey))

            /**
             * Sets [Builder.pixKey] to an arbitrary JSON value.
             *
             * You should usually call [Builder.pixKey] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun pixKey(pixKey: JsonField<String>) = apply { this.pixKey = pixKey }

            /** Type of PIX key being used */
            fun pixKeyType(pixKeyType: PixAccountInfo.PixKeyType) =
                pixKeyType(JsonField.of(pixKeyType))

            /**
             * Sets [Builder.pixKeyType] to an arbitrary JSON value.
             *
             * You should usually call [Builder.pixKeyType] with a well-typed
             * [PixAccountInfo.PixKeyType] value instead. This method is primarily for setting the
             * field to an undocumented or not yet supported value.
             */
            fun pixKeyType(pixKeyType: JsonField<PixAccountInfo.PixKeyType>) = apply {
                this.pixKeyType = pixKeyType
            }

            /** Tax ID of the account holder */
            fun taxId(taxId: String) = taxId(JsonField.of(taxId))

            /**
             * Sets [Builder.taxId] to an arbitrary JSON value.
             *
             * You should usually call [Builder.taxId] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun taxId(taxId: JsonField<String>) = apply { this.taxId = taxId }

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
             * Returns an immutable instance of [PixAccount].
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
            fun build(): PixAccount =
                PixAccount(
                    accountType,
                    checkRequired("pixKey", pixKey),
                    checkRequired("pixKeyType", pixKeyType),
                    checkRequired("taxId", taxId),
                    beneficiary,
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): PixAccount = apply {
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
            beneficiary()?.validate()
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
            accountType.let { if (it == JsonValue.from("PIX")) 1 else 0 } +
                (if (pixKey.asKnown() == null) 0 else 1) +
                (pixKeyType.asKnown()?.validity() ?: 0) +
                (if (taxId.asKnown() == null) 0 else 1) +
                (beneficiary.asKnown()?.validity() ?: 0)

        class AccountType @JsonCreator private constructor(private val value: JsonField<String>) :
            Enum {

            /**
             * Returns this class instance's raw value.
             *
             * This is usually only useful if this instance was deserialized from data that doesn't
             * match any known member, and you want to know that value. For example, if the SDK is
             * on an older version than the API, then the API may respond with new members that the
             * SDK is unaware of.
             */
            @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

            companion object {

                val PIX = of("PIX")

                val CLABE = of("CLABE")

                val US_ACCOUNT = of("US_ACCOUNT")

                val IBAN = of("IBAN")

                val UPI = of("UPI")

                val SPARK_WALLET = of("SPARK_WALLET")

                val LIGHTNING = of("LIGHTNING")

                val SOLANA_WALLET = of("SOLANA_WALLET")

                val TRON_WALLET = of("TRON_WALLET")

                val POLYGON_WALLET = of("POLYGON_WALLET")

                val BASE_WALLET = of("BASE_WALLET")

                fun of(value: String) = AccountType(JsonField.of(value))
            }

            /** An enum containing [AccountType]'s known values. */
            enum class Known {
                PIX,
                CLABE,
                US_ACCOUNT,
                IBAN,
                UPI,
                SPARK_WALLET,
                LIGHTNING,
                SOLANA_WALLET,
                TRON_WALLET,
                POLYGON_WALLET,
                BASE_WALLET,
            }

            /**
             * An enum containing [AccountType]'s known values, as well as an [_UNKNOWN] member.
             *
             * An instance of [AccountType] can contain an unknown value in a couple of cases:
             * - It was deserialized from data that doesn't match any known member. For example, if
             *   the SDK is on an older version than the API, then the API may respond with new
             *   members that the SDK is unaware of.
             * - It was constructed with an arbitrary value using the [of] method.
             */
            enum class Value {
                PIX,
                CLABE,
                US_ACCOUNT,
                IBAN,
                UPI,
                SPARK_WALLET,
                LIGHTNING,
                SOLANA_WALLET,
                TRON_WALLET,
                POLYGON_WALLET,
                BASE_WALLET,
                /**
                 * An enum member indicating that [AccountType] was instantiated with an unknown
                 * value.
                 */
                _UNKNOWN,
            }

            /**
             * Returns an enum member corresponding to this class instance's value, or
             * [Value._UNKNOWN] if the class was instantiated with an unknown value.
             *
             * Use the [known] method instead if you're certain the value is always known or if you
             * want to throw for the unknown case.
             */
            fun value(): Value =
                when (this) {
                    PIX -> Value.PIX
                    CLABE -> Value.CLABE
                    US_ACCOUNT -> Value.US_ACCOUNT
                    IBAN -> Value.IBAN
                    UPI -> Value.UPI
                    SPARK_WALLET -> Value.SPARK_WALLET
                    LIGHTNING -> Value.LIGHTNING
                    SOLANA_WALLET -> Value.SOLANA_WALLET
                    TRON_WALLET -> Value.TRON_WALLET
                    POLYGON_WALLET -> Value.POLYGON_WALLET
                    BASE_WALLET -> Value.BASE_WALLET
                    else -> Value._UNKNOWN
                }

            /**
             * Returns an enum member corresponding to this class instance's value.
             *
             * Use the [value] method instead if you're uncertain the value is always known and
             * don't want to throw for the unknown case.
             *
             * @throws GridInvalidDataException if this class instance's value is a not a known
             *   member.
             */
            fun known(): Known =
                when (this) {
                    PIX -> Known.PIX
                    CLABE -> Known.CLABE
                    US_ACCOUNT -> Known.US_ACCOUNT
                    IBAN -> Known.IBAN
                    UPI -> Known.UPI
                    SPARK_WALLET -> Known.SPARK_WALLET
                    LIGHTNING -> Known.LIGHTNING
                    SOLANA_WALLET -> Known.SOLANA_WALLET
                    TRON_WALLET -> Known.TRON_WALLET
                    POLYGON_WALLET -> Known.POLYGON_WALLET
                    BASE_WALLET -> Known.BASE_WALLET
                    else -> throw GridInvalidDataException("Unknown AccountType: $value")
                }

            /**
             * Returns this class instance's primitive wire representation.
             *
             * This differs from the [toString] method because that method is primarily for
             * debugging and generally doesn't throw.
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

                        override fun visitBusiness(business: BusinessBeneficiary) =
                            business.validity()

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
                 * An instance of [Beneficiary] can contain an unknown variant if it was
                 * deserialized from data that doesn't match any known variant. For example, if the
                 * SDK is on an older version than the API, then the API may respond with new
                 * variants that the SDK is unaware of.
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
                            return tryDeserialize(node, jacksonTypeRef<IndividualBeneficiary>())
                                ?.let { Beneficiary(individual = it, _json = json) }
                                ?: Beneficiary(_json = json)
                        }
                        "BUSINESS" -> {
                            return tryDeserialize(node, jacksonTypeRef<BusinessBeneficiary>())
                                ?.let { Beneficiary(business = it, _json = json) }
                                ?: Beneficiary(_json = json)
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

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is PixAccount &&
                accountType == other.accountType &&
                pixKey == other.pixKey &&
                pixKeyType == other.pixKeyType &&
                taxId == other.taxId &&
                beneficiary == other.beneficiary &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(accountType, pixKey, pixKeyType, taxId, beneficiary, additionalProperties)
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "PixAccount{accountType=$accountType, pixKey=$pixKey, pixKeyType=$pixKeyType, taxId=$taxId, beneficiary=$beneficiary, additionalProperties=$additionalProperties}"
    }

    class IbanAccount
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val accountType: JsonValue,
        private val iban: JsonField<String>,
        private val swiftBic: JsonField<String>,
        private val beneficiary: JsonField<Beneficiary>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("accountType") @ExcludeMissing accountType: JsonValue = JsonMissing.of(),
            @JsonProperty("iban") @ExcludeMissing iban: JsonField<String> = JsonMissing.of(),
            @JsonProperty("swiftBic")
            @ExcludeMissing
            swiftBic: JsonField<String> = JsonMissing.of(),
            @JsonProperty("beneficiary")
            @ExcludeMissing
            beneficiary: JsonField<Beneficiary> = JsonMissing.of(),
        ) : this(accountType, iban, swiftBic, beneficiary, mutableMapOf())

        fun toIbanAccountInfo(): IbanAccountInfo =
            IbanAccountInfo.builder().accountType(accountType).iban(iban).swiftBic(swiftBic).build()

        /**
         * Expected to always return the following:
         * ```kotlin
         * JsonValue.from("IBAN")
         * ```
         *
         * However, this method can be useful for debugging and logging (e.g. if the server
         * responded with an unexpected value).
         */
        @JsonProperty("accountType") @ExcludeMissing fun _accountType(): JsonValue = accountType

        /**
         * International Bank Account Number
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun iban(): String = iban.getRequired("iban")

        /**
         * SWIFT/BIC code (8 or 11 characters)
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun swiftBic(): String = swiftBic.getRequired("swiftBic")

        /**
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun beneficiary(): Beneficiary? = beneficiary.getNullable("beneficiary")

        /**
         * Returns the raw JSON value of [iban].
         *
         * Unlike [iban], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("iban") @ExcludeMissing fun _iban(): JsonField<String> = iban

        /**
         * Returns the raw JSON value of [swiftBic].
         *
         * Unlike [swiftBic], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("swiftBic") @ExcludeMissing fun _swiftBic(): JsonField<String> = swiftBic

        /**
         * Returns the raw JSON value of [beneficiary].
         *
         * Unlike [beneficiary], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("beneficiary")
        @ExcludeMissing
        fun _beneficiary(): JsonField<Beneficiary> = beneficiary

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
             * Returns a mutable builder for constructing an instance of [IbanAccount].
             *
             * The following fields are required:
             * ```kotlin
             * .iban()
             * .swiftBic()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [IbanAccount]. */
        class Builder internal constructor() {

            private var accountType: JsonValue = JsonValue.from("IBAN")
            private var iban: JsonField<String>? = null
            private var swiftBic: JsonField<String>? = null
            private var beneficiary: JsonField<Beneficiary> = JsonMissing.of()
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(ibanAccount: IbanAccount) = apply {
                accountType = ibanAccount.accountType
                iban = ibanAccount.iban
                swiftBic = ibanAccount.swiftBic
                beneficiary = ibanAccount.beneficiary
                additionalProperties = ibanAccount.additionalProperties.toMutableMap()
            }

            /**
             * Sets the field to an arbitrary JSON value.
             *
             * It is usually unnecessary to call this method because the field defaults to the
             * following:
             * ```kotlin
             * JsonValue.from("IBAN")
             * ```
             *
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun accountType(accountType: JsonValue) = apply { this.accountType = accountType }

            /** International Bank Account Number */
            fun iban(iban: String) = iban(JsonField.of(iban))

            /**
             * Sets [Builder.iban] to an arbitrary JSON value.
             *
             * You should usually call [Builder.iban] with a well-typed [String] value instead. This
             * method is primarily for setting the field to an undocumented or not yet supported
             * value.
             */
            fun iban(iban: JsonField<String>) = apply { this.iban = iban }

            /** SWIFT/BIC code (8 or 11 characters) */
            fun swiftBic(swiftBic: String) = swiftBic(JsonField.of(swiftBic))

            /**
             * Sets [Builder.swiftBic] to an arbitrary JSON value.
             *
             * You should usually call [Builder.swiftBic] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun swiftBic(swiftBic: JsonField<String>) = apply { this.swiftBic = swiftBic }

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
             * Returns an immutable instance of [IbanAccount].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             *
             * The following fields are required:
             * ```kotlin
             * .iban()
             * .swiftBic()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): IbanAccount =
                IbanAccount(
                    accountType,
                    checkRequired("iban", iban),
                    checkRequired("swiftBic", swiftBic),
                    beneficiary,
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): IbanAccount = apply {
            if (validated) {
                return@apply
            }

            _accountType().let {
                if (it != JsonValue.from("IBAN")) {
                    throw GridInvalidDataException("'accountType' is invalid, received $it")
                }
            }
            iban()
            swiftBic()
            beneficiary()?.validate()
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
            accountType.let { if (it == JsonValue.from("IBAN")) 1 else 0 } +
                (if (iban.asKnown() == null) 0 else 1) +
                (if (swiftBic.asKnown() == null) 0 else 1) +
                (beneficiary.asKnown()?.validity() ?: 0)

        class AccountType @JsonCreator private constructor(private val value: JsonField<String>) :
            Enum {

            /**
             * Returns this class instance's raw value.
             *
             * This is usually only useful if this instance was deserialized from data that doesn't
             * match any known member, and you want to know that value. For example, if the SDK is
             * on an older version than the API, then the API may respond with new members that the
             * SDK is unaware of.
             */
            @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

            companion object {

                val IBAN = of("IBAN")

                val CLABE = of("CLABE")

                val US_ACCOUNT = of("US_ACCOUNT")

                val PIX = of("PIX")

                val UPI = of("UPI")

                val SPARK_WALLET = of("SPARK_WALLET")

                val LIGHTNING = of("LIGHTNING")

                val SOLANA_WALLET = of("SOLANA_WALLET")

                val TRON_WALLET = of("TRON_WALLET")

                val POLYGON_WALLET = of("POLYGON_WALLET")

                val BASE_WALLET = of("BASE_WALLET")

                fun of(value: String) = AccountType(JsonField.of(value))
            }

            /** An enum containing [AccountType]'s known values. */
            enum class Known {
                IBAN,
                CLABE,
                US_ACCOUNT,
                PIX,
                UPI,
                SPARK_WALLET,
                LIGHTNING,
                SOLANA_WALLET,
                TRON_WALLET,
                POLYGON_WALLET,
                BASE_WALLET,
            }

            /**
             * An enum containing [AccountType]'s known values, as well as an [_UNKNOWN] member.
             *
             * An instance of [AccountType] can contain an unknown value in a couple of cases:
             * - It was deserialized from data that doesn't match any known member. For example, if
             *   the SDK is on an older version than the API, then the API may respond with new
             *   members that the SDK is unaware of.
             * - It was constructed with an arbitrary value using the [of] method.
             */
            enum class Value {
                IBAN,
                CLABE,
                US_ACCOUNT,
                PIX,
                UPI,
                SPARK_WALLET,
                LIGHTNING,
                SOLANA_WALLET,
                TRON_WALLET,
                POLYGON_WALLET,
                BASE_WALLET,
                /**
                 * An enum member indicating that [AccountType] was instantiated with an unknown
                 * value.
                 */
                _UNKNOWN,
            }

            /**
             * Returns an enum member corresponding to this class instance's value, or
             * [Value._UNKNOWN] if the class was instantiated with an unknown value.
             *
             * Use the [known] method instead if you're certain the value is always known or if you
             * want to throw for the unknown case.
             */
            fun value(): Value =
                when (this) {
                    IBAN -> Value.IBAN
                    CLABE -> Value.CLABE
                    US_ACCOUNT -> Value.US_ACCOUNT
                    PIX -> Value.PIX
                    UPI -> Value.UPI
                    SPARK_WALLET -> Value.SPARK_WALLET
                    LIGHTNING -> Value.LIGHTNING
                    SOLANA_WALLET -> Value.SOLANA_WALLET
                    TRON_WALLET -> Value.TRON_WALLET
                    POLYGON_WALLET -> Value.POLYGON_WALLET
                    BASE_WALLET -> Value.BASE_WALLET
                    else -> Value._UNKNOWN
                }

            /**
             * Returns an enum member corresponding to this class instance's value.
             *
             * Use the [value] method instead if you're uncertain the value is always known and
             * don't want to throw for the unknown case.
             *
             * @throws GridInvalidDataException if this class instance's value is a not a known
             *   member.
             */
            fun known(): Known =
                when (this) {
                    IBAN -> Known.IBAN
                    CLABE -> Known.CLABE
                    US_ACCOUNT -> Known.US_ACCOUNT
                    PIX -> Known.PIX
                    UPI -> Known.UPI
                    SPARK_WALLET -> Known.SPARK_WALLET
                    LIGHTNING -> Known.LIGHTNING
                    SOLANA_WALLET -> Known.SOLANA_WALLET
                    TRON_WALLET -> Known.TRON_WALLET
                    POLYGON_WALLET -> Known.POLYGON_WALLET
                    BASE_WALLET -> Known.BASE_WALLET
                    else -> throw GridInvalidDataException("Unknown AccountType: $value")
                }

            /**
             * Returns this class instance's primitive wire representation.
             *
             * This differs from the [toString] method because that method is primarily for
             * debugging and generally doesn't throw.
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

                        override fun visitBusiness(business: BusinessBeneficiary) =
                            business.validity()

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
                 * An instance of [Beneficiary] can contain an unknown variant if it was
                 * deserialized from data that doesn't match any known variant. For example, if the
                 * SDK is on an older version than the API, then the API may respond with new
                 * variants that the SDK is unaware of.
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
                            return tryDeserialize(node, jacksonTypeRef<IndividualBeneficiary>())
                                ?.let { Beneficiary(individual = it, _json = json) }
                                ?: Beneficiary(_json = json)
                        }
                        "BUSINESS" -> {
                            return tryDeserialize(node, jacksonTypeRef<BusinessBeneficiary>())
                                ?.let { Beneficiary(business = it, _json = json) }
                                ?: Beneficiary(_json = json)
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

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is IbanAccount &&
                accountType == other.accountType &&
                iban == other.iban &&
                swiftBic == other.swiftBic &&
                beneficiary == other.beneficiary &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(accountType, iban, swiftBic, beneficiary, additionalProperties)
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "IbanAccount{accountType=$accountType, iban=$iban, swiftBic=$swiftBic, beneficiary=$beneficiary, additionalProperties=$additionalProperties}"
    }

    class UpiAccount
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val accountType: JsonValue,
        private val vpa: JsonField<String>,
        private val beneficiary: JsonField<Beneficiary>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("accountType") @ExcludeMissing accountType: JsonValue = JsonMissing.of(),
            @JsonProperty("vpa") @ExcludeMissing vpa: JsonField<String> = JsonMissing.of(),
            @JsonProperty("beneficiary")
            @ExcludeMissing
            beneficiary: JsonField<Beneficiary> = JsonMissing.of(),
        ) : this(accountType, vpa, beneficiary, mutableMapOf())

        fun toUpiAccountInfo(): UpiAccountInfo =
            UpiAccountInfo.builder().accountType(accountType).vpa(vpa).build()

        /**
         * Expected to always return the following:
         * ```kotlin
         * JsonValue.from("UPI")
         * ```
         *
         * However, this method can be useful for debugging and logging (e.g. if the server
         * responded with an unexpected value).
         */
        @JsonProperty("accountType") @ExcludeMissing fun _accountType(): JsonValue = accountType

        /**
         * Virtual Payment Address for UPI payments
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun vpa(): String = vpa.getRequired("vpa")

        /**
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun beneficiary(): Beneficiary? = beneficiary.getNullable("beneficiary")

        /**
         * Returns the raw JSON value of [vpa].
         *
         * Unlike [vpa], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("vpa") @ExcludeMissing fun _vpa(): JsonField<String> = vpa

        /**
         * Returns the raw JSON value of [beneficiary].
         *
         * Unlike [beneficiary], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("beneficiary")
        @ExcludeMissing
        fun _beneficiary(): JsonField<Beneficiary> = beneficiary

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
             * Returns a mutable builder for constructing an instance of [UpiAccount].
             *
             * The following fields are required:
             * ```kotlin
             * .vpa()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [UpiAccount]. */
        class Builder internal constructor() {

            private var accountType: JsonValue = JsonValue.from("UPI")
            private var vpa: JsonField<String>? = null
            private var beneficiary: JsonField<Beneficiary> = JsonMissing.of()
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(upiAccount: UpiAccount) = apply {
                accountType = upiAccount.accountType
                vpa = upiAccount.vpa
                beneficiary = upiAccount.beneficiary
                additionalProperties = upiAccount.additionalProperties.toMutableMap()
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
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun accountType(accountType: JsonValue) = apply { this.accountType = accountType }

            /** Virtual Payment Address for UPI payments */
            fun vpa(vpa: String) = vpa(JsonField.of(vpa))

            /**
             * Sets [Builder.vpa] to an arbitrary JSON value.
             *
             * You should usually call [Builder.vpa] with a well-typed [String] value instead. This
             * method is primarily for setting the field to an undocumented or not yet supported
             * value.
             */
            fun vpa(vpa: JsonField<String>) = apply { this.vpa = vpa }

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
             * Returns an immutable instance of [UpiAccount].
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
            fun build(): UpiAccount =
                UpiAccount(
                    accountType,
                    checkRequired("vpa", vpa),
                    beneficiary,
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): UpiAccount = apply {
            if (validated) {
                return@apply
            }

            _accountType().let {
                if (it != JsonValue.from("UPI")) {
                    throw GridInvalidDataException("'accountType' is invalid, received $it")
                }
            }
            vpa()
            beneficiary()?.validate()
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
            accountType.let { if (it == JsonValue.from("UPI")) 1 else 0 } +
                (if (vpa.asKnown() == null) 0 else 1) +
                (beneficiary.asKnown()?.validity() ?: 0)

        class AccountType @JsonCreator private constructor(private val value: JsonField<String>) :
            Enum {

            /**
             * Returns this class instance's raw value.
             *
             * This is usually only useful if this instance was deserialized from data that doesn't
             * match any known member, and you want to know that value. For example, if the SDK is
             * on an older version than the API, then the API may respond with new members that the
             * SDK is unaware of.
             */
            @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

            companion object {

                val UPI = of("UPI")

                val CLABE = of("CLABE")

                val US_ACCOUNT = of("US_ACCOUNT")

                val PIX = of("PIX")

                val IBAN = of("IBAN")

                val SPARK_WALLET = of("SPARK_WALLET")

                val LIGHTNING = of("LIGHTNING")

                val SOLANA_WALLET = of("SOLANA_WALLET")

                val TRON_WALLET = of("TRON_WALLET")

                val POLYGON_WALLET = of("POLYGON_WALLET")

                val BASE_WALLET = of("BASE_WALLET")

                fun of(value: String) = AccountType(JsonField.of(value))
            }

            /** An enum containing [AccountType]'s known values. */
            enum class Known {
                UPI,
                CLABE,
                US_ACCOUNT,
                PIX,
                IBAN,
                SPARK_WALLET,
                LIGHTNING,
                SOLANA_WALLET,
                TRON_WALLET,
                POLYGON_WALLET,
                BASE_WALLET,
            }

            /**
             * An enum containing [AccountType]'s known values, as well as an [_UNKNOWN] member.
             *
             * An instance of [AccountType] can contain an unknown value in a couple of cases:
             * - It was deserialized from data that doesn't match any known member. For example, if
             *   the SDK is on an older version than the API, then the API may respond with new
             *   members that the SDK is unaware of.
             * - It was constructed with an arbitrary value using the [of] method.
             */
            enum class Value {
                UPI,
                CLABE,
                US_ACCOUNT,
                PIX,
                IBAN,
                SPARK_WALLET,
                LIGHTNING,
                SOLANA_WALLET,
                TRON_WALLET,
                POLYGON_WALLET,
                BASE_WALLET,
                /**
                 * An enum member indicating that [AccountType] was instantiated with an unknown
                 * value.
                 */
                _UNKNOWN,
            }

            /**
             * Returns an enum member corresponding to this class instance's value, or
             * [Value._UNKNOWN] if the class was instantiated with an unknown value.
             *
             * Use the [known] method instead if you're certain the value is always known or if you
             * want to throw for the unknown case.
             */
            fun value(): Value =
                when (this) {
                    UPI -> Value.UPI
                    CLABE -> Value.CLABE
                    US_ACCOUNT -> Value.US_ACCOUNT
                    PIX -> Value.PIX
                    IBAN -> Value.IBAN
                    SPARK_WALLET -> Value.SPARK_WALLET
                    LIGHTNING -> Value.LIGHTNING
                    SOLANA_WALLET -> Value.SOLANA_WALLET
                    TRON_WALLET -> Value.TRON_WALLET
                    POLYGON_WALLET -> Value.POLYGON_WALLET
                    BASE_WALLET -> Value.BASE_WALLET
                    else -> Value._UNKNOWN
                }

            /**
             * Returns an enum member corresponding to this class instance's value.
             *
             * Use the [value] method instead if you're uncertain the value is always known and
             * don't want to throw for the unknown case.
             *
             * @throws GridInvalidDataException if this class instance's value is a not a known
             *   member.
             */
            fun known(): Known =
                when (this) {
                    UPI -> Known.UPI
                    CLABE -> Known.CLABE
                    US_ACCOUNT -> Known.US_ACCOUNT
                    PIX -> Known.PIX
                    IBAN -> Known.IBAN
                    SPARK_WALLET -> Known.SPARK_WALLET
                    LIGHTNING -> Known.LIGHTNING
                    SOLANA_WALLET -> Known.SOLANA_WALLET
                    TRON_WALLET -> Known.TRON_WALLET
                    POLYGON_WALLET -> Known.POLYGON_WALLET
                    BASE_WALLET -> Known.BASE_WALLET
                    else -> throw GridInvalidDataException("Unknown AccountType: $value")
                }

            /**
             * Returns this class instance's primitive wire representation.
             *
             * This differs from the [toString] method because that method is primarily for
             * debugging and generally doesn't throw.
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

                        override fun visitBusiness(business: BusinessBeneficiary) =
                            business.validity()

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
                 * An instance of [Beneficiary] can contain an unknown variant if it was
                 * deserialized from data that doesn't match any known variant. For example, if the
                 * SDK is on an older version than the API, then the API may respond with new
                 * variants that the SDK is unaware of.
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
                            return tryDeserialize(node, jacksonTypeRef<IndividualBeneficiary>())
                                ?.let { Beneficiary(individual = it, _json = json) }
                                ?: Beneficiary(_json = json)
                        }
                        "BUSINESS" -> {
                            return tryDeserialize(node, jacksonTypeRef<BusinessBeneficiary>())
                                ?.let { Beneficiary(business = it, _json = json) }
                                ?: Beneficiary(_json = json)
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

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is UpiAccount &&
                accountType == other.accountType &&
                vpa == other.vpa &&
                beneficiary == other.beneficiary &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(accountType, vpa, beneficiary, additionalProperties)
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "UpiAccount{accountType=$accountType, vpa=$vpa, beneficiary=$beneficiary, additionalProperties=$additionalProperties}"
    }

    class NgnAccount
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val accountNumber: JsonField<String>,
        private val accountType: JsonValue,
        private val bankName: JsonField<String>,
        private val beneficiary: JsonField<NgnAccountExternalAccountInfo.Beneficiary>,
        private val purposeOfPayment: JsonField<NgnAccountExternalAccountInfo.PurposeOfPayment>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("accountNumber")
            @ExcludeMissing
            accountNumber: JsonField<String> = JsonMissing.of(),
            @JsonProperty("accountType") @ExcludeMissing accountType: JsonValue = JsonMissing.of(),
            @JsonProperty("bankName")
            @ExcludeMissing
            bankName: JsonField<String> = JsonMissing.of(),
            @JsonProperty("beneficiary")
            @ExcludeMissing
            beneficiary: JsonField<NgnAccountExternalAccountInfo.Beneficiary> = JsonMissing.of(),
            @JsonProperty("purposeOfPayment")
            @ExcludeMissing
            purposeOfPayment: JsonField<NgnAccountExternalAccountInfo.PurposeOfPayment> =
                JsonMissing.of(),
        ) : this(
            accountNumber,
            accountType,
            bankName,
            beneficiary,
            purposeOfPayment,
            mutableMapOf(),
        )

        fun toNgnAccountExternalAccountInfo(): NgnAccountExternalAccountInfo =
            NgnAccountExternalAccountInfo.builder()
                .accountNumber(accountNumber)
                .accountType(accountType)
                .bankName(bankName)
                .beneficiary(beneficiary)
                .purposeOfPayment(purposeOfPayment)
                .build()

        /**
         * Nigerian bank account number
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun accountNumber(): String = accountNumber.getRequired("accountNumber")

        /**
         * Expected to always return the following:
         * ```kotlin
         * JsonValue.from("NGN_ACCOUNT")
         * ```
         *
         * However, this method can be useful for debugging and logging (e.g. if the server
         * responded with an unexpected value).
         */
        @JsonProperty("accountType") @ExcludeMissing fun _accountType(): JsonValue = accountType

        /**
         * Name of the bank
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun bankName(): String = bankName.getRequired("bankName")

        /**
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun beneficiary(): NgnAccountExternalAccountInfo.Beneficiary =
            beneficiary.getRequired("beneficiary")

        /**
         * Purpose of payment
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun purposeOfPayment(): NgnAccountExternalAccountInfo.PurposeOfPayment =
            purposeOfPayment.getRequired("purposeOfPayment")

        /**
         * Returns the raw JSON value of [accountNumber].
         *
         * Unlike [accountNumber], this method doesn't throw if the JSON field has an unexpected
         * type.
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
        fun _beneficiary(): JsonField<NgnAccountExternalAccountInfo.Beneficiary> = beneficiary

        /**
         * Returns the raw JSON value of [purposeOfPayment].
         *
         * Unlike [purposeOfPayment], this method doesn't throw if the JSON field has an unexpected
         * type.
         */
        @JsonProperty("purposeOfPayment")
        @ExcludeMissing
        fun _purposeOfPayment(): JsonField<NgnAccountExternalAccountInfo.PurposeOfPayment> =
            purposeOfPayment

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
             * Returns a mutable builder for constructing an instance of [NgnAccount].
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

        /** A builder for [NgnAccount]. */
        class Builder internal constructor() {

            private var accountNumber: JsonField<String>? = null
            private var accountType: JsonValue = JsonValue.from("NGN_ACCOUNT")
            private var bankName: JsonField<String>? = null
            private var beneficiary: JsonField<NgnAccountExternalAccountInfo.Beneficiary>? = null
            private var purposeOfPayment:
                JsonField<NgnAccountExternalAccountInfo.PurposeOfPayment>? =
                null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(ngnAccount: NgnAccount) = apply {
                accountNumber = ngnAccount.accountNumber
                accountType = ngnAccount.accountType
                bankName = ngnAccount.bankName
                beneficiary = ngnAccount.beneficiary
                purposeOfPayment = ngnAccount.purposeOfPayment
                additionalProperties = ngnAccount.additionalProperties.toMutableMap()
            }

            /** Nigerian bank account number */
            fun accountNumber(accountNumber: String) = accountNumber(JsonField.of(accountNumber))

            /**
             * Sets [Builder.accountNumber] to an arbitrary JSON value.
             *
             * You should usually call [Builder.accountNumber] with a well-typed [String] value
             * instead. This method is primarily for setting the field to an undocumented or not yet
             * supported value.
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
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun accountType(accountType: JsonValue) = apply { this.accountType = accountType }

            /** Name of the bank */
            fun bankName(bankName: String) = bankName(JsonField.of(bankName))

            /**
             * Sets [Builder.bankName] to an arbitrary JSON value.
             *
             * You should usually call [Builder.bankName] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun bankName(bankName: JsonField<String>) = apply { this.bankName = bankName }

            fun beneficiary(beneficiary: NgnAccountExternalAccountInfo.Beneficiary) =
                beneficiary(JsonField.of(beneficiary))

            /**
             * Sets [Builder.beneficiary] to an arbitrary JSON value.
             *
             * You should usually call [Builder.beneficiary] with a well-typed
             * [NgnAccountExternalAccountInfo.Beneficiary] value instead. This method is primarily
             * for setting the field to an undocumented or not yet supported value.
             */
            fun beneficiary(beneficiary: JsonField<NgnAccountExternalAccountInfo.Beneficiary>) =
                apply {
                    this.beneficiary = beneficiary
                }

            /**
             * Alias for calling [beneficiary] with
             * `NgnAccountExternalAccountInfo.Beneficiary.ofIndividual(individual)`.
             */
            fun beneficiary(individual: IndividualBeneficiary) =
                beneficiary(NgnAccountExternalAccountInfo.Beneficiary.ofIndividual(individual))

            /**
             * Alias for calling [beneficiary] with
             * `NgnAccountExternalAccountInfo.Beneficiary.ofBusiness(business)`.
             */
            fun beneficiary(business: BusinessBeneficiary) =
                beneficiary(NgnAccountExternalAccountInfo.Beneficiary.ofBusiness(business))

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
            fun purposeOfPayment(purposeOfPayment: NgnAccountExternalAccountInfo.PurposeOfPayment) =
                purposeOfPayment(JsonField.of(purposeOfPayment))

            /**
             * Sets [Builder.purposeOfPayment] to an arbitrary JSON value.
             *
             * You should usually call [Builder.purposeOfPayment] with a well-typed
             * [NgnAccountExternalAccountInfo.PurposeOfPayment] value instead. This method is
             * primarily for setting the field to an undocumented or not yet supported value.
             */
            fun purposeOfPayment(
                purposeOfPayment: JsonField<NgnAccountExternalAccountInfo.PurposeOfPayment>
            ) = apply { this.purposeOfPayment = purposeOfPayment }

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
             * Returns an immutable instance of [NgnAccount].
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
            fun build(): NgnAccount =
                NgnAccount(
                    checkRequired("accountNumber", accountNumber),
                    accountType,
                    checkRequired("bankName", bankName),
                    checkRequired("beneficiary", beneficiary),
                    checkRequired("purposeOfPayment", purposeOfPayment),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): NgnAccount = apply {
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
         * Returns a score indicating how many valid values are contained in this object
         * recursively.
         *
         * Used for best match union deserialization.
         */
        internal fun validity(): Int =
            (if (accountNumber.asKnown() == null) 0 else 1) +
                accountType.let { if (it == JsonValue.from("NGN_ACCOUNT")) 1 else 0 } +
                (if (bankName.asKnown() == null) 0 else 1) +
                (beneficiary.asKnown()?.validity() ?: 0) +
                (purposeOfPayment.asKnown()?.validity() ?: 0)

        class AccountType @JsonCreator private constructor(private val value: JsonField<String>) :
            Enum {

            /**
             * Returns this class instance's raw value.
             *
             * This is usually only useful if this instance was deserialized from data that doesn't
             * match any known member, and you want to know that value. For example, if the SDK is
             * on an older version than the API, then the API may respond with new members that the
             * SDK is unaware of.
             */
            @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

            companion object {

                val CLABE = of("CLABE")

                val US_ACCOUNT = of("US_ACCOUNT")

                val PIX = of("PIX")

                val IBAN = of("IBAN")

                val UPI = of("UPI")

                val SPARK_WALLET = of("SPARK_WALLET")

                val LIGHTNING = of("LIGHTNING")

                val SOLANA_WALLET = of("SOLANA_WALLET")

                val TRON_WALLET = of("TRON_WALLET")

                val POLYGON_WALLET = of("POLYGON_WALLET")

                val BASE_WALLET = of("BASE_WALLET")

                fun of(value: String) = AccountType(JsonField.of(value))
            }

            /** An enum containing [AccountType]'s known values. */
            enum class Known {
                CLABE,
                US_ACCOUNT,
                PIX,
                IBAN,
                UPI,
                SPARK_WALLET,
                LIGHTNING,
                SOLANA_WALLET,
                TRON_WALLET,
                POLYGON_WALLET,
                BASE_WALLET,
            }

            /**
             * An enum containing [AccountType]'s known values, as well as an [_UNKNOWN] member.
             *
             * An instance of [AccountType] can contain an unknown value in a couple of cases:
             * - It was deserialized from data that doesn't match any known member. For example, if
             *   the SDK is on an older version than the API, then the API may respond with new
             *   members that the SDK is unaware of.
             * - It was constructed with an arbitrary value using the [of] method.
             */
            enum class Value {
                CLABE,
                US_ACCOUNT,
                PIX,
                IBAN,
                UPI,
                SPARK_WALLET,
                LIGHTNING,
                SOLANA_WALLET,
                TRON_WALLET,
                POLYGON_WALLET,
                BASE_WALLET,
                /**
                 * An enum member indicating that [AccountType] was instantiated with an unknown
                 * value.
                 */
                _UNKNOWN,
            }

            /**
             * Returns an enum member corresponding to this class instance's value, or
             * [Value._UNKNOWN] if the class was instantiated with an unknown value.
             *
             * Use the [known] method instead if you're certain the value is always known or if you
             * want to throw for the unknown case.
             */
            fun value(): Value =
                when (this) {
                    CLABE -> Value.CLABE
                    US_ACCOUNT -> Value.US_ACCOUNT
                    PIX -> Value.PIX
                    IBAN -> Value.IBAN
                    UPI -> Value.UPI
                    SPARK_WALLET -> Value.SPARK_WALLET
                    LIGHTNING -> Value.LIGHTNING
                    SOLANA_WALLET -> Value.SOLANA_WALLET
                    TRON_WALLET -> Value.TRON_WALLET
                    POLYGON_WALLET -> Value.POLYGON_WALLET
                    BASE_WALLET -> Value.BASE_WALLET
                    else -> Value._UNKNOWN
                }

            /**
             * Returns an enum member corresponding to this class instance's value.
             *
             * Use the [value] method instead if you're uncertain the value is always known and
             * don't want to throw for the unknown case.
             *
             * @throws GridInvalidDataException if this class instance's value is a not a known
             *   member.
             */
            fun known(): Known =
                when (this) {
                    CLABE -> Known.CLABE
                    US_ACCOUNT -> Known.US_ACCOUNT
                    PIX -> Known.PIX
                    IBAN -> Known.IBAN
                    UPI -> Known.UPI
                    SPARK_WALLET -> Known.SPARK_WALLET
                    LIGHTNING -> Known.LIGHTNING
                    SOLANA_WALLET -> Known.SOLANA_WALLET
                    TRON_WALLET -> Known.TRON_WALLET
                    POLYGON_WALLET -> Known.POLYGON_WALLET
                    BASE_WALLET -> Known.BASE_WALLET
                    else -> throw GridInvalidDataException("Unknown AccountType: $value")
                }

            /**
             * Returns this class instance's primitive wire representation.
             *
             * This differs from the [toString] method because that method is primarily for
             * debugging and generally doesn't throw.
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

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is NgnAccount &&
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
            "NgnAccount{accountNumber=$accountNumber, accountType=$accountType, bankName=$bankName, beneficiary=$beneficiary, purposeOfPayment=$purposeOfPayment, additionalProperties=$additionalProperties}"
    }

    class SparkWallet
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

        fun toSparkWalletInfo(): SparkWalletInfo =
            SparkWalletInfo.builder().accountType(accountType).address(address).build()

        /**
         * Expected to always return the following:
         * ```kotlin
         * JsonValue.from("SPARK_WALLET")
         * ```
         *
         * However, this method can be useful for debugging and logging (e.g. if the server
         * responded with an unexpected value).
         */
        @JsonProperty("accountType") @ExcludeMissing fun _accountType(): JsonValue = accountType

        /**
         * Spark wallet address
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
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
             * Returns a mutable builder for constructing an instance of [SparkWallet].
             *
             * The following fields are required:
             * ```kotlin
             * .address()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [SparkWallet]. */
        class Builder internal constructor() {

            private var accountType: JsonValue = JsonValue.from("SPARK_WALLET")
            private var address: JsonField<String>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(sparkWallet: SparkWallet) = apply {
                accountType = sparkWallet.accountType
                address = sparkWallet.address
                additionalProperties = sparkWallet.additionalProperties.toMutableMap()
            }

            /**
             * Sets the field to an arbitrary JSON value.
             *
             * It is usually unnecessary to call this method because the field defaults to the
             * following:
             * ```kotlin
             * JsonValue.from("SPARK_WALLET")
             * ```
             *
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun accountType(accountType: JsonValue) = apply { this.accountType = accountType }

            /** Spark wallet address */
            fun address(address: String) = address(JsonField.of(address))

            /**
             * Sets [Builder.address] to an arbitrary JSON value.
             *
             * You should usually call [Builder.address] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
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
             * Returns an immutable instance of [SparkWallet].
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
            fun build(): SparkWallet =
                SparkWallet(
                    accountType,
                    checkRequired("address", address),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): SparkWallet = apply {
            if (validated) {
                return@apply
            }

            _accountType().let {
                if (it != JsonValue.from("SPARK_WALLET")) {
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
         * Returns a score indicating how many valid values are contained in this object
         * recursively.
         *
         * Used for best match union deserialization.
         */
        internal fun validity(): Int =
            accountType.let { if (it == JsonValue.from("SPARK_WALLET")) 1 else 0 } +
                (if (address.asKnown() == null) 0 else 1)

        class AccountType @JsonCreator private constructor(private val value: JsonField<String>) :
            Enum {

            /**
             * Returns this class instance's raw value.
             *
             * This is usually only useful if this instance was deserialized from data that doesn't
             * match any known member, and you want to know that value. For example, if the SDK is
             * on an older version than the API, then the API may respond with new members that the
             * SDK is unaware of.
             */
            @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

            companion object {

                val SPARK_WALLET = of("SPARK_WALLET")

                val CLABE = of("CLABE")

                val US_ACCOUNT = of("US_ACCOUNT")

                val PIX = of("PIX")

                val IBAN = of("IBAN")

                val UPI = of("UPI")

                val LIGHTNING = of("LIGHTNING")

                val SOLANA_WALLET = of("SOLANA_WALLET")

                val TRON_WALLET = of("TRON_WALLET")

                val POLYGON_WALLET = of("POLYGON_WALLET")

                val BASE_WALLET = of("BASE_WALLET")

                fun of(value: String) = AccountType(JsonField.of(value))
            }

            /** An enum containing [AccountType]'s known values. */
            enum class Known {
                SPARK_WALLET,
                CLABE,
                US_ACCOUNT,
                PIX,
                IBAN,
                UPI,
                LIGHTNING,
                SOLANA_WALLET,
                TRON_WALLET,
                POLYGON_WALLET,
                BASE_WALLET,
            }

            /**
             * An enum containing [AccountType]'s known values, as well as an [_UNKNOWN] member.
             *
             * An instance of [AccountType] can contain an unknown value in a couple of cases:
             * - It was deserialized from data that doesn't match any known member. For example, if
             *   the SDK is on an older version than the API, then the API may respond with new
             *   members that the SDK is unaware of.
             * - It was constructed with an arbitrary value using the [of] method.
             */
            enum class Value {
                SPARK_WALLET,
                CLABE,
                US_ACCOUNT,
                PIX,
                IBAN,
                UPI,
                LIGHTNING,
                SOLANA_WALLET,
                TRON_WALLET,
                POLYGON_WALLET,
                BASE_WALLET,
                /**
                 * An enum member indicating that [AccountType] was instantiated with an unknown
                 * value.
                 */
                _UNKNOWN,
            }

            /**
             * Returns an enum member corresponding to this class instance's value, or
             * [Value._UNKNOWN] if the class was instantiated with an unknown value.
             *
             * Use the [known] method instead if you're certain the value is always known or if you
             * want to throw for the unknown case.
             */
            fun value(): Value =
                when (this) {
                    SPARK_WALLET -> Value.SPARK_WALLET
                    CLABE -> Value.CLABE
                    US_ACCOUNT -> Value.US_ACCOUNT
                    PIX -> Value.PIX
                    IBAN -> Value.IBAN
                    UPI -> Value.UPI
                    LIGHTNING -> Value.LIGHTNING
                    SOLANA_WALLET -> Value.SOLANA_WALLET
                    TRON_WALLET -> Value.TRON_WALLET
                    POLYGON_WALLET -> Value.POLYGON_WALLET
                    BASE_WALLET -> Value.BASE_WALLET
                    else -> Value._UNKNOWN
                }

            /**
             * Returns an enum member corresponding to this class instance's value.
             *
             * Use the [value] method instead if you're uncertain the value is always known and
             * don't want to throw for the unknown case.
             *
             * @throws GridInvalidDataException if this class instance's value is a not a known
             *   member.
             */
            fun known(): Known =
                when (this) {
                    SPARK_WALLET -> Known.SPARK_WALLET
                    CLABE -> Known.CLABE
                    US_ACCOUNT -> Known.US_ACCOUNT
                    PIX -> Known.PIX
                    IBAN -> Known.IBAN
                    UPI -> Known.UPI
                    LIGHTNING -> Known.LIGHTNING
                    SOLANA_WALLET -> Known.SOLANA_WALLET
                    TRON_WALLET -> Known.TRON_WALLET
                    POLYGON_WALLET -> Known.POLYGON_WALLET
                    BASE_WALLET -> Known.BASE_WALLET
                    else -> throw GridInvalidDataException("Unknown AccountType: $value")
                }

            /**
             * Returns this class instance's primitive wire representation.
             *
             * This differs from the [toString] method because that method is primarily for
             * debugging and generally doesn't throw.
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

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is SparkWallet &&
                accountType == other.accountType &&
                address == other.address &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(accountType, address, additionalProperties)
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "SparkWallet{accountType=$accountType, address=$address, additionalProperties=$additionalProperties}"
    }

    class Lightning
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val accountType: JsonValue,
        private val bolt12: JsonField<String>,
        private val invoice: JsonField<String>,
        private val lightningAddress: JsonField<String>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("accountType") @ExcludeMissing accountType: JsonValue = JsonMissing.of(),
            @JsonProperty("bolt12") @ExcludeMissing bolt12: JsonField<String> = JsonMissing.of(),
            @JsonProperty("invoice") @ExcludeMissing invoice: JsonField<String> = JsonMissing.of(),
            @JsonProperty("lightningAddress")
            @ExcludeMissing
            lightningAddress: JsonField<String> = JsonMissing.of(),
        ) : this(accountType, bolt12, invoice, lightningAddress, mutableMapOf())

        fun toLightningExternalAccountInfo(): LightningExternalAccountInfo =
            LightningExternalAccountInfo.builder()
                .accountType(accountType)
                .bolt12(bolt12)
                .invoice(invoice)
                .lightningAddress(lightningAddress)
                .build()

        /**
         * Expected to always return the following:
         * ```kotlin
         * JsonValue.from("LIGHTNING")
         * ```
         *
         * However, this method can be useful for debugging and logging (e.g. if the server
         * responded with an unexpected value).
         */
        @JsonProperty("accountType") @ExcludeMissing fun _accountType(): JsonValue = accountType

        /**
         * A bolt12 offer which can be reused as a payment destination
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun bolt12(): String? = bolt12.getNullable("bolt12")

        /**
         * 1-time use lightning bolt11 invoice payout destination
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun invoice(): String? = invoice.getNullable("invoice")

        /**
         * A lightning address which can be used as a payment destination. Note that for UMA
         * addresses, no external account is needed. You can use the UMA address directly as a
         * destination.
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun lightningAddress(): String? = lightningAddress.getNullable("lightningAddress")

        /**
         * Returns the raw JSON value of [bolt12].
         *
         * Unlike [bolt12], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("bolt12") @ExcludeMissing fun _bolt12(): JsonField<String> = bolt12

        /**
         * Returns the raw JSON value of [invoice].
         *
         * Unlike [invoice], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("invoice") @ExcludeMissing fun _invoice(): JsonField<String> = invoice

        /**
         * Returns the raw JSON value of [lightningAddress].
         *
         * Unlike [lightningAddress], this method doesn't throw if the JSON field has an unexpected
         * type.
         */
        @JsonProperty("lightningAddress")
        @ExcludeMissing
        fun _lightningAddress(): JsonField<String> = lightningAddress

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

            /** Returns a mutable builder for constructing an instance of [Lightning]. */
            fun builder() = Builder()
        }

        /** A builder for [Lightning]. */
        class Builder internal constructor() {

            private var accountType: JsonValue = JsonValue.from("LIGHTNING")
            private var bolt12: JsonField<String> = JsonMissing.of()
            private var invoice: JsonField<String> = JsonMissing.of()
            private var lightningAddress: JsonField<String> = JsonMissing.of()
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(lightning: Lightning) = apply {
                accountType = lightning.accountType
                bolt12 = lightning.bolt12
                invoice = lightning.invoice
                lightningAddress = lightning.lightningAddress
                additionalProperties = lightning.additionalProperties.toMutableMap()
            }

            /**
             * Sets the field to an arbitrary JSON value.
             *
             * It is usually unnecessary to call this method because the field defaults to the
             * following:
             * ```kotlin
             * JsonValue.from("LIGHTNING")
             * ```
             *
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun accountType(accountType: JsonValue) = apply { this.accountType = accountType }

            /** A bolt12 offer which can be reused as a payment destination */
            fun bolt12(bolt12: String) = bolt12(JsonField.of(bolt12))

            /**
             * Sets [Builder.bolt12] to an arbitrary JSON value.
             *
             * You should usually call [Builder.bolt12] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun bolt12(bolt12: JsonField<String>) = apply { this.bolt12 = bolt12 }

            /** 1-time use lightning bolt11 invoice payout destination */
            fun invoice(invoice: String) = invoice(JsonField.of(invoice))

            /**
             * Sets [Builder.invoice] to an arbitrary JSON value.
             *
             * You should usually call [Builder.invoice] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun invoice(invoice: JsonField<String>) = apply { this.invoice = invoice }

            /**
             * A lightning address which can be used as a payment destination. Note that for UMA
             * addresses, no external account is needed. You can use the UMA address directly as a
             * destination.
             */
            fun lightningAddress(lightningAddress: String) =
                lightningAddress(JsonField.of(lightningAddress))

            /**
             * Sets [Builder.lightningAddress] to an arbitrary JSON value.
             *
             * You should usually call [Builder.lightningAddress] with a well-typed [String] value
             * instead. This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun lightningAddress(lightningAddress: JsonField<String>) = apply {
                this.lightningAddress = lightningAddress
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
             * Returns an immutable instance of [Lightning].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             */
            fun build(): Lightning =
                Lightning(
                    accountType,
                    bolt12,
                    invoice,
                    lightningAddress,
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): Lightning = apply {
            if (validated) {
                return@apply
            }

            _accountType().let {
                if (it != JsonValue.from("LIGHTNING")) {
                    throw GridInvalidDataException("'accountType' is invalid, received $it")
                }
            }
            bolt12()
            invoice()
            lightningAddress()
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
            accountType.let { if (it == JsonValue.from("LIGHTNING")) 1 else 0 } +
                (if (bolt12.asKnown() == null) 0 else 1) +
                (if (invoice.asKnown() == null) 0 else 1) +
                (if (lightningAddress.asKnown() == null) 0 else 1)

        class AccountType @JsonCreator private constructor(private val value: JsonField<String>) :
            Enum {

            /**
             * Returns this class instance's raw value.
             *
             * This is usually only useful if this instance was deserialized from data that doesn't
             * match any known member, and you want to know that value. For example, if the SDK is
             * on an older version than the API, then the API may respond with new members that the
             * SDK is unaware of.
             */
            @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

            companion object {

                val CLABE = of("CLABE")

                val US_ACCOUNT = of("US_ACCOUNT")

                val PIX = of("PIX")

                val IBAN = of("IBAN")

                val UPI = of("UPI")

                val SPARK_WALLET = of("SPARK_WALLET")

                val LIGHTNING = of("LIGHTNING")

                val SOLANA_WALLET = of("SOLANA_WALLET")

                val TRON_WALLET = of("TRON_WALLET")

                val POLYGON_WALLET = of("POLYGON_WALLET")

                val BASE_WALLET = of("BASE_WALLET")

                fun of(value: String) = AccountType(JsonField.of(value))
            }

            /** An enum containing [AccountType]'s known values. */
            enum class Known {
                CLABE,
                US_ACCOUNT,
                PIX,
                IBAN,
                UPI,
                SPARK_WALLET,
                LIGHTNING,
                SOLANA_WALLET,
                TRON_WALLET,
                POLYGON_WALLET,
                BASE_WALLET,
            }

            /**
             * An enum containing [AccountType]'s known values, as well as an [_UNKNOWN] member.
             *
             * An instance of [AccountType] can contain an unknown value in a couple of cases:
             * - It was deserialized from data that doesn't match any known member. For example, if
             *   the SDK is on an older version than the API, then the API may respond with new
             *   members that the SDK is unaware of.
             * - It was constructed with an arbitrary value using the [of] method.
             */
            enum class Value {
                CLABE,
                US_ACCOUNT,
                PIX,
                IBAN,
                UPI,
                SPARK_WALLET,
                LIGHTNING,
                SOLANA_WALLET,
                TRON_WALLET,
                POLYGON_WALLET,
                BASE_WALLET,
                /**
                 * An enum member indicating that [AccountType] was instantiated with an unknown
                 * value.
                 */
                _UNKNOWN,
            }

            /**
             * Returns an enum member corresponding to this class instance's value, or
             * [Value._UNKNOWN] if the class was instantiated with an unknown value.
             *
             * Use the [known] method instead if you're certain the value is always known or if you
             * want to throw for the unknown case.
             */
            fun value(): Value =
                when (this) {
                    CLABE -> Value.CLABE
                    US_ACCOUNT -> Value.US_ACCOUNT
                    PIX -> Value.PIX
                    IBAN -> Value.IBAN
                    UPI -> Value.UPI
                    SPARK_WALLET -> Value.SPARK_WALLET
                    LIGHTNING -> Value.LIGHTNING
                    SOLANA_WALLET -> Value.SOLANA_WALLET
                    TRON_WALLET -> Value.TRON_WALLET
                    POLYGON_WALLET -> Value.POLYGON_WALLET
                    BASE_WALLET -> Value.BASE_WALLET
                    else -> Value._UNKNOWN
                }

            /**
             * Returns an enum member corresponding to this class instance's value.
             *
             * Use the [value] method instead if you're uncertain the value is always known and
             * don't want to throw for the unknown case.
             *
             * @throws GridInvalidDataException if this class instance's value is a not a known
             *   member.
             */
            fun known(): Known =
                when (this) {
                    CLABE -> Known.CLABE
                    US_ACCOUNT -> Known.US_ACCOUNT
                    PIX -> Known.PIX
                    IBAN -> Known.IBAN
                    UPI -> Known.UPI
                    SPARK_WALLET -> Known.SPARK_WALLET
                    LIGHTNING -> Known.LIGHTNING
                    SOLANA_WALLET -> Known.SOLANA_WALLET
                    TRON_WALLET -> Known.TRON_WALLET
                    POLYGON_WALLET -> Known.POLYGON_WALLET
                    BASE_WALLET -> Known.BASE_WALLET
                    else -> throw GridInvalidDataException("Unknown AccountType: $value")
                }

            /**
             * Returns this class instance's primitive wire representation.
             *
             * This differs from the [toString] method because that method is primarily for
             * debugging and generally doesn't throw.
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

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is Lightning &&
                accountType == other.accountType &&
                bolt12 == other.bolt12 &&
                invoice == other.invoice &&
                lightningAddress == other.lightningAddress &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(accountType, bolt12, invoice, lightningAddress, additionalProperties)
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "Lightning{accountType=$accountType, bolt12=$bolt12, invoice=$invoice, lightningAddress=$lightningAddress, additionalProperties=$additionalProperties}"
    }

    class SolanaWallet
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

        fun toSolanaWalletInfo(): SolanaWalletInfo =
            SolanaWalletInfo.builder().accountType(accountType).address(address).build()

        /**
         * Expected to always return the following:
         * ```kotlin
         * JsonValue.from("SOLANA_WALLET")
         * ```
         *
         * However, this method can be useful for debugging and logging (e.g. if the server
         * responded with an unexpected value).
         */
        @JsonProperty("accountType") @ExcludeMissing fun _accountType(): JsonValue = accountType

        /**
         * Solana wallet address
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
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
             * Returns a mutable builder for constructing an instance of [SolanaWallet].
             *
             * The following fields are required:
             * ```kotlin
             * .address()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [SolanaWallet]. */
        class Builder internal constructor() {

            private var accountType: JsonValue = JsonValue.from("SOLANA_WALLET")
            private var address: JsonField<String>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(solanaWallet: SolanaWallet) = apply {
                accountType = solanaWallet.accountType
                address = solanaWallet.address
                additionalProperties = solanaWallet.additionalProperties.toMutableMap()
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
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun accountType(accountType: JsonValue) = apply { this.accountType = accountType }

            /** Solana wallet address */
            fun address(address: String) = address(JsonField.of(address))

            /**
             * Sets [Builder.address] to an arbitrary JSON value.
             *
             * You should usually call [Builder.address] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
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
             * Returns an immutable instance of [SolanaWallet].
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
            fun build(): SolanaWallet =
                SolanaWallet(
                    accountType,
                    checkRequired("address", address),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): SolanaWallet = apply {
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
         * Returns a score indicating how many valid values are contained in this object
         * recursively.
         *
         * Used for best match union deserialization.
         */
        internal fun validity(): Int =
            accountType.let { if (it == JsonValue.from("SOLANA_WALLET")) 1 else 0 } +
                (if (address.asKnown() == null) 0 else 1)

        class AccountType @JsonCreator private constructor(private val value: JsonField<String>) :
            Enum {

            /**
             * Returns this class instance's raw value.
             *
             * This is usually only useful if this instance was deserialized from data that doesn't
             * match any known member, and you want to know that value. For example, if the SDK is
             * on an older version than the API, then the API may respond with new members that the
             * SDK is unaware of.
             */
            @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

            companion object {

                val SOLANA_WALLET = of("SOLANA_WALLET")

                val CLABE = of("CLABE")

                val US_ACCOUNT = of("US_ACCOUNT")

                val PIX = of("PIX")

                val IBAN = of("IBAN")

                val UPI = of("UPI")

                val SPARK_WALLET = of("SPARK_WALLET")

                val LIGHTNING = of("LIGHTNING")

                val TRON_WALLET = of("TRON_WALLET")

                val POLYGON_WALLET = of("POLYGON_WALLET")

                val BASE_WALLET = of("BASE_WALLET")

                fun of(value: String) = AccountType(JsonField.of(value))
            }

            /** An enum containing [AccountType]'s known values. */
            enum class Known {
                SOLANA_WALLET,
                CLABE,
                US_ACCOUNT,
                PIX,
                IBAN,
                UPI,
                SPARK_WALLET,
                LIGHTNING,
                TRON_WALLET,
                POLYGON_WALLET,
                BASE_WALLET,
            }

            /**
             * An enum containing [AccountType]'s known values, as well as an [_UNKNOWN] member.
             *
             * An instance of [AccountType] can contain an unknown value in a couple of cases:
             * - It was deserialized from data that doesn't match any known member. For example, if
             *   the SDK is on an older version than the API, then the API may respond with new
             *   members that the SDK is unaware of.
             * - It was constructed with an arbitrary value using the [of] method.
             */
            enum class Value {
                SOLANA_WALLET,
                CLABE,
                US_ACCOUNT,
                PIX,
                IBAN,
                UPI,
                SPARK_WALLET,
                LIGHTNING,
                TRON_WALLET,
                POLYGON_WALLET,
                BASE_WALLET,
                /**
                 * An enum member indicating that [AccountType] was instantiated with an unknown
                 * value.
                 */
                _UNKNOWN,
            }

            /**
             * Returns an enum member corresponding to this class instance's value, or
             * [Value._UNKNOWN] if the class was instantiated with an unknown value.
             *
             * Use the [known] method instead if you're certain the value is always known or if you
             * want to throw for the unknown case.
             */
            fun value(): Value =
                when (this) {
                    SOLANA_WALLET -> Value.SOLANA_WALLET
                    CLABE -> Value.CLABE
                    US_ACCOUNT -> Value.US_ACCOUNT
                    PIX -> Value.PIX
                    IBAN -> Value.IBAN
                    UPI -> Value.UPI
                    SPARK_WALLET -> Value.SPARK_WALLET
                    LIGHTNING -> Value.LIGHTNING
                    TRON_WALLET -> Value.TRON_WALLET
                    POLYGON_WALLET -> Value.POLYGON_WALLET
                    BASE_WALLET -> Value.BASE_WALLET
                    else -> Value._UNKNOWN
                }

            /**
             * Returns an enum member corresponding to this class instance's value.
             *
             * Use the [value] method instead if you're uncertain the value is always known and
             * don't want to throw for the unknown case.
             *
             * @throws GridInvalidDataException if this class instance's value is a not a known
             *   member.
             */
            fun known(): Known =
                when (this) {
                    SOLANA_WALLET -> Known.SOLANA_WALLET
                    CLABE -> Known.CLABE
                    US_ACCOUNT -> Known.US_ACCOUNT
                    PIX -> Known.PIX
                    IBAN -> Known.IBAN
                    UPI -> Known.UPI
                    SPARK_WALLET -> Known.SPARK_WALLET
                    LIGHTNING -> Known.LIGHTNING
                    TRON_WALLET -> Known.TRON_WALLET
                    POLYGON_WALLET -> Known.POLYGON_WALLET
                    BASE_WALLET -> Known.BASE_WALLET
                    else -> throw GridInvalidDataException("Unknown AccountType: $value")
                }

            /**
             * Returns this class instance's primitive wire representation.
             *
             * This differs from the [toString] method because that method is primarily for
             * debugging and generally doesn't throw.
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

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is SolanaWallet &&
                accountType == other.accountType &&
                address == other.address &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(accountType, address, additionalProperties)
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "SolanaWallet{accountType=$accountType, address=$address, additionalProperties=$additionalProperties}"
    }

    class TronWallet
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

        fun toTronWalletInfo(): TronWalletInfo =
            TronWalletInfo.builder().accountType(accountType).address(address).build()

        /**
         * Expected to always return the following:
         * ```kotlin
         * JsonValue.from("TRON_WALLET")
         * ```
         *
         * However, this method can be useful for debugging and logging (e.g. if the server
         * responded with an unexpected value).
         */
        @JsonProperty("accountType") @ExcludeMissing fun _accountType(): JsonValue = accountType

        /**
         * Tron wallet address
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
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
             * Returns a mutable builder for constructing an instance of [TronWallet].
             *
             * The following fields are required:
             * ```kotlin
             * .address()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [TronWallet]. */
        class Builder internal constructor() {

            private var accountType: JsonValue = JsonValue.from("TRON_WALLET")
            private var address: JsonField<String>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(tronWallet: TronWallet) = apply {
                accountType = tronWallet.accountType
                address = tronWallet.address
                additionalProperties = tronWallet.additionalProperties.toMutableMap()
            }

            /**
             * Sets the field to an arbitrary JSON value.
             *
             * It is usually unnecessary to call this method because the field defaults to the
             * following:
             * ```kotlin
             * JsonValue.from("TRON_WALLET")
             * ```
             *
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun accountType(accountType: JsonValue) = apply { this.accountType = accountType }

            /** Tron wallet address */
            fun address(address: String) = address(JsonField.of(address))

            /**
             * Sets [Builder.address] to an arbitrary JSON value.
             *
             * You should usually call [Builder.address] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
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
             * Returns an immutable instance of [TronWallet].
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
            fun build(): TronWallet =
                TronWallet(
                    accountType,
                    checkRequired("address", address),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): TronWallet = apply {
            if (validated) {
                return@apply
            }

            _accountType().let {
                if (it != JsonValue.from("TRON_WALLET")) {
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
         * Returns a score indicating how many valid values are contained in this object
         * recursively.
         *
         * Used for best match union deserialization.
         */
        internal fun validity(): Int =
            accountType.let { if (it == JsonValue.from("TRON_WALLET")) 1 else 0 } +
                (if (address.asKnown() == null) 0 else 1)

        class AccountType @JsonCreator private constructor(private val value: JsonField<String>) :
            Enum {

            /**
             * Returns this class instance's raw value.
             *
             * This is usually only useful if this instance was deserialized from data that doesn't
             * match any known member, and you want to know that value. For example, if the SDK is
             * on an older version than the API, then the API may respond with new members that the
             * SDK is unaware of.
             */
            @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

            companion object {

                val TRON_WALLET = of("TRON_WALLET")

                val CLABE = of("CLABE")

                val US_ACCOUNT = of("US_ACCOUNT")

                val PIX = of("PIX")

                val IBAN = of("IBAN")

                val UPI = of("UPI")

                val SPARK_WALLET = of("SPARK_WALLET")

                val LIGHTNING = of("LIGHTNING")

                val SOLANA_WALLET = of("SOLANA_WALLET")

                val POLYGON_WALLET = of("POLYGON_WALLET")

                val BASE_WALLET = of("BASE_WALLET")

                fun of(value: String) = AccountType(JsonField.of(value))
            }

            /** An enum containing [AccountType]'s known values. */
            enum class Known {
                TRON_WALLET,
                CLABE,
                US_ACCOUNT,
                PIX,
                IBAN,
                UPI,
                SPARK_WALLET,
                LIGHTNING,
                SOLANA_WALLET,
                POLYGON_WALLET,
                BASE_WALLET,
            }

            /**
             * An enum containing [AccountType]'s known values, as well as an [_UNKNOWN] member.
             *
             * An instance of [AccountType] can contain an unknown value in a couple of cases:
             * - It was deserialized from data that doesn't match any known member. For example, if
             *   the SDK is on an older version than the API, then the API may respond with new
             *   members that the SDK is unaware of.
             * - It was constructed with an arbitrary value using the [of] method.
             */
            enum class Value {
                TRON_WALLET,
                CLABE,
                US_ACCOUNT,
                PIX,
                IBAN,
                UPI,
                SPARK_WALLET,
                LIGHTNING,
                SOLANA_WALLET,
                POLYGON_WALLET,
                BASE_WALLET,
                /**
                 * An enum member indicating that [AccountType] was instantiated with an unknown
                 * value.
                 */
                _UNKNOWN,
            }

            /**
             * Returns an enum member corresponding to this class instance's value, or
             * [Value._UNKNOWN] if the class was instantiated with an unknown value.
             *
             * Use the [known] method instead if you're certain the value is always known or if you
             * want to throw for the unknown case.
             */
            fun value(): Value =
                when (this) {
                    TRON_WALLET -> Value.TRON_WALLET
                    CLABE -> Value.CLABE
                    US_ACCOUNT -> Value.US_ACCOUNT
                    PIX -> Value.PIX
                    IBAN -> Value.IBAN
                    UPI -> Value.UPI
                    SPARK_WALLET -> Value.SPARK_WALLET
                    LIGHTNING -> Value.LIGHTNING
                    SOLANA_WALLET -> Value.SOLANA_WALLET
                    POLYGON_WALLET -> Value.POLYGON_WALLET
                    BASE_WALLET -> Value.BASE_WALLET
                    else -> Value._UNKNOWN
                }

            /**
             * Returns an enum member corresponding to this class instance's value.
             *
             * Use the [value] method instead if you're uncertain the value is always known and
             * don't want to throw for the unknown case.
             *
             * @throws GridInvalidDataException if this class instance's value is a not a known
             *   member.
             */
            fun known(): Known =
                when (this) {
                    TRON_WALLET -> Known.TRON_WALLET
                    CLABE -> Known.CLABE
                    US_ACCOUNT -> Known.US_ACCOUNT
                    PIX -> Known.PIX
                    IBAN -> Known.IBAN
                    UPI -> Known.UPI
                    SPARK_WALLET -> Known.SPARK_WALLET
                    LIGHTNING -> Known.LIGHTNING
                    SOLANA_WALLET -> Known.SOLANA_WALLET
                    POLYGON_WALLET -> Known.POLYGON_WALLET
                    BASE_WALLET -> Known.BASE_WALLET
                    else -> throw GridInvalidDataException("Unknown AccountType: $value")
                }

            /**
             * Returns this class instance's primitive wire representation.
             *
             * This differs from the [toString] method because that method is primarily for
             * debugging and generally doesn't throw.
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

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is TronWallet &&
                accountType == other.accountType &&
                address == other.address &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(accountType, address, additionalProperties)
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "TronWallet{accountType=$accountType, address=$address, additionalProperties=$additionalProperties}"
    }

    class PolygonWallet
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

        fun toPolygonWalletInfo(): PolygonWalletInfo =
            PolygonWalletInfo.builder().accountType(accountType).address(address).build()

        /**
         * Expected to always return the following:
         * ```kotlin
         * JsonValue.from("POLYGON_WALLET")
         * ```
         *
         * However, this method can be useful for debugging and logging (e.g. if the server
         * responded with an unexpected value).
         */
        @JsonProperty("accountType") @ExcludeMissing fun _accountType(): JsonValue = accountType

        /**
         * Polygon eth wallet address
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
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
             * Returns a mutable builder for constructing an instance of [PolygonWallet].
             *
             * The following fields are required:
             * ```kotlin
             * .address()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [PolygonWallet]. */
        class Builder internal constructor() {

            private var accountType: JsonValue = JsonValue.from("POLYGON_WALLET")
            private var address: JsonField<String>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(polygonWallet: PolygonWallet) = apply {
                accountType = polygonWallet.accountType
                address = polygonWallet.address
                additionalProperties = polygonWallet.additionalProperties.toMutableMap()
            }

            /**
             * Sets the field to an arbitrary JSON value.
             *
             * It is usually unnecessary to call this method because the field defaults to the
             * following:
             * ```kotlin
             * JsonValue.from("POLYGON_WALLET")
             * ```
             *
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun accountType(accountType: JsonValue) = apply { this.accountType = accountType }

            /** Polygon eth wallet address */
            fun address(address: String) = address(JsonField.of(address))

            /**
             * Sets [Builder.address] to an arbitrary JSON value.
             *
             * You should usually call [Builder.address] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
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
             * Returns an immutable instance of [PolygonWallet].
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
            fun build(): PolygonWallet =
                PolygonWallet(
                    accountType,
                    checkRequired("address", address),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): PolygonWallet = apply {
            if (validated) {
                return@apply
            }

            _accountType().let {
                if (it != JsonValue.from("POLYGON_WALLET")) {
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
         * Returns a score indicating how many valid values are contained in this object
         * recursively.
         *
         * Used for best match union deserialization.
         */
        internal fun validity(): Int =
            accountType.let { if (it == JsonValue.from("POLYGON_WALLET")) 1 else 0 } +
                (if (address.asKnown() == null) 0 else 1)

        class AccountType @JsonCreator private constructor(private val value: JsonField<String>) :
            Enum {

            /**
             * Returns this class instance's raw value.
             *
             * This is usually only useful if this instance was deserialized from data that doesn't
             * match any known member, and you want to know that value. For example, if the SDK is
             * on an older version than the API, then the API may respond with new members that the
             * SDK is unaware of.
             */
            @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

            companion object {

                val POLYGON_WALLET = of("POLYGON_WALLET")

                val CLABE = of("CLABE")

                val US_ACCOUNT = of("US_ACCOUNT")

                val PIX = of("PIX")

                val IBAN = of("IBAN")

                val UPI = of("UPI")

                val SPARK_WALLET = of("SPARK_WALLET")

                val LIGHTNING = of("LIGHTNING")

                val SOLANA_WALLET = of("SOLANA_WALLET")

                val TRON_WALLET = of("TRON_WALLET")

                val BASE_WALLET = of("BASE_WALLET")

                fun of(value: String) = AccountType(JsonField.of(value))
            }

            /** An enum containing [AccountType]'s known values. */
            enum class Known {
                POLYGON_WALLET,
                CLABE,
                US_ACCOUNT,
                PIX,
                IBAN,
                UPI,
                SPARK_WALLET,
                LIGHTNING,
                SOLANA_WALLET,
                TRON_WALLET,
                BASE_WALLET,
            }

            /**
             * An enum containing [AccountType]'s known values, as well as an [_UNKNOWN] member.
             *
             * An instance of [AccountType] can contain an unknown value in a couple of cases:
             * - It was deserialized from data that doesn't match any known member. For example, if
             *   the SDK is on an older version than the API, then the API may respond with new
             *   members that the SDK is unaware of.
             * - It was constructed with an arbitrary value using the [of] method.
             */
            enum class Value {
                POLYGON_WALLET,
                CLABE,
                US_ACCOUNT,
                PIX,
                IBAN,
                UPI,
                SPARK_WALLET,
                LIGHTNING,
                SOLANA_WALLET,
                TRON_WALLET,
                BASE_WALLET,
                /**
                 * An enum member indicating that [AccountType] was instantiated with an unknown
                 * value.
                 */
                _UNKNOWN,
            }

            /**
             * Returns an enum member corresponding to this class instance's value, or
             * [Value._UNKNOWN] if the class was instantiated with an unknown value.
             *
             * Use the [known] method instead if you're certain the value is always known or if you
             * want to throw for the unknown case.
             */
            fun value(): Value =
                when (this) {
                    POLYGON_WALLET -> Value.POLYGON_WALLET
                    CLABE -> Value.CLABE
                    US_ACCOUNT -> Value.US_ACCOUNT
                    PIX -> Value.PIX
                    IBAN -> Value.IBAN
                    UPI -> Value.UPI
                    SPARK_WALLET -> Value.SPARK_WALLET
                    LIGHTNING -> Value.LIGHTNING
                    SOLANA_WALLET -> Value.SOLANA_WALLET
                    TRON_WALLET -> Value.TRON_WALLET
                    BASE_WALLET -> Value.BASE_WALLET
                    else -> Value._UNKNOWN
                }

            /**
             * Returns an enum member corresponding to this class instance's value.
             *
             * Use the [value] method instead if you're uncertain the value is always known and
             * don't want to throw for the unknown case.
             *
             * @throws GridInvalidDataException if this class instance's value is a not a known
             *   member.
             */
            fun known(): Known =
                when (this) {
                    POLYGON_WALLET -> Known.POLYGON_WALLET
                    CLABE -> Known.CLABE
                    US_ACCOUNT -> Known.US_ACCOUNT
                    PIX -> Known.PIX
                    IBAN -> Known.IBAN
                    UPI -> Known.UPI
                    SPARK_WALLET -> Known.SPARK_WALLET
                    LIGHTNING -> Known.LIGHTNING
                    SOLANA_WALLET -> Known.SOLANA_WALLET
                    TRON_WALLET -> Known.TRON_WALLET
                    BASE_WALLET -> Known.BASE_WALLET
                    else -> throw GridInvalidDataException("Unknown AccountType: $value")
                }

            /**
             * Returns this class instance's primitive wire representation.
             *
             * This differs from the [toString] method because that method is primarily for
             * debugging and generally doesn't throw.
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

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is PolygonWallet &&
                accountType == other.accountType &&
                address == other.address &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(accountType, address, additionalProperties)
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "PolygonWallet{accountType=$accountType, address=$address, additionalProperties=$additionalProperties}"
    }

    class BaseWallet
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

        fun toBaseWalletInfo(): BaseWalletInfo =
            BaseWalletInfo.builder().accountType(accountType).address(address).build()

        /**
         * Expected to always return the following:
         * ```kotlin
         * JsonValue.from("BASE_WALLET")
         * ```
         *
         * However, this method can be useful for debugging and logging (e.g. if the server
         * responded with an unexpected value).
         */
        @JsonProperty("accountType") @ExcludeMissing fun _accountType(): JsonValue = accountType

        /**
         * Base eth wallet address
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
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
             * Returns a mutable builder for constructing an instance of [BaseWallet].
             *
             * The following fields are required:
             * ```kotlin
             * .address()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [BaseWallet]. */
        class Builder internal constructor() {

            private var accountType: JsonValue = JsonValue.from("BASE_WALLET")
            private var address: JsonField<String>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(baseWallet: BaseWallet) = apply {
                accountType = baseWallet.accountType
                address = baseWallet.address
                additionalProperties = baseWallet.additionalProperties.toMutableMap()
            }

            /**
             * Sets the field to an arbitrary JSON value.
             *
             * It is usually unnecessary to call this method because the field defaults to the
             * following:
             * ```kotlin
             * JsonValue.from("BASE_WALLET")
             * ```
             *
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun accountType(accountType: JsonValue) = apply { this.accountType = accountType }

            /** Base eth wallet address */
            fun address(address: String) = address(JsonField.of(address))

            /**
             * Sets [Builder.address] to an arbitrary JSON value.
             *
             * You should usually call [Builder.address] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
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
             * Returns an immutable instance of [BaseWallet].
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
            fun build(): BaseWallet =
                BaseWallet(
                    accountType,
                    checkRequired("address", address),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): BaseWallet = apply {
            if (validated) {
                return@apply
            }

            _accountType().let {
                if (it != JsonValue.from("BASE_WALLET")) {
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
         * Returns a score indicating how many valid values are contained in this object
         * recursively.
         *
         * Used for best match union deserialization.
         */
        internal fun validity(): Int =
            accountType.let { if (it == JsonValue.from("BASE_WALLET")) 1 else 0 } +
                (if (address.asKnown() == null) 0 else 1)

        class AccountType @JsonCreator private constructor(private val value: JsonField<String>) :
            Enum {

            /**
             * Returns this class instance's raw value.
             *
             * This is usually only useful if this instance was deserialized from data that doesn't
             * match any known member, and you want to know that value. For example, if the SDK is
             * on an older version than the API, then the API may respond with new members that the
             * SDK is unaware of.
             */
            @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

            companion object {

                val BASE_WALLET = of("BASE_WALLET")

                val CLABE = of("CLABE")

                val US_ACCOUNT = of("US_ACCOUNT")

                val PIX = of("PIX")

                val IBAN = of("IBAN")

                val UPI = of("UPI")

                val SPARK_WALLET = of("SPARK_WALLET")

                val LIGHTNING = of("LIGHTNING")

                val SOLANA_WALLET = of("SOLANA_WALLET")

                val TRON_WALLET = of("TRON_WALLET")

                val POLYGON_WALLET = of("POLYGON_WALLET")

                fun of(value: String) = AccountType(JsonField.of(value))
            }

            /** An enum containing [AccountType]'s known values. */
            enum class Known {
                BASE_WALLET,
                CLABE,
                US_ACCOUNT,
                PIX,
                IBAN,
                UPI,
                SPARK_WALLET,
                LIGHTNING,
                SOLANA_WALLET,
                TRON_WALLET,
                POLYGON_WALLET,
            }

            /**
             * An enum containing [AccountType]'s known values, as well as an [_UNKNOWN] member.
             *
             * An instance of [AccountType] can contain an unknown value in a couple of cases:
             * - It was deserialized from data that doesn't match any known member. For example, if
             *   the SDK is on an older version than the API, then the API may respond with new
             *   members that the SDK is unaware of.
             * - It was constructed with an arbitrary value using the [of] method.
             */
            enum class Value {
                BASE_WALLET,
                CLABE,
                US_ACCOUNT,
                PIX,
                IBAN,
                UPI,
                SPARK_WALLET,
                LIGHTNING,
                SOLANA_WALLET,
                TRON_WALLET,
                POLYGON_WALLET,
                /**
                 * An enum member indicating that [AccountType] was instantiated with an unknown
                 * value.
                 */
                _UNKNOWN,
            }

            /**
             * Returns an enum member corresponding to this class instance's value, or
             * [Value._UNKNOWN] if the class was instantiated with an unknown value.
             *
             * Use the [known] method instead if you're certain the value is always known or if you
             * want to throw for the unknown case.
             */
            fun value(): Value =
                when (this) {
                    BASE_WALLET -> Value.BASE_WALLET
                    CLABE -> Value.CLABE
                    US_ACCOUNT -> Value.US_ACCOUNT
                    PIX -> Value.PIX
                    IBAN -> Value.IBAN
                    UPI -> Value.UPI
                    SPARK_WALLET -> Value.SPARK_WALLET
                    LIGHTNING -> Value.LIGHTNING
                    SOLANA_WALLET -> Value.SOLANA_WALLET
                    TRON_WALLET -> Value.TRON_WALLET
                    POLYGON_WALLET -> Value.POLYGON_WALLET
                    else -> Value._UNKNOWN
                }

            /**
             * Returns an enum member corresponding to this class instance's value.
             *
             * Use the [value] method instead if you're uncertain the value is always known and
             * don't want to throw for the unknown case.
             *
             * @throws GridInvalidDataException if this class instance's value is a not a known
             *   member.
             */
            fun known(): Known =
                when (this) {
                    BASE_WALLET -> Known.BASE_WALLET
                    CLABE -> Known.CLABE
                    US_ACCOUNT -> Known.US_ACCOUNT
                    PIX -> Known.PIX
                    IBAN -> Known.IBAN
                    UPI -> Known.UPI
                    SPARK_WALLET -> Known.SPARK_WALLET
                    LIGHTNING -> Known.LIGHTNING
                    SOLANA_WALLET -> Known.SOLANA_WALLET
                    TRON_WALLET -> Known.TRON_WALLET
                    POLYGON_WALLET -> Known.POLYGON_WALLET
                    else -> throw GridInvalidDataException("Unknown AccountType: $value")
                }

            /**
             * Returns this class instance's primitive wire representation.
             *
             * This differs from the [toString] method because that method is primarily for
             * debugging and generally doesn't throw.
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

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is BaseWallet &&
                accountType == other.accountType &&
                address == other.address &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(accountType, address, additionalProperties)
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "BaseWallet{accountType=$accountType, address=$address, additionalProperties=$additionalProperties}"
    }
}
