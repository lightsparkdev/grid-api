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
import com.grid.api.core.Params
import com.grid.api.core.checkKnown
import com.grid.api.core.http.Headers
import com.grid.api.core.http.QueryParams
import com.grid.api.core.toImmutable
import com.grid.api.errors.GridInvalidDataException
import java.util.Collections
import java.util.Objects

/** Update the platform configuration settings */
class ConfigUpdateParams
private constructor(
    private val body: Body,
    private val additionalHeaders: Headers,
    private val additionalQueryParams: QueryParams,
) : Params {

    /**
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun supportedCurrencies(): List<PlatformCurrencyConfig>? = body.supportedCurrencies()

    /**
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun umaDomain(): String? = body.umaDomain()

    /**
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun webhookEndpoint(): String? = body.webhookEndpoint()

    /**
     * Returns the raw JSON value of [supportedCurrencies].
     *
     * Unlike [supportedCurrencies], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    fun _supportedCurrencies(): JsonField<List<PlatformCurrencyConfig>> =
        body._supportedCurrencies()

    /**
     * Returns the raw JSON value of [umaDomain].
     *
     * Unlike [umaDomain], this method doesn't throw if the JSON field has an unexpected type.
     */
    fun _umaDomain(): JsonField<String> = body._umaDomain()

    /**
     * Returns the raw JSON value of [webhookEndpoint].
     *
     * Unlike [webhookEndpoint], this method doesn't throw if the JSON field has an unexpected type.
     */
    fun _webhookEndpoint(): JsonField<String> = body._webhookEndpoint()

    fun _additionalBodyProperties(): Map<String, JsonValue> = body._additionalProperties()

    /** Additional headers to send with the request. */
    fun _additionalHeaders(): Headers = additionalHeaders

    /** Additional query param to send with the request. */
    fun _additionalQueryParams(): QueryParams = additionalQueryParams

    fun toBuilder() = Builder().from(this)

    companion object {

        fun none(): ConfigUpdateParams = builder().build()

        /** Returns a mutable builder for constructing an instance of [ConfigUpdateParams]. */
        fun builder() = Builder()
    }

    /** A builder for [ConfigUpdateParams]. */
    class Builder internal constructor() {

        private var body: Body.Builder = Body.builder()
        private var additionalHeaders: Headers.Builder = Headers.builder()
        private var additionalQueryParams: QueryParams.Builder = QueryParams.builder()

        internal fun from(configUpdateParams: ConfigUpdateParams) = apply {
            body = configUpdateParams.body.toBuilder()
            additionalHeaders = configUpdateParams.additionalHeaders.toBuilder()
            additionalQueryParams = configUpdateParams.additionalQueryParams.toBuilder()
        }

        /**
         * Sets the entire request body.
         *
         * This is generally only useful if you are already constructing the body separately.
         * Otherwise, it's more convenient to use the top-level setters instead:
         * - [supportedCurrencies]
         * - [umaDomain]
         * - [webhookEndpoint]
         */
        fun body(body: Body) = apply { this.body = body.toBuilder() }

        fun supportedCurrencies(supportedCurrencies: List<PlatformCurrencyConfig>) = apply {
            body.supportedCurrencies(supportedCurrencies)
        }

        /**
         * Sets [Builder.supportedCurrencies] to an arbitrary JSON value.
         *
         * You should usually call [Builder.supportedCurrencies] with a well-typed
         * `List<PlatformCurrencyConfig>` value instead. This method is primarily for setting the
         * field to an undocumented or not yet supported value.
         */
        fun supportedCurrencies(supportedCurrencies: JsonField<List<PlatformCurrencyConfig>>) =
            apply {
                body.supportedCurrencies(supportedCurrencies)
            }

        /**
         * Adds a single [PlatformCurrencyConfig] to [supportedCurrencies].
         *
         * @throws IllegalStateException if the field was previously set to a non-list.
         */
        fun addSupportedCurrency(supportedCurrency: PlatformCurrencyConfig) = apply {
            body.addSupportedCurrency(supportedCurrency)
        }

        fun umaDomain(umaDomain: String) = apply { body.umaDomain(umaDomain) }

        /**
         * Sets [Builder.umaDomain] to an arbitrary JSON value.
         *
         * You should usually call [Builder.umaDomain] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun umaDomain(umaDomain: JsonField<String>) = apply { body.umaDomain(umaDomain) }

        fun webhookEndpoint(webhookEndpoint: String) = apply {
            body.webhookEndpoint(webhookEndpoint)
        }

        /**
         * Sets [Builder.webhookEndpoint] to an arbitrary JSON value.
         *
         * You should usually call [Builder.webhookEndpoint] with a well-typed [String] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun webhookEndpoint(webhookEndpoint: JsonField<String>) = apply {
            body.webhookEndpoint(webhookEndpoint)
        }

        fun additionalBodyProperties(additionalBodyProperties: Map<String, JsonValue>) = apply {
            body.additionalProperties(additionalBodyProperties)
        }

        fun putAdditionalBodyProperty(key: String, value: JsonValue) = apply {
            body.putAdditionalProperty(key, value)
        }

        fun putAllAdditionalBodyProperties(additionalBodyProperties: Map<String, JsonValue>) =
            apply {
                body.putAllAdditionalProperties(additionalBodyProperties)
            }

        fun removeAdditionalBodyProperty(key: String) = apply { body.removeAdditionalProperty(key) }

        fun removeAllAdditionalBodyProperties(keys: Set<String>) = apply {
            body.removeAllAdditionalProperties(keys)
        }

        fun additionalHeaders(additionalHeaders: Headers) = apply {
            this.additionalHeaders.clear()
            putAllAdditionalHeaders(additionalHeaders)
        }

        fun additionalHeaders(additionalHeaders: Map<String, Iterable<String>>) = apply {
            this.additionalHeaders.clear()
            putAllAdditionalHeaders(additionalHeaders)
        }

        fun putAdditionalHeader(name: String, value: String) = apply {
            additionalHeaders.put(name, value)
        }

        fun putAdditionalHeaders(name: String, values: Iterable<String>) = apply {
            additionalHeaders.put(name, values)
        }

        fun putAllAdditionalHeaders(additionalHeaders: Headers) = apply {
            this.additionalHeaders.putAll(additionalHeaders)
        }

        fun putAllAdditionalHeaders(additionalHeaders: Map<String, Iterable<String>>) = apply {
            this.additionalHeaders.putAll(additionalHeaders)
        }

        fun replaceAdditionalHeaders(name: String, value: String) = apply {
            additionalHeaders.replace(name, value)
        }

        fun replaceAdditionalHeaders(name: String, values: Iterable<String>) = apply {
            additionalHeaders.replace(name, values)
        }

        fun replaceAllAdditionalHeaders(additionalHeaders: Headers) = apply {
            this.additionalHeaders.replaceAll(additionalHeaders)
        }

        fun replaceAllAdditionalHeaders(additionalHeaders: Map<String, Iterable<String>>) = apply {
            this.additionalHeaders.replaceAll(additionalHeaders)
        }

        fun removeAdditionalHeaders(name: String) = apply { additionalHeaders.remove(name) }

        fun removeAllAdditionalHeaders(names: Set<String>) = apply {
            additionalHeaders.removeAll(names)
        }

        fun additionalQueryParams(additionalQueryParams: QueryParams) = apply {
            this.additionalQueryParams.clear()
            putAllAdditionalQueryParams(additionalQueryParams)
        }

        fun additionalQueryParams(additionalQueryParams: Map<String, Iterable<String>>) = apply {
            this.additionalQueryParams.clear()
            putAllAdditionalQueryParams(additionalQueryParams)
        }

        fun putAdditionalQueryParam(key: String, value: String) = apply {
            additionalQueryParams.put(key, value)
        }

        fun putAdditionalQueryParams(key: String, values: Iterable<String>) = apply {
            additionalQueryParams.put(key, values)
        }

        fun putAllAdditionalQueryParams(additionalQueryParams: QueryParams) = apply {
            this.additionalQueryParams.putAll(additionalQueryParams)
        }

        fun putAllAdditionalQueryParams(additionalQueryParams: Map<String, Iterable<String>>) =
            apply {
                this.additionalQueryParams.putAll(additionalQueryParams)
            }

        fun replaceAdditionalQueryParams(key: String, value: String) = apply {
            additionalQueryParams.replace(key, value)
        }

        fun replaceAdditionalQueryParams(key: String, values: Iterable<String>) = apply {
            additionalQueryParams.replace(key, values)
        }

        fun replaceAllAdditionalQueryParams(additionalQueryParams: QueryParams) = apply {
            this.additionalQueryParams.replaceAll(additionalQueryParams)
        }

        fun replaceAllAdditionalQueryParams(additionalQueryParams: Map<String, Iterable<String>>) =
            apply {
                this.additionalQueryParams.replaceAll(additionalQueryParams)
            }

        fun removeAdditionalQueryParams(key: String) = apply { additionalQueryParams.remove(key) }

        fun removeAllAdditionalQueryParams(keys: Set<String>) = apply {
            additionalQueryParams.removeAll(keys)
        }

        /**
         * Returns an immutable instance of [ConfigUpdateParams].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         */
        fun build(): ConfigUpdateParams =
            ConfigUpdateParams(
                body.build(),
                additionalHeaders.build(),
                additionalQueryParams.build(),
            )
    }

    fun _body(): Body = body

    override fun _headers(): Headers = additionalHeaders

    override fun _queryParams(): QueryParams = additionalQueryParams

    class Body
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val supportedCurrencies: JsonField<List<PlatformCurrencyConfig>>,
        private val umaDomain: JsonField<String>,
        private val webhookEndpoint: JsonField<String>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("supportedCurrencies")
            @ExcludeMissing
            supportedCurrencies: JsonField<List<PlatformCurrencyConfig>> = JsonMissing.of(),
            @JsonProperty("umaDomain")
            @ExcludeMissing
            umaDomain: JsonField<String> = JsonMissing.of(),
            @JsonProperty("webhookEndpoint")
            @ExcludeMissing
            webhookEndpoint: JsonField<String> = JsonMissing.of(),
        ) : this(supportedCurrencies, umaDomain, webhookEndpoint, mutableMapOf())

        /**
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun supportedCurrencies(): List<PlatformCurrencyConfig>? =
            supportedCurrencies.getNullable("supportedCurrencies")

        /**
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun umaDomain(): String? = umaDomain.getNullable("umaDomain")

        /**
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun webhookEndpoint(): String? = webhookEndpoint.getNullable("webhookEndpoint")

        /**
         * Returns the raw JSON value of [supportedCurrencies].
         *
         * Unlike [supportedCurrencies], this method doesn't throw if the JSON field has an
         * unexpected type.
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
         * Returns the raw JSON value of [webhookEndpoint].
         *
         * Unlike [webhookEndpoint], this method doesn't throw if the JSON field has an unexpected
         * type.
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

            /** Returns a mutable builder for constructing an instance of [Body]. */
            fun builder() = Builder()
        }

        /** A builder for [Body]. */
        class Builder internal constructor() {

            private var supportedCurrencies: JsonField<MutableList<PlatformCurrencyConfig>>? = null
            private var umaDomain: JsonField<String> = JsonMissing.of()
            private var webhookEndpoint: JsonField<String> = JsonMissing.of()
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(body: Body) = apply {
                supportedCurrencies = body.supportedCurrencies.map { it.toMutableList() }
                umaDomain = body.umaDomain
                webhookEndpoint = body.webhookEndpoint
                additionalProperties = body.additionalProperties.toMutableMap()
            }

            fun supportedCurrencies(supportedCurrencies: List<PlatformCurrencyConfig>) =
                supportedCurrencies(JsonField.of(supportedCurrencies))

            /**
             * Sets [Builder.supportedCurrencies] to an arbitrary JSON value.
             *
             * You should usually call [Builder.supportedCurrencies] with a well-typed
             * `List<PlatformCurrencyConfig>` value instead. This method is primarily for setting
             * the field to an undocumented or not yet supported value.
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

            fun umaDomain(umaDomain: String) = umaDomain(JsonField.of(umaDomain))

            /**
             * Sets [Builder.umaDomain] to an arbitrary JSON value.
             *
             * You should usually call [Builder.umaDomain] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun umaDomain(umaDomain: JsonField<String>) = apply { this.umaDomain = umaDomain }

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
             * Returns an immutable instance of [Body].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             */
            fun build(): Body =
                Body(
                    (supportedCurrencies ?: JsonMissing.of()).map { it.toImmutable() },
                    umaDomain,
                    webhookEndpoint,
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): Body = apply {
            if (validated) {
                return@apply
            }

            supportedCurrencies()?.forEach { it.validate() }
            umaDomain()
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
         * Returns a score indicating how many valid values are contained in this object
         * recursively.
         *
         * Used for best match union deserialization.
         */
        internal fun validity(): Int =
            (supportedCurrencies.asKnown()?.sumOf { it.validity().toInt() } ?: 0) +
                (if (umaDomain.asKnown() == null) 0 else 1) +
                (if (webhookEndpoint.asKnown() == null) 0 else 1)

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is Body &&
                supportedCurrencies == other.supportedCurrencies &&
                umaDomain == other.umaDomain &&
                webhookEndpoint == other.webhookEndpoint &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(supportedCurrencies, umaDomain, webhookEndpoint, additionalProperties)
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "Body{supportedCurrencies=$supportedCurrencies, umaDomain=$umaDomain, webhookEndpoint=$webhookEndpoint, additionalProperties=$additionalProperties}"
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is ConfigUpdateParams &&
            body == other.body &&
            additionalHeaders == other.additionalHeaders &&
            additionalQueryParams == other.additionalQueryParams
    }

    override fun hashCode(): Int = Objects.hash(body, additionalHeaders, additionalQueryParams)

    override fun toString() =
        "ConfigUpdateParams{body=$body, additionalHeaders=$additionalHeaders, additionalQueryParams=$additionalQueryParams}"
}
