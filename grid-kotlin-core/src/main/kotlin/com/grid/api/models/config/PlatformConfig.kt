// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.config

import com.fasterxml.jackson.annotation.JsonAnyGetter
import com.fasterxml.jackson.annotation.JsonAnySetter
import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.grid.api.core.ExcludeMissing
import com.grid.api.core.JsonField
import com.grid.api.core.JsonMissing
import com.grid.api.core.JsonValue
import com.grid.api.core.checkKnown
import com.grid.api.core.toImmutable
import com.grid.api.errors.GridInvalidDataException
import java.time.OffsetDateTime
import java.util.Collections
import java.util.Objects

class PlatformConfig
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val id: JsonField<String>,
    private val createdAt: JsonField<OffsetDateTime>,
    private val isRegulatedFinancialInstitution: JsonField<Boolean>,
    private val proxyUmaSubdomain: JsonField<String>,
    private val supportedCurrencies: JsonField<List<PlatformCurrencyConfig>>,
    private val umaDomain: JsonField<String>,
    private val updatedAt: JsonField<OffsetDateTime>,
    private val webhookEndpoint: JsonField<String>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("id") @ExcludeMissing id: JsonField<String> = JsonMissing.of(),
        @JsonProperty("createdAt")
        @ExcludeMissing
        createdAt: JsonField<OffsetDateTime> = JsonMissing.of(),
        @JsonProperty("isRegulatedFinancialInstitution")
        @ExcludeMissing
        isRegulatedFinancialInstitution: JsonField<Boolean> = JsonMissing.of(),
        @JsonProperty("proxyUmaSubdomain")
        @ExcludeMissing
        proxyUmaSubdomain: JsonField<String> = JsonMissing.of(),
        @JsonProperty("supportedCurrencies")
        @ExcludeMissing
        supportedCurrencies: JsonField<List<PlatformCurrencyConfig>> = JsonMissing.of(),
        @JsonProperty("umaDomain") @ExcludeMissing umaDomain: JsonField<String> = JsonMissing.of(),
        @JsonProperty("updatedAt")
        @ExcludeMissing
        updatedAt: JsonField<OffsetDateTime> = JsonMissing.of(),
        @JsonProperty("webhookEndpoint")
        @ExcludeMissing
        webhookEndpoint: JsonField<String> = JsonMissing.of(),
    ) : this(
        id,
        createdAt,
        isRegulatedFinancialInstitution,
        proxyUmaSubdomain,
        supportedCurrencies,
        umaDomain,
        updatedAt,
        webhookEndpoint,
        mutableMapOf(),
    )

    /**
     * System-generated unique identifier
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun id(): String? = id.getNullable("id")

    /**
     * Creation timestamp
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun createdAt(): OffsetDateTime? = createdAt.getNullable("createdAt")

    /**
     * Whether the platform is a regulated financial institution. This is used to determine if the
     * platform's customers must be KYC/KYB'd by Lightspark via the KYC link flow. This can only be
     * set by Lightspark during platform creation.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun isRegulatedFinancialInstitution(): Boolean? =
        isRegulatedFinancialInstitution.getNullable("isRegulatedFinancialInstitution")

    /**
     * The subdomain that incoming requests will be proxied to
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun proxyUmaSubdomain(): String? = proxyUmaSubdomain.getNullable("proxyUmaSubdomain")

    /**
     * List of currencies supported by the platform. This is what the platform's customers are able
     * to hold, send, and receive.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun supportedCurrencies(): List<PlatformCurrencyConfig>? =
        supportedCurrencies.getNullable("supportedCurrencies")

    /**
     * UMA domain for this platform
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun umaDomain(): String? = umaDomain.getNullable("umaDomain")

    /**
     * Last update timestamp
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun updatedAt(): OffsetDateTime? = updatedAt.getNullable("updatedAt")

    /**
     * URL where webhook notifications will be sent
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun webhookEndpoint(): String? = webhookEndpoint.getNullable("webhookEndpoint")

    /**
     * Returns the raw JSON value of [id].
     *
     * Unlike [id], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("id") @ExcludeMissing fun _id(): JsonField<String> = id

    /**
     * Returns the raw JSON value of [createdAt].
     *
     * Unlike [createdAt], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("createdAt")
    @ExcludeMissing
    fun _createdAt(): JsonField<OffsetDateTime> = createdAt

    /**
     * Returns the raw JSON value of [isRegulatedFinancialInstitution].
     *
     * Unlike [isRegulatedFinancialInstitution], this method doesn't throw if the JSON field has an
     * unexpected type.
     */
    @JsonProperty("isRegulatedFinancialInstitution")
    @ExcludeMissing
    fun _isRegulatedFinancialInstitution(): JsonField<Boolean> = isRegulatedFinancialInstitution

    /**
     * Returns the raw JSON value of [proxyUmaSubdomain].
     *
     * Unlike [proxyUmaSubdomain], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    @JsonProperty("proxyUmaSubdomain")
    @ExcludeMissing
    fun _proxyUmaSubdomain(): JsonField<String> = proxyUmaSubdomain

    /**
     * Returns the raw JSON value of [supportedCurrencies].
     *
     * Unlike [supportedCurrencies], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    @JsonProperty("supportedCurrencies")
    @ExcludeMissing
    fun _supportedCurrencies(): JsonField<List<PlatformCurrencyConfig>> = supportedCurrencies

    /**
     * Returns the raw JSON value of [umaDomain].
     *
     * Unlike [umaDomain], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("umaDomain") @ExcludeMissing fun _umaDomain(): JsonField<String> = umaDomain

    /**
     * Returns the raw JSON value of [updatedAt].
     *
     * Unlike [updatedAt], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("updatedAt")
    @ExcludeMissing
    fun _updatedAt(): JsonField<OffsetDateTime> = updatedAt

    /**
     * Returns the raw JSON value of [webhookEndpoint].
     *
     * Unlike [webhookEndpoint], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("webhookEndpoint")
    @ExcludeMissing
    fun _webhookEndpoint(): JsonField<String> = webhookEndpoint

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

        /** Returns a mutable builder for constructing an instance of [PlatformConfig]. */
        fun builder() = Builder()
    }

    /** A builder for [PlatformConfig]. */
    class Builder internal constructor() {

        private var id: JsonField<String> = JsonMissing.of()
        private var createdAt: JsonField<OffsetDateTime> = JsonMissing.of()
        private var isRegulatedFinancialInstitution: JsonField<Boolean> = JsonMissing.of()
        private var proxyUmaSubdomain: JsonField<String> = JsonMissing.of()
        private var supportedCurrencies: JsonField<MutableList<PlatformCurrencyConfig>>? = null
        private var umaDomain: JsonField<String> = JsonMissing.of()
        private var updatedAt: JsonField<OffsetDateTime> = JsonMissing.of()
        private var webhookEndpoint: JsonField<String> = JsonMissing.of()
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(platformConfig: PlatformConfig) = apply {
            id = platformConfig.id
            createdAt = platformConfig.createdAt
            isRegulatedFinancialInstitution = platformConfig.isRegulatedFinancialInstitution
            proxyUmaSubdomain = platformConfig.proxyUmaSubdomain
            supportedCurrencies = platformConfig.supportedCurrencies.map { it.toMutableList() }
            umaDomain = platformConfig.umaDomain
            updatedAt = platformConfig.updatedAt
            webhookEndpoint = platformConfig.webhookEndpoint
            additionalProperties = platformConfig.additionalProperties.toMutableMap()
        }

        /** System-generated unique identifier */
        fun id(id: String) = id(JsonField.of(id))

        /**
         * Sets [Builder.id] to an arbitrary JSON value.
         *
         * You should usually call [Builder.id] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun id(id: JsonField<String>) = apply { this.id = id }

        /** Creation timestamp */
        fun createdAt(createdAt: OffsetDateTime) = createdAt(JsonField.of(createdAt))

        /**
         * Sets [Builder.createdAt] to an arbitrary JSON value.
         *
         * You should usually call [Builder.createdAt] with a well-typed [OffsetDateTime] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun createdAt(createdAt: JsonField<OffsetDateTime>) = apply { this.createdAt = createdAt }

        /**
         * Whether the platform is a regulated financial institution. This is used to determine if
         * the platform's customers must be KYC/KYB'd by Lightspark via the KYC link flow. This can
         * only be set by Lightspark during platform creation.
         */
        fun isRegulatedFinancialInstitution(isRegulatedFinancialInstitution: Boolean) =
            isRegulatedFinancialInstitution(JsonField.of(isRegulatedFinancialInstitution))

        /**
         * Sets [Builder.isRegulatedFinancialInstitution] to an arbitrary JSON value.
         *
         * You should usually call [Builder.isRegulatedFinancialInstitution] with a well-typed
         * [Boolean] value instead. This method is primarily for setting the field to an
         * undocumented or not yet supported value.
         */
        fun isRegulatedFinancialInstitution(isRegulatedFinancialInstitution: JsonField<Boolean>) =
            apply {
                this.isRegulatedFinancialInstitution = isRegulatedFinancialInstitution
            }

        /** The subdomain that incoming requests will be proxied to */
        fun proxyUmaSubdomain(proxyUmaSubdomain: String) =
            proxyUmaSubdomain(JsonField.of(proxyUmaSubdomain))

        /**
         * Sets [Builder.proxyUmaSubdomain] to an arbitrary JSON value.
         *
         * You should usually call [Builder.proxyUmaSubdomain] with a well-typed [String] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun proxyUmaSubdomain(proxyUmaSubdomain: JsonField<String>) = apply {
            this.proxyUmaSubdomain = proxyUmaSubdomain
        }

        /**
         * List of currencies supported by the platform. This is what the platform's customers are
         * able to hold, send, and receive.
         */
        fun supportedCurrencies(supportedCurrencies: List<PlatformCurrencyConfig>) =
            supportedCurrencies(JsonField.of(supportedCurrencies))

        /**
         * Sets [Builder.supportedCurrencies] to an arbitrary JSON value.
         *
         * You should usually call [Builder.supportedCurrencies] with a well-typed
         * `List<PlatformCurrencyConfig>` value instead. This method is primarily for setting the
         * field to an undocumented or not yet supported value.
         */
        fun supportedCurrencies(supportedCurrencies: JsonField<List<PlatformCurrencyConfig>>) =
            apply {
                this.supportedCurrencies = supportedCurrencies.map { it.toMutableList() }
            }

        /**
         * Adds a single [PlatformCurrencyConfig] to [supportedCurrencies].
         *
         * @throws IllegalStateException if the field was previously set to a non-list.
         */
        fun addSupportedCurrency(supportedCurrency: PlatformCurrencyConfig) = apply {
            supportedCurrencies =
                (supportedCurrencies ?: JsonField.of(mutableListOf())).also {
                    checkKnown("supportedCurrencies", it).add(supportedCurrency)
                }
        }

        /** UMA domain for this platform */
        fun umaDomain(umaDomain: String) = umaDomain(JsonField.of(umaDomain))

        /**
         * Sets [Builder.umaDomain] to an arbitrary JSON value.
         *
         * You should usually call [Builder.umaDomain] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun umaDomain(umaDomain: JsonField<String>) = apply { this.umaDomain = umaDomain }

        /** Last update timestamp */
        fun updatedAt(updatedAt: OffsetDateTime) = updatedAt(JsonField.of(updatedAt))

        /**
         * Sets [Builder.updatedAt] to an arbitrary JSON value.
         *
         * You should usually call [Builder.updatedAt] with a well-typed [OffsetDateTime] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun updatedAt(updatedAt: JsonField<OffsetDateTime>) = apply { this.updatedAt = updatedAt }

        /** URL where webhook notifications will be sent */
        fun webhookEndpoint(webhookEndpoint: String) =
            webhookEndpoint(JsonField.of(webhookEndpoint))

        /**
         * Sets [Builder.webhookEndpoint] to an arbitrary JSON value.
         *
         * You should usually call [Builder.webhookEndpoint] with a well-typed [String] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun webhookEndpoint(webhookEndpoint: JsonField<String>) = apply {
            this.webhookEndpoint = webhookEndpoint
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
         * Returns an immutable instance of [PlatformConfig].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         */
        fun build(): PlatformConfig =
            PlatformConfig(
                id,
                createdAt,
                isRegulatedFinancialInstitution,
                proxyUmaSubdomain,
                (supportedCurrencies ?: JsonMissing.of()).map { it.toImmutable() },
                umaDomain,
                updatedAt,
                webhookEndpoint,
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): PlatformConfig = apply {
        if (validated) {
            return@apply
        }

        id()
        createdAt()
        isRegulatedFinancialInstitution()
        proxyUmaSubdomain()
        supportedCurrencies()?.forEach { it.validate() }
        umaDomain()
        updatedAt()
        webhookEndpoint()
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
            (if (createdAt.asKnown() == null) 0 else 1) +
            (if (isRegulatedFinancialInstitution.asKnown() == null) 0 else 1) +
            (if (proxyUmaSubdomain.asKnown() == null) 0 else 1) +
            (supportedCurrencies.asKnown()?.sumOf { it.validity().toInt() } ?: 0) +
            (if (umaDomain.asKnown() == null) 0 else 1) +
            (if (updatedAt.asKnown() == null) 0 else 1) +
            (if (webhookEndpoint.asKnown() == null) 0 else 1)

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is PlatformConfig &&
            id == other.id &&
            createdAt == other.createdAt &&
            isRegulatedFinancialInstitution == other.isRegulatedFinancialInstitution &&
            proxyUmaSubdomain == other.proxyUmaSubdomain &&
            supportedCurrencies == other.supportedCurrencies &&
            umaDomain == other.umaDomain &&
            updatedAt == other.updatedAt &&
            webhookEndpoint == other.webhookEndpoint &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(
            id,
            createdAt,
            isRegulatedFinancialInstitution,
            proxyUmaSubdomain,
            supportedCurrencies,
            umaDomain,
            updatedAt,
            webhookEndpoint,
            additionalProperties,
        )
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "PlatformConfig{id=$id, createdAt=$createdAt, isRegulatedFinancialInstitution=$isRegulatedFinancialInstitution, proxyUmaSubdomain=$proxyUmaSubdomain, supportedCurrencies=$supportedCurrencies, umaDomain=$umaDomain, updatedAt=$updatedAt, webhookEndpoint=$webhookEndpoint, additionalProperties=$additionalProperties}"
}
