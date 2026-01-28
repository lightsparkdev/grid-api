// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.quotes

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
import com.grid.api.models.customers.externalaccounts.BaseWalletInfo
import com.grid.api.models.customers.externalaccounts.ClabeAccountInfo
import com.grid.api.models.customers.externalaccounts.IbanAccountInfo
import com.grid.api.models.customers.externalaccounts.PixAccountInfo
import com.grid.api.models.customers.externalaccounts.PolygonWalletInfo
import com.grid.api.models.customers.externalaccounts.SolanaWalletInfo
import com.grid.api.models.customers.externalaccounts.SparkWalletInfo
import com.grid.api.models.customers.externalaccounts.TronWalletInfo
import com.grid.api.models.customers.externalaccounts.UpiAccountInfo
import com.grid.api.models.customers.externalaccounts.UsAccountInfo
import java.util.Collections
import java.util.Objects

class PaymentInstructions
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val accountOrWalletInfo: JsonField<AccountOrWalletInfo>,
    private val instructionsNotes: JsonField<String>,
    private val isPlatformAccount: JsonField<Boolean>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("accountOrWalletInfo")
        @ExcludeMissing
        accountOrWalletInfo: JsonField<AccountOrWalletInfo> = JsonMissing.of(),
        @JsonProperty("instructionsNotes")
        @ExcludeMissing
        instructionsNotes: JsonField<String> = JsonMissing.of(),
        @JsonProperty("isPlatformAccount")
        @ExcludeMissing
        isPlatformAccount: JsonField<Boolean> = JsonMissing.of(),
    ) : this(accountOrWalletInfo, instructionsNotes, isPlatformAccount, mutableMapOf())

    /**
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun accountOrWalletInfo(): AccountOrWalletInfo =
        accountOrWalletInfo.getRequired("accountOrWalletInfo")

    /**
     * Additional human-readable instructions for making the payment
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun instructionsNotes(): String? = instructionsNotes.getNullable("instructionsNotes")

    /**
     * Indicates whether the account is a platform account or a customer account.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun isPlatformAccount(): Boolean? = isPlatformAccount.getNullable("isPlatformAccount")

    /**
     * Returns the raw JSON value of [accountOrWalletInfo].
     *
     * Unlike [accountOrWalletInfo], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    @JsonProperty("accountOrWalletInfo")
    @ExcludeMissing
    fun _accountOrWalletInfo(): JsonField<AccountOrWalletInfo> = accountOrWalletInfo

    /**
     * Returns the raw JSON value of [instructionsNotes].
     *
     * Unlike [instructionsNotes], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    @JsonProperty("instructionsNotes")
    @ExcludeMissing
    fun _instructionsNotes(): JsonField<String> = instructionsNotes

    /**
     * Returns the raw JSON value of [isPlatformAccount].
     *
     * Unlike [isPlatformAccount], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    @JsonProperty("isPlatformAccount")
    @ExcludeMissing
    fun _isPlatformAccount(): JsonField<Boolean> = isPlatformAccount

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
         * Returns a mutable builder for constructing an instance of [PaymentInstructions].
         *
         * The following fields are required:
         * ```kotlin
         * .accountOrWalletInfo()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [PaymentInstructions]. */
    class Builder internal constructor() {

        private var accountOrWalletInfo: JsonField<AccountOrWalletInfo>? = null
        private var instructionsNotes: JsonField<String> = JsonMissing.of()
        private var isPlatformAccount: JsonField<Boolean> = JsonMissing.of()
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(paymentInstructions: PaymentInstructions) = apply {
            accountOrWalletInfo = paymentInstructions.accountOrWalletInfo
            instructionsNotes = paymentInstructions.instructionsNotes
            isPlatformAccount = paymentInstructions.isPlatformAccount
            additionalProperties = paymentInstructions.additionalProperties.toMutableMap()
        }

        fun accountOrWalletInfo(accountOrWalletInfo: AccountOrWalletInfo) =
            accountOrWalletInfo(JsonField.of(accountOrWalletInfo))

        /**
         * Sets [Builder.accountOrWalletInfo] to an arbitrary JSON value.
         *
         * You should usually call [Builder.accountOrWalletInfo] with a well-typed
         * [AccountOrWalletInfo] value instead. This method is primarily for setting the field to an
         * undocumented or not yet supported value.
         */
        fun accountOrWalletInfo(accountOrWalletInfo: JsonField<AccountOrWalletInfo>) = apply {
            this.accountOrWalletInfo = accountOrWalletInfo
        }

        /** Alias for calling [accountOrWalletInfo] with `AccountOrWalletInfo.ofClabe(clabe)`. */
        fun accountOrWalletInfo(clabe: AccountOrWalletInfo.Clabe) =
            accountOrWalletInfo(AccountOrWalletInfo.ofClabe(clabe))

        /**
         * Alias for calling [accountOrWalletInfo] with
         * `AccountOrWalletInfo.ofUsAccount(usAccount)`.
         */
        fun accountOrWalletInfo(usAccount: AccountOrWalletInfo.UsAccount) =
            accountOrWalletInfo(AccountOrWalletInfo.ofUsAccount(usAccount))

        /** Alias for calling [accountOrWalletInfo] with `AccountOrWalletInfo.ofPix(pix)`. */
        fun accountOrWalletInfo(pix: AccountOrWalletInfo.Pix) =
            accountOrWalletInfo(AccountOrWalletInfo.ofPix(pix))

        /** Alias for calling [accountOrWalletInfo] with `AccountOrWalletInfo.ofIban(iban)`. */
        fun accountOrWalletInfo(iban: AccountOrWalletInfo.Iban) =
            accountOrWalletInfo(AccountOrWalletInfo.ofIban(iban))

        /**
         * Alias for calling [accountOrWalletInfo] with
         * `AccountOrWalletInfo.ofFboAccount(fboAccount)`.
         */
        fun accountOrWalletInfo(fboAccount: AccountOrWalletInfo.FboAccount) =
            accountOrWalletInfo(AccountOrWalletInfo.ofFboAccount(fboAccount))

        /** Alias for calling [accountOrWalletInfo] with `AccountOrWalletInfo.ofUpi(upi)`. */
        fun accountOrWalletInfo(upi: AccountOrWalletInfo.Upi) =
            accountOrWalletInfo(AccountOrWalletInfo.ofUpi(upi))

        /**
         * Alias for calling [accountOrWalletInfo] with the following:
         * ```kotlin
         * AccountOrWalletInfo.Upi.builder()
         *     .vpa(vpa)
         *     .build()
         * ```
         */
        fun upiAccountOrWalletInfo(vpa: String) =
            accountOrWalletInfo(AccountOrWalletInfo.Upi.builder().vpa(vpa).build())

        /**
         * Alias for calling [accountOrWalletInfo] with
         * `AccountOrWalletInfo.ofSparkWallet(sparkWallet)`.
         */
        fun accountOrWalletInfo(sparkWallet: AccountOrWalletInfo.SparkWallet) =
            accountOrWalletInfo(AccountOrWalletInfo.ofSparkWallet(sparkWallet))

        /**
         * Alias for calling [accountOrWalletInfo] with
         * `AccountOrWalletInfo.ofLightning(lightning)`.
         */
        fun accountOrWalletInfo(lightning: AccountOrWalletInfo.Lightning) =
            accountOrWalletInfo(AccountOrWalletInfo.ofLightning(lightning))

        /**
         * Alias for calling [accountOrWalletInfo] with the following:
         * ```kotlin
         * AccountOrWalletInfo.Lightning.builder()
         *     .invoice(invoice)
         *     .build()
         * ```
         */
        fun lightningAccountOrWalletInfo(invoice: String) =
            accountOrWalletInfo(AccountOrWalletInfo.Lightning.builder().invoice(invoice).build())

        /**
         * Alias for calling [accountOrWalletInfo] with
         * `AccountOrWalletInfo.ofSolanaWallet(solanaWallet)`.
         */
        fun accountOrWalletInfo(solanaWallet: AccountOrWalletInfo.SolanaWallet) =
            accountOrWalletInfo(AccountOrWalletInfo.ofSolanaWallet(solanaWallet))

        /**
         * Alias for calling [accountOrWalletInfo] with the following:
         * ```kotlin
         * AccountOrWalletInfo.SolanaWallet.builder()
         *     .address(address)
         *     .build()
         * ```
         */
        fun solanaWalletAccountOrWalletInfo(address: String) =
            accountOrWalletInfo(AccountOrWalletInfo.SolanaWallet.builder().address(address).build())

        /**
         * Alias for calling [accountOrWalletInfo] with
         * `AccountOrWalletInfo.ofTronWallet(tronWallet)`.
         */
        fun accountOrWalletInfo(tronWallet: AccountOrWalletInfo.TronWallet) =
            accountOrWalletInfo(AccountOrWalletInfo.ofTronWallet(tronWallet))

        /**
         * Alias for calling [accountOrWalletInfo] with the following:
         * ```kotlin
         * AccountOrWalletInfo.TronWallet.builder()
         *     .address(address)
         *     .build()
         * ```
         */
        fun tronWalletAccountOrWalletInfo(address: String) =
            accountOrWalletInfo(AccountOrWalletInfo.TronWallet.builder().address(address).build())

        /**
         * Alias for calling [accountOrWalletInfo] with
         * `AccountOrWalletInfo.ofPolygonWallet(polygonWallet)`.
         */
        fun accountOrWalletInfo(polygonWallet: AccountOrWalletInfo.PolygonWallet) =
            accountOrWalletInfo(AccountOrWalletInfo.ofPolygonWallet(polygonWallet))

        /**
         * Alias for calling [accountOrWalletInfo] with the following:
         * ```kotlin
         * AccountOrWalletInfo.PolygonWallet.builder()
         *     .address(address)
         *     .build()
         * ```
         */
        fun polygonWalletAccountOrWalletInfo(address: String) =
            accountOrWalletInfo(
                AccountOrWalletInfo.PolygonWallet.builder().address(address).build()
            )

        /**
         * Alias for calling [accountOrWalletInfo] with
         * `AccountOrWalletInfo.ofBaseWallet(baseWallet)`.
         */
        fun accountOrWalletInfo(baseWallet: AccountOrWalletInfo.BaseWallet) =
            accountOrWalletInfo(AccountOrWalletInfo.ofBaseWallet(baseWallet))

        /**
         * Alias for calling [accountOrWalletInfo] with the following:
         * ```kotlin
         * AccountOrWalletInfo.BaseWallet.builder()
         *     .address(address)
         *     .build()
         * ```
         */
        fun baseWalletAccountOrWalletInfo(address: String) =
            accountOrWalletInfo(AccountOrWalletInfo.BaseWallet.builder().address(address).build())

        /** Additional human-readable instructions for making the payment */
        fun instructionsNotes(instructionsNotes: String) =
            instructionsNotes(JsonField.of(instructionsNotes))

        /**
         * Sets [Builder.instructionsNotes] to an arbitrary JSON value.
         *
         * You should usually call [Builder.instructionsNotes] with a well-typed [String] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun instructionsNotes(instructionsNotes: JsonField<String>) = apply {
            this.instructionsNotes = instructionsNotes
        }

        /** Indicates whether the account is a platform account or a customer account. */
        fun isPlatformAccount(isPlatformAccount: Boolean) =
            isPlatformAccount(JsonField.of(isPlatformAccount))

        /**
         * Sets [Builder.isPlatformAccount] to an arbitrary JSON value.
         *
         * You should usually call [Builder.isPlatformAccount] with a well-typed [Boolean] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun isPlatformAccount(isPlatformAccount: JsonField<Boolean>) = apply {
            this.isPlatformAccount = isPlatformAccount
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
         * Returns an immutable instance of [PaymentInstructions].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .accountOrWalletInfo()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): PaymentInstructions =
            PaymentInstructions(
                checkRequired("accountOrWalletInfo", accountOrWalletInfo),
                instructionsNotes,
                isPlatformAccount,
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): PaymentInstructions = apply {
        if (validated) {
            return@apply
        }

        accountOrWalletInfo().validate()
        instructionsNotes()
        isPlatformAccount()
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
        (accountOrWalletInfo.asKnown()?.validity() ?: 0) +
            (if (instructionsNotes.asKnown() == null) 0 else 1) +
            (if (isPlatformAccount.asKnown() == null) 0 else 1)

    @JsonDeserialize(using = AccountOrWalletInfo.Deserializer::class)
    @JsonSerialize(using = AccountOrWalletInfo.Serializer::class)
    class AccountOrWalletInfo
    private constructor(
        private val clabe: Clabe? = null,
        private val usAccount: UsAccount? = null,
        private val pix: Pix? = null,
        private val iban: Iban? = null,
        private val fboAccount: FboAccount? = null,
        private val upi: Upi? = null,
        private val sparkWallet: SparkWallet? = null,
        private val lightning: Lightning? = null,
        private val solanaWallet: SolanaWallet? = null,
        private val tronWallet: TronWallet? = null,
        private val polygonWallet: PolygonWallet? = null,
        private val baseWallet: BaseWallet? = null,
        private val _json: JsonValue? = null,
    ) {

        fun clabe(): Clabe? = clabe

        fun usAccount(): UsAccount? = usAccount

        fun pix(): Pix? = pix

        fun iban(): Iban? = iban

        fun fboAccount(): FboAccount? = fboAccount

        fun upi(): Upi? = upi

        fun sparkWallet(): SparkWallet? = sparkWallet

        fun lightning(): Lightning? = lightning

        fun solanaWallet(): SolanaWallet? = solanaWallet

        fun tronWallet(): TronWallet? = tronWallet

        fun polygonWallet(): PolygonWallet? = polygonWallet

        fun baseWallet(): BaseWallet? = baseWallet

        fun isClabe(): Boolean = clabe != null

        fun isUsAccount(): Boolean = usAccount != null

        fun isPix(): Boolean = pix != null

        fun isIban(): Boolean = iban != null

        fun isFboAccount(): Boolean = fboAccount != null

        fun isUpi(): Boolean = upi != null

        fun isSparkWallet(): Boolean = sparkWallet != null

        fun isLightning(): Boolean = lightning != null

        fun isSolanaWallet(): Boolean = solanaWallet != null

        fun isTronWallet(): Boolean = tronWallet != null

        fun isPolygonWallet(): Boolean = polygonWallet != null

        fun isBaseWallet(): Boolean = baseWallet != null

        fun asClabe(): Clabe = clabe.getOrThrow("clabe")

        fun asUsAccount(): UsAccount = usAccount.getOrThrow("usAccount")

        fun asPix(): Pix = pix.getOrThrow("pix")

        fun asIban(): Iban = iban.getOrThrow("iban")

        fun asFboAccount(): FboAccount = fboAccount.getOrThrow("fboAccount")

        fun asUpi(): Upi = upi.getOrThrow("upi")

        fun asSparkWallet(): SparkWallet = sparkWallet.getOrThrow("sparkWallet")

        fun asLightning(): Lightning = lightning.getOrThrow("lightning")

        fun asSolanaWallet(): SolanaWallet = solanaWallet.getOrThrow("solanaWallet")

        fun asTronWallet(): TronWallet = tronWallet.getOrThrow("tronWallet")

        fun asPolygonWallet(): PolygonWallet = polygonWallet.getOrThrow("polygonWallet")

        fun asBaseWallet(): BaseWallet = baseWallet.getOrThrow("baseWallet")

        fun _json(): JsonValue? = _json

        fun <T> accept(visitor: Visitor<T>): T =
            when {
                clabe != null -> visitor.visitClabe(clabe)
                usAccount != null -> visitor.visitUsAccount(usAccount)
                pix != null -> visitor.visitPix(pix)
                iban != null -> visitor.visitIban(iban)
                fboAccount != null -> visitor.visitFboAccount(fboAccount)
                upi != null -> visitor.visitUpi(upi)
                sparkWallet != null -> visitor.visitSparkWallet(sparkWallet)
                lightning != null -> visitor.visitLightning(lightning)
                solanaWallet != null -> visitor.visitSolanaWallet(solanaWallet)
                tronWallet != null -> visitor.visitTronWallet(tronWallet)
                polygonWallet != null -> visitor.visitPolygonWallet(polygonWallet)
                baseWallet != null -> visitor.visitBaseWallet(baseWallet)
                else -> visitor.unknown(_json)
            }

        private var validated: Boolean = false

        fun validate(): AccountOrWalletInfo = apply {
            if (validated) {
                return@apply
            }

            accept(
                object : Visitor<Unit> {
                    override fun visitClabe(clabe: Clabe) {
                        clabe.validate()
                    }

                    override fun visitUsAccount(usAccount: UsAccount) {
                        usAccount.validate()
                    }

                    override fun visitPix(pix: Pix) {
                        pix.validate()
                    }

                    override fun visitIban(iban: Iban) {
                        iban.validate()
                    }

                    override fun visitFboAccount(fboAccount: FboAccount) {
                        fboAccount.validate()
                    }

                    override fun visitUpi(upi: Upi) {
                        upi.validate()
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
         * Returns a score indicating how many valid values are contained in this object
         * recursively.
         *
         * Used for best match union deserialization.
         */
        internal fun validity(): Int =
            accept(
                object : Visitor<Int> {
                    override fun visitClabe(clabe: Clabe) = clabe.validity()

                    override fun visitUsAccount(usAccount: UsAccount) = usAccount.validity()

                    override fun visitPix(pix: Pix) = pix.validity()

                    override fun visitIban(iban: Iban) = iban.validity()

                    override fun visitFboAccount(fboAccount: FboAccount) = fboAccount.validity()

                    override fun visitUpi(upi: Upi) = upi.validity()

                    override fun visitSparkWallet(sparkWallet: SparkWallet) = sparkWallet.validity()

                    override fun visitLightning(lightning: Lightning) = lightning.validity()

                    override fun visitSolanaWallet(solanaWallet: SolanaWallet) =
                        solanaWallet.validity()

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

            return other is AccountOrWalletInfo &&
                clabe == other.clabe &&
                usAccount == other.usAccount &&
                pix == other.pix &&
                iban == other.iban &&
                fboAccount == other.fboAccount &&
                upi == other.upi &&
                sparkWallet == other.sparkWallet &&
                lightning == other.lightning &&
                solanaWallet == other.solanaWallet &&
                tronWallet == other.tronWallet &&
                polygonWallet == other.polygonWallet &&
                baseWallet == other.baseWallet
        }

        override fun hashCode(): Int =
            Objects.hash(
                clabe,
                usAccount,
                pix,
                iban,
                fboAccount,
                upi,
                sparkWallet,
                lightning,
                solanaWallet,
                tronWallet,
                polygonWallet,
                baseWallet,
            )

        override fun toString(): String =
            when {
                clabe != null -> "AccountOrWalletInfo{clabe=$clabe}"
                usAccount != null -> "AccountOrWalletInfo{usAccount=$usAccount}"
                pix != null -> "AccountOrWalletInfo{pix=$pix}"
                iban != null -> "AccountOrWalletInfo{iban=$iban}"
                fboAccount != null -> "AccountOrWalletInfo{fboAccount=$fboAccount}"
                upi != null -> "AccountOrWalletInfo{upi=$upi}"
                sparkWallet != null -> "AccountOrWalletInfo{sparkWallet=$sparkWallet}"
                lightning != null -> "AccountOrWalletInfo{lightning=$lightning}"
                solanaWallet != null -> "AccountOrWalletInfo{solanaWallet=$solanaWallet}"
                tronWallet != null -> "AccountOrWalletInfo{tronWallet=$tronWallet}"
                polygonWallet != null -> "AccountOrWalletInfo{polygonWallet=$polygonWallet}"
                baseWallet != null -> "AccountOrWalletInfo{baseWallet=$baseWallet}"
                _json != null -> "AccountOrWalletInfo{_unknown=$_json}"
                else -> throw IllegalStateException("Invalid AccountOrWalletInfo")
            }

        companion object {

            fun ofClabe(clabe: Clabe) = AccountOrWalletInfo(clabe = clabe)

            fun ofUsAccount(usAccount: UsAccount) = AccountOrWalletInfo(usAccount = usAccount)

            fun ofPix(pix: Pix) = AccountOrWalletInfo(pix = pix)

            fun ofIban(iban: Iban) = AccountOrWalletInfo(iban = iban)

            fun ofFboAccount(fboAccount: FboAccount) = AccountOrWalletInfo(fboAccount = fboAccount)

            fun ofUpi(upi: Upi) = AccountOrWalletInfo(upi = upi)

            fun ofSparkWallet(sparkWallet: SparkWallet) =
                AccountOrWalletInfo(sparkWallet = sparkWallet)

            fun ofLightning(lightning: Lightning) = AccountOrWalletInfo(lightning = lightning)

            fun ofSolanaWallet(solanaWallet: SolanaWallet) =
                AccountOrWalletInfo(solanaWallet = solanaWallet)

            fun ofTronWallet(tronWallet: TronWallet) = AccountOrWalletInfo(tronWallet = tronWallet)

            fun ofPolygonWallet(polygonWallet: PolygonWallet) =
                AccountOrWalletInfo(polygonWallet = polygonWallet)

            fun ofBaseWallet(baseWallet: BaseWallet) = AccountOrWalletInfo(baseWallet = baseWallet)
        }

        /**
         * An interface that defines how to map each variant of [AccountOrWalletInfo] to a value of
         * type [T].
         */
        interface Visitor<out T> {

            fun visitClabe(clabe: Clabe): T

            fun visitUsAccount(usAccount: UsAccount): T

            fun visitPix(pix: Pix): T

            fun visitIban(iban: Iban): T

            fun visitFboAccount(fboAccount: FboAccount): T

            fun visitUpi(upi: Upi): T

            fun visitSparkWallet(sparkWallet: SparkWallet): T

            fun visitLightning(lightning: Lightning): T

            fun visitSolanaWallet(solanaWallet: SolanaWallet): T

            fun visitTronWallet(tronWallet: TronWallet): T

            fun visitPolygonWallet(polygonWallet: PolygonWallet): T

            fun visitBaseWallet(baseWallet: BaseWallet): T

            /**
             * Maps an unknown variant of [AccountOrWalletInfo] to a value of type [T].
             *
             * An instance of [AccountOrWalletInfo] can contain an unknown variant if it was
             * deserialized from data that doesn't match any known variant. For example, if the SDK
             * is on an older version than the API, then the API may respond with new variants that
             * the SDK is unaware of.
             *
             * @throws GridInvalidDataException in the default implementation.
             */
            fun unknown(json: JsonValue?): T {
                throw GridInvalidDataException("Unknown AccountOrWalletInfo: $json")
            }
        }

        internal class Deserializer :
            BaseDeserializer<AccountOrWalletInfo>(AccountOrWalletInfo::class) {

            override fun ObjectCodec.deserialize(node: JsonNode): AccountOrWalletInfo {
                val json = JsonValue.fromJsonNode(node)
                val accountType = json.asObject()?.get("accountType")?.asString()

                when (accountType) {
                    "CLABE" -> {
                        return tryDeserialize(node, jacksonTypeRef<Clabe>())?.let {
                            AccountOrWalletInfo(clabe = it, _json = json)
                        } ?: AccountOrWalletInfo(_json = json)
                    }
                    "US_ACCOUNT" -> {
                        return tryDeserialize(node, jacksonTypeRef<UsAccount>())?.let {
                            AccountOrWalletInfo(usAccount = it, _json = json)
                        } ?: AccountOrWalletInfo(_json = json)
                    }
                    "PIX" -> {
                        return tryDeserialize(node, jacksonTypeRef<Pix>())?.let {
                            AccountOrWalletInfo(pix = it, _json = json)
                        } ?: AccountOrWalletInfo(_json = json)
                    }
                    "IBAN" -> {
                        return tryDeserialize(node, jacksonTypeRef<Iban>())?.let {
                            AccountOrWalletInfo(iban = it, _json = json)
                        } ?: AccountOrWalletInfo(_json = json)
                    }
                    "UPI" -> {
                        return tryDeserialize(node, jacksonTypeRef<Upi>())?.let {
                            AccountOrWalletInfo(upi = it, _json = json)
                        } ?: AccountOrWalletInfo(_json = json)
                    }
                    "SPARK_WALLET" -> {
                        return tryDeserialize(node, jacksonTypeRef<SparkWallet>())?.let {
                            AccountOrWalletInfo(sparkWallet = it, _json = json)
                        } ?: AccountOrWalletInfo(_json = json)
                    }
                    "LIGHTNING" -> {
                        return tryDeserialize(node, jacksonTypeRef<Lightning>())?.let {
                            AccountOrWalletInfo(lightning = it, _json = json)
                        } ?: AccountOrWalletInfo(_json = json)
                    }
                    "SOLANA_WALLET" -> {
                        return tryDeserialize(node, jacksonTypeRef<SolanaWallet>())?.let {
                            AccountOrWalletInfo(solanaWallet = it, _json = json)
                        } ?: AccountOrWalletInfo(_json = json)
                    }
                    "TRON_WALLET" -> {
                        return tryDeserialize(node, jacksonTypeRef<TronWallet>())?.let {
                            AccountOrWalletInfo(tronWallet = it, _json = json)
                        } ?: AccountOrWalletInfo(_json = json)
                    }
                    "POLYGON_WALLET" -> {
                        return tryDeserialize(node, jacksonTypeRef<PolygonWallet>())?.let {
                            AccountOrWalletInfo(polygonWallet = it, _json = json)
                        } ?: AccountOrWalletInfo(_json = json)
                    }
                    "BASE_WALLET" -> {
                        return tryDeserialize(node, jacksonTypeRef<BaseWallet>())?.let {
                            AccountOrWalletInfo(baseWallet = it, _json = json)
                        } ?: AccountOrWalletInfo(_json = json)
                    }
                }

                return tryDeserialize(node, jacksonTypeRef<FboAccount>())?.let {
                    AccountOrWalletInfo(fboAccount = it, _json = json)
                } ?: AccountOrWalletInfo(_json = json)
            }
        }

        internal class Serializer :
            BaseSerializer<AccountOrWalletInfo>(AccountOrWalletInfo::class) {

            override fun serialize(
                value: AccountOrWalletInfo,
                generator: JsonGenerator,
                provider: SerializerProvider,
            ) {
                when {
                    value.clabe != null -> generator.writeObject(value.clabe)
                    value.usAccount != null -> generator.writeObject(value.usAccount)
                    value.pix != null -> generator.writeObject(value.pix)
                    value.iban != null -> generator.writeObject(value.iban)
                    value.fboAccount != null -> generator.writeObject(value.fboAccount)
                    value.upi != null -> generator.writeObject(value.upi)
                    value.sparkWallet != null -> generator.writeObject(value.sparkWallet)
                    value.lightning != null -> generator.writeObject(value.lightning)
                    value.solanaWallet != null -> generator.writeObject(value.solanaWallet)
                    value.tronWallet != null -> generator.writeObject(value.tronWallet)
                    value.polygonWallet != null -> generator.writeObject(value.polygonWallet)
                    value.baseWallet != null -> generator.writeObject(value.baseWallet)
                    value._json != null -> generator.writeObject(value._json)
                    else -> throw IllegalStateException("Invalid AccountOrWalletInfo")
                }
            }
        }

        class Clabe
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val accountType: JsonValue,
            private val clabeNumber: JsonField<String>,
            private val reference: JsonField<String>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("accountType")
                @ExcludeMissing
                accountType: JsonValue = JsonMissing.of(),
                @JsonProperty("clabeNumber")
                @ExcludeMissing
                clabeNumber: JsonField<String> = JsonMissing.of(),
                @JsonProperty("reference")
                @ExcludeMissing
                reference: JsonField<String> = JsonMissing.of(),
            ) : this(accountType, clabeNumber, reference, mutableMapOf())

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
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun clabeNumber(): String = clabeNumber.getRequired("clabeNumber")

            /**
             * Unique reference code that must be included with the payment to properly credit it
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun reference(): String = reference.getRequired("reference")

            /**
             * Returns the raw JSON value of [clabeNumber].
             *
             * Unlike [clabeNumber], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("clabeNumber")
            @ExcludeMissing
            fun _clabeNumber(): JsonField<String> = clabeNumber

            /**
             * Returns the raw JSON value of [reference].
             *
             * Unlike [reference], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("reference")
            @ExcludeMissing
            fun _reference(): JsonField<String> = reference

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
                 * Returns a mutable builder for constructing an instance of [Clabe].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .clabeNumber()
                 * .reference()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [Clabe]. */
            class Builder internal constructor() {

                private var accountType: JsonValue = JsonValue.from("CLABE")
                private var clabeNumber: JsonField<String>? = null
                private var reference: JsonField<String>? = null
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(clabe: Clabe) = apply {
                    accountType = clabe.accountType
                    clabeNumber = clabe.clabeNumber
                    reference = clabe.reference
                    additionalProperties = clabe.additionalProperties.toMutableMap()
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
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun clabeNumber(clabeNumber: JsonField<String>) = apply {
                    this.clabeNumber = clabeNumber
                }

                /**
                 * Unique reference code that must be included with the payment to properly credit
                 * it
                 */
                fun reference(reference: String) = reference(JsonField.of(reference))

                /**
                 * Sets [Builder.reference] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.reference] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun reference(reference: JsonField<String>) = apply { this.reference = reference }

                fun additionalProperties(additionalProperties: Map<String, JsonValue>) = apply {
                    this.additionalProperties.clear()
                    putAllAdditionalProperties(additionalProperties)
                }

                fun putAdditionalProperty(key: String, value: JsonValue) = apply {
                    additionalProperties.put(key, value)
                }

                fun putAllAdditionalProperties(additionalProperties: Map<String, JsonValue>) =
                    apply {
                        this.additionalProperties.putAll(additionalProperties)
                    }

                fun removeAdditionalProperty(key: String) = apply {
                    additionalProperties.remove(key)
                }

                fun removeAllAdditionalProperties(keys: Set<String>) = apply {
                    keys.forEach(::removeAdditionalProperty)
                }

                /**
                 * Returns an immutable instance of [Clabe].
                 *
                 * Further updates to this [Builder] will not mutate the returned instance.
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .clabeNumber()
                 * .reference()
                 * ```
                 *
                 * @throws IllegalStateException if any required field is unset.
                 */
                fun build(): Clabe =
                    Clabe(
                        accountType,
                        checkRequired("clabeNumber", clabeNumber),
                        checkRequired("reference", reference),
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): Clabe = apply {
                if (validated) {
                    return@apply
                }

                _accountType().let {
                    if (it != JsonValue.from("CLABE")) {
                        throw GridInvalidDataException("'accountType' is invalid, received $it")
                    }
                }
                clabeNumber()
                reference()
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
                    (if (reference.asKnown() == null) 0 else 1)

            class AccountType
            @JsonCreator
            private constructor(private val value: JsonField<String>) : Enum {

                /**
                 * Returns this class instance's raw value.
                 *
                 * This is usually only useful if this instance was deserialized from data that
                 * doesn't match any known member, and you want to know that value. For example, if
                 * the SDK is on an older version than the API, then the API may respond with new
                 * members that the SDK is unaware of.
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
                 * - It was deserialized from data that doesn't match any known member. For example,
                 *   if the SDK is on an older version than the API, then the API may respond with
                 *   new members that the SDK is unaware of.
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
                 * Use the [known] method instead if you're certain the value is always known or if
                 * you want to throw for the unknown case.
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

                return other is Clabe &&
                    accountType == other.accountType &&
                    clabeNumber == other.clabeNumber &&
                    reference == other.reference &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(accountType, clabeNumber, reference, additionalProperties)
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "Clabe{accountType=$accountType, clabeNumber=$clabeNumber, reference=$reference, additionalProperties=$additionalProperties}"
        }

        class UsAccount
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val accountCategory: JsonField<UsAccountInfo.AccountCategory>,
            private val accountNumber: JsonField<String>,
            private val accountType: JsonValue,
            private val routingNumber: JsonField<String>,
            private val bankName: JsonField<String>,
            private val reference: JsonField<String>,
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
                @JsonProperty("accountType")
                @ExcludeMissing
                accountType: JsonValue = JsonMissing.of(),
                @JsonProperty("routingNumber")
                @ExcludeMissing
                routingNumber: JsonField<String> = JsonMissing.of(),
                @JsonProperty("bankName")
                @ExcludeMissing
                bankName: JsonField<String> = JsonMissing.of(),
                @JsonProperty("reference")
                @ExcludeMissing
                reference: JsonField<String> = JsonMissing.of(),
            ) : this(
                accountCategory,
                accountNumber,
                accountType,
                routingNumber,
                bankName,
                reference,
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
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun accountCategory(): UsAccountInfo.AccountCategory =
                accountCategory.getRequired("accountCategory")

            /**
             * US bank account number
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
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
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun routingNumber(): String = routingNumber.getRequired("routingNumber")

            /**
             * Name of the bank
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun bankName(): String? = bankName.getNullable("bankName")

            /**
             * Unique reference code that must be included with the payment to properly credit it
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun reference(): String = reference.getRequired("reference")

            /**
             * Returns the raw JSON value of [accountCategory].
             *
             * Unlike [accountCategory], this method doesn't throw if the JSON field has an
             * unexpected type.
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
             * Unlike [bankName], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("bankName") @ExcludeMissing fun _bankName(): JsonField<String> = bankName

            /**
             * Returns the raw JSON value of [reference].
             *
             * Unlike [reference], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("reference")
            @ExcludeMissing
            fun _reference(): JsonField<String> = reference

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
                 * .reference()
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
                private var reference: JsonField<String>? = null
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(usAccount: UsAccount) = apply {
                    accountCategory = usAccount.accountCategory
                    accountNumber = usAccount.accountNumber
                    accountType = usAccount.accountType
                    routingNumber = usAccount.routingNumber
                    bankName = usAccount.bankName
                    reference = usAccount.reference
                    additionalProperties = usAccount.additionalProperties.toMutableMap()
                }

                /** Type of account (checking or savings) */
                fun accountCategory(accountCategory: UsAccountInfo.AccountCategory) =
                    accountCategory(JsonField.of(accountCategory))

                /**
                 * Sets [Builder.accountCategory] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.accountCategory] with a well-typed
                 * [UsAccountInfo.AccountCategory] value instead. This method is primarily for
                 * setting the field to an undocumented or not yet supported value.
                 */
                fun accountCategory(accountCategory: JsonField<UsAccountInfo.AccountCategory>) =
                    apply {
                        this.accountCategory = accountCategory
                    }

                /** US bank account number */
                fun accountNumber(accountNumber: String) =
                    accountNumber(JsonField.of(accountNumber))

                /**
                 * Sets [Builder.accountNumber] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.accountNumber] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
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
                fun routingNumber(routingNumber: String) =
                    routingNumber(JsonField.of(routingNumber))

                /**
                 * Sets [Builder.routingNumber] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.routingNumber] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun routingNumber(routingNumber: JsonField<String>) = apply {
                    this.routingNumber = routingNumber
                }

                /** Name of the bank */
                fun bankName(bankName: String) = bankName(JsonField.of(bankName))

                /**
                 * Sets [Builder.bankName] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.bankName] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun bankName(bankName: JsonField<String>) = apply { this.bankName = bankName }

                /**
                 * Unique reference code that must be included with the payment to properly credit
                 * it
                 */
                fun reference(reference: String) = reference(JsonField.of(reference))

                /**
                 * Sets [Builder.reference] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.reference] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun reference(reference: JsonField<String>) = apply { this.reference = reference }

                fun additionalProperties(additionalProperties: Map<String, JsonValue>) = apply {
                    this.additionalProperties.clear()
                    putAllAdditionalProperties(additionalProperties)
                }

                fun putAdditionalProperty(key: String, value: JsonValue) = apply {
                    additionalProperties.put(key, value)
                }

                fun putAllAdditionalProperties(additionalProperties: Map<String, JsonValue>) =
                    apply {
                        this.additionalProperties.putAll(additionalProperties)
                    }

                fun removeAdditionalProperty(key: String) = apply {
                    additionalProperties.remove(key)
                }

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
                 * .reference()
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
                        checkRequired("reference", reference),
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
                reference()
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
                    (if (reference.asKnown() == null) 0 else 1)

            class AccountType
            @JsonCreator
            private constructor(private val value: JsonField<String>) : Enum {

                /**
                 * Returns this class instance's raw value.
                 *
                 * This is usually only useful if this instance was deserialized from data that
                 * doesn't match any known member, and you want to know that value. For example, if
                 * the SDK is on an older version than the API, then the API may respond with new
                 * members that the SDK is unaware of.
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
                 * - It was deserialized from data that doesn't match any known member. For example,
                 *   if the SDK is on an older version than the API, then the API may respond with
                 *   new members that the SDK is unaware of.
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
                 * Use the [known] method instead if you're certain the value is always known or if
                 * you want to throw for the unknown case.
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

                return other is UsAccount &&
                    accountCategory == other.accountCategory &&
                    accountNumber == other.accountNumber &&
                    accountType == other.accountType &&
                    routingNumber == other.routingNumber &&
                    bankName == other.bankName &&
                    reference == other.reference &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(
                    accountCategory,
                    accountNumber,
                    accountType,
                    routingNumber,
                    bankName,
                    reference,
                    additionalProperties,
                )
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "UsAccount{accountCategory=$accountCategory, accountNumber=$accountNumber, accountType=$accountType, routingNumber=$routingNumber, bankName=$bankName, reference=$reference, additionalProperties=$additionalProperties}"
        }

        class Pix
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val accountType: JsonValue,
            private val pixKey: JsonField<String>,
            private val pixKeyType: JsonField<PixAccountInfo.PixKeyType>,
            private val taxId: JsonField<String>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("accountType")
                @ExcludeMissing
                accountType: JsonValue = JsonMissing.of(),
                @JsonProperty("pixKey")
                @ExcludeMissing
                pixKey: JsonField<String> = JsonMissing.of(),
                @JsonProperty("pixKeyType")
                @ExcludeMissing
                pixKeyType: JsonField<PixAccountInfo.PixKeyType> = JsonMissing.of(),
                @JsonProperty("taxId") @ExcludeMissing taxId: JsonField<String> = JsonMissing.of(),
            ) : this(accountType, pixKey, pixKeyType, taxId, mutableMapOf())

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
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun pixKey(): String = pixKey.getRequired("pixKey")

            /**
             * Type of PIX key being used
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun pixKeyType(): PixAccountInfo.PixKeyType = pixKeyType.getRequired("pixKeyType")

            /**
             * Tax ID of the account holder
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
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
             * Unlike [pixKeyType], this method doesn't throw if the JSON field has an unexpected
             * type.
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
                 * Returns a mutable builder for constructing an instance of [Pix].
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

            /** A builder for [Pix]. */
            class Builder internal constructor() {

                private var accountType: JsonValue = JsonValue.from("PIX")
                private var pixKey: JsonField<String>? = null
                private var pixKeyType: JsonField<PixAccountInfo.PixKeyType>? = null
                private var taxId: JsonField<String>? = null
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(pix: Pix) = apply {
                    accountType = pix.accountType
                    pixKey = pix.pixKey
                    pixKeyType = pix.pixKeyType
                    taxId = pix.taxId
                    additionalProperties = pix.additionalProperties.toMutableMap()
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
                 * You should usually call [Builder.pixKey] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun pixKey(pixKey: JsonField<String>) = apply { this.pixKey = pixKey }

                /** Type of PIX key being used */
                fun pixKeyType(pixKeyType: PixAccountInfo.PixKeyType) =
                    pixKeyType(JsonField.of(pixKeyType))

                /**
                 * Sets [Builder.pixKeyType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.pixKeyType] with a well-typed
                 * [PixAccountInfo.PixKeyType] value instead. This method is primarily for setting
                 * the field to an undocumented or not yet supported value.
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

                fun additionalProperties(additionalProperties: Map<String, JsonValue>) = apply {
                    this.additionalProperties.clear()
                    putAllAdditionalProperties(additionalProperties)
                }

                fun putAdditionalProperty(key: String, value: JsonValue) = apply {
                    additionalProperties.put(key, value)
                }

                fun putAllAdditionalProperties(additionalProperties: Map<String, JsonValue>) =
                    apply {
                        this.additionalProperties.putAll(additionalProperties)
                    }

                fun removeAdditionalProperty(key: String) = apply {
                    additionalProperties.remove(key)
                }

                fun removeAllAdditionalProperties(keys: Set<String>) = apply {
                    keys.forEach(::removeAdditionalProperty)
                }

                /**
                 * Returns an immutable instance of [Pix].
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
                fun build(): Pix =
                    Pix(
                        accountType,
                        checkRequired("pixKey", pixKey),
                        checkRequired("pixKeyType", pixKeyType),
                        checkRequired("taxId", taxId),
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): Pix = apply {
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
             * Returns a score indicating how many valid values are contained in this object
             * recursively.
             *
             * Used for best match union deserialization.
             */
            internal fun validity(): Int =
                accountType.let { if (it == JsonValue.from("PIX")) 1 else 0 } +
                    (if (pixKey.asKnown() == null) 0 else 1) +
                    (pixKeyType.asKnown()?.validity() ?: 0) +
                    (if (taxId.asKnown() == null) 0 else 1)

            class AccountType
            @JsonCreator
            private constructor(private val value: JsonField<String>) : Enum {

                /**
                 * Returns this class instance's raw value.
                 *
                 * This is usually only useful if this instance was deserialized from data that
                 * doesn't match any known member, and you want to know that value. For example, if
                 * the SDK is on an older version than the API, then the API may respond with new
                 * members that the SDK is unaware of.
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
                 * - It was deserialized from data that doesn't match any known member. For example,
                 *   if the SDK is on an older version than the API, then the API may respond with
                 *   new members that the SDK is unaware of.
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
                 * Use the [known] method instead if you're certain the value is always known or if
                 * you want to throw for the unknown case.
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

                return other is Pix &&
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
                "Pix{accountType=$accountType, pixKey=$pixKey, pixKeyType=$pixKeyType, taxId=$taxId, additionalProperties=$additionalProperties}"
        }

        class Iban
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val accountType: JsonValue,
            private val iban: JsonField<String>,
            private val swiftBic: JsonField<String>,
            private val reference: JsonField<String>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("accountType")
                @ExcludeMissing
                accountType: JsonValue = JsonMissing.of(),
                @JsonProperty("iban") @ExcludeMissing iban: JsonField<String> = JsonMissing.of(),
                @JsonProperty("swiftBic")
                @ExcludeMissing
                swiftBic: JsonField<String> = JsonMissing.of(),
                @JsonProperty("reference")
                @ExcludeMissing
                reference: JsonField<String> = JsonMissing.of(),
            ) : this(accountType, iban, swiftBic, reference, mutableMapOf())

            fun toIbanAccountInfo(): IbanAccountInfo =
                IbanAccountInfo.builder()
                    .accountType(accountType)
                    .iban(iban)
                    .swiftBic(swiftBic)
                    .build()

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
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun iban(): String = iban.getRequired("iban")

            /**
             * SWIFT/BIC code (8 or 11 characters)
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun swiftBic(): String = swiftBic.getRequired("swiftBic")

            /**
             * Unique reference code that must be included with the payment to properly credit it
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun reference(): String = reference.getRequired("reference")

            /**
             * Returns the raw JSON value of [iban].
             *
             * Unlike [iban], this method doesn't throw if the JSON field has an unexpected type.
             */
            @JsonProperty("iban") @ExcludeMissing fun _iban(): JsonField<String> = iban

            /**
             * Returns the raw JSON value of [swiftBic].
             *
             * Unlike [swiftBic], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("swiftBic") @ExcludeMissing fun _swiftBic(): JsonField<String> = swiftBic

            /**
             * Returns the raw JSON value of [reference].
             *
             * Unlike [reference], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("reference")
            @ExcludeMissing
            fun _reference(): JsonField<String> = reference

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
                 * Returns a mutable builder for constructing an instance of [Iban].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .iban()
                 * .swiftBic()
                 * .reference()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [Iban]. */
            class Builder internal constructor() {

                private var accountType: JsonValue = JsonValue.from("IBAN")
                private var iban: JsonField<String>? = null
                private var swiftBic: JsonField<String>? = null
                private var reference: JsonField<String>? = null
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(iban: Iban) = apply {
                    accountType = iban.accountType
                    this.iban = iban.iban
                    swiftBic = iban.swiftBic
                    reference = iban.reference
                    additionalProperties = iban.additionalProperties.toMutableMap()
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
                 * You should usually call [Builder.iban] with a well-typed [String] value instead.
                 * This method is primarily for setting the field to an undocumented or not yet
                 * supported value.
                 */
                fun iban(iban: JsonField<String>) = apply { this.iban = iban }

                /** SWIFT/BIC code (8 or 11 characters) */
                fun swiftBic(swiftBic: String) = swiftBic(JsonField.of(swiftBic))

                /**
                 * Sets [Builder.swiftBic] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.swiftBic] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun swiftBic(swiftBic: JsonField<String>) = apply { this.swiftBic = swiftBic }

                /**
                 * Unique reference code that must be included with the payment to properly credit
                 * it
                 */
                fun reference(reference: String) = reference(JsonField.of(reference))

                /**
                 * Sets [Builder.reference] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.reference] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun reference(reference: JsonField<String>) = apply { this.reference = reference }

                fun additionalProperties(additionalProperties: Map<String, JsonValue>) = apply {
                    this.additionalProperties.clear()
                    putAllAdditionalProperties(additionalProperties)
                }

                fun putAdditionalProperty(key: String, value: JsonValue) = apply {
                    additionalProperties.put(key, value)
                }

                fun putAllAdditionalProperties(additionalProperties: Map<String, JsonValue>) =
                    apply {
                        this.additionalProperties.putAll(additionalProperties)
                    }

                fun removeAdditionalProperty(key: String) = apply {
                    additionalProperties.remove(key)
                }

                fun removeAllAdditionalProperties(keys: Set<String>) = apply {
                    keys.forEach(::removeAdditionalProperty)
                }

                /**
                 * Returns an immutable instance of [Iban].
                 *
                 * Further updates to this [Builder] will not mutate the returned instance.
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .iban()
                 * .swiftBic()
                 * .reference()
                 * ```
                 *
                 * @throws IllegalStateException if any required field is unset.
                 */
                fun build(): Iban =
                    Iban(
                        accountType,
                        checkRequired("iban", iban),
                        checkRequired("swiftBic", swiftBic),
                        checkRequired("reference", reference),
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): Iban = apply {
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
                reference()
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
                    (if (reference.asKnown() == null) 0 else 1)

            class AccountType
            @JsonCreator
            private constructor(private val value: JsonField<String>) : Enum {

                /**
                 * Returns this class instance's raw value.
                 *
                 * This is usually only useful if this instance was deserialized from data that
                 * doesn't match any known member, and you want to know that value. For example, if
                 * the SDK is on an older version than the API, then the API may respond with new
                 * members that the SDK is unaware of.
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
                 * - It was deserialized from data that doesn't match any known member. For example,
                 *   if the SDK is on an older version than the API, then the API may respond with
                 *   new members that the SDK is unaware of.
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
                 * Use the [known] method instead if you're certain the value is always known or if
                 * you want to throw for the unknown case.
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

                return other is Iban &&
                    accountType == other.accountType &&
                    iban == other.iban &&
                    swiftBic == other.swiftBic &&
                    reference == other.reference &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(accountType, iban, swiftBic, reference, additionalProperties)
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "Iban{accountType=$accountType, iban=$iban, swiftBic=$swiftBic, reference=$reference, additionalProperties=$additionalProperties}"
        }

        class FboAccount
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val accountType: JsonField<AccountType>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("accountType")
                @ExcludeMissing
                accountType: JsonField<AccountType> = JsonMissing.of()
            ) : this(accountType, mutableMapOf())

            /**
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun accountType(): AccountType? = accountType.getNullable("accountType")

            /**
             * Returns the raw JSON value of [accountType].
             *
             * Unlike [accountType], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("accountType")
            @ExcludeMissing
            fun _accountType(): JsonField<AccountType> = accountType

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

                /** Returns a mutable builder for constructing an instance of [FboAccount]. */
                fun builder() = Builder()
            }

            /** A builder for [FboAccount]. */
            class Builder internal constructor() {

                private var accountType: JsonField<AccountType> = JsonMissing.of()
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(fboAccount: FboAccount) = apply {
                    accountType = fboAccount.accountType
                    additionalProperties = fboAccount.additionalProperties.toMutableMap()
                }

                fun accountType(accountType: AccountType) = accountType(JsonField.of(accountType))

                /**
                 * Sets [Builder.accountType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.accountType] with a well-typed [AccountType]
                 * value instead. This method is primarily for setting the field to an undocumented
                 * or not yet supported value.
                 */
                fun accountType(accountType: JsonField<AccountType>) = apply {
                    this.accountType = accountType
                }

                fun additionalProperties(additionalProperties: Map<String, JsonValue>) = apply {
                    this.additionalProperties.clear()
                    putAllAdditionalProperties(additionalProperties)
                }

                fun putAdditionalProperty(key: String, value: JsonValue) = apply {
                    additionalProperties.put(key, value)
                }

                fun putAllAdditionalProperties(additionalProperties: Map<String, JsonValue>) =
                    apply {
                        this.additionalProperties.putAll(additionalProperties)
                    }

                fun removeAdditionalProperty(key: String) = apply {
                    additionalProperties.remove(key)
                }

                fun removeAllAdditionalProperties(keys: Set<String>) = apply {
                    keys.forEach(::removeAdditionalProperty)
                }

                /**
                 * Returns an immutable instance of [FboAccount].
                 *
                 * Further updates to this [Builder] will not mutate the returned instance.
                 */
                fun build(): FboAccount =
                    FboAccount(accountType, additionalProperties.toMutableMap())
            }

            private var validated: Boolean = false

            fun validate(): FboAccount = apply {
                if (validated) {
                    return@apply
                }

                accountType()?.validate()
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
            internal fun validity(): Int = (accountType.asKnown()?.validity() ?: 0)

            class AccountType
            @JsonCreator
            private constructor(private val value: JsonField<String>) : Enum {

                /**
                 * Returns this class instance's raw value.
                 *
                 * This is usually only useful if this instance was deserialized from data that
                 * doesn't match any known member, and you want to know that value. For example, if
                 * the SDK is on an older version than the API, then the API may respond with new
                 * members that the SDK is unaware of.
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
                 * - It was deserialized from data that doesn't match any known member. For example,
                 *   if the SDK is on an older version than the API, then the API may respond with
                 *   new members that the SDK is unaware of.
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
                 * Use the [known] method instead if you're certain the value is always known or if
                 * you want to throw for the unknown case.
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

                return other is FboAccount &&
                    accountType == other.accountType &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy { Objects.hash(accountType, additionalProperties) }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "FboAccount{accountType=$accountType, additionalProperties=$additionalProperties}"
        }

        class Upi
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val accountType: JsonValue,
            private val vpa: JsonField<String>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("accountType")
                @ExcludeMissing
                accountType: JsonValue = JsonMissing.of(),
                @JsonProperty("vpa") @ExcludeMissing vpa: JsonField<String> = JsonMissing.of(),
            ) : this(accountType, vpa, mutableMapOf())

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
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
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
                 * Returns a mutable builder for constructing an instance of [Upi].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .vpa()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [Upi]. */
            class Builder internal constructor() {

                private var accountType: JsonValue = JsonValue.from("UPI")
                private var vpa: JsonField<String>? = null
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(upi: Upi) = apply {
                    accountType = upi.accountType
                    vpa = upi.vpa
                    additionalProperties = upi.additionalProperties.toMutableMap()
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
                 * You should usually call [Builder.vpa] with a well-typed [String] value instead.
                 * This method is primarily for setting the field to an undocumented or not yet
                 * supported value.
                 */
                fun vpa(vpa: JsonField<String>) = apply { this.vpa = vpa }

                fun additionalProperties(additionalProperties: Map<String, JsonValue>) = apply {
                    this.additionalProperties.clear()
                    putAllAdditionalProperties(additionalProperties)
                }

                fun putAdditionalProperty(key: String, value: JsonValue) = apply {
                    additionalProperties.put(key, value)
                }

                fun putAllAdditionalProperties(additionalProperties: Map<String, JsonValue>) =
                    apply {
                        this.additionalProperties.putAll(additionalProperties)
                    }

                fun removeAdditionalProperty(key: String) = apply {
                    additionalProperties.remove(key)
                }

                fun removeAllAdditionalProperties(keys: Set<String>) = apply {
                    keys.forEach(::removeAdditionalProperty)
                }

                /**
                 * Returns an immutable instance of [Upi].
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
                fun build(): Upi =
                    Upi(accountType, checkRequired("vpa", vpa), additionalProperties.toMutableMap())
            }

            private var validated: Boolean = false

            fun validate(): Upi = apply {
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
             * Returns a score indicating how many valid values are contained in this object
             * recursively.
             *
             * Used for best match union deserialization.
             */
            internal fun validity(): Int =
                accountType.let { if (it == JsonValue.from("UPI")) 1 else 0 } +
                    (if (vpa.asKnown() == null) 0 else 1)

            class AccountType
            @JsonCreator
            private constructor(private val value: JsonField<String>) : Enum {

                /**
                 * Returns this class instance's raw value.
                 *
                 * This is usually only useful if this instance was deserialized from data that
                 * doesn't match any known member, and you want to know that value. For example, if
                 * the SDK is on an older version than the API, then the API may respond with new
                 * members that the SDK is unaware of.
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
                 * - It was deserialized from data that doesn't match any known member. For example,
                 *   if the SDK is on an older version than the API, then the API may respond with
                 *   new members that the SDK is unaware of.
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
                 * Use the [known] method instead if you're certain the value is always known or if
                 * you want to throw for the unknown case.
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

                return other is Upi &&
                    accountType == other.accountType &&
                    vpa == other.vpa &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(accountType, vpa, additionalProperties)
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "Upi{accountType=$accountType, vpa=$vpa, additionalProperties=$additionalProperties}"
        }

        class SparkWallet
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val accountType: JsonValue,
            private val address: JsonField<String>,
            private val assetType: JsonField<AssetType>,
            private val invoice: JsonField<String>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("accountType")
                @ExcludeMissing
                accountType: JsonValue = JsonMissing.of(),
                @JsonProperty("address")
                @ExcludeMissing
                address: JsonField<String> = JsonMissing.of(),
                @JsonProperty("assetType")
                @ExcludeMissing
                assetType: JsonField<AssetType> = JsonMissing.of(),
                @JsonProperty("invoice")
                @ExcludeMissing
                invoice: JsonField<String> = JsonMissing.of(),
            ) : this(accountType, address, assetType, invoice, mutableMapOf())

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
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun address(): String = address.getRequired("address")

            /**
             * Type of asset
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun assetType(): AssetType = assetType.getRequired("assetType")

            /**
             * Invoice for the payment
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun invoice(): String? = invoice.getNullable("invoice")

            /**
             * Returns the raw JSON value of [address].
             *
             * Unlike [address], this method doesn't throw if the JSON field has an unexpected type.
             */
            @JsonProperty("address") @ExcludeMissing fun _address(): JsonField<String> = address

            /**
             * Returns the raw JSON value of [assetType].
             *
             * Unlike [assetType], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("assetType")
            @ExcludeMissing
            fun _assetType(): JsonField<AssetType> = assetType

            /**
             * Returns the raw JSON value of [invoice].
             *
             * Unlike [invoice], this method doesn't throw if the JSON field has an unexpected type.
             */
            @JsonProperty("invoice") @ExcludeMissing fun _invoice(): JsonField<String> = invoice

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
                 * .assetType()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [SparkWallet]. */
            class Builder internal constructor() {

                private var accountType: JsonValue = JsonValue.from("SPARK_WALLET")
                private var address: JsonField<String>? = null
                private var assetType: JsonField<AssetType>? = null
                private var invoice: JsonField<String> = JsonMissing.of()
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(sparkWallet: SparkWallet) = apply {
                    accountType = sparkWallet.accountType
                    address = sparkWallet.address
                    assetType = sparkWallet.assetType
                    invoice = sparkWallet.invoice
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
                 * You should usually call [Builder.address] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun address(address: JsonField<String>) = apply { this.address = address }

                /** Type of asset */
                fun assetType(assetType: AssetType) = assetType(JsonField.of(assetType))

                /**
                 * Sets [Builder.assetType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.assetType] with a well-typed [AssetType] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun assetType(assetType: JsonField<AssetType>) = apply {
                    this.assetType = assetType
                }

                /** Invoice for the payment */
                fun invoice(invoice: String) = invoice(JsonField.of(invoice))

                /**
                 * Sets [Builder.invoice] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.invoice] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun invoice(invoice: JsonField<String>) = apply { this.invoice = invoice }

                fun additionalProperties(additionalProperties: Map<String, JsonValue>) = apply {
                    this.additionalProperties.clear()
                    putAllAdditionalProperties(additionalProperties)
                }

                fun putAdditionalProperty(key: String, value: JsonValue) = apply {
                    additionalProperties.put(key, value)
                }

                fun putAllAdditionalProperties(additionalProperties: Map<String, JsonValue>) =
                    apply {
                        this.additionalProperties.putAll(additionalProperties)
                    }

                fun removeAdditionalProperty(key: String) = apply {
                    additionalProperties.remove(key)
                }

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
                 * .assetType()
                 * ```
                 *
                 * @throws IllegalStateException if any required field is unset.
                 */
                fun build(): SparkWallet =
                    SparkWallet(
                        accountType,
                        checkRequired("address", address),
                        checkRequired("assetType", assetType),
                        invoice,
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
                assetType().validate()
                invoice()
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
                    (if (address.asKnown() == null) 0 else 1) +
                    (assetType.asKnown()?.validity() ?: 0) +
                    (if (invoice.asKnown() == null) 0 else 1)

            /** Type of asset */
            class AssetType @JsonCreator private constructor(private val value: JsonField<String>) :
                Enum {

                /**
                 * Returns this class instance's raw value.
                 *
                 * This is usually only useful if this instance was deserialized from data that
                 * doesn't match any known member, and you want to know that value. For example, if
                 * the SDK is on an older version than the API, then the API may respond with new
                 * members that the SDK is unaware of.
                 */
                @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

                companion object {

                    val BTC = of("BTC")

                    val USDB = of("USDB")

                    fun of(value: String) = AssetType(JsonField.of(value))
                }

                /** An enum containing [AssetType]'s known values. */
                enum class Known {
                    BTC,
                    USDB,
                }

                /**
                 * An enum containing [AssetType]'s known values, as well as an [_UNKNOWN] member.
                 *
                 * An instance of [AssetType] can contain an unknown value in a couple of cases:
                 * - It was deserialized from data that doesn't match any known member. For example,
                 *   if the SDK is on an older version than the API, then the API may respond with
                 *   new members that the SDK is unaware of.
                 * - It was constructed with an arbitrary value using the [of] method.
                 */
                enum class Value {
                    BTC,
                    USDB,
                    /**
                     * An enum member indicating that [AssetType] was instantiated with an unknown
                     * value.
                     */
                    _UNKNOWN,
                }

                /**
                 * Returns an enum member corresponding to this class instance's value, or
                 * [Value._UNKNOWN] if the class was instantiated with an unknown value.
                 *
                 * Use the [known] method instead if you're certain the value is always known or if
                 * you want to throw for the unknown case.
                 */
                fun value(): Value =
                    when (this) {
                        BTC -> Value.BTC
                        USDB -> Value.USDB
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
                        BTC -> Known.BTC
                        USDB -> Known.USDB
                        else -> throw GridInvalidDataException("Unknown AssetType: $value")
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

                fun validate(): AssetType = apply {
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

                    return other is AssetType && value == other.value
                }

                override fun hashCode() = value.hashCode()

                override fun toString() = value.toString()
            }

            class AccountType
            @JsonCreator
            private constructor(private val value: JsonField<String>) : Enum {

                /**
                 * Returns this class instance's raw value.
                 *
                 * This is usually only useful if this instance was deserialized from data that
                 * doesn't match any known member, and you want to know that value. For example, if
                 * the SDK is on an older version than the API, then the API may respond with new
                 * members that the SDK is unaware of.
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
                 * - It was deserialized from data that doesn't match any known member. For example,
                 *   if the SDK is on an older version than the API, then the API may respond with
                 *   new members that the SDK is unaware of.
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
                 * Use the [known] method instead if you're certain the value is always known or if
                 * you want to throw for the unknown case.
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

                return other is SparkWallet &&
                    accountType == other.accountType &&
                    address == other.address &&
                    assetType == other.assetType &&
                    invoice == other.invoice &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(accountType, address, assetType, invoice, additionalProperties)
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "SparkWallet{accountType=$accountType, address=$address, assetType=$assetType, invoice=$invoice, additionalProperties=$additionalProperties}"
        }

        class Lightning
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val accountType: JsonValue,
            private val invoice: JsonField<String>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("accountType")
                @ExcludeMissing
                accountType: JsonValue = JsonMissing.of(),
                @JsonProperty("invoice")
                @ExcludeMissing
                invoice: JsonField<String> = JsonMissing.of(),
            ) : this(accountType, invoice, mutableMapOf())

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
             * Invoice for the payment
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun invoice(): String = invoice.getRequired("invoice")

            /**
             * Returns the raw JSON value of [invoice].
             *
             * Unlike [invoice], this method doesn't throw if the JSON field has an unexpected type.
             */
            @JsonProperty("invoice") @ExcludeMissing fun _invoice(): JsonField<String> = invoice

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
                 * Returns a mutable builder for constructing an instance of [Lightning].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .invoice()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [Lightning]. */
            class Builder internal constructor() {

                private var accountType: JsonValue = JsonValue.from("LIGHTNING")
                private var invoice: JsonField<String>? = null
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(lightning: Lightning) = apply {
                    accountType = lightning.accountType
                    invoice = lightning.invoice
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

                /** Invoice for the payment */
                fun invoice(invoice: String) = invoice(JsonField.of(invoice))

                /**
                 * Sets [Builder.invoice] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.invoice] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun invoice(invoice: JsonField<String>) = apply { this.invoice = invoice }

                fun additionalProperties(additionalProperties: Map<String, JsonValue>) = apply {
                    this.additionalProperties.clear()
                    putAllAdditionalProperties(additionalProperties)
                }

                fun putAdditionalProperty(key: String, value: JsonValue) = apply {
                    additionalProperties.put(key, value)
                }

                fun putAllAdditionalProperties(additionalProperties: Map<String, JsonValue>) =
                    apply {
                        this.additionalProperties.putAll(additionalProperties)
                    }

                fun removeAdditionalProperty(key: String) = apply {
                    additionalProperties.remove(key)
                }

                fun removeAllAdditionalProperties(keys: Set<String>) = apply {
                    keys.forEach(::removeAdditionalProperty)
                }

                /**
                 * Returns an immutable instance of [Lightning].
                 *
                 * Further updates to this [Builder] will not mutate the returned instance.
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .invoice()
                 * ```
                 *
                 * @throws IllegalStateException if any required field is unset.
                 */
                fun build(): Lightning =
                    Lightning(
                        accountType,
                        checkRequired("invoice", invoice),
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
                invoice()
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
                    (if (invoice.asKnown() == null) 0 else 1)

            override fun equals(other: Any?): Boolean {
                if (this === other) {
                    return true
                }

                return other is Lightning &&
                    accountType == other.accountType &&
                    invoice == other.invoice &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(accountType, invoice, additionalProperties)
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "Lightning{accountType=$accountType, invoice=$invoice, additionalProperties=$additionalProperties}"
        }

        class SolanaWallet
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val accountType: JsonValue,
            private val address: JsonField<String>,
            private val assetType: JsonField<AssetType>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("accountType")
                @ExcludeMissing
                accountType: JsonValue = JsonMissing.of(),
                @JsonProperty("address")
                @ExcludeMissing
                address: JsonField<String> = JsonMissing.of(),
                @JsonProperty("assetType")
                @ExcludeMissing
                assetType: JsonField<AssetType> = JsonMissing.of(),
            ) : this(accountType, address, assetType, mutableMapOf())

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
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun address(): String = address.getRequired("address")

            /**
             * Type of asset
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun assetType(): AssetType? = assetType.getNullable("assetType")

            /**
             * Returns the raw JSON value of [address].
             *
             * Unlike [address], this method doesn't throw if the JSON field has an unexpected type.
             */
            @JsonProperty("address") @ExcludeMissing fun _address(): JsonField<String> = address

            /**
             * Returns the raw JSON value of [assetType].
             *
             * Unlike [assetType], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("assetType")
            @ExcludeMissing
            fun _assetType(): JsonField<AssetType> = assetType

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
                private var assetType: JsonField<AssetType> = JsonMissing.of()
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(solanaWallet: SolanaWallet) = apply {
                    accountType = solanaWallet.accountType
                    address = solanaWallet.address
                    assetType = solanaWallet.assetType
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
                 * You should usually call [Builder.address] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun address(address: JsonField<String>) = apply { this.address = address }

                /** Type of asset */
                fun assetType(assetType: AssetType) = assetType(JsonField.of(assetType))

                /**
                 * Sets [Builder.assetType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.assetType] with a well-typed [AssetType] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun assetType(assetType: JsonField<AssetType>) = apply {
                    this.assetType = assetType
                }

                fun additionalProperties(additionalProperties: Map<String, JsonValue>) = apply {
                    this.additionalProperties.clear()
                    putAllAdditionalProperties(additionalProperties)
                }

                fun putAdditionalProperty(key: String, value: JsonValue) = apply {
                    additionalProperties.put(key, value)
                }

                fun putAllAdditionalProperties(additionalProperties: Map<String, JsonValue>) =
                    apply {
                        this.additionalProperties.putAll(additionalProperties)
                    }

                fun removeAdditionalProperty(key: String) = apply {
                    additionalProperties.remove(key)
                }

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
                        assetType,
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
                assetType()?.validate()
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
                    (if (address.asKnown() == null) 0 else 1) +
                    (assetType.asKnown()?.validity() ?: 0)

            class AccountType
            @JsonCreator
            private constructor(private val value: JsonField<String>) : Enum {

                /**
                 * Returns this class instance's raw value.
                 *
                 * This is usually only useful if this instance was deserialized from data that
                 * doesn't match any known member, and you want to know that value. For example, if
                 * the SDK is on an older version than the API, then the API may respond with new
                 * members that the SDK is unaware of.
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
                 * - It was deserialized from data that doesn't match any known member. For example,
                 *   if the SDK is on an older version than the API, then the API may respond with
                 *   new members that the SDK is unaware of.
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
                 * Use the [known] method instead if you're certain the value is always known or if
                 * you want to throw for the unknown case.
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

            /** Type of asset */
            class AssetType @JsonCreator private constructor(private val value: JsonField<String>) :
                Enum {

                /**
                 * Returns this class instance's raw value.
                 *
                 * This is usually only useful if this instance was deserialized from data that
                 * doesn't match any known member, and you want to know that value. For example, if
                 * the SDK is on an older version than the API, then the API may respond with new
                 * members that the SDK is unaware of.
                 */
                @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

                companion object {

                    val USDC = of("USDC")

                    val USDT = of("USDT")

                    fun of(value: String) = AssetType(JsonField.of(value))
                }

                /** An enum containing [AssetType]'s known values. */
                enum class Known {
                    USDC,
                    USDT,
                }

                /**
                 * An enum containing [AssetType]'s known values, as well as an [_UNKNOWN] member.
                 *
                 * An instance of [AssetType] can contain an unknown value in a couple of cases:
                 * - It was deserialized from data that doesn't match any known member. For example,
                 *   if the SDK is on an older version than the API, then the API may respond with
                 *   new members that the SDK is unaware of.
                 * - It was constructed with an arbitrary value using the [of] method.
                 */
                enum class Value {
                    USDC,
                    USDT,
                    /**
                     * An enum member indicating that [AssetType] was instantiated with an unknown
                     * value.
                     */
                    _UNKNOWN,
                }

                /**
                 * Returns an enum member corresponding to this class instance's value, or
                 * [Value._UNKNOWN] if the class was instantiated with an unknown value.
                 *
                 * Use the [known] method instead if you're certain the value is always known or if
                 * you want to throw for the unknown case.
                 */
                fun value(): Value =
                    when (this) {
                        USDC -> Value.USDC
                        USDT -> Value.USDT
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
                        USDC -> Known.USDC
                        USDT -> Known.USDT
                        else -> throw GridInvalidDataException("Unknown AssetType: $value")
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

                fun validate(): AssetType = apply {
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

                    return other is AssetType && value == other.value
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
                    assetType == other.assetType &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(accountType, address, assetType, additionalProperties)
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "SolanaWallet{accountType=$accountType, address=$address, assetType=$assetType, additionalProperties=$additionalProperties}"
        }

        class TronWallet
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val accountType: JsonValue,
            private val address: JsonField<String>,
            private val assetType: JsonField<AssetType>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("accountType")
                @ExcludeMissing
                accountType: JsonValue = JsonMissing.of(),
                @JsonProperty("address")
                @ExcludeMissing
                address: JsonField<String> = JsonMissing.of(),
                @JsonProperty("assetType")
                @ExcludeMissing
                assetType: JsonField<AssetType> = JsonMissing.of(),
            ) : this(accountType, address, assetType, mutableMapOf())

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
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun address(): String = address.getRequired("address")

            /**
             * Type of asset
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun assetType(): AssetType? = assetType.getNullable("assetType")

            /**
             * Returns the raw JSON value of [address].
             *
             * Unlike [address], this method doesn't throw if the JSON field has an unexpected type.
             */
            @JsonProperty("address") @ExcludeMissing fun _address(): JsonField<String> = address

            /**
             * Returns the raw JSON value of [assetType].
             *
             * Unlike [assetType], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("assetType")
            @ExcludeMissing
            fun _assetType(): JsonField<AssetType> = assetType

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
                private var assetType: JsonField<AssetType> = JsonMissing.of()
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(tronWallet: TronWallet) = apply {
                    accountType = tronWallet.accountType
                    address = tronWallet.address
                    assetType = tronWallet.assetType
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
                 * You should usually call [Builder.address] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun address(address: JsonField<String>) = apply { this.address = address }

                /** Type of asset */
                fun assetType(assetType: AssetType) = assetType(JsonField.of(assetType))

                /**
                 * Sets [Builder.assetType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.assetType] with a well-typed [AssetType] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun assetType(assetType: JsonField<AssetType>) = apply {
                    this.assetType = assetType
                }

                fun additionalProperties(additionalProperties: Map<String, JsonValue>) = apply {
                    this.additionalProperties.clear()
                    putAllAdditionalProperties(additionalProperties)
                }

                fun putAdditionalProperty(key: String, value: JsonValue) = apply {
                    additionalProperties.put(key, value)
                }

                fun putAllAdditionalProperties(additionalProperties: Map<String, JsonValue>) =
                    apply {
                        this.additionalProperties.putAll(additionalProperties)
                    }

                fun removeAdditionalProperty(key: String) = apply {
                    additionalProperties.remove(key)
                }

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
                        assetType,
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
                assetType()?.validate()
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
                    (if (address.asKnown() == null) 0 else 1) +
                    (assetType.asKnown()?.validity() ?: 0)

            class AccountType
            @JsonCreator
            private constructor(private val value: JsonField<String>) : Enum {

                /**
                 * Returns this class instance's raw value.
                 *
                 * This is usually only useful if this instance was deserialized from data that
                 * doesn't match any known member, and you want to know that value. For example, if
                 * the SDK is on an older version than the API, then the API may respond with new
                 * members that the SDK is unaware of.
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
                 * - It was deserialized from data that doesn't match any known member. For example,
                 *   if the SDK is on an older version than the API, then the API may respond with
                 *   new members that the SDK is unaware of.
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
                 * Use the [known] method instead if you're certain the value is always known or if
                 * you want to throw for the unknown case.
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

            /** Type of asset */
            class AssetType @JsonCreator private constructor(private val value: JsonField<String>) :
                Enum {

                /**
                 * Returns this class instance's raw value.
                 *
                 * This is usually only useful if this instance was deserialized from data that
                 * doesn't match any known member, and you want to know that value. For example, if
                 * the SDK is on an older version than the API, then the API may respond with new
                 * members that the SDK is unaware of.
                 */
                @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

                companion object {

                    val USDT = of("USDT")

                    fun of(value: String) = AssetType(JsonField.of(value))
                }

                /** An enum containing [AssetType]'s known values. */
                enum class Known {
                    USDT
                }

                /**
                 * An enum containing [AssetType]'s known values, as well as an [_UNKNOWN] member.
                 *
                 * An instance of [AssetType] can contain an unknown value in a couple of cases:
                 * - It was deserialized from data that doesn't match any known member. For example,
                 *   if the SDK is on an older version than the API, then the API may respond with
                 *   new members that the SDK is unaware of.
                 * - It was constructed with an arbitrary value using the [of] method.
                 */
                enum class Value {
                    USDT,
                    /**
                     * An enum member indicating that [AssetType] was instantiated with an unknown
                     * value.
                     */
                    _UNKNOWN,
                }

                /**
                 * Returns an enum member corresponding to this class instance's value, or
                 * [Value._UNKNOWN] if the class was instantiated with an unknown value.
                 *
                 * Use the [known] method instead if you're certain the value is always known or if
                 * you want to throw for the unknown case.
                 */
                fun value(): Value =
                    when (this) {
                        USDT -> Value.USDT
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
                        USDT -> Known.USDT
                        else -> throw GridInvalidDataException("Unknown AssetType: $value")
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

                fun validate(): AssetType = apply {
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

                    return other is AssetType && value == other.value
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
                    assetType == other.assetType &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(accountType, address, assetType, additionalProperties)
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "TronWallet{accountType=$accountType, address=$address, assetType=$assetType, additionalProperties=$additionalProperties}"
        }

        class PolygonWallet
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val accountType: JsonValue,
            private val address: JsonField<String>,
            private val assetType: JsonField<AssetType>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("accountType")
                @ExcludeMissing
                accountType: JsonValue = JsonMissing.of(),
                @JsonProperty("address")
                @ExcludeMissing
                address: JsonField<String> = JsonMissing.of(),
                @JsonProperty("assetType")
                @ExcludeMissing
                assetType: JsonField<AssetType> = JsonMissing.of(),
            ) : this(accountType, address, assetType, mutableMapOf())

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
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun address(): String = address.getRequired("address")

            /**
             * Type of asset
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun assetType(): AssetType? = assetType.getNullable("assetType")

            /**
             * Returns the raw JSON value of [address].
             *
             * Unlike [address], this method doesn't throw if the JSON field has an unexpected type.
             */
            @JsonProperty("address") @ExcludeMissing fun _address(): JsonField<String> = address

            /**
             * Returns the raw JSON value of [assetType].
             *
             * Unlike [assetType], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("assetType")
            @ExcludeMissing
            fun _assetType(): JsonField<AssetType> = assetType

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
                private var assetType: JsonField<AssetType> = JsonMissing.of()
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(polygonWallet: PolygonWallet) = apply {
                    accountType = polygonWallet.accountType
                    address = polygonWallet.address
                    assetType = polygonWallet.assetType
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
                 * You should usually call [Builder.address] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun address(address: JsonField<String>) = apply { this.address = address }

                /** Type of asset */
                fun assetType(assetType: AssetType) = assetType(JsonField.of(assetType))

                /**
                 * Sets [Builder.assetType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.assetType] with a well-typed [AssetType] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun assetType(assetType: JsonField<AssetType>) = apply {
                    this.assetType = assetType
                }

                fun additionalProperties(additionalProperties: Map<String, JsonValue>) = apply {
                    this.additionalProperties.clear()
                    putAllAdditionalProperties(additionalProperties)
                }

                fun putAdditionalProperty(key: String, value: JsonValue) = apply {
                    additionalProperties.put(key, value)
                }

                fun putAllAdditionalProperties(additionalProperties: Map<String, JsonValue>) =
                    apply {
                        this.additionalProperties.putAll(additionalProperties)
                    }

                fun removeAdditionalProperty(key: String) = apply {
                    additionalProperties.remove(key)
                }

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
                        assetType,
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
                assetType()?.validate()
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
                    (if (address.asKnown() == null) 0 else 1) +
                    (assetType.asKnown()?.validity() ?: 0)

            class AccountType
            @JsonCreator
            private constructor(private val value: JsonField<String>) : Enum {

                /**
                 * Returns this class instance's raw value.
                 *
                 * This is usually only useful if this instance was deserialized from data that
                 * doesn't match any known member, and you want to know that value. For example, if
                 * the SDK is on an older version than the API, then the API may respond with new
                 * members that the SDK is unaware of.
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
                 * - It was deserialized from data that doesn't match any known member. For example,
                 *   if the SDK is on an older version than the API, then the API may respond with
                 *   new members that the SDK is unaware of.
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
                 * Use the [known] method instead if you're certain the value is always known or if
                 * you want to throw for the unknown case.
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

            /** Type of asset */
            class AssetType @JsonCreator private constructor(private val value: JsonField<String>) :
                Enum {

                /**
                 * Returns this class instance's raw value.
                 *
                 * This is usually only useful if this instance was deserialized from data that
                 * doesn't match any known member, and you want to know that value. For example, if
                 * the SDK is on an older version than the API, then the API may respond with new
                 * members that the SDK is unaware of.
                 */
                @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

                companion object {

                    val USDC = of("USDC")

                    fun of(value: String) = AssetType(JsonField.of(value))
                }

                /** An enum containing [AssetType]'s known values. */
                enum class Known {
                    USDC
                }

                /**
                 * An enum containing [AssetType]'s known values, as well as an [_UNKNOWN] member.
                 *
                 * An instance of [AssetType] can contain an unknown value in a couple of cases:
                 * - It was deserialized from data that doesn't match any known member. For example,
                 *   if the SDK is on an older version than the API, then the API may respond with
                 *   new members that the SDK is unaware of.
                 * - It was constructed with an arbitrary value using the [of] method.
                 */
                enum class Value {
                    USDC,
                    /**
                     * An enum member indicating that [AssetType] was instantiated with an unknown
                     * value.
                     */
                    _UNKNOWN,
                }

                /**
                 * Returns an enum member corresponding to this class instance's value, or
                 * [Value._UNKNOWN] if the class was instantiated with an unknown value.
                 *
                 * Use the [known] method instead if you're certain the value is always known or if
                 * you want to throw for the unknown case.
                 */
                fun value(): Value =
                    when (this) {
                        USDC -> Value.USDC
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
                        USDC -> Known.USDC
                        else -> throw GridInvalidDataException("Unknown AssetType: $value")
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

                fun validate(): AssetType = apply {
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

                    return other is AssetType && value == other.value
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
                    assetType == other.assetType &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(accountType, address, assetType, additionalProperties)
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "PolygonWallet{accountType=$accountType, address=$address, assetType=$assetType, additionalProperties=$additionalProperties}"
        }

        class BaseWallet
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val accountType: JsonValue,
            private val address: JsonField<String>,
            private val assetType: JsonField<AssetType>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("accountType")
                @ExcludeMissing
                accountType: JsonValue = JsonMissing.of(),
                @JsonProperty("address")
                @ExcludeMissing
                address: JsonField<String> = JsonMissing.of(),
                @JsonProperty("assetType")
                @ExcludeMissing
                assetType: JsonField<AssetType> = JsonMissing.of(),
            ) : this(accountType, address, assetType, mutableMapOf())

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
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun address(): String = address.getRequired("address")

            /**
             * Type of asset
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if
             *   the server responded with an unexpected value).
             */
            fun assetType(): AssetType? = assetType.getNullable("assetType")

            /**
             * Returns the raw JSON value of [address].
             *
             * Unlike [address], this method doesn't throw if the JSON field has an unexpected type.
             */
            @JsonProperty("address") @ExcludeMissing fun _address(): JsonField<String> = address

            /**
             * Returns the raw JSON value of [assetType].
             *
             * Unlike [assetType], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("assetType")
            @ExcludeMissing
            fun _assetType(): JsonField<AssetType> = assetType

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
                private var assetType: JsonField<AssetType> = JsonMissing.of()
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(baseWallet: BaseWallet) = apply {
                    accountType = baseWallet.accountType
                    address = baseWallet.address
                    assetType = baseWallet.assetType
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
                 * You should usually call [Builder.address] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun address(address: JsonField<String>) = apply { this.address = address }

                /** Type of asset */
                fun assetType(assetType: AssetType) = assetType(JsonField.of(assetType))

                /**
                 * Sets [Builder.assetType] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.assetType] with a well-typed [AssetType] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun assetType(assetType: JsonField<AssetType>) = apply {
                    this.assetType = assetType
                }

                fun additionalProperties(additionalProperties: Map<String, JsonValue>) = apply {
                    this.additionalProperties.clear()
                    putAllAdditionalProperties(additionalProperties)
                }

                fun putAdditionalProperty(key: String, value: JsonValue) = apply {
                    additionalProperties.put(key, value)
                }

                fun putAllAdditionalProperties(additionalProperties: Map<String, JsonValue>) =
                    apply {
                        this.additionalProperties.putAll(additionalProperties)
                    }

                fun removeAdditionalProperty(key: String) = apply {
                    additionalProperties.remove(key)
                }

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
                        assetType,
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
                assetType()?.validate()
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
                    (if (address.asKnown() == null) 0 else 1) +
                    (assetType.asKnown()?.validity() ?: 0)

            class AccountType
            @JsonCreator
            private constructor(private val value: JsonField<String>) : Enum {

                /**
                 * Returns this class instance's raw value.
                 *
                 * This is usually only useful if this instance was deserialized from data that
                 * doesn't match any known member, and you want to know that value. For example, if
                 * the SDK is on an older version than the API, then the API may respond with new
                 * members that the SDK is unaware of.
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
                 * - It was deserialized from data that doesn't match any known member. For example,
                 *   if the SDK is on an older version than the API, then the API may respond with
                 *   new members that the SDK is unaware of.
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
                 * Use the [known] method instead if you're certain the value is always known or if
                 * you want to throw for the unknown case.
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

            /** Type of asset */
            class AssetType @JsonCreator private constructor(private val value: JsonField<String>) :
                Enum {

                /**
                 * Returns this class instance's raw value.
                 *
                 * This is usually only useful if this instance was deserialized from data that
                 * doesn't match any known member, and you want to know that value. For example, if
                 * the SDK is on an older version than the API, then the API may respond with new
                 * members that the SDK is unaware of.
                 */
                @com.fasterxml.jackson.annotation.JsonValue fun _value(): JsonField<String> = value

                companion object {

                    val USDC = of("USDC")

                    fun of(value: String) = AssetType(JsonField.of(value))
                }

                /** An enum containing [AssetType]'s known values. */
                enum class Known {
                    USDC
                }

                /**
                 * An enum containing [AssetType]'s known values, as well as an [_UNKNOWN] member.
                 *
                 * An instance of [AssetType] can contain an unknown value in a couple of cases:
                 * - It was deserialized from data that doesn't match any known member. For example,
                 *   if the SDK is on an older version than the API, then the API may respond with
                 *   new members that the SDK is unaware of.
                 * - It was constructed with an arbitrary value using the [of] method.
                 */
                enum class Value {
                    USDC,
                    /**
                     * An enum member indicating that [AssetType] was instantiated with an unknown
                     * value.
                     */
                    _UNKNOWN,
                }

                /**
                 * Returns an enum member corresponding to this class instance's value, or
                 * [Value._UNKNOWN] if the class was instantiated with an unknown value.
                 *
                 * Use the [known] method instead if you're certain the value is always known or if
                 * you want to throw for the unknown case.
                 */
                fun value(): Value =
                    when (this) {
                        USDC -> Value.USDC
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
                        USDC -> Known.USDC
                        else -> throw GridInvalidDataException("Unknown AssetType: $value")
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

                fun validate(): AssetType = apply {
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

                    return other is AssetType && value == other.value
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
                    assetType == other.assetType &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(accountType, address, assetType, additionalProperties)
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "BaseWallet{accountType=$accountType, address=$address, assetType=$assetType, additionalProperties=$additionalProperties}"
        }
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is PaymentInstructions &&
            accountOrWalletInfo == other.accountOrWalletInfo &&
            instructionsNotes == other.instructionsNotes &&
            isPlatformAccount == other.isPlatformAccount &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(
            accountOrWalletInfo,
            instructionsNotes,
            isPlatformAccount,
            additionalProperties,
        )
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "PaymentInstructions{accountOrWalletInfo=$accountOrWalletInfo, instructionsNotes=$instructionsNotes, isPlatformAccount=$isPlatformAccount, additionalProperties=$additionalProperties}"
}
