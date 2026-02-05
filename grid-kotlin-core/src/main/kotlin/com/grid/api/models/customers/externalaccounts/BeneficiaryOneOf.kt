// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers.externalaccounts

import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.core.ObjectCodec
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.SerializerProvider
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.fasterxml.jackson.databind.annotation.JsonSerialize
import com.fasterxml.jackson.module.kotlin.jacksonTypeRef
import com.grid.api.core.BaseDeserializer
import com.grid.api.core.BaseSerializer
import com.grid.api.core.JsonValue
import com.grid.api.core.allMaxBy
import com.grid.api.core.getOrThrow
import com.grid.api.errors.GridInvalidDataException
import java.util.Objects

@JsonDeserialize(using = BeneficiaryOneOf.Deserializer::class)
@JsonSerialize(using = BeneficiaryOneOf.Serializer::class)
class BeneficiaryOneOf
private constructor(
    private val individualBeneficiary: IndividualBeneficiary? = null,
    private val businessBeneficiary: BusinessBeneficiary? = null,
    private val _json: JsonValue? = null,
) {

    fun individualBeneficiary(): IndividualBeneficiary? = individualBeneficiary

    fun businessBeneficiary(): BusinessBeneficiary? = businessBeneficiary

    fun isIndividualBeneficiary(): Boolean = individualBeneficiary != null

    fun isBusinessBeneficiary(): Boolean = businessBeneficiary != null

    fun asIndividualBeneficiary(): IndividualBeneficiary =
        individualBeneficiary.getOrThrow("individualBeneficiary")

    fun asBusinessBeneficiary(): BusinessBeneficiary =
        businessBeneficiary.getOrThrow("businessBeneficiary")

    fun _json(): JsonValue? = _json

    fun <T> accept(visitor: Visitor<T>): T =
        when {
            individualBeneficiary != null ->
                visitor.visitIndividualBeneficiary(individualBeneficiary)
            businessBeneficiary != null -> visitor.visitBusinessBeneficiary(businessBeneficiary)
            else -> visitor.unknown(_json)
        }

    private var validated: Boolean = false

    fun validate(): BeneficiaryOneOf = apply {
        if (validated) {
            return@apply
        }

        accept(
            object : Visitor<Unit> {
                override fun visitIndividualBeneficiary(
                    individualBeneficiary: IndividualBeneficiary
                ) {
                    individualBeneficiary.validate()
                }

                override fun visitBusinessBeneficiary(businessBeneficiary: BusinessBeneficiary) {
                    businessBeneficiary.validate()
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
                override fun visitIndividualBeneficiary(
                    individualBeneficiary: IndividualBeneficiary
                ) = individualBeneficiary.validity()

                override fun visitBusinessBeneficiary(businessBeneficiary: BusinessBeneficiary) =
                    businessBeneficiary.validity()

                override fun unknown(json: JsonValue?) = 0
            }
        )

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is BeneficiaryOneOf &&
            individualBeneficiary == other.individualBeneficiary &&
            businessBeneficiary == other.businessBeneficiary
    }

    override fun hashCode(): Int = Objects.hash(individualBeneficiary, businessBeneficiary)

    override fun toString(): String =
        when {
            individualBeneficiary != null ->
                "BeneficiaryOneOf{individualBeneficiary=$individualBeneficiary}"
            businessBeneficiary != null ->
                "BeneficiaryOneOf{businessBeneficiary=$businessBeneficiary}"
            _json != null -> "BeneficiaryOneOf{_unknown=$_json}"
            else -> throw IllegalStateException("Invalid BeneficiaryOneOf")
        }

    companion object {

        fun ofIndividualBeneficiary(individualBeneficiary: IndividualBeneficiary) =
            BeneficiaryOneOf(individualBeneficiary = individualBeneficiary)

        fun ofBusinessBeneficiary(businessBeneficiary: BusinessBeneficiary) =
            BeneficiaryOneOf(businessBeneficiary = businessBeneficiary)
    }

    /**
     * An interface that defines how to map each variant of [BeneficiaryOneOf] to a value of type
     * [T].
     */
    interface Visitor<out T> {

        fun visitIndividualBeneficiary(individualBeneficiary: IndividualBeneficiary): T

        fun visitBusinessBeneficiary(businessBeneficiary: BusinessBeneficiary): T

        /**
         * Maps an unknown variant of [BeneficiaryOneOf] to a value of type [T].
         *
         * An instance of [BeneficiaryOneOf] can contain an unknown variant if it was deserialized
         * from data that doesn't match any known variant. For example, if the SDK is on an older
         * version than the API, then the API may respond with new variants that the SDK is unaware
         * of.
         *
         * @throws GridInvalidDataException in the default implementation.
         */
        fun unknown(json: JsonValue?): T {
            throw GridInvalidDataException("Unknown BeneficiaryOneOf: $json")
        }
    }

    internal class Deserializer : BaseDeserializer<BeneficiaryOneOf>(BeneficiaryOneOf::class) {

        override fun ObjectCodec.deserialize(node: JsonNode): BeneficiaryOneOf {
            val json = JsonValue.fromJsonNode(node)

            val bestMatches =
                sequenceOf(
                        tryDeserialize(node, jacksonTypeRef<IndividualBeneficiary>())?.let {
                            BeneficiaryOneOf(individualBeneficiary = it, _json = json)
                        },
                        tryDeserialize(node, jacksonTypeRef<BusinessBeneficiary>())?.let {
                            BeneficiaryOneOf(businessBeneficiary = it, _json = json)
                        },
                    )
                    .filterNotNull()
                    .allMaxBy { it.validity() }
                    .toList()
            return when (bestMatches.size) {
                // This can happen if what we're deserializing is completely incompatible with all
                // the possible variants (e.g. deserializing from boolean).
                0 -> BeneficiaryOneOf(_json = json)
                1 -> bestMatches.single()
                // If there's more than one match with the highest validity, then use the first
                // completely valid match, or simply the first match if none are completely valid.
                else -> bestMatches.firstOrNull { it.isValid() } ?: bestMatches.first()
            }
        }
    }

    internal class Serializer : BaseSerializer<BeneficiaryOneOf>(BeneficiaryOneOf::class) {

        override fun serialize(
            value: BeneficiaryOneOf,
            generator: JsonGenerator,
            provider: SerializerProvider,
        ) {
            when {
                value.individualBeneficiary != null ->
                    generator.writeObject(value.individualBeneficiary)
                value.businessBeneficiary != null ->
                    generator.writeObject(value.businessBeneficiary)
                value._json != null -> generator.writeObject(value._json)
                else -> throw IllegalStateException("Invalid BeneficiaryOneOf")
            }
        }
    }
}
