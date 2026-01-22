// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.umaproviders

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
import com.grid.api.models.quotes.Currency
import java.util.Collections
import java.util.Objects

class UmaProviderListResponse
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val data: JsonField<List<Data>>,
    private val hasMore: JsonField<Boolean>,
    private val nextCursor: JsonField<String>,
    private val totalCount: JsonField<Long>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("data") @ExcludeMissing data: JsonField<List<Data>> = JsonMissing.of(),
        @JsonProperty("hasMore") @ExcludeMissing hasMore: JsonField<Boolean> = JsonMissing.of(),
        @JsonProperty("nextCursor")
        @ExcludeMissing
        nextCursor: JsonField<String> = JsonMissing.of(),
        @JsonProperty("totalCount") @ExcludeMissing totalCount: JsonField<Long> = JsonMissing.of(),
    ) : this(data, hasMore, nextCursor, totalCount, mutableMapOf())

    /**
     * List of available UMA Providers using Grid
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun data(): List<Data>? = data.getNullable("data")

    /**
     * Indicates if more results are available beyond this page
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun hasMore(): Boolean? = hasMore.getNullable("hasMore")

    /**
     * Cursor to retrieve the next page of results (only present if hasMore is true)
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun nextCursor(): String? = nextCursor.getNullable("nextCursor")

    /**
     * Total number of transactions matching the criteria (excluding pagination)
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun totalCount(): Long? = totalCount.getNullable("totalCount")

    /**
     * Returns the raw JSON value of [data].
     *
     * Unlike [data], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("data") @ExcludeMissing fun _data(): JsonField<List<Data>> = data

    /**
     * Returns the raw JSON value of [hasMore].
     *
     * Unlike [hasMore], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("hasMore") @ExcludeMissing fun _hasMore(): JsonField<Boolean> = hasMore

    /**
     * Returns the raw JSON value of [nextCursor].
     *
     * Unlike [nextCursor], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("nextCursor") @ExcludeMissing fun _nextCursor(): JsonField<String> = nextCursor

    /**
     * Returns the raw JSON value of [totalCount].
     *
     * Unlike [totalCount], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("totalCount") @ExcludeMissing fun _totalCount(): JsonField<Long> = totalCount

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

        /** Returns a mutable builder for constructing an instance of [UmaProviderListResponse]. */
        fun builder() = Builder()
    }

    /** A builder for [UmaProviderListResponse]. */
    class Builder internal constructor() {

        private var data: JsonField<MutableList<Data>>? = null
        private var hasMore: JsonField<Boolean> = JsonMissing.of()
        private var nextCursor: JsonField<String> = JsonMissing.of()
        private var totalCount: JsonField<Long> = JsonMissing.of()
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(umaProviderListResponse: UmaProviderListResponse) = apply {
            data = umaProviderListResponse.data.map { it.toMutableList() }
            hasMore = umaProviderListResponse.hasMore
            nextCursor = umaProviderListResponse.nextCursor
            totalCount = umaProviderListResponse.totalCount
            additionalProperties = umaProviderListResponse.additionalProperties.toMutableMap()
        }

        /** List of available UMA Providers using Grid */
        fun data(data: List<Data>) = data(JsonField.of(data))

        /**
         * Sets [Builder.data] to an arbitrary JSON value.
         *
         * You should usually call [Builder.data] with a well-typed `List<Data>` value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun data(data: JsonField<List<Data>>) = apply {
            this.data = data.map { it.toMutableList() }
        }

        /**
         * Adds a single [Data] to [Builder.data].
         *
         * @throws IllegalStateException if the field was previously set to a non-list.
         */
        fun addData(data: Data) = apply {
            this.data =
                (this.data ?: JsonField.of(mutableListOf())).also {
                    checkKnown("data", it).add(data)
                }
        }

        /** Indicates if more results are available beyond this page */
        fun hasMore(hasMore: Boolean) = hasMore(JsonField.of(hasMore))

        /**
         * Sets [Builder.hasMore] to an arbitrary JSON value.
         *
         * You should usually call [Builder.hasMore] with a well-typed [Boolean] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun hasMore(hasMore: JsonField<Boolean>) = apply { this.hasMore = hasMore }

        /** Cursor to retrieve the next page of results (only present if hasMore is true) */
        fun nextCursor(nextCursor: String) = nextCursor(JsonField.of(nextCursor))

        /**
         * Sets [Builder.nextCursor] to an arbitrary JSON value.
         *
         * You should usually call [Builder.nextCursor] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun nextCursor(nextCursor: JsonField<String>) = apply { this.nextCursor = nextCursor }

        /** Total number of transactions matching the criteria (excluding pagination) */
        fun totalCount(totalCount: Long) = totalCount(JsonField.of(totalCount))

        /**
         * Sets [Builder.totalCount] to an arbitrary JSON value.
         *
         * You should usually call [Builder.totalCount] with a well-typed [Long] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun totalCount(totalCount: JsonField<Long>) = apply { this.totalCount = totalCount }

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
         * Returns an immutable instance of [UmaProviderListResponse].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         */
        fun build(): UmaProviderListResponse =
            UmaProviderListResponse(
                (data ?: JsonMissing.of()).map { it.toImmutable() },
                hasMore,
                nextCursor,
                totalCount,
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): UmaProviderListResponse = apply {
        if (validated) {
            return@apply
        }

        data()?.forEach { it.validate() }
        hasMore()
        nextCursor()
        totalCount()
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
        (data.asKnown()?.sumOf { it.validity().toInt() } ?: 0) +
            (if (hasMore.asKnown() == null) 0 else 1) +
            (if (nextCursor.asKnown() == null) 0 else 1) +
            (if (totalCount.asKnown() == null) 0 else 1)

    class Data
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    private constructor(
        private val allowListStatus: JsonField<Boolean>,
        private val domain: JsonField<String>,
        private val lei: JsonField<String>,
        private val logoUrl: JsonField<String>,
        private val name: JsonField<String>,
        private val supportedCurrencies: JsonField<List<Currency>>,
        private val supportedRegions: JsonField<List<String>>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("allowListStatus")
            @ExcludeMissing
            allowListStatus: JsonField<Boolean> = JsonMissing.of(),
            @JsonProperty("domain") @ExcludeMissing domain: JsonField<String> = JsonMissing.of(),
            @JsonProperty("lei") @ExcludeMissing lei: JsonField<String> = JsonMissing.of(),
            @JsonProperty("logoUrl") @ExcludeMissing logoUrl: JsonField<String> = JsonMissing.of(),
            @JsonProperty("name") @ExcludeMissing name: JsonField<String> = JsonMissing.of(),
            @JsonProperty("supportedCurrencies")
            @ExcludeMissing
            supportedCurrencies: JsonField<List<Currency>> = JsonMissing.of(),
            @JsonProperty("supportedRegions")
            @ExcludeMissing
            supportedRegions: JsonField<List<String>> = JsonMissing.of(),
        ) : this(
            allowListStatus,
            domain,
            lei,
            logoUrl,
            name,
            supportedCurrencies,
            supportedRegions,
            mutableMapOf(),
        )

        /**
         * Whether this UMA Provider is on your allow list
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun allowListStatus(): Boolean? = allowListStatus.getNullable("allowListStatus")

        /**
         * Domain this VASP uses for UMA addresses
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun domain(): String? = domain.getNullable("domain")

        /**
         * Legal Entity Identifier for the UMA Provider
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun lei(): String? = lei.getNullable("lei")

        /**
         * Logo URL for the VASP
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun logoUrl(): String? = logoUrl.getNullable("logoUrl")

        /**
         * Name of the UMA Provider
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun name(): String? = name.getNullable("name")

        /**
         * List of currencies supported by this UMA Provider
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun supportedCurrencies(): List<Currency>? =
            supportedCurrencies.getNullable("supportedCurrencies")

        /**
         * Region(s) this UMA Provider operates in
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun supportedRegions(): List<String>? = supportedRegions.getNullable("supportedRegions")

        /**
         * Returns the raw JSON value of [allowListStatus].
         *
         * Unlike [allowListStatus], this method doesn't throw if the JSON field has an unexpected
         * type.
         */
        @JsonProperty("allowListStatus")
        @ExcludeMissing
        fun _allowListStatus(): JsonField<Boolean> = allowListStatus

        /**
         * Returns the raw JSON value of [domain].
         *
         * Unlike [domain], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("domain") @ExcludeMissing fun _domain(): JsonField<String> = domain

        /**
         * Returns the raw JSON value of [lei].
         *
         * Unlike [lei], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("lei") @ExcludeMissing fun _lei(): JsonField<String> = lei

        /**
         * Returns the raw JSON value of [logoUrl].
         *
         * Unlike [logoUrl], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("logoUrl") @ExcludeMissing fun _logoUrl(): JsonField<String> = logoUrl

        /**
         * Returns the raw JSON value of [name].
         *
         * Unlike [name], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("name") @ExcludeMissing fun _name(): JsonField<String> = name

        /**
         * Returns the raw JSON value of [supportedCurrencies].
         *
         * Unlike [supportedCurrencies], this method doesn't throw if the JSON field has an
         * unexpected type.
         */
        @JsonProperty("supportedCurrencies")
        @ExcludeMissing
        fun _supportedCurrencies(): JsonField<List<Currency>> = supportedCurrencies

        /**
         * Returns the raw JSON value of [supportedRegions].
         *
         * Unlike [supportedRegions], this method doesn't throw if the JSON field has an unexpected
         * type.
         */
        @JsonProperty("supportedRegions")
        @ExcludeMissing
        fun _supportedRegions(): JsonField<List<String>> = supportedRegions

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

            /** Returns a mutable builder for constructing an instance of [Data]. */
            fun builder() = Builder()
        }

        /** A builder for [Data]. */
        class Builder internal constructor() {

            private var allowListStatus: JsonField<Boolean> = JsonMissing.of()
            private var domain: JsonField<String> = JsonMissing.of()
            private var lei: JsonField<String> = JsonMissing.of()
            private var logoUrl: JsonField<String> = JsonMissing.of()
            private var name: JsonField<String> = JsonMissing.of()
            private var supportedCurrencies: JsonField<MutableList<Currency>>? = null
            private var supportedRegions: JsonField<MutableList<String>>? = null
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(data: Data) = apply {
                allowListStatus = data.allowListStatus
                domain = data.domain
                lei = data.lei
                logoUrl = data.logoUrl
                name = data.name
                supportedCurrencies = data.supportedCurrencies.map { it.toMutableList() }
                supportedRegions = data.supportedRegions.map { it.toMutableList() }
                additionalProperties = data.additionalProperties.toMutableMap()
            }

            /** Whether this UMA Provider is on your allow list */
            fun allowListStatus(allowListStatus: Boolean) =
                allowListStatus(JsonField.of(allowListStatus))

            /**
             * Sets [Builder.allowListStatus] to an arbitrary JSON value.
             *
             * You should usually call [Builder.allowListStatus] with a well-typed [Boolean] value
             * instead. This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun allowListStatus(allowListStatus: JsonField<Boolean>) = apply {
                this.allowListStatus = allowListStatus
            }

            /** Domain this VASP uses for UMA addresses */
            fun domain(domain: String) = domain(JsonField.of(domain))

            /**
             * Sets [Builder.domain] to an arbitrary JSON value.
             *
             * You should usually call [Builder.domain] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun domain(domain: JsonField<String>) = apply { this.domain = domain }

            /** Legal Entity Identifier for the UMA Provider */
            fun lei(lei: String) = lei(JsonField.of(lei))

            /**
             * Sets [Builder.lei] to an arbitrary JSON value.
             *
             * You should usually call [Builder.lei] with a well-typed [String] value instead. This
             * method is primarily for setting the field to an undocumented or not yet supported
             * value.
             */
            fun lei(lei: JsonField<String>) = apply { this.lei = lei }

            /** Logo URL for the VASP */
            fun logoUrl(logoUrl: String) = logoUrl(JsonField.of(logoUrl))

            /**
             * Sets [Builder.logoUrl] to an arbitrary JSON value.
             *
             * You should usually call [Builder.logoUrl] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun logoUrl(logoUrl: JsonField<String>) = apply { this.logoUrl = logoUrl }

            /** Name of the UMA Provider */
            fun name(name: String) = name(JsonField.of(name))

            /**
             * Sets [Builder.name] to an arbitrary JSON value.
             *
             * You should usually call [Builder.name] with a well-typed [String] value instead. This
             * method is primarily for setting the field to an undocumented or not yet supported
             * value.
             */
            fun name(name: JsonField<String>) = apply { this.name = name }

            /** List of currencies supported by this UMA Provider */
            fun supportedCurrencies(supportedCurrencies: List<Currency>) =
                supportedCurrencies(JsonField.of(supportedCurrencies))

            /**
             * Sets [Builder.supportedCurrencies] to an arbitrary JSON value.
             *
             * You should usually call [Builder.supportedCurrencies] with a well-typed
             * `List<Currency>` value instead. This method is primarily for setting the field to an
             * undocumented or not yet supported value.
             */
            fun supportedCurrencies(supportedCurrencies: JsonField<List<Currency>>) = apply {
                this.supportedCurrencies = supportedCurrencies.map { it.toMutableList() }
            }

            /**
             * Adds a single [Currency] to [supportedCurrencies].
             *
             * @throws IllegalStateException if the field was previously set to a non-list.
             */
            fun addSupportedCurrency(supportedCurrency: Currency) = apply {
                supportedCurrencies =
                    (supportedCurrencies ?: JsonField.of(mutableListOf())).also {
                        checkKnown("supportedCurrencies", it).add(supportedCurrency)
                    }
            }

            /** Region(s) this UMA Provider operates in */
            fun supportedRegions(supportedRegions: List<String>) =
                supportedRegions(JsonField.of(supportedRegions))

            /**
             * Sets [Builder.supportedRegions] to an arbitrary JSON value.
             *
             * You should usually call [Builder.supportedRegions] with a well-typed `List<String>`
             * value instead. This method is primarily for setting the field to an undocumented or
             * not yet supported value.
             */
            fun supportedRegions(supportedRegions: JsonField<List<String>>) = apply {
                this.supportedRegions = supportedRegions.map { it.toMutableList() }
            }

            /**
             * Adds a single [String] to [supportedRegions].
             *
             * @throws IllegalStateException if the field was previously set to a non-list.
             */
            fun addSupportedRegion(supportedRegion: String) = apply {
                supportedRegions =
                    (supportedRegions ?: JsonField.of(mutableListOf())).also {
                        checkKnown("supportedRegions", it).add(supportedRegion)
                    }
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
             * Returns an immutable instance of [Data].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             */
            fun build(): Data =
                Data(
                    allowListStatus,
                    domain,
                    lei,
                    logoUrl,
                    name,
                    (supportedCurrencies ?: JsonMissing.of()).map { it.toImmutable() },
                    (supportedRegions ?: JsonMissing.of()).map { it.toImmutable() },
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): Data = apply {
            if (validated) {
                return@apply
            }

            allowListStatus()
            domain()
            lei()
            logoUrl()
            name()
            supportedCurrencies()?.forEach { it.validate() }
            supportedRegions()
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
            (if (allowListStatus.asKnown() == null) 0 else 1) +
                (if (domain.asKnown() == null) 0 else 1) +
                (if (lei.asKnown() == null) 0 else 1) +
                (if (logoUrl.asKnown() == null) 0 else 1) +
                (if (name.asKnown() == null) 0 else 1) +
                (supportedCurrencies.asKnown()?.sumOf { it.validity().toInt() } ?: 0) +
                (supportedRegions.asKnown()?.size ?: 0)

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is Data &&
                allowListStatus == other.allowListStatus &&
                domain == other.domain &&
                lei == other.lei &&
                logoUrl == other.logoUrl &&
                name == other.name &&
                supportedCurrencies == other.supportedCurrencies &&
                supportedRegions == other.supportedRegions &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(
                allowListStatus,
                domain,
                lei,
                logoUrl,
                name,
                supportedCurrencies,
                supportedRegions,
                additionalProperties,
            )
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "Data{allowListStatus=$allowListStatus, domain=$domain, lei=$lei, logoUrl=$logoUrl, name=$name, supportedCurrencies=$supportedCurrencies, supportedRegions=$supportedRegions, additionalProperties=$additionalProperties}"
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is UmaProviderListResponse &&
            data == other.data &&
            hasMore == other.hasMore &&
            nextCursor == other.nextCursor &&
            totalCount == other.totalCount &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(data, hasMore, nextCursor, totalCount, additionalProperties)
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "UmaProviderListResponse{data=$data, hasMore=$hasMore, nextCursor=$nextCursor, totalCount=$totalCount, additionalProperties=$additionalProperties}"
}
