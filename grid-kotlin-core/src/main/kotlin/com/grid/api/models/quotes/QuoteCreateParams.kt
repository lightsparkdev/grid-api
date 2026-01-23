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
import com.grid.api.core.Params
import com.grid.api.core.allMaxBy
import com.grid.api.core.checkRequired
import com.grid.api.core.getOrThrow
import com.grid.api.core.http.Headers
import com.grid.api.core.http.QueryParams
import com.grid.api.core.toImmutable
import com.grid.api.errors.GridInvalidDataException
import com.grid.api.models.customers.externalaccounts.ExternalAccountCreate
import java.util.Collections
import java.util.Objects

/**
 * Generate a quote for a cross-currency transfer between any combination of accounts and UMA
 * addresses. This endpoint handles currency exchange and provides the necessary instructions to
 * execute the transfer.
 *
 * **Transfer Types Supported:**
 * - **Account to Account**: Transfer between internal/external accounts with currency exchange.
 * - **Account to UMA**: Transfer from an internal account to an UMA address.
 * - **UMA to Account or UMA to UMA**: This transfer type will only be funded by payment
 *   instructions, not from an internal account.
 *
 * **Key Features:**
 * - **Flexible Amount Locking**: Always specify whether you want to lock the sending amount or
 *   receiving amount
 * - **Currency Exchange**: Handles all cross-currency transfers with real-time exchange rates
 * - **Payment Instructions**: For UMA or customer ID sources, provides banking details needed for
 *   execution
 *
 * **Important:** If you are transferring funds in the same currency (no exchange required), use the
 * `/transfer-in` or `/transfer-out` endpoints instead.
 *
 * **Sandbox Testing:** When using the `externalAccountDetails` destination type in sandbox mode,
 * use account number patterns ending in specific digits to test different scenarios. These patterns
 * should be used with the primary alias, address, or identifier of whatever account type you're
 * testing. For example, the US account number, a CLABE, an IBAN, a spark wallet address, etc. The
 * failure patterns are:
 * - Account numbers ending in **002**: Insufficient funds (transfer-in will fail)
 * - Account numbers ending in **003**: Account closed/invalid (transfers will fail)
 * - Account numbers ending in **004**: Transfer rejected (bank rejects the transfer)
 * - Account numbers ending in **005**: Timeout/delayed failure (stays pending ~30s, then fails)
 * - Any other account number: Success (transfers complete normally)
 */
