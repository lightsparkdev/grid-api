// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.customers

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

@JsonDeserialize(using = CustomerRetrieveResponse.Deserializer::class)
@JsonSerialize(using = CustomerRetrieveResponse.Serializer::class)
class CustomerRetrieveResponse
private constructor(
    private val individualCustomer: IndividualCustomer? = null,
    private val businessCustomer: BusinessCustomer? = null,
    private val _json: JsonValue? = null,
) {

    fun individualCustomer(): IndividualCustomer? = individualCustomer

    fun businessCustomer(): BusinessCustomer? = businessCustomer

    fun isIndividualCustomer(): Boolean = individualCustomer != null

    fun isBusinessCustomer(): Boolean = businessCustomer != null

    fun asIndividualCustomer(): IndividualCustomer =
        individualCustomer.getOrThrow("individualCustomer")

    fun asBusinessCustomer(): BusinessCustomer = businessCustomer.getOrThrow("businessCustomer")

    fun _json(): JsonValue? = _json

    fun <T> accept(visitor: Visitor<T>): T =
        when {
            individualCustomer != null -> visitor.visitIndividualCustomer(individualCustomer)
            businessCustomer != null -> visitor.visitBusinessCustomer(businessCustomer)
            else -> visitor.unknown(_json)
        }

    private var validated: Boolean = false

    fun validate(): CustomerRetrieveResponse = apply {
        if (validated) {
            return@apply
        }

        accept(
            object : Visitor<Unit> {
                override fun visitIndividualCustomer(individualCustomer: IndividualCustomer) {
                    individualCustomer.validate()
                }

                override fun visitBusinessCustomer(businessCustomer: BusinessCustomer) {
                    businessCustomer.validate()
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
                override fun visitIndividualCustomer(individualCustomer: IndividualCustomer) =
                    individualCustomer.validity()

                override fun visitBusinessCustomer(businessCustomer: BusinessCustomer) =
                    businessCustomer.validity()

                override fun unknown(json: JsonValue?) = 0
            }
        )

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is CustomerRetrieveResponse &&
            individualCustomer == other.individualCustomer &&
            businessCustomer == other.businessCustomer
    }

    override fun hashCode(): Int = Objects.hash(individualCustomer, businessCustomer)

    override fun toString(): String =
        when {
            individualCustomer != null ->
                "CustomerRetrieveResponse{individualCustomer=$individualCustomer}"
            businessCustomer != null ->
                "CustomerRetrieveResponse{businessCustomer=$businessCustomer}"
            _json != null -> "CustomerRetrieveResponse{_unknown=$_json}"
            else -> throw IllegalStateException("Invalid CustomerRetrieveResponse")
        }

    companion object {

        fun ofIndividualCustomer(individualCustomer: IndividualCustomer) =
            CustomerRetrieveResponse(individualCustomer = individualCustomer)

        fun ofBusinessCustomer(businessCustomer: BusinessCustomer) =
            CustomerRetrieveResponse(businessCustomer = businessCustomer)
    }

    /**
     * An interface that defines how to map each variant of [CustomerRetrieveResponse] to a value of
     * type [T].
     */
    interface Visitor<out T> {

        fun visitIndividualCustomer(individualCustomer: IndividualCustomer): T

        fun visitBusinessCustomer(businessCustomer: BusinessCustomer): T

        /**
         * Maps an unknown variant of [CustomerRetrieveResponse] to a value of type [T].
         *
         * An instance of [CustomerRetrieveResponse] can contain an unknown variant if it was
         * deserialized from data that doesn't match any known variant. For example, if the SDK is
         * on an older version than the API, then the API may respond with new variants that the SDK
         * is unaware of.
         *
         * @throws GridInvalidDataException in the default implementation.
         */
        fun unknown(json: JsonValue?): T {
            throw GridInvalidDataException("Unknown CustomerRetrieveResponse: $json")
        }
    }

    internal class Deserializer :
        BaseDeserializer<CustomerRetrieveResponse>(CustomerRetrieveResponse::class) {

        override fun ObjectCodec.deserialize(node: JsonNode): CustomerRetrieveResponse {
            val json = JsonValue.fromJsonNode(node)

            val bestMatches =
                sequenceOf(
                        tryDeserialize(node, jacksonTypeRef<IndividualCustomer>())?.let {
                            CustomerRetrieveResponse(individualCustomer = it, _json = json)
                        },
                        tryDeserialize(node, jacksonTypeRef<BusinessCustomer>())?.let {
                            CustomerRetrieveResponse(businessCustomer = it, _json = json)
                        },
                    )
                    .filterNotNull()
                    .allMaxBy { it.validity() }
                    .toList()
            return when (bestMatches.size) {
                // This can happen if what we're deserializing is completely incompatible with all
                // the possible variants (e.g. deserializing from boolean).
                0 -> CustomerRetrieveResponse(_json = json)
                1 -> bestMatches.single()
                // If there's more than one match with the highest validity, then use the first
                // completely valid match, or simply the first match if none are completely valid.
                else -> bestMatches.firstOrNull { it.isValid() } ?: bestMatches.first()
            }
        }
    }

    internal class Serializer :
        BaseSerializer<CustomerRetrieveResponse>(CustomerRetrieveResponse::class) {

        override fun serialize(
            value: CustomerRetrieveResponse,
            generator: JsonGenerator,
            provider: SerializerProvider,
        ) {
            when {
                value.individualCustomer != null -> generator.writeObject(value.individualCustomer)
                value.businessCustomer != null -> generator.writeObject(value.businessCustomer)
                value._json != null -> generator.writeObject(value._json)
                else -> throw IllegalStateException("Invalid CustomerRetrieveResponse")
            }
        }
    }
}
