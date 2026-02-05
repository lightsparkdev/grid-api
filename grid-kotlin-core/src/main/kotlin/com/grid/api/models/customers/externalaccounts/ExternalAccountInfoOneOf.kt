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

/**
 * Lightning payment destination. Exactly one of `invoice`, `bolt12`, or `lightningAddress` must be
 * provided.
 */
@JsonDeserialize(using = ExternalAccountInfoOneOf.Deserializer::class)
@JsonSerialize(using = ExternalAccountInfoOneOf.Serializer::class)
class ExternalAccountInfoOneOf
private constructor(
    private val usAccountExternalAccountInfo: UsAccountExternalAccountInfo? = null,
    private val clabeAccountExternalAccountInfo: ClabeAccountExternalAccountInfo? = null,
    private val pixAccountExternalAccountInfo: PixAccountExternalAccountInfo? = null,
    private val ibanAccountExternalAccountInfo: IbanAccountExternalAccountInfo? = null,
    private val upiAccountExternalAccountInfo: UpiAccountExternalAccountInfo? = null,
    private val ngnAccountExternalAccountInfo: NgnAccountExternalAccountInfo? = null,
    private val cadAccountExternalAccountInfo: CadAccountExternalAccountInfo? = null,
    private val gbpAccountExternalAccountInfo: GbpAccountExternalAccountInfo? = null,
    private val phpAccountExternalAccountInfo: PhpAccountExternalAccountInfo? = null,
    private val sgdAccountExternalAccountInfo: SgdAccountExternalAccountInfo? = null,
    private val sparkWalletExternalAccountInfo: SparkWalletExternalAccountInfo? = null,
    private val lightningExternalAccountInfo: LightningExternalAccountInfo? = null,
    private val solanaWalletExternalAccountInfo: SolanaWalletExternalAccountInfo? = null,
    private val tronWalletExternalAccountInfo: TronWalletExternalAccountInfo? = null,
    private val polygonWalletExternalAccountInfo: PolygonWalletExternalAccountInfo? = null,
    private val baseWalletExternalAccountInfo: BaseWalletExternalAccountInfo? = null,
    private val _json: JsonValue? = null,
) {

    fun usAccountExternalAccountInfo(): UsAccountExternalAccountInfo? = usAccountExternalAccountInfo

    fun clabeAccountExternalAccountInfo(): ClabeAccountExternalAccountInfo? =
        clabeAccountExternalAccountInfo

    fun pixAccountExternalAccountInfo(): PixAccountExternalAccountInfo? =
        pixAccountExternalAccountInfo

    fun ibanAccountExternalAccountInfo(): IbanAccountExternalAccountInfo? =
        ibanAccountExternalAccountInfo

    fun upiAccountExternalAccountInfo(): UpiAccountExternalAccountInfo? =
        upiAccountExternalAccountInfo

    fun ngnAccountExternalAccountInfo(): NgnAccountExternalAccountInfo? =
        ngnAccountExternalAccountInfo

    fun cadAccountExternalAccountInfo(): CadAccountExternalAccountInfo? =
        cadAccountExternalAccountInfo

    fun gbpAccountExternalAccountInfo(): GbpAccountExternalAccountInfo? =
        gbpAccountExternalAccountInfo

    fun phpAccountExternalAccountInfo(): PhpAccountExternalAccountInfo? =
        phpAccountExternalAccountInfo

    fun sgdAccountExternalAccountInfo(): SgdAccountExternalAccountInfo? =
        sgdAccountExternalAccountInfo

    fun sparkWalletExternalAccountInfo(): SparkWalletExternalAccountInfo? =
        sparkWalletExternalAccountInfo

    /**
     * Lightning payment destination. Exactly one of `invoice`, `bolt12`, or `lightningAddress` must
     * be provided.
     */
    fun lightningExternalAccountInfo(): LightningExternalAccountInfo? = lightningExternalAccountInfo

    fun solanaWalletExternalAccountInfo(): SolanaWalletExternalAccountInfo? =
        solanaWalletExternalAccountInfo

    fun tronWalletExternalAccountInfo(): TronWalletExternalAccountInfo? =
        tronWalletExternalAccountInfo

    fun polygonWalletExternalAccountInfo(): PolygonWalletExternalAccountInfo? =
        polygonWalletExternalAccountInfo

    fun baseWalletExternalAccountInfo(): BaseWalletExternalAccountInfo? =
        baseWalletExternalAccountInfo

    fun isUsAccountExternalAccountInfo(): Boolean = usAccountExternalAccountInfo != null

    fun isClabeAccountExternalAccountInfo(): Boolean = clabeAccountExternalAccountInfo != null

    fun isPixAccountExternalAccountInfo(): Boolean = pixAccountExternalAccountInfo != null

    fun isIbanAccountExternalAccountInfo(): Boolean = ibanAccountExternalAccountInfo != null

    fun isUpiAccountExternalAccountInfo(): Boolean = upiAccountExternalAccountInfo != null

    fun isNgnAccountExternalAccountInfo(): Boolean = ngnAccountExternalAccountInfo != null

    fun isCadAccountExternalAccountInfo(): Boolean = cadAccountExternalAccountInfo != null

    fun isGbpAccountExternalAccountInfo(): Boolean = gbpAccountExternalAccountInfo != null

    fun isPhpAccountExternalAccountInfo(): Boolean = phpAccountExternalAccountInfo != null

    fun isSgdAccountExternalAccountInfo(): Boolean = sgdAccountExternalAccountInfo != null

    fun isSparkWalletExternalAccountInfo(): Boolean = sparkWalletExternalAccountInfo != null

    fun isLightningExternalAccountInfo(): Boolean = lightningExternalAccountInfo != null

    fun isSolanaWalletExternalAccountInfo(): Boolean = solanaWalletExternalAccountInfo != null

    fun isTronWalletExternalAccountInfo(): Boolean = tronWalletExternalAccountInfo != null

    fun isPolygonWalletExternalAccountInfo(): Boolean = polygonWalletExternalAccountInfo != null

    fun isBaseWalletExternalAccountInfo(): Boolean = baseWalletExternalAccountInfo != null

    fun asUsAccountExternalAccountInfo(): UsAccountExternalAccountInfo =
        usAccountExternalAccountInfo.getOrThrow("usAccountExternalAccountInfo")

    fun asClabeAccountExternalAccountInfo(): ClabeAccountExternalAccountInfo =
        clabeAccountExternalAccountInfo.getOrThrow("clabeAccountExternalAccountInfo")

    fun asPixAccountExternalAccountInfo(): PixAccountExternalAccountInfo =
        pixAccountExternalAccountInfo.getOrThrow("pixAccountExternalAccountInfo")

    fun asIbanAccountExternalAccountInfo(): IbanAccountExternalAccountInfo =
        ibanAccountExternalAccountInfo.getOrThrow("ibanAccountExternalAccountInfo")

    fun asUpiAccountExternalAccountInfo(): UpiAccountExternalAccountInfo =
        upiAccountExternalAccountInfo.getOrThrow("upiAccountExternalAccountInfo")

    fun asNgnAccountExternalAccountInfo(): NgnAccountExternalAccountInfo =
        ngnAccountExternalAccountInfo.getOrThrow("ngnAccountExternalAccountInfo")

    fun asCadAccountExternalAccountInfo(): CadAccountExternalAccountInfo =
        cadAccountExternalAccountInfo.getOrThrow("cadAccountExternalAccountInfo")

    fun asGbpAccountExternalAccountInfo(): GbpAccountExternalAccountInfo =
        gbpAccountExternalAccountInfo.getOrThrow("gbpAccountExternalAccountInfo")

    fun asPhpAccountExternalAccountInfo(): PhpAccountExternalAccountInfo =
        phpAccountExternalAccountInfo.getOrThrow("phpAccountExternalAccountInfo")

    fun asSgdAccountExternalAccountInfo(): SgdAccountExternalAccountInfo =
        sgdAccountExternalAccountInfo.getOrThrow("sgdAccountExternalAccountInfo")

    fun asSparkWalletExternalAccountInfo(): SparkWalletExternalAccountInfo =
        sparkWalletExternalAccountInfo.getOrThrow("sparkWalletExternalAccountInfo")

    /**
     * Lightning payment destination. Exactly one of `invoice`, `bolt12`, or `lightningAddress` must
     * be provided.
     */
    fun asLightningExternalAccountInfo(): LightningExternalAccountInfo =
        lightningExternalAccountInfo.getOrThrow("lightningExternalAccountInfo")

    fun asSolanaWalletExternalAccountInfo(): SolanaWalletExternalAccountInfo =
        solanaWalletExternalAccountInfo.getOrThrow("solanaWalletExternalAccountInfo")

    fun asTronWalletExternalAccountInfo(): TronWalletExternalAccountInfo =
        tronWalletExternalAccountInfo.getOrThrow("tronWalletExternalAccountInfo")

    fun asPolygonWalletExternalAccountInfo(): PolygonWalletExternalAccountInfo =
        polygonWalletExternalAccountInfo.getOrThrow("polygonWalletExternalAccountInfo")

    fun asBaseWalletExternalAccountInfo(): BaseWalletExternalAccountInfo =
        baseWalletExternalAccountInfo.getOrThrow("baseWalletExternalAccountInfo")

    fun _json(): JsonValue? = _json

    fun <T> accept(visitor: Visitor<T>): T =
        when {
            usAccountExternalAccountInfo != null ->
                visitor.visitUsAccountExternalAccountInfo(usAccountExternalAccountInfo)
            clabeAccountExternalAccountInfo != null ->
                visitor.visitClabeAccountExternalAccountInfo(clabeAccountExternalAccountInfo)
            pixAccountExternalAccountInfo != null ->
                visitor.visitPixAccountExternalAccountInfo(pixAccountExternalAccountInfo)
            ibanAccountExternalAccountInfo != null ->
                visitor.visitIbanAccountExternalAccountInfo(ibanAccountExternalAccountInfo)
            upiAccountExternalAccountInfo != null ->
                visitor.visitUpiAccountExternalAccountInfo(upiAccountExternalAccountInfo)
            ngnAccountExternalAccountInfo != null ->
                visitor.visitNgnAccountExternalAccountInfo(ngnAccountExternalAccountInfo)
            cadAccountExternalAccountInfo != null ->
                visitor.visitCadAccountExternalAccountInfo(cadAccountExternalAccountInfo)
            gbpAccountExternalAccountInfo != null ->
                visitor.visitGbpAccountExternalAccountInfo(gbpAccountExternalAccountInfo)
            phpAccountExternalAccountInfo != null ->
                visitor.visitPhpAccountExternalAccountInfo(phpAccountExternalAccountInfo)
            sgdAccountExternalAccountInfo != null ->
                visitor.visitSgdAccountExternalAccountInfo(sgdAccountExternalAccountInfo)
            sparkWalletExternalAccountInfo != null ->
                visitor.visitSparkWalletExternalAccountInfo(sparkWalletExternalAccountInfo)
            lightningExternalAccountInfo != null ->
                visitor.visitLightningExternalAccountInfo(lightningExternalAccountInfo)
            solanaWalletExternalAccountInfo != null ->
                visitor.visitSolanaWalletExternalAccountInfo(solanaWalletExternalAccountInfo)
            tronWalletExternalAccountInfo != null ->
                visitor.visitTronWalletExternalAccountInfo(tronWalletExternalAccountInfo)
            polygonWalletExternalAccountInfo != null ->
                visitor.visitPolygonWalletExternalAccountInfo(polygonWalletExternalAccountInfo)
            baseWalletExternalAccountInfo != null ->
                visitor.visitBaseWalletExternalAccountInfo(baseWalletExternalAccountInfo)
            else -> visitor.unknown(_json)
        }

    private var validated: Boolean = false

    fun validate(): ExternalAccountInfoOneOf = apply {
        if (validated) {
            return@apply
        }

        accept(
            object : Visitor<Unit> {
                override fun visitUsAccountExternalAccountInfo(
                    usAccountExternalAccountInfo: UsAccountExternalAccountInfo
                ) {
                    usAccountExternalAccountInfo.validate()
                }

                override fun visitClabeAccountExternalAccountInfo(
                    clabeAccountExternalAccountInfo: ClabeAccountExternalAccountInfo
                ) {
                    clabeAccountExternalAccountInfo.validate()
                }

                override fun visitPixAccountExternalAccountInfo(
                    pixAccountExternalAccountInfo: PixAccountExternalAccountInfo
                ) {
                    pixAccountExternalAccountInfo.validate()
                }

                override fun visitIbanAccountExternalAccountInfo(
                    ibanAccountExternalAccountInfo: IbanAccountExternalAccountInfo
                ) {
                    ibanAccountExternalAccountInfo.validate()
                }

                override fun visitUpiAccountExternalAccountInfo(
                    upiAccountExternalAccountInfo: UpiAccountExternalAccountInfo
                ) {
                    upiAccountExternalAccountInfo.validate()
                }

                override fun visitNgnAccountExternalAccountInfo(
                    ngnAccountExternalAccountInfo: NgnAccountExternalAccountInfo
                ) {
                    ngnAccountExternalAccountInfo.validate()
                }

                override fun visitCadAccountExternalAccountInfo(
                    cadAccountExternalAccountInfo: CadAccountExternalAccountInfo
                ) {
                    cadAccountExternalAccountInfo.validate()
                }

                override fun visitGbpAccountExternalAccountInfo(
                    gbpAccountExternalAccountInfo: GbpAccountExternalAccountInfo
                ) {
                    gbpAccountExternalAccountInfo.validate()
                }

                override fun visitPhpAccountExternalAccountInfo(
                    phpAccountExternalAccountInfo: PhpAccountExternalAccountInfo
                ) {
                    phpAccountExternalAccountInfo.validate()
                }

                override fun visitSgdAccountExternalAccountInfo(
                    sgdAccountExternalAccountInfo: SgdAccountExternalAccountInfo
                ) {
                    sgdAccountExternalAccountInfo.validate()
                }

                override fun visitSparkWalletExternalAccountInfo(
                    sparkWalletExternalAccountInfo: SparkWalletExternalAccountInfo
                ) {
                    sparkWalletExternalAccountInfo.validate()
                }

                override fun visitLightningExternalAccountInfo(
                    lightningExternalAccountInfo: LightningExternalAccountInfo
                ) {
                    lightningExternalAccountInfo.validate()
                }

                override fun visitSolanaWalletExternalAccountInfo(
                    solanaWalletExternalAccountInfo: SolanaWalletExternalAccountInfo
                ) {
                    solanaWalletExternalAccountInfo.validate()
                }

                override fun visitTronWalletExternalAccountInfo(
                    tronWalletExternalAccountInfo: TronWalletExternalAccountInfo
                ) {
                    tronWalletExternalAccountInfo.validate()
                }

                override fun visitPolygonWalletExternalAccountInfo(
                    polygonWalletExternalAccountInfo: PolygonWalletExternalAccountInfo
                ) {
                    polygonWalletExternalAccountInfo.validate()
                }

                override fun visitBaseWalletExternalAccountInfo(
                    baseWalletExternalAccountInfo: BaseWalletExternalAccountInfo
                ) {
                    baseWalletExternalAccountInfo.validate()
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
                override fun visitUsAccountExternalAccountInfo(
                    usAccountExternalAccountInfo: UsAccountExternalAccountInfo
                ) = usAccountExternalAccountInfo.validity()

                override fun visitClabeAccountExternalAccountInfo(
                    clabeAccountExternalAccountInfo: ClabeAccountExternalAccountInfo
                ) = clabeAccountExternalAccountInfo.validity()

                override fun visitPixAccountExternalAccountInfo(
                    pixAccountExternalAccountInfo: PixAccountExternalAccountInfo
                ) = pixAccountExternalAccountInfo.validity()

                override fun visitIbanAccountExternalAccountInfo(
                    ibanAccountExternalAccountInfo: IbanAccountExternalAccountInfo
                ) = ibanAccountExternalAccountInfo.validity()

                override fun visitUpiAccountExternalAccountInfo(
                    upiAccountExternalAccountInfo: UpiAccountExternalAccountInfo
                ) = upiAccountExternalAccountInfo.validity()

                override fun visitNgnAccountExternalAccountInfo(
                    ngnAccountExternalAccountInfo: NgnAccountExternalAccountInfo
                ) = ngnAccountExternalAccountInfo.validity()

                override fun visitCadAccountExternalAccountInfo(
                    cadAccountExternalAccountInfo: CadAccountExternalAccountInfo
                ) = cadAccountExternalAccountInfo.validity()

                override fun visitGbpAccountExternalAccountInfo(
                    gbpAccountExternalAccountInfo: GbpAccountExternalAccountInfo
                ) = gbpAccountExternalAccountInfo.validity()

                override fun visitPhpAccountExternalAccountInfo(
                    phpAccountExternalAccountInfo: PhpAccountExternalAccountInfo
                ) = phpAccountExternalAccountInfo.validity()

                override fun visitSgdAccountExternalAccountInfo(
                    sgdAccountExternalAccountInfo: SgdAccountExternalAccountInfo
                ) = sgdAccountExternalAccountInfo.validity()

                override fun visitSparkWalletExternalAccountInfo(
                    sparkWalletExternalAccountInfo: SparkWalletExternalAccountInfo
                ) = sparkWalletExternalAccountInfo.validity()

                override fun visitLightningExternalAccountInfo(
                    lightningExternalAccountInfo: LightningExternalAccountInfo
                ) = lightningExternalAccountInfo.validity()

                override fun visitSolanaWalletExternalAccountInfo(
                    solanaWalletExternalAccountInfo: SolanaWalletExternalAccountInfo
                ) = solanaWalletExternalAccountInfo.validity()

                override fun visitTronWalletExternalAccountInfo(
                    tronWalletExternalAccountInfo: TronWalletExternalAccountInfo
                ) = tronWalletExternalAccountInfo.validity()

                override fun visitPolygonWalletExternalAccountInfo(
                    polygonWalletExternalAccountInfo: PolygonWalletExternalAccountInfo
                ) = polygonWalletExternalAccountInfo.validity()

                override fun visitBaseWalletExternalAccountInfo(
                    baseWalletExternalAccountInfo: BaseWalletExternalAccountInfo
                ) = baseWalletExternalAccountInfo.validity()

                override fun unknown(json: JsonValue?) = 0
            }
        )

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is ExternalAccountInfoOneOf &&
            usAccountExternalAccountInfo == other.usAccountExternalAccountInfo &&
            clabeAccountExternalAccountInfo == other.clabeAccountExternalAccountInfo &&
            pixAccountExternalAccountInfo == other.pixAccountExternalAccountInfo &&
            ibanAccountExternalAccountInfo == other.ibanAccountExternalAccountInfo &&
            upiAccountExternalAccountInfo == other.upiAccountExternalAccountInfo &&
            ngnAccountExternalAccountInfo == other.ngnAccountExternalAccountInfo &&
            cadAccountExternalAccountInfo == other.cadAccountExternalAccountInfo &&
            gbpAccountExternalAccountInfo == other.gbpAccountExternalAccountInfo &&
            phpAccountExternalAccountInfo == other.phpAccountExternalAccountInfo &&
            sgdAccountExternalAccountInfo == other.sgdAccountExternalAccountInfo &&
            sparkWalletExternalAccountInfo == other.sparkWalletExternalAccountInfo &&
            lightningExternalAccountInfo == other.lightningExternalAccountInfo &&
            solanaWalletExternalAccountInfo == other.solanaWalletExternalAccountInfo &&
            tronWalletExternalAccountInfo == other.tronWalletExternalAccountInfo &&
            polygonWalletExternalAccountInfo == other.polygonWalletExternalAccountInfo &&
            baseWalletExternalAccountInfo == other.baseWalletExternalAccountInfo
    }

    override fun hashCode(): Int =
        Objects.hash(
            usAccountExternalAccountInfo,
            clabeAccountExternalAccountInfo,
            pixAccountExternalAccountInfo,
            ibanAccountExternalAccountInfo,
            upiAccountExternalAccountInfo,
            ngnAccountExternalAccountInfo,
            cadAccountExternalAccountInfo,
            gbpAccountExternalAccountInfo,
            phpAccountExternalAccountInfo,
            sgdAccountExternalAccountInfo,
            sparkWalletExternalAccountInfo,
            lightningExternalAccountInfo,
            solanaWalletExternalAccountInfo,
            tronWalletExternalAccountInfo,
            polygonWalletExternalAccountInfo,
            baseWalletExternalAccountInfo,
        )

    override fun toString(): String =
        when {
            usAccountExternalAccountInfo != null ->
                "ExternalAccountInfoOneOf{usAccountExternalAccountInfo=$usAccountExternalAccountInfo}"
            clabeAccountExternalAccountInfo != null ->
                "ExternalAccountInfoOneOf{clabeAccountExternalAccountInfo=$clabeAccountExternalAccountInfo}"
            pixAccountExternalAccountInfo != null ->
                "ExternalAccountInfoOneOf{pixAccountExternalAccountInfo=$pixAccountExternalAccountInfo}"
            ibanAccountExternalAccountInfo != null ->
                "ExternalAccountInfoOneOf{ibanAccountExternalAccountInfo=$ibanAccountExternalAccountInfo}"
            upiAccountExternalAccountInfo != null ->
                "ExternalAccountInfoOneOf{upiAccountExternalAccountInfo=$upiAccountExternalAccountInfo}"
            ngnAccountExternalAccountInfo != null ->
                "ExternalAccountInfoOneOf{ngnAccountExternalAccountInfo=$ngnAccountExternalAccountInfo}"
            cadAccountExternalAccountInfo != null ->
                "ExternalAccountInfoOneOf{cadAccountExternalAccountInfo=$cadAccountExternalAccountInfo}"
            gbpAccountExternalAccountInfo != null ->
                "ExternalAccountInfoOneOf{gbpAccountExternalAccountInfo=$gbpAccountExternalAccountInfo}"
            phpAccountExternalAccountInfo != null ->
                "ExternalAccountInfoOneOf{phpAccountExternalAccountInfo=$phpAccountExternalAccountInfo}"
            sgdAccountExternalAccountInfo != null ->
                "ExternalAccountInfoOneOf{sgdAccountExternalAccountInfo=$sgdAccountExternalAccountInfo}"
            sparkWalletExternalAccountInfo != null ->
                "ExternalAccountInfoOneOf{sparkWalletExternalAccountInfo=$sparkWalletExternalAccountInfo}"
            lightningExternalAccountInfo != null ->
                "ExternalAccountInfoOneOf{lightningExternalAccountInfo=$lightningExternalAccountInfo}"
            solanaWalletExternalAccountInfo != null ->
                "ExternalAccountInfoOneOf{solanaWalletExternalAccountInfo=$solanaWalletExternalAccountInfo}"
            tronWalletExternalAccountInfo != null ->
                "ExternalAccountInfoOneOf{tronWalletExternalAccountInfo=$tronWalletExternalAccountInfo}"
            polygonWalletExternalAccountInfo != null ->
                "ExternalAccountInfoOneOf{polygonWalletExternalAccountInfo=$polygonWalletExternalAccountInfo}"
            baseWalletExternalAccountInfo != null ->
                "ExternalAccountInfoOneOf{baseWalletExternalAccountInfo=$baseWalletExternalAccountInfo}"
            _json != null -> "ExternalAccountInfoOneOf{_unknown=$_json}"
            else -> throw IllegalStateException("Invalid ExternalAccountInfoOneOf")
        }

    companion object {

        fun ofUsAccountExternalAccountInfo(
            usAccountExternalAccountInfo: UsAccountExternalAccountInfo
        ) = ExternalAccountInfoOneOf(usAccountExternalAccountInfo = usAccountExternalAccountInfo)

        fun ofClabeAccountExternalAccountInfo(
            clabeAccountExternalAccountInfo: ClabeAccountExternalAccountInfo
        ) =
            ExternalAccountInfoOneOf(
                clabeAccountExternalAccountInfo = clabeAccountExternalAccountInfo
            )

        fun ofPixAccountExternalAccountInfo(
            pixAccountExternalAccountInfo: PixAccountExternalAccountInfo
        ) = ExternalAccountInfoOneOf(pixAccountExternalAccountInfo = pixAccountExternalAccountInfo)

        fun ofIbanAccountExternalAccountInfo(
            ibanAccountExternalAccountInfo: IbanAccountExternalAccountInfo
        ) =
            ExternalAccountInfoOneOf(
                ibanAccountExternalAccountInfo = ibanAccountExternalAccountInfo
            )

        fun ofUpiAccountExternalAccountInfo(
            upiAccountExternalAccountInfo: UpiAccountExternalAccountInfo
        ) = ExternalAccountInfoOneOf(upiAccountExternalAccountInfo = upiAccountExternalAccountInfo)

        fun ofNgnAccountExternalAccountInfo(
            ngnAccountExternalAccountInfo: NgnAccountExternalAccountInfo
        ) = ExternalAccountInfoOneOf(ngnAccountExternalAccountInfo = ngnAccountExternalAccountInfo)

        fun ofCadAccountExternalAccountInfo(
            cadAccountExternalAccountInfo: CadAccountExternalAccountInfo
        ) = ExternalAccountInfoOneOf(cadAccountExternalAccountInfo = cadAccountExternalAccountInfo)

        fun ofGbpAccountExternalAccountInfo(
            gbpAccountExternalAccountInfo: GbpAccountExternalAccountInfo
        ) = ExternalAccountInfoOneOf(gbpAccountExternalAccountInfo = gbpAccountExternalAccountInfo)

        fun ofPhpAccountExternalAccountInfo(
            phpAccountExternalAccountInfo: PhpAccountExternalAccountInfo
        ) = ExternalAccountInfoOneOf(phpAccountExternalAccountInfo = phpAccountExternalAccountInfo)

        fun ofSgdAccountExternalAccountInfo(
            sgdAccountExternalAccountInfo: SgdAccountExternalAccountInfo
        ) = ExternalAccountInfoOneOf(sgdAccountExternalAccountInfo = sgdAccountExternalAccountInfo)

        fun ofSparkWalletExternalAccountInfo(
            sparkWalletExternalAccountInfo: SparkWalletExternalAccountInfo
        ) =
            ExternalAccountInfoOneOf(
                sparkWalletExternalAccountInfo = sparkWalletExternalAccountInfo
            )

        /**
         * Lightning payment destination. Exactly one of `invoice`, `bolt12`, or `lightningAddress`
         * must be provided.
         */
        fun ofLightningExternalAccountInfo(
            lightningExternalAccountInfo: LightningExternalAccountInfo
        ) = ExternalAccountInfoOneOf(lightningExternalAccountInfo = lightningExternalAccountInfo)

        fun ofSolanaWalletExternalAccountInfo(
            solanaWalletExternalAccountInfo: SolanaWalletExternalAccountInfo
        ) =
            ExternalAccountInfoOneOf(
                solanaWalletExternalAccountInfo = solanaWalletExternalAccountInfo
            )

        fun ofTronWalletExternalAccountInfo(
            tronWalletExternalAccountInfo: TronWalletExternalAccountInfo
        ) = ExternalAccountInfoOneOf(tronWalletExternalAccountInfo = tronWalletExternalAccountInfo)

        fun ofPolygonWalletExternalAccountInfo(
            polygonWalletExternalAccountInfo: PolygonWalletExternalAccountInfo
        ) =
            ExternalAccountInfoOneOf(
                polygonWalletExternalAccountInfo = polygonWalletExternalAccountInfo
            )

        fun ofBaseWalletExternalAccountInfo(
            baseWalletExternalAccountInfo: BaseWalletExternalAccountInfo
        ) = ExternalAccountInfoOneOf(baseWalletExternalAccountInfo = baseWalletExternalAccountInfo)
    }

    /**
     * An interface that defines how to map each variant of [ExternalAccountInfoOneOf] to a value of
     * type [T].
     */
    interface Visitor<out T> {

        fun visitUsAccountExternalAccountInfo(
            usAccountExternalAccountInfo: UsAccountExternalAccountInfo
        ): T

        fun visitClabeAccountExternalAccountInfo(
            clabeAccountExternalAccountInfo: ClabeAccountExternalAccountInfo
        ): T

        fun visitPixAccountExternalAccountInfo(
            pixAccountExternalAccountInfo: PixAccountExternalAccountInfo
        ): T

        fun visitIbanAccountExternalAccountInfo(
            ibanAccountExternalAccountInfo: IbanAccountExternalAccountInfo
        ): T

        fun visitUpiAccountExternalAccountInfo(
            upiAccountExternalAccountInfo: UpiAccountExternalAccountInfo
        ): T

        fun visitNgnAccountExternalAccountInfo(
            ngnAccountExternalAccountInfo: NgnAccountExternalAccountInfo
        ): T

        fun visitCadAccountExternalAccountInfo(
            cadAccountExternalAccountInfo: CadAccountExternalAccountInfo
        ): T

        fun visitGbpAccountExternalAccountInfo(
            gbpAccountExternalAccountInfo: GbpAccountExternalAccountInfo
        ): T

        fun visitPhpAccountExternalAccountInfo(
            phpAccountExternalAccountInfo: PhpAccountExternalAccountInfo
        ): T

        fun visitSgdAccountExternalAccountInfo(
            sgdAccountExternalAccountInfo: SgdAccountExternalAccountInfo
        ): T

        fun visitSparkWalletExternalAccountInfo(
            sparkWalletExternalAccountInfo: SparkWalletExternalAccountInfo
        ): T

        /**
         * Lightning payment destination. Exactly one of `invoice`, `bolt12`, or `lightningAddress`
         * must be provided.
         */
        fun visitLightningExternalAccountInfo(
            lightningExternalAccountInfo: LightningExternalAccountInfo
        ): T

        fun visitSolanaWalletExternalAccountInfo(
            solanaWalletExternalAccountInfo: SolanaWalletExternalAccountInfo
        ): T

        fun visitTronWalletExternalAccountInfo(
            tronWalletExternalAccountInfo: TronWalletExternalAccountInfo
        ): T

        fun visitPolygonWalletExternalAccountInfo(
            polygonWalletExternalAccountInfo: PolygonWalletExternalAccountInfo
        ): T

        fun visitBaseWalletExternalAccountInfo(
            baseWalletExternalAccountInfo: BaseWalletExternalAccountInfo
        ): T

        /**
         * Maps an unknown variant of [ExternalAccountInfoOneOf] to a value of type [T].
         *
         * An instance of [ExternalAccountInfoOneOf] can contain an unknown variant if it was
         * deserialized from data that doesn't match any known variant. For example, if the SDK is
         * on an older version than the API, then the API may respond with new variants that the SDK
         * is unaware of.
         *
         * @throws GridInvalidDataException in the default implementation.
         */
        fun unknown(json: JsonValue?): T {
            throw GridInvalidDataException("Unknown ExternalAccountInfoOneOf: $json")
        }
    }

    internal class Deserializer :
        BaseDeserializer<ExternalAccountInfoOneOf>(ExternalAccountInfoOneOf::class) {

        override fun ObjectCodec.deserialize(node: JsonNode): ExternalAccountInfoOneOf {
            val json = JsonValue.fromJsonNode(node)

            val bestMatches =
                sequenceOf(
                        tryDeserialize(node, jacksonTypeRef<UsAccountExternalAccountInfo>())?.let {
                            ExternalAccountInfoOneOf(
                                usAccountExternalAccountInfo = it,
                                _json = json,
                            )
                        },
                        tryDeserialize(node, jacksonTypeRef<ClabeAccountExternalAccountInfo>())
                            ?.let {
                                ExternalAccountInfoOneOf(
                                    clabeAccountExternalAccountInfo = it,
                                    _json = json,
                                )
                            },
                        tryDeserialize(node, jacksonTypeRef<PixAccountExternalAccountInfo>())?.let {
                            ExternalAccountInfoOneOf(
                                pixAccountExternalAccountInfo = it,
                                _json = json,
                            )
                        },
                        tryDeserialize(node, jacksonTypeRef<IbanAccountExternalAccountInfo>())
                            ?.let {
                                ExternalAccountInfoOneOf(
                                    ibanAccountExternalAccountInfo = it,
                                    _json = json,
                                )
                            },
                        tryDeserialize(node, jacksonTypeRef<UpiAccountExternalAccountInfo>())?.let {
                            ExternalAccountInfoOneOf(
                                upiAccountExternalAccountInfo = it,
                                _json = json,
                            )
                        },
                        tryDeserialize(node, jacksonTypeRef<NgnAccountExternalAccountInfo>())?.let {
                            ExternalAccountInfoOneOf(
                                ngnAccountExternalAccountInfo = it,
                                _json = json,
                            )
                        },
                        tryDeserialize(node, jacksonTypeRef<CadAccountExternalAccountInfo>())?.let {
                            ExternalAccountInfoOneOf(
                                cadAccountExternalAccountInfo = it,
                                _json = json,
                            )
                        },
                        tryDeserialize(node, jacksonTypeRef<GbpAccountExternalAccountInfo>())?.let {
                            ExternalAccountInfoOneOf(
                                gbpAccountExternalAccountInfo = it,
                                _json = json,
                            )
                        },
                        tryDeserialize(node, jacksonTypeRef<PhpAccountExternalAccountInfo>())?.let {
                            ExternalAccountInfoOneOf(
                                phpAccountExternalAccountInfo = it,
                                _json = json,
                            )
                        },
                        tryDeserialize(node, jacksonTypeRef<SgdAccountExternalAccountInfo>())?.let {
                            ExternalAccountInfoOneOf(
                                sgdAccountExternalAccountInfo = it,
                                _json = json,
                            )
                        },
                        tryDeserialize(node, jacksonTypeRef<SparkWalletExternalAccountInfo>())
                            ?.let {
                                ExternalAccountInfoOneOf(
                                    sparkWalletExternalAccountInfo = it,
                                    _json = json,
                                )
                            },
                        tryDeserialize(node, jacksonTypeRef<LightningExternalAccountInfo>())?.let {
                            ExternalAccountInfoOneOf(
                                lightningExternalAccountInfo = it,
                                _json = json,
                            )
                        },
                        tryDeserialize(node, jacksonTypeRef<SolanaWalletExternalAccountInfo>())
                            ?.let {
                                ExternalAccountInfoOneOf(
                                    solanaWalletExternalAccountInfo = it,
                                    _json = json,
                                )
                            },
                        tryDeserialize(node, jacksonTypeRef<TronWalletExternalAccountInfo>())?.let {
                            ExternalAccountInfoOneOf(
                                tronWalletExternalAccountInfo = it,
                                _json = json,
                            )
                        },
                        tryDeserialize(node, jacksonTypeRef<PolygonWalletExternalAccountInfo>())
                            ?.let {
                                ExternalAccountInfoOneOf(
                                    polygonWalletExternalAccountInfo = it,
                                    _json = json,
                                )
                            },
                        tryDeserialize(node, jacksonTypeRef<BaseWalletExternalAccountInfo>())?.let {
                            ExternalAccountInfoOneOf(
                                baseWalletExternalAccountInfo = it,
                                _json = json,
                            )
                        },
                    )
                    .filterNotNull()
                    .allMaxBy { it.validity() }
                    .toList()
            return when (bestMatches.size) {
                // This can happen if what we're deserializing is completely incompatible with all
                // the possible variants (e.g. deserializing from boolean).
                0 -> ExternalAccountInfoOneOf(_json = json)
                1 -> bestMatches.single()
                // If there's more than one match with the highest validity, then use the first
                // completely valid match, or simply the first match if none are completely valid.
                else -> bestMatches.firstOrNull { it.isValid() } ?: bestMatches.first()
            }
        }
    }

    internal class Serializer :
        BaseSerializer<ExternalAccountInfoOneOf>(ExternalAccountInfoOneOf::class) {

        override fun serialize(
            value: ExternalAccountInfoOneOf,
            generator: JsonGenerator,
            provider: SerializerProvider,
        ) {
            when {
                value.usAccountExternalAccountInfo != null ->
                    generator.writeObject(value.usAccountExternalAccountInfo)
                value.clabeAccountExternalAccountInfo != null ->
                    generator.writeObject(value.clabeAccountExternalAccountInfo)
                value.pixAccountExternalAccountInfo != null ->
                    generator.writeObject(value.pixAccountExternalAccountInfo)
                value.ibanAccountExternalAccountInfo != null ->
                    generator.writeObject(value.ibanAccountExternalAccountInfo)
                value.upiAccountExternalAccountInfo != null ->
                    generator.writeObject(value.upiAccountExternalAccountInfo)
                value.ngnAccountExternalAccountInfo != null ->
                    generator.writeObject(value.ngnAccountExternalAccountInfo)
                value.cadAccountExternalAccountInfo != null ->
                    generator.writeObject(value.cadAccountExternalAccountInfo)
                value.gbpAccountExternalAccountInfo != null ->
                    generator.writeObject(value.gbpAccountExternalAccountInfo)
                value.phpAccountExternalAccountInfo != null ->
                    generator.writeObject(value.phpAccountExternalAccountInfo)
                value.sgdAccountExternalAccountInfo != null ->
                    generator.writeObject(value.sgdAccountExternalAccountInfo)
                value.sparkWalletExternalAccountInfo != null ->
                    generator.writeObject(value.sparkWalletExternalAccountInfo)
                value.lightningExternalAccountInfo != null ->
                    generator.writeObject(value.lightningExternalAccountInfo)
                value.solanaWalletExternalAccountInfo != null ->
                    generator.writeObject(value.solanaWalletExternalAccountInfo)
                value.tronWalletExternalAccountInfo != null ->
                    generator.writeObject(value.tronWalletExternalAccountInfo)
                value.polygonWalletExternalAccountInfo != null ->
                    generator.writeObject(value.polygonWalletExternalAccountInfo)
                value.baseWalletExternalAccountInfo != null ->
                    generator.writeObject(value.baseWalletExternalAccountInfo)
                value._json != null -> generator.writeObject(value._json)
                else -> throw IllegalStateException("Invalid ExternalAccountInfoOneOf")
            }
        }
    }

    class UsAccountExternalAccountInfo
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val accountType: JsonField<BaseExternalAccountInfo.AccountType>,
        private val accountCategory: JsonField<UsAccountInfo.AccountCategory>,
        private val accountNumber: JsonField<String>,
        private val routingNumber: JsonField<String>,
        private val bankName: JsonField<String>,
        private val beneficiary: JsonField<BeneficiaryOneOf>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("accountType")
            @ExcludeMissing
            accountType: JsonField<BaseExternalAccountInfo.AccountType> = JsonMissing.of(),
            @JsonProperty("accountCategory")
            @ExcludeMissing
            accountCategory: JsonField<UsAccountInfo.AccountCategory> = JsonMissing.of(),
            @JsonProperty("accountNumber")
            @ExcludeMissing
            accountNumber: JsonField<String> = JsonMissing.of(),
            @JsonProperty("routingNumber")
            @ExcludeMissing
            routingNumber: JsonField<String> = JsonMissing.of(),
            @JsonProperty("bankName")
            @ExcludeMissing
            bankName: JsonField<String> = JsonMissing.of(),
            @JsonProperty("beneficiary")
            @ExcludeMissing
            beneficiary: JsonField<BeneficiaryOneOf> = JsonMissing.of(),
        ) : this(
            accountType,
            accountCategory,
            accountNumber,
            routingNumber,
            bankName,
            beneficiary,
            mutableMapOf(),
        )

        fun toBaseExternalAccountInfo(): BaseExternalAccountInfo =
            BaseExternalAccountInfo.builder().accountType(accountType).build()

        fun toUsAccountInfo(): UsAccountInfo =
            UsAccountInfo.builder()
                .accountCategory(accountCategory)
                .accountNumber(accountNumber)
                .accountType(accountType)
                .routingNumber(routingNumber)
                .bankName(bankName)
                .build()

        /**
         * Type of external account or wallet
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun accountType(): BaseExternalAccountInfo.AccountType =
            accountType.getRequired("accountType")

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
        fun beneficiary(): BeneficiaryOneOf = beneficiary.getRequired("beneficiary")

        /**
         * Returns the raw JSON value of [accountType].
         *
         * Unlike [accountType], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("accountType")
        @ExcludeMissing
        fun _accountType(): JsonField<BaseExternalAccountInfo.AccountType> = accountType

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
        fun _beneficiary(): JsonField<BeneficiaryOneOf> = beneficiary

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
             * [UsAccountExternalAccountInfo].
             *
             * The following fields are required:
             * ```kotlin
             * .accountType()
             * .accountCategory()
             * .accountNumber()
             * .routingNumber()
             * .beneficiary()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [UsAccountExternalAccountInfo]. */
        class Builder internal constructor() {

            private var accountType: JsonField<BaseExternalAccountInfo.AccountType>? = null
            private var accountCategory: JsonField<UsAccountInfo.AccountCategory>? = null
            private var accountNumber: JsonField<String>? = null
            private var routingNumber: JsonField<String>? = null
            private var bankName: JsonField<String> = JsonMissing.of()
            private var beneficiary: JsonField<BeneficiaryOneOf>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(usAccountExternalAccountInfo: UsAccountExternalAccountInfo) = apply {
                accountType = usAccountExternalAccountInfo.accountType
                accountCategory = usAccountExternalAccountInfo.accountCategory
                accountNumber = usAccountExternalAccountInfo.accountNumber
                routingNumber = usAccountExternalAccountInfo.routingNumber
                bankName = usAccountExternalAccountInfo.bankName
                beneficiary = usAccountExternalAccountInfo.beneficiary
                additionalProperties =
                    usAccountExternalAccountInfo.additionalProperties.toMutableMap()
            }

            /** Type of external account or wallet */
            fun accountType(accountType: BaseExternalAccountInfo.AccountType) =
                accountType(JsonField.of(accountType))

            /**
             * Sets [Builder.accountType] to an arbitrary JSON value.
             *
             * You should usually call [Builder.accountType] with a well-typed
             * [BaseExternalAccountInfo.AccountType] value instead. This method is primarily for
             * setting the field to an undocumented or not yet supported value.
             */
            fun accountType(accountType: JsonField<BaseExternalAccountInfo.AccountType>) = apply {
                this.accountType = accountType
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

            fun beneficiary(beneficiary: BeneficiaryOneOf) = beneficiary(JsonField.of(beneficiary))

            /**
             * Sets [Builder.beneficiary] to an arbitrary JSON value.
             *
             * You should usually call [Builder.beneficiary] with a well-typed [BeneficiaryOneOf]
             * value instead. This method is primarily for setting the field to an undocumented or
             * not yet supported value.
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
             * Returns an immutable instance of [UsAccountExternalAccountInfo].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             *
             * The following fields are required:
             * ```kotlin
             * .accountType()
             * .accountCategory()
             * .accountNumber()
             * .routingNumber()
             * .beneficiary()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): UsAccountExternalAccountInfo =
                UsAccountExternalAccountInfo(
                    checkRequired("accountType", accountType),
                    checkRequired("accountCategory", accountCategory),
                    checkRequired("accountNumber", accountNumber),
                    checkRequired("routingNumber", routingNumber),
                    bankName,
                    checkRequired("beneficiary", beneficiary),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): UsAccountExternalAccountInfo = apply {
            if (validated) {
                return@apply
            }

            accountType().validate()
            accountCategory().validate()
            accountNumber()
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
            (accountType.asKnown()?.validity() ?: 0) +
                (accountCategory.asKnown()?.validity() ?: 0) +
                (if (accountNumber.asKnown() == null) 0 else 1) +
                (if (routingNumber.asKnown() == null) 0 else 1) +
                (if (bankName.asKnown() == null) 0 else 1) +
                (beneficiary.asKnown()?.validity() ?: 0)

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is UsAccountExternalAccountInfo &&
                accountType == other.accountType &&
                accountCategory == other.accountCategory &&
                accountNumber == other.accountNumber &&
                routingNumber == other.routingNumber &&
                bankName == other.bankName &&
                beneficiary == other.beneficiary &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(
                accountType,
                accountCategory,
                accountNumber,
                routingNumber,
                bankName,
                beneficiary,
                additionalProperties,
            )
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "UsAccountExternalAccountInfo{accountType=$accountType, accountCategory=$accountCategory, accountNumber=$accountNumber, routingNumber=$routingNumber, bankName=$bankName, beneficiary=$beneficiary, additionalProperties=$additionalProperties}"
    }

    class ClabeAccountExternalAccountInfo
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val accountType: JsonField<BaseExternalAccountInfo.AccountType>,
        private val clabeNumber: JsonField<String>,
        private val beneficiary: JsonField<BeneficiaryOneOf>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("accountType")
            @ExcludeMissing
            accountType: JsonField<BaseExternalAccountInfo.AccountType> = JsonMissing.of(),
            @JsonProperty("clabeNumber")
            @ExcludeMissing
            clabeNumber: JsonField<String> = JsonMissing.of(),
            @JsonProperty("beneficiary")
            @ExcludeMissing
            beneficiary: JsonField<BeneficiaryOneOf> = JsonMissing.of(),
        ) : this(accountType, clabeNumber, beneficiary, mutableMapOf())

        fun toBaseExternalAccountInfo(): BaseExternalAccountInfo =
            BaseExternalAccountInfo.builder().accountType(accountType).build()

        fun toClabeAccountInfo(): ClabeAccountInfo =
            ClabeAccountInfo.builder().accountType(accountType).clabeNumber(clabeNumber).build()

        /**
         * Type of external account or wallet
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun accountType(): BaseExternalAccountInfo.AccountType =
            accountType.getRequired("accountType")

        /**
         * 18-digit CLABE number (Mexican banking standard)
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun clabeNumber(): String = clabeNumber.getRequired("clabeNumber")

        /**
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun beneficiary(): BeneficiaryOneOf = beneficiary.getRequired("beneficiary")

        /**
         * Returns the raw JSON value of [accountType].
         *
         * Unlike [accountType], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("accountType")
        @ExcludeMissing
        fun _accountType(): JsonField<BaseExternalAccountInfo.AccountType> = accountType

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
        fun _beneficiary(): JsonField<BeneficiaryOneOf> = beneficiary

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
             * [ClabeAccountExternalAccountInfo].
             *
             * The following fields are required:
             * ```kotlin
             * .accountType()
             * .clabeNumber()
             * .beneficiary()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [ClabeAccountExternalAccountInfo]. */
        class Builder internal constructor() {

            private var accountType: JsonField<BaseExternalAccountInfo.AccountType>? = null
            private var clabeNumber: JsonField<String>? = null
            private var beneficiary: JsonField<BeneficiaryOneOf>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(clabeAccountExternalAccountInfo: ClabeAccountExternalAccountInfo) =
                apply {
                    accountType = clabeAccountExternalAccountInfo.accountType
                    clabeNumber = clabeAccountExternalAccountInfo.clabeNumber
                    beneficiary = clabeAccountExternalAccountInfo.beneficiary
                    additionalProperties =
                        clabeAccountExternalAccountInfo.additionalProperties.toMutableMap()
                }

            /** Type of external account or wallet */
            fun accountType(accountType: BaseExternalAccountInfo.AccountType) =
                accountType(JsonField.of(accountType))

            /**
             * Sets [Builder.accountType] to an arbitrary JSON value.
             *
             * You should usually call [Builder.accountType] with a well-typed
             * [BaseExternalAccountInfo.AccountType] value instead. This method is primarily for
             * setting the field to an undocumented or not yet supported value.
             */
            fun accountType(accountType: JsonField<BaseExternalAccountInfo.AccountType>) = apply {
                this.accountType = accountType
            }

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

            fun beneficiary(beneficiary: BeneficiaryOneOf) = beneficiary(JsonField.of(beneficiary))

            /**
             * Sets [Builder.beneficiary] to an arbitrary JSON value.
             *
             * You should usually call [Builder.beneficiary] with a well-typed [BeneficiaryOneOf]
             * value instead. This method is primarily for setting the field to an undocumented or
             * not yet supported value.
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
             * Returns an immutable instance of [ClabeAccountExternalAccountInfo].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             *
             * The following fields are required:
             * ```kotlin
             * .accountType()
             * .clabeNumber()
             * .beneficiary()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): ClabeAccountExternalAccountInfo =
                ClabeAccountExternalAccountInfo(
                    checkRequired("accountType", accountType),
                    checkRequired("clabeNumber", clabeNumber),
                    checkRequired("beneficiary", beneficiary),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): ClabeAccountExternalAccountInfo = apply {
            if (validated) {
                return@apply
            }

            accountType().validate()
            clabeNumber()
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
            (accountType.asKnown()?.validity() ?: 0) +
                (if (clabeNumber.asKnown() == null) 0 else 1) +
                (beneficiary.asKnown()?.validity() ?: 0)

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is ClabeAccountExternalAccountInfo &&
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
            "ClabeAccountExternalAccountInfo{accountType=$accountType, clabeNumber=$clabeNumber, beneficiary=$beneficiary, additionalProperties=$additionalProperties}"
    }

    class PixAccountExternalAccountInfo
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val accountType: JsonField<BaseExternalAccountInfo.AccountType>,
        private val pixKey: JsonField<String>,
        private val pixKeyType: JsonField<PixAccountInfo.PixKeyType>,
        private val taxId: JsonField<String>,
        private val beneficiary: JsonField<BeneficiaryOneOf>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("accountType")
            @ExcludeMissing
            accountType: JsonField<BaseExternalAccountInfo.AccountType> = JsonMissing.of(),
            @JsonProperty("pixKey") @ExcludeMissing pixKey: JsonField<String> = JsonMissing.of(),
            @JsonProperty("pixKeyType")
            @ExcludeMissing
            pixKeyType: JsonField<PixAccountInfo.PixKeyType> = JsonMissing.of(),
            @JsonProperty("taxId") @ExcludeMissing taxId: JsonField<String> = JsonMissing.of(),
            @JsonProperty("beneficiary")
            @ExcludeMissing
            beneficiary: JsonField<BeneficiaryOneOf> = JsonMissing.of(),
        ) : this(accountType, pixKey, pixKeyType, taxId, beneficiary, mutableMapOf())

        fun toBaseExternalAccountInfo(): BaseExternalAccountInfo =
            BaseExternalAccountInfo.builder().accountType(accountType).build()

        fun toPixAccountInfo(): PixAccountInfo =
            PixAccountInfo.builder()
                .accountType(accountType)
                .pixKey(pixKey)
                .pixKeyType(pixKeyType)
                .taxId(taxId)
                .build()

        /**
         * Type of external account or wallet
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun accountType(): BaseExternalAccountInfo.AccountType =
            accountType.getRequired("accountType")

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
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun beneficiary(): BeneficiaryOneOf = beneficiary.getRequired("beneficiary")

        /**
         * Returns the raw JSON value of [accountType].
         *
         * Unlike [accountType], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("accountType")
        @ExcludeMissing
        fun _accountType(): JsonField<BaseExternalAccountInfo.AccountType> = accountType

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
        fun _beneficiary(): JsonField<BeneficiaryOneOf> = beneficiary

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
             * [PixAccountExternalAccountInfo].
             *
             * The following fields are required:
             * ```kotlin
             * .accountType()
             * .pixKey()
             * .pixKeyType()
             * .taxId()
             * .beneficiary()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [PixAccountExternalAccountInfo]. */
        class Builder internal constructor() {

            private var accountType: JsonField<BaseExternalAccountInfo.AccountType>? = null
            private var pixKey: JsonField<String>? = null
            private var pixKeyType: JsonField<PixAccountInfo.PixKeyType>? = null
            private var taxId: JsonField<String>? = null
            private var beneficiary: JsonField<BeneficiaryOneOf>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(pixAccountExternalAccountInfo: PixAccountExternalAccountInfo) =
                apply {
                    accountType = pixAccountExternalAccountInfo.accountType
                    pixKey = pixAccountExternalAccountInfo.pixKey
                    pixKeyType = pixAccountExternalAccountInfo.pixKeyType
                    taxId = pixAccountExternalAccountInfo.taxId
                    beneficiary = pixAccountExternalAccountInfo.beneficiary
                    additionalProperties =
                        pixAccountExternalAccountInfo.additionalProperties.toMutableMap()
                }

            /** Type of external account or wallet */
            fun accountType(accountType: BaseExternalAccountInfo.AccountType) =
                accountType(JsonField.of(accountType))

            /**
             * Sets [Builder.accountType] to an arbitrary JSON value.
             *
             * You should usually call [Builder.accountType] with a well-typed
             * [BaseExternalAccountInfo.AccountType] value instead. This method is primarily for
             * setting the field to an undocumented or not yet supported value.
             */
            fun accountType(accountType: JsonField<BaseExternalAccountInfo.AccountType>) = apply {
                this.accountType = accountType
            }

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

            fun beneficiary(beneficiary: BeneficiaryOneOf) = beneficiary(JsonField.of(beneficiary))

            /**
             * Sets [Builder.beneficiary] to an arbitrary JSON value.
             *
             * You should usually call [Builder.beneficiary] with a well-typed [BeneficiaryOneOf]
             * value instead. This method is primarily for setting the field to an undocumented or
             * not yet supported value.
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
             * Returns an immutable instance of [PixAccountExternalAccountInfo].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             *
             * The following fields are required:
             * ```kotlin
             * .accountType()
             * .pixKey()
             * .pixKeyType()
             * .taxId()
             * .beneficiary()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): PixAccountExternalAccountInfo =
                PixAccountExternalAccountInfo(
                    checkRequired("accountType", accountType),
                    checkRequired("pixKey", pixKey),
                    checkRequired("pixKeyType", pixKeyType),
                    checkRequired("taxId", taxId),
                    checkRequired("beneficiary", beneficiary),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): PixAccountExternalAccountInfo = apply {
            if (validated) {
                return@apply
            }

            accountType().validate()
            pixKey()
            pixKeyType().validate()
            taxId()
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
            (accountType.asKnown()?.validity() ?: 0) +
                (if (pixKey.asKnown() == null) 0 else 1) +
                (pixKeyType.asKnown()?.validity() ?: 0) +
                (if (taxId.asKnown() == null) 0 else 1) +
                (beneficiary.asKnown()?.validity() ?: 0)

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is PixAccountExternalAccountInfo &&
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
            "PixAccountExternalAccountInfo{accountType=$accountType, pixKey=$pixKey, pixKeyType=$pixKeyType, taxId=$taxId, beneficiary=$beneficiary, additionalProperties=$additionalProperties}"
    }

    class IbanAccountExternalAccountInfo
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val accountType: JsonField<BaseExternalAccountInfo.AccountType>,
        private val iban: JsonField<String>,
        private val swiftBic: JsonField<String>,
        private val beneficiary: JsonField<BeneficiaryOneOf>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("accountType")
            @ExcludeMissing
            accountType: JsonField<BaseExternalAccountInfo.AccountType> = JsonMissing.of(),
            @JsonProperty("iban") @ExcludeMissing iban: JsonField<String> = JsonMissing.of(),
            @JsonProperty("swiftBic")
            @ExcludeMissing
            swiftBic: JsonField<String> = JsonMissing.of(),
            @JsonProperty("beneficiary")
            @ExcludeMissing
            beneficiary: JsonField<BeneficiaryOneOf> = JsonMissing.of(),
        ) : this(accountType, iban, swiftBic, beneficiary, mutableMapOf())

        fun toBaseExternalAccountInfo(): BaseExternalAccountInfo =
            BaseExternalAccountInfo.builder().accountType(accountType).build()

        fun toIbanAccountInfo(): IbanAccountInfo =
            IbanAccountInfo.builder().accountType(accountType).iban(iban).swiftBic(swiftBic).build()

        /**
         * Type of external account or wallet
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun accountType(): BaseExternalAccountInfo.AccountType =
            accountType.getRequired("accountType")

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
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun beneficiary(): BeneficiaryOneOf = beneficiary.getRequired("beneficiary")

        /**
         * Returns the raw JSON value of [accountType].
         *
         * Unlike [accountType], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("accountType")
        @ExcludeMissing
        fun _accountType(): JsonField<BaseExternalAccountInfo.AccountType> = accountType

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
        fun _beneficiary(): JsonField<BeneficiaryOneOf> = beneficiary

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
             * [IbanAccountExternalAccountInfo].
             *
             * The following fields are required:
             * ```kotlin
             * .accountType()
             * .iban()
             * .swiftBic()
             * .beneficiary()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [IbanAccountExternalAccountInfo]. */
        class Builder internal constructor() {

            private var accountType: JsonField<BaseExternalAccountInfo.AccountType>? = null
            private var iban: JsonField<String>? = null
            private var swiftBic: JsonField<String>? = null
            private var beneficiary: JsonField<BeneficiaryOneOf>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(ibanAccountExternalAccountInfo: IbanAccountExternalAccountInfo) =
                apply {
                    accountType = ibanAccountExternalAccountInfo.accountType
                    iban = ibanAccountExternalAccountInfo.iban
                    swiftBic = ibanAccountExternalAccountInfo.swiftBic
                    beneficiary = ibanAccountExternalAccountInfo.beneficiary
                    additionalProperties =
                        ibanAccountExternalAccountInfo.additionalProperties.toMutableMap()
                }

            /** Type of external account or wallet */
            fun accountType(accountType: BaseExternalAccountInfo.AccountType) =
                accountType(JsonField.of(accountType))

            /**
             * Sets [Builder.accountType] to an arbitrary JSON value.
             *
             * You should usually call [Builder.accountType] with a well-typed
             * [BaseExternalAccountInfo.AccountType] value instead. This method is primarily for
             * setting the field to an undocumented or not yet supported value.
             */
            fun accountType(accountType: JsonField<BaseExternalAccountInfo.AccountType>) = apply {
                this.accountType = accountType
            }

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

            fun beneficiary(beneficiary: BeneficiaryOneOf) = beneficiary(JsonField.of(beneficiary))

            /**
             * Sets [Builder.beneficiary] to an arbitrary JSON value.
             *
             * You should usually call [Builder.beneficiary] with a well-typed [BeneficiaryOneOf]
             * value instead. This method is primarily for setting the field to an undocumented or
             * not yet supported value.
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
             * Returns an immutable instance of [IbanAccountExternalAccountInfo].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             *
             * The following fields are required:
             * ```kotlin
             * .accountType()
             * .iban()
             * .swiftBic()
             * .beneficiary()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): IbanAccountExternalAccountInfo =
                IbanAccountExternalAccountInfo(
                    checkRequired("accountType", accountType),
                    checkRequired("iban", iban),
                    checkRequired("swiftBic", swiftBic),
                    checkRequired("beneficiary", beneficiary),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): IbanAccountExternalAccountInfo = apply {
            if (validated) {
                return@apply
            }

            accountType().validate()
            iban()
            swiftBic()
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
            (accountType.asKnown()?.validity() ?: 0) +
                (if (iban.asKnown() == null) 0 else 1) +
                (if (swiftBic.asKnown() == null) 0 else 1) +
                (beneficiary.asKnown()?.validity() ?: 0)

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is IbanAccountExternalAccountInfo &&
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
            "IbanAccountExternalAccountInfo{accountType=$accountType, iban=$iban, swiftBic=$swiftBic, beneficiary=$beneficiary, additionalProperties=$additionalProperties}"
    }

    class UpiAccountExternalAccountInfo
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val accountType: JsonField<BaseExternalAccountInfo.AccountType>,
        private val vpa: JsonField<String>,
        private val beneficiary: JsonField<BeneficiaryOneOf>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("accountType")
            @ExcludeMissing
            accountType: JsonField<BaseExternalAccountInfo.AccountType> = JsonMissing.of(),
            @JsonProperty("vpa") @ExcludeMissing vpa: JsonField<String> = JsonMissing.of(),
            @JsonProperty("beneficiary")
            @ExcludeMissing
            beneficiary: JsonField<BeneficiaryOneOf> = JsonMissing.of(),
        ) : this(accountType, vpa, beneficiary, mutableMapOf())

        fun toBaseExternalAccountInfo(): BaseExternalAccountInfo =
            BaseExternalAccountInfo.builder().accountType(accountType).build()

        fun toUpiAccountInfo(): UpiAccountInfo =
            UpiAccountInfo.builder().accountType(accountType).vpa(vpa).build()

        /**
         * Type of external account or wallet
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun accountType(): BaseExternalAccountInfo.AccountType =
            accountType.getRequired("accountType")

        /**
         * Virtual Payment Address for UPI payments
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun vpa(): String = vpa.getRequired("vpa")

        /**
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun beneficiary(): BeneficiaryOneOf = beneficiary.getRequired("beneficiary")

        /**
         * Returns the raw JSON value of [accountType].
         *
         * Unlike [accountType], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("accountType")
        @ExcludeMissing
        fun _accountType(): JsonField<BaseExternalAccountInfo.AccountType> = accountType

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
        fun _beneficiary(): JsonField<BeneficiaryOneOf> = beneficiary

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
             * [UpiAccountExternalAccountInfo].
             *
             * The following fields are required:
             * ```kotlin
             * .accountType()
             * .vpa()
             * .beneficiary()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [UpiAccountExternalAccountInfo]. */
        class Builder internal constructor() {

            private var accountType: JsonField<BaseExternalAccountInfo.AccountType>? = null
            private var vpa: JsonField<String>? = null
            private var beneficiary: JsonField<BeneficiaryOneOf>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(upiAccountExternalAccountInfo: UpiAccountExternalAccountInfo) =
                apply {
                    accountType = upiAccountExternalAccountInfo.accountType
                    vpa = upiAccountExternalAccountInfo.vpa
                    beneficiary = upiAccountExternalAccountInfo.beneficiary
                    additionalProperties =
                        upiAccountExternalAccountInfo.additionalProperties.toMutableMap()
                }

            /** Type of external account or wallet */
            fun accountType(accountType: BaseExternalAccountInfo.AccountType) =
                accountType(JsonField.of(accountType))

            /**
             * Sets [Builder.accountType] to an arbitrary JSON value.
             *
             * You should usually call [Builder.accountType] with a well-typed
             * [BaseExternalAccountInfo.AccountType] value instead. This method is primarily for
             * setting the field to an undocumented or not yet supported value.
             */
            fun accountType(accountType: JsonField<BaseExternalAccountInfo.AccountType>) = apply {
                this.accountType = accountType
            }

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

            fun beneficiary(beneficiary: BeneficiaryOneOf) = beneficiary(JsonField.of(beneficiary))

            /**
             * Sets [Builder.beneficiary] to an arbitrary JSON value.
             *
             * You should usually call [Builder.beneficiary] with a well-typed [BeneficiaryOneOf]
             * value instead. This method is primarily for setting the field to an undocumented or
             * not yet supported value.
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
             * Returns an immutable instance of [UpiAccountExternalAccountInfo].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             *
             * The following fields are required:
             * ```kotlin
             * .accountType()
             * .vpa()
             * .beneficiary()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): UpiAccountExternalAccountInfo =
                UpiAccountExternalAccountInfo(
                    checkRequired("accountType", accountType),
                    checkRequired("vpa", vpa),
                    checkRequired("beneficiary", beneficiary),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): UpiAccountExternalAccountInfo = apply {
            if (validated) {
                return@apply
            }

            accountType().validate()
            vpa()
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
            (accountType.asKnown()?.validity() ?: 0) +
                (if (vpa.asKnown() == null) 0 else 1) +
                (beneficiary.asKnown()?.validity() ?: 0)

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is UpiAccountExternalAccountInfo &&
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
            "UpiAccountExternalAccountInfo{accountType=$accountType, vpa=$vpa, beneficiary=$beneficiary, additionalProperties=$additionalProperties}"
    }

    class CadAccountExternalAccountInfo
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val accountType: JsonField<BaseExternalAccountInfo.AccountType>,
        private val accountNumber: JsonField<String>,
        private val bankCode: JsonField<String>,
        private val beneficiary: JsonField<BeneficiaryOneOf>,
        private val branchCode: JsonField<String>,
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
            @JsonProperty("bankCode")
            @ExcludeMissing
            bankCode: JsonField<String> = JsonMissing.of(),
            @JsonProperty("beneficiary")
            @ExcludeMissing
            beneficiary: JsonField<BeneficiaryOneOf> = JsonMissing.of(),
            @JsonProperty("branchCode")
            @ExcludeMissing
            branchCode: JsonField<String> = JsonMissing.of(),
        ) : this(accountType, accountNumber, bankCode, beneficiary, branchCode, mutableMapOf())

        fun toBaseExternalAccountInfo(): BaseExternalAccountInfo =
            BaseExternalAccountInfo.builder().accountType(accountType).build()

        /**
         * Type of external account or wallet
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun accountType(): BaseExternalAccountInfo.AccountType =
            accountType.getRequired("accountType")

        /**
         * Bank account number (7-12 digits)
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun accountNumber(): String = accountNumber.getRequired("accountNumber")

        /**
         * Canadian financial institution number (3 digits)
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun bankCode(): String = bankCode.getRequired("bankCode")

        /**
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun beneficiary(): BeneficiaryOneOf = beneficiary.getRequired("beneficiary")

        /**
         * Transit number identifying the branch (5 digits)
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun branchCode(): String = branchCode.getRequired("branchCode")

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
         * Unlike [accountNumber], this method doesn't throw if the JSON field has an unexpected
         * type.
         */
        @JsonProperty("accountNumber")
        @ExcludeMissing
        fun _accountNumber(): JsonField<String> = accountNumber

        /**
         * Returns the raw JSON value of [bankCode].
         *
         * Unlike [bankCode], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("bankCode") @ExcludeMissing fun _bankCode(): JsonField<String> = bankCode

        /**
         * Returns the raw JSON value of [beneficiary].
         *
         * Unlike [beneficiary], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("beneficiary")
        @ExcludeMissing
        fun _beneficiary(): JsonField<BeneficiaryOneOf> = beneficiary

        /**
         * Returns the raw JSON value of [branchCode].
         *
         * Unlike [branchCode], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("branchCode")
        @ExcludeMissing
        fun _branchCode(): JsonField<String> = branchCode

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
             * [CadAccountExternalAccountInfo].
             *
             * The following fields are required:
             * ```kotlin
             * .accountType()
             * .accountNumber()
             * .bankCode()
             * .beneficiary()
             * .branchCode()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [CadAccountExternalAccountInfo]. */
        class Builder internal constructor() {

            private var accountType: JsonField<BaseExternalAccountInfo.AccountType>? = null
            private var accountNumber: JsonField<String>? = null
            private var bankCode: JsonField<String>? = null
            private var beneficiary: JsonField<BeneficiaryOneOf>? = null
            private var branchCode: JsonField<String>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(cadAccountExternalAccountInfo: CadAccountExternalAccountInfo) =
                apply {
                    accountType = cadAccountExternalAccountInfo.accountType
                    accountNumber = cadAccountExternalAccountInfo.accountNumber
                    bankCode = cadAccountExternalAccountInfo.bankCode
                    beneficiary = cadAccountExternalAccountInfo.beneficiary
                    branchCode = cadAccountExternalAccountInfo.branchCode
                    additionalProperties =
                        cadAccountExternalAccountInfo.additionalProperties.toMutableMap()
                }

            /** Type of external account or wallet */
            fun accountType(accountType: BaseExternalAccountInfo.AccountType) =
                accountType(JsonField.of(accountType))

            /**
             * Sets [Builder.accountType] to an arbitrary JSON value.
             *
             * You should usually call [Builder.accountType] with a well-typed
             * [BaseExternalAccountInfo.AccountType] value instead. This method is primarily for
             * setting the field to an undocumented or not yet supported value.
             */
            fun accountType(accountType: JsonField<BaseExternalAccountInfo.AccountType>) = apply {
                this.accountType = accountType
            }

            /** Bank account number (7-12 digits) */
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

            /** Canadian financial institution number (3 digits) */
            fun bankCode(bankCode: String) = bankCode(JsonField.of(bankCode))

            /**
             * Sets [Builder.bankCode] to an arbitrary JSON value.
             *
             * You should usually call [Builder.bankCode] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun bankCode(bankCode: JsonField<String>) = apply { this.bankCode = bankCode }

            fun beneficiary(beneficiary: BeneficiaryOneOf) = beneficiary(JsonField.of(beneficiary))

            /**
             * Sets [Builder.beneficiary] to an arbitrary JSON value.
             *
             * You should usually call [Builder.beneficiary] with a well-typed [BeneficiaryOneOf]
             * value instead. This method is primarily for setting the field to an undocumented or
             * not yet supported value.
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

            /** Transit number identifying the branch (5 digits) */
            fun branchCode(branchCode: String) = branchCode(JsonField.of(branchCode))

            /**
             * Sets [Builder.branchCode] to an arbitrary JSON value.
             *
             * You should usually call [Builder.branchCode] with a well-typed [String] value
             * instead. This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun branchCode(branchCode: JsonField<String>) = apply { this.branchCode = branchCode }

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
             * Returns an immutable instance of [CadAccountExternalAccountInfo].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             *
             * The following fields are required:
             * ```kotlin
             * .accountType()
             * .accountNumber()
             * .bankCode()
             * .beneficiary()
             * .branchCode()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): CadAccountExternalAccountInfo =
                CadAccountExternalAccountInfo(
                    checkRequired("accountType", accountType),
                    checkRequired("accountNumber", accountNumber),
                    checkRequired("bankCode", bankCode),
                    checkRequired("beneficiary", beneficiary),
                    checkRequired("branchCode", branchCode),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): CadAccountExternalAccountInfo = apply {
            if (validated) {
                return@apply
            }

            accountType().validate()
            accountNumber()
            bankCode()
            beneficiary().validate()
            branchCode()
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
            (accountType.asKnown()?.validity() ?: 0) +
                (if (accountNumber.asKnown() == null) 0 else 1) +
                (if (bankCode.asKnown() == null) 0 else 1) +
                (beneficiary.asKnown()?.validity() ?: 0) +
                (if (branchCode.asKnown() == null) 0 else 1)

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

                val CAD_ACCOUNT = of("CAD_ACCOUNT")

                fun of(value: String) = AccountType(JsonField.of(value))
            }

            /** An enum containing [AccountType]'s known values. */
            enum class Known {
                CAD_ACCOUNT
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
                CAD_ACCOUNT,
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
                    CAD_ACCOUNT -> Value.CAD_ACCOUNT
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
                    CAD_ACCOUNT -> Known.CAD_ACCOUNT
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

            return other is CadAccountExternalAccountInfo &&
                accountType == other.accountType &&
                accountNumber == other.accountNumber &&
                bankCode == other.bankCode &&
                beneficiary == other.beneficiary &&
                branchCode == other.branchCode &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(
                accountType,
                accountNumber,
                bankCode,
                beneficiary,
                branchCode,
                additionalProperties,
            )
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "CadAccountExternalAccountInfo{accountType=$accountType, accountNumber=$accountNumber, bankCode=$bankCode, beneficiary=$beneficiary, branchCode=$branchCode, additionalProperties=$additionalProperties}"
    }

    class GbpAccountExternalAccountInfo
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val accountType: JsonField<BaseExternalAccountInfo.AccountType>,
        private val accountNumber: JsonField<String>,
        private val beneficiary: JsonField<BeneficiaryOneOf>,
        private val sortCode: JsonField<String>,
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
            @JsonProperty("beneficiary")
            @ExcludeMissing
            beneficiary: JsonField<BeneficiaryOneOf> = JsonMissing.of(),
            @JsonProperty("sortCode") @ExcludeMissing sortCode: JsonField<String> = JsonMissing.of(),
        ) : this(accountType, accountNumber, beneficiary, sortCode, mutableMapOf())

        fun toBaseExternalAccountInfo(): BaseExternalAccountInfo =
            BaseExternalAccountInfo.builder().accountType(accountType).build()

        /**
         * Type of external account or wallet
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun accountType(): BaseExternalAccountInfo.AccountType =
            accountType.getRequired("accountType")

        /**
         * UK bank account number (8 digits)
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun accountNumber(): String = accountNumber.getRequired("accountNumber")

        /**
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun beneficiary(): BeneficiaryOneOf = beneficiary.getRequired("beneficiary")

        /**
         * UK bank sort code (6 digits, may include hyphens)
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun sortCode(): String = sortCode.getRequired("sortCode")

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
         * Unlike [accountNumber], this method doesn't throw if the JSON field has an unexpected
         * type.
         */
        @JsonProperty("accountNumber")
        @ExcludeMissing
        fun _accountNumber(): JsonField<String> = accountNumber

        /**
         * Returns the raw JSON value of [beneficiary].
         *
         * Unlike [beneficiary], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("beneficiary")
        @ExcludeMissing
        fun _beneficiary(): JsonField<BeneficiaryOneOf> = beneficiary

        /**
         * Returns the raw JSON value of [sortCode].
         *
         * Unlike [sortCode], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("sortCode") @ExcludeMissing fun _sortCode(): JsonField<String> = sortCode

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
             * [GbpAccountExternalAccountInfo].
             *
             * The following fields are required:
             * ```kotlin
             * .accountType()
             * .accountNumber()
             * .beneficiary()
             * .sortCode()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [GbpAccountExternalAccountInfo]. */
        class Builder internal constructor() {

            private var accountType: JsonField<BaseExternalAccountInfo.AccountType>? = null
            private var accountNumber: JsonField<String>? = null
            private var beneficiary: JsonField<BeneficiaryOneOf>? = null
            private var sortCode: JsonField<String>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(gbpAccountExternalAccountInfo: GbpAccountExternalAccountInfo) =
                apply {
                    accountType = gbpAccountExternalAccountInfo.accountType
                    accountNumber = gbpAccountExternalAccountInfo.accountNumber
                    beneficiary = gbpAccountExternalAccountInfo.beneficiary
                    sortCode = gbpAccountExternalAccountInfo.sortCode
                    additionalProperties =
                        gbpAccountExternalAccountInfo.additionalProperties.toMutableMap()
                }

            /** Type of external account or wallet */
            fun accountType(accountType: BaseExternalAccountInfo.AccountType) =
                accountType(JsonField.of(accountType))

            /**
             * Sets [Builder.accountType] to an arbitrary JSON value.
             *
             * You should usually call [Builder.accountType] with a well-typed
             * [BaseExternalAccountInfo.AccountType] value instead. This method is primarily for
             * setting the field to an undocumented or not yet supported value.
             */
            fun accountType(accountType: JsonField<BaseExternalAccountInfo.AccountType>) = apply {
                this.accountType = accountType
            }

            /** UK bank account number (8 digits) */
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

            fun beneficiary(beneficiary: BeneficiaryOneOf) = beneficiary(JsonField.of(beneficiary))

            /**
             * Sets [Builder.beneficiary] to an arbitrary JSON value.
             *
             * You should usually call [Builder.beneficiary] with a well-typed [BeneficiaryOneOf]
             * value instead. This method is primarily for setting the field to an undocumented or
             * not yet supported value.
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

            /** UK bank sort code (6 digits, may include hyphens) */
            fun sortCode(sortCode: String) = sortCode(JsonField.of(sortCode))

            /**
             * Sets [Builder.sortCode] to an arbitrary JSON value.
             *
             * You should usually call [Builder.sortCode] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun sortCode(sortCode: JsonField<String>) = apply { this.sortCode = sortCode }

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
             * Returns an immutable instance of [GbpAccountExternalAccountInfo].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             *
             * The following fields are required:
             * ```kotlin
             * .accountType()
             * .accountNumber()
             * .beneficiary()
             * .sortCode()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): GbpAccountExternalAccountInfo =
                GbpAccountExternalAccountInfo(
                    checkRequired("accountType", accountType),
                    checkRequired("accountNumber", accountNumber),
                    checkRequired("beneficiary", beneficiary),
                    checkRequired("sortCode", sortCode),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): GbpAccountExternalAccountInfo = apply {
            if (validated) {
                return@apply
            }

            accountType().validate()
            accountNumber()
            beneficiary().validate()
            sortCode()
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
            (accountType.asKnown()?.validity() ?: 0) +
                (if (accountNumber.asKnown() == null) 0 else 1) +
                (beneficiary.asKnown()?.validity() ?: 0) +
                (if (sortCode.asKnown() == null) 0 else 1)

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

                val GBP_ACCOUNT = of("GBP_ACCOUNT")

                fun of(value: String) = AccountType(JsonField.of(value))
            }

            /** An enum containing [AccountType]'s known values. */
            enum class Known {
                GBP_ACCOUNT
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
                GBP_ACCOUNT,
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
                    GBP_ACCOUNT -> Value.GBP_ACCOUNT
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
                    GBP_ACCOUNT -> Known.GBP_ACCOUNT
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

            return other is GbpAccountExternalAccountInfo &&
                accountType == other.accountType &&
                accountNumber == other.accountNumber &&
                beneficiary == other.beneficiary &&
                sortCode == other.sortCode &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(accountType, accountNumber, beneficiary, sortCode, additionalProperties)
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "GbpAccountExternalAccountInfo{accountType=$accountType, accountNumber=$accountNumber, beneficiary=$beneficiary, sortCode=$sortCode, additionalProperties=$additionalProperties}"
    }

    class PhpAccountExternalAccountInfo
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val accountType: JsonField<BaseExternalAccountInfo.AccountType>,
        private val accountNumber: JsonField<String>,
        private val bankName: JsonField<String>,
        private val beneficiary: JsonField<BeneficiaryOneOf>,
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
            @JsonProperty("bankName")
            @ExcludeMissing
            bankName: JsonField<String> = JsonMissing.of(),
            @JsonProperty("beneficiary")
            @ExcludeMissing
            beneficiary: JsonField<BeneficiaryOneOf> = JsonMissing.of(),
        ) : this(accountType, accountNumber, bankName, beneficiary, mutableMapOf())

        fun toBaseExternalAccountInfo(): BaseExternalAccountInfo =
            BaseExternalAccountInfo.builder().accountType(accountType).build()

        /**
         * Type of external account or wallet
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun accountType(): BaseExternalAccountInfo.AccountType =
            accountType.getRequired("accountType")

        /**
         * Bank account number
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun accountNumber(): String = accountNumber.getRequired("accountNumber")

        /**
         * Name of the beneficiary's bank
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun bankName(): String = bankName.getRequired("bankName")

        /**
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun beneficiary(): BeneficiaryOneOf = beneficiary.getRequired("beneficiary")

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
        fun _beneficiary(): JsonField<BeneficiaryOneOf> = beneficiary

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
             * [PhpAccountExternalAccountInfo].
             *
             * The following fields are required:
             * ```kotlin
             * .accountType()
             * .accountNumber()
             * .bankName()
             * .beneficiary()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [PhpAccountExternalAccountInfo]. */
        class Builder internal constructor() {

            private var accountType: JsonField<BaseExternalAccountInfo.AccountType>? = null
            private var accountNumber: JsonField<String>? = null
            private var bankName: JsonField<String>? = null
            private var beneficiary: JsonField<BeneficiaryOneOf>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(phpAccountExternalAccountInfo: PhpAccountExternalAccountInfo) =
                apply {
                    accountType = phpAccountExternalAccountInfo.accountType
                    accountNumber = phpAccountExternalAccountInfo.accountNumber
                    bankName = phpAccountExternalAccountInfo.bankName
                    beneficiary = phpAccountExternalAccountInfo.beneficiary
                    additionalProperties =
                        phpAccountExternalAccountInfo.additionalProperties.toMutableMap()
                }

            /** Type of external account or wallet */
            fun accountType(accountType: BaseExternalAccountInfo.AccountType) =
                accountType(JsonField.of(accountType))

            /**
             * Sets [Builder.accountType] to an arbitrary JSON value.
             *
             * You should usually call [Builder.accountType] with a well-typed
             * [BaseExternalAccountInfo.AccountType] value instead. This method is primarily for
             * setting the field to an undocumented or not yet supported value.
             */
            fun accountType(accountType: JsonField<BaseExternalAccountInfo.AccountType>) = apply {
                this.accountType = accountType
            }

            /** Bank account number */
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

            /** Name of the beneficiary's bank */
            fun bankName(bankName: String) = bankName(JsonField.of(bankName))

            /**
             * Sets [Builder.bankName] to an arbitrary JSON value.
             *
             * You should usually call [Builder.bankName] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun bankName(bankName: JsonField<String>) = apply { this.bankName = bankName }

            fun beneficiary(beneficiary: BeneficiaryOneOf) = beneficiary(JsonField.of(beneficiary))

            /**
             * Sets [Builder.beneficiary] to an arbitrary JSON value.
             *
             * You should usually call [Builder.beneficiary] with a well-typed [BeneficiaryOneOf]
             * value instead. This method is primarily for setting the field to an undocumented or
             * not yet supported value.
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
             * Returns an immutable instance of [PhpAccountExternalAccountInfo].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             *
             * The following fields are required:
             * ```kotlin
             * .accountType()
             * .accountNumber()
             * .bankName()
             * .beneficiary()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): PhpAccountExternalAccountInfo =
                PhpAccountExternalAccountInfo(
                    checkRequired("accountType", accountType),
                    checkRequired("accountNumber", accountNumber),
                    checkRequired("bankName", bankName),
                    checkRequired("beneficiary", beneficiary),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): PhpAccountExternalAccountInfo = apply {
            if (validated) {
                return@apply
            }

            accountType().validate()
            accountNumber()
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
            (accountType.asKnown()?.validity() ?: 0) +
                (if (accountNumber.asKnown() == null) 0 else 1) +
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

                val PHP_ACCOUNT = of("PHP_ACCOUNT")

                fun of(value: String) = AccountType(JsonField.of(value))
            }

            /** An enum containing [AccountType]'s known values. */
            enum class Known {
                PHP_ACCOUNT
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
                PHP_ACCOUNT,
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
                    PHP_ACCOUNT -> Value.PHP_ACCOUNT
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
                    PHP_ACCOUNT -> Known.PHP_ACCOUNT
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

            return other is PhpAccountExternalAccountInfo &&
                accountType == other.accountType &&
                accountNumber == other.accountNumber &&
                bankName == other.bankName &&
                beneficiary == other.beneficiary &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(accountType, accountNumber, bankName, beneficiary, additionalProperties)
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "PhpAccountExternalAccountInfo{accountType=$accountType, accountNumber=$accountNumber, bankName=$bankName, beneficiary=$beneficiary, additionalProperties=$additionalProperties}"
    }

    class SgdAccountExternalAccountInfo
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val accountType: JsonField<BaseExternalAccountInfo.AccountType>,
        private val accountNumber: JsonField<String>,
        private val bankName: JsonField<String>,
        private val beneficiary: JsonField<BeneficiaryOneOf>,
        private val swiftCode: JsonField<String>,
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
            @JsonProperty("bankName")
            @ExcludeMissing
            bankName: JsonField<String> = JsonMissing.of(),
            @JsonProperty("beneficiary")
            @ExcludeMissing
            beneficiary: JsonField<BeneficiaryOneOf> = JsonMissing.of(),
            @JsonProperty("swiftCode")
            @ExcludeMissing
            swiftCode: JsonField<String> = JsonMissing.of(),
        ) : this(accountType, accountNumber, bankName, beneficiary, swiftCode, mutableMapOf())

        fun toBaseExternalAccountInfo(): BaseExternalAccountInfo =
            BaseExternalAccountInfo.builder().accountType(accountType).build()

        /**
         * Type of external account or wallet
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun accountType(): BaseExternalAccountInfo.AccountType =
            accountType.getRequired("accountType")

        /**
         * Bank account number
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun accountNumber(): String = accountNumber.getRequired("accountNumber")

        /**
         * Name of the beneficiary's bank
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun bankName(): String = bankName.getRequired("bankName")

        /**
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun beneficiary(): BeneficiaryOneOf = beneficiary.getRequired("beneficiary")

        /**
         * SWIFT/BIC code (8 or 11 characters)
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun swiftCode(): String = swiftCode.getRequired("swiftCode")

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
        fun _beneficiary(): JsonField<BeneficiaryOneOf> = beneficiary

        /**
         * Returns the raw JSON value of [swiftCode].
         *
         * Unlike [swiftCode], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("swiftCode") @ExcludeMissing fun _swiftCode(): JsonField<String> = swiftCode

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
             * [SgdAccountExternalAccountInfo].
             *
             * The following fields are required:
             * ```kotlin
             * .accountType()
             * .accountNumber()
             * .bankName()
             * .beneficiary()
             * .swiftCode()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [SgdAccountExternalAccountInfo]. */
        class Builder internal constructor() {

            private var accountType: JsonField<BaseExternalAccountInfo.AccountType>? = null
            private var accountNumber: JsonField<String>? = null
            private var bankName: JsonField<String>? = null
            private var beneficiary: JsonField<BeneficiaryOneOf>? = null
            private var swiftCode: JsonField<String>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(sgdAccountExternalAccountInfo: SgdAccountExternalAccountInfo) =
                apply {
                    accountType = sgdAccountExternalAccountInfo.accountType
                    accountNumber = sgdAccountExternalAccountInfo.accountNumber
                    bankName = sgdAccountExternalAccountInfo.bankName
                    beneficiary = sgdAccountExternalAccountInfo.beneficiary
                    swiftCode = sgdAccountExternalAccountInfo.swiftCode
                    additionalProperties =
                        sgdAccountExternalAccountInfo.additionalProperties.toMutableMap()
                }

            /** Type of external account or wallet */
            fun accountType(accountType: BaseExternalAccountInfo.AccountType) =
                accountType(JsonField.of(accountType))

            /**
             * Sets [Builder.accountType] to an arbitrary JSON value.
             *
             * You should usually call [Builder.accountType] with a well-typed
             * [BaseExternalAccountInfo.AccountType] value instead. This method is primarily for
             * setting the field to an undocumented or not yet supported value.
             */
            fun accountType(accountType: JsonField<BaseExternalAccountInfo.AccountType>) = apply {
                this.accountType = accountType
            }

            /** Bank account number */
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

            /** Name of the beneficiary's bank */
            fun bankName(bankName: String) = bankName(JsonField.of(bankName))

            /**
             * Sets [Builder.bankName] to an arbitrary JSON value.
             *
             * You should usually call [Builder.bankName] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun bankName(bankName: JsonField<String>) = apply { this.bankName = bankName }

            fun beneficiary(beneficiary: BeneficiaryOneOf) = beneficiary(JsonField.of(beneficiary))

            /**
             * Sets [Builder.beneficiary] to an arbitrary JSON value.
             *
             * You should usually call [Builder.beneficiary] with a well-typed [BeneficiaryOneOf]
             * value instead. This method is primarily for setting the field to an undocumented or
             * not yet supported value.
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

            /** SWIFT/BIC code (8 or 11 characters) */
            fun swiftCode(swiftCode: String) = swiftCode(JsonField.of(swiftCode))

            /**
             * Sets [Builder.swiftCode] to an arbitrary JSON value.
             *
             * You should usually call [Builder.swiftCode] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun swiftCode(swiftCode: JsonField<String>) = apply { this.swiftCode = swiftCode }

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
             * Returns an immutable instance of [SgdAccountExternalAccountInfo].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             *
             * The following fields are required:
             * ```kotlin
             * .accountType()
             * .accountNumber()
             * .bankName()
             * .beneficiary()
             * .swiftCode()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): SgdAccountExternalAccountInfo =
                SgdAccountExternalAccountInfo(
                    checkRequired("accountType", accountType),
                    checkRequired("accountNumber", accountNumber),
                    checkRequired("bankName", bankName),
                    checkRequired("beneficiary", beneficiary),
                    checkRequired("swiftCode", swiftCode),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): SgdAccountExternalAccountInfo = apply {
            if (validated) {
                return@apply
            }

            accountType().validate()
            accountNumber()
            bankName()
            beneficiary().validate()
            swiftCode()
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
            (accountType.asKnown()?.validity() ?: 0) +
                (if (accountNumber.asKnown() == null) 0 else 1) +
                (if (bankName.asKnown() == null) 0 else 1) +
                (beneficiary.asKnown()?.validity() ?: 0) +
                (if (swiftCode.asKnown() == null) 0 else 1)

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

                val SGD_ACCOUNT = of("SGD_ACCOUNT")

                fun of(value: String) = AccountType(JsonField.of(value))
            }

            /** An enum containing [AccountType]'s known values. */
            enum class Known {
                SGD_ACCOUNT
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
                SGD_ACCOUNT,
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
                    SGD_ACCOUNT -> Value.SGD_ACCOUNT
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
                    SGD_ACCOUNT -> Known.SGD_ACCOUNT
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

            return other is SgdAccountExternalAccountInfo &&
                accountType == other.accountType &&
                accountNumber == other.accountNumber &&
                bankName == other.bankName &&
                beneficiary == other.beneficiary &&
                swiftCode == other.swiftCode &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(
                accountType,
                accountNumber,
                bankName,
                beneficiary,
                swiftCode,
                additionalProperties,
            )
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "SgdAccountExternalAccountInfo{accountType=$accountType, accountNumber=$accountNumber, bankName=$bankName, beneficiary=$beneficiary, swiftCode=$swiftCode, additionalProperties=$additionalProperties}"
    }

    class SparkWalletExternalAccountInfo
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val accountType: JsonField<BaseExternalAccountInfo.AccountType>,
        private val address: JsonField<String>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("accountType")
            @ExcludeMissing
            accountType: JsonField<BaseExternalAccountInfo.AccountType> = JsonMissing.of(),
            @JsonProperty("address") @ExcludeMissing address: JsonField<String> = JsonMissing.of(),
        ) : this(accountType, address, mutableMapOf())

        fun toBaseExternalAccountInfo(): BaseExternalAccountInfo =
            BaseExternalAccountInfo.builder().accountType(accountType).build()

        fun toSparkWalletInfo(): SparkWalletInfo =
            SparkWalletInfo.builder().accountType(accountType).address(address).build()

        /**
         * Type of external account or wallet
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun accountType(): BaseExternalAccountInfo.AccountType =
            accountType.getRequired("accountType")

        /**
         * Spark wallet address
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun address(): String = address.getRequired("address")

        /**
         * Returns the raw JSON value of [accountType].
         *
         * Unlike [accountType], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("accountType")
        @ExcludeMissing
        fun _accountType(): JsonField<BaseExternalAccountInfo.AccountType> = accountType

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
             * Returns a mutable builder for constructing an instance of
             * [SparkWalletExternalAccountInfo].
             *
             * The following fields are required:
             * ```kotlin
             * .accountType()
             * .address()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [SparkWalletExternalAccountInfo]. */
        class Builder internal constructor() {

            private var accountType: JsonField<BaseExternalAccountInfo.AccountType>? = null
            private var address: JsonField<String>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(sparkWalletExternalAccountInfo: SparkWalletExternalAccountInfo) =
                apply {
                    accountType = sparkWalletExternalAccountInfo.accountType
                    address = sparkWalletExternalAccountInfo.address
                    additionalProperties =
                        sparkWalletExternalAccountInfo.additionalProperties.toMutableMap()
                }

            /** Type of external account or wallet */
            fun accountType(accountType: BaseExternalAccountInfo.AccountType) =
                accountType(JsonField.of(accountType))

            /**
             * Sets [Builder.accountType] to an arbitrary JSON value.
             *
             * You should usually call [Builder.accountType] with a well-typed
             * [BaseExternalAccountInfo.AccountType] value instead. This method is primarily for
             * setting the field to an undocumented or not yet supported value.
             */
            fun accountType(accountType: JsonField<BaseExternalAccountInfo.AccountType>) = apply {
                this.accountType = accountType
            }

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
             * Returns an immutable instance of [SparkWalletExternalAccountInfo].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             *
             * The following fields are required:
             * ```kotlin
             * .accountType()
             * .address()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): SparkWalletExternalAccountInfo =
                SparkWalletExternalAccountInfo(
                    checkRequired("accountType", accountType),
                    checkRequired("address", address),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): SparkWalletExternalAccountInfo = apply {
            if (validated) {
                return@apply
            }

            accountType().validate()
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
            (accountType.asKnown()?.validity() ?: 0) + (if (address.asKnown() == null) 0 else 1)

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is SparkWalletExternalAccountInfo &&
                accountType == other.accountType &&
                address == other.address &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(accountType, address, additionalProperties)
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "SparkWalletExternalAccountInfo{accountType=$accountType, address=$address, additionalProperties=$additionalProperties}"
    }

    class SolanaWalletExternalAccountInfo
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val accountType: JsonField<BaseExternalAccountInfo.AccountType>,
        private val address: JsonField<String>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("accountType")
            @ExcludeMissing
            accountType: JsonField<BaseExternalAccountInfo.AccountType> = JsonMissing.of(),
            @JsonProperty("address") @ExcludeMissing address: JsonField<String> = JsonMissing.of(),
        ) : this(accountType, address, mutableMapOf())

        fun toBaseExternalAccountInfo(): BaseExternalAccountInfo =
            BaseExternalAccountInfo.builder().accountType(accountType).build()

        fun toSolanaWalletInfo(): SolanaWalletInfo =
            SolanaWalletInfo.builder().accountType(accountType).address(address).build()

        /**
         * Type of external account or wallet
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun accountType(): BaseExternalAccountInfo.AccountType =
            accountType.getRequired("accountType")

        /**
         * Solana wallet address
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun address(): String = address.getRequired("address")

        /**
         * Returns the raw JSON value of [accountType].
         *
         * Unlike [accountType], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("accountType")
        @ExcludeMissing
        fun _accountType(): JsonField<BaseExternalAccountInfo.AccountType> = accountType

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
             * Returns a mutable builder for constructing an instance of
             * [SolanaWalletExternalAccountInfo].
             *
             * The following fields are required:
             * ```kotlin
             * .accountType()
             * .address()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [SolanaWalletExternalAccountInfo]. */
        class Builder internal constructor() {

            private var accountType: JsonField<BaseExternalAccountInfo.AccountType>? = null
            private var address: JsonField<String>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(solanaWalletExternalAccountInfo: SolanaWalletExternalAccountInfo) =
                apply {
                    accountType = solanaWalletExternalAccountInfo.accountType
                    address = solanaWalletExternalAccountInfo.address
                    additionalProperties =
                        solanaWalletExternalAccountInfo.additionalProperties.toMutableMap()
                }

            /** Type of external account or wallet */
            fun accountType(accountType: BaseExternalAccountInfo.AccountType) =
                accountType(JsonField.of(accountType))

            /**
             * Sets [Builder.accountType] to an arbitrary JSON value.
             *
             * You should usually call [Builder.accountType] with a well-typed
             * [BaseExternalAccountInfo.AccountType] value instead. This method is primarily for
             * setting the field to an undocumented or not yet supported value.
             */
            fun accountType(accountType: JsonField<BaseExternalAccountInfo.AccountType>) = apply {
                this.accountType = accountType
            }

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
             * Returns an immutable instance of [SolanaWalletExternalAccountInfo].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             *
             * The following fields are required:
             * ```kotlin
             * .accountType()
             * .address()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): SolanaWalletExternalAccountInfo =
                SolanaWalletExternalAccountInfo(
                    checkRequired("accountType", accountType),
                    checkRequired("address", address),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): SolanaWalletExternalAccountInfo = apply {
            if (validated) {
                return@apply
            }

            accountType().validate()
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
            (accountType.asKnown()?.validity() ?: 0) + (if (address.asKnown() == null) 0 else 1)

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is SolanaWalletExternalAccountInfo &&
                accountType == other.accountType &&
                address == other.address &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(accountType, address, additionalProperties)
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "SolanaWalletExternalAccountInfo{accountType=$accountType, address=$address, additionalProperties=$additionalProperties}"
    }

    class TronWalletExternalAccountInfo
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val accountType: JsonField<BaseExternalAccountInfo.AccountType>,
        private val address: JsonField<String>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("accountType")
            @ExcludeMissing
            accountType: JsonField<BaseExternalAccountInfo.AccountType> = JsonMissing.of(),
            @JsonProperty("address") @ExcludeMissing address: JsonField<String> = JsonMissing.of(),
        ) : this(accountType, address, mutableMapOf())

        fun toBaseExternalAccountInfo(): BaseExternalAccountInfo =
            BaseExternalAccountInfo.builder().accountType(accountType).build()

        fun toTronWalletInfo(): TronWalletInfo =
            TronWalletInfo.builder().accountType(accountType).address(address).build()

        /**
         * Type of external account or wallet
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun accountType(): BaseExternalAccountInfo.AccountType =
            accountType.getRequired("accountType")

        /**
         * Tron wallet address
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun address(): String = address.getRequired("address")

        /**
         * Returns the raw JSON value of [accountType].
         *
         * Unlike [accountType], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("accountType")
        @ExcludeMissing
        fun _accountType(): JsonField<BaseExternalAccountInfo.AccountType> = accountType

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
             * Returns a mutable builder for constructing an instance of
             * [TronWalletExternalAccountInfo].
             *
             * The following fields are required:
             * ```kotlin
             * .accountType()
             * .address()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [TronWalletExternalAccountInfo]. */
        class Builder internal constructor() {

            private var accountType: JsonField<BaseExternalAccountInfo.AccountType>? = null
            private var address: JsonField<String>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(tronWalletExternalAccountInfo: TronWalletExternalAccountInfo) =
                apply {
                    accountType = tronWalletExternalAccountInfo.accountType
                    address = tronWalletExternalAccountInfo.address
                    additionalProperties =
                        tronWalletExternalAccountInfo.additionalProperties.toMutableMap()
                }

            /** Type of external account or wallet */
            fun accountType(accountType: BaseExternalAccountInfo.AccountType) =
                accountType(JsonField.of(accountType))

            /**
             * Sets [Builder.accountType] to an arbitrary JSON value.
             *
             * You should usually call [Builder.accountType] with a well-typed
             * [BaseExternalAccountInfo.AccountType] value instead. This method is primarily for
             * setting the field to an undocumented or not yet supported value.
             */
            fun accountType(accountType: JsonField<BaseExternalAccountInfo.AccountType>) = apply {
                this.accountType = accountType
            }

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
             * Returns an immutable instance of [TronWalletExternalAccountInfo].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             *
             * The following fields are required:
             * ```kotlin
             * .accountType()
             * .address()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): TronWalletExternalAccountInfo =
                TronWalletExternalAccountInfo(
                    checkRequired("accountType", accountType),
                    checkRequired("address", address),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): TronWalletExternalAccountInfo = apply {
            if (validated) {
                return@apply
            }

            accountType().validate()
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
            (accountType.asKnown()?.validity() ?: 0) + (if (address.asKnown() == null) 0 else 1)

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is TronWalletExternalAccountInfo &&
                accountType == other.accountType &&
                address == other.address &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(accountType, address, additionalProperties)
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "TronWalletExternalAccountInfo{accountType=$accountType, address=$address, additionalProperties=$additionalProperties}"
    }

    class PolygonWalletExternalAccountInfo
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val accountType: JsonField<BaseExternalAccountInfo.AccountType>,
        private val address: JsonField<String>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("accountType")
            @ExcludeMissing
            accountType: JsonField<BaseExternalAccountInfo.AccountType> = JsonMissing.of(),
            @JsonProperty("address") @ExcludeMissing address: JsonField<String> = JsonMissing.of(),
        ) : this(accountType, address, mutableMapOf())

        fun toBaseExternalAccountInfo(): BaseExternalAccountInfo =
            BaseExternalAccountInfo.builder().accountType(accountType).build()

        fun toPolygonWalletInfo(): PolygonWalletInfo =
            PolygonWalletInfo.builder().accountType(accountType).address(address).build()

        /**
         * Type of external account or wallet
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun accountType(): BaseExternalAccountInfo.AccountType =
            accountType.getRequired("accountType")

        /**
         * Polygon eth wallet address
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun address(): String = address.getRequired("address")

        /**
         * Returns the raw JSON value of [accountType].
         *
         * Unlike [accountType], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("accountType")
        @ExcludeMissing
        fun _accountType(): JsonField<BaseExternalAccountInfo.AccountType> = accountType

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
             * Returns a mutable builder for constructing an instance of
             * [PolygonWalletExternalAccountInfo].
             *
             * The following fields are required:
             * ```kotlin
             * .accountType()
             * .address()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [PolygonWalletExternalAccountInfo]. */
        class Builder internal constructor() {

            private var accountType: JsonField<BaseExternalAccountInfo.AccountType>? = null
            private var address: JsonField<String>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(polygonWalletExternalAccountInfo: PolygonWalletExternalAccountInfo) =
                apply {
                    accountType = polygonWalletExternalAccountInfo.accountType
                    address = polygonWalletExternalAccountInfo.address
                    additionalProperties =
                        polygonWalletExternalAccountInfo.additionalProperties.toMutableMap()
                }

            /** Type of external account or wallet */
            fun accountType(accountType: BaseExternalAccountInfo.AccountType) =
                accountType(JsonField.of(accountType))

            /**
             * Sets [Builder.accountType] to an arbitrary JSON value.
             *
             * You should usually call [Builder.accountType] with a well-typed
             * [BaseExternalAccountInfo.AccountType] value instead. This method is primarily for
             * setting the field to an undocumented or not yet supported value.
             */
            fun accountType(accountType: JsonField<BaseExternalAccountInfo.AccountType>) = apply {
                this.accountType = accountType
            }

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
             * Returns an immutable instance of [PolygonWalletExternalAccountInfo].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             *
             * The following fields are required:
             * ```kotlin
             * .accountType()
             * .address()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): PolygonWalletExternalAccountInfo =
                PolygonWalletExternalAccountInfo(
                    checkRequired("accountType", accountType),
                    checkRequired("address", address),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): PolygonWalletExternalAccountInfo = apply {
            if (validated) {
                return@apply
            }

            accountType().validate()
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
            (accountType.asKnown()?.validity() ?: 0) + (if (address.asKnown() == null) 0 else 1)

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is PolygonWalletExternalAccountInfo &&
                accountType == other.accountType &&
                address == other.address &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(accountType, address, additionalProperties)
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "PolygonWalletExternalAccountInfo{accountType=$accountType, address=$address, additionalProperties=$additionalProperties}"
    }

    class BaseWalletExternalAccountInfo
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val accountType: JsonField<BaseExternalAccountInfo.AccountType>,
        private val address: JsonField<String>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("accountType")
            @ExcludeMissing
            accountType: JsonField<BaseExternalAccountInfo.AccountType> = JsonMissing.of(),
            @JsonProperty("address") @ExcludeMissing address: JsonField<String> = JsonMissing.of(),
        ) : this(accountType, address, mutableMapOf())

        fun toBaseExternalAccountInfo(): BaseExternalAccountInfo =
            BaseExternalAccountInfo.builder().accountType(accountType).build()

        fun toBaseWalletInfo(): BaseWalletInfo =
            BaseWalletInfo.builder().accountType(accountType).address(address).build()

        /**
         * Type of external account or wallet
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun accountType(): BaseExternalAccountInfo.AccountType =
            accountType.getRequired("accountType")

        /**
         * Base eth wallet address
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun address(): String = address.getRequired("address")

        /**
         * Returns the raw JSON value of [accountType].
         *
         * Unlike [accountType], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("accountType")
        @ExcludeMissing
        fun _accountType(): JsonField<BaseExternalAccountInfo.AccountType> = accountType

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
             * Returns a mutable builder for constructing an instance of
             * [BaseWalletExternalAccountInfo].
             *
             * The following fields are required:
             * ```kotlin
             * .accountType()
             * .address()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [BaseWalletExternalAccountInfo]. */
        class Builder internal constructor() {

            private var accountType: JsonField<BaseExternalAccountInfo.AccountType>? = null
            private var address: JsonField<String>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(baseWalletExternalAccountInfo: BaseWalletExternalAccountInfo) =
                apply {
                    accountType = baseWalletExternalAccountInfo.accountType
                    address = baseWalletExternalAccountInfo.address
                    additionalProperties =
                        baseWalletExternalAccountInfo.additionalProperties.toMutableMap()
                }

            /** Type of external account or wallet */
            fun accountType(accountType: BaseExternalAccountInfo.AccountType) =
                accountType(JsonField.of(accountType))

            /**
             * Sets [Builder.accountType] to an arbitrary JSON value.
             *
             * You should usually call [Builder.accountType] with a well-typed
             * [BaseExternalAccountInfo.AccountType] value instead. This method is primarily for
             * setting the field to an undocumented or not yet supported value.
             */
            fun accountType(accountType: JsonField<BaseExternalAccountInfo.AccountType>) = apply {
                this.accountType = accountType
            }

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
             * Returns an immutable instance of [BaseWalletExternalAccountInfo].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             *
             * The following fields are required:
             * ```kotlin
             * .accountType()
             * .address()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): BaseWalletExternalAccountInfo =
                BaseWalletExternalAccountInfo(
                    checkRequired("accountType", accountType),
                    checkRequired("address", address),
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): BaseWalletExternalAccountInfo = apply {
            if (validated) {
                return@apply
            }

            accountType().validate()
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
            (accountType.asKnown()?.validity() ?: 0) + (if (address.asKnown() == null) 0 else 1)

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is BaseWalletExternalAccountInfo &&
                accountType == other.accountType &&
                address == other.address &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(accountType, address, additionalProperties)
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "BaseWalletExternalAccountInfo{accountType=$accountType, address=$address, additionalProperties=$additionalProperties}"
    }
}
