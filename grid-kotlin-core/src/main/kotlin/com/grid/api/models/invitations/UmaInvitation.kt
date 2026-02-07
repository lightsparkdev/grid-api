// File generated from our OpenAPI spec by Stainless.

package com.grid.api.models.invitations

import com.fasterxml.jackson.annotation.JsonAnyGetter
import com.fasterxml.jackson.annotation.JsonAnySetter
import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.grid.api.core.Enum
import com.grid.api.core.ExcludeMissing
import com.grid.api.core.JsonField
import com.grid.api.core.JsonMissing
import com.grid.api.core.JsonValue
import com.grid.api.core.checkRequired
import com.grid.api.errors.GridInvalidDataException
import java.time.OffsetDateTime
import java.util.Collections
import java.util.Objects

class UmaInvitation
@JsonCreator(mode = JsonCreator.Mode.DISABLED)
private constructor(
    private val code: JsonField<String>,
    private val createdAt: JsonField<OffsetDateTime>,
    private val inviterUma: JsonField<String>,
    private val status: JsonField<Status>,
    private val url: JsonField<String>,
    private val amountToSend: JsonField<CurrencyAmount>,
    private val claimedAt: JsonField<OffsetDateTime>,
    private val expiresAt: JsonField<OffsetDateTime>,
    private val firstName: JsonField<String>,
    private val inviteeUma: JsonField<String>,
    private val additionalProperties: MutableMap<String, JsonValue>,
) {

    @JsonCreator
    private constructor(
        @JsonProperty("code") @ExcludeMissing code: JsonField<String> = JsonMissing.of(),
        @JsonProperty("createdAt")
        @ExcludeMissing
        createdAt: JsonField<OffsetDateTime> = JsonMissing.of(),
        @JsonProperty("inviterUma")
        @ExcludeMissing
        inviterUma: JsonField<String> = JsonMissing.of(),
        @JsonProperty("status") @ExcludeMissing status: JsonField<Status> = JsonMissing.of(),
        @JsonProperty("url") @ExcludeMissing url: JsonField<String> = JsonMissing.of(),
        @JsonProperty("amountToSend")
        @ExcludeMissing
        amountToSend: JsonField<CurrencyAmount> = JsonMissing.of(),
        @JsonProperty("claimedAt")
        @ExcludeMissing
        claimedAt: JsonField<OffsetDateTime> = JsonMissing.of(),
        @JsonProperty("expiresAt")
        @ExcludeMissing
        expiresAt: JsonField<OffsetDateTime> = JsonMissing.of(),
        @JsonProperty("firstName") @ExcludeMissing firstName: JsonField<String> = JsonMissing.of(),
        @JsonProperty("inviteeUma") @ExcludeMissing inviteeUma: JsonField<String> = JsonMissing.of(),
    ) : this(
        code,
        createdAt,
        inviterUma,
        status,
        url,
        amountToSend,
        claimedAt,
        expiresAt,
        firstName,
        inviteeUma,
        mutableMapOf(),
    )

    /**
     * The unique code of the invitation
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun code(): String = code.getRequired("code")

    /**
     * When the invitation was created
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun createdAt(): OffsetDateTime = createdAt.getRequired("createdAt")

    /**
     * The UMA address of the inviter
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun inviterUma(): String = inviterUma.getRequired("inviterUma")

    /**
     * The status of the invitation
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun status(): Status = status.getRequired("status")

    /**
     * The URL where this invitation can be claimed.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type or is unexpectedly
     *   missing or null (e.g. if the server responded with an unexpected value).
     */
    fun url(): String = url.getRequired("url")

    /**
     * The amount to send to the invitee when the invitation is claimed. This is optional and if not
     * provided, the invitee will not receive any amount. Note that the actual sending of the amount
     * must be done by the inviter platform once the INVITATION_CLAIMED webhook is received. If the
     * inviter platform either does not send the payment or the payment fails, the invitee will not
     * receive this amount. This field is primarily used for display purposes on the claiming side
     * of the invitation. This field is useful for "send-by-link" style customer flows where an
     * inviter can send a payment simply by sharing a link without knowing the receiver's UMA
     * address. Note that these sends can only be sender-locked, meaning that the sender will not
     * know ahead of time how much the receiver will receive in the receiving currency.
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun amountToSend(): CurrencyAmount? = amountToSend.getNullable("amountToSend")

    /**
     * When the invitation was claimed if it has been claimed
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun claimedAt(): OffsetDateTime? = claimedAt.getNullable("claimedAt")

    /**
     * When the invitation expires (if at all)
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun expiresAt(): OffsetDateTime? = expiresAt.getNullable("expiresAt")

    /**
     * The inviter's first name. Will be displayed when the recipient clicks the invite link
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun firstName(): String? = firstName.getNullable("firstName")

    /**
     * The UMA address of the invitee
     *
     * @throws GridInvalidDataException if the JSON field has an unexpected type (e.g. if the server
     *   responded with an unexpected value).
     */
    fun inviteeUma(): String? = inviteeUma.getNullable("inviteeUma")

    /**
     * Returns the raw JSON value of [code].
     *
     * Unlike [code], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("code") @ExcludeMissing fun _code(): JsonField<String> = code

    /**
     * Returns the raw JSON value of [createdAt].
     *
     * Unlike [createdAt], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("createdAt")
    @ExcludeMissing
    fun _createdAt(): JsonField<OffsetDateTime> = createdAt

    /**
     * Returns the raw JSON value of [inviterUma].
     *
     * Unlike [inviterUma], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("inviterUma") @ExcludeMissing fun _inviterUma(): JsonField<String> = inviterUma

    /**
     * Returns the raw JSON value of [status].
     *
     * Unlike [status], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("status") @ExcludeMissing fun _status(): JsonField<Status> = status

    /**
     * Returns the raw JSON value of [url].
     *
     * Unlike [url], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("url") @ExcludeMissing fun _url(): JsonField<String> = url

    /**
     * Returns the raw JSON value of [amountToSend].
     *
     * Unlike [amountToSend], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("amountToSend")
    @ExcludeMissing
    fun _amountToSend(): JsonField<CurrencyAmount> = amountToSend

    /**
     * Returns the raw JSON value of [claimedAt].
     *
     * Unlike [claimedAt], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("claimedAt")
    @ExcludeMissing
    fun _claimedAt(): JsonField<OffsetDateTime> = claimedAt

    /**
     * Returns the raw JSON value of [expiresAt].
     *
     * Unlike [expiresAt], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("expiresAt")
    @ExcludeMissing
    fun _expiresAt(): JsonField<OffsetDateTime> = expiresAt

    /**
     * Returns the raw JSON value of [firstName].
     *
     * Unlike [firstName], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("firstName") @ExcludeMissing fun _firstName(): JsonField<String> = firstName

    /**
     * Returns the raw JSON value of [inviteeUma].
     *
     * Unlike [inviteeUma], this method doesn't throw if the JSON field has an unexpected type.
     */
    @JsonProperty("inviteeUma") @ExcludeMissing fun _inviteeUma(): JsonField<String> = inviteeUma

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
         * Returns a mutable builder for constructing an instance of [UmaInvitation].
         *
         * The following fields are required:
         * ```kotlin
         * .code()
         * .createdAt()
         * .inviterUma()
         * .status()
         * .url()
         * ```
         */
        fun builder() = Builder()
    }

    /** A builder for [UmaInvitation]. */
    class Builder internal constructor() {

        private var code: JsonField<String>? = null
        private var createdAt: JsonField<OffsetDateTime>? = null
        private var inviterUma: JsonField<String>? = null
        private var status: JsonField<Status>? = null
        private var url: JsonField<String>? = null
        private var amountToSend: JsonField<CurrencyAmount> = JsonMissing.of()
        private var claimedAt: JsonField<OffsetDateTime> = JsonMissing.of()
        private var expiresAt: JsonField<OffsetDateTime> = JsonMissing.of()
        private var firstName: JsonField<String> = JsonMissing.of()
        private var inviteeUma: JsonField<String> = JsonMissing.of()
        private var additionalProperties: MutableMap<String, JsonValue> = mutableMapOf()

        internal fun from(umaInvitation: UmaInvitation) = apply {
            code = umaInvitation.code
            createdAt = umaInvitation.createdAt
            inviterUma = umaInvitation.inviterUma
            status = umaInvitation.status
            url = umaInvitation.url
            amountToSend = umaInvitation.amountToSend
            claimedAt = umaInvitation.claimedAt
            expiresAt = umaInvitation.expiresAt
            firstName = umaInvitation.firstName
            inviteeUma = umaInvitation.inviteeUma
            additionalProperties = umaInvitation.additionalProperties.toMutableMap()
        }

        /** The unique code of the invitation */
        fun code(code: String) = code(JsonField.of(code))

        /**
         * Sets [Builder.code] to an arbitrary JSON value.
         *
         * You should usually call [Builder.code] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun code(code: JsonField<String>) = apply { this.code = code }

        /** When the invitation was created */
        fun createdAt(createdAt: OffsetDateTime) = createdAt(JsonField.of(createdAt))

        /**
         * Sets [Builder.createdAt] to an arbitrary JSON value.
         *
         * You should usually call [Builder.createdAt] with a well-typed [OffsetDateTime] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun createdAt(createdAt: JsonField<OffsetDateTime>) = apply { this.createdAt = createdAt }

        /** The UMA address of the inviter */
        fun inviterUma(inviterUma: String) = inviterUma(JsonField.of(inviterUma))

        /**
         * Sets [Builder.inviterUma] to an arbitrary JSON value.
         *
         * You should usually call [Builder.inviterUma] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun inviterUma(inviterUma: JsonField<String>) = apply { this.inviterUma = inviterUma }

        /** The status of the invitation */
        fun status(status: Status) = status(JsonField.of(status))

        /**
         * Sets [Builder.status] to an arbitrary JSON value.
         *
         * You should usually call [Builder.status] with a well-typed [Status] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun status(status: JsonField<Status>) = apply { this.status = status }

        /** The URL where this invitation can be claimed. */
        fun url(url: String) = url(JsonField.of(url))

        /**
         * Sets [Builder.url] to an arbitrary JSON value.
         *
         * You should usually call [Builder.url] with a well-typed [String] value instead. This
         * method is primarily for setting the field to an undocumented or not yet supported value.
         */
        fun url(url: JsonField<String>) = apply { this.url = url }

        /**
         * The amount to send to the invitee when the invitation is claimed. This is optional and if
         * not provided, the invitee will not receive any amount. Note that the actual sending of
         * the amount must be done by the inviter platform once the INVITATION_CLAIMED webhook is
         * received. If the inviter platform either does not send the payment or the payment fails,
         * the invitee will not receive this amount. This field is primarily used for display
         * purposes on the claiming side of the invitation. This field is useful for "send-by-link"
         * style customer flows where an inviter can send a payment simply by sharing a link without
         * knowing the receiver's UMA address. Note that these sends can only be sender-locked,
         * meaning that the sender will not know ahead of time how much the receiver will receive in
         * the receiving currency.
         */
        fun amountToSend(amountToSend: CurrencyAmount) = amountToSend(JsonField.of(amountToSend))

        /**
         * Sets [Builder.amountToSend] to an arbitrary JSON value.
         *
         * You should usually call [Builder.amountToSend] with a well-typed [CurrencyAmount] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun amountToSend(amountToSend: JsonField<CurrencyAmount>) = apply {
            this.amountToSend = amountToSend
        }

        /** When the invitation was claimed if it has been claimed */
        fun claimedAt(claimedAt: OffsetDateTime) = claimedAt(JsonField.of(claimedAt))

        /**
         * Sets [Builder.claimedAt] to an arbitrary JSON value.
         *
         * You should usually call [Builder.claimedAt] with a well-typed [OffsetDateTime] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun claimedAt(claimedAt: JsonField<OffsetDateTime>) = apply { this.claimedAt = claimedAt }

        /** When the invitation expires (if at all) */
        fun expiresAt(expiresAt: OffsetDateTime) = expiresAt(JsonField.of(expiresAt))

        /**
         * Sets [Builder.expiresAt] to an arbitrary JSON value.
         *
         * You should usually call [Builder.expiresAt] with a well-typed [OffsetDateTime] value
         * instead. This method is primarily for setting the field to an undocumented or not yet
         * supported value.
         */
        fun expiresAt(expiresAt: JsonField<OffsetDateTime>) = apply { this.expiresAt = expiresAt }

        /** The inviter's first name. Will be displayed when the recipient clicks the invite link */
        fun firstName(firstName: String) = firstName(JsonField.of(firstName))

        /**
         * Sets [Builder.firstName] to an arbitrary JSON value.
         *
         * You should usually call [Builder.firstName] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun firstName(firstName: JsonField<String>) = apply { this.firstName = firstName }

        /** The UMA address of the invitee */
        fun inviteeUma(inviteeUma: String) = inviteeUma(JsonField.of(inviteeUma))

        /**
         * Sets [Builder.inviteeUma] to an arbitrary JSON value.
         *
         * You should usually call [Builder.inviteeUma] with a well-typed [String] value instead.
         * This method is primarily for setting the field to an undocumented or not yet supported
         * value.
         */
        fun inviteeUma(inviteeUma: JsonField<String>) = apply { this.inviteeUma = inviteeUma }

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
         * Returns an immutable instance of [UmaInvitation].
         *
         * Further updates to this [Builder] will not mutate the returned instance.
         *
         * The following fields are required:
         * ```kotlin
         * .code()
         * .createdAt()
         * .inviterUma()
         * .status()
         * .url()
         * ```
         *
         * @throws IllegalStateException if any required field is unset.
         */
        fun build(): UmaInvitation =
            UmaInvitation(
                checkRequired("code", code),
                checkRequired("createdAt", createdAt),
                checkRequired("inviterUma", inviterUma),
                checkRequired("status", status),
                checkRequired("url", url),
                amountToSend,
                claimedAt,
                expiresAt,
                firstName,
                inviteeUma,
                additionalProperties.toMutableMap(),
            )
    }

    private var validated: Boolean = false

    fun validate(): UmaInvitation = apply {
        if (validated) {
            return@apply
        }

        code()
        createdAt()
        inviterUma()
        status().validate()
        url()
        amountToSend()?.validate()
        claimedAt()
        expiresAt()
        firstName()
        inviteeUma()
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
        (if (code.asKnown() == null) 0 else 1) +
            (if (createdAt.asKnown() == null) 0 else 1) +
            (if (inviterUma.asKnown() == null) 0 else 1) +
            (status.asKnown()?.validity() ?: 0) +
            (if (url.asKnown() == null) 0 else 1) +
            (amountToSend.asKnown()?.validity() ?: 0) +
            (if (claimedAt.asKnown() == null) 0 else 1) +
            (if (expiresAt.asKnown() == null) 0 else 1) +
            (if (firstName.asKnown() == null) 0 else 1) +
            (if (inviteeUma.asKnown() == null) 0 else 1)

    /** The status of the invitation */
    class Status @JsonCreator private constructor(private val value: JsonField<String>) : Enum {

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

            val PENDING = of("PENDING")

            val CLAIMED = of("CLAIMED")

            val EXPIRED = of("EXPIRED")

            val CANCELLED = of("CANCELLED")

            fun of(value: String) = Status(JsonField.of(value))
        }

        /** An enum containing [Status]'s known values. */
        enum class Known {
            PENDING,
            CLAIMED,
            EXPIRED,
            CANCELLED,
        }

        /**
         * An enum containing [Status]'s known values, as well as an [_UNKNOWN] member.
         *
         * An instance of [Status] can contain an unknown value in a couple of cases:
         * - It was deserialized from data that doesn't match any known member. For example, if the
         *   SDK is on an older version than the API, then the API may respond with new members that
         *   the SDK is unaware of.
         * - It was constructed with an arbitrary value using the [of] method.
         */
        enum class Value {
            PENDING,
            CLAIMED,
            EXPIRED,
            CANCELLED,
            /** An enum member indicating that [Status] was instantiated with an unknown value. */
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
                PENDING -> Value.PENDING
                CLAIMED -> Value.CLAIMED
                EXPIRED -> Value.EXPIRED
                CANCELLED -> Value.CANCELLED
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
                PENDING -> Known.PENDING
                CLAIMED -> Known.CLAIMED
                EXPIRED -> Known.EXPIRED
                CANCELLED -> Known.CANCELLED
                else -> throw GridInvalidDataException("Unknown Status: $value")
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

        fun validate(): Status = apply {
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

            return other is Status && value == other.value
        }

        override fun hashCode() = value.hashCode()

        override fun toString() = value.toString()
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) {
            return true
        }

        return other is UmaInvitation &&
            code == other.code &&
            createdAt == other.createdAt &&
            inviterUma == other.inviterUma &&
            status == other.status &&
            url == other.url &&
            amountToSend == other.amountToSend &&
            claimedAt == other.claimedAt &&
            expiresAt == other.expiresAt &&
            firstName == other.firstName &&
            inviteeUma == other.inviteeUma &&
            additionalProperties == other.additionalProperties
    }

    private val hashCode: Int by lazy {
        Objects.hash(
            code,
            createdAt,
            inviterUma,
            status,
            url,
            amountToSend,
            claimedAt,
            expiresAt,
            firstName,
            inviteeUma,
            additionalProperties,
        )
    }

    override fun hashCode(): Int = hashCode

    override fun toString() =
        "UmaInvitation{code=$code, createdAt=$createdAt, inviterUma=$inviterUma, status=$status, url=$url, amountToSend=$amountToSend, claimedAt=$claimedAt, expiresAt=$expiresAt, firstName=$firstName, inviteeUma=$inviteeUma, additionalProperties=$additionalProperties}"
}