class QuoteCreateParams
private constructor(
    private val body: Body,
    private val additionalHeaders: Headers,
    private val additionalQueryParams: QueryParams,
) : Params {

    /**
     * Destination account details
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun destination(): Destination = body.destination()

    /**
     * The amount to send/receive in the smallest unit of the locked currency (eg. cents). See
     * `lockedCurrencySide` for more information.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun lockedCurrencyAmount(): Long = body.lockedCurrencyAmount()

    /**
     * The side of the quote which should be locked and specified in the `lockedCurrencyAmount`. For
     * example, if I want to send exactly $5 MXN from my wallet, I would set this to "sending", and
     * the `lockedCurrencyAmount` to 500 (in cents). If I want the receiver to receive exactly $10
     * USD, I would set this to "receiving" and the `lockedCurrencyAmount` to 10000 (in cents).
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun lockedCurrencySide(): LockedCurrencySide = body.lockedCurrencySide()

    /**
     * Source account details
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun source(): QuoteSource = body.source()

    /**
     * Optional description/memo for the transfer
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun description(): String? = body.description()

    /**
     * Whether to immediately execute the quote after creation. If true, the quote will be executed
     * and the transaction will be created at the current exchange rate. It should only be used if
     * you don't want to lock and view rate details before executing the quote. If you are executing
     * a pre-existing quote, use the `/quotes/{quoteId}/execute` endpoint instead. This is false by
     * default.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun immediatelyExecute(): Boolean? = body.immediatelyExecute()

    /**
     * Lookup ID from a previous receiver lookup request. If provided, this can make the quote
     * creation more efficient by reusing cached lookup data. NOTE: This is required for UMA
     * destinations due to counterparty institution requirements. See `senderCustomerInfo` for more
     * information.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun lookupId(): String? = body.lookupId()

    /**
     * Only relevant for UMA destinations. Key-value pairs of information about the sender which was
     * requested by the counterparty (recipient) institution. Any fields specified in
     * `requiredPayerDataFields` from the response of the `/receiver/uma/{receiverUmaAddress}`
     * (lookupUma) endpoint MUST be provided here if they were requested. If the counterparty
     * (recipient) institution did not request any information, this field can be omitted.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun senderCustomerInfo(): SenderCustomerInfo? = body.senderCustomerInfo()

    /**
     * Returns the raw JSON value of [destination].
     *
     * Unlike [destination], this method doesn't throw if the JSON field has an unexpected type.
     */
    fun _destination(): JsonField<Destination> = body._destination()

    /**
     * Returns the raw JSON value of [lockedCurrencyAmount].
     *
     * Unlike [lockedCurrencyAmount], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    fun _lockedCurrencyAmount(): JsonField<Long> = body._lockedCurrencyAmount()

    /**
     * Returns the raw JSON value of [lockedCurrencySide].
     *
     * Unlike [lockedCurrencySide], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    fun _lockedCurrencySide(): JsonField<LockedCurrencySide> = body._lockedCurrencySide()

    /**
     * Returns the raw JSON value of [source].
     *
     * Unlike [source], this method doesn't throw if the JSON field has an unexpected type.
     */
    fun _source(): JsonField<QuoteSource> = body._source()

    /**
     * Returns the raw JSON value of [description].
     *
     * Unlike [description], this method doesn't throw if the JSON field has an unexpected type.
     */
    fun _description(): JsonField<String> = body._description()

    /**
     * Returns the raw JSON value of [immediatelyExecute].
     *
     * Unlike [immediatelyExecute], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    fun _immediatelyExecute(): JsonField<Boolean> = body._immediatelyExecute()

    /**
     * Returns the raw JSON value of [lookupId].
     *
     * Unlike [lookupId], this method doesn't throw if the JSON field has an unexpected type.
     */
    fun _lookupId(): JsonField<String> = body._lookupId()

    /**
     * Returns the raw JSON value of [senderCustomerInfo].
     *
     * Unlike [senderCustomerInfo], this method doesn't throw if the JSON field has an unexpected
     * type.
     */
    fun _senderCustomerInfo(): JsonField<SenderCustomerInfo> = body._senderCustomerInfo()

    fun _additionalBodyProperties(): Map<String, JsonValue> = body._additionalProperties()

    /** Additional headers to send with the request. */
    fun _additionalHeaders(): Headers = additionalHeaders

    /** Additional query param to send with the request. */
    fun _additionalQueryParams(): QueryParams = additionalQueryParams

    fun toBuilder() = Builder().from(this)

    companion object {

        /**
         * Returns a mutable builder for constructing an instance of [QuoteCreateParams].
         *
         * The following fields are required:
         * ```kotlin
         * .destination()
         * .lockedCurrencyAmount()
         * .lockedCurrencySide()
         * .source()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [QuoteCreateParams]. */
    class Builder internal constructor() {

        private var body: Body.Builder = Body.builder()
        private var additionalHeaders: Headers.Builder = Headers.builder()
        private var additionalQueryParams: QueryParams.Builder = QueryParams.builder()

        internal fun from(quoteCreateParams: QuoteCreateParams) = apply {
            body = quoteCreateParams.body.toBuilder()
            additionalHeaders = quoteCreateParams.additionalHeaders.toBuilder()
            additionalQueryParams = quoteCreateParams.additionalQueryParams.toBuilder()
        }

        /**
         * Sets the entire request body.
         *
         * This is generally only useful if you are already constructing the body separately.
         * Otherwise, it's more convenient to use the top-level setters instead:
         * - [destination]
         * - [lockedCurrencyAmount]
         * - [lockedCurrencySide]
         * - [source]
         * - [description]
         * - etc.
         */
        fun body(body: Body) = apply { this.body = body.toBuilder() }

        /** Destination account details */
        fun destination(destination: Destination) = apply { body.destination(destination) }

        /**
         * Sets [Builder.destination] to an arbitrary JSON value.
         *
         * You should usually call [Builder.destination] with a well-typed [Destination] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun destination(destination: JsonField<Destination>) = apply {
            body.destination(destination)
        }

        /** Alias for calling [destination] with `Destination.ofAccount(account)`. */
        fun destination(account: Destination.Account) = apply { body.destination(account) }

        /** Alias for calling [destination] with `Destination.ofUmaAddress(umaAddress)`. */
        fun destination(umaAddress: Destination.UmaAddress) = apply { body.destination(umaAddress) }

        /**
         * Alias for calling [destination] with
         * `Destination.ofExternalAccountDetails(externalAccountDetails)`.
         */
        fun destination(externalAccountDetails: Destination.ExternalAccountDetails) = apply {
            body.destination(externalAccountDetails)
        }

        /**
         * The amount to send/receive in the smallest unit of the locked currency (eg. cents). See
         * `lockedCurrencySide` for more information.
         */
        fun lockedCurrencyAmount(lockedCurrencyAmount: Long) = apply {
            body.lockedCurrencyAmount(lockedCurrencyAmount)
        }

        /**
         * Sets [Builder.lockedCurrencyAmount] to an arbitrary JSON value.
         *
         * You should usually call [Builder.lockedCurrencyAmount] with a well-typed [Long] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun lockedCurrencyAmount(lockedCurrencyAmount: JsonField<Long>) = apply {
            body.lockedCurrencyAmount(lockedCurrencyAmount)
        }

        /**
         * The side of the quote which should be locked and specified in the `lockedCurrencyAmount`.
         * For example, if I want to send exactly $5 MXN from my wallet, I would set this to
         * "sending", and the `lockedCurrencyAmount` to 500 (in cents). If I want the receiver to
         * receive exactly $10 USD, I would set this to "receiving" and the `lockedCurrencyAmount`
         * to 10000 (in cents).
         */
        fun lockedCurrencySide(lockedCurrencySide: LockedCurrencySide) = apply {
            body.lockedCurrencySide(lockedCurrencySide)
        }

        /**
         * Sets [Builder.lockedCurrencySide] to an arbitrary JSON value.
         *
         * You should usually call [Builder.lockedCurrencySide] with a well-typed
         * [LockedCurrencySide] value instead. This method is primarily for setting the field to an
         * undocumented or not yet supported value.
         */
        fun lockedCurrencySide(lockedCurrencySide: JsonField<LockedCurrencySide>) = apply {
            body.lockedCurrencySide(lockedCurrencySide)
        }

        /** Source account details */
        fun source(source: QuoteSource) = apply { body.source(source) }

        /**
         * Sets [Builder.source] to an arbitrary JSON value.
         *
         * You should usually call [Builder.source] with a well-typed [QuoteSource] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun source(source: JsonField<QuoteSource>) = apply { body.source(source) }

        /** Alias for calling [source] with `QuoteSource.ofAccount(account)`. */
        fun source(account: QuoteSource.Account) = apply { body.source(account) }

        /**
         * Alias for calling [source] with the following:
         * ```kotlin
         * QuoteSource.Account.builder()
         *     .accountId(accountId)
         *     .build()
         * ```
         */
        fun accountSource(accountId: String) = apply { body.accountSource(accountId) }

        /** Alias for calling [source] with `QuoteSource.ofRealtimeFunding(realtimeFunding)`. */
        fun source(realtimeFunding: QuoteSource.RealtimeFunding) = apply {
            body.source(realtimeFunding)
        }

        /** Optional description/memo for the transfer */
        fun description(description: String) = apply { body.description(description) }

        /**
         * Sets [Builder.description] to an arbitrary JSON value.
         *
         * You should usually call [Builder.description] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun description(description: JsonField<String>) = apply { body.description(description) }

        /**
         * Whether to immediately execute the quote after creation. If true, the quote will be
         * executed and the transaction will be created at the current exchange rate. It should only
         * be used if you don't want to lock and view rate details before executing the quote. If
         * you are executing a pre-existing quote, use the `/quotes/{quoteId}/execute` endpoint
         * instead. This is false by default.
         */
        fun immediatelyExecute(immediatelyExecute: Boolean) = apply {
            body.immediatelyExecute(immediatelyExecute)
        }

        /**
         * Sets [Builder.immediatelyExecute] to an arbitrary JSON value.
         *
         * You should usually call [Builder.immediatelyExecute] with a well-typed [Boolean] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun immediatelyExecute(immediatelyExecute: JsonField<Boolean>) = apply {
            body.immediatelyExecute(immediatelyExecute)
        }

        /**
         * Lookup ID from a previous receiver lookup request. If provided, this can make the quote
         * creation more efficient by reusing cached lookup data. NOTE: This is required for UMA
         * destinations due to counterparty institution requirements. See `senderCustomerInfo` for
         * more information.
         */
        fun lookupId(lookupId: String) = apply { body.lookupId(lookupId) }

        /**
         * Sets [Builder.lookupId] to an arbitrary JSON value.
         *
         * You should usually call [Builder.lookupId] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun lookupId(lookupId: JsonField<String>) = apply { body.lookupId(lookupId) }

        /**
         * Only relevant for UMA destinations. Key-value pairs of information about the sender which
         * was requested by the counterparty (recipient) institution. Any fields specified in
         * `requiredPayerDataFields` from the response of the `/receiver/uma/{receiverUmaAddress}`
         * (lookupUma) endpoint MUST be provided here if they were requested. If the counterparty
         * (recipient) institution did not request any information, this field can be omitted.
         */
        fun senderCustomerInfo(senderCustomerInfo: SenderCustomerInfo) = apply {
            body.senderCustomerInfo(senderCustomerInfo)
        }

        /**
         * Sets [Builder.senderCustomerInfo] to an arbitrary JSON value.
         *
         * You should usually call [Builder.senderCustomerInfo] with a well-typed
         * [SenderCustomerInfo] value instead. This method is primarily for setting the field to an
         * undocumented or not yet supported value.
         */
        fun senderCustomerInfo(senderCustomerInfo: JsonField<SenderCustomerInfo>) = apply {
            body.senderCustomerInfo(senderCustomerInfo)
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
         * Returns an immutable instance of [QuoteCreateParams].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .destination()
         * .lockedCurrencyAmount()
         * .lockedCurrencySide()
         * .source()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): QuoteCreateParams =
            QuoteCreateParams(
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
        private val destination: JsonField<Destination>,
        private val lockedCurrencyAmount: JsonField<Long>,
        private val lockedCurrencySide: JsonField<LockedCurrencySide>,
        private val source: JsonField<QuoteSource>,
        private val description: JsonField<String>,
        private val immediatelyExecute: JsonField<Boolean>,
        private val lookupId: JsonField<String>,
        private val senderCustomerInfo: JsonField<SenderCustomerInfo>,
        private val additionalProperties: MutableMap<String, JsonValue>,
    ) {

        @JsonCreator
        private constructor(
            @JsonProperty("destination")
            @ExcludeMissing
            destination: JsonField<Destination> = JsonMissing.of(),
            @JsonProperty("lockedCurrencyAmount")
            @ExcludeMissing
            lockedCurrencyAmount: JsonField<Long> = JsonMissing.of(),
            @JsonProperty("lockedCurrencySide")
            @ExcludeMissing
            lockedCurrencySide: JsonField<LockedCurrencySide> = JsonMissing.of(),
            @JsonProperty("source")
            @ExcludeMissing
            source: JsonField<QuoteSource> = JsonMissing.of(),
            @JsonProperty("description")
            @ExcludeMissing
            description: JsonField<String> = JsonMissing.of(),
            @JsonProperty("immediatelyExecute")
            @ExcludeMissing
            immediatelyExecute: JsonField<Boolean> = JsonMissing.of(),
            @JsonProperty("lookupId")
            @ExcludeMissing
            lookupId: JsonField<String> = JsonMissing.of(),
            @JsonProperty("senderCustomerInfo")
            @ExcludeMissing
            senderCustomerInfo: JsonField<SenderCustomerInfo> = JsonMissing.of(),
        ) : this(
            destination,
            lockedCurrencyAmount,
            lockedCurrencySide,
            source,
            description,
            immediatelyExecute,
            lookupId,
            senderCustomerInfo,
            mutableMapOf(),
        )

        /**
         * Destination account details
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun destination(): Destination = destination.getRequired("destination")

        /**
         * The amount to send/receive in the smallest unit of the locked currency (eg. cents). See
         * `lockedCurrencySide` for more information.
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun lockedCurrencyAmount(): Long = lockedCurrencyAmount.getRequired("lockedCurrencyAmount")

        /**
         * The side of the quote which should be locked and specified in the `lockedCurrencyAmount`.
         * For example, if I want to send exactly $5 MXN from my wallet, I would set this to
         * "sending", and the `lockedCurrencyAmount` to 500 (in cents). If I want the receiver to
         * receive exactly $10 USD, I would set this to "receiving" and the `lockedCurrencyAmount`
         * to 10000 (in cents).
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun lockedCurrencySide(): LockedCurrencySide =
            lockedCurrencySide.getRequired("lockedCurrencySide")

        /**
         * Source account details
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type or is
         *   unexpectedly missing or null (e.g. if the server responded with an unexpected value).
         */
        fun source(): QuoteSource = source.getRequired("source")

        /**
         * Optional description/memo for the transfer
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun description(): String? = description.getNullable("description")

        /**
         * Whether to immediately execute the quote after creation. If true, the quote will be
         * executed and the transaction will be created at the current exchange rate. It should only
         * be used if you don't want to lock and view rate details before executing the quote. If
         * you are executing a pre-existing quote, use the `/quotes/{quoteId}/execute` endpoint
         * instead. This is false by default.
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun immediatelyExecute(): Boolean? = immediatelyExecute.getNullable("immediatelyExecute")

        /**
         * Lookup ID from a previous receiver lookup request. If provided, this can make the quote
         * creation more efficient by reusing cached lookup data. NOTE: This is required for UMA
         * destinations due to counterparty institution requirements. See `senderCustomerInfo` for
         * more information.
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun lookupId(): String? = lookupId.getNullable("lookupId")

        /**
         * Only relevant for UMA destinations. Key-value pairs of information about the sender which
         * was requested by the counterparty (recipient) institution. Any fields specified in
         * `requiredPayerDataFields` from the response of the `/receiver/uma/{receiverUmaAddress}`
         * (lookupUma) endpoint MUST be provided here if they were requested. If the counterparty
         * (recipient) institution did not request any information, this field can be omitted.
         *
         * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the
         *   server responded with an unexpected value).
         */
        fun senderCustomerInfo(): SenderCustomerInfo? =
            senderCustomerInfo.getNullable("senderCustomerInfo")

        /**
         * Returns the raw JSON value of [destination].
         *
         * Unlike [destination], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("destination")
        @ExcludeMissing
        fun _destination(): JsonField<Destination> = destination

        /**
         * Returns the raw JSON value of [lockedCurrencyAmount].
         *
         * Unlike [lockedCurrencyAmount], this method doesn't throw if the JSON field has an
         * unexpected type.
         */
        @JsonProperty("lockedCurrencyAmount")
        @ExcludeMissing
        fun _lockedCurrencyAmount(): JsonField<Long> = lockedCurrencyAmount

        /**
         * Returns the raw JSON value of [lockedCurrencySide].
         *
         * Unlike [lockedCurrencySide], this method doesn't throw if the JSON field has an
         * unexpected type.
         */
        @JsonProperty("lockedCurrencySide")
        @ExcludeMissing
        fun _lockedCurrencySide(): JsonField<LockedCurrencySide> = lockedCurrencySide

        /**
         * Returns the raw JSON value of [source].
         *
         * Unlike [source], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("source") @ExcludeMissing fun _source(): JsonField<QuoteSource> = source

        /**
         * Returns the raw JSON value of [description].
         *
         * Unlike [description], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("description")
        @ExcludeMissing
        fun _description(): JsonField<String> = description

        /**
         * Returns the raw JSON value of [immediatelyExecute].
         *
         * Unlike [immediatelyExecute], this method doesn't throw if the JSON field has an
         * unexpected type.
         */
        @JsonProperty("immediatelyExecute")
        @ExcludeMissing
        fun _immediatelyExecute(): JsonField<Boolean> = immediatelyExecute

        /**
         * Returns the raw JSON value of [lookupId].
         *
         * Unlike [lookupId], this method doesn't throw if the JSON field has an unexpected type.
         */
        @JsonProperty("lookupId") @ExcludeMissing fun _lookupId(): JsonField<String> = lookupId

        /**
         * Returns the raw JSON value of [senderCustomerInfo].
         *
         * Unlike [senderCustomerInfo], this method doesn't throw if the JSON field has an
         * unexpected type.
         */
        @JsonProperty("senderCustomerInfo")
        @ExcludeMissing
        fun _senderCustomerInfo(): JsonField<SenderCustomerInfo> = senderCustomerInfo

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
             * Returns a mutable builder for constructing an instance of [Body].
             *
             * The following fields are required:
             * ```kotlin
             * .destination()
             * .lockedCurrencyAmount()
             * .lockedCurrencySide()
             * .source()
             * ```
             */
            fun builder() = Builder()
        }

        /** A builder for [Body]. */
        class Builder internal constructor() {

            private var destination: JsonField<Destination>? = null
            private var lockedCurrencyAmount: JsonField<Long>? = null
            private var lockedCurrencySide: JsonField<LockedCurrencySide>? = null
            private var source: JsonField<QuoteSource>? = null
            private var description: JsonField<String> = JsonMissing.of()
            private var immediatelyExecute: JsonField<Boolean> = JsonMissing.of()
            private var lookupId: JsonField<String> = JsonMissing.of()
            private var senderCustomerInfo: JsonField<SenderCustomerInfo> = JsonMissing.of()
            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(body: Body) = apply {
                destination = body.destination
                lockedCurrencyAmount = body.lockedCurrencyAmount
                lockedCurrencySide = body.lockedCurrencySide
                source = body.source
                description = body.description
                immediatelyExecute = body.immediatelyExecute
                lookupId = body.lookupId
                senderCustomerInfo = body.senderCustomerInfo
                additionalProperties = body.additionalProperties.toMutableMap()
            }

            /** Destination account details */
            fun destination(destination: Destination) = destination(JsonField.of(destination))

            /**
             * Sets [Builder.destination] to an arbitrary JSON value.
             *
             * You should usually call [Builder.destination] with a well-typed [Destination] value
             * instead. This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun destination(destination: JsonField<Destination>) = apply {
                this.destination = destination
            }

            /** Alias for calling [destination] with `Destination.ofAccount(account)`. */
            fun destination(account: Destination.Account) =
                destination(Destination.ofAccount(account))

            /** Alias for calling [destination] with `Destination.ofUmaAddress(umaAddress)`. */
            fun destination(umaAddress: Destination.UmaAddress) =
                destination(Destination.ofUmaAddress(umaAddress))

            /**
             * Alias for calling [destination] with
             * `Destination.ofExternalAccountDetails(externalAccountDetails)`.
             */
            fun destination(externalAccountDetails: Destination.ExternalAccountDetails) =
                destination(Destination.ofExternalAccountDetails(externalAccountDetails))

            /**
             * The amount to send/receive in the smallest unit of the locked currency (eg. cents).
             * See `lockedCurrencySide` for more information.
             */
            fun lockedCurrencyAmount(lockedCurrencyAmount: Long) =
                lockedCurrencyAmount(JsonField.of(lockedCurrencyAmount))

            /**
             * Sets [Builder.lockedCurrencyAmount] to an arbitrary JSON value.
             *
             * You should usually call [Builder.lockedCurrencyAmount] with a well-typed [Long] value
             * instead. This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun lockedCurrencyAmount(lockedCurrencyAmount: JsonField<Long>) = apply {
                this.lockedCurrencyAmount = lockedCurrencyAmount
            }

            /**
             * The side of the quote which should be locked and specified in the
             * `lockedCurrencyAmount`. For example, if I want to send exactly $5 MXN from my wallet,
             * I would set this to "sending", and the `lockedCurrencyAmount` to 500 (in cents). If I
             * want the receiver to receive exactly $10 USD, I would set this to "receiving" and the
             * `lockedCurrencyAmount` to 10000 (in cents).
             */
            fun lockedCurrencySide(lockedCurrencySide: LockedCurrencySide) =
                lockedCurrencySide(JsonField.of(lockedCurrencySide))

            /**
             * Sets [Builder.lockedCurrencySide] to an arbitrary JSON value.
             *
             * You should usually call [Builder.lockedCurrencySide] with a well-typed
             * [LockedCurrencySide] value instead. This method is primarily for setting the field to
             * an undocumented or not yet supported value.
             */
            fun lockedCurrencySide(lockedCurrencySide: JsonField<LockedCurrencySide>) = apply {
                this.lockedCurrencySide = lockedCurrencySide
            }

            /** Source account details */
            fun source(source: QuoteSource) = source(JsonField.of(source))

            /**
             * Sets [Builder.source] to an arbitrary JSON value.
             *
             * You should usually call [Builder.source] with a well-typed [QuoteSource] value
             * instead. This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun source(source: JsonField<QuoteSource>) = apply { this.source = source }

            /** Alias for calling [source] with `QuoteSource.ofAccount(account)`. */
            fun source(account: QuoteSource.Account) = source(QuoteSource.ofAccount(account))

            /**
             * Alias for calling [source] with the following:
             * ```kotlin
             * QuoteSource.Account.builder()
             *     .accountId(accountId)
             *     .build()
             * ```
             */
            fun accountSource(accountId: String) =
                source(QuoteSource.Account.builder().accountId(accountId).build())

            /** Alias for calling [source] with `QuoteSource.ofRealtimeFunding(realtimeFunding)`. */
            fun source(realtimeFunding: QuoteSource.RealtimeFunding) =
                source(QuoteSource.ofRealtimeFunding(realtimeFunding))

            /** Optional description/memo for the transfer */
            fun description(description: String) = description(JsonField.of(description))

            /**
             * Sets [Builder.description] to an arbitrary JSON value.
             *
             * You should usually call [Builder.description] with a well-typed [String] value
             * instead. This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun description(description: JsonField<String>) = apply {
                this.description = description
            }

            /**
             * Whether to immediately execute the quote after creation. If true, the quote will be
             * executed and the transaction will be created at the current exchange rate. It should
             * only be used if you don't want to lock and view rate details before executing the
             * quote. If you are executing a pre-existing quote, use the `/quotes/{quoteId}/execute`
             * endpoint instead. This is false by default.
             */
            fun immediatelyExecute(immediatelyExecute: Boolean) =
                immediatelyExecute(JsonField.of(immediatelyExecute))

            /**
             * Sets [Builder.immediatelyExecute] to an arbitrary JSON value.
             *
             * You should usually call [Builder.immediatelyExecute] with a well-typed [Boolean]
             * value instead. This method is primarily for setting the field to an undocumented or
             * not yet supported value.
             */
            fun immediatelyExecute(immediatelyExecute: JsonField<Boolean>) = apply {
                this.immediatelyExecute = immediatelyExecute
            }

            /**
             * Lookup ID from a previous receiver lookup request. If provided, this can make the
             * quote creation more efficient by reusing cached lookup data. NOTE: This is required
             * for UMA destinations due to counterparty institution requirements. See
             * `senderCustomerInfo` for more information.
             */
            fun lookupId(lookupId: String) = lookupId(JsonField.of(lookupId))

            /**
             * Sets [Builder.lookupId] to an arbitrary JSON value.
             *
             * You should usually call [Builder.lookupId] with a well-typed [String] value instead.
             * This method is primarily for setting the field to an undocumented or not yet
             * supported value.
             */
            fun lookupId(lookupId: JsonField<String>) = apply { this.lookupId = lookupId }

            /**
             * Only relevant for UMA destinations. Key-value pairs of information about the sender
             * which was requested by the counterparty (recipient) institution. Any fields specified
             * in `requiredPayerDataFields` from the response of the
             * `/receiver/uma/{receiverUmaAddress}` (lookupUma) endpoint MUST be provided here if
             * they were requested. If the counterparty (recipient) institution did not request any
             * information, this field can be omitted.
             */
            fun senderCustomerInfo(senderCustomerInfo: SenderCustomerInfo) =
                senderCustomerInfo(JsonField.of(senderCustomerInfo))

            /**
             * Sets [Builder.senderCustomerInfo] to an arbitrary JSON value.
             *
             * You should usually call [Builder.senderCustomerInfo] with a well-typed
             * [SenderCustomerInfo] value instead. This method is primarily for setting the field to
             * an undocumented or not yet supported value.
             */
            fun senderCustomerInfo(senderCustomerInfo: JsonField<SenderCustomerInfo>) = apply {
                this.senderCustomerInfo = senderCustomerInfo
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
             *
             * The following fields are required:
             * ```kotlin
             * .destination()
             * .lockedCurrencyAmount()
             * .lockedCurrencySide()
             * .source()
             * ```
             *
             * @throws IllegalStateException if any required field is unset.
             */
            fun build(): Body =
                Body(
                    checkRequired("destination", destination),
                    checkRequired("lockedCurrencyAmount", lockedCurrencyAmount),
                    checkRequired("lockedCurrencySide", lockedCurrencySide),
                    checkRequired("source", source),
                    description,
                    immediatelyExecute,
                    lookupId,
                    senderCustomerInfo,
                    additionalProperties.toMutableMap(),
                )
        }

        private var validated: Boolean = false

        fun validate(): Body = apply {
            if (validated) {
                return@apply
            }

            destination().validate()
            lockedCurrencyAmount()
            lockedCurrencySide().validate()
            source().validate()
            description()
            immediatelyExecute()
            lookupId()
            senderCustomerInfo()?.validate()
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
            (destination.asKnown()?.validity() ?: 0) +
                (if (lockedCurrencyAmount.asKnown() == null) 0 else 1) +
                (lockedCurrencySide.asKnown()?.validity() ?: 0) +
                (source.asKnown()?.validity() ?: 0) +
                (if (description.asKnown() == null) 0 else 1) +
                (if (immediatelyExecute.asKnown() == null) 0 else 1) +
                (if (lookupId.asKnown() == null) 0 else 1) +
                (senderCustomerInfo.asKnown()?.validity() ?: 0)

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is Body &&
                destination == other.destination &&
                lockedCurrencyAmount == other.lockedCurrencyAmount &&
                lockedCurrencySide == other.lockedCurrencySide &&
                source == other.source &&
                description == other.description &&
                immediatelyExecute == other.immediatelyExecute &&
                lookupId == other.lookupId &&
                senderCustomerInfo == other.senderCustomerInfo &&
                additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy {
            Objects.hash(
                destination,
                lockedCurrencyAmount,
                lockedCurrencySide,
                source,
                description,
                immediatelyExecute,
                lookupId,
                senderCustomerInfo,
                additionalProperties,
            )
        }

        override fun hashCode(): Int = hashCode

        override fun toString() =
            "Body{destination=$destination, lockedCurrencyAmount=$lockedCurrencyAmount, lockedCurrencySide=$lockedCurrencySide, source=$source, description=$description, immediatelyExecute=$immediatelyExecute, lookupId=$lookupId, senderCustomerInfo=$senderCustomerInfo, additionalProperties=$additionalProperties}"
    }

    /** Destination account details */
    @JsonDeserialize(using = Destination.Deserializer::class)
    @JsonSerialize(using = Destination.Serializer::class)
    class Destination
    private constructor(
        private val account: Account? = null,
        private val umaAddress: UmaAddress? = null,
        private val externalAccountDetails: ExternalAccountDetails? = null,
        private val _json: JsonValue? = null,
    ) {

        /** Destination account details */
        fun account(): Account? = account

        /** UMA address destination details */
        fun umaAddress(): UmaAddress? = umaAddress

        /**
         * A convenient destination option which adds the external account and creates the quote in
         * one step rather than first needing to call /external-accounts to add the account. Useful
         * for one-off payments to some destination. See the external accounts endpoints for test
         * values in sandbox mode.
         */
        fun externalAccountDetails(): ExternalAccountDetails? = externalAccountDetails

        fun isAccount(): Boolean = account != null

        fun isUmaAddress(): Boolean = umaAddress != null

        fun isExternalAccountDetails(): Boolean = externalAccountDetails != null

        /** Destination account details */
        fun asAccount(): Account = account.getOrThrow("account")

        /** UMA address destination details */
        fun asUmaAddress(): UmaAddress = umaAddress.getOrThrow("umaAddress")

        /**
         * A convenient destination option which adds the external account and creates the quote in
         * one step rather than first needing to call /external-accounts to add the account. Useful
         * for one-off payments to some destination. See the external accounts endpoints for test
         * values in sandbox mode.
         */
        fun asExternalAccountDetails(): ExternalAccountDetails =
            externalAccountDetails.getOrThrow("externalAccountDetails")

        fun _json(): JsonValue? = _json

        fun <T> accept(visitor: Visitor<T>): T =
            when {
                account != null -> visitor.visitAccount(account)
                umaAddress != null -> visitor.visitUmaAddress(umaAddress)
                externalAccountDetails != null ->
                    visitor.visitExternalAccountDetails(externalAccountDetails)
                else -> visitor.unknown(_json)
            }

        private var validated: Boolean = false

        fun validate(): Destination = apply {
            if (validated) {
                return@apply
            }

            accept(
                object : Visitor<Unit> {
                    override fun visitAccount(account: Account) {
                        account.validate()
                    }

                    override fun visitUmaAddress(umaAddress: UmaAddress) {
                        umaAddress.validate()
                    }

                    override fun visitExternalAccountDetails(
                        externalAccountDetails: ExternalAccountDetails
                    ) {
                        externalAccountDetails.validate()
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
                    override fun visitAccount(account: Account) = account.validity()

                    override fun visitUmaAddress(umaAddress: UmaAddress) = umaAddress.validity()

                    override fun visitExternalAccountDetails(
                        externalAccountDetails: ExternalAccountDetails
                    ) = externalAccountDetails.validity()

                    override fun unknown(json: JsonValue?) = 0
                }
            )

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is Destination &&
                account == other.account &&
                umaAddress == other.umaAddress &&
                externalAccountDetails == other.externalAccountDetails
        }

        override fun hashCode(): Int = Objects.hash(account, umaAddress, externalAccountDetails)

        override fun toString(): String =
            when {
                account != null -> "Destination{account=$account}"
                umaAddress != null -> "Destination{umaAddress=$umaAddress}"
                externalAccountDetails != null ->
                    "Destination{externalAccountDetails=$externalAccountDetails}"
                _json != null -> "Destination{_unknown=$_json}"
                else -> throw IllegalStateException("Invalid Destination")
            }

        companion object {

            /** Destination account details */
            fun ofAccount(account: Account) = Destination(account = account)

            /** UMA address destination details */
            fun ofUmaAddress(umaAddress: UmaAddress) = Destination(umaAddress = umaAddress)

            /**
             * A convenient destination option which adds the external account and creates the quote
             * in one step rather than first needing to call /external-accounts to add the account.
             * Useful for one-off payments to some destination. See the external accounts endpoints
             * for test values in sandbox mode.
             */
            fun ofExternalAccountDetails(externalAccountDetails: ExternalAccountDetails) =
                Destination(externalAccountDetails = externalAccountDetails)
        }

        /**
         * An interface that defines how to map each variant of [Destination] to a value of type
         * [T].
         */
        interface Visitor<out T> {

            /** Destination account details */
            fun visitAccount(account: Account): T

            /** UMA address destination details */
            fun visitUmaAddress(umaAddress: UmaAddress): T

            /**
             * A convenient destination option which adds the external account and creates the quote
             * in one step rather than first needing to call /external-accounts to add the account.
             * Useful for one-off payments to some destination. See the external accounts endpoints
             * for test values in sandbox mode.
             */
            fun visitExternalAccountDetails(externalAccountDetails: ExternalAccountDetails): T

            /**
             * Maps an unknown variant of [Destination] to a value of type [T].
             *
             * An instance of [Destination] can contain an unknown variant if it was deserialized
             * from data that doesn't match any known variant. For example, if the SDK is on an
             * older version than the API, then the API may respond with new variants that the SDK
             * is unaware of.
             *
             * @throws GridInvalidDataException in the default implementation.
             */
            fun unknown(json: JsonValue?): T {
                throw GridInvalidDataException("Unknown Destination: $json")
            }
        }

        internal class Deserializer : BaseDeserializer<Destination>(Destination::class) {

            override fun ObjectCodec.deserialize(node: JsonNode): Destination {
                val json = JsonValue.fromJsonNode(node)

                val bestMatches =
                    sequenceOf(
                            tryDeserialize(node, jacksonTypeRef<Account>())?.let {
                                Destination(account = it, _json = json)
                            },
                            tryDeserialize(node, jacksonTypeRef<UmaAddress>())?.let {
                                Destination(umaAddress = it, _json = json)
                            },
                            tryDeserialize(node, jacksonTypeRef<ExternalAccountDetails>())?.let {
                                Destination(externalAccountDetails = it, _json = json)
                            },
                        )
                        .filterNotNull()
                        .allMaxBy { it.validity() }
                        .toList()
                return when (bestMatches.size) {
                    // This can happen if what we're deserializing is completely incompatible with
                    // all the possible variants (e.g. deserializing from boolean).
                    0 -> Destination(_json = json)
                    1 -> bestMatches.single()
                    // If there's more than one match with the highest validity, then use the first
                    // completely valid match, or simply the first match if none are completely
                    // valid.
                    else -> bestMatches.firstOrNull { it.isValid() } ?: bestMatches.first()
                }
            }
        }

        internal class Serializer : BaseSerializer<Destination>(Destination::class) {

            override fun serialize(
                value: Destination,
                generator: JsonGenerator,
                provider: SerializerProvider,
            ) {
                when {
                    value.account != null -> generator.writeObject(value.account)
                    value.umaAddress != null -> generator.writeObject(value.umaAddress)
                    value.externalAccountDetails != null ->
                        generator.writeObject(value.externalAccountDetails)
                    value._json != null -> generator.writeObject(value._json)
                    else -> throw IllegalStateException("Invalid Destination")
                }
            }
        }

        /** Destination account details */
        class Account
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val accountId: JsonField<String>,
            private val currency: JsonField<String>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("accountId")
                @ExcludeMissing
                accountId: JsonField<String> = JsonMissing.of(),
                @JsonProperty("currency")
                @ExcludeMissing
                currency: JsonField<String> = JsonMissing.of(),
            ) : this(accountId, currency, mutableMapOf())

            /**
             * Destination account identifier
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun accountId(): String = accountId.getRequired("accountId")

            /**
             * Currency code for the destination account. See
             * [Supported Currencies](https://grid.lightspark.com/platform-overview/core-concepts/currencies-and-rails)
             * for the full list of supported fiat and crypto currencies.
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun currency(): String = currency.getRequired("currency")

            /**
             * Returns the raw JSON value of [accountId].
             *
             * Unlike [accountId], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("accountId")
            @ExcludeMissing
            fun _accountId(): JsonField<String> = accountId

            /**
             * Returns the raw JSON value of [currency].
             *
             * Unlike [currency], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("currency") @ExcludeMissing fun _currency(): JsonField<String> = currency

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
                 * Returns a mutable builder for constructing an instance of [Account].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountId()
                 * .currency()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [Account]. */
            class Builder internal constructor() {

                private var accountId: JsonField<String>? = null
                private var currency: JsonField<String>? = null
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(account: Account) = apply {
                    accountId = account.accountId
                    currency = account.currency
                    additionalProperties = account.additionalProperties.toMutableMap()
                }

                /** Destination account identifier */
                fun accountId(accountId: String) = accountId(JsonField.of(accountId))

                /**
                 * Sets [Builder.accountId] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.accountId] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun accountId(accountId: JsonField<String>) = apply { this.accountId = accountId }

                /**
                 * Currency code for the destination account. See
                 * [Supported Currencies](https://grid.lightspark.com/platform-overview/core-concepts/currencies-and-rails)
                 * for the full list of supported fiat and crypto currencies.
                 */
                fun currency(currency: String) = currency(JsonField.of(currency))

                /**
                 * Sets [Builder.currency] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.currency] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun currency(currency: JsonField<String>) = apply { this.currency = currency }

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
                 * Returns an immutable instance of [Account].
                 *
                 * Further updates to this [Builder] will not mutate the returned instance.
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .accountId()
                 * .currency()
                 * ```
                 *
                 * @throws IllegalStateException if any required field is unset.
                 */
                fun build(): Account =
                    Account(
                        checkRequired("accountId", accountId),
                        checkRequired("currency", currency),
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): Account = apply {
                if (validated) {
                    return@apply
                }

                accountId()
                currency()
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
                (if (accountId.asKnown() == null) 0 else 1) +
                    (if (currency.asKnown() == null) 0 else 1)

            override fun equals(other: Any?): Boolean {
                if (this === other) {
                    return true
                }

                return other is Account &&
                    accountId == other.accountId &&
                    currency == other.currency &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(accountId, currency, additionalProperties)
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "Account{accountId=$accountId, currency=$currency, additionalProperties=$additionalProperties}"
        }

        /** UMA address destination details */
        class UmaAddress
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val currency: JsonField<String>,
            private val umaAddress: JsonField<String>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("currency")
                @ExcludeMissing
                currency: JsonField<String> = JsonMissing.of(),
                @JsonProperty("umaAddress")
                @ExcludeMissing
                umaAddress: JsonField<String> = JsonMissing.of(),
            ) : this(currency, umaAddress, mutableMapOf())

            /**
             * Currency code for the destination. See
             * [Supported Currencies](https://grid.lightspark.com/platform-overview/core-concepts/currencies-and-rails)
             * for the full list of supported fiat and crypto currencies.
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun currency(): String = currency.getRequired("currency")

            /**
             * UMA address of the recipient
             *
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun umaAddress(): String = umaAddress.getRequired("umaAddress")

            /**
             * Returns the raw JSON value of [currency].
             *
             * Unlike [currency], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("currency") @ExcludeMissing fun _currency(): JsonField<String> = currency

            /**
             * Returns the raw JSON value of [umaAddress].
             *
             * Unlike [umaAddress], this method doesn't throw if the JSON field has an unexpected
             * type.
             */
            @JsonProperty("umaAddress")
            @ExcludeMissing
            fun _umaAddress(): JsonField<String> = umaAddress

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
                 * Returns a mutable builder for constructing an instance of [UmaAddress].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .currency()
                 * .umaAddress()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [UmaAddress]. */
            class Builder internal constructor() {

                private var currency: JsonField<String>? = null
                private var umaAddress: JsonField<String>? = null
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(umaAddress: UmaAddress) = apply {
                    currency = umaAddress.currency
                    this.umaAddress = umaAddress.umaAddress
                    additionalProperties = umaAddress.additionalProperties.toMutableMap()
                }

                /**
                 * Currency code for the destination. See
                 * [Supported Currencies](https://grid.lightspark.com/platform-overview/core-concepts/currencies-and-rails)
                 * for the full list of supported fiat and crypto currencies.
                 */
                fun currency(currency: String) = currency(JsonField.of(currency))

                /**
                 * Sets [Builder.currency] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.currency] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun currency(currency: JsonField<String>) = apply { this.currency = currency }

                /** UMA address of the recipient */
                fun umaAddress(umaAddress: String) = umaAddress(JsonField.of(umaAddress))

                /**
                 * Sets [Builder.umaAddress] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.umaAddress] with a well-typed [String] value
                 * instead. This method is primarily for setting the field to an undocumented or not
                 * yet supported value.
                 */
                fun umaAddress(umaAddress: JsonField<String>) = apply {
                    this.umaAddress = umaAddress
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
                 * Returns an immutable instance of [UmaAddress].
                 *
                 * Further updates to this [Builder] will not mutate the returned instance.
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .currency()
                 * .umaAddress()
                 * ```
                 *
                 * @throws IllegalStateException if any required field is unset.
                 */
                fun build(): UmaAddress =
                    UmaAddress(
                        checkRequired("currency", currency),
                        checkRequired("umaAddress", umaAddress),
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): UmaAddress = apply {
                if (validated) {
                    return@apply
                }

                currency()
                umaAddress()
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
                (if (currency.asKnown() == null) 0 else 1) +
                    (if (umaAddress.asKnown() == null) 0 else 1)

            override fun equals(other: Any?): Boolean {
                if (this === other) {
                    return true
                }

                return other is UmaAddress &&
                    currency == other.currency &&
                    umaAddress == other.umaAddress &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(currency, umaAddress, additionalProperties)
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "UmaAddress{currency=$currency, umaAddress=$umaAddress, additionalProperties=$additionalProperties}"
        }

        /**
         * A convenient destination option which adds the external account and creates the quote in
         * one step rather than first needing to call /external-accounts to add the account. Useful
         * for one-off payments to some destination. See the external accounts endpoints for test
         * values in sandbox mode.
         */
        class ExternalAccountDetails
        @JsonCreator(mode = JsonCreator.Mode.DISABLED)
        private constructor(
            private val externalAccountDetails: JsonField<ExternalAccountCreate>,
            private val additionalProperties: MutableMap<String, JsonValue>,
        ) {

            @JsonCreator
            private constructor(
                @JsonProperty("externalAccountDetails")
                @ExcludeMissing
                externalAccountDetails: JsonField<ExternalAccountCreate> = JsonMissing.of()
            ) : this(externalAccountDetails, mutableMapOf())

            /**
             * @throws GridInvalidDataException if the JSON field has an unexpected type or is
             *   unexpectedly missing or null (e.g. if the server responded with an unexpected
             *   value).
             */
            fun externalAccountDetails(): ExternalAccountCreate =
                externalAccountDetails.getRequired("externalAccountDetails")

            /**
             * Returns the raw JSON value of [externalAccountDetails].
             *
             * Unlike [externalAccountDetails], this method doesn't throw if the JSON field has an
             * unexpected type.
             */
            @JsonProperty("externalAccountDetails")
            @ExcludeMissing
            fun _externalAccountDetails(): JsonField<ExternalAccountCreate> = externalAccountDetails

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
                 * [ExternalAccountDetails].
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .externalAccountDetails()
                 * ```
                 */
                fun builder() = Builder()
            }

            /** A builder for [ExternalAccountDetails]. */
            class Builder internal constructor() {

                private var externalAccountDetails: JsonField<ExternalAccountCreate>? = null
                private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

                internal fun from(externalAccountDetails: ExternalAccountDetails) = apply {
                    this.externalAccountDetails = externalAccountDetails.externalAccountDetails
                    additionalProperties =
                        externalAccountDetails.additionalProperties.toMutableMap()
                }

                fun externalAccountDetails(externalAccountDetails: ExternalAccountCreate) =
                    externalAccountDetails(JsonField.of(externalAccountDetails))

                /**
                 * Sets [Builder.externalAccountDetails] to an arbitrary JSON value.
                 *
                 * You should usually call [Builder.externalAccountDetails] with a well-typed
                 * [ExternalAccountCreate] value instead. This method is primarily for setting the
                 * field to an undocumented or not yet supported value.
                 */
                fun externalAccountDetails(
                    externalAccountDetails: JsonField<ExternalAccountCreate>
                ) = apply { this.externalAccountDetails = externalAccountDetails }

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
                 * Returns an immutable instance of [ExternalAccountDetails].
                 *
                 * Further updates to this [Builder] will not mutate the returned instance.
                 *
                 * The following fields are required:
                 * ```kotlin
                 * .externalAccountDetails()
                 * ```
                 *
                 * @throws IllegalStateException if any required field is unset.
                 */
                fun build(): ExternalAccountDetails =
                    ExternalAccountDetails(
                        checkRequired("externalAccountDetails", externalAccountDetails),
                        additionalProperties.toMutableMap(),
                    )
            }

            private var validated: Boolean = false

            fun validate(): ExternalAccountDetails = apply {
                if (validated) {
                    return@apply
                }

                externalAccountDetails().validate()
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
            internal fun validity(): Int = (externalAccountDetails.asKnown()?.validity() ?: 0)

            override fun equals(other: Any?): Boolean {
                if (this === other) {
                    return true
                }

                return other is ExternalAccountDetails &&
                    externalAccountDetails == other.externalAccountDetails &&
                    additionalProperties == other.additionalProperties
            }

            private val hashCode: Int by lazy {
                Objects.hash(externalAccountDetails, additionalProperties)
            }

            override fun hashCode(): Int = hashCode

            override fun toString() =
                "ExternalAccountDetails{externalAccountDetails=$externalAccountDetails, additionalProperties=$additionalProperties}"
        }
    }

    /**
     * The side of the quote which should be locked and specified in the `lockedCurrencyAmount`. For
     * example, if I want to send exactly $5 MXN from my wallet, I would set this to "sending", and
     * the `lockedCurrencyAmount` to 500 (in cents). If I want the receiver to receive exactly $10
     * USD, I would set this to "receiving" and the `lockedCurrencyAmount` to 10000 (in cents).
     */
    class LockedCurrencySide
    @JsonCreator
    private constructor(private val value: JsonField<String>) : Enum {

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

            val SENDING = of("SENDING")

            val RECEIVING = of("RECEIVING")

            fun of(value: String) = LockedCurrencySide(JsonField.of(value))
        }

        /** An enum containing [LockedCurrencySide]'s known values. */
        enum class Known {
            SENDING,
            RECEIVING,
        }

        /**
         * An enum containing [LockedCurrencySide]'s known values, as well as an [_UNKNOWN] member.
         *
         * An instance of [LockedCurrencySide] can contain an unknown value in a couple of cases:
         * - It was deserialized from data that doesn't match any known member. For example, if the
         *   SDK is on an older version than the API, then the API may respond with new members that
         *   the SDK is unaware of.
         * - It was constructed with an arbitrary value using the [of] method.
         */
        enum class Value {
            SENDING,
            RECEIVING,
            /**
             * An enum member indicating that [LockedCurrencySide] was instantiated with an unknown
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
                SENDING -> Value.SENDING
                RECEIVING -> Value.RECEIVING
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
                SENDING -> Known.SENDING
                RECEIVING -> Known.RECEIVING
                else -> throw GridInvalidDataException("Unknown LockedCurrencySide: $value")
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

        fun validate(): LockedCurrencySide = apply {
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

            return other is LockedCurrencySide && value == other.value
        }

        override fun hashCode() = value.hashCode()

        override fun toString() = value.toString()
    }

    /**
     * Only relevant for UMA destinations. Key-value pairs of information about the sender which was
     * requested by the counterparty (recipient) institution. Any fields specified in
     * `requiredPayerDataFields` from the response of the `/receiver/uma/{receiverUmaAddress}`
     * (lookupUma) endpoint MUST be provided here if they were requested. If the counterparty
     * (recipient) institution did not request any information, this field can be omitted.
     */
    class SenderCustomerInfo
    @JsonCreator
    private constructor(
        @com.fasterxml.jackson.annotation.JsonValue
        private val additionalProperties: Map<String, JsonValue>
    ) {

        @JsonAnyGetter
        @ExcludeMissing
        fun _additionalProperties(): Map<String, JsonValue> = additionalProperties

        fun toBuilder() = Builder().from(this)

        companion object {

            /** Returns a mutable builder for constructing an instance of [SenderCustomerInfo]. */
            fun builder() = Builder()
        }

        /** A builder for [SenderCustomerInfo]. */
        class Builder internal constructor() {

            private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

            internal fun from(senderCustomerInfo: SenderCustomerInfo) = apply {
                additionalProperties = senderCustomerInfo.additionalProperties.toMutableMap()
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
             * Returns an immutable instance of [SenderCustomerInfo].
             *
             * Further updates to this [Builder] will not mutate the returned instance.
             */
            fun build(): SenderCustomerInfo = SenderCustomerInfo(additionalProperties.toImmutable())
        }

        private var validated: Boolean = false

        fun validate(): SenderCustomerInfo = apply {
            if (validated) {
                return@apply
            }

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
            additionalProperties.count { (_, value) -> !value.isNull() && !value.isMissing() }

        override fun equals(other: Any?): Boolean {
            if (this === other) {
                return true
            }

            return other is SenderCustomerInfo && additionalProperties == other.additionalProperties
        }

        private val hashCode: Int by lazy { Objects.hash(additionalProperties) }

        override fun hashCode(): Int = hashCode

        override fun toString() = "SenderCustomerInfo{additionalProperties=$additionalProperties}"
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is QuoteCreateParams &&
            body == other.body &&
            additionalHeaders == other.additionalHeaders &&
            additionalQueryParams == other.additionalQueryParams
    }

    override fun hashCode(): Int = Objects.hash(body, additionalHeaders, additionalQueryParams)

    override fun toString() =
        "QuoteCreateParams{body=$body, additionalHeaders=$additionalHeaders, additionalQueryParams=$additionalQueryParams}"
}
